<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\LeaveApplication;
use App\Models\SchoolClass;
use App\Models\SchoolNotice;
use App\Models\StaffAttendance;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\Teacher;
use App\Models\Timetable;
use Carbon\Carbon;
use Illuminate\Http\Request;

class TeacherSelfController extends Controller
{
    /**
     * Get or resolve current teacher model from logged in user.
     */
    private function getTeacher(Request $request)
    {
        $user = $request->user();
        if (!$user) return null;

        $teacher = Teacher::where('user_id', $user->id)
            ->orWhere('email', $user->email)
            ->first();

        if (!$teacher && in_array($user->role, ['hr', 'teacher', 'admin'])) {
            $nameParts = explode(' ', $user->name ?: ($user->role === 'hr' ? 'HR Staff' : 'Faculty Staff'));
            $firstName = $nameParts[0] ?? 'Staff';
            $lastName = count($nameParts) > 1 ? implode(' ', array_slice($nameParts, 1)) : '';
            $teacherId = ($user->role === 'hr' ? 'HR-' : 'TCH-') . str_pad($user->id, 3, '0', STR_PAD_LEFT);

            $teacher = Teacher::create([
                'user_id' => $user->id,
                'teacher_id' => $teacherId,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => strtolower($user->email),
                'phone' => $user->phone ?? '+91 98765 00000',
                'department' => $user->role === 'hr' ? 'Human Resources' : 'General',
                'status' => 'Active',
                'salary' => $user->role === 'hr' ? 55000 : 50000,
                'allowance' => 10000,
            ]);
        }

        return $teacher;
    }

