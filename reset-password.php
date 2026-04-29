<?php
/**
 * Password Reset Script
 * Upload this file to your cPanel public_html, run it, then delete it!
 */

// Generate new password hash for 'admin123'
$newHash = password_hash('admin123', PASSWORD_BCRYPT);

echo "New password hash for 'admin123':<br>";
echo "<pre>" . $newHash . "</pre>";

// Also show SQL to update the database
echo "<br><br>SQL to update admin password:<br>";
echo "<pre>UPDATE admins SET password_hash = '" . $newHash . "' WHERE email = 'admin@oddamavadi.lk';</pre>";