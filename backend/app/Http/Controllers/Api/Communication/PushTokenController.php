<?php

namespace App\Http\Controllers\Api\Communication;

use App\Http\Controllers\Controller;
use App\Models\DevicePushToken;
use Illuminate\Http\Request;

class PushTokenController extends Controller
{
    /**
     * Register or refresh a device push token for the authenticated user.
     */
    public function registerToken(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string',
            'platform' => 'required|string|in:web,android,ios',
            'device_name' => 'nullable|string|max:100',
        ]);

        $user = $request->user();
        $token = $validated['token'];
        $tokenHash = hash('sha256', $token);
        $platform = $validated['platform'];

        $pushToken = DevicePushToken::updateOrCreate(
            [
                'user_id' => $user->id,
                'platform' => $platform,
                'token_hash' => $tokenHash,
            ],
            [
                'school_id' => $user->school_id,
                'token' => $token,
                'device_name' => $validated['device_name'] ?? null,
                'last_used_at' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Device push token registered successfully.',
            'data' => $pushToken,
        ]);
    }

    /**
     * List registered push tokens for admin overview.
     */
    public function index(Request $request)
    {
        $tokens = DevicePushToken::with('user')
            ->orderBy('last_used_at', 'desc')
            ->paginate($request->integer('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $tokens,
        ]);
    }
}

