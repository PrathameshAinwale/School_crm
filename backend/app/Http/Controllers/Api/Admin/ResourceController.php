<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Resource;
use Illuminate\Http\Request;

class ResourceController extends Controller
{
    public function index(Request $request)
    {
        $query = Resource::query();

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

        $resources = $query->orderBy('name', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $resources,
        ]);
    }

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
            'notes' => $request->notes,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Resource created successfully.',
            'data' => $resource,
        ], 201);
    }

    public function show($id)
    {
        $resource = Resource::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $resource,
        ]);
    }

    public function update(Request $request, $id)
    {
        $resource = Resource::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'total_quantity' => 'required|integer|min:1',
            'available_quantity' => 'required|integer|min:0',
            'condition' => 'nullable|string|in:Good,Needs Repair,Damaged,Discarded',
            'status' => 'nullable|string|in:Available,In Use,Maintenance,Out of Stock',
        ]);

        $resource->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Resource updated successfully.',
            'data' => $resource,
        ]);
    }

    public function destroy($id)
    {
        $resource = Resource::findOrFail($id);
        $resource->delete();

        return response()->json([
            'success' => true,
            'message' => 'Resource deleted successfully.',
        ]);
    }
}
