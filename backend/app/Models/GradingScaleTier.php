<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GradingScaleTier extends Model
{
    use HasFactory;

    protected $fillable = [
        'grading_scale_id',
        'grade',
        'min_percentage',
        'max_percentage',
        'grade_point',
        'description',
        'order_seq',
    ];

    protected $casts = [
        'min_percentage' => 'decimal:2',
        'max_percentage' => 'decimal:2',
        'grade_point' => 'decimal:2',
        'order_seq' => 'integer',
    ];

    public function gradingScale()
    {
        return $this->belongsTo(GradingScale::class, 'grading_scale_id');
    }
}
