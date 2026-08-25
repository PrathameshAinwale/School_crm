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
        if (Schema::hasTable('resource_requests')) {
            Schema::table('resource_requests', function (Blueprint $table) {
                if (!Schema::hasColumn('resource_requests', 'affected_quantity')) {
                    $table->integer('affected_quantity')->default(1)->after('severity');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('resource_requests')) {
            Schema::table('resource_requests', function (Blueprint $table) {
                if (Schema::hasColumn('resource_requests', 'affected_quantity')) {
                    $table->dropColumn('affected_quantity');
                }
            });
        }
    }
};
