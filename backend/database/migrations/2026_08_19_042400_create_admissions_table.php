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
        Schema::create('admissions', function (Blueprint $table) {
            $table->id();
            $table->string('application_number')->unique(); // e.g. "ADM-2024-101"
            $table->string('first_name');
            $table->string('last_name')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('gender')->nullable();
            $table->foreignId('school_class_id')->nullable()->constrained('school_classes')->onDelete('set null');
            $table->string('academic_year')->default('2024-2025');
            $table->string('guardian_name');
            $table->string('guardian_phone');
            $table->string('guardian_email')->nullable();
            $table->string('guardian_relation')->default('Parent');
            $table->string('previous_school')->nullable();
            $table->string('previous_score')->nullable();
            $table->text('address')->nullable();
            $table->string('status')->default('Pending'); // Pending, Under Review, Approved, Rejected, Enrolled
            $table->foreignId('enrolled_student_id')->nullable()->constrained('students')->onDelete('set null');
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admissions');
    }
};
