<?php

namespace App\Services;

use App\Models\AcademicYear;

class AcademicYearContext
{
    private static ?int $activeAcademicYearId = null;
    private static ?AcademicYear $activeAcademicYear = null;

    public static function setActiveAcademicYearId(?int $yearId): void
    {
        self::$activeAcademicYearId = $yearId;
        self::$activeAcademicYear = null;
    }

    public static function getActiveAcademicYearId(): ?int
    {
        return self::$activeAcademicYearId;
    }

    public static function getActiveAcademicYear(?int $schoolId = null): ?AcademicYear
    {
        if (self::$activeAcademicYear) {
            return self::$activeAcademicYear;
        }

        $schoolId = $schoolId ?: SchoolContext::getActiveSchoolId();

        if (self::$activeAcademicYearId && $schoolId) {
            $year = AcademicYear::withoutGlobalScopes()
                ->where('school_id', $schoolId)
                ->where('id', self::$activeAcademicYearId)
                ->first();

            if ($year) {
                self::$activeAcademicYear = $year;
                return $year;
            }
        }

        // Fallback to active school's is_current year
        if ($schoolId) {
            $current = AcademicYear::withoutGlobalScopes()
                ->where('school_id', $schoolId)
                ->where('is_current', true)
                ->first();

            if ($current) {
                self::$activeAcademicYearId = $current->id;
                self::$activeAcademicYear = $current;
                return $current;
            }
        }

        return null;
    }

    public static function reset(): void
    {
        self::$activeAcademicYearId = null;
        self::$activeAcademicYear = null;
    }
}

