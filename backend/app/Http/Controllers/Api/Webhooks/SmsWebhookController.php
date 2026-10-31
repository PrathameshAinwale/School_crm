<?php

namespace App\Http\Controllers\Api\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\CommunicationLog;
use App\Models\School;
use App\Models\SchoolSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SmsWebhookController extends Controller
{
    /**
     * Generic SMS Delivery Receipt (DLR) Webhook.
     */
    public function handle(Request $request, string $webhookKey)
    {
        $school = School::where('webhook_key', $webhookKey)->first();
        if (!$school) {
            return response()->json(['error' => 'Invalid webhook key'], 404);
        }

        $expectedSecret = SchoolSetting::getDecrypted('sms_webhook_secret', $school->id, env('SMS_WEBHOOK_SECRET'));
        if (!empty($expectedSecret)) {
            $headerSecret = $request->header('X-SMS-Secret') ?: $request->query('secret');
            if (empty($headerSecret) || !hash_equals($expectedSecret, $headerSecret)) {
                return response()->json(['error' => 'Unauthorized callback secret'], 401);
            }
        }

        $msgId = $request->input('message_id') ?? $request->input('msg_id') ?? $request->input('id');
        $rawStatus = strtoupper($request->input('status') ?? '');

        if (!$msgId) {
            return response()->json(['error' => 'Missing message_id'], 422);
        }

        // Match strictly by school_id AND provider_message_id for cross-school isolation
        $log = CommunicationLog::withoutGlobalScopes()
            ->where('school_id', $school->id)
            ->where('provider_message_id', $msgId)
            ->first();

        if (!$log) {
            return response()->json(['message' => 'No matching log found'], 200);
        }

        $newStatus = match ($rawStatus) {
            'DELIVRD', 'DELIVERED', 'SUCCESS' => 'delivered',
            'FAILED', 'UNDELIV', 'REJECTED' => 'failed',
            default => null,
        };

        if ($newStatus === 'delivered' && $log->status !== 'delivered') {
            $log->update([
                'status' => 'delivered',
                'delivered_at' => now(),
            ]);

            if ($log->campaign_id) {
                DB::table('communication_campaigns')
                    ->where('id', $log->campaign_id)
                    ->increment('delivered_count');
            }
        } elseif ($newStatus === 'failed' && $log->status !== 'delivered') {
            $log->update([
                'status' => 'failed',
                'error_message' => $request->input('error') ?? 'SMS delivery failed',
            ]);
        }

        return response()->json(['success' => true]);
    }
}

