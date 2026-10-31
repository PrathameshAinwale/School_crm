<?php

namespace App\Http\Controllers\Api\Accounts;

use App\Http\Controllers\Controller;
use App\Models\FeePayment;
use App\Models\FeeRefund;
use App\Models\Student;
use App\Services\AcademicYearContext;
use App\Services\Fees\FeeLedgerService;
use App\Services\Fees\ReceiptNumberService;
use App\Services\SchoolContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FeeRefundController extends Controller
{
    public function requestRefund(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'original_payment_id' => 'nullable|exists:fee_payments,id',
            'refund_amount' => 'required|numeric|min:0.01',
            'refund_type' => 'required|string|in:ledger_credit,bank_transfer,cheque',
            'reason' => 'required|string|max:255',
        ]);

        $user = $request->user();
        $schoolId = SchoolContext::getActiveSchoolId() ?: $user->school_id;
        $student = Student::withoutGlobalScopes()->findOrFail($validated['student_id']);

        if ((int)$student->school_id !== (int)$schoolId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized student access.'], 403);
        }

        $amount = round((float) $validated['refund_amount'], 2);

        // Refund cap validation: Cannot refund more than total paid minus already refunded
        $totalPaid = (float) FeePayment::where('student_id', $student->id)
            ->where('status', 'completed')
            ->sum('amount_paid');

        $alreadyRefunded = (float) FeeRefund::where('student_id', $student->id)
            ->whereIn('status', ['approved', 'processed'])
            ->sum('refund_amount');

        $maxRefundable = max(0.00, round($totalPaid - $alreadyRefunded, 2));

        if ($amount > $maxRefundable) {
            return response()->json([
                'success' => false,
                'message' => "Refund amount (₹" . number_format($amount, 2) . ") exceeds maximum refundable balance (₹" . number_format($maxRefundable, 2) . "). Total paid: ₹" . number_format($totalPaid, 2) . ", already refunded: ₹" . number_format($alreadyRefunded, 2) . ".",
            ], 422);
        }

        $ay = AcademicYearContext::getActiveAcademicYear($schoolId);
        $academicYearId = $ay ? $ay->id : 1;

        $refund = FeeRefund::create([
            'school_id' => $schoolId,
            'student_id' => $student->id,
            'academic_year_id' => $academicYearId,
            'original_payment_id' => $validated['original_payment_id'] ?? null,
            'refund_number' => 'REF-REQ-' . strtoupper(bin2hex(random_bytes(4))),
            'refund_amount' => $amount,
            'refund_type' => $validated['refund_type'],
            'reason' => $validated['reason'],
            'status' => 'pending_approval',
            'requested_by_user_id' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Refund request submitted successfully. Awaiting Administrator approval.',
            'data' => $refund,
        ], 201);
    }

    public function approve(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'admin' && $user->role !== 'super_admin') {
            return response()->json(['success' => false, 'message' => 'Only administrators can approve fee refunds.'], 403);
        }

        $request->validate([
            'disbursement_reference' => 'nullable|string|max:100',
            'admin_remarks' => 'nullable|string|max:255',
        ]);

        $refund = FeeRefund::findOrFail($id);
        if ($refund->status === 'approved') {
            return response()->json(['success' => false, 'message' => 'Refund has already been approved.'], 422);
        }

        $schoolId = $refund->school_id;

        DB::transaction(function () use ($refund, $schoolId, $user, $request) {
            $refundNo = ReceiptNumberService::generateNextNumber($schoolId, $refund->academic_year_id, 'refund');

            $refund->update([
                'refund_number' => $refundNo,
                'status' => 'approved',
                'approved_by_user_id' => $user->id,
                'approved_at' => now(),
                'disbursement_reference' => $request->input('disbursement_reference'),
                'disbursement_date' => now()->toDateString(),
                'admin_remarks' => $request->input('admin_remarks'),
            ]);

            $amt = (float) $refund->refund_amount;

            if ($refund->refund_type === 'ledger_credit') {
                // Ledger credit refund: Adds advance credit balance to student's ledger
                FeeLedgerService::append(
                    schoolId: $schoolId,
                    studentId: $refund->student_id,
                    entryType: 'advance_credit',
                    description: "Refund Credit: Advance balance carried forward (Voucher #{$refundNo})",
                    debit: 0.00,
                    credit: $amt,
                    referenceNumber: $refundNo,
                    academicYearId: $refund->academic_year_id,
                    userId: $user->id
                );
            } else {
                // Money payout (Bank transfer or Cheque): Disburses money, logged as debit against prior payments
                FeeLedgerService::append(
                    schoolId: $schoolId,
                    studentId: $refund->student_id,
                    entryType: 'refund',
                    description: "Fee Refund Payout via " . strtoupper($refund->refund_type) . " (Ref: " . ($request->input('disbursement_reference') ?: 'Disbursed') . ")",
                    debit: $amt,
                    credit: 0.00,
                    referenceNumber: $refundNo,
                    academicYearId: $refund->academic_year_id,
                    userId: $user->id
                );
            }
        });

        return response()->json([
            'success' => true,
            'message' => "Refund of ₹" . number_format($refund->refund_amount, 2) . " approved successfully (Voucher #{$refund->refund_number}).",
            'data' => $refund->fresh(),
        ]);
    }
}

