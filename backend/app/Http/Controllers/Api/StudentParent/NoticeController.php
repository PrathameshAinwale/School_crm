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

        if ($notices->count() === 0) {
            $defaultNotices = [
                [
                    'id' => 1,
                    'title' => 'CBSE Secondary Board Exam Registration & Subject Verification Form',
                    'category' => 'Academic',
                    'priority' => 'High',
                    'sender' => 'Office of the Principal • Dr. Rajeshwari Sharma',
                    'date' => Carbon::now()->subDays(2)->format('M d, Y'),
                    'desc' => 'All parents of Class 10 students are hereby notified to verify student spelling, Aadhaar name match, and opted elective language for CBSE Board LOC submission.',
                    'attachment' => 'CBSE_LOC_Class10_Guidelines.pdf',
                    'attachmentUrl' => '#',
                ],
                [
                    'id' => 2,
                    'title' => 'Term 1 Mid-Term Periodic Assessment Date Sheet & Syllabus Blueprint',
                    'category' => 'Exam',
                    'priority' => 'High',
                    'sender' => 'Examination Committee & Academic Dean',
                    'date' => Carbon::now()->subDays(5)->format('M d, Y'),
                    'desc' => 'The formal schedule and question paper weightage blueprint for the upcoming Term 1 examinations commencing next week has been released.',
                    'attachment' => 'Term1_Class10_DateSheet.pdf',
                    'attachmentUrl' => '#',
                ],
                [
                    'id' => 3,
                    'title' => 'Annual Health & Dental Check-up Camp for Secondary Wing',
                    'category' => 'Administrative',
                    'priority' => 'Medium',
                    'sender' => 'School Medical & Wellness Infirmary',
                    'date' => Carbon::now()->subDays(8)->format('M d, Y'),
                    'desc' => 'A team of certified pediatricians and dentists will conduct the annual physical and oral health screening. Digital health report cards will be uploaded to student profiles.',
                    'attachment' => 'Health_Camp_Schedule.pdf',
                    'attachmentUrl' => '#',
                ],
                [
                    'id' => 4,
                    'title' => 'Monsoon Transit Protocol & GPS Live School Bus Tracking Update',
                    'category' => 'Transport',
                    'priority' => 'Medium',
                    'sender' => 'Fleet & Transport Department',
                    'date' => Carbon::now()->subDays(12)->format('M d, Y'),
                    'desc' => 'Please note that new high-precision IoT RFID turnstiles and GPS telemetry devices are now active on all 34 school bus transit routes.',
                    'attachment' => 'Bus_Route_Telemetry_Guide.pdf',
                    'attachmentUrl' => '#',
                ],
            ];

            if ($request->filled('category') && strtolower($request->category) !== 'all') {
                $cat = strtolower($request->category);
                $defaultNotices = array_values(array_filter($defaultNotices, fn($n) => str_contains(strtolower($n['category']), $cat)));
            }

            if ($request->filled('search')) {
                $s = strtolower($request->search);
                $defaultNotices = array_values(array_filter($defaultNotices, fn($n) => str_contains(strtolower($n['title']), $s) || str_contains(strtolower($n['desc']), $s)));
            }

            return response()->json([
                'success' => true,
                'data' => $defaultNotices,
            ]);
        }

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
