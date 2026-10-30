<?php

namespace App\Services\Fees;

use App\Models\AcademicYear;
use App\Models\ReceiptSequence;
use App\Services\AcademicYearContext;
use InvalidArgumentException;

class ReceiptNumberService
{
    /**
     * Generate next gapless sequential receipt or refund number inside a DB transaction.
     * Must be called within a DB::transaction() block.
     */
    public static function generateNextNumber(int $schoolId, ?int $academicYearId = null, string $sequenceType = 'receipt'): string
    {
        if (!$academicYearId) {
            $ay = AcademicYearContext::getActiveAcademicYear($schoolId);
            $academicYearId = $ay ? $ay->id : AcademicYear::withoutGlobalScopes()->where('school_id', $schoolId)->where('is_current', true)->value('id');
        }

        if (!$academicYearId) {
            $fallbackYear = AcademicYear::withoutGlobalScopes()->where('school_id', $schoolId)->first();
            $academicYearId = $fallbackYear ? $fallbackYear->id : 1;
        }

        // Lock sequence row for update to guarantee atomicity and prevent race conditions
        $sequence = ReceiptSequence::where('school_id', $schoolId)
            ->where('academic_year_id', $academicYearId)
            ->where('sequence_type', $sequenceType)
            ->lockForUpdate()
            ->first();

        // Resolve currently configured prefix from School Settings
        $configuredPrefix = \App\Models\SchoolSetting::getDecrypted(
            $sequenceType === 'refund' ? 'fee_refund_prefix' : 'fee_receipt_prefix',
            $schoolId,
            ''
        );

        if (!$configuredPrefix && $sequenceType === 'receipt') {
            $configuredPrefix = \App\Models\SchoolSetting::getDecrypted('receipt_prefix', $schoolId, '');
        }

        $activePrefix = !empty($configuredPrefix) ? rtrim(trim($configuredPrefix), '/-') : (($sequenceType === 'refund') ? 'REF' : 'REC');

        if (!$sequence) {
            try {
                $sequence = ReceiptSequence::create([
                    'school_id' => $schoolId,
                    'academic_year_id' => $academicYearId,
                    'sequence_type' => $sequenceType,
                    'prefix' => $activePrefix,
                    'last_number' => 0,
                ]);
            } catch (\Throwable $e) {
                // If another parallel worker created it in the same millisecond, re-query under lock
                $sequence = ReceiptSequence::where('school_id', $schoolId)
                    ->where('academic_year_id', $academicYearId)
                    ->where('sequence_type', $sequenceType)
                    ->lockForUpdate()
                    ->firstOrFail();
            }
        }

        $academicYear = AcademicYear::withoutGlobalScopes()->find($academicYearId);
        $yearCode = '2026-27';
        if ($academicYear) {
            if (!empty($academicYear->code)) {
                $yearCode = preg_replace('/^AY[-_]?/i', '', $academicYear->code);
            } elseif (!empty($academicYear->name)) {
                if (preg_match('/^(\d{4})-(\d{4})$/', $academicYear->name, $m)) {
                    $yearCode = $m[1] . '-' . substr($m[2], 2);
                } else {
                    $yearCode = str_replace(' ', '', $academicYear->name);
                }
            }
        }

        // Deterministic prefix behavior: new numbers use the current setting prefix.
        // Existing receipts keep their original numbers, and sequence advances monotonically.
        $sequence->prefix = $activePrefix;
        $sequence->last_number += 1;
        $sequence->save();

        return sprintf("%s/%s/%05d", $activePrefix, $yearCode, $sequence->last_number);
    }
}

