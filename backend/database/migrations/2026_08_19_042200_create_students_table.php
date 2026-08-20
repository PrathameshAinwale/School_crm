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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('admission_number')->unique(); // e.g. "STU-2024-001"
            $table->string('roll_number')->nullable();
            $table->string('first_name');
            $table->string('last_name')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('gender')->nullable(); // Male, Female, Other
            $table->string('blood_group')->nullable();
            $table->foreignId('school_class_id')->nullable()->constrained('school_classes')->onDelete('set null');
            $table->foreignId('section_id')->nullable()->constrained('sections')->onDelete('set null');
            $table->date('admission_date')->nullable();
            $table->string('guardian_name');
            $table->string('guardian_phone'); // Mobile number for parent login
            $table->string('guardian_email')->nullable();
            $table->string('guardian_relation')->default('Parent'); // Father, Mother, Guardian
            $table->text('address')->nullable();
            $table->string('emergency_contact')->nullable();
            $table->text('medical_notes')->nullable();
            $table->string('status')->default('Active'); // Active, Inactive, Graduated, Transferred
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
