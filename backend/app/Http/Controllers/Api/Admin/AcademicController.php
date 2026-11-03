<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Subject;
use Illuminate\Http\Request;

class AcademicController extends Controller
{
    public function classes(Request $request)
    {
        $schoolId = \App\Services\SchoolContext::getActiveSchoolId() ?: $request->user()?->school_id;
        $branchId = $request->header('X-Branch-Id') ?: $request->user()?->branch_id;
        $cacheKey = "school_" . ($schoolId ?? 'all') . ($branchId ? "_b{$branchId}" : '') . "_classes_v2";

        $classes = \Illuminate\Support\Facades\Cache::remember($cacheKey, 1800, function () use ($schoolId) {
            $query = SchoolClass::with('sections');
            if ($schoolId) {
                $query->where('school_id', $schoolId);
            }
            return $query->get();
        });

        if ($classes->isEmpty()) {
            $defaultClasses = [
                'Nursery', 'LKG', 'UKG',
                'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
                'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
                'Class 11', 'Class 12'
            ];
            $sections = ['Saffron (A)', 'White (B)', 'Green (C)'];

            foreach ($defaultClasses as $clsName) {
                $cls = SchoolClass::create([
                    'name' => $clsName,
                    'school_id' => $schoolId ?? 1,
                ]);
                foreach ($sections as $secName) {
                    Section::create([
                        'school_id' => $schoolId ?? 1,
                        'school_class_id' => $cls->id,
                        'name' => $secName,
                        'capacity' => 40,
                    ]);
                }
            }
            $classes = $schoolId 
                ? SchoolClass::where('school_id', $schoolId)->with('sections')->get()
                : SchoolClass::with('sections')->get();
        }

        return response()->json([
            'success' => true,
            'data' => $classes,
        ]);
    }

    public function subjects()
    {
        $subjects = Subject::orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $subjects,
        ]);
    }

    public function storeClass(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'nullable|string|max:50',
            'sections' => 'nullable|array',
        ]);

        $schoolId = \App\Services\SchoolContext::getActiveSchoolId() ?: $request->user()?->school_id;
        $class = SchoolClass::create([
            'school_id' => $schoolId,
            'name' => $request->name,
            'code' => $request->code,
            'description' => $request->description,
        ]);

        if ($request->has('sections') && is_array($request->sections)) {
            foreach ($request->sections as $secName) {
                Section::create([
                    'school_id' => $schoolId,
                    'school_class_id' => $class->id,
                    'name' => $secName,
                    'capacity' => 40,
                ]);
            }
        }

        \Illuminate\Support\Facades\Cache::forget("school_" . ($schoolId ?? 'all') . "_classes_v2");
        \Illuminate\Support\Facades\Cache::forget("school_all_classes_v2");

        return response()->json([
            'success' => true,
            'message' => 'Class created successfully',
            'data' => $class->load('sections'),
        ], 201);
    }
}
