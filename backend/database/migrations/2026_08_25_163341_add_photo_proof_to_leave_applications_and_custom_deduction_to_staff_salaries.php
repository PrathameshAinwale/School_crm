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
        if (Schema::hasTable('leave_applications')) {
            Schema::table('leave_applications', function (Blueprint $table) {
                if (!Schema::hasColumn('leave_applications', 'photo_proof')) {
                    $table->longText('photo_proof')->nullable()->after('reason');
                }
                if (!Schema::hasColumn('leave_applications', 'photo_name')) {
                    $table->string('photo_name')->nullable()->after('photo_proof');
                }
            });
        }

        if (Schema::hasTable('staff_salaries')) {
            Schema::table('staff_salaries', function (Blueprint $table) {
                if (!Schema::hasColumn('staff_salaries', 'deduction')) {
                    $table->decimal('deduction', 10, 2)->default(0.00)->after('special_allowance');
                }
                if (!Schema::hasColumn('staff_salaries', 'is_custom_deduction')) {
                    $table->boolean('is_custom_deduction')->default(false)->after('deduction');
                }
                if (!Schema::hasColumn('staff_salaries', 'custom_deduction_reason')) {
                    $table->string('custom_deduction_reason')->nullable()->after('is_custom_deduction');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('leave_applications')) {
            Schema::table('leave_applications', function (Blueprint $table) {
                if (Schema::hasColumn('leave_applications', 'photo_proof')) {
                    $table->dropColumn('photo_proof');
                }
                if (Schema::hasColumn('leave_applications', 'photo_name')) {
                    $table->dropColumn('photo_name');
                }
            });
        }

        if (Schema::hasTable('staff_salaries')) {
            Schema::table('staff_salaries', function (Blueprint $table) {
                if (Schema::hasColumn('staff_salaries', 'deduction')) {
                    $table->dropColumn('deduction');
                }
                if (Schema::hasColumn('staff_salaries', 'is_custom_deduction')) {
                    $table->dropColumn('is_custom_deduction');
                }
                if (Schema::hasColumn('staff_salaries', 'custom_deduction_reason')) {
                    $table->dropColumn('custom_deduction_reason');
                }
            });
        }
    }
};
