<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sport extends Model
{
    use HasFactory, SoftDeletes, BelongsToSchool;

    protected $table = 'sports';

    protected $fillable = [
        'school_id',
        'code',
        'name',
        'category',
        'coach_name',
        'venue',
        'max_players',
        'description',
        'status',
    ];

    public function competitions()
    {
        return $this->hasMany(SportsCompetition::class, 'sport_id');
    }

    public function participants()
    {
        return $this->hasMany(SportsParticipant::class, 'sport_id');
    }
}
