<?php

namespace App\Http\Controllers\Api\Communication;

use App\Http\Controllers\Controller;
use App\Models\CommunicationOptOut;
use App\Services\Communication\PhoneNormalizer;
use Illuminate\Http\Request;

class OptOutController extends Controller
{
    public function index(Request $request)
    {
        $optOuts = CommunicationOptOut::orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $optOuts,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'phone_or_email' => 'required|string|max:150',
            'channel' => 'required|string|in:sms,whatsapp,email,all',
            'reason' => 'nullable|string|max:255',
        ]);

        $user = $request->user();
        $target = trim($validated['phone_or_email']);

        // Normalize if phone
        if (str_contains($target, '@')) {
            $normalized = strtolower($target);
        } else {
            $normalized = PhoneNormalizer::normalize($target) ?: $target;
        }

        $optOut = CommunicationOptOut::updateOrCreate(
            [
                'school_id' => $user->school_id,
                'phone_or_email' => $normalized,
                'channel' => $validated['channel'],
            ],
            [
                'reason' => $validated['reason'] ?? 'Manual administrative opt-out',
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Opt-out registered successfully.',
            'data' => $optOut,
        ], 201);
    }

    public function destroy($id)
    {
        $optOut = CommunicationOptOut::findOrFail($id);
        $optOut->delete();

        return response()->json([
            'success' => true,
            'message' => 'Opt-out removed successfully.',
        ]);
    }
}

