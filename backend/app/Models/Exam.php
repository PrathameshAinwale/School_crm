<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    use HasFactory, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'academic_year_id',
        'exam_term_id',
        'school_class_id',
        'section_id',
        'subject_id',
        'exam_date',
        'start_time',
        'end_time',
        'room',
        'max_marks',
        'pass_marks',
        'status',
        'submitted_at',
        'submitted_by_teacher_id',
        'verified_at',
        'verified_by_user_id',
        'locked_at',
        'locked_by_user_id',
        'unlocked_at',
        'unlocked_by_user_id',
        'unlock_reason',
    ];

    protected $casts = [
        'max_marks' => 'decimal:2',
        'pass_marks' => 'decimal:2',
        'exam_date' => 'date',
        'submitted_at' => 'datetime',
        'verified_at' => 'datetime',
        'locked_at' => 'datetime',
        'unlocked_at' => 'datetime',
    ];

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function examTerm()
    {
        return $this->belongsTo(ExamTerm::class);
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function submittedByTeacher()
    {
        return $this->belongsTo(Teacher::class, 'submitted_by_teacher_id');
    }

    public function verifiedByUser()
    {
        return $this->belongsTo(User::class, 'verified_by_user_id');
    }

    public function lockedByUser()
    {
        return $this->belongsTo(User::class, 'locked_by_user_id');
    }

    public function unlockedByUser()
    {
        return $this->belongsTo(User::class, 'unlocked_by_user_id');
    }

    public function examMarks()
    {
        return $this->hasMany(ExamMark::class);
    }

    public function isLocked(): bool
    {
        return in_array($this->status, ['locked', 'published'], true);
    }
}

