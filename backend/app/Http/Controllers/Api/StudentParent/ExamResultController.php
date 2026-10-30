<?php

namespace App\Http\Controllers\Api\StudentParent;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamMark;
use App\Models\ExamTerm;
use App\Models\Student;
use App\Models\StudentReportSummary;
use App\Services\Exams\ReportCardPdfService;
use App\Services\SchoolContext;
use App\Services\StudentParentAccessService;
use Illuminate\Http\Request;

class ExamResultController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $schoolId = SchoolContext::getActiveSchoolId() ?: $user->school_id;

        if ($user->role === 'student_parent') {
            $accessibleStudents = StudentParentAccessService::getAccessibleStudents($user);
            if ($accessibleStudents->isEmpty()) {
                return response()->json(['success' => false, 'message' => 'No student records associated with this parent account.'], 403);
            }

            $studentId = $request->get('student_id', $accessibleStudents->first()->id);
            $student = $accessibleStudents->firstWhere('id', (int)$studentId);

            if (!$student) {
                return response()->json(['success' => false, 'message' => 'Forbidden: You do not have access to this student.'], 403);
            }
        } else {
            // Admin or Teacher
            $studentId = $request->get('student_id');
            if (!$studentId) {
                return response()->json(['success' => false, 'message' => 'student_id parameter is required.'], 422);
            }
            $student = Student::where('school_id', $schoolId)->findOrFail($studentId);
        }

        // Fetch published terms summaries for this student
        $summaries = StudentReportSummary::where('school_id', $schoolId)
            ->where('student_id', $student->id)
            ->whereHas('examTerm', function ($q) {
                $q->where('status', 'published');
            })
            ->with(['examTerm', 'schoolClass', 'section'])
            ->get();

        $marksByTerm = ExamMark::where('school_id', $schoolId)
            ->where('student_id', $student->id)
            ->whereHas('exam.examTerm', function ($q) {
                $q->where('status', 'published');
            })
            ->with(['exam.subject'])
            ->get()
            ->groupBy('exam.exam_term_id');

        $summariesWithMarks = $summaries->map(function ($s) use ($marksByTerm) {
            $termMarks = $marksByTerm->get($s->exam_term_id, collect());
            $sData = $s->toArray();
            $sData['subject_marks'] = $termMarks->map(function ($m) {
                return [
                    'subject_name' => $m->exam->subject->name ?? 'Subject',
                    'marks_obtained' => $m->marks_obtained,
                    'max_marks' => $m->exam->max_marks,
                    'pass_marks' => $m->exam->pass_marks,
                    'grade' => $m->grade,
                    'is_passed' => $m->is_passed,
                    'special_status' => $m->special_status,
                ];
            });
            return $sData;
        });

        $childrenList = [];
        if ($user->role === 'student_parent') {
            $accessible = StudentParentAccessService::getAccessibleStudents($user);
            $childrenList = $accessible->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->first_name . ' ' . ($s->last_name ?? ''),
                'admission_number' => $s->admission_number,
                'class' => $s->schoolClass->name ?? '-',
                'section' => $s->section->name ?? '-',
            ]);
        }

        return response()->json([
            'success' => true,
            'student' => [
                'id' => $student->id,
                'name' => $student->first_name . ' ' . ($student->last_name ?? ''),
                'admission_number' => $student->admission_number,
                'roll_number' => $student->roll_number,
                'class' => $student->schoolClass->name ?? '-',
                'section' => $student->section->name ?? '-',
            ],
            'accessible_students' => $childrenList,
            'results' => $summariesWithMarks,
        ]);
    }

    public function downloadReportCard(Request $request, $termId)
    {
        $user = $request->user();
        $schoolId = SchoolContext::getActiveSchoolId() ?: $user->school_id;

        $studentId = $request->get('student_id');
        if (!$studentId) {
            return response()->json(['success' => false, 'message' => 'student_id parameter is required.'], 422);
        }

        $student = Student::where('school_id', $schoolId)->findOrFail($studentId);
        $term = ExamTerm::where('school_id', $schoolId)->findOrFail($termId);

        $isAdmin = in_array($user->role, ['admin', 'super_admin'], true);

        // Authorization check for parent
        if ($user->role === 'student_parent') {
            if (!StudentParentAccessService::canParentAccessStudent($user, $student)) {
                return response()->json(['success' => false, 'message' => 'Forbidden: You cannot access report cards for other students.'], 403);
            }
        }

        // Unpublished terms guard: parents and teachers are strictly denied (HTTP 403)
        if ($term->status !== 'published') {
            if (!$isAdmin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Results for this examination term have not been published yet.',
                ], 403);
            }
        }

        // Admin preview of unpublished term gets draft watermark
        $isDraft = ($term->status !== 'published' && $isAdmin);

        return ReportCardPdfService::streamReportCardPdf($student, $term, $isDraft);
    }
}
