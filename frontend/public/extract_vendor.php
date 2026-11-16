<?php
/**
 * School CRM - Secure Server-Side Vendor Extractor
 *
 * Runs once upon deployment to extract vendor.zip on the server,
 * avoiding the 1-hour FTP transfer timeout for 8,886 individual files.
 */
@set_time_limit(300);
@ini_set('memory_limit', '512M');

$token = $_GET['token'] ?? '';
$expected = hash('sha256', 'School_crm_2026_deploy_salt');

if (empty($token) || !hash_equals($expected, $token)) {
    http_response_code(403);
    header('Content-Type: application/json');
    die(json_encode(['error' => 'Unauthorized']));
}

header('Content-Type: application/json');

// Check all possible backend locations
$candidatePaths = [
    realpath(__DIR__ . '/backend'),
    realpath(__DIR__ . '/../backend'),
    realpath(dirname(__DIR__) . '/backend'),
    realpath(dirname(dirname(__DIR__)) . '/backend'),
    realpath(__DIR__ . '/../../backend'),
];

$backendDir = false;
foreach ($candidatePaths as $candidate) {
    if ($candidate && is_dir($candidate) && (file_exists($candidate . '/vendor.zip') || file_exists($candidate . '/bootstrap/app.php'))) {
        $backendDir = $candidate;
        break;
    }
}

if (!$backendDir) {
    http_response_code(500);
    echo json_encode(['error' => 'Backend directory not found', 'checked' => $candidatePaths]);
    exit;
}

// Ensure .env exists so Laravel boots properly without runtime crashes
$envPath = $backendDir . '/.env';
if (!file_exists($envPath)) {
    $appKey = 'base64:' . base64_encode(random_bytes(32));
    $defaultEnv = "APP_NAME=\"Arch Campus\"\nAPP_ENV=production\nAPP_KEY={$appKey}\nAPP_DEBUG=false\nAPP_URL=https://archcampus.archenterprises.co.in\nFRONTEND_URL=https://archcampus.archenterprises.co.in\nLOG_CHANNEL=single\nLOG_LEVEL=error\nSESSION_DRIVER=file\nCACHE_STORE=file\nQUEUE_CONNECTION=sync\n";
    @file_put_contents($envPath, $defaultEnv);
}

// Ensure storage directories exist with writable permissions
$storageDirs = [
    $backendDir . '/storage/framework/cache/data',
    $backendDir . '/storage/framework/sessions',
    $backendDir . '/storage/framework/views',
    $backendDir . '/storage/logs',
    $backendDir . '/bootstrap/cache',
];
foreach ($storageDirs as $sDir) {
    if (!is_dir($sDir)) {
        @mkdir($sDir, 0775, true);
    }
    @chmod($sDir, 0775);
}

$zipPath = $backendDir . '/vendor.zip';

if (!file_exists($zipPath)) {
    if (file_exists($backendDir . '/vendor/autoload.php')) {
        echo json_encode(['status' => 'success', 'message' => 'Vendor already present']);
        // Clean up mirror scripts and self
        @unlink(__DIR__ . '/public_html/extract_vendor.php');
        @unlink(__DIR__ . '/../extract_vendor.php');
        @unlink(__FILE__);
        exit;
    }
    http_response_code(404);
    echo json_encode(['error' => 'vendor.zip not found in ' . $backendDir]);
    exit;
}

if (!class_exists('ZipArchive')) {
    http_response_code(500);
    echo json_encode(['error' => 'ZipArchive PHP extension is not available']);
    exit;
}

$zip = new ZipArchive();
$openRes = $zip->open($zipPath);
if ($openRes === TRUE) {
    if ($zip->extractTo($backendDir)) {
        $zip->close();
        @unlink($zipPath);
        echo json_encode(['status' => 'success', 'message' => 'Vendor extracted successfully']);

        // Self-destruct and clean up mirror copy
        @unlink(__DIR__ . '/public_html/extract_vendor.php');
        @unlink(__DIR__ . '/../extract_vendor.php');
        @unlink(__FILE__);
        exit;
    } else {
        $zip->close();
        http_response_code(500);
        echo json_encode(['error' => 'Failed to extract vendor.zip into ' . $backendDir]);
        exit;
    }
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to open vendor.zip, error code: ' . $openRes]);
    exit;
}
