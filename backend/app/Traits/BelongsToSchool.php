<?php

namespace App\Traits;

use App\Models\School;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

trait BelongsToSchool
{
    /**
     * Boot the BelongsToSchool trait.
     */
    protected static function bootBelongsToSchool(): void
    {
        // Automatically set school_id on creating model if not explicitly provided
        static::creating(function ($model) {
            if (!$model->school_id && Auth::check() && Auth::user()->school_id) {
                $model->school_id = Auth::user()->school_id;
            }
        });

        // Global scope to filter by tenant's school_id
        static::addGlobalScope('school', function (Builder $builder) {
            if (Auth::check()) {
                $user = Auth::user();
                // If user is super_admin or user has no school_id, do not restrict globally
                if ($user->role !== 'super_admin' && $user->school_id) {
                    $builder->where($builder->getModel()->getTable() . '.school_id', $user->school_id);
                }
            }
        });
    }

    /**
     * Relationship to the school tenant.
     */
    public function school()
    {
        return $this->belongsTo(School::class);
    }
}
