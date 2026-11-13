<?php

require_once __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$action = $argv[1] ?? 'query';
$param = $argv[2] ?? '';

try {
    if ($action === 'query') {
        $results = DB::select($param);
        echo json_encode(['success' => true, 'data' => $results]);
    } elseif ($action === 'table') {
        $table = $param;
        $where = $argv[3] ?? '';
        $query = DB::table($table);
        if ($where) {
            $query->whereRaw($where);
        }
        $results = $query->get();
        echo json_encode(['success' => true, 'count' => $results->count(), 'data' => $results]);
    } elseif ($action === 'cleanup') {
        $prefix = 'QA_TEST_%';
        $deleted = [
            'sports_equipment_issues' => DB::table('sports_equipment_issues')->where('borrower_name', 'like', $prefix)->orWhere('notes', 'like', $prefix)->delete(),
            'sports_equipment' => DB::table('sports_equipment')->where('item_name', 'like', $prefix)->orWhere('storage_location', 'like', $prefix)->delete(),
            'sports_fitness_assessments' => DB::table('sports_fitness_assessments')->where('remarks', 'like', $prefix)->orWhere('assessed_by', 'like', $prefix)->delete(),
            'sports_training_schedules' => DB::table('sports_training_schedules')->where('squad_name', 'like', $prefix)->orWhere('coach_name', 'like', $prefix)->delete(),
            'sports_facilities' => DB::table('sports_facilities')->where('name', 'like', $prefix)->orWhere('location', 'like', $prefix)->delete(),
            'sports_participants' => DB::table('sports_participants')->where('jersey_number', 'like', $prefix)->orWhere('performance_notes', 'like', $prefix)->delete(),
            'sports_competitions' => DB::table('sports_competitions')->where('title', 'like', $prefix)->orWhere('opponent_school', 'like', $prefix)->delete(),
            'sports' => DB::table('sports')->where('name', 'like', $prefix)->orWhere('code', 'like', $prefix)->delete(),
        ];
        echo json_encode(['success' => true, 'deleted' => $deleted]);
    }
} catch (Throwable $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

