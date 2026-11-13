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
        if (!Schema::hasTable('class_subjects')) {
            Schema::create('class_subjects', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->nullable()->constrained('schools')->cascadeOnDelete();
                $table->foreignId('school_class_id')->constrained('school_classes')->cascadeOnDelete();
                $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
                $table->foreignId('teacher_id')->nullable()->constrained('teachers')->nullOnDelete();
                $table->integer('periods_per_week')->default(5);
                $table->decimal('max_marks', 5, 2)->default(100);
                $table->decimal('passing_marks', 5, 2)->default(35);
                $table->boolean('is_elective')->default(false);
                $table->timestamps();

                $table->unique(['school_class_id', 'subject_id'], 'uq_class_subject');
                $table->index(['school_id', 'school_class_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('class_subjects');
    }
};

