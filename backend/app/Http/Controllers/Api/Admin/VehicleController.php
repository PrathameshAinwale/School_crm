<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index(Request $request)
    {
        $query = Vehicle::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('vehicle_number', 'like', "%{$search}%")
                  ->orWhere('driver_name', 'like', "%{$search}%")
                  ->orWhere('driver_phone', 'like', "%{$search}%")
                  ->orWhere('route_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && strtolower($request->status) !== 'all') {
            $query->where('status', $request->status);
        }

        $vehicles = $query->orderBy('vehicle_number', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $vehicles,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'vehicle_number' => 'required|string|unique:vehicles,vehicle_number',
            'type' => 'required|string',
            'model' => 'nullable|string',
            'capacity' => 'required|integer|min:1',
            'driver_name' => 'required|string|max:255',
            'driver_phone' => 'required|string|max:20',
            'driver_license' => 'nullable|string',
            'route_name' => 'nullable|string',
            'route_stops' => 'nullable|array',
            'fuel_type' => 'nullable|string',
            'insurance_expiry' => 'nullable|date',
            'fitness_expiry' => 'nullable|date',
            'status' => 'nullable|string|in:Active,Maintenance,Out of Service',
        ]);

        $vehicle = Vehicle::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Vehicle registered successfully.',
            'data' => $vehicle,
        ], 201);
    }

    public function show($id)
    {
        $vehicle = Vehicle::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $vehicle,
        ]);
    }

    public function update(Request $request, $id)
    {
        $vehicle = Vehicle::findOrFail($id);

        $request->validate([
            'vehicle_number' => 'required|string|unique:vehicles,vehicle_number,' . $vehicle->id,
            'type' => 'required|string',
            'capacity' => 'required|integer|min:1',
            'driver_name' => 'required|string|max:255',
            'driver_phone' => 'required|string|max:20',
            'status' => 'nullable|string|in:Active,Maintenance,Out of Service',
        ]);

        $vehicle->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Vehicle updated successfully.',
            'data' => $vehicle,
        ]);
    }

    public function destroy($id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $vehicle->delete();

        return response()->json([
            'success' => true,
            'message' => 'Vehicle deleted successfully.',
        ]);
    }
}
