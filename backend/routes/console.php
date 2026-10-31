<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Batch 0 Foundation: Audit logs pruning
Schedule::command('audit:prune --days=180')
    ->daily()
    ->withoutOverlapping(60);

// Batch 1 Communication: Logs pruning (180 days retention)
Schedule::command('communication:prune --days=180')
    ->daily()
    ->withoutOverlapping(60);

// Batch 1 Communication: Dispatch scheduled campaigns whose time has arrived
Schedule::command('communication:dispatch-scheduled')
    ->everyMinute()
    ->withoutOverlapping(5);

// Batch 1 Communication: Shared hosting worker (runs for max 50 seconds or until empty)
Schedule::command('queue:work --stop-when-empty --max-time=50 --memory=128 --tries=3')
    ->everyMinute()
    ->withoutOverlapping(5);

// Batch 2 Fees: Calculate late fines daily (delta-only, idempotent)
Schedule::command('fees:calculate-late-fines')
    ->dailyAt('01:00')
    ->withoutOverlapping(15);

