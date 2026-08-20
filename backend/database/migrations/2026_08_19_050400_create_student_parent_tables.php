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
        // 1. Student Fees & Payments
        Schema::create('student_fees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->string('term_name'); // e.g. "Quarter 1 (Apr - Jun 2026)", "Transport & Transit (Annual)"
            $table->decimal('amount', 10, 2);
            $table->date('due_date');
            $table->string('status')->default('Pending'); // Paid, Pending, Upcoming, Overdue
            $table->date('paid_date')->nullable();
            $table->string('transaction_id')->nullable();
            $table->string('payment_mode')->nullable(); // UPI (GPay), Net Banking, Card, Cash
            $table->string('receipt_number')->nullable();
            $table->boolean('tax_deductible')->default(true);
            $table->timestamps();
        });

        // 2. Feedback (Faculty / Academic Experience)
        Schema::create('feedbacks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->foreignId('student_id')->nullable()->constrained('students')->onDelete('cascade');
            $table->string('subject');
            $table->string('teacher_name');
            $table->decimal('rating', 3, 1)->default(5.0); // e.g. 4.5
            $table->json('category_ratings')->nullable(); // { clarity: 5, doubtResolution: 5, homeworkPace: 5 }
            $table->text('comment');
            $table->text('admin_response')->nullable();
            $table->timestamps();
        });

        // 3. Parent-Teacher Meeting (PTM) Appointments & History
        Schema::create('ptm_appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('term_title'); // e.g. "Upcoming PTM Term 1", "Class IX Annual Final PTM"
            $table->date('meeting_date');
            $table->string('time_slot'); // e.g. "10:30 AM - 11:00 AM"
            $table->string('venue')->default('Room 301');
            $table->string('teacher_name');
            $table->string('status')->default('Confirmed'); // Confirmed, Rescheduled, Completed, Cancelled
            $table->text('agenda_notes')->nullable();
            $table->text('discussion_summary')->nullable();
            $table->text('key_decisions')->nullable();
            $table->timestamps();
        });

        // 4. Study Materials / Digital Library
        Schema::create('study_materials', function (Blueprint $table) {
            $table->id();
            $table->string('code')->nullable(); // e.g. "SM-01"
            $table->foreignId('school_class_id')->nullable()->constrained('school_classes')->onDelete('set null');
            $table->string('class_name')->nullable(); // "Class 10"
            $table->string('subject'); // e.g. "Mathematics", "Science"
            $table->string('title');
            $table->string('type')->default('PDF'); // PDF, ZIP, DOC, MP4
            $table->string('file_size')->default('3.5 MB');
            $table->string('file_url')->nullable();
            $table->string('uploader_name')->default('Faculty');
            $table->date('publish_date')->nullable();
            $table->unsignedInteger('downloads_count')->default(0);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 5. Timetables (Class and Section specific)
        Schema::create('timetables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_class_id')->nullable()->constrained('school_classes')->onDelete('cascade');
            $table->foreignId('section_id')->nullable()->constrained('sections')->onDelete('cascade');
            $table->foreignId('created_by_teacher_id')->nullable()->constrained('teachers')->onDelete('set null');
            $table->string('class_name')->nullable(); // "Class 10"
            $table->string('division')->default('Div A'); // "Div A", "Div B", "Div C"
            $table->string('day_of_week'); // Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
            $table->string('period_name'); // "Period 1", "Period 2"
            $table->integer('period_number')->default(1);
            $table->string('time_slot'); // "8:00 - 8:45 AM"
            $table->string('subject');
            $table->string('teacher_name');
            $table->string('room')->default('Room 301');
            $table->string('type')->default('Theory'); // Theory, Lab Practical, Sports, Remedial, Activity
            $table->timestamps();
        });

        // 6. Syllabuses, Units, and Teacher Progress Logs
        Schema::create('syllabuses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_class_id')->nullable()->constrained('school_classes')->onDelete('cascade');
            $table->string('class_name')->nullable();
            $table->string('subject_key'); // math, science, english, social, cs
            $table->string('subject_name'); // "Mathematics (Standard)"
            $table->string('subject_code')->nullable(); // "MATH-041"
            $table->string('teacher_name');
            $table->unsignedInteger('completion_percentage')->default(0);
            $table->timestamps();
        });

        Schema::create('syllabus_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('syllabus_id')->constrained('syllabuses')->onDelete('cascade');
            $table->unsignedInteger('unit_number')->default(1);
            $table->string('title'); // "Unit 1: Number Systems — Real Numbers"
            $table->string('status')->default('Scheduled'); // Completed, In Progress, Scheduled
            $table->unsignedInteger('progress_percentage')->default(0);
            $table->string('lectures_info')->nullable(); // "12 Lectures" or "8/10 Lectures"
            $table->json('topics')->nullable(); // ["Fundamental Theorem of Arithmetic", "Revisiting Irrational Numbers"]
            $table->timestamps();
        });

        Schema::create('syllabus_progress_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('syllabus_id')->constrained('syllabuses')->onDelete('cascade');
            $table->string('subject_name');
            $table->string('class_name')->default('Grade 10-A');
            $table->string('unit_title');
            $table->date('log_date');
            $table->unsignedInteger('progress_percentage')->default(0);
            $table->text('message');
            $table->string('teacher_name');
            $table->timestamps();
        });

        // 7. School Calendar Events (Posted by HR / Admin)
        Schema::create('school_calendar_events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('event_type')->default('Event'); // Exam, Holiday, Event, PTM, Workshop, Sports, Exhibition
            $table->string('category')->default('General'); // Workshop, Sports, Exhibition, Academic, Meeting
            $table->string('date_label')->nullable(); // "Aug 20, 2026" or "Oct 10 - Oct 22, 2026"
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->string('time_slot')->default('Full Day'); // "9:00 AM - 12:00 PM"
            $table->string('venue')->default('Campus');
            $table->string('audience')->default('All Faculty & Students');
            $table->string('coordinator')->nullable();
            $table->string('speaker')->nullable();
            $table->string('status')->default('Upcoming'); // Upcoming, In Progress, Completed, Cancelled
            $table->string('month_label')->nullable(); // "August 2026"
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 8. School Notices & Circulars
        Schema::create('school_notices', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('category')->default('Academic'); // Academic, Examination, Health & Wellness, Administrative
            $table->string('priority')->default('Normal'); // Normal, Important, Urgent
            $table->string('sender')->default('Principal Office');
            $table->date('publish_date');
            $table->text('content');
            $table->string('attachment_name')->nullable();
            $table->string('attachment_url')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('school_notices');
        Schema::dropIfExists('school_calendar_events');
        Schema::dropIfExists('syllabus_progress_logs');
        Schema::dropIfExists('syllabus_units');
        Schema::dropIfExists('syllabuses');
        Schema::dropIfExists('timetables');
        Schema::dropIfExists('study_materials');
        Schema::dropIfExists('ptm_appointments');
        Schema::dropIfExists('feedbacks');
        Schema::dropIfExists('student_fees');
    }
};
