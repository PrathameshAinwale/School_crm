<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehicle extends Model
{
    use HasFactory, SoftDeletes, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'vehicle_number',
        'type',
        'model',
        'capacity',
        'driver_name',
        'driver_phone',
        'driver_license',
        'route_name',
        'route_from',
        'route_to',
        'route_stops',
        'fuel_type',
        'insurance_expiry',
        'fitness_expiry',
        'gps_device_id',
        'current_latitude',
        'current_longitude',
        'current_heading',
        'current_speed',
        'is_online',
        'last_ping_at',
        'tracking_token',
        'status',
    ];

    protected $casts = [
        'route_stops' => 'array',
        'insurance_expiry' => 'date',
        'fitness_expiry' => 'date',
        'current_latitude' => 'float',
        'current_longitude' => 'float',
        'current_heading' => 'float',
        'current_speed' => 'float',
        'is_online' => 'boolean',
        'last_ping_at' => 'datetime',
    ];
}
