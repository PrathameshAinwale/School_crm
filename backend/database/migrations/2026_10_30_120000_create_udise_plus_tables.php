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
        // 1. UDISE+ School Profile
        if (!Schema::hasTable('udise_school_profiles')) {
            Schema::create('udise_school_profiles', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->onDelete('cascade');
                $table->string('academic_year', 20)->default('2024-2025');
                $table->string('udise_code', 15)->default('27200100142'); // 11-digit official code
                $table->string('school_category', 50)->default('Higher Secondary (1-12)');
                $table->string('management_group', 80)->default('Private Unaided (Recognized)');
                $table->string('type_of_school', 30)->default('Co-educational');
                $table->string('lowest_class', 30)->default('Class 1');
                $table->string('highest_class', 30)->default('Class 12');
                $table->boolean('pre_primary_section')->default(true);
                $table->unsignedSmallInteger('establishment_year')->default(2008);
                $table->unsignedSmallInteger('recognition_year_primary')->default(2008);
                $table->unsignedSmallInteger('recognition_year_upper_primary')->default(2011);
                $table->unsignedSmallInteger('recognition_year_secondary')->default(2015);
                $table->unsignedSmallInteger('recognition_year_higher_secondary')->default(2018);
                $table->string('affiliation_board_secondary', 50)->default('CBSE');
                $table->string('affiliation_no_secondary', 50)->default('CBSE/AFF/2130842');
                $table->string('affiliation_board_higher_secondary', 50)->default('CBSE');
                $table->string('affiliation_no_higher_secondary', 50)->default('CBSE/AFF/2130842/SR');
                $table->string('medium_of_instruction_1', 40)->default('English');
                $table->string('medium_of_instruction_2', 40)->default('Hindi');
                $table->string('medium_of_instruction_3', 40)->nullable()->default('Marathi');
                $table->decimal('distance_from_primary_school_km', 4, 1)->default(0.5);
                $table->decimal('distance_from_secondary_school_km', 4, 1)->default(1.2);
                $table->boolean('is_residential')->default(false);
                $table->boolean('is_shift_school')->default(false);
                $table->boolean('is_special_school_cwsn')->default(false);
                $table->string('head_of_school_type', 50)->default('Principal');
                $table->string('head_of_school_name', 100)->default('Dr. Rajeshwari Sharma');
                $table->string('head_of_school_mobile', 20)->default('9876543210');
                $table->string('nodal_officer_name', 100)->default('Vikram Deshmukh');
                $table->string('nodal_officer_mobile', 20)->default('9822012345');
                $table->string('nodal_officer_email', 100)->default('udise.nodal@delhipublic.edu');
                $table->timestamps();

                $table->unique(['school_id', 'academic_year'], 'udise_school_year_unique');
            });
        }

        // 2. UDISE+ School Facilities & Infrastructure
        if (!Schema::hasTable('udise_school_facilities')) {
            Schema::create('udise_school_facilities', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->onDelete('cascade');
                $table->string('academic_year', 20)->default('2024-2025');
                $table->string('building_status', 50)->default('Owned');
                $table->unsignedSmallInteger('total_classrooms_instructional')->default(24);
                $table->unsignedSmallInteger('classrooms_good_condition')->default(20);
                $table->unsignedSmallInteger('classrooms_minor_repair')->default(4);
                $table->unsignedSmallInteger('classrooms_major_repair')->default(0);
                $table->unsignedSmallInteger('total_other_rooms')->default(8);
                $table->boolean('land_available_for_expansion')->default(true);
                $table->boolean('playground_available')->default(true);
                $table->string('boundary_wall_type', 50)->default('Pucca with barbed wire');
                $table->boolean('drinking_water_available')->default(true);
                $table->string('drinking_water_source', 50)->default('RO Plant & Piped Tap Water');
                $table->boolean('drinking_water_functional')->default(true);
                $table->boolean('water_quality_tested')->default(true);
                $table->boolean('rainwater_harvesting')->default(true);
                $table->unsignedSmallInteger('boys_toilets_total')->default(12);
                $table->unsignedSmallInteger('boys_toilets_functional')->default(12);
                $table->unsignedSmallInteger('boys_cwsn_toilets')->default(2);
                $table->unsignedSmallInteger('girls_toilets_total')->default(14);
                $table->unsignedSmallInteger('girls_toilets_functional')->default(14);
                $table->unsignedSmallInteger('girls_cwsn_toilets')->default(2);
                $table->boolean('incinerator_in_girls_toilet')->default(true);
                $table->boolean('handwash_with_soap_facility')->default(true);
                $table->boolean('electricity_available')->default(true);
                $table->boolean('solar_panel_installed')->default(true);
                $table->boolean('fire_extinguisher_installed')->default(true);
                $table->boolean('cctv_available')->default(true);
                $table->boolean('ramp_for_disabled_with_handrail')->default(true);
                $table->boolean('medical_checkup_conducted')->default(true);
                $table->boolean('library_available')->default(true);
                $table->unsignedInteger('total_library_books')->default(4250);
                $table->boolean('science_lab_available')->default(true);
                $table->boolean('computer_lab_available')->default(true);
                $table->boolean('atl_lab_available')->default(true);
                $table->unsignedSmallInteger('total_functional_desktops')->default(48);
                $table->unsignedSmallInteger('total_functional_laptops')->default(16);
                $table->unsignedSmallInteger('smart_classrooms_projectors')->default(14);
                $table->boolean('internet_facility')->default(true);
                $table->string('internet_type', 50)->default('Fiber Broadband');
                $table->unsignedSmallInteger('internet_speed_mbps')->default(150);
                $table->timestamps();

                $table->unique(['school_id', 'academic_year'], 'udise_facilities_year_unique');
            });
        }

        // 3. UDISE+ Teacher Module Details
        if (!Schema::hasTable('udise_teacher_details')) {
            Schema::create('udise_teacher_details', function (Blueprint $table) {
                $table->id();
                $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade');
                $table->foreignId('school_id')->constrained('schools')->onDelete('cascade');
                $table->string('national_teacher_code', 30)->unique();
                $table->string('state_teacher_code', 30)->nullable();
                $table->string('social_category', 20)->default('General');
                $table->string('nature_of_appointment', 40)->default('Regular/Permanent');
                $table->string('academic_qualification', 60)->default('Post Graduate');
                $table->string('professional_qualification', 60)->default('B.Ed');
                $table->string('cadre_designation', 50)->default('PGT');
                $table->string('appointment_level', 50)->default('Secondary & Higher Secondary');
                $table->date('date_of_joining_service')->nullable();
                $table->date('date_of_joining_current_school')->nullable();
                $table->string('mathematics_studied_upto', 30)->default('Post Graduation');
                $table->string('science_studied_upto', 30)->default('Graduation');
                $table->string('english_studied_upto', 30)->default('Graduation');
                $table->string('social_studies_studied_upto', 30)->default('Secondary');
                $table->boolean('trained_in_ict')->default(true);
                $table->boolean('trained_for_cwsn')->default(true);
                $table->unsignedSmallInteger('in_service_training_days_last_year')->default(10);
                $table->boolean('is_cwsn_disability')->default(false);
                $table->timestamps();
            });
        }

        // 4. UDISE+ Student Module Details (PEN, Aadhaar, Categories, Progression)
        if (!Schema::hasTable('udise_student_details')) {
            Schema::create('udise_student_details', function (Blueprint $table) {
                $table->id();
                $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
                $table->foreignId('school_id')->constrained('schools')->onDelete('cascade');
                $table->string('pen', 15)->unique(); // 11-digit National Permanent Education Number
                $table->string('aadhaar_number', 20)->nullable();
                $table->string('name_as_per_aadhaar', 100)->nullable();
                $table->string('social_category', 20)->default('General'); // General, OBC, SC, ST
                $table->string('minority_group', 30)->default('None'); // Muslim, Christian, Sikh, Buddhist, Jain, None
                $table->boolean('is_bpl')->default(false);
                $table->boolean('is_aay')->default(false); // Antyodaya Anna Yojana
                $table->boolean('is_ews_disadvantaged')->default(false);
                $table->boolean('is_cwsn')->default(false);
                $table->string('disability_type', 50)->default('None');
                $table->unsignedSmallInteger('disability_percentage')->default(0);
                $table->boolean('indian_national')->default(true);
                $table->boolean('is_out_of_school_child')->default(false);
                $table->string('medium_of_instruction', 30)->default('English');
                $table->string('academic_stream', 30)->default('General'); // General, Science, Commerce, Arts
                $table->string('previous_academic_year_status', 50)->default('Studied at Same School');
                $table->string('previous_class_result', 40)->default('Promoted/Passed');
                $table->decimal('previous_class_percentage', 5, 2)->default(78.50);
                $table->unsignedSmallInteger('days_attended_previous_year')->default(195);
                $table->boolean('free_textbooks_received')->default(true);
                $table->boolean('free_uniforms_received')->default(true);
                $table->boolean('free_transport_received')->default(false);
                $table->string('scholarship_received', 40)->default('None'); // None, Central, State, Other
                $table->decimal('scholarship_amount', 8, 2)->default(0);
                $table->timestamps();
            });
        }

        // 5. UDISE+ Submission Status & Audit Log
        if (!Schema::hasTable('udise_submissions')) {
            Schema::create('udise_submissions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->onDelete('cascade');
                $table->string('academic_year', 20)->default('2024-2025');
                $table->string('status', 30)->default('In Progress'); // Draft, In Progress, Validated, Certified
                $table->decimal('completion_percentage', 5, 2)->default(85.00);
                $table->boolean('profile_completed')->default(true);
                $table->boolean('facilities_completed')->default(true);
                $table->boolean('teachers_completed')->default(true);
                $table->boolean('students_completed')->default(true);
                $table->unsignedSmallInteger('validation_errors_count')->default(0);
                $table->unsignedSmallInteger('validation_warnings_count')->default(2);
                $table->string('certified_by_name', 100)->nullable();
                $table->string('certified_by_designation', 50)->nullable();
                $table->timestamp('certified_at')->nullable();
                $table->string('dcf_acknowledgement_number', 50)->nullable();
                $table->timestamps();

                $table->unique(['school_id', 'academic_year'], 'udise_submission_year_unique');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('udise_submissions');
        Schema::dropIfExists('udise_student_details');
        Schema::dropIfExists('udise_teacher_details');
        Schema::dropIfExists('udise_school_facilities');
        Schema::dropIfExists('udise_school_profiles');
    }
};
