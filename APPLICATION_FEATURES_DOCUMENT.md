# Arch Campus — Comprehensive Application Feature Study & Specification

## 1. Executive Summary & Architecture Overview

**Arch Campus** is an enterprise-grade, multi-tenant School Management System (SMS / CRM) architected to streamline academic, administrative, human resource, financial, and multi-school platform operations.

### Technology Stack
* **Frontend**: React (v18+), Vite, Tailwind CSS, React Router v6, React Icons (`react-icons/lu`), Context API (`AuthContext`), Axios / Fetch Service Layer.
* **Backend**: Laravel 11 Framework (PHP 8.2+), Laravel Sanctum Token Authentication, Eloquent ORM, RESTful API Architecture.
* **Database**: MySQL relational database schema with dedicated foreign keys, status enums, cascade relationships, and database seeders.
* **DevOps & CI/CD**: GitHub Actions automated pipeline deploying frontend production bundles and backend production packages to Hostinger via automated FTP with `.htaccess` SPA / API rewrite proxies.

### User Role Hierarchy
The application implements strict Role-Based Access Control (RBAC) across six distinct user personas:
1. **Super Admin**: SaaS Company / Platform Owner managing multiple client schools and subscriptions.
2. **School Administrator (Admin)**: Institutional chief operating authority managing academics, teachers, admissions, vehicles, fees, and campus assets.
3. **Teacher (Faculty)**: Instructional staff handling classroom teaching, attendance, timetables, homework evaluation, syllabus progress, and personal HR tasks.
4. **Student & Parent**: Academic learners and guardians monitoring attendance, grades, homework, fees, calendar, and communicating with teachers.
5. **Human Resources (HR)**: Staff management authority handling payroll, staff attendance, leave approvals, faculty trainings, and institutional events.
6. **Accountant (Accounts & Finance)**: Financial officer managing student fee collection, offline receipt generation, school expense vouchers, and staff salary disbursements.

---

## 2. In-Depth Study of Teacher (Faculty) Features

The Teacher module is designed as a hybrid workspace divided into **Student Academic Management** and **Teacher Employee Self-Service**.

### 2.1 Teacher Dashboard & Key Priorities
* **Live Operational Cards**:
  * **Today's Schedule**: Displays total classes today, active class period time slot, room number, and link to today's timetable.
  * **Class Attendance (Homeroom)**: Displays current turnout status (e.g., `30/32 Students Present`, `93.8% Turnout`), today's marked/pending state, and homeroom badge.
  * **Active Assignments**: Shows count of open homework sets and pending student evaluations awaiting grading.
* **Today's Class Schedule Timeline**: Interactive list showing real-time periods ordered chronologically with room locations, subject tags, and "Live Next" / "Upcoming" status indicators.
* **Staff Notices & Circulars Feed**: Real-time view of institutional announcements and urgent updates.
* **Curriculum Tracker Quick Action**: Instant link to update today's syllabus coverage.

### 2.2 Interactive Period Timetable Creator (`/teacher/timetable`)
* **Multi-Class Support**: Configure schedules across Nursery, Kindergarten, and Classes 1 through 12.
* **Weekly Schedule Grid**: 6-day coverage (Monday to Saturday) with flexible time intervals (e.g., 08:00 AM – 08:45 AM).
* **Period Details Configuration**:
  * Subject selection (standard CBSE/ICSE curriculum subjects).
  * Period type classification: Theory, Lab Practical, Literature, Grammar, Doubt Clearance, Assessment Test, Sports, or Self-Study.
  * Teacher assignment & Room / Lab number allocation.
* **Productivity Utilities**:
  * **"Copy Monday to All Days"**: 1-click duplication of routine schedules across weekdays.
  * **Clear Day Schedule**: Reset periods for a specific day.
  * **Time-Slot Overlap & Conflict Detection**: Validation preventing overlapping period intervals.
  * **Interactive Timetable Preview Modal**: Printable grid view of the complete weekly timetable.
  * **Bulk API Persistence**: Saves the entire weekly matrix in a single atomic transaction.

### 2.3 Class Student Attendance Tracking (`/teacher/student-attendance`)
* **Homeroom Auto-Resolution**: Automatically loads the logged-in teacher's assigned class and division.
* **Real-Time Attendance Marking**: Mark each student as **Present**, **Absent**, or **Late**.
* **Quick Action**: "Mark All Present" button for accelerated daily roll calls.
* **Turnout Analytics**: Displays total students, present count, absent count, late count, and percentage attendance rate.
* **Teacher Security Rule**: Only current-day attendance can be marked or modified by teachers; past dates are locked (editable only by Administrators).
* **Search & Remarks**: Instant search by student name or roll number, with custom remarks for absent/late students.

