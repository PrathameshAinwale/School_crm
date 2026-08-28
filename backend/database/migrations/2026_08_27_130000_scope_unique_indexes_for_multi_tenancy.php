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
        // Teachers table: drop global teacher_id unique constraint if exists
        Schema::table('teachers', function (Blueprint $table) {
            try {
                $table->dropUnique('teachers_teacher_id_unique');
            } catch (\Exception $e) {
                // Ignore if not present
            }
        });

        // Students table: drop global admission_number unique constraint if exists
        Schema::table('students', function (Blueprint $table) {
            try {
                $table->dropUnique('students_admission_number_unique');
            } catch (\Exception $e) {
                // Ignore if not present
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op for rollback
    }
};
