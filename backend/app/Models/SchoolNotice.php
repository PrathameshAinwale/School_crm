<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolNotice extends Model
{
    use HasFactory, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'title',
        'category',
        'priority',
        'sender',
        'publish_date',
        'content',
        'attachment_name',
        'attachment_url',
    ];

    protected $casts = [
        'publish_date' => 'date',
    ];
}
