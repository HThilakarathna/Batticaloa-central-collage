-- Password Reset SQL
-- Run this in phpMyAdmin to reset admin password
-- Default login: admin@oddamavadi.lk / admin123

UPDATE admins SET 
    password_hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    updated_at = NOW() 
WHERE email = 'admin@oddamavadi.lk';

-- If above doesn't work, try this with a fresh hash:
-- UPDATE admins SET password_hash = '$2y$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWX', updated_at = NOW() WHERE email = 'admin@oddamavadi.lk';