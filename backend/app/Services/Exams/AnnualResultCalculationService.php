<?php

namespace App\Services\Exams;

use App\Models\ExamTerm;
use App\Models\Student;
use App\Models\StudentReportSummary;
use InvalidArgumentException;

class AnnualResultCalculationService
{
    public static function validatePaperBearingTermsWeightage(int $schoolId, int $academicYearId): bool
    {
        $terms = ExamTerm::where('school_id', $schoolId)
            ->where('academic_year_id', $academicYearId)
            ->whereHas('exams')
            ->get();

        if ($terms->isEmpty()) {
            return false;
        }

        $weightageSum = round((float) $terms->sum('weightage_percentage'), 2);
        return $weightageSum === 100.00;
    }

    /**
     * Aggregate published terms to compute the annual result summary for a class or student.
     *
     * Rule: Counts only terms that have at least one exam paper.
     * The sum of weightages of these terms must equal exactly 100.00%.
     *
     * @param int $schoolId
     * @param int $academicYearId
     * @param int $schoolClassId
     * @return int Number of annual summaries generated
     * @throws InvalidArgumentException
     */
    public static function computeAnnualSummaries(int $schoolId, int $academicYearId, int $schoolClassId): int
    {
        // 1. Fetch terms that have at least one scheduled exam paper
        $terms = ExamTerm::where('school_id', $schoolId)
            ->where('academic_year_id', $academicYearId)
            ->whereHas('exams')
            ->get();

        if ($terms->isEmpty()) {
            throw new InvalidArgumentException("No terms with exam papers found for this academic year.");
        }

        // 2. Validate that the weightages of paper-bearing terms sum to exactly 100.00%
        $weightageSum = round((float) $terms->sum('weightage_percentage'), 2);
        if ($weightageSum !== 100.00) {
            throw new InvalidArgumentException(
                "Cannot compute annual summary: active terms with exam papers have weightages summing to {$weightageSum}%, expected exactly 100.00%."
            );
        }

        // 3. Collect active students in the class
        $students = Student::where('school_id', $schoolId)
            ->where('school_class_id', $schoolClassId)
            ->where('status', 'Active')
            ->get();

        $annualList = [];

        foreach ($students as $student) {
            $weightedPercentageSum = 0.00;
            $totalMaxAllTerms = 0.00;
            $totalObtainedAllTerms = 0.00;
            $hasPendingTerm = false;
            $hasFailedTerm = false;

            foreach ($terms as $term) {
                $termSummary = StudentReportSummary::where('school_id', $schoolId)
                    ->where('academic_year_id', $academicYearId)
                    ->where('summary_type', 'term')
                    ->where('term_scope_id', $term->id)
                    ->where('student_id', $student->id)
                    ->first();

                if (!$termSummary || $termSummary->result_status === 'RESULT_PENDING') {
                    $hasPendingTerm = true;
                    continue;
                }

                if ($termSummary->result_status === 'FAILED') {
                    $hasFailedTerm = true;
                }

                $termPct = (float) $termSummary->percentage;
                $weight = (float) $term->weightage_percentage;
                $weightedPercentageSum += round(($termPct * $weight) / 100.00, 2);

                $totalMaxAllTerms += (float) $termSummary->total_max_marks;
                $totalObtainedAllTerms += (float) $termSummary->total_obtained_marks;
            }

            $finalAnnualPercentage = round($weightedPercentageSum, 2);

            if ($hasPendingTerm) {
                $resultStatus = 'RESULT_PENDING';
            } elseif ($hasFailedTerm) {
                $resultStatus = 'FAILED';
            } else {
                $resultStatus = 'PASSED';
            }

            // Fallback grading scale from the final term
            $finalTerm = $terms->last();
            $tiers = $finalTerm->grading_scale_snapshot ?? ($finalTerm->gradingScale ? $finalTerm->gradingScale->tiers->toArray() : []);
            $evaluated = GradingScaleValidationService::computeGradeForPercentage($finalAnnualPercentage, $tiers);

            $annualList[] = [
                'student_id' => $student->id,
                'section_id' => $student->section_id,
                'total_max_marks' => $totalMaxAllTerms,
                'total_obtained_marks' => $totalObtainedAllTerms,
                'percentage' => $finalAnnualPercentage,
                'overall_grade' => $evaluated['grade'],
                'overall_gpa' => $evaluated['grade_point'],
                'result_status' => $resultStatus,
                'is_eligible_for_rank' => ($resultStatus !== 'RESULT_PENDING'),
            ];
        }

        // 4. Calculate Annual Class Competition Rank (1, 2, 2, 4)
        $rankedClassList = collect($annualList)
            ->filter(fn($a) => $a['is_eligible_for_rank'])
            ->sortByDesc('percentage')
            ->values();

        $classRankMap = [];
        $classCount = $rankedClassList->count();
        for ($i = 0; $i < $classCount; $i++) {
            if ($i > 0 && $rankedClassList[$i]['percentage'] === $rankedClassList[$i - 1]['percentage']) {
                $classRankMap[$rankedClassList[$i]['student_id']] = $classRankMap[$rankedClassList[$i - 1]['student_id']];
            } else {
                $classRankMap[$rankedClassList[$i]['student_id']] = $i + 1;
            }
        }

        // 5. Calculate Annual Section Competition Rank
        $sectionGroups = collect($annualList)->groupBy('section_id');
        $sectionRankMap = [];
        foreach ($sectionGroups as $secId => $secList) {
            $rankedSecList = $secList->filter(fn($a) => $a['is_eligible_for_rank'])->sortByDesc('percentage')->values();
            $secCount = $rankedSecList->count();
            for ($j = 0; $j < $secCount; $j++) {
                if ($j > 0 && $rankedSecList[$j]['percentage'] === $rankedSecList[$j - 1]['percentage']) {
                    $sectionRankMap[$rankedSecList[$j]['student_id']] = $sectionRankMap[$rankedSecList[$j - 1]['student_id']];
                } else {
                    $sectionRankMap[$rankedSecList[$j]['student_id']] = $j + 1;
                }
            }
        }

        // 6. Upsert Annual Summaries
        $countSaved = 0;
        foreach ($annualList as $item) {
            $studentId = $item['student_id'];
            StudentReportSummary::updateOrCreate(
                [
                    'school_id' => $schoolId,
                    'academic_year_id' => $academicYearId,
                    'student_id' => $studentId,
                    'summary_type' => 'annual',
                    'term_scope_id' => 0, // Deterministic non-null key for annual
                ],
                [
                    'exam_term_id' => null,
                    'school_class_id' => $schoolClassId,
                    'section_id' => $item['section_id'],
                    'total_max_marks' => $item['total_max_marks'],
                    'total_obtained_marks' => $item['total_obtained_marks'],
                    'percentage' => $item['percentage'],
                    'overall_grade' => $item['overall_grade'],
                    'overall_gpa' => $item['overall_gpa'],
                    'class_rank' => $classRankMap[$studentId] ?? null,
                    'section_rank' => $sectionRankMap[$studentId] ?? null,
                    'result_status' => $item['result_status'],
                    'published_at' => now(),
                ]
            );
            $countSaved++;
        }

        return $countSaved;
    }
}
