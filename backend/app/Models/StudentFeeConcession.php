<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentFeeConcession extends Model
{
    use HasFactory, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'student_id',
        'fee_concession_type_id',
        'academic_year_id',
        'calculated_discount_amount',
        'approval_status',
        'requested_by_user_id',
        'approved_by_user_id',
        'approved_at',
        'revoked_by_user_id',
        'revoked_at',
        'revoke_reason',
        'remarks',
    ];

    protected $casts = [
        'calculated_discount_amount' => 'decimal:2',
        'approved_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    public function concessionType()
    {
        return $this->belongsTo(FeeConcessionType::class, 'fee_concession_type_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }

    public function revoker()
    {
        return $this->belongsTo(User::class, 'revoked_by_user_id');
    }
}

