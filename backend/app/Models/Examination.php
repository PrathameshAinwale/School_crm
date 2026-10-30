<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Examination extends Model
{
    use HasFactory, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'academic_year',
        'name',
        'code',
        'term',
        'start_date',
        'end_date',
        'max_marks_default',
        'passing_marks_default',
        'status',
        'description',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'max_marks_default' => 'decimal:2',
        'passing_marks_default' => 'decimal:2',
    ];

    public function marks()
    {
        return $this->hasMany(ExamMark::class, 'examination_id');
    }

    public function reportCards()
    {
        return $this->hasMany(ReportCard::class, 'examination_id');
    }

    public function school()
    {
        return $this->belongsTo(School::class, 'school_id');
    }
}
