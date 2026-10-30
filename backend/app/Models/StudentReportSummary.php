<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentReportSummary extends Model
{
    use HasFactory, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'academic_year_id',
        'summary_type',
        'exam_term_id',
        'term_scope_id',
        'student_id',
        'school_class_id',
        'section_id',
        'total_max_marks',
        'total_obtained_marks',
        'percentage',
        'overall_grade',
        'overall_gpa',
        'class_rank',
        'section_rank',
        'result_status',
        'teacher_remarks',
        'published_at',
    ];

    protected $casts = [
        'total_max_marks' => 'decimal:2',
        'total_obtained_marks' => 'decimal:2',
        'percentage' => 'decimal:2',
        'overall_gpa' => 'decimal:2',
        'class_rank' => 'integer',
        'section_rank' => 'integer',
        'published_at' => 'datetime',
    ];

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function examTerm()
    {
        return $this->belongsTo(ExamTerm::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function section()
    {
        return $this->belongsTo(Section::class);
    }
}
