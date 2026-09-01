<?php

namespace App\Http\Controllers\Api\StudentParent;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\PtmAppointment;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Http\Request;

class PtmController extends Controller
{
    /**
     * Get upcoming PTM appointments, slots, and past history.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $student = null;
        if ($user) {
            $student = Student::where('user_id', $user->id)
                ->orWhere('guardian_email', $user->email)
                ->orWhere('guardian_phone', $user->phone)
                ->first();
        }
        if (!$student) {
            $student = Student::where('status', 'Active')->first() ?: Student::first();
        }
        $studentId = $student ? $student->id : 1;

        $appointments = PtmAppointment::where('student_id', $studentId)
            ->orderBy('meeting_date', 'desc')
            ->get();

        if ($appointments->count() === 0) {
            PtmAppointment::create([
                'student_id' => $studentId,
                'term_title' => 'Term 1 Mid-Term Consultation (Class X-A)',
                'meeting_date' => Carbon::now()->addDays(12)->toDateString(),
                'time_slot' => '10:30 AM - 11:00 AM (Current)',
                'venue' => 'Senior Academic Wing • Room 301',
                'teacher_name' => 'Dr. Ananya Sen (Class Teacher & PGT Math)',
                'status' => 'Confirmed',
                'agenda_notes' => 'Discuss mid-term performance, syllabus progress, and board examination reference materials.',
            ]);

            PtmAppointment::create([
                'student_id' => $studentId,
                'term_title' => 'Term Orientation & Academic Roadmap Consultation',
                'meeting_date' => Carbon::now()->subMonths(3)->toDateString(),
                'time_slot' => '11:00 AM - 11:30 AM',
                'venue' => 'Auditorium Conference Room B',
                'teacher_name' => 'Dr. Ananya Sen',
                'status' => 'Completed',
                'agenda_notes' => 'Review of foundational baseline diagnostic tests.',
                'discussion_summary' => 'Commended student dedication and active participation in STEM projects. Encouraged daily mathematical practice sets.',
                'key_decisions' => 'Enrolled in senior math olympiad coaching and assigned mentor for science project.',
            ]);

            $appointments = PtmAppointment::where('student_id', $studentId)->orderBy('meeting_date', 'desc')->get();
        }

        $upcoming = $appointments->where('status', 'Confirmed')->first();
        if (!$upcoming) {
            $upcoming = $appointments->first();
        }

        $past = $appointments->where('status', 'Completed')->values();

        $availableSlots = [
            '9:00 AM - 9:30 AM',
            '9:30 AM - 10:00 AM',
            '10:00 AM - 10:30 AM',
            '10:30 AM - 11:00 AM (Current)',
            '11:30 AM - 12:00 PM',
            '12:00 PM - 12:30 PM',
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'upcoming' => [
                    'id' => $upcoming ? $upcoming->id : 1,
                    'term' => $upcoming ? $upcoming->term_title : 'Term 1 Mid-Term Consultation (Class X-A)',
                    'date' => $upcoming ? Carbon::parse($upcoming->meeting_date)->format('l, F d, Y') : Carbon::now()->addDays(12)->format('l, F d, Y'),
                    'rawDate' => $upcoming ? Carbon::parse($upcoming->meeting_date)->toDateString() : Carbon::now()->addDays(12)->toDateString(),
                    'timeSlot' => $upcoming ? $upcoming->time_slot : '10:30 AM - 11:00 AM (Current)',
                    'venue' => $upcoming ? $upcoming->venue : 'Senior Academic Wing • Room 301',
                    'teacher' => $upcoming ? $upcoming->teacher_name : 'Dr. Ananya Sen (Class Teacher & PGT Math)',
                    'status' => $upcoming ? $upcoming->status : 'Confirmed',
                    'agendaNotes' => $upcoming && $upcoming->agenda_notes ? $upcoming->agenda_notes : 'Would like to discuss mid-term preparation and recommended reference books for Class X Math.',
                ],
                'availableSlots' => $availableSlots,
                'pastHistory' => $past->map(function ($p) {
                    return [
                        'id' => $p->id,
                        'term' => $p->term_title,
                        'date' => Carbon::parse($p->meeting_date)->format('M d, Y'),
                        'teacher' => $p->teacher_name,
                        'venue' => $p->venue,
                        'discussion' => $p->discussion_summary ?: 'Reviewed academic progress and student attendance consistency.',
                        'keyDecisions' => $p->key_decisions ?: 'Continue regular revision and prepare for upcoming unit tests.',
                    ];
                }),
            ],
        ]);
    }

    /**
     * Reschedule PTM time slot or update agenda notes.
     */
    public function reschedule(Request $request)
    {
        $user = $request->user();
        $student = null;
        if ($user) {
            $student = Student::where('user_id', $user->id)->first();
        }
        if (!$student) {
            $student = Student::first();
        }
        $studentId = $student ? $student->id : 1;

        $request->validate([
            'appointment_id' => 'nullable|exists:ptm_appointments,id',
            'time_slot' => 'required|string|max:100',
            'agenda_notes' => 'nullable|string|max:1000',
        ]);

        $appointment = null;
        if ($request->filled('appointment_id')) {
            $appointment = PtmAppointment::where('id', $request->appointment_id)->where('student_id', $studentId)->first();
        }
        if (!$appointment) {
            $appointment = PtmAppointment::where('student_id', $studentId)->orderBy('meeting_date', 'desc')->first();
        }

        if ($appointment) {
            $cleanSlot = str_replace(' (Current)', '', $request->time_slot);
            $appointment->update([
                'time_slot' => $cleanSlot,
                'agenda_notes' => $request->agenda_notes ?: $appointment->agenda_notes,
                'status' => 'Confirmed',
            ]);
        }

        // Notification for Class Teacher
        if ($user) {
            Notification::create([
                'user_id' => 1,
                'title' => 'PTM Slot Confirmed: ' . ($student ? $student->full_name : 'Aarav Patel'),
                'message' => "Selected Slot: {$request->time_slot}. Agenda: {$request->agenda_notes}",
                'type' => 'general',
                'link' => '/ptm',
                'is_read' => false,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'PTM time slot has been successfully rescheduled and confirmed.',
            'data' => $appointment,
        ]);
    }
}
