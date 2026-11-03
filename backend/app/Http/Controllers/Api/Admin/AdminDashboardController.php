<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admission;
use App\Models\Exam;
use App\Models\Resource;
use App\Models\SchoolCalendarEvent;
use App\Models\SchoolClass;
use App\Models\StaffAttendance;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\StudentFee;
use App\Models\Teacher;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class AdminDashboardController extends Controller
{
    /**
     * Get aggregated high-level KPIs for the Admin Dashboard.
     */
    public function index(Request $request)
    {
        $today = Carbon::today()->toDateString();

        // 1. Overall counts
        $totalStudents = Student::count();
        $activeStudents = Student::where('status', 'Active')->count();
        $totalTeachers = Teacher::count();
        $activeTeachers = Teacher::where('status', 'Active')->count();
        $totalClasses = SchoolClass::count();

        // 2. Today's Student & Teacher Attendance (Direct SQL Aggregation)
        $studentAttendanceAgg = StudentAttendance::where('date', $today)
            ->selectRaw("
                COALESCE(SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END), 0) as present_count,
                COALESCE(SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END), 0) as absent_count,
                COALESCE(SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END), 0) as late_count
            ")->first();
        $presentStudents = (int) ($studentAttendanceAgg?->present_count ?? 0);
        $absentStudents = (int) ($studentAttendanceAgg?->absent_count ?? 0);
        $lateStudents = (int) ($studentAttendanceAgg?->late_count ?? 0);
        $attendanceRate = $totalStudents > 0 
            ? round(($presentStudents / $totalStudents) * 100, 1) 
            : 0;

        $staffAttendanceAgg = StaffAttendance::where('date', $today)
            ->selectRaw("
                COALESCE(SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END), 0) as present_count,
                COALESCE(SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END), 0) as absent_count,
                COALESCE(SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END), 0) as late_count
            ")->first();
        $presentStaff = (int) ($staffAttendanceAgg?->present_count ?? 0);
        $absentStaff = (int) ($staffAttendanceAgg?->absent_count ?? 0);
        $lateStaff = (int) ($staffAttendanceAgg?->late_count ?? 0);
        $teacherAttendanceRate = $totalTeachers > 0
            ? round(($presentStaff / $totalTeachers) * 100, 1)
            : 0;

        // 3. Admission pipeline counts
        $pendingAdmissions = Admission::whereIn('status', ['Pending', 'Inquiry'])->count();
        $underReviewAdmissions = Admission::whereIn('status', ['Under Review', 'Document Review', 'Assessment/Interview'])->count();
        $approvedAdmissions = Admission::whereIn('status', ['Approved', 'Offer Extended', 'Fee Paid'])->count();
        $enrolledAdmissions = Admission::where('status', 'Enrolled')->count();

        // 4. Vehicles & Resources
        $activeVehicles = Vehicle::where('status', 'Active')->count();
        $totalVehicles = Vehicle::count();
        $totalResources = Resource::sum('total_quantity');
        $availableResources = Resource::sum('available_quantity');

        // 5. Financial Summary (Fees Collected vs Pending via Single SQL Aggregate)
        $feeAgg = StudentFee::where('status', '!=', 'Cancelled')
            ->where(function ($q) {
                $q->whereNull('term_name')
                  ->orWhere('term_name', 'not like', '%transport%');
            })
            ->selectRaw("
                COALESCE(SUM(amount), 0) as total_billed,
                COALESCE(SUM(CASE WHEN status = 'Paid' THEN amount ELSE 0 END), 0) as total_collected,
                COALESCE(SUM(CASE WHEN status IN ('Pending', 'Overdue') THEN amount ELSE 0 END), 0) as total_pending
            ")->first();

        $feesBilled = (float) ($feeAgg?->total_billed ?? 0);
        $feesCollected = (float) ($feeAgg?->total_collected ?? 0);
        $feesPending = (float) ($feeAgg?->total_pending ?? 0);
        $feeRecoveryRate = $feesBilled > 0 ? round(($feesCollected / $feesBilled) * 100, 1) : 0;

        // 6. Upcoming Exams & Events
        $upcomingCalendarEvents = SchoolCalendarEvent::where('start_date', '>=', $today)
            ->orderBy('start_date', 'asc')
            ->take(5)
            ->get()
            ->map(function ($ev) {
                return [
                    'id' => 'event_' . $ev->id,
                    'title' => $ev->title,
                    'category' => $ev->event_type ?: 'School Event',
                    'date' => $ev->start_date ? $ev->start_date->format('M d, Y') : 'Upcoming',
                    'raw_date' => $ev->start_date ? $ev->start_date->toDateString() : null,
                    'type' => 'event',
                ];
            });

        $upcomingExamsList = collect();
        $upcomingExamsCount = 0;

        if (Schema::hasTable('exams')) {
            try {
                $upcomingExamsList = Exam::where('exam_date', '>=', $today)
                    ->with(['subject', 'schoolClass'])
                    ->orderBy('exam_date', 'asc')
                    ->take(5)
                    ->get()
                    ->map(function ($ex) {
                        $subjName = $ex->subject ? $ex->subject->name : 'Exam';
                        $clsName = $ex->schoolClass ? $ex->schoolClass->name : '';
                        return [
                            'id' => 'exam_' . $ex->id,
                            'title' => $subjName . ($clsName ? " ({$clsName})" : ''),
                            'category' => 'Examination',
                            'date' => $ex->exam_date ? $ex->exam_date->format('M d, Y') : 'Scheduled',
                            'raw_date' => $ex->exam_date ? $ex->exam_date->toDateString() : null,
                            'type' => 'exam',
                        ];
                    });
                $upcomingExamsCount = Exam::where('exam_date', '>=', $today)->count();
            } catch (\Throwable $e) {
                $upcomingExamsList = collect();
                $upcomingExamsCount = 0;
            }
        }

        $upcomingCombined = $upcomingCalendarEvents->concat($upcomingExamsList)
            ->sortBy('raw_date')
            ->take(5)
            ->values();

        $upcomingEventsCount = SchoolCalendarEvent::where('start_date', '>=', $today)->count()
            + $upcomingExamsCount;

        // 7. 7-Day Attendance Trend
        $attendanceTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $dayDate = Carbon::today()->subDays($i)->toDateString();
            $dayLabel = Carbon::today()->subDays($i)->format('D, M d');

            $stuForDay = StudentAttendance::where('date', $dayDate)->get();
            $sRate = $totalStudents > 0
                ? round(($stuForDay->where('status', 'Present')->count() / $totalStudents) * 100, 1)
                : 0;

            $teaForDay = StaffAttendance::where('date', $dayDate)->get();
            $tRate = $totalTeachers > 0
                ? round(($teaForDay->where('status', 'Present')->count() / $totalTeachers) * 100, 1)
                : 0;

            $attendanceTrend[] = [
                'day' => $dayLabel,
                'date' => $dayDate,
                'student_rate' => $sRate,
                'teacher_rate' => $tRate,
            ];
        }

        // 8. Monthly Fee Collection Trend (Last 4 Months)
        $feeTrend = [];
        for ($m = 3; $m >= 0; $m--) {
            $targetMonth = Carbon::now()->subMonths($m);
            $monthStart = $targetMonth->copy()->startOfMonth()->toDateString();
            $monthEnd = $targetMonth->copy()->endOfMonth()->toDateString();
            $monthLabel = $targetMonth->format('M Y');

            $collectedInMonth = (float) StudentFee::where('status', 'Paid')
                ->whereBetween('paid_date', [$monthStart, $monthEnd])
                ->sum('amount');

            $pendingInMonth = (float) StudentFee::whereIn('status', ['Pending', 'Overdue'])
                ->whereBetween('due_date', [$monthStart, $monthEnd])
                ->sum('amount');

            $feeTrend[] = [
                'month' => $monthLabel,
                'collected' => round($collectedInMonth),
                'pending' => round($pendingInMonth),
            ];
        }

        // 9. Recent Admission Applications
        $recentAdmissions = Admission::with('schoolClass')
            ->where(function ($q) {
                $q->where('first_name', 'not like', '%XSS%')
                  ->where('last_name', 'not like', '%<%')
                  ->where('last_name', 'not like', '%script%');
            })
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // 10. Recent Teachers
        $recentTeachers = Teacher::orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'metrics' => [
                    'total_students' => $totalStudents,
                    'active_students' => $activeStudents,
                    'total_teachers' => $totalTeachers,
                    'active_teachers' => $activeTeachers,
                    'total_classes' => $totalClasses,
                    'attendance_rate' => $attendanceRate,
                    'teacher_attendance_rate' => $teacherAttendanceRate,
                    'pending_admissions' => $pendingAdmissions,
                    'total_admissions' => Admission::count(),
                    'active_vehicles' => $activeVehicles,
                    'total_vehicles' => $totalVehicles,
                    'total_resources' => (int) $totalResources,
                    'available_resources' => (int) $availableResources,
                    'fees_collected' => $feesCollected,
                    'fees_pending' => $feesPending,
                    'fees_billed' => $feesBilled,
                    'fee_recovery_rate' => $feeRecoveryRate,
                    'upcoming_events_count' => $upcomingEventsCount,
                ],
                'today_attendance' => [
                    'date' => $today,
                    'present' => $presentStudents,
                    'absent' => $absentStudents,
                    'late' => $lateStudents,
                    'rate' => $attendanceRate,
                ],
                'today_teacher_attendance' => [
                    'date' => $today,
                    'present' => $presentStaff,
                    'absent' => $absentStaff,
                    'late' => $lateStaff,
                    'rate' => $teacherAttendanceRate,
                ],
                'financial_summary' => [
                    'collected' => $feesCollected,
                    'pending' => $feesPending,
                    'billed' => $feesBilled,
                    'recovery_rate' => $feeRecoveryRate,
                ],
                'admissions_overview' => [
                    'pending' => $pendingAdmissions,
                    'under_review' => $underReviewAdmissions,
                    'approved' => $approvedAdmissions,
                    'enrolled' => $enrolledAdmissions,
                ],
                'upcoming_events' => $upcomingCombined,
                'attendance_trend' => $attendanceTrend,
                'fee_trend' => $feeTrend,
                'recent_admissions' => $recentAdmissions,
                'recent_teachers' => $recentTeachers,
            ],
        ]);
    }
}
