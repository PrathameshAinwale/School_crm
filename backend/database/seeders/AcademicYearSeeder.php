<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Admission;
use App\Models\FeeStructure;
use App\Models\School;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AcademicYearSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Supports dry-run mode via env DRY_RUN=true or passing --dry-run.
     */
    public function run(bool $dryRun = false): void
    {
        $isDryRun = $dryRun || (getenv('DRY_RUN') === 'true') || in_array('--dry-run', $_SERVER['argv'] ?? []);
        $today = Carbon::parse('2026-10-27'); // reference date or Carbon::now()

        $schools = School::all();
        if ($schools->isEmpty()) {
            $this->command?->warn("No schools found in database.");
            return;
        }

        // 1. Gather distinct academic year strings from admissions and fee_structures
        $rawAdmissionYears = Admission::withoutGlobalScopes()
            ->whereNotNull('academic_year')
            ->distinct()
            ->pluck('academic_year')
            ->toArray();

        $rawFeeYears = FeeStructure::withoutGlobalScopes()
            ->whereNotNull('academic_year')
            ->distinct()
            ->pluck('academic_year')
            ->toArray();

        $allRawYears = array_unique(array_merge($rawAdmissionYears, $rawFeeYears, ['2026-2027']));

        // 2. Normalize to standard 4-digit format: "2026-2027"
        $normalizedYears = [];
        foreach ($allRawYears as $raw) {
            $raw = trim($raw);
            if (empty($raw)) continue;

            $normalized = $this->normalizeYearString($raw);
            if ($normalized) {
                $normalizedYears[$normalized['name']] = $normalized;
            }
        }

        // Ensure current year (2026-2027) is always present
        if (!isset($normalizedYears['2026-2027'])) {
            $normalizedYears['2026-2027'] = [
                'name' => '2026-2027',
                'code' => 'AY-2026-27',
                'start_year' => 2026,
                'end_year' => 2027,
            ];
        }

        // Sort by start year ascending
        uasort($normalizedYears, fn ($a, $b) => $a['start_year'] <=> $b['start_year']);

        $summary = [];

        foreach ($schools as $school) {
            foreach ($normalizedYears as $yearInfo) {
                $startDate = Carbon::create($yearInfo['start_year'], 4, 1)->toDateString(); // April 1
                $endDate = Carbon::create($yearInfo['end_year'], 3, 31)->toDateString();    // March 31

                $isCurrent = ($today->betweenIncluded($startDate, $endDate));
                $status = $isCurrent ? 'active' : ($today->gt($endDate) ? 'closed' : 'upcoming');

                $summary[] = [
                    'school_id' => $school->id,
                    'school_name' => $school->name,
                    'name' => $yearInfo['name'],
                    'code' => $yearInfo['code'],
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'is_current' => $isCurrent ? 'YES' : 'No',
                    'status' => $status,
                ];

                if (!$isDryRun) {
                    AcademicYear::withoutGlobalScopes()->updateOrCreate(
                        [
                            'school_id' => $school->id,
                            'name' => $yearInfo['name'],
                        ],
                        [
                            'code' => $yearInfo['code'],
                            'start_date' => $startDate,
                            'end_date' => $endDate,
                            'is_current' => $isCurrent,
                            'status' => $status,
                            'description' => "Academic session {$yearInfo['name']} ({$startDate} to {$endDate})",
                        ]
                    );
                }
            }
        }

        if ($this->command) {
            $this->command->info($isDryRun ? "=== DRY-RUN SUMMARY (No records written) ===" : "=== ACADEMIC YEARS SEEDED SUCCESSFULLY ===");
            $this->command->table(
                ['School ID', 'School Name', 'Session', 'Code', 'Start Date', 'End Date', 'Is Current', 'Status'],
                $summary
            );
        } else {
            echo ($isDryRun ? "=== DRY-RUN SUMMARY ===\n" : "=== SEEDED ===\n");
            print_r($summary);
        }
    }

    private function normalizeYearString(string $year): ?array
    {
        // Matches "2026-2027" or "2026-27"
        if (preg_match('/^(\d{4})[-_\/](\d{2,4})$/', $year, $m)) {
            $start = (int) $m[1];
            $endRaw = (int) $m[2];
            $end = ($endRaw < 100) ? (int)(substr((string)$start, 0, 2) . str_pad($endRaw, 2, '0', STR_PAD_LEFT)) : $endRaw;
            $code = 'AY-' . $start . '-' . substr((string)$end, -2);
            return [
                'name' => "{$start}-{$end}",
                'code' => $code,
                'start_year' => $start,
                'end_year' => $end,
            ];
        }
        return null;
    }
}

