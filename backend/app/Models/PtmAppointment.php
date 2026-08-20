<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PtmAppointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'user_id',
        'term_title',
        'meeting_date',
        'time_slot',
        'venue',
        'teacher_name',
        'status',
        'agenda_notes',
        'discussion_summary',
        'key_decisions',
    ];

    protected $casts = [
        'meeting_date' => 'date',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
