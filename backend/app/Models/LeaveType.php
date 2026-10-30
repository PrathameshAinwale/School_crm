<?php

namespace App\Models;

use App\Services\SchoolContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class LeaveType extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'school_id',
        'name',
        'code',
        'total_days',
        'description',
        'color',
        'is_active',
        'requires_attachment',
    ];

    protected $casts = [
        'total_days' => 'integer',
        'is_active' => 'boolean',
        'requires_attachment' => 'boolean',
    ];

    /**
     * Boot model with global tenant scope that supports both tenant-specific and global default leave types.
     */
    protected static function booted(): void
    {
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

        static::addGlobalScope('school_or_global', function (Builder $builder) {
            $activeId = SchoolContext::getActiveSchoolId();

            if (Auth::check()) {
                $user = Auth::user();
                if ($user->role === 'super_admin') {
                    if ($activeId) {
                        $builder->where(function ($q) use ($builder, $activeId) {
                            $table = $builder->getModel()->getTable();
                            $q->where($table . '.school_id', $activeId)
                              ->orWhereNull($table . '.school_id');
                        });
                    }
                } else {
                    $targetId = $activeId ?: $user->school_id;
                    if ($targetId) {
                        $builder->where(function ($q) use ($builder, $targetId) {
                            $table = $builder->getModel()->getTable();
                            $q->where($table . '.school_id', $targetId)
                              ->orWhereNull($table . '.school_id');
                        });
                    }
                }
            } elseif ($activeId) {
                $builder->where(function ($q) use ($builder, $activeId) {
                    $table = $builder->getModel()->getTable();
                    $q->where($table . '.school_id', $activeId)
                      ->orWhereNull($table . '.school_id');
                });
            }
        });
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Map color name to Tailwind CSS styling tokens
     */
    public function getStyleAttribute()
    {
        $color = strtolower($this->color ?: 'amber');
        $styles = [
            'amber' => ['color' => 'text-amber-600', 'bg' => 'bg-amber-50', 'bar' => 'bg-amber-500', 'border' => 'border-amber-200', 'badge' => 'bg-amber-100 text-amber-800'],
            'rose' => ['color' => 'text-rose-600', 'bg' => 'bg-rose-50', 'bar' => 'bg-rose-500', 'border' => 'border-rose-200', 'badge' => 'bg-rose-100 text-rose-800'],
            'purple' => ['color' => 'text-purple-600', 'bg' => 'bg-purple-50', 'bar' => 'bg-purple-500', 'border' => 'border-purple-200', 'badge' => 'bg-purple-100 text-purple-800'],
            'emerald' => ['color' => 'text-emerald-600', 'bg' => 'bg-emerald-50', 'bar' => 'bg-emerald-500', 'border' => 'border-emerald-200', 'badge' => 'bg-emerald-100 text-emerald-800'],
            'blue' => ['color' => 'text-blue-600', 'bg' => 'bg-blue-50', 'bar' => 'bg-blue-500', 'border' => 'border-blue-200', 'badge' => 'bg-blue-100 text-blue-800'],
            'indigo' => ['color' => 'text-indigo-600', 'bg' => 'bg-indigo-50', 'bar' => 'bg-indigo-500', 'border' => 'border-indigo-200', 'badge' => 'bg-indigo-100 text-indigo-800'],
            'cyan' => ['color' => 'text-cyan-600', 'bg' => 'bg-cyan-50', 'bar' => 'bg-cyan-500', 'border' => 'border-cyan-200', 'badge' => 'bg-cyan-100 text-cyan-800'],
        ];

        return $styles[$color] ?? $styles['amber'];
    }
}
