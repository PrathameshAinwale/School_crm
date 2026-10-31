<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SportsCompetition extends Model
{
    use HasFactory, SoftDeletes, BelongsToSchool;

    protected $table = 'sports_competitions';

    protected $fillable = [
        'school_id',
        'sport_id',
        'title',
        'competition_type',
        'tournament_level',
        'start_date',
        'end_date',
        'event_time',
        'venue',
        'opponent_school',
        'status',
        'result',
        'score_summary',
        'remarks',
        'created_by_user_id',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function sport()
    {
        return $this->belongsTo(Sport::class, 'sport_id');
    }

    public function participants()
    {
        return $this->hasMany(SportsParticipant::class, 'competition_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
}
