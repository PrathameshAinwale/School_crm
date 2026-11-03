<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\School;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SqlInjectionProtectionTest extends TestCase
{
    use DatabaseMigrations;

    protected School $school;
    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->school = School::create([
            'name' => 'Cyber Security High School',
            'code' => 'CYBER-01',
            'slug' => 'cyber-high',
            'status' => 'active',
            'subscription_plan' => 'Pro',
        ]);

        $this->adminUser = User::create([
            'school_id' => $this->school->id,
            'name' => 'SecOps Admin',
            'email' => 'secops@school.com',
            'phone' => '9876543210',
            'password' => bcrypt('StrongPass123!'),
            'role' => 'admin',
            'status' => 'active',
        ]);
    }

    /**
     * Test that LIKE queries escape wildcards (%) and (_) and match literally.
     */
    public function test_search_escapes_like_wildcards_matching_literal_percent_and_underscore(): void
    {
        Sanctum::actingAs($this->adminUser);

        // Create two books: one with literal percent, one without
        Book::create([
            'school_id' => $this->school->id,
            'title' => 'Maths Guide 50% Discount',
            'author' => 'Author A',
            'isbn' => 'ISBN-50PCT',
            'category' => 'Mathematics',
            'total_copies' => 10,
            'available_copies' => 10,
        ]);

        Book::create([
            'school_id' => $this->school->id,
            'title' => 'Maths Guide 500 Discount',
            'author' => 'Author B',
            'isbn' => 'ISBN-500',
            'category' => 'Mathematics',
            'total_copies' => 10,
            'available_copies' => 10,
        ]);

        // Create two books: one with underscore, one with regular character
        Book::create([
            'school_id' => $this->school->id,
            'title' => 'Biology_Unit_A',
            'author' => 'Author C',
            'isbn' => 'ISBN-BIO-1',
            'category' => 'Science',
            'total_copies' => 5,
            'available_copies' => 5,
        ]);

        Book::create([
            'school_id' => $this->school->id,
            'title' => 'BiologyXUnitXA',
            'author' => 'Author D',
            'isbn' => 'ISBN-BIO-2',
            'category' => 'Science',
            'total_copies' => 5,
            'available_copies' => 5,
        ]);

        // Search for literal '50%'
        $resPercent = $this->withHeader('X-School-Id', (string) $this->school->id)
            ->getJson('/api/v1/library/books?search=50%25');

        $resPercent->assertStatus(200);
        $titles = collect($resPercent->json('data'))->pluck('title');
        $this->assertTrue($titles->contains('Maths Guide 50% Discount'));
        $this->assertFalse($titles->contains('Maths Guide 500 Discount'));

        // Search for literal 'Biology_Unit'
        $resUnderscore = $this->withHeader('X-School-Id', (string) $this->school->id)
            ->getJson('/api/v1/library/books?search=Biology_Unit');

        $resUnderscore->assertStatus(200);
        $titles2 = collect($resUnderscore->json('data'))->pluck('title');
        $this->assertTrue($titles2->contains('Biology_Unit_A'));
        $this->assertFalse($titles2->contains('BiologyXUnitXA'));
    }

    /**
     * Test common SQL injection payloads in search queries do not crash or leak data.
     */
    public function test_sql_injection_payloads_in_search_return_clean_response(): void
    {
        Sanctum::actingAs($this->adminUser);

        $payloads = [
            "' OR '1'='1",
            "1' UNION SELECT 1,2,3,4,5,6,7,8,9,10--",
            "'; SELECT SLEEP(2)--",
            "\" OR \"\"=\"",
            "admin'--",
            "' OR 1=1#",
            "\\",
            "%' AND 1=0 UNION SELECT 1--",
        ];

        foreach ($payloads as $payload) {
            $response = $this->withHeader('X-School-Id', (string) $this->school->id)
                ->getJson('/api/v1/library/books?search=' . urlencode($payload));

            // Must respond cleanly with 200 and success, not 500 or SQL syntax error
            $response->assertStatus(200);
            $this->assertTrue($response->json('success'));
        }
    }

    /**
     * Test that non-numeric route parameters are blocked at routing level with 404.
     */
    public function test_non_numeric_route_parameters_are_rejected_with_404(): void
    {
        Sanctum::actingAs($this->adminUser);

        // Attempt SQL injection via ID route parameter
        $resInjection = $this->withHeader('X-School-Id', (string) $this->school->id)
            ->getJson("/api/v1/assignments/1' OR '1'='1");
        $resInjection->assertStatus(404);

        $resAlpha = $this->withHeader('X-School-Id', (string) $this->school->id)
            ->getJson('/api/v1/assignments/non-numeric-id');
        $resAlpha->assertStatus(404);
    }

    /**
     * Test that generic school update rejects tampering with sensitive tenant fields.
     */
    public function test_mass_assignment_protection_blocks_sensitive_tenant_fields(): void
    {
        $superAdmin = User::create([
            'name' => 'Super Administrator',
            'email' => 'super@platform.internal',
            'password' => bcrypt('SuperSecret!'),
            'role' => 'super_admin',
            'status' => 'active',
        ]);

        Sanctum::actingAs($superAdmin);

        $response = $this->putJson("/api/v1/super-admin/schools/{$this->school->id}", [
            'name' => 'Legitimate Updated Campus Name',
            'city' => 'Pune',
            'status' => 'suspended', // Should NOT be modified via generic update
            'subscription_plan' => 'Enterprise', // Should NOT be modified via generic update
        ]);

        $response->assertStatus(200);

        $fresh = $this->school->fresh();
        $this->assertEquals('Legitimate Updated Campus Name', $fresh->name);
        $this->assertEquals('active', $fresh->status); // Preserved active
        $this->assertEquals('Pro', $fresh->subscription_plan); // Preserved Pro
    }
}

