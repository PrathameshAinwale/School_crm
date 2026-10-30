<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportCard extends Model
{
    use HasFactory, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'examination_id',
        'student_id',
        'academic_year',
        'total_max_marks',
        'total_marks_obtained',
        'percentage',
        'overall_grade',
        'result_status',
        'class_rank',
        'division_rank',
        'total_working_days',
        'present_days',
        'attendance_percentage',
        'teacher_remarks',
        'principal_remarks',
        'pdf_filename',
    ];

    protected $casts = [
        'total_max_marks' => 'decimal:2',
        'total_marks_obtained' => 'decimal:2',
        'percentage' => 'decimal:2',
        'attendance_percentage' => 'decimal:2',
        'class_rank' => 'integer',
        'division_rank' => 'integer',
        'total_working_days' => 'integer',
        'present_days' => 'integer',
    ];

    public function examination()
    {
        return $this->belongsTo(Examination::class, 'examination_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function school()
    {
        return $this->belongsTo(School::class, 'school_id');
    }
}
