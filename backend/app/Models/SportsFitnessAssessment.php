<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SportsFitnessAssessment extends Model
{
    use HasFactory, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'student_id',
        'assessment_date',
        'assessed_by',
        'academic_term',
        'height_cm',
        'weight_kg',
        'bmi',
        'sprint_50m_seconds',
        'shuttle_run_seconds',
        'pushups_count',
        'sit_and_reach_cm',
        'stamina_rating',
        'medical_clearance',
        'remarks',
    ];

    protected $casts = [
        'assessment_date' => 'date',
        'height_cm' => 'decimal:2',
        'weight_kg' => 'decimal:2',
        'bmi' => 'decimal:1',
        'sprint_50m_seconds' => 'decimal:2',
        'shuttle_run_seconds' => 'decimal:2',
        'pushups_count' => 'integer',
        'sit_and_reach_cm' => 'decimal:1',
        'medical_clearance' => 'boolean',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }
}
