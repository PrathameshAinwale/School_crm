<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolExpense extends Model
{
    use HasFactory, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'expense_code',
        'title',
        'category',
        'amount',
        'expense_date',
        'payment_mode',
        'vendor_name',
        'invoice_number',
        'status',
        'notes',
        'recorded_by_user_id',
        'resource_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'expense_date' => 'date',
    ];

    public function school()
    {
        return $this->belongsTo(School::class, 'school_id');
    }

    public function recordedBy()
    {
        return $this->belongsTo(User::class, 'recorded_by_user_id');
    }

    public function resource()
    {
        return $this->belongsTo(Resource::class, 'resource_id');
    }
}
