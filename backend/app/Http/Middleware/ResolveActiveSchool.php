<?php

namespace App\Http\Middleware;

use App\Models\School;
use App\Services\SchoolContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveActiveSchool
{
    /**
     * Handle incoming request and resolve active school branch & locale.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Resolve & Set Locale from Accept-Language header
        $langHeader = $request->header('Accept-Language');
        if ($langHeader) {
            $langCode = strtolower(trim(explode(',', explode(';', $langHeader)[0])[0]));
            if (in_array($langCode, ['en', 'mr', 'hi'])) {
                app()->setLocale($langCode);
            }
        }

        // 2. Resolve Active School Branch
        $user = $request->user();

        if ($user) {
            $requestedSchoolId = $request->header('X-School-Id');

            if ($requestedSchoolId !== null && $requestedSchoolId !== '') {
                $requestedId = (int)$requestedSchoolId;
                $school = School::find($requestedId);

                if (!$school) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Requested school branch was not found.',
                    ], 404);
                }

                // Super admin and school admin can access/switch active branches
                if ($user->role === 'super_admin' || $user->role === 'admin') {
                    SchoolContext::setActiveSchoolId($school->id);
                } else {
                    // Other roles (teacher, student, hr, accountant, librarian) restricted strictly to home branch
                    if ($requestedId !== (int)$user->school_id) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Unauthorized: Cross-branch access is strictly prohibited for your account role.',
                        ], 403);
                    }
                    SchoolContext::setActiveSchoolId($user->school_id ? (int)$user->school_id : null);
                }
            } else {
                // Default to user's assigned home branch
                SchoolContext::setActiveSchoolId($user->school_id ? (int)$user->school_id : null);
            }

            $request->attributes->set('active_school_id', SchoolContext::getActiveSchoolId());
        }

        return $next($request);
    }
}
