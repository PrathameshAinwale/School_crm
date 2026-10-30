<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeeRefund extends Model
{
    use HasFactory, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'student_id',
        'academic_year_id',
        'original_payment_id',
        'refund_number',
        'refund_amount',
        'refund_type',
        'reason',
        'status',
        'requested_by_user_id',
        'approved_by_user_id',
        'approved_at',
        'disbursement_reference',
        'disbursement_date',
        'admin_remarks',
    ];

    protected $casts = [
        'refund_amount' => 'decimal:2',
        'approved_at' => 'datetime',
        'disbursement_date' => 'date',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function originalPayment()
    {
        return $this->belongsTo(FeePayment::class, 'original_payment_id');
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by_user_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }
}

