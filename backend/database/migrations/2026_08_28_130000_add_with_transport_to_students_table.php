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
        if (!Schema::hasColumn('students', 'with_transport')) {
            Schema::table('students', function (Blueprint $table) {
                $table->boolean('with_transport')->default(false)->after('section_id');
            });
        }
        if (!Schema::hasColumn('admissions', 'with_transport')) {
            Schema::table('admissions', function (Blueprint $table) {
                $table->boolean('with_transport')->default(false)->after('school_class_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('students', 'with_transport')) {
            Schema::table('students', function (Blueprint $table) {
                $table->dropColumn('with_transport');
            });
        }
        if (Schema::hasColumn('admissions', 'with_transport')) {
            Schema::table('admissions', function (Blueprint $table) {
                $table->dropColumn('with_transport');
            });
        }
    }
};
