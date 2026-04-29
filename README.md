# BT/BC Oddamavadi Central College Dynamic Website

This project converts the original static school website into a dynamic school portal using:

- Vue 3 frontend
- PHP backend
- MySQL database
- Admin panel for content management

## Pages included

- `index.php`
- `about.php`
- `notices.php`
- `history.php`
- `achievements.php`
- `staff.php`
- `contact.php`
- `apply.php`
- `admin.php`

## Features

- Dynamic public website powered by Vue
- PHP JSON API in `api/index.php`
- MySQL-ready schema in `database/schema.sql`
- Admin panel for:
  - site/page settings
  - notices
  - programs
  - achievements
  - history timeline
  - staff members
  - contact inbox
  - admissions applications
- Multi-step online admission form
- Contact form storage
- Seeded fallback content for the public site before database setup

## Frontend structure

The public frontend is now organized as a modular Vue app:

- `assets/js/site.js`
- `assets/js/site/constants.js`
- `assets/js/site/helpers.js`
- `assets/js/site/components.js`
- `assets/js/site/pages.js`

This means the frontend is no longer one large script. It is split into Vue modules for:

- shared layout components
- page-level views
- helpers and constants
- public app bootstrapping

## Setup

1. Create a MySQL database.
2. Import `database/schema.sql`.
3. Copy `config/env.example` to `.env`.
4. Update `.env` with your MySQL credentials.
5. Start PHP locally:

```bash
php -S localhost:8000
```

6. Open:

- Public site: `http://localhost:8000`
- Admin panel: `http://localhost:8000/admin.php`

## Default admin login

- Email: `admin@btcentralcollege.local`
- Password: `admin123`

Change the password after first login in a real deployment.

## Notes

- Image assets were preserved from the original static site.
- If MySQL is not configured yet, the public pages still load with seeded content.
- Admin actions, contact saving, and application saving require MySQL.