### 2.4 Student Class Records & Directory (`/student-records`)
* **Roster Inspection**: Filter students by standard class and division (Saffron A, White B, Green C).
* **Student Profile Card & Detailed Modal**:
  * Student Name, Roll Number, Admission Number, Class & Section.
  * Father / Guardian Name, Contact Phone Number, Email, and Residential Address.
  * Blood Group, Date of Birth, Age, and Emergency Contact details.
* **Search Functionality**: Real-time keyword filter across student names and roll numbers.

### 2.5 Homework & Assignment Lifecycle Management (`/assignments`)
* **Create New Assignment**:
  * Class, Subject, Title, and Detailed Instructions.
  * Submission Deadline (Date & Time picker).
  * Maximum Marks and Priority level (High, Medium, Normal).
  * File Attachment (Worksheets, question papers, reading materials).
* **Student Submissions Roster**:
  * Real-time submission counter (Total Enrolled, Submitted, Graded, Pending).
  * Review student attachments, submission timestamps (on-time vs. late), and student remarks.
* **Grading & Qualitative Evaluation**:
  * Assign score out of maximum marks.
  * Provide personalized teacher feedback comments visible to students and parents.

### 2.6 Curriculum & Syllabus Progress Logging (`/syllabus`)
* **Class & Division Selection**: Track syllabus by Grade and Subject.
* **Record Completed Units / Chapters**:
  * Chapter name and description of topics covered.
  * Date of completion.
  * Progress percentage and learning milestones achieved.
* **Historical Audit Trail**: Delete or adjust progress logs if lessons are rescheduled.

### 2.7 Physical School Resources & Issue Ticketing (`/teacher/resources`)
* **Campus Inventory Browser**: Search school physical assets across Laboratories, IT Labs, Smartboards, Sports Gear, and Library Books.
* **Raise Maintenance Request / Issue**:
  * Report damaged or malfunctioning equipment.
  * Issue types: Needs Maintenance, Damaged / Broken, Missing / Lost, Replenish Consumables.
  * Severity rating: Low, Medium, High, Critical.
  * Affected quantity input.
  * Photo evidence upload (up to 5MB image).
  * Problem description.
* **"My Requests" Tracker**: View real-time review status (Pending, Under Review, Approved, Repaired / Resolved, Rejected) with administrative notes.

### 2.8 Today's Schedule Page (`/teacher/schedule`)
* **Dedicated Daily View**: Highlights today's day-of-week by default, with tabs for switching between Monday through Saturday.
* **Period Timeline Cards**: Period number, time slot duration, subject, assigned division, and venue location.

### 2.9 Biometric-Style Teacher Self Attendance (`/teacher/attendance`)
* **Punch-In / Punch-Out**: Virtual punch card recording exact arrival and departure timestamps.
* **Status Badges**: Present, Late Arrival, Completed Today, or Absent.
* **Monthly Attendance Heatmap**: Interactive visual calendar color-coded by attendance status (Green = Present, Amber = Late, Red = Absent, Gray = Holiday).
* **Historical Logs Table**: Daily logs with date, check-in, check-out, working hours duration, and attendance status.

### 2.10 Leave Quotas & Application Workflow (`/teacher/leave-balance`, `/teacher/apply-leave`)
* **Live Leave Quotas**:
  * **Casual Leave (CL)**: 12 days quota with visual progress bar of used vs. remaining.
  * **Sick Leave (SL)**: 10 days quota.
  * **Maternity / Paternity Leave (ML)**: 90 days quota.
* **Apply for Leave Form**:
  * Leave type selector.
  * From Date and To Date with automatic day counter calculation.
  * Justification / Reason text field.
  * Supporting medical or official document photo attachment.
* **Application History**: Real-time status tracking (Pending, Approved, Rejected) synced with HR.

### 2.11 Faculty Professional Trainings (`/teacher/trainings`)
* **Assigned Institutional Workshops**: View training programs scheduled by HR or Administration.
* **Program Details**: Title, category (Pedagogy, Technology, NEP 2020), trainer name, external organization, date, timing, and auditorium/venue.
* **Attendance & Feedback**: Confirm participation and submit post-workshop feedback to HR.

