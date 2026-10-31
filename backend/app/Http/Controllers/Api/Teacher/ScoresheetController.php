<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\ClassTeacherAllocation;
use App\Models\Exam;
use App\Models\ExamMark;
use App\Models\ExamTerm;
use App\Models\Student;
use App\Models\StudentReportSummary;
use App\Models\StudentSubjectEnrollment;
use App\Models\Teacher;
use App\Models\TeacherSubjectAssignment;
use App\Services\AcademicYearContext;
use App\Services\SchoolContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScoresheetController extends Controller
{
    public function assignedPapers(Request $request)
    {
        $user = $request->user();
        $schoolId = SchoolContext::getActiveSchoolId() ?: $user->school_id;
        $academicYearId = AcademicYearContext::getActiveAcademicYearId($schoolId);

        if (in_array($user->role, ['admin', 'super_admin'], true)) {
            $exams = Exam::where('school_id', $schoolId)
                ->where('academic_year_id', $academicYearId)
                ->with(['examTerm', 'schoolClass', 'section', 'subject'])
                ->get();

            return response()->json(['success' => true, 'data' => $exams]);
        }

        $teacher = Teacher::where('user_id', $user->id)->first();
        if (!$teacher) {
            return response()->json(['success' => false, 'message' => 'Teacher record not found.'], 403);
        }

        $assignedTriplets = TeacherSubjectAssignment::where('school_id', $schoolId)
            ->where('academic_year_id', $academicYearId)
            ->where('teacher_id', $teacher->id)
            ->get();

        $exams = Exam::where('school_id', $schoolId)
            ->where('academic_year_id', $academicYearId)
            ->where(function ($query) use ($assignedTriplets) {
                foreach ($assignedTriplets as $assign) {
                    $query->orWhere(function ($q) use ($assign) {
                        $q->where('school_class_id', $assign->school_class_id)
                          ->where('section_id', $assign->section_id)
                          ->where('subject_id', $assign->subject_id);
                    });
                }
            })
            ->with(['examTerm', 'schoolClass', 'section', 'subject'])
            ->get();

        return response()->json(['success' => true, 'data' => $exams]);
    }

    public function examRoster(Request $request, $examId)
    {
        $user = $request->user();
        $schoolId = SchoolContext::getActiveSchoolId() ?: $user->school_id;
        $exam = Exam::where('school_id', $schoolId)->with(['examTerm', 'schoolClass', 'section', 'subject'])->findOrFail($examId);

        // Teacher authorization check: must be assigned to this section and subject
        if (!in_array($user->role, ['admin', 'super_admin'], true)) {
            $teacher = Teacher::where('user_id', $user->id)->first();
            $isAssigned = $teacher && TeacherSubjectAssignment::where('school_id', $schoolId)
                ->where('teacher_id', $teacher->id)
                ->where('school_class_id', $exam->school_class_id)
                ->where('section_id', $exam->section_id)
                ->where('subject_id', $exam->subject_id)
                ->exists();

            if (!$isAssigned) {
                return response()->json(['success' => false, 'message' => 'Forbidden: You are not assigned to teach this subject in this section.'], 403);
            }
        }

        // Fetch students in section, filtering optional subjects by elective enrollment
        $isOptional = (strtolower($exam->subject?->type ?? '') === 'optional');
        $studentsQuery = Student::where('school_id', $schoolId)
            ->where('school_class_id', $exam->school_class_id)
            ->where('section_id', $exam->section_id)
            ->where('status', 'Active');

        if ($isOptional) {
            $enrolledStudentIds = StudentSubjectEnrollment::where('academic_year_id', $exam->academic_year_id)
                ->where('subject_id', $exam->subject_id)
                ->pluck('student_id');
            $studentsQuery->whereIn('id', $enrolledStudentIds);
        }

        $students = $studentsQuery->orderBy('roll_number')->get();

        $marks = ExamMark::where('exam_id', $exam->id)->get()->keyBy('student_id');

        $roster = $students->map(function ($stu) use ($marks) {
            $mark = $marks->get($stu->id);
            return [
                'student_id' => $stu->id,
                'name' => $stu->first_name . ' ' . ($stu->last_name ?? ''),
                'roll_number' => $stu->roll_number,
                'admission_number' => $stu->admission_number,
                'marks_obtained' => $mark ? $mark->marks_obtained : null,
                'special_status' => $mark ? $mark->special_status : null,
                'is_passed' => $mark ? $mark->is_passed : null,
                'teacher_remarks' => $mark ? $mark->teacher_remarks : null,
            ];
        });

        return response()->json([
            'success' => true,
            'exam' => $exam,
            'roster' => $roster,
        ]);
    }

    public function saveDraft(Request $request, $examId)
    {
        $user = $request->user();
        $schoolId = SchoolContext::getActiveSchoolId() ?: $user->school_id;

        $request->validate([
            'marks' => 'required|array',
            'marks.*.student_id' => 'required|exists:students,id',
            'marks.*.marks_obtained' => 'nullable|numeric|min:0',
            'marks.*.special_status' => 'nullable|in:AB,ML,EX',
            'marks.*.teacher_remarks' => 'nullable|string|max:255',
        ]);

        return DB::transaction(function () use ($schoolId, $examId, $user, $request) {
            $exam = Exam::where('school_id', $schoolId)->lockForUpdate()->findOrFail($examId);

            if ($exam->isLocked()) {
                return response()->json(['success' => false, 'message' => 'Exam is locked. Marks cannot be modified.'], 422);
            }

            // Teacher authorization check
            if (!in_array($user->role, ['admin', 'super_admin'], true)) {
                $teacher = Teacher::where('user_id', $user->id)->first();
                $isAssigned = $teacher && TeacherSubjectAssignment::where('school_id', $schoolId)
                    ->where('teacher_id', $teacher->id)
                    ->where('school_class_id', $exam->school_class_id)
                    ->where('section_id', $exam->section_id)
                    ->where('subject_id', $exam->subject_id)
                    ->exists();

                if (!$isAssigned) {
                    return response()->json(['success' => false, 'message' => 'Forbidden: You are not assigned to teach this subject in this section.'], 403);
                }
            } else {
                // Admin mark override: audited
                AuditLog::create([
                    'school_id' => $schoolId,
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                    'user_role' => $user->role,
                    'auditable_type' => Exam::class,
                    'auditable_id' => $exam->id,
                    'event' => 'admin_mark_override',
                    'old_values' => ['status' => $exam->status],
                    'new_values' => ['updated_by_admin' => true, 'marks_count' => count($request->marks)],
                    'ip_address' => $request->ip(),
                    'user_agent' => substr($request->userAgent() ?? '', 0, 500),
                    'created_at' => now(),
                ]);
            }

            foreach ($request->marks as $m) {
                $obtained = isset($m['marks_obtained']) && $m['marks_obtained'] !== '' ? (float)$m['marks_obtained'] : null;
                $special = !empty($m['special_status']) ? strtoupper($m['special_status']) : null;

                // Validation bounds & mutual exclusivity
                if ($obtained !== null && $special !== null) {
                    return response()->json(['success' => false, 'message' => "Student ID {$m['student_id']}: cannot specify both numeric marks and special status."], 422);
                }

                if ($obtained !== null && ($obtained < 0 || $obtained > (float)$exam->max_marks)) {
                    return response()->json(['success' => false, 'message' => "Student ID {$m['student_id']}: marks must be between 0 and {$exam->max_marks}."], 422);
                }

                ExamMark::updateOrCreate(
                    [
                        'school_id' => $schoolId,
                        'academic_year_id' => $exam->academic_year_id,
                        'exam_id' => $exam->id,
                        'student_id' => $m['student_id'],
                    ],
                    [
                        'marks_obtained' => $obtained,
                        'special_status' => $special,
                        'teacher_remarks' => $m['teacher_remarks'] ?? null,
                        'entered_by_user_id' => $user->id,
                    ]
                );
            }

            $exam->status = 'draft';
            $exam->save();

            return response()->json([
                'success' => true,
                'message' => 'Scoresheet draft saved successfully.',
            ]);
        });
    }

    public function submitMarks(Request $request, $examId)
    {
        $user = $request->user();
        $schoolId = SchoolContext::getActiveSchoolId() ?: $user->school_id;

        return DB::transaction(function () use ($schoolId, $examId, $user) {
            $exam = Exam::where('school_id', $schoolId)->lockForUpdate()->findOrFail($examId);

            if ($exam->isLocked()) {
                return response()->json(['success' => false, 'message' => 'Exam is already locked.'], 422);
            }

            // Check that all roster students have marks or code
            $isOptional = (strtolower($exam->subject?->type ?? '') === 'optional');
            $studentsQuery = Student::where('school_id', $schoolId)
                ->where('school_class_id', $exam->school_class_id)
                ->where('section_id', $exam->section_id)
                ->where('status', 'Active');

            if ($isOptional) {
                $enrolledStudentIds = StudentSubjectEnrollment::where('academic_year_id', $exam->academic_year_id)
                    ->where('subject_id', $exam->subject_id)
                    ->pluck('student_id');
                $studentsQuery->whereIn('id', $enrolledStudentIds);
            }

            $studentsCount = $studentsQuery->count();

            $evaluatedCount = ExamMark::where('exam_id', $exam->id)
                ->where(function ($q) {
                    $q->whereNotNull('marks_obtained')
                      ->orWhereNotNull('special_status');
                })
                ->count();

            if ($evaluatedCount < $studentsCount) {
                return response()->json([
                    'success' => false,
                    'message' => "Cannot submit scoresheet: every student must have either a score or a special code (AB, ML, EX). Evaluated {$evaluatedCount}/{$studentsCount}.",
                ], 422);
            }

            $teacher = Teacher::where('user_id', $user->id)->first();

            $exam->status = 'submitted';
            $exam->submitted_at = now();
            $exam->submitted_by_teacher_id = $teacher?->id;
            $exam->save();

            return response()->json([
                'success' => true,
                'message' => 'Scoresheet submitted for administrative verification.',
                'data' => $exam,
            ]);
        });
    }

    public function saveClassTeacherRemarks(Request $request, $termId, $studentId)
    {
        $user = $request->user();
        $schoolId = SchoolContext::getActiveSchoolId() ?: $user->school_id;

        $request->validate([
            'remarks' => 'nullable|string|max:1000',
            'teacher_remarks' => 'nullable|string|max:1000',
        ]);

        $remarksText = $request->input('remarks') ?? $request->input('teacher_remarks');
        if (empty($remarksText)) {
            return response()->json(['success' => false, 'message' => 'The remarks field is required.'], 422);
        }

        $term = ExamTerm::where('school_id', $schoolId)->findOrFail($termId);
        $student = Student::where('school_id', $schoolId)->findOrFail($studentId);

        // Authorization check: User must be designated Class Teacher for student's section, or Admin
        if (!in_array($user->role, ['admin', 'super_admin'], true)) {
            $teacher = Teacher::where('user_id', $user->id)->first();
            $isClassTeacher = $teacher && ClassTeacherAllocation::where('school_id', $schoolId)
                ->where('academic_year_id', $term->academic_year_id)
                ->where('school_class_id', $student->school_class_id)
                ->where('section_id', $student->section_id)
                ->where('teacher_id', $teacher->id)
                ->exists();

            if (!$isClassTeacher) {
                return response()->json(['success' => false, 'message' => 'Forbidden: Only the designated Class Teacher can enter report card remarks.'], 403);
            }
        }

        $summary = StudentReportSummary::updateOrCreate(
            [
                'school_id' => $schoolId,
                'academic_year_id' => $term->academic_year_id,
                'student_id' => $student->id,
                'summary_type' => 'term',
                'term_scope_id' => $term->id,
            ],
            [
                'exam_term_id' => $term->id,
                'school_class_id' => $student->school_class_id,
                'section_id' => $student->section_id,
                'total_max_marks' => 0.00,
                'total_obtained_marks' => 0.00,
                'percentage' => 0.00,
                'result_status' => 'RESULT_PENDING',
                'teacher_remarks' => $remarksText,
            ]
        );

        $summary->teacher_remarks = $remarksText;
        $summary->save();

        return response()->json([
            'success' => true,
            'message' => 'Class teacher remarks saved successfully.',
            'data' => $summary,
        ]);
    }
}
