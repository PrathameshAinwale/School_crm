<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CommunicationTemplate extends Model
{
    use HasFactory, SoftDeletes, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'name',
        'code',
        'channel',
        'message_category',
        'template_scope',
        'subject',
        'content',
        'variables',
        'dlt_template_id',
        'dlt_header',
        'whatsapp_template_name',
        'whatsapp_language',
        'meta_variable_mapping',
        'is_active',
    ];

    protected $casts = [
        'variables' => 'array',
        'meta_variable_mapping' => 'array',
        'is_active' => 'boolean',
    ];

    public function campaigns()
    {
        return $this->hasMany(CommunicationCampaign::class, 'template_id');
    }
}

