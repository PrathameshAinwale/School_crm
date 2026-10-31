<?php

namespace App\Jobs;

use App\Models\CommunicationCampaign;
use App\Models\CommunicationLog;
use App\Models\Notification;
use App\Services\Communication\CommunicationManager;
use App\Services\Communication\TemplateCompiler;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Throwable;

class SendCommunicationBatchJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 120;
    public int $tries = 3;
    public array $backoff = [10, 60, 300];

    public function __construct(
        public int $campaignId,
        public array $logIds
    ) {}

    public function handle(CommunicationManager $manager): void
    {
        $campaign = CommunicationCampaign::withoutGlobalScopes()->find($this->campaignId);
        if (!$campaign) {
            return;
        }

        $template = $campaign->template;
        $channel = $campaign->channel;
        $schoolId = $campaign->school_id;

        // Atomically claim ONLY logs with status 'queued' and immediately transition them to 'sending'
        // This ensures two concurrent queue workers cannot claim or process the exact same rows
        $logs = DB::transaction(function () {
            $claimed = CommunicationLog::whereIn('id', $this->logIds)
                ->where('status', 'queued')
                ->lockForUpdate()
                ->get();

            if ($claimed->isNotEmpty()) {
                CommunicationLog::whereIn('id', $claimed->pluck('id'))->update(['status' => 'sending']);
            }

            return $claimed;
        });

        if ($logs->isEmpty()) {
            $this->checkCampaignCompletion($campaign);
            return;
        }

        foreach ($logs as $log) {
            try {
                if ($channel === 'sms') {
                    $dltParams = [
                        'dlt_template_id' => $template?->dlt_template_id,
                        'dlt_header' => $template?->dlt_header,
                    ];
                    $result = $manager->sms()->send(
                        to: $log->recipient_phone,
                        content: $log->message_body,
                        dltParams: $dltParams,
                        schoolId: $schoolId
                    );
                } elseif ($channel === 'whatsapp') {
                    if ($template && $template->whatsapp_template_name) {
                        // Positional parameter mapping for Meta approved templates
                        $parameters = TemplateCompiler::buildMetaParameters(
                            $template->meta_variable_mapping,
                            ['student_name' => $log->recipient_name]
                        );
                        $result = $manager->whatsApp()->sendTemplate(
                            to: $log->recipient_phone,
                            templateName: $template->whatsapp_template_name,
                            language: $template->whatsapp_language ?: 'en_US',
                            parameters: $parameters,
                            schoolId: $schoolId
                        );
                    } else {
                        $result = $manager->whatsApp()->sendSessionText(
                            to: $log->recipient_phone,
                            message: $log->message_body,
                            schoolId: $schoolId
                        );
                    }
                } elseif ($channel === 'email') {
                    $result = $manager->email()->send(
                        to: $log->recipient_email,
                        subject: $campaign->subject ?: 'School Notification',
                        htmlBody: nl2br(e($log->message_body)),
                        schoolId: $schoolId
                    );
                } elseif ($channel === 'push') {
                    $result = $manager->push()->send(
                        deviceToken: $log->recipient_device_token,
                        title: $campaign->subject ?: 'School Notification',
                        body: $log->message_body,
                        data: ['campaign_id' => $campaign->id],
                        schoolId: $schoolId
                    );
                } elseif ($channel === 'in_app') {
                    // Create in-app notification in notifications table
                    if ($log->recipient_user_id) {
                        Notification::create([
                            'user_id' => $log->recipient_user_id,
                            'role' => 'all',
                            'title' => $campaign->subject ?: 'Official Notice',
                            'message' => $log->message_body,
                            'type' => 'notice',
                            'link' => '/notices',
                            'is_read' => false,
                        ]);
                    }
                    $result = \App\Services\Communication\DTO\ProviderSendResult::success('in_app_' . $log->id);
                } else {
                    $result = \App\Services\Communication\DTO\ProviderSendResult::failure("Unsupported channel: {$channel}");
                }

                if ($result->success) {
                    $log->update([
                        'status' => 'sent',
                        'provider' => $channel,
                        'provider_message_id' => $result->providerMessageId,
                        'sent_at' => now(),
                        'error_message' => null,
                    ]);
                    DB::table('communication_campaigns')
                        ->where('id', $campaign->id)
                        ->increment('sent_count');
                } else {
                    $log->update([
                        'status' => 'failed',
                        'provider' => $channel,
                        'error_message' => $result->errorMessage,
                    ]);
                    DB::table('communication_campaigns')
                        ->where('id', $campaign->id)
                        ->increment('failed_count');
                }
            } catch (Throwable $e) {
                $log->update([
                    'status' => 'failed',
                    'error_message' => "Worker Exception: " . $e->getMessage(),
                ]);
                DB::table('communication_campaigns')
                    ->where('id', $campaign->id)
                    ->increment('failed_count');
            }

            // Shared hosting rate throttle: 20ms pause between external network requests
            usleep(20000);
        }

        $this->checkCampaignCompletion($campaign);
    }

    private function checkCampaignCompletion(CommunicationCampaign $campaign): void
    {
        $hasPending = CommunicationLog::where('campaign_id', $campaign->id)
            ->where('status', 'queued')
            ->exists();

        if (!$hasPending) {
            $campaign->update(['status' => 'completed']);
        }
    }
}

