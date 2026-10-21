<?php

namespace App\Services;

class SchoolContext
{
    private static ?int $activeSchoolId = null;

    public static function setActiveSchoolId(?int $schoolId): void
    {
        self::$activeSchoolId = $schoolId;
    }

    public static function getActiveSchoolId(): ?int
    {
        return self::$activeSchoolId;
    }

    public static function reset(): void
    {
        self::$activeSchoolId = null;
    }
}
