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

    public static function getActiveAcademicYearId(?int $schoolId = null): ?int
    {
        if (self::$activeAcademicYearId !== null) {
            return self::$activeAcademicYearId;
        }

        $active = self::getActiveAcademicYear($schoolId);
        return $active ? $active->id : null;
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

        // Fallback to active school's is_current year (cached to avoid redundant queries on every request)
        if ($schoolId) {
            $yearId = \Illuminate\Support\Facades\Cache::remember("school_{$schoolId}_current_year_id", 3600, function () use ($schoolId) {
                return AcademicYear::withoutGlobalScopes()
                    ->where('school_id', $schoolId)
                    ->where('is_current', true)
                    ->value('id');
            });

            if ($yearId) {
                self::$activeAcademicYearId = $yearId;
                $current = AcademicYear::withoutGlobalScopes()->find($yearId);
                if ($current) {
                    self::$activeAcademicYear = $current;
                    return $current;
                }
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

