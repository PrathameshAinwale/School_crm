<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeaveType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class LeaveTypeController extends Controller
{
    /**
     * List all leave types and their quotas.
     */
    public function index(Request $request)
    {
        $query = LeaveType::query();

        // If not admin/hr, show only active ones
        $user = $request->user();
        if ($user && !in_array($user->role, ['admin', 'hr']) && !$request->boolean('include_inactive')) {
            $query->where('is_active', true);
        }

        $leaveTypes = $query->orderBy('id', 'asc')->get()->map(function ($lt) {
            return [
                'id' => $lt->id,
                'name' => $lt->name,
                'code' => strtoupper($lt->code),
                'total_days' => (int) $lt->total_days,
                'description' => $lt->description,
                'color' => $lt->color ?: 'amber',
                'is_active' => (bool) $lt->is_active,
                'requires_attachment' => (bool) $lt->requires_attachment,
                'style' => $lt->style,
                'created_at' => $lt->created_at ? $lt->created_at->format('d M Y') : '-',
            ];
        });

        return response()->json([
            'success' => true,
            'leave_types' => $leaveTypes,
            'total' => $leaveTypes->count(),
        ]);
    }

    /**
     * Store a new dynamic leave type with quota.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:10',
            'total_days' => 'required|integer|min:1|max:365',
            'description' => 'nullable|string|max:1000',
            'color' => 'nullable|string|in:amber,rose,purple,emerald,blue,indigo,cyan',
            'is_active' => 'nullable|boolean',
            'requires_attachment' => 'nullable|boolean',
        ]);

        $code = strtoupper(trim($validated['code']));

        // Check if code already exists
        $existing = LeaveType::where('code', $code)->first();
        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => "A leave type with code '{$code}' already exists.",
            ], 422);
        }

        $leaveType = LeaveType::create([
            'name' => trim($validated['name']),
            'code' => $code,
            'total_days' => (int) $validated['total_days'],
            'description' => $validated['description'] ?? null,
            'color' => $validated['color'] ?? 'amber',
            'is_active' => $request->has('is_active') ? $request->boolean('is_active') : true,
            'requires_attachment' => $request->boolean('requires_attachment'),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Leave type '{$leaveType->name}' with {$leaveType->total_days} days quota created successfully.",
            'leave_type' => [
                'id' => $leaveType->id,
                'name' => $leaveType->name,
                'code' => $leaveType->code,
                'total_days' => $leaveType->total_days,
                'description' => $leaveType->description,
                'color' => $leaveType->color,
                'is_active' => (bool) $leaveType->is_active,
                'requires_attachment' => (bool) $leaveType->requires_attachment,
                'style' => $leaveType->style,
            ],
        ], 201);
    }

    /**
     * Update an existing leave type & quota amount.
     */
    public function update(Request $request, $id)
    {
        $leaveType = LeaveType::find($id);
        if (!$leaveType) {
            return response()->json([
                'success' => false,
                'message' => 'Leave type not found.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'code' => 'sometimes|required|string|max:10',
            'total_days' => 'sometimes|required|integer|min:1|max:365',
            'description' => 'nullable|string|max:1000',
            'color' => 'nullable|string|in:amber,rose,purple,emerald,blue,indigo,cyan',
            'is_active' => 'nullable|boolean',
            'requires_attachment' => 'nullable|boolean',
        ]);

        if (isset($validated['code'])) {
            $code = strtoupper(trim($validated['code']));
            $existing = LeaveType::where('code', $code)->where('id', '!=', $leaveType->id)->first();
            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => "Another leave type with code '{$code}' already exists.",
                ], 422);
            }
            $leaveType->code = $code;
        }

        if (isset($validated['name'])) {
            $leaveType->name = trim($validated['name']);
        }
        if (isset($validated['total_days'])) {
            $leaveType->total_days = (int) $validated['total_days'];
        }
        if (array_key_exists('description', $validated)) {
            $leaveType->description = $validated['description'];
        }
        if (isset($validated['color'])) {
            $leaveType->color = $validated['color'];
        }
        if ($request->has('is_active')) {
            $leaveType->is_active = $request->boolean('is_active');
        }
        if ($request->has('requires_attachment')) {
            $leaveType->requires_attachment = $request->boolean('requires_attachment');
        }

        $leaveType->save();

        return response()->json([
            'success' => true,
            'message' => "Leave type '{$leaveType->name}' updated successfully.",
            'leave_type' => [
                'id' => $leaveType->id,
                'name' => $leaveType->name,
                'code' => $leaveType->code,
                'total_days' => $leaveType->total_days,
                'description' => $leaveType->description,
                'color' => $leaveType->color,
                'is_active' => (bool) $leaveType->is_active,
                'requires_attachment' => (bool) $leaveType->requires_attachment,
                'style' => $leaveType->style,
            ],
        ]);
    }

    /**
     * Delete a leave type.
     */
    public function destroy($id)
    {
        $leaveType = LeaveType::find($id);
        if (!$leaveType) {
            return response()->json([
                'success' => false,
                'message' => 'Leave type not found.',
            ], 404);
        }

        $name = $leaveType->name;
        $leaveType->delete();

        return response()->json([
            'success' => true,
            'message' => "Leave type '{$name}' deleted successfully.",
        ]);
    }
}
