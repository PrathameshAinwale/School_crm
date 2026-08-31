# 🚀 Complete CI/CD Deployment Guide for Hostinger

This project is now equipped with a fully automated **GitHub Actions CI/CD pipeline**.
Every time you push code to the `main` branch (`git push origin main`), GitHub will automatically:
1. **Build the Frontend** (React + Vite + Tailwind CSS) with optimized production bundling.
2. **Package the Backend** (Laravel) with Composer production dependencies (`--no-dev --optimize-autoloader`).
3. **Deploy to Hostinger** directly without requiring manual zipping or file manager uploads.

---

## 📌 Step 1: Get Your FTP Details from Hostinger

1. Log in to your [Hostinger hPanel](https://hpanel.hostinger.com/).
2. Select your hosting plan / domain: `powderblue-trout-993647.hostingersite.com`.
3. Go to **Files** ➔ **FTP Accounts**.
4. You will see:
   - **FTP IP / Hostname**: e.g., `ftp.powderblue-trout-993647.hostingersite.com` or your Hostinger server IP (e.g., `195.35.x.x`).
   - **FTP Username**: e.g., `u773098752`
   - **FTP Port**: `21`
   - **FTP Password**: (If you don't remember it, click **Change Password** to set a fresh password).

---

## 📌 Step 2: Add Secrets to Your GitHub Repository

1. Open your GitHub repository in your browser:
   [https://github.com/PrathameshAinwale/School_crm](https://github.com/PrathameshAinwale/School_crm)
2. Go to **Settings** ➔ **Secrets and variables** ➔ **Actions**.
3. Under **Repository secrets**, click **New repository secret** and add the following 3 required secrets:

| Secret Name | Value Description | Example |
|---|---|---|
| `HOSTINGER_FTP_SERVER` | Your Hostinger FTP Host or IP | `ftp.powderblue-trout-993647.hostingersite.com` |
| `HOSTINGER_FTP_USERNAME` | Your Hostinger FTP Username | `u773098752` |
| `HOSTINGER_FTP_PASSWORD` | Your Hostinger FTP Password | `YourSecurePasswordHere` |

*(Optional overrides if your folder paths on Hostinger differ from defaults)*:
- `HOSTINGER_FRONTEND_DIR`: Target folder for frontend assets. Defaults to `public_html/`.
- `HOSTINGER_BACKEND_DIR`: Target folder for Laravel API. Defaults to `backend/`.
- `VITE_API_URL`: Custom API endpoint for frontend build. Defaults to `http://powderblue-trout-993647.hostingersite.com/api/v1`.

---

## 📌 Step 3: Server Directory Layout on Hostinger

In your Hostinger File Manager, the folder layout is organized as follows:

```text
/home/u773098752/
│
├── public_html/                       <-- Frontend Dist files deployed here
│   ├── assets/                        <-- React JS & CSS bundles
│   ├── index.html                     <-- React SPA Entrypoint
│   ├── .htaccess                      <-- Routes SPA & forwards /api to Laravel
│   └── icons.svg
│
└── backend/                           <-- Laravel API deployed here
    ├── app/
    ├── bootstrap/
    ├── config/
    ├── database/
    ├── public/
    │   └── index.php
    ├── routes/
    ├── storage/
    ├── vendor/
    └── .env                           <-- Stored safely on Hostinger (Never overwritten by Git)
```

### Important First-Time Checklist on Hostinger:
1. **Laravel `.env` File**:
   Make sure you have your `.env` file in your `backend/` directory on Hostinger containing your production DB credentials:
   ```env
   APP_NAME="School CRM"
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=http://powderblue-trout-993647.hostingersite.com
   APP_KEY=base64:B39gZBC5HcPL6sBP0PA2V1ANd15LgFeG5TF0Ne0cy54=

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=u773098752_school_sms
   DB_USERNAME=u773098752_school_sms
   DB_PASSWORD=your_db_password
   ```
   > **Note**: GitHub Actions is explicitly configured **never** to overwrite your server `.env` or delete server-side logs/sessions!

2. **Storage Permissions**:
   In Hostinger File Manager, ensure `backend/storage` and `backend/bootstrap/cache` are writable (permissions `755` or `775`).

---

## 📌 Step 4: (Optional) Automated Migrations & Cache via SSH

If your Hostinger plan includes SSH (Hostinger hPanel ➔ **Advanced** ➔ **SSH Access**):
1. Enable SSH access in hPanel.
2. Add these additional secrets to GitHub:
   - `HOSTINGER_SSH_HOST`: Your server SSH IP or hostname.
   - `HOSTINGER_SSH_USER`: Your SSH username (e.g. `u773098752`).
   - `HOSTINGER_SSH_PASSWORD`: Your SSH password.
   - `HOSTINGER_SSH_PORT`: `65002` (Hostinger's default SSH port).
   - `HOSTINGER_SSH_PATH`: Path to your backend on server (e.g., `backend` or `domains/powderblue-trout-993647.hostingersite.com/backend`).

When these secrets are provided, GitHub Actions will automatically run:
```bash
php artisan migrate --force
php artisan config:cache
php artisan route:cache
```
If you don't configure SSH, this step is automatically skipped, and deployments still complete via FTP!

---

## 🚀 How to Deploy Now

1. Commit and push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Configure GitHub Actions CI/CD for Hostinger auto-deployment"
   git push origin main
   ```
2. Open the **Actions** tab in your GitHub repository:
   You will see the **Deploy to Hostinger** workflow running live with step-by-step progress and status checks!
3. Once completed, your website at `http://powderblue-trout-993647.hostingersite.com` will be updated with your latest changes.
