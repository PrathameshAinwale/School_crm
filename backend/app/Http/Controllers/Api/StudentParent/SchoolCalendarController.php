<?php

namespace App\Http\Controllers\Api\StudentParent;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\SchoolCalendarEvent;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Teacher;
use Carbon\Carbon;
use Illuminate\Http\Request;

class SchoolCalendarController extends Controller
{
    /**
     * Get academic calendar events & holidays (filtered by class/type if provided).
     */
    public function index(Request $request)
    {
        $query = SchoolCalendarEvent::query();

        if ($request->filled('type') && strtolower($request->type) !== 'all') {
            $query->where(function ($q) use ($request) {
                $q->where('event_type', $request->type)
                  ->orWhere('category', $request->type);
            });
        }

        if ($request->filled('class_name') && strtolower($request->class_name) !== 'all') {
            $className = $request->class_name;
            $query->where(function ($q) use ($className) {
                $q->whereNull('target_classes')
                  ->orWhereJsonContains('target_classes', 'All')
                  ->orWhereJsonContains('target_classes', $className);
            });
        }

        $events = $query->orderBy('start_date', 'asc')->get();

        if ($events->count() === 0) {
            $defaultEvents = [
                [
                    'id' => 1,
                    'db_id' => 1,
                    'title' => 'Term 1 Mid-Term Assessments & Practical Examinations',
                    'type' => 'Examination',
                    'category' => 'Examination',
                    'date' => Carbon::now()->addDays(9)->format('M d, Y') . ' - ' . Carbon::now()->addDays(19)->format('M d, Y'),
                    'startDate' => Carbon::now()->addDays(9)->toDateString(),
                    'endDate' => Carbon::now()->addDays(19)->toDateString(),
                    'start_date' => Carbon::now()->addDays(9)->toDateString(),
                    'end_date' => Carbon::now()->addDays(19)->toDateString(),
                    'time' => '08:30 AM - 11:30 AM',
                    'venue' => 'Main Examination Hall & Science Labs',
                    'audience' => 'Classes 9 to 12',
                    'target_classes' => ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
                    'coordinator' => 'Dr. Ananya Sen (Exam Controller)',
                    'status' => 'Upcoming',
                    'month' => Carbon::now()->addDays(9)->format('F Y'),
                    'desc' => 'Comprehensive mid-term evaluation covering 50% term syllabus across Theory, Numericals and Practical Lab viva.',
                    'description' => 'Comprehensive mid-term evaluation covering 50% term syllabus across Theory, Numericals and Practical Lab viva.',
                ],
                [
                    'id' => 2,
                    'db_id' => 2,
                    'title' => 'Parent-Teacher Meeting (PTM) & Term Progress Review',
                    'type' => 'Meeting',
                    'category' => 'Meeting',
                    'date' => Carbon::now()->addDays(24)->format('M d, Y'),
                    'startDate' => Carbon::now()->addDays(24)->toDateString(),
                    'endDate' => Carbon::now()->addDays(24)->toDateString(),
                    'start_date' => Carbon::now()->addDays(24)->toDateString(),
                    'end_date' => Carbon::now()->addDays(24)->toDateString(),
                    'time' => '09:00 AM - 01:00 PM',
                    'venue' => 'Respective Homeroom Classrooms',
                    'audience' => 'All Parents & Students',
                    'target_classes' => ['All'],
                    'coordinator' => 'Class Teachers & Section Heads',
                    'status' => 'Upcoming',
                    'month' => Carbon::now()->addDays(24)->format('F Y'),
                    'desc' => 'Mandatory one-on-one parent faculty consultation to review unit test answer sheets, behavioral growth, and remedial coaching.',
                    'description' => 'Mandatory one-on-one parent faculty consultation to review unit test answer sheets, behavioral growth, and remedial coaching.',
                ],
                [
                    'id' => 3,
                    'db_id' => 3,
                    'title' => 'Annual Inter-School Science, Robotics & AI Exhibition',
                    'type' => 'Activity',
                    'category' => 'Activity',
                    'date' => Carbon::now()->addDays(38)->format('M d, Y'),
                    'startDate' => Carbon::now()->addDays(38)->toDateString(),
                    'endDate' => Carbon::now()->addDays(39)->toDateString(),
                    'start_date' => Carbon::now()->addDays(38)->toDateString(),
                    'end_date' => Carbon::now()->addDays(39)->toDateString(),
                    'time' => '10:00 AM - 04:00 PM',
                    'venue' => 'School Auditorium & STEM Innovation Hub',
                    'audience' => 'Students, Parents & Visiting Schools',
                    'target_classes' => ['All'],
                    'coordinator' => 'Mr. Vikram Rathore & Mrs. Deepa K.',
                    'status' => 'Upcoming',
                    'month' => Carbon::now()->addDays(38)->format('F Y'),
                    'desc' => 'Showcasing working prototypes, clean energy exhibits, autonomous drone demos, and AI chatbots engineered by students.',
                    'description' => 'Showcasing working prototypes, clean energy exhibits, autonomous drone demos, and AI chatbots engineered by students.',
                ],
                [
                    'id' => 4,
                    'db_id' => 4,
                    'title' => 'Mahatma Gandhi Jayanti & Swachhata Pakhwada',
                    'type' => 'Holiday',
                    'category' => 'Holiday',
                    'date' => Carbon::create(Carbon::now()->year, 10, 2)->format('M d, Y'),
                    'startDate' => Carbon::create(Carbon::now()->year, 10, 2)->toDateString(),
                    'endDate' => Carbon::create(Carbon::now()->year, 10, 2)->toDateString(),
                    'start_date' => Carbon::create(Carbon::now()->year, 10, 2)->toDateString(),
                    'end_date' => Carbon::create(Carbon::now()->year, 10, 2)->toDateString(),
                    'time' => 'Gazetted Holiday',
                    'venue' => 'Campus Closed',
                    'audience' => 'All',
                    'target_classes' => ['All'],
                    'coordinator' => 'Administration',
                    'status' => 'Scheduled',
                    'month' => 'October ' . Carbon::now()->year,
                    'desc' => 'National Holiday in observance of Mahatma Gandhi Jayanti. School remains closed for all academic divisions.',
                    'description' => 'National Holiday in observance of Mahatma Gandhi Jayanti. School remains closed for all academic divisions.',
                ],
                [
                    'id' => 5,
                    'db_id' => 5,
                    'title' => 'Annual Track & Field Sports Meet 2026',
                    'type' => 'Sports',
                    'category' => 'Sports',
                    'date' => Carbon::now()->addDays(65)->format('M d, Y'),
                    'startDate' => Carbon::now()->addDays(65)->toDateString(),
                    'endDate' => Carbon::now()->addDays(66)->toDateString(),
                    'start_date' => Carbon::now()->addDays(65)->toDateString(),
                    'end_date' => Carbon::now()->addDays(66)->toDateString(),
                    'time' => '07:30 AM - 03:00 PM',
                    'venue' => 'Main Athletics Stadium & Synthetic Track',
                    'audience' => 'Students, Parents & Alumni',
                    'target_classes' => ['All'],
                    'coordinator' => 'Coach R. Yadav (Director of Physical Education)',
                    'status' => 'Upcoming',
                    'month' => Carbon::now()->addDays(65)->format('F Y'),
                    'desc' => 'March-past parade, inter-house 100m/400m relays, high jump, shot put finals, and presentation of the Champions Rolling Trophy.',
                    'description' => 'March-past parade, inter-house 100m/400m relays, high jump, shot put finals, and presentation of the Champions Rolling Trophy.',
                ],
            ];

            return response()->json([
                'success' => true,
                'data' => $defaultEvents,
                'events' => $defaultEvents,
            ]);
        }

        $formatted = $events->map(function ($e) {
            $classes = is_array($e->target_classes) ? $e->target_classes : ($e->target_classes ? json_decode($e->target_classes, true) : ['All']);
            return [
                'id' => $e->id,
                'db_id' => $e->id,
                'title' => $e->title,
                'type' => $e->event_type ?: $e->category,
                'category' => $e->category ?: $e->event_type,
                'date' => $e->date_label ?: ($e->start_date ? Carbon::parse($e->start_date)->format('M d, Y') : ''),
                'startDate' => $e->start_date ? Carbon::parse($e->start_date)->toDateString() : null,
                'endDate' => $e->end_date ? Carbon::parse($e->end_date)->toDateString() : null,
                'start_date' => $e->start_date ? Carbon::parse($e->start_date)->toDateString() : null,
                'end_date' => $e->end_date ? Carbon::parse($e->end_date)->toDateString() : null,
                'start_time' => $e->start_time,
                'end_time' => $e->end_time,
                'time' => $e->time_slot ?: ($e->start_time ? ($e->start_time . ($e->end_time ? ' - ' . $e->end_time : '')) : 'Full Day'),
                'venue' => $e->venue ?: 'Campus',
                'audience' => $e->audience ?: 'School Community',
                'target_classes' => $classes ?: ['All'],
                'coordinator' => $e->coordinator,
                'speaker' => $e->speaker,
                'status' => $e->status ?: 'Upcoming',
                'month' => $e->month_label ?: ($e->start_date ? Carbon::parse($e->start_date)->format('F Y') : ''),
                'desc' => $e->description,
                'description' => $e->description,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formatted,
            'events' => $formatted,
        ]);
    }

    /**
     * Store new calendar event (Admin / HR).
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'event_type' => 'nullable|string|max:100',
            'category' => 'nullable|string|max:100',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'start_time' => 'nullable|string|max:50',
            'end_time' => 'nullable|string|max:50',
            'time_slot' => 'nullable|string|max:100',
            'venue' => 'nullable|string|max:150',
            'target_classes' => 'nullable',
            'audience' => 'nullable|string|max:255',
            'coordinator' => 'nullable|string|max:150',
            'speaker' => 'nullable|string|max:150',
            'description' => 'nullable|string|max:2000',
        ]);

        $eventType = $request->event_type ?: ($request->category ?: 'Event');
        $startDate = Carbon::parse($request->start_date);
        $dateLabel = $startDate->format('M d, Y');

        if ($request->filled('end_date') && $request->end_date !== $request->start_date) {
            $endDate = Carbon::parse($request->end_date);
            $dateLabel = $startDate->format('M d') . ' - ' . $endDate->format('M d, Y');
        }

        // Format time slot
        $timeSlot = $request->time_slot;
        if (!$timeSlot) {
            if ($request->filled('start_time') && $request->filled('end_time')) {
                $timeSlot = $request->start_time . ' - ' . $request->end_time;
            } elseif ($request->filled('start_time')) {
                $timeSlot = $request->start_time;
            } else {
                $timeSlot = ($eventType === 'Holiday') ? 'Full Day' : '09:00 AM - 01:00 PM';
            }
        }

        // Format target classes array
        $targetClasses = ['All'];
        if ($request->has('target_classes')) {
            $rawClasses = $request->target_classes;
            if (is_array($rawClasses)) {
                $targetClasses = array_values(array_filter($rawClasses));
            } elseif (is_string($rawClasses)) {
                $decoded = json_decode($rawClasses, true);
                if (is_array($decoded)) {
                    $targetClasses = array_values(array_filter($decoded));
                } else {
                    $targetClasses = array_map('trim', explode(',', $rawClasses));
                }
            }
        }

        $audience = $request->audience;
        if (!$audience) {
            if (in_array('All', $targetClasses) || empty($targetClasses)) {
                $audience = 'All Classes & Faculty';
            } else {
                $audience = implode(', ', $targetClasses);
            }
        }

        $event = SchoolCalendarEvent::create([
            'title' => $request->title,
            'event_type' => $eventType,
            'category' => $eventType,
            'date_label' => $dateLabel,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date ?: $request->start_date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'time_slot' => $timeSlot,
            'venue' => $request->venue ?: 'Campus',
            'audience' => $audience,
            'target_classes' => $targetClasses,
            'coordinator' => $request->coordinator ?: 'School Administration',
            'speaker' => $request->speaker,
            'status' => 'Upcoming',
            'month_label' => $startDate->format('F Y'),
            'description' => $request->description,
        ]);

        $this->broadcastNotifications($event, $targetClasses, $dateLabel, $eventType);

        return response()->json([
            'success' => true,
            'message' => 'School calendar event posted successfully and notifications sent.',
            'data' => $event,
        ], 201);
    }

    /**
     * Update an existing calendar event.
     */
    public function update(Request $request, $id)
    {
        $event = SchoolCalendarEvent::findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255',
            'event_type' => 'nullable|string|max:100',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $eventType = $request->event_type ?: ($request->category ?: $event->event_type);
        $startDate = Carbon::parse($request->start_date);
        $dateLabel = $startDate->format('M d, Y');

        if ($request->filled('end_date') && $request->end_date !== $request->start_date) {
            $endDate = Carbon::parse($request->end_date);
            $dateLabel = $startDate->format('M d') . ' - ' . $endDate->format('M d, Y');
        }

        $timeSlot = $request->time_slot;
        if (!$timeSlot) {
            if ($request->filled('start_time') && $request->filled('end_time')) {
                $timeSlot = $request->start_time . ' - ' . $request->end_time;
            } elseif ($request->filled('start_time')) {
                $timeSlot = $request->start_time;
            } else {
                $timeSlot = $event->time_slot;
            }
        }

        $targetClasses = $event->target_classes;
        if ($request->has('target_classes')) {
            $rawClasses = $request->target_classes;
            if (is_array($rawClasses)) {
                $targetClasses = array_values(array_filter($rawClasses));
            } elseif (is_string($rawClasses)) {
                $decoded = json_decode($rawClasses, true);
                if (is_array($decoded)) {
                    $targetClasses = array_values(array_filter($decoded));
                } else {
                    $targetClasses = array_map('trim', explode(',', $rawClasses));
                }
            }
        }

        $event->update([
            'title' => $request->title,
            'event_type' => $eventType,
            'category' => $eventType,
            'date_label' => $dateLabel,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date ?: $request->start_date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'time_slot' => $timeSlot,
            'venue' => $request->venue ?: $event->venue,
            'audience' => $request->audience ?: $event->audience,
            'target_classes' => $targetClasses,
            'coordinator' => $request->coordinator ?: $event->coordinator,
            'speaker' => $request->speaker ?: $event->speaker,
            'month_label' => $startDate->format('F Y'),
            'description' => $request->description,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Event updated successfully.',
            'data' => $event,
        ]);
    }

    /**
     * Delete calendar event.
     */
    public function destroy($id)
    {
        $event = SchoolCalendarEvent::findOrFail($id);
        $event->delete();

        return response()->json([
            'success' => true,
            'message' => 'Event deleted successfully.',
        ]);
    }

    /**
     * Broadcast smart notifications based on target classes.
     */
    private function broadcastNotifications($event, $targetClasses, $dateLabel, $eventType)
    {
        $isAll = in_array('All', $targetClasses) || empty($targetClasses);
        $typePrefix = ($eventType === 'Holiday') ? 'Holiday Announced: ' : (($eventType === 'Exam') ? 'Exam Schedule: ' : (($eventType === 'Sports') ? 'Sports Event: ' : 'School Event: '));

        if ($isAll) {
            // Broadcast to all Students & Parents
            Notification::create([
                'role' => 'student_parent',
                'title' => $typePrefix . $event->title,
                'message' => "{$eventType} scheduled for {$dateLabel} at {$event->venue} ({$event->time_slot}). " . ($event->description ?: 'Please check your school calendar.'),
                'type' => $eventType === 'Holiday' ? 'alert' : 'calendar',
                'link' => '/calendar',
                'is_read' => false,
            ]);

            // Broadcast to Teachers
            Notification::create([
                'role' => 'teacher',
                'title' => $typePrefix . $event->title,
                'message' => "{$eventType} scheduled for {$dateLabel} at {$event->venue} ({$event->time_slot}).",
                'type' => $eventType === 'Holiday' ? 'alert' : 'calendar',
                'link' => '/calendar',
                'is_read' => false,
            ]);
        } else {
            // Targeted by specific classes (e.g. ["Class 10", "Class 9"])
            foreach ($targetClasses as $targetClass) {
                // Find school class
                $classObj = SchoolClass::where('name', $targetClass)
                    ->orWhere('name', 'like', "%{$targetClass}%")
                    ->first();

                $classId = $classObj ? $classObj->id : null;

                // 1. Notify students of that specific class
                $students = Student::query();
                if ($classId) {
                    $students->where('school_class_id', $classId);
                } else {
                    $students->where('class_name', 'like', "%{$targetClass}%");
                }
                $studentList = $students->where('status', 'Active')->get();

                foreach ($studentList as $stu) {
                    Notification::create([
                        'user_id' => $stu->user_id,
                        'school_class_id' => $classId,
                        'role' => 'student_parent',
                        'title' => "{$targetClass} Event: {$event->title}",
                        'message' => "An event has been scheduled for {$targetClass} on {$dateLabel} ({$event->time_slot}) at {$event->venue}.",
                        'type' => 'calendar',
                        'link' => '/calendar',
                        'is_read' => false,
                    ]);
                }

                // 2. Notify teachers assigned to that class
                $teachers = Teacher::where(function ($q) use ($targetClass) {
                    $q->whereJsonContains('assigned_classes', $targetClass)
                      ->orWhere('class_teacher_class', $targetClass);
                })->get();

                foreach ($teachers as $tch) {
                    Notification::create([
                        'user_id' => $tch->user_id,
                        'role' => 'teacher',
                        'title' => "{$targetClass} Event: {$event->title}",
                        'message' => "New event scheduled for your class {$targetClass} on {$dateLabel} at {$event->venue}.",
                        'type' => 'calendar',
                        'link' => '/calendar',
                        'is_read' => false,
                    ]);
                }
            }
        }
    }
}
