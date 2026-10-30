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
        'examination_id',
        'student_id',
        'subject_id',
        'theory_marks',
        'practical_marks',
        'marks_obtained',
        'max_marks',
        'passing_marks',
        'grade',
        'remarks',
    ];

    protected $casts = [
        'theory_marks' => 'decimal:2',
        'practical_marks' => 'decimal:2',
        'marks_obtained' => 'decimal:2',
        'max_marks' => 'decimal:2',
        'passing_marks' => 'decimal:2',
    ];

    public function examination()
    {
        return $this->belongsTo(Examination::class, 'examination_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    /**
     * Compute grade automatically based on percentage
     */
    public static function calculateGrade($obtained, $max = 100): string
    {
        if ($max <= 0) return 'E';
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
     * Get performance descriptor
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
