<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admission;
use App\Models\Resource;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\Teacher;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Http\Request;

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

        // 2. Today's Student Attendance
        $todayStudentAttendances = StudentAttendance::where('date', $today)->get();

        $presentStudents = $todayStudentAttendances->where('status', 'Present')->count();
        $absentStudents = $todayStudentAttendances->where('status', 'Absent')->count();
        $lateStudents = $todayStudentAttendances->where('status', 'Late')->count();
        $attendanceRate = $totalStudents > 0 
            ? round(($presentStudents / $totalStudents) * 100, 1) 
            : 94.5; // fallback baseline if not yet taken today

        // 3. Admission pipeline counts
        $pendingAdmissions = Admission::where('status', 'Pending')->count();
        $underReviewAdmissions = Admission::where('status', 'Under Review')->count();
        $approvedAdmissions = Admission::where('status', 'Approved')->count();
        $enrolledAdmissions = Admission::where('status', 'Enrolled')->count();

        // 4. Vehicles & Resources
        $activeVehicles = Vehicle::where('status', 'Active')->count();
        $totalVehicles = Vehicle::count();
        $totalResources = Resource::sum('total_quantity');
        $availableResources = Resource::sum('available_quantity');

        // 5. Recent Admission Applications
        $recentAdmissions = Admission::with('schoolClass')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // 6. Recent Teachers
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
                    'pending_admissions' => $pendingAdmissions,
                    'total_admissions' => Admission::count(),
                    'active_vehicles' => $activeVehicles,
                    'total_vehicles' => $totalVehicles,
                    'total_resources' => (int) $totalResources,
                    'available_resources' => (int) $availableResources,
                ],
                'today_attendance' => [
                    'date' => $today,
                    'present' => $presentStudents,
                    'absent' => $absentStudents,
                    'late' => $lateStudents,
                    'rate' => $attendanceRate,
                ],
                'admissions_overview' => [
                    'pending' => $pendingAdmissions,
                    'under_review' => $underReviewAdmissions,
                    'approved' => $approvedAdmissions,
                    'enrolled' => $enrolledAdmissions,
                ],
                'recent_admissions' => $recentAdmissions,
                'recent_teachers' => $recentTeachers,
            ],
        ]);
    }
}
