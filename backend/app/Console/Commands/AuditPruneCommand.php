<?php

namespace App\Console\Commands;

use App\Models\AuditLog;
use Carbon\Carbon;
use Illuminate\Console\Command;

class AuditPruneCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'audit:prune {--days=180 : Number of days of general audit logs to keep} {--exam-days=1825 : Number of days of academic exam logs to keep (min 365)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Prune audit logs older than the specified retention days (academic exam logs preserved for minimum 365 days / 5 years).';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $days = (int) $this->option('days');
        if ($days <= 0) {
            $days = 180;
        }

        $examDays = (int) $this->option('exam-days');
        if ($examDays < 365) {
            $examDays = 365; // Enforce minimum 365 days for academic records
        }

        $generalCutoff = Carbon::now()->subDays($days);
        $examCutoff = Carbon::now()->subDays($examDays);

        $examAuditableTypes = [
            \App\Models\Exam::class,
            \App\Models\ExamMark::class,
            \App\Models\StudentReportSummary::class,
            \App\Models\ExamTerm::class,
        ];

        // 1. Prune general audit logs (excluding exam/marks records)
        $prunedGeneral = AuditLog::whereNotIn('auditable_type', $examAuditableTypes)
            ->where('created_at', '<', $generalCutoff)
            ->delete();

        // 2. Prune academic exam logs only if past the extended retention (min 365 days, default 5 years)
        $prunedExam = AuditLog::whereIn('auditable_type', $examAuditableTypes)
            ->where('created_at', '<', $examCutoff)
            ->delete();

        $totalPruned = $prunedGeneral + $prunedExam;
        $this->info("Pruned {$prunedGeneral} general audit logs (> {$days} days) and {$prunedExam} academic exam logs (> {$examDays} days).");

        return self::SUCCESS;
    }
}

