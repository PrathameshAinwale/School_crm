<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MediaFile extends Model
{
    use HasFactory, SoftDeletes, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'user_id',
        'file_token',
        'original_name',
        'stored_name',
        'file_path',
        'file_size',
        'mime_type',
        'disk',
        'visibility',
        'document_type',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Determine if file is publicly readable without authentication.
     */
    public function isPublic(): bool
    {
        return $this->visibility === 'public';
    }
}

