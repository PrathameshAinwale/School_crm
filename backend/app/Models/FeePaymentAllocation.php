<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeePaymentAllocation extends Model
{
    use HasFactory, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'fee_payment_id',
        'student_fee_id',
        'principal_amount',
        'fine_amount',
        'is_advance_credit',
    ];

    protected $casts = [
        'principal_amount' => 'decimal:2',
        'fine_amount' => 'decimal:2',
        'is_advance_credit' => 'boolean',
    ];

    public function payment()
    {
        return $this->belongsTo(FeePayment::class, 'fee_payment_id');
    }

    public function studentFee()
    {
        return $this->belongsTo(StudentFee::class, 'student_fee_id');
    }
}

