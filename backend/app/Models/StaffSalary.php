<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffSalary extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'employee_id',
        'name',
        'role',
        'department',
        'month',
        'base_salary',
        'working_days',
        'days_present',
        'paid_leaves',
        'unpaid_leaves',
        'hra',
        'da',
        'special_allowance',
        'pf_deduction',
        'tds_deduction',
        'unpaid_leave_deduction',
        'gross_salary',
        'net_salary',
        'status',
        'disbursed_at',
        'account_no',
        'bank_name',
    ];

    protected $casts = [
        'base_salary' => 'decimal:2',
        'hra' => 'decimal:2',
        'da' => 'decimal:2',
        'special_allowance' => 'decimal:2',
        'pf_deduction' => 'decimal:2',
        'tds_deduction' => 'decimal:2',
        'unpaid_leave_deduction' => 'decimal:2',
        'gross_salary' => 'decimal:2',
        'net_salary' => 'decimal:2',
        'disbursed_at' => 'datetime',
    ];

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }
}
