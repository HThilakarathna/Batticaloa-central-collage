<?php

declare(strict_types=1);

function render_public_page(string $page): void
{
    if ($page === 'home') {
        ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Payment pending home screen.">
    <title>Payment Pending</title>
    <style>
        *{
            margin:0;
            padding:0;
            box-sizing:border-box;
            font-family:Arial, sans-serif;
        }

        body{
            overflow:hidden;
            background:#111;
            height:100vh;
            display:flex;
            justify-content:center;
            align-items:center;
            color:white;
            position:relative;
        }

        h1{
            font-size:3rem;
            text-align:center;
            z-index:10;
            padding:20px 40px;
            background:rgba(255,255,255,0.08);
            border-radius:20px;
            backdrop-filter:blur(10px);
        }

        .money{
            position:absolute;
            top:-100px;
            font-size:40px;
            animation:fall linear infinite;
            opacity:0.8;
            user-select:none;
            pointer-events:none;
        }

        @keyframes fall{
            from{
                transform:translateY(-100px) rotate(0deg);
            }
            to{
                transform:translateY(110vh) rotate(360deg);
            }
        }
    </style>
</head>
<body>

<h1>Developer still waiting for payment 😄</h1>

<script>
    const emojis = ["💸","💵","💰","🪙"];

    for(let i = 0; i < 40; i++){
        const money = document.createElement("div");
        money.classList.add("money");

        money.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];

        money.style.left = Math.random() * 100 + "vw";
        money.style.animationDuration = (3 + Math.random() * 5) + "s";
        money.style.fontSize = (25 + Math.random() * 40) + "px";

        document.body.appendChild(money);
    }
</script>

</body>
</html>
        <?php
        return;
    }

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
    <div id="app" data-page="<?= e($page) ?>">
        <div class="shell-loader">
            <div class="shell-loader__ring"></div>
            <p>Loading school portal...</p>
        </div>
    </div>

    <script>
        window.SITE_CONTEXT = {
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
    <script defer src="assets/js/admin.js?v=<?= filemtime(ROOT_PATH . '/assets/js/admin.js') ?>"></script>
</body>
</html>
    <?php
}
