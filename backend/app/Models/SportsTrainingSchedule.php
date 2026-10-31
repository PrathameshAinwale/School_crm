<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SportsTrainingSchedule extends Model
{
    use HasFactory, SoftDeletes, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'sport_id',
        'facility_id',
        'squad_name',
        'coach_name',
        'day_of_week',
        'start_time',
        'end_time',
        'session_type',
        'target_grades',
        'capacity',
        'status',
    ];

    protected $casts = [
        'capacity' => 'integer',
    ];

    public function sport()
    {
        return $this->belongsTo(Sport::class, 'sport_id');
    }

    public function facility()
    {
        return $this->belongsTo(SportsFacility::class, 'facility_id');
    }
}
