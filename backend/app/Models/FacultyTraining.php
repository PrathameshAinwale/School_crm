<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FacultyTraining extends Model
{
    use HasFactory;

    protected $fillable = [
        'training_id',
        'title',
        'category',
        'trainer_name',
        'date',
        'time_slot',
        'venue',
        'target_audience',
        'enrolled_count',
        'attendance_rate',
        'status',
        'description',
        'materials_url',
        'coordinator',
        'enrolled_teachers',
    ];

    protected $casts = [
        'date' => 'date',
        'enrolled_teachers' => 'array',
        'enrolled_count' => 'integer',
        'attendance_rate' => 'integer',
    ];
}
