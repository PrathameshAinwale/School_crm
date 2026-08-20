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

            $query->where(function ($q) use ($user, $classId) {
                $q->where('user_id', $user->id);
                if ($classId) {
                    $q->orWhere('school_class_id', $classId)
                      ->orWhere('school_class_id', (string)$classId);
                }
                if ($user->role) {
                    $q->orWhere(function ($sub) use ($user) {
                        $sub->whereNull('user_id')->where('role', $user->role);
                    });
                }
            });
        }

        $notifications = $query->take(30)->get();

        $data = $notifications->map(function ($notif) {
            return [
                'id' => $notif->id,
                'title' => $notif->title,
                'message' => $notif->message,
                'type' => $notif->type,
                'link' => $notif->link ?: '/notifications',
                'is_read' => (bool) $notif->is_read,
                'created_at' => $notif->created_at->format('M d, Y h:i A'),
                'time_ago' => $notif->created_at->diffForHumans(),
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
}