    /**
     * Get teacher's own attendance stats & today's status from staff_attendances.
     */
    public function attendance(Request $request)
    {
        $teacher = $this->getTeacher($request);
        $today = Carbon::today()->toDateString();

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher profile not found.',
            ], 404);
        }

        // Today's staff attendance record
        $todayRecord = StaffAttendance::where('teacher_id', $teacher->id)
            ->where('date', $today)
            ->first();

        $isPunchedIn = false;
        $isCompletedToday = false;
        $punchInTime = null;
        $punchOutTime = null;
        $elapsedSeconds = 0;

        if ($todayRecord && $todayRecord->check_in_time) {
            $punchInTime = Carbon::parse($todayRecord->check_in_time)->format('h:i A');
            $punchOutTime = $todayRecord->check_out_time ? Carbon::parse($todayRecord->check_out_time)->format('h:i A') : null;
            $dateStr = is_string($todayRecord->date) ? $todayRecord->date : $todayRecord->date->toDateString();

            if ($todayRecord->check_out_time) {
                // Already checked out -> attendance completed for today
                $isPunchedIn = false;
                $isCompletedToday = true;
                $in = Carbon::parse($dateStr . ' ' . $todayRecord->check_in_time);
                $out = Carbon::parse($dateStr . ' ' . $todayRecord->check_out_time);
                $elapsedSeconds = max(0, $out->diffInSeconds($in));
            } else {
                // Currently punched in
                $isPunchedIn = true;
                $isCompletedToday = false;
                $in = Carbon::parse($dateStr . ' ' . $todayRecord->check_in_time);
                $elapsedSeconds = max(0, Carbon::now()->diffInSeconds($in));
            }
        }

        // Recent 30 days staff attendance history
        $recentRecords = StaffAttendance::where('teacher_id', $teacher->id)
            ->orderBy('date', 'desc')
            ->take(15)
            ->get()
            ->map(function ($att) {
                $checkIn = $att->check_in_time ? Carbon::parse($att->check_in_time)->format('h:i A') : '-';
                $checkOut = $att->check_out_time ? Carbon::parse($att->check_out_time)->format('h:i A') : '-';
                $attDateStr = is_string($att->date) ? $att->date : $att->date->toDateString();
                
                $actual = '-';
                if ($att->check_in_time && $att->check_out_time) {
                    $in = Carbon::parse($attDateStr . ' ' . $att->check_in_time);
                    $out = Carbon::parse($attDateStr . ' ' . $att->check_out_time);
                    $hours = $out->diffInMinutes($in) / 60;
                    $actual = number_format($hours, 1) . ' hrs';
                }

                return [
                    'date' => Carbon::parse($attDateStr)->format('d M Y'),
                    'status' => $att->status ?: 'Present',
                    'checkIn' => $checkIn,
                    'checkOut' => $checkOut,
                    'actual' => $actual,
                ];
            });

        // Monthly Heatmap Generator
        $targetYear = (int) $request->input('year', Carbon::now()->year);
        $targetMonth = (int) $request->input('month', Carbon::now()->month);
        $startOfMonth = Carbon::createFromDate($targetYear, $targetMonth, 1)->startOfMonth();
        $daysInMonth = $startOfMonth->daysInMonth;
        $startDayOfWeek = ($startOfMonth->dayOfWeekIso - 1); // 0 for Monday .. 6 for Sunday

        $monthStaffRecords = StaffAttendance::where('teacher_id', $teacher->id)
            ->whereYear('date', $targetYear)
            ->whereMonth('date', $targetMonth)
            ->get()
            ->keyBy(function ($item) {
                $d = is_string($item->date) ? $item->date : $item->date->toDateString();
                return Carbon::parse($d)->toDateString();
            });

        $heatmapDays = [];
        $pCount = 0;
        $aCount = 0;
        $lCount = 0;
        $hCount = 0;

        for ($day = 1; $day <= $daysInMonth; $day++) {
            $currDate = Carbon::createFromDate($targetYear, $targetMonth, $day);
            $currDateStr = $currDate->toDateString();
            $isSunday = $currDate->isSunday();
            $isFuture = $currDate->isAfter(Carbon::today());
            $isToday = $currDate->isToday();

            $rec = $monthStaffRecords->get($currDateStr);
            $status = 'Upcoming';
            $checkIn = null;
            $checkOut = null;

            if ($isSunday) {
                $status = 'Holiday';
                $hCount++;
            } elseif ($rec) {
                $status = $rec->status ?: 'Present';
                $checkIn = $rec->check_in_time ? Carbon::parse($rec->check_in_time)->format('h:i A') : null;
                $checkOut = $rec->check_out_time ? Carbon::parse($rec->check_out_time)->format('h:i A') : null;
                if ($status === 'Present') $pCount++;
                elseif ($status === 'Absent') $aCount++;
                elseif ($status === 'Late') $lCount++;
                elseif ($status === 'Half Day') $pCount++;
            } elseif ($isFuture) {
                $status = 'Upcoming';
            } elseif ($isToday) {
                $status = 'Not Marked';
            } else {
                // Past working day without clock-in -> Marked as Absent
                $status = 'Absent';
                $aCount++;
            }

            $heatmapDays[] = [
                'day' => $day,
                'date' => $currDateStr,
                'status' => $status,
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'is_sunday' => $isSunday,
                'is_today' => $isToday,
                'is_future' => $isFuture,
            ];
        }

        return response()->json([
            'success' => true,
            'teacher' => [
                'id' => $teacher->id,
                'name' => $teacher->full_name,
                'employee_id' => $teacher->teacher_id,
                'department' => $teacher->department,
            ],
            'today' => [
                'date' => Carbon::today()->format('d M Y'),
                'is_punched_in' => $isPunchedIn,
                'is_completed_today' => $isCompletedToday,
                'punch_in_time' => $punchInTime,
                'punch_out_time' => $punchOutTime,
                'elapsed_seconds' => $elapsedSeconds,
                'status' => $todayRecord ? ($isCompletedToday ? 'Completed' : ($isPunchedIn ? 'Active' : $todayRecord->status)) : 'Not Marked',
            ],
            'summary' => [
                'present_days' => $pCount,
                'absent_days' => $aCount,
                'late_days' => $lCount,
            ],
            'history' => $recentRecords,
            'heatmap' => [
                'month_name' => $startOfMonth->format('F Y'),
                'month' => $targetMonth,
                'year' => $targetYear,
                'start_day_offset' => $startDayOfWeek,
                'total_days' => $daysInMonth,
                'days' => $heatmapDays,
                'stats' => [
                    'present' => $pCount,
                    'absent' => $aCount,
                    'late' => $lCount,
                    'holiday' => $hCount,
                ],
            ],
        ]);
    }

    /**
     * Punch In / Punch Out toggle for teacher stored in staff_attendances.
     */
    public function punch(Request $request)
    {
        $teacher = $this->getTeacher($request);
        if (!$teacher) {
            return response()->json(['success' => false, 'message' => 'Teacher record not found.'], 404);
        }

        $today = Carbon::today()->toDateString();
        $now = Carbon::now();
        $nowTime = $now->toTimeString();
        $formattedNow = $now->format('h:i A');

        $record = StaffAttendance::where('teacher_id', $teacher->id)
            ->where('date', $today)
            ->first();

        if (!$record) {
            // 1. First punch in of the day
            $record = StaffAttendance::create([
                'teacher_id' => $teacher->id,
                'date' => $today,
                'status' => 'Present',
                'check_in_time' => $nowTime,
                'marked_by' => $request->user() ? $request->user()->id : null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Clocked in successfully at ' . $formattedNow,
                'is_punched_in' => true,
                'is_completed_today' => false,
                'punch_in_time' => $formattedNow,
                'punch_out_time' => null,
            ]);
        }

        if (!$record->check_out_time) {
            // 2. Clock out for the day -> Completes attendance for today
            $record->update([
                'check_out_time' => $nowTime,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Clocked out successfully at ' . $formattedNow . '. Attendance marked for today.',
                'is_punched_in' => false,
                'is_completed_today' => true,
                'punch_in_time' => Carbon::parse($record->check_in_time)->format('h:i A'),
                'punch_out_time' => $formattedNow,
            ]);
        }

        // 3. Already clocked in and clocked out for today -> block further punching
        return response()->json([
            'success' => false,
            'message' => 'Your attendance for today is already completed (Clocked In and Clocked Out). You cannot mark attendance again today.',
            'is_punched_in' => false,
            'is_completed_today' => true,
        ], 400);
    }

    /**
     * Get teacher's leave balance & application history.
     */
    public function leaveBalance(Request $request)
    {
        $user = $request->user();
        $teacher = $this->getTeacher($request);

        $quotas = [
            'CL' => ['name' => 'Casual Leave (CL)', 'total' => 12, 'color' => 'text-amber-600', 'bg' => 'bg-amber-50', 'bar' => 'bg-amber-500'],
            'SL' => ['name' => 'Sick Leave (SL)', 'total' => 10, 'color' => 'text-rose-600', 'bg' => 'bg-rose-50', 'bar' => 'bg-rose-500'],
            'ML' => ['name' => 'Maternity/Paternity', 'total' => 90, 'color' => 'text-purple-600', 'bg' => 'bg-purple-50', 'bar' => 'bg-purple-500'],
        ];

        $leaveQuery = LeaveApplication::query();
        if ($user) {
            $leaveQuery->where(function ($q) use ($user, $teacher) {
                $q->where('user_id', $user->id);
                if ($teacher) {
                    $q->orWhere('teacher_id', $teacher->id);
                }
            });
        } elseif ($teacher) {
            $leaveQuery->where('teacher_id', $teacher->id);
        }

        $allApplications = $leaveQuery->orderBy('created_at', 'desc')->get();

        // Sum approved days by leave type
        $usedByCode = [
            'CL' => 0,
            'SL' => 0,
            'ML' => 0,
        ];

        foreach ($allApplications as $app) {
            if ($app->status === 'Approved' && isset($usedByCode[$app->type])) {
                $usedByCode[$app->type] += (int) $app->days;
            }
        }

        $leaveTypes = [];
        foreach ($quotas as $code => $meta) {
            $used = $usedByCode[$code] ?? 0;
            $total = $meta['total'];
            $remaining = max(0, $total - $used);

            $leaveTypes[] = [
                'code' => $code,
                'type' => $meta['name'],
                'total' => $total,
                'used' => $used,
                'remaining' => $remaining,
                'color' => $meta['color'],
                'bg' => $meta['bg'],
                'bar' => $meta['bar'],
            ];
        }

        $history = $allApplications->map(function ($app) use ($quotas) {
            $typeName = $quotas[$app->type]['name'] ?? $app->type;
            return [
                'id' => $app->id,
                'type' => $typeName,
                'code' => $app->type,
                'from' => $app->from_date ? Carbon::parse($app->from_date)->format('d M Y') : '-',
                'to' => $app->to_date ? Carbon::parse($app->to_date)->format('d M Y') : '-',
                'days' => $app->days,
                'reason' => $app->reason,
                'status' => $app->status ?: 'Pending',
                'created_at' => $app->created_at ? $app->created_at->format('d M Y') : '-',
            ];
        });

        return response()->json([
            'success' => true,
            'leave_types' => $leaveTypes,
            'leave_history' => $history,
        ]);
    }

    /**
     * Submit a new leave application.
     */
    public function applyLeave(Request $request)
    {
        $request->validate([
            'type' => 'required|in:CL,SL,ML',
            'from_date' => 'required|date',
            'to_date' => 'required|date|after_or_equal:from_date',
            'reason' => 'required|string|max:1000',
        ]);

        $user = $request->user();
        $teacher = $this->getTeacher($request);

        $from = Carbon::parse($request->from_date);
        $to = Carbon::parse($request->to_date);
        $days = max(1, $from->diffInDays($to) + 1);

        $application = LeaveApplication::create([
            'user_id' => $user ? $user->id : null,
            'teacher_id' => $teacher ? $teacher->id : null,
            'type' => $request->type,
            'from_date' => $from->toDateString(),
            'to_date' => $to->toDateString(),
            'days' => $days,
            'reason' => $request->reason,
            'photo_proof' => $request->photo_proof ?: $request->photo_url,
            'photo_name' => $request->photo_name ?: ($request->photo_proof ? 'medical_certificate.png' : null),
            'status' => 'Pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => "Leave application for {$days} day(s) submitted successfully!",
            'data' => $application,
        ], 201);
    }

    /**
     * Get teacher's own full profile from database.
     */
    public function profile(Request $request)
    {
        $teacher = $this->getTeacher($request);
        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher record not found in database.',
            ], 404);
        }

        $user = $request->user();

        // Calculate attendance summary
        $currentMonth = Carbon::today()->startOfMonth();
        $totalWorkDays = StaffAttendance::where('teacher_id', $teacher->id)
            ->where('date', '>=', $currentMonth)
            ->count();
        $presentDays = StaffAttendance::where('teacher_id', $teacher->id)
            ->where('date', '>=', $currentMonth)
            ->where('status', 'Present')
            ->count();
        $turnoutRate = $totalWorkDays > 0 ? round(($presentDays / $totalWorkDays) * 100, 1) : 98.5;

        // Assignments statistics
        $assignmentsCount = \App\Models\Assignment::where('teacher_id', $teacher->id)->count();
        $submissionsCount = \App\Models\AssignmentSubmission::whereHas('assignment', function ($q) use ($teacher) {
            $q->where('teacher_id', $teacher->id);
        })->count();

        // Used leaves
        $approvedLeaves = LeaveApplication::where('teacher_id', $teacher->id)
            ->where('status', 'Approved')
            ->sum('days');

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $teacher->id,
                'teacher_id' => $teacher->teacher_id,
                'first_name' => $teacher->first_name,
                'last_name' => $teacher->last_name,
                'full_name' => $teacher->full_name,
                'email' => $teacher->email,
                'phone' => $teacher->phone,
                'gender' => $teacher->gender ?: 'Female',
                'date_of_birth' => $teacher->date_of_birth ? Carbon::parse($teacher->date_of_birth)->format('F d, Y') : '15 August, 1990',
                'joining_date' => $teacher->joining_date ? Carbon::parse($teacher->joining_date)->format('F d, Y') : '01 June, 2021',
                'department' => $teacher->department ?: 'General',
                'qualification' => $teacher->qualification ?: 'B.Ed, Master of Education',
                'experience' => $teacher->experience ?: '5+ Years Teaching Experience',
                'salary' => $teacher->salary ? number_format($teacher->salary, 2) : null,
                'assigned_subjects' => $teacher->assigned_subjects ?: [],
                'assigned_classes' => $teacher->assigned_classes ?: [],
                'class_teacher_class' => $teacher->class_teacher_class,
                'class_teacher_division' => $teacher->class_teacher_division,
                'address' => $teacher->address ?: '',
                'emergency_contact' => $teacher->emergency_contact ?: '',
                'status' => $teacher->status ?: 'Active',
                'avatar' => $user ? $user->avatar : null,
                'stats' => [
                    'attendance_rate' => $turnoutRate . '%',
                    'assignments_created' => $assignmentsCount,
                    'submissions_reviewed' => $submissionsCount,
                    'leaves_taken' => $approvedLeaves . ' Days',
                ]
            ],
        ]);
    }

    /**
     * Update teacher's own contact and profile information.
     */
    public function updateProfile(Request $request)
    {
        $teacher = $this->getTeacher($request);
        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher record not found.',
            ], 404);
        }

        $request->validate([
            'phone' => 'nullable|string|max:20',
            'qualification' => 'nullable|string|max:255',
            'experience' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
            'emergency_contact' => 'nullable|string|max:50',
        ]);

        $teacher->update($request->only([
            'phone',
            'qualification',
            'experience',
            'address',
            'emergency_contact',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully!',
            'data' => $teacher->fresh(),
        ]);
    }

    /**
     * Get teacher's daily/weekly lecture schedule across all classes.
     */
    public function schedule(Request $request)
    {
        $teacher = $this->getTeacher($request);
        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher profile not found.',
            ], 404);
        }

        $teacherName = $teacher->full_name;
        $dayOfWeek = $request->input('day', Carbon::now()->format('l'));
        if (!in_array($dayOfWeek, ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])) {
            $dayOfWeek = 'Monday';
        }

        // Query periods where teacher_name matches or created_by_teacher_id matches
        $lectures = Timetable::with('creatorTeacher')
            ->where('day_of_week', $dayOfWeek)
            ->where(function ($q) use ($teacher, $teacherName) {
                $q->where('teacher_name', 'like', "%{$teacher->first_name}%")
                  ->orWhere('teacher_name', 'like', "%{$teacher->last_name}%")
                  ->orWhere('teacher_name', $teacherName)
                  ->orWhere('created_by_teacher_id', $teacher->id);
            })
            ->orderBy('period_number', 'asc')
            ->get();

        // Also fetch all weekly counts
        $allWeeklyLectures = Timetable::where(function ($q) use ($teacher, $teacherName) {
                $q->where('teacher_name', 'like', "%{$teacher->first_name}%")
                  ->orWhere('teacher_name', 'like', "%{$teacher->last_name}%")
                  ->orWhere('teacher_name', $teacherName)
                  ->orWhere('created_by_teacher_id', $teacher->id);
            })
            ->get();

        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        $dailyCounts = [];
        foreach ($days as $d) {
            $dailyCounts[$d] = $allWeeklyLectures->where('day_of_week', $d)->count();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'teacher' => [
                    'id' => $teacher->id,
                    'name' => $teacher->full_name,
                    'department' => $teacher->department,
                    'classTeacherFor' => $teacher->class_teacher_class,
                ],
                'selectedDay' => $dayOfWeek,
                'isToday' => Carbon::now()->format('l') === $dayOfWeek,
                'currentDayName' => Carbon::now()->format('l'),
                'currentDate' => Carbon::now()->format('F d, Y'),
                'dailyCounts' => $dailyCounts,
                'totalLecturesToday' => $lectures->count(),
                'totalWeeklyLectures' => $allWeeklyLectures->count(),
                'lectures' => $lectures->map(function ($lec) {
                    return [
                        'id' => $lec->id,
                        'period_number' => $lec->period_number,
                        'period_name' => $lec->period_name ?: 'Period ' . $lec->period_number,
                        'time_slot' => $lec->time_slot,
                        'class_name' => $lec->class_name ?: 'Class 10',
                        'division' => $lec->division ?: 'Div A',
                        'subject' => $lec->subject,
                        'room' => $lec->room ?: 'Room 301',
                        'type' => $lec->type ?: 'Theory',
                        'teacher_name' => $lec->teacher_name,
                        'assigned_by' => $lec->creatorTeacher ? $lec->creatorTeacher->full_name : 'Class In-Charge',
                        'created_by_teacher_id' => $lec->created_by_teacher_id,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Get aggregated realtime Teacher Dashboard statistics and daily feed.
     */
    public function dashboard(Request $request)
    {
        $teacher = $this->getTeacher($request);
        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher profile not found.',
            ], 404);
        }

        $today = Carbon::today()->toDateString();
        $dayOfWeek = Carbon::now()->format('l');
        $validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        if (!in_array($dayOfWeek, $validDays)) {
            $dayOfWeek = 'Monday';
        }

        $teacherName = $teacher->full_name;

        // 1. Today's Lectures from Timetable
        $todayLectures = Timetable::with('creatorTeacher')
            ->where('day_of_week', $dayOfWeek)
            ->where(function ($q) use ($teacher, $teacherName) {
                $q->where('teacher_name', 'like', "%{$teacher->first_name}%")
                  ->orWhere('teacher_name', 'like', "%{$teacher->last_name}%")
                  ->orWhere('teacher_name', $teacherName)
                  ->orWhere('created_by_teacher_id', $teacher->id);
            })
            ->orderBy('period_number', 'asc')
            ->get();

        $lecturesCount = $todayLectures->count();
        $nextLecture = $todayLectures->first();

        // 2. Class Attendance for Teacher's Class (Homeroom or primary class)
        $isClassTeacher = !empty($teacher->class_teacher_class);
        $homeroomClass = $teacher->class_teacher_class;
        $classDivision = $teacher->class_teacher_division ?: 'Div A';

        $totalClassStudents = 0;
        $presentCount = 0;
        $absentCount = 0;
        $isAttendanceMarked = false;
        $turnoutRate = 0;

        if ($isClassTeacher) {
            $classModel = SchoolClass::where('name', $homeroomClass)->first();
            $classId = $classModel ? $classModel->id : null;

            $studentQuery = Student::where('status', 'Active');
            if ($classId) {
                $studentQuery->where('school_class_id', $classId);
            }
            $totalClassStudents = $studentQuery->count();

            $todayAttendanceRecords = StudentAttendance::where('date', $today)
                ->whereHas('student', function ($q) use ($classId, $homeroomClass) {
                    if ($classId) {
                        $q->where('school_class_id', $classId);
                    }
                })
                ->get();

            $isAttendanceMarked = $todayAttendanceRecords->count() > 0;
            if ($isAttendanceMarked) {
                $presentCount = $todayAttendanceRecords->whereIn('status', ['Present', 'Late'])->count();
                $absentCount = $todayAttendanceRecords->where('status', 'Absent')->count();
                $turnoutRate = $totalClassStudents > 0 ? round(($presentCount / $totalClassStudents) * 100, 1) : 0;
            }
        }

        // 3. Assignments & Pending Evaluations
        $assignmentsCount = Assignment::where('teacher_id', $teacher->id)->count();
        $pendingSubmissions = AssignmentSubmission::whereHas('assignment', function ($q) use ($teacher) {
            $q->where('teacher_id', $teacher->id);
        })->where('status', 'submitted')->count();

        $nearestDueAssignment = Assignment::where('teacher_id', $teacher->id)
            ->where('due_date', '>=', $today)
            ->orderBy('due_date', 'asc')
            ->first();

        // 4. Staff Notices / Circulars
        $notices = SchoolNotice::orderBy('publish_date', 'desc')->take(3)->get();

        return response()->json([
            'success' => true,
            'data' => [
                'teacher' => [
                    'id' => $teacher->id,
                    'name' => $teacher->full_name,
                    'department' => $teacher->department,
                    'classTeacherFor' => $homeroomClass,
                    'classTeacherDivision' => $classDivision,
                    'assignedClasses' => $teacher->assigned_classes ?: [],
                    'assignedSubjects' => $teacher->assigned_subjects ?: [],
                ],
                'todayInfo' => [
                    'dayName' => $dayOfWeek,
                    'date' => Carbon::now()->format('F d, Y'),
                    'totalLectures' => $lecturesCount,
                    'nextLecture' => $nextLecture ? [
                        'period' => $nextLecture->period_name ?: 'Period ' . $nextLecture->period_number,
                        'class' => $nextLecture->class_name ?: ($homeroomClass ?: 'Class 10'),
                        'division' => $nextLecture->division ?: 'Div A',
                        'subject' => $nextLecture->subject,
                        'time' => $nextLecture->time_slot,
                        'room' => $nextLecture->room ?: 'Room 301',
                        'assigned_by' => $nextLecture->creatorTeacher ? $nextLecture->creatorTeacher->full_name : 'Class In-Charge',
                    ] : null,
                ],
                'cards' => [
                    'schedule' => [
                        'totalClasses' => $lecturesCount,
                        'badge' => $lecturesCount > 0 ? "{$lecturesCount} Classes Today" : "No Classes Scheduled",
                        'highlight' => $nextLecture
                            ? "Next: {$nextLecture->class_name} ({$nextLecture->division}) • {$nextLecture->subject}"
                            : "No more lectures scheduled today",
                        'time' => $nextLecture ? $nextLecture->time_slot : "All periods complete",
                        'room' => $nextLecture ? ($nextLecture->room ?: 'Room 301') : "Staff Room",
                        'subtext' => $lecturesCount > 1
                            ? ($lecturesCount - 1) . " classes remaining today • 1 Free Period"
                            : "Daily schedule synced with Timetable",
                    ],
                    'attendance' => [
                        'className' => $homeroomClass ?: 'No Homeroom Assigned',
                        'division' => $classDivision,
                        'badge' => $isClassTeacher ? "{$homeroomClass} ({$classDivision}) Homeroom" : "Subject Teacher",
                        'totalStudents' => $totalClassStudents,
                        'presentCount' => $presentCount,
                        'absentCount' => $absentCount,
                        'turnoutRate' => $turnoutRate . '%',
                        'isMarked' => $isAttendanceMarked,
                        'highlight' => "{$presentCount} / {$totalClassStudents} Students Present",
                        'subtext' => "{$absentCount} students absent • {$turnoutRate}% turnout",
                    ],
                    'assignments' => [
                        'activeSets' => $assignmentsCount,
                        'badge' => "{$assignmentsCount} Active Sets",
                        'pendingEvaluations' => $pendingSubmissions,
                        'highlight' => "{$pendingSubmissions} Pending Evaluations",
                        'time' => $nearestDueAssignment ? "Due " . $nearestDueAssignment->due_date->format('M d') : "Due Tomorrow: Set 4.2",
                        'room' => $homeroomClass,
                        'subtext' => "{$pendingSubmissions} submissions received awaiting review",
                    ],
                ],
                'todayLectures' => $todayLectures->map(function ($lec, $idx) {
                    return [
                        'id' => $lec->id,
                        'period' => $lec->period_name ?: 'Period ' . ($lec->period_number ?: ($idx + 1)),
                        'time' => $lec->time_slot,
                        'class' => $lec->class_name ?: 'Class 10',
                        'division' => $lec->division ?: 'Div A',
                        'subject' => $lec->subject,
                        'room' => $lec->room ?: 'Room 301',
                        'type' => $lec->type ?: 'Theory',
                        'assigned_by' => $lec->creatorTeacher ? $lec->creatorTeacher->full_name : 'Class In-Charge',
                        'status' => $idx === 0 ? 'Next Up' : 'Upcoming',
                    ];
                }),
                'notices' => $notices->map(function ($n) {
                    return [
                        'id' => $n->id,
                        'title' => $n->title,
                        'category' => $n->category ?? 'Notice',
                        'date' => is_string($n->publish_date ?? null) ? $n->publish_date : Carbon::today()->format('M d, Y'),
                    ];
                }),
            ],
        ]);
    }
}
