<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BookIssue extends Model
{
    use HasFactory, SoftDeletes, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'book_id',
        'borrower_type',
        'borrower_id',
        'borrower_name',
        'borrower_identifier',
        'borrower_contact',
        'borrower_class',
        'issue_date',
        'due_date',
        'return_date',
        'status',
        'fine_amount',
        'fine_status',
        'notes',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'due_date' => 'date',
        'return_date' => 'date',
        'fine_amount' => 'decimal:2',
    ];

    public function book()
    {
        return $this->belongsTo(Book::class);
    }
}
