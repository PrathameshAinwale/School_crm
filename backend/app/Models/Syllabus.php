<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Syllabus extends Model
{
    use HasFactory;

    protected $table = 'syllabuses';

    protected $fillable = [
        'school_class_id',
        'class_name',
        'subject_key',
        'subject_name',
        'subject_code',
        'teacher_name',
        'completion_percentage',
    ];

    protected $casts = [
        'completion_percentage' => 'integer',
    ];

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function units()
    {
        return $this->hasMany(SyllabusUnit::class)->orderBy('unit_number', 'asc');
    }

    public function progressLogs()
    {
        return $this->hasMany(SyllabusProgressLog::class)->orderBy('log_date', 'desc');
    }
}
