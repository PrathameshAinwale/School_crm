<?php

namespace App\Services\Communication\Contracts;

use App\Services\Communication\DTO\ProviderSendResult;

interface PushNotificationProviderInterface
{
    /**
     * Send a push notification to a device token.
     */
    public function send(string $deviceToken, string $title, string $body, array $data = [], int $schoolId = 0): ProviderSendResult;
}

