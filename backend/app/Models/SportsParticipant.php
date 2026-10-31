<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SportsParticipant extends Model
{
    use HasFactory, BelongsToSchool;

    protected $table = 'sports_participants';

    protected $fillable = [
        'school_id',
        'competition_id',
        'sport_id',
        'student_id',
        'jersey_number',
        'role',
        'attendance_status',
        'achievement',
        'performance_notes',
        'enrolled_date',
    ];

    protected $casts = [
        'enrolled_date' => 'date',
    ];

    public function competition()
    {
        return $this->belongsTo(SportsCompetition::class, 'competition_id');
    }

    public function sport()
    {
        return $this->belongsTo(Sport::class, 'sport_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }
}
