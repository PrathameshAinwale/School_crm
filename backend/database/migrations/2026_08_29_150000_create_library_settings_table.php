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
        Schema::create('library_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->constrained()->cascadeOnDelete();
            // Overdue fine policy
            $table->decimal('fine_per_day', 8, 2)->default(10.00);
            $table->integer('grace_period_days')->default(1);
            $table->decimal('max_fine_cap', 8, 2)->default(200.00); // 0 = no cap
            
            // Borrower-specific fine rules
            $table->decimal('student_fine_per_day', 8, 2)->default(10.00);
            $table->decimal('teacher_fine_per_day', 8, 2)->default(0.00); // 0 = exempt
            $table->decimal('staff_fine_per_day', 8, 2)->default(5.00);
            
            // Loan duration & limits
            $table->integer('default_loan_days_student')->default(14);
            $table->integer('default_loan_days_teacher')->default(30);
            $table->integer('default_loan_days_staff')->default(14);
            $table->integer('max_books_per_student')->default(3);
            $table->integer('max_books_per_teacher')->default(5);
            $table->boolean('allow_librarian_fine_waiver')->default(true);
            $table->boolean('send_overdue_reminders')->default(true);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('library_settings');
    }
};
