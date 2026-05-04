<?php

declare(strict_types=1);

final class DataStore
{
    private ?PDO $pdo = null;
    private bool $dbConfigured = false;
    private string $dbMessage = 'MySQL is not configured yet.';

    private array $resourceMap = [
        'notices' => [
            'table' => 'notices',
            'order' => 'is_published DESC, sort_order ASC, notice_date DESC, id DESC',
            'fields' => ['type', 'title', 'content', 'notice_date', 'notice_time', 'link_url', 'is_published', 'sort_order'],
            'bool' => ['is_published'],
            'ints' => ['sort_order'],
        ],
        'programs' => [
            'table' => 'programs',
            'order' => 'sort_order ASC, id ASC',
            'fields' => ['icon', 'title', 'subtitle', 'description', 'sort_order'],
            'ints' => ['sort_order'],
        ],
        'achievements' => [
            'table' => 'achievements',
            'order' => 'sort_order ASC, id ASC',
            'fields' => ['icon', 'year_label', 'title', 'category', 'description', 'overview', 'key_achievements', 'outstanding_students', 'featured', 'sort_order'],
            'json' => ['key_achievements', 'outstanding_students'],
            'bool' => ['featured'],
            'ints' => ['sort_order'],
        ],
        'history_events' => [
            'table' => 'history_events',
            'order' => 'sort_order ASC, id ASC',
            'fields' => ['period_label', 'title', 'description', 'icon', 'sort_order'],
            'ints' => ['sort_order'],
        ],
        'staff_members' => [
            'table' => 'staff_members',
            'order' => 'sort_order ASC, id ASC',
            'fields' => ['name', 'role', 'subject', 'experience', 'emoji', 'group_name', 'sort_order'],
            'ints' => ['sort_order'],
        ],
    ];

