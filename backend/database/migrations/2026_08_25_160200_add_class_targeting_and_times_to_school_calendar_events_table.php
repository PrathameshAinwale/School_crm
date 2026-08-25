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
        if (Schema::hasTable('school_calendar_events')) {
            Schema::table('school_calendar_events', function (Blueprint $table) {
                if (!Schema::hasColumn('school_calendar_events', 'target_classes')) {
                    $table->json('target_classes')->nullable()->after('audience');
                }
                if (!Schema::hasColumn('school_calendar_events', 'start_time')) {
                    $table->string('start_time', 50)->nullable()->after('time_slot');
                }
                if (!Schema::hasColumn('school_calendar_events', 'end_time')) {
                    $table->string('end_time', 50)->nullable()->after('start_time');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('school_calendar_events')) {
            Schema::table('school_calendar_events', function (Blueprint $table) {
                $cols = [];
                if (Schema::hasColumn('school_calendar_events', 'target_classes')) $cols[] = 'target_classes';
                if (Schema::hasColumn('school_calendar_events', 'start_time')) $cols[] = 'start_time';
                if (Schema::hasColumn('school_calendar_events', 'end_time')) $cols[] = 'end_time';
                if (!empty($cols)) {
                    $table->dropColumn($cols);
                }
            });
        }
    }
};
