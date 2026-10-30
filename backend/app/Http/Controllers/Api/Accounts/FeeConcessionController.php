<?php

namespace App\Http\Controllers\Api\Accounts;

use App\Http\Controllers\Controller;
use App\Models\FeeConcessionType;
use App\Models\FeeStructure;
use App\Models\Student;
use App\Models\StudentFee;
use App\Models\StudentFeeConcession;
use App\Services\AcademicYearContext;
use App\Services\Fees\FeeLedgerService;
use App\Services\SchoolContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FeeConcessionController extends Controller
{
    public function typesList(Request $request)
    {
        $types = FeeConcessionType::orderBy('name')->get();
        return response()->json(['success' => true, 'data' => $types]);
    }

    public function storeType(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'admin' && $user->role !== 'super_admin') {
            return response()->json(['success' => false, 'message' => 'Only administrators can create concession types.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'discount_type' => 'required|string|in:percentage,fixed_amount',
            'discount_value' => 'required|numeric|min:0.01',
            'applicable_fee_head' => 'required|string|in:tuition_fee,total_annual_fee,activity_fee,lab_library_fee,other_fee',
            'description' => 'nullable|string|max:255',
        ]);

        $schoolId = SchoolContext::getActiveSchoolId() ?: $user->school_id;

        $type = FeeConcessionType::updateOrCreate(
            ['school_id' => $schoolId, 'name' => $validated['name']],
            [
                'discount_type' => $validated['discount_type'],
                'discount_value' => $validated['discount_value'],
                'applicable_fee_head' => $validated['applicable_fee_head'],
                'description' => $validated['description'] ?? null,
                'is_active' => true,
            ]
        );

        return response()->json(['success' => true, 'data' => $type], 201);
    }

    public function apply(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'fee_concession_type_id' => 'required|exists:fee_concession_types,id',
            'remarks' => 'nullable|string|max:255',
        ]);

        $user = $request->user();
        $schoolId = SchoolContext::getActiveSchoolId() ?: $user->school_id;
        $student = Student::withoutGlobalScopes()->findOrFail($validated['student_id']);

        if ((int)$student->school_id !== (int)$schoolId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized student access.'], 403);
        }

        $ay = AcademicYearContext::getActiveAcademicYear($schoolId);
        $academicYearId = $ay ? $ay->id : 1;

        // Prevent duplicate concession types per student and year
        $existing = StudentFeeConcession::where('school_id', $schoolId)
            ->where('student_id', $student->id)
            ->where('academic_year_id', $academicYearId)
            ->where('fee_concession_type_id', $validated['fee_concession_type_id'])
            ->whereIn('approval_status', ['pending', 'approved'])
            ->exists();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'This concession type is already assigned to the student for this academic year.',
            ], 422);
        }

        $concession = StudentFeeConcession::create([
            'school_id' => $schoolId,
            'student_id' => $student->id,
            'fee_concession_type_id' => $validated['fee_concession_type_id'],
            'academic_year_id' => $academicYearId,
            'approval_status' => 'pending',
            'requested_by_user_id' => $user->id,
            'remarks' => $validated['remarks'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Concession application submitted successfully. Awaiting Administrator approval.',
            'data' => $concession->load('concessionType'),
        ], 201);
    }

    public function approve(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'admin' && $user->role !== 'super_admin') {
            return response()->json(['success' => false, 'message' => 'Only administrators can approve concessions.'], 403);
        }

        $concession = StudentFeeConcession::with(['concessionType', 'student.schoolClass'])->findOrFail($id);
        if ($concession->approval_status === 'approved') {
            return response()->json(['success' => false, 'message' => 'Concession has already been approved.'], 422);
        }

        $student = $concession->student;
        $classId = $student->school_class_id;
        $type = $concession->concessionType;

        // Fetch base fee structure
        $feeStruct = FeeStructure::where('school_class_id', $classId)->first();
        $head = $type->applicable_fee_head;
        $baseHeadFee = $feeStruct ? (float) ($feeStruct->{$head} ?? $feeStruct->tuition_fee) : 60000.00;

        // Calculate discount AT APPROVAL TIME
        $discount = ($type->discount_type === 'percentage')
            ? round(($baseHeadFee * ((float)$type->discount_value)) / 100, 2)
            : round((float)$type->discount_value, 2);

        // Cap total concessions for this student and academic year at 100% of base fee
        $alreadyApprovedDiscount = (float) StudentFeeConcession::where('student_id', $student->id)
            ->where('academic_year_id', $concession->academic_year_id)
            ->where('approval_status', 'approved')
            ->where('id', '!=', $concession->id)
            ->sum('calculated_discount_amount');

        if (($alreadyApprovedDiscount + $discount) > $baseHeadFee) {
            return response()->json([
                'success' => false,
                'message' => "Total concessions cannot exceed 100% of applicable fee head. Base fee: ₹" . number_format($baseHeadFee, 2) . ", already approved: ₹" . number_format($alreadyApprovedDiscount, 2) . ", attempted: ₹" . number_format($discount, 2) . ".",
            ], 422);
        }

        DB::transaction(function () use ($concession, $user, $discount, $student, $type) {
            $concession->update([
                'calculated_discount_amount' => $discount,
                'approval_status' => 'approved',
                'approved_by_user_id' => $user->id,
                'approved_at' => now(),
            ]);

            // Distribute concession across unpaid installments of the student
            $unpaidInstallments = StudentFee::where('student_id', $student->id)
                ->where('status', '!=', 'Paid')
                ->orderBy('due_date', 'asc')
                ->get();

            $instCount = max(1, $unpaidInstallments->count());
            $perInstDiscount = round($discount / $instCount, 2);

            foreach ($unpaidInstallments as $inst) {
                $inst->concession_amount = round(((float)$inst->concession_amount) + $perInstDiscount, 2);
                $inst->net_amount = max(0.00, round(((float)$inst->amount) - ((float)$inst->concession_amount) + ((float)$inst->fine_amount) - ((float)$inst->fine_waived_amount), 2));
                
                $rem = round(((float)$inst->net_amount) - ((float)$inst->paid_amount), 2);
                if ($rem <= 0.01) {
                    $inst->status = 'Paid';
                }
                $inst->save();
            }

            // Ledger credit entry
            FeeLedgerService::append(
                schoolId: $concession->school_id,
                studentId: $student->id,
                entryType: 'concession',
                description: "Approved Concession: {$type->name} ({$type->applicable_fee_head})",
                debit: 0.00,
                credit: $discount,
                referenceNumber: 'CONC-' . $concession->id,
                academicYearId: $concession->academic_year_id,
                userId: $user->id
            );
        });

        return response()->json([
            'success' => true,
            'message' => "Concession of ₹" . number_format($discount, 2) . " approved and applied to student dues.",
            'data' => $concession->fresh(),
        ]);
    }

    public function revoke(Request $request, $id)
    {
        $request->validate(['reason' => 'required|string|max:255']);
        $user = $request->user();
        if ($user->role !== 'admin' && $user->role !== 'super_admin') {
            return response()->json(['success' => false, 'message' => 'Only administrators can revoke concessions.'], 403);
        }

        $concession = StudentFeeConcession::with('concessionType')->findOrFail($id);
        if ($concession->approval_status !== 'approved') {
            return response()->json(['success' => false, 'message' => 'Only approved concessions can be revoked.'], 422);
        }

        $discount = (float) $concession->calculated_discount_amount;
        $studentId = $concession->student_id;

        DB::transaction(function () use ($concession, $user, $discount, $studentId, $request) {
            $concession->update([
                'approval_status' => 'revoked',
                'revoked_by_user_id' => $user->id,
                'revoked_at' => now(),
                'revoke_reason' => $request->input('reason'),
            ]);

            // Rebalance installments
            $installments = StudentFee::where('student_id', $studentId)
                ->orderBy('due_date', 'asc')
                ->get();

            $instCount = max(1, $installments->count());
            $perInstReverse = round($discount / $instCount, 2);

            foreach ($installments as $inst) {
                $inst->concession_amount = max(0.00, round(((float)$inst->concession_amount) - $perInstReverse, 2));
                $inst->net_amount = max(0.00, round(((float)$inst->amount) - ((float)$inst->concession_amount) + ((float)$inst->fine_amount) - ((float)$inst->fine_waived_amount), 2));
                
                $rem = round(((float)$inst->net_amount) - ((float)$inst->paid_amount), 2);
                $inst->status = ($rem <= 0.01) ? 'Paid' : (($inst->paid_amount > 0) ? 'Partial' : 'Pending');
                $inst->save();
            }

            // Ledger reversal debit
            FeeLedgerService::append(
                schoolId: $concession->school_id,
                studentId: $studentId,
                entryType: 'reversal',
                description: "Reversal: Revoked Concession {$concession->concessionType?->name} - Reason: " . $request->input('reason'),
                debit: $discount,
                credit: 0.00,
                referenceNumber: 'REV-CONC-' . $concession->id,
                academicYearId: $concession->academic_year_id,
                userId: $user->id
            );
        });

        return response()->json([
            'success' => true,
            'message' => "Concession revoked successfully. Dues and ledger adjusted.",
        ]);
    }
}

