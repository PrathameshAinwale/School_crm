<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Exam;
use App\Models\ExamScore;
use App\Models\ExamTerm;
use App\Models\GradingScale;
use App\Models\GradingScaleTier;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\StudentReportSummary;
use App\Models\Subject;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ExamTermsAndResultsSeeder extends Seeder
{
    public function run(): void
    {
        $schools = School::all();

        foreach ($schools as $school) {
            $ay = AcademicYear::where('school_id', $school->id)->where('is_current', true)->first();
            if (!$ay) {
                $ay = AcademicYear::create([
                    'school_id' => $school->id,
                    'name' => '2026-2027',
                    'code' => 'AY-2026-27',
                    'start_date' => '2026-04-01',
                    'end_date' => '2027-03-31',
                    'is_current' => true,
                    'status' => 'active',
                ]);
            }

            // 1. Grading Scale
            $scale = GradingScale::firstOrCreate(
                [
                    'school_id' => $school->id,
                    'name' => 'CBSE Secondary 9-Point Scale',
                ],
                [
                    'description' => 'Official continuous 9-point scale covering 0% to 100%.',
                    'is_active' => true,
                ]
            );

            // Ensure tiers are gapless 0 to 100%
            $tiersData = [
                ['grade' => 'E', 'min_percentage' => 0.00, 'max_percentage' => 33.00, 'grade_point' => 0.00, 'description' => 'Needs Improvement', 'order_seq' => 8],
                ['grade' => 'D', 'min_percentage' => 33.00, 'max_percentage' => 41.00, 'grade_point' => 4.00, 'description' => 'Pass', 'order_seq' => 7],
                ['grade' => 'C2', 'min_percentage' => 41.00, 'max_percentage' => 51.00, 'grade_point' => 5.00, 'description' => 'Average', 'order_seq' => 6],
                ['grade' => 'C1', 'min_percentage' => 51.00, 'max_percentage' => 61.00, 'grade_point' => 6.00, 'description' => 'Fair', 'order_seq' => 5],
                ['grade' => 'B2', 'min_percentage' => 61.00, 'max_percentage' => 71.00, 'grade_point' => 7.00, 'description' => 'Good', 'order_seq' => 4],
                ['grade' => 'B1', 'min_percentage' => 71.00, 'max_percentage' => 81.00, 'grade_point' => 8.00, 'description' => 'Very Good', 'order_seq' => 3],
                ['grade' => 'A2', 'min_percentage' => 81.00, 'max_percentage' => 91.00, 'grade_point' => 9.00, 'description' => 'Excellent', 'order_seq' => 2],
                ['grade' => 'A1', 'min_percentage' => 91.00, 'max_percentage' => 100.00, 'grade_point' => 10.00, 'description' => 'Outstanding', 'order_seq' => 1],
            ];

            foreach ($tiersData as $td) {
                GradingScaleTier::updateOrCreate(
                    [
                        'grading_scale_id' => $scale->id,
                        'grade' => $td['grade'],
                    ],
                    $td
                );
            }

            // 2. Exam Terms
            $termsData = [
                [
                    'name' => 'Term 1 (Mid-Term Assessment)',
                    'code' => 'TERM-1',
                    'term_type' => 'term',
                    'weightage_percentage' => 50.00,
                    'start_date' => '2026-09-10',
                    'end_date' => '2026-09-24',
                    'status' => 'published',
                    'description' => 'Mid-session summative assessment evaluating Term 1 curriculum.',
                    'published_at' => Carbon::parse('2026-09-28 10:00:00'),
                ],
                [
                    'name' => 'Term 2 (Annual Final Examination)',
                    'code' => 'TERM-2',
                    'term_type' => 'term',
                    'weightage_percentage' => 50.00,
                    'start_date' => '2027-02-15',
                    'end_date' => '2027-03-05',
                    'status' => 'scheduled',
                    'description' => 'Cumulative annual examination covering the full year curriculum.',
                    'published_at' => null,
                ],
                [
                    'name' => 'Periodic Test 1 (Unit Evaluation)',
                    'code' => 'PT-1',
                    'term_type' => 'unit_test',
                    'weightage_percentage' => 20.00,
                    'start_date' => '2026-07-15',
                    'end_date' => '2026-07-22',
                    'status' => 'completed',
                    'description' => 'First foundational periodic test.',
                    'published_at' => null,
                ],
            ];

            $createdTerms = [];
            foreach ($termsData as $tData) {
                $term = ExamTerm::updateOrCreate(
                    [
                        'school_id' => $school->id,
                        'academic_year_id' => $ay->id,
                        'name' => $tData['name'],
                    ],
                    array_merge($tData, [
                        'grading_scale_id' => $scale->id,
                    ])
                );
                $createdTerms[] = $term;
            }

            $primaryTerm = $createdTerms[0];

            // 3. Ensure Subjects
            $defaultSubjects = [
                ['name' => 'Mathematics', 'code' => 'MATH-041', 'type' => 'theory'],
                ['name' => 'Science', 'code' => 'SCI-086', 'type' => 'practical'],
                ['name' => 'English Core', 'code' => 'ENG-184', 'type' => 'theory'],
                ['name' => 'Social Science', 'code' => 'SST-087', 'type' => 'theory'],
                ['name' => 'Computer Applications', 'code' => 'CA-165', 'type' => 'practical'],
                ['name' => 'Hindi', 'code' => 'HIN-002', 'type' => 'theory'],
            ];

            $subjects = [];
            foreach ($defaultSubjects as $sub) {
                $subjects[] = Subject::firstOrCreate(
                    [
                        'school_id' => $school->id,
                        'code' => $sub['code'],
                    ],
                    $sub
                );
            }

            // 4. Classes & Sections
            $class10 = SchoolClass::where('school_id', $school->id)->where('name', 'Class 10')->first();
            if (!$class10) {
                $class10 = SchoolClass::firstOrCreate(
                    ['school_id' => $school->id, 'name' => 'Class 10'],
                    ['code' => 'CLS-10']
                );
            }
            $sectionA = Section::where('school_class_id', $class10->id)->first();
            if (!$sectionA) {
                $sectionA = Section::create([
                    'school_id' => $school->id,
                    'school_class_id' => $class10->id,
                    'name' => 'Saffron (A)',
                    'capacity' => 40,
                ]);
            }

            // 5. Build Exam Papers & Student Scores
            $students = Student::where('school_id', $school->id)->get();
            if ($students->isEmpty()) {
                continue;
            }

            // Ensure all demo students in school 1 have school_class_id and section_id
            foreach ($students as $stu) {
                if (!$stu->school_class_id) {
                    $stu->update([
                        'school_class_id' => $class10->id,
                        'section_id' => $sectionA->id,
                    ]);
                }
            }

            // Re-fetch updated students
            $students = Student::where('school_id', $school->id)->get();

            // Create exam papers for each subject in Class 10
            $exams = [];
            foreach ($subjects as $idx => $subj) {
                $examDate = Carbon::parse('2026-09-10')->addDays($idx * 2)->toDateString();
                $exam = Exam::updateOrCreate(
                    [
                        'school_id' => $school->id,
                        'academic_year_id' => $ay->id,
                        'exam_term_id' => $primaryTerm->id,
                        'school_class_id' => $class10->id,
                        'section_id' => $sectionA->id,
                        'subject_id' => $subj->id,
                    ],
                    [
                        'exam_date' => $examDate,
                        'start_time' => '09:00:00',
                        'end_time' => '12:00:00',
                        'room' => 'Hall-A',
                        'max_marks' => 100.00,
                        'pass_marks' => 35.00,
                        'status' => 'locked',
                        'locked_at' => Carbon::now(),
                    ]
                );
                $exams[] = $exam;
            }

            // Score profiles generator
            $studentSummaries = [];

            foreach ($students as $sIdx => $student) {
                $baseScore = 92 - ($sIdx * 4); // 92, 88, 84, 80, 76, 72, 68, 64
                if ($baseScore < 45) $baseScore = 52;

                $totalObtained = 0;
                $totalMax = 0;

                foreach ($exams as $eIdx => $ex) {
                    $jitter = (($sIdx + $eIdx) % 5) - 2; // -2 to +2
                    $score = min(100, max(38, $baseScore + $jitter));
                    $totalObtained += $score;
                    $totalMax += 100;

                    $isPassed = $score >= 35.00;
                    $grade = $score >= 91 ? 'A1' : ($score >= 81 ? 'A2' : ($score >= 71 ? 'B1' : ($score >= 61 ? 'B2' : ($score >= 51 ? 'C1' : 'C2'))));
                    $gp = $score >= 91 ? 10.0 : ($score >= 81 ? 9.0 : ($score >= 71 ? 8.0 : ($score >= 61 ? 7.0 : ($score >= 51 ? 6.0 : 5.0))));

                    ExamScore::updateOrCreate(
                        [
                            'exam_id' => $ex->id,
                            'student_id' => $student->id,
                        ],
                        [
                            'school_id' => $school->id,
                            'academic_year_id' => $ay->id,
                            'marks_obtained' => $score,
                            'is_passed' => $isPassed,
                            'grade' => $grade,
                            'grade_point' => $gp,
                            'teacher_remarks' => 'Good performance in subject evaluations.',
                        ]
                    );
                }

                $pct = round(($totalObtained / max(1, $totalMax)) * 100, 2);
                $overallGrade = $pct >= 91 ? 'A1' : ($pct >= 81 ? 'A2' : ($pct >= 71 ? 'B1' : ($pct >= 61 ? 'B2' : ($pct >= 51 ? 'C1' : 'C2'))));
                $overallGpa = $pct >= 91 ? 10.0 : ($pct >= 81 ? 9.0 : ($pct >= 71 ? 8.0 : ($pct >= 61 ? 7.0 : ($pct >= 51 ? 6.0 : 5.0))));

                $studentSummaries[] = [
                    'student_id' => $student->id,
                    'total_max' => $totalMax,
                    'total_obtained' => $totalObtained,
                    'percentage' => $pct,
                    'grade' => $overallGrade,
                    'gpa' => $overallGpa,
                ];
            }

            // Sort by percentage desc to assign ranks
            usort($studentSummaries, fn($a, $b) => $b['percentage'] <=> $a['percentage']);

            foreach ($studentSummaries as $rankIdx => $sData) {
                $rank = $rankIdx + 1;
                StudentReportSummary::updateOrCreate(
                    [
                        'school_id' => $school->id,
                        'academic_year_id' => $ay->id,
                        'student_id' => $sData['student_id'],
                        'summary_type' => 'term',
                        'term_scope_id' => $primaryTerm->id,
                    ],
                    [
                        'exam_term_id' => $primaryTerm->id,
                        'school_class_id' => $class10->id,
                        'section_id' => $sectionA->id,
                        'total_max_marks' => $sData['total_max'],
                        'total_obtained_marks' => $sData['total_obtained'],
                        'percentage' => $sData['percentage'],
                        'overall_grade' => $sData['grade'],
                        'overall_gpa' => $sData['gpa'],
                        'class_rank' => $rank,
                        'section_rank' => $rank,
                        'result_status' => 'PASSED',
                        'teacher_remarks' => 'Demonstrated consistent focus, aptitude and academic dedication throughout this examination term.',
                        'published_at' => Carbon::parse('2026-09-28 10:00:00'),
                    ]
                );
            }
        }
    }
}
