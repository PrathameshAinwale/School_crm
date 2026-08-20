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
        Schema::create('resources', function (Blueprint $table) {
            $table->id();
            $table->string('resource_code')->unique(); // e.g. "RES-LAB-01"
            $table->string('name');
            $table->string('category')->default('General'); // Laboratory, Sports, IT & Computers, Library, Classroom Furniture, Audio-Visual
            $table->integer('total_quantity')->default(1);
            $table->integer('available_quantity')->default(1);
            $table->string('condition')->default('Good'); // Good, Needs Repair, Damaged, Discarded
            $table->string('location_room')->nullable(); // e.g. "Science Lab 2"
            $table->date('purchase_date')->nullable();
            $table->decimal('unit_cost', 10, 2)->nullable();
            $table->string('status')->default('Available'); // Available, In Use, Maintenance, Out of Stock
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resources');
    }
};
