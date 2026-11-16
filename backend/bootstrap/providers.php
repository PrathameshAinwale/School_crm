<?php

use App\Providers\AppServiceProvider;

return [
    AppServiceProvider::class,
    \Barryvdh\DomPDF\ServiceProvider::class,
    \Laravel\Sanctum\SanctumServiceProvider::class,
];
