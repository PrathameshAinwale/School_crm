<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CommunicationCampaign extends Model
{
    use HasFactory, SoftDeletes, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'created_by_user_id',
        'template_id',
        'title',
        'channel',
        'message_category',
        'subject',
        'message_body',
        'audience_type',
        'audience_filters',
        'is_circular',
        'allow_partial_cap',
        'status',
        'is_test_mode',
        'test_recipients',
        'scheduled_at',
        'total_recipients',
        'sent_count',
        'delivered_count',
        'failed_count',
        'skipped_count',
    ];

    protected $casts = [
        'audience_filters' => 'array',
        'test_recipients' => 'array',
        'is_test_mode' => 'boolean',
        'is_circular' => 'boolean',
        'allow_partial_cap' => 'boolean',
        'scheduled_at' => 'datetime',
        'total_recipients' => 'integer',
        'sent_count' => 'integer',
        'delivered_count' => 'integer',
        'failed_count' => 'integer',
        'skipped_count' => 'integer',
    ];

    public function template()
    {
        return $this->belongsTo(CommunicationTemplate::class, 'template_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function logs()
    {
        return $this->hasMany(CommunicationLog::class, 'campaign_id');
    }
}

