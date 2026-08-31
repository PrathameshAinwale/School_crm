<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Student;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * List notifications for logged in user.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Notification::orderBy('created_at', 'desc');

        if ($user) {
            $student = Student::where('user_id', $user->id)
                ->orWhere('guardian_email', $user->email)
                ->first();
            $classId = $student ? $student->school_class_id : null;

            $matchedRoles = [$user->role, 'all'];
            if ($user->role === 'student_parent') {
                $matchedRoles = array_merge($matchedRoles, ['student', 'parent', 'students', 'parents']);
            } elseif ($user->role === 'teacher') {
                $matchedRoles = array_merge($matchedRoles, ['faculty', 'teachers', 'staff']);
            }

            $query->where(function ($q) use ($user, $classId, $matchedRoles) {
                $q->where('user_id', $user->id);
                if ($classId) {
                    $q->orWhere('school_class_id', $classId)
                      ->orWhere('school_class_id', (string)$classId);
                }
                $q->orWhere(function ($sub) use ($matchedRoles) {
                    $sub->whereNull('user_id')
                        ->where(function ($roleQ) use ($matchedRoles) {
                            $roleQ->whereIn('role', $matchedRoles)
                                  ->orWhereNull('role');
                        });
                });
            });
        }

        $notifications = $query->take(30)->get();

        $userRole = $user ? $user->role : null;

        $data = $notifications->map(function ($notif) use ($userRole) {
            return [
                'id' => $notif->id,
                'title' => $notif->title,
                'message' => $notif->message,
                'type' => $notif->type,
                'link' => self::resolveNotificationRoute($notif, $userRole),
                'is_read' => (bool) $notif->is_read,
                'created_at' => $notif->created_at ? $notif->created_at->format('M d, Y h:i A') : now()->format('M d, Y h:i A'),
                'time_ago' => $notif->created_at ? $notif->created_at->diffForHumans() : 'Just now',
            ];
        });

        $unreadCount = $notifications->where('is_read', false)->count();

        return response()->json([
            'success' => true,
            'unread_count' => $unreadCount,
            'data' => $data,
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(Request $request, $id)
    {
        $notif = Notification::findOrFail($id);
        $notif->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read.',
        ]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();
        if ($user) {
            Notification::where('user_id', $user->id)->update(['is_read' => true]);
        }

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read.',
        ]);
    }

    /**
     * Resolves the target page URL for any notification based on type, keywords, and role
     */
    public static function resolveNotificationRoute($notif, $userRole = null)
    {
        $link = trim($notif->link ?? '');
        if (!empty($link) && $link !== '/notifications' && $link !== '#' && $link !== '/') {
            return $link;
        }

        $type = strtolower($notif->type ?? '');
        $title = strtolower($notif->title ?? '');
        $msg = strtolower($notif->message ?? '');
        $role = strtolower($userRole ?? $notif->role ?? '');

        // 1. Trainings & Workshops
        if ($type === 'training' || str_contains($title, 'training') || str_contains($title, 'workshop') || str_contains($msg, 'training')) {
            if ($role === 'teacher') return '/trainings';
            if ($role === 'hr' || $role === 'admin') return '/hr/trainings';
            return '/trainings';
        }

        // 2. Leaves & Applications
        if ($type === 'leave' || str_contains($title, 'leave') || str_contains($msg, 'leave')) {
            if ($role === 'hr' || $role === 'admin') return '/hr/staff-leaves';
            if ($role === 'teacher') return '/hr/apply-leave';
            return '/hr/apply-leave';
        }

        // 3. Salaries & Payroll
        if ($type === 'salary' || $type === 'payroll' || str_contains($title, 'salary') || str_contains($title, 'payroll') || str_contains($title, 'disbursement') || str_contains($msg, 'salary') || str_contains($msg, 'disbursement')) {
            if ($role === 'accountant') return '/accounts/salary-disbursements';
            if ($role === 'hr' || $role === 'admin') return '/salary';
            return '/salary';
        }

        // 4. Fees
        if ($type === 'fee' || str_contains($title, 'fee') || str_contains($title, 'installment') || str_contains($msg, 'fee')) {
            if ($role === 'student_parent') return '/fees';
            if ($role === 'accountant' || $role === 'admin') return '/accounts/fees';
            return '/fees';
        }

        // 5. Attendance
        if ($type === 'attendance' || str_contains($title, 'attendance') || str_contains($msg, 'attendance')) {
            if ($role === 'teacher') return '/class-attendance';
            if ($role === 'student_parent') return '/attendance';
            if ($role === 'hr') return '/hr/staff-attendance';
            if ($role === 'admin') return '/attendance';
            return '/attendance';
        }

        // 6. Assignments
        if ($type === 'assignment' || str_contains($title, 'assignment') || str_contains($title, 'homework') || str_contains($msg, 'assignment')) {
            return '/assignment';
        }

        // 7. Syllabus
        if ($type === 'syllabus' || $type === 'academic' || str_contains($title, 'syllabus') || str_contains($title, 'chapter')) {
            return '/syllabus';
        }

        // 8. Timetable & Lectures
        if ($type === 'timetable' || $type === 'schedule' || str_contains($title, 'timetable') || str_contains($title, 'schedule') || str_contains($title, 'lecture')) {
            if ($role === 'teacher') return '/teacher/schedule';
            return '/timetable';
        }

        // 9. PTM Meetings
        if ($type === 'ptm' || str_contains($title, 'ptm') || str_contains($title, 'parent-teacher')) {
            return '/ptm';
        }

        // 10. Events & Calendar
        if ($type === 'event' || $type === 'calendar' || str_contains($title, 'event') || str_contains($title, 'calendar') || str_contains($title, 'holiday') || str_contains($title, 'sports')) {
            if ($role === 'hr') return '/school-events';
            if ($role === 'admin') return '/admin/calendar';
            return '/calendar';
        }

        // 11. School Resources
        if ($type === 'resource' || str_contains($title, 'resource') || str_contains($title, 'study material')) {
            if ($role === 'teacher') return '/teacher/resources';
            if ($role === 'student_parent') return '/study-material';
            if ($role === 'admin') return '/school-resources';
        }

        // 12. Notices
        if ($type === 'notice' || str_contains($title, 'notice') || str_contains($title, 'circular')) {
            return '/notices';
        }

        return '/dashboard';
    }
}
