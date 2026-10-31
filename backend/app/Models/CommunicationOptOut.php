<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommunicationOptOut extends Model
{
    use HasFactory, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'phone_or_email',
        'channel',
        'reason',
    ];
}

