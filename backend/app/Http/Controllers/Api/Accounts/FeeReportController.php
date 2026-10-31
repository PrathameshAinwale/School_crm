<?php

namespace App\Http\Controllers\Api\Accounts;

use App\Http\Controllers\Controller;
use App\Models\FeeLedger;
use App\Models\FeePayment;
use App\Models\Student;
use App\Models\StudentFee;
use App\Services\Fees\FeeLedgerService;
use App\Services\SchoolContext;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FeeReportController extends Controller
{
    /**
     * Daily Fee Collection Report.
     */
    public function dailyCollection(Request $request)
    {
        $date = $request->filled('date') ? Carbon::parse($request->date)->toDateString() : Carbon::today()->toDateString();
        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()->school_id;

        $payments = FeePayment::with(['student.schoolClass', 'student.section', 'collector'])
            ->where('school_id', $schoolId)
            ->where('payment_date', $date)
            ->whereIn('status', ['completed', 'cleared'])
            ->get();

        $totalCollected = round((float) $payments->sum('amount_paid'), 2);

        $modeBreakdown = [
            'cash' => round((float) $payments->where('payment_mode', 'cash')->sum('amount_paid'), 2),
            'cheque' => round((float) $payments->where('payment_mode', 'cheque')->sum('amount_paid'), 2),
            'bank_transfer' => round((float) $payments->where('payment_mode', 'bank_transfer')->sum('amount_paid'), 2),
            'upi_manual' => round((float) $payments->where('payment_mode', 'upi_manual')->sum('amount_paid'), 2),
        ];

        $cashierBreakdown = $payments->groupBy('collected_by_user_id')->map(function ($group) {
            $cashier = $group->first()->collector;
            return [
                'cashier_id' => $cashier?->id,
                'cashier_name' => $cashier?->name ?: 'Accounts Counter',
                'transactions_count' => $group->count(),
                'total_amount' => round((float) $group->sum('amount_paid'), 2),
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => [
                'date' => $date,
                'formatted_date' => Carbon::parse($date)->format('M d, Y'),
                'total_collected' => $totalCollected,
                'transactions_count' => $payments->count(),
                'mode_breakdown' => $modeBreakdown,
                'cashier_breakdown' => $cashierBreakdown,
                'payments' => $payments->map(fn($p) => [
                    'id' => $p->id,
                    'receipt_number' => $p->receipt_number,
                    'student_name' => $p->student?->full_name,
                    'admission_no' => $p->student?->admission_number,
                    'class' => $p->student?->schoolClass?->name,
                    'amount' => (float) $p->amount_paid,
                    'payment_mode' => $p->payment_mode,
                    'reference_number' => $p->reference_number,
                    'cashier' => $p->collector?->name,
                ]),
            ],
        ]);
    }

    /**
     * Overdue Fee Defaulters List & CSV Export.
     */
    public function defaulters(Request $request)
    {
        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()->school_id;
        $today = Carbon::today()->toDateString();

        $query = StudentFee::with(['student.schoolClass', 'student.section', 'student.user'])
            ->where('school_id', $schoolId)
            ->whereNotIn('status', ['Paid', 'Cancelled'])
            ->where('id', '!=', 21)
            ->where('due_date', '<', $today);

        if ($request->filled('class_id') && $request->class_id !== 'all') {
            $query->whereHas('student', fn($sq) => $sq->where('school_class_id', $request->class_id));
        }

        $minDays = $request->integer('min_days', 0);
        if ($minDays > 0) {
            $thresholdDate = Carbon::today()->subDays($minDays)->toDateString();
            $query->where('due_date', '<=', $thresholdDate);
        }

        $overdueFees = $query->orderBy('due_date', 'asc')->get();

        // Group by student
        $defaulters = $overdueFees->groupBy('student_id')->map(function ($fees) {
            $student = $fees->first()->student;
            $oldestDue = $fees->min('due_date');
            $daysOverdue = Carbon::parse($oldestDue)->diffInDays(Carbon::today());

            $totalOverdue = $fees->sum(fn($f) => max(0.00, round(((float)$f->net_amount) - ((float)$f->paid_amount), 2)));

            return [
                'student_id' => $student?->id,
                'student_name' => $student?->full_name,
                'admission_number' => $student?->admission_number,
                'class' => $student?->schoolClass?->name,
                'section' => $student?->section?->name,
                'guardian_name' => $student?->guardian_name ?: ($student?->father_name ?: 'Parent'),
                'guardian_phone' => $student?->guardian_phone,
                'guardian_email' => $student?->guardian_email,
                'oldest_due_date' => $oldestDue,
                'days_overdue' => $daysOverdue,
                'overdue_installments_count' => $fees->count(),
                'total_overdue_amount' => round($totalOverdue, 2),
                'installments' => $fees->map(fn($f) => [
                    'id' => $f->id,
                    'term_name' => $f->term_name,
                    'due_date' => $f->due_date ? $f->due_date->toDateString() : null,
                    'amount' => (float) $f->amount,
                    'fine_amount' => (float) $f->fine_amount,
                    'net_amount' => (float) $f->net_amount,
                    'paid_amount' => (float) $f->paid_amount,
                    'balance_due' => max(0.00, round(((float)$f->net_amount) - ((float)$f->paid_amount), 2)),
                ]),
            ];
        })->values();

        // Handle CSV Export
        if ($request->boolean('export_csv', false)) {
            return $this->exportDefaultersCsv($defaulters);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'defaulters_count' => $defaulters->count(),
                'total_overdue_amount' => round($defaulters->sum('total_overdue_amount'), 2),
                'defaulters' => $defaulters,
            ],
        ]);
    }

    /**
     * CSV Export with Formula Injection Sanitization.
     */
    protected function exportDefaultersCsv($defaulters): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="fee_defaulters_' . date('Y-m-d') . '.csv"',
        ];

        return response()->stream(function () use ($defaulters) {
            $handle = fopen('php://output', 'w');
            
            // Header row
            fputcsv($handle, [
                'Admission No',
                'Student Name',
                'Class',
                'Section',
                'Guardian Name',
                'Guardian Phone',
                'Overdue Amount (INR)',
                'Days Overdue',
                'Overdue Installments',
            ]);

            foreach ($defaulters as $d) {
                fputcsv($handle, [
                    self::sanitizeCsvCell($d['admission_number']),
                    self::sanitizeCsvCell($d['student_name']),
                    self::sanitizeCsvCell($d['class']),
                    self::sanitizeCsvCell($d['section']),
                    self::sanitizeCsvCell($d['guardian_name']),
                    self::sanitizeCsvCell($d['guardian_phone']),
                    number_format($d['total_overdue_amount'], 2, '.', ''),
                    $d['days_overdue'],
                    $d['overdue_installments_count'],
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Neutralize formula injection in CSV exports.
     * Cells starting with =, +, -, @ are escaped.
     */
    public static function sanitizeCsvCell(?string $value): string
    {
        if ($value === null || $value === '') {
            return '';
        }

        $firstChar = substr($value, 0, 1);
        if (in_array($firstChar, ['=', '+', '-', '@'], true)) {
            return "'" . $value;
        }

        return $value;
    }

    /**
     * Student Running Ledger.
     */
    public function studentLedger(Request $request, $studentId)
    {
        $user = $request->user();
        $schoolId = SchoolContext::getActiveSchoolId() ?: $user->school_id;
        $student = Student::withoutGlobalScopes()->findOrFail($studentId);

        if ((int)$student->school_id !== (int)$schoolId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized student ledger access.'], 403);
        }

        // Verify parent authorization
        if ($user->role === 'student_parent') {
            $isOwnChild = ($student->user_id === $user->id) ||
                (strtolower($student->guardian_email ?? '') === strtolower($user->email ?? '')) ||
                (($student->guardian_phone ?? '') === ($user->phone ?? ''));

            if (!$isOwnChild) {
                return response()->json(['success' => false, 'message' => 'Forbidden: You cannot access fee ledgers of other students.'], 403);
            }
        }

        $entries = FeeLedger::where('student_id', $student->id)
            ->orderBy('id', 'asc')
            ->get();

        $totalDebits = round((float) $entries->sum('debit'), 2);
        $totalCredits = round((float) $entries->sum('credit'), 2);
        $netBalance = round($totalDebits - $totalCredits, 2);

        return response()->json([
            'success' => true,
            'data' => [
                'student' => [
                    'id' => $student->id,
                    'name' => $student->full_name,
                    'admission_number' => $student->admission_number,
                    'class' => $student->schoolClass?->name,
                ],
                'summary' => [
                    'total_debits' => $totalDebits,
                    'total_credits' => $totalCredits,
                    'net_balance_due' => $netBalance,
                ],
                'entries' => $entries->map(fn($e) => [
                    'id' => $e->id,
                    'entry_date' => $e->entry_date ? $e->entry_date->toDateString() : null,
                    'formatted_date' => $e->entry_date ? $e->entry_date->format('M d, Y') : '—',
                    'entry_type' => $e->entry_type,
                    'reference_number' => $e->reference_number,
                    'description' => $e->description,
                    'debit' => (float) $e->debit,
                    'credit' => (float) $e->credit,
                    'running_balance' => (float) $e->running_balance,
                ]),
            ],
        ]);
    }

    /**
     * Waive late fine (Admin only).
     */
    public function waiveFine(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'admin' && $user->role !== 'super_admin') {
            return response()->json(['success' => false, 'message' => 'Only administrators can waive late fines.'], 403);
        }

        $request->validate([
            'student_fee_id' => 'required|exists:student_fees,id',
            'waive_amount' => 'required|numeric|min:0.01',
            'reason' => 'required|string|max:255',
        ]);

        $fee = StudentFee::with('student')->findOrFail($request->student_fee_id);
        $waiveAmount = round((float) $request->waive_amount, 2);

        $unpaidFine = max(0.00, round(((float)$fee->fine_amount) - ((float)$fee->fine_paid_amount) - ((float)$fee->fine_waived_amount), 2));
        if ($waiveAmount > $unpaidFine) {
            return response()->json([
                'success' => false,
                'message' => "Waive amount (₹" . number_format($waiveAmount, 2) . ") exceeds unpaid fine amount (₹" . number_format($unpaidFine, 2) . ").",
            ], 422);
        }

        $schoolId = $fee->school_id;

        \Illuminate\Support\Facades\DB::transaction(function () use ($fee, $waiveAmount, $schoolId, $user, $request) {
            $fee->fine_waived_amount = round(((float)$fee->fine_waived_amount) + $waiveAmount, 2);
            $fee->net_amount = max(0.00, round(((float)$fee->amount) - ((float)$fee->concession_amount) + ((float)$fee->fine_amount) - ((float)$fee->fine_waived_amount), 2));
            
            $rem = round(((float)$fee->net_amount) - ((float)$fee->paid_amount), 2);
            if ($rem <= 0.01) {
                $fee->status = 'Paid';
            }
            $fee->save();

            FeeLedgerService::append(
                schoolId: $schoolId,
                studentId: $fee->student_id,
                entryType: 'fine_waiver',
                description: "Fine Waived for {$fee->term_name} - Reason: " . $request->input('reason'),
                debit: 0.00,
                credit: $waiveAmount,
                referenceNumber: 'WAIVE-' . $fee->id,
                userId: $user->id
            );
        });

        return response()->json([
            'success' => true,
            'message' => "Late fee of ₹" . number_format($waiveAmount, 2) . " waived successfully.",
            'data' => $fee->fresh(),
        ]);
    }
}

