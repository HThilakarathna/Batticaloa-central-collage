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
            'order' => 'notice_date DESC, id DESC',
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
                'message' => 'The public site will use seeded content until MySQL is configured.',
                'stats' => [
                    ['label' => 'Notices', 'value' => count($this->fallbackResources()['notices'])],
                    ['label' => 'Programs', 'value' => count($this->fallbackResources()['programs'])],
                    ['label' => 'Achievements', 'value' => count($this->fallbackResources()['achievements'])],
                    ['label' => 'Staff Members', 'value' => count($this->fallbackResources()['staff_members'])],
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
                ['label' => 'Notices', 'value' => $counts['notices']],
                ['label' => 'Programs', 'value' => $counts['programs']],
                ['label' => 'Achievements', 'value' => $counts['achievements']],
                ['label' => 'Timeline Events', 'value' => $counts['history_events']],
                ['label' => 'Staff Members', 'value' => $counts['staff_members']],
                ['label' => 'Messages', 'value' => $counts['contact_messages']],
                ['label' => 'Applications', 'value' => $counts['applications']],
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
            $settings = $this->fallbackSettings();
            return $settings[$key] ?? [];
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
            $resources = $this->fallbackResources();
            return $resources[$resource] ?? [];
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

        $settingsCount = (int) $this->pdo->query('SELECT COUNT(*) FROM site_settings')->fetchColumn();
        $adminsCount = (int) $this->pdo->query('SELECT COUNT(*) FROM admins')->fetchColumn();

        if ($adminsCount === 0) {
            $statement = $this->pdo->prepare(
                'INSERT INTO admins (name, email, password_hash, created_at, updated_at)
                 VALUES (:name, :email, :password_hash, NOW(), NOW())'
            );
            $statement->execute([
                'name' => 'Site Administrator',
                'email' => 'admin@btcentralcollege.local',
                'password_hash' => '$2y$10$BZEgqhaqCjJ2kN4w5N3AoOEGzlb./jK9Hd8X1rQGSHjfPlbdGsMpm',
            ]);
        }

        if ($settingsCount > 0) {
            return;
        }

        foreach ($this->fallbackSettings() as $key => $value) {
            $this->saveSetting($key, $value);
        }

        foreach ($this->fallbackResources() as $resource => $records) {
            foreach ($records as $record) {
                $this->createResource($resource, $record);
            }
        }
    }

    private function requireDatabase(): void
    {
        if (!$this->adminAvailable()) {
            throw new RuntimeException('MySQL is required for this action. Import the schema and configure .env first.');
        }
    }

    private function fallbackSettings(): array
    {
        return [
            'site' => [
                'name' => 'BT/BC Oddamavadi Central College',
                'tagline' => 'National School',
                'badge' => 'A Century of Educational Excellence',
                'address' => 'Colombo Road, Oddamavadi, Batticaloa, Sri Lanka',
                'postal_code' => '30420',
                'phone' => '(+94) 0652257243',
                'email' => 'info@occ.edu.lk',
                'secondary_email' => 'principal@occ.edu.lk',
                'map_link' => 'https://www.google.com/maps?q=Oddamavadi+Central+College,+Colombo+Road,+Oddamavadi,+Batticaloa,+Sri+Lanka',
                'working_hours' => [
                    'Monday - Thursday: 7:30 AM - 2:00 PM',
                    'Friday: 7:30 AM - 11:30 AM',
                ],
                'social_links' => [
                    ['label' => 'Facebook', 'url' => 'https://www.facebook.com'],
                    ['label' => 'Instagram', 'url' => 'https://www.instagram.com'],
                    ['label' => 'YouTube', 'url' => 'https://www.youtube.com'],
                ],
                'footer_note' => 'BT/BC Oddamavadi Central College — A National School committed to academic excellence, character, and community leadership.',
                'footer_credit' => 'Serving the Oddamavadi community since 1917.',
            ],
            'home' => [
                'hero_title' => 'Empowering Education for the Future',
                'hero_text' => 'A modern, student-centered national school experience grounded in tradition, achievement, and community leadership.',
                'hero_badge' => 'Welcome to Excellence',
                'welcome_title' => 'A School Built on Legacy and Progress',
                'welcome_paragraphs' => [
                    'BT/BC Oddamavadi Central College has served generations of learners with a strong commitment to academic success, discipline, and opportunity.',
                    'Today, the school continues that legacy with a modern learning environment, broad extracurricular exposure, and a clear admissions journey for new families.',
                ],
                'welcome_stats' => [
                    ['value' => '2,500+', 'label' => 'Students'],
                    ['value' => '150+', 'label' => 'Teachers'],
                    ['value' => '500+', 'label' => 'Awards'],
                    ['value' => '109+', 'label' => 'Years'],
                ],
                'admission_title' => 'Admissions Open for 2026',
                'admission_text' => 'Apply online, upload documents, and let our admissions team review your request quickly.',
            ],
            'about' => [
                'hero_title' => 'About Us',
                'hero_text' => 'Discover our story, purpose, and the people guiding our students forward.',
                'welcome_title' => 'Welcome to BT/BC Oddamavadi Central College',
                'welcome_paragraphs' => [
                    'BT/BC Oddamavadi Central College stands as one of the most respected educational institutions in the region, with a history rooted in service and academic ambition.',
                    'Our school nurtures intellectual curiosity, moral strength, and practical readiness so students can thrive in school and beyond.',
                    'We believe in balancing examination performance, character formation, community values, and leadership development.',
                ],
                'mission' => [
                    'title' => 'Our Mission',
                    'text' => 'To provide high-quality education that nurtures knowledge, confidence, integrity, and social responsibility in every learner.',
                ],
                'vision' => [
                    'title' => 'Our Vision',
                    'text' => 'To be a leading school in Sri Lanka known for excellence, innovation, and meaningful service to society.',
                ],
                'messages' => [
                    [
                        'title' => "Principal's Message",
                        'name' => 'Mr. Haleem',
                        'role' => 'Principal',
                        'text' => 'We remain committed to providing a safe, ambitious, and inspiring environment where each student can discover their strengths and grow with confidence.',
                    ],
                    [
                        'title' => 'Vice Principal',
                        'name' => 'Mr. Azmy',
                        'role' => 'Deputy Principal',
                        'text' => 'Our work focuses on discipline, academic consistency, and the kind of support system that helps children and families feel part of one school community.',
                    ],
                ],
                'core_values' => [
                    ['title' => 'Excellence', 'text' => 'Pursuing high standards in learning, leadership, and service.'],
                    ['title' => 'Integrity', 'text' => 'Acting with honesty, fairness, and accountability.'],
                    ['title' => 'Innovation', 'text' => 'Welcoming modern ideas, methods, and technologies.'],
                    ['title' => 'Respect', 'text' => 'Valuing every student, parent, teacher, and community member.'],
                ],
            ],
            'notices' => [
                'hero_title' => 'Notice Board',
                'hero_text' => 'Stay informed with school announcements, events, and important academic updates.',
            ],
            'history' => [
                'hero_title' => 'Our History',
                'hero_text' => '109 years of educational excellence, progress, and service.',
                'intro_title' => 'A Historic Landmark of Learning',
                'intro_paragraphs' => [
                    'Founded in 1917, BT/BC Oddamavadi Central College has grown from a local institution into a respected national school.',
                    'Across generations, the school has remained a powerful educational pillar for the wider Oddamavadi community.',
                ],
                'intro_cards' => [
                    ['title' => 'Academic Excellence', 'text' => 'Strong pathways from secondary education to advanced level success.'],
                    ['title' => 'Community Pillar', 'text' => 'A trusted institution shaping the social and educational life of the area.'],
                    ['title' => 'Generational Legacy', 'text' => 'Families across generations continue to call this school their own.'],
                ],
                'community_title' => 'Role in the Community',
                'community_paragraphs' => [
                    'The school contributes far beyond classroom teaching through sports meets, cultural programs, awareness campaigns, and youth development activities.',
                    'Its alumni network includes teachers, professionals, officers, and community leaders who continue to serve society with distinction.',
                ],
            ],
            'achievements' => [
                'hero_title' => 'Our Achievements',
                'hero_text' => 'Celebrating excellence in academics, sports, arts, and school leadership.',
                'recognitions' => [
                    ['title' => 'Presidential Award for Excellence', 'text' => 'Recognition for outstanding contribution to education.', 'theme' => 'gold'],
                    ['title' => 'Best National School - Eastern Province', 'text' => 'Awarded for school-wide educational performance.', 'theme' => 'blue'],
                    ['title' => 'Environmental Excellence Award', 'text' => 'Honoured for green campus and sustainability programs.', 'theme' => 'green'],
                    ['title' => 'Community Service Excellence', 'text' => 'Recognised for impact beyond the classroom.', 'theme' => 'purple'],
                ],
                'stats' => [
                    ['value' => '500+', 'label' => 'Total Awards'],
                    ['value' => '95%', 'label' => 'Success Rate'],
                    ['value' => '50+', 'label' => 'Championships'],
                    ['value' => '200+', 'label' => 'Gold Medals'],
                ],
            ],
            'staff' => [
                'hero_title' => 'Staff & Students',
                'hero_text' => 'Dedicated educators and ambitious learners growing together.',
                'staff_intro' => 'Our experienced teaching team supports academic performance, mentorship, discipline, and student wellbeing across every grade level.',
                'student_life_intro' => 'School life is built around leadership, teamwork, creativity, and academic enrichment.',
                'student_life_items' => [
                    ['title' => 'Student Council', 'text' => 'Leadership opportunities for student voice and school events.'],
                    ['title' => 'Academic Clubs', 'text' => 'Science, mathematics, literary, and innovation clubs for deeper learning.'],
                    ['title' => 'Sports Teams', 'text' => 'Athletics, cricket, football, volleyball, and more at district level and beyond.'],
                    ['title' => 'Cultural Activities', 'text' => 'Drama, music, dance, and arts programs that celebrate talent and identity.'],
                ],
                'featured_students' => [
                    ['name' => 'Aisha Mohamed', 'stream' => 'Bio-Science', 'achievement' => 'Island 3rd - A/L Examination 2025'],
                    ['name' => 'Rajesh Kumar', 'stream' => 'General Studies', 'achievement' => 'District 1st - O/L Examination 2025'],
                    ['name' => 'Tharshika Selvam', 'stream' => 'Sports', 'achievement' => 'Provincial Athletics Champion'],
                    ['name' => 'Fahad Rizwan', 'stream' => 'Physical Science', 'achievement' => 'National Science Olympiad Gold Medal'],
                ],
                'student_body_stats' => [
                    ['value' => '2,500+', 'label' => 'Total Students'],
                    ['value' => '150+', 'label' => 'Teaching Staff'],
                    ['value' => '45', 'label' => 'Classes'],
                    ['value' => '25+', 'label' => 'Clubs & Societies'],
                ],
                'join_title' => 'Join Our Community',
                'join_text' => 'Whether you are a prospective family, an alumnus, or an educator, there is a place for you in our growing school community.',
            ],
            'contact' => [
                'hero_title' => 'Contact Us',
                'hero_text' => 'Reach our team for admissions, inquiries, parent communication, and school visits.',
                'admissions_title' => 'Admissions Office',
                'admissions_text' => 'For admission inquiries and application procedures, please contact our admissions office during working hours or submit your online application.',
                'map_title' => 'Find Us',
                'map_text' => 'Visit our campus located in the heart of Oddamavadi.',
                'legacy_title' => 'Our Legacy Continues',
                'legacy_text' => 'With thousands of alumni and a strong educational tradition, we continue to serve the region with pride and purpose.',
                'legacy_stats' => [
                    ['value' => '109+', 'label' => 'Years of Excellence'],
                    ['value' => '10,000+', 'label' => 'Alumni Worldwide'],
                    ['value' => '500+', 'label' => 'Awards & Recognitions'],
                ],
            ],
            'apply' => [
                'hero_title' => 'Admission Application',
                'hero_text' => 'Submit student details, upload supporting documents, and track the application from one guided flow.',
                'intro_text' => 'This admission form collects student, parent, health, academic, and document information for review by the school administration.',
            ],
        ];
    }

    private function fallbackResources(): array
    {
        return [
            'notices' => [
                [
                    'type' => 'Urgent',
                    'title' => '2026 Advanced Level Examination Schedule Released',
                    'content' => 'All A/L students are requested to review their final examination timetable and weekend revision class plan.',
                    'notice_date' => '2026-03-25',
                    'notice_time' => '10:00 AM',
                    'link_url' => '#',
                    'is_published' => true,
                    'sort_order' => 1,
                ],
                [
                    'type' => 'Event',
                    'title' => 'Annual Sports Meet Registration Open',
                    'content' => 'Students from Grades 6 to 13 are invited to register for track, field, and house events before the deadline.',
                    'notice_date' => '2026-03-20',
                    'notice_time' => '02:30 PM',
                    'link_url' => '#',
                    'is_published' => true,
                    'sort_order' => 2,
                ],
                [
                    'type' => 'Important',
                    'title' => 'Parent-Teacher Meeting for First Term',
                    'content' => 'Parents are invited to meet class teachers and discuss academic progress, attendance, and term plans.',
                    'notice_date' => '2026-03-15',
                    'notice_time' => '08:00 AM',
                    'link_url' => '#',
                    'is_published' => true,
                    'sort_order' => 3,
                ],
                [
                    'type' => 'News',
                    'title' => 'Science Exhibition Project Proposals Open',
                    'content' => 'Students can now submit concepts for the annual science exhibition and innovation showcase.',
                    'notice_date' => '2026-03-12',
                    'notice_time' => '11:00 AM',
                    'link_url' => '#',
                    'is_published' => true,
                    'sort_order' => 4,
                ],
                [
                    'type' => 'Academic',
                    'title' => 'School Fee Payment Deadline Extended',
                    'content' => 'The deadline for second term school fee payment has been extended for parent convenience.',
                    'notice_date' => '2026-03-05',
                    'notice_time' => '02:00 PM',
                    'link_url' => '#',
                    'is_published' => true,
                    'sort_order' => 5,
                ],
            ],
            'programs' => [
                [
                    'icon' => 'bi bi-book-half',
                    'title' => 'Junior Secondary',
                    'subtitle' => 'Grades 6 to 9',
                    'description' => 'A strong academic foundation with language, science, mathematics, and character development.',
                    'sort_order' => 1,
                ],
                [
                    'icon' => 'bi bi-mortarboard-fill',
                    'title' => 'Ordinary Level',
                    'subtitle' => 'Grades 10 and 11',
                    'description' => 'Focused preparation for O/L success with subject mastery and guided revision support.',
                    'sort_order' => 2,
                ],
                [
                    'icon' => 'bi bi-stars',
                    'title' => 'Advanced Level Streams',
                    'subtitle' => 'Grades 12 and 13',
                    'description' => 'Science, commerce, arts, and technology pathways designed for university and career readiness.',
                    'sort_order' => 3,
                ],
            ],
            'achievements' => [
                [
                    'icon' => 'bi bi-trophy-fill',
                    'year_label' => '2025',
                    'title' => 'District Athletics Champions',
                    'category' => 'Sports',
                    'description' => 'Won the district athletics championship with standout relay and field event performances.',
                    'overview' => 'Our athletics squad captured the district title for a third consecutive year through discipline, teamwork, and outstanding individual performances.',
                    'key_achievements' => ['15 gold medals', '100m district record', 'Relay first place', 'Team spirit award'],
                    'outstanding_students' => ['Mohamed Rishan', 'Aathif Ahmed', 'Fathima Nasrin'],
                    'featured' => true,
                    'sort_order' => 1,
                ],
                [
                    'icon' => 'bi bi-graph-up-arrow',
                    'year_label' => '2025',
                    'title' => '95% A/L Pass Rate',
                    'category' => 'Academic',
                    'description' => 'Outstanding Advanced Level results with a high university admission rate.',
                    'overview' => 'The 2025 Advanced Level cohort delivered one of the strongest performances in recent school history.',
                    'key_achievements' => ['95% pass rate', '28 university selections', 'Top district rankings'],
                    'outstanding_students' => ['Aisha Mohamed', 'Fahad Rizwan'],
                    'featured' => true,
                    'sort_order' => 2,
                ],
                [
                    'icon' => 'bi bi-award-fill',
                    'year_label' => '2025',
                    'title' => 'Best Performing School Award',
                    'category' => 'Academic',
                    'description' => 'Recognized for overall school performance and educational leadership.',
                    'overview' => 'The school was recognized provincially for its balanced results across teaching, student outcomes, and community impact.',
                    'key_achievements' => ['Provincial recognition', 'Strong overall academic profile'],
                    'outstanding_students' => [],
                    'featured' => true,
                    'sort_order' => 3,
                ],
                [
                    'icon' => 'bi bi-palette-fill',
                    'year_label' => '2025',
                    'title' => 'National Cultural Festival Excellence',
                    'category' => 'Culture',
                    'description' => 'Earned top honors in performing arts and school cultural presentation.',
                    'overview' => 'Students showcased dance, music, and drama with creativity and cultural pride.',
                    'key_achievements' => ['Best drama score', 'Traditional dance first place'],
                    'outstanding_students' => ['Tharshika Selvam'],
                    'featured' => true,
                    'sort_order' => 4,
                ],
                [
                    'icon' => 'bi bi-lightbulb-fill',
                    'year_label' => '2024',
                    'title' => 'Science Olympiad Provincial Champions',
                    'category' => 'Academic',
                    'description' => 'Gold medal performances in science competitions.',
                    'overview' => 'Students secured top provincial placements in physics and chemistry olympiads.',
                    'key_achievements' => ['Physics gold medal', 'Chemistry gold medal'],
                    'outstanding_students' => ['Fahad Rizwan'],
                    'featured' => false,
                    'sort_order' => 5,
                ],
                [
                    'icon' => 'bi bi-dribbble',
                    'year_label' => '2024',
                    'title' => 'Provincial Cricket Winners',
                    'category' => 'Sports',
                    'description' => 'Under-19 boys team lifted the provincial championship trophy.',
                    'overview' => 'The cricket team delivered a dominant tournament run with strong bowling and disciplined fielding.',
                    'key_achievements' => ['Under-19 winners', 'Best bowler of the tournament'],
                    'outstanding_students' => ['Rajesh Kumar'],
                    'featured' => false,
                    'sort_order' => 6,
                ],
            ],
            'history_events' => [
                ['period_label' => '1917', 'title' => 'Foundation', 'description' => 'The school was established to serve the educational needs of the local community.', 'icon' => 'bi bi-house-heart-fill', 'sort_order' => 1],
                ['period_label' => '1930s-40s', 'title' => 'Early Growth', 'description' => 'Facilities and curriculum expanded as the school strengthened its regional presence.', 'icon' => 'bi bi-book-fill', 'sort_order' => 2],
                ['period_label' => '1950s-60s', 'title' => 'Modern Development', 'description' => 'Science education and new teaching practices were introduced more broadly.', 'icon' => 'bi bi-flask-fill', 'sort_order' => 3],
                ['period_label' => '1970', 'title' => 'National School Status', 'description' => 'The school was elevated in recognition of its educational contribution.', 'icon' => 'bi bi-patch-check-fill', 'sort_order' => 4],
                ['period_label' => '1985', 'title' => 'New School Building', 'description' => 'A major facilities expansion supported a growing student population.', 'icon' => 'bi bi-building-fill', 'sort_order' => 5],
                ['period_label' => '1992', 'title' => 'Computer Education', 'description' => 'Technology education began to prepare students for the digital era.', 'icon' => 'bi bi-pc-display-horizontal', 'sort_order' => 6],
                ['period_label' => '2024', 'title' => 'STEM Excellence Center', 'description' => 'Advanced laboratories and STEM-focused infrastructure were introduced.', 'icon' => 'bi bi-rocket-takeoff-fill', 'sort_order' => 7],
                ['period_label' => '2026', 'title' => '109 Years Anniversary', 'description' => 'The school continues its legacy as a pillar of regional progress.', 'icon' => 'bi bi-stars', 'sort_order' => 8],
            ],
            'staff_members' => [
                ['name' => 'Mr. A. Rahman', 'role' => 'Principal', 'subject' => 'Administration', 'experience' => '25+ years', 'emoji' => 'bi bi-person-badge-fill', 'group_name' => 'Leadership', 'sort_order' => 1],
                ['name' => 'Mrs. S. Thivya', 'role' => 'Vice Principal', 'subject' => 'Mathematics', 'experience' => '20+ years', 'emoji' => 'bi bi-person-workspace', 'group_name' => 'Leadership', 'sort_order' => 2],
                ['name' => 'Mr. K. Kumar', 'role' => 'Senior Teacher', 'subject' => 'Physics', 'experience' => '18+ years', 'emoji' => 'bi bi-lightning-charge-fill', 'group_name' => 'Academic Staff', 'sort_order' => 3],
                ['name' => 'Mrs. F. Nazira', 'role' => 'Senior Teacher', 'subject' => 'Chemistry', 'experience' => '15+ years', 'emoji' => 'bi bi-droplet-half', 'group_name' => 'Academic Staff', 'sort_order' => 4],
                ['name' => 'Mr. R. Selvam', 'role' => 'Teacher', 'subject' => 'Biology', 'experience' => '12+ years', 'emoji' => 'bi bi-flower1', 'group_name' => 'Academic Staff', 'sort_order' => 5],
                ['name' => 'Mrs. M. Fathima', 'role' => 'Teacher', 'subject' => 'English Literature', 'experience' => '14+ years', 'emoji' => 'bi bi-journal-richtext', 'group_name' => 'Academic Staff', 'sort_order' => 6],
                ['name' => 'Mr. S. Shankar', 'role' => 'Teacher', 'subject' => 'History', 'experience' => '10+ years', 'emoji' => 'bi bi-hourglass-split', 'group_name' => 'Academic Staff', 'sort_order' => 7],
                ['name' => 'Mrs. L. Priya', 'role' => 'Teacher', 'subject' => 'Economics', 'experience' => '11+ years', 'emoji' => 'bi bi-cash-stack', 'group_name' => 'Academic Staff', 'sort_order' => 8],
                ['name' => 'Mr. A. Farook', 'role' => 'Teacher', 'subject' => 'Information Technology', 'experience' => '8+ years', 'emoji' => 'bi bi-code-slash', 'group_name' => 'Academic Staff', 'sort_order' => 9],
            ],
        ];
    }
}
