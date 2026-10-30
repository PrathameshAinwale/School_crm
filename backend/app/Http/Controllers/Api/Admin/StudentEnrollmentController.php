<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentSubjectEnrollment;
use App\Models\Subject;
use App\Services\AcademicYearContext;
use App\Services\SchoolContext;
use Illuminate\Http\Request;

class StudentEnrollmentController extends Controller
{
    public function index(Request $request)
    {
        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()->school_id;
        $academicYearId = AcademicYearContext::getActiveAcademicYearId($schoolId);

        $query = StudentSubjectEnrollment::where('school_id', $schoolId)
            ->where('academic_year_id', $academicYearId)
            ->with(['student.schoolClass', 'student.section', 'subject']);

        if ($request->has('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->has('school_class_id')) {
            $query->whereHas('student', function ($q) use ($request) {
                $q->where('school_class_id', $request->school_class_id);
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    public function store(Request $request)
    {
        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()->school_id;
        $academicYearId = AcademicYearContext::getActiveAcademicYearId($schoolId);

        $request->validate([
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'exists:students,id',
            'subject_id' => 'required|exists:subjects,id',
            'is_optional' => 'boolean',
        ]);

        $subject = Subject::where('id', $request->subject_id)->where('school_id', $schoolId)->first();
        if (!$subject) {
            return response()->json([
                'success' => false,
                'message' => 'Subject not found in this school.',
            ], 422);
        }

        $enrolledCount = 0;
        foreach ($request->student_ids as $studentId) {
            $student = Student::where('id', $studentId)->where('school_id', $schoolId)->first();
            if ($student) {
                StudentSubjectEnrollment::updateOrCreate(
                    [
                        'school_id' => $schoolId,
                        'academic_year_id' => $academicYearId,
                        'student_id' => $student->id,
                        'subject_id' => $subject->id,
                    ],
                    [
                        'is_optional' => $request->boolean('is_optional', true),
                    ]
                );
                $enrolledCount++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Enrolled {$enrolledCount} students into {$subject->name} successfully.",
        ], 201);
    }

    public function destroy(Request $request, $id)
    {
        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()->school_id;
        $enrollment = StudentSubjectEnrollment::where('school_id', $schoolId)->findOrFail($id);
        $enrollment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Student elective enrollment removed successfully.',
        ]);
    }
}

