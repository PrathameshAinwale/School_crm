<?php

namespace App\Http\Controllers\Api\Sports;

use App\Http\Controllers\Controller;
use App\Models\Sport;
use App\Models\SportsCompetition;
use App\Models\SportsParticipant;
use App\Models\SportsFacility;
use App\Models\SportsTrainingSchedule;
use App\Models\SportsEquipment;
use App\Models\SportsEquipmentIssue;
use App\Models\SportsFitnessAssessment;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SportsController extends Controller
{
    /**
     * Get Sports Overview Dashboard Data.
     */
    public function dashboard(Request $request)
    {
        $user = Auth::user();
        $schoolId = $user->school_id;

        $totalSports = Sport::count();
        $totalCompetitions = SportsCompetition::count();
        $upcomingCompetitionsCount = SportsCompetition::whereIn('status', ['Upcoming', 'Ongoing'])->count();
        $totalParticipants = SportsParticipant::distinct('student_id')->count('student_id');
        $totalMedals = SportsParticipant::whereIn('achievement', ['Gold Medal', 'Silver Medal', 'Bronze Medal', 'Best Player / MVP'])->count();
        $attendingCount = SportsParticipant::where('attendance_status', 'Attending')->count();

        // Upcoming and ongoing competitions
        $upcomingCompetitions = SportsCompetition::with(['sport'])
            ->withCount([
                'participants',
                'participants as attending_count' => function ($q) {
                    $q->where('attendance_status', 'Attending');
                }
            ])
            ->whereIn('status', ['Upcoming', 'Ongoing'])
            ->orderBy('start_date', 'asc')
            ->limit(5)
            ->get();

        // Recent Achievements
        $recentAchievements = SportsParticipant::with(['student.user', 'student.schoolClass', 'sport', 'competition'])
            ->where('achievement', '!=', 'None')
            ->orderBy('updated_at', 'desc')
            ->limit(6)
            ->get();

        // Disciplines with roster count
        $disciplines = Sport::withCount(['participants', 'competitions'])
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => [
                    'total_sports' => $totalSports,
                    'total_competitions' => $totalCompetitions,
                    'upcoming_competitions' => $upcomingCompetitionsCount,
                    'total_participants' => $totalParticipants,
                    'total_medals' => $totalMedals,
                    'attending_athletes' => $attendingCount,
                ],
                'upcoming_competitions' => $upcomingCompetitions,
                'recent_achievements' => $recentAchievements,
                'disciplines' => $disciplines,
                'incharge' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => 'Head of Physical Education & Sports',
                    'department' => 'Sports & Athletics',
                ],
            ],
        ]);
    }

    /**
     * List all sports disciplines.
     */
    public function sportsList(Request $request)
    {
        $query = Sport::withCount(['competitions', 'participants']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('coach_name', 'like', "%{$search}%")
                  ->orWhere('venue', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category') && $request->category !== 'All') {
            $query->where('category', $request->category);
        }

        $sports = $query->orderBy('name', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'sports' => $sports,
            ],
        ]);
    }

    /**
     * Create a new sports discipline.
     */
    public function storeSport(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'code' => 'required|string|max:50',
            'category' => 'nullable|string|max:100',
            'coach_name' => 'nullable|string|max:150',
            'venue' => 'nullable|string|max:200',
            'max_players' => 'nullable|integer|min:1',
            'description' => 'nullable|string',
            'status' => 'nullable|string|in:Active,Inactive',
        ]);

        $sport = Sport::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Sports discipline created successfully.',
            'data' => $sport,
        ], 201);
    }

    /**
     * Update an existing sport.
     */
    public function updateSport(Request $request, $id)
    {
        $sport = Sport::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:150',
            'code' => 'sometimes|required|string|max:50',
            'category' => 'nullable|string|max:100',
            'coach_name' => 'nullable|string|max:150',
            'venue' => 'nullable|string|max:200',
            'max_players' => 'nullable|integer|min:1',
            'description' => 'nullable|string',
            'status' => 'nullable|string|in:Active,Inactive',
        ]);

        $sport->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Sport updated successfully.',
            'data' => $sport,
        ]);
    }

    /**
     * Delete a sport.
     */
    public function destroySport($id)
    {
        $sport = Sport::findOrFail($id);
        $sport->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sport deleted successfully.',
        ]);
    }

    /**
     * List all sports competitions and tournaments.
     */
    public function competitionsList(Request $request)
    {
        $query = SportsCompetition::with(['sport'])
            ->withCount([
                'participants',
                'participants as attending_count' => function ($q) {
                    $q->where('attendance_status', 'Attending');
                },
                'participants as absent_count' => function ($q) {
                    $q->where('attendance_status', 'Absent');
                },
                'participants as excused_count' => function ($q) {
                    $q->where('attendance_status', 'Excused');
                },
            ]);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('opponent_school', 'like', "%{$search}%")
                  ->orWhere('venue', 'like', "%{$search}%");
            });
        }

        if ($request->filled('sport_id') && $request->sport_id !== 'all') {
            $query->where('sport_id', $request->sport_id);
        }

        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        if ($request->filled('type') && $request->type !== 'All') {
            $query->where('competition_type', $request->type);
        }

        $competitions = $query->orderBy('start_date', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'competitions' => $competitions,
            ],
        ]);
    }

    /**
     * Create a new sports competition / tournament.
     */
    public function storeCompetition(Request $request)
    {
        $validated = $request->validate([
            'sport_id' => 'required|exists:sports,id',
            'title' => 'required|string|max:200',
            'competition_type' => 'required|string',
            'tournament_level' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'event_time' => 'nullable|string',
            'venue' => 'nullable|string|max:200',
            'opponent_school' => 'nullable|string|max:200',
            'status' => 'nullable|string|in:Upcoming,Ongoing,Completed,Cancelled',
            'result' => 'nullable|string',
            'score_summary' => 'nullable|string',
            'remarks' => 'nullable|string',
        ]);

        $validated['created_by_user_id'] = Auth::id();

        $competition = SportsCompetition::create($validated);
        $competition->load('sport');

        return response()->json([
            'success' => true,
            'message' => 'Sports tournament / match scheduled successfully.',
            'data' => $competition,
        ], 201);
    }

    /**
     * Update competition status, scores, or details.
     */
    public function updateCompetition(Request $request, $id)
    {
        $competition = SportsCompetition::findOrFail($id);

        $validated = $request->validate([
            'sport_id' => 'sometimes|required|exists:sports,id',
            'title' => 'sometimes|required|string|max:200',
            'competition_type' => 'sometimes|required|string',
            'tournament_level' => 'sometimes|required|string',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'nullable|date',
            'event_time' => 'nullable|string',
            'venue' => 'nullable|string|max:200',
            'opponent_school' => 'nullable|string|max:200',
            'status' => 'nullable|string|in:Upcoming,Ongoing,Completed,Cancelled',
            'result' => 'nullable|string',
            'score_summary' => 'nullable|string',
            'remarks' => 'nullable|string',
        ]);

        $competition->update($validated);
        $competition->load('sport');

        return response()->json([
            'success' => true,
            'message' => 'Competition details updated successfully.',
            'data' => $competition,
        ]);
    }

    /**
     * Delete competition.
     */
    public function destroyCompetition($id)
    {
        $competition = SportsCompetition::findOrFail($id);
        $competition->delete();

        return response()->json([
            'success' => true,
            'message' => 'Competition deleted successfully.',
        ]);
    }

    /**
     * List all student participants / attendees.
     */
    public function participantsList(Request $request)
    {
        $query = SportsParticipant::with([
            'student.user',
            'student.schoolClass',
            'student.section',
            'sport',
            'competition',
        ]);

        if ($request->filled('competition_id') && $request->competition_id !== 'all') {
            $query->where('competition_id', $request->competition_id);
        }

        if ($request->filled('sport_id') && $request->sport_id !== 'all') {
            $query->where('sport_id', $request->sport_id);
        }

        if ($request->filled('attendance_status') && $request->attendance_status !== 'all') {
            $query->where('attendance_status', $request->attendance_status);
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('student', function ($sq) use ($search) {
                $sq->where('first_name', 'like', "%{$search}%")
                   ->orWhere('last_name', 'like', "%{$search}%")
                   ->orWhere('admission_number', 'like', "%{$search}%")
                   ->orWhere('roll_number', 'like', "%{$search}%");
            });
        }

        $participants = $query->orderBy('attendance_status', 'asc')
            ->orderBy('id', 'desc')
            ->get();

        // Calculate summary counters
        $total = $participants->count();
        $attending = $participants->where('attendance_status', 'Attending')->count();
        $absent = $participants->where('attendance_status', 'Absent')->count();
        $excused = $participants->where('attendance_status', 'Excused')->count();
        $injured = $participants->where('attendance_status', 'Injured')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'participants' => $participants,
                'summary' => [
                    'total' => $total,
                    'attending' => $attending,
                    'absent' => $absent,
                    'excused' => $excused,
                    'injured' => $injured,
                ],
            ],
        ]);
    }

    /**
     * Enroll student into a sport / competition.
     */
    public function enrollParticipant(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'sport_id' => 'required|exists:sports,id',
            'competition_id' => 'nullable|exists:sports_competitions,id',
            'jersey_number' => 'nullable|string|max:20',
            'role' => 'nullable|string|max:50',
            'attendance_status' => 'nullable|string|in:Attending,Absent,Excused,Injured',
            'achievement' => 'nullable|string',
            'performance_notes' => 'nullable|string',
        ]);

        $validated['enrolled_date'] = now()->toDateString();
        $validated['attendance_status'] = $validated['attendance_status'] ?? 'Attending';
        $validated['role'] = $validated['role'] ?? 'Player';

        // Check if already enrolled in the exact competition
        if (!empty($validated['competition_id'])) {
            $exists = SportsParticipant::where('competition_id', $validated['competition_id'])
                ->where('student_id', $validated['student_id'])
                ->exists();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'This student is already registered for this competition.',
                ], 422);
            }
        }

        $participant = SportsParticipant::create($validated);
        $participant->load(['student.user', 'student.schoolClass', 'sport', 'competition']);

        return response()->json([
            'success' => true,
            'message' => 'Student successfully enrolled into sports event.',
            'data' => $participant,
        ], 201);
    }

    /**
     * Update participant attendance status (Attending / Absent / Excused / Injured).
     */
    public function updateParticipantAttendance(Request $request, $id)
    {
        $participant = SportsParticipant::findOrFail($id);

        $validated = $request->validate([
            'attendance_status' => 'required|string|in:Attending,Absent,Excused,Injured',
            'performance_notes' => 'nullable|string',
        ]);

        $participant->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Attendance status updated.',
            'data' => $participant,
        ]);
    }

    /**
     * Record an achievement or medal for participant.
     */
    public function recordAchievement(Request $request, $id)
    {
        $participant = SportsParticipant::findOrFail($id);

        $validated = $request->validate([
            'achievement' => 'required|string|max:100',
            'performance_notes' => 'nullable|string',
        ]);

        $participant->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Achievement recorded successfully.',
            'data' => $participant,
        ]);
    }

    /**
     * Remove a participant.
     */
    public function destroyParticipant($id)
    {
        $participant = SportsParticipant::findOrFail($id);
        $participant->delete();

        return response()->json([
            'success' => true,
            'message' => 'Student participant removed from roster.',
        ]);
    }

    /**
     * Helper to get available enrolled students in the school for autocomplete dropdown.
     */
    public function availableStudents(Request $request)
    {
        $students = Student::with(['user', 'schoolClass', 'section'])
            ->where('status', 'active')
            ->orderBy('first_name', 'asc')
            ->get()
            ->map(function ($s) {
                $name = trim("{$s->first_name} {$s->last_name}");
                $classSection = $s->schoolClass ? ($s->schoolClass->name . ($s->section ? '-' . $s->section->name : '')) : 'N/A';
                return [
                    'id' => $s->id,
                    'name' => $name,
                    'admission_number' => $s->admission_number,
                    'roll_number' => $s->roll_number,
                    'class_section' => $classSection,
                    'gender' => $s->gender,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'students' => $students,
            ],
        ]);
    }

    /**
     * Profile of Sports Incharge.
     */
    public function profile(Request $request)
    {
        $user = Auth::user();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => 'Sports Incharge & Athletics Director',
                'department' => 'Department of Physical Education & Sports',
                'designation' => 'Sports Incharge',
                'joining_date' => '2022-07-01',
                'qualifications' => 'M.P.Ed (Master of Physical Education), NIS Certified Coach',
                'specialization' => 'Track & Field, Football, Physical Conditioning',
                'employee_id' => 'SPT-DIR-001',
                'status' => 'Active',
            ],
        ]);
    }

    /**
     * Update Sports Incharge profile.
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'phone' => 'nullable|string|max:30',
            'email' => 'required|email|unique:users,email,' . $user->id,
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data' => $user,
        ]);
    }

    // ==========================================
    // FACILITIES & GROUNDS
    // ==========================================

    public function facilitiesList(Request $request)
    {
        $query = SportsFacility::withCount('schedules');

        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('facility_type', $request->type);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('maintenance_status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhere('surface_type', 'like', "%{$search}%");
            });
        }

        $facilities = $query->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'facilities' => $facilities,
                'summary' => [
                    'total' => $facilities->count(),
                    'available' => $facilities->where('maintenance_status', 'Available')->count(),
                    'maintenance' => $facilities->where('maintenance_status', 'Scheduled Maintenance')->count(),
                ],
            ],
        ]);
    }

    public function storeFacility(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'facility_type' => 'required|string|max:50',
            'capacity' => 'nullable|integer|min:1',
            'surface_type' => 'nullable|string|max:100',
            'floodlights' => 'boolean',
            'maintenance_status' => 'required|string|in:Available,In Use,Scheduled Maintenance,Closed',
            'location' => 'nullable|string|max:150',
            'rules_notes' => 'nullable|string',
        ]);

        $facility = SportsFacility::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Sports facility added successfully.',
            'data' => $facility,
        ], 201);
    }

    public function updateFacility(Request $request, $id)
    {
        $facility = SportsFacility::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'facility_type' => 'required|string|max:50',
            'capacity' => 'nullable|integer|min:1',
            'surface_type' => 'nullable|string|max:100',
            'floodlights' => 'boolean',
            'maintenance_status' => 'required|string|in:Available,In Use,Scheduled Maintenance,Closed',
            'location' => 'nullable|string|max:150',
            'rules_notes' => 'nullable|string',
        ]);

        $facility->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Facility details updated successfully.',
            'data' => $facility,
        ]);
    }

    public function destroyFacility($id)
    {
        $facility = SportsFacility::findOrFail($id);
        $facility->delete();

        return response()->json([
            'success' => true,
            'message' => 'Facility deleted successfully.',
        ]);
    }

    // ==========================================
    // TRAINING & PRACTICE SCHEDULES
    // ==========================================

    public function schedulesList(Request $request)
    {
        $query = SportsTrainingSchedule::with(['sport', 'facility']);

        if ($request->filled('sport_id') && $request->sport_id !== 'all') {
            $query->where('sport_id', $request->sport_id);
        }

        if ($request->filled('day') && $request->day !== 'all') {
            $query->where('day_of_week', $request->day);
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('squad_name', 'like', "%{$search}%")
                  ->orWhere('coach_name', 'like', "%{$search}%")
                  ->orWhere('session_type', 'like', "%{$search}%");
            });
        }

        $schedules = $query->orderBy('start_time')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'schedules' => $schedules,
                'total_sessions' => $schedules->count(),
            ],
        ]);
    }

    public function storeSchedule(Request $request)
    {
        $validated = $request->validate([
            'sport_id' => 'required|exists:sports,id',
            'facility_id' => 'nullable|exists:sports_facilities,id',
            'squad_name' => 'required|string|max:150',
            'coach_name' => 'required|string|max:150',
            'day_of_week' => 'required|string|max:50',
            'start_time' => 'required',
            'end_time' => 'required',
            'session_type' => 'required|string|max:100',
            'target_grades' => 'nullable|string|max:100',
            'capacity' => 'nullable|integer|min:1',
            'status' => 'required|string|in:Active,Paused,Completed',
        ]);

        $schedule = SportsTrainingSchedule::create($validated);
        $schedule->load(['sport', 'facility']);

        return response()->json([
            'success' => true,
            'message' => 'Practice training session scheduled.',
            'data' => $schedule,
        ], 201);
    }

    public function updateSchedule(Request $request, $id)
    {
        $schedule = SportsTrainingSchedule::findOrFail($id);

        $validated = $request->validate([
            'sport_id' => 'required|exists:sports,id',
            'facility_id' => 'nullable|exists:sports_facilities,id',
            'squad_name' => 'required|string|max:150',
            'coach_name' => 'required|string|max:150',
            'day_of_week' => 'required|string|max:50',
            'start_time' => 'required',
            'end_time' => 'required',
            'session_type' => 'required|string|max:100',
            'target_grades' => 'nullable|string|max:100',
            'capacity' => 'nullable|integer|min:1',
            'status' => 'required|string|in:Active,Paused,Completed',
        ]);

        $schedule->update($validated);
        $schedule->load(['sport', 'facility']);

        return response()->json([
            'success' => true,
            'message' => 'Schedule updated successfully.',
            'data' => $schedule,
        ]);
    }

    public function destroySchedule($id)
    {
        $schedule = SportsTrainingSchedule::findOrFail($id);
        $schedule->delete();

        return response()->json([
            'success' => true,
            'message' => 'Training schedule removed.',
        ]);
    }

    // ==========================================
    // EQUIPMENT & INVENTORY
    // ==========================================

    public function equipmentList(Request $request)
    {
        $query = SportsEquipment::with('sport');

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->filled('condition') && $request->condition !== 'all') {
            $query->where('condition', $request->condition);
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('item_name', 'like', "%{$search}%")
                  ->orWhere('storage_location', 'like', "%{$search}%");
            });
        }

        $items = $query->orderBy('item_name')->get();
        $issues = SportsEquipmentIssue::with(['equipment', 'student'])
            ->orderBy('id', 'desc')
            ->take(20)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'equipment' => $items,
                'recent_issues' => $issues,
                'summary' => [
                    'total_items' => $items->sum('quantity_total'),
                    'available_items' => $items->sum('quantity_available'),
                    'issued_items' => $items->sum('quantity_issued'),
                    'unique_assets' => $items->count(),
                ],
            ],
        ]);
    }

    public function storeEquipment(Request $request)
    {
        $validated = $request->validate([
            'sport_id' => 'nullable|exists:sports,id',
            'item_name' => 'required|string|max:150',
            'category' => 'required|string|max:50',
            'quantity_total' => 'required|integer|min:1',
            'condition' => 'required|string|in:Good,Fair,Needs Repair,Damaged',
            'storage_location' => 'nullable|string|max:150',
            'purchase_date' => 'nullable|date',
            'unit_cost' => 'nullable|numeric|min:0',
        ]);

        $validated['quantity_available'] = $validated['quantity_total'];
        $validated['quantity_issued'] = 0;
        $validated['status'] = 'Available';

        $item = SportsEquipment::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Sports equipment added to inventory.',
            'data' => $item,
        ], 201);
    }

    public function updateEquipment(Request $request, $id)
    {
        $item = SportsEquipment::findOrFail($id);

        $validated = $request->validate([
            'sport_id' => 'nullable|exists:sports,id',
            'item_name' => 'required|string|max:150',
            'category' => 'required|string|max:50',
            'quantity_total' => 'required|integer|min:1',
            'condition' => 'required|string|in:Good,Fair,Needs Repair,Damaged',
            'storage_location' => 'nullable|string|max:150',
            'purchase_date' => 'nullable|date',
            'unit_cost' => 'nullable|numeric|min:0',
        ]);

        $issued = $item->quantity_issued;
        $validated['quantity_available'] = max(0, $validated['quantity_total'] - $issued);
        $validated['status'] = $validated['quantity_available'] > 0 ? 'Available' : 'In Use';

        $item->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Equipment item updated.',
            'data' => $item,
        ]);
    }

    public function destroyEquipment($id)
    {
        $item = SportsEquipment::findOrFail($id);
        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Equipment removed from inventory.',
        ]);
    }

    public function issueEquipment(Request $request)
    {
        $validated = $request->validate([
            'equipment_id' => 'required|exists:sports_equipment,id',
            'student_id' => 'nullable|exists:students,id',
            'borrower_name' => 'required|string|max:150',
            'borrower_role' => 'required|string|in:Student,Coach,Teacher',
            'quantity' => 'required|integer|min:1',
            'issue_date' => 'required|date',
            'expected_return_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $item = SportsEquipment::findOrFail($validated['equipment_id']);
        if ($item->quantity_available < $validated['quantity']) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient stock. Only {$item->quantity_available} units available.",
            ], 422);
        }

        DB::transaction(function () use ($validated, $item) {
            $item->decrement('quantity_available', $validated['quantity']);
            $item->increment('quantity_issued', $validated['quantity']);
            if ($item->quantity_available == 0) {
                $item->update(['status' => 'In Use']);
            }

            SportsEquipmentIssue::create([
                'equipment_id' => $item->id,
                'student_id' => $validated['student_id'] ?? null,
                'borrower_name' => $validated['borrower_name'],
                'borrower_role' => $validated['borrower_role'],
                'quantity' => $validated['quantity'],
                'issue_date' => $validated['issue_date'],
                'expected_return_date' => $validated['expected_return_date'],
                'status' => 'Issued',
                'notes' => $validated['notes'] ?? null,
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Equipment issued successfully.',
        ]);
    }

    public function returnEquipment(Request $request, $issueId)
    {
        $issue = SportsEquipmentIssue::findOrFail($issueId);
        if ($issue->status === 'Returned') {
            return response()->json([
                'success' => false,
                'message' => 'Item is already returned.',
            ], 422);
        }

        DB::transaction(function () use ($issue, $request) {
            $issue->update([
                'status' => 'Returned',
                'return_date' => now()->toDateString(),
                'notes' => $request->input('notes', $issue->notes),
            ]);

            $item = $issue->equipment;
            if ($item) {
                $item->increment('quantity_available', $issue->quantity);
                $item->decrement('quantity_issued', $issue->quantity);
                $item->update(['status' => 'Available']);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Equipment returned and checked back into inventory.',
        ]);
    }

    // ==========================================
    // ATHLETIC FITNESS & HEALTH ASSESSMENTS
    // ==========================================

    public function fitnessAssessmentsList(Request $request)
    {
        $query = SportsFitnessAssessment::with(['student.schoolClass', 'student.section']);

        if ($request->filled('term') && $request->term !== 'all') {
            $query->where('academic_term', $request->term);
        }

        if ($request->filled('rating') && $request->rating !== 'all') {
            $query->where('stamina_rating', 'like', "%{$request->rating}%");
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('student', function ($sq) use ($search) {
                $sq->where('first_name', 'like', "%{$search}%")
                   ->orWhere('last_name', 'like', "%{$search}%")
                   ->orWhere('admission_number', 'like', "%{$search}%");
            });
        }

        $records = $query->orderBy('assessment_date', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'assessments' => $records,
                'summary' => [
                    'total_assessed' => $records->count(),
                    'outstanding' => $records->filter(fn($r) => str_contains($r->stamina_rating, 'Outstanding'))->count(),
                    'medically_cleared' => $records->where('medical_clearance', true)->count(),
                    'average_bmi' => $records->count() > 0 ? round($records->avg('bmi'), 1) : 0,
                ],
            ],
        ]);
    }

    public function storeFitnessAssessment(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'assessment_date' => 'required|date',
            'academic_term' => 'required|string|max:50',
            'height_cm' => 'nullable|numeric|min:50|max:250',
            'weight_kg' => 'nullable|numeric|min:15|max:200',
            'sprint_50m_seconds' => 'nullable|numeric|min:3|max:30',
            'shuttle_run_seconds' => 'nullable|numeric|min:5|max:60',
            'pushups_count' => 'nullable|integer|min:0|max:150',
            'sit_and_reach_cm' => 'nullable|numeric',
            'stamina_rating' => 'required|string',
            'medical_clearance' => 'boolean',
            'remarks' => 'nullable|string',
        ]);

        if (!empty($validated['height_cm']) && !empty($validated['weight_kg'])) {
            $heightM = $validated['height_cm'] / 100;
            $validated['bmi'] = round($validated['weight_kg'] / ($heightM * $heightM), 1);
        }

        $validated['assessed_by'] = Auth::user()->name;

        $record = SportsFitnessAssessment::create($validated);
        $record->load(['student.schoolClass', 'student.section']);

        return response()->json([
            'success' => true,
            'message' => 'Fitness assessment record saved successfully.',
            'data' => $record,
        ], 201);
    }

    public function destroyFitnessAssessment($id)
    {
        $record = SportsFitnessAssessment::findOrFail($id);
        $record->delete();

        return response()->json([
            'success' => true,
            'message' => 'Assessment record deleted.',
        ]);
    }
}
