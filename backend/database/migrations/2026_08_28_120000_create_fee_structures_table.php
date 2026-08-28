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
        Schema::create('fee_structures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->constrained('schools')->nullOnDelete();
            $table->foreignId('school_class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->string('academic_year')->default('2026-27');
            $table->decimal('tuition_fee', 12, 2)->default(0.00);
            $table->decimal('transport_fee', 12, 2)->default(0.00);
            $table->decimal('lab_library_fee', 12, 2)->default(0.00);
            $table->decimal('activity_fee', 12, 2)->default(0.00);
            $table->decimal('other_fee', 12, 2)->default(0.00);
            $table->decimal('total_annual_fee', 12, 2)->default(0.00);
            $table->integer('installments_count')->default(4);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('fee_structure_installments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fee_structure_id')->constrained('fee_structures')->cascadeOnDelete();
            $table->string('term_name'); // e.g. "Quarter 1 (Apr - Jun)", "Quarter 2 (Jul - Sep)"
            $table->decimal('amount', 12, 2)->default(0.00);
            $table->date('due_date');
            $table->decimal('late_fee_per_day', 8, 2)->default(0.00);
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fee_structure_installments');
        Schema::dropIfExists('fee_structures');
    }
};
