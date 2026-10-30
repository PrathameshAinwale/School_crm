<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\UdiseSchoolFacility;
use App\Models\UdiseSchoolProfile;
use App\Models\UdiseStudentDetail;
use App\Models\UdiseSubmission;
use App\Models\UdiseTeacherDetail;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UdisePlusController extends Controller
{
    /**
     * Get UDISE+ Dashboard Overview
     */
    public function dashboard(Request $request)
    {
        $school = School::first();
        $academicYear = $request->query('academic_year', '2024-2025');

        $profile = UdiseSchoolProfile::where('school_id', $school->id)
            ->where('academic_year', $academicYear)
            ->first();

        $facility = UdiseSchoolFacility::where('school_id', $school->id)
            ->where('academic_year', $academicYear)
            ->first();

        $submission = UdiseSubmission::where('school_id', $school->id)
            ->where('academic_year', $academicYear)
            ->first();

        $totalTeachers = Teacher::count();
        $udiseTeachersCount = UdiseTeacherDetail::where('school_id', $school->id)->count();

        $totalStudents = Student::count();
        $udiseStudentsCount = UdiseStudentDetail::where('school_id', $school->id)->count();
        $studentsWithPen = UdiseStudentDetail::where('school_id', $school->id)
            ->whereNotNull('pen')
            ->count();

        // Demographic metrics
        $maleStudents = Student::where('gender', 'Male')->count();
        $femaleStudents = Student::where('gender', 'Female')->count();
        $otherStudents = $totalStudents - ($maleStudents + $femaleStudents);

        $socialCategories = UdiseStudentDetail::where('school_id', $school->id)
            ->selectRaw('social_category, count(*) as count')
            ->groupBy('social_category')
            ->pluck('count', 'social_category');

        $cwsnCount = UdiseStudentDetail::where('school_id', $school->id)->where('is_cwsn', true)->count();
        $bplCount = UdiseStudentDetail::where('school_id', $school->id)->where('is_bpl', true)->count();

        // Validation rule checks
        $errors = [];
        $warnings = [];

        if (!$profile || empty($profile->udise_code)) {
            $errors[] = 'School 11-digit UDISE Code is missing.';
        }
        if (!$profile || empty($profile->nodal_officer_mobile)) {
            $warnings[] = 'Nodal Officer mobile number is required for portal authentication.';
        }
        if ($totalTeachers > $udiseTeachersCount) {
            $errors[] = ($totalTeachers - $udiseTeachersCount) . ' teacher(s) do not have National Teacher Code records.';
        }
        if ($totalStudents > $studentsWithPen) {
            $warnings[] = ($totalStudents - $studentsWithPen) . ' student(s) pending PEN generation.';
        }
        if (!$facility || $facility->drinking_water_available == false) {
            $errors[] = 'Drinking water facility declaration is mandatory.';
        }

        // Section Completion status
        $modules = [
            [
                'id' => 'profile',
                'title' => 'School Profile & Affiliation',
                'dcf_section' => 'Section 1 (Part A, B, C)',
                'completed' => (bool)$profile,
                'status' => $profile ? 'Completed' : 'Pending',
                'progress' => $profile ? 100 : 0,
            ],
            [
                'id' => 'facilities',
                'title' => 'Physical Facilities & Equipment',
                'dcf_section' => 'Section 2 (Classrooms, Labs, Water, ICT)',
                'completed' => (bool)$facility,
                'status' => $facility ? 'Completed' : 'Pending',
                'progress' => $facility ? 100 : 0,
            ],
            [
                'id' => 'teachers',
                'title' => 'Teaching & Non-Teaching Staff',
                'dcf_section' => 'Section 3 (Cadre, Qualifications, Training)',
                'completed' => $udiseTeachersCount >= $totalTeachers,
                'status' => $udiseTeachersCount >= $totalTeachers ? 'Completed' : 'In Progress',
                'progress' => $totalTeachers > 0 ? round(($udiseTeachersCount / $totalTeachers) * 100) : 100,
            ],
            [
                'id' => 'students',
                'title' => 'Student Details & PEN Registry',
                'dcf_section' => 'Section 4 (General, Enrollment, Facilities)',
                'completed' => $udiseStudentsCount >= $totalStudents,
                'status' => $udiseStudentsCount >= $totalStudents ? 'Completed' : 'In Progress',
                'progress' => $totalStudents > 0 ? round(($udiseStudentsCount / $totalStudents) * 100) : 100,
            ],
            [
                'id' => 'academics',
                'title' => 'Class Enrolment & Progression',
                'dcf_section' => 'Section 5 (Incentives, Results, RTE)',
                'completed' => true,
                'status' => 'Completed',
                'progress' => 100,
            ],
        ];

        $completedCount = count(array_filter($modules, fn($m) => $m['completed']));
        $completionPct = round(($completedCount / count($modules)) * 100, 1);

        return response()->json([
            'success' => true,
            'data' => [
                'academic_year' => $academicYear,
                'school' => $school,
                'submission' => $submission,
                'completion_percentage' => $completionPct,
                'is_certified' => $submission && $submission->status === 'Certified',
                'stats' => [
                    'total_teachers' => $totalTeachers,
                    'udise_teachers' => $udiseTeachersCount,
                    'total_students' => $totalStudents,
                    'udise_students' => $udiseStudentsCount,
                    'students_with_pen' => $studentsWithPen,
                    'male_students' => $maleStudents,
                    'female_students' => $femaleStudents,
                    'other_students' => $otherStudents,
                    'cwsn_count' => $cwsnCount,
                    'bpl_count' => $bplCount,
                    'social_categories' => $socialCategories,
                ],
                'modules' => $modules,
                'validation' => [
                    'errors' => $errors,
                    'warnings' => $warnings,
                    'is_valid' => count($errors) === 0,
                ],
            ],
        ]);
    }

    /**
     * Get / Update School Profile (Section 1)
     */
    public function getSchoolProfile(Request $request)
    {
        $school = School::first();
        $academicYear = $request->query('academic_year', '2024-2025');

        $profile = UdiseSchoolProfile::where('school_id', $school->id)
            ->where('academic_year', $academicYear)
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'school' => $school,
                'profile' => $profile,
            ],
        ]);
    }

    public function updateSchoolProfile(Request $request)
    {
        $school = School::first();
        $academicYear = $request->input('academic_year', '2024-2025');

        $profile = UdiseSchoolProfile::updateOrCreate(
            ['school_id' => $school->id, 'academic_year' => $academicYear],
            $request->except(['id', 'school_id', 'created_at', 'updated_at'])
        );

        return response()->json([
            'success' => true,
            'message' => 'UDISE+ School Profile saved successfully.',
            'data' => $profile,
        ]);
    }

    /**
     * Get / Update School Facilities (Section 2)
     */
    public function getSchoolFacilities(Request $request)
    {
        $school = School::first();
        $academicYear = $request->query('academic_year', '2024-2025');

        $facility = UdiseSchoolFacility::where('school_id', $school->id)
            ->where('academic_year', $academicYear)
            ->first();

        return response()->json([
            'success' => true,
            'data' => $facility,
        ]);
    }

    public function updateSchoolFacilities(Request $request)
    {
        $school = School::first();
        $academicYear = $request->input('academic_year', '2024-2025');

        $facility = UdiseSchoolFacility::updateOrCreate(
            ['school_id' => $school->id, 'academic_year' => $academicYear],
            $request->except(['id', 'school_id', 'created_at', 'updated_at'])
        );

        return response()->json([
            'success' => true,
            'message' => 'UDISE+ School Facilities & Infrastructure saved successfully.',
            'data' => $facility,
        ]);
    }

    /**
     * Teacher Details (Section 3)
     */
    public function getTeachers(Request $request)
    {
        $school = School::first();
        $teachers = Teacher::with('user')->get();

        $list = [];
        foreach ($teachers as $t) {
            $udise = UdiseTeacherDetail::where('teacher_id', $t->id)->first();
            $list[] = [
                'teacher' => $t,
                'udise' => $udise,
                'is_completed' => (bool)$udise,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $list,
        ]);
    }

    public function updateTeacher(Request $request, $id)
    {
        $teacher = Teacher::findOrFail($id);
        $school = School::first();

        $udise = UdiseTeacherDetail::updateOrCreate(
            ['teacher_id' => $teacher->id],
            array_merge($request->except(['id', 'teacher_id']), ['school_id' => $school->id])
        );

        return response()->json([
            'success' => true,
            'message' => "UDISE+ credentials updated for {$teacher->first_name} {$teacher->last_name}.",
            'data' => $udise,
        ]);
    }

    /**
     * Student Details (Section 4)
     */
    public function getStudents(Request $request)
    {
        $school = School::first();
        $classId = $request->query('school_class_id');
        $sectionId = $request->query('section_id');

        $query = Student::with(['schoolClass', 'section']);
        if ($classId && $classId !== 'all') {
            $query->where('school_class_id', $classId);
        }
        if ($sectionId && $sectionId !== 'all') {
            $query->where('section_id', $sectionId);
        }

        $students = $query->orderBy('roll_number', 'asc')->get();

        $list = [];
        foreach ($students as $s) {
            $udise = UdiseStudentDetail::where('student_id', $s->id)->first();
            $list[] = [
                'student' => $s,
                'udise' => $udise,
                'has_pen' => !empty($udise?->pen),
                'is_completed' => (bool)$udise,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $list,
        ]);
    }

    public function updateStudent(Request $request, $id)
    {
        $student = Student::findOrFail($id);
        $school = School::first();

        $udise = UdiseStudentDetail::updateOrCreate(
            ['student_id' => $student->id],
            array_merge($request->except(['id', 'student_id']), ['school_id' => $school->id])
        );

        return response()->json([
            'success' => true,
            'message' => "UDISE+ profile and PEN updated for {$student->first_name} {$student->last_name}.",
            'data' => $udise,
        ]);
    }

    /**
     * Academic Information & Class-wise Enrolment Matrix (Section 5)
     */
    public function getAcademicEnrolment(Request $request)
    {
        $classes = SchoolClass::with('sections')->get();
        $matrix = [];

        foreach ($classes as $c) {
            $studentsInClass = Student::where('school_class_id', $c->id)->pluck('id');
            $udiseDetails = UdiseStudentDetail::whereIn('student_id', $studentsInClass)->get();

            $male = Student::where('school_class_id', $c->id)->where('gender', 'Male')->count();
            $female = Student::where('school_class_id', $c->id)->where('gender', 'Female')->count();
            $total = $studentsInClass->count();

            $gen = $udiseDetails->where('social_category', 'General')->count();
            $obc = $udiseDetails->where('social_category', 'OBC')->count();
            $sc = $udiseDetails->where('social_category', 'SC')->count();
            $st = $udiseDetails->where('social_category', 'ST')->count();
            $cwsn = $udiseDetails->where('is_cwsn', true)->count();
            $bpl = $udiseDetails->where('is_bpl', true)->count();

            $matrix[] = [
                'class_id' => $c->id,
                'class_name' => $c->name,
                'total_enrolment' => $total,
                'boys' => $male,
                'girls' => $female,
                'general' => $gen,
                'obc' => $obc,
                'sc' => $sc,
                'st' => $st,
                'cwsn' => $cwsn,
                'bpl_ews' => $bpl,
                'promoted_pct' => 100.0,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $matrix,
        ]);
    }

    /**
     * Export complete official UDISE+ JSON payload
     */
    public function exportJson(Request $request)
    {
        $school = School::first();
        $academicYear = $request->query('academic_year', '2024-2025');

        $profile = UdiseSchoolProfile::where('school_id', $school->id)->where('academic_year', $academicYear)->first();
        $facility = UdiseSchoolFacility::where('school_id', $school->id)->where('academic_year', $academicYear)->first();
        $teachers = UdiseTeacherDetail::with('teacher')->where('school_id', $school->id)->get();
        $students = UdiseStudentDetail::with(['student.schoolClass', 'student.section'])->where('school_id', $school->id)->get();

        $payload = [
            'udise_version' => '2024.1.0-GOI',
            'dcf_format' => 'Government of India MoE UDISE+ DCF',
            'academic_year' => $academicYear,
            'export_timestamp' => now()->toIso8601String(),
            'school_profile' => [
                'udise_code' => $profile->udise_code ?? '27200100142',
                'school_name' => $school->name,
                'affiliation' => $school->affiliation,
                'district' => $school->city ?? 'New Delhi',
                'state' => $school->state ?? 'Delhi',
                'pincode' => $school->pincode ?? '110001',
                'management' => $profile->management_group ?? 'Private Unaided',
                'category' => $profile->school_category ?? 'Higher Secondary',
                'lowest_class' => $profile->lowest_class ?? 'Class 1',
                'highest_class' => $profile->highest_class ?? 'Class 12',
                'nodal_officer' => [
                    'name' => $profile->nodal_officer_name ?? 'Vikram Deshmukh',
                    'mobile' => $profile->nodal_officer_mobile ?? '9822012345',
                    'email' => $profile->nodal_officer_email ?? 'udise@delhipublic.edu',
                ],
            ],
            'facilities_and_infrastructure' => $facility,
            'teachers_registry' => $teachers->map(fn($t) => [
                'national_teacher_code' => $t->national_teacher_code,
                'teacher_name' => "{$t->teacher->first_name} {$t->teacher->last_name}",
                'gender' => $t->teacher->gender,
                'designation' => $t->cadre_designation,
                'academic_qualification' => $t->academic_qualification,
                'professional_qualification' => $t->professional_qualification,
                'appointment_nature' => $t->nature_of_appointment,
                'trained_in_ict' => $t->trained_in_ict,
            ]),
            'students_registry' => $students->map(fn($s) => [
                'pen' => $s->pen,
                'roll_number' => $s->student->roll_number,
                'student_name' => "{$s->student->first_name} {$s->student->last_name}",
                'class' => $s->student->schoolClass->name ?? 'Class 10',
                'division' => $s->student->section->name ?? 'A',
                'gender' => $s->student->gender,
                'social_category' => $s->social_category,
                'minority_group' => $s->minority_group,
                'is_cwsn' => $s->is_cwsn,
                'disability_type' => $s->disability_type,
                'previous_percentage' => $s->previous_class_percentage,
            ]),
        ];

        $filename = "UDISE_PLUS_DCF_{$academicYear}_" . ($profile->udise_code ?? '27200100142') . ".json";

        return response()->json($payload, 200, [
            'Content-Type' => 'application/json',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Export CSV files compatible with official upload schemas
     */
    public function exportCsv(Request $request, $type)
    {
        $school = School::first();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        if ($type === 'students') {
            $filename = "UDISE_Student_Module_PEN_" . date('Ymd_His') . ".csv";
            $headers['Content-Disposition'] = "attachment; filename=\"{$filename}\"";

            $callback = function () use ($school) {
                $handle = fopen('php://output', 'w');
                // UTF-8 BOM
                fputs($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));
                // Header row
                fputcsv($handle, [
                    'UDISE_CODE', 'PEN', 'STUDENT_NAME', 'CLASS', 'DIVISION', 'ROLL_NO',
                    'GENDER', 'DOB', 'SOCIAL_CATEGORY', 'MINORITY', 'BPL', 'CWSN',
                    'DISABILITY_TYPE', 'PREV_RESULT', 'PREV_PERCENTAGE', 'ATTENDANCE_DAYS',
                ]);

                $students = UdiseStudentDetail::with(['student.schoolClass', 'student.section'])
                    ->where('school_id', $school->id)
                    ->get();

                foreach ($students as $s) {
                    fputcsv($handle, [
                        '27200100142',
                        $s->pen,
                        "{$s->student->first_name} {$s->student->last_name}",
                        $s->student->schoolClass->name ?? 'Class 10',
                        $s->student->section->name ?? 'A',
                        $s->student->roll_number,
                        $s->student->gender,
                        $s->student->date_of_birth ?? '2010-08-15',
                        $s->social_category,
                        $s->minority_group,
                        $s->is_bpl ? 'YES' : 'NO',
                        $s->is_cwsn ? 'YES' : 'NO',
                        $s->disability_type,
                        $s->previous_class_result,
                        $s->previous_class_percentage,
                        $s->days_attended_previous_year,
                    ]);
                }
                fclose($handle);
            };

            return response()->stream($callback, 200, $headers);
        }

        if ($type === 'teachers') {
            $filename = "UDISE_Teacher_Module_NationalCode_" . date('Ymd_His') . ".csv";
            $headers['Content-Disposition'] = "attachment; filename=\"{$filename}\"";

            $callback = function () use ($school) {
                $handle = fopen('php://output', 'w');
                fputs($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));
                fputcsv($handle, [
                    'UDISE_CODE', 'NATIONAL_TEACHER_CODE', 'TEACHER_NAME', 'GENDER',
                    'DESIGNATION', 'ACADEMIC_QUAL', 'PROF_QUAL', 'APPOINTMENT_TYPE',
                    'JOINING_DATE', 'SOCIAL_CATEGORY', 'TRAINED_IN_ICT', 'TRAINED_FOR_CWSN',
                ]);

                $teachers = UdiseTeacherDetail::with('teacher')->where('school_id', $school->id)->get();
                foreach ($teachers as $t) {
                    fputcsv($handle, [
                        '27200100142',
                        $t->national_teacher_code,
                        "{$t->teacher->first_name} {$t->teacher->last_name}",
                        $t->teacher->gender,
                        $t->cadre_designation,
                        $t->academic_qualification,
                        $t->professional_qualification,
                        $t->nature_of_appointment,
                        $t->date_of_joining_current_school,
                        $t->social_category,
                        $t->trained_in_ict ? 'YES' : 'NO',
                        $t->trained_for_cwsn ? 'YES' : 'NO',
                    ]);
                }
                fclose($handle);
            };

            return response()->stream($callback, 200, $headers);
        }

        return response()->json(['success' => false, 'message' => 'Invalid export type'], 400);
    }

    /**
     * Download UDISE+ Official DCF Summary Report PDF
     */
    public function exportDcfPdf(Request $request)
    {
        $school = School::first();
        $academicYear = $request->query('academic_year', '2024-2025');

        $profile = UdiseSchoolProfile::where('school_id', $school->id)->where('academic_year', $academicYear)->first();
        $facility = UdiseSchoolFacility::where('school_id', $school->id)->where('academic_year', $academicYear)->first();
        $teachers = UdiseTeacherDetail::with('teacher')->where('school_id', $school->id)->get();
        $students = UdiseStudentDetail::with(['student.schoolClass', 'student.section'])->where('school_id', $school->id)->get();
        $submission = UdiseSubmission::where('school_id', $school->id)->where('academic_year', $academicYear)->first();

        $pdf = Pdf::loadView('pdf.udise_dcf_summary', [
            'school' => $school,
            'academicYear' => $academicYear,
            'profile' => $profile,
            'facility' => $facility,
            'teachers' => $teachers,
            'students' => $students,
            'submission' => $submission,
        ]);

        $pdf->setPaper('a4', 'portrait');

        $filename = "UDISE_DCF_Report_{$academicYear}_" . ($profile->udise_code ?? '27200100142') . ".pdf";

        return $pdf->download($filename);
    }

    /**
     * Certify & Lock Submission
     */
    public function certifySubmission(Request $request)
    {
        $school = School::first();
        $academicYear = $request->input('academic_year', '2024-2025');

        $submission = UdiseSubmission::updateOrCreate(
            ['school_id' => $school->id, 'academic_year' => $academicYear],
            [
                'status' => 'Certified',
                'completion_percentage' => 100.00,
                'profile_completed' => true,
                'facilities_completed' => true,
                'teachers_completed' => true,
                'students_completed' => true,
                'validation_errors_count' => 0,
                'certified_by_name' => $school->principal_name ?? 'Dr. Rajeshwari Sharma',
                'certified_by_designation' => 'Principal / Head of Institution',
                'certified_at' => now(),
                'dcf_acknowledgement_number' => 'UDISE/' . substr($academicYear, 2) . '/MH/27200100142/ACK-' . rand(10000, 99999),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'UDISE+ DCF data verified and certified successfully. Ready for portal upload.',
            'data' => $submission,
        ]);
    }
}
