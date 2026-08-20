<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Timetable extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_class_id',
        'section_id',
        'created_by_teacher_id',
        'class_name',
        'division',
        'day_of_week',
        'period_name',
        'period_number',
        'time_slot',
        'subject',
        'teacher_name',
        'room',
        'type',
    ];

    protected $casts = [
        'period_number' => 'integer',
    ];

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function creatorTeacher()
    {
        return $this->belongsTo(Teacher::class, 'created_by_teacher_id');
    }
}
