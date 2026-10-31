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
        Schema::create('communication_opt_outs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->string('phone_or_email', 150); // Normalized E.164 phone or lowercase email
            $table->string('channel', 30)->default('all'); // sms, whatsapp, email, all
            $table->string('reason', 255)->nullable();
            $table->timestamps();

            $table->unique(['school_id', 'phone_or_email', 'channel']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('communication_opt_outs');
    }
};

