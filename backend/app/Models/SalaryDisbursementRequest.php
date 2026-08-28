<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalaryDisbursementRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'batch_code',
        'month',
        'total_staff_count',
        'total_gross_amount',
        'total_deductions',
        'total_net_amount',
        'status',
        'requested_by_user_id',
        'actioned_by_user_id',
        'payment_reference',
        'payout_mode',
        'accounts_notes',
        'disbursed_at',
    ];

    protected $casts = [
        'total_gross_amount' => 'decimal:2',
        'total_deductions' => 'decimal:2',
        'total_net_amount' => 'decimal:2',
        'disbursed_at' => 'datetime',
    ];

    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by_user_id');
    }

    public function actionedBy()
    {
        return $this->belongsTo(User::class, 'actioned_by_user_id');
    }

    public function salaries()
    {
        return $this->hasMany(StaffSalary::class, 'disbursement_request_id');
    }
}
