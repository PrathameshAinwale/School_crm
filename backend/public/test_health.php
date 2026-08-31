<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

$results = [
    'status' => 'ok',
    'php_version' => PHP_VERSION,
    'vendor_autoload_exists' => file_exists(__DIR__ . '/../vendor/autoload.php'),
    'env_file_exists' => file_exists(__DIR__ . '/../.env'),
    'storage_exists' => is_dir(__DIR__ . '/../storage'),
    'storage_writable' => is_writable(__DIR__ . '/../storage'),
    'bootstrap_cache_writable' => is_writable(__DIR__ . '/../bootstrap/cache'),
];

if (file_exists(__DIR__ . '/../.env')) {
    $envContent = file_get_contents(__DIR__ . '/../.env');
    $results['has_app_key'] = (bool)preg_match('/APP_KEY=base64:[a-zA-Z0-9+\/]+=/', $envContent);
}

echo json_encode($results, JSON_PRETTY_PRINT);
