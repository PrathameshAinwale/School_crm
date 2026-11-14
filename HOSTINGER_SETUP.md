# 🌐 Hostinger Infrastructure Setup Guide (Production Only)

This guide details the exact Hostinger configuration for the **Arch Campus** production deployment at:

**Live Domain:** `https://archcampus.archenterprises.co.in/`

---

## 🏗️ Directory Architecture on Hostinger

On your Hostinger server (under your user home or domain root), the directory structure is organized into two isolated sibling directories:

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

> [!IMPORTANT]
> **Security Isolation Guarantee**: The `backend/` directory is a sibling to `public_html/`, NOT inside it. Private application files, `.env` files, logs, and database migrations are never directly accessible from a web browser.

---

## 💾 Step 1: Hostinger MySQL Database Setup

There is **only one** database for the application.

1. Log in to [Hostinger hPanel](https://hpanel.hostinger.com/).
2. Select your hosting plan and domain `archcampus.archenterprises.co.in`.
3. Go to **Databases** ➔ **MySQL Databases**.
4. If you already have your database created:
   - Identify the **Database Name** (e.g., `u123456789_sms`).
   - Identify the **Database Username** (e.g., `u123456789_sms`).
   - Ensure you know the password (or reset it via the **Change Password** option).
5. If creating fresh:
   - **Database Name**: e.g. `u123456789_archcampus`
   - **Database Username**: e.g. `u123456789_archadmin`
   - **Password**: Generate a strong 20+ character password.
   - Click **Create**.
6. Note down the credentials for your server-side `.env` file.

> [!NOTE]
> Database host on Hostinger is `127.0.0.1` or `localhost`, and the port is `3306`.

---

## 📁 Step 2: Configure Hostinger FTP/FTPS Account

1. In hPanel, go to **Files** ➔ **FTP Accounts**.
2. Identify your primary FTP account or create a dedicated deployment account:
   - **FTP IP / Host**: `145.79.210.95` or `ftp.archenterprises.co.in` (Do NOT use `archcampus.archenterprises.co.in` because web proxies do not route port 21).
   - **FTP Username**: e.g. `u123456789`.
   - **FTP Port**: `21`.
   - **FTP Password**: Your secure FTP password.
   - **Directory**: Set to `/` or the domain root (e.g. `domains/archcampus.archenterprises.co.in` or empty). **Do NOT set it to `/public_html`**, because the FTP account must have access to both the `public_html/` and `backend/` sibling directories.

---

## 🔑 Step 3: Enable Hostinger SSH Access (Recommended for Automations)

Because standard FTP cannot run shell commands, SSH allows GitHub Actions to automatically run `php artisan migrate --force` and cache commands.

1. In hPanel, go to **Advanced** ➔ **SSH Access**.
2. Click **Enable**.
3. Note your connection details:
   - **SSH IP / Host**: (e.g. `195.35.x.x`).
   - **SSH Username**: (e.g. `u123456789`).
   - **SSH Port**: `65002` (Hostinger's custom SSH port).
   - **SSH Password**: Set under the SSH panel.

Add these secrets to GitHub to activate automated migrations and cache rebuilding upon merge.

---

## 🐘 Step 4: Configure PHP Version & Extensions

1. In hPanel, navigate to **Advanced** ➔ **PHP Configuration**.
2. Select **PHP 8.2**.
3. In the **PHP Extensions** tab, confirm the following are checked:
   - `curl`, `fileinfo`, `intl`, `mbstring`, `openssl`, `pdo_mysql`, `zip`, `bcmath`.
4. In the **PHP Options** tab, set:
   - `memory_limit`: `512M`
   - `max_execution_time`: `300`
   - `upload_max_filesize`: `64M`
   - `post_max_size`: `64M`

---

## 🔒 Step 5: Create the Server-Side `.env` File

Create the `.env` file once in the `backend/` directory on Hostinger:

1. Open Hostinger **File Manager**.
2. Navigate to `/home/uXXXXX/backend/`.
3. Create a new file named `.env`.
4. Fill with your production settings (see [ENVIRONMENT_VARIABLES_GUIDE.md](file:///c:/Users/Arch%20Enterprises%201/Desktop/School_crm/ENVIRONMENT_VARIABLES_GUIDE.md)):
   ```env
   APP_NAME="Arch Campus"
   APP_ENV=production
   APP_KEY=base64:YOUR_GENERATED_APP_KEY
   APP_DEBUG=false
   APP_URL=https://archcampus.archenterprises.co.in
   FRONTEND_URL=https://archcampus.archenterprises.co.in

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=YOUR_PROD_DB_NAME
   DB_USERNAME=YOUR_PROD_DB_USER
   DB_PASSWORD=YOUR_PROD_DB_PASSWORD

   SESSION_DRIVER=file
   CACHE_STORE=file
   QUEUE_CONNECTION=file
   SANCTUM_STATEFUL_DOMAINS=archcampus.archenterprises.co.in
   ```
5. Save the file. GitHub Actions will never overwrite or erase this file.

---

## 🔗 Step 6: Create Storage Symlink

In Hostinger SSH Terminal (or via File Manager):
```bash
cd public_html
ln -s ../backend/storage/app/public storage
```
This enables fast direct serving of student profile photos, certificates, and media uploaded by users.
