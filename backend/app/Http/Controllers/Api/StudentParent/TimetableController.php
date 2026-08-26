<?php

namespace App\Http\Controllers\Api\StudentParent;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Timetable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TimetableController extends Controller
{
    /**
     * Get weekly period timetable for a class (student or teacher view).
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $student = null;
        $teacher = null;

        if ($user) {
            if ($user->role === 'teacher') {
                $teacher = Teacher::where('user_id', $user->id)
                    ->orWhere('email', $user->email)
                    ->first();
            } else {
                $student = Student::with(['schoolClass', 'section'])->where('user_id', $user->id)->first();
            }
        }

        // Determine requested class & division
        if ($request->filled('class_name')) {
            $className = $request->class_name;
        } elseif ($student && $student->schoolClass) {
            $className = $student->schoolClass->name;
        } elseif ($teacher && $teacher->class_teacher_class) {
            $className = $teacher->class_teacher_class;
        } elseif ($teacher && !empty($teacher->assigned_classes)) {
            $className = is_array($teacher->assigned_classes) ? $teacher->assigned_classes[0] : $teacher->assigned_classes;
        } else {
            $className = 'Class 10';
        }

        $division = $request->input('division', ($teacher && $teacher->class_teacher_division ? $teacher->class_teacher_division : 'Div A'));
        $sectionName = $student && $student->section ? $student->section->name : 'Saffron A';

        // Find Class Teacher assigned to this class
        $classTeacherObj = Teacher::where('class_teacher_class', $className);
        if ($division) {
            $classTeacherObj->where(function($q) use ($division) {
                $q->where('class_teacher_division', $division)
                  ->orWhereNull('class_teacher_division');
            });
        }
        $classTeacherObj = $classTeacherObj->first();

        $classTeacherName = $classTeacherObj ? $classTeacherObj->full_name : ($teacher ? $teacher->full_name : 'Class In-Charge');

        $query = Timetable::where('class_name', $className);
        if ($division) {
            $query->where('division', $division);
        }
        $allPeriods = $query->orderBy('period_number', 'asc')->get();

        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        $grouped = [];

        foreach ($days as $day) {
            $dayList = $allPeriods->where('day_of_week', $day)->values();
            $grouped[$day] = $dayList->map(function ($p) {
                return [
                    'id' => $p->id,
                    'period' => $p->period_name ?: 'Period ' . $p->period_number,
                    'period_number' => $p->period_number,
                    'time' => $p->time_slot,
                    'subject' => $p->subject,
                    'teacher' => $p->teacher_name,
                    'room' => $p->room,
                    'type' => $p->type,
                    'division' => $p->division ?: 'Div A',
                    'created_by_teacher_id' => $p->created_by_teacher_id,
                ];
            });
        }

        // Available classes list
        $classesList = SchoolClass::orderBy('id')->pluck('name')->toArray();
        if (empty($classesList) || count($classesList) < 5) {
            $classesList = [
                'Nursery', 'LKG', 'UKG',
                'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
                'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
                'Class 11', 'Class 12'
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'className' => $className,
                'division' => $division,
                'sectionName' => $sectionName,
                'homeroom' => 'Room 301',
                'classTeacher' => $classTeacherName,
                'timetable' => $grouped,
                'availableClasses' => $classesList,
                'availableDivisions' => ['Div A', 'Div B', 'Div C', 'Div D'],
                'availableTeachers' => Teacher::where('status', 'Active')->orWhereNull('status')->orderBy('first_name')->get()->map(function($t) {
                    return [
                        'id' => $t->id,
                        'name' => $t->full_name,
                        'department' => $t->department ?: '',
                    ];
                }),
                'teacherInfo' => $teacher ? [
                    'id' => $teacher->id,
                    'name' => $teacher->full_name,
                    'classTeacherFor' => $teacher->class_teacher_class,
                    'classTeacherDivision' => $teacher->class_teacher_division ?: 'Div A',
                    'assignedClasses' => $teacher->assigned_classes,
                ] : null,
            ],
        ]);
    }

    /**
     * Store new timetable period slot.
     */
    public function store(Request $request)
    {
        $request->validate([
            'day_of_week' => 'required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
            'period_number' => 'required|integer|min:1|max:10',
            'time_slot' => 'required|string|max:50',
            'subject' => 'required|string|max:100',
            'teacher_name' => 'required|string|max:255',
            'room' => 'nullable|string|max:50',
            'type' => 'nullable|string|max:50',
            'class_name' => 'nullable|string|max:50',
            'division' => 'nullable|string|max:50',
        ]);

        $className = $request->class_name ?: 'Class 10';
        $division = $request->division ?: 'Div A';
        $user = $request->user();
        $teacher = $user ? Teacher::where('user_id', $user->id)->first() : null;
        $teacherId = $teacher ? $teacher->id : null;

        $period = Timetable::updateOrCreate(
            [
                'class_name' => $className,
                'division' => $division,
                'day_of_week' => $request->day_of_week,
                'period_number' => $request->period_number,
            ],
            [
                'created_by_teacher_id' => $teacherId,
                'period_name' => 'Period ' . $request->period_number,
                'time_slot' => $request->time_slot,
                'subject' => $request->subject,
                'teacher_name' => $request->teacher_name,
                'room' => $request->room ?: 'Room 301',
                'type' => $request->type ?: 'Theory',
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Timetable slot saved successfully.',
            'data' => $period,
        ], 201);
    }

