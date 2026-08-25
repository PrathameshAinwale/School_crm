<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolCalendarEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'event_type',
        'category',
        'date_label',
        'start_date',
        'end_date',
        'time_slot',
        'venue',
        'audience',
        'target_classes',
        'start_time',
        'end_time',
        'coordinator',
        'speaker',
        'status',
        'month_label',
        'description',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'target_classes' => 'array',
    ];
}
