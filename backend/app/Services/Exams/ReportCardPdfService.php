<?php

namespace App\Services\Exams;

use App\Models\Exam;
use App\Models\ExamMark;
use App\Models\ExamTerm;
use App\Models\School;
use App\Models\SchoolSetting;
use App\Models\Student;
use App\Models\StudentReportSummary;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Support\Facades\Response;

class ReportCardPdfService
{
    /**
     * Render and stream an official report card PDF for a single student.
     *
     * @param Student $student
     * @param ExamTerm $term
     * @param bool $isDraft True if generated for admin preview before publication
     * @return \Illuminate\Http\Response
     */
    public static function streamReportCardPdf(Student $student, ExamTerm $term, bool $isDraft = false)
    {
        $school = School::find($student->school_id);
        $summary = StudentReportSummary::where('school_id', $student->school_id)
            ->where('exam_term_id', $term->id)
            ->where('student_id', $student->id)
            ->first();

        // Fetch marks for this student in this term's exams
        $exams = Exam::with('subject')
            ->where('exam_term_id', $term->id)
            ->where('school_class_id', $student->school_class_id)
            ->where('section_id', $student->section_id)
            ->orderBy('exam_date')
            ->get();

        $rows = [];
        foreach ($exams as $exam) {
            $mark = ExamMark::where('exam_id', $exam->id)
                ->where('student_id', $student->id)
                ->first();

            $special = $mark?->special_status ? strtoupper($mark->special_status) : null;
            $obtainedDisplay = $special ?: ($mark ? number_format((float)$mark->marks_obtained, 1) : '-');
            $gradeDisplay = $special ?: ($mark?->grade ?: '-');
            $statusDisplay = $special ?: ($mark && $mark->is_passed ? 'PASS' : ($mark ? 'FAIL' : '-'));

            $rows[] = [
                'subject_name' => $exam->subject->name ?? 'Subject',
                'subject_code' => $exam->subject->code ?? '-',
                'max_marks' => number_format((float)$exam->max_marks, 0),
                'pass_marks' => number_format((float)$exam->pass_marks, 0),
                'obtained' => $obtainedDisplay,
                'grade' => $gradeDisplay,
                'status' => $statusDisplay,
            ];
        }

        $html = self::buildHtml($school, $student, $term, $summary, $rows, $isDraft);

        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isRemoteEnabled', false);
        $options->set('defaultFont', 'Helvetica');

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        $filename = 'ReportCard_' . str_replace(' ', '_', $student->first_name) . '_' . ($term->code ?: 'Term') . '.pdf';

        return Response::make($dompdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
            'Cache-Control' => 'no-cache, private',
        ]);
    }

    protected static function buildHtml($school, $student, $term, $summary, array $rows, bool $isDraft): string
    {
        $schoolName = htmlspecialchars($school->name ?? 'School Academy');
        $studentName = htmlspecialchars($student->first_name . ' ' . ($student->last_name ?? ''));
        $admNo = htmlspecialchars($student->admission_number ?? '-');
        $rollNo = htmlspecialchars($student->roll_number ?? '-');
        $className = htmlspecialchars($student->schoolClass->name ?? '-') . ' - ' . htmlspecialchars($student->section->name ?? '-');
        $termName = htmlspecialchars($term->name);
        $academicYear = htmlspecialchars($term->academicYear->name ?? '2026-2027');

        $totalMax = $summary ? number_format((float)$summary->total_max_marks, 0) : '0';
        $totalObt = $summary ? number_format((float)$summary->total_obtained_marks, 1) : '0.0';
        $percentage = $summary ? number_format((float)$summary->percentage, 2) . '%' : '0.00%';
        $overallGrade = htmlspecialchars($summary->overall_grade ?? '-');
        $classRank = $summary?->class_rank ? '#' . $summary->class_rank : 'N/A';
        $sectionRank = $summary?->section_rank ? '#' . $summary->section_rank : 'N/A';
        $resultStatus = htmlspecialchars($summary->result_status ?? 'RESULT PENDING');
        $remarks = htmlspecialchars($summary->teacher_remarks ?? 'Keep working hard to improve your academic performance.');

        $rowsHtml = '';
        foreach ($rows as $r) {
            $rowsHtml .= "
                <tr>
                    <td style='padding: 7px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 500;'>{$r['subject_name']}</td>
                    <td style='padding: 7px 10px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #64748b;'>{$r['subject_code']}</td>
                    <td style='padding: 7px 10px; border-bottom: 1px solid #e2e8f0; text-align: right;'>{$r['max_marks']}</td>
                    <td style='padding: 7px 10px; border-bottom: 1px solid #e2e8f0; text-align: right;'>{$r['pass_marks']}</td>
                    <td style='padding: 7px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600;'>{$r['obtained']}</td>
                    <td style='padding: 7px 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold;'>{$r['grade']}</td>
                    <td style='padding: 7px 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 10px;'>{$r['status']}</td>
                </tr>
            ";
        }

        $watermarkHtml = $isDraft ? "
            <div style='position: fixed; top: 40%; left: 10%; width: 80%; text-align: center; font-size: 60px; font-weight: 900; color: rgba(220, 38, 38, 0.12); transform: rotate(-35deg); text-transform: uppercase; letter-spacing: 6px; z-index: -1;'>
                DRAFT / UNPUBLISHED
            </div>
        " : "";

        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <title>Report Card - {$studentName}</title>
            <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; color: #1e293b; margin: 0; padding: 20px; }
                .card { border: 2px solid #0f172a; padding: 25px; border-radius: 6px; background: #fff; }
                .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 15px; }
                .title { font-size: 18px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; margin: 0; }
                .subtitle { font-size: 11px; color: #475569; margin: 3px 0 0; }
                .report-title { font-size: 13px; font-weight: 700; text-transform: uppercase; background: #f1f5f9; padding: 5px; margin: 10px 0 15px; border-radius: 4px; text-align: center; letter-spacing: 0.5px; }
                .info-table { width: 100%; margin-bottom: 15px; font-size: 11px; }
                .info-table td { padding: 4px 6px; vertical-align: top; }
                .info-label { font-weight: 600; color: #475569; width: 22%; }
                .marks-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11px; }
                .marks-table th { background: #0f172a; color: #fff; padding: 7px 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
                .summary-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 10px 15px; margin-bottom: 15px; }
                .summary-table { width: 100%; }
                .summary-table td { padding: 4px 6px; }
                .signatures { width: 100%; margin-top: 35px; }
                .sign-line { border-top: 1px solid #0f172a; padding-top: 4px; text-align: center; font-size: 10px; font-weight: 600; width: 28%; }
            </style>
        </head>
        <body>
            {$watermarkHtml}
            <div class='card'>
                <div class='header'>
                    <h1 class='title'>{$schoolName}</h1>
                    <div class='subtitle'>Academic Excellence & Character Building</div>
                    <div class='report-title'>Official Student Progress Report &mdash; {$termName} ({$academicYear})</div>
                </div>

                <table class='info-table'>
                    <tr>
                        <td class='info-label'>Student Name:</td>
                        <td style='font-weight: 700;'>{$studentName}</td>
                        <td class='info-label'>Class & Section:</td>
                        <td style='font-weight: 600;'>{$className}</td>
                    </tr>
                    <tr>
                        <td class='info-label'>Admission No:</td>
                        <td>{$admNo}</td>
                        <td class='info-label'>Roll Number:</td>
                        <td>{$rollNo}</td>
                    </tr>
                    <tr>
                        <td class='info-label'>Academic Year:</td>
                        <td>{$academicYear}</td>
                        <td class='info-label'>Examination:</td>
                        <td>{$termName}</td>
                    </tr>
                </table>

                <table class='marks-table'>
                    <thead>
                        <tr>
                            <th style='text-align: left;'>Subject</th>
                            <th>Code</th>
                            <th style='text-align: right;'>Max</th>
                            <th style='text-align: right;'>Pass</th>
                            <th style='text-align: right;'>Obtained</th>
                            <th>Grade</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {$rowsHtml}
                    </tbody>
                </table>

                <div class='summary-box'>
                    <table class='summary-table'>
                        <tr>
                            <td><strong>Total Marks:</strong> {$totalObt} / {$totalMax}</td>
                            <td><strong>Percentage:</strong> {$percentage}</td>
                            <td><strong>Overall Grade:</strong> {$overallGrade}</td>
                        </tr>
                        <tr>
                            <td><strong>Class Rank:</strong> {$classRank}</td>
                            <td><strong>Section Rank:</strong> {$sectionRank}</td>
                            <td><strong>Result:</strong> <span style='font-weight: bold; color: " . ($resultStatus === 'PASSED' ? '#166534' : ($resultStatus === 'FAILED' ? '#991b1b' : '#854d0e')) . ";'>{$resultStatus}</span></td>
                        </tr>
                    </table>
                </div>

                <div style='margin-bottom: 25px; padding: 8px 12px; background: #fff; border-left: 3px solid #0f172a; font-style: italic; color: #334155;'>
                    <strong>Class Teacher Remarks:</strong> &ldquo;{$remarks}&rdquo;
                </div>

                <table class='signatures'>
                    <tr>
                        <td class='sign-line'>Class Teacher</td>
                        <td style='width: 8%;'></td>
                        <td class='sign-line'>Exam In-Charge</td>
                        <td style='width: 8%;'></td>
                        <td class='sign-line'>Principal / Head of School</td>
                    </tr>
                </table>
            </div>
        </body>
        </html>
        ";
    }
}
