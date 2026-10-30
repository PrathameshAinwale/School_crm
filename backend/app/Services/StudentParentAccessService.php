<?php

namespace App\Services;

use App\Models\SchoolSetting;
use App\Models\Student;
use App\Models\User;
use App\Services\Communication\PhoneNormalizer;
use Illuminate\Support\Facades\Log;

class StudentParentAccessService
{
    /**
     * Determine whether the given user has authorized parental access to the student.
     */
    public static function canParentAccessStudent(User $user, Student $student): bool
    {
        // 1. Strict multi-tenant guard
        if ((int)$student->school_id !== (int)$user->school_id) {
            return false;
        }

        // 2. Non-parent roles: administrative or academic staff authorization handled separately
        if ($user->role !== 'student_parent') {
            return false;
        }

        // 3. Primary authoritative link: explicit relational user_id mapping
        if ($student->user_id && (int)$student->user_id === (int)$user->id) {
            return true;
        }

        // 4. Legacy guardian phone/email matching (strictly behind configurable setting, defaults to false)
        $fallbackEnabled = filter_var(
            SchoolSetting::getDecrypted('parent_legacy_guardian_match_enabled', $user->school_id, 'false'),
            FILTER_VALIDATE_BOOLEAN
        );

        if (!$fallbackEnabled) {
            return false;
        }

        $emailMatch = false;
        if (!empty($user->email) && !empty($student->guardian_email)) {
            $emailMatch = strcasecmp(trim($user->email), trim($student->guardian_email)) === 0;
        }

        $phoneMatch = false;
        if (!empty($user->phone) && !empty($student->guardian_phone)) {
            $userNorm = PhoneNormalizer::normalize($user->phone);
            $guardNorm = PhoneNormalizer::normalize($student->guardian_phone);
            $phoneMatch = (!empty($userNorm) && !empty($guardNorm) && $userNorm === $guardNorm);
        }

        if ($emailMatch || $phoneMatch) {
            Log::warning("Parent access granted via legacy unindexed fallback (parent_legacy_guardian_match_enabled)", [
                'user_id' => $user->id,
                'student_id' => $student->id,
                'email_matched' => $emailMatch,
                'phone_matched' => $phoneMatch,
            ]);
            return true;
        }

        return false;
    }

    /**
     * Retrieve all students accessible to the parent user.
     */
    public static function getAccessibleStudents(User $user)
    {
        if ($user->role !== 'student_parent') {
            return collect();
        }

        $students = Student::where('school_id', $user->school_id)
            ->where('user_id', $user->id)
            ->get();

        if ($students->isNotEmpty()) {
            return $students;
        }

        $fallbackEnabled = filter_var(
            SchoolSetting::getDecrypted('parent_legacy_guardian_match_enabled', $user->school_id, 'false'),
            FILTER_VALIDATE_BOOLEAN
        );

        if ($fallbackEnabled) {
            $legacyStudents = Student::where('school_id', $user->school_id)
                ->where(function ($q) use ($user) {
                    if (!empty($user->email)) {
                        $q->whereRaw('LOWER(guardian_email) = ?', [strtolower(trim($user->email))]);
                    }
                    if (!empty($user->phone)) {
                        $norm = PhoneNormalizer::normalize($user->phone);
                        $q->orWhere('guardian_phone', $user->phone)
                          ->orWhere('guardian_phone', $norm);
                    }
                })
                ->get();

            if ($legacyStudents->isNotEmpty()) {
                Log::warning("Accessible students retrieved via legacy fallback", ['user_id' => $user->id]);
                return $legacyStudents;
            }
        }

        return collect();
    }
}
