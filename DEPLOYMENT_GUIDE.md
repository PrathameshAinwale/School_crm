# 🚀 Arch Campus Production CI/CD Deployment Architecture

This guide is the complete operational reference for automated deployments to **Arch Campus**:

**Production Website:** `https://archcampus.archenterprises.co.in/`  
**API Endpoint:** `https://archcampus.archenterprises.co.in/api/v1/`

---

## 🏛️ System Architecture Overview

```text
       [ dev/developer-1 ] ──┐
                              ├──> PR (ci.yml) ──> [ develop ] ──> Local Testing on Dev PCs
       [ dev/developer-2 ] ──┘                          │
                                                        │ (Tested & Approved)
                                                        └──> PR (ci.yml) ──> [ main ]
                                                                                │
                                                                                ▼ (Push/Merge)
                                                                 ┌─────────────────────────────┐
                                                                 │ production.yml Auto-Deploy  │
                                                                 │ 1. Pre-flight tests         │
                                                                 │ 2. Build Vite React bundle  │
                                                                 │ 3. Bundle vendor.zip        │
                                                                 │ 4. FTPS to Hostinger        │
                                                                 │ 5. SSH: Migrate & Cache     │
                                                                 └──────────────┬──────────────┘
                                                                                │
                                                                                ▼
                                                                  Hostinger Web Hosting
                                                   ┌────────────────────────────┴────────────────────────────┐
                                                   │                                                         │
                                                   ▼                                                         ▼
                                          public_html/                                                   backend/
                               (React SPA + api/index.php bridge)                                  (Isolated Laravel API)
```

---

## 📂 Hostinger Sibling Directory Layout

Hostinger organizes the site into two isolated sibling folders:

```text
archcampus.archenterprises.co.in/
│
├── public_html/                       <── Frontend React SPA + Public Entrypoint
│   ├── assets/                        <── Vite JS & CSS compiled bundles
│   ├── index.html                     <── SPA root HTML
│   ├── .htaccess                      <── Apache rewrite rules, HTTPS, SPA fallback
│   ├── storage                        <── Symlink -> ../backend/storage/app/public
│   └── api/
│       └── index.php                  <── Front-Controller bridge to ../backend
│
└── backend/                           <── Isolated Laravel Application (Private)
    ├── app/
    ├── bootstrap/cache/               <── Permissions 775
    ├── config/
    ├── database/migrations/
    ├── routes/
    ├── storage/                       <── Permissions 775 (User uploads & logs)
    │   └── app/public/                <── Real storage disk for user files
    ├── vendor/                        <── Composer packages
    ├── artisan                        <── CLI runner for migrations & caches
    ├── composer.json
    └── .env                           <── Production secrets (Never tracked by Git)
```

### How Routing Works (Laravel Outside `public_html/`)
1. **Frontend Assets:** Direct static serving by Apache from `public_html/assets/`.
2. **React SPA Routes (`/login`, `/admin/students`, etc.):** When a user navigates or refreshes a browser page, `.htaccess` intercepts the request and serves `public_html/index.html`. React Router handles client-side rendering.
3. **API Requests (`/api/v1/...`):**
   - The React app sends API calls to `https://archcampus.archenterprises.co.in/api/v1/...`.
   - `.htaccess` rule `RewriteRule ^api(/.*)?$ api/index.php [L,QSA]` forwards all `/api/*` requests to `public_html/api/index.php`.
   - `public_html/api/index.php` loads the autoloader from `../backend/vendor/autoload.php` and boots the Laravel application from `../backend/bootstrap/app.php`.
   - Laravel captures the request and matches the route in `backend/routes/api.php`.
   - The backend remains completely private and unreachable from the browser, preventing source code or `.env` leaks.
4. **User Uploads & Storage (`/storage/...`):**
   - Served via symbolic link `public_html/storage` pointing to `../backend/storage/app/public`.

---

## 🔑 Required GitHub Secrets Checklist

