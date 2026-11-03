<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TenantCacheSafetyTest extends TestCase
{
    use DatabaseMigrations;

    protected School $schoolA;
    protected School $schoolB;
    protected User $adminA;
    protected User $adminB;

    protected function setUp(): void
    {
        parent::setUp();

        $this->schoolA = School::create([
            'name' => 'School A Campus',
            'code' => 'SCH-A',
            'slug' => 'school-a',
        ]);

        $this->schoolB = School::create([
            'name' => 'School B Campus',
            'code' => 'SCH-B',
            'slug' => 'school-b',
        ]);

        $this->adminA = User::factory()->create([
            'school_id' => $this->schoolA->id,
            'role' => 'admin',
        ]);

        $this->adminB = User::factory()->create([
            'school_id' => $this->schoolB->id,
            'role' => 'admin',
        ]);
    }

    public function test_classes_cache_is_strictly_tenant_isolated()
    {
        // Create Class for School A
        $clsA = SchoolClass::create([
            'school_id' => $this->schoolA->id,
            'name' => 'Class Alpha (School A Exclusive)',
            'code' => 'CLA',
        ]);
        Section::create([
            'school_id' => $this->schoolA->id,
            'school_class_id' => $clsA->id,
            'name' => 'Section Red',
            'capacity' => 30,
        ]);

        // Create Class for School B
        $clsB = SchoolClass::create([
            'school_id' => $this->schoolB->id,
            'name' => 'Class Beta (School B Exclusive)',
            'code' => 'CLB',
        ]);
        Section::create([
            'school_id' => $this->schoolB->id,
            'school_class_id' => $clsB->id,
            'name' => 'Section Blue',
            'capacity' => 30,
        ]);

        // 1. Admin A fetches classes
        Sanctum::actingAs($this->adminA);
        $resA = $this->getJson('/api/v1/admin/academic/classes');
        $resA->assertStatus(200);
        $resA->assertJsonFragment(['name' => 'Class Alpha (School A Exclusive)']);
        $resA->assertJsonMissing(['name' => 'Class Beta (School B Exclusive)']);

        // 2. Admin B fetches classes
        Sanctum::actingAs($this->adminB);
        $resB = $this->getJson('/api/v1/admin/academic/classes');
        $resB->assertStatus(200);
        $resB->assertJsonFragment(['name' => 'Class Beta (School B Exclusive)']);
        $resB->assertJsonMissing(['name' => 'Class Alpha (School A Exclusive)']);
    }

    public function test_classes_cache_invalidates_via_versioning_on_class_creation()
    {
        Sanctum::actingAs($this->adminA);

        // First call populates cache
        $res1 = $this->getJson('/api/v1/admin/academic/classes');
        $res1->assertStatus(200);

        // Store a new class in School A
        $postRes = $this->postJson('/api/v1/admin/academic/classes', [
            'name' => 'Class Gamma Newly Added',
            'code' => 'CGN',
            'sections' => ['Green Section'],
        ]);
        $postRes->assertStatus(201);

        // Second call must return the new class immediately (cache invalidation verified)
        $res2 = $this->getJson('/api/v1/admin/academic/classes');
        $res2->assertStatus(200);
        $res2->assertJsonFragment(['name' => 'Class Gamma Newly Added']);
    }

    public function test_academic_year_cache_isolation_and_invalidation()
    {
        $yearA = AcademicYear::create([
            'school_id' => $this->schoolA->id,
            'name' => '2026-2027 A',
            'code' => 'AY-A',
            'start_date' => '2026-04-01',
            'end_date' => '2027-03-31',
            'is_current' => true,
            'status' => 'active',
        ]);

        $yearB = AcademicYear::create([
            'school_id' => $this->schoolB->id,
            'name' => '2026-2027 B',
            'code' => 'AY-B',
            'start_date' => '2026-06-01',
            'end_date' => '2027-05-31',
            'is_current' => true,
            'status' => 'active',
        ]);

        // Verify cache keys exist separately
        Cache::put("school_{$this->schoolA->id}_current_year_id", $yearA->id, 3600);
        Cache::put("school_{$this->schoolB->id}_current_year_id", $yearB->id, 3600);

        $this->assertEquals($yearA->id, Cache::get("school_{$this->schoolA->id}_current_year_id"));
        $this->assertEquals($yearB->id, Cache::get("school_{$this->schoolB->id}_current_year_id"));

        // Trigger update on year A
        $yearA->update(['description' => 'Updated session notes']);

        // School A cache must be flushed, School B must be intact
        $this->assertNull(Cache::get("school_{$this->schoolA->id}_current_year_id"));
        $this->assertEquals($yearB->id, Cache::get("school_{$this->schoolB->id}_current_year_id"));
    }
}
