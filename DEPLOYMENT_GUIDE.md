# 🚀 Automated CI/CD Deployment Guide for Arch Campus (Hostinger)

This guide provides the complete setup instructions for deploying **Arch Campus** automatically to Hostinger using **GitHub Actions** and **FTP**.

- **Production Domain**: `https://archcampus.archenterprises.co.in/`
- **Source Control**: GitHub (`main` branch)
- **CI/CD Workflow**: `.github/workflows/deploy.yml`
- **Hosting Provider**: Hostinger (hPanel)

---

## 🏗️ 1. Architecture & Directory Structure

Your project is a full-stack application consisting of:
1. **Frontend**: React 19 + Vite 8 + Tailwind CSS v4 Single Page Application (SPA).
2. **Backend**: Laravel 12 API with MySQL and Sanctum authentication.

### Hostinger Directory Layout

When deployed to Hostinger, the application is organized inside your web directory (e.g., `public_html/`):

```text
public_html/                           <-- Web DocumentRoot (FTP_SERVER_DIR)
│
├── index.html                         <-- React SPA Entrypoint
├── assets/                            <-- Compiled React JS & CSS bundles
├── vehicles/                          <-- Vehicle icons & static images
├── favicon.svg, logo.png, logo.svg    <-- Brand assets
├── .htaccess                          <-- SPA routing, DirectoryIndex, /api proxy
│
├── api/
│   └── index.php                      <-- Front-Controller bridge to Laravel
│
└── backend/                           <-- Private Laravel Application
    ├── app/
    ├── bootstrap/
    ├── config/
    ├── database/
    ├── routes/
    ├── resources/
    ├── vendor/                        <-- Production Composer dependencies
    ├── artisan                        <-- CLI runner
    ├── composer.json
    ├── .htaccess                      <-- "Require all denied" (Blocks web access)
    ├── .env                           <-- Stored on Hostinger (Never overwritten by Git)
    └── storage/                       <-- User uploads, sessions & logs (Preserved)
```

### 🛡️ Why `default.php` is Safe
Hostinger automatically creates a placeholder `default.php` file when a new website or subdomain is initialized.
- Our `.htaccess` explicitly sets:
  ```apache
  DirectoryIndex index.html index.php default.php
  ```
- This ensures Apache **immediately serves `index.html` (your React app)** without needing to delete `default.php`.
- The GitHub Actions workflow is configured with `dangerous-clean-slate: false`, so **`default.php` and any existing server files will not be deleted**.

---

## 🔑 2. Required GitHub Repository Secrets

Configure the following 4 secrets in your GitHub repository:

