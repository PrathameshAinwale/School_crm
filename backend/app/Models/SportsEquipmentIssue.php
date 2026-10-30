<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SportsEquipmentIssue extends Model
{
    use HasFactory, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'equipment_id',
        'student_id',
        'borrower_name',
        'borrower_role',
        'quantity',
        'issue_date',
        'expected_return_date',
        'return_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'issue_date' => 'date',
        'expected_return_date' => 'date',
        'return_date' => 'date',
    ];

    public function equipment()
    {
        return $this->belongsTo(SportsEquipment::class, 'equipment_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }
}
