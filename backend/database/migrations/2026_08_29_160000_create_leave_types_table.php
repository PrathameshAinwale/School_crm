<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('leave_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->constrained('schools')->onDelete('cascade');
            $table->string('name');
            $table->string('code')->index(); // CL, SL, ML, EL, etc.
            $table->integer('total_days')->default(10); // Total quota
            $table->text('description')->nullable();
            $table->string('color')->default('amber'); // amber, rose, purple, emerald, blue, indigo
            $table->boolean('is_active')->default(true);
            $table->boolean('requires_attachment')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });

        // Seed default leave types
        DB::table('leave_types')->insert([
            [
                'name' => 'Casual Leave (CL)',
                'code' => 'CL',
                'total_days' => 12,
                'description' => 'Standard short-notice casual time off for personal errands and emergencies.',
                'color' => 'amber',
                'is_active' => true,
                'requires_attachment' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Sick Leave (SL)',
                'code' => 'SL',
                'total_days' => 10,
                'description' => 'Medical leave for health-related illness, doctor appointments, or recovery.',
                'color' => 'rose',
                'is_active' => true,
                'requires_attachment' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Maternity / Paternity (ML)',
                'code' => 'ML',
                'total_days' => 90,
                'description' => 'Parental leave for maternity or paternity support during child birth.',
                'color' => 'purple',
                'is_active' => true,
                'requires_attachment' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Earned Leave (EL)',
                'code' => 'EL',
                'total_days' => 15,
                'description' => 'Annual paid leaves earned based on active service period.',
                'color' => 'emerald',
                'is_active' => true,
                'requires_attachment' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_types');
    }
};
