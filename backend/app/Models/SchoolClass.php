<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolClass extends Model
{
    use HasFactory;

    protected $table = 'school_classes';

    protected $fillable = [
        'name',
        'code',
        'description',
    ];

    public function sections()
    {
        return $this->hasMany(Section::class, 'school_class_id');
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'school_class_id');
    }
}
