# School CRM - Comprehensive School Management System

A multi-tenant School Management & CRM Platform featuring an enterprise Laravel REST API backend and a modern React Vite frontend.

---

## 🚀 Key Modules & Features

### 1. Frontend (`frontend/`)
- **Executive & Administrative Dashboards**: Principal Desk, Super Admin, Accounts, HR, and Teacher portals.
- **Examinations & Marksheets**: Complete score entry sheets, grading tier calculation, and printable Student Report Cards / Marksheets.
- **Student ID Card Studio**: Instant bulk and individual printable Student ID Card generation with barcode and photo layouts.
- **Fleet & Transport Tracking**: Live GPS vehicle tracker with 3D vehicle models and interactive road routing map overlays.
- **Admissions Pipeline & Calendar**: Multi-stage inquiry, interview scheduling, document verification, and automated status pipelines.
- **UDISE+ Compliance Portal**: Data capture formats (DCF), validation rules, and exportable summary reports.
- **Central Library Management**: Book catalog, borrowing/returns ledger, and search with instant status indicators.
- **Sports & Extracurriculars**: Tournaments, rosters, inventories, and athletic achievements.
- **Multi-Branch & Academic Year Switching**: Unified institution-wide controls with instant switching across scopes.

### 2. Backend (`backend/`)
- **Laravel 11 REST API**: Robust authentication, role-based access control (RBAC), and multi-tenant school isolation.
- **Examination Engine**: Exam schedules, mark entry, tie-break ranking calculations, grade points, and deterministic summary generators.
- **Fee Management System**: Tuition structures, installments, discounts, receipts, and ledger reconciliation.
- **Communication Hub**: Multi-channel notifications (SMS, Email, WhatsApp, Push) with queue-driven dispatch and audit logs.
- **Comprehensive Audit Trail**: Automated audit logging and pruning policies for compliance and data integrity.

---

## 🛠️ Tech Stack
- **Frontend**: React 19, Vite, TailwindCSS, Framer Motion, Recharts, Leaflet, Three.js, React-i18next.
- **Backend**: PHP 8.2+, Laravel 11, MySQL, DomPDF.

---

## 💻 Local Setup

### Backend Setup:
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```
