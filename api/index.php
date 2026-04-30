<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/bootstrap.php';

$store = app_store();
$action = $_GET['action'] ?? 'site';
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

try {
    switch ($action) {
        case 'site':
            $page = (string) ($_GET['page'] ?? 'home');
            json_response(['ok' => true, 'data' => $store->getSitePayload($page)]);

        case 'me':
            json_response([
                'ok' => true,
                'data' => [
                    'database' => $store->databaseStatus(),
                    'authenticated' => $store->getAuthenticatedAdmin() !== null,
                    'admin' => $store->getAuthenticatedAdmin(),
                ],
            ]);

        case 'login':
            if ($method !== 'POST') {
                json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);
            }

            $payload = request_json_body();
            $email = trim((string) ($payload['email'] ?? ''));
            $password = (string) ($payload['password'] ?? '');

            if (!$email || !$password) {
                json_response(['ok' => false, 'message' => 'Email and password are required.'], 422);
            }

            $admin = $store->authenticate($email, $password);

            if (!$admin) {
                json_response(['ok' => false, 'message' => 'Invalid email or password.'], 401);
            }

            json_response(['ok' => true, 'data' => $admin]);

        case 'logout':
            if ($method !== 'POST') {
                json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);
            }

            $store->logout();
            json_response(['ok' => true, 'message' => 'Logged out successfully.']);

        case 'dashboard':
            ensure_admin($store);
            json_response(['ok' => true, 'data' => $store->dashboard()]);

        case 'settings':
            ensure_admin($store);

            $key = (string) ($_GET['key'] ?? '');
            if ($key === '') {
                json_response(['ok' => false, 'message' => 'Missing settings key.'], 422);
            }

            if ($method === 'GET') {
                json_response(['ok' => true, 'data' => $store->getSetting($key)]);
            }

            if ($method === 'PUT') {
                $payload = request_json_body();
                json_response(['ok' => true, 'data' => $store->saveSetting($key, $payload)]);
            }

            json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);

        case 'resource':
            ensure_admin($store);
            $name = (string) ($_GET['name'] ?? '');
            $id = isset($_GET['id']) ? (int) $_GET['id'] : null;

            if ($name === '') {
                json_response(['ok' => false, 'message' => 'Missing resource name.'], 422);
            }

            if ($method === 'GET') {
                json_response(['ok' => true, 'data' => $store->listResource($name)]);
            }

            if ($method === 'POST') {
                json_response(['ok' => true, 'data' => $store->createResource($name, request_json_body())], 201);
            }

            if ($method === 'PUT' && $id !== null) {
                json_response(['ok' => true, 'data' => $store->updateResource($name, $id, request_json_body())]);
            }

            if ($method === 'DELETE' && $id !== null) {
                $store->deleteResource($name, $id);
                json_response(['ok' => true, 'message' => 'Deleted successfully.']);
            }

            json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);

        case 'contact-submit':
            if ($method !== 'POST') {
                json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);
            }

            $payload = request_json_body();
            json_response([
                'ok' => true,
                'data' => $store->saveContactMessage($payload),
                'message' => 'Your message has been sent successfully.',
            ], 201);

        case 'application-submit':
            if ($method !== 'POST') {
                json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);
            }

            json_response([
                'ok' => true,
                'data' => $store->saveApplication($_POST, $_FILES),
                'message' => 'Application submitted successfully.',
            ], 201);

        default:
            json_response(['ok' => false, 'message' => 'Unknown API action.'], 404);
    }
} catch (InvalidArgumentException $exception) {
    json_response(['ok' => false, 'message' => $exception->getMessage()], 422);
} catch (RuntimeException $exception) {
    json_response(['ok' => false, 'message' => $exception->getMessage()], 500);
} catch (Throwable $exception) {
    json_response(['ok' => false, 'message' => 'Unexpected server error.', 'details' => $exception->getMessage()], 500);
}

function ensure_admin(DataStore $store): void
{
    if ($store->getAuthenticatedAdmin() === null) {
        json_response(['ok' => false, 'message' => 'Please sign in to continue.'], 401);
    }
}
