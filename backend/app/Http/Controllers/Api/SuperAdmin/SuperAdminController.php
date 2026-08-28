<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\School;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SuperAdminController extends Controller
{
    /**
     * Platform Executive Dashboard Metrics for Super Admin.
     */
    public function dashboard(Request $request)
    {
        $totalSchools = School::count();
        $activeSchools = School::where('status', 'active')->count();
        $suspendedSchools = School::where('status', 'suspended')->count();
        $trialSchools = School::where('subscription_status', 'trial')->count();

        // Platform-wide student & staff totals
        $totalStudents = Student::count();
        $totalTeachers = Teacher::count();
        $totalUsers = User::count();

        // Subscriptions & MRR Estimation
        $planPricing = [
            'Enterprise' => 60000,
            'Pro' => 35000,
            'Standard' => 20000,
            'Trial' => 0,
        ];

        $schools = School::all();
        $estimatedMonthlyRunRate = $schools->sum(function ($s) use ($planPricing) {
            return $planPricing[$s->subscription_plan] ?? 25000;
        });

        // Plan distribution
        $planDistribution = School::selectRaw('subscription_plan, count(*) as count')
            ->groupBy('subscription_plan')
            ->get()
            ->keyBy('subscription_plan');

        // Recent Onboardings
        $recentSchools = School::with('adminUser')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'name' => $s->name,
                    'code' => $s->code,
                    'city' => $s->city ?: 'Metro Campus',
                    'plan' => $s->subscription_plan,
                    'status' => $s->status,
                    'studentsCount' => $s->students()->count(),
                    'staffCount' => $s->teachers()->count(),
                    'adminName' => $s->adminUser ? $s->adminUser->name : 'System Admin',
                    'adminEmail' => $s->adminUser ? $s->adminUser->email : $s->email,
                    'createdAt' => $s->created_at ? $s->created_at->format('M d, Y') : '—',
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => [
                    'totalSchools' => $totalSchools,
                    'activeSchools' => $activeSchools,
                    'suspendedSchools' => $suspendedSchools,
                    'trialSchools' => $trialSchools,
                    'totalStudents' => $totalStudents,
                    'totalTeachers' => $totalTeachers,
                    'totalUsers' => $totalUsers,
                    'estimatedMRR' => $estimatedMonthlyRunRate,
                    'estimatedARR' => $estimatedMonthlyRunRate * 12,
                ],
                'planDistribution' => [
                    'Enterprise' => $planDistribution['Enterprise']->count ?? 0,
                    'Pro' => $planDistribution['Pro']->count ?? 0,
                    'Standard' => $planDistribution['Standard']->count ?? 0,
                    'Trial' => $planDistribution['Trial']->count ?? 0,
                ],
                'recentSchools' => $recentSchools,
            ],
        ]);
    }

    /**
     * Schools Directory with search, filters, and usage statistics.
     */
    public function schoolsList(Request $request)
    {
        $query = School::with('adminUser');

        if ($request->filled('status') && strtolower($request->status) !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('plan') && strtolower($request->plan) !== 'all') {
            $query->where('subscription_plan', $request->plan);
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('principal_name', 'like', "%{$search}%");
            });
        }

        $schools = $query->orderBy('created_at', 'desc')->get();

        $mapped = $schools->map(function ($s) {
            $studentsCount = Student::where('school_id', $s->id)->count();
            $staffCount = Teacher::where('school_id', $s->id)->count();
            $admin = $s->adminUser;

            return [
                'id' => $s->id,
                'name' => $s->name,
                'code' => $s->code,
                'slug' => $s->slug,
                'affiliation' => $s->affiliation ?: 'CBSE',
                'address' => $s->address,
                'city' => $s->city ?: '—',
                'state' => $s->state ?: '—',
                'phone' => $s->phone,
                'email' => $s->email,
                'website' => $s->website,
                'logo_url' => $s->logo_url,
                'principal_name' => $s->principal_name ?: 'Principal',
                'subscription_plan' => $s->subscription_plan,
                'subscription_status' => $s->subscription_status,
                'subscription_expires_at' => $s->subscription_expires_at ? $s->subscription_expires_at->format('M d, Y') : 'Lifetime',
                'max_students' => $s->max_students,
                'max_staff' => $s->max_staff,
                'status' => $s->status,
                'studentsCount' => $studentsCount,
                'staffCount' => $staffCount,
                'admin' => $admin ? [
                    'id' => $admin->id,
                    'name' => $admin->name,
                    'email' => $admin->email,
                    'phone' => $admin->phone,
                    'status' => $admin->status,
                ] : null,
                'createdAt' => $s->created_at ? $s->created_at->format('d M Y') : '—',
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'schools' => $mapped,
                'total' => $schools->count(),
            ],
            'schools' => $mapped,
        ]);
    }

    /**
     * Onboard a new School and automatically provision School Admin user credentials.
     */
    public function storeSchool(Request $request)
    {
        $request->validate([
            // School Information
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:schools,code',
            'affiliation' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|string|max:255',
            'principal_name' => 'nullable|string|max:255',
            'subscription_plan' => 'required|string|in:Trial,Standard,Pro,Enterprise',
            'max_students' => 'nullable|integer|min:50',
            'max_staff' => 'nullable|integer|min:5',

            // Admin Credentials
            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|email|max:255|unique:users,email',
            'admin_password' => 'required|string|min:6',
            'admin_phone' => 'nullable|string|max:30',
        ]);

        $slug = Str::slug($request->name);
        // Ensure slug is unique
        $originalSlug = $slug;
        $counter = 1;
        while (School::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter++;
        }

        $expiryDate = match ($request->subscription_plan) {
            'Trial' => Carbon::now()->addDays(30)->toDateString(),
            'Standard' => Carbon::now()->addYear()->toDateString(),
            'Pro' => Carbon::now()->addYear()->toDateString(),
            'Enterprise' => Carbon::now()->addYears(2)->toDateString(),
            default => Carbon::now()->addYear()->toDateString(),
        };

        // 1. Create School Record
        $school = School::create([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'slug' => $slug,
            'affiliation' => $request->affiliation ?? 'CBSE',
            'address' => $request->address,
            'city' => $request->city,
            'state' => $request->state,
            'phone' => $request->phone,
            'email' => $request->email,
            'website' => $request->website,
            'principal_name' => $request->principal_name,
            'subscription_plan' => $request->subscription_plan,
            'subscription_status' => 'active',
            'subscription_expires_at' => $expiryDate,
            'max_students' => $request->max_students ?? 3000,
            'max_staff' => $request->max_staff ?? 100,
            'status' => 'active',
        ]);

        // 2. Automatically Provision School Admin User
        $adminUser = User::create([
            'school_id' => $school->id,
            'name' => $request->admin_name,
            'email' => $request->admin_email,
            'phone' => $request->admin_phone ?? $request->phone,
            'password' => Hash::make($request->admin_password),
            'role' => 'admin',
            'must_change_password' => false,
            'status' => 'active',
        ]);

        // 3. Create Welcome in-app notification for School Admin
        Notification::create([
            'school_id' => $school->id,
            'user_id' => $adminUser->id,
            'role' => 'admin',
            'title' => "Welcome to EduFlow SaaS SMS: {$school->name}",
            'message' => "Your school instance ({$school->code}) has been successfully provisioned on the {$school->subscription_plan} plan. You can now add teachers, enroll students, and manage your campus.",
            'type' => 'success',
            'link' => '/dashboard',
            'is_read' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => "School '{$school->name}' onboarded successfully! Admin account created for {$adminUser->email}.",
            'data' => [
                'school' => $school,
                'admin' => [
                    'id' => $adminUser->id,
                    'name' => $adminUser->name,
                    'email' => $adminUser->email,
                    'role' => $adminUser->role,
                ],
            ],
        ], 201);
    }

    /**
     * Show detailed stats of a specific school.
     */
    public function showSchool($id)
    {
        $school = School::with('adminUser')->findOrFail($id);

        $studentsCount = Student::where('school_id', $school->id)->count();
        $teachersCount = Teacher::where('school_id', $school->id)->count();

        return response()->json([
            'success' => true,
            'data' => [
                'school' => $school,
                'students_count' => $studentsCount,
                'teachers_count' => $teachersCount,
                'admin' => $school->adminUser,
            ],
        ]);
    }

    /**
     * Update School Details & Subscription.
     */
    public function updateSchool(Request $request, $id)
    {
        $school = School::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:schools,code,' . $school->id,
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'principal_name' => 'nullable|string',
            'subscription_plan' => 'required|string|in:Trial,Standard,Pro,Enterprise',
            'status' => 'required|string|in:active,inactive,suspended',
            'max_students' => 'nullable|integer|min:1',
            'max_staff' => 'nullable|integer|min:1',
        ]);

        $school->update($request->all());

        return response()->json([
            'success' => true,
            'message' => "School details updated successfully.",
            'data' => $school->fresh()->load('adminUser'),
        ]);
    }

    /**
     * Toggle School Active / Suspended status.
     */
    public function toggleSchoolStatus(Request $request, $id)
    {
        $school = School::findOrFail($id);
        $newStatus = $school->status === 'active' ? 'suspended' : 'active';

        $school->update([
            'status' => $newStatus,
            'subscription_status' => $newStatus === 'active' ? 'active' : 'suspended',
        ]);

        return response()->json([
            'success' => true,
            'message' => "School '{$school->name}' marked as {$newStatus}.",
            'status' => $newStatus,
        ]);
    }

    /**
     * Reset School Admin Password.
     */
    public function resetSchoolAdminPassword(Request $request, $id)
    {
        $school = School::with('adminUser')->findOrFail($id);
        $admin = $school->adminUser;

        if (!$admin) {
            return response()->json(['success' => false, 'message' => 'No admin user found for this school.'], 404);
        }

        $newPassword = $request->input('new_password') ?: 'admin@' . strtolower($school->code);
        $admin->update([
            'password' => Hash::make($newPassword),
            'must_change_password' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Password for School Admin ({$admin->email}) reset successfully to: {$newPassword}",
            'temporary_password' => $newPassword,
        ]);
    }

    /**
     * Delete a School and all its tenant data.
     */
    public function destroySchool(Request $request, $id)
    {
        $school = School::findOrFail($id);
        $schoolName = $school->name;

        // Delete all associated users and school record
        User::where('school_id', $school->id)->delete();
        $school->delete();

        return response()->json([
            'success' => true,
            'message' => "School '{$schoolName}' and associated tenant data removed from platform.",
        ]);
    }
}
