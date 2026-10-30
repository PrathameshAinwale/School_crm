<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamTerm extends Model
{
    use HasFactory, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'academic_year_id',
        'grading_scale_id',
        'name',
        'code',
        'term_type',
        'weightage_percentage',
        'start_date',
        'end_date',
        'description',
        'status',
        'grading_scale_snapshot',
        'published_at',
        'published_by_user_id',
    ];

    protected $casts = [
        'weightage_percentage' => 'decimal:2',
        'grading_scale_snapshot' => 'array',
        'start_date' => 'date',
        'end_date' => 'date',
        'published_at' => 'datetime',
    ];

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function gradingScale()
    {
        return $this->belongsTo(GradingScale::class);
    }

    public function publishedByUser()
    {
        return $this->belongsTo(User::class, 'published_by_user_id');
    }

    public function exams()
    {
        return $this->hasMany(Exam::class);
    }

    public function studentReportSummaries()
    {
        return $this->hasMany(StudentReportSummary::class);
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }
}
