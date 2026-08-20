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

        if ($request->filled('status') && strtolower($request->status) !== 'all') {
            $query->where('status', $request->status);
        }

        $teachers = $query->orderBy('created_at', 'desc')->paginate($request->input('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $teachers,
        ]);
    }

    /**
     * Store a newly created teacher and auto-generate staff login credentials.
     */
    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email|unique:teachers,email',
            'phone' => 'nullable|string|max:20',
            'department' => 'nullable|string|max:255',
            'qualification' => 'nullable|string|max:255',
            'experience' => 'nullable|string|max:255',
            'salary' => 'nullable|numeric|min:0',
            'joining_date' => 'nullable|date',
            'assigned_subjects' => 'nullable|array',
            'assigned_classes' => 'nullable|array',
            'class_teacher_class' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'emergency_contact' => 'nullable|string',
            'status' => 'nullable|string|in:Active,On Leave,Inactive',
        ]);

        return DB::transaction(function () use ($request) {
            // 1. Generate unique teacher ID if not provided
            $count = Teacher::count() + 1;
            $teacherId = 'TCH-' . str_pad($count, 3, '0', STR_PAD_LEFT);

            // 2. Auto-generate secure random temporary password (e.g. Tch#7kP9x)
            $generatedPassword = 'Tch#' . Str::random(6) . '!';

            // 3. Create or Restore User account for the teacher with must_change_password = true
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
                $user->name = $fullName;
                $user->email = strtolower($request->email);
                $user->phone = $request->phone;
                $user->password = Hash::make($generatedPassword);
                $user->role = 'teacher';
                $user->must_change_password = true;
                $user->password_changed_at = null;
                $user->status = 'active';
                $user->save();
            } else {
                $user = User::create([
                    'name' => $fullName,
                    'email' => strtolower($request->email),
                    'phone' => $request->phone,
                    'password' => Hash::make($generatedPassword),
                    'role' => 'teacher',
                    'must_change_password' => true, // Flagged for first-time login
                    'password_changed_at' => null,
                    'status' => 'active',
                ]);
            }

            // 4. Create Teacher profile linked to user
            $teacher = Teacher::create([
                'user_id' => $user->id,
                'teacher_id' => $teacherId,
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'email' => strtolower($request->email),
                'phone' => $request->phone,
                'gender' => $request->gender,
                'date_of_birth' => $request->date_of_birth,
                'joining_date' => $request->joining_date ?? now()->toDateString(),
                'department' => $request->department,
                'qualification' => $request->qualification,
                'experience' => $request->experience,
                'salary' => $request->salary,
                'assigned_subjects' => $request->assigned_subjects ?? [],
                'assigned_classes' => $request->assigned_classes ?? [],
                'class_teacher_class' => $request->class_teacher_class,
                'address' => $request->address,
                'emergency_contact' => $request->emergency_contact,
                'status' => $request->status ?? 'Active',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Teacher created successfully with auto-generated login credentials.',
                'data' => $teacher->load('user'),
                'credentials' => [
                    'teacher_id' => $teacherId,
                    'name' => $fullName,
                    'email' => strtolower($request->email),
                    'temporary_password' => $generatedPassword,
                    'must_change_password' => true,
                    'note' => 'Please provide these credentials to the staff member. They will be prompted to change their password on first login.',
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
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:teachers,email,' . $teacher->id . '|unique:users,email,' . ($teacher->user_id ?? 0),
            'phone' => 'nullable|string|max:20',
            'department' => 'nullable|string|max:255',
            'qualification' => 'nullable|string|max:255',
            'experience' => 'nullable|string|max:255',
            'salary' => 'nullable|numeric|min:0',
            'assigned_subjects' => 'nullable|array',
            'assigned_classes' => 'nullable|array',
            'class_teacher_class' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'emergency_contact' => 'nullable|string',
            'status' => 'nullable|string|in:Active,On Leave,Inactive',
        ]);

        return DB::transaction(function () use ($request, $teacher) {
            $teacher->update($request->only([
                'first_name', 'last_name', 'email', 'phone', 'gender',
                'date_of_birth', 'joining_date', 'department', 'qualification',
                'experience', 'salary', 'assigned_subjects', 'assigned_classes',
                'class_teacher_class',
                'address', 'emergency_contact', 'status'
            ]));

            if ($teacher->user) {
                $teacher->user->update([
                    'name' => $teacher->full_name,
                    'email' => strtolower($request->email),
                    'phone' => $request->phone,
                ]);
            }

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
