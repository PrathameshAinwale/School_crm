<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GradingScale extends Model
{
    use HasFactory, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'name',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function tiers()
    {
        return $this->hasMany(GradingScaleTier::class, 'grading_scale_id')->orderBy('order_seq')->orderByDesc('min_percentage');
    }

    public function examTerms()
    {
        return $this->hasMany(ExamTerm::class, 'grading_scale_id');
    }
}
