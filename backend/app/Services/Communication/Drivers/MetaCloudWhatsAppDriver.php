<?php

namespace App\Services\Communication\Drivers;

use App\Models\SchoolSetting;
use App\Services\Communication\Contracts\WhatsAppProviderInterface;
use App\Services\Communication\DTO\ProviderSendResult;
use App\Services\Communication\SsrfProtection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

class MetaCloudWhatsAppDriver implements WhatsAppProviderInterface
{
    public function sendTemplate(string $to, string $templateName, string $language, array $parameters = [], int $schoolId = 0): ProviderSendResult
    {
        $config = $this->resolveConfig($schoolId);
        if (!$config['valid']) {
            return ProviderSendResult::failure($config['error']);
        }

        // WhatsApp to must not have + for Meta Cloud API (e.g. "919876543210")
        $recipientClean = ltrim($to, '+');

        $components = [];
        if (!empty($parameters)) {
            $components[] = [
                'type' => 'body',
                'parameters' => $parameters,
            ];
        }

        $payload = [
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => $recipientClean,
            'type' => 'template',
            'template' => [
                'name' => $templateName,
                'language' => [
                    'code' => $language ?: 'en_US',
                ],
                'components' => $components,
            ],
        ];

        return $this->executePost($config, $payload);
    }

    public function sendSessionText(string $to, string $message, int $schoolId = 0): ProviderSendResult
    {
        $config = $this->resolveConfig($schoolId);
        if (!$config['valid']) {
            return ProviderSendResult::failure($config['error']);
        }

        $recipientClean = ltrim($to, '+');

        $payload = [
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => $recipientClean,
            'type' => 'text',
            'text' => [
                'preview_url' => false,
                'body' => $message,
            ],
        ];

        return $this->executePost($config, $payload);
    }

    private function resolveConfig(int $schoolId): array
    {
        $token = SchoolSetting::getDecrypted('whatsapp_access_token', $schoolId, env('WHATSAPP_TOKEN'));
        $phoneId = SchoolSetting::getDecrypted('whatsapp_phone_number_id', $schoolId, env('WHATSAPP_PHONE_NUMBER_ID'));
        $apiVersion = SchoolSetting::getDecrypted('whatsapp_api_version', $schoolId, env('WHATSAPP_API_VERSION', 'v21.0'));

        if (empty($token) || empty($phoneId)) {
            return [
                'valid' => false,
                'error' => "WhatsApp Meta credentials (phone_number_id or access_token) not configured for School #{$schoolId}.",
            ];
        }

        return [
            'valid' => true,
            'token' => $token,
            'phone_id' => $phoneId,
            'version' => $apiVersion ?: 'v21.0',
        ];
    }

    private function executePost(array $config, array $payload): ProviderSendResult
    {
        $url = "https://graph.facebook.com/{$config['version']}/{$config['phone_id']}/messages";

        try {
            $response = Http::withToken($config['token'])
                ->withOptions(SsrfProtection::safeHttpOptions())
                ->post($url, $payload);

            if ($response->successful()) {
                $data = $response->json();
                $msgId = $data['messages'][0]['id'] ?? ('wamid_' . Str::random(20));
                return ProviderSendResult::success($msgId, $data);
            }

            $body = $response->json();
            $errMsg = $body['error']['message'] ?? $response->body();
            return ProviderSendResult::failure("Meta WhatsApp API Error (HTTP {$response->status()}): {$errMsg}", $body);
        } catch (Throwable $e) {
            return ProviderSendResult::failure("WhatsApp HTTP Dispatch Exception: " . $e->getMessage());
        }
    }
}

