<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Services\AcademicYearContext;
use App\Services\SchoolContext;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AcademicYearController extends Controller
{
    /**
     * List all academic years for active school branch.
     */
    public function index(Request $request)
    {
        $schoolId = SchoolContext::getActiveSchoolId();

        $years = AcademicYear::where('school_id', $schoolId)
            ->orderBy('start_date', 'desc')
            ->get();

        $currentYear = $years->firstWhere('is_current', true);

        return response()->json([
            'success' => true,
            'data' => [
                'academic_years' => $years,
                'current_year' => $currentYear,
                'active_context_year_id' => AcademicYearContext::getActiveAcademicYearId() ?: ($currentYear?->id),
            ],
        ]);
    }

    /**
     * Store a new academic year session.
     */
    public function store(Request $request)
    {
        $schoolId = SchoolContext::getActiveSchoolId();

        $request->validate([
            'name' => 'required|string|max:50',
            'code' => 'required|string|max:50',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'nullable|string|in:active,upcoming,closed',
            'description' => 'nullable|string',
            'is_current' => 'nullable|boolean',
        ]);

        $startDate = $request->start_date;
        $endDate = $request->end_date;

        // Condition 4: Reject end_date <= start_date
        if (Carbon::parse($endDate)->lte(Carbon::parse($startDate))) {
            return response()->json([
                'success' => false,
                'message' => 'The academic year end date must be strictly after the start date.',
            ], 422);
        }

        // Condition 4: Reject overlapping date ranges within the same school
        $hasOverlap = AcademicYear::where('school_id', $schoolId)
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('start_date', [$startDate, $endDate])
                  ->orWhereBetween('end_date', [$startDate, $endDate])
                  ->orWhere(function ($sub) use ($startDate, $endDate) {
                      $sub->where('start_date', '<=', $startDate)
                          ->where('end_date', '>=', $endDate);
                  });
            })
            ->exists();

        if ($hasOverlap) {
            return response()->json([
                'success' => false,
                'message' => 'The selected date range overlaps with an existing academic session in this school.',
            ], 422);
        }

        return DB::transaction(function () use ($request, $schoolId) {
            $isCurrent = $request->boolean('is_current', false);

            if ($isCurrent) {
                AcademicYear::where('school_id', $schoolId)->update(['is_current' => false]);
            }

            $year = AcademicYear::create([
                'school_id' => $schoolId,
                'name' => $request->name,
                'code' => $request->code,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'is_current' => $isCurrent,
                'status' => $request->status ?? ($isCurrent ? 'active' : 'upcoming'),
                'description' => $request->description,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Academic session created successfully.',
                'data' => $year,
            ], 201);
        });
    }

    /**
     * Update an academic year session.
     */
    public function update(Request $request, $id)
    {
        $schoolId = SchoolContext::getActiveSchoolId();
        $year = AcademicYear::where('school_id', $schoolId)->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:50',
            'code' => 'required|string|max:50',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'nullable|string|in:active,upcoming,closed',
            'description' => 'nullable|string',
            'is_current' => 'nullable|boolean',
        ]);

        $startDate = $request->start_date;
        $endDate = $request->end_date;

        if (Carbon::parse($endDate)->lte(Carbon::parse($startDate))) {
            return response()->json([
                'success' => false,
                'message' => 'The academic year end date must be strictly after the start date.',
            ], 422);
        }

        // Reject overlap with any OTHER session in this school
        $hasOverlap = AcademicYear::where('school_id', $schoolId)
            ->where('id', '!=', $year->id)
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('start_date', [$startDate, $endDate])
                  ->orWhereBetween('end_date', [$startDate, $endDate])
                  ->orWhere(function ($sub) use ($startDate, $endDate) {
                      $sub->where('start_date', '<=', $startDate)
                          ->where('end_date', '>=', $endDate);
                  });
            })
            ->exists();

        if ($hasOverlap) {
            return response()->json([
                'success' => false,
                'message' => 'The updated date range overlaps with an existing academic session in this school.',
            ], 422);
        }

        return DB::transaction(function () use ($request, $year, $schoolId) {
            $isCurrent = $request->boolean('is_current', $year->is_current);

            if ($isCurrent && !$year->is_current) {
                AcademicYear::where('school_id', $schoolId)->update(['is_current' => false]);
            }

            $year->update([
                'name' => $request->name,
                'code' => $request->code,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'is_current' => $isCurrent,
                'status' => $request->status ?? $year->status,
                'description' => $request->description,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Academic session updated successfully.',
                'data' => $year,
            ]);
        });
    }

    /**
     * Set a specific academic year as the active current session for this school.
     * Condition 4: Runs in a DB::transaction and leaves exactly one current year per school.
     */
    public function setCurrent($id)
    {
        $schoolId = SchoolContext::getActiveSchoolId();
        $year = AcademicYear::where('school_id', $schoolId)->findOrFail($id);

        return DB::transaction(function () use ($year, $schoolId) {
            // Unset current on all years in this school
            AcademicYear::where('school_id', $schoolId)->update(['is_current' => false]);

            // Set current on the target year
            $year->update([
                'is_current' => true,
                'status' => 'active',
            ]);

            AcademicYearContext::setActiveAcademicYearId($year->id);

            return response()->json([
                'success' => true,
                'message' => "Academic session '{$year->name}' is now the active current session.",
                'data' => $year,
            ]);
        });
    }

    /**
     * Switch active academic year in user's session context.
     * Validates year belongs to active school.
     */
    public function switchYear(Request $request)
    {
        $request->validate([
            'academic_year_id' => 'required|integer',
        ]);

        $schoolId = SchoolContext::getActiveSchoolId();
        $year = AcademicYear::where('school_id', $schoolId)->find($request->academic_year_id);

        if (!$year) {
            return response()->json([
                'success' => false,
                'message' => 'Selected academic session does not belong to the active school branch.',
            ], 404);
        }

        AcademicYearContext::setActiveAcademicYearId($year->id);

        return response()->json([
            'success' => true,
            'message' => "Switched active academic session to {$year->name}.",
            'data' => $year,
        ]);
    }

    /**
     * Delete an academic year session.
     * Condition 4: Do not allow deleting a year that is referenced as current.
     */
    public function destroy($id)
    {
        $schoolId = SchoolContext::getActiveSchoolId();
        $year = AcademicYear::where('school_id', $schoolId)->findOrFail($id);

        if ($year->is_current) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete the active current academic session. Please set another session as current first.',
            ], 422);
        }

        $year->delete();

        return response()->json([
            'success' => true,
            'message' => 'Academic session archived successfully.',
        ]);
    }
}

