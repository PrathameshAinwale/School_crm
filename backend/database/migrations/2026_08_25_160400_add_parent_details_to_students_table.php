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
        if (Schema::hasTable('students')) {
            Schema::table('students', function (Blueprint $table) {
                if (!Schema::hasColumn('students', 'father_name')) {
                    $table->string('father_name')->nullable()->after('guardian_name');
                }
                if (!Schema::hasColumn('students', 'father_occupation')) {
                    $table->string('father_occupation')->nullable()->after('father_name');
                }
                if (!Schema::hasColumn('students', 'mother_name')) {
                    $table->string('mother_name')->nullable()->after('father_occupation');
                }
                if (!Schema::hasColumn('students', 'mother_occupation')) {
                    $table->string('mother_occupation')->nullable()->after('mother_name');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('students')) {
            Schema::table('students', function (Blueprint $table) {
                $columns = ['father_name', 'father_occupation', 'mother_name', 'mother_occupation'];
                foreach ($columns as $column) {
                    if (Schema::hasColumn('students', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }
};
