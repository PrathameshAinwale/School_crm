<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentFee extends Model
{
    use HasFactory, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'student_id',
        'term_name',
        'amount',
        'concession_amount',
        'fine_amount',
        'fine_waived_amount',
        'fine_paid_amount',
        'net_amount',
        'paid_amount',
        'due_date',
        'status',
        'paid_date',
        'transaction_id',
        'payment_mode',
        'receipt_number',
        'fine_calculated_at',
        'tax_deductible',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'concession_amount' => 'decimal:2',
        'fine_amount' => 'decimal:2',
        'fine_waived_amount' => 'decimal:2',
        'fine_paid_amount' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'due_date' => 'date',
        'paid_date' => 'date',
        'fine_calculated_at' => 'date',
        'tax_deductible' => 'boolean',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function allocations()
    {
        return $this->hasMany(FeePaymentAllocation::class);
    }
}
