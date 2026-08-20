<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SyllabusProgressLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'syllabus_id',
        'subject_name',
        'class_name',
        'unit_title',
        'log_date',
        'progress_percentage',
        'message',
        'teacher_name',
    ];

    protected $casts = [
        'log_date' => 'date',
        'progress_percentage' => 'integer',
    ];

    public function syllabus()
    {
        return $this->belongsTo(Syllabus::class);
    }
}
