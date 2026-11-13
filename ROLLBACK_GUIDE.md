# 🔄 Production Rollback & Disaster Recovery Guide

This guide describes emergency procedures to recover service for **Arch Campus** (`https://archcampus.archenterprises.co.in/`) if an issue occurs after a production deployment.

---

## 🗄️ Step 0: Database Protection Before Major Schema Migrations

Before merging migrations that alter existing table schemas:

1. Open [Hostinger hPanel](https://hpanel.hostinger.com/).
2. Go to **Databases** ➔ **phpMyAdmin**.
3. Select your production database.
4. Click **Export** ➔ Choose **Quick** ➔ Format: **SQL** ➔ Click **Export**.
5. Save the snapshot file (`backup_YYYY_MM_DD.sql`) safely.

*(Hostinger also takes daily automated backups accessible under **Files** ➔ **Backups** ➔ **Database backups**).*

---

## ⏪ Procedure 1: Code Revert via Git (Frontend or Backend Bug)

If a bad commit was merged into `main`:

1. Identify the bad commit:
   ```bash
   git log --oneline -5
   ```
2. Create a clean revert commit on `main`:
   ```bash
   git checkout main
   git pull origin main
   git revert <FAULTY_COMMIT_HASH> -m 1
   ```
3. Test locally:
   ```bash
   cd frontend && npm run build
   cd ../backend && php artisan test
   ```
4. Push the revert commit to `main`:
   ```bash
   git push origin main
   ```
5. GitHub Actions `production.yml` automatically builds and deploys the reverted stable code.

---

## ⏪ Procedure 2: Roll Back Database Migration (via SSH)

If a newly deployed migration causes SQL errors:

1. SSH into Hostinger:
   ```bash
   ssh -p 65002 u123456789@YOUR_SERVER_IP
   ```
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Roll back the last batch of migrations:
   ```bash
   php artisan migrate:rollback --step=1
   ```
4. Rebuild caches:
   ```bash
   php artisan optimize:clear
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

---

## ⏪ Procedure 3: Restoring Pre-Deployment Database Snapshot

If table data or schema was damaged and migration rollback fails:

1. Open Hostinger **phpMyAdmin**.
2. Select your production database.
3. Check affected tables and select **With selected: Drop**.
4. Click the **Import** tab.
5. Browse and select your exported `.sql` snapshot file.
6. Click **Import**.
7. Test the application in your browser to confirm normal operation.

---

## 🛑 Procedure 4: Immediate Emergency Maintenance Mode

If users are experiencing broken flows and the issue cannot be resolved within 5 minutes:

Via SSH:
```bash
cd backend
php artisan down --secret="emergency-admin-bypass" --render="errors::503"
```
*(You can access and test the site by visiting `https://archcampus.archenterprises.co.in/emergency-admin-bypass`)*.

To bring the application back online after fixing:
```bash
php artisan up
```