### 2.12 Teacher Profile Management (`/profile` or `/teacher/profile`)
* **Personal & Professional Info**: Full name, employee ID, phone, email, date of birth, blood group, highest qualification, total experience, address, and emergency contact.
* **Class Teacher Badges**: Visual indicator of assigned homeroom class and division.
* **Self-Service Edit Form**: Ability to update personal contact info and save directly to backend.

---

## 3. Comprehensive Study of Other Roles & Modules

### 3.1 Student & Parent Module
* **Dashboard (`/dashboard`)**: Personal academic overview, student ID card badge, today's attendance status, upcoming classes, recent exam marks, and pending fee alerts.
* **Attendance Portal (`/attendance`)**: Full calendar heatmap of attendance, monthly percentage rate, and student leave application submission.
* **School Period Timetable (`/timetable`)**: Class-specific period schedule for all 6 weekdays.
* **Assignments (`/assignment`)**: Homework list with subject filters, deadline countdowns, worksheet downloads, online homework submission with file upload, and teacher grade/feedback view.
* **Study Material & Digital Library (`/study-material`)**: Searchable repository of classroom notes, formula sheets, sample question banks, and NCERT solutions with 1-click download.
* **Curriculum Coverage (`/syllabus`)**: View completed chapters and percentage of academic syllabus finished per subject.
* **School Calendar & Events (`/calendar`)**: View institutional holidays, sports days, cultural festivals, and exam dates.
* **Official Notices & Circulars (`/notices`)**: Filter announcements by category (Academic, Examination, Health & Wellness, Administrative).
* **Parent-Teacher Meeting (PTM) Portal (`/ptm`)**: 1-on-1 parent meeting scheduling, time slot confirmation, and consultation agenda setting.
* **Faculty & Academic Feedback (`/feedback`)**: Submit ratings (1 to 5 stars) and confidential comments on teaching quality and class experience.
* **Student Fees Portal (`/fees`)**: View fee structure, paid amount, pending installment dues, breakdown of heads (Tuition, Transport, Lab), and payment receipts.
* **Student Profile (`/profile`)**: Academic credentials, guardian information, blood group, and emergency contacts.

### 3.2 School Administrator (Admin) Module
* **Admin Dashboard (`/dashboard`)**: High-level KPIs (Total Students, Faculty Count, Attendance Rate, Revenue Collected, Pending Fees, Active Vehicles, Open Asset Requests).
* **Manage Teachers & Staff (`/manage-teachers`)**:
  * Directory of all faculty, administrative, accounting, and HR staff.
  * Add new employee with automatic user account creation.
  * **Credentials Modal**: Displays generated username and temporary password with 1-click copy for sharing with staff.
  * Reset password for any staff member.
  * Edit designations, departments, qualifications, base salaries, assigned classes, and homerooms.
* **Students Management (`/students`)**:
  * 3-tier drilldown: All Classes Grid ➔ Divisions (Saffron A, White B, Green C) ➔ Student Rosters.
  * Add new student with parent info, blood group, transport option, and auto-generated student login credentials.
  * Edit and delete student records.
* **Admissions CRM Pipeline (`/admission`)**:
  * Multi-stage pipeline: Inquiry / Applied ➔ Under Review ➔ Interview / Test ➔ Approved ➔ Enrolled ➔ Rejected.
  * **1-Click "Enroll as Student"**: Converts an approved applicant into an active enrolled student, assigns roll number/section, provisions user credentials, and attaches fee structures.
* **Standard-wise Fee Structure (`/admin/fee-structure`)**:
  * Configure annual fee heads per grade: Tuition Fee, Transport Fee, Lab & Library Fee, Activity Fee, Other Charges.
  * Projected annual revenue calculator.
  * Customizable installment schedules (Quarterly, Half-yearly, Term-wise) with due dates and daily late fee penalties.
  * **"Sync to All Students"**: Propagates modified fee schedules into all student ledgers in that grade.
* **School Transport Fleet (`/school-vehicles`)**:
  * Fleet tracking for Buses, Vans, and Minibuses.
  * Vehicle registration number, capacity, driver name, driver phone, license number, route (From ➔ To), fuel type, and operational status.
* **School Resources & Asset Management (`/school-resources`)**:
  * Master inventory catalog across Laboratories, IT Labs, Smartboards, Sports, and Library.
  * Review maintenance tickets raised by teachers; approve, reject, or mark repaired with administrator notes.
