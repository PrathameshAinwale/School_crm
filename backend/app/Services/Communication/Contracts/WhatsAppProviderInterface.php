<?php

namespace App\Services\Communication\Contracts;

use App\Services\Communication\DTO\ProviderSendResult;

interface WhatsAppProviderInterface
{
    /**
     * Send a template-based message via Meta WhatsApp Cloud API.
     */
    public function sendTemplate(string $to, string $templateName, string $language, array $parameters = [], int $schoolId = 0): ProviderSendResult;

    /**
     * Send an arbitrary session text message within the 24-hr customer service window.
     */
    public function sendSessionText(string $to, string $message, int $schoolId = 0): ProviderSendResult;
}

