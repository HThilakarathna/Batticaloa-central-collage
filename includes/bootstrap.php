<?php

declare(strict_types=1);

define('ROOT_PATH', dirname(__DIR__));

require_once ROOT_PATH . '/includes/helpers.php';
require_once ROOT_PATH . '/includes/DataStore.php';

if (session_status() !== PHP_SESSION_ACTIVE) {
    $sessionPath = ROOT_PATH . '/storage/sessions';
    if (!is_dir($sessionPath)) {
        mkdir($sessionPath, 0777, true);
    }
    session_save_path($sessionPath);
    session_start();
}

function app_store(): DataStore
{
    static $store = null;

    if ($store === null) {
        $store = new DataStore();
    }

    return $store;
}
