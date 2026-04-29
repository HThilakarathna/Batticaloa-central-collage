# cPanel Deployment Files

## Files to upload to public_html or public folder:

### 1. .htaccess (root directory)
- URL rewriting for clean URLs
- Security headers
- PHP settings

### 2. .env configuration
Update database credentials for cPanel MySQL

### 3. storage/sessions permissions
Ensure session directory is writable

---

## Deployment Steps:

1. Upload all files to public_html/ (or public folder in cPanel)
2. Create MySQL database in cPanel
3. Import database/schema.sql
4. Update .env with cPanel database credentials
5. Set storage/sessions to 755 permissions
6. Set storage/uploads to 755 permissions