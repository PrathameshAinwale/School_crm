<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LibrarySetting extends Model
{
    use HasFactory, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'fine_per_day',
        'grace_period_days',
        'max_fine_cap',
        'student_fine_per_day',
        'teacher_fine_per_day',
        'staff_fine_per_day',
        'default_loan_days_student',
        'default_loan_days_teacher',
        'default_loan_days_staff',
        'max_books_per_student',
        'max_books_per_teacher',
        'allow_librarian_fine_waiver',
        'send_overdue_reminders',
    ];

    protected $casts = [
        'fine_per_day' => 'float',
        'grace_period_days' => 'integer',
        'max_fine_cap' => 'float',
        'student_fine_per_day' => 'float',
        'teacher_fine_per_day' => 'float',
        'staff_fine_per_day' => 'float',
        'default_loan_days_student' => 'integer',
        'default_loan_days_teacher' => 'integer',
        'default_loan_days_staff' => 'integer',
        'max_books_per_student' => 'integer',
        'max_books_per_teacher' => 'integer',
        'allow_librarian_fine_waiver' => 'boolean',
        'send_overdue_reminders' => 'boolean',
    ];

    /**
     * Get or create default settings singleton for the current school
     */
    public static function getActiveSettings()
    {
        $setting = self::first();
        if (!$setting) {
            $setting = self::create([
                'fine_per_day' => 10.00,
                'grace_period_days' => 1,
                'max_fine_cap' => 200.00,
                'student_fine_per_day' => 10.00,
                'teacher_fine_per_day' => 0.00,
                'staff_fine_per_day' => 5.00,
                'default_loan_days_student' => 14,
                'default_loan_days_teacher' => 30,
                'default_loan_days_staff' => 14,
                'max_books_per_student' => 3,
                'max_books_per_teacher' => 5,
                'allow_librarian_fine_waiver' => true,
                'send_overdue_reminders' => true,
            ]);
        }
        return $setting;
    }
}
