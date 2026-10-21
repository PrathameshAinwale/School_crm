<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\SchoolClass;
use App\Services\SchoolContext;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    /**
     * Get all school branches accessible to the authenticated user.
     */
    public function branches(Request $request)
    {
        $user = $request->user();

        // Super Admin and Admin can view all branches
        // Other roles are restricted to their home branch only
        if ($user->role === 'super_admin' || $user->role === 'admin') {
            $schoolsQuery = School::query();
        } else {
            $schoolsQuery = School::where('id', $user->school_id);
        }

        $schools = $schoolsQuery->get()->map(function ($school) {
            $studentsCount = Student::where('school_id', $school->id)->count();
            $teachersCount = Teacher::where('school_id', $school->id)->count();
            $classesCount = SchoolClass::where('school_id', $school->id)->count();

            return [
                'id' => $school->id,
                'name' => $school->name,
                'code' => $school->code,
                'affiliation' => $school->affiliation ?? 'CBSE',
                'city' => $school->city ?? 'Campus',
                'state' => $school->state,
                'phone' => $school->phone,
                'email' => $school->email,
                'principal_name' => $school->principal_name,
                'status' => $school->status,
                'students_count' => $studentsCount,
                'teachers_count' => $teachersCount,
                'classes_count' => $classesCount,
            ];
        });

        $activeSchoolId = SchoolContext::getActiveSchoolId() ?: $user->school_id;
        $currentBranch = $schools->firstWhere('id', $activeSchoolId) ?? $schools->first();

        return response()->json([
            'success' => true,
            'active_school_id' => $currentBranch ? $currentBranch['id'] : null,
            'current_branch' => $currentBranch,
            'branches' => $schools,
            'user_home_branch_id' => $user->school_id,
        ]);
    }

    /**
     * Validate and acknowledge a branch switch request.
     * Note: Does NOT overwrite $user->school_id to preserve the user's permanent home branch.
     */
    public function switchBranch(Request $request)
    {
        $request->validate([
            'branch_id' => 'required|exists:schools,id',
        ]);

        $user = $request->user();
        $targetSchoolId = (int)$request->branch_id;

        // Verify authorization: only super_admin and admin can switch
        if ($user->role !== 'super_admin' && $user->role !== 'admin') {
            if ($targetSchoolId !== (int)$user->school_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized: Cross-branch access is strictly prohibited for your account role.',
                ], 403);
            }
        }

        $targetSchool = School::findOrFail($targetSchoolId);

        return response()->json([
            'success' => true,
            'message' => "Switched active campus to '{$targetSchool->name}'.",
            'active_school_id' => $targetSchool->id,
            'branch' => [
                'id' => $targetSchool->id,
                'name' => $targetSchool->name,
                'code' => $targetSchool->code,
                'city' => $targetSchool->city,
                'affiliation' => $targetSchool->affiliation,
            ],
            'home_branch_id' => $user->school_id,
        ]);
    }
}
