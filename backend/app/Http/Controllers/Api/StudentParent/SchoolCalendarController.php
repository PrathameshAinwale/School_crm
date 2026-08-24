<?php

namespace App\Http\Controllers\Api\StudentParent;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\SchoolCalendarEvent;
use Carbon\Carbon;
use Illuminate\Http\Request;

class SchoolCalendarController extends Controller
{
    /**
     * Get academic calendar events & holidays posted by HR / Admin.
     */
    public function index(Request $request)
    {
        $query = SchoolCalendarEvent::query();

        if ($request->filled('type') && strtolower($request->type) !== 'all') {
            $query->where('event_type', $request->type);
        }

        $events = $query->orderBy('start_date', 'asc')->get();

        $formatted = $events->map(function ($e) {
            return [
                'id' => $e->id,
                'title' => $e->title,
                'type' => $e->event_type,
                'date' => $e->date_label,
                'startDate' => Carbon::parse($e->start_date)->toDateString(),
                'time' => $e->time_slot,
                'venue' => $e->venue,
                'month' => $e->month_label,
                'desc' => $e->description,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formatted,
        ]);
    }

    /**
     * Store new calendar event (HR / Admin).
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'event_type' => 'required|string|in:Exam,Holiday,Event,PTM',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'time_slot' => 'nullable|string|max:100',
            'venue' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:1000',
        ]);

        $startDate = Carbon::parse($request->start_date);
        $dateLabel = $startDate->format('M d, Y');
        if ($request->filled('end_date') && $request->end_date !== $request->start_date) {
            $endDate = Carbon::parse($request->end_date);
            $dateLabel = $startDate->format('M d') . ' - ' . $endDate->format('M d, Y');
        }

        $event = SchoolCalendarEvent::create([
            'title' => $request->title,
            'event_type' => $request->event_type,
            'date_label' => $dateLabel,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'time_slot' => $request->time_slot ?: 'Full Day',
            'venue' => $request->venue ?: 'Campus',
            'month_label' => $startDate->format('F Y'),
            'description' => $request->description,
        ]);

        $typePrefix = $event->event_type === 'Holiday' ? 'Holiday Announced: ' : ($event->event_type === 'Exam' ? 'Exam Schedule: ' : 'School Calendar: ');

        // 1. Notify Students & Parents
        Notification::create([
            'role' => 'student_parent',
            'title' => $typePrefix . $event->title,
            'message' => "{$event->event_type} on {$dateLabel} at {$event->venue}. " . ($event->description ?: 'Please check your school calendar.'),
            'type' => $event->event_type === 'Holiday' ? 'alert' : 'calendar',
            'link' => '/calendar',
            'is_read' => false,
        ]);

        // 2. Notify Teachers
        Notification::create([
            'role' => 'teacher',
            'title' => $typePrefix . $event->title,
            'message' => "{$event->event_type} on {$dateLabel} at {$event->venue}. " . ($event->description ?: 'Please check your academic calendar.'),
            'type' => $event->event_type === 'Holiday' ? 'alert' : 'calendar',
            'link' => '/calendar',
            'is_read' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'School calendar event posted successfully and notifications sent.',
            'data' => $event,
        ], 201);
    }
}
