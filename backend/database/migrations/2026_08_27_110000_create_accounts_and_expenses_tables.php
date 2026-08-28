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
        // 1. School Expenses & Resource Expenditure Table
        Schema::create('school_expenses', function (Blueprint $table) {
            $table->id();
            $table->string('expense_code')->unique();
            $table->string('title');
            $table->string('category')->default('Resources & Equipment'); 
            // Categories: Resources & Equipment, Maintenance & Repairs, Utilities & Bills, Transport & Fuel, Academic & Lab Supplies, Events & Functions, Administrative
            $table->decimal('amount', 12, 2);
            $table->date('expense_date');
            $table->string('payment_mode')->default('Bank Transfer / NEFT'); // Bank Transfer, UPI, Cheque, Card, Cash
            $table->string('vendor_name')->nullable();
            $table->string('invoice_number')->nullable();
            $table->string('status')->default('Paid'); // Paid, Pending Approval, Cancelled
            $table->text('notes')->nullable();
            $table->foreignId('recorded_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('resource_id')->nullable()->constrained('resources')->onDelete('set null');
            $table->timestamps();
        });

        // 2. Salary Disbursement Requests (HR to Accounts Workflow)
        Schema::create('salary_disbursement_requests', function (Blueprint $table) {
            $table->id();
            $table->string('batch_code')->unique();
            $table->string('month')->default('August 2026');
            $table->unsignedInteger('total_staff_count')->default(0);
            $table->decimal('total_gross_amount', 12, 2)->default(0.00);
            $table->decimal('total_deductions', 12, 2)->default(0.00);
            $table->decimal('total_net_amount', 12, 2)->default(0.00);
            $table->string('status')->default('Pending Review'); // Pending Review, Disbursed, Rejected
            $table->foreignId('requested_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('actioned_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('payment_reference')->nullable();
            $table->string('payout_mode')->default('Direct Bank Transfer (NEFT/RTGS)');
            $table->text('accounts_notes')->nullable();
            $table->timestamp('disbursed_at')->nullable();
            $table->timestamps();
        });

        // 3. Update staff_salaries with extra banking & disbursement tracking columns
        Schema::table('staff_salaries', function (Blueprint $table) {
            if (!Schema::hasColumn('staff_salaries', 'disbursement_request_id')) {
                $table->foreignId('disbursement_request_id')->nullable()->constrained('salary_disbursement_requests')->onDelete('set null');
            }
            if (!Schema::hasColumn('staff_salaries', 'payment_reference')) {
                $table->string('payment_reference')->nullable();
            }
            if (!Schema::hasColumn('staff_salaries', 'ifsc_code')) {
                $table->string('ifsc_code')->default('HDFC0001234');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('staff_salaries', function (Blueprint $table) {
            if (Schema::hasColumn('staff_salaries', 'disbursement_request_id')) {
                $table->dropConstrainedForeignId('disbursement_request_id');
            }
            if (Schema::hasColumn('staff_salaries', 'payment_reference')) {
                $table->dropColumn('payment_reference');
            }
            if (Schema::hasColumn('staff_salaries', 'ifsc_code')) {
                $table->dropColumn('ifsc_code');
            }
        });

        Schema::dropIfExists('salary_disbursement_requests');
        Schema::dropIfExists('school_expenses');
    }
};
