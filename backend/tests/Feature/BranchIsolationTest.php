<?php

namespace Tests\Feature;

use App\Models\School;
use App\Models\User;
use App\Models\Student;
use Laravel\Sanctum\Sanctum;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class BranchIsolationTest extends TestCase
{
    use DatabaseMigrations;

    public function test_teacher_cannot_cross_access_another_branch_returns_403()
    {
        $school1 = School::create([
            'name' => 'Arch Campus Main',
            'code' => 'DPS-101',
            'slug' => 'arch-campus-main',
        ]);

        $school2 = School::create([
            'name' => 'Arch Campus West',
            'code' => 'STX-102',
            'slug' => 'arch-campus-west',
        ]);

        $teacher = User::factory()->create([
            'school_id' => $school1->id,
            'role' => 'teacher',
        ]);

        Sanctum::actingAs($teacher);

        $response = $this->withHeader('X-School-Id', (string)$school2->id)
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(403);
        $response->assertJson([
            'success' => false,
        ]);
    }

    public function test_requesting_nonexistent_branch_returns_404()
    {
        $school1 = School::firstOrCreate(
            ['code' => 'DPS-101'],
            ['name' => 'Arch Campus Main', 'slug' => 'arch-campus-main']
        );

        $admin = User::factory()->create([
            'school_id' => $school1->id,
            'role' => 'admin',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->withHeader('X-School-Id', '999999')
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(404);
        $response->assertJson([
            'success' => false,
        ]);
    }

    public function test_admin_can_resolve_valid_branch_via_header()
    {
        $school1 = School::create([
            'name' => 'Arch Campus Main',
            'code' => 'DPS-101',
            'slug' => 'arch-campus-main',
        ]);

        $school2 = School::create([
            'name' => 'Arch Campus West',
            'code' => 'STX-102',
            'slug' => 'arch-campus-west',
        ]);

        $admin = User::factory()->create([
            'school_id' => $school1->id,
            'role' => 'admin',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->withHeader('X-School-Id', (string)$school2->id)
            ->getJson('/api/v1/schools/branches');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'active_school_id' => $school2->id,
        ]);

        // Assert user's permanent home branch was NOT overwritten
        $this->assertEquals($school1->id, $admin->fresh()->school_id);
    }

    public function test_cross_branch_data_isolation_between_schools()
    {
        $school1 = School::create([
            'name' => 'Arch Campus Main',
            'code' => 'DPS-101',
            'slug' => 'arch-campus-main',
        ]);

        $school2 = School::create([
            'name' => 'Arch Campus West',
            'code' => 'STX-102',
            'slug' => 'arch-campus-west',
        ]);

        $user1 = User::factory()->create(['school_id' => $school1->id, 'role' => 'student_parent']);
        $student1 = Student::create([
            'school_id' => $school1->id,
            'user_id' => $user1->id,
            'admission_number' => 'STU-001',
            'first_name' => 'BranchOne',
            'last_name' => 'Student',
            'guardian_name' => 'Parent One',
            'guardian_phone' => '9999999991',
        ]);

        $user2 = User::factory()->create(['school_id' => $school2->id, 'role' => 'student_parent']);
        $student2 = Student::create([
            'school_id' => $school2->id,
            'user_id' => $user2->id,
            'admission_number' => 'STU-002',
            'first_name' => 'BranchTwo',
            'last_name' => 'Student',
            'guardian_name' => 'Parent Two',
            'guardian_phone' => '9999999992',
        ]);

        $admin = User::factory()->create(['school_id' => $school1->id, 'role' => 'admin']);
        Sanctum::actingAs($admin);

        // When admin queries with school1 header, only student1 is returned
        $res1 = $this->withHeader('X-School-Id', (string)$school1->id)
            ->getJson('/api/v1/admin/students');
        $res1->assertStatus(200);
        $names1 = collect($res1->json('data.data'))->pluck('first_name')->all();
        $this->assertContains('BranchOne', $names1);
        $this->assertNotContains('BranchTwo', $names1);

        // When admin switches header to school2, only student2 is returned
        $res2 = $this->withHeader('X-School-Id', (string)$school2->id)
            ->getJson('/api/v1/admin/students');
        $res2->assertStatus(200);
        $names2 = collect($res2->json('data.data'))->pluck('first_name')->all();
        $this->assertContains('BranchTwo', $names2);
        $this->assertNotContains('BranchOne', $names2);
    }
}
