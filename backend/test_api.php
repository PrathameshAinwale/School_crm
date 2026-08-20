<?php

function post($url, $data, $token = null) {
    $ch = curl_init($url);
    $headers = ['Content-Type: application/json', 'Accept: application/json'];
    if ($token) $headers[] = "Authorization: Bearer $token";
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $res = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['status' => $status, 'data' => json_decode($res, true), 'raw' => $res];
}

function get($url, $token = null) {
    $ch = curl_init($url);
    $headers = ['Accept: application/json'];
    if ($token) $headers[] = "Authorization: Bearer $token";
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $res = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['status' => $status, 'data' => json_decode($res, true), 'raw' => $res];
}

echo "=== 1. TEST ADMIN LOGIN ===\n";
$adminLogin = post('http://127.0.0.1:8000/api/v1/auth/login', [
    'identifier' => 'admin@school.com',
    'password' => 'password123'
]);
echo "Status: {$adminLogin['status']}\n";
echo "Token: " . substr($adminLogin['data']['token'] ?? '', 0, 20) . "...\n";
echo "User Role: {$adminLogin['data']['user']['role']}\n";
echo "Must Change Password: " . ($adminLogin['data']['user']['must_change_password'] ? 'true' : 'false') . "\n\n";

$adminToken = $adminLogin['data']['token'];

echo "=== 2. TEST ADMIN DASHBOARD ===\n";
$dash = get('http://127.0.0.1:8000/api/v1/admin/dashboard', $adminToken);
echo "Status: {$dash['status']}\n";
print_r($dash['data']['data']['metrics'] ?? $dash['data']);
echo "\n";

echo "=== 3. TEST TEACHER CREATION (WITH AUTO-GENERATED RANDOM CREDENTIALS) ===\n";
$newTeacher = post('http://127.0.0.1:8000/api/v1/admin/teachers', [
    'first_name' => 'Alexander',
    'last_name' => 'Wright',
    'email' => 'alexander.wright@school.com',
    'phone' => '9823450099',
    'department' => 'Mathematics',
    'qualification' => 'Ph.D. Applied Mathematics',
    'experience' => '12 Years',
    'salary' => 60000,
    'assigned_classes' => ['Grade 10-A', 'Grade 10-B'],
    'assigned_subjects' => ['Mathematics', 'Advanced Calculus'],
], $adminToken);
echo "Status: {$newTeacher['status']}\n";
echo "Generated Credentials for Staff:\n";
print_r($newTeacher['data']['credentials'] ?? $newTeacher['data']);
echo "\n";

$tempTeacherPass = $newTeacher['data']['credentials']['temporary_password'] ?? 'password123';

echo "=== 4. TEST NEW STAFF LOGIN (WITH MUST_CHANGE_PASSWORD = TRUE) ===\n";
$teacherLogin = post('http://127.0.0.1:8000/api/v1/auth/login', [
    'identifier' => 'alexander.wright@school.com',
    'password' => $tempTeacherPass
]);
echo "Status: {$teacherLogin['status']}\n";
echo "Staff User: {$teacherLogin['data']['user']['name']}\n";
echo "Must Change Password Flag: " . ($teacherLogin['data']['user']['must_change_password'] ? 'true (PROMPT SHOWN)' : 'false') . "\n\n";

$teacherToken = $teacherLogin['data']['token'];

echo "=== 5. TEST FIRST-TIME PASSWORD CHANGE BY STAFF ===\n";
$changePass = post('http://127.0.0.1:8000/api/v1/auth/change-password', [
    'current_password' => $tempTeacherPass,
    'new_password' => 'AlexSecret@2026',
    'new_password_confirmation' => 'AlexSecret@2026',
], $teacherToken);
echo "Status: {$changePass['status']}\n";
echo "Message: {$changePass['data']['message']}\n";
echo "Must Change Password after update: " . ($changePass['data']['user']['must_change_password'] ? 'true' : 'false (PROMPT DISMISSED FOREVER)') . "\n\n";

echo "=== 6. TEST STUDENT CREATION (PARENT MOBILE + AUTO-GENERATED PASS) ===\n";
$newStudent = post('http://127.0.0.1:8000/api/v1/admin/students', [
    'first_name' => 'Dev',
    'last_name' => 'Kapoor',
    'roll_number' => '1001',
    'school_class_id' => 1,
    'guardian_name' => 'Vikram Kapoor',
    'guardian_phone' => '9876500111',
    'guardian_email' => 'vikram.kapoor@example.com',
    'guardian_relation' => 'Father',
], $adminToken);
echo "Status: {$newStudent['status']}\n";
echo "Parent Login Credentials Generated:\n";
print_r($newStudent['data']['credentials'] ?? $newStudent['data']);
echo "\n";

$parentPass = $newStudent['data']['credentials']['temporary_password'] ?? 'password123';

echo "=== 7. TEST PARENT LOGIN VIA MOBILE NUMBER ===\n";
$parentLogin = post('http://127.0.0.1:8000/api/v1/auth/login', [
    'identifier' => '9876500111',
    'password' => $parentPass
]);
echo "Status: {$parentLogin['status']}\n";
echo "Parent Logged In: {$parentLogin['data']['user']['name']}\n";
echo "Role: {$parentLogin['data']['user']['role']}\n";
echo "Must Change Password: " . ($parentLogin['data']['user']['must_change_password'] ? 'true' : 'false') . "\n\n";

echo "=== 8. TEST ATTENDANCE API ===\n";
$attendance = get('http://127.0.0.1:8000/api/v1/admin/attendance?date=' . date('Y-m-d'), $adminToken);
echo "Status: {$attendance['status']}\n";
print_r($attendance['data']['summary'] ?? $attendance['data']);
echo "\n";

echo "=== 9. TEST ADMISSIONS API ===\n";
$admissions = get('http://127.0.0.1:8000/api/v1/admin/admissions', $adminToken);
echo "Status: {$admissions['status']}\n";
echo "Total Applications Found: " . ($admissions['data']['data']['total'] ?? count($admissions['data']['data'] ?? [])) . "\n\n";

echo "=== 10. TEST VEHICLES & RESOURCES API ===\n";
$vehicles = get('http://127.0.0.1:8000/api/v1/admin/vehicles', $adminToken);
$resources = get('http://127.0.0.1:8000/api/v1/admin/resources', $adminToken);
echo "Vehicles Count: " . count($vehicles['data']['data'] ?? []) . "\n";
echo "Resources Count: " . count($resources['data']['data'] ?? []) . "\n";
