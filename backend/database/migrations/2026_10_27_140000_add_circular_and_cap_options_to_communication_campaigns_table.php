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
        Schema::table('communication_campaigns', function (Blueprint $table) {
            $table->boolean('is_circular')->default(false)->after('channel');
            $table->boolean('allow_partial_cap')->default(false)->after('is_test_mode');
        });

        Schema::table('school_notices', function (Blueprint $table) {
            $table->string('target_role', 50)->default('all')->after('priority');
            $table->boolean('is_active')->default(true)->after('attachment_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('communication_campaigns', function (Blueprint $table) {
            $table->dropColumn(['is_circular', 'allow_partial_cap']);
        });

        Schema::table('school_notices', function (Blueprint $table) {
            $table->dropColumn(['target_role', 'is_active']);
        });
    }
};

