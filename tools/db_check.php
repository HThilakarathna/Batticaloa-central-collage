<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';

$store = app_store();

$result = [
    'database' => $store->databaseStatus(),
    'tables' => new stdClass(),
];

$resources = ['notices','programs','achievements','history_events','staff_members'];

try {
    if ($store->adminAvailable()) {
        foreach ($resources as $r) {
            try {
                $rows = $store->listResource($r);
                $result['tables']->{$r} = [
                    'count' => count($rows),
                    'sample' => array_slice($rows, 0, 10),
                ];
            } catch (Throwable $e) {
                $result['tables']->{$r} = [
                    'error' => $e->getMessage(),
                ];
            }
        }
    } else {
        $result['note'] = 'Database not available per DataStore.';
    }
} catch (Throwable $e) {
    $result['error'] = $e->getMessage();
}

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL;
