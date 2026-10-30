<?php

namespace App\Services\Communication\DTO;

class ProviderSendResult
{
    public function __construct(
        public bool $success,
        public ?string $providerMessageId = null,
        public ?string $errorMessage = null,
        public ?array $rawResponse = null
    ) {}

    public static function success(string $providerMessageId, ?array $rawResponse = null): self
    {
        return new self(
            success: true,
            providerMessageId: $providerMessageId,
            errorMessage: null,
            rawResponse: $rawResponse
        );
    }

    public static function failure(string $errorMessage, ?array $rawResponse = null): self
    {
        return new self(
            success: false,
            providerMessageId: null,
            errorMessage: $errorMessage,
            rawResponse: $rawResponse
        );
    }
}

