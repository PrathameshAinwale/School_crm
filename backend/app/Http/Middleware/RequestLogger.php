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

        $status = method_exists($response, 'getStatusCode') ? $response->getStatusCode() : (method_exists($response, 'status') ? $response->status() : 200);
        Log::info(sprintf('%s /%s [%s] ~%sms', $request->method(), ltrim($request->path(), '/'), $status, $duration));

        return $response;
    }
}

