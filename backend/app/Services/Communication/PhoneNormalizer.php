<?php

namespace App\Services\Communication;

class PhoneNormalizer
{
    /**
     * Normalize a phone number to standard E.164 (+91...).
     * Returns null if the number is unparseable or invalid.
     */
    public static function normalize(?string $phone): ?string
    {
        if (!$phone) {
            return null;
        }

        // Strip non-digits except leading +
        $cleaned = trim($phone);
        $hasPlus = str_starts_with($cleaned, '+');
        $digits = preg_replace('/\D/', '', $cleaned);

        if (empty($digits)) {
            return null;
        }

        // If had a leading plus
        if ($hasPlus) {
            // E.164 must be between 8 and 15 digits
            if (strlen($digits) >= 8 && strlen($digits) <= 15) {
                return '+' . $digits;
            }
            return null;
        }

        // Handle Indian phone formats
        // 10 digits (e.g. 9876543210)
        if (strlen($digits) === 10) {
            return '+91' . $digits;
        }

        // 11 digits starting with 0 (e.g. 09876543210)
        if (strlen($digits) === 11 && str_starts_with($digits, '0')) {
            return '+91' . substr($digits, 1);
        }

        // 12 digits starting with 91 (e.g. 919876543210)
        if (strlen($digits) === 12 && str_starts_with($digits, '91')) {
            return '+' . $digits;
        }

        // International without + if length looks valid (11 to 15 digits)
        if (strlen($digits) >= 11 && strlen($digits) <= 15) {
            return '+' . $digits;
        }

        return null;
    }
}

