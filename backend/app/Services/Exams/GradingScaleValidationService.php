<?php

namespace App\Services\Exams;

use InvalidArgumentException;

class GradingScaleValidationService
{
    /**
     * Validate that tiers array forms a continuous, gapless range from 0.00 to 100.00 with no overlaps.
     *
     * @param array $tiers Array of ['grade' => '...', 'min_percentage' => ..., 'max_percentage' => ..., 'grade_point' => ...]
     * @return array Validated sorted tiers
     * @throws InvalidArgumentException
     */
    public static function validateContinuousTiers(array $tiers): array
    {
        if (empty($tiers)) {
            throw new InvalidArgumentException("Grading scale must contain at least one tier.");
        }

        // Sort tiers ascending by min_percentage
        usort($tiers, function ($a, $b) {
            return ((float)$a['min_percentage']) <=> ((float)$b['min_percentage']);
        });

        $count = count($tiers);
        $firstMin = round((float)$tiers[0]['min_percentage'], 2);
        if ($firstMin !== 0.00) {
            throw new InvalidArgumentException("Grading scale tiers must start at 0.00% (found {$firstMin}%).");
        }

        $lastMax = round((float)$tiers[$count - 1]['max_percentage'], 2);
        if ($lastMax !== 100.00) {
            throw new InvalidArgumentException("Grading scale tiers must end at 100.00% (found {$lastMax}%).");
        }

        for ($i = 0; $i < $count; $i++) {
            $min = round((float)$tiers[$i]['min_percentage'], 2);
            $max = round((float)$tiers[$i]['max_percentage'], 2);

            if ($min >= $max) {
                throw new InvalidArgumentException("Tier '{$tiers[$i]['grade']}' has min_percentage ({$min}%) greater than or equal to max_percentage ({$max}%).");
            }

            if ($i > 0) {
                $prevMax = round((float)$tiers[$i - 1]['max_percentage'], 2);
                if ($min < $prevMax) {
                    throw new InvalidArgumentException("Overlap detected between tiers '{$tiers[$i - 1]['grade']}' and '{$tiers[$i]['grade']}' at {$min}%.");
                }
                if ($min > $prevMax) {
                    throw new InvalidArgumentException("Gap detected between tiers '{$tiers[$i - 1]['grade']}' (ends at {$prevMax}%) and '{$tiers[$i]['grade']}' (starts at {$min}%).");
                }
            }
        }

        return $tiers;
    }

    /**
     * Compute grade and grade point for a given percentage against tiers.
     */
    public static function computeGradeForPercentage(float $percentage, $tiers): array
    {
        $pct = round($percentage, 2);

        foreach ($tiers as $tier) {
            $min = (float)($tier['min_percentage'] ?? $tier->min_percentage);
            $max = (float)($tier['max_percentage'] ?? $tier->max_percentage);

            // Handle upper bound boundary inclusion for the top tier (100.00)
            if ($pct >= $min && ($pct < $max || ($pct == 100.00 && $max == 100.00))) {
                return [
                    'grade' => $tier['grade'] ?? $tier->grade,
                    'grade_point' => (float)($tier['grade_point'] ?? $tier->grade_point),
                ];
            }
        }

        // Fallback to highest tier if 100%, or lowest tier if 0%
        if ($pct >= 100.00) {
            $top = is_array($tiers) ? end($tiers) : $tiers->sortByDesc('max_percentage')->first();
            return [
                'grade' => $top['grade'] ?? $top->grade,
                'grade_point' => (float)($top['grade_point'] ?? $top->grade_point),
            ];
        }

        $bottom = is_array($tiers) ? reset($tiers) : $tiers->sortBy('min_percentage')->first();
        return [
            'grade' => $bottom['grade'] ?? $bottom->grade,
            'grade_point' => (float)($bottom['grade_point'] ?? $bottom->grade_point),
        ];
    }
}
