<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Book extends Model
{
    use HasFactory, SoftDeletes, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'book_code',
        'title',
        'author',
        'isbn',
        'category',
        'publisher',
        'edition_year',
        'shelf_location',
        'total_copies',
        'available_copies',
        'status',
        'description',
    ];

    protected $casts = [
        'total_copies' => 'integer',
        'available_copies' => 'integer',
    ];

    public function issues()
    {
        return $this->hasMany(BookIssue::class);
    }
}
