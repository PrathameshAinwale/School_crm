<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SyllabusUnit extends Model
{
    use HasFactory;

    protected $fillable = [
        'syllabus_id',
        'unit_number',
        'title',
        'status',
        'progress_percentage',
        'lectures_info',
        'topics',
    ];

    protected $casts = [
        'unit_number' => 'integer',
        'progress_percentage' => 'integer',
        'topics' => 'array',
    ];

    public function syllabus()
    {
        return $this->belongsTo(Syllabus::class);
    }
}
