<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admission;
use App\Models\FeeStructure;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentFee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdmissionController extends Controller
{
    /**
     * Display a listing of admission applications with pipeline metrics.
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
            $status = $request->status;
            if ($status === 'Inquiry') {
                $query->whereIn('status', ['Inquiry', 'Pending']);
            } elseif ($status === 'Document Review') {
                $query->whereIn('status', ['Document Review', 'Under Review']);
            } elseif ($status === 'Offer Extended') {
                $query->whereIn('status', ['Offer Extended', 'Approved']);
            } else {
                $query->where('status', $status);
            }
        }

        if ($request->filled('school_class_id') && strtolower($request->school_class_id) !== 'all') {
            $query->where('school_class_id', $request->school_class_id);
        }

        if ($request->filled('academic_year') && strtolower($request->academic_year) !== 'all') {
            $query->where('academic_year', $request->academic_year);
        }

        if ($request->filled('lead_source') && strtolower($request->lead_source) !== 'all') {
            $query->where('lead_source', $request->lead_source);
        }

        $perPage = (int) $request->input('per_page', 100);
        $admissions = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // Efficiently aggregate pipeline stage statistics in a single grouped query
        $counts = Admission::select('status', DB::raw('count(*) as aggregate'))
            ->groupBy('status')
            ->pluck('aggregate', 'status')
            ->all();

        $stats = [
            'total' => array_sum($counts),
            'inquiry' => ($counts['Inquiry'] ?? 0) + ($counts['Pending'] ?? 0),
            'document_review' => ($counts['Document Review'] ?? 0) + ($counts['Under Review'] ?? 0),
            'assessment_interview' => $counts['Assessment/Interview'] ?? 0,
            'offer_extended' => ($counts['Offer Extended'] ?? 0) + ($counts['Approved'] ?? 0),
            'fee_paid' => $counts['Fee Paid'] ?? 0,
            'enrolled' => $counts['Enrolled'] ?? 0,
            'rejected' => $counts['Rejected'] ?? 0,
        ];

        return response()->json([
            'success' => true,
            'data' => $admissions,
            'stats' => $stats,
        ]);
    }

    /**
     * Store a newly submitted admission application inquiry.
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
            'lead_source' => 'nullable|string|max:100',
            'guardian_name' => 'required|string|max:255',
            'guardian_phone' => 'required|string|max:20',
            'guardian_email' => 'nullable|email',
            'guardian_relation' => 'nullable|string|max:100',
            'previous_school' => 'nullable|string',
            'previous_score' => 'nullable|string',
            'address' => 'nullable|string',
            'with_transport' => 'nullable|boolean',
            'remarks' => 'nullable|string',
        ]);

        $count = Admission::count() + 1;
        $appNo = 'ADM-' . date('Y') . '-' . str_pad($count, 3, '0', STR_PAD_LEFT);

        $classId = $request->school_class_id;
        if ($classId && !is_numeric($classId)) {
            $cls = SchoolClass::firstOrCreate(['name' => $classId]);
            $classId = $cls->id;
        } elseif ($classId && !SchoolClass::where('id', $classId)->exists()) {
            $cls = SchoolClass::create(['id' => $classId, 'name' => "Grade {$classId}"]);
            $classId = $cls->id;
        }

        $defaultDocuments = [
            'birth_certificate' => 'pending',
            'transfer_certificate' => 'pending',
            'previous_marksheet' => 'pending',
            'address_proof' => 'pending',
            'aadhar_card' => 'pending',
            'medical_record' => 'pending',
        ];

        $initialNotes = [
            [
                'stage' => 'Inquiry',
                'action' => 'Application Registered',
                'time' => now()->toIso8601String(),
                'notes' => $request->remarks ?: 'Prospective student inquiry captured in admission pipeline.',
            ],
        ];

        $admission = Admission::create([
            'application_number' => $appNo,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'date_of_birth' => $request->date_of_birth,
            'gender' => $request->gender,
            'school_class_id' => $classId,
            'academic_year' => $request->academic_year ?? '2026-2027',
            'lead_source' => $request->lead_source ?? 'Walk-in',
            'guardian_name' => $request->guardian_name,
            'guardian_phone' => $request->guardian_phone,
            'guardian_email' => $request->guardian_email,
            'guardian_relation' => $request->guardian_relation ?? 'Parent',
            'previous_school' => $request->previous_school,
            'previous_score' => $request->previous_score,
            'address' => $request->address,
            'with_transport' => $request->boolean('with_transport', false),
            'status' => 'Inquiry',
            'documents' => $request->documents ?? $defaultDocuments,
            'test_status' => 'Pending',
            'interview_result' => 'Pending',
            'admission_fee_status' => 'Pending',
            'remarks' => $request->remarks,
            'pipeline_notes' => $initialNotes,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Admission application inquiry recorded successfully.',
            'data' => $admission->load(['schoolClass']),
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
     * Update status and stage data of an admission application.
     */
    public function updateStatus(Request $request, $id)
    {
        $admission = Admission::findOrFail($id);

        $request->validate([
            'status' => 'required|string|in:Pending,Under Review,Approved,Rejected,Enrolled,Inquiry,Document Review,Assessment/Interview,Offer Extended,Fee Paid',
            'remarks' => 'nullable|string',
            'documents' => 'nullable|array',
            'test_score' => 'nullable|string',
            'test_date' => 'nullable|date',
            'test_status' => 'nullable|string',
            'interview_date' => 'nullable|string',
            'interview_interviewer' => 'nullable|string',
            'interview_notes' => 'nullable|string',
            'interview_result' => 'nullable|string',
            'offer_date' => 'nullable|date',
            'offer_valid_until' => 'nullable|date',
            'admission_fee' => 'nullable|numeric',
            'admission_fee_status' => 'nullable|string',
            'admission_fee_receipt' => 'nullable|string',
            'admission_fee_date' => 'nullable|date',
            'admission_fee_mode' => 'nullable|string',
        ]);

        $oldStatus = $admission->status;
        $newStatus = $request->status;

        $admission->status = $newStatus;

        if ($request->has('documents')) {
            $admission->documents = $request->documents;
        }
        if ($request->filled('test_score')) {
            $admission->test_score = $request->test_score;
        }
        if ($request->filled('test_date')) {
            $admission->test_date = $request->test_date;
        }
        if ($request->filled('test_status')) {
            $admission->test_status = $request->test_status;
        }
        if ($request->filled('interview_date')) {
            $admission->interview_date = $request->interview_date;
        }
        if ($request->filled('interview_interviewer')) {
            $admission->interview_interviewer = $request->interview_interviewer;
        }
        if ($request->filled('interview_notes')) {
            $admission->interview_notes = $request->interview_notes;
        }
        if ($request->filled('interview_result')) {
            $admission->interview_result = $request->interview_result;
        }
        if ($request->filled('offer_date')) {
            $admission->offer_date = $request->offer_date;
        }
        if ($request->filled('offer_valid_until')) {
            $admission->offer_valid_until = $request->offer_valid_until;
        }
        if ($request->filled('admission_fee')) {
            $admission->admission_fee = $request->admission_fee;
        }
        if ($request->filled('admission_fee_status')) {
            $admission->admission_fee_status = $request->admission_fee_status;
        }
        if ($request->filled('admission_fee_receipt')) {
            $admission->admission_fee_receipt = $request->admission_fee_receipt;
        }
        if ($request->filled('admission_fee_date')) {
            $admission->admission_fee_date = $request->admission_fee_date;
        }
        if ($request->filled('admission_fee_mode')) {
            $admission->admission_fee_mode = $request->admission_fee_mode;
        }
        if ($request->filled('remarks')) {
            $admission->remarks = $request->remarks;
        }

        // Append pipeline audit trail
        $pipelineNotes = $admission->pipeline_notes ?? [];
        $pipelineNotes[] = [
            'stage' => $newStatus,
            'action' => $oldStatus !== $newStatus ? "Stage moved from {$oldStatus} to {$newStatus}" : 'Pipeline details updated',
            'time' => now()->toIso8601String(),
            'notes' => $request->remarks ?: "Applicant status updated to {$newStatus}.",
        ];
        $admission->pipeline_notes = $pipelineNotes;

        $admission->save();

        return response()->json([
            'success' => true,
            'message' => 'Application stage updated to ' . $admission->status,
            'data' => $admission->load(['schoolClass', 'enrolledStudent']),
        ]);
    }

    /**
     * Enroll an approved/fee-paid applicant into the active Students roster with parent login credentials.
     */
    public function enroll(Request $request, $id)
    {
        $admission = Admission::findOrFail($id);

        $request->validate([
            'section_id' => 'nullable|exists:sections,id',
            'roll_number' => 'nullable|string|max:50',
            'blood_group' => 'nullable|string|max:10',
            'with_transport' => 'nullable|boolean',
            'admission_fee_receipt' => 'nullable|string',
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
            $feeStruct = FeeStructure::with('installments')->where('school_class_id', $admission->school_class_id)->first();
            if ($feeStruct && $feeStruct->installments->count() > 0) {
                $instCount = $feeStruct->installments->count();
                $quarterTransport = $instCount > 0 ? round(((float)$feeStruct->transport_fee) / $instCount, 2) : 0;

                foreach ($feeStruct->installments as $inst) {
                    $installmentAmount = (float) $inst->amount;
                    if (!$withTransport && $quarterTransport > 0) {
                        // Deduct transport component if transport is not opted
                        $installmentAmount = max(0, $installmentAmount - $quarterTransport);
                    }

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

            // 6. Update admission record to Enrolled
            $admission->status = 'Enrolled';
            $admission->with_transport = $withTransport;
            $admission->enrolled_student_id = $student->id;
            $admission->admission_fee_status = 'Paid';
            if ($request->filled('admission_fee_receipt')) {
                $admission->admission_fee_receipt = $request->admission_fee_receipt;
            }

            $pipelineNotes = $admission->pipeline_notes ?? [];
            $pipelineNotes[] = [
                'stage' => 'Enrolled',
                'action' => 'Successfully Enrolled as Active Student',
                'time' => now()->toIso8601String(),
                'notes' => "Assigned Admission No: {$admissionNumber}, Roll: " . ($request->roll_number ?: 'N/A'),
            ];
            $admission->pipeline_notes = $pipelineNotes;

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

        $allowed = [
            'first_name', 'last_name', 'date_of_birth', 'gender', 'school_class_id',
            'academic_year', 'lead_source', 'guardian_name', 'guardian_phone',
            'guardian_email', 'guardian_relation', 'previous_school', 'previous_score',
            'address', 'with_transport', 'documents', 'test_score', 'test_date',
            'test_status', 'interview_date', 'interview_interviewer', 'interview_notes',
            'interview_result', 'offer_date', 'offer_valid_until', 'admission_fee',
            'admission_fee_status', 'admission_fee_receipt', 'admission_fee_date',
            'admission_fee_mode', 'remarks',
        ];

        $admission->update($request->only($allowed));

        return response()->json([
            'success' => true,
            'message' => 'Application updated successfully',
            'data' => $admission->load(['schoolClass', 'enrolledStudent']),
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
