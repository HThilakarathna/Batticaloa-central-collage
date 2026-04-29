<?php
/**
 * Generate Password Hash for cPanel
 * Upload to public_html and visit: oddamavadicc.lankaflex.com/gen-hash.php
 * Then delete this file!
 */

echo "<h3>Password Hash Generator</h3>";
echo "<p>Password: <strong>admin123</strong></p>";

// Generate fresh hash
$hash = password_hash('admin123', PASSWORD_BCRYPT);
echo "<p>Hash: <code>" . $hash . "</code></p>";

echo "<hr>";
echo "<h4>SQL to run in phpMyAdmin:</h4>";
echo "<pre>UPDATE admins SET password_hash = '$hash', updated_at = NOW() WHERE email = 'admin@oddamavadi.lk';</pre>";

// Also show what hash is currently in the code
echo "<hr>";
echo "<h4>Current hash in DataStore.php:</h4>";
echo "<code>$2y$10$BZEgqhaqCjJ2kN4w5N3AoOEGzlb./jK9Hd8X1rQGSHjfPlbdGsMpm</code>";