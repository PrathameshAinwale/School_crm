<?php

namespace Tests\Feature;

use App\Jobs\DispatchCommunicationCampaignJob;
use App\Jobs\SendCommunicationBatchJob;
use App\Models\CommunicationCampaign;
use App\Models\CommunicationLog;
use App\Models\CommunicationOptOut;
use App\Models\CommunicationTemplate;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\SchoolSetting;
use App\Models\SchoolNotice;
use App\Models\Notification;
use App\Models\Teacher;
use App\Models\Student;
use App\Models\User;
use App\Services\Communication\AudienceResolver;
use App\Services\Communication\CommunicationManager;
use App\Services\Communication\PhoneNormalizer;
use App\Services\Communication\SsrfProtection;
use App\Services\Communication\TemplateCompiler;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use InvalidArgumentException;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class Batch1CommunicationTest extends TestCase
{
    use DatabaseMigrations;

    protected School $schoolA;
    protected School $schoolB;
    protected User $adminA;
    protected User $adminB;
    protected SchoolClass $class10;

    protected function setUp(): void
    {
        parent::setUp();

        $this->schoolA = School::create([
            'name' => 'Delhi Public Academy',
            'code' => 'DPA-01',
            'slug' => 'dpa-delhi',
            'status' => 'active',
            'webhook_key' => 'webhook_key_alpha_1234567890abcdef',
        ]);

        $this->adminA = User::create([
            'school_id' => $this->schoolA->id,
            'name' => 'Admin Alpha',
            'email' => 'admin_alpha@dpa.edu',
            'phone' => '9876543210',
            'password' => bcrypt('password123'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        $this->schoolB = School::create([
            'name' => 'St. Xavier International',
            'code' => 'STX-02',
            'slug' => 'stx-international',
            'status' => 'active',
            'webhook_key' => 'webhook_key_beta_9876543210fedcba',
        ]);

        $this->adminB = User::create([
            'school_id' => $this->schoolB->id,
            'name' => 'Admin Beta',
            'email' => 'admin_beta@stx.edu',
            'phone' => '9876543211',
            'password' => bcrypt('password123'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        $this->class10 = SchoolClass::create([
            'name' => 'Class 10',
            'code' => 'CLS-10',
        ]);
    }

    /**
     * 1. Test audience resolution and sibling deduplication.
     */
    public function test_audience_resolution_and_sibling_dedupe()
    {
        // Two students with identical guardian phone (siblings)
        $s1 = Student::create([
            'school_id' => $this->schoolA->id,
            'admission_number' => 'ADM-001',
            'school_class_id' => $this->class10->id,
            'first_name' => 'Aarav',
            'last_name' => 'Sharma',
            'guardian_name' => 'Rajesh Sharma',
            'guardian_phone' => '9876543210',
            'status' => 'Active',
        ]);

        $s2 = Student::create([
            'school_id' => $this->schoolA->id,
            'admission_number' => 'ADM-002',
            'school_class_id' => $this->class10->id,
            'first_name' => 'Ananya',
            'last_name' => 'Sharma',
            'guardian_name' => 'Rajesh Sharma',
            'guardian_phone' => '9876543210',
            'status' => 'Active',
        ]);

        $resolver = new AudienceResolver();

        // Broadcast with identical static message
        $resolvedStatic = $resolver->resolveRecipients($this->schoolA->id, [
            'channel' => 'sms',
            'message_category' => 'transactional',
            'audience_type' => 'class',
            'audience_filters' => ['school_class_ids' => [$this->class10->id]],
            'message_body' => 'School is closed tomorrow due to heavy rain.',
        ]);

        $this->assertCount(2, $resolvedStatic);
        $queued = array_filter($resolvedStatic, fn($r) => $r['status'] === 'queued');
        $skipped = array_filter($resolvedStatic, fn($r) => $r['status'] === 'skipped');

        // Exactly 1 message sent to the parent, 2nd deduplicated
        $this->assertCount(1, $queued);
        $this->assertCount(1, $skipped);
        $this->assertStringContainsString('duplicate contact', array_values($skipped)[0]['skip_reason']);

        // Personalized message (distinct bodies per student)
        $resolvedPersonalized = $resolver->resolveRecipients($this->schoolA->id, [
            'channel' => 'sms',
            'message_category' => 'transactional',
            'audience_type' => 'class',
            'audience_filters' => ['school_class_ids' => [$this->class10->id]],
            'message_body' => 'Report card for {student_name} is published.',
        ]);

        $queuedPersonalized = array_filter($resolvedPersonalized, fn($r) => $r['status'] === 'queued');
        // Because {student_name} makes message bodies distinct, both get sent!
        $this->assertCount(2, $queuedPersonalized);
    }

    /**
     * 2. Test opt-out and missing contact handling (strictly guardian_phone only).
     */
    public function test_opt_out_and_skipped_no_contact_handling()
    {
        // Student with no guardian phone (empty)
        $s1 = Student::create([
            'school_id' => $this->schoolA->id,
            'admission_number' => 'ADM-003',
            'first_name' => 'Kunal',
            'last_name' => 'Verma',
            'guardian_name' => 'Sanjay Verma',
            'guardian_phone' => '', // NO contact (empty string)
            'status' => 'Active',
        ]);

        // Student with opted-out guardian phone
        $s2 = Student::create([
            'school_id' => $this->schoolA->id,
            'admission_number' => 'ADM-004',
            'first_name' => 'Meera',
            'last_name' => 'Nair',
            'guardian_name' => 'Ramesh Nair',
            'guardian_phone' => '9123456780',
            'status' => 'Active',
        ]);

        CommunicationOptOut::create([
            'school_id' => $this->schoolA->id,
            'phone_or_email' => '+919123456780',
            'channel' => 'sms',
            'reason' => 'Requested DND',
        ]);

        $resolver = new AudienceResolver();

        // Promotional campaign: opt-out MUST apply
        $promoResolved = $resolver->resolveRecipients($this->schoolA->id, [
            'channel' => 'sms',
            'message_category' => 'promotional',
            'audience_type' => 'all',
            'message_body' => 'Admissions are now open for 2027.',
        ]);

        $noContact = array_filter($promoResolved, fn($r) => str_contains($r['skip_reason'] ?? '', 'no contact'));
        $optedOut = array_filter($promoResolved, fn($r) => str_contains($r['skip_reason'] ?? '', 'opted out'));

        $this->assertCount(1, $noContact);
        $this->assertCount(1, $optedOut);

        // Transactional campaign: opt-out is BYPASSED for security/school notices
        $transResolved = $resolver->resolveRecipients($this->schoolA->id, [
            'channel' => 'sms',
            'message_category' => 'transactional',
            'audience_type' => 'all',
            'message_body' => 'Important exam schedule update.',
        ]);

        $queuedTrans = array_filter($transResolved, fn($r) => $r['status'] === 'queued');
        // Meera Nair gets queued because it's transactional
        $this->assertCount(1, $queuedTrans);
    }

    /**
     * 3. Test idempotent retry: Batch jobs never double-send already-sent logs.
     */
    public function test_idempotent_retry_never_double_sends()
    {
        Http::fake([
            'https://api.sms-gateway.com/*' => Http::response(['message_id' => 'msg_abc_123', 'status' => 'ACCEPTED'], 200),
        ]);

        SchoolSetting::create([
            'school_id' => $this->schoolA->id,
            'group' => 'integrations',
            'key' => 'sms_endpoint_url',
            'value' => 'https://api.sms-gateway.com/send',
            'is_secret' => false,
        ]);
        SchoolSetting::create([
            'school_id' => $this->schoolA->id,
            'group' => 'integrations',
            'key' => 'sms_auth_token',
            'value' => Crypt::encryptString('secret_token_123'),
            'is_secret' => true,
        ]);

        $campaign = CommunicationCampaign::create([
            'school_id' => $this->schoolA->id,
            'title' => 'Test Idempotent Campaign',
            'channel' => 'sms',
            'message_category' => 'transactional',
            'message_body' => 'Hello parent',
            'audience_type' => 'all',
            'status' => 'processing',
        ]);

        $log1 = CommunicationLog::create([
            'school_id' => $this->schoolA->id,
            'campaign_id' => $campaign->id,
            'channel' => 'sms',
            'recipient_phone' => '+919876543210',
            'message_body' => 'Hello parent',
            'status' => 'queued',
        ]);

        // Run batch job first time
        $job = new SendCommunicationBatchJob($campaign->id, [$log1->id]);
        $job->handle(app(\App\Services\Communication\CommunicationManager::class));

        $log1->refresh();
        $this->assertEquals('sent', $log1->status);
        $this->assertEquals('msg_abc_123', $log1->provider_message_id);
        $this->assertEquals(1, Http::recorded()->count());

        // Run batch job second time (simulating queue worker retry)
        $job->handle(app(\App\Services\Communication\CommunicationManager::class));

        // Must still have recorded exactly 1 call! No duplicate HTTP dispatch!
        $this->assertEquals(1, Http::recorded()->count());
    }

    /**
     * 4. Test SSRF protection blocking.
     */
    public function test_ssrf_blocking_private_and_loopback_ips()
    {
        // 1. Localhost
        $this->expectException(InvalidArgumentException::class);
        SsrfProtection::validateUrl('https://localhost/api/send');
    }

    public function test_ssrf_blocking_private_ip()
    {
        // 2. RFC 1918 Private IP
        $this->expectException(InvalidArgumentException::class);
        SsrfProtection::validateUrl('https://192.168.1.50/send');
    }

    public function test_ssrf_blocking_http_scheme()
    {
        // 3. HTTP scheme rejected
        $this->expectException(InvalidArgumentException::class);
        SsrfProtection::validateUrl('http://api.sms-gateway.com/send');
    }

    public function test_ssrf_blocking_ipv6_loopback()
    {
        $this->expectException(InvalidArgumentException::class);
        SsrfProtection::assertPublicIp('::1');
    }

    public function test_ssrf_blocking_ipv6_unique_local_private()
    {
        $this->expectException(InvalidArgumentException::class);
        SsrfProtection::assertPublicIp('fc00::1');
    }

    public function test_ssrf_blocking_ipv6_link_local()
    {
        $this->expectException(InvalidArgumentException::class);
        SsrfProtection::assertPublicIp('fe80::1');
    }

    public function test_ssrf_blocking_ipv4_mapped_ipv6()
    {
        $this->expectException(InvalidArgumentException::class);
        SsrfProtection::assertPublicIp('::ffff:127.0.0.1');
    }

    public function test_ssrf_validate_and_pin_structure()
    {
        $info = SsrfProtection::validateAndPin('https://api.my-safe-host.com:8443/sms');
        $this->assertEquals('api.my-safe-host.com', $info['host']);
        $this->assertEquals(8443, $info['port']);
        $this->assertNotEmpty($info['pinned_ip']);
    }

    /**
     * 5. Test test mode: Only numbers listed are queued.
     */
    public function test_test_mode_queues_only_whitelisted_numbers()
    {
        Student::create([
            'school_id' => $this->schoolA->id,
            'admission_number' => 'ADM-005',
            'first_name' => 'Rahul',
            'guardian_name' => 'Amit',
            'guardian_phone' => '9876543210',
            'status' => 'Active',
        ]);

        Student::create([
            'school_id' => $this->schoolA->id,
            'admission_number' => 'ADM-006',
            'first_name' => 'Pooja',
            'guardian_name' => 'Sunil',
            'guardian_phone' => '9111111111',
            'status' => 'Active',
        ]);

        $resolver = new AudienceResolver();
        $resolved = $resolver->resolveRecipients($this->schoolA->id, [
            'channel' => 'sms',
            'message_category' => 'transactional',
            'audience_type' => 'all',
            'message_body' => 'Test message',
            'is_test_mode' => true,
            'test_recipients' => ['+919876543210'], // Only Rahul's parent
        ]);

        $queued = array_filter($resolved, fn($r) => $r['status'] === 'queued');
        $skipped = array_filter($resolved, fn($r) => $r['status'] === 'skipped');

        $this->assertCount(1, $queued);
        $this->assertEquals('+919876543210', array_values($queued)[0]['recipient_phone']);

        $this->assertCount(1, $skipped);
        $this->assertStringContainsString('test mode', array_values($skipped)[0]['skip_reason']);
    }

    /**
     * 6. Test daily cap enforcement.
     */
    public function test_daily_cap_enforcement_aborts_campaign_if_exceeded()
    {
        SchoolSetting::create([
            'school_id' => $this->schoolA->id,
            'group' => 'integrations',
            'key' => 'communication_daily_limit',
            'value' => '2', // Cap of 2 messages
            'is_secret' => false,
        ]);

        // Pre-create 2 sent logs for today
        CommunicationLog::create([
            'school_id' => $this->schoolA->id,
            'channel' => 'sms',
            'message_body' => 'Prior msg 1',
            'status' => 'sent',
            'created_at' => now(),
        ]);
        CommunicationLog::create([
            'school_id' => $this->schoolA->id,
            'channel' => 'sms',
            'message_body' => 'Prior msg 2',
            'status' => 'sent',
            'created_at' => now(),
        ]);

        Student::create([
            'school_id' => $this->schoolA->id,
            'admission_number' => 'ADM-007',
            'first_name' => 'Vijay',
            'guardian_name' => 'Rakesh',
            'guardian_phone' => '9876543210',
            'status' => 'Active',
        ]);

        $campaign = CommunicationCampaign::create([
            'school_id' => $this->schoolA->id,
            'title' => 'Excess Campaign',
            'channel' => 'sms',
            'message_body' => 'Hello',
            'audience_type' => 'all',
            'status' => 'draft',
        ]);

        // Dispatch campaign
        $job = new DispatchCommunicationCampaignJob($campaign->id);
        $job->handle(new AudienceResolver());

        $campaign->refresh();
        $this->assertEquals('failed', $campaign->status);

        $abortedLog = CommunicationLog::where('campaign_id', $campaign->id)->first();
        $this->assertNotNull($abortedLog);
        $this->assertEquals('failed', $abortedLog->status);
        $this->assertStringContainsString('daily communication limit', $abortedLog->error_message);
    }

    /**
     * 7. Test WhatsApp webhook HMAC signature verification & cross-school isolation.
     */
    public function test_whatsapp_webhook_signature_rejection_and_cross_school_isolation()
    {
        $appSecret = 'test_meta_app_secret_xyz';
        SchoolSetting::create([
            'school_id' => $this->schoolA->id,
            'group' => 'integrations',
            'key' => 'whatsapp_app_secret',
            'value' => Crypt::encryptString($appSecret),
            'is_secret' => true,
        ]);

        // Create a log in School A and School B with same provider ID
        $logA = CommunicationLog::create([
            'school_id' => $this->schoolA->id,
            'channel' => 'whatsapp',
            'provider_message_id' => 'wamid_target_999',
            'message_body' => 'Msg for school A',
            'status' => 'sent',
        ]);

        $logB = CommunicationLog::create([
            'school_id' => $this->schoolB->id,
            'channel' => 'whatsapp',
            'provider_message_id' => 'wamid_target_999',
            'message_body' => 'Msg for school B',
            'status' => 'sent',
        ]);

        $payload = json_encode([
            'entry' => [
                [
                    'changes' => [
                        [
                            'value' => [
                                'statuses' => [
                                    [
                                        'id' => 'wamid_target_999',
                                        'status' => 'delivered',
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ]);

        // Attempt with BAD signature on School A endpoint
        $badResponse = $this->call(
            'POST',
            "/api/v1/webhooks/whatsapp/{$this->schoolA->webhook_key}",
            [],
            [],
            [],
            [
                'HTTP_X_HUB_SIGNATURE_256' => 'sha256=invalidsignature123',
                'CONTENT_TYPE' => 'application/json',
            ],
            $payload
        );
        $badResponse->assertStatus(401);

        // Attempt with CORRECT signature for School A
        $validSignature = 'sha256=' . hash_hmac('sha256', $payload, $appSecret);
        $goodResponse = $this->call(
            'POST',
            "/api/v1/webhooks/whatsapp/{$this->schoolA->webhook_key}",
            [],
            [],
            [],
            [
                'HTTP_X_HUB_SIGNATURE_256' => $validSignature,
                'CONTENT_TYPE' => 'application/json',
            ],
            $payload
        );
        $goodResponse->assertStatus(200);

        $logA->refresh();
        $logB->refresh();

        // School A log MUST be delivered
        $this->assertEquals('delivered', $logA->status);
        $this->assertNotNull($logA->delivered_at);

        // Cross-school isolation: School B log MUST REMAIN 'sent' (isolated)!
        $this->assertEquals('sent', $logB->status);
    }

    /**
     * 8. Test webhook status monotonicity: delivered/read cannot revert to sent.
     */
    public function test_webhook_status_monotonicity()
    {
        $log = CommunicationLog::create([
            'school_id' => $this->schoolA->id,
            'channel' => 'whatsapp',
            'provider_message_id' => 'wamid_monotonic_123',
            'message_body' => 'Status test',
            'status' => 'delivered', // already delivered
            'delivered_at' => now(),
        ]);

        $payloadRevert = json_encode([
            'entry' => [
                [
                    'changes' => [
                        [
                            'value' => [
                                'statuses' => [
                                    [
                                        'id' => 'wamid_monotonic_123',
                                        'status' => 'sent', // out-of-order delayed 'sent' webhook
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ]);

        // Post without app secret (unrestricted signature mode)
        $response = $this->call(
            'POST',
            "/api/v1/webhooks/whatsapp/{$this->schoolA->webhook_key}",
            [],
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            $payloadRevert
        );
        $response->assertStatus(200);

        $log->refresh();
        // Status must NOT have reverted to sent!
        $this->assertEquals('delivered', $log->status);
    }

    /**
     * 9. Test in-app campaign: dual publishing to notifications & school_notices with strict tenant isolation.
     */
    public function test_in_app_campaign_creates_notification_per_user_and_scoped_school_notices()
    {
        // School A setup: 1 student user, 1 teacher user
        $userStudentA = User::create([
            'school_id' => $this->schoolA->id,
            'name' => 'Kavita Student',
            'email' => 'kavita@schoola.com',
            'password' => bcrypt('secret'),
            'role' => 'student_parent',
        ]);
        $studentA = Student::create([
            'school_id' => $this->schoolA->id,
            'user_id' => $userStudentA->id,
            'admission_number' => 'ADM-INAPP-01',
            'first_name' => 'Kavita',
            'guardian_name' => 'Suresh',
            'guardian_phone' => '9876500001',
            'status' => 'Active',
        ]);

        $userTeacherA = User::create([
            'school_id' => $this->schoolA->id,
            'name' => 'Sharma Sir',
            'email' => 'sharma@schoola.com',
            'password' => bcrypt('secret'),
            'role' => 'teacher',
        ]);
        Teacher::create([
            'school_id' => $this->schoolA->id,
            'user_id' => $userTeacherA->id,
            'teacher_id' => 'TCH-INAPP-01',
            'first_name' => 'Sharma',
            'last_name' => 'Sir',
            'email' => 'sharma@schoola.com',
            'phone' => '9876500002',
            'status' => 'Active',
        ]);

        // School B setup: 1 student user
        $userStudentB = User::create([
            'school_id' => $this->schoolB->id,
            'name' => 'Rohit Student',
            'email' => 'rohit@schoolb.com',
            'password' => bcrypt('secret'),
            'role' => 'student_parent',
        ]);
        $studentB = Student::create([
            'school_id' => $this->schoolB->id,
            'user_id' => $userStudentB->id,
            'admission_number' => 'ADM-INAPP-02',
            'first_name' => 'Rohit',
            'guardian_name' => 'Anil',
            'guardian_phone' => '9876500003',
            'status' => 'Active',
        ]);

        // Create in_app campaign for School A
        $campaign = CommunicationCampaign::create([
            'school_id' => $this->schoolA->id,
            'title' => 'Annual Sports Meet Circular',
            'subject' => 'Official Notice: Annual Sports Meet',
            'channel' => 'in_app',
            'message_category' => 'transactional',
            'message_body' => 'All students and staff must assemble in the sports ground on Monday at 8 AM.',
            'audience_type' => 'all',
            'status' => 'draft',
            'is_circular' => true,
        ]);

        // Dispatch campaign
        $job = new DispatchCommunicationCampaignJob($campaign->id);
        $job->handle(new AudienceResolver());

        // Process batch job
        $logs = CommunicationLog::where('campaign_id', $campaign->id)->pluck('id')->toArray();
        $batchJob = new SendCommunicationBatchJob($campaign->id, $logs);
        $batchJob->handle(app(CommunicationManager::class));

        // (a) Assert one notifications row per recipient user in School A
        $studentNotif = Notification::where('user_id', $userStudentA->id)->first();
        $this->assertNotNull($studentNotif);
        $this->assertEquals('Official Notice: Annual Sports Meet', $studentNotif->title);
        $this->assertFalse((bool) $studentNotif->is_read);

        // Assert School B user received ZERO notifications
        $schoolBNotifCount = Notification::where('user_id', $userStudentB->id)->count();
        $this->assertEquals(0, $schoolBNotifCount);

        // (b) & (c) Assert school_notices row was created and scoped strictly to School A
        $noticeA = SchoolNotice::where('school_id', $this->schoolA->id)->first();
        $this->assertNotNull($noticeA);
        $this->assertEquals('Official Notice: Annual Sports Meet', $noticeA->title);
        $this->assertEquals($this->schoolA->id, $noticeA->school_id);

        // (d) NoticeController response for School A user contains the circular
        Sanctum::actingAs($userStudentA);
        $resA = $this->withHeader('X-School-Id', (string)$this->schoolA->id)
            ->getJson('/api/v1/student/notices');
        $resA->assertStatus(200);
        $titlesA = collect($resA->json('data'))->pluck('title')->all();
        $this->assertContains('Official Notice: Annual Sports Meet', $titlesA);

        // (e) School B with no notices returns an empty list
        Sanctum::actingAs($userStudentB);
        $resB = $this->withHeader('X-School-Id', (string)$this->schoolB->id)
            ->getJson('/api/v1/student/notices');
        $resB->assertStatus(200);
        $this->assertIsArray($resB->json('data'));
        $this->assertEmpty($resB->json('data'));
    }

    /**
     * 10. Test regenerate-webhook-key: admin-only, cross-school forbidden, old key invalidated.
     */
    public function test_regenerate_webhook_key_permissions_and_invalidation()
    {
        $oldKey = $this->schoolA->webhook_key;

        // Teacher forbidden (403)
        $teacher = User::factory()->create(['school_id' => $this->schoolA->id, 'role' => 'teacher']);
        Sanctum::actingAs($teacher);
        $teacherRes = $this->postJson('/api/v1/admin/settings/regenerate-webhook-key');
        $teacherRes->assertStatus(403);

        // Admin of School A cannot rotate School B's key (403)
        Sanctum::actingAs($this->adminA);
        $crossSchoolRes = $this->withHeader('X-School-Id', (string)$this->schoolB->id)
            ->postJson('/api/v1/admin/settings/regenerate-webhook-key');
        $crossSchoolRes->assertStatus(403);

        // Admin of School A rotates their own school's key (200)
        $rotateRes = $this->withHeader('X-School-Id', (string)$this->schoolA->id)
            ->postJson('/api/v1/admin/settings/regenerate-webhook-key');
        $rotateRes->assertStatus(200);
        $newKey = $rotateRes->json('data.webhook_key');
        $this->assertNotEquals($oldKey, $newKey);
        $this->assertEquals($newKey, $this->schoolA->fresh()->webhook_key);

        // Old key immediately returns 404
        $oldWhatsapp = $this->postJson("/api/v1/webhooks/whatsapp/{$oldKey}");
        $oldWhatsapp->assertStatus(404);

        $oldSms = $this->postJson("/api/v1/webhooks/sms/{$oldKey}");
        $oldSms->assertStatus(404);

        // New key is valid (returns 200 on DLR callback)
        $newSms = $this->postJson("/api/v1/webhooks/sms/{$newKey}", [
            'message_id' => 'msg_dlr_valid_1',
            'status' => 'DELIVRD',
        ]);
        $newSms->assertStatus(200);
    }

    /**
     * 11. Test daily cap: partial send up to cap + emergency category exemption.
     */
    public function test_daily_cap_partial_send_and_emergency_exemption()
    {
        Http::fake([
            '*' => Http::response(['status' => 'success', 'message_id' => 'fake_msg_id_101'], 200),
        ]);

        SchoolSetting::create([
            'school_id' => $this->schoolA->id,
            'group' => 'integrations',
            'key' => 'communication_daily_limit',
            'value' => '3', // Cap of 3
            'is_secret' => false,
        ]);

        // Pre-create 2 sent logs for today (1 quota remaining)
        CommunicationLog::create([
            'school_id' => $this->schoolA->id,
            'channel' => 'sms',
            'message_body' => 'Prior msg 1',
            'status' => 'sent',
            'created_at' => now(),
        ]);
        CommunicationLog::create([
            'school_id' => $this->schoolA->id,
            'channel' => 'sms',
            'message_body' => 'Prior msg 2',
            'status' => 'sent',
            'created_at' => now(),
        ]);

        Student::create([
            'school_id' => $this->schoolA->id,
            'admission_number' => 'ADM-CAP-01',
            'first_name' => 'Deepak',
            'guardian_name' => 'Ravi',
            'guardian_phone' => '9876500010',
            'status' => 'Active',
        ]);
        Student::create([
            'school_id' => $this->schoolA->id,
            'admission_number' => 'ADM-CAP-02',
            'first_name' => 'Meena',
            'guardian_name' => 'Vikram',
            'guardian_phone' => '9876500011',
            'status' => 'Active',
        ]);

        // Part A: Campaign with allow_partial_cap = true sends 1 and skips 1
        $partialCampaign = CommunicationCampaign::create([
            'school_id' => $this->schoolA->id,
            'title' => 'Partial Send Campaign',
            'channel' => 'in_app',
            'message_category' => 'transactional',
            'message_body' => 'Notice to parents',
            'audience_type' => 'all',
            'status' => 'draft',
            'allow_partial_cap' => true,
        ]);

        $jobA = new DispatchCommunicationCampaignJob($partialCampaign->id);
        $jobA->handle(new AudienceResolver());

        $partialLogs = CommunicationLog::where('campaign_id', $partialCampaign->id)->get();
        $this->assertCount(2, $partialLogs);

        $allowedLogs = $partialLogs->whereIn('status', ['queued', 'delivered', 'sent']);
        $skippedLogs = $partialLogs->where('status', 'skipped');
        $this->assertCount(1, $allowedLogs); // 1 allowed under remaining quota
        $this->assertCount(1, $skippedLogs); // 1 skipped
        $this->assertEquals('Daily cap reached', $skippedLogs->first()->error_message);

        // Part B: Emergency category campaign bypasses the cap completely
        // Cap is 3 and sent today is now 3 (2 prior + 1 allowed above)
        $emergencyCampaign = CommunicationCampaign::create([
            'school_id' => $this->schoolA->id,
            'title' => 'Emergency Heavy Rain Alert',
            'channel' => 'in_app',
            'message_category' => 'emergency', // Emergency bypass
            'message_body' => 'School closed tomorrow due to heavy rain alert.',
            'audience_type' => 'all',
            'status' => 'draft',
        ]);

        $jobB = new DispatchCommunicationCampaignJob($emergencyCampaign->id);
        $jobB->handle(new AudienceResolver());

        $emergencyLogs = CommunicationLog::where('campaign_id', $emergencyCampaign->id)->get();
        $this->assertCount(2, $emergencyLogs);
        // Neither was aborted nor skipped due to cap! Both allowed/delivered
        $this->assertEquals(2, $emergencyLogs->whereIn('status', ['queued', 'delivered', 'sent'])->count());
    }

    /**
     * 12. Test template compiler: strictly {variable} placeholder syntax.
     */
    public function test_template_compiler_strictly_supports_single_braces()
    {
        $template = "Dear {guardian_name}, fee of ₹{fee_due} for {student_name} ({class}) is pending.";
        $compiled = TemplateCompiler::compile($template, [
            'guardian_name' => 'Rajesh Gupta',
            'student_name' => 'Aarav Gupta',
            'class' => 'Class 10-A',
            'fee_due' => '12,500',
        ]);

        $expected = "Dear Rajesh Gupta, fee of ₹12,500 for Aarav Gupta (Class 10-A) is pending.";
        $this->assertEquals($expected, $compiled);
    }
}
