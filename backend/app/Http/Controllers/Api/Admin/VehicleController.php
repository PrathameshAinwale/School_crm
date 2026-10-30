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
                  ->orWhere('route_name', 'like', "%{$search}%")
                  ->orWhere('route_from', 'like', "%{$search}%")
                  ->orWhere('route_to', 'like', "%{$search}%");
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
            'route_from' => 'nullable|string|max:255',
            'route_to' => 'nullable|string|max:255',
            'route_name' => 'nullable|string',
            'route_stops' => 'nullable|array',
            'fuel_type' => 'nullable|string',
            'insurance_expiry' => 'nullable|date',
            'fitness_expiry' => 'nullable|date',
            'status' => 'nullable|string|in:Active,Maintenance,Out of Service',
        ]);

        $data = $request->all();
        if (empty($data['route_name'])) {
            if (!empty($data['route_from']) && !empty($data['route_to'])) {
                $data['route_name'] = "{$data['route_from']} ➔ {$data['route_to']}";
            } elseif (!empty($data['route_from'])) {
                $data['route_name'] = $data['route_from'];
            } elseif (!empty($data['route_to'])) {
                $data['route_name'] = $data['route_to'];
            }
        }

        $vehicle = Vehicle::create($data);

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

    public function updateRoute(Request $request, $id)
    {
        $vehicle = Vehicle::findOrFail($id);

        $request->validate([
            'route_from' => 'required|string|max:255',
            'route_to' => 'required|string|max:255',
            'route_name' => 'nullable|string|max:255',
            'route_stops' => 'nullable|array',
        ]);

        $data = $request->only(['route_from', 'route_to', 'route_name', 'route_stops']);
        if (empty($data['route_name'])) {
            $data['route_name'] = "{$data['route_from']} ➔ {$data['route_to']}";
        }

        $vehicle->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Bus route and pickup stops saved successfully.',
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

    public function liveTelemetry($id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $isOnline = $vehicle->is_online && $vehicle->last_ping_at && $vehicle->last_ping_at->gt(now()->subSeconds(35));

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $vehicle->id,
                'vehicle_number' => $vehicle->vehicle_number,
                'driver_name' => $vehicle->driver_name,
                'driver_phone' => $vehicle->driver_phone,
                'route_name' => $vehicle->route_name,
                'route_from' => $vehicle->route_from,
                'route_to' => $vehicle->route_to,
                'capacity' => $vehicle->capacity,
                'current_latitude' => $vehicle->current_latitude,
                'current_longitude' => $vehicle->current_longitude,
                'current_heading' => $vehicle->current_heading,
                'current_speed' => $vehicle->current_speed,
                'is_online' => (bool)$isOnline,
                'last_ping_at' => $vehicle->last_ping_at ? $vehicle->last_ping_at->toIso8601String() : null,
                'tracking_token' => $vehicle->tracking_token,
            ],
        ]);
    }

    public function driverPing(Request $request)
    {
        $request->validate([
            'vehicle_id' => 'required_without:tracking_token',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'heading' => 'nullable|numeric',
            'speed' => 'nullable|numeric',
        ]);

        $query = Vehicle::query();
        if ($request->filled('tracking_token')) {
            $vehicle = $query->where('tracking_token', $request->tracking_token)->first();
        } else {
            $vehicle = $query->find($request->vehicle_id);
        }

        if (!$vehicle) {
            return response()->json(['success' => false, 'message' => 'Vehicle not found.'], 404);
        }

        $vehicle->update([
            'current_latitude' => $request->latitude,
            'current_longitude' => $request->longitude,
            'current_heading' => $request->input('heading', 0),
            'current_speed' => $request->input('speed', 0),
            'is_online' => true,
            'last_ping_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'GPS location ping updated successfully.',
            'data' => [
                'vehicle_id' => $vehicle->id,
                'latitude' => $vehicle->current_latitude,
                'longitude' => $vehicle->current_longitude,
                'heading' => $vehicle->current_heading,
                'speed' => $vehicle->current_speed,
                'last_ping_at' => $vehicle->last_ping_at->toIso8601String(),
            ],
        ]);
    }

    public function toggleDriverTrip(Request $request)
    {
        $request->validate([
            'vehicle_id' => 'required',
            'is_online' => 'required|boolean',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'heading' => 'nullable|numeric',
            'speed' => 'nullable|numeric',
        ]);

        $vehicle = Vehicle::findOrFail($request->vehicle_id);
        $updateData = [
            'is_online' => $request->is_online,
            'last_ping_at' => $request->is_online ? now() : $vehicle->last_ping_at,
        ];

        if ($request->is_online && $request->filled('latitude') && $request->filled('longitude')) {
            $updateData['current_latitude'] = $request->latitude;
            $updateData['current_longitude'] = $request->longitude;
            $updateData['current_heading'] = $request->input('heading', 0);
            $updateData['current_speed'] = $request->input('speed', 0);
        }

        $vehicle->update($updateData);

        return response()->json([
            'success' => true,
            'message' => $request->is_online ? 'Driver is now ONLINE (Broadcasting GPS)' : 'Driver is now OFFLINE',
            'data' => [
                'vehicle_id' => $vehicle->id,
                'is_online' => $vehicle->is_online,
                'current_latitude' => $vehicle->current_latitude,
                'current_longitude' => $vehicle->current_longitude,
                'current_heading' => $vehicle->current_heading,
                'current_speed' => $vehicle->current_speed,
                'last_ping_at' => $vehicle->last_ping_at ? $vehicle->last_ping_at->toIso8601String() : null,
            ],
        ]);
    }

    public function driverVehiclesList()
    {
        $vehicles = Vehicle::select('id', 'vehicle_number', 'driver_name', 'driver_phone', 'route_name', 'type', 'is_online', 'current_latitude', 'current_longitude')->get();
        return response()->json([
            'success' => true,
            'data' => $vehicles,
        ]);
    }
}
