<?php
/**
 * School CRM - Public API Front-Controller (Hostinger Production)
 *
 * This bridge resides inside `public_html/api/index.php` to handle `/api/*`
 * requests and bootstrap the isolated Laravel application located in the
 * sibling `backend/` directory (`../backend`).
 *
 * Architecture:
 * - Public DocumentRoot: archcampus.archenterprises.co.in/public_html/
 * - Private Laravel Backend: archcampus.archenterprises.co.in/backend/
 */

define('LARAVEL_START', microtime(true));

// Locate the isolated backend directory (supports sibling or document root placement)
$backendCandidates = [
    dirname(__DIR__, 2) . '/backend',
    dirname(__DIR__) . '/../backend',
    dirname(__DIR__) . '/backend',
    (isset($_SERVER['DOCUMENT_ROOT']) ? rtrim($_SERVER['DOCUMENT_ROOT'], '/\\') . '/../backend' : null),
    (isset($_SERVER['DOCUMENT_ROOT']) ? rtrim($_SERVER['DOCUMENT_ROOT'], '/\\') . '/backend' : null),
];

$backendPath = null;
foreach ($backendCandidates as $candidate) {
    if ($candidate && is_dir($candidate) && file_exists($candidate . '/bootstrap/app.php')) {
        $backendPath = realpath($candidate) ?: $candidate;
        break;
    }
}

if (!$backendPath) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'error' => 'Backend Architecture Error',
        'message' => 'The Laravel backend was not found in the sibling directory (../backend). Verify Hostinger directory structure.',
    ]);
    exit(1);
}

// 1. Check Maintenance Mode
if (file_exists($maintenance = $backendPath . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

// 2. Auto-extract vendor bundle if deployed via FTP
$vendorZip = $backendPath . '/vendor.zip';
if (file_exists($vendorZip) && class_exists('ZipArchive')) {
    @set_time_limit(300);
    @ini_set('memory_limit', '512M');
    $zip = new ZipArchive();
    if ($zip->open($vendorZip) === true) {
        $zip->extractTo($backendPath);
        $zip->close();
        @unlink($vendorZip);
    }
}

// Ensure framework storage and cache directories exist with writable permissions
$requiredDirs = [
    $backendPath . '/storage/framework/cache/data',
    $backendPath . '/storage/framework/sessions',
    $backendPath . '/storage/framework/views',
    $backendPath . '/storage/logs',
    $backendPath . '/bootstrap/cache',
];
foreach ($requiredDirs as $dir) {
    if (!is_dir($dir)) {
        @mkdir($dir, 0775, true);
    }
}

// Register Composer Autoloader
if (!file_exists($autoloader = $backendPath . '/vendor/autoload.php')) {
    http_response_code(503);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'error' => 'Service Unavailable',
        'message' => 'Composer vendor autoloader missing. Dependencies must be installed in backend/vendor.',
    ]);
    exit(1);
}
require $autoloader;

// 3. Bootstrap Laravel Application
/** @var \Illuminate\Foundation\Application $app */
$app = require_once $backendPath . '/bootstrap/app.php';

// Set public path to the web document root (public_html)
if (method_exists($app, 'usePublicPath')) {
    $app->usePublicPath(dirname(__DIR__));
}

// 4. Handle Incoming Request
$request = \Illuminate\Http\Request::capture();
$response = $app->handleRequest($request);
$response->send();

