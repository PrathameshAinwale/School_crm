<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\School;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Admission;
use App\Models\Book;
use App\Models\SchoolExpense;
use App\Models\Vehicle;
use App\Models\Resource;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\AcademicYear;
use Laravel\Sanctum\Sanctum;
use Illuminate\Foundation\Testing\RefreshDatabase;

class RouteConstraintsClickthroughVerificationTest extends TestCase
{
    use RefreshDatabase;

    protected School $school;
    protected User $admin;
    protected User $teacherUser;
    protected User $parentUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->school = School::create([
            'name' => 'City Public School',
            'code' => 'CPS-01',
            'slug' => 'city-public',
            'city' => 'Delhi',
            'status' => 'active',
        ]);

        $this->admin = User::create([
            'school_id' => $this->school->id,
            'name' => 'Principal Admin',
            'email' => 'admin@cps.edu',
            'password' => bcrypt('AdminPass123!'),
            'role' => 'admin',
            'status' => 'active',
        ]);
    }

    public function test_student_list_to_view_and_edit_roundtrip()
    {
        Sanctum::actingAs($this->admin);

        $user = User::factory()->create(['school_id' => $this->school->id, 'role' => 'student_parent']);
        $student = Student::create([
            'school_id' => $this->school->id,
            'user_id' => $user->id,
            'admission_number' => 'STU-1001',
            'first_name' => 'Aarav',
            'last_name' => 'Patel',
            'guardian_name' => 'Suresh Patel',
            'guardian_phone' => '9820112233',
        ]);

        // List
        $resList = $this->withHeader('X-School-Id', (string)$this->school->id)
            ->getJson('/api/v1/admin/students');
        $resList->assertStatus(200);

        // View single by numeric ID
        $resView = $this->withHeader('X-School-Id', (string)$this->school->id)
            ->getJson("/api/v1/admin/students/{$student->id}");
        $resView->assertStatus(200);

        // Check non-numeric rejected
        $resInvalid = $this->withHeader('X-School-Id', (string)$this->school->id)
            ->getJson('/api/v1/admin/students/undefined');
        $resInvalid->assertStatus(404);
    }

    public function test_teacher_list_to_view_and_edit_roundtrip()
    {
        Sanctum::actingAs($this->admin);

        $user = User::factory()->create(['school_id' => $this->school->id, 'role' => 'teacher']);
        $teacher = Teacher::create([
            'school_id' => $this->school->id,
            'user_id' => $user->id,
            'teacher_id' => 'TCH-201',
            'first_name' => 'Meera',
            'last_name' => 'Deshmukh',
            'email' => 'meera@cps.edu',
        ]);

        $resList = $this->withHeader('X-School-Id', (string)$this->school->id)
            ->getJson('/api/v1/admin/teachers');
        $resList->assertStatus(200);

        $resView = $this->withHeader('X-School-Id', (string)$this->school->id)
            ->getJson("/api/v1/admin/teachers/{$teacher->id}");
        $resView->assertStatus(200);

        $resInvalid = $this->withHeader('X-School-Id', (string)$this->school->id)
            ->getJson('/api/v1/admin/teachers/new');
        $resInvalid->assertStatus(404);
    }

    public function test_admission_list_to_view_roundtrip()
    {
        Sanctum::actingAs($this->admin);

        $adm = Admission::create([
            'school_id' => $this->school->id,
            'application_number' => 'ADM-2026-001',
            'first_name' => 'Rohan',
            'last_name' => 'Gupta',
            'guardian_name' => 'Manoj Gupta',
            'guardian_phone' => '9820114455',
            'status' => 'inquiry',
        ]);

        $resList = $this->withHeader('X-School-Id', (string)$this->school->id)
            ->getJson('/api/v1/admin/admissions');
        $resList->assertStatus(200);

        $resView = $this->withHeader('X-School-Id', (string)$this->school->id)
            ->getJson("/api/v1/admin/admissions/{$adm->id}");
        $resView->assertStatus(200);

        $resInvalid = $this->withHeader('X-School-Id', (string)$this->school->id)
            ->getJson('/api/v1/admin/admissions/NaN');
        $resInvalid->assertStatus(404);
    }

    public function test_vehicle_and_resource_edit_save_roundtrip()
    {
        Sanctum::actingAs($this->admin);

        $vehicle = Vehicle::create([
            'vehicle_number' => 'MH-12-AB-9999',
            'type' => 'Bus',
            'capacity' => 45,
            'driver_name' => 'Rajesh Driver',
            'driver_phone' => '9820119999',
            'status' => 'Active',
        ]);

        $resVehicle = $this->withHeader('X-School-Id', (string)$this->school->id)
            ->putJson("/api/v1/admin/vehicles/{$vehicle->id}", [
                'vehicle_number' => 'MH-12-AB-9999',
                'type' => 'Bus',
                'capacity' => 50,
                'driver_name' => 'Rajesh Driver Updated',
                'driver_phone' => '9820119999',
                'route_from' => 'Main Gate',
                'route_to' => 'City Center',
                'route_name' => 'Main Gate ➔ City Center',
            ]);
        $resVehicle->assertStatus(200);

        $resource = Resource::create([
            'school_id' => $this->school->id,
            'resource_code' => 'RES-BIO-01',
            'name' => 'Digital Microscope',
            'category' => 'Laboratory',
            'total_quantity' => 10,
            'available_quantity' => 10,
            'condition' => 'Good',
        ]);

        $resResource = $this->withHeader('X-School-Id', (string)$this->school->id)
            ->putJson("/api/v1/admin/resources/{$resource->id}", [
                'name' => 'Digital Microscope Pro',
                'category' => 'Laboratory',
                'total_quantity' => 12,
                'available_quantity' => 12,
                'condition' => 'Good',
            ]);
        $resResource->assertStatus(200);
        $this->assertEquals('Digital Microscope Pro', $resource->fresh()->name);
    }
}
