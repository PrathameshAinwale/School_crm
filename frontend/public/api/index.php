
<?php

/**
 * School CRM - Laravel 12 API Front Controller
 *
 * Production location:
 * public_html/api/index.php
 *
 * Laravel backend:
 * public_html/backend/
 */

define('LARAVEL_START', microtime(true));

/**
 * Return a JSON error response.
 */
function apiBridgeError(int $status, string $error, string $message): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');

    echo json_encode([
        'success' => false,
        'error' => $error,
        'message' => $message,
    ]);

    exit;
}

/**
 * 1. Locate Laravel backend.
 *
 * Expected structure:
 * public_html/
 * ├── api/index.php
 * └── backend/bootstrap/app.php
 */
$backendPath = realpath(dirname(__DIR__) . '/backend');

if (
    !$backendPath ||
    !is_dir($backendPath) ||
    !file_exists($backendPath . '/bootstrap/app.php')
) {
    error_log('School CRM API Bridge: Laravel backend not found.');

    apiBridgeError(
        500,
        'Backend Not Found',
        'The Laravel backend could not be initialized.'
    );
}

/**
 * 2. Check Laravel maintenance mode.
 */
$maintenanceFile = $backendPath . '/storage/framework/maintenance.php';

if (file_exists($maintenanceFile)) {
    require $maintenanceFile;
}

/**
 * 3. Ensure required writable directories exist.
 */
$requiredDirs = [
    $backendPath . '/storage/framework/cache/data',
    $backendPath . '/storage/framework/sessions',
    $backendPath . '/storage/framework/views',
    $backendPath . '/storage/logs',
    $backendPath . '/bootstrap/cache',
];

foreach ($requiredDirs as $directory) {
    if (!is_dir($directory)) {
        if (!@mkdir($directory, 0775, true) && !is_dir($directory)) {
            error_log('School CRM API Bridge: Failed to create a required directory.');

            apiBridgeError(
                500,
                'Storage Configuration Error',
                'The application storage directories could not be initialized.'
            );
        }
    }

    if (!is_writable($directory)) {
        error_log('School CRM API Bridge: A required directory is not writable.');

        apiBridgeError(
            500,
            'Storage Permission Error',
            'The application storage directories are not writable.'
        );
    }
}

/**
 * 4. Load Composer autoloader.
 */
$autoloader = $backendPath . '/vendor/autoload.php';

if (!file_exists($autoloader)) {
    error_log('School CRM API Bridge: Composer autoloader missing.');

    apiBridgeError(
        503,
        'Dependencies Missing',
        'The application dependencies are not installed correctly.'
    );
}

require $autoloader;

/**
 * 5. Bootstrap Laravel 12.
 */
$appBootstrap = $backendPath . '/bootstrap/app.php';

try {
    /** @var \Illuminate\Foundation\Application $app */
    $app = require_once $appBootstrap;
} catch (\Throwable $exception) {
    error_log(
        'School CRM Laravel bootstrap error: ' . $exception->getMessage()
    );

    apiBridgeError(
        500,
        'Application Bootstrap Failed',
        'The application could not be initialized.'
    );
}

/**
 * 6. Capture and handle the incoming API request.
 */
try {
    $request = \Illuminate\Http\Request::capture();

    $app->handleRequest($request);
} catch (\Throwable $exception) {
    error_log(
        'School CRM API request error: ' . $exception->getMessage()
    );

    if (!headers_sent()) {
        apiBridgeError(
            500,
            'Internal Server Error',
            'An unexpected server error occurred.'
        );
    }

    exit(1);
}
