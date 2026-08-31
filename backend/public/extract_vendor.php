<?php
header('Content-Type: application/json');
ini_set('max_execution_time', 300);
ini_set('memory_limit', '512M');

$zipPath = __DIR__ . '/../vendor.zip';

if (!file_exists($zipPath)) {
    echo json_encode([
        'status' => 'skipped',
        'message' => 'vendor.zip not present (vendor already intact or excluded)'
    ]);
    exit;
}

$zip = new ZipArchive;
$res = $zip->open($zipPath);

if ($res === TRUE) {
    $extractPath = realpath(__DIR__ . '/..');
    $zip->extractTo($extractPath);
    $zip->close();
    @unlink($zipPath);
    
    echo json_encode([
        'status' => 'success',
        'message' => 'vendor.zip successfully extracted and removed',
        'autoload_exists' => file_exists(__DIR__ . '/../vendor/autoload.php')
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to extract vendor.zip, error code: ' . $res
    ]);
}
