<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommunicationLog extends Model
{
    use HasFactory, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'campaign_id',
        'recipient_user_id',
        'recipient_student_id',
        'channel',
        'message_category',
        'recipient_name',
        'recipient_phone',
        'recipient_email',
        'recipient_device_token',
        'message_body',
        'provider',
        'provider_message_id',
        'status',
        'error_message',
        'sent_at',
        'delivered_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function campaign()
    {
        return $this->belongsTo(CommunicationCampaign::class, 'campaign_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'recipient_user_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'recipient_student_id');
    }
}

