<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    use HasFactory;

    protected $table = 'feedbacks';

    protected $fillable = [
        'user_id',
        'student_id',
        'subject',
        'teacher_name',
        'rating',
        'category_ratings',
        'comment',
        'admin_response',
    ];

    protected $casts = [
        'rating' => 'float',
        'category_ratings' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
