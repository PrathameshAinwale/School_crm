<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            if (!Schema::hasColumn('schools', 'webhook_key')) {
                $table->string('webhook_key', 64)->nullable()->unique()->after('status');
            }
        });

        // Generate unguessable keys for existing schools
        $schools = DB::table('schools')->whereNull('webhook_key')->get();
        foreach ($schools as $school) {
            DB::table('schools')->where('id', $school->id)->update([
                'webhook_key' => bin2hex(random_bytes(24)),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            if (Schema::hasColumn('schools', 'webhook_key')) {
                $table->dropUnique(['webhook_key']);
                $table->dropColumn('webhook_key');
            }
        });
    }
};
