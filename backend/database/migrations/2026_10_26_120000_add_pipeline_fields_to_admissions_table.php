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
        Schema::table('admissions', function (Blueprint $table) {
            // Pipeline & Lead tracking
            if (!Schema::hasColumn('admissions', 'lead_source')) {
                $table->string('lead_source')->nullable()->default('Walk-in')->after('academic_year');
            }
            if (!Schema::hasColumn('admissions', 'documents')) {
                $table->json('documents')->nullable()->after('address');
            }
            if (!Schema::hasColumn('admissions', 'test_score')) {
                $table->string('test_score')->nullable()->after('documents');
            }
            if (!Schema::hasColumn('admissions', 'test_date')) {
                $table->date('test_date')->nullable()->after('test_score');
            }
            if (!Schema::hasColumn('admissions', 'test_status')) {
                $table->string('test_status')->nullable()->default('Pending')->after('test_date'); // Pending, Scheduled, Cleared, Failed, Waived
            }
            if (!Schema::hasColumn('admissions', 'interview_date')) {
                $table->dateTime('interview_date')->nullable()->after('test_status');
            }
            if (!Schema::hasColumn('admissions', 'interview_interviewer')) {
                $table->string('interview_interviewer')->nullable()->after('interview_date');
            }
            if (!Schema::hasColumn('admissions', 'interview_notes')) {
                $table->text('interview_notes')->nullable()->after('interview_interviewer');
            }
            if (!Schema::hasColumn('admissions', 'interview_result')) {
                $table->string('interview_result')->nullable()->default('Pending')->after('interview_notes'); // Pending, Recommended, On Hold, Not Recommended
            }
            if (!Schema::hasColumn('admissions', 'offer_date')) {
                $table->date('offer_date')->nullable()->after('interview_result');
            }
            if (!Schema::hasColumn('admissions', 'offer_valid_until')) {
                $table->date('offer_valid_until')->nullable()->after('offer_date');
            }
            if (!Schema::hasColumn('admissions', 'admission_fee')) {
                $table->decimal('admission_fee', 10, 2)->nullable()->default(0)->after('offer_valid_until');
            }
            if (!Schema::hasColumn('admissions', 'admission_fee_status')) {
                $table->string('admission_fee_status')->nullable()->default('Pending')->after('admission_fee'); // Pending, Paid, Waived
            }
            if (!Schema::hasColumn('admissions', 'admission_fee_receipt')) {
                $table->string('admission_fee_receipt')->nullable()->after('admission_fee_status');
            }
            if (!Schema::hasColumn('admissions', 'admission_fee_date')) {
                $table->date('admission_fee_date')->nullable()->after('admission_fee_receipt');
            }
            if (!Schema::hasColumn('admissions', 'admission_fee_mode')) {
                $table->string('admission_fee_mode')->nullable()->after('admission_fee_date'); // Cash, UPI, Netbanking, Cheque, Card
            }
            if (!Schema::hasColumn('admissions', 'pipeline_notes')) {
                $table->json('pipeline_notes')->nullable()->after('remarks');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('admissions', function (Blueprint $table) {
            $table->dropColumn([
                'lead_source',
                'documents',
                'test_score',
                'test_date',
                'test_status',
                'interview_date',
                'interview_interviewer',
                'interview_notes',
                'interview_result',
                'offer_date',
                'offer_valid_until',
                'admission_fee',
                'admission_fee_status',
                'admission_fee_receipt',
                'admission_fee_date',
                'admission_fee_mode',
                'pipeline_notes',
            ]);
        });
    }
};
