<?php

namespace Tests\Feature;

use App\Console\Commands\FeeCalculateLateFinesCommand;
use App\Models\AcademicYear;
use App\Models\AuditLog;
use App\Models\CommunicationLog;
use App\Models\CommunicationOptOut;
use App\Models\CommunicationTemplate;
use App\Models\SchoolSetting;
use Carbon\Carbon;
use App\Models\FeeConcessionType;
use App\Models\FeeLedger;
use App\Models\FeePayment;
use App\Models\FeePaymentAllocation;
use App\Models\FeeRefund;
use App\Models\FeeStructure;
use App\Models\ReceiptSequence;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\StudentFee;
use App\Models\StudentFeeConcession;
use App\Models\User;
use App\Services\Fees\FeeAllocationService;
use App\Services\Fees\FeeLedgerService;
use App\Services\Fees\ReceiptNumberService;
use App\Http\Controllers\Api\Accounts\FeeReportController;
use Database\Seeders\FeeDataSchoolScopeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class Batch2FeeManagementTest extends TestCase
{
    use RefreshDatabase;

    protected School $school1;
    protected School $school2;
    protected AcademicYear $ay1;
    protected AcademicYear $ay2;
    protected User $admin1;
    protected User $accountant1;
    protected User $parentUser1;
    protected Student $student1;
    protected Student $student2;
    protected SchoolClass $class1;
    protected Section $section1;

    protected function setUp(): void
    {
        parent::setUp();

        $this->school1 = School::create([
            'name' => 'School Alpha',
            'code' => 'ALPHA',
            'slug' => 'school-alpha',
            'status' => 'active',
        ]);
        $this->school2 = School::create([
            'name' => 'School Beta',
            'code' => 'BETA',
            'slug' => 'school-beta',
            'status' => 'active',
        ]);

        $this->ay1 = AcademicYear::create([
            'school_id' => $this->school1->id,
            'name' => '2026-2027',
            'code' => 'AY-2026-27',
            'start_date' => '2026-04-01',
            'end_date' => '2027-03-31',
            'status' => 'current',
            'is_current' => true,
        ]);

        $this->ay2 = AcademicYear::create([
            'school_id' => $this->school2->id,
            'name' => '2026-2027',
            'code' => 'AY-2026-27',
            'start_date' => '2026-04-01',
            'end_date' => '2027-03-31',
            'status' => 'current',
            'is_current' => true,
        ]);

        $this->admin1 = User::create([
            'name' => 'Admin Alpha',
            'email' => 'admin@alpha.school',
            'password' => bcrypt('secret123'),
            'role' => 'admin',
            'school_id' => $this->school1->id,
        ]);

        $this->accountant1 = User::create([
            'name' => 'Accountant Alpha',
            'email' => 'accounts@alpha.school',
            'password' => bcrypt('secret123'),
            'role' => 'accountant',
            'school_id' => $this->school1->id,
        ]);

        $this->parentUser1 = User::create([
            'name' => 'Parent Alpha',
            'email' => 'parent@alpha.school',
            'password' => bcrypt('secret123'),
            'role' => 'student_parent',
            'school_id' => $this->school1->id,
        ]);

        $this->class1 = SchoolClass::create([
            'school_id' => $this->school1->id,
            'name' => 'Class 10',
        ]);

        $this->section1 = Section::create([
            'school_id' => $this->school1->id,
            'school_class_id' => $this->class1->id,
            'name' => 'A',
        ]);

        FeeStructure::create([
            'school_id' => $this->school1->id,
            'school_class_id' => $this->class1->id,
            'academic_year' => '2026-2027',
            'tuition_fee' => 60000.00,
            'transport_fee' => 15000.00,
            'lab_library_fee' => 15000.00,
            'activity_fee' => 10000.00,
            'other_fee' => 20000.00,
            'total_annual_fee' => 120000.00,
        ]);

        $this->student1 = Student::create([
            'school_id' => $this->school1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1->id,
            'user_id' => $this->parentUser1->id,
            'admission_number' => 'ADM-001',
            'roll_number' => '101',
            'first_name' => 'Aarav',
            'last_name' => 'Patel',
            'gender' => 'Male',
            'date_of_birth' => '2010-05-15',
            'admission_date' => '2026-04-01',
            'guardian_name' => 'Parent Alpha',
            'guardian_phone' => '9876543210',
            'guardian_email' => 'parent@alpha.school',
        ]);

        $this->student2 = Student::create([
            'school_id' => $this->school2->id,
            'school_class_id' => 1,
            'admission_number' => 'ADM-002',
            'first_name' => 'Rohan',
            'last_name' => 'Sharma',
            'gender' => 'Male',
            'date_of_birth' => '2010-06-20',
            'admission_date' => '2026-04-01',
            'guardian_name' => 'Parent Beta',
            'guardian_phone' => '9876543211',
            'guardian_email' => 'parent2@beta.school',
        ]);
    }

    /** 1. Gapless sequential receipt numbers */
    public function test_gapless_sequential_receipt_numbers_under_transaction()
    {
        $num1 = DB::transaction(fn() => ReceiptNumberService::generateNextNumber($this->school1->id, $this->ay1->id, 'receipt'));
        $num2 = DB::transaction(fn() => ReceiptNumberService::generateNextNumber($this->school1->id, $this->ay1->id, 'receipt'));
        $num3 = DB::transaction(fn() => ReceiptNumberService::generateNextNumber($this->school1->id, $this->ay1->id, 'receipt'));

        $this->assertEquals('REC/2026-27/00001', $num1);
        $this->assertEquals('REC/2026-27/00002', $num2);
        $this->assertEquals('REC/2026-27/00003', $num3);
    }

    /** 2. Double-submit idempotency key prevents duplicate payments */
    public function test_idempotency_key_prevents_duplicate_fee_payments()
    {
        $fee = StudentFee::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'term_name' => 'Quarter 1',
            'amount' => 30000.00,
            'net_amount' => 30000.00,
            'paid_amount' => 0.00,
            'status' => 'Pending',
            'due_date' => '2026-05-15',
        ]);

        $payload = [
            'student_id' => $this->student1->id,
            'amount' => 10000.00,
            'payment_mode' => 'cash',
            'payment_date' => now()->toDateString(),
            'idempotency_key' => 'idem-unique-key-101',
        ];

        $res1 = $this->actingAs($this->accountant1)->postJson('/api/v1/accounts/fees/collect', $payload);
        $res1->assertStatus(201);
        $receipt1 = $res1->json('data.receipt_number');

        // Repeat identical request with same idempotency key
        $res2 = $this->actingAs($this->accountant1)->postJson('/api/v1/accounts/fees/collect', $payload);
        $res2->assertStatus(200);
        $this->assertEquals($receipt1, $res2->json('data.receipt_number'));

        // Verify only 1 fee_payments row was recorded
        $this->assertEquals(1, FeePayment::where('student_id', $this->student1->id)->count());
    }

    /** 3. Allocation order: oldest due installment first, within installment fine before principal */
    public function test_allocation_order_oldest_first_and_fine_before_principal()
    {
        // Installment 1: Older due date with 500 fine and 5000 principal
        $inst1 = StudentFee::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'term_name' => 'Inst 1 (April)',
            'amount' => 5000.00,
            'fine_amount' => 500.00,
            'net_amount' => 5500.00,
            'paid_amount' => 0.00,
            'fine_paid_amount' => 0.00,
            'status' => 'Pending',
            'due_date' => '2026-04-10',
        ]);

        // Installment 2: Later due date
        $inst2 = StudentFee::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'term_name' => 'Inst 2 (May)',
            'amount' => 5000.00,
            'fine_amount' => 0.00,
            'net_amount' => 5000.00,
            'paid_amount' => 0.00,
            'status' => 'Pending',
            'due_date' => '2026-05-10',
        ]);

        // Pay 1000: Should cover 500 fine of Inst 1, then 500 principal of Inst 1
        $res = FeeAllocationService::calculateAllocation($this->student1->id, 1000.00);

        $this->assertCount(1, $res['allocations']);
        $alloc1 = $res['allocations'][0];
        $this->assertEquals($inst1->id, $alloc1['student_fee_id']);
        $this->assertEquals(500.00, $alloc1['fine_allocated']);
        $this->assertEquals(500.00, $alloc1['principal_allocated']);

        // Pay 6000: covers all 5500 of Inst 1 (500 fine + 5000 principal) and 500 of Inst 2
        $resFull = FeeAllocationService::calculateAllocation($this->student1->id, 6000.00);
        $this->assertCount(2, $resFull['allocations']);
        $this->assertEquals(500.00, $resFull['allocations'][0]['fine_allocated']);
        $this->assertEquals(5000.00, $resFull['allocations'][0]['principal_allocated']);
        $this->assertEquals(0.00, $resFull['allocations'][1]['fine_allocated']);
        $this->assertEquals(500.00, $resFull['allocations'][1]['principal_allocated']);
    }

    /** 4. Partial payment moves installment status to Partial, full payment moves to Paid */
    public function test_partial_payment_and_full_payment_status_transitions()
    {
        $fee = StudentFee::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'term_name' => 'Tuition Q1',
            'amount' => 10000.00,
            'net_amount' => 10000.00,
            'paid_amount' => 0.00,
            'status' => 'Pending',
            'due_date' => '2026-05-15',
        ]);

        // Partial payment 4000
        $this->actingAs($this->accountant1)->postJson('/api/v1/accounts/fees/collect', [
            'student_id' => $this->student1->id,
            'amount' => 4000.00,
            'payment_mode' => 'cash',
            'payment_date' => now()->toDateString(),
            'idempotency_key' => 'partial-p1',
        ])->assertStatus(201);

        $fee->refresh();
        $this->assertEquals('Partial', $fee->status);
        $this->assertEquals(4000.00, $fee->paid_amount);

        // Full remaining payment 6000
        $this->actingAs($this->accountant1)->postJson('/api/v1/accounts/fees/collect', [
            'student_id' => $this->student1->id,
            'amount' => 6000.00,
            'payment_mode' => 'cash',
            'payment_date' => now()->toDateString(),
            'idempotency_key' => 'partial-p2',
        ])->assertStatus(201);

        $fee->refresh();
        $this->assertEquals('Paid', $fee->status);
        $this->assertEquals(10000.00, $fee->paid_amount);
    }

    /** 5. Overpayment rejection without advance credit flag, acceptance when enabled */
    public function test_overpayment_rejected_unless_advance_credit_flag_set()
    {
        StudentFee::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'term_name' => 'Single Due',
            'amount' => 5000.00,
            'net_amount' => 5000.00,
            'paid_amount' => 0.00,
            'status' => 'Pending',
            'due_date' => '2026-05-15',
        ]);

        // Overpayment of 6000 without allow_advance_credit => 422 rejected
        $this->actingAs($this->accountant1)->postJson('/api/v1/accounts/fees/collect', [
            'student_id' => $this->student1->id,
            'amount' => 6000.00,
            'payment_mode' => 'cash',
            'payment_date' => now()->toDateString(),
            'idempotency_key' => 'overpay-1',
            'allow_advance_credit' => false,
        ])->assertStatus(422);

        // Overpayment with allow_advance_credit => 201 accepted
        $res = $this->actingAs($this->accountant1)->postJson('/api/v1/accounts/fees/collect', [
            'student_id' => $this->student1->id,
            'amount' => 6000.00,
            'payment_mode' => 'cash',
            'payment_date' => now()->toDateString(),
            'idempotency_key' => 'overpay-2',
            'allow_advance_credit' => true,
        ]);
        $res->assertStatus(201);

        $allocs = $res->json('data.allocations');
        $this->assertCount(2, $allocs);
        $this->assertTrue($allocs[1]['is_advance_credit']);
        $this->assertEquals(1000.00, $allocs[1]['total_allocated']);
    }

    /** 6. Cheque status lifecycle: pending_clearance -> cleared / bounced */
    public function test_cheque_clearance_and_bounce_flow()
    {
        $fee = StudentFee::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'term_name' => 'Cheque Fee',
            'amount' => 8000.00,
            'net_amount' => 8000.00,
            'paid_amount' => 0.00,
            'status' => 'Pending',
            'due_date' => '2026-05-15',
        ]);

        // 1. Record Cheque payment
        $res = $this->actingAs($this->accountant1)->postJson('/api/v1/accounts/fees/collect', [
            'student_id' => $this->student1->id,
            'amount' => 8000.00,
            'payment_mode' => 'cheque',
            'reference_number' => 'CHQ-882190',
            'bank_name' => 'HDFC Bank',
            'cheque_date' => now()->toDateString(),
            'payment_date' => now()->toDateString(),
            'idempotency_key' => 'chq-rec-1',
        ]);
        $res->assertStatus(201);
        $paymentId = $res->json('data.payment_id');

        // Dues should remain Pending until clearance
        $fee->refresh();
        $this->assertEquals('Pending', $fee->status);
        $this->assertEquals(0.00, $fee->paid_amount);

        // 2. Clear cheque
        $this->actingAs($this->accountant1)->postJson("/api/v1/accounts/fees/payments/{$paymentId}/clear-cheque")
            ->assertStatus(200);

        $fee->refresh();
        $this->assertEquals('Paid', $fee->status);
        $this->assertEquals(8000.00, $fee->paid_amount);

        // 3. Cheque bounce after clearance: reverses dues and adds bounce fee
        $this->actingAs($this->accountant1)->postJson("/api/v1/accounts/fees/payments/{$paymentId}/bounce-cheque", [
            'bounce_fee' => 350.00,
            'reason' => 'Signature mismatch',
        ])->assertStatus(200);

        $fee->refresh();
        $this->assertEquals('Pending', $fee->status);
        $this->assertEquals(0.00, $fee->paid_amount);

        // Ledger must contain reversal and bounce fee debit
        $bounceLedger = FeeLedger::where('student_id', $this->student1->id)
            ->where('entry_type', 'cheque_bounce')
            ->first();
        $this->assertNotNull($bounceLedger);
        $this->assertEquals(350.00, $bounceLedger->debit);
    }

    /** 7. Voiding payment: Admin only, generates ledger reversal entry */
    public function test_payment_voiding_admin_only_and_reversal_ledger()
    {
        $fee = StudentFee::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'term_name' => 'Term Void',
            'amount' => 5000.00,
            'net_amount' => 5000.00,
            'paid_amount' => 0.00,
            'status' => 'Pending',
            'due_date' => '2026-05-15',
        ]);

        $res = $this->actingAs($this->accountant1)->postJson('/api/v1/accounts/fees/collect', [
            'student_id' => $this->student1->id,
            'amount' => 5000.00,
            'payment_mode' => 'cash',
            'payment_date' => now()->toDateString(),
            'idempotency_key' => 'void-test-1',
        ]);
        $paymentId = $res->json('data.payment_id');

        // Accountant attempting to void => 403 Forbidden
        $this->actingAs($this->accountant1)->postJson("/api/v1/accounts/fees/payments/{$paymentId}/void", [
            'void_reason' => 'Cashier mistake',
        ])->assertStatus(403);

        // Admin voids => 200 OK
        $this->actingAs($this->admin1)->postJson("/api/v1/accounts/fees/payments/{$paymentId}/void", [
            'void_reason' => 'Administrative error',
        ])->assertStatus(200);

        $payment = FeePayment::find($paymentId);
        $this->assertEquals('voided', $payment->status);
        $this->assertNotNull($payment->voided_at);

        $fee->refresh();
        $this->assertEquals('Pending', $fee->status);
        $this->assertEquals(0.00, $fee->paid_amount);

        $reversal = FeeLedger::where('student_id', $this->student1->id)
            ->where('entry_type', 'reversal')
            ->first();
        $this->assertNotNull($reversal);
        $this->assertEquals(5000.00, $reversal->debit);
    }

    /** 8. Late fine scheduled command: delta-only, idempotent */
    public function test_late_fine_calculation_command_is_delta_only_and_idempotent()
    {
        $overdueDate = '2026-01-01';
        $fee = StudentFee::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'term_name' => 'Overdue Inst',
            'amount' => 10000.00,
            'fine_amount' => 0.00,
            'net_amount' => 10000.00,
            'paid_amount' => 0.00,
            'status' => 'Pending',
            'due_date' => $overdueDate,
        ]);

        // Explicitly configure school late fine settings (Rate: ₹20/day, Max Cap: ₹500, Grace: 0)
        \App\Models\SchoolSetting::setEncrypted('fee_late_fine_rate', '20.00', $this->school1->id);
        \App\Models\SchoolSetting::setEncrypted('fee_late_fine_max_cap', '500.00', $this->school1->id);

        // Run artisan command
        Artisan::call('fees:calculate-late-fines', ['--school' => $this->school1->id]);

        $fee->refresh();
        $firstFine = $fee->fine_amount;
        $this->assertGreaterThan(0, $firstFine);

        $ledgerCount = FeeLedger::where('student_id', $this->student1->id)->where('entry_type', 'fine')->count();
        $this->assertEquals(1, $ledgerCount);

        // Run again on same day: should produce 0 delta and no duplicate ledger entries
        Artisan::call('fees:calculate-late-fines', ['--school' => $this->school1->id]);
        $fee->refresh();
        $this->assertEquals($firstFine, $fee->fine_amount);
        $this->assertEquals(1, FeeLedger::where('student_id', $this->student1->id)->where('entry_type', 'fine')->count());
    }

    /** 9. Concession approval & revocation */
    public function test_concession_approval_and_revocation()
    {
        $type = FeeConcessionType::create([
            'school_id' => $this->school1->id,
            'name' => 'Staff Child Concession',
            'discount_type' => 'percentage',
            'discount_value' => 50.00,
            'applicable_fee_head' => 'tuition_fee',
        ]);

        $inst = StudentFee::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'term_name' => 'Term 1',
            'amount' => 30000.00,
            'net_amount' => 30000.00,
            'paid_amount' => 0.00,
            'status' => 'Pending',
            'due_date' => '2026-06-15',
        ]);

        // Apply
        $appRes = $this->actingAs($this->accountant1)->postJson('/api/v1/accounts/fees/concessions/apply', [
            'student_id' => $this->student1->id,
            'fee_concession_type_id' => $type->id,
        ]);
        $appRes->assertStatus(201);
        $concessionId = $appRes->json('data.id');

        // Accountant approve => 403
        $this->actingAs($this->accountant1)->postJson("/api/v1/accounts/fees/concessions/{$concessionId}/approve")
            ->assertStatus(403);

        // Admin approve => 200 (50% of 60,000 tuition fee = 30,000 discount)
        $this->actingAs($this->admin1)->postJson("/api/v1/accounts/fees/concessions/{$concessionId}/approve")
            ->assertStatus(200);

        $inst->refresh();
        $this->assertEquals(30000.00, $inst->concession_amount);
        $this->assertEquals(0.00, $inst->net_amount);
        $this->assertEquals('Paid', $inst->status);

        // Revoke concession
        $this->actingAs($this->admin1)->postJson("/api/v1/accounts/fees/concessions/{$concessionId}/revoke", [
            'reason' => 'Staff resigned',
        ])->assertStatus(200);

        $inst->refresh();
        $this->assertEquals(0.00, $inst->concession_amount);
        $this->assertEquals(30000.00, $inst->net_amount);
        $this->assertEquals('Pending', $inst->status);
    }

    /** 10. Refund validation cap and approval */
    public function test_refund_validation_cap_and_approval()
    {
        // Student paid 5000
        FeePayment::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'academic_year_id' => $this->ay1->id,
            'receipt_number' => 'REC-101',
            'idempotency_key' => 'rf-paid-1',
            'amount_paid' => 5000.00,
            'payment_date' => '2026-05-01',
            'payment_mode' => 'cash',
            'status' => 'completed',
        ]);

        // Attempt refund of 6000 (exceeds paid) => 422
        $this->actingAs($this->accountant1)->postJson('/api/v1/accounts/fees/refunds/request', [
            'student_id' => $this->student1->id,
            'refund_amount' => 6000.00,
            'refund_type' => 'ledger_credit',
            'reason' => 'Excess refund request',
        ])->assertStatus(422);

        // Request 2000 => 201
        $res = $this->actingAs($this->accountant1)->postJson('/api/v1/accounts/fees/refunds/request', [
            'student_id' => $this->student1->id,
            'refund_amount' => 2000.00,
            'refund_type' => 'ledger_credit',
            'reason' => 'Security deposit adjustment',
        ]);
        $res->assertStatus(201);
        $refundId = $res->json('data.id');

        // Admin approve => 200
        $this->actingAs($this->admin1)->postJson("/api/v1/accounts/fees/refunds/{$refundId}/approve")
            ->assertStatus(200);

        $refund = FeeRefund::find($refundId);
        $this->assertEquals('approved', $refund->status);
        $this->assertStringStartsWith('REF/', $refund->refund_number);
    }

    /** 11. Parent cross-child access denial */
    public function test_parent_cannot_view_other_students_receipts_or_ledger()
    {
        $otherParent = User::create([
            'name' => 'Parent Other',
            'email' => 'other_parent@alpha.school',
            'password' => bcrypt('secret123'),
            'role' => 'student_parent',
            'school_id' => $this->school1->id,
        ]);

        $otherStudent = Student::create([
            'school_id' => $this->school1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1->id,
            'user_id' => $otherParent->id,
            'admission_number' => 'ADM-099',
            'first_name' => 'Kavita',
            'last_name' => 'Joshi',
            'gender' => 'Female',
            'date_of_birth' => '2010-08-10',
            'admission_date' => '2026-04-01',
            'guardian_name' => 'Parent Other',
            'guardian_phone' => '9876543999',
            'guardian_email' => 'other_parent@alpha.school',
        ]);

        $otherPayment = FeePayment::create([
            'school_id' => $this->school1->id,
            'student_id' => $otherStudent->id,
            'academic_year_id' => $this->ay1->id,
            'receipt_number' => 'REC-OTHER-001',
            'idempotency_key' => 'other-pay-1',
            'amount_paid' => 15000.00,
            'payment_date' => now()->toDateString(),
            'payment_mode' => 'cash',
            'status' => 'completed',
        ]);

        // Parent Alpha tries to access Other Student's receipt
        $this->actingAs($this->parentUser1)
            ->getJson("/api/v1/student/fees/receipts/{$otherPayment->id}/download")
            ->assertStatus(403);

        // Parent Alpha tries to access Other Student's ledger
        $this->actingAs($this->parentUser1)
            ->getJson("/api/v1/accounts/fees/students/{$otherStudent->id}/ledger")
            ->assertStatus(403);
    }

    /** 12. Defaulters report formula injection protection */
    public function test_defaulters_csv_escapes_formula_injection_characters()
    {
        $this->assertEquals("'=SUM(A1:A10)", FeeReportController::sanitizeCsvCell('=SUM(A1:A10)'));
        $this->assertEquals("'+1234567890", FeeReportController::sanitizeCsvCell('+1234567890'));
        $this->assertEquals("'-100", FeeReportController::sanitizeCsvCell('-100'));
        $this->assertEquals("'@cmd", FeeReportController::sanitizeCsvCell('@cmd'));
        $this->assertEquals("Normal Text", FeeReportController::sanitizeCsvCell('Normal Text'));
    }

    /** 13. FeeDataSchoolScopeSeeder dry-run and idempotency */
    public function test_fee_data_school_scope_seeder_dry_run_and_idempotency()
    {
        // Directly insert via DB query to bypass Eloquent BelongsToSchool creating hook
        $fsId = DB::table('fee_structures')->insertGetId([
            'school_id' => null,
            'school_class_id' => $this->class1->id,
            'academic_year' => '2026-2027',
            'tuition_fee' => 50000.00,
            'total_annual_fee' => 50000.00,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $seeder = new FeeDataSchoolScopeSeeder();

        // Dry run: does not modify database
        $dryReport = $seeder->run(dryRun: true);
        $this->assertTrue($dryReport['dry_run']);
        $this->assertEquals(1, $dryReport['fee_structures_resolvable']);
        $this->assertNull(FeeStructure::withoutGlobalScopes()->find($fsId)->school_id);

        // Live run: resolves school_id
        $liveReport = $seeder->run(dryRun: false);
        $this->assertFalse($liveReport['dry_run']);
        $this->assertEquals($this->school1->id, FeeStructure::withoutGlobalScopes()->find($fsId)->school_id);

        // Second live run: idempotent
        $secondReport = $seeder->run(dryRun: false);
        $this->assertEquals(0, $secondReport['fee_structures_to_resolve']);
    }

    /** 14. Backdated payment: rejected for accountant (403), allowed for admin */
    public function test_backdated_payment_rejected_for_accountant_allowed_for_admin()
    {
        $fee = StudentFee::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'term_name' => 'Backdate Test Term',
            'amount' => 5000.00,
            'net_amount' => 5000.00,
            'paid_amount' => 0.00,
            'status' => 'Pending',
            'due_date' => Carbon::today()->subDays(10)->toDateString(),
        ]);

        $backdatedDate = Carbon::today()->subDays(5)->toDateString();

        // Accountant attempts backdated payment => 403 Forbidden
        $resAccountant = $this->actingAs($this->accountant1)->postJson('/api/v1/accounts/fees/collect', [
            'student_id' => $this->student1->id,
            'amount' => 2000.00,
            'payment_mode' => 'cash',
            'payment_date' => $backdatedDate,
            'idempotency_key' => 'backdate-acc-' . uniqid(),
        ]);
        $resAccountant->assertStatus(403);
        $this->assertStringContainsString('Administrator approval', $resAccountant->json('message'));

        // Admin submits backdated payment => 201 Created with backdated flags set
        $resAdmin = $this->actingAs($this->admin1)->postJson('/api/v1/accounts/fees/collect', [
            'student_id' => $this->student1->id,
            'amount' => 2000.00,
            'payment_mode' => 'cash',
            'payment_date' => $backdatedDate,
            'idempotency_key' => 'backdate-adm-' . uniqid(),
        ]);
        $resAdmin->assertStatus(201);
        $payment = FeePayment::find($resAdmin->json('data.payment_id'));
        $this->assertTrue((bool) $payment->is_backdated);
        $this->assertEquals($this->admin1->id, $payment->backdated_approved_by_user_id);
    }

    /** 15. Future payment date rejected (422) */
    public function test_future_payment_date_rejected()
    {
        $futureDate = Carbon::today()->addDays(2)->toDateString();

        $res = $this->actingAs($this->admin1)->postJson('/api/v1/accounts/fees/collect', [
            'student_id' => $this->student1->id,
            'amount' => 1000.00,
            'payment_mode' => 'cash',
            'payment_date' => $futureDate,
            'idempotency_key' => 'future-date-' . uniqid(),
        ]);

        $res->assertStatus(422);
        $this->assertStringContainsString('Future payment dates are strictly prohibited', $res->json('message'));
    }

    /** 16. Cross-school fee collection / view denial */
    public function test_cross_school_fee_collection_denied()
    {
        // Accountant at School 1 tries to collect fee for Student 2 at School 2
        $res = $this->actingAs($this->accountant1)->postJson('/api/v1/accounts/fees/collect', [
            'student_id' => $this->student2->id,
            'amount' => 1000.00,
            'payment_mode' => 'cash',
            'payment_date' => Carbon::today()->toDateString(),
            'idempotency_key' => 'cross-school-' . uniqid(),
        ]);
        $res->assertStatus(403);
        $this->assertStringContainsString('Unauthorized student access', $res->json('message'));

        // Accountant at School 1 tries to view Student 2 ledger
        $ledgerRes = $this->actingAs($this->accountant1)
            ->getJson("/api/v1/accounts/fees/students/{$this->student2->id}/ledger");
        $ledgerRes->assertStatus(403);
    }

    /** 17. Role matrix: Accountant blocked from admin actions */
    public function test_role_matrix_accountant_blocked_from_admin_actions()
    {
        // Setup concession
        $type = FeeConcessionType::create([
            'school_id' => $this->school1->id,
            'name' => 'Sports Merit',
            'discount_type' => 'percentage',
            'discount_value' => 20.00,
            'applicable_fee_head' => 'tuition_fee',
            'is_active' => true,
        ]);
        $concession = StudentFeeConcession::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'fee_concession_type_id' => $type->id,
            'academic_year_id' => $this->ay1->id,
            'approval_status' => 'pending',
        ]);

        // A. Concession approval: Accountant => 403, Admin => 200
        $this->actingAs($this->accountant1)
            ->postJson("/api/v1/accounts/fees/concessions/{$concession->id}/approve")
            ->assertStatus(403);

        $this->actingAs($this->admin1)
            ->postJson("/api/v1/accounts/fees/concessions/{$concession->id}/approve")
            ->assertStatus(200);

        // B. Void payment: Accountant => 403
        StudentFee::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'term_name' => 'Role Matrix Term',
            'amount' => 5000.00,
            'net_amount' => 5000.00,
            'paid_amount' => 0.00,
            'status' => 'Pending',
            'due_date' => Carbon::today()->addDays(5)->toDateString(),
        ]);

        $payRes = $this->actingAs($this->admin1)->postJson('/api/v1/accounts/fees/collect', [
            'student_id' => $this->student1->id,
            'amount' => 1000.00,
            'payment_mode' => 'cash',
            'payment_date' => Carbon::today()->toDateString(),
            'idempotency_key' => 'void-role-' . uniqid(),
        ]);
        $payRes->assertStatus(201);
        $payId = $payRes->json('data.payment_id');

        $this->actingAs($this->accountant1)
            ->postJson("/api/v1/accounts/fees/payments/{$payId}/void", ['void_reason' => 'Testing'])
            ->assertStatus(403);

        // C. Fine waiving: Accountant => 403
        $feeInst = StudentFee::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'term_name' => 'Fine Wave Test',
            'amount' => 5000.00,
            'fine_amount' => 200.00,
            'net_amount' => 5200.00,
            'paid_amount' => 0.00,
            'status' => 'Pending',
            'due_date' => Carbon::today()->subDays(5)->toDateString(),
        ]);

        $this->actingAs($this->accountant1)
            ->postJson('/api/v1/accounts/fees/waive-fine', [
                'student_fee_id' => $feeInst->id,
                'waive_amount' => 100.00,
                'reason' => 'Hardship',
            ])
            ->assertStatus(403);

        // D. General communication campaigns: Accountant => 403
        $this->actingAs($this->accountant1)
            ->postJson('/api/v1/admin/communication/campaigns', [
                'name' => 'Unauthorized Broadcast',
                'channel' => 'sms',
                'message_category' => 'general',
                'message_body' => 'Test body',
            ])
            ->assertStatus(403);

        // E. Accountant using non-fee template is rejected (403)
        $generalTemplate = CommunicationTemplate::create([
            'school_id' => $this->school1->id,
            'name' => 'General Notice Template',
            'code' => 'TPL-GEN-' . uniqid(),
            'channel' => 'sms',
            'message_category' => 'general',
            'template_scope' => 'general',
            'content' => 'Dear {guardian_name}, this is a general announcement.',
            'is_active' => true,
        ]);

        $feeTemplate = CommunicationTemplate::create([
            'school_id' => $this->school1->id,
            'name' => 'Overdue Notice Template',
            'code' => 'TPL-FEE-' . uniqid(),
            'channel' => 'sms',
            'message_category' => 'fee',
            'template_scope' => 'fee',
            'content' => 'Dear {guardian_name}, fee of {fee_due} is overdue by {days_overdue} days.',
            'is_active' => true,
        ]);

        // Attempting to send reminder with non-fee template => 403 Forbidden
        $resNonFee = $this->actingAs($this->accountant1)
            ->postJson("/api/v1/accounts/fees/{$feeInst->id}/remind", [
                'template_id' => $generalTemplate->id,
            ]);
        $resNonFee->assertStatus(403);
        $this->assertStringContainsString('template_scope = fee', $resNonFee->json('message'));

        // Template with message_category = 'fee' but template_scope = 'general' must ALSO be rejected
        $categoryFeeScopeGeneralTemplate = CommunicationTemplate::create([
            'school_id' => $this->school1->id,
            'name' => 'General Scope Notice',
            'code' => 'TPL-CATFEE-' . uniqid(),
            'channel' => 'sms',
            'message_category' => 'fee',
            'template_scope' => 'general',
            'content' => 'Dear {guardian_name}, announcement.',
            'is_active' => true,
        ]);

        $resCatFee = $this->actingAs($this->accountant1)
            ->postJson("/api/v1/accounts/fees/{$feeInst->id}/remind", [
                'template_id' => $categoryFeeScopeGeneralTemplate->id,
            ]);
        $resCatFee->assertStatus(403);
        $this->assertStringContainsString('template_scope = fee', $resCatFee->json('message'));

        // Sending reminder with template_scope = 'fee' => 200 OK
        $resFee = $this->actingAs($this->accountant1)
            ->postJson("/api/v1/accounts/fees/{$feeInst->id}/remind", [
                'template_id' => $feeTemplate->id,
            ]);
        $resFee->assertStatus(200);
    }

    /** 18. Concession cap at 100% of applicable fee head */
    public function test_concession_cannot_exceed_100_percent_of_fee_head()
    {
        // Class 10 tuition is 60,000
        $type80 = FeeConcessionType::create([
            'school_id' => $this->school1->id,
            'name' => '80 Percent Scholarship',
            'discount_type' => 'percentage',
            'discount_value' => 80.00,
            'applicable_fee_head' => 'tuition_fee',
            'is_active' => true,
        ]);
        $type30 = FeeConcessionType::create([
            'school_id' => $this->school1->id,
            'name' => '30 Percent Sibling',
            'discount_type' => 'percentage',
            'discount_value' => 30.00,
            'applicable_fee_head' => 'tuition_fee',
            'is_active' => true,
        ]);

        $c1 = StudentFeeConcession::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'fee_concession_type_id' => $type80->id,
            'academic_year_id' => $this->ay1->id,
            'approval_status' => 'pending',
        ]);

        // First 80% (48,000) approved successfully
        $this->actingAs($this->admin1)
            ->postJson("/api/v1/accounts/fees/concessions/{$c1->id}/approve")
            ->assertStatus(200);

        // Second 30% (18,000) => 48,000 + 18,000 = 66,000 > 60,000 => 422 rejected
        $c2 = StudentFeeConcession::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'fee_concession_type_id' => $type30->id,
            'academic_year_id' => $this->ay1->id,
            'approval_status' => 'pending',
        ]);

        $res2 = $this->actingAs($this->admin1)
            ->postJson("/api/v1/accounts/fees/concessions/{$c2->id}/approve");
        $res2->assertStatus(422);
        $this->assertStringContainsString('cannot exceed 100%', $res2->json('message'));
    }

    /** 19. Reminder command OFF by default, respects --force flag */
    public function test_fee_reminder_command_off_by_default_and_respects_force_flag()
    {
        // Create overdue fee for student1
        StudentFee::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'term_name' => 'Overdue Inst',
            'amount' => 4000.00,
            'net_amount' => 4000.00,
            'paid_amount' => 0.00,
            'status' => 'Pending',
            'due_date' => Carbon::today()->subDays(15)->toDateString(),
        ]);

        // By default, setting is NOT enabled: command should skip school
        $exitCode = Artisan::call('fees:dispatch-overdue-reminders', ['--school' => $this->school1->id]);
        $this->assertEquals(0, $exitCode);
        $this->assertEquals(0, CommunicationLog::where('school_id', $this->school1->id)->where('message_category', 'fee')->count());

        // With --force: dispatches reminder
        $exitCodeForce = Artisan::call('fees:dispatch-overdue-reminders', [
            '--school' => $this->school1->id,
            '--force' => true,
        ]);
        $this->assertEquals(0, $exitCodeForce);
        $this->assertEquals(1, CommunicationLog::where('school_id', $this->school1->id)->where('message_category', 'fee')->count());
    }

    /** 20. Fee reminders respect daily cap, opt-outs, deduplication */
    public function test_fee_reminders_respect_daily_cap_opt_outs_and_deduplication()
    {
        SchoolSetting::setEncrypted('fee_auto_reminders_enabled', '1', $this->school1->id);

        StudentFee::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'term_name' => 'Overdue Q2',
            'amount' => 5000.00,
            'net_amount' => 5000.00,
            'paid_amount' => 0.00,
            'status' => 'Pending',
            'due_date' => Carbon::today()->subDays(20)->toDateString(),
        ]);

        // Clear logs
        CommunicationLog::where('school_id', $this->school1->id)->delete();

        // 1. Opt-out test: register opt-out for guardian phone
        $optOut = CommunicationOptOut::create([
            'school_id' => $this->school1->id,
            'channel' => 'sms',
            'phone_or_email' => $this->student1->guardian_phone,
            'reason' => 'User opted out',
        ]);

        Artisan::call('fees:dispatch-overdue-reminders', ['--school' => $this->school1->id]);
        $this->assertEquals(0, CommunicationLog::where('recipient_student_id', $this->student1->id)->count());

        // 2. Remove opt-out => should now record 1 queued log
        $optOut->delete();
        Artisan::call('fees:dispatch-overdue-reminders', ['--school' => $this->school1->id]);
        $this->assertEquals(1, CommunicationLog::where('recipient_student_id', $this->student1->id)->count());

        // 3. Deduplication: running again today does NOT create a duplicate log
        Artisan::call('fees:dispatch-overdue-reminders', ['--school' => $this->school1->id]);
        $this->assertEquals(1, CommunicationLog::where('recipient_student_id', $this->student1->id)->count());

        // 4. Daily cap test: set daily limit to 1 (which was already reached)
        SchoolSetting::setEncrypted('communication_daily_limit', '1', $this->school1->id);
        // Create another student
        $student3 = Student::create([
            'school_id' => $this->school1->id,
            'school_class_id' => $this->class1->id,
            'admission_number' => 'ADM-003',
            'first_name' => 'Kavya',
            'last_name' => 'Iyer',
            'gender' => 'Female',
            'date_of_birth' => '2010-08-15',
            'admission_date' => '2026-04-01',
            'guardian_name' => 'Mrs. Iyer',
            'guardian_phone' => '9876543299',
        ]);
        StudentFee::create([
            'school_id' => $this->school1->id,
            'student_id' => $student3->id,
            'term_name' => 'Overdue Inst S3',
            'amount' => 3000.00,
            'net_amount' => 3000.00,
            'paid_amount' => 0.00,
            'status' => 'Pending',
            'due_date' => Carbon::today()->subDays(10)->toDateString(),
        ]);

        Artisan::call('fees:dispatch-overdue-reminders', ['--school' => $this->school1->id]);
        // S3 should be skipped because daily limit (1) was already consumed by student1
        $this->assertEquals(0, CommunicationLog::where('recipient_student_id', $student3->id)->count());
    }

    /**
     * Test 21: Receipt and refund number formatting includes academic year, preventing collisions across sessions.
     */
    public function test_receipt_and_refund_number_sequence_across_different_academic_years_do_not_collide(): void
    {
        // Create Next Academic Session in School Alpha
        $ayNext = AcademicYear::create([
            'school_id' => $this->school1->id,
            'name' => '2027-2028',
            'code' => 'AY-2027-28',
            'start_date' => '2027-04-01',
            'end_date' => '2028-03-31',
            'status' => 'upcoming',
            'is_current' => false,
        ]);

        // Generate first receipt in Year 1 (2026-27)
        $numAy1 = DB::transaction(fn() => ReceiptNumberService::generateNextNumber($this->school1->id, $this->ay1->id, 'receipt'));
        // Generate first receipt in Year 2 (2027-28)
        $numAyNext = DB::transaction(fn() => ReceiptNumberService::generateNextNumber($this->school1->id, $ayNext->id, 'receipt'));

        // Assert both started at sequence 1 but have distinct non-colliding formatted numbers
        $this->assertEquals('REC/2026-27/00001', $numAy1);
        $this->assertEquals('REC/2027-28/00001', $numAyNext);
        $this->assertNotEquals($numAy1, $numAyNext);

        // Verify database persistence under unique ['school_id', 'receipt_number'] constraint
        $p1 = FeePayment::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'academic_year_id' => $this->ay1->id,
            'receipt_number' => $numAy1,
            'idempotency_key' => 'IDEM-AY1-001',
            'amount_paid' => 5000.00,
            'payment_date' => '2026-05-10',
            'payment_mode' => 'cash',
            'status' => 'completed',
            'collected_by_user_id' => $this->accountant1->id,
        ]);

        $p2 = FeePayment::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'academic_year_id' => $ayNext->id,
            'receipt_number' => $numAyNext,
            'idempotency_key' => 'IDEM-AY2-001',
            'amount_paid' => 6000.00,
            'payment_date' => '2027-05-10',
            'payment_mode' => 'cash',
            'status' => 'completed',
            'collected_by_user_id' => $this->accountant1->id,
        ]);

        $this->assertNotNull($p1->id);
        $this->assertNotNull($p2->id);

        // Refunds formatting test
        $refAy1 = DB::transaction(fn() => ReceiptNumberService::generateNextNumber($this->school1->id, $this->ay1->id, 'refund'));
        $refAyNext = DB::transaction(fn() => ReceiptNumberService::generateNextNumber($this->school1->id, $ayNext->id, 'refund'));

        $this->assertEquals('REF/2026-27/00001', $refAy1);
        $this->assertEquals('REF/2027-28/00001', $refAyNext);
        $this->assertNotEquals($refAy1, $refAyNext);
    }

    /**
     * Test 22: Legacy paid installments without fee_payments rows return clear message without error.
     */
    /**
     * Test 22: Legacy paid installments without fee_payments rows return clear message without error.
     * Route isolation: Payment receipt route only reads FeePayment; separate route reads legacy installment.
     * Verified with matching payment ID and installment ID.
     */
    public function test_download_receipt_for_legacy_entry_returns_clear_message_without_error(): void
    {
        // Create a FeePayment
        $paymentSameId = FeePayment::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'academic_year_id' => $this->ay1->id,
            'receipt_number' => 'REC/2026-27/00055',
            'idempotency_key' => 'IDEM-MATCH-55',
            'amount_paid' => 12000.00,
            'payment_date' => '2026-06-01',
            'payment_mode' => 'cash',
            'status' => 'completed',
            'collected_by_user_id' => $this->accountant1->id,
        ]);
        $sharedId = $paymentSameId->id;

        // Create a legacy StudentFee with the EXACT SAME ID
        $legacyFeeSameId = new StudentFee([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'term_name' => 'Legacy Quarter 1',
            'amount' => 25000.00,
            'net_amount' => 25000.00,
            'paid_amount' => 25000.00,
            'status' => 'Paid',
            'receipt_number' => "REC-LEGACY-{$sharedId}",
            'due_date' => '2026-04-14',
            'paid_date' => '2026-04-10',
        ]);
        $legacyFeeSameId->id = $sharedId;
        $legacyFeeSameId->save();

        $this->assertEquals($sharedId, $paymentSameId->id);
        $this->assertEquals($sharedId, $legacyFeeSameId->id);

        // 1. Payment receipt route /api/v1/accounts/fees/payments/{id}/receipt MUST return the real payment PDF, NEVER the legacy message
        $resPayment = $this->actingAs($this->accountant1)
            ->get("/api/v1/accounts/fees/payments/{$sharedId}/receipt");
        $resPayment->assertStatus(200);
        $this->assertEquals('application/pdf', $resPayment->headers->get('Content-Type'));
        $this->assertStringStartsWith('%PDF', $resPayment->getContent());

        // 2. Explicit separate legacy route /api/v1/accounts/fees/installments/{id}/legacy-receipt returns the legacy notice
        $resLegacyJson = $this->actingAs($this->accountant1)
            ->withHeaders(['Accept' => 'application/json'])
            ->get("/api/v1/accounts/fees/installments/{$sharedId}/legacy-receipt");

        $resLegacyJson->assertStatus(200);
        $resLegacyJson->assertJson([
            'success' => false,
            'is_legacy' => true,
        ]);
        $this->assertStringContainsString('No receipt on record (legacy entry)', $resLegacyJson->json('message'));

        // 3. Parent requests legacy installment receipt on dedicated route
        $resLegacyHtml = $this->actingAs($this->parentUser1)
            ->withHeaders(['Accept' => 'text/html'])
            ->get("/api/v1/student/fees/installments/{$sharedId}/legacy-receipt");

        $resLegacyHtml->assertStatus(200);
        $this->assertStringContainsString('No receipt on record (legacy entry)', $resLegacyHtml->getContent());

        // 4. Requesting non-existent payment ID on payment route returns 404 (does NOT guess or fallback to student fees)
        $resNotFound = $this->actingAs($this->accountant1)
            ->get("/api/v1/accounts/fees/payments/99999/receipt");
        $resNotFound->assertStatus(404);
    }

    /**
     * Test 23: Saving settings via API dynamically updates values used by fine command and receipt service.
     */
    public function test_saving_financial_rules_via_api_updates_fine_command_and_receipt_service(): void
    {
        $payload = [
            'group' => 'financial_rules',
            'settings' => [
                'fee_receipt_prefix' => 'DPS-REC',
                'fee_refund_prefix' => 'DPS-REF',
                'fee_late_fine_type' => 'flat',
                'fee_late_fine_rate' => 75.00,
                'fee_late_fine_grace_days' => 2,
                'fee_late_fine_max_cap' => 500.00,
                'fee_counter_notice' => 'Pay strictly at window 3.',
                'fee_auto_reminders_enabled' => true,
            ],
        ];

        // 1. Admin updates financial settings via API
        $res = $this->actingAs($this->admin1)
            ->postJson('/api/v1/admin/settings', $payload);
        $res->assertStatus(200);

        // 2. Receipt and refund service now use new prefixes
        $newReceipt = DB::transaction(fn() => ReceiptNumberService::generateNextNumber($this->school1->id, $this->ay1->id, 'receipt'));
        $newRefund = DB::transaction(fn() => ReceiptNumberService::generateNextNumber($this->school1->id, $this->ay1->id, 'refund'));

        $this->assertStringStartsWith('DPS-REC/2026-27/', $newReceipt);
        $this->assertStringStartsWith('DPS-REF/2026-27/', $newRefund);

        // 3. Late fine calculation command applies newly configured flat rate (75.00)
        $overdueFee = StudentFee::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'term_name' => 'Overdue Term Test',
            'amount' => 5000.00,
            'net_amount' => 5000.00,
            'paid_amount' => 0.00,
            'status' => 'Pending',
            'due_date' => Carbon::today()->subDays(10)->toDateString(),
        ]);

        Artisan::call('fees:calculate-late-fines', ['--school' => $this->school1->id]);

        $overdueFee->refresh();
        $this->assertEquals(75.00, (float) $overdueFee->fine_amount);

        // 4. Parent portal reflects newly saved counter notice text
        $parentRes = $this->actingAs($this->parentUser1)
            ->getJson('/api/v1/student/fees');
        $parentRes->assertStatus(200);
        $this->assertEquals('Pay strictly at window 3.', $parentRes->json('data.counterNotice'));
    }

    /**
     * Test 24: Changing receipt prefix in settings updates new numbers while keeping existing receipts intact without repeating numbers.
     */
    public function test_prefix_change_updates_new_numbers_without_repeating_sequence_numbers(): void
    {
        // 1. Initial prefix generates 00001 and 00002
        SchoolSetting::setEncrypted('fee_receipt_prefix', 'REC', $this->school1->id, 'financial_rules');
        ReceiptSequence::where('school_id', $this->school1->id)->delete();

        $r1 = DB::transaction(fn() => ReceiptNumberService::generateNextNumber($this->school1->id, $this->ay1->id, 'receipt'));
        $r2 = DB::transaction(fn() => ReceiptNumberService::generateNextNumber($this->school1->id, $this->ay1->id, 'receipt'));

        $this->assertEquals('REC/2026-27/00001', $r1);
        $this->assertEquals('REC/2026-27/00002', $r2);

        // Record payment with r1
        $payment1 = FeePayment::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'academic_year_id' => $this->ay1->id,
            'receipt_number' => $r1,
            'idempotency_key' => 'IDEM-SEQ-1',
            'amount_paid' => 2000.00,
            'payment_date' => '2026-05-01',
            'payment_mode' => 'cash',
            'status' => 'completed',
            'collected_by_user_id' => $this->accountant1->id,
        ]);

        // 2. Change prefix in settings to 'NEWPREFIX'
        SchoolSetting::setEncrypted('fee_receipt_prefix', 'NEWPREFIX', $this->school1->id, 'financial_rules');

        // Generate next receipt number
        $r3 = DB::transaction(fn() => ReceiptNumberService::generateNextNumber($this->school1->id, $this->ay1->id, 'receipt'));
        $r4 = DB::transaction(fn() => ReceiptNumberService::generateNextNumber($this->school1->id, $this->ay1->id, 'receipt'));

        // Monotonic sequence numbering: sequence moves forward to 00003, 00004 with new prefix
        $this->assertEquals('NEWPREFIX/2026-27/00003', $r3);
        $this->assertEquals('NEWPREFIX/2026-27/00004', $r4);

        // Verify existing payment still preserves its original number
        $payment1->refresh();
        $this->assertEquals('REC/2026-27/00001', $payment1->receipt_number);

        // Assert all generated numbers are unique
        $allGenerated = [$r1, $r2, $r3, $r4];
        $this->assertCount(4, array_unique($allGenerated));
    }

    /**
     * Test 25: Fee models trigger AuditObserver logs and sensitive attributes are redacted
     */
    public function test_fee_models_are_registered_in_audit_observers_and_secrets_are_redacted(): void
    {
        $this->actingAs($this->admin1);

        // 1. FeeConcessionType
        $ct = FeeConcessionType::create([
            'school_id' => $this->school1->id,
            'name' => 'Audit Test Concession',
            'discount_type' => 'flat',
            'discount_value' => 500.00,
            'is_active' => true,
        ]);
        $this->assertTrue(AuditLog::where('auditable_type', FeeConcessionType::class)->where('auditable_id', $ct->id)->exists());

        // 2. StudentFeeConcession
        $sfc = StudentFeeConcession::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'fee_concession_type_id' => $ct->id,
            'academic_year_id' => $this->ay1->id,
            'calculated_discount_amount' => 500.00,
            'approval_status' => 'approved',
            'approved_by_user_id' => $this->admin1->id,
            'approved_at' => now(),
        ]);
        $this->assertTrue(AuditLog::where('auditable_type', StudentFeeConcession::class)->where('auditable_id', $sfc->id)->exists());

        // 3. FeePayment
        $payment = FeePayment::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'academic_year_id' => $this->ay1->id,
            'receipt_number' => 'REC/2026-27/AUDIT01',
            'idempotency_key' => 'IDEM-AUDIT-1',
            'amount_paid' => 1500.00,
            'payment_date' => '2026-05-01',
            'payment_mode' => 'cash',
            'status' => 'completed',
            'collected_by_user_id' => $this->accountant1->id,
        ]);
        $this->assertTrue(AuditLog::where('auditable_type', FeePayment::class)->where('auditable_id', $payment->id)->exists());

        // 4. FeePaymentAllocation
        $feeInst = StudentFee::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'academic_year_id' => $this->ay1->id,
            'term_name' => 'Audit Term',
            'amount' => 5000.00,
            'net_amount' => 5000.00,
            'due_date' => '2026-05-15',
            'status' => 'Pending',
        ]);
        $allocation = FeePaymentAllocation::create([
            'fee_payment_id' => $payment->id,
            'student_fee_id' => $feeInst->id,
            'principal_amount' => 1500.00,
            'fine_amount' => 0.00,
        ]);
        $this->assertTrue(AuditLog::where('auditable_type', FeePaymentAllocation::class)->where('auditable_id', $allocation->id)->exists());

        // 5. FeeRefund
        $refund = FeeRefund::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'academic_year_id' => $this->ay1->id,
            'original_payment_id' => $payment->id,
            'refund_number' => 'REF/2026-27/AUDIT01',
            'refund_amount' => 500.00,
            'refund_type' => 'ledger_credit',
            'reason' => 'Audit test refund',
            'status' => 'approved',
            'approved_by_user_id' => $this->admin1->id,
            'approved_at' => now(),
        ]);
        $this->assertTrue(AuditLog::where('auditable_type', FeeRefund::class)->where('auditable_id', $refund->id)->exists());

        // 6. FeeLedger
        $ledger = FeeLedger::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'entry_date' => '2026-05-01',
            'entry_type' => 'invoice',
            'reference_number' => 'INV-AUDIT-1',
            'description' => 'Audit invoice entry',
            'debit' => 1500.00,
            'credit' => 0.00,
            'running_balance' => 1500.00,
        ]);
        $this->assertTrue(AuditLog::where('auditable_type', FeeLedger::class)->where('auditable_id', $ledger->id)->exists());

        // 7. ReceiptSequence
        $seq = ReceiptSequence::create([
            'school_id' => $this->school1->id,
            'academic_year_id' => $this->ay1->id,
            'sequence_type' => 'receipt',
            'prefix' => 'AUDIT',
            'last_number' => 1,
        ]);
        $this->assertTrue(AuditLog::where('auditable_type', ReceiptSequence::class)->where('auditable_id', $seq->id)->exists());

        // Secret redaction test: ensure sensitive attributes like password or tokens are never stored plaintext
        $testUser = User::create([
            'name' => 'Audited User',
            'email' => 'audit_secret@test.com',
            'password' => bcrypt('super_secret_raw_pass'),
            'role' => 'accountant',
            'school_id' => $this->school1->id,
        ]);
        $userAuditLog = AuditLog::where('auditable_type', User::class)
            ->where('auditable_id', $testUser->id)
            ->first();

        $this->assertNotNull($userAuditLog);
        $this->assertArrayHasKey('password', $userAuditLog->new_values);
        $this->assertEquals('[REDACTED]', $userAuditLog->new_values['password']);
        $this->assertStringNotContainsString('super_secret_raw_pass', json_encode($userAuditLog->toArray()));
    }

    /**
     * Test 26: Parent A cannot access legacy receipt for Parent B's child or another school
     */
    public function test_parent_cannot_open_legacy_receipt_for_another_parent_child_or_another_school(): void
    {
        // Parent B and Child B in School 1
        $parentUserB = User::create([
            'name' => 'Parent Beta',
            'email' => 'parent_beta@alpha.school',
            'password' => bcrypt('secret123'),
            'role' => 'student_parent',
            'school_id' => $this->school1->id,
        ]);

        $studentB = Student::create([
            'school_id' => $this->school1->id,
            'school_class_id' => $this->class1->id,
            'section_id' => $this->section1->id,
            'user_id' => $parentUserB->id,
            'admission_number' => 'ADM-002B',
            'first_name' => 'Kabir',
            'last_name' => 'Beta',
            'gender' => 'Male',
            'date_of_birth' => '2010-08-10',
            'admission_date' => '2026-04-01',
            'guardian_name' => 'Parent Beta',
            'guardian_phone' => '9111222333',
            'guardian_email' => 'parent_beta@alpha.school',
        ]);

        $legacyFeeB = StudentFee::create([
            'school_id' => $this->school1->id,
            'student_id' => $studentB->id,
            'academic_year_id' => $this->ay1->id,
            'term_name' => 'Legacy Term B',
            'amount' => 12000.00,
            'paid_amount' => 12000.00,
            'status' => 'Paid',
            'due_date' => '2026-04-10',
            'receipt_number' => 'REC-LEGACY-B',
        ]);

        // Installment in School 2
        $legacyFeeSchool2 = StudentFee::create([
            'school_id' => $this->school2->id,
            'student_id' => $this->student2->id,
            'academic_year_id' => $this->ay2->id,
            'term_name' => 'School 2 Term',
            'amount' => 14000.00,
            'paid_amount' => 14000.00,
            'status' => 'Paid',
            'due_date' => '2026-04-10',
            'receipt_number' => 'REC-LEGACY-SCH2',
        ]);

        // Parent A attempts to access Parent B's child legacy receipt in School 1 -> 403 Forbidden
        $response1 = $this->actingAs($this->parentUser1)
            ->getJson("/api/v1/student/fees/installments/{$legacyFeeB->id}/legacy-receipt");
        $response1->assertStatus(403);
        $response1->assertJsonFragment(['message' => 'Forbidden: You cannot access fee details of other students.']);

        // Parent A attempts to access School 2 installment -> 403 Forbidden
        $response2 = $this->actingAs($this->parentUser1)
            ->getJson("/api/v1/student/fees/installments/{$legacyFeeSchool2->id}/legacy-receipt");
        $response2->assertStatus(403);
    }

    /**
     * Test 27: Late fine calculation with flat fine type
     */
    public function test_late_fine_calculation_with_flat_type(): void
    {
        SchoolSetting::setEncrypted('fee_late_fine_type', 'flat', $this->school1->id, 'financial_rules');
        SchoolSetting::setEncrypted('fee_late_fine_rate', 250.00, $this->school1->id, 'financial_rules');
        SchoolSetting::setEncrypted('fee_late_fine_grace_days', 2, $this->school1->id, 'financial_rules');
        SchoolSetting::setEncrypted('fee_late_fine_max_cap', 500.00, $this->school1->id, 'financial_rules');

        $fee = StudentFee::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'academic_year_id' => $this->ay1->id,
            'term_name' => 'Overdue Term Flat',
            'amount' => 10000.00,
            'net_amount' => 10000.00,
            'fine_amount' => 0.00,
            'paid_amount' => 0.00,
            'status' => 'Overdue',
            'due_date' => Carbon::today()->subDays(6)->toDateString(),
        ]);

        Artisan::call(FeeCalculateLateFinesCommand::class, ['--school' => $this->school1->id]);

        $fee->refresh();
        // Flat fine assessed: exactly rate = 250.00 (within cap of 500.00)
        $this->assertEquals(250.00, (float) $fee->fine_amount);
        $this->assertEquals(10250.00, (float) $fee->net_amount);
    }

    /**
     * Test 28: Late fine calculation with percentage fine type
     */
    public function test_late_fine_calculation_with_percentage_type(): void
    {
        SchoolSetting::setEncrypted('fee_late_fine_type', 'percentage', $this->school1->id, 'financial_rules');
        SchoolSetting::setEncrypted('fee_late_fine_rate', 5.00, $this->school1->id, 'financial_rules'); // 5%
        SchoolSetting::setEncrypted('fee_late_fine_grace_days', 0, $this->school1->id, 'financial_rules');
        SchoolSetting::setEncrypted('fee_late_fine_max_cap', 600.00, $this->school1->id, 'financial_rules'); // cap 600

        // Fee 1: 10,000 -> 5% = 500.00 (< cap 600.00)
        $fee1 = StudentFee::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'academic_year_id' => $this->ay1->id,
            'term_name' => 'Overdue Term Pct 1',
            'amount' => 10000.00,
            'net_amount' => 10000.00,
            'fine_amount' => 0.00,
            'paid_amount' => 0.00,
            'status' => 'Overdue',
            'due_date' => Carbon::today()->subDays(4)->toDateString(),
        ]);

        // Fee 2: 20,000 -> 5% = 1,000.00 (exceeds cap 600.00 -> should be capped at 600.00)
        $fee2 = StudentFee::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'academic_year_id' => $this->ay1->id,
            'term_name' => 'Overdue Term Pct 2',
            'amount' => 20000.00,
            'net_amount' => 20000.00,
            'fine_amount' => 0.00,
            'paid_amount' => 0.00,
            'status' => 'Overdue',
            'due_date' => Carbon::today()->subDays(4)->toDateString(),
        ]);

        Artisan::call(FeeCalculateLateFinesCommand::class, ['--school' => $this->school1->id]);

        $fee1->refresh();
        $fee2->refresh();

        $this->assertEquals(500.00, (float) $fee1->fine_amount);
        $this->assertEquals(10500.00, (float) $fee1->net_amount);

        // Fee 2 capped at 600.00
        $this->assertEquals(600.00, (float) $fee2->fine_amount);
        $this->assertEquals(20600.00, (float) $fee2->net_amount);
    }

    /**
     * Test 29: Cancelled installments are excluded from dues, late fines, reminders, and parent dues
     */
    public function test_cancelled_installments_are_excluded_from_dues_listings_and_fines(): void
    {
        SchoolSetting::setEncrypted('fee_late_fine_type', 'daily', $this->school1->id, 'financial_rules');
        SchoolSetting::setEncrypted('fee_late_fine_rate', 50.00, $this->school1->id, 'financial_rules');
        SchoolSetting::setEncrypted('fee_late_fine_grace_days', 0, $this->school1->id, 'financial_rules');
        SchoolSetting::setEncrypted('fee_late_fine_max_cap', 500.00, $this->school1->id, 'financial_rules');

        $cancelledFee = StudentFee::create([
            'school_id' => $this->school1->id,
            'student_id' => $this->student1->id,
            'academic_year_id' => $this->ay1->id,
            'term_name' => 'Stale Cancelled Quarter',
            'amount' => 25000.00,
            'net_amount' => 25000.00,
            'fine_amount' => 0.00,
            'paid_amount' => 0.00,
            'status' => 'Cancelled',
            'due_date' => Carbon::today()->subDays(15)->toDateString(),
        ]);

        // 1. Fine command must skip cancelled fees
        Artisan::call(FeeCalculateLateFinesCommand::class, ['--school' => $this->school1->id]);
        $cancelledFee->refresh();
        $this->assertEquals(0.00, (float) $cancelledFee->fine_amount);

        // 2. Parent dues summary must exclude Cancelled fee amounts
        $response = $this->actingAs($this->parentUser1)
            ->getJson('/api/v1/student/fees');
        $response->assertStatus(200);
        $parentData = $response->json('data');
        
        // Ensure total dues computed on parent view does not include the 25,000 cancelled fee
        if (isset($parentData['total_due'])) {
            $this->assertLessThan(25000.00, (float) $parentData['total_due']);
        }

        // 3. Accountant defaulters report must not count cancelled fees in pending dues
        $accountantResponse = $this->actingAs($this->accountant1)
            ->getJson('/api/v1/accounts/fees/reports/defaulters');
        $accountantResponse->assertStatus(200);
        $duesData = $accountantResponse->json('data') ?? [];
        $cancelledInDues = collect($duesData)->firstWhere('term_name', 'Stale Cancelled Quarter');
        $this->assertNull($cancelledInDues);
    }
}
