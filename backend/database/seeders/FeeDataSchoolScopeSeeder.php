<?php

namespace Database\Seeders;

use App\Models\FeeLedger;
use App\Models\FeeStructure;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentFee;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class FeeDataSchoolScopeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @param bool $dryRun
     * @return array
     */
    public function run(bool $dryRun = false): array
    {
        $unresolvedStructures = [];
        $resolvedStructuresCount = 0;
        $unresolvedStudentFees = [];
        $resolvedStudentFeesCount = 0;
        $backfilledStudentFeesCount = 0;
        $bootstrappedLedgerRowsCount = 0;
        $staleCancelledCount = 0;
        $transportExcludedCount = 0;

        // 1. Resolve fee_structures with school_id = NULL
        $structures = FeeStructure::withoutGlobalScopes()
            ->whereNull('school_id')
            ->get();

        foreach ($structures as $fs) {
            $class = SchoolClass::withoutGlobalScopes()->find($fs->school_class_id);
            $schoolId = null;

            if ($class && !empty($class->school_id)) {
                $schoolId = $class->school_id;
            } else {
                // Infer school_id from students enrolled in this class
                $studentSchoolId = Student::withoutGlobalScopes()
                    ->where('school_class_id', $fs->school_class_id)
                    ->whereNotNull('school_id')
                    ->value('school_id');

                if ($studentSchoolId) {
                    $schoolId = $studentSchoolId;
                } else {
                    // Fallback to primary active school tenant
                    $schoolId = \App\Models\School::withoutGlobalScopes()->value('id') ?: 1;
                }
            }

            if ($schoolId) {
                $resolvedStructuresCount++;
                if (!$dryRun) {
                    $fs->school_id = $schoolId;
                    $fs->save();
                }
            } else {
                $unresolvedStructures[] = [
                    'fee_structure_id' => $fs->id,
                    'school_class_id' => $fs->school_class_id,
                    'reason' => 'Associated SchoolClass or School tenant not found',
                ];
            }
        }

        // 2. Resolve student_fees with school_id = NULL
        $studentFees = StudentFee::withoutGlobalScopes()
            ->whereNull('school_id')
            ->get();

        foreach ($studentFees as $sf) {
            // Handle stale legacy set (IDs 11-14): set school_id = 1 and status = 'Cancelled'
            if (in_array((int)$sf->id, [11, 12, 13, 14], true)) {
                $staleCancelledCount++;
                $resolvedStudentFeesCount++;
                if (!$dryRun) {
                    $sf->school_id = 1;
                    $sf->status = 'Cancelled';
                    $sf->save();
                }
                continue;
            }

            $student = Student::withoutGlobalScopes()->find($sf->student_id);
            if ($student && $student->school_id) {
                $resolvedStudentFeesCount++;
                if (!$dryRun) {
                    $sf->school_id = $student->school_id;
                    $sf->save();
                }
            } else {
                $unresolvedStudentFees[] = [
                    'student_fee_id' => $sf->id,
                    'student_id' => $sf->student_id,
                    'reason' => 'Associated Student not found or has no school_id',
                ];
            }
        }

        // 3. Backfill net_amount, paid_amount, fine_paid_amount and bootstrap ledger
        $allStudentFees = StudentFee::withoutGlobalScopes()->get();
        foreach ($allStudentFees as $sf) {
            $effectiveSchoolId = $sf->school_id ?: ($sf->student?->school_id ?: 1);

            // Stale set (IDs 11-14): exclude from ledger bootstrapping
            if (in_array((int)$sf->id, [11, 12, 13, 14], true) || strcasecmp((string)$sf->status, 'Cancelled') === 0) {
                if (!$dryRun) {
                    $sf->school_id = 1;
                    $sf->status = 'Cancelled';
                    $sf->save();
                }
                continue;
            }

            // Transport row (ID 21): leave untouched as historical Paid, exclude from ledger
            if ((int)$sf->id === 21 || stripos((string)$sf->term_name, 'transport') !== false) {
                $transportExcludedCount++;
                continue;
            }

            $netAmount = max(0, ((float)$sf->amount) - ((float)$sf->concession_amount) + ((float)$sf->fine_amount) - ((float)$sf->fine_waived_amount));
            $isPaid = (strtolower($sf->status) === 'paid');
            $paidAmount = $isPaid ? $netAmount : ((float)$sf->paid_amount);

            if (!$dryRun) {
                $sf->net_amount = $netAmount;
                $sf->paid_amount = $paidAmount;
                if ($isPaid && $sf->fine_amount > 0) {
                    $sf->fine_paid_amount = $sf->fine_amount;
                }
                $sf->save();
            }
            $backfilledStudentFeesCount++;

            // 4. Idempotently bootstrap ledger entries if not already present
            if ($effectiveSchoolId) {
                $hasLedgerTable = Schema::hasTable('fee_ledgers');
                $invoiceRef = 'INV-' . $sf->id;
                $hasInvoiceEntry = $hasLedgerTable && FeeLedger::withoutGlobalScopes()
                    ->where('school_id', $effectiveSchoolId)
                    ->where('student_id', $sf->student_id)
                    ->where('reference_number', $invoiceRef)
                    ->exists();

                if (!$hasInvoiceEntry) {
                    $bootstrappedLedgerRowsCount++;
                    if (!$dryRun && $hasLedgerTable) {
                        $lastBalance = (float) (FeeLedger::withoutGlobalScopes()
                            ->where('student_id', $sf->student_id)
                            ->orderBy('id', 'desc')
                            ->value('running_balance') ?? 0.00);
                        $newBalance = round($lastBalance + ((float)$sf->amount), 2);

                        FeeLedger::create([
                            'school_id' => $effectiveSchoolId,
                            'student_id' => $sf->student_id,
                            'entry_date' => $sf->due_date ?: now()->toDateString(),
                            'entry_type' => 'invoice',
                            'reference_number' => $invoiceRef,
                            'description' => "Tuition / Term Fee: {$sf->term_name}",
                            'debit' => $sf->amount,
                            'credit' => 0.00,
                            'running_balance' => $newBalance,
                        ]);
                    }
                }

                if ($isPaid) {
                    $paymentRef = $sf->receipt_number ?: ('REC-LEGACY-' . $sf->id);
                    $hasPaymentEntry = $hasLedgerTable && FeeLedger::withoutGlobalScopes()
                        ->where('school_id', $effectiveSchoolId)
                        ->where('student_id', $sf->student_id)
                        ->where('reference_number', $paymentRef)
                        ->exists();

                    if (!$hasPaymentEntry) {
                        $bootstrappedLedgerRowsCount++;
                        if (!$dryRun && $hasLedgerTable) {
                            $lastBalance = (float) (FeeLedger::withoutGlobalScopes()
                                ->where('student_id', $sf->student_id)
                                ->orderBy('id', 'desc')
                                ->value('running_balance') ?? 0.00);
                            $newBalance = round($lastBalance - $paidAmount, 2);

                            FeeLedger::create([
                                'school_id' => $effectiveSchoolId,
                                'student_id' => $sf->student_id,
                                'entry_date' => $sf->paid_date ?: now()->toDateString(),
                                'entry_type' => 'payment',
                                'reference_number' => $paymentRef,
                                'description' => "Legacy Payment ({$sf->payment_mode}): {$sf->term_name}",
                                'debit' => 0.00,
                                'credit' => $paidAmount,
                                'running_balance' => $newBalance,
                            ]);
                        }
                    }
                }
            }
        }

        // 5. Verify Student 1 Dues & Schedule
        $today = Carbon::today()->toDateString();
        $student1Fees = StudentFee::withoutGlobalScopes()
            ->where('student_id', 1)
            ->whereNotIn('id', [11, 12, 13, 14, 21])
            ->where('status', '!=', 'Cancelled')
            ->where(function ($q) {
                $q->whereNull('term_name')
                  ->orWhere('term_name', 'not like', '%transport%');
            })
            ->get();

        $student1Billed = (float) $student1Fees->sum('amount');
        $student1Paid = (float) $student1Fees->where('status', 'Paid')->sum('amount');
        $student1TotalDues = max(0.00, round($student1Billed - $student1Paid, 2));

        $student1Overdue = (float) $student1Fees->filter(function ($f) use ($today) {
            return $f->status !== 'Paid' && $f->due_date && Carbon::parse($f->due_date)->toDateString() < $today;
        })->sum('amount');

        $student1Upcoming = (float) $student1Fees->filter(function ($f) use ($today) {
            return $f->status !== 'Paid' && (!$f->due_date || Carbon::parse($f->due_date)->toDateString() >= $today);
        })->sum('amount');

        $report = [
            'dry_run' => $dryRun,
            'fee_structures_to_resolve' => $structures->count(),
            'fee_structures_resolvable' => $resolvedStructuresCount,
            'fee_structures_unresolvable' => $unresolvedStructures,
            'student_fees_to_resolve' => $studentFees->count(),
            'student_fees_resolvable' => $resolvedStudentFeesCount,
            'student_fees_unresolvable' => $unresolvedStudentFees,
            'stale_set_marked_cancelled' => $staleCancelledCount,
            'transport_excluded_from_ledger' => $transportExcludedCount,
            'student_fees_backfilled' => $backfilledStudentFeesCount,
            'bootstrapped_ledger_rows' => $bootstrappedLedgerRowsCount,
            'student_1_verification' => [
                'total_billed' => $student1Billed,
                'total_paid' => $student1Paid,
                'total_dues' => $student1TotalDues,
                'overdue_amount' => $student1Overdue,
                'upcoming_amount' => $student1Upcoming,
                'matching_expected' => ($student1TotalDues == 30000.00 && $student1Overdue == 15000.00),
            ],
        ];

        return $report;
    }
}
