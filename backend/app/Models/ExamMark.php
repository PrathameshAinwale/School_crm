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
        'academic_year_id',
        'exam_id',
        'student_id',
        'marks_obtained',
        'special_status',
        'is_passed',
        'grade',
        'grade_point',
        'teacher_remarks',
        'entered_by_user_id',
        'verified_by_user_id',
    ];

    protected $casts = [
        'marks_obtained' => 'decimal:2',
        'is_passed' => 'boolean',
        'grade_point' => 'decimal:2',
    ];

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function enteredByUser()
    {
        return $this->belongsTo(User::class, 'entered_by_user_id');
    }

    public function verifiedByUser()
    {
        return $this->belongsTo(User::class, 'verified_by_user_id');
    }
}
