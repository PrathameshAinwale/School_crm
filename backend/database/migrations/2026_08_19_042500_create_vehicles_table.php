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
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('vehicle_number')->unique(); // e.g. "MH-12-AB-1234"
            $table->string('type')->default('Bus'); // Bus, Van, Mini-bus
            $table->string('model')->nullable();
            $table->integer('capacity')->default(30);
            $table->string('driver_name');
            $table->string('driver_phone');
            $table->string('driver_license')->nullable();
            $table->string('route_name')->nullable();
            $table->json('route_stops')->nullable();
            $table->string('fuel_type')->default('Diesel');
            $table->date('insurance_expiry')->nullable();
            $table->date('fitness_expiry')->nullable();
            $table->string('gps_device_id')->nullable();
            $table->string('status')->default('Active'); // Active, Maintenance, Out of Service
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
