<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UdiseStudentDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'school_id',
        'pen',
        'aadhaar_number',
        'name_as_per_aadhaar',
        'social_category',
        'minority_group',
        'is_bpl',
        'is_aay',
        'is_ews_disadvantaged',
        'is_cwsn',
        'disability_type',
        'disability_percentage',
        'indian_national',
        'is_out_of_school_child',
        'medium_of_instruction',
        'academic_stream',
        'previous_academic_year_status',
        'previous_class_result',
        'previous_class_percentage',
        'days_attended_previous_year',
        'free_textbooks_received',
        'free_uniforms_received',
        'free_transport_received',
        'scholarship_received',
        'scholarship_amount',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}
