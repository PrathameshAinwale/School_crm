<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\School;
use App\Models\SchoolSetting;
use App\Services\AcademicYearContext;
use App\Services\Communication\SsrfProtection;
use App\Services\SchoolContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Throwable;

class SchoolSettingsController extends Controller
{
    /**
     * List of integration keys that must always be encrypted and masked.
     */
    protected array $secretKeys = [
        'razorpay_key_secret',
        'razorpay_webhook_secret',
        'sms_api_key',
        'sms_auth_token',
        'sms_webhook_secret',
        'whatsapp_access_token',
        'whatsapp_app_secret',
        'whatsapp_verify_token',
        'smtp_password',
    ];

    /**
     * Default settings dictionary when unconfigured.
     */
    protected array $defaultSettings = [
        'general' => [
            'school_name' => '',
            'affiliation_no' => 'CBSE/AFF/2026/9981',
            'board' => 'CBSE',
            'phone' => '+91 98765 43210',
            'email' => 'admin@school.edu.in',
            'address' => 'Plot 42, Institutional Area, Knowledge Park',
            'website' => 'https://school.edu.in',
            'principal_name' => 'Dr. Rajeshwari Sharma',
        ],
        'branding' => [
            'logo_token' => '',
            'logo_url' => '',
            'favicon_token' => '',
            'theme_color' => '#1e3a8a',
        ],
        'financial_rules' => [
            'currency_symbol' => '₹',
            'fee_receipt_prefix' => 'REC',
            'fee_refund_prefix' => 'REF',
            'fee_late_fine_type' => 'daily',
            'fee_late_fine_rate' => 0,
            'fee_late_fine_grace_days' => 0,
            'fee_late_fine_max_cap' => 0,
            'fee_counter_notice' => 'Please pay your fee dues at the school fee counter.',
            'fee_auto_reminders_enabled' => false,
            'default_due_days' => 0,
        ],
        'grading' => [
            'grading_scale' => 'CBSE 9-Point Scale (A1 to E)',
            'pass_percentage' => 33,
            'enable_scholastic_grades' => true,
        ],
        'integrations' => [
            'payment_gateway' => 'razorpay',
            'razorpay_key_id' => '',
            'razorpay_key_secret' => '',
            'razorpay_webhook_secret' => '',
            'sms_provider' => 'generic_http',
            'sms_endpoint_url' => '',
            'sms_auth_token' => '',
            'sms_sender_id' => 'SCHOOL',
            'sms_dlt_principal_entity_id' => '',
            'sms_webhook_secret' => '',
            'whatsapp_provider' => 'meta_cloud',
            'whatsapp_phone_number_id' => '',
            'whatsapp_access_token' => '',
            'whatsapp_app_secret' => '',
            'whatsapp_verify_token' => '',
            'whatsapp_api_version' => 'v21.0',
            'communication_daily_limit' => 1000,
            'email_hourly_limit' => 100,
            'smtp_host' => '',
            'smtp_port' => 587,
            'smtp_username' => '',
            'smtp_password' => '',
            'smtp_encryption' => 'tls',
            'smtp_from_address' => '',
        ],
    ];

