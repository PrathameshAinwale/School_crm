<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeeStructureInstallment extends Model
{
    use HasFactory;

    protected $fillable = [
        'fee_structure_id',
        'term_name',
        'amount',
        'due_date',
        'late_fee_per_day',
        'description',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'due_date' => 'date',
        'late_fee_per_day' => 'decimal:2',
    ];

    public function feeStructure()
    {
        return $this->belongsTo(FeeStructure::class, 'fee_structure_id');
    }
}
