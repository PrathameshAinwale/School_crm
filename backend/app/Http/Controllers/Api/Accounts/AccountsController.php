<?php

namespace App\Http\Controllers\Api\Accounts;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Resource;
use App\Models\SalaryDisbursementRequest;
use App\Models\SchoolExpense;
use App\Models\StaffSalary;
use App\Models\Student;
use App\Models\StudentFee;
use App\Models\Teacher;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AccountsController extends Controller
{
    /**
     * Accounts Realtime Financial Dashboard Metrics.
     */
    public function dashboard(Request $request)
    {
        $currentMonth = Carbon::now()->format('F Y');

        // 1. Student Fees Metrics
        $allFees = StudentFee::all();
        $totalFeesBilled = (float) $allFees->sum('amount');
        $totalFeesCollected = (float) $allFees->where('status', 'Paid')->sum('amount');
        $totalFeesPending = (float) $allFees->where('status', 'Pending')->sum('amount');
        $totalFeesOverdue = (float) $allFees->where('status', 'Overdue')->sum('amount');
        $outstandingFees = $totalFeesPending + $totalFeesOverdue;
        $recoveryRate = $totalFeesBilled > 0 ? round(($totalFeesCollected / $totalFeesBilled) * 100, 1) : 0;

        $overdueCount = $allFees->where('status', 'Overdue')->count();
        $pendingCount = $allFees->where('status', 'Pending')->count();

        // 2. Staff Salaries & Payroll Metrics
        $allSalaries = StaffSalary::all();
        $totalSalaryDisbursed = (float) $allSalaries->where('status', 'Disbursed')->sum('net_salary');
        $thisMonthSalaries = StaffSalary::where('month', $currentMonth)->get();
        $disbursedPayrollThisMonth = (float) $thisMonthSalaries->where('status', 'Disbursed')->sum('net_salary');
        $pendingPayrollThisMonth = (float) $thisMonthSalaries->where('status', '!=', 'Disbursed')->sum('net_salary');

        // Active Staff Count
        $activeStaffCount = Teacher::where('status', '!=', 'Inactive')->count();
        if ($activeStaffCount === 0) {
            $activeStaffCount = User::whereIn('role', ['teacher', 'hr', 'accountant', 'admin'])->count();
        }

        // Pending Salary Disbursement Requests from HR
        $pendingDisbursementBatches = SalaryDisbursementRequest::where('status', 'Pending Review')->count();

        // 3. Recent Staff Salary Disbursements
        $recentDisbursements = StaffSalary::with('teacher')
            ->where('status', 'Disbursed')
            ->orderBy('disbursed_at', 'desc')
            ->orderBy('updated_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'name' => $s->name,
                    'employeeId' => $s->employee_id ?: ($s->teacher ? $s->teacher->teacher_id : 'EMP-' . $s->id),
                    'role' => $s->role ?: 'Staff Member',
                    'department' => $s->department ?: 'Academic',
                    'month' => $s->month,
                    'amount' => (float) $s->net_salary,
                    'disbursedDate' => $s->disbursed_at ? Carbon::parse($s->disbursed_at)->format('M d, Y') : ($s->updated_at ? $s->updated_at->format('M d, Y') : '—'),
                    'paymentRef' => $s->payment_reference ?: '—',
                    'bankName' => $s->bank_name ?: 'HDFC Bank',
                ];
            });

        // 4. Recent Fee Collections
        $recentFeePayments = StudentFee::with('student.schoolClass')
            ->where('status', 'Paid')
            ->orderBy('paid_date', 'desc')
            ->take(5)
            ->get()
            ->map(function ($f) {
                return [
                    'id' => $f->id,
                    'studentName' => $f->student ? $f->student->full_name : 'Student',
                    'admissionNo' => $f->student ? $f->student->admission_number : '—',
                    'className' => $f->student && $f->student->schoolClass ? $f->student->schoolClass->name : 'Class 10',
                    'term' => $f->term_name,
                    'amount' => (float) $f->amount,
                    'paidDate' => $f->paid_date ? Carbon::parse($f->paid_date)->format('M d, Y') : '—',
                    'txnId' => $f->transaction_id ?: '—',
                    'mode' => $f->payment_mode ?: 'Online',
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => [
                    'totalFeesBilled' => $totalFeesBilled,
                    'totalFeesCollected' => $totalFeesCollected,
                    'outstandingFees' => $outstandingFees,
                    'totalFeesPending' => $totalFeesPending,
                    'totalFeesOverdue' => $totalFeesOverdue,
                    'recoveryRate' => $recoveryRate,
                    'overdueStudentsCount' => $overdueCount,
                    'pendingStudentsCount' => $pendingCount,
                    'totalSalaryDisbursed' => $totalSalaryDisbursed,
                    'disbursedPayrollThisMonth' => $disbursedPayrollThisMonth,
                    'pendingPayrollThisMonth' => $pendingPayrollThisMonth,
                    'pendingDisbursementBatches' => $pendingDisbursementBatches,
                    'activeStaffCount' => $activeStaffCount,
                    'currentMonth' => $currentMonth,
                ],
                'recentDisbursements' => $recentDisbursements,
                'recentFeePayments' => $recentFeePayments,
            ],
        ]);
    }

    /**
     * Full Student Fees Directory with Filter & Defaulters Tracking.
     */
    public function feesList(Request $request)
    {
        $classesList = \App\Models\SchoolClass::with('sections')->get()->map(function ($c) {
            return [
                'id' => $c->id,
                'name' => $c->name,
                'sections' => $c->sections->map(fn($s) => ['id' => $s->id, 'name' => $s->name]),
            ];
        });

        $studentsQuery = Student::with(['schoolClass', 'section', 'user', 'fees']);

        if ($request->filled('class_id') && strtolower($request->class_id) !== 'all') {
            $classParam = $request->class_id;
            if (is_numeric($classParam)) {
                $studentsQuery->where('school_class_id', $classParam);
            } else {
                $cleanClass = trim(preg_replace('/^(class|grade|std)\s+/i', '', $classParam));
                $studentsQuery->where(function ($q) use ($classParam, $cleanClass) {
                    $q->where('school_class_id', $classParam)
                      ->orWhereHas('schoolClass', function ($cq) use ($classParam, $cleanClass) {
                          $cq->where('name', $classParam)
                             ->orWhere('name', 'like', "%{$classParam}%")
                             ->orWhere('name', 'like', "%{$cleanClass}%");
                      });
                });
            }
        }

        if ($request->filled('section_id') && strtolower($request->section_id) !== 'all') {
            $sectionParam = $request->section_id;
            if (is_numeric($sectionParam)) {
                $studentsQuery->where('section_id', $sectionParam);
            } else {
                $cleanSection = trim(preg_replace('/^(section|division|div)\s+/i', '', $sectionParam));
                preg_match('/\((.*?)\)/', $cleanSection, $matches);
                $innerLetter = $matches[1] ?? null;

                $studentsQuery->where(function ($q) use ($sectionParam, $cleanSection, $innerLetter) {
                    $q->where('section_id', $sectionParam)
                      ->orWhereHas('section', function ($sq) use ($sectionParam, $cleanSection, $innerLetter) {
                          $sq->where('name', $sectionParam)
                             ->orWhere('name', 'like', "%{$cleanSection}%");
                          if ($innerLetter) {
                              $sq->orWhere('name', 'like', "%{$innerLetter}%");
                          }
                      });
                });
            }
        }

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            if ($search !== '' && strtolower($search) !== 'undefined' && strtolower($search) !== 'null') {
                $studentsQuery->where(function ($sq) use ($search) {
                    $sq->where('first_name', 'like', "%{$search}%")
                       ->orWhere('last_name', 'like', "%{$search}%")
                       ->orWhere('admission_number', 'like', "%{$search}%")
                       ->orWhere('roll_number', 'like', "%{$search}%")
                       ->orWhere('guardian_name', 'like', "%{$search}%")
                       ->orWhere('guardian_phone', 'like', "%{$search}%")
                       ->orWhere('guardian_email', 'like', "%{$search}%");
                });
            }
        }

        $allStudents = $studentsQuery->get();

        $totalCount = 0;
        $paidCount = 0;
        $pendingCount = 0;
        $overdueCount = 0;
        $totalAmount = 0;
        $paidAmount = 0;
        $pendingAmount = 0;
        $overdueAmount = 0;

        $mappedFees = [];

        $studentsGrouped = $allStudents->map(function ($student) use (
            &$totalCount, &$paidCount, &$pendingCount, &$overdueCount,
            &$totalAmount, &$paidAmount, &$pendingAmount, &$overdueAmount,
            &$mappedFees
        ) {
            $studentFees = $student->fees;

            // If no fees exist yet, create default installment blueprint from class fee structure
            if ($studentFees->isEmpty() && $student->school_class_id) {
                $feeStruct = \App\Models\FeeStructure::with('installments')->where('school_class_id', $student->school_class_id)->first();
                if ($feeStruct && $feeStruct->installments->count() > 0) {
                    $instCount = $feeStruct->installments->count();
                    $quarterTransport = $instCount > 0 ? round(((float)$feeStruct->transport_fee) / $instCount, 2) : 0;
                    foreach ($feeStruct->installments as $inst) {
                        $amt = (float) $inst->amount;
                        if (!$student->with_transport && $quarterTransport > 0) {
                            $amt = max(0, $amt - $quarterTransport);
                        }
                        StudentFee::create([
                            'student_id' => $student->id,
                            'term_name' => $inst->term_name,
                            'amount' => $amt,
                            'due_date' => $inst->due_date,
                            'status' => 'Pending',
                            'tax_deductible' => true,
                        ]);
                    }
                    $studentFees = StudentFee::where('student_id', $student->id)->get();
                }
            }

            $sTotalBilled = $studentFees->sum('amount');
            $sPaidAmount = $studentFees->where('status', 'Paid')->sum('amount');
            $sPendingAmount = $studentFees->where('status', 'Pending')->sum('amount');
            $sOverdueAmount = $studentFees->where('status', 'Overdue')->sum('amount');
            $sOutstanding = $sPendingAmount + $sOverdueAmount;

            $totalCount += $studentFees->count();
            $paidCount += $studentFees->where('status', 'Paid')->count();
            $pendingCount += $studentFees->where('status', 'Pending')->count();
            $overdueCount += $studentFees->where('status', 'Overdue')->count();

            $totalAmount += $sTotalBilled;
            $paidAmount += $sPaidAmount;
            $pendingAmount += $sPendingAmount;
            $overdueAmount += $sOverdueAmount;

            $overallStatus = 'Pending';
            if ($sOutstanding <= 0 && $sTotalBilled > 0) {
                $overallStatus = 'Paid';
            } elseif ($sOverdueAmount > 0) {
                $overallStatus = 'Overdue';
            } elseif ($sPaidAmount > 0) {
                $overallStatus = 'Partial';
            }

            $parentEmail = $student->guardian_email ?: ($student->user ? $student->user->email : '—');
            $parentPhone = $student->guardian_phone ?: ($student->user ? $student->user->phone : '—');
            $parentName = $student->guardian_name ?: ($student->father_name ?: 'Parent/Guardian');

            $instMapped = $studentFees->map(function ($fee) use ($student, $parentEmail, $parentPhone, $parentName, &$mappedFees) {
                $item = [
                    'id' => $fee->id,
                    'student_id' => $student->id,
                    'studentName' => $student->full_name,
                    'admissionNo' => $student->admission_number ?: '—',
                    'class' => $student->schoolClass ? $student->schoolClass->name : 'Class 10',
                    'section' => $student->section ? $student->section->name : 'A',
                    'rollNo' => $student->roll_number ?: '—',
                    'parentName' => $parentName,
                    'parentEmail' => $parentEmail,
                    'parentPhone' => $parentPhone,
                    'term' => $fee->term_name,
                    'amount' => (float) $fee->amount,
                    'dueDate' => $fee->due_date ? Carbon::parse($fee->due_date)->format('M d, Y') : '—',
                    'rawDueDate' => $fee->due_date ? Carbon::parse($fee->due_date)->toDateString() : null,
                    'status' => $fee->status,
                    'paidDate' => $fee->paid_date ? Carbon::parse($fee->paid_date)->format('M d, Y') : '—',
                    'txnId' => $fee->transaction_id ?: '—',
                    'mode' => $fee->payment_mode ?: '—',
                    'receiptNumber' => $fee->receipt_number ?: '—',
                    'taxDeductible' => (bool) $fee->tax_deductible,
                ];
                $mappedFees[] = $item;
                return $item;
            })->values();

            return [
                'id' => $student->id,
                'studentName' => $student->full_name,
                'admissionNo' => $student->admission_number ?: '—',
                'rollNo' => $student->roll_number ?: '—',
                'classId' => $student->school_class_id,
                'class' => $student->schoolClass ? $student->schoolClass->name : 'Class 10',
                'sectionId' => $student->section_id,
                'section' => $student->section ? $student->section->name : 'A',
                'withTransport' => (bool) $student->with_transport,
                'parentName' => $parentName,
                'parentEmail' => $parentEmail,
                'parentPhone' => $parentPhone,
                'totalBilled' => (float) $sTotalBilled,
                'paidAmount' => (float) $sPaidAmount,
                'pendingAmount' => (float) $sPendingAmount,
                'overdueAmount' => (float) $sOverdueAmount,
                'outstanding' => (float) $sOutstanding,
                'overallStatus' => $overallStatus,
                'installments' => $instMapped,
            ];
        })->values();

        if ($request->filled('status') && strtolower($request->status) !== 'all') {
            $statusReq = strtolower($request->status);
            $studentsGrouped = $studentsGrouped->filter(function ($s) use ($statusReq) {
                return strtolower($s['overallStatus']) === $statusReq;
            })->values();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'fees' => $mappedFees,
                'students' => $studentsGrouped,
                'classes' => $classesList,
                'summary' => [
                    'totalCount' => $totalCount,
                    'paidCount' => $paidCount,
                    'pendingCount' => $pendingCount,
                    'overdueCount' => $overdueCount,
                    'totalAmount' => $totalAmount,
                    'paidAmount' => $paidAmount,
                    'pendingAmount' => $pendingAmount,
                    'overdueAmount' => $overdueAmount,
                ],
            ],
            'fees' => $mappedFees,
            'students' => $studentsGrouped,
            'classes' => $classesList,
        ]);
    }

    /**
     * Record manual or offline fee payment (Cash, Cheque, Bank Transfer, POS).
     */
    public function recordFeePayment(Request $request, $id)
    {
        $request->validate([
            'payment_mode' => 'required|string',
            'transaction_id' => 'nullable|string',
            'paid_date' => 'nullable|date',
            'amount_paid' => 'nullable|numeric',
            'remarks' => 'nullable|string',
        ]);

        $fee = StudentFee::with('student.user')->findOrFail($id);
        $paidDate = $request->filled('paid_date') ? Carbon::parse($request->paid_date)->toDateString() : Carbon::today()->toDateString();
        $txnId = $request->input('transaction_id') ?: ('TXN-MANUAL-' . strtoupper(Str::random(6)));
        $receiptNo = 'REC-' . date('Y') . '-' . rand(10000, 99999);

        $fee->update([
            'status' => 'Paid',
            'paid_date' => $paidDate,
            'transaction_id' => $txnId,
            'payment_mode' => $request->input('payment_mode'),
            'receipt_number' => $receiptNo,
        ]);

        // Send payment confirmation notification to Parent / Student
        $studentUser = $fee->student ? $fee->student->user : null;
        $studentName = $fee->student ? $fee->student->full_name : 'Student';

        if ($studentUser) {
            Notification::create([
                'user_id' => $studentUser->id,
                'role' => 'student_parent',
                'title' => 'Fee Payment Received',
                'message' => "Payment of ₹" . number_format($fee->amount) . " for {$fee->term_name} has been recorded successfully via {$fee->payment_mode}. Receipt #{$receiptNo}.",
                'type' => 'fee',
                'link' => '/fees',
                'is_read' => false,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => "Fee payment of ₹" . number_format($fee->amount) . " successfully recorded for {$studentName}.",
            'data' => [
                'fee' => $fee,
                'receipt_number' => $receiptNo,
                'transaction_id' => $txnId,
            ],
        ]);
    }

    /**
     * Send targeted Fee Reminder push notification to a specific student's parent.
     */
    public function sendFeeReminder(Request $request, $id)
    {
        $fee = StudentFee::with(['student.user', 'student.schoolClass'])->findOrFail($id);
        $student = $fee->student;

        if (!$student) {
            return response()->json(['success' => false, 'message' => 'Student record not found for this fee installment.'], 404);
        }

        $parentUser = $student->user;
        if (!$parentUser && $student->guardian_email) {
            $parentUser = User::where('email', $student->guardian_email)->first();
        }

        $className = $student->schoolClass ? $student->schoolClass->name : 'Class';
        $formattedAmount = '₹' . number_format($fee->amount);
        $dueDateFormatted = $fee->due_date ? Carbon::parse($fee->due_date)->format('d M Y') : 'Due soon';

        $customMessage = $request->input(
            'custom_message',
            "Dear Parent, this is a reminder from the Accounts Office regarding pending fee installment of {$formattedAmount} for {$student->full_name} ({$className}) for {$fee->term_name}. Due date was {$dueDateFormatted}. Kindly clear the outstanding dues."
        );

        $notification = Notification::create([
            'user_id' => $parentUser ? $parentUser->id : null,
            'role' => 'student_parent',
            'title' => "Fee Payment Reminder: {$fee->term_name}",
            'message' => $customMessage,
            'type' => 'alert',
            'link' => '/fees',
            'is_read' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Fee reminder push notification sent successfully to the parent of {$student->full_name}.",
            'data' => [
                'student_name' => $student->full_name,
                'parent_name' => $student->guardian_name ?: ($parentUser ? $parentUser->name : 'Parent'),
                'amount' => $formattedAmount,
                'notification' => $notification,
            ],
        ]);
    }

    /**
     * Send Bulk Fee Reminders to all pending / overdue students.
     */
    public function sendBulkFeeReminders(Request $request)
    {
        $status = $request->input('status', 'Overdue'); // Overdue or Pending or Both
        $classId = $request->input('class_id');

        $query = StudentFee::with(['student.user', 'student.schoolClass']);

        if ($status === 'Both') {
            $query->whereIn('status', ['Pending', 'Overdue']);
        } else {
            $query->where('status', $status);
        }

        if ($classId && strtolower($classId) !== 'all') {
            $query->whereHas('student', function ($q) use ($classId) {
                $q->where('school_class_id', $classId);
            });
        }

        $fees = $query->get();
        $sentCount = 0;

        foreach ($fees as $fee) {
            $student = $fee->student;
            if (!$student) continue;

            $parentUser = $student->user;
            if (!$parentUser && $student->guardian_email) {
                $parentUser = User::where('email', $student->guardian_email)->first();
            }

            $className = $student->schoolClass ? $student->schoolClass->name : 'Class';
            $formattedAmount = '₹' . number_format($fee->amount);
            $dueDateFormatted = $fee->due_date ? Carbon::parse($fee->due_date)->format('d M Y') : 'Immediate';

            Notification::create([
                'user_id' => $parentUser ? $parentUser->id : null,
                'role' => 'student_parent',
                'title' => "Fee Payment Reminder: {$fee->term_name}",
                'message' => "Urgent Notice from Accounts: Outstanding fee installment of {$formattedAmount} for {$student->full_name} ({$className}) is currently {$fee->status}. Due date: {$dueDateFormatted}. Please log in to complete payment.",
                'type' => 'alert',
                'link' => '/fees',
                'is_read' => false,
            ]);

            $sentCount++;
        }

        return response()->json([
            'success' => true,
            'message' => "Successfully dispatched fee reminder push notifications to {$sentCount} parents.",
            'sent_count' => $sentCount,
        ]);
    }

    /**
     * School Expenses & Resource Expenditure Directory.
     */
    public function expensesList(Request $request)
    {
        $query = SchoolExpense::with(['recordedBy', 'resource']);

        if ($request->filled('category') && strtolower($request->category) !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->filled('payment_mode') && strtolower($request->payment_mode) !== 'all') {
            $query->where('payment_mode', $request->payment_mode);
        }

        if ($request->filled('month')) {
            $monthDate = Carbon::parse($request->month);
            $query->whereYear('expense_date', $monthDate->year)
                  ->whereMonth('expense_date', $monthDate->month);
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('expense_code', 'like', "%{$search}%")
                  ->orWhere('vendor_name', 'like', "%{$search}%")
                  ->orWhere('invoice_number', 'like', "%{$search}%");
            });
        }

        $expenses = $query->orderBy('expense_date', 'desc')->get();

        $mapped = $expenses->map(function ($e) {
            return [
                'id' => $e->id,
                'code' => $e->expense_code,
                'title' => $e->title,
                'category' => $e->category,
                'amount' => (float) $e->amount,
                'expenseDate' => $e->expense_date ? $e->expense_date->format('d M Y') : '—',
                'rawExpenseDate' => $e->expense_date ? $e->expense_date->toDateString() : null,
                'paymentMode' => $e->payment_mode,
                'vendorName' => $e->vendor_name ?: '—',
                'invoiceNumber' => $e->invoice_number ?: '—',
                'status' => $e->status,
                'notes' => $e->notes,
                'recordedBy' => $e->recordedBy ? $e->recordedBy->name : 'Accounts Lead',
                'resourceName' => $e->resource ? $e->resource->name : null,
                'resourceCode' => $e->resource ? $e->resource->resource_code : null,
            ];
        });

        $totalExpenses = $expenses->sum('amount');
        $categoryBreakdown = $expenses->groupBy('category')->map(function ($group, $cat) {
            return [
                'category' => $cat,
                'total' => $group->sum('amount'),
                'count' => $group->count(),
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => [
                'expenses' => $mapped,
                'summary' => [
                    'totalCount' => $expenses->count(),
                    'totalAmount' => $totalExpenses,
                    'categoryBreakdown' => $categoryBreakdown,
                ],
            ],
            'expenses' => $mapped,
        ]);
    }

    /**
     * Store new School Expense (Resource purchases, utilities, campus repairs, events).
     */
    public function storeExpense(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'amount' => 'required|numeric|min:1',
            'expense_date' => 'required|date',
            'payment_mode' => 'required|string|max:100',
            'vendor_name' => 'nullable|string|max:255',
            'invoice_number' => 'nullable|string|max:100',
            'resource_id' => 'nullable|exists:resources,id',
            'notes' => 'nullable|string',
        ]);

        $count = SchoolExpense::count() + 1;
        $expenseCode = 'EXP-' . date('Y') . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

        $expense = SchoolExpense::create([
            'expense_code' => $expenseCode,
            'title' => $request->title,
            'category' => $request->category,
            'amount' => $request->amount,
            'expense_date' => Carbon::parse($request->expense_date)->toDateString(),
            'payment_mode' => $request->payment_mode,
            'vendor_name' => $request->vendor_name,
            'invoice_number' => $request->invoice_number,
            'status' => 'Paid',
            'notes' => $request->notes,
            'recorded_by_user_id' => $request->user() ? $request->user()->id : null,
            'resource_id' => $request->resource_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'School expense recorded successfully.',
            'data' => $expense->load('recordedBy', 'resource'),
        ], 201);
    }

    /**
     * Delete an expense record.
     */
    public function destroyExpense(Request $request, $id)
    {
        $expense = SchoolExpense::findOrFail($id);
        $expense->delete();

        return response()->json([
            'success' => true,
            'message' => 'Expense record deleted successfully.',
        ]);
    }

    /**
     * List Salary Disbursement Batches submitted by HR.
     */
    public function disbursementRequests(Request $request)
    {
        $requests = SalaryDisbursementRequest::with(['requestedBy', 'actionedBy', 'salaries.teacher'])
            ->orderBy('created_at', 'desc')
            ->get();

        $mapped = $requests->map(function ($req) {
            $salaries = $req->salaries->map(function ($s) {
                return [
                    'id' => $s->id,
                    'employeeId' => $s->employee_id,
                    'name' => $s->name,
                    'role' => $s->role,
                    'department' => $s->department,
                    'baseSalary' => (float) $s->base_salary,
                    'allowance' => (float) ($s->allowance ?: $s->special_allowance ?: 0),
                    'deduction' => (float) $s->deduction,
                    'grossSalary' => (float) $s->gross_salary,
                    'netSalary' => (float) $s->net_salary,
                    'bankName' => $s->bank_name ?: 'HDFC Bank',
                    'accountNo' => $s->account_no ?: '•••• •••• 4589',
                    'ifscCode' => $s->ifsc_code ?: 'HDFC0001234',
                    'status' => $s->status,
                ];
            });

            return [
                'id' => $req->id,
                'batchCode' => $req->batch_code,
                'month' => $req->month,
                'staffCount' => $req->total_staff_count,
                'grossAmount' => (float) $req->total_gross_amount,
                'totalDeductions' => (float) $req->total_deductions,
                'netAmount' => (float) $req->total_net_amount,
                'status' => $req->status,
                'requestedBy' => $req->requestedBy ? $req->requestedBy->name : 'HR Head',
                'actionedBy' => $req->actionedBy ? $req->actionedBy->name : null,
                'requestedAt' => $req->created_at ? $req->created_at->format('d M Y, h:i A') : '—',
                'disbursedAt' => $req->disbursed_at ? $req->disbursed_at->format('d M Y, h:i A') : '—',
                'paymentReference' => $req->payment_reference,
                'payoutMode' => $req->payout_mode,
                'accountsNotes' => $req->accounts_notes,
                'salaries' => $salaries,
            ];
        });

        $allStaffSalaries = StaffSalary::with('teacher')
            ->orderBy('disbursed_at', 'desc')
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'teacher_id' => $s->teacher_id,
                    'employeeId' => $s->employee_id ?: ($s->teacher ? $s->teacher->teacher_id : 'EMP-' . $s->id),
                    'name' => $s->name,
                    'role' => $s->role ?: ($s->teacher ? $s->teacher->role : 'Staff Member'),
                    'department' => $s->department ?: ($s->teacher ? $s->teacher->department : 'Academic'),
                    'month' => $s->month,
                    'baseSalary' => (float) $s->base_salary,
                    'allowance' => (float) ($s->allowance ?: $s->special_allowance ?: 0),
                    'deduction' => (float) $s->deduction,
                    'grossSalary' => (float) ($s->gross_salary ?: $s->base_salary),
                    'netSalary' => (float) $s->net_salary,
                    'status' => $s->status,
                    'disbursedDate' => $s->disbursed_at ? Carbon::parse($s->disbursed_at)->format('M d, Y') : ($s->status === 'Disbursed' && $s->updated_at ? $s->updated_at->format('M d, Y') : '—'),
                    'disbursedAtRaw' => $s->disbursed_at ? $s->disbursed_at->toDateTimeString() : null,
                    'paymentRef' => $s->payment_reference ?: '—',
                    'bankName' => $s->bank_name ?: ($s->teacher ? 'HDFC Bank' : 'State Bank of India'),
                    'accountNo' => $s->account_no ?: ($s->teacher && $s->teacher->phone ? '•••• ' . substr($s->teacher->phone, -4) : '•••• 4589'),
                    'ifscCode' => $s->ifsc_code ?: 'HDFC0001234',
                ];
            });

        // Faculty & Staff options for the accountant to select from
        $teachers = Teacher::with('user')->where('status', '!=', 'Inactive')->orderBy('first_name')->get();
        if ($teachers->isEmpty()) {
            $teachers = Teacher::with('user')->orderBy('first_name')->get();
        }
        $staffList = $teachers->map(function ($t) {
            return [
                'id' => $t->id,
                'name' => $t->full_name,
                'employeeId' => $t->teacher_id ?: 'TCH-' . $t->id,
                'role' => $t->role ?: 'teacher',
                'department' => $t->department ?: 'Academic',
                'salary' => (float) ($t->monthly_salary ?: 45000),
                'phone' => $t->phone,
                'email' => $t->email,
            ];
        });

        $totalDisbursed = (float) StaffSalary::where('status', 'Disbursed')->sum('net_salary');
        $disbursedCount = StaffSalary::where('status', 'Disbursed')->count();
        $pendingPayroll = (float) StaffSalary::where('status', '!=', 'Disbursed')->sum('net_salary');
        $pendingCount = StaffSalary::where('status', '!=', 'Disbursed')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'requests' => $mapped,
                'disbursed_records' => $allStaffSalaries,
                'staff_list' => $staffList,
                'summary' => [
                    'totalDisbursed' => $totalDisbursed,
                    'disbursedCount' => $disbursedCount,
                    'pendingPayroll' => $pendingPayroll,
                    'pendingCount' => $pendingCount,
                    'activeStaffCount' => $staffList->count(),
                    'currentMonth' => Carbon::now()->format('F Y'),
                ],
            ],
            'requests' => $mapped,
            'disbursed_records' => $allStaffSalaries,
            'staff_list' => $staffList,
        ]);
    }

    /**
     * Record Direct Staff Salary Disbursement by Accountant.
     */
    public function recordStaffSalaryDisbursement(Request $request)
    {
        $request->validate([
            'staff_name' => 'required|string|max:255',
            'month' => 'required|string',
            'amount' => 'required|numeric|min:1',
            'payment_mode' => 'nullable|string',
            'payment_reference' => 'nullable|string',
            'bank_name' => 'nullable|string',
            'account_no' => 'nullable|string',
            'disbursed_date' => 'nullable',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user() ?: \Illuminate\Support\Facades\Auth::user();
        $staffName = trim($request->input('staff_name'));
        $month = trim($request->input('month'));
        $amount = (float) $request->input('amount');
        $paymentMode = $request->input('payment_mode', 'Direct Bank Transfer (NEFT/IMPS)');
        $payoutRef = $request->input('payment_reference') ?: ('PAY-REC-' . date('Ym') . '-' . rand(1000, 9999));
        $disbursedDate = $request->input('disbursed_date') ? Carbon::parse($request->input('disbursed_date')) : Carbon::now();
        $bankName = $request->input('bank_name', 'HDFC Bank');
        $accountNo = $request->input('account_no');

        // Resolve teacher if teacher_id is provided or match by name
        $teacher = null;
        if ($request->filled('teacher_id') && is_numeric($request->teacher_id)) {
            $teacher = Teacher::find($request->teacher_id);
        }
        if (!$teacher) {
            $teacher = Teacher::whereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$staffName}%"])
                ->orWhere('first_name', 'like', "%{$staffName}%")
                ->first();
        }

        $employeeId = $teacher ? $teacher->teacher_id : ('EMP-' . rand(100, 999));
        $role = $teacher ? ($teacher->role ?: 'Staff Member') : 'Staff Member';
        $department = $teacher ? ($teacher->department ?: 'Academic') : 'Administration';

        // Check if salary record already exists for this staff and month
        $salary = null;
        if ($teacher) {
            $salary = StaffSalary::where('teacher_id', $teacher->id)->where('month', $month)->first();
        }
        if (!$salary) {
            $salary = StaffSalary::where('name', $staffName)->where('month', $month)->first();
        }

        if ($salary) {
            $salary->update([
                'base_salary' => $amount,
                'gross_salary' => $amount,
                'net_salary' => $amount,
                'status' => 'Disbursed',
                'disbursed_at' => $disbursedDate,
                'payment_reference' => $payoutRef,
                'bank_name' => $bankName ?: $salary->bank_name,
                'account_no' => $accountNo ?: $salary->account_no,
            ]);
        } else {
            $salary = StaffSalary::create([
                'teacher_id' => $teacher ? $teacher->id : null,
                'employee_id' => $employeeId,
                'name' => $staffName,
                'role' => $role,
                'department' => $department,
                'month' => $month,
                'base_salary' => $amount,
                'gross_salary' => $amount,
                'net_salary' => $amount,
                'deduction' => 0,
                'allowance' => 0,
                'status' => 'Disbursed',
                'disbursed_at' => $disbursedDate,
                'payment_reference' => $payoutRef,
                'bank_name' => $bankName,
                'account_no' => $accountNo,
            ]);
        }

        // Notify Staff Member
        if ($teacher && $teacher->user_id) {
            Notification::create([
                'user_id' => $teacher->user_id,
                'role' => $teacher->role ?: 'teacher',
                'title' => "Salary Disbursed: {$month}",
                'message' => "Your net salary of ₹" . number_format($amount) . " for {$month} has been disbursed via {$paymentMode}. Ref: {$payoutRef}.",
                'type' => 'salary',
                'link' => '/teacher/profile',
                'is_read' => false,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => "Salary disbursement of ₹" . number_format($amount) . " for {$staffName} logged successfully.",
            'data' => $salary,
        ]);
    }

    /**
     * Action Salary Disbursement Request (Disburse funds to staff bank accounts or Reject).
     */
    public function actionDisbursementRequest(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Disbursed,Rejected',
            'payment_reference' => 'nullable|string',
            'payout_mode' => 'nullable|string',
            'accounts_notes' => 'nullable|string',
        ]);

        $disbReq = SalaryDisbursementRequest::with(['salaries.teacher.user', 'requestedBy'])->findOrFail($id);
        $user = $request->user();
        $status = $request->status;

        $payoutRef = $request->input('payment_reference') ?: ('NEFT-BATCH-' . strtoupper(Str::random(6)));
        $payoutMode = $request->input('payout_mode', 'Direct Bank Transfer (NEFT/RTGS)');
        $notes = $request->input('accounts_notes');
        $now = Carbon::now();

        if ($status === 'Disbursed') {
            $disbReq->update([
                'status' => 'Disbursed',
                'payment_reference' => $payoutRef,
                'payout_mode' => $payoutMode,
                'accounts_notes' => $notes,
                'disbursed_at' => $now,
                'actioned_by_user_id' => $user ? $user->id : null,
            ]);

            // Update all staff salaries in this batch to Disbursed
            StaffSalary::where('disbursement_request_id', $disbReq->id)
                ->orWhere(function ($q) use ($disbReq) {
                    $q->where('month', $disbReq->month)
                      ->where('status', '!=', 'Disbursed');
                })
                ->update([
                    'status' => 'Disbursed',
                    'disbursed_at' => $now,
                    'disbursement_request_id' => $disbReq->id,
                    'payment_reference' => $payoutRef,
                ]);

            // Record as School Expense automatically under "Staff Salaries & Payroll"
            SchoolExpense::create([
                'expense_code' => 'EXP-PAYROLL-' . date('Y') . '-' . str_pad($disbReq->id, 3, '0', STR_PAD_LEFT),
                'title' => "Staff Salaries & Payroll Disbursed ({$disbReq->month})",
                'category' => 'Administrative',
                'amount' => $disbReq->total_net_amount,
                'expense_date' => $now->toDateString(),
                'payment_mode' => $payoutMode,
                'vendor_name' => "School Staff Payout ({$disbReq->total_staff_count} Employees)",
                'invoice_number' => $payoutRef,
                'status' => 'Paid',
                'notes' => "Processed by Accounts Team. Reference: {$payoutRef}. Notes: {$notes}",
                'recorded_by_user_id' => $user ? $user->id : null,
            ]);

            // 1. Notify Teachers & Staff that salary has been credited
            $teachers = Teacher::with('user')->get();
            foreach ($teachers as $teacher) {
                if ($teacher->user_id) {
                    $salary = StaffSalary::where('teacher_id', $teacher->id)->where('month', $disbReq->month)->first();
                    $netPay = $salary ? ('₹' . number_format($salary->net_salary)) : 'your salary';

                    Notification::create([
                        'user_id' => $teacher->user_id,
                        'role' => 'teacher',
                        'title' => "Salary Credited: {$disbReq->month}",
                        'message' => "Your net salary of {$netPay} for {$disbReq->month} has been successfully disbursed and credited to your bank account ({$salary?->bank_name}). UTR/Ref: {$payoutRef}.",
                        'type' => 'salary',
                        'link' => '/teacher/profile',
                        'is_read' => false,
                    ]);
                }
            }

            // 2. Notify HR Head
            if ($disbReq->requested_by_user_id) {
                Notification::create([
                    'user_id' => $disbReq->requested_by_user_id,
                    'role' => 'hr',
                    'title' => "Salary Batch Disbursed: {$disbReq->month}",
                    'message' => "The salary disbursement request for {$disbReq->month} ({$disbReq->total_staff_count} staff, ₹" . number_format($disbReq->total_net_amount) . ") has been approved and disbursed by the Accounts Team. Payment Ref: {$payoutRef}.",
                    'type' => 'success',
                    'link' => '/salary',
                    'is_read' => false,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => "Salary batch {$disbReq->batch_code} successfully disbursed to {$disbReq->total_staff_count} staff bank accounts. Reference: {$payoutRef}.",
                'data' => $disbReq,
            ]);
        } else {
            // Rejected
            $disbReq->update([
                'status' => 'Rejected',
                'accounts_notes' => $notes ?: 'Disbursement request rejected by Accounts. Please review calculations or bank details.',
                'actioned_by_user_id' => $user ? $user->id : null,
            ]);

            // Notify HR
            if ($disbReq->requested_by_user_id) {
                Notification::create([
                    'user_id' => $disbReq->requested_by_user_id,
                    'role' => 'hr',
                    'title' => "Salary Disbursement Request Rejected",
                    'message' => "The salary disbursement request for {$disbReq->month} was rejected by Accounts. Reason: " . ($notes ?: 'Please review deductions and bank details.'),
                    'type' => 'alert',
                    'link' => '/salary',
                    'is_read' => false,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => "Salary disbursement request marked as Rejected.",
                'data' => $disbReq,
            ]);
        }
    }

    /**
     * Accounts Profile View.
     */
    public function profile(Request $request)
    {
        $user = $request->user() ?: \Illuminate\Support\Facades\Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }
        $teacher = Teacher::where('user_id', $user->id)->first();

        $employeeId = $teacher && $teacher->teacher_id
            ? $teacher->teacher_id
            : 'EMP-ACC-' . str_pad($user->id, 3, '0', STR_PAD_LEFT);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $teacher && $teacher->phone ? $teacher->phone : ($user->phone ?: '+91 98765 43210'),
                'role' => 'Accounts & Finance Lead',
                'department' => 'Accounts & Finance',
                'employee_id' => $employeeId,
                'qualification' => $teacher && $teacher->qualification ? $teacher->qualification : 'B.Com / M.Com (Finance & Accounting)',
                'joining_date' => $teacher && $teacher->joining_date ? Carbon::parse($teacher->joining_date)->format('F d, Y') : ($user->created_at ? $user->created_at->format('F d, Y') : 'August 01, 2026'),
                'status' => ucfirst($user->status ?: 'active'),
                'total_fees_billed' => (float) StudentFee::sum('amount'),
                'total_fees_collected' => (float) StudentFee::where('status', 'Paid')->sum('amount'),
                'total_expenses_recorded' => (float) SchoolExpense::sum('amount'),
                'managed_accounts_count' => StudentFee::distinct('student_id')->count('student_id'),
            ],
        ]);
    }

    /**
     * Accounts Profile Update.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user() ?: \Illuminate\Support\Facades\Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }
        $request->validate([
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255|unique:users,email,' . $user->id,
        ]);

        if ($request->filled('name')) {
            $user->name = $request->input('name');
        }
        if ($request->filled('phone')) {
            $user->phone = $request->input('phone');
        }
        if ($request->filled('email')) {
            $user->email = $request->input('email');
        }
        $user->save();

        // Also update associated Teacher record if exists
        $teacher = Teacher::where('user_id', $user->id)->first();
        if ($teacher) {
            if ($request->filled('name')) {
                $nameParts = explode(' ', trim($request->input('name')), 2);
                $teacher->first_name = $nameParts[0];
                $teacher->last_name = $nameParts[1] ?? '';
            }
            if ($request->filled('phone')) {
                $teacher->phone = $request->input('phone');
            }
            if ($request->filled('email')) {
                $teacher->email = $request->input('email');
            }
            $teacher->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Accounts profile details updated successfully.',
            'data' => $user,
        ]);
    }
}
