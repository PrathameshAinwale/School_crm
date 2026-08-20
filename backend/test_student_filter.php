<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$teacher = App\Models\User::where('role', 'teacher')->first();

$controller = new App\Http\Controllers\Api\Admin\StudentController();

// 1. Filter by Class 10 & Saffron (A)
$req1 = Illuminate\Http\Request::create('/api/v1/admin/students', 'GET', [
    'school_class_id' => 'Class 10',
    'section_id' => 'Saffron (A)',
]);
$req1->setUserResolver(fn() => $teacher);
$res1 = $controller->index($req1);
$data1 = json_decode($res1->getContent(), true);
echo "Filtered by Class 10 & Saffron (A) count: " . count($data1['data']['data'] ?? []) . "\n";
if (!empty($data1['data']['data'])) {
    $s = $data1['data']['data'][0];
    echo "First student: {$s['first_name']} {$s['last_name']} - Class: {$s['class_name']} - Division: {$s['division_name']}\n";
}

// 2. Filter ALL
$req2 = Illuminate\Http\Request::create('/api/v1/admin/students', 'GET', [
    'school_class_id' => 'ALL',
    'section_id' => 'ALL',
]);
$req2->setUserResolver(fn() => $teacher);
$res2 = $controller->index($req2);
$data2 = json_decode($res2->getContent(), true);
echo "ALL count: " . count($data2['data']['data'] ?? []) . "\n";
