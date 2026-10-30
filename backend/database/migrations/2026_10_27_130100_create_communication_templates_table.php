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
        Schema::create('communication_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->string('name', 150);
            $table->string('code', 50);
            $table->string('channel', 30); // in_app, email, sms, whatsapp, push
            $table->string('message_category', 30)->default('transactional'); // transactional, promotional, emergency
            $table->string('subject', 255)->nullable();
            $table->text('content');
            $table->json('variables')->nullable();
            $table->string('dlt_template_id', 50)->nullable();
            $table->string('dlt_header', 20)->nullable();
            $table->string('whatsapp_template_name', 100)->nullable();
            $table->string('whatsapp_language', 20)->default('en_US');
            $table->json('meta_variable_mapping')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['school_id', 'channel']);
            $table->unique(['school_id', 'code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('communication_templates');
    }
};

