<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SportsEquipment extends Model
{
    use HasFactory, SoftDeletes, BelongsToSchool;

    protected $table = 'sports_equipment';

    protected $fillable = [
        'school_id',
        'sport_id',
        'item_name',
        'category',
        'quantity_total',
        'quantity_available',
        'quantity_issued',
        'condition',
        'storage_location',
        'purchase_date',
        'unit_cost',
        'status',
    ];

    protected $casts = [
        'quantity_total' => 'integer',
        'quantity_available' => 'integer',
        'quantity_issued' => 'integer',
        'unit_cost' => 'decimal:2',
        'purchase_date' => 'date',
    ];

    public function sport()
    {
        return $this->belongsTo(Sport::class, 'sport_id');
    }

    public function issues()
    {
        return $this->hasMany(SportsEquipmentIssue::class, 'equipment_id');
    }
}
