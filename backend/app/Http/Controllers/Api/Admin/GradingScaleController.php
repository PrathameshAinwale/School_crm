<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamTerm;
use App\Models\GradingScale;
use App\Models\GradingScaleTier;
use App\Services\Exams\GradingScaleValidationService;
use App\Services\SchoolContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class GradingScaleController extends Controller
{
    public function index(Request $request)
    {
        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()->school_id;

        $scales = GradingScale::where('school_id', $schoolId)
            ->with(['tiers' => fn($q) => $q->orderBy('order_seq')->orderByDesc('min_percentage')])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $scales,
        ]);
    }

    public function store(Request $request)
    {
        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()->school_id;

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'tiers' => 'required|array|min:1',
            'tiers.*.grade' => 'required|string|max:10',
            'tiers.*.min_percentage' => 'required|numeric|min:0|max:100',
            'tiers.*.max_percentage' => 'required|numeric|min:0|max:100',
            'tiers.*.grade_point' => 'required|numeric|min:0|max:10',
            'tiers.*.description' => 'nullable|string',
        ]);

        try {
            $validatedTiers = GradingScaleValidationService::validateContinuousTiers($request->tiers);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        $scale = DB::transaction(function () use ($schoolId, $request, $validatedTiers) {
            $scale = GradingScale::create([
                'school_id' => $schoolId,
                'name' => $request->name,
                'description' => $request->description,
                'is_active' => $request->boolean('is_active', true),
            ]);

            foreach ($validatedTiers as $idx => $tierData) {
                GradingScaleTier::create([
                    'grading_scale_id' => $scale->id,
                    'grade' => $tierData['grade'],
                    'min_percentage' => $tierData['min_percentage'],
                    'max_percentage' => $tierData['max_percentage'],
                    'grade_point' => $tierData['grade_point'],
                    'description' => $tierData['description'] ?? null,
                    'order_seq' => $idx + 1,
                ]);
            }

            return $scale->load('tiers');
        });

        return response()->json([
            'success' => true,
            'message' => 'Grading scale created successfully.',
            'data' => $scale,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()->school_id;
        $scale = GradingScale::where('school_id', $schoolId)->findOrFail($id);

        // Guard: Block grading scale edits whenever any term using that scale has locked papers
        $termsUsingScale = ExamTerm::where('grading_scale_id', $scale->id)->pluck('id');
        $hasLockedPapers = Exam::whereIn('exam_term_id', $termsUsingScale)
            ->whereIn('status', ['locked', 'published'])
            ->exists();

        if ($hasLockedPapers) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot modify grading scale: an examination term using this scale already contains locked or published exam papers.',
            ], 422);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'tiers' => 'sometimes|required|array|min:1',
            'tiers.*.grade' => 'required|string|max:10',
            'tiers.*.min_percentage' => 'required|numeric|min:0|max:100',
            'tiers.*.max_percentage' => 'required|numeric|min:0|max:100',
            'tiers.*.grade_point' => 'required|numeric|min:0|max:10',
            'tiers.*.description' => 'nullable|string',
        ]);

        if ($request->has('tiers')) {
            try {
                $validatedTiers = GradingScaleValidationService::validateContinuousTiers($request->tiers);
            } catch (InvalidArgumentException $e) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage(),
                ], 422);
            }
        }

        $tiersToSave = $validatedTiers ?? null;

        DB::transaction(function () use ($scale, $request, $tiersToSave) {
            $scale->update($request->only(['name', 'description', 'is_active']));

            if (isset($tiersToSave)) {
                $scale->tiers()->delete();
                foreach ($tiersToSave as $idx => $tierData) {
                    GradingScaleTier::create([
                        'grading_scale_id' => $scale->id,
                        'grade' => $tierData['grade'],
                        'min_percentage' => $tierData['min_percentage'],
                        'max_percentage' => $tierData['max_percentage'],
                        'grade_point' => $tierData['grade_point'],
                        'description' => $tierData['description'] ?? null,
                        'order_seq' => $idx + 1,
                    ]);
                }
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Grading scale updated successfully.',
            'data' => $scale->load('tiers'),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()->school_id;
        $scale = GradingScale::where('school_id', $schoolId)->findOrFail($id);

        if (ExamTerm::where('grading_scale_id', $scale->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete grading scale: it is referenced by existing exam terms.',
            ], 422);
        }

        $scale->tiers()->delete();
        $scale->delete();

        return response()->json([
            'success' => true,
            'message' => 'Grading scale deleted successfully.',
        ]);
    }
}
