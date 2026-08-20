<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolNotice extends Model
{
    use HasFactory;

    protected $fillable = [
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
