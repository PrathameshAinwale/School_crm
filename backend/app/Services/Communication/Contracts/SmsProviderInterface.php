<?php

namespace App\Services\Communication\Contracts;

use App\Services\Communication\DTO\ProviderSendResult;

interface SmsProviderInterface
{
    /**
     * Send an outbound SMS to an E.164 phone number.
     */
    public function send(string $to, string $content, array $dltParams = [], int $schoolId = 0): ProviderSendResult;
}

