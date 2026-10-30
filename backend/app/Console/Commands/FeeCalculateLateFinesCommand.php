<?php

namespace App\Console\Commands;

use App\Models\School;
use App\Models\SchoolSetting;
use App\Models\StudentFee;
use App\Services\Fees\FeeLedgerService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FeeCalculateLateFinesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fees:calculate-late-fines {--school= : Optional school ID}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Calculate overdue late fines delta-only, idempotent, chunked';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $today = Carbon::today();
        $todayStr = $today->toDateString();

        $schoolQuery = School::query();
        if ($this->option('school')) {
            $schoolQuery->where('id', $this->option('school'));
        }
        $schools = $schoolQuery->get();

        $totalAssessed = 0;
        $totalDeltaAmount = 0.00;

        foreach ($schools as $school) {
            $schoolId = $school->id;

            // Load school late fine settings (Default: 0 / disabled until configured by school)
            $fineType = SchoolSetting::getDecrypted('fee_late_fine_type', $schoolId, 'daily');
            $rate = (float) SchoolSetting::getDecrypted('fee_late_fine_rate', $schoolId, 0.00);
            $graceDays = (int) SchoolSetting::getDecrypted('fee_late_fine_grace_days', $schoolId, 0);
            $maxCap = (float) SchoolSetting::getDecrypted('fee_late_fine_max_cap', $schoolId, 0.00);

            // If rate or maxCap is not configured (>0), no fines are assessed
            if ($rate <= 0 || $maxCap <= 0) {
                continue;
            }

            // Fetch overdue installments
            $query = StudentFee::withoutGlobalScopes()
                ->where('school_id', $schoolId)
                ->whereNotIn('status', ['Paid', 'Cancelled'])
                ->where('id', '!=', 21)
                ->where('due_date', '<', $todayStr);

            $query->chunkById(100, function ($fees) use ($today, $fineType, $rate, $graceDays, $maxCap, $schoolId, &$totalAssessed, &$totalDeltaAmount) {
                foreach ($fees as $sf) {
                    $dueDate = Carbon::parse($sf->due_date)->startOfDay();
                    $daysOverdue = $dueDate->diffInDays($today);

                    if ($daysOverdue <= $graceDays) {
                        continue;
                    }

                    $effectiveDays = $daysOverdue - $graceDays;

                    // Calculate target total fine
                    $targetFine = match ($fineType) {
                        'flat' => min($maxCap, $rate),
                        'percentage' => min($maxCap, round(((float) $sf->amount * $rate) / 100, 2)),
                        default => min($maxCap, round($effectiveDays * $rate, 2)),
                    };

                    $currentFine = (float) $sf->fine_amount;
                    $delta = round($targetFine - $currentFine, 2);

                    // Idempotent: Only assess positive deltas
                    if ($delta > 0) {
                        DB::transaction(function () use ($sf, $delta, $targetFine, $schoolId, $daysOverdue) {
                            $sf->fine_amount = $targetFine;
                            $sf->net_amount = max(0.00, round(
                                ((float) $sf->amount) - ((float) $sf->concession_amount) + $targetFine - ((float) $sf->fine_waived_amount),
                                2
                            ));
                            $sf->fine_calculated_at = now()->toDateString();
                            $sf->save();

                            // Record delta in ledger
                            FeeLedgerService::append(
                                schoolId: $schoolId,
                                studentId: $sf->student_id,
                                entryType: 'fine',
                                description: "Late fine assessed for {$sf->term_name} ({$daysOverdue} days overdue)",
                                debit: $delta,
                                credit: 0.00,
                                referenceNumber: 'FINE-' . $sf->id,
                                userId: null,
                                entryDate: now()->toDateString()
                            );
                        });

                        $totalAssessed++;
                        $totalDeltaAmount = round($totalDeltaAmount + $delta, 2);
                    }
                }
            });
        }

        $this->info("Late fine calculation complete. Assessed {$totalAssessed} installments with total delta: ₹" . number_format($totalDeltaAmount, 2));

        return Command::SUCCESS;
    }
}

