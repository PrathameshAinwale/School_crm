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
        Schema::create('communication_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('campaign_id')->nullable()->constrained('communication_campaigns')->cascadeOnDelete();
            $table->foreignId('recipient_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('recipient_student_id')->nullable()->constrained('students')->nullOnDelete();
            $table->string('channel', 30); // in_app, email, sms, whatsapp, push
            $table->string('message_category', 30)->default('transactional'); // transactional, promotional, emergency
            $table->string('recipient_name', 150)->nullable();
            $table->string('recipient_phone', 30)->nullable(); // Normalized E.164
            $table->string('recipient_email', 150)->nullable();
            $table->text('recipient_device_token')->nullable();
            $table->text('message_body');
            $table->string('provider', 50)->nullable();
            $table->string('provider_message_id', 150)->nullable()->index();
            $table->string('status', 30)->default('queued'); // queued, sent, delivered, failed, skipped
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();

            $table->index(['school_id', 'channel', 'status']);
            $table->index(['school_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('communication_logs');
    }
};

