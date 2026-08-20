<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffAttendance extends Model
{
    use HasFactory;

    protected $table = 'staff_attendances';

    protected $fillable = [
        'date',
        'teacher_id',
        'status', // Present, Absent, Late, Half Day, Leave, On Duty
        'check_in_time',
        'check_out_time',
        'remarks',
        'marked_by',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }

    public function markedByUser()
    {
        return $this->belongsTo(User::class, 'marked_by');
    }
}
