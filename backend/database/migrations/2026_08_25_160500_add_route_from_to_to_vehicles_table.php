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
                if (!Schema::hasColumn('vehicles', 'route_from')) {
                    $table->string('route_from')->nullable()->after('route_name');
                }
                if (!Schema::hasColumn('vehicles', 'route_to')) {
                    $table->string('route_to')->nullable()->after('route_from');
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
                if (Schema::hasColumn('vehicles', 'route_to')) {
                    $table->dropColumn('route_to');
                }
                if (Schema::hasColumn('vehicles', 'route_from')) {
                    $table->dropColumn('route_from');
                }
            });
        }
    }
};
