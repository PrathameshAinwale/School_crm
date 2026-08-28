<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeeStructure extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'school_class_id',
        'academic_year',
        'tuition_fee',
        'transport_fee',
        'lab_library_fee',
        'activity_fee',
        'other_fee',
        'total_annual_fee',
        'installments_count',
        'notes',
    ];

    protected $casts = [
        'tuition_fee' => 'decimal:2',
        'transport_fee' => 'decimal:2',
        'lab_library_fee' => 'decimal:2',
        'activity_fee' => 'decimal:2',
        'other_fee' => 'decimal:2',
        'total_annual_fee' => 'decimal:2',
        'installments_count' => 'integer',
    ];

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'school_class_id');
    }

    public function installments()
    {
        return $this->hasMany(FeeStructureInstallment::class, 'fee_structure_id')->orderBy('due_date', 'asc');
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}
