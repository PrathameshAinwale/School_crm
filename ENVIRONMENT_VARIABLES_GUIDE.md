# 🔐 Environment Variables & Production Configuration Guide

This document is the definitive guide for environment variables for **Arch Campus** (`https://archcampus.archenterprises.co.in/`).

---

## 📌 Architecture: Build-Time vs. Runtime Variables

### 1. Build-Time (Frontend: React + Vite)
- Injected during GitHub Actions build (`npm run build`).
- Prefixed with `VITE_`.
- Compiled directly into the frontend `.js` bundles placed in `public_html/assets/`.
- Sourced from GitHub Actions Secret `PROD_VITE_API_URL` (default: `https://archcampus.archenterprises.co.in/api/v1`).
- *Never put database credentials, application keys, or secret tokens in frontend variables.*

### 2. Runtime (Backend: Laravel 11)
- Evaluated by PHP at runtime on the server.
- Stored exclusively in the server-side file at `/backend/.env`.
- Never committed to Git; never overwritten by FTP deployment.
- Configured once in Hostinger File Manager.

---

## 📋 Production Environment Variables Table

### Backend (`/backend/.env`)

| Key | Production Value | Purpose & Security Constraints |
|---|---|---|
| `APP_NAME` | `"Arch Campus"` | Application display name |
| `APP_ENV` | `production` | Production environment flag |
| `APP_KEY` | `base64:YOUR_GENERATED_KEY` | 32-byte AES key for session and data encryption |
| `APP_DEBUG` | `false` | **MUST BE FALSE** in production to prevent leaking stack traces and DB credentials |
| `APP_TIMEZONE` | `Asia/Kolkata` | Standard application timezone |
| `APP_URL` | `https://archcampus.archenterprises.co.in` | Live application base URL |
| `FRONTEND_URL` | `https://archcampus.archenterprises.co.in` | Origin domain for CORS and Sanctum cookies |
| `DB_CONNECTION` | `mysql` | MySQL driver |
| `DB_HOST` | `127.0.0.1` | Localhost MySQL on Hostinger |
| `DB_PORT` | `3306` | MySQL port |
| `DB_DATABASE` | `u123456789_dbname` | Hostinger production database name |
| `DB_USERNAME` | `u123456789_dbuser` | Hostinger production database user |
| `DB_PASSWORD` | Strong password | Hostinger database password |
| `SESSION_DRIVER` | `file` | File sessions (robust for shared hosting) |
| `SESSION_LIFETIME` | `120` | Session lifetime in minutes |
| `SESSION_ENCRYPT` | `true` | Encrypt session files on disk |
| `SANCTUM_STATEFUL_DOMAINS` | `archcampus.archenterprises.co.in` | Domain for stateful Sanctum authentication |
| `CACHE_STORE` | `file` | Cache driver |
| `QUEUE_CONNECTION` | `file` or `database` | Background job processing |
| `MAIL_MAILER` | `smtp` | SMTP driver |
| `MAIL_HOST` | `smtp.hostinger.com` | Hostinger SMTP server |
| `MAIL_PORT` | `465` | SSL SMTP port |
| `MAIL_ENCRYPTION` | `ssl` | SSL encryption |
| `MAIL_USERNAME` | `notifications@archenterprises.co.in` | Production mailbox |
| `MAIL_PASSWORD` | Mailbox password | Hostinger email password |

### Frontend (`frontend/.env.production.example`)

| Key | Production Value | Purpose |
|---|---|---|
| `VITE_API_URL` | `https://archcampus.archenterprises.co.in/api/v1` | Base API URL used by all frontend Axios/Fetch services |

---

## 🔑 How to Generate a Secure `APP_KEY`

In your local terminal:
```bash
php -r "echo 'base64:' . base64_encode(random_bytes(32)) . PHP_EOL;"
```
Or via Artisan:
```bash
php artisan key:generate --show
```
Paste this value into `backend/.env` on Hostinger.

---

## 🛡️ Security Rules

1. **Never commit `.env` to Git**: Checked and enforced in root `.gitignore`.
2. **Never expose `DB_*` to frontend**: Only backend PHP has access to database credentials.
3. **Always ensure `APP_DEBUG=false`**: Prevents accidental exposure of SQL queries and credentials upon errors.
