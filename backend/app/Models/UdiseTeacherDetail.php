<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UdiseTeacherDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'school_id',
        'national_teacher_code',
        'state_teacher_code',
        'social_category',
        'nature_of_appointment',
        'academic_qualification',
        'professional_qualification',
        'cadre_designation',
        'appointment_level',
        'date_of_joining_service',
        'date_of_joining_current_school',
        'mathematics_studied_upto',
        'science_studied_upto',
        'english_studied_upto',
        'social_studies_studied_upto',
        'trained_in_ict',
        'trained_for_cwsn',
        'in_service_training_days_last_year',
        'is_cwsn_disability',
    ];

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}