    public function __construct()
    {
        $host = (string) env_value('DB_HOST', '');
        $port = (string) env_value('DB_PORT', '3306');
        $name = (string) env_value('DB_NAME', '');
        $user = (string) env_value('DB_USER', '');
        $pass = (string) env_value('DB_PASS', '');

        $this->dbConfigured = $host !== '' && $name !== '' && $user !== '';

        if (!$this->dbConfigured) {
            return;
        }

        try {
            $this->pdo = new PDO(
                "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4",
                $user,
                $pass,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]
            );

            $check = $this->pdo->query("SHOW TABLES LIKE 'site_settings'")->fetchColumn();

            if ($check === false) {
                $this->pdo = null;
                $this->dbMessage = 'MySQL is reachable, but the schema has not been imported yet.';
                return;
            }

            $this->dbMessage = 'MySQL connected successfully.';
            $this->ensureSeeded();
            $this->purgeLegacySeedData();
        } catch (Throwable $exception) {
            $this->pdo = null;
            $this->dbMessage = 'MySQL connection failed: ' . $exception->getMessage();
        }
    }

    public function databaseStatus(): array
    {
        return [
            'configured' => $this->dbConfigured,
            'connected' => $this->pdo instanceof PDO,
            'message' => $this->dbMessage,
        ];
    }

    public function adminAvailable(): bool
    {
        return $this->pdo instanceof PDO;
    }

    public function getAuthenticatedAdmin(): ?array
    {
        if (!$this->adminAvailable() || empty($_SESSION['admin_id'])) {
            return null;
        }

        $statement = $this->pdo->prepare('SELECT id, name, email FROM admins WHERE id = :id LIMIT 1');
        $statement->execute(['id' => (int) $_SESSION['admin_id']]);
        $admin = $statement->fetch();

        return $admin ?: null;
    }

    public function authenticate(string $email, string $password): ?array
    {
        if (!$this->adminAvailable()) {
            return null;
        }

        $statement = $this->pdo->prepare('SELECT id, name, email, password_hash FROM admins WHERE email = :email LIMIT 1');
        $statement->execute(['email' => $email]);
        $admin = $statement->fetch();

        if (!$admin || !password_verify($password, (string) $admin['password_hash'])) {
            return null;
        }

        $_SESSION['admin_id'] = (int) $admin['id'];

        return [
            'id' => (int) $admin['id'],
            'name' => $admin['name'],
            'email' => $admin['email'],
        ];
    }

    public function logout(): void
    {
        unset($_SESSION['admin_id']);
    }

    public function dashboard(): array
    {
        if (!$this->adminAvailable()) {
            return [
                'message' => 'MySQL is not configured yet. Connect the database to manage content.',
                'stats' => [
                    ['label' => 'Notices', 'value' => 0, 'section' => 'notices'],
                    ['label' => 'Programs', 'value' => 0, 'section' => 'programs'],
                    ['label' => 'Achievements', 'value' => 0, 'section' => 'achievements'],
                    ['label' => 'Staff Members', 'value' => 0, 'section' => 'staff_members'],
                ],
            ];
        }

        $counts = [];
        foreach (['notices', 'programs', 'achievements', 'history_events', 'staff_members', 'contact_messages', 'applications'] as $table) {
            $counts[$table] = (int) $this->pdo->query("SELECT COUNT(*) FROM {$table}")->fetchColumn();
        }

        return [
            'message' => 'Everything is connected. You can manage content from the panels below.',
            'stats' => [
                ['label' => 'Notices', 'value' => $counts['notices'], 'section' => 'notices'],
                ['label' => 'Programs', 'value' => $counts['programs'], 'section' => 'programs'],
                ['label' => 'Achievements', 'value' => $counts['achievements'], 'section' => 'achievements'],
                ['label' => 'Timeline Events', 'value' => $counts['history_events'], 'section' => 'history_events'],
                ['label' => 'Staff Members', 'value' => $counts['staff_members'], 'section' => 'staff_members'],
                ['label' => 'Messages', 'value' => $counts['contact_messages'], 'section' => 'contact_messages'],
                ['label' => 'Applications', 'value' => $counts['applications'], 'section' => 'applications'],
            ],
        ];
    }

    public function getSitePayload(string $page): array
    {
        $pageSettings = $this->getSetting($page);
        $siteSettings = $this->getSetting('site');

        $collections = match ($page) {
            'home' => [
                'notices' => array_slice($this->listResource('notices', true), 0, 3),
                'programs' => $this->listResource('programs'),
                'achievements' => array_slice(array_values(array_filter(
                    $this->listResource('achievements'),
                    fn(array $achievement): bool => !empty($achievement['featured'])
                )), 0, 4),
            ],
            'notices' => [
                'notices' => $this->listResource('notices', true),
            ],
            'history' => [
                'history_events' => $this->listResource('history_events'),
            ],
            'achievements' => [
                'achievements' => $this->listResource('achievements'),
            ],
            'staff' => [
                'staff_members' => $this->listResource('staff_members'),
            ],
            default => [],
        };

        return [
            'site' => $siteSettings,
            'page' => $pageSettings,
            'collections' => $collections,
            'database' => $this->databaseStatus(),
        ];
    }

    public function getSetting(string $key): array
    {
        if (!$this->adminAvailable()) {
            return [];
        }

        $statement = $this->pdo->prepare('SELECT setting_value FROM site_settings WHERE setting_key = :key LIMIT 1');
        $statement->execute(['key' => $key]);
        $raw = $statement->fetchColumn();

        if ($raw === false) {
            return [];
        }

        $decoded = json_decode((string) $raw, true);
        return is_array($decoded) ? $decoded : [];
    }

    public function saveSetting(string $key, array $value): array
    {
        $this->requireDatabase();

        $statement = $this->pdo->prepare(
            'INSERT INTO site_settings (setting_key, setting_value, updated_at)
             VALUES (:key, :value, NOW())
             ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()'
        );

        $statement->execute([
            'key' => $key,
            'value' => json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);

        return $this->getSetting($key);
    }

    public function listResource(string $resource, bool $publicOnly = false): array
    {
        if (!isset($this->resourceMap[$resource])) {
            if ($resource === 'contact_messages') {
                return $this->adminAvailable() ? $this->fetchRows('SELECT * FROM contact_messages ORDER BY created_at DESC') : [];
            }

            if ($resource === 'applications') {
                $rows = $this->adminAvailable() ? $this->fetchRows('SELECT * FROM applications ORDER BY created_at DESC') : [];

                foreach ($rows as &$row) {
                    $row['application_data'] = json_decode((string) $row['application_data'], true) ?: [];
                    $row['documents'] = json_decode((string) $row['documents'], true) ?: [];
                }

                return $rows;
            }

            throw new InvalidArgumentException('Unknown resource.');
        }

        if (!$this->adminAvailable()) {
            return [];
        }

        $config = $this->resourceMap[$resource];
        $sql = "SELECT * FROM {$config['table']}";

        if ($publicOnly && $resource === 'notices') {
            $sql .= ' WHERE is_published = 1';
        }

        $sql .= " ORDER BY {$config['order']}";
        return $this->transformRows($this->fetchRows($sql), $config);
    }

    public function createResource(string $resource, array $payload): array
    {
        $this->requireDatabase();
        $config = $this->resourceConfig($resource);
        $record = $this->prepareRecord($payload, $config);

        $fields = array_keys($record);
        $columns = implode(', ', $fields);
        $placeholders = implode(', ', array_map(fn(string $field): string => ':' . $field, $fields));

        $statement = $this->pdo->prepare(
            "INSERT INTO {$config['table']} ({$columns}, created_at, updated_at) VALUES ({$placeholders}, NOW(), NOW())"
        );
        $statement->execute($record);

        $id = (int) $this->pdo->lastInsertId();
        return $this->findResource($resource, $id);
    }

    public function updateResource(string $resource, int $id, array $payload): array
    {
        $this->requireDatabase();
        $config = $this->resourceConfig($resource);
        $record = $this->prepareRecord($payload, $config);

        $assignments = implode(', ', array_map(fn(string $field): string => "{$field} = :{$field}", array_keys($record)));
        $record['id'] = $id;

        $statement = $this->pdo->prepare(
            "UPDATE {$config['table']} SET {$assignments}, updated_at = NOW() WHERE id = :id"
        );
        $statement->execute($record);

        if ($statement->rowCount() === 0) {
            throw new RuntimeException('Record not found or no changes made.');
        }

        return $this->findResource($resource, $id);
    }

    public function deleteResource(string $resource, int $id): void
    {
        $this->requireDatabase();
        $config = $this->resourceConfig($resource);
        $statement = $this->pdo->prepare("DELETE FROM {$config['table']} WHERE id = :id");
        $statement->execute(['id' => $id]);
    }

    public function saveContactMessage(array $payload): array
    {
        $required = ['full_name', 'email', 'subject', 'message'];

        foreach ($required as $field) {
            if (trim((string) ($payload[$field] ?? '')) === '') {
                throw new InvalidArgumentException('Please fill in all required contact form fields.');
            }
        }

        $email = trim((string) $payload['email']);
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('Please provide a valid email address.');
        }

        $this->requireDatabase();

        $statement = $this->pdo->prepare(
            'INSERT INTO contact_messages (full_name, email, phone, subject, message, status, created_at, updated_at)
             VALUES (:full_name, :email, :phone, :subject, :message, :status, NOW(), NOW())'
        );

        $record = [
            'full_name' => trim((string) $payload['full_name']),
            'email' => $email,
            'phone' => trim((string) ($payload['phone'] ?? '')),
            'subject' => trim((string) $payload['subject']),
            'message' => trim((string) $payload['message']),
            'status' => 'new',
        ];

        $statement->execute($record);
        return $record;
    }

    public function saveApplication(array $post, array $files): array
    {
        $this->requireDatabase();

        $studentName = trim((string) ($post['student_name'] ?? ''));
        $gradeApplying = trim((string) ($post['grade_applying'] ?? ''));
        $parentPhone = trim((string) ($post['parent_phone'] ?? ''));

        if ($studentName === '' || $gradeApplying === '' || $parentPhone === '') {
            throw new InvalidArgumentException('Student name, grade, and parent phone are required.');
        }

        $uploadedDocuments = $this->handleUploads($files);

        $statement = $this->pdo->prepare(
            'INSERT INTO applications (student_name, grade_applying, parent_phone, status, application_data, documents, created_at, updated_at)
             VALUES (:student_name, :grade_applying, :parent_phone, :status, :application_data, :documents, NOW(), NOW())'
        );

        $record = [
            'student_name' => $studentName,
            'grade_applying' => $gradeApplying,
            'parent_phone' => $parentPhone,
            'status' => 'pending',
            'application_data' => json_encode($post, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'documents' => json_encode($uploadedDocuments, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ];

        $statement->execute($record);
        return [
            'student_name' => $studentName,
            'grade_applying' => $gradeApplying,
        ];
    }

    private function handleUploads(array $files): array
    {
        $saved = [];
        $basePath = ROOT_PATH . '/storage/uploads/applications/' . date('Y/m');

        if (!is_dir($basePath) && !mkdir($basePath, 0777, true) && !is_dir($basePath)) {
            throw new RuntimeException('Unable to prepare the upload directory.');
        }

        $allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
        $maxBytes = 5 * 1024 * 1024;

        foreach ($files as $field => $file) {
            if (!is_array($file) || ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
                continue;
            }

            if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
                throw new RuntimeException('One of the uploaded documents could not be processed.');
            }

            if (($file['size'] ?? 0) > $maxBytes) {
                throw new RuntimeException('Each uploaded document must be 5MB or smaller.');
            }

            $extension = strtolower(pathinfo((string) $file['name'], PATHINFO_EXTENSION));
            if (!in_array($extension, $allowedExtensions, true)) {
                throw new RuntimeException('Only PDF, JPG, JPEG, and PNG files are allowed.');
            }

            $filename = $field . '_' . bin2hex(random_bytes(6)) . '.' . $extension;
            $target = $basePath . '/' . $filename;

            if (!move_uploaded_file((string) $file['tmp_name'], $target)) {
                throw new RuntimeException('Failed to save an uploaded document.');
            }

            $saved[] = [
                'field' => $field,
                'original_name' => (string) $file['name'],
                'stored_name' => $filename,
                'relative_path' => str_replace(ROOT_PATH . '/', '', $target),
            ];
        }

        return $saved;
    }

    private function findResource(string $resource, int $id): array
    {
        $config = $this->resourceConfig($resource);
        $statement = $this->pdo->prepare("SELECT * FROM {$config['table']} WHERE id = :id LIMIT 1");
        $statement->execute(['id' => $id]);
        $row = $statement->fetch();

        if (!$row) {
            throw new RuntimeException('Record not found.');
        }

        return $this->transformRows([$row], $config)[0];
    }

    private function fetchRows(string $sql): array
    {
        return $this->pdo?->query($sql)->fetchAll() ?: [];
    }

    private function resourceConfig(string $resource): array
    {
        if (!isset($this->resourceMap[$resource])) {
            throw new InvalidArgumentException('Unknown resource.');
        }

        return $this->resourceMap[$resource];
    }

    private function prepareRecord(array $payload, array $config): array
    {
        $record = [];

        foreach ($config['fields'] as $field) {
            $value = $payload[$field] ?? null;

            if (in_array($field, $config['json'] ?? [], true)) {
                $value = json_encode(is_array($value) ? $value : [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            } elseif (in_array($field, $config['bool'] ?? [], true)) {
                $value = !empty($value) ? 1 : 0;
            } elseif (in_array($field, $config['ints'] ?? [], true)) {
                $value = (int) $value;
            } else {
                $value = trim((string) $value);
            }

            $record[$field] = $value;
        }

        return $record;
    }

    private function transformRows(array $rows, array $config): array
    {
        foreach ($rows as &$row) {
            foreach ($config['json'] ?? [] as $field) {
                $row[$field] = json_decode((string) ($row[$field] ?? '[]'), true) ?: [];
            }

            foreach ($config['bool'] ?? [] as $field) {
                $row[$field] = (bool) ($row[$field] ?? false);
            }

            foreach ($config['ints'] ?? [] as $field) {
                $row[$field] = (int) ($row[$field] ?? 0);
            }
        }

        return $rows;
    }

    private function ensureSeeded(): void
    {
        if (!$this->adminAvailable()) {
            return;
        }

        $adminsCount = (int) $this->pdo->query('SELECT COUNT(*) FROM admins')->fetchColumn();

        if ($adminsCount === 0) {
            $statement = $this->pdo->prepare(
                'INSERT INTO admins (name, email, password_hash, created_at, updated_at)
                 VALUES (:name, :email, :password_hash, NOW(), NOW())'
            );
            $statement->execute([
                'name' => 'Site Administrator',
                'email' => 'admin@oddamavadi.lk',
                'password_hash' => '$2y$10$tHfTJjgylLiEfGUEI1QV4eMpcrcxRr7dJ4xDnPzJVoRgjfLdeUT96',
            ]);
        }
    }

    private function purgeLegacySeedData(): void
    {
        if (!$this->adminAvailable()) {
            return;
        }

        $legacyTitles = [
            'notices' => [
                '2026 Advanced Level Examination Schedule Released',
                'Annual Sports Meet Registration Open',
                'Parent-Teacher Meeting for First Term',
                'Science Exhibition Project Proposals Open',
                'School Fee Payment Deadline Extended',
            ],
            'programs' => [
                'Junior Secondary',
                'Ordinary Level',
                'Advanced Level Streams',
            ],
            'achievements' => [
                'District Athletics Champions',
                '95% A/L Pass Rate',
                'Best Performing School Award',
                'National Cultural Festival Excellence',
                'Science Olympiad Provincial Champions',
                'Provincial Cricket Winners',
            ],
            'history_events' => [
                'Foundation',
                'Early Growth',
                'Modern Development',
                'National School Status',
                'New School Building',
                'Computer Education',
                'STEM Excellence Center',
                '109 Years Anniversary',
            ],
            'staff_members' => [
                'Mr. A. Rahman',
                'Mrs. S. Thivya',
                'Mr. K. Kumar',
                'Mrs. F. Nazira',
                'Mr. R. Selvam',
                'Mrs. M. Fathima',
                'Mr. S. Shankar',
                'Mrs. L. Priya',
                'Mr. A. Farook',
            ],
        ];

        $tableColumns = [
            'notices' => 'title',
            'programs' => 'title',
            'achievements' => 'title',
            'history_events' => 'title',
            'staff_members' => 'name',
        ];

        foreach ($legacyTitles as $table => $titles) {
            if ($titles === []) {
                continue;
            }

            $placeholders = implode(', ', array_fill(0, count($titles), '?'));
            $column = $tableColumns[$table] ?? 'title';
            $statement = $this->pdo->prepare("DELETE FROM {$table} WHERE {$column} IN ({$placeholders})");
            $statement->execute(array_values($titles));
        }
    }

    private function requireDatabase(): void
    {
        if (!$this->adminAvailable()) {
            throw new RuntimeException('MySQL is required for this action. Import the schema and configure .env first.');
        }
    }

}
