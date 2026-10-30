<?php

namespace App\Http\Controllers\Api\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\CommunicationCampaign;
use App\Models\CommunicationLog;
use App\Models\School;
use App\Models\SchoolSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WhatsAppWebhookController extends Controller
{
    /**
     * Meta WhatsApp Webhook Verification Handshake (GET).
     */
    public function verify(Request $request, string $webhookKey)
    {
        $school = School::where('webhook_key', $webhookKey)->first();
        if (!$school) {
            return response('Unauthorized webhook key', 404);
        }

        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        $expectedToken = SchoolSetting::getDecrypted('whatsapp_verify_token', $school->id, env('WHATSAPP_VERIFY_TOKEN'));

        if ($mode === 'subscribe' && !empty($token) && !empty($expectedToken) && hash_equals($expectedToken, $token)) {
            return response($challenge, 200)->header('Content-Type', 'text/plain');
        }

        return response('Forbidden', 403);
    }

    /**
     * Meta WhatsApp Status & Inbound Event Callback (POST).
     */
    public function handle(Request $request, string $webhookKey)
    {
        $school = School::where('webhook_key', $webhookKey)->first();
        if (!$school) {
            return response()->json(['error' => 'Invalid school key'], 404);
        }

        $rawBody = $request->getContent();
        $signature = $request->header('X-Hub-Signature-256');

        $appSecret = SchoolSetting::getDecrypted('whatsapp_app_secret', $school->id, env('WHATSAPP_APP_SECRET'));

        // If app secret is configured, enforce strict HMAC-SHA256 signature verification
        if (!empty($appSecret)) {
            if (empty($signature) || !str_starts_with($signature, 'sha256=')) {
                return response()->json(['error' => 'Missing or invalid signature header'], 401);
            }

            $expected = 'sha256=' . hash_hmac('sha256', $rawBody, $appSecret);
            if (!hash_equals($expected, $signature)) {
                return response()->json(['error' => 'Invalid signature verification'], 401);
            }
        }

        $payload = json_decode($rawBody, true) ?? [];

        // Monotonic weight helper
        $weights = [
            'queued' => 1,
            'sent' => 2,
            'delivered' => 3,
            'read' => 4,
            'failed' => 5,
        ];

        $entries = $payload['entry'] ?? [];
        foreach ($entries as $entry) {
            $changes = $entry['changes'] ?? [];
            foreach ($changes as $change) {
                $value = $change['value'] ?? [];
                $statuses = $value['statuses'] ?? [];

                foreach ($statuses as $st) {
                    $msgId = $st['id'] ?? null;
                    $statusName = strtolower($st['status'] ?? '');

                    if (!$msgId) continue;

                    // Match strictly by school_id AND provider_message_id for cross-school isolation
                    $log = CommunicationLog::withoutGlobalScopes()
                        ->where('school_id', $school->id)
                        ->where('provider_message_id', $msgId)
                        ->first();

                    if (!$log) continue;

                    $currentWeight = $weights[$log->status] ?? 0;
                    $newStatus = match ($statusName) {
                        'delivered' => 'delivered',
                        'read' => 'delivered', // treat read as delivered confirmation
                        'failed' => 'failed',
                        default => null,
                    };

                    if (!$newStatus) continue;

                    $newWeight = $weights[$newStatus] ?? 0;

                    // Idempotent & Monotonic rule: Status must not move backward
                    // (delivered/read must never revert to sent or queued)
                    if ($newWeight > $currentWeight) {
                        $wasNotDelivered = !in_array($log->status, ['delivered', 'read']);

                        $log->update([
                            'status' => $newStatus,
                            'delivered_at' => ($newStatus === 'delivered' ? now() : $log->delivered_at),
                            'error_message' => ($newStatus === 'failed' ? ($st['errors'][0]['title'] ?? 'Delivery failed') : $log->error_message),
                        ]);

                        if ($newStatus === 'delivered' && $wasNotDelivered && $log->campaign_id) {
                            DB::table('communication_campaigns')
                                ->where('id', $log->campaign_id)
                                ->increment('delivered_count');
                        }
                    }
                }
            }
        }

        return response()->json(['success' => true]);
    }
}

