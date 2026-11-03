<?php

namespace App\Providers;

use App\Models\AcademicYear;
use App\Models\CommunicationCampaign;
use App\Models\FeeStructure;
use App\Models\SchoolSetting;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use App\Observers\AuditObserver;
use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use App\Support\QueryHelper;

// Global helper for escaping LIKE wildcards
if (!function_exists('escape_like')) {
    function escape_like(?string $value): string
    {
        return QueryHelper::escapeLike($value);
    }
}

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Macro for safe LIKE searches
        EloquentBuilder::macro('whereEscapedLike', function (string $column, ?string $value) {
            /** @var EloquentBuilder $this */
            $escaped = QueryHelper::escapeLike($value);
            return $this->where($column, 'like', "%{$escaped}%");
        });

        EloquentBuilder::macro('orWhereEscapedLike', function (string $column, ?string $value) {
            /** @var EloquentBuilder $this */
            $escaped = QueryHelper::escapeLike($value);
            return $this->orWhere($column, 'like', "%{$escaped}%");
        });
        // --- Centralized Rate Limiters ---

        // 1. Strict Login Rate Limiter (per-email+IP and per-IP fallback for school NAT)
        RateLimiter::for('login', function (Request $request) {
            $identifier = strtolower((string) ($request->input('email') ?: $request->input('identifier') ?: ''));
            $ip = $request->ip();

            return [
                Limit::perMinute(5)
                    ->by("login:{$identifier}|{$ip}")
                    ->response(function (Request $request, array $headers) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Too many login attempts. Please try again in ' . ($headers['Retry-After'] ?? 60) . ' seconds.',
                        ], 429, $headers);
                    }),
                Limit::perMinute(30)
                    ->by("login_ip:{$ip}")
                    ->response(function (Request $request, array $headers) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Too many login attempts from this network. Please try again in ' . ($headers['Retry-After'] ?? 60) . ' seconds.',
                        ], 429, $headers);
                    }),
            ];
        });

        // 2. Authenticated Global API Rate Limiter (Keyed by User ID, generous 120/min)
        RateLimiter::for('api', function (Request $request) {
            $userId = $request->user()?->id ?: $request->ip();

            return Limit::perMinute(120)
                ->by("api:{$userId}")
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Rate limit exceeded. Please wait ' . ($headers['Retry-After'] ?? 60) . ' seconds before trying again.',
                    ], 429, $headers);
                });
        });

        // 3. High-throughput Telemetry & Live Tracking Rate Limiter (180/min)
        RateLimiter::for('tracking', function (Request $request) {
            $userId = $request->user()?->id ?: $request->ip();

            return Limit::perMinute(180)
                ->by("tracking:{$userId}")
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Telemetry rate limit reached. Retry in ' . ($headers['Retry-After'] ?? 10) . ' seconds.',
                    ], 429, $headers);
                });
        });

        // Attach audit observers only to approved models
        Student::observe(AuditObserver::class);
        Teacher::observe(AuditObserver::class);
        User::observe(AuditObserver::class);
        FeeStructure::observe(AuditObserver::class);
        SchoolSetting::observe(AuditObserver::class);
        AcademicYear::observe(AuditObserver::class);
        CommunicationCampaign::observe(AuditObserver::class);
        \App\Models\FeePayment::observe(AuditObserver::class);
        \App\Models\FeePaymentAllocation::observe(AuditObserver::class);
        \App\Models\FeeRefund::observe(AuditObserver::class);
        \App\Models\StudentFeeConcession::observe(AuditObserver::class);
        \App\Models\FeeConcessionType::observe(AuditObserver::class);
        \App\Models\FeeLedger::observe(AuditObserver::class);
        \App\Models\ReceiptSequence::observe(AuditObserver::class);
        \App\Models\GradingScale::observe(AuditObserver::class);
        \App\Models\GradingScaleTier::observe(AuditObserver::class);
        \App\Models\ClassTeacherAllocation::observe(AuditObserver::class);
        \App\Models\TeacherSubjectAssignment::observe(AuditObserver::class);
        \App\Models\StudentSubjectEnrollment::observe(AuditObserver::class);
        \App\Models\ExamTerm::observe(AuditObserver::class);
        \App\Models\Exam::observe(AuditObserver::class);
        \App\Models\ExamMark::observe(AuditObserver::class);
        \App\Models\ExamScore::observe(AuditObserver::class);
        \App\Models\StudentReportSummary::observe(AuditObserver::class);
    }
}
