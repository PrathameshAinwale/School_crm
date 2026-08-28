<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Create student_attendances table
        Schema::create('student_attendances', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('school_class_id')->nullable()->constrained('school_classes')->onDelete('set null');
            $table->foreignId('section_id')->nullable()->constrained('sections')->onDelete('set null');
            $table->string('status')->default('Present'); // Present, Absent, Late, Half Day, Excused, Weekend
            $table->time('check_in_time')->nullable();
            $table->time('check_out_time')->nullable();
            $table->string('mode')->nullable(); // RFID Smart Gate 1, Biometric Turnstile, Manual Attendance
            $table->text('remarks')->nullable();
            $table->foreignId('marked_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->unique(['date', 'student_id'], 'unique_student_attendance_log');
        });

        // 2. Create staff_attendances table
        Schema::create('staff_attendances', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade');
            $table->string('status')->default('Present'); // Present, Absent, Late, Half Day, Leave, On Duty
            $table->time('check_in_time')->nullable();
            $table->time('check_out_time')->nullable();
            $table->text('remarks')->nullable();
            $table->foreignId('marked_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->unique(['date', 'teacher_id'], 'unique_staff_daily_attendance');
        });

        // 3. Migrate existing attendance data if attendances table exists
        if (Schema::hasTable('attendances')) {
            $studentRows = DB::table('attendances')->where('type', 'student')->whereNotNull('student_id')->get();
            foreach ($studentRows as $row) {
                DB::table('student_attendances')->insertOrIgnore([
                    'date' => $row->date,
                    'student_id' => $row->student_id,
                    'school_class_id' => $row->school_class_id,
                    'section_id' => $row->section_id,
                    'status' => $row->status ?: 'Present',
                    'remarks' => $row->remarks,
                    'marked_by' => $row->marked_by,
                    'created_at' => $row->created_at ?: now(),
                    'updated_at' => $row->updated_at ?: now(),
                ]);
            }

            $staffRows = DB::table('attendances')->where('type', 'staff')->whereNotNull('teacher_id')->get();
            foreach ($staffRows as $row) {
                DB::table('staff_attendances')->insertOrIgnore([
                    'date' => $row->date,
                    'teacher_id' => $row->teacher_id,
                    'status' => $row->status ?: 'Present',
                    'check_in_time' => $row->check_in_time,
                    'check_out_time' => $row->check_out_time,
                    'remarks' => $row->remarks,
                    'marked_by' => $row->marked_by,
                    'created_at' => $row->created_at ?: now(),
                    'updated_at' => $row->updated_at ?: now(),
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_attendances');
        Schema::dropIfExists('student_attendances');
    }
};
