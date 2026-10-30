<?php

namespace App\Services\Communication;

use Carbon\Carbon;
use Throwable;

class TemplateCompiler
{
    /**
     * Canonical Batch 1 & 2 template placeholders.
     */
    public const SUPPORTED_PLACEHOLDERS = [
        '{student_name}',
        '{guardian_name}',
        '{class}',
        '{fee_due}',
        '{due_date}',
        '{days_overdue}',
        '{school_name}',
        '{receipt_number}',
    ];

    /**
     * Compile message content replacing {var} placeholders with context values.
     * Keeps canonical Batch 1 names ({guardian_name}, {class}, {fee_due}),
     * adds {days_overdue}, and safely aliases legacy names ({parent_name}, {class_name}, {amount_due}).
     */
    public static function compile(string $content, array $variables = []): string
    {
        if (empty($content)) {
            return '';
        }

        // Auto-calculate days_overdue if not provided but due_date is present
        if (!isset($variables['days_overdue']) && isset($variables['due_date'])) {
            try {
                $due = Carbon::parse($variables['due_date'])->startOfDay();
                $today = Carbon::today()->startOfDay();
                $variables['days_overdue'] = $due->isPast() ? (int) $due->diffInDays($today) : 0;
            } catch (Throwable $e) {
                $variables['days_overdue'] = 0;
            }
        }

        // Bi-directional aliasing to guarantee 100% backward compatibility
        if (isset($variables['guardian_name']) && !isset($variables['parent_name'])) {
            $variables['parent_name'] = $variables['guardian_name'];
        } elseif (isset($variables['parent_name']) && !isset($variables['guardian_name'])) {
            $variables['guardian_name'] = $variables['parent_name'];
        }

        if (isset($variables['class']) && !isset($variables['class_name'])) {
            $variables['class_name'] = $variables['class'];
        } elseif (isset($variables['class_name']) && !isset($variables['class'])) {
            $variables['class'] = $variables['class_name'];
        }

        if (isset($variables['fee_due']) && !isset($variables['amount_due'])) {
            $variables['amount_due'] = $variables['fee_due'];
        } elseif (isset($variables['amount_due']) && !isset($variables['fee_due'])) {
            $variables['fee_due'] = $variables['amount_due'];
        }

        $replacements = [];
        foreach ($variables as $key => $value) {
            $cleanKey = trim($key, '{}');
            $val = is_scalar($value) ? (string) $value : '';
            $replacements['{' . $cleanKey . '}'] = $val;
        }

        return strtr($content, $replacements);
    }

    /**
     * Map ordered parameters for Meta WhatsApp Cloud API based on positional mapping.
     */
    public static function buildMetaParameters(?array $metaMapping, array $contextData): array
    {
        if (empty($metaMapping)) {
            return [];
        }

        $parameters = [];
        foreach ($metaMapping as $varName) {
            $cleanKey = trim($varName, '{}');
            // Resolve through aliases if needed
            $val = $contextData[$cleanKey] ?? match($cleanKey) {
                'guardian_name' => $contextData['parent_name'] ?? '',
                'parent_name' => $contextData['guardian_name'] ?? '',
                'class' => $contextData['class_name'] ?? '',
                'class_name' => $contextData['class'] ?? '',
                'fee_due' => $contextData['amount_due'] ?? '',
                'amount_due' => $contextData['fee_due'] ?? '',
                default => '',
            };

            $parameters[] = [
                'type' => 'text',
                'text' => (string) $val,
            ];
        }

        return $parameters;
    }
}
