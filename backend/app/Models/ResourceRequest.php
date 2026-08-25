<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ResourceRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'resource_id',
        'teacher_id',
        'user_id',
        'title',
        'issue_type',
        'severity',
        'affected_quantity',
        'description',
        'photo_url',
        'photo_name',
        'status',
        'admin_remarks',
        'actioned_by_user_id',
        'actioned_at',
    ];

    protected $casts = [
        'actioned_at' => 'datetime',
    ];

    public function resource()
    {
        return $this->belongsTo(Resource::class, 'resource_id');
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function actionedBy()
    {
        return $this->belongsTo(User::class, 'actioned_by_user_id');
    }
}
