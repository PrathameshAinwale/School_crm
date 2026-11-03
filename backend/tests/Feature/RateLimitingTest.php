<?php

namespace Tests\Feature;

use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RateLimitingTest extends TestCase
{
    use DatabaseMigrations;

    protected School $school;
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->school = School::create([
            'name' => 'Test School',
            'code' => 'TS-101',
            'slug' => 'test-school',
        ]);

        $this->user = User::factory()->create([
            'school_id' => $this->school->id,
            'email' => 'ratelimit@school.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);

        RateLimiter::clear('login:ratelimit@school.com|127.0.0.1');
        RateLimiter::clear('login_ip:127.0.0.1');
        RateLimiter::clear("api:{$this->user->id}");
    }

    public function test_login_rate_limiter_blocks_on_sixth_attempt_with_retry_after()
    {
        // 5 allowed attempts
        for ($i = 1; $i <= 5; $i++) {
            $res = $this->postJson('/api/v1/auth/login', [
                'identifier' => 'ratelimit@school.com',
                'password' => 'wrongpass',
            ]);
            // Either 401 (invalid credentials) or not 429
            $this->assertNotEquals(429, $res->status(), "Attempt $i should not be throttled yet");
        }

        // 6th attempt must return 429 with Retry-After header
        $blockedRes = $this->postJson('/api/v1/auth/login', [
            'identifier' => 'ratelimit@school.com',
            'password' => 'wrongpass',
        ]);

        $blockedRes->assertStatus(429);
        $this->assertTrue($blockedRes->headers->has('Retry-After'));
        $blockedRes->assertJsonStructure([
            'success',
            'message',
        ]);
        $this->assertStringContainsString('Too many login attempts', $blockedRes->json('message'));
    }

    public function test_authenticated_api_allows_normal_usage_under_120_per_min()
    {
        Sanctum::actingAs($this->user);

        // A burst of 10 requests runs cleanly
        for ($i = 0; $i < 10; $i++) {
            $res = $this->getJson('/api/v1/admin/academic/classes');
            $this->assertEquals(200, $res->status());
        }
    }
}
