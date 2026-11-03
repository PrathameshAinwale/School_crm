<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'school_class_id',
        'name',
        'capacity',
    ];

    protected static function booted()
    {
        static::saved(function ($s) {
            $sid = $s->school_id ?: $s->schoolClass?->school_id;
            if ($sid) {
                \Illuminate\Support\Facades\Cache::forget("school_{$sid}_classes_v2");
            }
            \Illuminate\Support\Facades\Cache::forget("school_all_classes_v2");
        });

        static::deleted(function ($s) {
            $sid = $s->school_id ?: $s->schoolClass?->school_id;
            if ($sid) {
                \Illuminate\Support\Facades\Cache::forget("school_{$sid}_classes_v2");
            }
            \Illuminate\Support\Facades\Cache::forget("school_all_classes_v2");
        });
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'school_class_id');
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'section_id');
    }
}
