<?php

namespace App\Http\Controllers\Api\StudentParent;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Student;
use App\Models\Syllabus;
use App\Models\SyllabusProgressLog;
use App\Models\SyllabusUnit;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class SyllabusController extends Controller
{
    /**
     * Get syllabus tree by subject and latest progress update logs.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $student = null;
        if ($user) {
            $student = Student::with('schoolClass')->where('user_id', $user->id)->first();
        }
        if (!$student) {
            $student = Student::with('schoolClass')->first();
        }

        $classId = $student ? $student->school_class_id : null;
        $className = $student && $student->schoolClass ? $student->schoolClass->name : 'Class 10';

        $syllabuses = Syllabus::with(['units', 'progressLogs'])->get();

        $tree = [];
        foreach ($syllabuses as $s) {
            $tree[$s->subject_key] = [
                'id' => $s->id,
                'name' => $s->subject_name,
                'code' => $s->subject_code,
                'teacher' => $s->teacher_name,
                'completion' => (int) $s->completion_percentage,
                'units' => $s->units->map(function ($u) {
                    return [
                        'id' => $u->id,
                        'unitNumber' => $u->unit_number,
                        'title' => $u->title,
                        'status' => $u->status,
                        'progress' => (int) $u->progress_percentage,
                        'lectures' => $u->lectures_info,
                        'topics' => $u->topics ?: [],
                    ];
                }),
            ];
        }

        $progressLogs = SyllabusProgressLog::orderBy('log_date', 'desc')->get()->map(function ($log) {
            return [
                'id' => $log->id,
                'subjectName' => $log->subject_name,
                'className' => $log->class_name ?: 'Grade 10-A',
                'unitTitle' => $log->unit_title,
                'date' => Carbon::parse($log->log_date)->format('d M Y'),
                'progress' => (int) $log->progress_percentage,
                'message' => $log->message,
                'teacherName' => $log->teacher_name,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'syllabus' => $tree,
                'progressLogs' => $progressLogs,
            ],
        ]);
    }

    /**
     * Store new syllabus progress log (by teacher) and notify student/parent.
     */
    public function storeLog(Request $request)
    {
        $request->validate([
            'syllabus_id' => 'nullable|exists:syllabuses,id',
            'subject_name' => 'required|string|max:255',
            'unit_title' => 'required|string|max:255',
            'progress_percentage' => 'required|integer|min:0|max:100',
            'message' => 'required|string|max:2000',
            'teacher_name' => 'nullable|string|max:255',
        ]);

        $teacher = $request->teacher_name ?: ($request->user() ? $request->user()->name : 'Dr. Ananya Sen');
        $syllabus = null;
        if ($request->filled('syllabus_id')) {
            $syllabus = Syllabus::find($request->syllabus_id);
        } else {
            $syllabus = Syllabus::where('subject_name', 'like', "%{$request->subject_name}%")->first();
        }

        $log = SyllabusProgressLog::create([
            'syllabus_id' => $syllabus ? $syllabus->id : 1,
            'subject_name' => $request->subject_name,
            'class_name' => 'Grade 10-A',
            'unit_title' => $request->unit_title,
            'log_date' => Carbon::now()->toDateString(),
            'progress_percentage' => $request->progress_percentage,
            'message' => $request->message,
            'teacher_name' => $teacher,
        ]);

        // Dispatch notifications to all student/parent users
        $studentUsers = User::where('role', 'student_parent')->get();
        foreach ($studentUsers as $stUser) {
            Notification::create([
                'user_id' => $stUser->id,
                'title' => "Syllabus Update: {$request->subject_name}",
                'message' => "{$teacher} updated {$request->unit_title} ({$request->progress_percentage}% completed). {$request->message}",
                'type' => 'academic',
                'link' => '/syllabus',
                'is_read' => false,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Syllabus progress updated and notifications dispatched to students and parents.',
            'data' => $log,
        ], 201);
    }
}
