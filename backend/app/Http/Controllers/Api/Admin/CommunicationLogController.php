<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendCommunicationBatchJob;
use App\Models\CommunicationLog;
use Illuminate\Http\Request;

class CommunicationLogController extends Controller
{
    public function index(Request $request)
    {
        $query = CommunicationLog::with(['campaign', 'student'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('campaign_id')) {
            $query->where('campaign_id', $request->campaign_id);
        }

        if ($request->filled('channel') && $request->channel !== 'all') {
            $query->where('channel', $request->channel);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('recipient_name', 'like', "%{$s}%")
                  ->orWhere('recipient_phone', 'like', "%{$s}%")
                  ->orWhere('recipient_email', 'like', "%{$s}%")
                  ->orWhere('message_body', 'like', "%{$s}%");
            });
        }

        $logs = $query->paginate($request->integer('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }

    public function retry(Request $request, $id)
    {
        $log = CommunicationLog::findOrFail($id);

        if ($log->status !== 'failed') {
            return response()->json([
                'success' => false,
                'message' => 'Only failed logs can be retried.',
            ], 422);
        }

        $log->update([
            'status' => 'queued',
            'error_message' => null,
        ]);

        if ($log->campaign_id) {
            SendCommunicationBatchJob::dispatch($log->campaign_id, [$log->id]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Log queued for retry.',
            'data' => $log,
        ]);
    }
}

