<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\School;
use App\Models\LeaveApplication;
use App\Models\LeaveType;
use App\Models\StaffAttendance;
use App\Models\StudentAttendance;
use App\Models\StaffSalary;
use App\Models\SalaryDisbursementRequest;
use App\Models\Subject;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Notification;
use App\Models\Feedback;
use App\Models\StudyMaterial;
use App\Models\Teacher;
use App\Models\Student;
use Laravel\Sanctum\Sanctum;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CrossTenantScopeGapAuditTest extends TestCase
{
    use RefreshDatabase;

    protected School $school1;
    protected School $school2;
    protected User $admin1;
    protected User $admin2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->school1 = School::create([
            'name' => 'School Alpha',
            'code' => 'ALPHA-CRM',
            'slug' => 'school-alpha',
            'city' => 'Mumbai',
            'status' => 'active',
        ]);
        $this->school2 = School::create([
            'name' => 'School Beta',
            'code' => 'BETA-CRM',
            'slug' => 'school-beta',
            'city' => 'Pune',
            'status' => 'active',
        ]);

        $this->admin1 = User::factory()->create(['school_id' => $this->school1->id, 'role' => 'admin']);
        $this->admin2 = User::factory()->create(['school_id' => $this->school2->id, 'role' => 'admin']);
    }

    public function test_leave_type_cross_tenant_access()
    {
        $lt2 = LeaveType::create([
            'school_id' => $this->school2->id,
            'name' => 'Beta Sabbatical',
            'code' => 'SABBATICAL',
            'days_allowed' => 15,
        ]);

        Sanctum::actingAs($this->admin1);
        $res = $this->withHeader('X-School-Id', (string)$this->school1->id)
            ->deleteJson("/api/v1/hr/leave-types/{$lt2->id}");

        $this->assertTrue(in_array($res->status(), [403, 404]), "LeaveType returned {$res->status()} instead of 403/404");
    }

    public function test_school_class_cross_tenant_access()
    {
        $class2 = SchoolClass::create([
            'school_id' => $this->school2->id,
            'name' => 'Beta Grade 10',
            'code' => 'BETA-10',
        ]);

        Sanctum::actingAs($this->admin1);
        $res = $this->withHeader('X-School-Id', (string)$this->school1->id)
            ->deleteJson("/api/v1/admin/academic/classes/{$class2->id}");

        $this->assertTrue(in_array($res->status(), [403, 404]), "SchoolClass returned {$res->status()} instead of 403/404");
    }

    public function test_section_cross_tenant_access()
    {
        $class2 = SchoolClass::create([
            'school_id' => $this->school2->id,
            'name' => 'Beta Grade 11',
            'code' => 'BETA-11',
        ]);
        $sec2 = Section::create([
            'school_id' => $this->school2->id,
            'school_class_id' => $class2->id,
            'name' => 'Section Beta-A',
        ]);

        Sanctum::actingAs($this->admin1);
        $res = $this->withHeader('X-School-Id', (string)$this->school1->id)
            ->deleteJson("/api/v1/admin/academic/sections/{$sec2->id}");

        $this->assertTrue(in_array($res->status(), [403, 404]), "Section returned {$res->status()} instead of 403/404");
    }

    public function test_subject_cross_tenant_access()
    {
        $class2 = SchoolClass::create([
            'school_id' => $this->school2->id,
            'name' => 'Beta Grade 12',
            'code' => 'BETA-12',
        ]);
        $sub2 = Subject::create([
            'school_class_id' => $class2->id,
            'name' => 'Beta Quantum Physics',
            'code' => 'BQP-101',
        ]);

        Sanctum::actingAs($this->admin1);
        $res = $this->withHeader('X-School-Id', (string)$this->school1->id)
            ->deleteJson("/api/v1/admin/academic/subjects/{$sub2->id}");

        $this->assertTrue(in_array($res->status(), [403, 404]), "Subject returned {$res->status()} instead of 403/404");
    }

    public function test_notification_cross_tenant_access()
    {
        $notif2 = Notification::create([
            'user_id' => $this->admin2->id,
            'role' => 'admin',
            'title' => 'Beta Secret Notification',
            'message' => 'Beta tenant message',
        ]);

        Sanctum::actingAs($this->admin1);
        $res = $this->withHeader('X-School-Id', (string)$this->school1->id)
            ->postJson("/api/v1/admin/notifications/{$notif2->id}/read");

        $this->assertTrue(in_array($res->status(), [403, 404]), "Notification returned {$res->status()} instead of 403/404");
    }

    public function test_study_material_cross_tenant_access()
    {
        $teacher2 = Teacher::create([
            'school_id' => $this->school2->id,
            'user_id' => $this->admin2->id,
            'teacher_id' => 'TCH-BETA-01',
            'first_name' => 'Beta',
            'last_name' => 'Teacher',
            'email' => 'beta.teacher@schoolbeta.com',
        ]);

        $sm2 = StudyMaterial::create([
            'teacher_id' => $teacher2->id,
            'title' => 'Beta Advanced Robotics',
            'subject' => 'Robotics',
            'file_url' => 'http://example.com/beta.pdf',
        ]);

        Sanctum::actingAs($this->admin1);
        $res = $this->withHeader('X-School-Id', (string)$this->school1->id)
            ->deleteJson("/api/v1/study-materials/{$sm2->id}");

        $this->assertTrue(in_array($res->status(), [403, 404]), "StudyMaterial returned {$res->status()} instead of 403/404");
    }

    public function test_leave_application_cross_tenant_access()
    {
        $userBeta = User::factory()->create(['school_id' => $this->school2->id, 'role' => 'teacher']);
        $leave2 = LeaveApplication::create([
            'school_id' => $this->school2->id,
            'user_id' => $userBeta->id,
            'type' => 'Sick',
            'from_date' => now()->toDateString(),
            'to_date' => now()->addDays(2)->toDateString(),
            'reason' => 'Beta illness',
            'status' => 'Pending',
        ]);

        Sanctum::actingAs($this->admin1);
        $res = $this->withHeader('X-School-Id', (string)$this->school1->id)
            ->patchJson("/api/v1/hr/leaves/{$leave2->id}/status", ['status' => 'Approved']);

        $this->assertTrue(in_array($res->status(), [403, 404]), "LeaveApplication returned {$res->status()} instead of 403/404");
    }

    public function test_feedback_cross_tenant_access()
    {
        $userBeta = User::factory()->create(['school_id' => $this->school2->id, 'role' => 'student_parent']);
        $fb2 = Feedback::create([
            'user_id' => $userBeta->id,
            'teacher_name' => 'Beta Teacher',
            'subject' => 'Beta feedback subject',
            'category' => 'Academics',
            'comment' => 'Beta secret complaint',
            'status' => 'Pending',
        ]);

        Sanctum::actingAs($this->admin1);
        $res = $this->withHeader('X-School-Id', (string)$this->school1->id)
            ->deleteJson("/api/v1/feedback/{$fb2->id}");

        $this->assertTrue(in_array($res->status(), [403, 404]), "Feedback returned {$res->status()} instead of 403/404");
    }

    public function test_salary_disbursement_request_cross_tenant_access()
    {
        $userBeta = User::factory()->create(['school_id' => $this->school2->id, 'role' => 'teacher']);
        $disb2 = SalaryDisbursementRequest::create([
            'batch_code' => 'BATCH-BETA-01',
            'staff_name' => 'Beta Staff',
            'month' => '2026-11',
            'total_amount' => 45000,
            'staff_count' => 1,
            'status' => 'Pending',
        ]);

        Sanctum::actingAs($this->admin1);
        $res = $this->withHeader('X-School-Id', (string)$this->school1->id)
            ->postJson("/api/v1/salary-disbursements/{$disb2->id}/action", ['action' => 'Approve']);

        $this->assertTrue(in_array($res->status(), [403, 404]), "SalaryDisbursementRequest returned {$res->status()} instead of 403/404");
    }

    public function test_staff_attendance_cross_tenant_mark()
    {
        $teacher2 = Teacher::create([
            'school_id' => $this->school2->id,
            'user_id' => $this->admin2->id,
            'teacher_id' => 'TCH-BETA-02',
            'first_name' => 'BetaStaff',
            'last_name' => 'Teacher',
            'email' => 'betastaff@schoolbeta.com',
        ]);

        Sanctum::actingAs($this->admin1);
        $res = $this->withHeader('X-School-Id', (string)$this->school1->id)
            ->postJson('/api/v1/hr/staff-attendance/mark', [
                'teacher_id' => $teacher2->id,
                'date' => now()->toDateString(),
                'status' => 'Present',
            ]);

        $this->assertTrue(in_array($res->status(), [403, 404]), "StaffAttendance failed cross-tenant isolation: Admin of School 1 marked attendance for School 2 teacher, returned {$res->status()}");
    }

    public function test_staff_salary_cross_tenant_access()
    {
        $userBeta = User::factory()->create(['school_id' => $this->school2->id, 'role' => 'teacher']);
        $sal2 = StaffSalary::create([
            'name' => 'Beta Teacher Staff',
            'role' => 'Teacher',
            'staff_id' => 'STF-BETA-01',
            'basic_salary' => 50000,
            'net_salary' => 50000,
        ]);

        Sanctum::actingAs($this->admin1);
        $res = $this->withHeader('X-School-Id', (string)$this->school1->id)
            ->putJson("/api/v1/hr/salaries/{$sal2->id}", ['base_salary' => 99999]);

        $this->assertTrue(in_array($res->status(), [403, 404]), "StaffSalary failed cross-tenant isolation: Admin of School 1 updated salary of School 2 staff, returned {$res->status()}");
    }
}
