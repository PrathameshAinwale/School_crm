<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // Expand any comma-separated roles (e.g. "role:teacher,admin")
        $allowedRoles = [];
        foreach ($roles as $r) {
            foreach (explode(',', $r) as $subRole) {
                $trimmed = trim($subRole);
                if ($trimmed !== '') {
                    $allowedRoles[] = $trimmed;
                }
            }
        }

        // Admin and Super Admin always have broad administrative permissions
        if ($user->role === 'admin' || $user->role === 'super_admin') {
            return $next($request);
        }

        // Principal has executive view-only access across operational endpoints, with authorized school settings editing
        if ($user->role === 'principal') {
            // Whitelisted authenticated session & authorized principal management actions
            if ($request->is('*auth/logout*') ||
                $request->is('*auth/change-password*') ||
                $request->is('*academic-years/switch*') ||
                $request->is('*admin/settings*') ||
                $request->is('*settings*') ||
                $request->is('*admin/academic-years*') ||
                $request->is('*academic-years*') ||
                $request->is('*files/upload*')) {
                return $next($request);
            }

            // Strictly allow only read-safe HTTP methods (GET, HEAD, OPTIONS)
            if (in_array($request->method(), ['GET', 'HEAD', 'OPTIONS'])) {
                return $next($request);
            }

            return response()->json([
                'success' => false,
                'message' => 'Principal role has view-only executive access. Modification actions are forbidden.'
            ], 403);
        }

        // Admission Officer has scoped access to admissions, academic structure, fee structures, events, and staff self-service
        if ($user->role === 'admission_officer') {
            if (in_array('admission_officer', $allowedRoles) ||
                $request->is('*admissions*') ||
                $request->is('*academic/classes*') ||
                $request->is('*fee-structures*') ||
                $request->is('*admin/events*') ||
                $request->is('*teacher/my-attendance*') ||
                $request->is('*teacher/punch*') ||
                $request->is('*teacher/leaves*') ||
                $request->is('*teacher/profile*')) {
                return $next($request);
            }
        }

        if (!empty($allowedRoles) && !in_array($user->role, $allowedRoles)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Insufficient permissions.'
            ], 403);
        }

        return $next($request);
    }
}
