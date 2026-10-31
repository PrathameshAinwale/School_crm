<?php

namespace App\Http\Controllers\Api\Accounts;

use App\Http\Controllers\Controller;
use App\Models\FeePayment;
use App\Models\FeePaymentAllocation;
use App\Models\SchoolSetting;
use App\Models\Student;
use App\Models\StudentFee;
use App\Services\AcademicYearContext;
use App\Services\Fees\FeeAllocationService;
use App\Services\Fees\FeeLedgerService;
use App\Services\Fees\ReceiptNumberService;
use App\Services\Fees\ReceiptPdfService;
use App\Services\SchoolContext;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class FeePaymentController extends Controller
{
    /**
     * Preview fee allocation across installments before confirming payment.
     */
    public function previewAllocation(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'amount' => 'required|numeric|min:0.01',
            'allow_advance_credit' => 'nullable|boolean',
        ]);

        try {
            $allocation = FeeAllocationService::calculateAllocation(
                (int) $request->student_id,
                (float) $request->amount,
                (bool) $request->boolean('allow_advance_credit', false)
            );

            return response()->json([
                'success' => true,
                'data' => $allocation,
            ]);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Record offline fee payment (Cash, Cheque, Bank Transfer, UPI).
     * Atomic, gapless sequential receipt, immutable audit ledger.
     */
    public function collect(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_mode' => 'required|string|in:cash,cheque,bank_transfer,upi_manual',
            'payment_date' => 'required|date',
            'reference_number' => 'nullable|string|max:100',
            'cheque_date' => 'nullable|date',
            'bank_name' => 'nullable|string|max:100',
            'idempotency_key' => 'required|string|max:100',
            'allow_advance_credit' => 'nullable|boolean',
            'remarks' => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $schoolId = SchoolContext::getActiveSchoolId() ?: $user->school_id;
        $student = Student::withoutGlobalScopes()->findOrFail($validated['student_id']);

        if ((int)$student->school_id !== (int)$schoolId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized student access.'], 403);
        }

        // Idempotency check: prevent duplicate submits on double-click
        $existingPayment = FeePayment::withoutGlobalScopes()
            ->where('school_id', $schoolId)
            ->where('idempotency_key', $validated['idempotency_key'])
            ->first();

        if ($existingPayment) {
            return response()->json([
                'success' => true,
                'message' => 'Payment already recorded with this idempotency key.',
                'data' => [
                    'payment' => $existingPayment,
                    'receipt_number' => $existingPayment->receipt_number,
                ],
            ]);
        }

        $paymentDate = Carbon::parse($validated['payment_date'])->startOfDay();
        $today = Carbon::today()->startOfDay();

        // Reject future payment dates
        if ($paymentDate->isFuture()) {
            return response()->json([
                'success' => false,
                'message' => 'Future payment dates are strictly prohibited.',
            ], 422);
        }

        // Backdated payments check (prior to today)
        $isBackdated = $paymentDate->isPast() && !$paymentDate->isSameDay($today);
        if ($isBackdated && $user->role !== 'admin' && $user->role !== 'super_admin') {
            return response()->json([
                'success' => false,
                'message' => 'Backdated fee payments require School Administrator approval.',
            ], 403);
        }

        $amount = round((float) $validated['amount'], 2);
        $allowAdvance = (bool) ($validated['allow_advance_credit'] ?? false);

        try {
            $allocationPlan = FeeAllocationService::calculateAllocation($student->id, $amount, $allowAdvance);
        } catch (InvalidArgumentException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        $ay = AcademicYearContext::getActiveAcademicYear($schoolId);
        $academicYearId = $ay ? $ay->id : 1;

        $isCheque = ($validated['payment_mode'] === 'cheque');
        $initialStatus = $isCheque ? 'pending_clearance' : 'completed';
        $chequeStatus = $isCheque ? 'pending_clearance' : null;

        $payment = DB::transaction(function () use (
            $schoolId, $student, $academicYearId, $validated, $amount, $paymentDate,
            $isBackdated, $user, $initialStatus, $chequeStatus, $allocationPlan, $isCheque
        ) {
            // Generate gapless sequential receipt number under row lock
            $receiptNo = ReceiptNumberService::generateNextNumber($schoolId, $academicYearId, 'receipt');

            $feePayment = FeePayment::create([
                'school_id' => $schoolId,
                'student_id' => $student->id,
                'academic_year_id' => $academicYearId,
                'receipt_number' => $receiptNo,
                'idempotency_key' => $validated['idempotency_key'],
                'amount_paid' => $amount,
                'payment_date' => $paymentDate->toDateString(),
                'payment_mode' => $validated['payment_mode'],
                'reference_number' => $validated['reference_number'] ?? null,
                'cheque_date' => $validated['cheque_date'] ?? null,
                'bank_name' => $validated['bank_name'] ?? null,
                'cheque_status' => $chequeStatus,
                'is_backdated' => $isBackdated,
                'backdated_approved_by_user_id' => $isBackdated ? $user->id : null,
                'status' => $initialStatus,
                'source' => 'offline',
                'collected_by_user_id' => $user->id,
                'remarks' => $validated['remarks'] ?? null,
            ]);

            // Create allocations
            foreach ($allocationPlan['allocations'] as $alloc) {
                FeePaymentAllocation::create([
                    'school_id' => $schoolId,
                    'fee_payment_id' => $feePayment->id,
                    'student_fee_id' => $alloc['student_fee_id'],
                    'principal_amount' => $alloc['principal_allocated'],
                    'fine_amount' => $alloc['fine_allocated'],
                    'is_advance_credit' => $alloc['is_advance_credit'],
                ]);

                // For non-cheque payments, apply allocation immediately to student_fees
                if (!$isCheque && $alloc['student_fee_id']) {
                    $sf = StudentFee::withoutGlobalScopes()->find($alloc['student_fee_id']);
                    if ($sf) {
                        $sf->paid_amount = round(((float)$sf->paid_amount) + $alloc['total_allocated'], 2);
                        $sf->fine_paid_amount = round(((float)$sf->fine_paid_amount) + $alloc['fine_allocated'], 2);
                        
                        $remainingDues = max(0.00, round(((float)$sf->net_amount) - ((float)$sf->paid_amount), 2));
                        $sf->status = ($remainingDues <= 0.01) ? 'Paid' : 'Partial';
                        $sf->paid_date = $paymentDate->toDateString();
                        $sf->payment_mode = $validated['payment_mode'];
                        $sf->transaction_id = $validated['reference_number'] ?? $receiptNo;
                        $sf->receipt_number = $receiptNo;
                        $sf->save();
                    }
                }
            }

            // Append ledger entry (cheques only enter ledger upon clearance)
            if (!$isCheque) {
                FeeLedgerService::append(
                    schoolId: $schoolId,
                    studentId: $student->id,
                    entryType: 'payment',
                    description: "Fee Payment received via " . strtoupper($validated['payment_mode']) . " (Receipt #{$receiptNo})",
                    debit: 0.00,
                    credit: $amount,
                    referenceNumber: $receiptNo,
                    academicYearId: $academicYearId,
                    userId: $user->id,
                    entryDate: $paymentDate->toDateString()
                );
            }

            return $feePayment;
        });

        return response()->json([
            'success' => true,
            'message' => $isCheque 
                ? "Cheque recorded successfully with status 'Pending Clearance' (Receipt #{$payment->receipt_number}). Dues will update upon clearance."
                : "Payment of ₹" . number_format($amount, 2) . " successfully recorded (Receipt #{$payment->receipt_number}).",
            'data' => [
                'payment_id' => $payment->id,
                'receipt_number' => $payment->receipt_number,
                'status' => $payment->status,
                'allocations' => $allocationPlan['allocations'],
            ],
        ], 201);
    }

    /**
     * Mark a pending cheque as cleared.
     */
    public function clearCheque(Request $request, $id)
    {
        $user = $request->user();
        $schoolId = SchoolContext::getActiveSchoolId() ?: $user->school_id;
        $payment = FeePayment::with('allocations.studentFee')->findOrFail($id);

        if ($payment->payment_mode !== 'cheque' || $payment->cheque_status !== 'pending_clearance') {
            return response()->json(['success' => false, 'message' => 'Payment is not an uncleared cheque.'], 422);
        }

        DB::transaction(function () use ($payment, $schoolId, $user) {
            $payment->update([
                'cheque_status' => 'cleared',
                'cheque_cleared_at' => now(),
                'status' => 'cleared',
            ]);

            // Apply allocations to student_fees
            foreach ($payment->allocations as $alloc) {
                if ($alloc->student_fee_id && $alloc->studentFee) {
                    $sf = $alloc->studentFee;
                    $sf->paid_amount = round(((float)$sf->paid_amount) + ((float)$alloc->principal_amount) + ((float)$alloc->fine_amount), 2);
                    $sf->fine_paid_amount = round(((float)$sf->fine_paid_amount) + ((float)$alloc->fine_amount), 2);

                    $remainingDues = max(0.00, round(((float)$sf->net_amount) - ((float)$sf->paid_amount), 2));
                    $sf->status = ($remainingDues <= 0.01) ? 'Paid' : 'Partial';
                    $sf->paid_date = now()->toDateString();
                    $sf->receipt_number = $payment->receipt_number;
                    $sf->save();
                }
            }

            // Write ledger credit
            FeeLedgerService::append(
                schoolId: $schoolId,
                studentId: $payment->student_id,
                entryType: 'payment',
                description: "Cheque Cleared: " . ($payment->bank_name ?: 'Bank') . " No: {$payment->reference_number} (Receipt #{$payment->receipt_number})",
                debit: 0.00,
                credit: (float) $payment->amount_paid,
                referenceNumber: $payment->receipt_number,
                academicYearId: $payment->academic_year_id,
                userId: $user->id
            );
        });

        return response()->json([
            'success' => true,
            'message' => "Cheque #{$payment->reference_number} marked as Cleared. Dues and ledger successfully updated.",
        ]);
    }

    /**
     * Mark a pending cheque as bounced with optional bounce fee debit.
     */
    public function bounceCheque(Request $request, $id)
    {
        $request->validate([
            'bounce_fee' => 'nullable|numeric|min:0',
            'reason' => 'nullable|string|max:255',
        ]);

        $user = $request->user();
        $schoolId = SchoolContext::getActiveSchoolId() ?: $user->school_id;
        $payment = FeePayment::findOrFail($id);

        if ($payment->payment_mode !== 'cheque' || in_array($payment->cheque_status, ['bounced', 'voided'])) {
            return response()->json(['success' => false, 'message' => 'Invalid cheque record for bounce.'], 422);
        }

        $bounceFee = (float) $request->input('bounce_fee', 0.00);
        $wasCleared = ($payment->cheque_status === 'cleared');

        DB::transaction(function () use ($payment, $schoolId, $user, $bounceFee, $wasCleared, $request) {
            $payment->update([
                'cheque_status' => 'bounced',
                'cheque_bounced_at' => now(),
                'bounce_fee' => $bounceFee,
                'status' => 'bounced',
                'remarks' => trim(($payment->remarks ?? '') . ' | Bounced: ' . ($request->input('reason') ?: 'Insufficient funds')),
            ]);

            // If it was previously cleared, reverse the student_fee paid amounts and ledger credit
            if ($wasCleared) {
                foreach ($payment->allocations as $alloc) {
                    if ($alloc->student_fee_id && $alloc->studentFee) {
                        $sf = $alloc->studentFee;
                        $sf->paid_amount = max(0.00, round(((float)$sf->paid_amount) - ((float)$alloc->principal_amount) - ((float)$alloc->fine_amount), 2));
                        $sf->fine_paid_amount = max(0.00, round(((float)$sf->fine_paid_amount) - ((float)$alloc->fine_amount), 2));
                        $sf->status = ($sf->paid_amount <= 0.01) ? 'Pending' : 'Partial';
                        $sf->save();
                    }
                }

                FeeLedgerService::append(
                    schoolId: $schoolId,
                    studentId: $payment->student_id,
                    entryType: 'reversal',
                    description: "Reversal: Cheque Bounced No: {$payment->reference_number} (Receipt #{$payment->receipt_number})",
                    debit: (float) $payment->amount_paid,
                    credit: 0.00,
                    referenceNumber: 'REV-' . $payment->receipt_number,
                    academicYearId: $payment->academic_year_id,
                    userId: $user->id
                );
            }

            // If bounce fee applied, log debit to student ledger
            if ($bounceFee > 0) {
                FeeLedgerService::append(
                    schoolId: $schoolId,
                    studentId: $payment->student_id,
                    entryType: 'cheque_bounce',
                    description: "Cheque Dishonour / Bounce Penalty Fee (Cheque #{$payment->reference_number})",
                    debit: $bounceFee,
                    credit: 0.00,
                    referenceNumber: 'BNCE-' . $payment->id,
                    academicYearId: $payment->academic_year_id,
                    userId: $user->id
                );
            }
        });

        return response()->json([
            'success' => true,
            'message' => "Cheque #{$payment->reference_number} marked as Bounced.",
        ]);
    }

    /**
     * Void a completed payment (Admin only, immutable reversal entry).
     */
    public function voidPayment(Request $request, $id)
    {
        $request->validate([
            'void_reason' => 'required|string|max:255',
        ]);

        $user = $request->user();
        if ($user->role !== 'admin' && $user->role !== 'super_admin') {
            return response()->json(['success' => false, 'message' => 'Only School Administrators can void payments.'], 403);
        }

        $payment = FeePayment::with('allocations.studentFee')->findOrFail($id);
        if ($payment->status === 'voided') {
            return response()->json(['success' => false, 'message' => 'Payment has already been voided.'], 422);
        }

        $schoolId = $payment->school_id;

        DB::transaction(function () use ($payment, $schoolId, $user, $request) {
            $payment->update([
                'status' => 'voided',
                'voided_at' => now(),
                'voided_by_user_id' => $user->id,
                'void_reason' => $request->input('void_reason'),
            ]);

            // Reverse student fee installment allocations
            foreach ($payment->allocations as $alloc) {
                if ($alloc->student_fee_id && $alloc->studentFee) {
                    $sf = $alloc->studentFee;
                    $sf->paid_amount = max(0.00, round(((float)$sf->paid_amount) - ((float)$alloc->principal_amount) - ((float)$alloc->fine_amount), 2));
                    $sf->fine_paid_amount = max(0.00, round(((float)$sf->fine_paid_amount) - ((float)$alloc->fine_amount), 2));
                    $sf->status = ($sf->paid_amount <= 0.01) ? 'Pending' : 'Partial';
                    $sf->save();
                }
            }

            // Ledger reversal entry
            FeeLedgerService::append(
                schoolId: $schoolId,
                studentId: $payment->student_id,
                entryType: 'reversal',
                description: "Reversal: Payment Voided (Receipt #{$payment->receipt_number}) - Reason: " . $request->input('void_reason'),
                debit: (float) $payment->amount_paid,
                credit: 0.00,
                referenceNumber: 'VOID-' . $payment->receipt_number,
                academicYearId: $payment->academic_year_id,
                userId: $user->id
            );
        });

        return response()->json([
            'success' => true,
            'message' => "Payment #{$payment->receipt_number} has been voided. Reversal entry recorded in ledger.",
        ]);
    }

    /**
     * Download or view on-demand PDF receipt for a verified FeePayment.
     */
    public function downloadReceipt(Request $request, $id)
    {
        $user = $request->user();
        $schoolId = SchoolContext::getActiveSchoolId() ?: $user->school_id;

        // Query FeePayment by primary ID (or receipt_number if exact string match)
        $payment = FeePayment::withoutGlobalScopes()
            ->with(['student', 'allocations.studentFee'])
            ->where('school_id', $schoolId)
            ->where(function ($q) use ($id) {
                if (is_numeric($id)) {
                    $q->where('id', (int) $id);
                } else {
                    $q->where('receipt_number', $id);
                }
            })
            ->firstOrFail();

        if ((int)$payment->school_id !== (int)$schoolId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized receipt access.'], 403);
        }

        // Verify parent authorization (Parent A cannot view Parent B's child receipt)
        if ($user->role === 'student_parent') {
            $isOwnChild = ($payment->student && (
                $payment->student->user_id === $user->id ||
                strtolower($payment->student->guardian_email ?? '') === strtolower($user->email ?? '') ||
                ($payment->student->guardian_phone ?? '') === ($user->phone ?? '')
            ));

            if (!$isOwnChild) {
                return response()->json(['success' => false, 'message' => 'Forbidden: You cannot access fee receipts of other students.'], 403);
            }
        }

        return ReceiptPdfService::streamReceiptPdf($payment);
    }

    /**
     * Explicit separate route for legacy paid installment receipts (which have no fee_payments row).
     */
    public function legacyInstallmentReceipt(Request $request, $id)
    {
        $user = $request->user();
        $schoolId = SchoolContext::getActiveSchoolId() ?: $user->school_id;

        $installment = \App\Models\StudentFee::withoutGlobalScopes()->findOrFail($id);

        if ((int)$installment->school_id !== (int)$schoolId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized installment access.'], 403);
        }

        if ($user->role === 'student_parent') {
            $student = $installment->student;
            if (!$student || !\App\Services\StudentParentAccessService::canParentAccessStudent($user, $student)) {
                return response()->json(['success' => false, 'message' => 'Forbidden: You cannot access fee details of other students.'], 403);
            }
        }

        $legacyMessage = "No receipt on record (legacy entry). Historical payments recorded prior to system migration do not have downloadable PDF vouchers.";

        if ($request->wantsJson()) {
            return response()->json([
                'success' => false,
                'is_legacy' => true,
                'message' => 'No receipt on record (legacy entry).',
                'detail' => $legacyMessage,
            ], 200);
        }

        return response("<!DOCTYPE html><html><head><meta charset='utf-8'><title>No Receipt on Record</title><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:80vh;background:#f8fafc;margin:0;padding:20px;}.card{background:#fff;padding:36px 32px;border-radius:16px;border:1px solid #e2e8f0;max-width:440px;text-align:center;box-shadow:0 10px 15px -3px rgba(0,0,0,0.05);}.icon{display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:#fef3c7;color:#d97706;font-size:28px;margin-bottom:16px;}h3{color:#0f172a;margin:0 0 8px 0;font-size:18px;font-weight:700;}p{color:#64748b;font-size:13px;line-height:1.6;margin:0 0 20px 0;}.btn{display:inline-block;padding:8px 20px;background:#0f172a;color:#fff;border-radius:8px;text-decoration:none;font-size:12px;font-weight:600;cursor:pointer;}</style></head><body><div class='card'><div class='icon'>📋</div><h3>No receipt on record (legacy entry)</h3><p>{$legacyMessage}</p><a href='javascript:window.close()' class='btn'>Close Window</a></div></body></html>", 200, ['Content-Type' => 'text/html; charset=UTF-8']);
    }
}
