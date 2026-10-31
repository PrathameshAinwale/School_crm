<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\DispatchCommunicationCampaignJob;
use App\Jobs\SendCommunicationBatchJob;
use App\Models\CommunicationCampaign;
use App\Models\CommunicationLog;
use App\Services\Communication\AudienceResolver;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommunicationCampaignController extends Controller
{
    public function index(Request $request)
    {
        $query = CommunicationCampaign::with(['template', 'creator'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('channel') && $request->channel !== 'all') {
            $query->where('channel', $request->channel);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                  ->orWhere('subject', 'like', "%{$s}%")
                  ->orWhere('message_body', 'like', "%{$s}%");
            });
        }

        $campaigns = $query->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $campaigns,
        ]);
    }

    public function preview(Request $request, AudienceResolver $resolver)
    {
        $validated = $request->validate([
            'channel' => 'required|string|in:sms,whatsapp,email,push,in_app',
            'message_category' => 'nullable|string|in:transactional,promotional,emergency',
            'audience_type' => 'required|string|in:all,class,section,individual,staff,hostel',
            'audience_filters' => 'nullable|array',
            'message_body' => 'required|string',
            'is_test_mode' => 'nullable|boolean',
            'test_recipients' => 'nullable|array',
        ]);

        $schoolId = $request->user()->school_id;
        $previewData = $resolver->preview($schoolId, $validated);

        return response()->json([
            'success' => true,
            'data' => $previewData,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'channel' => 'required|string|in:sms,whatsapp,email,push,in_app',
            'message_category' => 'nullable|string|in:transactional,promotional,emergency',
            'subject' => 'nullable|string|max:255',
            'message_body' => 'required|string',
            'audience_type' => 'required|string|in:all,class,section,individual,staff,hostel',
            'audience_filters' => 'nullable|array',
            'template_id' => 'nullable|exists:communication_templates,id',
            'is_test_mode' => 'nullable|boolean',
            'test_recipients' => 'nullable|array',
            'scheduled_at' => 'nullable|date',
            'is_circular' => 'nullable|boolean',
            'allow_partial_cap' => 'nullable|boolean',
        ]);

        $user = $request->user();
        $schoolId = $user->school_id;

        $isScheduled = false;
        if (!empty($validated['scheduled_at'])) {
            $schedDate = Carbon::parse($validated['scheduled_at']);
            if ($schedDate->isFuture()) {
                $isScheduled = true;
            }
        }

        $campaign = CommunicationCampaign::create([
            'school_id' => $schoolId,
            'created_by_user_id' => $user->id,
            'template_id' => $validated['template_id'] ?? null,
            'title' => $validated['title'],
            'channel' => $validated['channel'],
            'message_category' => $validated['message_category'] ?? 'transactional',
            'subject' => $validated['subject'] ?? null,
            'message_body' => $validated['message_body'],
            'audience_type' => $validated['audience_type'],
            'audience_filters' => $validated['audience_filters'] ?? null,
            'status' => $isScheduled ? 'scheduled' : 'draft',
            'is_test_mode' => (bool) ($validated['is_test_mode'] ?? false),
            'is_circular' => (bool) ($validated['is_circular'] ?? ($validated['channel'] === 'in_app')),
            'allow_partial_cap' => (bool) ($validated['allow_partial_cap'] ?? false),
            'test_recipients' => $validated['test_recipients'] ?? null,
            'scheduled_at' => $isScheduled ? Carbon::parse($validated['scheduled_at']) : null,
        ]);

        if (!$isScheduled) {
            DispatchCommunicationCampaignJob::dispatch($campaign->id);
        }

        return response()->json([
            'success' => true,
            'message' => $isScheduled ? 'Campaign scheduled successfully.' : 'Campaign dispatched successfully.',
            'data' => $campaign->load(['template', 'creator']),
        ], 201);
    }

    public function show($id)
    {
        $campaign = CommunicationCampaign::with(['template', 'creator'])->findOrFail($id);

        $logsSummary = CommunicationLog::where('campaign_id', $id)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        return response()->json([
            'success' => true,
            'data' => [
                'campaign' => $campaign,
                'status_summary' => $logsSummary,
            ],
        ]);
    }

    public function cancel($id)
    {
        $campaign = CommunicationCampaign::findOrFail($id);
        if (!in_array($campaign->status, ['draft', 'scheduled'])) {
            return response()->json([
                'success' => false,
                'message' => 'Only scheduled or draft campaigns can be cancelled.',
            ], 422);
        }

        $campaign->update(['status' => 'cancelled']);

        return response()->json([
            'success' => true,
            'message' => 'Campaign cancelled successfully.',
        ]);
    }

    public function retryFailed($id)
    {
        $campaign = CommunicationCampaign::findOrFail($id);

        $failedLogIds = CommunicationLog::where('campaign_id', $campaign->id)
            ->where('status', 'failed')
            ->pluck('id')
            ->toArray();

        if (empty($failedLogIds)) {
            return response()->json([
                'success' => false,
                'message' => 'No failed recipients found for this campaign.',
            ], 422);
        }

        CommunicationLog::whereIn('id', $failedLogIds)->update([
            'status' => 'queued',
            'error_message' => null,
        ]);

        $campaign->update(['status' => 'processing']);

        $chunks = array_chunk($failedLogIds, 50);
        foreach ($chunks as $chunk) {
            SendCommunicationBatchJob::dispatch($campaign->id, $chunk);
        }

        return response()->json([
            'success' => true,
            'message' => 'Retrying ' . count($failedLogIds) . ' failed recipients.',
        ]);
    }
}

