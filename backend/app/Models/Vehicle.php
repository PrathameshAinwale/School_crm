<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehicle extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
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
        'status',
    ];

    protected $casts = [
        'route_stops' => 'array',
        'insurance_expiry' => 'date',
        'fitness_expiry' => 'date',
    ];
}
