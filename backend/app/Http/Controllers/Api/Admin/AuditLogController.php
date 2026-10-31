<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Services\SchoolContext;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /**
     * Get paginated audit logs for the active school branch.
     */
    public function index(Request $request)
    {
        $schoolId = SchoolContext::getActiveSchoolId();

        $query = AuditLog::where('school_id', $schoolId)
            ->orderBy('created_at', 'desc');

        if ($request->filled('event') && strtolower($request->event) !== 'all') {
            $query->where('event', $request->event);
        }

        if ($request->filled('auditable_type') && strtolower($request->auditable_type) !== 'all') {
            $type = $request->auditable_type;
            $query->where('auditable_type', 'like', "%{$type}%");
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('user_name', 'like', "%{$search}%")
                  ->orWhere('user_role', 'like', "%{$search}%")
                  ->orWhere('auditable_id', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%");
            });
        }

        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', Carbon::parse($request->date_from)->startOfDay());
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', Carbon::parse($request->date_to)->endOfDay());
        }

        $perPage = (int) $request->input('per_page', 25);
        $logs = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }
}

