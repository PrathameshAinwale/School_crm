<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admission;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdmissionController extends Controller
{
    /**
     * Display a listing of admission applications.
     */
    public function index(Request $request)
    {
        $query = Admission::with(['schoolClass', 'enrolledStudent']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('application_number', 'like', "%{$search}%")
                  ->orWhere('guardian_name', 'like', "%{$search}%")
                  ->orWhere('guardian_phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && strtolower($request->status) !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('school_class_id') && strtolower($request->school_class_id) !== 'all') {
            $query->where('school_class_id', $request->school_class_id);
        }

        $admissions = $query->orderBy('created_at', 'desc')->paginate($request->input('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $admissions,
        ]);
    }

    /**
     * Store a newly submitted admission application.
     */
    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|string|in:Male,Female,Other',
            'school_class_id' => 'nullable',
            'academic_year' => 'nullable|string',
            'guardian_name' => 'required|string|max:255',
            'guardian_phone' => 'required|string|max:20',
            'guardian_email' => 'nullable|email',
            'guardian_relation' => 'nullable|string|max:100',
            'previous_school' => 'nullable|string',
            'previous_score' => 'nullable|string',
            'address' => 'nullable|string',
            'remarks' => 'nullable|string',
        ]);

        $count = Admission::count() + 1;
        $appNo = 'ADM-' . date('Y') . '-' . str_pad($count, 3, '0', STR_PAD_LEFT);

        $classId = $request->school_class_id;
        if ($classId && !is_numeric($classId)) {
            $cls = \App\Models\SchoolClass::firstOrCreate(['name' => $classId]);
            $classId = $cls->id;
        } elseif ($classId && !\App\Models\SchoolClass::where('id', $classId)->exists()) {
            $cls = \App\Models\SchoolClass::create(['id' => $classId, 'name' => "Grade {$classId}"]);
            $classId = $cls->id;
        }

        $admission = Admission::create([
            'application_number' => $appNo,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'date_of_birth' => $request->date_of_birth,
            'gender' => $request->gender,
            'school_class_id' => $classId,
            'academic_year' => $request->academic_year ?? '2024-2025',
            'guardian_name' => $request->guardian_name,
            'guardian_phone' => $request->guardian_phone,
            'guardian_email' => $request->guardian_email,
            'guardian_relation' => $request->guardian_relation ?? 'Parent',
            'previous_school' => $request->previous_school,
            'previous_score' => $request->previous_score,
            'address' => $request->address,
            'status' => 'Pending',
            'remarks' => $request->remarks,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Admission application submitted successfully.',
            'data' => $admission->load('schoolClass'),
        ], 201);
    }

    /**
     * Display the specified admission application.
     */
    public function show($id)
    {
        $admission = Admission::with(['schoolClass', 'enrolledStudent'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $admission,
        ]);
    }

    /**
     * Update status of an admission application.
     */
    public function updateStatus(Request $request, $id)
    {
        $admission = Admission::findOrFail($id);

        $request->validate([
            'status' => 'required|in:Pending,Under Review,Approved,Rejected,Enrolled',
            'remarks' => 'nullable|string',
        ]);

        $admission->status = $request->status;
        if ($request->filled('remarks')) {
            $admission->remarks = $request->remarks;
        }
        $admission->save();

        return response()->json([
            'success' => true,
            'message' => 'Application status updated to ' . $admission->status,
            'data' => $admission,
        ]);
    }

    /**
     * Enroll an approved applicant into the active Students roster with parent login credentials.
     */
    public function enroll(Request $request, $id)
    {
        $admission = Admission::findOrFail($id);

        $request->validate([
            'section_id' => 'nullable|exists:sections,id',
            'roll_number' => 'nullable|string|max:50',
            'blood_group' => 'nullable|string|max:10',
            'with_transport' => 'nullable|boolean',
        ]);

        $withTransport = $request->boolean('with_transport', (bool)$admission->with_transport);

        return DB::transaction(function () use ($request, $admission, $withTransport) {
            // 1. Generate unique student admission number
            $count = Student::count() + 1;
            $admissionNumber = 'STU-' . date('Y') . '-' . str_pad($count, 3, '0', STR_PAD_LEFT);

            // 2. Generate random password for parent login
            $generatedPassword = 'Prnt#' . rand(1000, 9999) . '!';
            $cleanPhone = preg_replace('/[^0-9]/', '', $admission->guardian_phone);

            // 3. Find or Create User for parent mobile
            $user = User::where('phone', $cleanPhone)->orWhere('phone', $admission->guardian_phone)->first();

            if (!$user) {
                $user = User::create([
                    'name' => $admission->guardian_name . ' (' . $admission->first_name . ')',
                    'email' => $admission->guardian_email,
                    'phone' => $cleanPhone ?: $admission->guardian_phone,
                    'password' => Hash::make($generatedPassword),
                    'role' => 'student_parent',
                    'must_change_password' => true,
                    'status' => 'active',
                ]);
            }

            // 4. Create Student record
            $student = Student::create([
                'user_id' => $user->id,
                'admission_number' => $admissionNumber,
                'roll_number' => $request->roll_number,
                'first_name' => $admission->first_name,
                'last_name' => $admission->last_name,
                'date_of_birth' => $admission->date_of_birth,
                'gender' => $admission->gender,
                'blood_group' => $request->blood_group,
                'school_class_id' => $admission->school_class_id,
                'section_id' => $request->section_id,
                'with_transport' => $withTransport,
                'admission_date' => now()->toDateString(),
                'guardian_name' => $admission->guardian_name,
                'guardian_phone' => $admission->guardian_phone,
                'guardian_email' => $admission->guardian_email,
                'guardian_relation' => $admission->guardian_relation,
                'address' => $admission->address,
                'status' => 'Active',
            ]);

            // 5. Automatically generate fee ledger installments based on Class Fee Structure
            $feeStruct = \App\Models\FeeStructure::with('installments')->where('school_class_id', $admission->school_class_id)->first();
            if ($feeStruct && $feeStruct->installments->count() > 0) {
                $instCount = $feeStruct->installments->count();
                $quarterTransport = $instCount > 0 ? round(((float)$feeStruct->transport_fee) / $instCount, 2) : 0;

                foreach ($feeStruct->installments as $inst) {
                    $installmentAmount = (float) $inst->amount;
                    if (!$withTransport && $quarterTransport > 0) {
                        // Deduct transport component if transport is not opted
                        $installmentAmount = max(0, $installmentAmount - $quarterTransport);
                    }

                    \App\Models\StudentFee::create([
                        'student_id' => $student->id,
                        'term_name' => $inst->term_name,
                        'amount' => $installmentAmount,
                        'due_date' => $inst->due_date,
                        'status' => 'Pending',
                        'tax_deductible' => true,
                    ]);
                }
            }

            // 6. Update admission record to Enrolled
            $admission->status = 'Enrolled';
            $admission->with_transport = $withTransport;
            $admission->enrolled_student_id = $student->id;
            $admission->save();

            return response()->json([
                'success' => true,
                'message' => 'Applicant successfully enrolled as an active student.',
                'data' => [
                    'admission' => $admission,
                    'student' => $student->load(['schoolClass', 'section']),
                ],
                'credentials' => [
                    'admission_number' => $admissionNumber,
                    'student_name' => $student->full_name,
                    'login_mobile' => $cleanPhone ?: $admission->guardian_phone,
                    'temporary_password' => $generatedPassword,
                    'must_change_password' => true,
                    'note' => 'Please provide these credentials to the parent. They will be prompted to change password on first login.',
                ],
            ]);
        });
    }

    /**
     * Update application details.
     */
    public function update(Request $request, $id)
    {
        $admission = Admission::findOrFail($id);
        $admission->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Application updated successfully',
            'data' => $admission,
        ]);
    }

    /**
     * Delete application.
     */
    public function destroy($id)
    {
        $admission = Admission::findOrFail($id);
        $admission->delete();

        return response()->json([
            'success' => true,
            'message' => 'Application deleted successfully',
        ]);
    }
}
