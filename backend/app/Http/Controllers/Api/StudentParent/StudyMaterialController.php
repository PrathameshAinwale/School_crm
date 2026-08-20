<?php

namespace App\Http\Controllers\Api\StudentParent;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudyMaterial;
use Carbon\Carbon;
use Illuminate\Http\Request;

class StudyMaterialController extends Controller
{
    /**
     * Get study materials list filtered by class, subject & search.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $student = null;
        if ($user) {
            $student = Student::with('schoolClass')->where('user_id', $user->id)->first();
        }
        if (!$student) {
            $student = Student::with('schoolClass')->first();
        }

        $classId = $student ? $student->school_class_id : null;
        $className = $student && $student->schoolClass ? $student->schoolClass->name : 'Class 10';

        $query = StudyMaterial::query();

        if ($request->filled('subject') && strtolower($request->subject) !== 'all') {
            $query->where('subject', 'like', "%{$request->subject}%");
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('uploader_name', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        $materials = $query->orderBy('created_at', 'desc')->get();

        $formatted = $materials->map(function ($mat) {
            return [
                'id' => $mat->code ?: 'SM-0' . $mat->id,
                'dbId' => $mat->id,
                'title' => $mat->title,
                'subject' => $mat->subject,
                'type' => $mat->type ?: 'PDF',
                'size' => $mat->file_size ?: '3.5 MB',
                'uploader' => $mat->uploader_name ?: 'Faculty',
                'date' => $mat->publish_date ? Carbon::parse($mat->publish_date)->format('M d, Y') : Carbon::parse($mat->created_at)->format('M d, Y'),
                'downloads' => (int) $mat->downloads_count,
                'desc' => $mat->description,
                'url' => $mat->file_url,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formatted,
        ]);
    }

    /**
     * Upload new study material (Teacher / Admin).
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'subject' => 'required|string|max:100',
            'type' => 'nullable|string|in:PDF,ZIP,DOC,MP4',
            'description' => 'nullable|string|max:1000',
            'class_name' => 'nullable|string|max:50',
            'uploader_name' => 'nullable|string|max:255',
        ]);

        $count = StudyMaterial::count() + 1;
        $code = 'SM-' . str_pad($count, 2, '0', STR_PAD_LEFT);

        $material = StudyMaterial::create([
            'code' => $code,
            'title' => $request->title,
            'subject' => $request->subject,
            'type' => $request->type ?: 'PDF',
            'file_size' => '4.2 MB',
            'uploader_name' => $request->uploader_name ?: ($request->user() ? $request->user()->name : 'Dr. Ananya Sen (PGT)'),
            'publish_date' => Carbon::now()->toDateString(),
            'downloads_count' => 0,
            'description' => $request->description,
            'class_name' => $request->class_name ?: 'Class 10',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Study material published successfully.',
            'data' => $material,
        ], 201);
    }

    /**
     * Track download of study material.
     */
    public function download($id)
    {
        $material = StudyMaterial::where('id', $id)->orWhere('code', $id)->first();
        if ($material) {
            $material->increment('downloads_count');
        }

        return response()->json([
            'success' => true,
            'message' => 'Download counted.',
            'data' => $material,
        ]);
    }

    /**
     * Delete study material.
     */
    public function destroy($id)
    {
        $material = StudyMaterial::where('id', $id)->orWhere('code', $id)->firstOrFail();
        $material->delete();

        return response()->json([
            'success' => true,
            'message' => 'Study material removed.',
        ]);
    }
}
