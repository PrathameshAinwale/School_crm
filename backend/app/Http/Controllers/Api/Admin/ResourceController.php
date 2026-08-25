<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Resource;
use App\Models\ResourceRequest;
use App\Models\Teacher;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ResourceController extends Controller
{
    /**
     * Display a listing of resources with assigned teacher details.
     */
    public function index(Request $request)
    {
        $query = Resource::with('assignedTeacher');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('resource_code', 'like', "%{$search}%")
                  ->orWhere('location_room', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category') && strtolower($request->category) !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->filled('condition') && strtolower($request->condition) !== 'all') {
            $query->where('condition', $request->condition);
        }

        // If teacher is viewing only their assigned resources
        if ($request->filled('assigned_teacher_id')) {
            $query->where('assigned_teacher_id', $request->assigned_teacher_id);
        } elseif ($request->boolean('my_only') && $request->user()) {
            $teacher = Teacher::where('user_id', $request->user()->id)
                ->orWhere('email', $request->user()->email)
                ->first();
            if ($teacher) {
                $query->where('assigned_teacher_id', $teacher->id);
            }
        }

        $resources = $query->orderBy('name', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $resources,
        ]);
    }

    /**
     * Store a newly created resource asset.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'total_quantity' => 'required|integer|min:1',
            'available_quantity' => 'nullable|integer|min:0',
            'condition' => 'nullable|string|in:Good,Needs Repair,Damaged,Discarded',
            'location_room' => 'nullable|string',
            'purchase_date' => 'nullable|date',
            'unit_cost' => 'nullable|numeric|min:0',
            'status' => 'nullable|string|in:Available,In Use,Maintenance,Out of Stock',
            'assigned_teacher_id' => 'nullable|exists:teachers,id',
            'notes' => 'nullable|string',
        ]);

        $count = Resource::count() + 1;
        $code = 'RES-' . strtoupper(substr($request->category, 0, 3)) . '-' . str_pad($count, 3, '0', STR_PAD_LEFT);

        $resource = Resource::create([
            'resource_code' => $code,
            'name' => $request->name,
            'category' => $request->category,
            'total_quantity' => $request->total_quantity,
            'available_quantity' => $request->available_quantity ?? $request->total_quantity,
            'condition' => $request->condition ?? 'Good',
            'location_room' => $request->location_room,
            'purchase_date' => $request->purchase_date,
            'unit_cost' => $request->unit_cost,
            'status' => $request->status ?? 'Available',
            'assigned_teacher_id' => $request->assigned_teacher_id,
            'notes' => $request->notes,
        ]);

        // If a teacher is assigned, send a notification to that teacher
        if ($resource->assigned_teacher_id) {
            $assignedTeacher = Teacher::find($resource->assigned_teacher_id);
            if ($assignedTeacher) {
                Notification::create([
                    'user_id' => $assignedTeacher->user_id,
                    'role' => 'teacher',
                    'title' => 'Assigned Resource Asset: ' . $resource->name,
                    'message' => "You have been assigned as the responsible person for {$resource->name} ({$resource->resource_code}) located at {$resource->location_room}.",
                    'type' => 'general',
                    'link' => '/teacher/resources',
                    'is_read' => false,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Resource created successfully.',
            'data' => $resource->fresh()->load('assignedTeacher'),
        ], 201);
    }

    /**
     * Display the specified resource with assigned teacher & issue history.
     */
    public function show($id)
    {
        $resource = Resource::with(['assignedTeacher', 'requests.teacher', 'requests.user', 'requests.actionedBy'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $resource,
        ]);
    }

    /**
     * Update the specified resource.
     */
    public function update(Request $request, $id)
    {
        $resource = Resource::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'total_quantity' => 'required|integer|min:1',
            'available_quantity' => 'required|integer|min:0',
            'condition' => 'nullable|string|in:Good,Needs Repair,Damaged,Discarded',
            'location_room' => 'nullable|string',
            'purchase_date' => 'nullable|date',
            'unit_cost' => 'nullable|numeric|min:0',
            'status' => 'nullable|string|in:Available,In Use,Maintenance,Out of Stock',
            'assigned_teacher_id' => 'nullable|exists:teachers,id',
            'notes' => 'nullable|string',
        ]);

        $oldTeacherId = $resource->assigned_teacher_id;
        $resource->update($request->all());

        // Notify new teacher if assigned
        if ($request->filled('assigned_teacher_id') && $request->assigned_teacher_id != $oldTeacherId) {
            $assignedTeacher = Teacher::find($request->assigned_teacher_id);
            if ($assignedTeacher) {
                Notification::create([
                    'user_id' => $assignedTeacher->user_id,
                    'role' => 'teacher',
                    'title' => 'Assigned Resource Asset: ' . $resource->name,
                    'message' => "You have been assigned as the responsible person for {$resource->name} ({$resource->resource_code}).",
                    'type' => 'general',
                    'link' => '/teacher/resources',
                    'is_read' => false,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Resource updated successfully.',
            'data' => $resource->fresh()->load('assignedTeacher'),
        ]);
    }

    /**
     * Remove the specified resource.
     */
    public function destroy($id)
    {
        $resource = Resource::findOrFail($id);
        $resource->delete();

        return response()->json([
            'success' => true,
            'message' => 'Resource deleted successfully.',
        ]);
    }

    /**
     * Get list of Resource Issue/Maintenance Requests.
     */
    public function requests(Request $request)
    {
        $user = $request->user();
        $query = ResourceRequest::with(['resource.assignedTeacher', 'teacher', 'user', 'actionedBy'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('status') && strtolower($request->status) !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('resource_id')) {
            $query->where('resource_id', $request->resource_id);
        }

        // If user is a teacher, allow fetching their own submitted requests or assigned asset requests
        if ($request->boolean('my_requests') && $user) {
            $teacher = Teacher::where('user_id', $user->id)
                ->orWhere('email', $user->email)
                ->first();

            if ($teacher) {
                $query->where(function ($q) use ($teacher, $user) {
                    $q->where('teacher_id', $teacher->id)
                      ->orWhere('user_id', $user->id);
                });
            } else {
                $query->where('user_id', $user->id);
            }
        }

        $requests = $query->get();

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }

    /**
     * Store a new resource issue / maintenance request (Raised by Teacher or Staff).
     */
    public function storeRequest(Request $request)
    {
        $request->validate([
            'resource_id' => 'required|exists:resources,id',
            'title' => 'required|string|max:255',
            'issue_type' => 'required|string|max:100',
            'severity' => 'nullable|string|in:Low,Medium,High,Critical',
            'affected_quantity' => 'nullable|integer|min:1',
            'description' => 'required|string',
            'photo' => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:10240',
        ]);

        $user = $request->user();
        $teacher = null;
        if ($user) {
            $teacher = Teacher::where('user_id', $user->id)
                ->orWhere('email', $user->email)
                ->first();
        }

        $photoUrl = null;
        $photoName = null;

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $photoName = $file->getClientOriginalName();
            $ext = strtolower($file->getClientOriginalExtension());
            $filename = 'issue_' . time() . '_' . Str::random(8) . '.' . $ext;

            $dest = public_path('uploads/resource_issues');
            if (!file_exists($dest)) {
                mkdir($dest, 0777, true);
            }
            $file->move($dest, $filename);
            $photoUrl = '/uploads/resource_issues/' . $filename;
        }

        $resource = Resource::findOrFail($request->resource_id);

        $resourceRequest = ResourceRequest::create([
            'resource_id' => $resource->id,
            'teacher_id' => $teacher ? $teacher->id : null,
            'user_id' => $user ? $user->id : null,
            'title' => $request->title,
            'issue_type' => $request->issue_type,
            'severity' => $request->severity ?? 'Medium',
            'affected_quantity' => $request->filled('affected_quantity') ? intval($request->affected_quantity) : 1,
            'description' => $request->description,
            'photo_url' => $photoUrl,
            'photo_name' => $photoName,
            'status' => 'Pending',
        ]);

        // Auto-update resource condition to 'Needs Repair' if marked as Critical/High
        if (in_array($request->severity, ['High', 'Critical'])) {
            $resource->update([
                'condition' => 'Needs Repair',
                'status' => 'Maintenance',
            ]);
        }

        $reporterName = $teacher ? $teacher->full_name : ($user ? $user->name : 'Teacher');

        // Notify Admins
        Notification::create([
            'role' => 'admin',
            'title' => "New Resource Issue: {$resource->name}",
            'message' => "{$reporterName} raised a {$resourceRequest->severity} severity issue on {$resource->name} ({$resource->resource_code}): {$resourceRequest->title}.",
            'type' => 'alert',
            'link' => '/school-resources',
            'is_read' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Resource issue request submitted successfully. Admin will review and action it.',
            'data' => $resourceRequest->load(['resource', 'teacher', 'user']),
        ], 201);
    }

    /**
     * Approve, Reject, or Resolve a Resource Request (Admin Action).
     */
    public function actionRequest(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:Approved,Rejected,Resolved,In Repair',
            'admin_remarks' => 'nullable|string',
            'update_resource_status' => 'nullable|string',
            'update_resource_condition' => 'nullable|string',
        ]);

        $resourceRequest = ResourceRequest::with(['resource', 'teacher', 'user'])->findOrFail($id);
        $adminUser = $request->user();

        $resourceRequest->update([
            'status' => $request->status,
            'admin_remarks' => $request->admin_remarks,
            'actioned_by_user_id' => $adminUser ? $adminUser->id : null,
            'actioned_at' => Carbon::now(),
        ]);

        // Update parent resource condition and status if requested or automatically
        $resource = $resourceRequest->resource;
        if ($resource) {
            if ($request->status === 'Resolved') {
                $resource->update([
                    'condition' => $request->update_resource_condition ?: 'Good',
                    'status' => $request->update_resource_status ?: 'Available',
                ]);
            } elseif ($request->status === 'Approved' || $request->status === 'In Repair') {
                $resource->update([
                    'condition' => $request->update_resource_condition ?: 'Needs Repair',
                    'status' => $request->update_resource_status ?: 'Maintenance',
                ]);
            }
        }

        // Notify the teacher who raised the request
        $targetUserId = $resourceRequest->user_id;
        if (!$targetUserId && $resourceRequest->teacher) {
            $targetUserId = $resourceRequest->teacher->user_id;
        }

        $statusColor = $request->status === 'Approved' ? 'approved' : ($request->status === 'Resolved' ? 'resolved' : 'rejected');

        if ($targetUserId) {
            Notification::create([
                'user_id' => $targetUserId,
                'role' => 'teacher',
                'title' => "Resource Request {$request->status}: {$resourceRequest->title}",
                'message' => "Your maintenance request for {$resource->name} was marked as {$request->status} by Admin. " . ($request->admin_remarks ? "Remarks: {$request->admin_remarks}" : ''),
                'type' => $request->status === 'Rejected' ? 'alert' : 'general',
                'link' => '/teacher/resources',
                'is_read' => false,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => "Resource request marked as {$request->status} successfully.",
            'data' => $resourceRequest->fresh()->load(['resource', 'teacher', 'user', 'actionedBy']),
        ]);
    }
}
