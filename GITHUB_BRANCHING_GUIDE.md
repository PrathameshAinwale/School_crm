# 🌿 Git Multi-Developer Branching Strategy (Production Only)

This guide documents the team Git branching architecture and Pull Request workflow for the School CRM project.

---

## 🌳 Branch Hierarchy & Roles

```text
               [ dev/developer-1 ] ──┐
                                      ├──> PR & Automated CI ──> [ develop ] ──> Local Developer Testing
               [ dev/developer-2 ] ──┘                                │
                                                                      │ (Tested & Approved Locally)
                                                                      └──> PR & Code Review ──> [ main ] ──> Automated Production Deployment
```

| Branch Name | Role | Base Branch | Target Environment | Deployment Action |
|---|---|---|---|---|
| `main` | Production-ready, stable release code | - | **Live Production** (`archcampus.archenterprises.co.in`) | **Automated Deployment via GitHub Actions** |
| `develop` | Integration branch | `main` | Local developer test machines | **No automated deployment** (Tested locally) |
| `dev/developer-1` | Developer 1 active working branch | `develop` | Local developer machine | Pull Request into `develop` |
| `dev/developer-2` | Developer 2 active working branch | `develop` | Local developer machine | Pull Request into `develop` |

---

## 👩‍💻 Daily Developer Workflow

### Step 1: Sync your working branch from `develop`
```bash
git checkout develop
git pull origin develop

# Developer 1:
git checkout dev/developer-1
git merge develop

# Developer 2:
git checkout dev/developer-2
git merge develop
```

### Step 2: Implement and verify locally
Make changes following standard coding rules:
1. Verify frontend build succeeds:
   ```bash
   cd frontend
   npm run build
   ```
2. Verify backend tests pass:
   ```bash
   cd backend
   php artisan test
   ```

### Step 3: Commit and push to your developer branch
```bash
git add .
git commit -m "feat(module): descriptive message of change"

# Developer 1:
git push origin dev/developer-1

# Developer 2:
git push origin dev/developer-2
```

---

## 🔄 Pull Request & Release Lifecycle

### Stage 1: Developer Branch ➔ `develop` (Integration)
1. In GitHub, open a Pull Request from `dev/developer-1` (or `dev/developer-2`) targeting `develop`.
2. **Automated CI Validation (`ci.yml`)**:
   - Checks composer dependencies and validity.
   - Runs PHPUnit test suite.
   - Checks frontend linter and builds frontend.
3. Review and merge the PR into `develop`.
4. *Important:* Neither feature branches nor `develop` deploy automatically to any website.

### Stage 2: Local Integration Testing
1. Both developers pull `develop` locally:
   ```bash
   git checkout develop
   git pull origin develop
   ```
2. Run end-to-end user journeys locally:
   - Login with different roles (Admin, Teacher, Student, SuperAdmin).
   - Test Marks/Scoresheet, Fee Structures, Reports, and Student records.
   - Run backend test suite.

### Stage 3: `develop` ➔ `main` (Production Release)
1. When the integrated build is confirmed stable locally, open a Pull Request from `develop` targeting `main`.
2. The CI workflow verifies the PR once again.
3. Once reviewed and merged into `main`:
   - GitHub Actions `production.yml` automatically triggers.
   - Pre-flight checks run.
   - React frontend is compiled for production.
   - Laravel backend is deployed to the sibling `backend/` directory.
   - Database migrations are run safely with `php artisan migrate --force` via SSH.
   - Laravel caches are rebuilt.
   - Live website `https://archcampus.archenterprises.co.in/` is updated.

---

## 🚨 Emergency Production Hotfix

If a critical bug must be fixed directly in production:
1. Create a hotfix branch from `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-issue
   ```
2. Apply the fix and verify locally.
3. Open a PR into `main` (for live release) AND into `develop` (to prevent regression).
4. Merging to `main` deploys the fix immediately.
