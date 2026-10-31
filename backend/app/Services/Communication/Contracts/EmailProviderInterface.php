<?php

namespace App\Services\Communication\Contracts;

use App\Services\Communication\DTO\ProviderSendResult;

interface EmailProviderInterface
{
    /**
     * Send an email message.
     */
    public function send(string $to, string $subject, string $htmlBody, array $attachments = [], int $schoolId = 0): ProviderSendResult;
}

