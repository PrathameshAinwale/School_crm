<?php

namespace App\Http\Controllers\Api\StudentParent;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\SchoolCalendarEvent;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\Syllabus;
use App\Models\Timetable;
use Carbon\Carbon;
use Illuminate\Http\Request;

class StudentDashboardController extends Controller
{
    /**
     * Get dashboard summary tailored to logged in Student / Parent.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $student = null;
        if ($user) {
            $student = Student::with(['schoolClass', 'section'])->where('user_id', $user->id)->first();
        }
        if (!$student) {
            $student = Student::with(['schoolClass', 'section'])->first();
        }

        $studentId = $student ? $student->id : 1;
        $classId = $student ? $student->school_class_id : null;
        $className = $student && $student->schoolClass ? $student->schoolClass->name : 'Class 10';

        // 1. Overall Attendance Rate
        $totalDays = StudentAttendance::where('student_id', $studentId)->count();
        $presentDays = StudentAttendance::where('student_id', $studentId)->where('status', 'Present')->count();
        $attendanceRate = $totalDays > 0 ? round(($presentDays / $totalDays) * 100, 1) : 0;

        // 2. Average Syllabus Completion
        $syllabuses = Syllabus::with('units')->where(function ($q) use ($classId, $className) {
            if ($classId) $q->where('school_class_id', $classId);
            $q->orWhere('class_name', $className)->orWhereNull('school_class_id');
        })->get();

        $avgSyllabus = $syllabuses->count() > 0
            ? round($syllabuses->avg('completion_percentage'))
            : 0;

        // 3. Pending Assignments
        $allAssignments = Assignment::where(function ($q) use ($classId) {
            if ($classId) {
                $q->where('school_class_id', $classId);
            }
            $q->orWhereNull('school_class_id');
        })->get();

        $submittedIds = AssignmentSubmission::where('student_id', $studentId)->pluck('assignment_id')->toArray();
        $pendingAssignments = $allAssignments->filter(function ($a) use ($submittedIds) {
            return !in_array($a->id, $submittedIds);
        });

        // 4. Upcoming Events count
        $upcomingEventsCount = SchoolCalendarEvent::where('start_date', '>=', Carbon::now()->toDateString())->count();

        // 5. KPI Stats Cards
        $stats = [
            [
                'title' => 'Syllabus Covered',
                'value' => "{$avgSyllabus}%",
                'change' => $avgSyllabus > 0 ? "{$avgSyllabus}% completed" : 'In Progress',
                'trend' => 'up',
                'link' => '/syllabus',
                'subtext' => 'Academic Term Progress',
            ],
            [
                'title' => 'Overall Attendance',
                'value' => "{$attendanceRate}%",
                'change' => "{$presentDays} of {$totalDays} days",
                'trend' => 'up',
                'link' => '/attendance',
                'subtext' => "{$presentDays} of {$totalDays} days present",
            ],
            [
                'title' => 'Pending Homework',
                'value' => (string) $pendingAssignments->count(),
                'change' => $pendingAssignments->count() > 0 ? 'Due soon' : 'All clear',
                'trend' => $pendingAssignments->count() > 0 ? 'down' : 'up',
                'link' => '/assignment',
                'subtext' => $pendingAssignments->count() > 0 ? ($pendingAssignments->count() . ' pending task(s)') : 'All tasks completed',
            ],
            [
                'title' => 'Upcoming Events',
                'value' => (string) $upcomingEventsCount,
                'change' => "{$upcomingEventsCount} Scheduled",
                'trend' => 'up',
                'link' => '/calendar',
                'subtext' => 'School Calendar Events',
            ],
        ];

        // 6. Top 3 Syllabus items
        $topSyllabus = $syllabuses->take(3)->map(function ($s) {
            return [
                'subject' => $s->subject_name,
                'code' => $s->subject_code,
                'progress' => $s->completion_percentage,
                'totalChapters' => $s->units->count() ?: 6,
                'completedChapters' => $s->units->where('status', 'Completed')->count() ?: 3,
                'currentChapter' => $s->units->where('status', 'In Progress')->first()?->title ?? 'In Progress',
                'teacher' => $s->teacher_name,
            ];
        });

        // 7. Today's Period Timetable
        $todayDay = Carbon::now()->format('l'); // Monday, etc.
        $dayQuery = in_array($todayDay, ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']) ? $todayDay : 'Monday';
        $todayTimetable = Timetable::where('day_of_week', $dayQuery)
            ->where(function ($q) use ($classId, $className) {
                if ($classId) $q->where('school_class_id', $classId);
                $q->orWhere('class_name', $className)->orWhereNull('school_class_id');
            })
            ->orderBy('period_number', 'asc')
            ->get();

        // 8. Upcoming 3 Calendar Events
        $topCalendarEvents = SchoolCalendarEvent::orderBy('start_date', 'asc')->take(3)->get();

        return response()->json([
            'success' => true,
            'data' => [
                'student' => [
                    'id' => $student ? $student->id : null,
                    'name' => $student ? $student->full_name : 'Student',
                    'admissionNo' => $student ? $student->admission_number : '',
                    'rollNo' => $student ? ($student->roll_number ?: '') : '',
                    'className' => $className,
                    'section' => $student && $student->section ? $student->section->name : '',
                    'attendanceRate' => "{$attendanceRate}%",
                ],
                'stats' => $stats,
                'topSyllabus' => $topSyllabus,
                'todayTimetable' => $todayTimetable,
                'topCalendarEvents' => $topCalendarEvents,
                'urgentAssignments' => $pendingAssignments->take(3)->values(),
            ],
        ]);
    }
}
