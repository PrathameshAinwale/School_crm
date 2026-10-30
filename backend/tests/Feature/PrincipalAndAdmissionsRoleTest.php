<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\Admission;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PrincipalAndAdmissionsRoleTest extends TestCase
{
    use RefreshDatabase;

    protected School $school;
    protected AcademicYear $ay;
    protected User $principal;
    protected User $admissionOfficer;
    protected User $admin;
    protected SchoolClass $class;

    protected function setUp(): void
    {
        parent::setUp();

        $this->school = School::create([
            'name' => 'Delhi Public Academy',
            'slug' => 'delhi-public-academy',
            'code' => 'DPA01',
            'status' => 'active',
            'subscription_status' => 'active',
        ]);

        $this->ay = AcademicYear::create([
            'school_id' => $this->school->id,
            'name' => '2026-2027',
            'code' => 'AY-2026-27',
            'start_date' => '2026-04-01',
            'end_date' => '2027-03-31',
            'status' => 'current',
            'is_current' => true,
        ]);

        $this->admin = User::create([
            'school_id' => $this->school->id,
            'name' => 'System Administrator',
            'email' => 'admin@school.com',
            'phone' => '9876543210',
            'password' => Hash::make('111111'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        $this->principal = User::create([
            'school_id' => $this->school->id,
            'name' => 'Dr. Rajeshwari Sharma (Principal)',
            'email' => 'principal@school.com',
            'phone' => '9876543219',
            'password' => Hash::make('111111'),
            'role' => 'principal',
            'status' => 'active',
        ]);

        $this->admissionOfficer = User::create([
            'school_id' => $this->school->id,
            'name' => 'Meera Joshi (Admissions Officer)',
            'email' => 'admissions@school.com',
            'phone' => '9876543220',
            'password' => Hash::make('111111'),
            'role' => 'admission_officer',
            'status' => 'active',
        ]);

        $this->class = SchoolClass::create([
            'name' => 'Class 10',
            'school_id' => $this->school->id,
        ]);
    }

    public function test_principal_has_executive_access_to_admin_endpoints(): void
    {
        Sanctum::actingAs($this->principal);

        $response = $this->getJson('/api/v1/admin/dashboard');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_principal_is_strictly_forbidden_from_write_operations(): void
    {
        Sanctum::actingAs($this->principal);

        // Attempt to create a student -> 403 Forbidden
        $postStudent = $this->postJson('/api/v1/admin/students', [
            'first_name' => 'Test',
            'last_name' => 'Student',
            'admission_number' => 'ADM-9999',
            'school_class_id' => $this->class->id,
        ]);
        $postStudent->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Principal role has view-only executive access. Modification actions are forbidden.'
            ]);

        // Attempt to create an admission -> 403 Forbidden
        $postAdmission = $this->postJson('/api/v1/admin/admissions', [
            'first_name' => 'Test',
            'last_name' => 'Applicant',
            'school_class_id' => $this->class->id,
        ]);
        $postAdmission->assertStatus(403);

        // Attempt to delete a vehicle -> 403 Forbidden
        $deleteVehicle = $this->deleteJson('/api/v1/admin/vehicles/999');
        $deleteVehicle->assertStatus(403);
    }

    public function test_principal_can_perform_whitelisted_session_actions(): void
    {
        Sanctum::actingAs($this->principal);

        // Principal can switch academic years
        $switchYear = $this->postJson('/api/v1/academic-years/switch', [
            'academic_year_id' => $this->ay->id,
        ]);
        $switchYear->assertStatus(200);
    }

    public function test_principal_can_edit_school_settings(): void
    {
        Sanctum::actingAs($this->principal);

        $response = $this->postJson('/api/v1/admin/settings', [
            'group' => 'general',
            'settings' => [
                'school_name' => 'Updated Public Academy',
                'phone' => '+91 99999 88888',
            ],
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_admission_officer_can_access_and_manage_admissions(): void
    {
        Sanctum::actingAs($this->admissionOfficer);

        // 1. Admission officer creates an admission lead
        $createResponse = $this->postJson('/api/v1/admin/admissions', [
            'first_name' => 'Aarav',
            'last_name' => 'Sharma',
            'guardian_name' => 'Vikram Sharma',
            'guardian_phone' => '9876543210',
            'school_class_id' => $this->class->id,
            'academic_year' => '2026-2027',
            'status' => 'Inquiry',
        ]);

        $createResponse->assertStatus(201)
            ->assertJson(['success' => true]);

        $admissionId = $createResponse->json('data.id');

        // 2. Admission officer can fetch pipeline
        $listResponse = $this->getJson('/api/v1/admin/admissions');

        $listResponse->assertStatus(200)
            ->assertJson(['success' => true]);

        // 3. School admin sees the exact same admission created by admission officer in real time
        Sanctum::actingAs($this->admin);

        $adminViewResponse = $this->getJson('/api/v1/admin/admissions');

        $adminViewResponse->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertTrue(
            collect($adminViewResponse->json('data.data') ?? $adminViewResponse->json('data'))->contains('id', $admissionId),
            'School Admin must see the admission created by Admission Officer in real time.'
        );
    }

    public function test_admission_officer_is_denied_access_to_unauthorized_admin_modules(): void
    {
        Sanctum::actingAs($this->admissionOfficer);

        // Admission officer must NOT access system audit logs
        $response = $this->getJson('/api/v1/admin/audit-logs');

        $response->assertStatus(403);
    }

    public function test_admission_officer_and_staff_can_access_self_attendance_and_leaves(): void
    {
        Sanctum::actingAs($this->admissionOfficer);

        // Admission officer can access their own attendance
        $attResponse = $this->getJson('/api/v1/teacher/my-attendance');
        $attResponse->assertStatus(200)
            ->assertJson(['success' => true]);

        // Admission officer can punch in
        $punchResponse = $this->postJson('/api/v1/teacher/punch');
        $punchResponse->assertStatus(200)
            ->assertJson(['success' => true]);

        // Admission officer can access their leave balance
        $leaveResponse = $this->getJson('/api/v1/teacher/leaves');
        $leaveResponse->assertStatus(200)
            ->assertJson(['success' => true]);
    }
}
