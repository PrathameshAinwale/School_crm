<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SportsFacility extends Model
{
    use HasFactory, SoftDeletes, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'name',
        'facility_type',
        'capacity',
        'surface_type',
        'floodlights',
        'maintenance_status',
        'location',
        'rules_notes',
    ];

    protected $casts = [
        'floodlights' => 'boolean',
        'capacity' => 'integer',
    ];

    public function schedules()
    {
        return $this->hasMany(SportsTrainingSchedule::class, 'facility_id');
    }
}
