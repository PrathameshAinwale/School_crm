<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Admission extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'application_number',
        'first_name',
        'last_name',
        'date_of_birth',
        'gender',
        'school_class_id',
        'with_transport',
        'academic_year',
        'guardian_name',
        'guardian_phone',
        'guardian_email',
        'guardian_relation',
        'previous_school',
        'previous_score',
        'address',
        'status', // Pending, Under Review, Approved, Rejected, Enrolled
        'enrolled_student_id',
        'remarks',
    ];

    protected $casts = [
        'with_transport' => 'boolean',
        'date_of_birth' => 'date',
    ];

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'school_class_id');
    }

    public function enrolledStudent()
    {
        return $this->belongsTo(Student::class, 'enrolled_student_id');
    }

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }
}
