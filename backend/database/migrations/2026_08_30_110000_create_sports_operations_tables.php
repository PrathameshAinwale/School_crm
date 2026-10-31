<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for Sports Facilities, Schedules, Inventory & Fitness.
     */
    public function up(): void
    {
        // 1. Sports Facilities / Grounds / Courts
        Schema::create('sports_facilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->constrained('schools')->onDelete('cascade');
            $table->string('name'); // Main Olympic Football Turf, Synthetic Basketball Court, etc.
            $table->string('facility_type')->default('Court'); // Ground, Court, Pool, Track, Gymnasium, Arena
            $table->integer('capacity')->default(50);
            $table->string('surface_type')->default('Synthetic Turf'); // Grass, Hardwood, Clay, Synthetic Turf, Rubberized
            $table->boolean('floodlights')->default(false);
            $table->string('maintenance_status')->default('Available'); // Available, In Use, Scheduled Maintenance, Closed
            $table->string('location')->nullable(); // East Campus, Sports Block, Indoor Hall
            $table->text('rules_notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // 2. Training Sessions & Practice Schedules
        Schema::create('sports_training_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->constrained('schools')->onDelete('cascade');
            $table->foreignId('sport_id')->constrained('sports')->onDelete('cascade');
            $table->foreignId('facility_id')->nullable()->constrained('sports_facilities')->onDelete('set null');
            $table->string('squad_name'); // Under-17 Boys Football Squad, Morning Athletics Drill, etc.
            $table->string('coach_name');
            $table->string('day_of_week')->default('Mon/Wed/Fri'); // Mon, Tue, etc., or Mon/Wed/Fri, Tue/Thu/Sat, Daily
            $table->time('start_time');
            $table->time('end_time');
            $table->string('session_type')->default('Morning Practice'); // Morning Practice, Evening Drill, Conditioning, Tactical Briefing
            $table->string('target_grades')->nullable(); // Grade 7-10, High School, etc.
            $table->integer('capacity')->default(25);
            $table->string('status')->default('Active'); // Active, Paused, Completed
            $table->timestamps();
            $table->softDeletes();
        });

        // 3. Sports Equipment & Inventory
        Schema::create('sports_equipment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->constrained('schools')->onDelete('cascade');
            $table->foreignId('sport_id')->nullable()->constrained('sports')->onDelete('set null');
            $table->string('item_name'); // Cosco Football Size 5, SG Cricket Bats, Nivia Basketballs
            $table->string('category')->default('Balls & Gear'); // Balls & Gear, Protective, Field Equipment, Kits, Medical
            $table->integer('quantity_total')->default(1);
            $table->integer('quantity_available')->default(1);
            $table->integer('quantity_issued')->default(0);
            $table->string('condition')->default('Good'); // Good, Fair, Needs Repair, Damaged
            $table->string('storage_location')->nullable(); // Sports Room A, Rack 2, Gym Storage
            $table->date('purchase_date')->nullable();
            $table->decimal('unit_cost', 10, 2)->default(0);
            $table->string('status')->default('Available'); // Available, In Use, Low Stock, Damaged
            $table->timestamps();
            $table->softDeletes();
        });

        // 4. Equipment Issues / Checkouts
        Schema::create('sports_equipment_issues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->constrained('schools')->onDelete('cascade');
            $table->foreignId('equipment_id')->constrained('sports_equipment')->onDelete('cascade');
            $table->foreignId('student_id')->nullable()->constrained('students')->onDelete('set null');
            $table->string('borrower_name'); // Student Name or Teacher Name
            $table->string('borrower_role')->default('Student'); // Student, Coach, Teacher
            $table->integer('quantity')->default(1);
            $table->date('issue_date');
            $table->date('expected_return_date');
            $table->date('return_date')->nullable();
            $table->string('status')->default('Issued'); // Issued, Returned, Overdue, Damaged
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 5. Student Athletic Fitness & Health Assessments
        Schema::create('sports_fitness_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->constrained('schools')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->date('assessment_date');
            $table->string('assessed_by')->nullable();
            $table->string('academic_term')->default('Term 1'); // Term 1, Term 2, Annual
            $table->decimal('height_cm', 5, 2)->nullable();
            $table->decimal('weight_kg', 5, 2)->nullable();
            $table->decimal('bmi', 4, 1)->nullable();
            $table->decimal('sprint_50m_seconds', 4, 2)->nullable();
            $table->decimal('shuttle_run_seconds', 4, 2)->nullable();
            $table->integer('pushups_count')->nullable();
            $table->decimal('sit_and_reach_cm', 4, 1)->nullable();
            $table->string('stamina_rating')->default('Good (A)'); // Outstanding (A+), Good (A), Average (B), Needs Training (C)
            $table->boolean('medical_clearance')->default(true);
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sports_fitness_assessments');
        Schema::dropIfExists('sports_equipment_issues');
        Schema::dropIfExists('sports_equipment');
        Schema::dropIfExists('sports_training_schedules');
        Schema::dropIfExists('sports_facilities');
    }
};
