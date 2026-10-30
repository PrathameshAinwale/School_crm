<?php

namespace App\Services\Communication\Drivers;

use App\Models\SchoolSetting;
use App\Services\Communication\Contracts\SmsProviderInterface;
use App\Services\Communication\DTO\ProviderSendResult;
use App\Services\Communication\SsrfProtection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

class GenericHttpSmsDriver implements SmsProviderInterface
{
    public function send(string $to, string $content, array $dltParams = [], int $schoolId = 0): ProviderSendResult
    {
        // 1. Resolve configuration (DB primary, .env fallback)
        $endpoint = SchoolSetting::getDecrypted('sms_endpoint_url', $schoolId, env('SMS_ENDPOINT_URL'));
        $apiKey = SchoolSetting::getDecrypted('sms_auth_token', $schoolId, env('SMS_AUTH_TOKEN'));
        $defaultHeader = SchoolSetting::getDecrypted('sms_sender_id', $schoolId, env('SMS_SENDER_ID', 'SCHOOL'));
        $entityId = SchoolSetting::getDecrypted('sms_dlt_principal_entity_id', $schoolId, env('SMS_DLT_PRINCIPAL_ENTITY_ID'));

        if (empty($endpoint) || empty($apiKey)) {
            return ProviderSendResult::failure("SMS provider credentials (endpoint or auth token) not configured for School #{$schoolId}.");
        }

        // 2. Validate SSRF Protection & Pin IP for DNS Rebinding Defense
        try {
            $pinned = SsrfProtection::validateAndPin($endpoint);
        } catch (Throwable $e) {
            return ProviderSendResult::failure("SSRF Protection Rejection: " . $e->getMessage());
        }

        $header = !empty($dltParams['dlt_header']) ? $dltParams['dlt_header'] : $defaultHeader;
        $dltTemplateId = $dltParams['dlt_template_id'] ?? null;

        // 3. Construct standard payload
        $payload = [
            'to' => $to,
            'message' => $content,
            'sender' => $header,
            'dlt_template_id' => $dltTemplateId,
            'dlt_principal_entity_id' => $entityId,
        ];

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])
            ->withOptions(SsrfProtection::safeHttpOptions($pinned['curl_options'] ?? []))
            ->post($endpoint, $payload);

            if ($response->successful()) {
                $data = $response->json() ?? [];
                // Extract common gateway message IDs (e.g. msg_id, message_id, id, request_id)
                $msgId = $data['message_id'] ?? $data['msg_id'] ?? $data['id'] ?? $data['request_id'] ?? ('sms_' . Str::random(16));
                return ProviderSendResult::success((string) $msgId, $data);
            }

            return ProviderSendResult::failure(
                "SMS Gateway Error (HTTP {$response->status()}): " . Str::limit($response->body(), 300),
                $response->json()
            );
        } catch (Throwable $e) {
            return ProviderSendResult::failure("SMS HTTP Dispatch Exception: " . $e->getMessage());
        }
    }
}

