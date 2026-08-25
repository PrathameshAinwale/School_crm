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
        // 1. Add assigned_teacher_id to resources table if not exists
        if (Schema::hasTable('resources')) {
            Schema::table('resources', function (Blueprint $table) {
                if (!Schema::hasColumn('resources', 'assigned_teacher_id')) {
                    $table->foreignId('assigned_teacher_id')->nullable()->after('status')->constrained('teachers')->onDelete('set null');
                }
            });
        }

        // 2. Create resource_requests table for issue & maintenance requests raised by teachers
        if (!Schema::hasTable('resource_requests')) {
            Schema::create('resource_requests', function (Blueprint $table) {
                $table->id();
                $table->foreignId('resource_id')->constrained('resources')->onDelete('cascade');
                $table->foreignId('teacher_id')->nullable()->constrained('teachers')->onDelete('set null');
                $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
                $table->string('title');
                $table->string('issue_type')->default('Maintenance Required'); // Defective/Broken, Needs Maintenance, Missing Parts, Damaged, Consumables Refill, Other
                $table->string('severity')->default('Medium'); // Low, Medium, High, Critical
                $table->text('description')->nullable();
                $table->string('photo_url')->nullable();
                $table->string('photo_name')->nullable();
                $table->string('status')->default('Pending'); // Pending, Approved, Rejected, Resolved, In Repair
                $table->text('admin_remarks')->nullable();
                $table->foreignId('actioned_by_user_id')->nullable()->constrained('users')->onDelete('set null');
                $table->timestamp('actioned_at')->nullable();
                $table->timestamps();
                $table->softDeletes();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resource_requests');

        if (Schema::hasTable('resources')) {
            Schema::table('resources', function (Blueprint $table) {
                if (Schema::hasColumn('resources', 'assigned_teacher_id')) {
                    $table->dropForeign(['assigned_teacher_id']);
                    $table->dropColumn('assigned_teacher_id');
                }
            });
        }
    }
};
