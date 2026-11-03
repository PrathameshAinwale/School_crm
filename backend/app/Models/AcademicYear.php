<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AcademicYear extends Model
{
    use HasFactory, SoftDeletes, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'name',
        'code',
        'start_date',
        'end_date',
        'is_current',
        'status',
        'description',
    ];

    protected static function booted()
    {
        static::saved(function ($yr) {
            if ($yr->school_id) {
                \Illuminate\Support\Facades\Cache::forget("school_{$yr->school_id}_current_year_id");
                \App\Http\Controllers\Api\Admin\AcademicController::invalidateClassesCache($yr->school_id);
            }
        });

        static::deleted(function ($yr) {
            if ($yr->school_id) {
                \Illuminate\Support\Facades\Cache::forget("school_{$yr->school_id}_current_year_id");
                \App\Http\Controllers\Api\Admin\AcademicController::invalidateClassesCache($yr->school_id);
            }
        });
    }

    protected $casts = [
        'is_current' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
    ];
}

