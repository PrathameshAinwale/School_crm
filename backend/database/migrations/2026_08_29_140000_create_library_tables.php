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
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('book_code')->nullable();
            $table->string('title');
            $table->string('author');
            $table->string('isbn')->nullable();
            $table->string('category')->default('General');
            $table->string('publisher')->nullable();
            $table->string('edition_year')->nullable();
            $table->string('shelf_location')->nullable();
            $table->integer('total_copies')->default(1);
            $table->integer('available_copies')->default(1);
            $table->string('status')->default('Available');
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('book_issues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('book_id')->constrained('books')->cascadeOnDelete();
            $table->string('borrower_type')->default('student'); // student, teacher, staff
            $table->unsignedBigInteger('borrower_id')->nullable();
            $table->string('borrower_name');
            $table->string('borrower_identifier')->nullable();
            $table->string('borrower_contact')->nullable();
            $table->string('borrower_class')->nullable();
            $table->date('issue_date');
            $table->date('due_date');
            $table->date('return_date')->nullable();
            $table->string('status')->default('issued'); // issued, returned, overdue, lost
            $table->decimal('fine_amount', 8, 2)->default(0);
            $table->string('fine_status')->default('unpaid'); // unpaid, paid, waived
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('book_issues');
        Schema::dropIfExists('books');
    }
};
