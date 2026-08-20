<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentFee extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'term_name',
        'amount',
        'due_date',
        'status',
        'paid_date',
        'transaction_id',
        'payment_mode',
        'receipt_number',
        'tax_deductible',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'due_date' => 'date',
        'paid_date' => 'date',
        'tax_deductible' => 'boolean',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
