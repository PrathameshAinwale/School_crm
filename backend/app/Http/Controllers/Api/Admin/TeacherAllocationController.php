<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\ClassTeacherAllocation;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeacherSubjectAssignment;
use App\Services\AcademicYearContext;
use App\Services\SchoolContext;
use Illuminate\Http\Request;

class TeacherAllocationController extends Controller
{
    public function index(Request $request)
    {
        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()->school_id;
        $academicYearId = AcademicYearContext::getActiveAcademicYearId($schoolId);

        $assignments = TeacherSubjectAssignment::where('school_id', $schoolId)
            ->where('academic_year_id', $academicYearId)
            ->with(['teacher', 'schoolClass', 'section', 'subject'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $assignments,
        ]);
    }

    public function store(Request $request)
    {
        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()->school_id;
        $academicYearId = AcademicYearContext::getActiveAcademicYearId($schoolId);

        $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'school_class_id' => 'required|exists:school_classes,id',
            'section_id' => 'required|exists:sections,id',
            'subject_id' => 'required|exists:subjects,id',
            'role' => 'nullable|in:lead,co_teacher',
        ]);

        // Cross-entity validation: Ensure section belongs to class and school
        $section = Section::where('id', $request->section_id)
            ->where('school_class_id', $request->school_class_id)
            ->where('school_id', $schoolId)
            ->first();

        if (!$section) {
            return response()->json([
                'success' => false,
                'message' => 'The selected section does not belong to the specified class or school.',
            ], 422);
        }

        // Verify teacher and subject belong to school
        $teacher = Teacher::where('id', $request->teacher_id)->where('school_id', $schoolId)->first();
        $subject = Subject::where('id', $request->subject_id)->where('school_id', $schoolId)->first();

        if (!$teacher || !$subject) {
            return response()->json([
                'success' => false,
                'message' => 'The specified teacher or subject does not belong to this school.',
            ], 422);
        }

        $assignment = TeacherSubjectAssignment::updateOrCreate(
            [
                'school_id' => $schoolId,
                'academic_year_id' => $academicYearId,
                'school_class_id' => $request->school_class_id,
                'section_id' => $request->section_id,
                'subject_id' => $request->subject_id,
                'teacher_id' => $request->teacher_id,
            ],
            [
                'role' => $request->role ?: 'lead',
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Teacher assigned to subject and section successfully.',
            'data' => $assignment->load(['teacher', 'schoolClass', 'section', 'subject']),
        ], 201);
    }

    public function destroy(Request $request, $id)
    {
        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()->school_id;
        $assignment = TeacherSubjectAssignment::where('school_id', $schoolId)->findOrFail($id);
        $assignment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Teacher assignment removed successfully.',
        ]);
    }

    public function classTeachersIndex(Request $request)
    {
        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()->school_id;
        $academicYearId = AcademicYearContext::getActiveAcademicYearId($schoolId);

        $allocations = ClassTeacherAllocation::where('school_id', $schoolId)
            ->where('academic_year_id', $academicYearId)
            ->with(['teacher', 'schoolClass', 'section'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $allocations,
        ]);
    }

    public function classTeachersStore(Request $request)
    {
        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()->school_id;
        $academicYearId = AcademicYearContext::getActiveAcademicYearId($schoolId);

        $request->validate([
            'school_class_id' => 'required|exists:school_classes,id',
            'section_id' => 'required|exists:sections,id',
            'teacher_id' => 'required|exists:teachers,id',
        ]);

        $section = Section::where('id', $request->section_id)
            ->where('school_class_id', $request->school_class_id)
            ->where('school_id', $schoolId)
            ->first();

        if (!$section) {
            return response()->json([
                'success' => false,
                'message' => 'The selected section does not belong to the specified class or school.',
            ], 422);
        }

        $teacher = Teacher::where('id', $request->teacher_id)->where('school_id', $schoolId)->first();
        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'The specified teacher does not belong to this school.',
            ], 422);
        }

        $allocation = ClassTeacherAllocation::updateOrCreate(
            [
                'school_id' => $schoolId,
                'academic_year_id' => $academicYearId,
                'school_class_id' => $request->school_class_id,
                'section_id' => $request->section_id,
            ],
            [
                'teacher_id' => $request->teacher_id,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Class teacher assigned successfully.',
            'data' => $allocation->load(['teacher', 'schoolClass', 'section']),
        ], 201);
    }
}

