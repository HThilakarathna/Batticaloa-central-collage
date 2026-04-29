-- Password Reset SQL
-- Run this in phpMyAdmin to reset admin password to: admin123

UPDATE admins SET 
    password_hash = '$2y$10$tHfTJjgylLiEfGUEI1QV4eMpcrcxRr7dJ4xDnPzJVoRgjfLdeUT96',
    updated_at = NOW() 
WHERE email = 'admin@oddamavadi.lk';