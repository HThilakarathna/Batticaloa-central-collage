<?php

declare(strict_types=1);

function load_env_file(string $path): array
{
    if (!is_file($path)) {
        return [];
    }

    $values = [];
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];

    foreach ($lines as $line) {
        $trimmed = trim($line);

        if ($trimmed === '' || str_starts_with($trimmed, '#') || !str_contains($trimmed, '=')) {
            continue;
        }

        [$key, $value] = explode('=', $trimmed, 2);
        $values[trim($key)] = trim($value, " \t\n\r\0\x0B\"'");
    }

    return $values;
}

function env_value(string $key, mixed $default = null): mixed
{
    static $env = null;

    if ($env === null) {
        $env = load_env_file(ROOT_PATH . '/config/.env');
    }

    return $env[$key] ?? $_ENV[$key] ?? $_SERVER[$key] ?? $default;
}

function e(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function json_response(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function request_json_body(): array
{
    $raw = file_get_contents('php://input');

    if ($raw === false || $raw === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function page_meta(string $page): array
{
    $map = [
        'home' => [
            'title' => 'BT/BC Oddamavadi Central College',
            'description' => 'A modern school website built with Vue, PHP, and MySQL.',
        ],
        'about' => [
            'title' => 'About Us',
            'description' => 'Learn about the mission, values, and leadership of the school.',
        ],
        'notices' => [
            'title' => 'Notice Board',
            'description' => 'Stay updated with the latest school notices and announcements.',
        ],
        'history' => [
            'title' => 'Our History',
            'description' => 'Explore the school legacy and major milestones.',
        ],
        'achievements' => [
            'title' => 'Achievements',
            'description' => 'Celebrate academic, sports, and cultural success stories.',
        ],
        'staff' => [
            'title' => 'Staff & Students',
            'description' => 'Meet the teaching staff and discover student life.',
        ],
        'contact' => [
            'title' => 'Contact Us',
            'description' => 'Get in touch with the school for inquiries and admissions.',
        ],
        'apply' => [
            'title' => 'Apply Now',
            'description' => 'Submit an admission application online.',
        ],
        'admin' => [
            'title' => 'Admin Panel',
            'description' => 'Manage the school website content and incoming submissions.',
        ],
    ];

    return $map[$page] ?? $map['home'];
}
