<?php

namespace App\Console\Commands;

use App\Models\CommunicationLog;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CommunicationPruneCommand extends Command
{
    protected $signature = 'communication:prune {--days=180 : Number of days of communication logs to retain}';
    protected $description = 'Prune old communication logs beyond the retention window';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        if ($days <= 0) {
            $days = 180;
        }

        $cutoff = Carbon::now()->subDays($days);
        $this->info("Pruning communication logs created before {$cutoff->toDateTimeString()} ({$days} days retention)...");

        $deleted = CommunicationLog::withoutGlobalScopes()
            ->where('created_at', '<', $cutoff)
            ->delete();

        $this->info("Successfully deleted {$deleted} communication log records.");
        return self::SUCCESS;
    }
}

