<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolClass extends Model
{
    use HasFactory;

    protected $table = 'school_classes';

    protected $fillable = [
        'school_id',
        'name',
        'code',
        'description',
    ];

    protected static function booted()
    {
        static::saved(function ($cls) {
            \App\Http\Controllers\Api\Admin\AcademicController::invalidateClassesCache($cls->school_id);
        });

        static::deleted(function ($cls) {
            \App\Http\Controllers\Api\Admin\AcademicController::invalidateClassesCache($cls->school_id);
        });
    }

    public function sections()
    {
        return $this->hasMany(Section::class, 'school_class_id');
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'school_class_id');
    }

    public function feeStructure()
    {
        return $this->hasOne(FeeStructure::class, 'school_class_id');
    }
}
