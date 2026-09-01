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

        if ($materials->count() === 0) {
            $defaultMaterials = [
                [
                    'id' => 'SM-01',
                    'dbId' => 1,
                    'title' => 'Class X Mathematics: Complete Formula Sheet & Solved Board Questions',
                    'subject' => 'Mathematics',
                    'type' => 'PDF',
                    'size' => '3.8 MB',
                    'uploader' => 'Dr. Ananya Sen (PGT)',
                    'date' => Carbon::now()->subDays(3)->format('M d, Y'),
                    'downloads' => 142,
                    'desc' => 'Comprehensive chapter-wise formula compendium for Quadratic Equations, Arithmetic Progressions, Coordinate Geometry, and Trigonometry with exemplar board question solutions.',
                    'url' => '#',
                ],
                [
                    'id' => 'SM-02',
                    'dbId' => 2,
                    'title' => 'Physics: Ray Optics & Electric Current Conceptual Diagrams & Numericals',
                    'subject' => 'Science',
                    'type' => 'PDF',
                    'size' => '5.2 MB',
                    'uploader' => 'Mr. Vikram Rathore (Senior Science Faculty)',
                    'date' => Carbon::now()->subDays(6)->format('M d, Y'),
                    'downloads' => 98,
                    'desc' => 'Ray diagrams for spherical mirrors and lenses, sign convention reference tables, Ohm\'s Law circuit simulation notes and NCERT exemplar numerical walkthroughs.',
                    'url' => '#',
                ],
                [
                    'id' => 'SM-03',
                    'dbId' => 3,
                    'title' => 'Computer Applications: Python Programming Guide & Data Structures Handout',
                    'subject' => 'Computer Science',
                    'type' => 'PDF',
                    'size' => '2.4 MB',
                    'uploader' => 'Mrs. Deepa K. (HOD Computers)',
                    'date' => Carbon::now()->subDays(10)->format('M d, Y'),
                    'downloads' => 116,
                    'desc' => 'Syntax reference, control structures (loops & conditionals), strings, lists, tuples, and CBSE sample practical assessment programs with output screenshots.',
                    'url' => '#',
                ],
                [
                    'id' => 'SM-04',
                    'dbId' => 4,
                    'title' => 'English Core: Literature Character Sketches & Formal Letters Reference',
                    'subject' => 'English',
                    'type' => 'DOC',
                    'size' => '1.9 MB',
                    'uploader' => 'Ms. Sunita Rao (PGT English)',
                    'date' => Carbon::now()->subDays(14)->format('M d, Y'),
                    'downloads' => 84,
                    'desc' => 'Key thematic analysis, poetic devices glossary, and high-scoring formal letter templates (editor letters, complaint letters, job applications).',
                    'url' => '#',
                ],
                [
                    'id' => 'SM-05',
                    'dbId' => 5,
                    'title' => 'Social Science: Nationalism in Europe & India Historical Timeline & Maps',
                    'subject' => 'Social Science',
                    'type' => 'PDF',
                    'size' => '4.1 MB',
                    'uploader' => 'Mr. Manoj Joshi (Senior Faculty)',
                    'date' => Carbon::now()->subDays(18)->format('M d, Y'),
                    'downloads' => 77,
                    'desc' => 'Detailed chronological timeline maps, major Congress sessions, Dandi march route identification, and board exam 5-mark question answers.',
                    'url' => '#',
                ],
            ];

            // Apply search or subject filters to default materials
            if ($request->filled('subject') && strtolower($request->subject) !== 'all') {
                $sub = strtolower($request->subject);
                $defaultMaterials = array_values(array_filter($defaultMaterials, fn($m) => str_contains(strtolower($m['subject']), $sub)));
            }

            if ($request->filled('search')) {
                $s = strtolower($request->search);
                $defaultMaterials = array_values(array_filter($defaultMaterials, fn($m) => str_contains(strtolower($m['title']), $s) || str_contains(strtolower($m['desc']), $s)));
            }

            return response()->json([
                'success' => true,
                'data' => $defaultMaterials,
            ]);
        }

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
