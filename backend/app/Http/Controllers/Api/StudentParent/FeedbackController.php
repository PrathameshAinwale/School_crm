<?php

namespace App\Http\Controllers\Api\StudentParent;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use App\Models\Notification;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    /**
     * Get list of submitted faculty & academic feedbacks.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $feedbacks = Feedback::orderBy('created_at', 'desc')->get();

        if ($feedbacks->count() === 0) {
            $defaultFeedbacks = [
                [
                    'id' => 1,
                    'subject' => 'Mathematics',
                    'teacher' => 'Dr. Ananya Sen',
                    'date' => Carbon::now()->subDays(4)->format('M d, Y'),
                    'rating' => 5.0,
                    'categories' => ['clarity' => 5, 'doubtResolution' => 5, 'homeworkPace' => 4.8],
                    'comment' => "Dr. Sen's step-by-step problem-solving technique for quadratic equations and geometry has made a tremendous positive difference in Aarav's test scores. Highly appreciative of the extra doubt-clearing sessions.",
                    'adminResponse' => 'Thank you for your valuable feedback! Dr. Sen has been commended for her dedication in the weekly faculty review.',
                ],
                [
                    'id' => 2,
                    'subject' => 'Science (Physics & Chemistry)',
                    'teacher' => 'Mr. Vikram Rathore',
                    'date' => Carbon::now()->subDays(11)->format('M d, Y'),
                    'rating' => 4.8,
                    'categories' => ['clarity' => 4.8, 'doubtResolution' => 4.7, 'homeworkPace' => 5],
                    'comment' => "The hands-on practical lab sessions for ray optics and Ohm's law experiments are engaging and foster genuine scientific curiosity.",
                    'adminResponse' => 'Glad to hear this! We continue to invest in advanced apparatus for our secondary science laboratories.',
                ],
                [
                    'id' => 3,
                    'subject' => 'English Core',
                    'teacher' => 'Ms. Sunita Rao',
                    'date' => Carbon::now()->subDays(18)->format('M d, Y'),
                    'rating' => 4.9,
                    'categories' => ['clarity' => 5, 'doubtResolution' => 4.8, 'homeworkPace' => 4.9],
                    'comment' => "Excellent guidance on letter writing format, essay rubrics, and literature character studies. Appreciate the detailed comments on homework notebooks.",
                    'adminResponse' => 'Thank you for sharing your positive experience with our humanities faculty.',
                ],
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'feedbacks' => $defaultFeedbacks,
                    'avgRating' => 4.9,
                ],
            ]);
        }

        $avgRating = round($feedbacks->avg('rating'), 1);

        $formatted = $feedbacks->map(function ($fb) {
            return [
                'id' => $fb->id,
                'subject' => $fb->subject,
                'teacher' => $fb->teacher_name,
                'date' => Carbon::parse($fb->created_at)->format('M d, Y'),
                'rating' => (float) $fb->rating,
                'categories' => $fb->category_ratings ?: ['clarity' => 5, 'doubtResolution' => 4.5, 'homeworkPace' => 5],
                'comment' => $fb->comment,
                'adminResponse' => $fb->admin_response,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'feedbacks' => $formatted,
                'avgRating' => $avgRating,
            ],
        ]);
    }

    /**
     * Store new feedback.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $student = null;
        if ($user) {
            $student = Student::where('user_id', $user->id)->first();
        }
        if (!$student) {
            $student = Student::first();
        }

        $request->validate([
            'subject' => 'required|string|max:255',
            'teacher' => 'nullable|string|max:255',
            'rating' => 'required|numeric|min:1|max:5',
            'comment' => 'required|string|max:2000',
            'categories' => 'nullable|array',
        ]);

        $subject = $request->subject;
        $teacher = $request->teacher ?: 'Faculty Incharge';
        if (str_contains($subject, '(')) {
            $parts = explode('(', $subject);
            $subject = trim($parts[0]);
            if (!$request->teacher) {
                $teacher = trim(str_replace(')', '', $parts[1] ?? 'Faculty'));
            }
        }

        $feedback = Feedback::create([
            'user_id' => $user ? $user->id : null,
            'student_id' => $student ? $student->id : null,
            'subject' => $subject,
            'teacher_name' => $teacher,
            'rating' => $request->rating,
            'category_ratings' => $request->categories ?: ['clarity' => 5, 'doubtResolution' => 4.5, 'homeworkPace' => 5],
            'comment' => $request->comment,
            'admin_response' => 'Thank you for your feedback! It has been logged and shared with the academic supervisor.',
        ]);

        // Create notification for school admin
        Notification::create([
            'user_id' => 1,
            'title' => 'New Parent Feedback: ' . $subject,
            'message' => "Rated {$request->rating}/5 stars for {$teacher}: \"{$request->comment}\"",
            'type' => 'general',
            'link' => '/feedback',
            'is_read' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Your feedback has been submitted successfully.',
            'data' => [
                'id' => $feedback->id,
                'subject' => $feedback->subject,
                'teacher' => $feedback->teacher_name,
                'date' => Carbon::parse($feedback->created_at)->format('M d, Y'),
                'rating' => (float) $feedback->rating,
                'categories' => $feedback->category_ratings,
                'comment' => $feedback->comment,
                'adminResponse' => $feedback->admin_response,
            ],
        ], 201);
    }

    /**
     * Delete feedback.
     */
    public function destroy($id)
    {
        $feedback = Feedback::findOrFail($id);
        $feedback->delete();

        return response()->json([
            'success' => true,
            'message' => 'Feedback record removed.',
        ]);
    }
}