1. Open your repository on GitHub:
   [https://github.com/PrathameshAinwale/School_crm](https://github.com/PrathameshAinwale/School_crm)
2. Go to **Settings** ➔ **Secrets and variables** ➔ **Actions**.
3. Under **Repository secrets**, click **New repository secret** and add:

| Secret Name | Description | Example / Recommended Value |
|---|---|---|
| `FTP_SERVER` | Hostinger FTP Hostname or Server IP | `ftp.archenterprises.co.in` or `145.79.210.95` *(do not include `http://` or `ftp://`)* |
| `FTP_USERNAME` | Hostinger FTP Account Username | `u773098752` or sub-account (e.g. `u773098752.arch`) |
| `FTP_PASSWORD` | Hostinger FTP Account Password | Your Hostinger FTP password |
| `FTP_SERVER_DIR` | Target directory on Hostinger | `public_html/` *(see Step 3 below to identify exact folder)* |

*(Optional)*:
- `FTP_PROTOCOL`: Protocol to use. Defaults to `ftp` for maximum compatibility on Hostinger port 21.

---

## 🔍 3. Where to Find FTP Details & Identify the Correct Directory

### A. Finding Your FTP Credentials in Hostinger
1. Log in to [Hostinger hPanel](https://hpanel.hostinger.com/).
2. Select your hosting plan or website.
3. In the search bar or left navigation, go to **Files** ➔ **FTP Accounts**.
4. You will see:
   - **FTP IP / Hostname**: (e.g., `145.79.210.95` or your server IP).
   - **FTP Username**: (e.g., `u773098752`).
   - **FTP Port**: `21`.
   - **Password**: If unknown, click **Change Password** to set a new password.

### B. Determining the Exact Value for `FTP_SERVER_DIR`
Because `archcampus.archenterprises.co.in` is a subdomain, verify its document root:

1. In hPanel, go to **Domains** ➔ **Subdomains** (or **Websites** ➔ **Manage Website**).
2. Check the **Directory** column for `archcampus`:
   - If the Directory is `public_html`:
     Set `FTP_SERVER_DIR` to: `public_html/`
   - If the Directory is `public_html/archcampus`:
     Set `FTP_SERVER_DIR` to: `public_html/archcampus/`
   - If the Directory is `domains/archenterprises.co.in/public_html/archcampus`:
     Set `FTP_SERVER_DIR` to: `domains/archenterprises.co.in/public_html/archcampus/`
   - If your FTP account was created specifically with its root folder set directly to the website root:
     Set `FTP_SERVER_DIR` to: `./`

---

## 🔒 4. Creating the Production `.env` File on Hostinger

Before your first API request, ensure your Laravel backend has its production `.env` file on Hostinger:

1. Open Hostinger **File Manager**.
2. Navigate into your deployment folder (e.g., `public_html/backend/`).
3. Create a file named `.env` with your production settings:
   ```env
   APP_NAME="Arch Campus"
   APP_ENV=production
   APP_KEY=base64:B39gZBC5HcPL6sBP0PA2V1ANd15LgFeG5TF0Ne0cy54=
   APP_DEBUG=false
   APP_TIMEZONE=Asia/Kolkata
   APP_URL=https://archcampus.archenterprises.co.in
   FRONTEND_URL=https://archcampus.archenterprises.co.in

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=YOUR_HOSTINGER_DB_NAME
   DB_USERNAME=YOUR_HOSTINGER_DB_USER
   DB_PASSWORD=YOUR_HOSTINGER_DB_PASSWORD

   SESSION_DRIVER=file
   SESSION_LIFETIME=120
   CACHE_STORE=file
   QUEUE_CONNECTION=file
   SANCTUM_STATEFUL_DOMAINS=archcampus.archenterprises.co.in
   ```
4. Save the file.
> [!NOTE]
> GitHub Actions is configured with strict FTP exclusions. It will **never** overwrite, delete, or modify this server `.env` file!

---

## 🚀 5. How to Deploy (Git Commands)

Whenever you are ready to deploy changes to production:

```bash
git add .
git commit -m "Configure automated GitHub Actions CI/CD deployment to Hostinger"
git push origin main
```

---

## 🚦 6. Verifying the Deployment

1. **GitHub Actions Monitor**:
   - Go to your repository's **Actions** tab on GitHub:
     [https://github.com/PrathameshAinwale/School_crm/actions](https://github.com/PrathameshAinwale/School_crm/actions)
   - Click the running workflow **Deploy to Hostinger Production**.
   - Review each step (`Setup`, `Frontend Build`, `Composer Install`, `Deploy Production Files`).
2. **Website Check**:
   - Open [https://archcampus.archenterprises.co.in/](https://archcampus.archenterprises.co.in/).
   - Confirm the React Single Page Application loads.
   - Test navigating to an internal route (e.g. `/teachers` or `/admin/dashboard`) and refreshing the browser (verifies `.htaccess` SPA rewriting).
3. **API Health Check**:
   - Open [https://archcampus.archenterprises.co.in/api/v1/auth/login](https://archcampus.archenterprises.co.in/api/v1/auth/login) in your browser or Postman.
   - It should return a JSON response (verifying the Laravel API bridge is working).
