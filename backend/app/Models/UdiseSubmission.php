<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UdiseSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'academic_year',
        'status',
        'completion_percentage',
        'profile_completed',
        'facilities_completed',
        'teachers_completed',
        'students_completed',
        'certified_at',
        'certified_by',
        'acknowledgement_number',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}
