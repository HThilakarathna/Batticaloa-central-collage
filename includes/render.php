<?php

declare(strict_types=1);

function render_public_page(string $page): void
{
    $meta = page_meta($page);
    $title = $page === 'home'
        ? $meta['title']
        : $meta['title'] . ' | BT/BC Oddamavadi Central College';
    ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="<?= e($meta['description']) ?>">
    <title><?= e($title) ?></title>
    <!-- DNS prefetch for critical CDNs -->
    <link rel="dns-prefetch" href="https://fonts.googleapis.com">
    <link rel="dns-prefetch" href="https://fonts.gstatic.com">
    <link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    
    <!-- Critical CSS -->
    <link rel="preload" href="assets/css/app.css" as="style">
    <link rel="preload" href="assets/css/responsive-enhancements.css" as="style">
    
    <!-- Stylesheets -->
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="assets/css/app.css">
    <link rel="stylesheet" href="assets/css/responsive-enhancements.css">
</head>
<body>
    <div id="app" data-page="<?= e($page) ?>"
            page: <?= json_encode($page, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>,
            apiUrl: 'api/index.php'
        };
    </script>
    <!-- Defer external scripts for better performance -->
    <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script type="module" src="assets/js/site.js"></script>
</body>
</html>
    <?php
}

function render_admin_page(): void
{
    $meta = page_meta('admin');
    ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="<?= e($meta['description']) ?>">
    <title><?= e($meta['title']) ?> | BT/BC Oddamavadi Central College</title>
    <!-- DNS prefetch for critical CDNs -->
    <link rel="dns-prefetch" href="https://fonts.googleapis.com">
    <link rel="dns-prefetch" href="https://fonts.gstatic.com">
    <link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    
    <!-- Critical CSS -->
    <link rel="preload" href="assets/css/app.css" as="style">
    <link rel="preload" href="assets/css/responsive-enhancements.css" as="style">
    
    <!-- Stylesheets -->
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="assets/css/app.css">
    <link rel="stylesheet" href="assets/css/responsive-enhancements.css">
</head>
<body class="admin-body">
    <div id="admin-app">
        <div class="shell-loader">
            <div class="shell-loader__ring"></div>
            <p>Loading admin panel...</p>
        </div>
    </div>

    <script>
        window.ADMIN_CONTEXT = {
            apiUrl: 'api/index.php'
        };
    </script>
    <!-- Defer external scripts for better performance -->
    <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script defer src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
    <script defer src="assets/js/admin.js"></script>
</body>
</html>
    <?php
}
