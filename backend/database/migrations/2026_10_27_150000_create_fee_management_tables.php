<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Receipt & Voucher Number Sequences (Gapless, Per School & Academic Year)
        Schema::create('receipt_sequences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->restrictOnDelete();
            $table->foreignId('academic_year_id')->constrained('academic_years')->restrictOnDelete();
            $table->string('sequence_type', 30)->default('receipt'); // receipt, refund
            $table->string('prefix', 50); // e.g. "DPS/2026-27/REC", "DPS/2026-27/REF"
            $table->unsignedBigInteger('last_number')->default(0);
            $table->timestamps();

            $table->unique(['school_id', 'academic_year_id', 'sequence_type'], 'receipt_seq_school_ay_type_uniq');
        });

        // 2. Fee Concession Types (Master: Sibling, Staff Ward, Merit, RTE/EWS, Management)
        Schema::create('fee_concession_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->restrictOnDelete();
            $table->string('name', 100);
            $table->string('discount_type', 20)->default('percentage'); // percentage, fixed_amount
            $table->decimal('discount_value', 10, 2);
            $table->string('applicable_fee_head', 50)->default('tuition_fee'); // tuition_fee, total_annual_fee, activity_fee, lab_library_fee, other_fee
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['school_id', 'name'], 'concession_type_school_name_uniq');
        });

        // 3. Student Fee Concessions (Assigned per Student & Academic Year, Approved by Admin)
        Schema::create('student_fee_concessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->restrictOnDelete();
            $table->foreignId('student_id')->constrained('students')->restrictOnDelete();
            $table->foreignId('fee_concession_type_id')->constrained('fee_concession_types')->restrictOnDelete();
            $table->foreignId('academic_year_id')->constrained('academic_years')->restrictOnDelete();
            $table->decimal('calculated_discount_amount', 10, 2)->default(0.00);
            $table->string('approval_status', 30)->default('pending'); // pending, approved, rejected, revoked
            $table->foreignId('requested_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('revoked_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('revoked_at')->nullable();
            $table->text('revoke_reason')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->unique(
                ['school_id', 'student_id', 'academic_year_id', 'fee_concession_type_id'],
                'student_concession_unique_per_year'
            );
        });

        // 4. Immutable Fee Payments Table (Offline Today, Online Gateway Ready)
        Schema::create('fee_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->restrictOnDelete();
            $table->foreignId('student_id')->constrained('students')->restrictOnDelete();
            $table->foreignId('academic_year_id')->constrained('academic_years')->restrictOnDelete();
            $table->string('receipt_number', 60);
            $table->string('idempotency_key', 100);
            $table->decimal('amount_paid', 12, 2);
            $table->date('payment_date');

            // Payment Mode: cash, cheque, bank_transfer, upi_manual
            $table->string('payment_mode', 40);
            $table->string('reference_number', 100)->nullable(); // Cheque #, Bank UTR, UPI Txn ID
            $table->date('cheque_date')->nullable();
            $table->string('bank_name', 100)->nullable();
            $table->string('cheque_status', 30)->nullable(); // pending_clearance, cleared, bounced
            $table->timestamp('cheque_cleared_at')->nullable();
            $table->timestamp('cheque_bounced_at')->nullable();
            $table->decimal('bounce_fee', 10, 2)->default(0.00);

            // Backdated Payment Approval Tracking
            $table->boolean('is_backdated')->default(false);
            $table->foreignId('backdated_approved_by_user_id')->nullable()->constrained('users')->nullOnDelete();

            // Status Flow: completed, pending_clearance, cleared, bounced, voided
            $table->string('status', 30)->default('completed');
            $table->string('source', 20)->default('offline'); // offline, online

            // Extensibility Hooks for Future Online Gateway (Razorpay)
            $table->string('provider', 40)->nullable();
            $table->string('provider_order_id', 100)->nullable();
            $table->string('provider_payment_id', 100)->nullable();

            $table->foreignId('collected_by_user_id')->nullable()->constrained('users')->nullOnDelete();

            // Void Tracking (Immutable Reversal)
            $table->timestamp('voided_at')->nullable();
            $table->foreignId('voided_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('void_reason')->nullable();

            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->unique(['school_id', 'receipt_number'], 'fee_payments_school_receipt_uniq');
            $table->unique(['school_id', 'idempotency_key'], 'fee_payments_school_idempotency_uniq');
            $table->unique(['provider', 'provider_payment_id'], 'fee_payments_provider_payment_uniq');
            $table->index(['school_id', 'student_id', 'payment_date'], 'fee_payments_student_date_idx');
            $table->index(['school_id', 'status', 'payment_mode'], 'fee_payments_status_mode_idx');
        });

        // 5. Itemized Payment Allocations (Oldest Due First, Fine Before Principal)
        Schema::create('fee_payment_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->restrictOnDelete();
            $table->foreignId('fee_payment_id')->constrained('fee_payments')->restrictOnDelete();
            $table->foreignId('student_fee_id')->nullable()->constrained('student_fees')->restrictOnDelete();
            $table->decimal('principal_amount', 12, 2)->default(0.00);
            $table->decimal('fine_amount', 12, 2)->default(0.00);
            $table->boolean('is_advance_credit')->default(false);
            $table->timestamps();

            $table->index(['school_id', 'fee_payment_id'], 'allocations_payment_idx');
            $table->index(['school_id', 'student_fee_id'], 'allocations_fee_idx');
        });

        // 6. Append-Only Student Fee Ledger (Audit Trail)
        Schema::create('fee_ledgers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->restrictOnDelete();
            $table->foreignId('student_id')->constrained('students')->restrictOnDelete();
            $table->foreignId('academic_year_id')->nullable()->constrained('academic_years')->restrictOnDelete();
            $table->date('entry_date');
            $table->string('entry_type', 35); // invoice, payment, concession, fine, fine_waiver, refund, reversal, cheque_bounce, advance_credit
            $table->string('reference_number', 100)->nullable();
            $table->string('description', 255);
            $table->decimal('debit', 12, 2)->default(0.00);
            $table->decimal('credit', 12, 2)->default(0.00);
            $table->decimal('running_balance', 12, 2)->default(0.00);
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['school_id', 'student_id', 'entry_date'], 'fee_ledgers_student_date_idx');
            $table->index(['school_id', 'entry_type', 'created_at'], 'fee_ledgers_type_idx');
        });

        // 7. Fee Refunds Table (Admin Approval Workflow)
        Schema::create('fee_refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->restrictOnDelete();
            $table->foreignId('student_id')->constrained('students')->restrictOnDelete();
            $table->foreignId('academic_year_id')->constrained('academic_years')->restrictOnDelete();
            $table->foreignId('original_payment_id')->nullable()->constrained('fee_payments')->restrictOnDelete();
            $table->string('refund_number', 60);
            $table->decimal('refund_amount', 12, 2);
            $table->string('refund_type', 30); // ledger_credit, bank_transfer, cheque
            $table->string('reason', 255);
            $table->string('status', 30)->default('pending_approval'); // pending_approval, approved, rejected, processed
            $table->foreignId('requested_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->string('disbursement_reference', 100)->nullable();
            $table->date('disbursement_date')->nullable();
            $table->text('admin_remarks')->nullable();
            $table->timestamps();

            $table->unique(['school_id', 'refund_number'], 'fee_refunds_school_number_uniq');
            $table->index(['school_id', 'status'], 'fee_refunds_status_idx');
        });

        // 8. Extend existing student_fees table with fine and tracking columns
        Schema::table('student_fees', function (Blueprint $table) {
            $table->decimal('concession_amount', 10, 2)->default(0.00)->after('amount');
            $table->decimal('fine_amount', 10, 2)->default(0.00)->after('concession_amount');
            $table->decimal('fine_waived_amount', 10, 2)->default(0.00)->after('fine_amount');
            $table->decimal('fine_paid_amount', 10, 2)->default(0.00)->after('fine_waived_amount');
            $table->decimal('net_amount', 10, 2)->default(0.00)->after('fine_paid_amount');
            $table->decimal('paid_amount', 10, 2)->default(0.00)->after('net_amount');
            $table->date('fine_calculated_at')->nullable()->after('paid_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_fees', function (Blueprint $table) {
            $table->dropColumn([
                'concession_amount',
                'fine_amount',
                'fine_waived_amount',
                'fine_paid_amount',
                'net_amount',
                'paid_amount',
                'fine_calculated_at',
            ]);
        });
        Schema::dropIfExists('fee_refunds');
        Schema::dropIfExists('fee_ledgers');
        Schema::dropIfExists('fee_payment_allocations');
        Schema::dropIfExists('fee_payments');
        Schema::dropIfExists('student_fee_concessions');
        Schema::dropIfExists('fee_concession_types');
        Schema::dropIfExists('receipt_sequences');
    }
};

