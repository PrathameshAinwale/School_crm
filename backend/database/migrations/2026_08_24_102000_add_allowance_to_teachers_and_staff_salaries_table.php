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
        if (Schema::hasTable('teachers') && !Schema::hasColumn('teachers', 'allowance')) {
            Schema::table('teachers', function (Blueprint $table) {
                $table->decimal('allowance', 10, 2)->default(0.00)->after('salary');
            });
        }

        if (Schema::hasTable('staff_salaries')) {
            Schema::table('staff_salaries', function (Blueprint $table) {
                if (!Schema::hasColumn('staff_salaries', 'allowance')) {
                    $table->decimal('allowance', 10, 2)->default(0.00)->after('base_salary');
                }
                if (!Schema::hasColumn('staff_salaries', 'deduction')) {
                    $table->decimal('deduction', 10, 2)->default(0.00)->after('special_allowance');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('teachers') && Schema::hasColumn('teachers', 'allowance')) {
            Schema::table('teachers', function (Blueprint $table) {
                $table->dropColumn('allowance');
            });
        }

        if (Schema::hasTable('staff_salaries')) {
            Schema::table('staff_salaries', function (Blueprint $table) {
                if (Schema::hasColumn('staff_salaries', 'allowance')) {
                    $table->dropColumn('allowance');
                }
                if (Schema::hasColumn('staff_salaries', 'deduction')) {
                    $table->dropColumn('deduction');
                }
            });
        }
    }
};
