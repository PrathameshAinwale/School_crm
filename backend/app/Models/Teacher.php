<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Teacher extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'teacher_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'gender',
        'blood_group',
        'date_of_birth',
        'joining_date',
        'department',
        'qualification',
        'experience',
        'salary',
        'allowance',
        'assigned_subjects',
        'assigned_classes',
        'class_teacher_class',
        'class_teacher_division',
        'address',
        'emergency_contact',
        'status',
    ];

    protected $casts = [
        'assigned_subjects' => 'array',
        'assigned_classes' => 'array',
        'salary' => 'decimal:2',
        'allowance' => 'decimal:2',
        'date_of_birth' => 'date',
        'joining_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function attendances()
    {
        return $this->hasMany(StaffAttendance::class, 'teacher_id');
    }

    public function assignedResources()
    {
        return $this->hasMany(Resource::class, 'assigned_teacher_id');
    }

    public function resourceRequests()
    {
        return $this->hasMany(ResourceRequest::class, 'teacher_id');
    }

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }
}
