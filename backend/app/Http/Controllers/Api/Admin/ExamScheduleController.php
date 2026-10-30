<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\CommunicationCampaign;
use App\Models\Exam;
use App\Models\ExamMark;
use App\Models\ExamTerm;
use App\Models\GradingScale;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\Subject;
use App\Services\AcademicYearContext;
use App\Services\Exams\ExamRankingService;
use App\Services\Exams\GradingScaleValidationService;
use App\Services\SchoolContext;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExamScheduleController extends Controller
{
    // --- Terms Management ---
    public function listTerms(Request $request)
    {
        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()->school_id;
        $academicYearId = AcademicYearContext::getActiveAcademicYearId($schoolId);

        $terms = ExamTerm::where('school_id', $schoolId)
            ->where('academic_year_id', $academicYearId)
            ->with(['gradingScale', 'exams.subject', 'exams.schoolClass', 'exams.section'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $terms,
        ]);
    }

    public function storeTerm(Request $request)
    {
        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()->school_id;
        $academicYearId = AcademicYearContext::getActiveAcademicYearId($schoolId);

        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'term_type' => 'required|in:unit_test,term',
            'weightage_percentage' => 'required|numeric|min:0.01|max:100.00',
            'grading_scale_id' => 'required|exists:grading_scales,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'description' => 'nullable|string',
        ]);

        $scale = GradingScale::where('id', $request->grading_scale_id)->where('school_id', $schoolId)->first();
        if (!$scale) {
            return response()->json(['success' => false, 'message' => 'Grading scale not found in this school.'], 422);
        }

        $term = ExamTerm::create([
            'school_id' => $schoolId,
            'academic_year_id' => $academicYearId,
            'grading_scale_id' => $scale->id,
            'name' => $request->name,
            'code' => $request->code,
            'term_type' => $request->term_type,
            'weightage_percentage' => $request->weightage_percentage,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'description' => $request->description,
            'status' => 'scheduled',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Examination term created successfully.',
            'data' => $term->load('gradingScale'),
        ], 201);
    }

    // --- Date Sheet / Exam Papers Management ---
    public function storeExam(Request $request)
    {
        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()->school_id;
        $academicYearId = AcademicYearContext::getActiveAcademicYearId($schoolId);

        $request->validate([
            'exam_term_id' => 'required|exists:exam_terms,id',
            'school_class_id' => 'required|exists:school_classes,id',
            'section_id' => 'required|exists:sections,id',
            'subject_id' => 'required|exists:subjects,id',
            'exam_date' => 'required|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'room' => 'nullable|string|max:100',
            'max_marks' => 'required|numeric|min:1|max:1000',
            'pass_marks' => 'required|numeric|min:0|lte:max_marks',
        ]);

        // Cross-entity validation: Ensure section belongs to class and school
        $section = Section::where('id', $request->section_id)
            ->where('school_class_id', $request->school_class_id)
            ->where('school_id', $schoolId)
            ->first();

        if (!$section) {
            return response()->json([
                'success' => false,
                'message' => 'The selected section does not belong to the specified class or school.',
            ], 422);
        }

        $exam = Exam::create([
            'school_id' => $schoolId,
            'academic_year_id' => $academicYearId,
            'exam_term_id' => $request->exam_term_id,
            'school_class_id' => $request->school_class_id,
            'section_id' => $request->section_id,
            'subject_id' => $request->subject_id,
            'exam_date' => $request->exam_date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'room' => $request->room,
            'max_marks' => $request->max_marks,
            'pass_marks' => $request->pass_marks,
            'status' => 'scheduled',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Examination paper scheduled successfully.',
            'data' => $exam->load(['examTerm', 'schoolClass', 'section', 'subject']),
        ], 201);
    }

    public function verifyExam(Request $request, $id)
    {
        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()->school_id;
        $exam = Exam::where('school_id', $schoolId)->findOrFail($id);

        $exam->update([
            'verified_at' => now(),
            'verified_by_user_id' => $request->user()->id,
            'status' => 'verified',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Exam marks verified by administrator.',
            'data' => $exam,
        ]);
    }

    public function lockExam(Request $request, $id)
    {
        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()->school_id;
        $user = $request->user();

        $exam = DB::transaction(function () use ($schoolId, $id, $user) {
            $exam = Exam::where('school_id', $schoolId)->lockForUpdate()->findOrFail($id);

            $term = $exam->examTerm;
            $scaleTiers = $term->gradingScale ? $term->gradingScale->tiers->toArray() : [];

            // Evaluate is_passed, grade, grade_point for all marks on lock
            $marks = ExamMark::where('exam_id', $exam->id)->get();
            foreach ($marks as $mark) {
                $special = strtoupper($mark->special_status ?? '');
                if ($special === 'AB') {
                    $mark->is_passed = false;
                } elseif ($special === 'ML' || $special === 'EX') {
                    $mark->is_passed = null;
                } else {
                    $obtained = (float)$mark->marks_obtained;
                    $max = (float)$exam->max_marks;
                    $pass = (float)$exam->pass_marks;
                    $mark->is_passed = ($obtained >= $pass);

                    $pct = $max > 0 ? round(($obtained / $max) * 100, 2) : 0.00;
                    $evaluated = GradingScaleValidationService::computeGradeForPercentage($pct, $scaleTiers);
                    $mark->grade = $evaluated['grade'];
                    $mark->grade_point = $evaluated['grade_point'];
                }
                $mark->save();
            }

            $exam->update([
                'status' => 'locked',
                'locked_at' => now(),
                'locked_by_user_id' => $user->id,
            ]);

            return $exam;
        });

        return response()->json([
            'success' => true,
            'message' => 'Exam paper locked successfully. Marks are now immutable for teachers.',
            'data' => $exam,
        ]);
    }

    public function unlockExam(Request $request, $id)
    {
        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()->school_id;
        $user = $request->user();

        $request->validate([
            'reason' => 'required|string|min:5|max:1000',
        ]);

        $exam = DB::transaction(function () use ($schoolId, $id, $user, $request) {
            $exam = Exam::where('school_id', $schoolId)->lockForUpdate()->findOrFail($id);

            $exam->update([
                'status' => 'draft',
                'unlocked_at' => now(),
                'unlocked_by_user_id' => $user->id,
                'unlock_reason' => $request->reason,
            ]);

            // Explicit audit log for unlock
            AuditLog::create([
                'school_id' => $schoolId,
                'user_id' => $user->id,
                'user_name' => $user->name,
                'user_role' => $user->role,
                'auditable_type' => Exam::class,
                'auditable_id' => $exam->id,
                'event' => 'unlocked',
                'old_values' => ['status' => 'locked'],
                'new_values' => ['status' => 'draft', 'reason' => $request->reason],
                'ip_address' => $request->ip(),
                'user_agent' => substr($request->userAgent() ?? '', 0, 500),
                'created_at' => now(),
            ]);

            return $exam;
        });

        return response()->json([
            'success' => true,
            'message' => 'Exam unlocked successfully for corrections.',
            'data' => $exam,
        ]);
    }

    public function publishTerm(Request $request, $id)
    {
        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()->school_id;
        $term = ExamTerm::where('school_id', $schoolId)->findOrFail($id);

        // 1. Verify every exam in this term is locked
        $exams = Exam::where('exam_term_id', $term->id)->get();
        if ($exams->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'Cannot publish term: no exam papers scheduled.'], 422);
        }

        $unlockedExams = $exams->where('status', '!=', 'locked');
        if ($unlockedExams->isNotEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot publish term: all exam papers must be locked before publishing.',
                'unlocked_papers_count' => $unlockedExams->count(),
            ], 422);
        }

        // 2. Verify all enrolled students have marks or special status
        foreach ($exams as $ex) {
            $studentsCount = Student::where('school_id', $schoolId)
                ->where('school_class_id', $ex->school_class_id)
                ->where('section_id', $ex->section_id)
                ->where('status', 'Active')
                ->count();

            $assessedCount = ExamMark::where('exam_id', $ex->id)
                ->where(function ($q) {
                    $q->whereNotNull('marks_obtained')
                      ->orWhereNotNull('special_status');
                })
                ->count();

            if ($assessedCount < $studentsCount) {
                return response()->json([
                    'success' => false,
                    'message' => "Cannot publish term: paper '{$ex->subject->name}' for section '{$ex->section->name}' has unassessed students ({$assessedCount}/{$studentsCount}).",
                ], 422);
            }
        }

        // 3. Freeze grading scale tiers snapshot on term
        $tiers = $term->gradingScale ? $term->gradingScale->tiers->toArray() : [];
        $term->grading_scale_snapshot = $tiers;
        $term->status = 'published';
        $term->published_at = now();
        $term->published_by_user_id = $request->user()->id;
        $term->save();

        // 4. Compute summaries, overall GPAs, and competition ranks
        $summariesCount = ExamRankingService::computeTermSummariesAndRanks($term);

        return response()->json([
            'success' => true,
            'message' => "Examination term published successfully to the student and parent portal. Generated {$summariesCount} report summaries.",
            'data' => $term->load('studentReportSummaries'),
        ]);
    }

    public function broadcastNotification(Request $request, $id)
    {
        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()->school_id;
        $term = ExamTerm::where('school_id', $schoolId)->findOrFail($id);

        if ($term->status !== 'published') {
            return response()->json(['success' => false, 'message' => 'Cannot broadcast notification: exam term is not published.'], 422);
        }

        // Strictly NO marks in notification message text
        $messageBody = "Dear {guardian_name}, the examination results for {$term->name} have been published. Please log in to the Parent Portal at " . url('/results') . " to view {student_name}'s official report card.";

        $campaign = CommunicationCampaign::create([
            'school_id' => $schoolId,
            'title' => "Exam Results Published: {$term->name}",
            'message_body' => $messageBody,
            'channel' => 'in_app',
            'audience_type' => 'all_parents',
            'target_roles' => ['student_parent'],
            'is_circular' => true,
            'status' => 'draft',
            'scheduled_at' => now(),
            'created_by_user_id' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Result notification broadcast campaign drafted successfully. Contains NO marks/grades.',
            'campaign_id' => $campaign->id,
            'message_preview' => $messageBody,
        ]);
    }
}

