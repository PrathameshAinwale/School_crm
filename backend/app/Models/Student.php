<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use HasFactory, SoftDeletes, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'user_id',
        'admission_number',
        'roll_number',
        'first_name',
        'last_name',
        'date_of_birth',
        'gender',
        'blood_group',
        'school_class_id',
        'section_id',
        'with_transport',
        'admission_date',
        'guardian_name',
        'father_name',
        'father_occupation',
        'mother_name',
        'mother_occupation',
        'guardian_phone',
        'guardian_email',
        'guardian_relation',
        'address',
        'emergency_contact',
        'medical_notes',
        'status',
    ];

    protected $casts = [
        'with_transport' => 'boolean',
        'date_of_birth' => 'date',
        'admission_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'school_class_id');
    }

    public function section()
    {
        return $this->belongsTo(Section::class, 'section_id');
    }

    public function attendances()
    {
        return $this->hasMany(StudentAttendance::class, 'student_id');
    }

    public function fees()
    {
        return $this->hasMany(StudentFee::class, 'student_id');
    }

    protected $appends = [
        'full_name',
        'class_name',
        'division_name',
    ];

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    public function getClassNameAttribute(): ?string
    {
        return $this->schoolClass ? $this->schoolClass->name : ($this->school_class_id ? "Class {$this->school_class_id}" : null);
    }

    public function getDivisionNameAttribute(): ?string
    {
        return $this->section ? $this->section->name : ($this->section_id ? (string) $this->section_id : null);
    }
}
