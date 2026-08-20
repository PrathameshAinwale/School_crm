<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudyMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'school_class_id',
        'class_name',
        'subject',
        'title',
        'type',
        'file_size',
        'file_url',
        'uploader_name',
        'publish_date',
        'downloads_count',
        'description',
    ];

    protected $casts = [
        'publish_date' => 'date',
        'downloads_count' => 'integer',
    ];

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class);
    }
}
