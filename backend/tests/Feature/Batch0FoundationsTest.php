<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\AuditLog;
use App\Models\MediaFile;
use App\Models\School;
use App\Models\SchoolSetting;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class Batch0FoundationsTest extends TestCase
{
    use DatabaseMigrations;

    protected School $schoolA;
    protected School $schoolB;
    protected User $adminA;
    protected User $adminB;

    protected function setUp(): void
    {
        parent::setUp();

        // School A
        $this->schoolA = School::create([
            'name' => 'Campus Alpha',
            'code' => 'ALPHA-01',
            'slug' => 'campus-alpha',
            'status' => 'active',
        ]);

        $this->adminA = User::create([
            'school_id' => $this->schoolA->id,
            'name' => 'Admin Alpha',
            'email' => 'admin_alpha@school.com',
            'phone' => '9876543211',
            'password' => bcrypt('secret123'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        // School B
        $this->schoolB = School::create([
            'name' => 'Campus Beta',
            'code' => 'BETA-02',
            'slug' => 'campus-beta',
            'status' => 'active',
        ]);

        $this->adminB = User::create([
            'school_id' => $this->schoolB->id,
            'name' => 'Admin Beta',
            'email' => 'admin_beta@school.com',
            'phone' => '9876543212',
            'password' => bcrypt('secret123'),
            'role' => 'admin',
            'status' => 'active',
        ]);
    }

    public function test_switching_academic_year_and_resolving_context(): void
    {
        Sanctum::actingAs($this->adminA);

        $year1 = AcademicYear::create([
            'school_id' => $this->schoolA->id,
            'name' => '2026-2027',
            'code' => 'AY-2026-27',
            'start_date' => '2026-04-01',
            'end_date' => '2027-03-31',
            'is_current' => true,
            'status' => 'active',
        ]);

        $year2 = AcademicYear::create([
            'school_id' => $this->schoolA->id,
            'name' => '2027-2028',
            'code' => 'AY-2027-28',
            'start_date' => '2027-04-01',
            'end_date' => '2028-03-31',
            'is_current' => false,
            'status' => 'upcoming',
        ]);

        // Year belonging to School B
        $yearB = AcademicYear::create([
            'school_id' => $this->schoolB->id,
            'name' => '2026-2027',
            'code' => 'AY-B-26-27',
            'start_date' => '2026-04-01',
            'end_date' => '2027-03-31',
            'is_current' => true,
            'status' => 'active',
        ]);

        // 1. Can list academic years for active school
        $response = $this->withHeader('X-School-Id', (string)$this->schoolA->id)
            ->getJson('/api/v1/academic-years');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $this->assertCount(2, $response->json('data.academic_years'));

        // 2. Switching to Year 2
        $switchRes = $this->withHeader('X-School-Id', (string)$this->schoolA->id)
            ->postJson('/api/v1/academic-years/switch', ['academic_year_id' => $year2->id]);

        $switchRes->assertStatus(200);

        // 3. Passing cross-school year ID from School B is ignored, falling back to school A's current year
        $fallbackRes = $this->withHeaders([
            'X-School-Id' => (string)$this->schoolA->id,
            'X-Academic-Year-Id' => (string)$yearB->id, // belongs to School B
        ])->getJson('/api/v1/academic-years');

        $fallbackRes->assertStatus(200);
        // Context active_context_year_id falls back to school A current year
        $this->assertEquals($year1->id, $fallbackRes->json('data.active_context_year_id'));
    }

    public function test_settings_save_and_isolation_between_schools(): void
    {
        Sanctum::actingAs($this->adminA);

        // Save School A settings
        $resA = $this->withHeader('X-School-Id', (string)$this->schoolA->id)
            ->postJson('/api/v1/admin/settings', [
                'group' => 'general',
                'settings' => [
                    'school_name' => 'Alpha International Academy',
                    'board' => 'CBSE',
                    'affiliation_no' => 'AFF-ALPHA-123',
                ],
            ]);

        $resA->assertStatus(200);

        // Query School A settings
        $fetchA = $this->withHeader('X-School-Id', (string)$this->schoolA->id)
            ->getJson('/api/v1/admin/settings');

        $fetchA->assertStatus(200);
        $this->assertEquals('Alpha International Academy', $fetchA->json('data.settings.general.school_name'));

        // Switch to School B: assert School B has default or empty settings, NOT Alpha's
        Sanctum::actingAs($this->adminB);

        $fetchB = $this->withHeader('X-School-Id', (string)$this->schoolB->id)
            ->getJson('/api/v1/admin/settings');

        $fetchB->assertStatus(200);
        $this->assertNotEquals('Alpha International Academy', $fetchB->json('data.settings.general.school_name'));
    }

    public function test_secret_masking_and_encrypted_preservation(): void
    {
        Sanctum::actingAs($this->adminA);

        // 1. Save integration secret
        $saveSecret = $this->withHeader('X-School-Id', (string)$this->schoolA->id)
            ->postJson('/api/v1/admin/settings', [
                'group' => 'integrations',
                'settings' => [
                    'razorpay_key_id' => 'rzp_test_key_alpha',
                    'razorpay_key_secret' => 'super_secret_token_1234',
                ],
            ]);

        $saveSecret->assertStatus(200);

        // Verify secret is encrypted in database
        $row = SchoolSetting::withoutGlobalScopes()
            ->where('school_id', $this->schoolA->id)
            ->where('key', 'razorpay_key_secret')
            ->first();

        $this->assertNotNull($row);
        $this->assertTrue((bool)$row->is_secret);
        $this->assertNotEquals('super_secret_token_1234', $row->value);
        $this->assertEquals('super_secret_token_1234', Crypt::decryptString($row->value));

        // 2. Fetch via API: must return masked value ending with 1234
        $fetch = $this->withHeader('X-School-Id', (string)$this->schoolA->id)
            ->getJson('/api/v1/admin/settings');

        $masked = $fetch->json('data.settings.integrations.razorpay_key_secret');
        $this->assertStringContainsString('••••', $masked);
        $this->assertStringEndsWith('1234', $masked);

        // 3. Submitting unchanged masked value preserves original secret without overwriting
        $updateWithMask = $this->withHeader('X-School-Id', (string)$this->schoolA->id)
            ->postJson('/api/v1/admin/settings', [
                'group' => 'integrations',
                'settings' => [
                    'razorpay_key_id' => 'rzp_test_key_alpha_updated',
                    'razorpay_key_secret' => $masked, // sends back the masked string
                ],
            ]);

        $updateWithMask->assertStatus(200);

        $rowAfter = SchoolSetting::withoutGlobalScopes()
            ->where('school_id', $this->schoolA->id)
            ->where('key', 'razorpay_key_secret')
            ->first();

        $this->assertEquals('super_secret_token_1234', Crypt::decryptString($rowAfter->value));
    }

    public function test_file_upload_and_cross_school_denial_returns_404(): void
    {
        Storage::fake('local');
        Sanctum::actingAs($this->adminA);

        // Create valid PDF content with standard PDF header for finfo detection
        $pdfContent = "%PDF-1.4\n1 0 obj\n<< /Title (Test) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF";
        $file = UploadedFile::fake()->createWithContent('student_birth_certificate.pdf', $pdfContent);

        // 1. Upload private document for School A
        $uploadRes = $this->withHeader('X-School-Id', (string)$this->schoolA->id)
            ->postJson('/api/v1/files/upload', [
                'file' => $file,
                'document_type' => 'student_document',
                'visibility' => 'private',
            ]);

        $uploadRes->assertStatus(201);
        $token = $uploadRes->json('data.file_token');
        $this->assertNotNull($token);

        // School A admin can preview
        $previewResA = $this->withHeader('X-School-Id', (string)$this->schoolA->id)
            ->get("/api/v1/files/{$token}/preview");
        $previewResA->assertStatus(200);

        // School B admin attempting to preview School A's token gets 404
        Sanctum::actingAs($this->adminB);
        $previewResB = $this->withHeader('X-School-Id', (string)$this->schoolB->id)
            ->get("/api/v1/files/{$token}/preview");

        $previewResB->assertStatus(404);

        // Even if School B admin tries to spoof X-School-Id to School A, they still get 404
        $spoofedRes = $this->withHeader('X-School-Id', (string)$this->schoolA->id)
            ->get("/api/v1/files/{$token}/preview");

        $spoofedRes->assertStatus(404);
    }

    public function test_audit_log_creation_on_model_mutations(): void
    {
        Sanctum::actingAs($this->adminA);

        // Create a Student
        $student = Student::create([
            'school_id' => $this->schoolA->id,
            'admission_number' => 'STU-ALPHA-101',
            'roll_number' => '1',
            'first_name' => 'Aarav',
            'last_name' => 'Sharma',
            'guardian_name' => 'Rajesh Sharma',
            'guardian_phone' => '9988776655',
            'status' => 'Active',
        ]);

        // Check audit log for 'created'
        $createLog = AuditLog::where('school_id', $this->schoolA->id)
            ->where('auditable_type', Student::class)
            ->where('auditable_id', $student->id)
            ->where('event', 'created')
            ->first();

        $this->assertNotNull($createLog);
        $this->assertEquals('Aarav', $createLog->new_values['first_name'] ?? null);

        // Update student
        $student->update(['first_name' => 'Aarav Kumar']);

        // Check audit log for 'updated'
        $updateLog = AuditLog::where('school_id', $this->schoolA->id)
            ->where('auditable_type', Student::class)
            ->where('auditable_id', $student->id)
            ->where('event', 'updated')
            ->first();

        $this->assertNotNull($updateLog);
        $this->assertEquals('Aarav', $updateLog->old_values['first_name'] ?? null);
        $this->assertEquals('Aarav Kumar', $updateLog->new_values['first_name'] ?? null);
    }

    public function test_overlapping_academic_year_rejection(): void
    {
        Sanctum::actingAs($this->adminA);

        AcademicYear::create([
            'school_id' => $this->schoolA->id,
            'name' => '2026-2027',
            'code' => 'AY-2026-27',
            'start_date' => '2026-04-01',
            'end_date' => '2027-03-31',
            'is_current' => true,
            'status' => 'active',
        ]);

        // Attempt to create overlapping session in School A
        $res = $this->withHeader('X-School-Id', (string)$this->schoolA->id)
            ->postJson('/api/v1/admin/academic-years', [
                'name' => '2026-2027 Overlap',
                'code' => 'AY-OVLP',
                'start_date' => '2026-06-01',
                'end_date' => '2027-05-31',
            ]);

        $res->assertStatus(422);
        $res->assertJsonPath('success', false);
        $this->assertStringContainsString('overlaps', $res->json('message'));
    }

    public function test_end_date_less_than_or_equal_to_start_date_rejection(): void
    {
        Sanctum::actingAs($this->adminA);

        // end_date equal to start_date
        $resEqual = $this->withHeader('X-School-Id', (string)$this->schoolA->id)
            ->postJson('/api/v1/admin/academic-years', [
                'name' => '2028-2029',
                'code' => 'AY-2028-29',
                'start_date' => '2028-04-01',
                'end_date' => '2028-04-01',
            ]);

        $resEqual->assertStatus(422);
        $resEqual->assertJsonValidationErrors(['end_date']);

        // end_date before start_date
        $resBefore = $this->withHeader('X-School-Id', (string)$this->schoolA->id)
            ->postJson('/api/v1/admin/academic-years', [
                'name' => '2028-2029',
                'code' => 'AY-2028-29',
                'start_date' => '2028-04-01',
                'end_date' => '2028-03-01',
            ]);

        $resBefore->assertStatus(422);
        $resBefore->assertJsonValidationErrors(['end_date']);
    }

    public function test_deleting_current_academic_year_is_blocked(): void
    {
        Sanctum::actingAs($this->adminA);

        $currentYear = AcademicYear::create([
            'school_id' => $this->schoolA->id,
            'name' => '2026-2027',
            'code' => 'AY-2026-27',
            'start_date' => '2026-04-01',
            'end_date' => '2027-03-31',
            'is_current' => true,
            'status' => 'active',
        ]);

        $delRes = $this->withHeader('X-School-Id', (string)$this->schoolA->id)
            ->deleteJson("/api/v1/admin/academic-years/{$currentYear->id}");

        $delRes->assertStatus(422);
        $delRes->assertJsonPath('success', false);
        $this->assertStringContainsString('Cannot delete the active current', $delRes->json('message'));

        $this->assertDatabaseHas('academic_years', [
            'id' => $currentYear->id,
            'deleted_at' => null,
        ]);
    }

    public function test_cross_school_academic_year_header_falls_back_to_current_year(): void
    {
        Sanctum::actingAs($this->adminA);

        $yearA = AcademicYear::create([
            'school_id' => $this->schoolA->id,
            'name' => '2026-2027',
            'code' => 'AY-A-26-27',
            'start_date' => '2026-04-01',
            'end_date' => '2027-03-31',
            'is_current' => true,
            'status' => 'active',
        ]);

        $yearB = AcademicYear::create([
            'school_id' => $this->schoolB->id,
            'name' => '2026-2027',
            'code' => 'AY-B-26-27',
            'start_date' => '2026-04-01',
            'end_date' => '2027-03-31',
            'is_current' => true,
            'status' => 'active',
        ]);

        // When School A sends Year B ID, it is rejected and resolves to Year A
        $res = $this->withHeaders([
            'X-School-Id' => (string)$this->schoolA->id,
            'X-Academic-Year-Id' => (string)$yearB->id,
        ])->getJson('/api/v1/academic-years');

        $res->assertStatus(200);
        $this->assertEquals($yearA->id, $res->json('data.active_context_year_id'));
    }

    public function test_audit_logs_never_contain_secret_values_or_passwords(): void
    {
        Sanctum::actingAs($this->adminA);

        // 1. User creation with password
        $user = User::create([
            'school_id' => $this->schoolA->id,
            'name' => 'Test Staff',
            'email' => 'teststaff@school.com',
            'phone' => '9112233445',
            'password' => bcrypt('super_secret_plain_pass'),
            'role' => 'teacher',
        ]);

        $userLog = AuditLog::where('auditable_type', User::class)
            ->where('auditable_id', $user->id)
            ->where('event', 'created')
            ->first();

        $this->assertNotNull($userLog);
        $this->assertEquals('[REDACTED]', $userLog->new_values['password'] ?? null);
        $this->assertStringNotContainsString('super_secret_plain_pass', json_encode($userLog->new_values));

        // 2. Secret School Setting
        $setting = SchoolSetting::create([
            'school_id' => $this->schoolA->id,
            'group' => 'integrations',
            'key' => 'razorpay_key_secret',
            'value' => Crypt::encryptString('live_secret_key_9988'),
            'is_secret' => true,
        ]);

        $settingLog = AuditLog::where('auditable_type', SchoolSetting::class)
            ->where('auditable_id', $setting->id)
            ->first();

        $this->assertNotNull($settingLog);
        $this->assertEquals('[ENCRYPTED_SECRET_CHANGED]', $settingLog->new_values['value'] ?? null);
        $this->assertStringNotContainsString('live_secret_key_9988', json_encode($settingLog->new_values));
    }

    public function test_admin_of_school_a_cannot_read_school_b_audit_logs(): void
    {
        // Create an audit log for School B
        $logB = AuditLog::create([
            'school_id' => $this->schoolB->id,
            'user_name' => 'Admin Beta',
            'user_role' => 'admin',
            'auditable_type' => 'App\Models\SchoolSetting',
            'auditable_id' => 999,
            'event' => 'updated',
            'new_values' => ['branding' => 'updated'],
            'created_at' => now(),
        ]);

        // Admin A queries audit logs
        Sanctum::actingAs($this->adminA);
        $resA = $this->withHeader('X-School-Id', (string)$this->schoolA->id)
            ->getJson('/api/v1/admin/audit-logs');

        $resA->assertStatus(200);
        $logIdsA = collect($resA->json('data.data'))->pluck('id')->all();

        // Must not contain School B's audit log
        $this->assertNotContains($logB->id, $logIdsA);
    }
}
