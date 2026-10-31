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
        Schema::create('communication_campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('template_id')->nullable()->constrained('communication_templates')->nullOnDelete();
            $table->string('title', 150);
            $table->string('channel', 30); // in_app, email, sms, whatsapp, push
            $table->string('message_category', 30)->default('transactional'); // transactional, promotional, emergency
            $table->string('subject', 255)->nullable();
            $table->text('message_body');
            $table->string('audience_type', 30); // all, class, section, individual, staff, hostel
            $table->json('audience_filters')->nullable();
            $table->string('status', 30)->default('draft'); // draft, scheduled, processing, completed, failed, cancelled
            $table->boolean('is_test_mode')->default(false);
            $table->json('test_recipients')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->unsignedInteger('total_recipients')->default(0);
            $table->unsignedInteger('sent_count')->default(0);
            $table->unsignedInteger('delivered_count')->default(0);
            $table->unsignedInteger('failed_count')->default(0);
            $table->unsignedInteger('skipped_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['school_id', 'status', 'scheduled_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('communication_campaigns');
    }
};

