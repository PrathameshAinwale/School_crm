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
        Schema::table('syllabuses', function (Blueprint $table) {
            $table->string('division', 50)->default('Div A')->after('class_name');
        });

        Schema::table('syllabus_progress_logs', function (Blueprint $table) {
            $table->string('division', 50)->default('Div A')->after('class_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('syllabuses', function (Blueprint $table) {
            $table->dropColumn('division');
        });

        Schema::table('syllabus_progress_logs', function (Blueprint $table) {
            $table->dropColumn('division');
        });
    }
};