    /**
     * Save bulk timetable for a class, division, and day.
     */
    public function saveBulk(Request $request)
    {
        $request->validate([
            'class_name' => 'required|string|max:50',
            'division' => 'nullable|string|max:50',
            'day_of_week' => 'required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
            'periods' => 'required|array',
            'periods.*.period_number' => 'required|integer|min:1|max:10',
            'periods.*.time_slot' => 'required|string|max:50',
            'periods.*.subject' => 'required|string|max:100',
            'periods.*.teacher_name' => 'required|string|max:255',
            'periods.*.room' => 'nullable|string|max:50',
            'periods.*.type' => 'nullable|string|max:50',
        ]);

        $className = $request->class_name;
        $division = $request->division ?: 'Div A';
        $dayOfWeek = $request->day_of_week;
        $user = $request->user();
        $teacher = $user ? Teacher::where('user_id', $user->id)->first() : null;
        $teacherId = $teacher ? $teacher->id : null;
        $creatorName = $teacher ? $teacher->full_name : ($user ? $user->name : 'Class Teacher');

        DB::transaction(function () use ($className, $division, $dayOfWeek, $teacherId, $creatorName, $request) {
            // Delete existing slots for this day, class & division
            Timetable::where('class_name', $className)
                ->where('division', $division)
                ->where('day_of_week', $dayOfWeek)
                ->delete();

            // Insert new slots and notify assigned teachers
            foreach ($request->periods as $idx => $p) {
                Timetable::create([
                    'school_class_id' => null,
                    'created_by_teacher_id' => $teacherId,
                    'class_name' => $className,
                    'division' => $division,
                    'day_of_week' => $dayOfWeek,
                    'period_name' => 'Period ' . ($p['period_number'] ?? ($idx + 1)),
                    'period_number' => $p['period_number'] ?? ($idx + 1),
                    'time_slot' => $p['time_slot'],
                    'subject' => $p['subject'],
                    'teacher_name' => $p['teacher_name'],
                    'room' => $p['room'] ?? 'Room 301',
                    'type' => $p['type'] ?? 'Theory',
                ]);

                // Check if assigned to another teacher to send notification
                $targetTeacherName = trim($p['teacher_name']);
                if ($targetTeacherName && $targetTeacherName !== $creatorName) {
                    $targetTeacher = Teacher::where(function ($q) use ($targetTeacherName) {
                        $q->where('first_name', 'like', "%{$targetTeacherName}%")
                          ->orWhere('last_name', 'like', "%{$targetTeacherName}%")
                          ->orWhere(DB::raw("CONCAT(first_name, ' ', last_name)"), 'like', "%{$targetTeacherName}%");
                    })->first();

                    if ($targetTeacher && $targetTeacher->user_id && $targetTeacher->id !== $teacherId) {
                        Notification::create([
                            'user_id' => $targetTeacher->user_id,
                            'title' => "New Lecture Assigned: {$className} ({$division}) - {$p['subject']}",
                            'message' => "Class Teacher {$creatorName} scheduled you for {$p['subject']} on {$dayOfWeek} at {$p['time_slot']} (Room: " . ($p['room'] ?? 'Room 301') . ") in {$className} - {$division}.",
                            'type' => 'timetable',
                            'link' => '/teacher/schedule',
                            'is_read' => false,
                        ]);
                    }
                }
            }
        });

        return response()->json([
            'success' => true,
            'message' => "Timetable for {$className} ({$division}) on {$dayOfWeek} saved successfully.",
        ]);
    }

    /**
     * Delete a single timetable period.
     */
    public function destroy($id)
    {
        $period = Timetable::findOrFail($id);
        $period->delete();

        return response()->json([
            'success' => true,
            'message' => 'Period slot deleted.',
        ]);
    }

    /**
     * Clear all periods for a specific day, class & division.
     */
    public function clearDay(Request $request)
    {
        $request->validate([
            'class_name' => 'required|string|max:50',
            'day_of_week' => 'required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
        ]);

        $query = Timetable::where('class_name', $request->class_name)
            ->where('day_of_week', $request->day_of_week);

        if ($request->filled('division')) {
            $query->where('division', $request->division);
        }

        $query->delete();

        return response()->json([
            'success' => true,
            'message' => "Schedule for {$request->day_of_week} cleared.",
        ]);
    }

    /**
     * Get all timetable periods across all classes for conflict checking.
     */
    public function allSlots(Request $request)
    {
        $query = Timetable::query();
        if ($request->filled('day_of_week')) {
            $query->where('day_of_week', $request->day_of_week);
        }

        $slots = $query->orderBy('day_of_week')->orderBy('period_number')->get([
            'id',
            'class_name',
            'division',
            'day_of_week',
            'period_name',
            'period_number',
            'time_slot',
            'subject',
            'teacher_name',
            'room',
            'type',
            'created_by_teacher_id'
        ]);

        return response()->json([
            'success' => true,
            'data' => $slots,
            'total' => $slots->count(),
        ]);
    }
}