* **School Events Calendar (`/admin/calendar`)**:
  * Plan school-wide or class-specific holidays, sports events, exams, exhibitions, and annual celebrations.

### 3.3 Human Resources (HR) Module
* **HR Dashboard (`/dashboard`)**: Total employees, staff present today, pending leave requests, total monthly payroll commitment, and upcoming training sessions.
* **Staff Salary & Payroll (`/salary`)**:
  * Monthly payroll roster for all 12 calendar months.
  * Salary computation: Base Salary + Allowances - PF - Tax - Unpaid Leave Deductions = Net Payout.
  * Adjustment modal to edit allowances, tax deductions, and deduction reasons.
  * Printable and downloadable **Official Salary Slip / Payslip** with school header and authorized signature lines.
  * **"Submit Salary Disbursement Request to Accounts"**: Batch payroll submission workflow.
* **Staff Attendance Operations (`/hr/staff-attendance`)**:
  * Daily institutional staff roll call for all employees.
  * Interactive date picker and live attendance rate analytics.
  * Manual status override (Present, Absent, Late, Half-Day, On Leave) with check-in/out timestamps and remarks.
* **Faculty & Staff Leaves Review (`/hr/staff-leaves`)**:
  * Review all leave applications submitted by faculty and support staff.
  * View applicant details, leave type, days count, reason, and photo proof lightbox preview.
  * 1-click Approve or Reject actions with instant sync.
* **Faculty Development & Trainings (`/hr/trainings`)**:
  * Schedule new training programs (Group-wide or selectively targeted to specific teachers).
  * Configure trainer name, venue, objectives, and time slots.
  * Track attendance and feedback submitted by faculty.
* **School Events Management (`/school-events`)**:
  * Manage institutional gatherings, cultural events, and staff meetings.

### 3.4 Accounts & Finance (Accountant) Module
* **Accounts Dashboard (`/accounts/dashboard`)**: Real-time financial metrics: Total Fees Collected, Outstanding Dues, Operational School Expenses, Disbursed Payroll, and Net Cash Balance.
* **Student Fees Management (`/accounts/fees`)**:
  * Comprehensive fee ledger searchable by student, class, division, or status (Paid, Partial, Overdue, Unpaid).
  * Record offline fee payments (Cash, Cheque, Bank Transfer / NEFT, UPI, Demand Draft) with transaction reference numbers.
  * **Automated Fee Receipt Generator**: Generates clean, printable/downloadable official receipts with receipt number, payment breakdown, and institutional seal.
  * **Fee Payment Reminders**: Send individual reminder notices or 1-Click "Send Bulk Fee Reminders" to all overdue student accounts.
* **Salary Disbursement Management (`/accounts/salary-disbursements`)**:
  * Review batch payroll disbursement requests sent by HR.
  * Action batch payments (Disburse or Reject) with payment reference and bank account notes.
  * Direct staff salary payment recording ledger and individual payment voucher printing.
* **School Expenses & Expenditure (`/accounts/expenses`)**:
  * Record non-payroll operational expenditures (Resources & Equipment, Utilities, Maintenance, Transport Fuel, Academic Supplies, Vendor Payments).
  * Vendor name, invoice number, payment mode, amount, date, and notes.

### 3.5 Super Admin (SaaS Company Platform) Module
* **Platform Overview Dashboard (`/dashboard`)**:
  * Aggregated multi-tenant statistics: Total Schools, Active Schools, Suspended Schools, Total Students across platform, Total Teachers, Estimated MRR (Monthly Recurring Revenue), and ARR.
  * Subscription plan distribution (Enterprise, Pro, Standard, Trial).
* **Manage Client Schools (`/super-admin/schools`)**:
  * Onboard new client schools with school code, domain, contact person, phone, email, and subscription tier.
  * View school profile details and tenant database health.
  * Toggle school status (Active / Suspended).
  * Reset school administrator credentials.
* **Platform Subscriptions & Billing (`/super-admin/subscriptions`)**:
  * Subscription tier catalog, billing cycles (Monthly / Annual), seat allocations, and renewal dates.

---

## 4. Cross-Cutting & Platform Infrastructure Features

