# cPanel Deployment Checklist

## Pre-Deployment (Local)

- [ ] Test site locally with XAMPP
- [ ] Update `.env.cpanel` with cPanel database credentials
- [ ] Create git repository if not already created

## cPanel Setup

### 1. Create MySQL Database
```
- Go to cPanel → MySQL Databases
- Create new database: oddamavadi_college
- Create user and assign to database
- Note the credentials
```

### 2. Import Database
```
- Go to phpMyAdmin in cPanel
- Select your database
- Import database/schema.sql
```

### 3. Upload Files
```
- Connect via Git or FTP to public_html/
- Upload all project files EXCEPT:
  - .env (use .env.cpanel instead)
  - storage/sessions/*
  - storage/uploads/*
```

### 4. Set Permissions
```
storage/sessions/     → 755
storage/uploads/      → 755
storage/uploads/applications → 775
```

### 5. Configure PHP
```
- Go to cPanel → MultiPHP Manager
- Select domain: oddamavadicc.lankaflex.com
- Set PHP version: 8.1 or 8.2
```

### 6. Update .env
```
- Rename config/.env.cpanel to config/.env
- Edit with cPanel database credentials
```

## Git Setup (Optional)

### Connect via Git in cPanel
```
1. Go to cPanel → Git™ Version Control
2. Create new repository
3. Add remote to local git:
   git remote add cpanel user@cpanel.lankaflex.com:~/repos/oddamavadi.git
4. Push to cPanel
```

### Alternative: Deploy via GitHub
```
1. Push code to GitHub
2. cPanel → Git™ Version Control
3. Clone from GitHub URL
4. Set branch to deploy
```

## Post-Deployment

- [ ] Test homepage loads
- [ ] Test contact form
- [ ] Test admin login
- [ ] Check PHP error logs if issues

## Common Issues

| Issue | Solution |
|-------|----------|
| 500 Error | Check file permissions (755 for folders) |
| Database connection | Verify .env DB credentials |
| Session errors | Check storage/sessions is writable |
| File not found | Ensure .htaccess is uploaded |