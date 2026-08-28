<?php

namespace App\Http\Controllers\Api\StudentParent;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Student;
use App\Models\StudentFee;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FeeController extends Controller
{
    /**
     * Get fee ledger and installments summary.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $student = null;
        if ($user) {
            $student = Student::with(['schoolClass', 'section'])
                ->where('user_id', $user->id)
                ->orWhere('guardian_email', $user->email)
                ->orWhere('guardian_phone', $user->phone)
                ->first();
        }
        if (!$student) {
            $student = Student::with(['schoolClass', 'section'])->first();
        }
        $studentId = $student ? $student->id : 1;

        $fees = StudentFee::where('student_id', $studentId)
            ->orderBy('due_date', 'asc')
            ->get();

        $totalAnnual = $fees->sum('amount');
        $paidAmount = $fees->where('status', 'Paid')->sum('amount');
        $outstandingAmount = $fees->whereIn('status', ['Pending', 'Overdue'])->sum('amount');
        $clearancePercentage = $totalAnnual > 0 ? round(($paidAmount / $totalAnnual) * 100, 1) : 0;

        $paidCount = $fees->where('status', 'Paid')->count();
        $pendingCount = $fees->where('status', 'Pending')->count();
        $overdueCount = $fees->where('status', 'Overdue')->count();

        $installments = $fees->map(function ($fee) {
            return [
                'id' => $fee->id,
                'term' => $fee->term_name,
                'amount' => '₹' . number_format($fee->amount),
                'rawAmount' => (float) $fee->amount,
                'dueDate' => $fee->due_date ? Carbon::parse($fee->due_date)->format('M d, Y') : '—',
                'rawDueDate' => $fee->due_date ? Carbon::parse($fee->due_date)->toDateString() : null,
                'status' => $fee->status,
                'paidDate' => $fee->paid_date ? Carbon::parse($fee->paid_date)->format('M d, Y') : '—',
                'txnId' => $fee->transaction_id ?: '—',
                'mode' => $fee->payment_mode ?: '—',
                'receiptNumber' => $fee->receipt_number ?: '—',
                'taxDeductible' => (bool) $fee->tax_deductible,
            ];
        });

        $paidInstallments = $installments->filter(fn ($f) => $f['status'] === 'Paid')->values();
        $upcomingInstallments = $installments->filter(fn ($f) => $f['status'] !== 'Paid')->values();

        // Fetch notifications pushed by Finance/Accounts department for this parent/student
        $userId = $user ? $user->id : null;
        $financeNotifsQuery = Notification::orderBy('created_at', 'desc')
            ->where(function ($q) use ($userId) {
                if ($userId) {
                    $q->where('user_id', $userId)
                      ->orWhereNull('user_id');
                } else {
                    $q->whereNull('user_id');
                }
            })
            ->where(function ($q) {
                $q->where('type', 'fee')
                  ->orWhere('type', 'alert')
                  ->orWhere('title', 'like', '%Fee%')
                  ->orWhere('title', 'like', '%Payment%')
                  ->orWhere('title', 'like', '%Accounts%')
                  ->orWhere('message', 'like', '%Accounts%')
                  ->orWhere('message', 'like', '%fee%')
                  ->orWhere('message', 'like', '%due%');
            });

        $financeNotifications = $financeNotifsQuery->take(10)->get()->map(function ($notif) {
            return [
                'id' => $notif->id,
                'title' => $notif->title,
                'message' => $notif->message,
                'type' => $notif->type,
                'is_read' => (bool) $notif->is_read,
                'created_at' => $notif->created_at ? $notif->created_at->format('d M Y, h:i A') : '—',
                'time_ago' => $notif->created_at ? $notif->created_at->diffForHumans() : 'Recently',
            ];
        });

        // Class Fee Structure configured by Admin
        $classFeeStructure = null;
        if ($student && $student->school_class_id) {
            $fs = \App\Models\FeeStructure::where('school_class_id', $student->school_class_id)->first();
            if ($fs) {
                $classFeeStructure = [
                    'tuitionFee' => '₹' . number_format($fs->tuition_fee),
                    'transportFee' => '₹' . number_format($fs->transport_fee),
                    'labLibraryFee' => '₹' . number_format($fs->lab_library_fee),
                    'activityFee' => '₹' . number_format($fs->activity_fee),
                    'otherFee' => '₹' . number_format($fs->other_fee),
                    'totalAnnualFee' => '₹' . number_format($fs->total_annual_fee),
                    'rawTuition' => (float) $fs->tuition_fee,
                    'rawTransport' => (float) $fs->transport_fee,
                    'rawLab' => (float) $fs->lab_library_fee,
                    'rawActivity' => (float) $fs->activity_fee,
                    'rawOther' => (float) $fs->other_fee,
                    'rawTotal' => (float) $fs->total_annual_fee,
                    'notes' => $fs->notes,
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'student' => [
                    'id' => $student ? $student->id : 1,
                    'name' => $student ? $student->full_name : 'Aarav Patel',
                    'admissionNo' => $student ? $student->admission_number : 'STU-2024-X-101',
                    'classSection' => $student ? ($student->schoolClass ? $student->schoolClass->name . ' - ' . ($student->section ? $student->section->name : 'A') : 'Class 10-A') : 'Class 10-A',
                    'withTransport' => $student ? (bool) $student->with_transport : false,
                    'transportStatus' => ($student && $student->with_transport) ? 'School Vehicle Transit Opted' : 'Without School Transport',
                ],
                'summary' => [
                    'totalAnnual' => '₹' . number_format($totalAnnual),
                    'paidAmount' => '₹' . number_format($paidAmount),
                    'outstandingAmount' => '₹' . number_format($outstandingAmount),
                    'rawTotalAnnual' => (float) $totalAnnual,
                    'rawPaid' => (float) $paidAmount,
                    'rawOutstanding' => (float) $outstandingAmount,
                    'paidCount' => $paidCount,
                    'pendingCount' => $pendingCount,
                    'overdueCount' => $overdueCount,
                    'clearancePercentage' => $clearancePercentage,
                    'isGoodStanding' => $overdueCount === 0,
                    'withTransport' => $student ? (bool) $student->with_transport : false,
                    'session' => 'Academic Session 2026-27',
                ],
                'classFeeStructure' => $classFeeStructure,
                'installments' => $installments,
                'paidInstallments' => $paidInstallments,
                'upcomingInstallments' => $upcomingInstallments,
                'financeNotifications' => $financeNotifications,
            ],
        ]);
    }

    /**
     * Pay fee installment or outstanding balance.
     */
    public function payFee(Request $request)
    {
        $user = $request->user();
        $student = null;
        if ($user) {
            $student = Student::with(['schoolClass', 'section'])
                ->where('user_id', $user->id)
                ->orWhere('guardian_email', $user->email)
                ->orWhere('guardian_phone', $user->phone)
                ->first();
        }
        if (!$student) {
            $student = Student::with(['schoolClass', 'section'])->first();
        }
        $studentId = $student ? $student->id : 1;

        $request->validate([
            'fee_id' => 'nullable|exists:student_fees,id',
            'amount' => 'nullable|numeric',
            'payment_mode' => 'required|string|max:50', // upi, card, netbanking
        ]);

        $modeLabel = match ($request->payment_mode) {
            'upi' => 'UPI (GPay/PhonePe)',
            'card' => 'Debit/Credit Card',
            'netbanking' => 'Net Banking',
            default => 'Online Gateway',
        };

        $txnId = 'TXN-' . strtoupper(Str::random(4)) . '-' . rand(100000, 999999);
        $receiptNo = 'REC-2026-' . rand(1000, 9999);
        $now = Carbon::now();

        if ($request->filled('fee_id')) {
            $fee = StudentFee::where('id', $request->fee_id)->where('student_id', $studentId)->first();
            if ($fee) {
                $fee->update([
                    'status' => 'Paid',
                    'paid_date' => $now->toDateString(),
                    'transaction_id' => $txnId,
                    'payment_mode' => $modeLabel,
                    'receipt_number' => $receiptNo,
                ]);
            }
        } else {
            // Pay next pending fee installment
            $nextPending = StudentFee::where('student_id', $studentId)
                ->whereIn('status', ['Pending', 'Overdue'])
                ->orderBy('due_date', 'asc')
                ->first();

            if ($nextPending) {
                $nextPending->update([
                    'status' => 'Paid',
                    'paid_date' => $now->toDateString(),
                    'transaction_id' => $txnId,
                    'payment_mode' => $modeLabel,
                    'receipt_number' => $receiptNo,
                ]);
            }
        }

        $paidFee = (isset($fee) && $fee) ? $fee : (isset($nextPending) && $nextPending ? $nextPending : null);
        $amountVal = $paidFee ? $paidFee->amount : 30000;
        $termVal = $paidFee ? $paidFee->term_name : 'Fee Installment';
        $studentName = $student ? $student->full_name : 'Student';

        // 1. Create student & parent notification
        if ($user) {
            Notification::create([
                'user_id' => $user->id,
                'role' => 'student_parent',
                'title' => 'Fee Payment Successful',
                'message' => "Payment of ₹" . number_format($amountVal) . " for {$termVal} received via {$modeLabel}. Txn ID: {$txnId}. Receipt #{$receiptNo} generated.",
                'type' => 'fee',
                'link' => '/fees',
                'is_read' => false,
            ]);
        }

        // 2. Notify Accounts department about online fee payment
        Notification::create([
            'role' => 'accounts',
            'title' => 'Online Fee Received',
            'message' => "₹" . number_format($amountVal) . " paid by {$studentName} for {$termVal} via {$modeLabel} (Receipt #{$receiptNo}).",
            'type' => 'fee',
            'link' => '/accounts/fees',
            'is_read' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Payment of ₹" . number_format($amountVal) . " processed successfully. Transaction ID: {$txnId}",
            'data' => [
                'txnId' => $txnId,
                'receiptNumber' => $receiptNo,
                'paidDate' => $now->format('M d, Y'),
                'paymentMode' => $modeLabel,
                'amount' => $amountVal,
            ],
        ]);
    }
}
