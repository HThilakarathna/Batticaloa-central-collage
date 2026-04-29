-- ============================================================
-- BT/BC Oddamavadi Central College — Database Setup
-- For cPanel: Import this file into phpMyAdmin
-- Database: lankafle_bt_central_college
-- ============================================================

-- ============================================================
-- Tables (use your cPanel database name)
-- ============================================================

CREATE TABLE IF NOT EXISTS admins (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS site_settings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(120) NOT NULL UNIQUE,
    setting_value LONGTEXT NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS notices (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(80) NOT NULL,
    title VARCHAR(190) NOT NULL,
    content TEXT NOT NULL,
    notice_date DATE NOT NULL,
    notice_time VARCHAR(40) NOT NULL,
    link_url VARCHAR(255) NOT NULL DEFAULT '#',
    is_published TINYINT(1) NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS programs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    icon VARCHAR(80) NOT NULL,
    title VARCHAR(190) NOT NULL,
    subtitle VARCHAR(190) NOT NULL,
    description TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS achievements (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    icon VARCHAR(80) NOT NULL,
    year_label VARCHAR(40) NOT NULL,
    title VARCHAR(190) NOT NULL,
    category VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    overview TEXT NOT NULL,
    key_achievements LONGTEXT NOT NULL,
    outstanding_students LONGTEXT NOT NULL,
    featured TINYINT(1) NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS history_events (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    period_label VARCHAR(80) NOT NULL,
    title VARCHAR(190) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(80) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS staff_members (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(190) NOT NULL,
    role VARCHAR(120) NOT NULL,
    subject VARCHAR(120) NOT NULL,
    experience VARCHAR(120) NOT NULL,
    emoji VARCHAR(80) NOT NULL,
    group_name VARCHAR(120) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS contact_messages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(190) NOT NULL,
    email VARCHAR(190) NOT NULL,
    phone VARCHAR(80) NOT NULL,
    subject VARCHAR(190) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'new',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS applications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(190) NOT NULL,
    grade_applying VARCHAR(120) NOT NULL,
    parent_phone VARCHAR(80) NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'pending',
    application_data LONGTEXT NOT NULL,
    documents LONGTEXT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

-- ============================================================
-- Insert default admin (password: admin123)
-- ============================================================

INSERT INTO admins (name, email, password_hash, created_at, updated_at) VALUES
('Administrator', 'admin@oddamavadi.lk', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW(), NOW());