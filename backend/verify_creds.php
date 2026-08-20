<?php

function post($url, $data) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Accept: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $res = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['status' => $status, 'data' => json_decode($res, true)];
}

$admin = post('http://127.0.0.1:8000/api/v1/auth/login', [
    'identifier' => 'admin@school.com',
    'password' => '111111'
]);

$owner = post('http://127.0.0.1:8000/api/v1/auth/login', [
    'identifier' => 'owner@school.com',
    'password' => '111111'
]);

echo "Admin Login (" . ($admin['status'] == 200 ? 'SUCCESS' : 'FAILED') . "): " . ($admin['data']['user']['email'] ?? 'error') . "\n";
echo "Owner Login (" . ($owner['status'] == 200 ? 'SUCCESS' : 'FAILED') . "): " . ($owner['data']['user']['email'] ?? 'error') . "\n";
