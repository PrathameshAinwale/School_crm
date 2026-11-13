<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'type',
    ];

    public function classSubjects()
    {
        return $this->hasMany(ClassSubject::class, 'subject_id');
    }

    public function schoolClasses()
    {
        return $this->belongsToMany(SchoolClass::class, 'class_subjects', 'subject_id', 'school_class_id')
            ->withPivot(['id', 'teacher_id', 'periods_per_week', 'max_marks', 'passing_marks', 'is_elective'])
            ->withTimestamps();
    }
}
