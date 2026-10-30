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
        // 1. Grading Scales (Header)
        Schema::create('grading_scales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->restrictOnDelete();
            $table->string('name'); // e.g. "CBSE Secondary 9-Point Scale"
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['school_id', 'name']);
        });

        // 2. Grading Scale Tiers (Bands covering 0.00% to 100.00% without gaps or overlaps)
        Schema::create('grading_scale_tiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grading_scale_id')->constrained('grading_scales')->restrictOnDelete();
            $table->string('grade', 10); // A1, A2, B1, B2, C1, C2, D, E
            $table->decimal('min_percentage', 5, 2); // 91.00
            $table->decimal('max_percentage', 5, 2); // 100.00
            $table->decimal('grade_point', 4, 2); // 10.00
            $table->string('description')->nullable(); // "Outstanding", "Excellent"
            $table->integer('order_seq')->default(0);
            $table->timestamps();

            $table->unique(['grading_scale_id', 'grade']);
            $table->index(['grading_scale_id', 'min_percentage', 'max_percentage']);
        });

        // 3. Class Teacher Allocations (Designated Class Teacher per Section and Academic Year)
        Schema::create('class_teacher_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->restrictOnDelete();
            $table->foreignId('academic_year_id')->constrained('academic_years')->restrictOnDelete();
            $table->foreignId('school_class_id')->constrained('school_classes')->restrictOnDelete();
            $table->foreignId('section_id')->constrained('sections')->restrictOnDelete();
            $table->foreignId('teacher_id')->constrained('teachers')->restrictOnDelete();
            $table->timestamps();

            $table->unique(
                ['school_id', 'academic_year_id', 'school_class_id', 'section_id'],
                'uq_class_teacher_section'
            );
        });

        // 4. Teacher Subject Assignments (Authorization source for subject marks entry)
        Schema::create('teacher_subject_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->restrictOnDelete();
            $table->foreignId('academic_year_id')->constrained('academic_years')->restrictOnDelete();
            $table->foreignId('teacher_id')->constrained('teachers')->restrictOnDelete();
            $table->foreignId('school_class_id')->constrained('school_classes')->restrictOnDelete();
            $table->foreignId('section_id')->constrained('sections')->restrictOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->restrictOnDelete();
            $table->string('role', 20)->default('lead'); // 'lead', 'co_teacher'
            $table->timestamps();

            $table->unique(
                ['school_id', 'academic_year_id', 'school_class_id', 'section_id', 'subject_id', 'teacher_id'],
                'uq_teacher_subj_assign'
            );
            $table->index(['school_id', 'teacher_id']);
        });

        // 5. Student Elective Subject Enrollments (Per-student roster for optional subjects)
        Schema::create('student_subject_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->restrictOnDelete();
            $table->foreignId('academic_year_id')->constrained('academic_years')->restrictOnDelete();
            $table->foreignId('student_id')->constrained('students')->restrictOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->restrictOnDelete();
            $table->boolean('is_optional')->default(true);
            $table->timestamps();

            $table->unique(['academic_year_id', 'student_id', 'subject_id'], 'uq_student_subj_enrollment');
        });

        // 6. Exam Terms / Sessions
        Schema::create('exam_terms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->restrictOnDelete();
            $table->foreignId('academic_year_id')->constrained('academic_years')->restrictOnDelete();
            $table->foreignId('grading_scale_id')->constrained('grading_scales')->restrictOnDelete();
            $table->string('name'); // e.g. "Term 1 (Mid-Term)", "Annual Final Examination"
            $table->string('code')->nullable();
            $table->string('term_type'); // 'unit_test', 'term'
            $table->decimal('weightage_percentage', 5, 2); // Required input (no default)
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->text('description')->nullable();
            $table->string('status', 30)->default('scheduled'); // scheduled, ongoing, completed, published
            $table->json('grading_scale_snapshot')->nullable(); // Frozen snapshot of grading scale tiers at publish time
            $table->timestamp('published_at')->nullable();
            $table->foreignId('published_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['school_id', 'academic_year_id', 'status']);
            $table->unique(['school_id', 'academic_year_id', 'name']);
        });

        // 7. Exams (Date Sheet Papers: section_id strictly required, one row per section)
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->restrictOnDelete();
            $table->foreignId('academic_year_id')->constrained('academic_years')->restrictOnDelete();
            $table->foreignId('exam_term_id')->constrained('exam_terms')->restrictOnDelete();
            $table->foreignId('school_class_id')->constrained('school_classes')->restrictOnDelete();
            $table->foreignId('section_id')->constrained('sections')->restrictOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->restrictOnDelete();
            $table->date('exam_date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->string('room')->nullable();
            $table->decimal('max_marks', 6, 2); // Required input (no default)
            $table->decimal('pass_marks', 6, 2); // Sole pass authority for this paper
            $table->string('status', 30)->default('scheduled'); // scheduled, draft, submitted, verified, locked
            
            // Workflow tracking & auditing
            $table->timestamp('submitted_at')->nullable();
            $table->foreignId('submitted_by_teacher_id')->nullable()->constrained('teachers')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('locked_at')->nullable();
            $table->foreignId('locked_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('unlocked_at')->nullable();
            $table->foreignId('unlocked_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('unlock_reason')->nullable();
            $table->timestamps();

            $table->unique(
                ['school_id', 'academic_year_id', 'exam_term_id', 'school_class_id', 'section_id', 'subject_id'],
                'uq_exam_paper_per_section'
            );
        });

        // 8. Student Marks Entry, Stored Pass/Fail & Special Codes
        Schema::create('exam_marks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->restrictOnDelete();
            $table->foreignId('academic_year_id')->constrained('academic_years')->restrictOnDelete();
            $table->foreignId('exam_id')->constrained('exams')->restrictOnDelete();
            $table->foreignId('student_id')->constrained('students')->restrictOnDelete();
            $table->decimal('marks_obtained', 6, 2)->nullable();
            $table->string('special_status', 10)->nullable(); // 'AB', 'ML', 'EX'
            $table->boolean('is_passed')->nullable(); // Evaluated from marks_obtained >= exam.pass_marks (NULL if ML/EX)
            $table->string('grade', 10)->nullable(); // Evaluated from grading scale snapshot
            $table->decimal('grade_point', 4, 2)->nullable(); // Evaluated from grading scale snapshot
            $table->string('teacher_remarks')->nullable();
            $table->foreignId('entered_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('verified_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['exam_id', 'student_id']);
            $table->index(['school_id', 'student_id']);
        });

        // 9. Student Report Summaries (Zero-NULL composite unique index)
        Schema::create('student_report_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->restrictOnDelete();
            $table->foreignId('academic_year_id')->constrained('academic_years')->restrictOnDelete();
            $table->string('summary_type', 20); // 'term' or 'annual'
            $table->foreignId('exam_term_id')->nullable()->constrained('exam_terms')->restrictOnDelete();
            $table->unsignedBigInteger('term_scope_id')->default(0); // $term_id for 'term', 0 for 'annual'
            $table->foreignId('student_id')->constrained('students')->restrictOnDelete();
            $table->foreignId('school_class_id')->constrained('school_classes')->restrictOnDelete();
            $table->foreignId('section_id')->constrained('sections')->restrictOnDelete();
            
            $table->decimal('total_max_marks', 8, 2);
            $table->decimal('total_obtained_marks', 8, 2);
            $table->decimal('percentage', 5, 2);
            $table->string('overall_grade', 10)->nullable();
            $table->decimal('overall_gpa', 4, 2)->nullable();
            $table->integer('class_rank')->nullable();
            $table->integer('section_rank')->nullable();
            $table->string('result_status', 30); // 'PASSED', 'FAILED', 'RESULT_PENDING'
            $table->text('teacher_remarks')->nullable(); // Entered by Class Teacher
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            // Zero-NULL composite unique key: guaranteed duplicate prevention across all database engines
            $table->unique(
                ['school_id', 'academic_year_id', 'student_id', 'summary_type', 'term_scope_id'],
                'uq_student_report_summary_deterministic'
            );
            $table->index(['school_id', 'school_class_id', 'section_id', 'class_rank']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_report_summaries');
        Schema::dropIfExists('exam_marks');
        Schema::dropIfExists('exams');
        Schema::dropIfExists('exam_terms');
        Schema::dropIfExists('student_subject_enrollments');
        Schema::dropIfExists('teacher_subject_assignments');
        Schema::dropIfExists('class_teacher_allocations');
        Schema::dropIfExists('grading_scale_tiers');
        Schema::dropIfExists('grading_scales');
    }
};

