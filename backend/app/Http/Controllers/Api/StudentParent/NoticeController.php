<?php

namespace App\Http\Controllers\Api\StudentParent;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\SchoolNotice;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class NoticeController extends Controller
{
    /**
     * Get list of school notices & circulars.
     */
    public function index(Request $request)
    {
        $query = SchoolNotice::query();

        if ($request->filled('category') && strtolower($request->category) !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%")
                  ->orWhere('sender', 'like', "%{$search}%");
            });
        }

        $notices = $query->orderBy('publish_date', 'desc')->get();

        $formatted = $notices->map(function ($n) {
            return [
                'id' => $n->id,
                'title' => $n->title,
                'category' => $n->category,
                'priority' => $n->priority,
                'sender' => $n->sender,
                'date' => Carbon::parse($n->publish_date)->format('M d, Y'),
                'desc' => $n->content,
                'attachment' => $n->attachment_name,
                'attachmentUrl' => $n->attachment_url,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formatted,
        ]);
    }

    /**
     * Publish new notice (Admin / Principal / Management).
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|in:Academic,Examination,Health & Wellness,Administrative',
            'priority' => 'required|string|in:Normal,Important,Urgent',
            'sender' => 'nullable|string|max:255',
            'content' => 'required|string|max:3000',
            'attachment_name' => 'nullable|string|max:255',
        ]);

        $sender = $request->sender ?: 'Principal Office';

        $notice = SchoolNotice::create([
            'title' => $request->title,
            'category' => $request->category,
            'priority' => $request->priority,
            'sender' => $sender,
            'publish_date' => Carbon::now()->toDateString(),
            'content' => $request->content,
            'attachment_name' => $request->attachment_name,
        ]);

        // Dispatch notifications to all student/parent users
        $allUsers = User::all();
        foreach ($allUsers as $u) {
            Notification::create([
                'user_id' => $u->id,
                'title' => "Notice: {$request->title}",
                'message' => substr($request->content, 0, 120) . '...',
                'type' => 'notice',
                'link' => '/notices',
                'is_read' => false,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'School notice circular published successfully.',
            'data' => $notice,
        ], 201);
    }

    /**
     * Delete a notice.
     */
    public function destroy($id)
    {
        $notice = SchoolNotice::findOrFail($id);
        $notice->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notice removed.',
        ]);
    }
}
