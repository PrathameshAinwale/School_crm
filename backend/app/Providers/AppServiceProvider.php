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
        \App\Models\StudentReportSummary::observe(AuditObserver::class);
    }
}
