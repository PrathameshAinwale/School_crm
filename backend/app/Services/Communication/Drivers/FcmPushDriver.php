<?php

namespace App\Services\Communication\Drivers;

use App\Services\Communication\Contracts\PushNotificationProviderInterface;
use App\Services\Communication\DTO\ProviderSendResult;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class FcmPushDriver implements PushNotificationProviderInterface
{
    public function send(string $deviceToken, string $title, string $body, array $data = [], int $schoolId = 0): ProviderSendResult
    {
        // FCM interface is stubbed in this batch as requested
        $mockMessageId = 'fcm_' . Str::random(24);

        Log::info("Stubbed FCM Push Notification Dispatched", [
            'school_id' => $schoolId,
            'token_preview' => Str::limit($deviceToken, 15),
            'title' => $title,
            'message_id' => $mockMessageId,
        ]);

        return ProviderSendResult::success($mockMessageId, [
            'stubbed' => true,
            'dispatched_at' => now()->toIso8601String(),
        ]);
    }
}

