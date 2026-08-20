<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Resource extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'resource_code',
        'name',
        'category',
        'total_quantity',
        'available_quantity',
        'condition',
        'location_room',
        'purchase_date',
        'unit_cost',
        'status',
        'notes',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'unit_cost' => 'decimal:2',
    ];
}
