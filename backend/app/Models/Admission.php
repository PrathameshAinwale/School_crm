<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Admission extends Model
{
    use HasFactory, SoftDeletes, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'application_number',
        'first_name',
        'last_name',
        'date_of_birth',
        'gender',
        'school_class_id',
        'with_transport',
        'academic_year',
        'lead_source',
        'guardian_name',
        'guardian_phone',
        'guardian_email',
        'guardian_relation',
        'previous_school',
        'previous_score',
        'address',
        'status', // Inquiry (Pending), Document Review (Under Review), Assessment/Interview, Offer Extended (Approved), Fee Paid, Enrolled, Rejected
        'documents',
        'test_score',
        'test_date',
        'test_status',
        'interview_date',
        'interview_interviewer',
        'interview_notes',
        'interview_result',
        'offer_date',
        'offer_valid_until',
        'admission_fee',
        'admission_fee_status',
        'admission_fee_receipt',
        'admission_fee_date',
        'admission_fee_mode',
        'enrolled_student_id',
        'remarks',
        'pipeline_notes',
    ];

    protected $casts = [
        'with_transport' => 'boolean',
        'date_of_birth' => 'date',
        'documents' => 'array',
        'test_date' => 'date',
        'interview_date' => 'datetime',
        'offer_date' => 'date',
        'offer_valid_until' => 'date',
        'admission_fee_date' => 'date',
        'admission_fee' => 'decimal:2',
        'pipeline_notes' => 'array',
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
