<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Create schools (tenants) table
        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. "Delhi Public Academy", "St. Xavier International School"
            $table->string('code')->unique(); // e.g. "DPS-101", "STX-102"
            $table->string('slug')->unique(); // e.g. "delhi-public", "st-xavier"
            $table->string('affiliation')->nullable()->default('CBSE'); // CBSE, ICSE, IB, State Board
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('pincode')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('principal_name')->nullable();
            $table->string('subscription_plan')->default('Enterprise'); // Trial, Standard, Pro, Enterprise
            $table->string('subscription_status')->default('active'); // active, trial, suspended, expired
            $table->date('subscription_expires_at')->nullable();
            $table->unsignedInteger('max_students')->default(3000);
            $table->unsignedInteger('max_staff')->default(100);
            $table->string('status')->default('active'); // active, inactive, suspended
            $table->timestamps();
        });

        // 2. Add school_id to all tenant tables
        $tables = [
            'users',
            'teachers',
            'students',
            'school_classes',
            'sections',
            'subjects',
            'attendances',
            'student_attendances',
            'staff_attendances',
            'admissions',
            'vehicles',
            'resources',
            'resource_requests',
            'assignments',
            'assignment_submissions',
            'notifications',
            'leave_applications',
            'student_fees',
            'feedbacks',
            'ptm_appointments',
            'study_materials',
            'timetables',
            'syllabuses',
            'school_calendar_events',
            'school_notices',
            'staff_salaries',
            'faculty_trainings',
            'school_expenses',
            'salary_disbursement_requests',
        ];

        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName)) {
                Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                    if (!Schema::hasColumn($tableName, 'school_id')) {
                        $table->foreignId('school_id')->nullable()->constrained('schools')->onDelete('cascade');
                    }
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = [
            'salary_disbursement_requests',
            'school_expenses',
            'faculty_trainings',
            'staff_salaries',
            'school_notices',
            'school_calendar_events',
            'syllabuses',
            'timetables',
            'study_materials',
            'ptm_appointments',
            'feedbacks',
            'student_fees',
            'leave_applications',
            'notifications',
            'assignment_submissions',
            'assignments',
            'resource_requests',
            'resources',
            'vehicles',
            'admissions',
            'staff_attendances',
            'student_attendances',
            'attendances',
            'subjects',
            'sections',
            'school_classes',
            'students',
            'teachers',
            'users',
        ];

        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'school_id')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->dropConstrainedForeignId('school_id');
                });
            }
        }

        Schema::dropIfExists('schools');
    }
};
