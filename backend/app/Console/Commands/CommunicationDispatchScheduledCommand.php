<?php

namespace App\Console\Commands;

use App\Jobs\DispatchCommunicationCampaignJob;
use App\Models\CommunicationCampaign;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CommunicationDispatchScheduledCommand extends Command
{
    protected $signature = 'communication:dispatch-scheduled';
    protected $description = 'Dispatch pending scheduled communication campaigns whose time has arrived';

    public function handle(): int
    {
        $now = Carbon::now();

        $campaigns = CommunicationCampaign::withoutGlobalScopes()
            ->where('status', 'scheduled')
            ->whereNotNull('scheduled_at')
            ->where('scheduled_at', '<=', $now)
            ->get();

        if ($campaigns->isEmpty()) {
            $this->info("No scheduled campaigns due for dispatch.");
            return self::SUCCESS;
        }

        $this->info("Found {$campaigns->count()} scheduled campaign(s) ready for dispatch.");

        foreach ($campaigns as $campaign) {
            $this->line("Dispatching Campaign #{$campaign->id}: '{$campaign->title}' (School #{$campaign->school_id})");
            DispatchCommunicationCampaignJob::dispatch($campaign->id);
        }

        return self::SUCCESS;
    }
}

