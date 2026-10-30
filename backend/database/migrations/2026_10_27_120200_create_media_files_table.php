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
        Schema::create('media_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->uuid('file_token')->unique();
            $table->string('original_name', 255);
            $table->string('stored_name', 255);
            $table->string('file_path', 500);
            $table->unsignedBigInteger('file_size'); // in bytes
            $table->string('mime_type', 100);
            $table->string('disk', 50)->default('local'); // local (storage/app/private) or public (storage/app/public)
            $table->string('visibility', 20)->default('private'); // private, public
            $table->string('document_type', 50)->default('general'); // school_logo, student_document, staff_document, receipt, circular
            $table->timestamps();
            $table->softDeletes();

            $table->index(['school_id', 'visibility']);
            $table->index(['school_id', 'document_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media_files');
    }
};

