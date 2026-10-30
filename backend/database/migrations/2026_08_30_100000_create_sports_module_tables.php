<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for the Sports module.
     */
    public function up(): void
    {
        // 1. Sports Disciplines Table (Football, Cricket, Basketball, etc.)
        Schema::create('sports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->constrained('schools')->onDelete('cascade');
            $table->string('code')->index(); // SPT-FTB, SPT-CRK, etc.
            $table->string('name');
            $table->string('category')->default('Outdoor'); // Outdoor, Indoor, Track & Field, Aquatic, Martial Arts
            $table->string('coach_name')->nullable();
            $table->string('venue')->nullable(); // Main Turf Ground, Court 1, Indoor Arena
            $table->integer('max_players')->default(15);
            $table->text('description')->nullable();
            $table->string('status')->default('Active'); // Active, Inactive
            $table->timestamps();
            $table->softDeletes();
        });

        // 2. Sports Competitions / Tournaments / Matches Table
        Schema::create('sports_competitions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->constrained('schools')->onDelete('cascade');
            $table->foreignId('sport_id')->constrained('sports')->onDelete('cascade');
            $table->string('title'); // Inter-School Football Championship, Annual Sports Meet, etc.
            $table->string('competition_type')->default('Inter-School'); // Inter-School, Intra-School / House, District, State, National
            $table->string('tournament_level')->default('Under-17'); // Under-14, Under-17, Under-19, Open
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->time('event_time')->nullable();
            $table->string('venue')->nullable();
            $table->string('opponent_school')->nullable(); // e.g. St. Xavier International
            $table->string('status')->default('Upcoming'); // Upcoming, Ongoing, Completed, Cancelled
            $table->string('result')->default('Pending'); // Won, Runner-up, 3rd Place, Semi-Finalist, Participated, Pending
            $table->string('score_summary')->nullable(); // e.g. "DPS 3 - 1 St. Xavier"
            $table->text('remarks')->nullable();
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();
        });

        // 3. Sports Participants & Student Attendance Table
        Schema::create('sports_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->constrained('schools')->onDelete('cascade');
            $table->foreignId('competition_id')->nullable()->constrained('sports_competitions')->onDelete('cascade');
            $table->foreignId('sport_id')->constrained('sports')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->string('jersey_number')->nullable();
            $table->string('role')->default('Player'); // Captain, Vice-Captain, Player, Goalkeeper, Substitute, Runner
            $table->string('attendance_status')->default('Attending'); // Attending, Absent, Excused, Injured
            $table->string('achievement')->default('None'); // Gold Medal, Silver Medal, Bronze Medal, Best Player / MVP, Man of the Match, Participant Certificate, None
            $table->text('performance_notes')->nullable();
            $table->date('enrolled_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sports_participants');
        Schema::dropIfExists('sports_competitions');
        Schema::dropIfExists('sports');
    }
};
