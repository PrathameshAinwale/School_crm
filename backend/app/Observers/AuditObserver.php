<?php

namespace App\Observers;

use App\Models\AuditLog;
use App\Models\SchoolSetting;
use App\Services\SchoolContext;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

class AuditObserver
{
    /**
     * Common sensitive attributes that must never be recorded in audit logs.
     */
    protected array $blacklistedAttributes = [
        'password',
        'remember_token',
        'token',
        'access_token',
        'secret',
        'api_key',
        'auth_token',
        'webhook_key',
        'card_number',
        'cvv',
        'pin',
        'client_secret',
        'private_key',
    ];

    public function created(Model $model): void
    {
        $this->recordLog($model, 'created', null, $this->sanitizeAttributes($model, $model->getAttributes()));
    }

    public function updated(Model $model): void
    {
        $rawOld = [];
        $rawNew = [];

        foreach ($model->getDirty() as $key => $newValue) {
            $rawOld[$key] = $model->getOriginal($key);
            $rawNew[$key] = $newValue;
        }

        if (empty($rawNew)) {
            return;
        }

        $this->recordLog(
            $model,
            'updated',
            $this->sanitizeAttributes($model, $rawOld),
            $this->sanitizeAttributes($model, $rawNew)
        );
    }

    public function deleted(Model $model): void
    {
        $this->recordLog($model, 'deleted', $this->sanitizeAttributes($model, $model->getAttributes()), null);
    }

    public function restored(Model $model): void
    {
        $this->recordLog($model, 'restored', null, $this->sanitizeAttributes($model, $model->getAttributes()));
    }

    /**
     * Record an audit log entry wrapped in try/catch to ensure main application safety.
     */
    protected function recordLog(Model $model, string $event, ?array $oldValues, ?array $newValues): void
    {
        try {
            // Do not audit AuditLog itself
            if ($model instanceof AuditLog) {
                return;
            }

            $user = Auth::user();
            $schoolId = $model->school_id ?? (SchoolContext::getActiveSchoolId() ?: $user?->school_id);

            // Special rule: if model is a SchoolSetting marked is_secret, mask values completely
            if ($model instanceof SchoolSetting && (bool)$model->is_secret) {
                if ($oldValues && isset($oldValues['value'])) {
                    $oldValues['value'] = '[ENCRYPTED_SECRET_CHANGED]';
                }
                if ($newValues && isset($newValues['value'])) {
                    $newValues['value'] = '[ENCRYPTED_SECRET_CHANGED]';
                }
            }

            $ipAddress = request()?->ip();
            $userAgent = request()?->userAgent();

            AuditLog::create([
                'school_id' => $schoolId ? (int)$schoolId : null,
                'user_id' => $user?->id,
                'user_name' => $user?->name ?? 'System',
                'user_role' => $user?->role ?? 'system',
                'auditable_type' => get_class($model),
                'auditable_id' => $model->getKey() ?: 0,
                'event' => $event,
                'old_values' => !empty($oldValues) ? $oldValues : null,
                'new_values' => !empty($newValues) ? $newValues : null,
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent ? substr($userAgent, 0, 500) : null,
                'created_at' => now(),
            ]);
        } catch (Throwable $e) {
            // Fail silently so observer error never interrupts critical database operations
            Log::warning("AuditObserver failed to record log for " . get_class($model) . ": " . $e->getMessage());
        }
    }

    /**
     * Sanitize values, stripping sensitive attributes and passwords.
     */
    protected function sanitizeAttributes(Model $model, array $attributes): array
    {
        $cleaned = [];
        $modelHidden = method_exists($model, 'getHidden') ? $model->getHidden() : [];

        foreach ($attributes as $key => $value) {
            $lowerKey = strtolower($key);

            // Check against blacklisted sensitive keys
            if (in_array($lowerKey, $this->blacklistedAttributes, true) || in_array($key, $modelHidden, true)) {
                $cleaned[$key] = '[REDACTED]';
                continue;
            }

            // Convert objects/dates to string representation
            if (is_object($value)) {
                $value = (string) $value;
            }

            $cleaned[$key] = $value;
        }

        return $cleaned;
    }
}

