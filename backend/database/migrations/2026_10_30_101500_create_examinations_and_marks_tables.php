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
        // 1. Examinations Table
        if (!Schema::hasTable('examinations')) {
            Schema::create('examinations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->nullable()->constrained('schools')->onDelete('cascade');
                $table->string('academic_year')->default('2024-2025'); // e.g. 2024-2025, 2025-2026
                $table->string('name'); // e.g. "Half-Yearly Summative Assessment (SA-1)"
                $table->string('code')->nullable(); // e.g. "SA-1", "MID-TERM", "ANNUAL"
                $table->string('term')->default('Term 1'); // Term 1, Term 2, Annual
                $table->date('start_date')->nullable();
                $table->date('end_date')->nullable();
                $table->decimal('max_marks_default', 5, 2)->default(100);
                $table->decimal('passing_marks_default', 5, 2)->default(35);
                $table->string('status')->default('Completed'); // Scheduled, In Progress, Completed, Published
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }

        // 2. Exam Marks Table
        if (!Schema::hasTable('exam_marks')) {
            Schema::create('exam_marks', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->nullable()->constrained('schools')->onDelete('cascade');
                $table->foreignId('examination_id')->constrained('examinations')->onDelete('cascade');
                $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
                $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
                $table->decimal('theory_marks', 5, 2)->default(0);
                $table->decimal('practical_marks', 5, 2)->default(0);
                $table->decimal('marks_obtained', 5, 2);
                $table->decimal('max_marks', 5, 2)->default(100);
                $table->decimal('passing_marks', 5, 2)->default(35);
                $table->string('grade', 10)->nullable(); // A+, A, B+, B, C, D, E
                $table->string('remarks')->nullable(); // Outstanding, Very Good, Good, etc.
                $table->timestamps();

                $table->unique(['examination_id', 'student_id', 'subject_id'], 'exam_student_subject_unique');
            });
        }

        // 3. Report Cards Summary & Cache Table
        if (!Schema::hasTable('report_cards')) {
            Schema::create('report_cards', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->nullable()->constrained('schools')->onDelete('cascade');
                $table->foreignId('examination_id')->constrained('examinations')->onDelete('cascade');
                $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
                $table->string('academic_year')->default('2024-2025');
                $table->decimal('total_max_marks', 6, 2)->default(600);
                $table->decimal('total_marks_obtained', 6, 2)->default(0);
                $table->decimal('percentage', 5, 2)->default(0);
                $table->string('overall_grade', 10)->default('A');
                $table->string('result_status')->default('PASSED'); // PASSED, DISTINCTION, FAILED, COMPARTMENT
                $table->unsignedInteger('class_rank')->nullable();
                $table->unsignedInteger('division_rank')->nullable();
                $table->unsignedInteger('total_working_days')->default(100);
                $table->unsignedInteger('present_days')->default(90);
                $table->decimal('attendance_percentage', 5, 2)->default(90);
                $table->text('teacher_remarks')->nullable();
                $table->text('principal_remarks')->nullable();
                $table->string('pdf_filename')->nullable();
                $table->timestamps();

                $table->unique(['examination_id', 'student_id'], 'exam_student_report_unique');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_cards');
        Schema::dropIfExists('exam_marks');
        Schema::dropIfExists('examinations');
    }
};
