<?php

namespace Database\Seeders;

use App\Models\Examination;
use App\Models\ExamMark;
use App\Models\ReportCard;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\Subject;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ExaminationAndMarksSeeder extends Seeder
{
    public function run(): void
    {
        $school = School::first();
        $schoolId = $school ? $school->id : 1;

        $examsData = [
            [
                'academic_year' => '2024-2025',
                'name' => 'Half-Yearly Summative Assessment (SA-1)',
                'code' => 'SA-1',
                'term' => 'Term 1',
                'start_date' => '2026-10-10',
                'end_date' => '2026-10-22',
                'status' => 'Completed',
                'description' => 'Comprehensive mid-session summative assessment evaluating Term 1 curriculum benchmarks.',
            ],
            [
                'academic_year' => '2024-2025',
                'name' => 'Term 1 Mid-Term Periodic Test',
                'code' => 'PT-1',
                'term' => 'Term 1',
                'start_date' => '2026-08-20',
                'end_date' => '2026-08-28',
                'status' => 'Completed',
                'description' => 'Periodic evaluation assessing foundational units in STEM and language curricula.',
            ],
            [
                'academic_year' => '2024-2025',
                'name' => 'Annual Board Pattern Final Examination (SA-2)',
                'code' => 'ANNUAL-SA2',
                'term' => 'Term 2',
                'start_date' => '2027-03-01',
                'end_date' => '2027-03-16',
                'status' => 'Scheduled',
                'description' => 'Culminating annual final examination across full academic session curriculum.',
            ],
            [
                'academic_year' => '2025-2026',
                'name' => 'Half-Yearly Summative Assessment (SA-1)',
                'code' => 'SA-1-2025',
                'term' => 'Term 1',
                'start_date' => '2027-10-10',
                'end_date' => '2027-10-22',
                'status' => 'Scheduled',
                'description' => 'Summative assessment for 2025-26 academic term.',
            ],
        ];

        $createdExams = [];
        foreach ($examsData as $data) {
            $exam = Examination::updateOrCreate(
                [
                    'academic_year' => $data['academic_year'],
                    'name' => $data['name'],
                ],
                array_merge($data, ['school_id' => $schoolId])
            );
            $createdExams[] = $exam;
        }

        // Fetch all existing subjects
        $subjects = Subject::all();
        if ($subjects->isEmpty()) {
            $defaultSubjects = [
                ['name' => 'Mathematics', 'code' => 'MATH-041', 'type' => 'theory'],
                ['name' => 'Science', 'code' => 'SCI-086', 'type' => 'practical'],
                ['name' => 'English Core', 'code' => 'ENG-184', 'type' => 'theory'],
                ['name' => 'Social Science', 'code' => 'SST-087', 'type' => 'theory'],
                ['name' => 'Computer Applications', 'code' => 'CA-165', 'type' => 'practical'],
                ['name' => 'Hindi', 'code' => 'HIN-002', 'type' => 'theory'],
            ];
            foreach ($defaultSubjects as $sub) {
                Subject::create(array_merge($sub, ['school_id' => $schoolId]));
            }
            $subjects = Subject::all();
        }

        // Fetch all existing students
        $students = Student::all();
        if ($students->isEmpty()) {
            return;
        }

        // Preset marks performance patterns for realism
        $studentMarksProfiles = [
            1 => [ // Aarav Patel
                'Mathematics' => ['theory' => 68, 'practical' => 20, 'remarks' => 'Strong logical reasoning'],
                'Science' => ['theory' => 70, 'practical' => 20, 'remarks' => 'Outstanding lab experiments'],
                'English Core' => ['theory' => 64, 'practical' => 19, 'remarks' => 'Fluent written communication'],
                'Social Science' => ['theory' => 60, 'practical' => 18, 'remarks' => 'Good conceptual grasp'],
                'Computer Applications' => ['theory' => 70, 'practical' => 20, 'remarks' => 'Exceptional coding skills'],
                'Hindi' => ['theory' => 62, 'practical' => 19, 'remarks' => 'Very good expression'],
                'teacher_remarks' => 'Aarav has shown remarkable academic progress with a sharp aptitude for STEM disciplines.',
                'principal_remarks' => 'Excellent performance. Promoted with Distinction.',
            ],
            3 => [ // Priya Sharma
                'Mathematics' => ['theory' => 70, 'practical' => 20, 'remarks' => 'Flawless problem solving'],
                'Science' => ['theory' => 69, 'practical' => 20, 'remarks' => 'Mastery over scientific concepts'],
                'English Core' => ['theory' => 68, 'practical' => 20, 'remarks' => 'Exemplary essay & analysis'],
                'Social Science' => ['theory' => 67, 'practical' => 19, 'remarks' => 'Comprehensive historical context'],
                'Computer Applications' => ['theory' => 70, 'practical' => 20, 'remarks' => 'Outstanding project work'],
                'Hindi' => ['theory' => 68, 'practical' => 19, 'remarks' => 'Superb linguistic flair'],
                'teacher_remarks' => 'Priya is an exemplary class leader and consistently maintains the highest standard of academic excellence.',
                'principal_remarks' => 'Outstanding academic achievement! Highest honors.',
            ],
            4 => [ // Rohan Deshmukh
                'Mathematics' => ['theory' => 58, 'practical' => 18, 'remarks' => 'Consistent efforts in algebra'],
                'Science' => ['theory' => 60, 'practical' => 18, 'remarks' => 'Good practical curiosity'],
                'English Core' => ['theory' => 56, 'practical' => 17, 'remarks' => 'Good comprehension skills'],
                'Social Science' => ['theory' => 55, 'practical' => 17, 'remarks' => 'Satisfactory map work'],
                'Computer Applications' => ['theory' => 65, 'practical' => 19, 'remarks' => 'Passionate about web applications'],
                'Hindi' => ['theory' => 54, 'practical' => 17, 'remarks' => 'Steady progress'],
                'teacher_remarks' => 'Rohan is a sincere and hardworking student with great potential in interactive activities.',
                'principal_remarks' => 'Good progress. Keep working towards distinction.',
            ],
        ];

        // Seed marks for the primary completed exam (SA-1)
        $primaryExam = $createdExams[0]; // Half-Yearly (SA-1) 2024-2025

        foreach ($createdExams as $examIndex => $exam) {
            $variationFactor = $examIndex === 1 ? -3 : 0; // slight difference between exams

            foreach ($students as $student) {
                $profile = $studentMarksProfiles[$student->id] ?? null;

                $totalObtained = 0;
                $totalMax = 0;

                foreach ($subjects as $sIdx => $subject) {
                    $subName = $subject->name;
                    $maxMarks = 100;
                    $passingMarks = 35;

                    if ($profile && isset($profile[$subName])) {
                        $theory = max(20, min(80, $profile[$subName]['theory'] + $variationFactor));
                        $practical = $profile[$subName]['practical'];
                        $obtained = $theory + $practical;
                        $remark = $profile[$subName]['remarks'];
                    } else {
                        // Generate deterministic marks based on student ID & subject ID
                        $base = 65 + (($student->id * 7 + $sIdx * 11) % 25);
                        $theory = (int) ($base * 0.8);
                        $practical = (int) ($base * 0.2);
                        $obtained = $theory + $practical;
                        $remark = ExamMark::getRemarkForGrade(ExamMark::calculateGrade($obtained, $maxMarks));
                    }

                    $grade = ExamMark::calculateGrade($obtained, $maxMarks);
                    $totalObtained += $obtained;
                    $totalMax += $maxMarks;

                    ExamMark::updateOrCreate(
                        [
                            'examination_id' => $exam->id,
                            'student_id' => $student->id,
                            'subject_id' => $subject->id,
                        ],
                        [
                            'school_id' => $schoolId,
                            'theory_marks' => $theory,
                            'practical_marks' => $practical,
                            'marks_obtained' => $obtained,
                            'max_marks' => $maxMarks,
                            'passing_marks' => $passingMarks,
                            'grade' => $grade,
                            'remarks' => $remark,
                        ]
                    );
                }

                // Compute overall stats
                $percentage = $totalMax > 0 ? round(($totalObtained / $totalMax) * 100, 2) : 0;
                $overallGrade = ExamMark::calculateGrade($totalObtained, $totalMax);
                $resultStatus = $percentage >= 85 ? 'DISTINCTION' : ($percentage >= 35 ? 'PASSED' : 'FAILED');

                // Real attendance calculation for this student
                $totalLoggedDays = StudentAttendance::where('student_id', $student->id)->count();
                $presentLoggedDays = StudentAttendance::where('student_id', $student->id)->whereIn('status', ['Present', 'Late'])->count();

                $workingDays = $totalLoggedDays > 0 ? max(85, $totalLoggedDays) : 92;
                $presentDays = $totalLoggedDays > 0 ? max(78, $presentLoggedDays) : (int) round($workingDays * ($percentage >= 80 ? 0.94 : 0.88));
                $attPercentage = round(($presentDays / $workingDays) * 100, 1);

                $teacherRemarks = $profile['teacher_remarks'] ?? "{$student->first_name} exhibits consistent focus, diligent homework habits, and active class participation.";
                $principalRemarks = $profile['principal_remarks'] ?? ($resultStatus === 'DISTINCTION' ? 'Splendid academic performance. Promoted with Distinction.' : 'Good academic performance. Promoted.');

                ReportCard::updateOrCreate(
                    [
                        'examination_id' => $exam->id,
                        'student_id' => $student->id,
                    ],
                    [
                        'school_id' => $schoolId,
                        'academic_year' => $exam->academic_year,
                        'total_max_marks' => $totalMax,
                        'total_marks_obtained' => $totalObtained,
                        'percentage' => $percentage,
                        'overall_grade' => $overallGrade,
                        'result_status' => $resultStatus,
                        'total_working_days' => $workingDays,
                        'present_days' => $presentDays,
                        'attendance_percentage' => $attPercentage,
                        'teacher_remarks' => $teacherRemarks,
                        'principal_remarks' => $principalRemarks,
                        'pdf_filename' => "Report_Card_{$exam->code}_{$student->roll_number}_{$student->first_name}_{$student->last_name}.pdf",
                    ]
                );
            }

            // Assign division ranks & class ranks based on percentage
            $classReportCards = ReportCard::where('examination_id', $exam->id)
                ->orderBy('percentage', 'desc')
                ->get();

            $rank = 1;
            foreach ($classReportCards as $rc) {
                $rc->update([
                    'class_rank' => $rank,
                    'division_rank' => $rank, // in small divisions rank equals rank
                ]);
                $rank++;
            }
        }
    }
}
