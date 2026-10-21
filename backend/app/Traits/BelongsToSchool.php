<?php

namespace App\Traits;

use App\Models\School;
use App\Services\SchoolContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

trait BelongsToSchool
{
    /**
     * Boot the BelongsToSchool trait with global tenant scoping.
     */
    protected static function bootBelongsToSchool(): void
    {
        // Automatically set school_id on creating model if not explicitly provided
        static::creating(function ($model) {
            if (!$model->school_id) {
                $activeId = SchoolContext::getActiveSchoolId();
                if ($activeId) {
                    $model->school_id = $activeId;
                } elseif (Auth::check() && Auth::user()->school_id) {
                    $model->school_id = Auth::user()->school_id;
                }
            }
        });

        // Global scope to filter by resolved active school branch
        static::addGlobalScope('school', function (Builder $builder) {
            $activeId = SchoolContext::getActiveSchoolId();

            if (Auth::check()) {
                $user = Auth::user();

                if ($user->role === 'super_admin') {
                    // Super Admin only scopes if an explicit active school header is selected
                    if ($activeId) {
                        $builder->where($builder->getModel()->getTable() . '.school_id', $activeId);
                    }
                } else {
                    $targetId = $activeId ?: $user->school_id;
                    if ($targetId) {
                        $builder->where($builder->getModel()->getTable() . '.school_id', $targetId);
                    }
                }
            } elseif ($activeId) {
                $builder->where($builder->getModel()->getTable() . '.school_id', $activeId);
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
