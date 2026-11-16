<?php
/**
 * School CRM - Secure Server-Side Vendor Extractor
 *
 * Runs once upon deployment to extract vendor.zip on the server,
 * avoiding the 1-hour FTP transfer timeout for 8,886 individual files.
 */
$token = $_GET['token'] ?? '';
$expected = hash('sha256', 'School_crm_2026_deploy_salt');

if (empty($token) || !hash_equals($expected, $token)) {
    http_response_code(403);
    header('Content-Type: application/json');
    die(json_encode(['error' => 'Unauthorized']));
}

header('Content-Type: application/json');

// Check both possible backend locations:
// 1. Outside public_html: ../backend
// 2. Inside public_html: ./backend
$backendDir = realpath(__DIR__ . '/../backend');
if (!$backendDir || !is_dir($backendDir)) {
    $backendDir = realpath(__DIR__ . '/backend');
}

if (!$backendDir || !is_dir($backendDir)) {
    http_response_code(500);
    echo json_encode(['error' => 'Backend directory not found']);
    @unlink(__FILE__);
    exit;
}

$zipPath = $backendDir . '/vendor.zip';

if (!file_exists($zipPath)) {
    if (file_exists($backendDir . '/vendor/autoload.php')) {
        echo json_encode(['status' => 'success', 'message' => 'Vendor already present']);
        @unlink(__FILE__);
        exit;
    }
    http_response_code(404);
    echo json_encode(['error' => 'vendor.zip not found']);
    @unlink(__FILE__);
    exit;
}

if (!class_exists('ZipArchive')) {
    http_response_code(500);
    echo json_encode(['error' => 'ZipArchive PHP extension is not available']);
    @unlink(__FILE__);
    exit;
}

$zip = new ZipArchive();
if ($zip->open($zipPath) === TRUE) {
    $zip->extractTo($backendDir);
    $zip->close();
    @unlink($zipPath);
    echo json_encode(['status' => 'success', 'message' => 'Vendor extracted successfully']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to open vendor.zip']);
}

// Self-destruct for maximum production security
@unlink(__FILE__);
