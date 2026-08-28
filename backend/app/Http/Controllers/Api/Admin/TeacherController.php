<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TeacherController extends Controller
{
    /**
     * Display a listing of teachers with optional search & filters.
     */
    public function index(Request $request)
    {
        $query = Teacher::with('user');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('teacher_id', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('department', 'like', "%{$search}%");
            });
        }

        if ($request->filled('department') && strtolower($request->department) !== 'all') {
            $query->where('department', $request->department);
        }

        if ($request->boolean('all') || $request->input('per_page') == 100) {
            $teachers = $query->orderBy('first_name', 'asc')->get();
            return response()->json([
                'success' => true,
                'data' => $teachers,
            ]);
        }

        $teachers = $query->orderBy('created_at', 'desc')->paginate($request->input('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $teachers,
        ]);
    }

    /**
     * Store a newly created teacher/staff member and auto-generate staff login credentials.
     */
    public function store(Request $request)
    {
        $request->validate([
            'role' => 'nullable|string|in:teacher,hr,admin,accountant',
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email|unique:teachers,email',
            'phone' => 'nullable|string|max:20',
            'gender' => 'nullable|string|in:Male,Female,Other',
            'blood_group' => 'nullable|string|max:10',
            'date_of_birth' => 'nullable|date',
            'department' => 'nullable|string|max:255',
            'qualification' => 'nullable|string|max:255',
            'experience' => 'nullable|string|max:255',
            'salary' => 'nullable|numeric|min:0',
            'allowance' => 'nullable|numeric|min:0',
            'joining_date' => 'nullable|date',
            'assigned_subjects' => 'nullable|array',
            'assigned_classes' => 'nullable|array',
            'class_teacher_class' => 'nullable|string|max:100',
            'class_teacher_division' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'emergency_contact' => 'nullable|string',
            'status' => 'nullable|string|in:Active,On Leave,Inactive',
        ]);

        return DB::transaction(function () use ($request) {
            $staffRole = $request->input('role', 'teacher');
            $isNonTeaching = in_array($staffRole, ['hr', 'admin', 'accountant']);

            // If assigning as Class Teacher, unassign any existing teacher for this class/division
            if (!$isNonTeaching && $request->filled('class_teacher_class')) {
                $existingQuery = Teacher::where('class_teacher_class', $request->class_teacher_class);
                if ($request->filled('class_teacher_division')) {
                    $existingQuery->where('class_teacher_division', $request->class_teacher_division);
                }
                $existingQuery->update([
                    'class_teacher_class' => null,
                    'class_teacher_division' => null,
                ]);
            }

            $currentSchoolId = auth()->user()?->school_id;
            $school = auth()->user()?->school;
            $schoolPrefix = $school ? ($school->code . '-') : '';

            // 1. Generate unique staff ID based on role and school
            $rolePrefixMap = [
                'admin' => $schoolPrefix . 'ADM-',
                'accountant' => $schoolPrefix . 'ACC-',
                'hr' => $schoolPrefix . 'HR-',
                'teacher' => $schoolPrefix . 'TCH-',
            ];
            $prefix = $rolePrefixMap[$staffRole] ?? ($schoolPrefix . 'STF-');

            $nextCount = Teacher::withoutGlobalScopes()->where('school_id', $currentSchoolId)->count() + 1;
            $teacherId = $request->input('teacher_id') ?: ($prefix . str_pad($nextCount, 3, '0', STR_PAD_LEFT));

            while (Teacher::withoutGlobalScopes()->where('teacher_id', $teacherId)->exists()) {
                $nextCount++;
                $teacherId = $prefix . str_pad($nextCount, 3, '0', STR_PAD_LEFT);
            }

            // 2. Auto-generate secure random temporary password
            $pwdPrefixMap = [
                'admin' => 'Adm#',
                'accountant' => 'Acc#',
                'hr' => 'Hr#',
                'teacher' => 'Tch#',
            ];
            $pwdPrefix = $pwdPrefixMap[$staffRole] ?? 'Stf#';
            $generatedPassword = $pwdPrefix . Str::random(6) . '!';

            // 3. Create or Restore User account with designated role ('admin', 'accountant', 'hr', 'teacher')
            $fullName = trim($request->first_name . ' ' . $request->last_name);
            $user = User::withTrashed()
                ->where('email', strtolower($request->email))
                ->orWhere(function ($q) use ($request) {
                    if ($request->phone) {
                        $q->where('phone', $request->phone);
                    }
                })
                ->first();

            if ($user) {
                if ($user->trashed()) {
                    $user->restore();
                }
                $user->school_id = $currentSchoolId;
                $user->name = $fullName;
                $user->email = strtolower($request->email);
                $user->phone = $request->phone;
                $user->password = Hash::make($generatedPassword);
                $user->role = $staffRole;
                $user->must_change_password = true;
                $user->password_changed_at = null;
                $user->status = 'active';
                $user->save();
            } else {
                $user = User::create([
                    'school_id' => $currentSchoolId,
                    'name' => $fullName,
                    'email' => strtolower($request->email),
                    'phone' => $request->phone,
                    'password' => Hash::make($generatedPassword),
                    'role' => $staffRole,
                    'must_change_password' => true,
                    'password_changed_at' => null,
                    'status' => 'active',
                ]);
            }

            // 4. Default department and salary
            $defaultDeptMap = [
                'admin' => 'Administration',
                'accountant' => 'Accounts & Finance',
                'hr' => 'Human Resources',
                'teacher' => 'General',
            ];
            $dept = $request->department ?: ($defaultDeptMap[$staffRole] ?? 'General');
            $baseSalary = (float) ($request->salary ?? ($staffRole === 'admin' ? 75000 : ($staffRole === 'accountant' ? 60000 : ($staffRole === 'hr' ? 55000 : 50000))));
            $allowance = (float) ($request->allowance ?? 0);

            $teacher = Teacher::create([
                'user_id' => $user->id,
                'teacher_id' => $teacherId,
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'email' => strtolower($request->email),
                'phone' => $request->phone,
                'gender' => $request->gender,
                'blood_group' => $request->blood_group,
                'date_of_birth' => $request->date_of_birth,
                'joining_date' => $request->joining_date ?? now()->toDateString(),
                'department' => $dept,
                'qualification' => $request->qualification,
                'experience' => $request->experience,
                'salary' => $baseSalary,
                'allowance' => $allowance,
                'assigned_subjects' => $isNonTeaching ? [] : ($request->assigned_subjects ?? []),
                'assigned_classes' => $isNonTeaching ? [] : ($request->assigned_classes ?? []),
                'class_teacher_class' => $isNonTeaching ? null : $request->class_teacher_class,
                'class_teacher_division' => $isNonTeaching ? null : $request->class_teacher_division,
                'address' => $request->address,
                'emergency_contact' => $request->emergency_contact,
                'status' => $request->status ?? 'Active',
            ]);

            // 5. Create / Sync StaffSalary record for current month
            $currentMonth = \Carbon\Carbon::now()->format('F Y');
            $gross = $baseSalary + $allowance;
            $deduction = round($gross * 0.12, 2);
            $net = round($gross - $deduction, 2);

            $roleTitleMap = [
                'admin' => 'School Administrator',
                'accountant' => 'Accounts & Finance Lead',
                'hr' => 'HR Operations & Talent Manager',
                'teacher' => ($dept . ' Faculty'),
            ];

            \App\Models\StaffSalary::updateOrCreate(
                [
                    'teacher_id' => $teacher->id,
                    'month' => $currentMonth,
                ],
                [
                    'employee_id' => $teacherId,
                    'name' => $fullName,
                    'role' => $roleTitleMap[$staffRole] ?? ($dept . ' Staff'),
                    'department' => $dept,
                    'base_salary' => $baseSalary,
                    'allowance' => $allowance,
                    'working_days' => 26,
                    'days_present' => 26,
                    'paid_leaves' => 0,
                    'unpaid_leaves' => 0,
                    'hra' => round($baseSalary * 0.20, 2),
                    'da' => round($baseSalary * 0.10, 2),
                    'special_allowance' => $allowance,
                    'deduction' => $deduction,
                    'pf_deduction' => $deduction,
                    'tds_deduction' => 0,
                    'gross_salary' => $gross,
                    'net_salary' => $net,
                    'status' => 'Processed',
                    'account_no' => '•••• •••• ' . rand(1000, 9999),
                    'bank_name' => 'HDFC Bank',
                ]
            );

            $roleLabelMap = [
                'admin' => 'School Administrator',
                'accountant' => 'Accounts & Finance Officer',
                'hr' => 'HR Manager',
                'teacher' => 'Teaching Faculty',
            ];

            return response()->json([
                'success' => true,
                'message' => ($roleLabelMap[$staffRole] ?? 'Staff member') . ' onboarded successfully with auto-generated login credentials.',
                'data' => $teacher->load('user'),
                'credentials' => [
                    'teacher_id' => $teacherId,
                    'name' => $fullName,
                    'role' => $staffRole,
                    'email' => strtolower($request->email),
                    'temporary_password' => $generatedPassword,
                    'must_change_password' => true,
                    'note' => "Credentials issued for {$staffRole} portal access. User will access only their designated module upon login.",
                ],
            ], 201);
        });
    }

    /**
     * Display the specified teacher.
     */
    public function show($id)
    {
        $teacher = Teacher::with(['user', 'attendances'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $teacher,
        ]);
    }

    /**
     * Update teacher details.
     */
    public function update(Request $request, $id)
    {
        $teacher = Teacher::findOrFail($id);

        $request->validate([
            'role' => 'nullable|string|in:teacher,hr,admin,accountant',
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:teachers,email,' . $teacher->id . '|unique:users,email,' . ($teacher->user_id ?? 0),
            'phone' => 'nullable|string|max:20',
            'gender' => 'nullable|string|in:Male,Female,Other',
            'blood_group' => 'nullable|string|max:10',
            'date_of_birth' => 'nullable|date',
            'department' => 'nullable|string|max:255',
            'qualification' => 'nullable|string|max:255',
            'experience' => 'nullable|string|max:255',
            'salary' => 'nullable|numeric|min:0',
            'allowance' => 'nullable|numeric|min:0',
            'assigned_subjects' => 'nullable|array',
            'assigned_classes' => 'nullable|array',
            'class_teacher_class' => 'nullable|string|max:100',
            'class_teacher_division' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'emergency_contact' => 'nullable|string',
            'status' => 'nullable|string|in:Active,On Leave,Inactive',
        ]);

        return DB::transaction(function () use ($request, $teacher) {
            $staffRole = $request->input('role', $teacher->user?->role ?? 'teacher');
            $isNonTeaching = in_array($staffRole, ['hr', 'admin', 'accountant']);

            // If assigning/changing class teacher assignment, unassign any other teacher holding it
            if (!$isNonTeaching && $request->filled('class_teacher_class')) {
                $existingQuery = Teacher::where('class_teacher_class', $request->class_teacher_class)
                    ->where('id', '!=', $teacher->id);
                if ($request->filled('class_teacher_division')) {
                    $existingQuery->where('class_teacher_division', $request->class_teacher_division);
                }
                $existingQuery->update([
                    'class_teacher_class' => null,
                    'class_teacher_division' => null,
                ]);
            }

            $updateData = $request->only([
                'first_name', 'last_name', 'email', 'phone', 'gender', 'blood_group',
                'date_of_birth', 'joining_date', 'department', 'qualification',
                'experience', 'salary', 'allowance', 'assigned_subjects', 'assigned_classes',
                'class_teacher_class', 'class_teacher_division',
                'address', 'emergency_contact', 'status'
            ]);

            if ($isNonTeaching) {
                $updateData['assigned_subjects'] = [];
                $updateData['assigned_classes'] = [];
                $updateData['class_teacher_class'] = null;
                $updateData['class_teacher_division'] = null;
            }

            $teacher->update($updateData);

            if ($teacher->user) {
                $userUpdates = [
                    'name' => $teacher->full_name,
                    'email' => strtolower($request->email),
                    'phone' => $request->phone,
                ];
                if ($request->filled('role')) {
                    $userUpdates['role'] = $request->role;
                }
                $teacher->user->update($userUpdates);
            }

            // Sync updated salary in staff_salaries table
            $baseSalary = (float) ($teacher->salary ?? 50000);
            $allowance = (float) ($teacher->allowance ?? 0);
            $gross = $baseSalary + $allowance;
            $deduction = round($gross * 0.12, 2);
            $net = round($gross - $deduction, 2);
            $currentMonth = \Carbon\Carbon::now()->format('F Y');

            \App\Models\StaffSalary::where('teacher_id', $teacher->id)
                ->where('status', '!=', 'Disbursed')
                ->update([
                    'name' => $teacher->full_name,
                    'department' => $teacher->department ?: 'Teaching',
                    'base_salary' => $baseSalary,
                    'allowance' => $allowance,
                    'special_allowance' => $allowance,
                    'deduction' => $deduction,
                    'pf_deduction' => $deduction,
                    'gross_salary' => $gross,
                    'net_salary' => $net,
                ]);

            return response()->json([
                'success' => true,
                'message' => 'Teacher updated successfully',
                'data' => $teacher->fresh()->load('user'),
            ]);
        });
    }

    /**
     * Reset / Re-generate temporary credentials for staff.
     */
    public function resetPassword($id)
    {
        $teacher = Teacher::with('user')->findOrFail($id);

        if (!$teacher->user) {
            // Create user account if it was missing
            $generatedPassword = 'Tch#' . Str::random(6) . '!';
            $user = User::create([
                'name' => $teacher->full_name,
                'email' => strtolower($teacher->email),
                'phone' => $teacher->phone,
                'password' => Hash::make($generatedPassword),
                'role' => 'teacher',
                'must_change_password' => true,
                'status' => 'active',
            ]);
            $teacher->user_id = $user->id;
            $teacher->save();
        } else {
            $generatedPassword = 'Tch#' . Str::random(6) . '!';
            $teacher->user->update([
                'password' => Hash::make($generatedPassword),
                'must_change_password' => true,
                'password_changed_at' => null,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Teacher password reset successfully.',
            'credentials' => [
                'teacher_id' => $teacher->teacher_id,
                'name' => $teacher->full_name,
                'email' => $teacher->email,
                'temporary_password' => $generatedPassword,
                'must_change_password' => true,
            ],
        ]);
    }

    /**
     * Remove the specified teacher.
     */
    public function destroy($id)
    {
        $teacher = Teacher::findOrFail($id);
        
        \Illuminate\Support\Facades\DB::transaction(function () use ($teacher) {
            if ($teacher->user) {
                $teacher->user->update(['status' => 'inactive']);
                $teacher->user->delete(); // Soft delete user
            }
            
            $teacher->update(['status' => 'Inactive']);
            $teacher->delete(); // Soft delete teacher
        });

        return response()->json([
            'success' => true,
            'message' => 'Staff member has been soft deleted successfully (data preserved in database).',
        ]);
    }
}
