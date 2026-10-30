<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;
use Throwable;

class SchoolSetting extends Model
{
    use HasFactory, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'group',
        'key',
        'value',
        'is_secret',
    ];

    protected $casts = [
        'is_secret' => 'boolean',
    ];

    /**
     * Helper to retrieve a setting value (auto-decrypted if secret) for a school with fallback.
     */
    public static function getDecrypted(string $key, ?int $schoolId = null, mixed $default = null): ?string
    {
        $targetId = $schoolId ?: \App\Services\SchoolContext::getActiveSchoolId();
        $setting = static::withoutGlobalScopes()
            ->when($targetId, fn($q) => $q->where('school_id', $targetId))
            ->where('key', $key)
            ->first();

        if ($setting) {
            $val = $setting->getDecryptedValue();
            if ($val !== null && $val !== '') {
                return (string) $val;
            }
        }

        return $default !== null ? (string) $default : null;
    }

    /**
     * Helper to set or update a setting value (auto-encrypted if secret) for a school.
     */
    public static function setEncrypted(string $key, ?string $value, ?int $schoolId = null, string $group = 'general', bool $isSecret = false): self
    {
        $targetId = $schoolId ?: \App\Services\SchoolContext::getActiveSchoolId() ?: 1;
        $setting = static::withoutGlobalScopes()->firstOrNew([
            'school_id' => $targetId,
            'key' => $key,
        ]);
        $setting->group = $group;
        $setting->is_secret = $isSecret;
        if ($isSecret) {
            $setting->setSecretValue($value);
        } else {
            $setting->value = $value;
        }
        $setting->save();
        return $setting;
    }

    /**
     * Get decrypted plain value if secret, or regular value.
     */
    public function getDecryptedValue(): ?string
    {
        if (!$this->is_secret || empty($this->value)) {
            return $this->value;
        }

        try {
            return Crypt::decryptString($this->value);
        } catch (Throwable $e) {
            return $this->value;
        }
    }

    /**
     * Set encrypted value if secret.
     */
    public function setSecretValue(?string $plain): void
    {
        if (empty($plain)) {
            $this->value = null;
        } else {
            $this->value = Crypt::encryptString($plain);
        }
        $this->is_secret = true;
    }

    /**
     * Masked representation for API output (e.g. ••••••••1234 or empty).
     */
    public function getMaskedValue(): string
    {
        if (!$this->is_secret) {
            return $this->value ?? '';
        }

        if (empty($this->value)) {
            return '';
        }

        $plain = $this->getDecryptedValue() ?? '';
        $len = strlen($plain);
        if ($len <= 4) {
            return str_repeat('•', 8);
        }

        $lastFour = substr($plain, -4);
        return str_repeat('•', min(8, $len - 4)) . $lastFour;
    }
}

