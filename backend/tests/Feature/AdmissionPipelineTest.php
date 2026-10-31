<?php

namespace Tests\Feature;

use App\Models\Admission;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdmissionPipelineTest extends TestCase
{
    use DatabaseMigrations;

    protected $school;
    protected $adminUser;
    protected $schoolClass;

    protected function setUp(): void
    {
        parent::setUp();

        $this->school = School::create([
            'name' => 'Delhi Public Academy',
            'code' => 'DPS-101',
            'slug' => 'delhi-public-academy',
            'status' => 'active',
        ]);

        $this->adminUser = User::create([
            'name' => 'Admin User',
            'email' => 'admin_test@school.com',
            'phone' => '9998887770',
            'password' => bcrypt('password123'),
            'role' => 'admin',
            'school_id' => $this->school->id,
            'status' => 'active',
        ]);

        $this->schoolClass = SchoolClass::create([
            'school_id' => $this->school->id,
            'name' => 'Class 1',
        ]);
    }

    public function test_can_list_admissions_with_pipeline_stats(): void
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->withHeader('X-School-Id', (string)$this->school->id)
            ->getJson('/api/v1/admin/admissions');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
                'stats' => [
                    'total',
                    'inquiry',
                    'document_review',
                    'assessment_interview',
                    'offer_extended',
                    'fee_paid',
                    'enrolled',
                ],
            ]);
    }

    public function test_can_create_new_admission_inquiry(): void
    {
        Sanctum::actingAs($this->adminUser);

        $payload = [
            'first_name' => 'Vihaan',
            'last_name' => 'Malhotra',
            'date_of_birth' => '2019-05-15',
            'gender' => 'Male',
            'school_class_id' => $this->schoolClass->id,
            'academic_year' => '2026-2027',
            'lead_source' => 'Walk-in',
            'guardian_name' => 'Rohan Malhotra',
            'guardian_phone' => '9811223344',
            'guardian_email' => 'rohan.malhotra@example.com',
            'guardian_relation' => 'Father',
            'with_transport' => true,
            'remarks' => 'Inquiry for primary section admission.',
        ];

        $response = $this->withHeader('X-School-Id', (string)$this->school->id)
            ->postJson('/api/v1/admin/admissions', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'first_name' => 'Vihaan',
                    'status' => 'Inquiry',
                    'lead_source' => 'Walk-in',
                ],
            ]);

        $this->assertDatabaseHas('admissions', [
            'first_name' => 'Vihaan',
            'guardian_phone' => '9811223344',
            'status' => 'Inquiry',
        ]);
    }

    public function test_can_advance_through_stages_and_enroll(): void
    {
        Sanctum::actingAs($this->adminUser);

        // 1. Create applicant
        $admission = Admission::create([
            'school_id' => $this->school->id,
            'application_number' => 'ADM-TEST-9001',
            'first_name' => 'Kavya',
            'last_name' => 'Joshi',
            'school_class_id' => $this->schoolClass->id,
            'academic_year' => '2026-2027',
            'guardian_name' => 'Sunil Joshi',
            'guardian_phone' => '9899001122',
            'status' => 'Inquiry',
        ]);

        // 2. Advance to Document Review
        $docResp = $this->withHeader('X-School-Id', (string)$this->school->id)
            ->patchJson("/api/v1/admin/admissions/{$admission->id}/status", [
                'status' => 'Document Review',
                'documents' => [
                    'birth_certificate' => 'verified',
                    'previous_marksheet' => 'verified',
                    'address_proof' => 'verified',
                ],
                'remarks' => 'Documents verified by admission cell.',
            ]);

        $docResp->assertStatus(200);
        $this->assertEquals('Document Review', $admission->fresh()->status);

        // 3. Advance to Assessment & Interview
        $testResp = $this->withHeader('X-School-Id', (string)$this->school->id)
            ->patchJson("/api/v1/admin/admissions/{$admission->id}/status", [
                'status' => 'Assessment/Interview',
                'test_score' => '92/100',
                'test_status' => 'Cleared',
                'interview_result' => 'Recommended',
                'remarks' => 'Scored 92% in entrance aptitude test. Recommended for admission.',
            ]);

        $testResp->assertStatus(200);
        $this->assertEquals('Assessment/Interview', $admission->fresh()->status);
        $this->assertEquals('92/100', $admission->fresh()->test_score);

        // 4. Advance to Offer Extended and Fee Paid
        $feeResp = $this->withHeader('X-School-Id', (string)$this->school->id)
            ->patchJson("/api/v1/admin/admissions/{$admission->id}/status", [
                'status' => 'Fee Paid',
                'admission_fee' => 35000,
                'admission_fee_status' => 'Paid',
                'admission_fee_receipt' => 'REC-TEST-999',
                'admission_fee_mode' => 'UPI',
                'remarks' => 'Admission registration fee confirmed via UPI.',
            ]);

        $feeResp->assertStatus(200);
        $this->assertEquals('Fee Paid', $admission->fresh()->status);

        // 5. Final Enrollment
        $enrollResp = $this->withHeader('X-School-Id', (string)$this->school->id)
            ->postJson("/api/v1/admin/admissions/{$admission->id}/enroll", [
                'roll_number' => '108',
                'with_transport' => true,
            ]);

        $enrollResp->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'data' => ['admission', 'student'],
                'credentials' => [
                    'admission_number',
                    'student_name',
                    'login_mobile',
                    'temporary_password',
                ],
            ]);

        $fresh = $admission->fresh();
        $this->assertEquals('Enrolled', $fresh->status);
        $this->assertNotNull($fresh->enrolled_student_id);

        $student = Student::find($fresh->enrolled_student_id);
        $this->assertNotNull($student);
        $this->assertEquals('Kavya', $student->first_name);
        $this->assertEquals('108', $student->roll_number);
    }
}
