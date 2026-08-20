<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Notification;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Teacher;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AssignmentController extends Controller
{
    /**
     * Helper to resolve school_class_id from name or ID.
     */
    private function resolveClassId($classInput)
    {
        if (!$classInput || strtolower($classInput) === 'all') {
            return null;
        }

        $matchedClass = SchoolClass::where('name', $classInput)
            ->orWhere('name', 'Class ' . $classInput)
            ->orWhere('name', 'like', "%{$classInput}%")
            ->first();

        if ($matchedClass) {
            return $matchedClass->id;
        }

        if (is_numeric($classInput)) {
            return (int) $classInput;
        }

        return null;
    }

    /**
     * List assignments.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Assignment::with(['teacher', 'schoolClass', 'section', 'subject', 'submissions.student'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('school_class_id')) {
            $resolvedClassId = $this->resolveClassId($request->school_class_id);
            if ($resolvedClassId) {
                $query->where('school_class_id', $resolvedClassId);
            }
        }

        if ($request->filled('subject') && strtolower($request->subject) !== 'all') {
            $query->where('subject_name', 'like', "%{$request->subject}%");
        }

        if ($request->filled('status') && strtolower($request->status) !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                  ->orWhere('description', 'like', "%{$s}%")
                  ->orWhere('subject_name', 'like', "%{$s}%");
            });
        }

        // If logged in user is a student, we can find student ID
        $student = null;
        if ($user && $user->role === 'student_parent') {
            $student = Student::where('user_id', $user->id)->first();
            if ($student && $student->school_class_id) {
                $query->where('school_class_id', $student->school_class_id);
            }
        }

        $assignments = $query->get();

        $data = $assignments->map(function ($asn) use ($student) {
            $classStudentsCount = Student::where('school_class_id', $asn->school_class_id)
                ->where('status', 'Active')
                ->count();

            $submissions = $asn->submissions;
            $submittedCount = $submissions->whereIn('status', ['Submitted', 'Graded', 'Late'])->count();
            $gradedCount = $submissions->where('status', 'Graded')->count();

            $studentSubmission = null;
            if ($student) {
                $sub = $submissions->firstWhere('student_id', $student->id);
                if ($sub) {
                    $studentSubmission = [
                        'id' => $sub->id,
                        'status' => $sub->status,
                        'submission_text' => $sub->submission_text,
                        'attachment_url' => $sub->attachment_url,
                        'attachment_name' => $sub->attachment_name,
                        'score' => $sub->score,
                        'teacher_feedback' => $sub->teacher_feedback,
                        'submitted_at' => $sub->submitted_at ? $sub->submitted_at->format('M d, Y h:i A') : null,
                    ];
                }
            }

            return [
                'id' => $asn->id,
                'class_id' => $asn->school_class_id,
                'class_name' => $asn->schoolClass ? $asn->schoolClass->name : 'All Classes',
                'section_name' => $asn->section ? $asn->section->name : null,
                'subject' => $asn->subject_name ?: ($asn->subject ? $asn->subject->name : 'General'),
                'title' => $asn->title,
                'description' => $asn->description,
                'instructions' => $asn->description,
                'teacher' => $asn->teacher ? $asn->teacher->full_name : 'Teacher Faculty',
                'teacher_id' => $asn->teacher_id,
                'assigned_date' => $asn->created_at->format('M d, Y'),
                'due_date' => $asn->due_date ? $asn->due_date->format('M d, Y') : 'No Due Date',
                'due_date_raw' => $asn->due_date ? $asn->due_date->toDateString() : null,
                'due_time' => $asn->due_time,
                'max_marks' => $asn->max_marks . ' Marks',
                'max_marks_num' => $asn->max_marks,
                'priority' => $asn->priority,
                'status' => $asn->status,
                'attachment' => $asn->attachment_name,
                'attachment_url' => $asn->attachment_url,
                'attachment_type' => $asn->attachment_type,
                'total_students' => $classStudentsCount,
                'submitted_count' => $submittedCount,
                'graded_count' => $gradedCount,
                'submissions_count' => "{$submittedCount} / {$classStudentsCount} Submitted",
                'my_submission' => $studentSubmission,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Create / Store a new assignment (with optional attachment) and trigger notifications.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'school_class_id' => 'required',
            'subject' => 'nullable|string|max:100',
            'subject_name' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'due_time' => 'nullable|string',
            'max_marks' => 'nullable|integer',
            'priority' => 'nullable|in:Low,Medium,High',
            'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png,webp,doc,docx|max:10240', // max 10MB
        ]);

        $user = $request->user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        $resolvedClassId = $this->resolveClassId($request->school_class_id);
        $schoolClass = SchoolClass::find($resolvedClassId);

        $attachmentUrl = null;
        $attachmentName = null;
        $attachmentType = null;

        // Handle uploaded file
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $originalName = $file->getClientOriginalName();
            $ext = strtolower($file->getClientOriginalExtension());
            $filename = time() . '_' . Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) . '.' . $ext;
            
            // Store directly in public/uploads/assignments
            $destinationPath = public_path('uploads/assignments');
            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0777, true);
            }
            $file->move($destinationPath, $filename);

            $attachmentUrl = asset('uploads/assignments/' . $filename);
            $attachmentName = $originalName;
            $attachmentType = in_array($ext, ['jpg', 'jpeg', 'png', 'webp']) ? 'image' : ($ext === 'pdf' ? 'pdf' : 'doc');
        } elseif ($request->filled('attachment_url')) {
            $attachmentUrl = $request->attachment_url;
            $attachmentName = $request->attachment_name ?: 'Attachment';
            $attachmentType = $request->attachment_type ?: 'pdf';
        }

        $subjectName = $request->subject_name ?: ($request->subject ?: 'General');

        $assignment = Assignment::create([
            'teacher_id' => $teacher ? $teacher->id : null,
            'school_class_id' => $resolvedClassId,
            'subject_name' => $subjectName,
            'title' => $request->title,
            'description' => $request->description,
            'due_date' => $request->due_date,
            'due_time' => $request->due_time ?: '17:00',
            'max_marks' => $request->max_marks ?: 100,
            'priority' => $request->priority ?: 'Medium',
            'attachment_url' => $attachmentUrl,
            'attachment_name' => $attachmentName,
            'attachment_type' => $attachmentType,
            'status' => 'Active',
        ]);

        // Trigger Notifications for all active students in target class
        if ($resolvedClassId) {
            $students = Student::where('school_class_id', $resolvedClassId)
                ->where('status', 'Active')
                ->get();

            $className = $schoolClass ? $schoolClass->name : 'Your Class';
            $dueDateFormatted = $assignment->due_date ? Carbon::parse($assignment->due_date)->format('M d, Y') : 'soon';

            foreach ($students as $stu) {
                Notification::create([
                    'user_id' => $stu->user_id,
                    'school_class_id' => $resolvedClassId,
                    'role' => 'student_parent',
                    'title' => "New Assignment: {$assignment->title}",
                    'message' => "Teacher published a new {$subjectName} assignment for {$className}. Due on {$dueDateFormatted}.",
                    'type' => 'assignment',
                    'link' => '/assignment',
                    'is_read' => false,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Assignment published successfully and students have been notified!',
            'data' => $assignment,
        ], 201);
    }

    /**
     * Show single assignment.
     */
    public function show($id)
    {
        $assignment = Assignment::with(['teacher', 'schoolClass', 'section', 'subject', 'submissions.student'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $assignment,
        ]);
    }

    /**
     * Get submissions roster for an assignment (Teacher view).
     */
    public function submissions($id)
    {
        $assignment = Assignment::with(['schoolClass'])->findOrFail($id);

        $students = Student::with(['section'])
            ->where('school_class_id', $assignment->school_class_id)
            ->where('status', 'Active')
            ->orderBy('roll_number', 'asc')
            ->orderBy('first_name', 'asc')
            ->get();

        $submissions = AssignmentSubmission::where('assignment_id', $id)
            ->get()
            ->keyBy('student_id');

        $roster = $students->map(function ($stu) use ($submissions, $assignment) {
            $sub = $submissions->get($stu->id);
            return [
                'submission_id' => $sub ? $sub->id : null,
                'student_id' => $stu->id,
                'student_name' => $stu->full_name,
                'admission_number' => $stu->admission_number,
                'roll_number' => $stu->roll_number,
                'section_name' => $stu->section ? $stu->section->name : null,
                'status' => $sub ? $sub->status : 'Pending',
                'submission_text' => $sub ? $sub->submission_text : null,
                'attachment_url' => $sub ? $sub->attachment_url : null,
                'attachment_name' => $sub ? $sub->attachment_name : null,
                'attachment_type' => $sub ? $sub->attachment_type : null,
                'score' => $sub ? $sub->score : null,
                'max_marks' => $assignment->max_marks,
                'teacher_feedback' => $sub ? $sub->teacher_feedback : null,
                'submitted_at' => $sub && $sub->submitted_at ? $sub->submitted_at->format('M d, Y h:i A') : null,
                'graded_at' => $sub && $sub->graded_at ? $sub->graded_at->format('M d, Y h:i A') : null,
            ];
        });

        $total = $roster->count();
        $submitted = $roster->whereIn('status', ['Submitted', 'Graded', 'Late'])->count();
        $graded = $roster->where('status', 'Graded')->count();
        $pending = $roster->where('status', 'Pending')->count();

        return response()->json([
            'success' => true,
            'assignment' => [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'subject' => $assignment->subject_name,
                'class_name' => $assignment->schoolClass ? $assignment->schoolClass->name : null,
                'due_date' => $assignment->due_date ? $assignment->due_date->format('M d, Y') : null,
                'max_marks' => $assignment->max_marks,
                'attachment_url' => $assignment->attachment_url,
                'attachment_name' => $assignment->attachment_name,
            ],
            'summary' => [
                'total' => $total,
                'submitted' => $submitted,
                'graded' => $graded,
                'pending' => $pending,
            ],
            'data' => $roster,
        ]);
    }

    /**
     * Submit assignment work (Student view).
     */
    public function submitWork(Request $request, $id)
    {
        $assignment = Assignment::findOrFail($id);
        $user = $request->user();

        $student = null;
        if ($user) {
            $student = Student::where('user_id', $user->id)
                ->orWhere('guardian_email', $user->email)
                ->first();
        }
        if (!$student && $request->filled('student_id')) {
            $student = Student::find($request->student_id);
        }
        if (!$student) {
            // fallback: find active student in class
            $student = Student::where('school_class_id', $assignment->school_class_id)->first();
        }

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student record not found for the current account.',
            ], 404);
        }

        $request->validate([
            'submission_text' => 'nullable|string',
            'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png,webp,doc,docx|max:10240',
        ]);

        $attachmentUrl = null;
        $attachmentName = null;
        $attachmentType = null;

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $originalName = $file->getClientOriginalName();
            $ext = strtolower($file->getClientOriginalExtension());
            $filename = 'sub_' . time() . '_' . Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) . '.' . $ext;
            
            $destinationPath = public_path('uploads/submissions');
            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0777, true);
            }
            $file->move($destinationPath, $filename);

            $attachmentUrl = asset('uploads/submissions/' . $filename);
            $attachmentName = $originalName;
            $attachmentType = in_array($ext, ['jpg', 'jpeg', 'png', 'webp']) ? 'image' : ($ext === 'pdf' ? 'pdf' : 'doc');
        } elseif ($request->filled('attachment_url')) {
            $attachmentUrl = $request->attachment_url;
            $attachmentName = $request->attachment_name ?: 'Submission_File';
            $attachmentType = $request->attachment_type ?: 'pdf';
        }

        $now = Carbon::now();
        $isLate = $assignment->due_date && $now->greaterThan(Carbon::parse($assignment->due_date)->endOfDay());

        $submission = AssignmentSubmission::updateOrCreate(
            [
                'assignment_id' => $assignment->id,
                'student_id' => $student->id,
            ],
            [
                'status' => $isLate ? 'Late' : 'Submitted',
                'submission_text' => $request->submission_text,
                'attachment_url' => $attachmentUrl,
                'attachment_name' => $attachmentName,
                'attachment_type' => $attachmentType,
                'submitted_at' => $now,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Assignment submitted successfully!',
            'data' => $submission,
        ]);
    }

    /**
     * Grade a student submission (Teacher view).
     */
    public function gradeSubmission(Request $request, $id, $submissionId)
    {
        $request->validate([
            'score' => 'required|integer|min:0',
            'teacher_feedback' => 'nullable|string',
        ]);

        $submission = AssignmentSubmission::where('assignment_id', $id)
            ->where('id', $submissionId)
            ->firstOrFail();

        $submission->update([
            'score' => $request->score,
            'teacher_feedback' => $request->teacher_feedback,
            'status' => 'Graded',
            'graded_at' => Carbon::now(),
        ]);

        // Send notification to student that assignment has been graded
        if ($submission->student && $submission->student->user_id) {
            Notification::create([
                'user_id' => $submission->student->user_id,
                'school_class_id' => $submission->student->school_class_id,
                'role' => 'student_parent',
                'title' => "Assignment Graded: {$submission->assignment->title}",
                'message' => "Your submission was graded. Score: {$request->score}/{$submission->assignment->max_marks}.",
                'type' => 'assignment',
                'link' => '/assignment',
                'is_read' => false,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Submission graded successfully!',
            'data' => $submission,
        ]);
    }
}
