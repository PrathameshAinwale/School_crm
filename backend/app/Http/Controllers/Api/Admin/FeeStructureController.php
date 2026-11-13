<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\FeeStructure;
use App\Models\FeeStructureInstallment;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentFee;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FeeStructureController extends Controller
{
    /**
     * List all classes with their fee structures, student counts, and revenue projections.
     */
    public function index(Request $request)
    {
        $classes = SchoolClass::with(['feeStructure.installments', 'students'])
            ->orderBy('id', 'asc')
            ->get();

        $structures = $classes->map(function ($cls) {
            $feeStruct = $cls->feeStructure;
            $studentsCount = $cls->students->count();
            $totalAnnual = $feeStruct ? (float) $feeStruct->total_annual_fee : 0;
            $projectedRevenue = $totalAnnual * $studentsCount;

            $parsed = $this->parseNotesAndFeeHeads($feeStruct);

            $installments = $feeStruct ? $feeStruct->installments->map(function ($inst) {
                return [
                    'id' => $inst->id,
                    'termName' => $inst->term_name,
                    'amount' => (float) $inst->amount,
                    'dueDate' => $inst->due_date ? Carbon::parse($inst->due_date)->format('Y-m-d') : null,
                    'formattedDueDate' => $inst->due_date ? Carbon::parse($inst->due_date)->format('M d, Y') : '—',
                    'lateFeePerDay' => (float) $inst->late_fee_per_day,
                    'description' => $inst->description,
                ];
            }) : [];

            return [
                'classId' => $cls->id,
                'className' => $cls->name,
                'studentsCount' => $studentsCount,
                'feeStructureId' => $feeStruct ? $feeStruct->id : null,
                'academicYear' => $feeStruct ? $feeStruct->academic_year : '2026-27',
                'tuitionFee' => $feeStruct ? (float) $feeStruct->tuition_fee : 0,
                'transportFee' => $feeStruct ? (float) $feeStruct->transport_fee : 0,
                'labLibraryFee' => $feeStruct ? (float) $feeStruct->lab_library_fee : 0,
                'activityFee' => $feeStruct ? (float) $feeStruct->activity_fee : 0,
                'otherFee' => $feeStruct ? (float) $feeStruct->other_fee : 0,
                'totalAnnualFee' => $totalAnnual,
                'feeHeads' => $parsed['feeHeads'],
                'installmentsCount' => $feeStruct ? $feeStruct->installments_count : count($installments),
                'projectedRevenue' => $projectedRevenue,
                'notes' => $parsed['notes'],
                'installments' => $installments,
                'isConfigured' => (bool) $feeStruct,
            ];
        });

        $totalClasses = $classes->count();
        $configuredClasses = $structures->where('isConfigured', true)->count();
        $totalProjectedRevenue = $structures->sum('projectedRevenue');
        $averageAnnualFee = $configuredClasses > 0 ? round($structures->where('isConfigured', true)->avg('totalAnnualFee'), 2) : 0;
        $totalStudents = $structures->sum('studentsCount');

        return response()->json([
            'success' => true,
            'data' => [
                'structures' => $structures,
                'summary' => [
                    'totalClasses' => $totalClasses,
                    'configuredClasses' => $configuredClasses,
                    'totalStudents' => $totalStudents,
                    'totalProjectedRevenue' => $totalProjectedRevenue,
                    'averageAnnualFee' => $averageAnnualFee,
                    'academicYear' => '2026-27',
                ],
            ],
        ]);
    }

    /**
     * Get specific class fee structure.
     */
    public function show(Request $request, $classId)
    {
        $cls = SchoolClass::with(['feeStructure.installments', 'students'])->findOrFail($classId);
        $feeStruct = $cls->feeStructure;
        $parsed = $this->parseNotesAndFeeHeads($feeStruct);

        $installments = $feeStruct ? $feeStruct->installments->map(function ($inst) {
            return [
                'id' => $inst->id,
                'termName' => $inst->term_name,
                'amount' => (float) $inst->amount,
                'dueDate' => $inst->due_date ? Carbon::parse($inst->due_date)->format('Y-m-d') : null,
                'formattedDueDate' => $inst->due_date ? Carbon::parse($inst->due_date)->format('M d, Y') : '—',
                'lateFeePerDay' => (float) $inst->late_fee_per_day,
                'description' => $inst->description,
            ];
        }) : [];

        return response()->json([
            'success' => true,
            'data' => [
                'classId' => $cls->id,
                'className' => $cls->name,
                'studentsCount' => $cls->students->count(),
                'feeStructureId' => $feeStruct ? $feeStruct->id : null,
                'academicYear' => $feeStruct ? $feeStruct->academic_year : '2026-27',
                'tuitionFee' => $feeStruct ? (float) $feeStruct->tuition_fee : 0,
                'transportFee' => $feeStruct ? (float) $feeStruct->transport_fee : 0,
                'labLibraryFee' => $feeStruct ? (float) $feeStruct->lab_library_fee : 0,
                'activityFee' => $feeStruct ? (float) $feeStruct->activity_fee : 0,
                'otherFee' => $feeStruct ? (float) $feeStruct->other_fee : 0,
                'totalAnnualFee' => $feeStruct ? (float) $feeStruct->total_annual_fee : 0,
                'feeHeads' => $parsed['feeHeads'],
                'installmentsCount' => $feeStruct ? $feeStruct->installments_count : 4,
                'notes' => $parsed['notes'],
                'installments' => $installments,
            ],
        ]);
    }

    /**
     * Store or update fee structure for a standard/class and optionally sync to enrolled students.
     */
    public function storeOrUpdate(Request $request)
    {
        $request->validate([
            'school_class_id' => 'required|exists:school_classes,id',
            'academic_year' => 'nullable|string',
            'tuition_fee' => 'nullable|numeric|min:0',
            'fee_heads' => 'nullable|array',
            'fee_heads.*.title' => 'required_with:fee_heads|string|max:120',
            'fee_heads.*.amount' => 'required_with:fee_heads|numeric|min:0',
            'transport_fee' => 'nullable|numeric|min:0',
            'lab_library_fee' => 'nullable|numeric|min:0',
            'activity_fee' => 'nullable|numeric|min:0',
            'other_fee' => 'nullable|numeric|min:0',
            'installments' => 'required|array|min:1',
            'installments.*.term_name' => 'required|string',
            'installments.*.amount' => 'required|numeric|min:0',
            'installments.*.due_date' => 'required|date',
            'installments.*.late_fee_per_day' => 'nullable|numeric|min:0',
            'sync_students' => 'nullable|boolean',
        ]);

        $classId = $request->school_class_id;
        $academicYear = $request->input('academic_year', '2026-27');
        $feeHeads = $request->input('fee_heads');
        $notesInput = $request->input('notes', '');

        if (is_array($feeHeads) && count($feeHeads) > 0) {
            $totalAnnual = 0;
            $tuition = 0;
            $transport = 0;
            $lab = 0;
            $activity = 0;
            $other = 0;

            foreach ($feeHeads as $idx => $head) {
                $amt = (float)($head['amount'] ?? 0);
                $title = trim($head['title'] ?? '');
                $titleLower = strtolower($title);
                $totalAnnual += $amt;

                if ($idx === 0) {
                    $tuition = $amt;
                } elseif (str_contains($titleLower, 'transport') || str_contains($titleLower, 'bus') || str_contains($titleLower, 'van')) {
                    $transport += $amt;
                } elseif (str_contains($titleLower, 'lab') || str_contains($titleLower, 'library')) {
                    $lab += $amt;
                } elseif (str_contains($titleLower, 'sport') || str_contains($titleLower, 'activ') || str_contains($titleLower, 'event')) {
                    $activity += $amt;
                } else {
                    $other += $amt;
                }
            }

            $notesToStore = json_encode([
                'text' => $notesInput,
                'fee_heads' => $feeHeads,
            ]);
        } else {
            $tuition = (float) ($request->tuition_fee ?? 0);
            $transport = (float) $request->input('transport_fee', 0);
            $lab = (float) $request->input('lab_library_fee', 0);
            $activity = (float) $request->input('activity_fee', 0);
            $other = (float) $request->input('other_fee', 0);
            $totalAnnual = $tuition + $transport + $lab + $activity + $other;
            $notesToStore = $notesInput;
        }

        DB::beginTransaction();
        try {
            $feeStruct = FeeStructure::updateOrCreate(
                ['school_class_id' => $classId],
                [
                    'academic_year' => $academicYear,
                    'tuition_fee' => $tuition,
                    'transport_fee' => $transport,
                    'lab_library_fee' => $lab,
                    'activity_fee' => $activity,
                    'other_fee' => $other,
                    'total_annual_fee' => $totalAnnual,
                    'installments_count' => count($request->installments),
                    'notes' => $notesToStore,
                ]
            );

            // Replace installments
            $feeStruct->installments()->delete();
            foreach ($request->installments as $inst) {
                FeeStructureInstallment::create([
                    'fee_structure_id' => $feeStruct->id,
                    'term_name' => $inst['term_name'],
                    'amount' => $inst['amount'],
                    'due_date' => Carbon::parse($inst['due_date'])->toDateString(),
                    'late_fee_per_day' => $inst['late_fee_per_day'] ?? 0,
                    'description' => $inst['description'] ?? null,
                ]);
            }

            $syncedCount = 0;
            if ($request->boolean('sync_students', true)) {
                $syncedCount = $this->syncToClassStudents($classId, $feeStruct);
            }

            DB::commit();

            $cls = SchoolClass::find($classId);

            return response()->json([
                'success' => true,
                'message' => "Fee structure for {$cls->name} successfully saved and synchronized across {$syncedCount} enrolled students.",
                'data' => [
                    'fee_structure_id' => $feeStruct->id,
                    'class_name' => $cls->name,
                    'total_annual_fee' => $totalAnnual,
                    'synced_students_count' => $syncedCount,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to save fee structure: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Manually sync a class fee structure to all enrolled students.
     */
    public function syncStudents(Request $request, $id)
    {
        $feeStruct = FeeStructure::with('installments')->findOrFail($id);
        $syncedCount = $this->syncToClassStudents($feeStruct->school_class_id, $feeStruct);
        $cls = SchoolClass::find($feeStruct->school_class_id);

        return response()->json([
            'success' => true,
            'message' => "Synchronized fee schedule and installment dates to {$syncedCount} enrolled students of {$cls->name}.",
            'synced_students_count' => $syncedCount,
        ]);
    }

    /**
     * Delete a fee structure by structure id or school class id.
     */
    public function destroy(Request $request, $id)
    {
        $feeStruct = FeeStructure::find($id);
        if (!$feeStruct) {
            $feeStruct = FeeStructure::where('school_class_id', $id)->first();
        }

        if (!$feeStruct) {
            return response()->json([
                'success' => true,
                'message' => 'No active fee structure found to delete.',
            ]);
        }

        // Delete associated installments
        $feeStruct->installments()->delete();
        $feeStruct->delete();

        return response()->json([
            'success' => true,
            'message' => 'Fee structure deleted and reset successfully.',
        ]);
    }

    /**
     * Helper method to synchronize fee structure installments to enrolled students.
     */
    protected function syncToClassStudents($classId, FeeStructure $feeStruct)
    {
        $students = Student::where('school_class_id', $classId)->get();
        $installments = $feeStruct->installments;
        $instCount = $installments->count();
        $termNames = $installments->pluck('term_name')->toArray();
        $quarterTransport = $instCount > 0 ? round(((float)$feeStruct->transport_fee) / $instCount, 2) : 0;
        $count = 0;

        foreach ($students as $student) {
            $withTransport = (bool) $student->with_transport;

            // Remove legacy or obsolete unpaid fee entries that are not part of the active term structure
            StudentFee::where('student_id', $student->id)
                ->where('status', '!=', 'Paid')
                ->whereNotIn('term_name', $termNames)
                ->delete();

            foreach ($installments as $inst) {
                // Calculate correct amount for this student based on transport choice
                $installmentAmount = (float) $inst->amount;
                if (!$withTransport && $quarterTransport > 0) {
                    $installmentAmount = max(0, $installmentAmount - $quarterTransport);
                }

                $existing = StudentFee::where('student_id', $student->id)
                    ->where('term_name', $inst->term_name)
                    ->first();

                if ($existing) {
                    // If not paid, update amount and due date to match latest admin structure
                    if ($existing->status !== 'Paid') {
                        $existing->update([
                            'amount' => $installmentAmount,
                            'due_date' => $inst->due_date,
                        ]);
                    }
                } else {
                    // Create new installment
                    StudentFee::create([
                        'student_id' => $student->id,
                        'term_name' => $inst->term_name,
                        'amount' => $installmentAmount,
                        'due_date' => $inst->due_date,
                        'status' => 'Pending',
                        'tax_deductible' => true,
                    ]);
                }
            }
            $count++;
        }

        return $count;
    }

    /**
     * Parse raw notes field into text notes and custom fee heads.
     */
    protected function parseNotesAndFeeHeads(?FeeStructure $feeStruct): array
    {
        if (!$feeStruct) {
            return [
                'notes' => '',
                'feeHeads' => [],
            ];
        }

        $notesRaw = $feeStruct->notes;
        $notesText = $notesRaw ?? '';
        $feeHeads = [];

        if (!empty($notesRaw)) {
            $decoded = json_decode($notesRaw, true);
            if (is_array($decoded) && isset($decoded['fee_heads']) && is_array($decoded['fee_heads'])) {
                $feeHeads = $decoded['fee_heads'];
                $notesText = $decoded['text'] ?? ($decoded['notes'] ?? '');
            }
        }

        if (empty($feeHeads) && $feeStruct->total_annual_fee > 0) {
            if ((float) $feeStruct->tuition_fee > 0) {
                $feeHeads[] = ['title' => 'Core Tuition Fee', 'amount' => (float) $feeStruct->tuition_fee];
            }
            if ((float) $feeStruct->transport_fee > 0) {
                $feeHeads[] = ['title' => 'School Transport Fee', 'amount' => (float) $feeStruct->transport_fee];
            }
            if ((float) $feeStruct->lab_library_fee > 0) {
                $feeHeads[] = ['title' => 'Lab & Digital Library', 'amount' => (float) $feeStruct->lab_library_fee];
            }
            if ((float) $feeStruct->activity_fee > 0) {
                $feeHeads[] = ['title' => 'Sports & Activities Fee', 'amount' => (float) $feeStruct->activity_fee];
            }
            if ((float) $feeStruct->other_fee > 0) {
                $feeHeads[] = ['title' => 'Campus & Development Fee', 'amount' => (float) $feeStruct->other_fee];
            }
        }

        return [
            'notes' => $notesText,
            'feeHeads' => $feeHeads,
        ];
    }
}
