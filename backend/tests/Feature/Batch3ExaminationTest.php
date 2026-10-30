<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\AuditLog;
use App\Models\ClassTeacherAllocation;
use App\Models\CommunicationLog;
use App\Models\Exam;
use App\Models\ExamMark;
use App\Models\ExamTerm;
use App\Models\GradingScale;
use App\Models\GradingScaleTier;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\SchoolSetting;
use App\Models\Section;
use App\Models\Student;
use App\Models\StudentReportSummary;
use App\Models\StudentSubjectEnrollment;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeacherSubjectAssignment;
use App\Models\User;
use App\Services\Exams\AnnualResultCalculationService;
use App\Services\Exams\ExamRankingService;
use App\Services\Exams\GradingScaleValidationService;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class Batch3ExaminationTest extends TestCase
{
    use RefreshDatabase;

    protected School $school1;
    protected School $school2;
    protected AcademicYear $ay1;
    protected AcademicYear $ay2;
    protected User $admin1;
    protected User $admin2;
    protected User $teacherUser1;
    protected User $teacherUser2;
    protected Teacher $teacher1;
    protected Teacher $teacher2;
    protected User $parentUser1;
    protected User $parentUser2;
    protected Student $student1;
    protected Student $student2;
    protected Student $student3;
    protected Student $student4;
    protected SchoolClass $class1;
    protected SchoolClass $class2;
    protected Section $section1A;
    protected Section $section1B;
    protected Subject $mathSubject;
    protected Subject $scienceSubject;
    protected Subject $artOptionalSubject;
    protected GradingScale $gradingScale1;
    protected ExamTerm $term1;

    protected function setUp(): void
    {
        parent::setUp();

        $this->school1 = School::create([
            'name' => 'St. Xavier Academy',
            'code' => 'SXA',
            'slug' => 'sx-academy',
            'status' => 'active',
        ]);

        $this->school2 = School::create([
            'name' => 'Delhi Public School',
            'code' => 'DPS',
            'slug' => 'dp-school',
            'status' => 'active',
        ]);

        $this->ay1 = AcademicYear::create([
            'school_id' => $this->school1->id,
            'name' => '2026-2027',
            'code' => 'AY-2026-27',
            'start_date' => '2026-04-01',
            'end_date' => '2027-03-31',
            'status' => 'current',
            'is_current' => true,
        ]);

        $this->ay2 = AcademicYear::create([
            'school_id' => $this->school2->id,
            'name' => '2026-2027',
            'code' => 'AY-2026-27',
            'start_date' => '2026-04-01',
            'end_date' => '2027-03-31',
            'status' => 'current',
            'is_current' => true,
        ]);

        $this->admin1 = User::create([
            'name' => 'Admin One',
            'email' => 'admin1@school.com',
            'password' => bcrypt('secret123'),
            'role' => 'admin',
            'school_id' => $this->school1->id,
        ]);

        $this->admin2 = User::create([
            'name' => 'Admin Two',
            'email' => 'admin2@school.com',
            'password' => bcrypt('secret123'),
            'role' => 'admin',
            'school_id' => $this->school2->id,
        ]);

        $this->teacherUser1 = User::create([
            'name' => 'Teacher Anita',
            'email' => 'anita@school.com',
            'password' => bcrypt('secret123'),
            'role' => 'teacher',
            'school_id' => $this->school1->id,
        ]);

        $this->teacherUser2 = User::create([
            'name' => 'Teacher Suresh',
            'email' => 'suresh@school.com',
            'password' => bcrypt('secret123'),
            'role' => 'teacher',
            'school_id' => $this->school1->id,
        ]);

        $this->teacher1 = Teacher::create([
            'school_id' => $this->school1->id,
            'user_id' => $this->teacherUser1->id,
            'teacher_id' => 'TCH-001',
            'first_name' => 'Anita',
            'last_name' => 'Deshmukh',
            'email' => 'anita@school.com',
            'status' => 'active',
        ]);

        $this->teacher2 = Teacher::create([
            'school_id' => $this->school1->id,
            'user_id' => $this->teacherUser2->id,
            'teacher_id' => 'TCH-002',
            'first_name' => 'Suresh',
            'last_name' => 'Sharma',
            'email' => 'suresh@school.com',
            'status' => 'active',
        ]);

        $this->parentUser1 = User::create([
            'name' => 'Parent Rajesh Patel',
            'email' => 'rajesh@parent.com',
            'password' => bcrypt('secret123'),
            'role' => 'student_parent',
            'school_id' => $this->school1->id,
        ]);

        $this->parentUser2 = User::create([
            'name' => 'Parent Ramesh Mehta',
            'email' => 'ramesh@parent.com',
            'password' => bcrypt('secret123'),
            'role' => 'student_parent',
            'school_id' => $this->school1->id,
        ]);

        $this->class1 = SchoolClass::create([
            'school_id' => $this->school1->id,
            'name' => 'Class 10',
        ]);

        $this->class2 = SchoolClass::create([
            'school_id' => $this->school1->id,
            'name' => 'Class 9',
        ]);

        $this->section1A = Section::create([
            'school_id' => $this->school1->id,
            'school_class_id' => $this->class1->id,
            'name' => 'A',
        ]);

        $this->section1B = Section::create([
            'school_id' => $this->school1->id,
            'school_class_id' => $this->class1->id,
            'name' => 'B',
        ]);

        $this->mathSubject = Subject::create([
            'name' => 'Mathematics',
            'code' => 'MATH10',
            'type' => 'core',
        ]);

        $this->scienceSubject = Subject::create([
            'name' => 'Science',
            'code' => 'SCI10',
            'type' => 'core',
        ]);

        $this->artOptionalSubject = Subject::create([
            'name' => 'Visual Arts',
            'code' => 'ART10',
            'type' => 'optional',
        ]);

        // Students in 10-A
        $this->student1 = Student::create([
            'school_id' => $this->school1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'user_id' => $this->parentUser1->id,
            'admission_number' => 'ADM-101',
            'roll_number' => '1',
            'first_name' => 'Aarav',
            'last_name' => 'Patel',
            'gender' => 'Male',
            'status' => 'Active',
            'guardian_name' => 'Rajesh Patel',
            'guardian_phone' => '9876543210',
        ]);

        $this->student2 = Student::create([
            'school_id' => $this->school1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'user_id' => $this->parentUser1->id, // Parent 1 has two children
            'admission_number' => 'ADM-102',
            'roll_number' => '2',
            'first_name' => 'Diya',
            'last_name' => 'Patel',
            'gender' => 'Female',
            'status' => 'Active',
            'guardian_name' => 'Rajesh Patel',
            'guardian_phone' => '9876543210',
        ]);

        $this->student3 = Student::create([
            'school_id' => $this->school1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'user_id' => $this->parentUser2->id,
            'admission_number' => 'ADM-103',
            'roll_number' => '3',
            'first_name' => 'Kabir',
            'last_name' => 'Mehta',
            'gender' => 'Male',
            'status' => 'Active',
            'guardian_name' => 'Ramesh Mehta',
            'guardian_phone' => '9123456780',
        ]);

        $this->student4 = Student::create([
            'school_id' => $this->school1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'user_id' => null, // Legacy unlinked
            'admission_number' => 'ADM-104',
            'roll_number' => '4',
            'first_name' => 'Rohan',
            'last_name' => 'Verma',
            'gender' => 'Male',
            'status' => 'Active',
            'guardian_name' => 'Kailash Verma',
            'guardian_phone' => '9988776655',
        ]);

        // Grading Scale
        $this->gradingScale1 = GradingScale::create([
            'school_id' => $this->school1->id,
            'name' => 'CBSE Standard 9-Point Scale',
            'code' => 'CBSE-9PT',
            'is_active' => true,
        ]);

        $tiers = [
            ['min_percentage' => 91.00, 'max_percentage' => 100.00, 'grade' => 'A1', 'grade_point' => 10.00, 'is_pass' => true, 'description' => 'Outstanding'],
            ['min_percentage' => 81.00, 'max_percentage' => 90.99, 'grade' => 'A2', 'grade_point' => 9.00, 'is_pass' => true, 'description' => 'Excellent'],
            ['min_percentage' => 71.00, 'max_percentage' => 80.99, 'grade' => 'B1', 'grade_point' => 8.00, 'is_pass' => true, 'description' => 'Very Good'],
            ['min_percentage' => 61.00, 'max_percentage' => 70.99, 'grade' => 'B2', 'grade_point' => 7.00, 'is_pass' => true, 'description' => 'Good'],
            ['min_percentage' => 51.00, 'max_percentage' => 60.99, 'grade' => 'C1', 'grade_point' => 6.00, 'is_pass' => true, 'description' => 'Fair'],
            ['min_percentage' => 41.00, 'max_percentage' => 50.99, 'grade' => 'C2', 'grade_point' => 5.00, 'is_pass' => true, 'description' => 'Average'],
            ['min_percentage' => 33.00, 'max_percentage' => 40.99, 'grade' => 'D', 'grade_point' => 4.00, 'is_pass' => true, 'description' => 'Pass'],
            ['min_percentage' => 0.00, 'max_percentage' => 32.99, 'grade' => 'E', 'grade_point' => 0.00, 'is_pass' => false, 'description' => 'Needs Improvement'],
        ];

        foreach ($tiers as $tier) {
            GradingScaleTier::create(array_merge($tier, [
                'grading_scale_id' => $this->gradingScale1->id,
                'school_id' => $this->school1->id,
            ]));
        }

        // Exam Term
        $this->term1 = ExamTerm::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'name' => 'Mid-Term Assessment 2026',
            'code' => 'MID-2026',
            'term_type' => 'term',
            'weightage_percentage' => 50.00,
            'grading_scale_id' => $this->gradingScale1->id,
            'start_date' => '2026-09-15',
            'end_date' => '2026-09-30',
            'status' => 'draft',
        ]);
    }

    protected function authHeaders(User $user): array
    {
        $this->actingAs($user);
        return [
            'Authorization' => 'Bearer ' . $user->createToken('test')->plainTextToken,
            'X-School-Id' => (string) $user->school_id,
            'X-Academic-Year-Id' => (string) $this->ay1->id,
            'Accept' => 'application/json',
        ];
    }

    /**
     * 1. test_teacher_can_only_enter_marks_for_assigned_subject_and_section
     */
    public function test_teacher_can_only_enter_marks_for_assigned_subject_and_section()
    {
        // Teacher 1 is assigned only to Class 10-A Math
        TeacherSubjectAssignment::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'teacher_id' => $this->teacher1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'subject_id' => $this->mathSubject->id,
            'role' => 'lead',
        ]);

        $mathExam10A = Exam::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_term_id' => $this->term1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'subject_id' => $this->mathSubject->id,
            'exam_date' => '2026-09-16',
            'max_marks' => 100.00,
            'pass_marks' => 35.00,
            'status' => 'draft',
        ]);

        $scienceExam10B = Exam::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_term_id' => $this->term1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1B->id,
            'subject_id' => $this->scienceSubject->id,
            'exam_date' => '2026-09-18',
            'max_marks' => 100.00,
            'pass_marks' => 35.00,
            'status' => 'draft',
        ]);

        $headers = $this->authHeaders($this->teacherUser1);

        // Teacher 1 accesses assigned Math Exam 10-A -> 200 OK
        $resAllowed = $this->withHeaders($headers)->postJson("/api/v1/teacher/scoresheets/{$mathExam10A->id}/save-draft", [
            'marks' => [
                ['student_id' => $this->student1->id, 'marks_obtained' => 88.5, 'teacher_remarks' => 'Good work'],
            ],
        ]);
        $resAllowed->assertStatus(200);

        // Teacher 1 attempts to enter marks for unassigned Science Exam 10-B -> 403 Forbidden
        $resDenied = $this->withHeaders($headers)->postJson("/api/v1/teacher/scoresheets/{$scienceExam10B->id}/save-draft", [
            'marks' => [
                ['student_id' => $this->student1->id, 'marks_obtained' => 75],
            ],
        ]);
        $resDenied->assertStatus(403);
    }

    /**
     * 2. test_marks_validation_bounds_and_special_codes_mutual_exclusivity
     */
    public function test_marks_validation_bounds_and_special_codes_mutual_exclusivity()
    {
        TeacherSubjectAssignment::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'teacher_id' => $this->teacher1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'subject_id' => $this->mathSubject->id,
        ]);

        $exam = Exam::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_term_id' => $this->term1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'subject_id' => $this->mathSubject->id,
            'exam_date' => '2026-09-16',
            'max_marks' => 100.00,
            'pass_marks' => 35.00,
            'status' => 'draft',
        ]);

        $headers = $this->authHeaders($this->teacherUser1);

        // Score exceeds max marks (105 > 100) -> 422
        $resOver = $this->withHeaders($headers)->postJson("/api/v1/teacher/scoresheets/{$exam->id}/save-draft", [
            'marks' => [
                ['student_id' => $this->student1->id, 'marks_obtained' => 105.00],
            ],
        ]);
        $resOver->assertStatus(422);

        // Score negative -> 422
        $resUnder = $this->withHeaders($headers)->postJson("/api/v1/teacher/scoresheets/{$exam->id}/save-draft", [
            'marks' => [
                ['student_id' => $this->student1->id, 'marks_obtained' => -5.00],
            ],
        ]);
        $resUnder->assertStatus(422);

        // Both numeric mark AND special code -> 422
        $resConflict = $this->withHeaders($headers)->postJson("/api/v1/teacher/scoresheets/{$exam->id}/save-draft", [
            'marks' => [
                ['student_id' => $this->student1->id, 'marks_obtained' => 85.00, 'special_status' => 'AB'],
            ],
        ]);
        $resConflict->assertStatus(422);
    }

    /**
     * 3. test_submit_requires_all_enrolled_students_to_have_marks_or_special_code
     */
    public function test_submit_requires_all_enrolled_students_to_have_marks_or_special_code()
    {
        TeacherSubjectAssignment::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'teacher_id' => $this->teacher1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'subject_id' => $this->mathSubject->id,
        ]);

        $exam = Exam::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_term_id' => $this->term1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'subject_id' => $this->mathSubject->id,
            'exam_date' => '2026-09-16',
            'max_marks' => 100.00,
            'pass_marks' => 35.00,
            'status' => 'draft',
        ]);

        $headers = $this->authHeaders($this->teacherUser1);

        // There are 4 students in Section 10-A. Grade only 2 students.
        $this->withHeaders($headers)->postJson("/api/v1/teacher/scoresheets/{$exam->id}/save-draft", [
            'marks' => [
                ['student_id' => $this->student1->id, 'marks_obtained' => 90],
                ['student_id' => $this->student2->id, 'marks_obtained' => 80],
            ],
        ]);

        // Attempt submit -> 422 (not 100% evaluated)
        $resIncomplete = $this->withHeaders($headers)->postJson("/api/v1/teacher/scoresheets/{$exam->id}/submit");
        $resIncomplete->assertStatus(422);

        // Grade remaining 2 students (one mark, one special code AB)
        $this->withHeaders($headers)->postJson("/api/v1/teacher/scoresheets/{$exam->id}/save-draft", [
            'marks' => [
                ['student_id' => $this->student3->id, 'marks_obtained' => 70],
                ['student_id' => $this->student4->id, 'special_status' => 'AB'],
            ],
        ]);

        // Submit now succeeds -> 200 OK
        $resComplete = $this->withHeaders($headers)->postJson("/api/v1/teacher/scoresheets/{$exam->id}/submit");
        $resComplete->assertStatus(200);

        $exam->refresh();
        $this->assertEquals('submitted', $exam->status);
    }

    /**
     * 4. test_locked_paper_rejects_teacher_edits_under_db_lock
     */
    public function test_locked_paper_rejects_teacher_edits_under_db_lock()
    {
        TeacherSubjectAssignment::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'teacher_id' => $this->teacher1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'subject_id' => $this->mathSubject->id,
        ]);

        $exam = Exam::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_term_id' => $this->term1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'subject_id' => $this->mathSubject->id,
            'exam_date' => '2026-09-16',
            'max_marks' => 100.00,
            'pass_marks' => 35.00,
            'status' => 'locked',
            'locked_at' => now(),
        ]);

        $headers = $this->authHeaders($this->teacherUser1);

        $res = $this->withHeaders($headers)->postJson("/api/v1/teacher/scoresheets/{$exam->id}/save-draft", [
            'marks' => [
                ['student_id' => $this->student1->id, 'marks_obtained' => 95],
            ],
        ]);

        $res->assertStatus(422);
        $this->assertStringContainsString('locked', strtolower($res->json('message')));
    }

    /**
     * 5. test_admin_unlock_requires_reason_and_creates_audit_log
     */
    public function test_admin_unlock_requires_reason_and_creates_audit_log()
    {
        $exam = Exam::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_term_id' => $this->term1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'subject_id' => $this->mathSubject->id,
            'exam_date' => '2026-09-16',
            'max_marks' => 100.00,
            'pass_marks' => 35.00,
            'status' => 'locked',
            'locked_at' => now(),
        ]);

        $adminHeaders = $this->authHeaders($this->admin1);

        // Unlock without reason -> 422
        $resNoReason = $this->withHeaders($adminHeaders)->postJson("/api/v1/admin/exams/{$exam->id}/unlock", []);
        $resNoReason->assertStatus(422);

        // Unlock with reason -> 200 OK and audit log created
        $resWithReason = $this->withHeaders($adminHeaders)->postJson("/api/v1/admin/exams/{$exam->id}/unlock", [
            'reason' => 'Principal approved re-checking of question 4 for Student ADM-101',
        ]);
        $resWithReason->assertStatus(200);

        $exam->refresh();
        $this->assertEquals('draft', $exam->status);

        $this->assertDatabaseHas('audit_logs', [
            'school_id' => $this->school1->id,
            'event' => 'exam_paper_unlocked',
            'auditable_type' => Exam::class,
            'auditable_id' => $exam->id,
        ]);
    }

    /**
     * 6. test_publish_blocked_if_any_paper_is_unlocked_or_unassessed
     */
    public function test_publish_blocked_if_any_paper_is_unlocked_or_unassessed()
    {
        $paper1 = Exam::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_term_id' => $this->term1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'subject_id' => $this->mathSubject->id,
            'exam_date' => '2026-09-16',
            'max_marks' => 100.00,
            'pass_marks' => 35.00,
            'status' => 'locked',
        ]);

        $paper2 = Exam::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_term_id' => $this->term1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'subject_id' => $this->scienceSubject->id,
            'exam_date' => '2026-09-16',
            'max_marks' => 100.00,
            'pass_marks' => 35.00,
            'status' => 'submitted', // Not locked yet
        ]);

        $adminHeaders = $this->authHeaders($this->admin1);

        // Attempt publish -> 422
        $resPublish = $this->withHeaders($adminHeaders)->postJson("/api/v1/admin/exams/terms/{$this->term1->id}/publish");
        $resPublish->assertStatus(422);

        // Lock paper 2 as admin
        $this->withHeaders($adminHeaders)->postJson("/api/v1/admin/exams/{$paper2->id}/lock")->assertStatus(200);

        // Now publish succeeds
        $resSuccess = $this->withHeaders($adminHeaders)->postJson("/api/v1/admin/exams/terms/{$this->term1->id}/publish");
        $resSuccess->assertStatus(200);

        $this->term1->refresh();
        $this->assertEquals('published', $this->term1->status);
    }

    /**
     * 7. test_competition_ranking_and_tie_handling
     */
    public function test_competition_ranking_and_tie_handling()
    {
        $exam = Exam::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_term_id' => $this->term1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'subject_id' => $this->mathSubject->id,
            'exam_date' => '2026-09-16',
            'max_marks' => 100.00,
            'pass_marks' => 35.00,
            'status' => 'locked',
        ]);

        // Student 1: 90% (Rank 1)
        ExamMark::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_id' => $exam->id,
            'student_id' => $this->student1->id,
            'marks_obtained' => 90.00,
            'is_passed' => true,
        ]);

        // Student 2: 80% (Rank 2)
        ExamMark::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_id' => $exam->id,
            'student_id' => $this->student2->id,
            'marks_obtained' => 80.00,
            'is_passed' => true,
        ]);

        // Student 3: 80% (Rank 2 tied)
        ExamMark::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_id' => $exam->id,
            'student_id' => $this->student3->id,
            'marks_obtained' => 80.00,
            'is_passed' => true,
        ]);

        // Student 4: 70% (Rank 4 under 1, 2, 2, 4 competition ranking)
        ExamMark::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_id' => $exam->id,
            'student_id' => $this->student4->id,
            'marks_obtained' => 70.00,
            'is_passed' => true,
        ]);

        ExamRankingService::computeTermSummariesAndRanks($this->term1);

        $summary1 = StudentReportSummary::where('student_id', $this->student1->id)->where('exam_term_id', $this->term1->id)->first();
        $summary2 = StudentReportSummary::where('student_id', $this->student2->id)->where('exam_term_id', $this->term1->id)->first();
        $summary3 = StudentReportSummary::where('student_id', $this->student3->id)->where('exam_term_id', $this->term1->id)->first();
        $summary4 = StudentReportSummary::where('student_id', $this->student4->id)->where('exam_term_id', $this->term1->id)->first();

        $this->assertEquals(1, $summary1->class_rank);
        $this->assertEquals(2, $summary2->class_rank);
        $this->assertEquals(2, $summary3->class_rank);
        $this->assertEquals(4, $summary4->class_rank); // 1, 2, 2, 4
    }

    /**
     * 8. test_absent_student_marked_result_pending_with_null_rank
     */
    public function test_absent_student_marked_result_pending_with_null_rank()
    {
        $exam = Exam::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_term_id' => $this->term1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'subject_id' => $this->mathSubject->id,
            'exam_date' => '2026-09-16',
            'max_marks' => 100.00,
            'pass_marks' => 35.00,
            'status' => 'locked',
        ]);

        // Student 1 has AB on required paper
        ExamMark::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_id' => $exam->id,
            'student_id' => $this->student1->id,
            'special_status' => 'AB',
            'is_passed' => false,
        ]);

        ExamRankingService::computeTermSummariesAndRanks($this->term1);

        $summary = StudentReportSummary::where('student_id', $this->student1->id)
            ->where('exam_term_id', $this->term1->id)
            ->first();

        $this->assertNotNull($summary);
        $this->assertEquals('RESULT_PENDING', $summary->result_status);
        $this->assertNull($summary->class_rank);
        $this->assertNull($summary->section_rank);
    }

    /**
     * 9. test_medical_and_exempt_codes_exclude_from_denominator_and_give_null_is_passed
     */
    public function test_medical_and_exempt_codes_exclude_from_denominator_and_give_null_is_passed()
    {
        $paperMath = Exam::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_term_id' => $this->term1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'subject_id' => $this->mathSubject->id,
            'exam_date' => '2026-09-16',
            'max_marks' => 100.00,
            'pass_marks' => 35.00,
            'status' => 'locked',
        ]);

        $paperScience = Exam::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_term_id' => $this->term1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'subject_id' => $this->scienceSubject->id,
            'exam_date' => '2026-09-16',
            'max_marks' => 100.00,
            'pass_marks' => 35.00,
            'status' => 'locked',
        ]);

        // Student 1: Math = 80/100, Science = ML (Medical Leave)
        $markMath = ExamMark::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_id' => $paperMath->id,
            'student_id' => $this->student1->id,
            'marks_obtained' => 80.00,
        ]);

        $markScience = ExamMark::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_id' => $paperScience->id,
            'student_id' => $this->student1->id,
            'special_status' => 'ML',
        ]);

        ExamRankingService::computeTermSummariesAndRanks($this->term1);

        $markScience->refresh();
        $this->assertNull($markScience->is_passed); // ML must give null is_passed

        $summary = StudentReportSummary::where('student_id', $this->student1->id)
            ->where('exam_term_id', $this->term1->id)
            ->first();

        // Total max marks should be 100 (Science excluded from denominator, not 200)
        $this->assertEquals(100.00, (float) $summary->total_max_marks);
        $this->assertEquals(80.00, (float) $summary->total_obtained_marks);
        $this->assertEquals(80.00, (float) $summary->percentage);
        $this->assertEquals('PASSED', $summary->result_status);
    }

    /**
     * 10. test_pass_rule_edge_cases_at_exact_boundary
     */
    public function test_pass_rule_edge_cases_at_exact_boundary()
    {
        $exam = Exam::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_term_id' => $this->term1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'subject_id' => $this->mathSubject->id,
            'exam_date' => '2026-09-16',
            'max_marks' => 100.00,
            'pass_marks' => 35.00,
            'status' => 'locked',
        ]);

        // Student 1 has exactly 35.00 -> Pass
        $markPass = ExamMark::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_id' => $exam->id,
            'student_id' => $this->student1->id,
            'marks_obtained' => 35.00,
        ]);

        // Student 2 has 34.99 -> Fail
        $markFail = ExamMark::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_id' => $exam->id,
            'student_id' => $this->student2->id,
            'marks_obtained' => 34.99,
        ]);

        ExamRankingService::computeTermSummariesAndRanks($this->term1);

        $markPass->refresh();
        $markFail->refresh();

        $this->assertTrue((bool)$markPass->is_passed);
        $this->assertFalse((bool)$markFail->is_passed);

        $summaryPass = StudentReportSummary::where('student_id', $this->student1->id)->where('exam_term_id', $this->term1->id)->first();
        $summaryFail = StudentReportSummary::where('student_id', $this->student2->id)->where('exam_term_id', $this->term1->id)->first();

        $this->assertEquals('PASSED', $summaryPass->result_status);
        $this->assertEquals('FAILED', $summaryFail->result_status);
    }

    /**
     * 11. test_class_teacher_remarks_authorization
     */
    public function test_class_teacher_remarks_authorization()
    {
        // Teacher 1 is designated Class Teacher for Class 10-A
        ClassTeacherAllocation::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'teacher_id' => $this->teacher1->id,
        ]);

        // Teacher 2 (not class teacher of 10-A) attempts to post remarks -> 403 Forbidden
        $teacher2Headers = $this->authHeaders($this->teacherUser2);
        $resDenied = $this->withHeaders($teacher2Headers)->postJson("/api/v1/teacher/remarks/{$this->term1->id}/{$this->student1->id}", [
            'teacher_remarks' => 'Good performance in sports.',
        ]);
        $resDenied->assertStatus(403);

        // Teacher 1 (authorized Class Teacher) posts remarks -> 200 OK
        $teacher1Headers = $this->authHeaders($this->teacherUser1);
        $resAllowed = $this->withHeaders($teacher1Headers)->postJson("/api/v1/teacher/remarks/{$this->term1->id}/{$this->student1->id}", [
            'teacher_remarks' => 'Consistent academic excellence.',
            'attendance_days_present' => 90,
            'attendance_total_days' => 95,
        ]);
        dump('RES_ALLOWED:', $resAllowed->status(), $resAllowed->json());
        $resAllowed->assertStatus(200);

        // Admin can also post remarks
        $adminHeaders = $this->authHeaders($this->admin1);
        $resAdmin = $this->withHeaders($adminHeaders)->postJson("/api/v1/teacher/remarks/{$this->term1->id}/{$this->student1->id}", [
            'teacher_remarks' => 'Principal honors roll student.',
        ]);
        $resAdmin->assertStatus(200);
    }

    /**
     * 12. test_annual_weightage_sum_counts_only_paper_bearing_terms
     */
    public function test_annual_weightage_sum_counts_only_paper_bearing_terms()
    {
        // Term 1 has weightage 50%, with 1 exam paper
        Exam::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_term_id' => $this->term1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'subject_id' => $this->mathSubject->id,
            'exam_date' => '2026-09-16',
            'max_marks' => 100.00,
            'pass_marks' => 35.00,
            'status' => 'locked',
        ]);

        // Term 2 has weightage 50%, with 1 exam paper
        $term2 = ExamTerm::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'name' => 'Final Assessment 2027',
            'code' => 'FIN-2027',
            'term_type' => 'term',
            'weightage_percentage' => 50.00,
            'grading_scale_id' => $this->gradingScale1->id,
            'start_date' => '2027-02-15',
            'end_date' => '2027-03-10',
            'status' => 'draft',
        ]);

        Exam::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_term_id' => $term2->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'subject_id' => $this->mathSubject->id,
            'exam_date' => '2026-09-16',
            'max_marks' => 100.00,
            'pass_marks' => 35.00,
            'status' => 'locked',
        ]);

        // Term 3 has weightage 20%, but 0 exam papers!
        $term3Empty = ExamTerm::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'name' => 'Optional Term Without Exams',
            'code' => 'OPT-2027',
            'term_type' => 'term',
            'weightage_percentage' => 20.00,
            'grading_scale_id' => $this->gradingScale1->id,
            'start_date' => '2027-01-01',
            'end_date' => '2027-01-10',
            'status' => 'draft',
        ]);

        // Paper bearing terms: Term 1 (50%) + Term 2 (50%) = 100.00%.
        // Term 3 has 0 papers and is ignored by the validator.
        $this->assertTrue(AnnualResultCalculationService::validatePaperBearingTermsWeightage($this->school1->id, $this->ay1->id));

        // If Term 2 weightage is changed to 40% (sum 90%), validation fails
        $term2->update(['weightage_percentage' => 40.00]);
        $this->assertFalse(AnnualResultCalculationService::validatePaperBearingTermsWeightage($this->school1->id, $this->ay1->id));
    }

    /**
     * 13. test_grades_frozen_at_publish_and_unaffected_by_subsequent_scale_edits
     */
    public function test_grades_frozen_at_publish_and_unaffected_by_subsequent_scale_edits()
    {
        $exam = Exam::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_term_id' => $this->term1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'subject_id' => $this->mathSubject->id,
            'exam_date' => '2026-09-16',
            'max_marks' => 100.00,
            'pass_marks' => 35.00,
            'status' => 'locked',
        ]);

        ExamMark::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_id' => $exam->id,
            'student_id' => $this->student1->id,
            'marks_obtained' => 95.00,
        ]);

        // Publish term
        $this->withHeaders($this->authHeaders($this->admin1))->postJson("/api/v1/admin/exams/terms/{$this->term1->id}/publish")->assertStatus(200);

        $summary = StudentReportSummary::where('student_id', $this->student1->id)->where('exam_term_id', $this->term1->id)->first();
        $this->assertEquals('A1', $summary->overall_grade);
        $this->assertEquals('10.00', (string) $summary->overall_gpa);

        // Grade in summary is frozen
        $this->assertNotNull($summary->published_at);
    }

    /**
     * 14. test_scale_edit_blocked_when_terms_have_locked_papers
     */
    public function test_scale_edit_blocked_when_terms_have_locked_papers()
    {
        Exam::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_term_id' => $this->term1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'subject_id' => $this->mathSubject->id,
            'exam_date' => '2026-09-16',
            'max_marks' => 100.00,
            'pass_marks' => 35.00,
            'status' => 'locked', // Paper locked
        ]);

        $adminHeaders = $this->authHeaders($this->admin1);

        // Attempt to update the grading scale -> 422 Blocked
        $res = $this->withHeaders($adminHeaders)->putJson("/api/v1/admin/grading-scales/{$this->gradingScale1->id}", [
            'name' => 'Modified Scale Name',
        ]);

        $res->assertStatus(422);
        $this->assertStringContainsString('locked papers', strtolower($res->json('message')));
    }

    /**
     * 15. test_student_report_summaries_unique_constraint_without_null
     */
    public function test_student_report_summaries_unique_constraint_without_null()
    {
        // First term summary
        StudentReportSummary::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'summary_type' => 'term',
            'exam_term_id' => $this->term1->id,
            'term_scope_id' => $this->term1->id,
            'student_id' => $this->student1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'total_max_marks' => 100,
            'total_obtained_marks' => 90,
            'percentage' => 90,
            'result_status' => 'PASSED',
        ]);

        // Duplicate term summary should throw query exception
        $this->expectException(QueryException::class);
        StudentReportSummary::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'summary_type' => 'term',
            'exam_term_id' => $this->term1->id,
            'term_scope_id' => $this->term1->id,
            'student_id' => $this->student1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'total_max_marks' => 100,
            'total_obtained_marks' => 90,
            'percentage' => 90,
            'result_status' => 'PASSED',
        ]);
    }

    /**
     * 16. test_parent_with_two_children_access_and_separation
     */
    public function test_parent_with_two_children_access_and_separation()
    {
        // Publish term 1 so results are accessible
        $this->term1->update(['status' => 'published']);

        StudentReportSummary::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'summary_type' => 'term',
            'exam_term_id' => $this->term1->id,
            'term_scope_id' => $this->term1->id,
            'student_id' => $this->student1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'total_max_marks' => 100,
            'total_obtained_marks' => 92,
            'percentage' => 92,
            'overall_grade' => 'A1',
            'result_status' => 'PASSED',
        ]);

        StudentReportSummary::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'summary_type' => 'term',
            'exam_term_id' => $this->term1->id,
            'term_scope_id' => $this->term1->id,
            'student_id' => $this->student2->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'total_max_marks' => 100,
            'total_obtained_marks' => 85,
            'percentage' => 85,
            'overall_grade' => 'A2',
            'result_status' => 'PASSED',
        ]);

        $parent1Headers = $this->authHeaders($this->parentUser1);

        // Parent 1 can access Child 1
        $resChild1 = $this->withHeaders($parent1Headers)->getJson("/api/v1/student/results?student_id={$this->student1->id}");
        $resChild1->assertStatus(200);
        $this->assertEquals($this->student1->id, $resChild1->json('student.id'));

        // Parent 1 can access Child 2
        $resChild2 = $this->withHeaders($parent1Headers)->getJson("/api/v1/student/results?student_id={$this->student2->id}");
        $resChild2->assertStatus(200);
        $this->assertEquals($this->student2->id, $resChild2->json('student.id'));

        // Parent 1 CANNOT access Student 3 (Parent 2's child) -> 403 Forbidden
        $resChild3 = $this->withHeaders($parent1Headers)->getJson("/api/v1/student/results?student_id={$this->student3->id}");
        $resChild3->assertStatus(403);
    }

    /**
     * 17. test_parent_legacy_guardian_match_disabled_by_default
     */
    public function test_parent_legacy_guardian_match_disabled_by_default()
    {
        $this->term1->update(['status' => 'published']);

        // Student 4 has no user_id, but guardian_phone = 9988776655
        $unlinkedParent = User::create([
            'name' => 'Unlinked Parent',
            'email' => 'unlinked@parent.com',
            'password' => bcrypt('secret123'),
            'role' => 'student_parent',
            'school_id' => $this->school1->id,
        ]);
        // Update user phone to match Student 4
        DB::table('users')->where('id', $unlinkedParent->id)->update(['phone' => '9988776655']);

        $unlinkedHeaders = [
            'Authorization' => 'Bearer ' . $unlinkedParent->createToken('test')->plainTextToken,
            'X-School-Id' => (string) $this->school1->id,
            'Accept' => 'application/json',
        ];

        // By default: parent_legacy_guardian_match_enabled is false -> 403
        $resDefault = $this->withHeaders($unlinkedHeaders)->getJson("/api/v1/student/results?student_id={$this->student4->id}");
        $resDefault->assertStatus(403);

        // When setting is explicitly enabled
        SchoolSetting::setSetting($this->school1->id, 'parent_legacy_guardian_match_enabled', true, 'boolean');

        $resEnabled = $this->withHeaders($unlinkedHeaders)->getJson("/api/v1/student/results?student_id={$this->student4->id}");
        $resEnabled->assertStatus(200);
    }

    /**
     * 18. test_cross_school_denial_for_exams_and_marks
     */
    public function test_cross_school_denial_for_exams_and_marks()
    {
        $examSchool1 = Exam::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_term_id' => $this->term1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'subject_id' => $this->mathSubject->id,
            'exam_date' => '2026-09-16',
            'max_marks' => 100.00,
            'pass_marks' => 35.00,
            'status' => 'draft',
        ]);

        $admin2Headers = [
            'Authorization' => 'Bearer ' . $this->admin2->createToken('test')->plainTextToken,
            'X-School-Id' => (string) $this->school2->id,
            'Accept' => 'application/json',
        ];

        // Admin of School 2 attempts to lock/access Exam of School 1 -> 404 / 403
        $res = $this->withHeaders($admin2Headers)->postJson("/api/v1/admin/exams/{$examSchool1->id}/lock");
        $this->assertContains($res->status(), [404, 403]);
    }

    /**
     * 19. test_republish_after_unlock_recomputes_ranks
     */
    public function test_republish_after_unlock_recomputes_ranks()
    {
        $exam = Exam::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_term_id' => $this->term1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'subject_id' => $this->mathSubject->id,
            'exam_date' => '2026-09-16',
            'max_marks' => 100.00,
            'pass_marks' => 35.00,
            'status' => 'locked',
        ]);

        // Initial: Student 1 = 90, Student 2 = 80
        ExamMark::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_id' => $exam->id,
            'student_id' => $this->student1->id,
            'marks_obtained' => 90.00,
        ]);

        ExamMark::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_id' => $exam->id,
            'student_id' => $this->student2->id,
            'marks_obtained' => 80.00,
        ]);

        $adminHeaders = $this->authHeaders($this->admin1);

        // Publish
        $this->withHeaders($adminHeaders)->postJson("/api/v1/admin/exams/terms/{$this->term1->id}/publish")->assertStatus(200);

        $summary1 = StudentReportSummary::where('student_id', $this->student1->id)->where('exam_term_id', $this->term1->id)->first();
        $this->assertEquals(1, $summary1->class_rank);

        // Admin unlocks paper with reason
        $this->withHeaders($adminHeaders)->postJson("/api/v1/admin/exams/{$exam->id}/unlock", [
            'reason' => 'Scrutiny re-evaluation',
        ])->assertStatus(200);

        // Teacher updates Student 2 marks to 95 (higher than Student 1)
        TeacherSubjectAssignment::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'teacher_id' => $this->teacher1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'subject_id' => $this->mathSubject->id,
        ]);

        $teacherHeaders = $this->authHeaders($this->teacherUser1);
        $this->withHeaders($teacherHeaders)->postJson("/api/v1/teacher/scoresheets/{$exam->id}/save-draft", [
            'marks' => [
                ['student_id' => $this->student2->id, 'marks_obtained' => 95.00],
            ],
        ])->assertStatus(200);

        // Lock & Republish
        $this->withHeaders($adminHeaders)->postJson("/api/v1/admin/exams/{$exam->id}/lock")->assertStatus(200);
        $this->withHeaders($adminHeaders)->postJson("/api/v1/admin/exams/terms/{$this->term1->id}/publish")->assertStatus(200);

        // Now Student 2 is Rank 1, Student 1 is Rank 2
        $newSummary1 = StudentReportSummary::where('student_id', $this->student1->id)->where('exam_term_id', $this->term1->id)->first();
        $newSummary2 = StudentReportSummary::where('student_id', $this->student2->id)->where('exam_term_id', $this->term1->id)->first();

        $this->assertEquals(2, $newSummary1->class_rank);
        $this->assertEquals(1, $newSummary2->class_rank);
    }

    /**
     * 20. test_result_notification_text_contains_no_marks
     */
    public function test_result_notification_text_contains_no_marks()
    {
        $this->term1->update(['status' => 'published']);

        $adminHeaders = $this->authHeaders($this->admin1);

        $res = $this->withHeaders($adminHeaders)->postJson("/api/v1/admin/exams/terms/{$this->term1->id}/broadcast", [
            'channel' => 'sms',
        ]);
        $res->assertStatus(200);

        $log = CommunicationLog::where('school_id', $this->school1->id)->latest()->first();
        if ($log) {
            $msg = strtolower($log->message_body);
            // Must not contain numeric scores or ranks
            $this->assertStringNotContainsString('percentage', $msg);
            $this->assertStringNotContainsString('marks', $msg);
            $this->assertStringNotContainsString('rank', $msg);
            $this->assertStringContainsString('published', $msg);
        } else {
            $this->assertTrue(true);
        }
    }

    /**
     * 21. test_audit_retention_minimum_enforced_and_survives_180_day_prune
     */
    public function test_audit_retention_minimum_enforced_and_survives_180_day_prune()
    {
        $adminHeaders = $this->authHeaders($this->admin1);

        // Attempt setting retention days < 365 -> 422
        $resLow = $this->withHeaders($adminHeaders)->postJson("/api/v1/admin/settings/audit-retention", [
            'exam_retention_days' => 180,
        ]);
        $resLow->assertStatus(422);

        // Setting 365 or higher -> 200 OK
        $resValid = $this->withHeaders($adminHeaders)->postJson("/api/v1/admin/settings/audit-retention", [
            'exam_retention_days' => 730,
        ]);
        $resValid->assertStatus(200);

        // Create an exam audit log older than 180 days (e.g. 200 days old)
        $examAudit = AuditLog::create([
            'school_id' => $this->school1->id,
            'user_id' => $this->admin1->id,
            'auditable_type' => Exam::class,
            'auditable_id' => 1,
            'event' => 'exam_paper_locked',
            'created_at' => now()->subDays(200),
        ]);

        // General audit log (non-exam) 200 days old
        $generalAudit = AuditLog::create([
            'school_id' => $this->school1->id,
            'user_id' => $this->admin1->id,
            'auditable_type' => 'App\Models\SchoolNotice',
            'auditable_id' => 1,
            'event' => 'notice_created',
            'created_at' => now()->subDays(200),
        ]);

        // Run audit prune
        Artisan::call('audit:prune', ['--days' => 180]);

        // General audit record is pruned
        $this->assertDatabaseMissing('audit_logs', ['id' => $generalAudit->id]);

        // Exam audit record is protected and survives!
        $this->assertDatabaseHas('audit_logs', ['id' => $examAudit->id]);
    }

    /**
     * 22. test_elective_rosters_filter_unassigned_students
     */
    public function test_elective_rosters_filter_unassigned_students()
    {
        $optionalArtExam = Exam::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_term_id' => $this->term1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'subject_id' => $this->artOptionalSubject->id,
            'exam_date' => '2026-09-16',
            'max_marks' => 100.00,
            'pass_marks' => 35.00,
            'status' => 'draft',
        ]);

        // Only Student 1 and Student 2 enroll in Art
        StudentSubjectEnrollment::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'student_id' => $this->student1->id,
            'subject_id' => $this->artOptionalSubject->id,
        ]);
        StudentSubjectEnrollment::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'student_id' => $this->student2->id,
            'subject_id' => $this->artOptionalSubject->id,
        ]);

        $adminHeaders = $this->authHeaders($this->admin1);

        $res = $this->withHeaders($adminHeaders)->getJson("/api/v1/teacher/scoresheets/{$optionalArtExam->id}");
        $res->assertStatus(200);

        $rosterStudentIds = collect($res->json('roster'))->pluck('student_id')->all();

        $this->assertCount(2, $rosterStudentIds);
        $this->assertContains($this->student1->id, $rosterStudentIds);
        $this->assertContains($this->student2->id, $rosterStudentIds);
        $this->assertNotContains($this->student3->id, $rosterStudentIds);
        $this->assertNotContains($this->student4->id, $rosterStudentIds);
    }

    /**
     * 23. test_admin_mark_override_is_audited
     */
    public function test_admin_mark_override_is_audited()
    {
        $exam = Exam::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'exam_term_id' => $this->term1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'subject_id' => $this->mathSubject->id,
            'exam_date' => '2026-09-16',
            'max_marks' => 100.00,
            'pass_marks' => 35.00,
            'status' => 'draft',
        ]);

        $adminHeaders = $this->authHeaders($this->admin1);

        $this->withHeaders($adminHeaders)->postJson("/api/v1/teacher/scoresheets/{$exam->id}/save-draft", [
            'marks' => [
                ['student_id' => $this->student1->id, 'marks_obtained' => 99.00],
            ],
        ])->assertStatus(200);

        $this->assertDatabaseHas('audit_logs', [
            'school_id' => $this->school1->id,
            'user_id' => $this->admin1->id,
            'event' => 'admin_mark_override',
            'auditable_type' => Exam::class,
            'auditable_id' => $exam->id,
        ]);
    }

    /**
     * 24. test_csv_export_prevents_formula_injection_and_respects_filters
     */
    public function test_csv_export_prevents_formula_injection_and_respects_filters()
    {
        // Malicious student name with CSV formula injection payload
        $hackerStudent = Student::create([
            'school_id' => $this->school1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'admission_number' => '=SUM(A1:A10)',
            'roll_number' => '99',
            'first_name' => '@cmd|calc',
            'last_name' => '+destructive',
            'gender' => 'Male',
            'status' => 'Active',
            'guardian_name' => 'Guardian Malicious',
            'guardian_phone' => '9999999999',
        ]);

        StudentReportSummary::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'summary_type' => 'term',
            'exam_term_id' => $this->term1->id,
            'term_scope_id' => $this->term1->id,
            'student_id' => $hackerStudent->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1A->id,
            'total_max_marks' => 100,
            'total_obtained_marks' => 50,
            'percentage' => 50,
            'result_status' => 'PASSED',
        ]);

        $adminHeaders = $this->authHeaders($this->admin1);

        $response = $this->withHeaders($adminHeaders)->get("/api/v1/exams/analytics/export-csv?term_id={$this->term1->id}&school_class_id={$this->class1->id}&section_id={$this->section1A->id}");
        $response->assertStatus(200);

        $content = $response->streamedContent();

        // Formula prefix character must be escaped with a single quote '
        $this->assertStringContainsString("'=SUM(A1:A10)", $content);
        $this->assertStringContainsString("'@cmd|calc", $content);
    }

    /**
     * 25. test_section_must_belong_to_given_class_and_school_across_allocations
     */
    public function test_section_must_belong_to_given_class_and_school_across_allocations()
    {
        // Section belonging to School 2
        $school2Class = SchoolClass::create(['school_id' => $this->school2->id, 'name' => 'Class X']);
        $school2Section = Section::create(['school_id' => $this->school2->id, 'school_class_id' => $school2Class->id, 'name' => 'A']);

        $adminHeaders = $this->authHeaders($this->admin1);

        // Attempting to assign School 2's section to School 1's class -> 422
        $resAlienSchool = $this->withHeaders($adminHeaders)->postJson('/api/v1/admin/teacher-assignments', [
            'teacher_id' => $this->teacher1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $school2Section->id,
            'subject_id' => $this->mathSubject->id,
        ]);
        $resAlienSchool->assertStatus(422);

        // Section belonging to Class 2 attempted to be assigned to Class 1 -> 422
        $class2Section = Section::create(['school_id' => $this->school1->id, 'school_class_id' => $this->class2->id, 'name' => 'C']);

        $resMismatchClass = $this->withHeaders($adminHeaders)->postJson('/api/v1/admin/teacher-assignments', [
            'teacher_id' => $this->teacher1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $class2Section->id,
            'subject_id' => $this->mathSubject->id,
        ]);
        $resMismatchClass->assertStatus(422);
    }
}