    /**
     * Get grouped settings for the active school branch (admin access).
     * Secrets are returned masked.
     */
    public function index(Request $request)
    {
        $schoolId = SchoolContext::getActiveSchoolId();
        $school = School::find($schoolId);

        $existingSettings = SchoolSetting::where('school_id', $schoolId)->get();

        $grouped = [];
        foreach ($this->defaultSettings as $grp => $defs) {
            $grouped[$grp] = $defs;
            // Set dynamic school name default from schools table if empty
            if ($grp === 'general' && empty($grouped[$grp]['school_name']) && $school) {
                $grouped[$grp]['school_name'] = $school->name;
            }
        }

        foreach ($existingSettings as $st) {
            $grp = $st->group;
            $key = $st->key;

            if ($st->is_secret) {
                $grouped[$grp][$key] = $st->getMaskedValue();
            } else {
                $decoded = json_decode($st->value, true);
                $grouped[$grp][$key] = (json_last_error() === JSON_ERROR_NONE && !is_numeric($st->value)) ? $decoded : $st->value;
            }
        }

        // Canonical aliasing for financial_rules
        if (isset($grouped['financial_rules'])) {
            $fr = &$grouped['financial_rules'];
            if (!empty($fr['receipt_prefix']) && empty($fr['fee_receipt_prefix'])) {
                $fr['fee_receipt_prefix'] = $fr['receipt_prefix'];
            }
            if (isset($fr['late_fee_per_day']) && (!isset($fr['fee_late_fine_rate']) || $fr['fee_late_fine_rate'] == 0)) {
                $fr['fee_late_fine_rate'] = $fr['late_fee_per_day'];
            }
            if (isset($fr['grace_period_days']) && (!isset($fr['fee_late_fine_grace_days']) || $fr['fee_late_fine_grace_days'] == 0)) {
                $fr['fee_late_fine_grace_days'] = $fr['grace_period_days'];
            }
        }

        // Global .env fallback for integration keys ONLY when the school has no saved DB value
        $envFallbacks = [
            'razorpay_key_id' => env('RAZORPAY_KEY_ID'),
            'razorpay_key_secret' => env('RAZORPAY_KEY_SECRET'),
            'razorpay_webhook_secret' => env('RAZORPAY_WEBHOOK_SECRET'),
            'sms_provider' => env('SMS_PROVIDER'),
            'sms_sender_id' => env('SMS_SENDER_ID'),
            'sms_api_key' => env('SMS_API_KEY'),
            'whatsapp_phone_id' => env('WHATSAPP_PHONE_NUMBER_ID'),
            'whatsapp_access_token' => env('WHATSAPP_ACCESS_TOKEN'),
        ];

        // Additional .env fallbacks for new communication keys
        $additionalFallbacks = [
            'sms_endpoint_url' => env('SMS_ENDPOINT_URL'),
            'sms_auth_token' => env('SMS_AUTH_TOKEN'),
            'sms_dlt_principal_entity_id' => env('SMS_DLT_PRINCIPAL_ENTITY_ID'),
            'sms_webhook_secret' => env('SMS_WEBHOOK_SECRET'),
            'whatsapp_phone_number_id' => env('WHATSAPP_PHONE_NUMBER_ID'),
            'whatsapp_app_secret' => env('WHATSAPP_APP_SECRET'),
            'whatsapp_verify_token' => env('WHATSAPP_VERIFY_TOKEN'),
            'whatsapp_api_version' => env('WHATSAPP_API_VERSION', 'v21.0'),
            'smtp_host' => env('MAIL_HOST'),
            'smtp_port' => env('MAIL_PORT'),
            'smtp_username' => env('MAIL_USERNAME'),
            'smtp_password' => env('MAIL_PASSWORD'),
            'smtp_encryption' => env('MAIL_ENCRYPTION'),
            'smtp_from_address' => env('MAIL_FROM_ADDRESS'),
        ];

        foreach (array_merge($envFallbacks, $additionalFallbacks) as $k => $envVal) {
            if (empty($grouped['integrations'][$k]) && !empty($envVal)) {
                if (in_array($k, $this->secretKeys, true)) {
                    $len = strlen($envVal);
                    $maskedEnv = $len <= 4 ? str_repeat('•', 8) : (str_repeat('•', min(8, $len - 4)) . substr($envVal, -4));
                    $grouped['integrations'][$k] = $maskedEnv;
                } else {
                    $grouped['integrations'][$k] = $envVal;
                }
            }
        }

        $webhookKey = $school?->webhook_key;
        $webhookInfo = [
            'webhook_key' => $webhookKey,
            'whatsapp_webhook_url' => $webhookKey ? url("/api/v1/webhooks/whatsapp/{$webhookKey}") : null,
            'sms_webhook_url' => $webhookKey ? url("/api/v1/webhooks/sms/{$webhookKey}") : null,
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'school_id' => $schoolId,
                'school_name' => $school?->name,
                'settings' => $grouped,
                'webhooks' => $webhookInfo,
            ],
        ]);
    }

    /**
     * Save or update settings for a specific group.
     * Preserves existing encrypted secrets if incoming value is masked or empty.
     */
    public function updateGroup(Request $request)
    {
        $schoolId = SchoolContext::getActiveSchoolId();

        $request->validate([
            'group' => 'required|string|in:general,branding,financial_rules,grading,integrations',
            'settings' => 'required|array',
        ]);

        $group = $request->group;
        $incomingSettings = $request->settings;

        DB::transaction(function () use ($schoolId, $group, $incomingSettings, $request) {
            foreach ($incomingSettings as $key => $val) {
                // SSRF & Role Protection on sms_endpoint_url
                if ($key === 'sms_endpoint_url' && !empty($val)) {
                    if ($request->user()?->role !== 'super_admin') {
                        // Restricted to super_admin or .env only
                        continue;
                    }
                    SsrfProtection::validateUrl((string)$val);
                }

                $isSecretKey = in_array($key, $this->secretKeys, true);

                $existing = SchoolSetting::where('school_id', $schoolId)
                    ->where('group', $group)
                    ->where('key', $key)
                    ->first();

                // If secret key and incoming value is masked (e.g. starts with "••••" or empty), PRESERVE existing
                if ($isSecretKey) {
                    $valStr = (string)$val;
                    if (str_contains($valStr, '••') || $valStr === '') {
                        if ($existing && !empty($existing->value)) {
                            // Keep existing encrypted secret
                            continue;
                        }
                    }

                    if (!empty($valStr) && !str_contains($valStr, '••')) {
                        // User provided a new secret: encrypt and save
                        $encrypted = Crypt::encryptString($valStr);
                        SchoolSetting::updateOrCreate(
                            ['school_id' => $schoolId, 'group' => $group, 'key' => $key],
                            ['value' => $encrypted, 'is_secret' => true]
                        );
                    }
                } else {
                    $storedVal = is_array($val) ? json_encode($val) : (is_bool($val) ? ($val ? '1' : '0') : (string)$val);
                    SchoolSetting::updateOrCreate(
                        ['school_id' => $schoolId, 'group' => $group, 'key' => $key],
                        ['value' => $storedVal, 'is_secret' => false]
                    );

                    // Bi-directional sync for legacy aliases under financial_rules
                    if ($group === 'financial_rules') {
                        if ($key === 'fee_receipt_prefix') {
                            SchoolSetting::updateOrCreate(
                                ['school_id' => $schoolId, 'group' => $group, 'key' => 'receipt_prefix'],
                                ['value' => $storedVal, 'is_secret' => false]
                            );
                        } elseif ($key === 'receipt_prefix') {
                            SchoolSetting::updateOrCreate(
                                ['school_id' => $schoolId, 'group' => $group, 'key' => 'fee_receipt_prefix'],
                                ['value' => $storedVal, 'is_secret' => false]
                            );
                        } elseif ($key === 'fee_late_fine_rate') {
                            SchoolSetting::updateOrCreate(
                                ['school_id' => $schoolId, 'group' => $group, 'key' => 'late_fee_per_day'],
                                ['value' => $storedVal, 'is_secret' => false]
                            );
                        } elseif ($key === 'late_fee_per_day') {
                            SchoolSetting::updateOrCreate(
                                ['school_id' => $schoolId, 'group' => $group, 'key' => 'fee_late_fine_rate'],
                                ['value' => $storedVal, 'is_secret' => false]
                            );
                        } elseif ($key === 'fee_late_fine_grace_days') {
                            SchoolSetting::updateOrCreate(
                                ['school_id' => $schoolId, 'group' => $group, 'key' => 'grace_period_days'],
                                ['value' => $storedVal, 'is_secret' => false]
                            );
                        } elseif ($key === 'grace_period_days') {
                            SchoolSetting::updateOrCreate(
                                ['school_id' => $schoolId, 'group' => $group, 'key' => 'fee_late_fine_grace_days'],
                                ['value' => $storedVal, 'is_secret' => false]
                            );
                        }
                    }
                }
            }
        });

        return response()->json([
            'success' => true,
            'message' => "Settings for group '{$group}' saved successfully.",
        ]);
    }

    /**
     * Publicly safe configuration endpoint (non-sensitive values only).
     * Exposes: school name, logo URL, currency, current academic year.
     */
    public function publicConfig(Request $request)
    {
        $schoolId = SchoolContext::getActiveSchoolId();
        if (!$schoolId) {
            $requestedHeader = $request->header('X-School-Id');
            if ($requestedHeader && is_numeric($requestedHeader)) {
                $schoolId = (int)$requestedHeader;
            } else {
                $firstSchool = School::first();
                $schoolId = $firstSchool?->id;
            }
        }

        $school = School::find($schoolId);

        // Fetch public general and branding settings
        $settings = SchoolSetting::where('school_id', $schoolId)
            ->whereIn('group', ['general', 'branding', 'financial_rules'])
            ->where('is_secret', false)
            ->get()
            ->keyBy('key');

        $currentYear = AcademicYear::withoutGlobalScopes()
            ->where('school_id', $schoolId)
            ->where('is_current', true)
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'school_id' => $schoolId,
                'school_name' => $settings->get('school_name')?->value ?: ($school?->name ?: 'Arch Campus'),
                'logo_url' => $settings->get('logo_url')?->value ?: null,
                'logo_token' => $settings->get('logo_token')?->value ?: null,
                'currency_symbol' => $settings->get('currency_symbol')?->value ?: '₹',
                'current_academic_year' => $currentYear ? [
                    'id' => $currentYear->id,
                    'name' => $currentYear->name,
                    'code' => $currentYear->code,
                    'start_date' => $currentYear->start_date?->toDateString(),
                    'end_date' => $currentYear->end_date?->toDateString(),
                ] : [
                    'id' => null,
                    'name' => '2026-2027',
                    'code' => 'AY-2026-27',
                    'start_date' => '2026-04-01',
                    'end_date' => '2027-03-31',
                ],
            ],
        ]);
    }

    /**
     * Regenerate inbound webhook key (invalidates previous webhook URL).
     */
    public function regenerateWebhookKey(Request $request)
    {
        $user = $request->user();
        $schoolId = SchoolContext::getActiveSchoolId() ?: $user->school_id;

        // Admin of School A cannot rotate School B's webhook key (super_admin only for cross-branch)
        if ($user->role !== 'super_admin' && (int)$schoolId !== (int)$user->school_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: You cannot regenerate webhook credentials for another school.',
            ], 403);
        }

        $school = School::findOrFail($schoolId);

        $newKey = bin2hex(random_bytes(24));
        $school->update(['webhook_key' => $newKey]);

        $baseUrl = url('/api/v1/webhooks');

        return response()->json([
            'success' => true,
            'message' => 'Inbound webhook URLs regenerated successfully. Previous webhook URLs are now invalidated.',
            'data' => [
                'webhook_key' => $newKey,
                'whatsapp_webhook_url' => "{$baseUrl}/whatsapp/{$newKey}",
                'sms_webhook_url' => "{$baseUrl}/sms/{$newKey}",
            ],
        ]);
    }
}

