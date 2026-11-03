<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RequestLogger
{
    public function handle(Request $request, Closure $next)
    {
        $start = microtime(true);
        $response = $next($request);
        $duration = round((microtime(true) - $start) * 1000, 2);

        Log::info(sprintf('%s /%s [%s] ~%sms', $request->method(), ltrim($request->path(), '/'), $response->status(), $duration));

        return $response;
    }
}
