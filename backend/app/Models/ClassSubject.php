<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassSubject extends Model
{
    use HasFactory, BelongsToSchool;

    protected $table = 'class_subjects';

    protected $fillable = [
        'school_id',
        'school_class_id',
        'subject_id',
        'teacher_id',
        'periods_per_week',
        'max_marks',
        'passing_marks',
        'is_elective',
    ];

    protected $casts = [
        'is_elective' => 'boolean',
        'periods_per_week' => 'integer',
        'max_marks' => 'float',
        'passing_marks' => 'float',
    ];

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'school_class_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }
}