Navigate to your GitHub repository: **Settings** ➔ **Secrets and variables** ➔ **Actions**.  
Add the following production secrets:

| Secret Name | Description | Example / Typical Value |
|---|---|---|
| `PROD_FTP_HOST` | Hostinger FTP Hostname or Server IP | `ftp.archenterprises.co.in` or `195.35.x.x` |
| `PROD_FTP_USERNAME` | Production FTP username | `u123456789` |
| `PROD_FTP_PASSWORD` | Production FTP password | `YourStrongFtpPassword` |
| `PROD_FTP_PORT` | FTP port (default is 21) | `21` |
| `PROD_FRONTEND_DIR` | Hostinger path for frontend dist | `public_html/` |
| `PROD_BACKEND_DIR` | Hostinger path for Laravel backend | `backend/` |
| `PROD_VITE_API_URL` | Production API endpoint for Vite build | `https://archcampus.archenterprises.co.in/api/v1` |
| `PROD_SSH_HOST` | Hostinger SSH server IP or hostname | `195.35.x.x` |
| `PROD_SSH_USERNAME` | Hostinger SSH username | `u123456789` |
| `PROD_SSH_PASSWORD` | Hostinger SSH password | `YourStrongSshPassword` |
| `PROD_SSH_PORT` | Hostinger SSH port (default 65002) | `65002` |
| `PROD_SSH_BACKEND_PATH` | Path to backend on server for SSH | `backend` |

---

## 🤖 GitHub Actions Workflows

### 1. `ci.yml` (Continuous Integration)
- **Triggers:** Pull Requests targeting `develop` or `main`.
- **Tasks:**
  - Installs frontend dependencies & runs linter (`oxlint`).
  - Verifies frontend build compilation.
  - Validates `composer.json` (`composer validate --strict`).
  - Runs backend PHPUnit automated tests with SQLite in-memory database.
  - Verifies route list syntax.

### 2. `production.yml` (Production Deployment)
- **Triggers:** Push or merge to branch `main`.
- **Concurrency:** `production-deployment` (cancel-in-progress: false to avoid corrupting active file transfers).
- **Execution Steps:**
  1. **Pre-flight Tests:** Validates Composer, runs PHPUnit tests, and tests frontend build before touching the server.
  2. **Backend Packaging:** Runs `composer install --no-dev --optimize-autoloader` and bundles into `vendor.zip`.
  3. **Backend FTPS Upload:** Transfers backend code to `backend/` with exclusions protecting `.env`, tests, logs, and `storage/app/public/`.
  4. **SSH Execution:** Unpacks `vendor.zip`, runs `php artisan migrate --force`, ensures `775` storage permissions, and rebuilds caches (`config:cache`, `route:cache`, `view:cache`).
  5. **Frontend Build & Deploy:** Injects `PROD_VITE_API_URL`, builds React SPA, and deploys `frontend/dist/` to `public_html/`.

---

## ⚠️ FTP Limits vs. SSH Explanation

- **What FTP/FTPS Can Do:** Transfer files safely and securely to Hostinger.
- **What FTP/FTPS Cannot Do:** Execute server-side commands (`artisan migrate`, `artisan config:cache`, `composer install`).
- **How Hostinger Handles Commands:**
  - By providing `PROD_SSH_*` credentials, GitHub Actions uses Hostinger's standard SSH service on port `65002` to run migrations and cache rebuilds automatically.
  - If SSH credentials are not provided, file transfer still completes, but migrations and cache rebuilds must be run either via Hostinger SSH terminal or Hostinger hPanel Advanced commands.
  - *No unaudited public PHP web endpoints are used.*

---

## 🧪 Post-Deployment Checklist

1. Open `https://archcampus.archenterprises.co.in/` in your browser.
2. Verify home page and login load without errors.
3. Test API login and check that JWT / session tokens are issued.
4. Verify user-uploaded assets (e.g. avatars) are served from `/storage/`.
5. Check `backend/storage/logs/laravel.log` to confirm no database or runtime exceptions.