| Feature Component | Implementation Details |
|---|---|
| **Role-Aware Dynamic Routing** | `App.jsx` handles smart route redirections based on logged-in role (`/dashboard`, `/attendance`, `/students`, `/profile`, `/trainings` automatically load the correct role page). |
| **Route Protection & RBAC** | `ProtectedRoute` enforces Sanctum authentication; `RoleRoute` enforces allowed roles and displays an `UnauthorizedAccess` screen if forbidden. |
| **Notification Engine** | Global topbar bell icon polling every 15 seconds; calculates unread counts; deep-links directly to target modules (Trainings, Fees, Leaves, Homework, Circulars). |
| **Responsive Shell & UX** | Desktop sidebar (expandable / collapsible to 72px) with nested submenus; mobile slide-out drawer; breadcrumb topbar with user avatar and dropdown menu. |
| **Automated CI/CD** | GitHub Actions pipeline automatically triggers on push to `main`, compiles Vite production bundle, packages Laravel vendor assets, and deploys via FTP to Hostinger. |

---

## 5. Complete Application Feature Matrix by Role

| Feature Module | Super Admin | School Admin | Teacher | Student / Parent | HR Manager | Accountant |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Platform Multi-School Control & MRR** | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Admin Dashboard & School KPIs** | ❌ | ✅ Full | ❌ | ❌ | ❌ | ❌ |
| **Manage Staff & Generate Passwords** | ❌ | ✅ Full | ❌ | ❌ | 👁️ View | ❌ |
| **Student Roster & 3-Level Drilldown** | ❌ | ✅ Full | 👁️ Class Only | ❌ | ❌ | ❌ |
| **Admissions Pipeline & 1-Click Enrollment**| ❌ | ✅ Full | ❌ | ❌ | ❌ | ❌ |
| **Fee Structure & Installment Configuration**| ❌ | ✅ Full | ❌ | ❌ | ❌ | ❌ |
| **Student Fee Collection & Receipts** | ❌ | 👁️ View | ❌ | 👁️ Pay & View | ❌ | ✅ Full |
| **School Operational Expenses** | ❌ | 👁️ View | ❌ | ❌ | ❌ | ❌ | ✅ Full |
| **Staff Salary & Payroll Calculation** | ❌ | 👁️ View | ❌ | ❌ | ✅ Full | ❌ |
| **Salary Batch Disbursement & Vouchers** | ❌ | 👁️ View | ❌ | ❌ | 📤 Request | ✅ Disburse |
| **Daily Student Attendance Marking** | ❌ | ✅ Full | ✅ Homeroom | 👁️ Personal | ❌ | ❌ |
| **Staff Daily Attendance Roster** | ❌ | 👁️ View | ❌ | ❌ | ✅ Full | ❌ |
| **Biometric Self Punch-In / Punch-Out** | ❌ | ❌ | ✅ Self | ❌ | ✅ Self | ✅ Self |
| **Leave Quotas & Application** | ❌ | ❌ | ✅ Self | ❌ | ✅ Self | ✅ Self |
| **Staff Leave Review & Approvals** | ❌ | 👁️ View | ❌ | ❌ | ✅ Full | ❌ |
| **Weekly Period Timetable Builder** | ❌ | ✅ Full | ✅ Full | 👁️ View Class | ❌ | ❌ |
| **Homework Creation & Online Grading** | ❌ | 👁️ View | ✅ Full | 📥 Submit | ❌ | ❌ |
| **Curriculum & Syllabus Progress Tracker** | ❌ | 👁️ View | ✅ Log Units | 👁️ View Progress | ❌ | ❌ |
| **Study Material & Digital Library** | ❌ | ✅ Full | ✅ Upload | 📥 Download | ❌ | ❌ |
| **Campus Assets & Maintenance Tickets** | ❌ | ✅ Approve | 🛠️ Report | ❌ | ❌ | ❌ |
| **Faculty Training Workshops** | ❌ | 👁️ View | ✍️ Attend | ❌ | ✅ Plan & Log | ❌ |
| **School Calendar & Event Planning** | ❌ | ✅ Full | 👁️ View | 👁️ View | ✅ Manage | 👁️ View |
| **Official Notices & Circulars** | ❌ | ✅ Publish | ✅ Publish | 👁️ View | ✅ Publish | 👁️ View |
| **Parent-Teacher Meeting (PTM) Portal** | ❌ | 👁️ View | 👁️ Consult | 📅 Schedule | ❌ | ❌ |
| **Faculty & Course Feedback** | ❌ | 👁️ View | 👁️ View Ratings | ⭐ Submit | ❌ | ❌ |
| **School Fleet & Vehicle Management** | ❌ | ✅ Full | ❌ | 👁️ Transport | ❌ | ❌ |
