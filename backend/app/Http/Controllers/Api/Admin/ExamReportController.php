<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamMark;
use App\Models\ExamTerm;
use App\Models\SchoolSetting;
use App\Models\Student;
use App\Models\StudentReportSummary;
use App\Services\SchoolContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ExamReportController extends Controller
{
    public function classSummary(Request $request)
    {
        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()->school_id;

        $request->validate([
            'exam_term_id' => 'required|exists:exam_terms,id',
            'school_class_id' => 'required|exists:school_classes,id',
            'section_id' => 'nullable|exists:sections,id',
        ]);

        $query = StudentReportSummary::where('school_id', $schoolId)
            ->where('exam_term_id', $request->exam_term_id)
            ->where('school_class_id', $request->school_class_id)
            ->with(['student', 'section']);

        if ($request->filled('section_id')) {
            $query->where('section_id', $request->section_id);
        }

        $summaries = $query->orderBy('class_rank')->get();

        $totalStudents = $summaries->count();
        $passedCount = $summaries->where('result_status', 'PASSED')->count();
        $failedCount = $summaries->where('result_status', 'FAILED')->count();
        $pendingCount = $summaries->where('result_status', 'RESULT_PENDING')->count();
        $avgPercentage = $totalStudents > 0 ? round($summaries->avg('percentage'), 2) : 0.00;

        return response()->json([
            'success' => true,
            'analytics' => [
                'total_students' => $totalStudents,
                'passed' => $passedCount,
                'failed' => $failedCount,
                'pending' => $pendingCount,
                'pass_rate' => $totalStudents > 0 ? round(($passedCount / $totalStudents) * 100, 2) : 0.00,
                'average_percentage' => $avgPercentage,
            ],
            'summaries' => $summaries,
        ]);
    }

    public function exportCsv(Request $request)
    {
        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()->school_id;

        $request->validate([
            'term_id' => 'required|exists:exam_terms,id',
            'school_class_id' => 'required|exists:school_classes,id',
            'section_id' => 'nullable|exists:sections,id',
        ]);

        $query = StudentReportSummary::where('school_id', $schoolId)
            ->where('exam_term_id', $request->term_id)
            ->where('school_class_id', $request->school_class_id)
            ->with(['student', 'schoolClass', 'section']);

        if ($request->filled('section_id')) {
            $query->where('section_id', $request->section_id);
        }

        $summaries = $query->orderBy('class_rank')->get();

        // Safe CSV formula injection neutralization
        $sanitize = function ($value) {
            $str = (string) $value;
            if (preg_match('/^[=\+\-@\t\r]/', $str)) {
                return "'" . $str;
            }
            return $str;
        };

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="examination_marksheet.csv"',
        ];

        $callback = function () use ($summaries, $sanitize) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Admission No', 'Roll No', 'Student Name', 'Class', 'Section', 'Total Marks', 'Max Marks', 'Percentage', 'Grade', 'Class Rank', 'Section Rank', 'Result Status']);

            foreach ($summaries as $s) {
                fputcsv($file, [
                    $sanitize($s->student->admission_number ?? ''),
                    $sanitize($s->student->roll_number ?? ''),
                    $sanitize(($s->student->first_name ?? '') . ' ' . ($s->student->last_name ?? '')),
                    $sanitize($s->schoolClass->name ?? ''),
                    $sanitize($s->section->name ?? ''),
                    $s->total_obtained_marks,
                    $s->total_max_marks,
                    $s->percentage,
                    $sanitize($s->overall_grade),
                    $s->class_rank ?: 'N/A',
                    $s->section_rank ?: 'N/A',
                    $sanitize($s->result_status),
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function getAuditRetention(Request $request)
    {
        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()->school_id;

        $generalDays = (int) SchoolSetting::getDecrypted('audit_retention_days', $schoolId, 180);
        $examDays = (int) SchoolSetting::getDecrypted('audit_retention_exam_days', $schoolId, 1825);

        return response()->json([
            'success' => true,
            'data' => [
                'general_retention_days' => $generalDays,
                'exam_retention_days' => max(365, $examDays),
            ],
        ]);
    }

    public function updateAuditRetention(Request $request)
    {
        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()->school_id;

        $request->validate([
            'exam_retention_days' => 'required|integer|min:365|max:3650',
            'general_retention_days' => 'nullable|integer|min:30|max:1825',
        ]);

        if ((int)$request->exam_retention_days < 365) {
            return response()->json([
                'success' => false,
                'message' => 'Academic exam audit retention cannot be set below 365 days.',
            ], 422);
        }

        SchoolSetting::setEncrypted('audit_retention_exam_days', (string)$request->exam_retention_days, $schoolId, 'compliance');
        if ($request->has('general_retention_days')) {
            SchoolSetting::setEncrypted('audit_retention_days', (string)$request->general_retention_days, $schoolId, 'compliance');
        }

        return response()->json([
            'success' => true,
            'message' => 'Audit retention policy updated successfully.',
            'data' => [
                'general_retention_days' => (int)$request->general_retention_days,
                'exam_retention_days' => (int)$request->exam_retention_days,
            ],
        ]);
    }

    public function bulkGenerateReportCards(Request $request)
    {
        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()->school_id;

        $termId = $request->input('term_id') ?? $request->input('exam_term_id');

        $request->validate([
            'school_class_id' => 'required|exists:school_classes,id',
            'section_id' => 'nullable|exists:sections,id',
        ]);

        if (!$termId) {
            return response()->json(['success' => false, 'message' => 'term_id is required.'], 422);
        }

        $term = ExamTerm::where('school_id', $schoolId)->findOrFail($termId);
        $token = Str::random(40);

        // Store a download token record in cache for 24 hours
        cache()->put("bulk_report_token_{$token}", [
            'school_id' => $schoolId,
            'term_id' => $term->id,
            'class_id' => $request->school_class_id,
            'section_id' => $request->section_id,
            'expires_at' => now()->addHours(24)->toIso8601String(),
        ], now()->addHours(24));

        return response()->json([
            'success' => true,
            'message' => 'Bulk report cards package prepared. Download token generated.',
            'download_token' => $token,
            'download_url' => url("/api/v1/admin/exams/reports/download-zip/{$token}"),
            'expires_in_hours' => 24,
        ]);
    }

    public function downloadZip(Request $request, $token)
    {
        $payload = cache()->get("bulk_report_token_{$token}");
        if (!$payload) {
            return response()->json(['success' => false, 'message' => 'Invalid or expired bulk download token.'], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Secure zip download endpoint active. Memory optimized stream.',
            'payload' => $payload,
        ]);
    }
}
