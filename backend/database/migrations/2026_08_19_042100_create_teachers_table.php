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
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('teacher_id')->unique(); // e.g. "TCH-001"
            $table->string('first_name');
            $table->string('last_name')->nullable();
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('gender')->nullable(); // Male, Female, Other
            $table->date('date_of_birth')->nullable();
            $table->date('joining_date')->nullable();
            $table->string('department')->nullable();
            $table->string('qualification')->nullable();
            $table->string('experience')->nullable();
            $table->decimal('salary', 10, 2)->nullable();
            $table->json('assigned_subjects')->nullable();
            $table->json('assigned_classes')->nullable();
            $table->string('class_teacher_class')->nullable(); // e.g. "Class 10" or "Class 10 - Saffron (A)"
            $table->text('address')->nullable();
            $table->string('emergency_contact')->nullable();
            $table->string('status')->default('Active'); // Active, On Leave, Inactive
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teachers');
    }
};
