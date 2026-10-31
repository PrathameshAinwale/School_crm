<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamMark extends Model
{
    use HasFactory, BelongsToSchool;

    protected $fillable = [
        'school_id',

        // Ajay's examination fields
        'examination_id',
        'subject_id',
        'theory_marks',
        'practical_marks',
        'max_marks',
        'passing_marks',
        'remarks',

        // Prathamesh's examination fields
        'academic_year_id',
        'exam_id',
        'special_status',
        'is_passed',
        'grade_point',
        'teacher_remarks',
        'entered_by_user_id',
        'verified_by_user_id',

        // Shared fields
        'student_id',
        'marks_obtained',
        'grade',
    ];

    protected $casts = [
        'theory_marks' => 'decimal:2',
        'practical_marks' => 'decimal:2',
        'marks_obtained' => 'decimal:2',
        'max_marks' => 'decimal:2',
        'passing_marks' => 'decimal:2',
        'is_passed' => 'boolean',
        'grade_point' => 'decimal:2',
    ];

    // Ajay's examination relationship
    public function examination()
    {
        return $this->belongsTo(Examination::class, 'examination_id');
    }

    // Prathamesh's examination relationship
    public function exam()
    {
        return $this->belongsTo(Exam::class, 'exam_id');
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    public function enteredByUser()
    {
        return $this->belongsTo(User::class, 'entered_by_user_id');
    }

    public function verifiedByUser()
    {
        return $this->belongsTo(User::class, 'verified_by_user_id');
    }

    /**
     * Compute grade automatically based on percentage.
     */
    public static function calculateGrade($obtained, $max = 100): string
    {
        if ($max <= 0) {
            return 'E';
        }

        $pct = ($obtained / $max) * 100;

        if ($pct >= 90) return 'A+';
        if ($pct >= 80) return 'A';
        if ($pct >= 70) return 'B+';
        if ($pct >= 60) return 'B';
        if ($pct >= 50) return 'C';
        if ($pct >= 35) return 'D';

        return 'E';
    }

    /**
     * Get performance descriptor.
     */
    public static function getRemarkForGrade($grade): string
    {
        return match ($grade) {
            'A+' => 'Outstanding Performance',
            'A' => 'Excellent Comprehension',
            'B+' => 'Very Good Effort',
            'B' => 'Good Progress',
            'C' => 'Satisfactory',
            'D' => 'Scope for Improvement',
            default => 'Needs Immediate Attention',
        };
    }
}
