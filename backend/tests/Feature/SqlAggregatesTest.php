<?php

namespace Tests\Feature;

use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\StaffAttendance;
use App\Models\StudentFee;
use App\Models\StaffSalary;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SqlAggregatesTest extends TestCase
{
    use DatabaseMigrations;

    protected School $school;
    protected User $admin;
    protected SchoolClass $class;
    protected Section $section;

    protected function setUp(): void
    {
        parent::setUp();

        $this->school = School::create([
            'name' => 'St Xavier Campus',
            'code' => 'STX-101',
            'slug' => 'st-xavier',
        ]);

        $this->admin = User::factory()->create([
            'school_id' => $this->school->id,
            'role' => 'admin',
        ]);

        $this->class = SchoolClass::create([
            'school_id' => $this->school->id,
            'name' => 'Class 10',
        ]);

        $this->section = Section::create([
            'school_id' => $this->school->id,
            'school_class_id' => $this->class->id,
            'name' => 'A',
        ]);
    }

    public function test_admin_dashboard_sql_aggregates_empty_gracefully()
    {
        Sanctum::actingAs($this->admin);

        $res = $this->getJson('/api/v1/admin/dashboard');
        $res->assertStatus(200);
        $metrics = $res->json('data.metrics');

        $this->assertEquals(0, $metrics['fees_billed']);
        $this->assertEquals(0, $metrics['fees_collected']);
        $this->assertEquals(0, $metrics['fees_pending']);
        $this->assertEquals(0, $metrics['fee_recovery_rate']);
        $this->assertEquals(0, $metrics['attendance_rate']);
    }

    public function test_admin_and_accounts_dashboard_sql_aggregates_match_exact_values()
    {
        $today = Carbon::today()->toDateString();

        // 1. Create students
        $students = [];
        for ($i = 1; $i <= 4; $i++) {
            $user = User::factory()->create(['school_id' => $this->school->id, 'role' => 'student_parent']);
            $students[] = Student::create([
                'school_id' => $this->school->id,
                'school_class_id' => $this->class->id,
                'section_id' => $this->section->id,
                'user_id' => $user->id,
                'admission_number' => "ADM-00{$i}",
                'roll_number' => "10{$i}",
                'first_name' => "Student{$i}",
                'guardian_name' => "Guardian{$i}",
                'guardian_phone' => "987654321{$i}",
                'status' => 'Active',
            ]);
        }

        // 2. Create attendances for today
        StudentAttendance::create([
            'school_id' => $this->school->id,
            'student_id' => $students[0]->id,
            'school_class_id' => $this->class->id,
            'date' => $today,
            'status' => 'Present',
        ]);
        StudentAttendance::create([
            'school_id' => $this->school->id,
            'student_id' => $students[1]->id,
            'school_class_id' => $this->class->id,
            'date' => $today,
            'status' => 'Absent',
        ]);
        StudentAttendance::create([
            'school_id' => $this->school->id,
            'student_id' => $students[2]->id,
            'school_class_id' => $this->class->id,
            'date' => $today,
            'status' => 'Late',
        ]);

        // 3. Create student fees
        StudentFee::create([
            'school_id' => $this->school->id,
            'student_id' => $students[0]->id,
            'amount' => 50000,
            'status' => 'Paid',
            'term_name' => 'Quarter 1',
            'due_date' => $today,
            'academic_year' => '2026-2027',
        ]);
        StudentFee::create([
            'school_id' => $this->school->id,
            'student_id' => $students[1]->id,
            'amount' => 30000,
            'status' => 'Pending',
            'term_name' => 'Quarter 2',
            'due_date' => $today,
            'academic_year' => '2026-2027',
        ]);
        StudentFee::create([
            'school_id' => $this->school->id,
            'student_id' => $students[2]->id,
            'amount' => 20000,
            'status' => 'Overdue',
            'term_name' => 'Quarter 3',
            'due_date' => $today,
            'academic_year' => '2026-2027',
        ]);
        StudentFee::create([
            'school_id' => $this->school->id,
            'student_id' => $students[3]->id,
            'amount' => 10000,
            'status' => 'Cancelled', // Must be excluded from active fee calculations
            'term_name' => 'Quarter 4',
            'due_date' => $today,
            'academic_year' => '2026-2027',
        ]);

        Sanctum::actingAs($this->admin);

        // Verify Admin Dashboard Aggregates
        $res = $this->getJson('/api/v1/admin/dashboard');
        $res->assertStatus(200);
        $metrics = $res->json('data.metrics');

        // Total Billed = 50000 + 30000 + 20000 = 100000
        $this->assertEquals(100000, $metrics['fees_billed']);
        // Collected = 50000
        $this->assertEquals(50000, $metrics['fees_collected']);
        // Pending = 30000 + 20000 = 50000
        $this->assertEquals(50000, $metrics['fees_pending']);
        // Recovery Rate = (50000 / 100000) * 100 = 50.0%
        $this->assertEquals(50.0, $metrics['fee_recovery_rate']);

        // Verify Accounts Dashboard Aggregates
        $accRes = $this->getJson('/api/v1/accounts/dashboard');
        $accRes->assertStatus(200);
        $summary = $accRes->json('data.summary');

        $this->assertEquals(100000, $summary['totalFeesBilled']);
        $this->assertEquals(50000, $summary['totalFeesCollected']);
        $this->assertEquals(50000, $summary['outstandingFees']);
        $this->assertEquals(50.0, $summary['recoveryRate']);
        $this->assertEquals(1, $summary['overdueStudentsCount']);
        $this->assertEquals(1, $summary['pendingStudentsCount']);
    }
}
