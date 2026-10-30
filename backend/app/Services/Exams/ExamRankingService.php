<?php

namespace App\Services\Exams;

use App\Models\Exam;
use App\Models\ExamMark;
use App\Models\ExamTerm;
use App\Models\Student;
use App\Models\StudentReportSummary;
use App\Models\StudentSubjectEnrollment;
use Illuminate\Support\Facades\DB;

class ExamRankingService
{
    /**
     * Compute and store student report summaries, grades, and competition ranks for an exam term.
     *
     * @param ExamTerm $term
     * @return int Number of student summaries generated/updated
     */
    public static function computeTermSummariesAndRanks(ExamTerm $term): int
    {
        $schoolId = $term->school_id;
        $academicYearId = $term->academic_year_id;
        $scaleTiers = $term->grading_scale_snapshot ?? ($term->gradingScale ? $term->gradingScale->tiers->toArray() : []);

        // Group exams by class and section
        $exams = Exam::where('exam_term_id', $term->id)->get();
        $classIds = $exams->pluck('school_class_id')->unique()->values();

        $totalSummariesCount = 0;

        foreach ($classIds as $classId) {
            // Find all students in this class
            $students = Student::where('school_id', $schoolId)
                ->where('school_class_id', $classId)
                ->where('status', 'Active')
                ->get();

            $classPerformanceList = [];

            foreach ($students as $student) {
                // Fetch all elective enrollments for this student in this academic year
                $optionalSubjectIds = StudentSubjectEnrollment::where('academic_year_id', $academicYearId)
                    ->where('student_id', $student->id)
                    ->pluck('subject_id')
                    ->toArray();

                // Relevant exams for this student's class and section
                $studentExams = $exams->where('school_class_id', $classId)
                    ->where('section_id', $student->section_id)
                    ->filter(function ($ex) use ($optionalSubjectIds) {
                        // If subject is optional, student must be enrolled
                        $isOptional = (strtolower($ex->subject?->type ?? '') === 'optional');
                        if ($isOptional) {
                            return in_array($ex->subject_id, $optionalSubjectIds);
                        }
                        return true;
                    });

                if ($studentExams->isEmpty()) {
                    continue;
                }

                $totalMaxMarks = 0.00;
                $totalObtainedMarks = 0.00;
                $hasAbsent = false;
                $hasFail = false;
                $allExemptOrMedical = true;

                foreach ($studentExams as $exam) {
                    $mark = ExamMark::where('exam_id', $exam->id)
                        ->where('student_id', $student->id)
                        ->first();

                    if (!$mark) {
                        $hasAbsent = true;
                        continue;
                    }

                    $specialStatus = strtoupper($mark->special_status ?? '');

                    if ($specialStatus === 'AB') {
                        $hasAbsent = true;
                        $mark->is_passed = false;
                        $mark->save();
                        continue;
                    }

                    if ($specialStatus === 'ML' || $specialStatus === 'EX') {
                        // Excluded from denominator, not counted as failure
                        $mark->is_passed = null;
                        $mark->save();
                        continue;
                    }

                    // Numeric marks present
                    $allExemptOrMedical = false;
                    $obtained = (float)$mark->marks_obtained;
                    $max = (float)$exam->max_marks;
                    $pass = (float)$exam->pass_marks;

                    $totalMaxMarks += $max;
                    $totalObtainedMarks += $obtained;

                    $paperPassed = ($obtained >= $pass);
                    if (!$paperPassed) {
                        $hasFail = true;
                    }

                    // Freeze grade on mark record
                    $pct = $max > 0 ? round(($obtained / $max) * 100, 2) : 0.00;
                    $evaluated = GradingScaleValidationService::computeGradeForPercentage($pct, $scaleTiers);

                    $mark->is_passed = $paperPassed;
                    $mark->grade = $evaluated['grade'];
                    $mark->grade_point = $evaluated['grade_point'];
                    $mark->save();
                }

                $pctOverall = $totalMaxMarks > 0 ? round(($totalObtainedMarks / $totalMaxMarks) * 100, 2) : 0.00;
                $evaluatedOverall = GradingScaleValidationService::computeGradeForPercentage($pctOverall, $scaleTiers);

                if ($hasAbsent) {
                    $resultStatus = 'RESULT_PENDING';
                } elseif ($hasFail) {
                    $resultStatus = 'FAILED';
                } else {
                    $resultStatus = 'PASSED';
                }

                $classPerformanceList[] = [
                    'student_id' => $student->id,
                    'section_id' => $student->section_id,
                    'total_max_marks' => $totalMaxMarks,
                    'total_obtained_marks' => $totalObtainedMarks,
                    'percentage' => $pctOverall,
                    'overall_grade' => $evaluatedOverall['grade'],
                    'overall_gpa' => $evaluatedOverall['grade_point'],
                    'result_status' => $resultStatus,
                    'is_eligible_for_rank' => ($resultStatus !== 'RESULT_PENDING' && !$allExemptOrMedical),
                ];
            }

            // 1. Calculate Class Rank using standard competition ranking (1, 2, 2, 4)
            $classRankedList = collect($classPerformanceList)
                ->filter(fn($p) => $p['is_eligible_for_rank'])
                ->sortByDesc('percentage')
                ->values();

            $classRankMap = [];
            $currentRank = 1;
            $itemsCount = $classRankedList->count();

            for ($i = 0; $i < $itemsCount; $i++) {
                if ($i > 0 && $classRankedList[$i]['percentage'] === $classRankedList[$i - 1]['percentage']) {
                    // Tie: receive same rank as previous
                    $classRankMap[$classRankedList[$i]['student_id']] = $classRankMap[$classRankedList[$i - 1]['student_id']];
                } else {
                    // Competition rank: rank equals 1 + number of students strictly higher
                    $classRankMap[$classRankedList[$i]['student_id']] = $i + 1;
                }
            }

            // 2. Calculate Section Rank using standard competition ranking
            $sectionGroups = collect($classPerformanceList)->groupBy('section_id');
            $sectionRankMap = [];

            foreach ($sectionGroups as $secId => $secStudents) {
                $secRankedList = $secStudents
                    ->filter(fn($p) => $p['is_eligible_for_rank'])
                    ->sortByDesc('percentage')
                    ->values();

                $secCount = $secRankedList->count();
                for ($j = 0; $j < $secCount; $j++) {
                    if ($j > 0 && $secRankedList[$j]['percentage'] === $secRankedList[$j - 1]['percentage']) {
                        $sectionRankMap[$secRankedList[$j]['student_id']] = $sectionRankMap[$secRankedList[$j - 1]['student_id']];
                    } else {
                        $sectionRankMap[$secRankedList[$j]['student_id']] = $j + 1;
                    }
                }
            }

            // 3. Upsert into student_report_summaries
            foreach ($classPerformanceList as $item) {
                $studentId = $item['student_id'];
                $classRank = $classRankMap[$studentId] ?? null;
                $sectionRank = $sectionRankMap[$studentId] ?? null;

                StudentReportSummary::updateOrCreate(
                    [
                        'school_id' => $schoolId,
                        'academic_year_id' => $academicYearId,
                        'student_id' => $studentId,
                        'summary_type' => 'term',
                        'term_scope_id' => $term->id,
                    ],
                    [
                        'exam_term_id' => $term->id,
                        'school_class_id' => $classId,
                        'section_id' => $item['section_id'],
                        'total_max_marks' => $item['total_max_marks'],
                        'total_obtained_marks' => $item['total_obtained_marks'],
                        'percentage' => $item['percentage'],
                        'overall_grade' => $item['overall_grade'],
                        'overall_gpa' => $item['overall_gpa'],
                        'class_rank' => $classRank,
                        'section_rank' => $sectionRank,
                        'result_status' => $item['result_status'],
                        'published_at' => now(),
                    ]
                );

                $totalSummariesCount++;
            }
        }

        return $totalSummariesCount;
    }
}
