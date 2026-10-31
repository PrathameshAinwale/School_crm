<?php

namespace App\Jobs;

use App\Models\CommunicationCampaign;
use App\Models\CommunicationLog;
use App\Models\SchoolSetting;
use App\Services\Communication\AudienceResolver;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Throwable;

class DispatchCommunicationCampaignJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 180;
    public int $tries = 3;
    public array $backoff = [10, 60, 300];

    public function __construct(public int $campaignId) {}

    public function handle(AudienceResolver $resolver): void
    {
        $campaign = CommunicationCampaign::withoutGlobalScopes()->find($this->campaignId);
        if (!$campaign || in_array($campaign->status, ['completed', 'cancelled'])) {
            return;
        }

        $campaign->update(['status' => 'processing']);

        $schoolId = $campaign->school_id;

        // Daily cap enforcement
        $dailyLimit = (int) SchoolSetting::getDecrypted('communication_daily_limit', $schoolId, env('COMMUNICATION_DAILY_LIMIT', 1000));
        $sentToday = CommunicationLog::where('school_id', $schoolId)
            ->whereDate('created_at', Carbon::today())
            ->whereIn('status', ['sent', 'delivered', 'queued'])
            ->count();

        // Resolve recipients
        $recipients = $resolver->resolveRecipients($schoolId, [
            'channel' => $campaign->channel,
            'message_category' => $campaign->message_category,
            'audience_type' => $campaign->audience_type,
            'audience_filters' => $campaign->audience_filters,
            'message_body' => $campaign->message_body,
            'is_test_mode' => $campaign->is_test_mode,
            'test_recipients' => $campaign->test_recipients ?? [],
        ]);

        $isEmergency = ($campaign->message_category === 'emergency');
        $allowPartialCap = !empty($campaign->allow_partial_cap) || (!empty($campaign->audience_filters['allow_partial_cap']));

        $eligibleRecipients = array_filter($recipients, fn($r) => $r['status'] === 'queued');
        $eligibleCount = count($eligibleRecipients);

        // Daily cap enforcement: Emergency campaigns bypass the cap but are still counted & logged
        if (!$isEmergency && ($sentToday + $eligibleCount) > $dailyLimit) {
            $quotaRemaining = max(0, $dailyLimit - $sentToday);

            if (!$allowPartialCap) {
                // Default behavior: Abort whole campaign upfront
                $campaign->update([
                    'status' => 'failed',
                    'failed_count' => $eligibleCount,
                ]);
                foreach ($recipients as $item) {
                    CommunicationLog::create([
                        'school_id' => $schoolId,
                        'campaign_id' => $campaign->id,
                        'recipient_user_id' => $item['recipient_user_id'],
                        'recipient_student_id' => $item['recipient_student_id'],
                        'channel' => $campaign->channel,
                        'message_category' => $campaign->message_category,
                        'recipient_name' => $item['recipient_name'],
                        'recipient_phone' => $item['recipient_phone'],
                        'recipient_email' => $item['recipient_email'],
                        'recipient_device_token' => $item['recipient_device_token'],
                        'message_body' => $item['message_body'],
                        'status' => 'failed',
                        'error_message' => "Campaign aborted: School daily communication limit ({$dailyLimit}) would be exceeded.",
                    ]);
                }
                return;
            } else {
                // Admin option: Send up to cap, mark remaining eligible as skipped 'Daily cap reached'
                $queuedCount = 0;
                foreach ($recipients as &$item) {
                    if ($item['status'] === 'queued') {
                        if ($queuedCount < $quotaRemaining) {
                            $queuedCount++;
                        } else {
                            $item['status'] = 'skipped';
                            $item['skip_reason'] = 'Daily cap reached';
                        }
                    }
                }
                unset($item);
            }
        }

        $createdLogIds = [];
        $skippedCount = 0;

        foreach ($recipients as $item) {
            $log = CommunicationLog::create([
                'school_id' => $schoolId,
                'campaign_id' => $campaign->id,
                'recipient_user_id' => $item['recipient_user_id'],
                'recipient_student_id' => $item['recipient_student_id'],
                'channel' => $campaign->channel,
                'message_category' => $campaign->message_category,
                'recipient_name' => $item['recipient_name'],
                'recipient_phone' => $item['recipient_phone'],
                'recipient_email' => $item['recipient_email'],
                'recipient_device_token' => $item['recipient_device_token'],
                'message_body' => $item['message_body'],
                'status' => $item['status'],
                'error_message' => $item['skip_reason'],
            ]);

            if ($item['status'] === 'queued') {
                $createdLogIds[] = $log->id;
            } else {
                $skippedCount++;
            }
        }

        $campaign->update([
            'total_recipients' => count($recipients),
            'skipped_count' => $skippedCount,
        ]);

        // When channel is in_app or explicitly marked circular, publish into school_notices
        $isCircular = ($campaign->channel === 'in_app') || !empty($campaign->is_circular) || (!empty($campaign->audience_filters['is_circular']));
        if ($isCircular) {
            \App\Models\SchoolNotice::create([
                'school_id' => $schoolId,
                'title' => $campaign->subject ?: $campaign->title,
                'category' => match($campaign->message_category) {
                    'emergency' => 'Administrative',
                    'promotional' => 'Academic',
                    default => 'Administrative',
                },
                'priority' => ($campaign->message_category === 'emergency' ? 'Urgent' : 'Normal'),
                'sender' => $campaign->creator?->name ?: 'School Administration',
                'publish_date' => Carbon::now()->toDateString(),
                'content' => $campaign->message_body,
            ]);
        }

        if (empty($createdLogIds)) {
            $campaign->update(['status' => 'completed']);
            return;
        }

        // Chunk into safe batches of 50 for shared-hosting execution
        $chunks = array_chunk($createdLogIds, 50);
        foreach ($chunks as $chunk) {
            SendCommunicationBatchJob::dispatch($campaign->id, $chunk);
        }
    }
}

