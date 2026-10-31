<?php

namespace App\Services\Fees;

use App\Models\FeeLedger;
use App\Models\Student;
use InvalidArgumentException;

class FeeLedgerService
{
    /**
     * Append a ledger entry under a per-student lock to guarantee sequential consistency.
     */
    public static function append(
        int $schoolId,
        int $studentId,
        string $entryType,
        string $description,
        float $debit = 0.00,
        float $credit = 0.00,
        ?string $referenceNumber = null,
        ?int $academicYearId = null,
        ?int $userId = null,
        ?string $entryDate = null
    ): FeeLedger {
        if ($debit < 0 || $credit < 0) {
            throw new InvalidArgumentException("Debit and credit amounts cannot be negative.");
        }

        $debit = round($debit, 2);
        $credit = round($credit, 2);

        // Lock student row to ensure sequential running balance calculation
        Student::where('id', $studentId)->lockForUpdate()->first();

        // Compute new running balance atomically
        $lastBalance = (float) (FeeLedger::where('student_id', $studentId)
            ->orderBy('id', 'desc')
            ->value('running_balance') ?? 0.00);

        $newBalance = round($lastBalance + $debit - $credit, 2);

        return FeeLedger::create([
            'school_id' => $schoolId,
            'student_id' => $studentId,
            'academic_year_id' => $academicYearId,
            'entry_date' => $entryDate ?: now()->toDateString(),
            'entry_type' => $entryType,
            'reference_number' => $referenceNumber,
            'description' => $description,
            'debit' => $debit,
            'credit' => $credit,
            'running_balance' => $newBalance,
            'created_by_user_id' => $userId,
        ]);
    }
}

