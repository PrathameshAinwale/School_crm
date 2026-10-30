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
        if (Schema::hasTable('vehicles')) {
            Schema::table('vehicles', function (Blueprint $table) {
                if (!Schema::hasColumn('vehicles', 'current_latitude')) {
                    $table->decimal('current_latitude', 10, 7)->nullable()->after('route_to');
                }
                if (!Schema::hasColumn('vehicles', 'current_longitude')) {
                    $table->decimal('current_longitude', 10, 7)->nullable()->after('current_latitude');
                }
                if (!Schema::hasColumn('vehicles', 'current_heading')) {
                    $table->float('current_heading')->nullable()->after('current_longitude');
                }
                if (!Schema::hasColumn('vehicles', 'current_speed')) {
                    $table->float('current_speed')->nullable()->after('current_heading');
                }
                if (!Schema::hasColumn('vehicles', 'is_online')) {
                    $table->boolean('is_online')->default(false)->after('current_speed');
                }
                if (!Schema::hasColumn('vehicles', 'last_ping_at')) {
                    $table->timestamp('last_ping_at')->nullable()->after('is_online');
                }
                if (!Schema::hasColumn('vehicles', 'tracking_token')) {
                    $table->string('tracking_token', 64)->nullable()->after('last_ping_at');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('vehicles')) {
            Schema::table('vehicles', function (Blueprint $table) {
                $columns = [
                    'current_latitude',
                    'current_longitude',
                    'current_heading',
                    'current_speed',
                    'is_online',
                    'last_ping_at',
                    'tracking_token',
                ];
                foreach ($columns as $column) {
                    if (Schema::hasColumn('vehicles', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }
};
