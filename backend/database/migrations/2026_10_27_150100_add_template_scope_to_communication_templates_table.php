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
        Schema::table('communication_templates', function (Blueprint $table) {
            $table->string('template_scope', 30)->default('general')->after('message_category');
            $table->index(['school_id', 'template_scope'], 'comm_templates_school_scope_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('communication_templates', function (Blueprint $table) {
            $table->dropIndex('comm_templates_school_scope_idx');
            $table->dropColumn('template_scope');
        });
    }
};

