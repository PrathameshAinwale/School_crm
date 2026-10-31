<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeePayment extends Model
{
    use HasFactory, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'student_id',
        'academic_year_id',
        'receipt_number',
        'idempotency_key',
        'amount_paid',
        'payment_date',
        'payment_mode',
        'reference_number',
        'cheque_date',
        'bank_name',
        'cheque_status',
        'cheque_cleared_at',
        'cheque_bounced_at',
        'bounce_fee',
        'is_backdated',
        'backdated_approved_by_user_id',
        'status',
        'source',
        'provider',
        'provider_order_id',
        'provider_payment_id',
        'collected_by_user_id',
        'voided_at',
        'voided_by_user_id',
        'void_reason',
        'remarks',
    ];

    protected $casts = [
        'amount_paid' => 'decimal:2',
        'bounce_fee' => 'decimal:2',
        'payment_date' => 'date',
        'cheque_date' => 'date',
        'is_backdated' => 'boolean',
        'cheque_cleared_at' => 'datetime',
        'cheque_bounced_at' => 'datetime',
        'voided_at' => 'datetime',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function collector()
    {
        return $this->belongsTo(User::class, 'collected_by_user_id');
    }

    public function voider()
    {
        return $this->belongsTo(User::class, 'voided_by_user_id');
    }

    public function allocations()
    {
        return $this->hasMany(FeePaymentAllocation::class);
    }

    public function refunds()
    {
        return $this->hasMany(FeeRefund::class, 'original_payment_id');
    }
}

