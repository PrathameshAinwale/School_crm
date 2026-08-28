<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class School extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'slug',
        'affiliation',
        'address',
        'city',
        'state',
        'pincode',
        'phone',
        'email',
        'website',
        'logo_url',
        'principal_name',
        'subscription_plan',
        'subscription_status',
        'subscription_expires_at',
        'max_students',
        'max_staff',
        'status',
    ];

    protected $casts = [
        'subscription_expires_at' => 'date',
        'max_students' => 'integer',
        'max_staff' => 'integer',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function adminUser()
    {
        return $this->hasOne(User::class)->where('role', 'admin');
    }

    public function students()
    {
        return $this->hasMany(Student::class);
    }

    public function teachers()
    {
        return $this->hasMany(Teacher::class);
    }

    public function schoolClasses()
    {
        return $this->hasMany(SchoolClass::class);
    }

    public function expenses()
    {
        return $this->hasMany(SchoolExpense::class);
    }

    public function disbursementRequests()
    {
        return $this->hasMany(SalaryDisbursementRequest::class);
    }
}
