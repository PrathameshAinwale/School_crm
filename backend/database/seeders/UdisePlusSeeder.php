<?php

namespace Database\Seeders;

use App\Models\School;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\UdiseSchoolFacility;
use App\Models\UdiseSchoolProfile;
use App\Models\UdiseStudentDetail;
use App\Models\UdiseSubmission;
use App\Models\UdiseTeacherDetail;
use Illuminate\Database\Seeder;

class UdisePlusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $school = School::first();
        if (!$school) return;

        // 1. School Profile
        UdiseSchoolProfile::firstOrCreate(
            ['school_id' => $school->id, 'academic_year' => '2024-2025'],
            [
                'udise_code' => '27200100142', // 11 digit official code
                'school_category' => 'Higher Secondary (1-12)',
                'management_group' => 'Private Unaided (Recognized)',
                'type_of_school' => 'Co-educational',
                'lowest_class' => 'Class 1',
                'highest_class' => 'Class 12',
                'pre_primary_section' => true,
                'establishment_year' => 2008,
                'recognition_year_primary' => 2008,
                'recognition_year_upper_primary' => 2011,
                'recognition_year_secondary' => 2015,
                'recognition_year_higher_secondary' => 2018,
                'affiliation_board_secondary' => 'CBSE',
                'affiliation_no_secondary' => 'CBSE/AFF/2130842',
                'affiliation_board_higher_secondary' => 'CBSE',
                'affiliation_no_higher_secondary' => 'CBSE/AFF/2130842/SR',
                'medium_of_instruction_1' => 'English',
                'medium_of_instruction_2' => 'Hindi',
                'medium_of_instruction_3' => 'Marathi',
                'distance_from_primary_school_km' => 0.5,
                'distance_from_secondary_school_km' => 1.2,
                'is_residential' => false,
                'is_shift_school' => false,
                'is_special_school_cwsn' => false,
                'head_of_school_type' => 'Principal',
                'head_of_school_name' => $school->principal_name ?? 'Dr. Rajeshwari Sharma',
                'head_of_school_mobile' => '9876543210',
                'nodal_officer_name' => 'Vikram Deshmukh',
                'nodal_officer_mobile' => '9822012345',
                'nodal_officer_email' => 'udise.nodal@delhipublic.edu',
            ]
        );

        // 2. School Facilities
        UdiseSchoolFacility::firstOrCreate(
            ['school_id' => $school->id, 'academic_year' => '2024-2025'],
            [
                'building_status' => 'Owned',
                'total_classrooms_instructional' => 24,
                'classrooms_good_condition' => 20,
                'classrooms_minor_repair' => 4,
                'classrooms_major_repair' => 0,
                'total_other_rooms' => 8,
                'land_available_for_expansion' => true,
                'playground_available' => true,
                'boundary_wall_type' => 'Pucca with barbed wire',
                'drinking_water_available' => true,
                'drinking_water_source' => 'RO Plant & Piped Tap Water',
                'drinking_water_functional' => true,
                'water_quality_tested' => true,
                'rainwater_harvesting' => true,
                'boys_toilets_total' => 12,
                'boys_toilets_functional' => 12,
                'boys_cwsn_toilets' => 2,
                'girls_toilets_total' => 14,
                'girls_toilets_functional' => 14,
                'girls_cwsn_toilets' => 2,
                'incinerator_in_girls_toilet' => true,
                'handwash_with_soap_facility' => true,
                'electricity_available' => true,
                'solar_panel_installed' => true,
                'fire_extinguisher_installed' => true,
                'cctv_available' => true,
                'ramp_for_disabled_with_handrail' => true,
                'medical_checkup_conducted' => true,
                'library_available' => true,
                'total_library_books' => 4250,
                'science_lab_available' => true,
                'computer_lab_available' => true,
                'atl_lab_available' => true,
                'total_functional_desktops' => 48,
                'total_functional_laptops' => 16,
                'smart_classrooms_projectors' => 14,
                'internet_facility' => true,
                'internet_type' => 'Fiber Broadband',
                'internet_speed_mbps' => 150,
            ]
        );

        // 3. Teachers UDISE Details
        $teachers = Teacher::all();
        $socialCats = ['General', 'OBC', 'General', 'SC'];
        $qualifications = ['Post Graduate', 'Doctorate', 'Post Graduate', 'Graduate'];
        $profQuals = ['B.Ed', 'Ph.D & B.Ed', 'M.Ed', 'B.Ed'];
        $cadres = ['PGT', 'Principal / PGT', 'TGT', 'PRT'];

        foreach ($teachers as $idx => $teacher) {
            UdiseTeacherDetail::firstOrCreate(
                ['teacher_id' => $teacher->id],
                [
                    'school_id' => $school->id,
                    'national_teacher_code' => 'TCH-IND-2024-' . str_pad($teacher->id, 3, '0', STR_PAD_LEFT),
                    'state_teacher_code' => 'MH-EDU-' . ($teacher->id + 100),
                    'social_category' => $socialCats[$idx % count($socialCats)],
                    'nature_of_appointment' => 'Regular/Permanent',
                    'academic_qualification' => $qualifications[$idx % count($qualifications)],
                    'professional_qualification' => $profQuals[$idx % count($profQuals)],
                    'cadre_designation' => $cadres[$idx % count($cadres)],
                    'appointment_level' => 'Secondary & Higher Secondary',
                    'date_of_joining_service' => $teacher->joining_date ?? '2019-06-15',
                    'date_of_joining_current_school' => $teacher->joining_date ?? '2019-06-15',
                    'mathematics_studied_upto' => 'Post Graduation',
                    'science_studied_upto' => 'Graduation',
                    'english_studied_upto' => 'Graduation',
                    'social_studies_studied_upto' => 'Secondary',
                    'trained_in_ict' => true,
                    'trained_for_cwsn' => true,
                    'in_service_training_days_last_year' => 10,
                    'is_cwsn_disability' => false,
                ]
            );
        }

        // 4. Students UDISE Details (PEN & DCF fields)
        $students = Student::all();
        $studentCats = ['General', 'OBC', 'General', 'SC', 'OBC', 'General', 'ST', 'General', 'OBC'];
        $minorities = ['None', 'None', 'None', 'None', 'Muslim', 'None', 'Jain', 'None', 'Christian'];

        foreach ($students as $sIdx => $student) {
            $penNumber = '20241001' . str_pad($student->id, 4, '0', STR_PAD_LEFT);
            $aadhaarMasked = 'XXXX-XXXX-' . (3450 + $student->id * 17);

            UdiseStudentDetail::firstOrCreate(
                ['student_id' => $student->id],
                [
                    'school_id' => $school->id,
                    'pen' => $penNumber,
                    'aadhaar_number' => $aadhaarMasked,
                    'name_as_per_aadhaar' => "{$student->first_name} {$student->last_name}",
                    'social_category' => $studentCats[$sIdx % count($studentCats)],
                    'minority_group' => $minorities[$sIdx % count($minorities)],
                    'is_bpl' => ($sIdx === 3 || $sIdx === 6),
                    'is_aay' => false,
                    'is_ews_disadvantaged' => ($sIdx === 3),
                    'is_cwsn' => ($sIdx === 5), // One CWSN student for demonstration
                    'disability_type' => ($sIdx === 5) ? 'Locomotor Impairment' : 'None',
                    'disability_percentage' => ($sIdx === 5) ? 40 : 0,
                    'indian_national' => true,
                    'is_out_of_school_child' => false,
                    'medium_of_instruction' => 'English',
                    'academic_stream' => 'General',
                    'previous_academic_year_status' => 'Studied at Same School',
                    'previous_class_result' => 'Promoted/Passed',
                    'previous_class_percentage' => 76.50 + ($sIdx * 2.2),
                    'days_attended_previous_year' => 188 + ($sIdx * 3),
                    'free_textbooks_received' => true,
                    'free_uniforms_received' => true,
                    'free_transport_received' => (bool)$student->with_transport,
                    'scholarship_received' => ($sIdx === 3 || $sIdx === 6) ? 'State Merit Scholarship' : 'None',
                    'scholarship_amount' => ($sIdx === 3 || $sIdx === 6) ? 5000.00 : 0.00,
                ]
            );
        }

        // 5. UDISE Submission Status
        UdiseSubmission::firstOrCreate(
            ['school_id' => $school->id, 'academic_year' => '2024-2025'],
            [
                'status' => 'Validated',
                'completion_percentage' => 96.50,
                'profile_completed' => true,
                'facilities_completed' => true,
                'teachers_completed' => true,
                'students_completed' => true,
                'validation_errors_count' => 0,
                'validation_warnings_count' => 1,
                'certified_by_name' => $school->principal_name ?? 'Dr. Rajeshwari Sharma',
                'certified_by_designation' => 'Principal / Head of Institution',
                'certified_at' => now(),
                'dcf_acknowledgement_number' => 'UDISE/2024-25/MH/27200100142/ACK-88912',
            ]
        );
    }
}
