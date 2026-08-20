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
        // 1. Staff Salaries & Payroll
        Schema::create('staff_salaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->nullable()->constrained('teachers')->onDelete('cascade');
            $table->string('employee_id')->default('EMP-101');
            $table->string('name');
            $table->string('role')->default('Faculty Staff');
            $table->string('department')->default('Teaching');
            $table->string('month')->default('August 2026');
            $table->decimal('base_salary', 10, 2)->default(50000.00);
            $table->unsignedInteger('working_days')->default(26);
            $table->unsignedInteger('days_present')->default(25);
            $table->unsignedInteger('paid_leaves')->default(1);
            $table->unsignedInteger('unpaid_leaves')->default(0);
            $table->decimal('hra', 10, 2)->default(10000.00);
            $table->decimal('da', 10, 2)->default(7000.00);
            $table->decimal('special_allowance', 10, 2)->default(4000.00);
            $table->decimal('pf_deduction', 10, 2)->default(4000.00);
            $table->decimal('tds_deduction', 10, 2)->default(3000.00);
            $table->decimal('unpaid_leave_deduction', 10, 2)->default(0.00);
            $table->decimal('gross_salary', 10, 2)->default(71000.00);
            $table->decimal('net_salary', 10, 2)->default(64000.00);
            $table->string('status')->default('Disbursed'); // Disbursed, Processed, Draft, Pending
            $table->timestamp('disbursed_at')->nullable();
            $table->string('account_no')->default('•••• •••• 4589');
            $table->string('bank_name')->default('HDFC Bank');
            $table->timestamps();
        });

        // 2. Faculty Trainings & Professional Development
        Schema::create('faculty_trainings', function (Blueprint $table) {
            $table->id();
            $table->string('training_id')->unique(); // "TRN-101"
            $table->string('title');
            $table->string('category')->default('Pedagogy'); // Pedagogy, Technology & AI, Assessment, Classroom Management
            $table->string('trainer_name');
            $table->date('date');
            $table->string('time_slot')->default('09:00 AM - 01:30 PM');
            $table->string('venue')->default('Main Auditorium');
            $table->string('target_audience')->default('All Teaching Faculty');
            $table->unsignedInteger('enrolled_count')->default(24);
            $table->unsignedInteger('attendance_rate')->default(90);
            $table->string('status')->default('Scheduled'); // Scheduled, Ongoing, Completed
            $table->text('description')->nullable();
            $table->string('materials_url')->nullable();
            $table->string('coordinator')->nullable();
            $table->json('enrolled_teachers')->nullable(); // List of teacher IDs or names
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faculty_trainings');
        Schema::dropIfExists('staff_salaries');
    }
};
