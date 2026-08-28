<?php

use App\Http\Controllers\Api\Admin\AcademicController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdmissionController;
use App\Http\Controllers\Api\Admin\AttendanceController;
use App\Http\Controllers\Api\Admin\ResourceController;
use App\Http\Controllers\Api\Admin\StudentController;
use App\Http\Controllers\Api\Admin\TeacherController;
use App\Http\Controllers\Api\Admin\VehicleController;
use App\Http\Controllers\Api\Admin\FeeStructureController;
use App\Http\Controllers\Api\AssignmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\StudentParent\FeeController;
use App\Http\Controllers\Api\StudentParent\FeedbackController;
use App\Http\Controllers\Api\StudentParent\NoticeController;
use App\Http\Controllers\Api\StudentParent\PtmController;
use App\Http\Controllers\Api\StudentParent\SchoolCalendarController;
use App\Http\Controllers\Api\StudentParent\StudentAttendanceController;
use App\Http\Controllers\Api\StudentParent\StudentDashboardController;
use App\Http\Controllers\Api\StudentParent\StudyMaterialController;
use App\Http\Controllers\Api\StudentParent\SyllabusController;
use App\Http\Controllers\Api\StudentParent\TimetableController;
use App\Http\Controllers\Api\HR\HRController;
use App\Http\Controllers\Api\Accounts\AccountsController;
use App\Http\Controllers\Api\SuperAdmin\SuperAdminController;
use App\Http\Controllers\Api\TeacherSelfController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Authentication
Route::prefix('v1/auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// Protected Routes (Sanctum)
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    // Auth actions
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

    // Notifications (All authenticated users)
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);

    // Assignments & Homework Management (Dynamic per class & student)
    Route::get('/assignments', [AssignmentController::class, 'index']);
    Route::post('/assignments', [AssignmentController::class, 'store'])->middleware('role:teacher,admin');
    Route::get('/assignments/{id}', [AssignmentController::class, 'show']);
    Route::get('/assignments/{id}/submissions', [AssignmentController::class, 'submissions'])->middleware('role:teacher,admin');
    Route::post('/assignments/{id}/submit', [AssignmentController::class, 'submitWork']);
    Route::post('/assignments/{id}/grade/{submissionId}', [AssignmentController::class, 'gradeSubmission'])->middleware('role:teacher,admin');

    // Academic Structure (Accessible to Admin, Teacher, Student)
    Route::get('/admin/academic/classes', [AcademicController::class, 'classes']);
    Route::get('/admin/academic/subjects', [AcademicController::class, 'subjects']);

    // Students Directory
    Route::get('admin/students', [StudentController::class, 'index'])->middleware('role:admin,teacher');
    Route::get('admin/students/{student}', [StudentController::class, 'show'])->middleware('role:admin,teacher');

    // Teachers Directory (Accessible to Admin, Teacher)
    Route::get('admin/teachers', [TeacherController::class, 'index'])->middleware('role:admin,teacher');

    // Attendance (Accessible to Admin, Teacher)
    Route::get('/admin/attendance', [AttendanceController::class, 'index'])->middleware('role:admin,teacher');
    Route::post('/admin/attendance', [AttendanceController::class, 'store'])->middleware('role:admin,teacher');

    // Admin Module
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        // Dashboard stats
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);

        // Academic Structure
        Route::post('/academic/classes', [AcademicController::class, 'storeClass']);

        // Students Management (Admin Only Full CRUD)
        Route::apiResource('students', StudentController::class)->except(['index', 'show']);
        Route::post('students/{student}/reset-password', [StudentController::class, 'resetPassword']);

        // Teachers (Staff Management)
        Route::apiResource('teachers', TeacherController::class)->except(['index']);
        Route::post('teachers/{teacher}/reset-password', [TeacherController::class, 'resetPassword']);

        // Admissions Pipeline
        Route::apiResource('admissions', AdmissionController::class);
        Route::patch('admissions/{admission}/status', [AdmissionController::class, 'updateStatus']);
        Route::post('admissions/{admission}/enroll', [AdmissionController::class, 'enroll']);

        // School Transport / Vehicles
        Route::apiResource('vehicles', VehicleController::class);

        // School Resources & Assets & Maintenance Requests
        Route::get('resources/requests', [ResourceController::class, 'requests']);
        Route::post('resources/requests/{id}/action', [ResourceController::class, 'actionRequest']);
        Route::apiResource('resources', ResourceController::class);

        // School Calendar & Events (Admin & HR)
        Route::get('events', [SchoolCalendarController::class, 'index']);
        Route::post('events', [SchoolCalendarController::class, 'store']);
        Route::put('events/{id}', [SchoolCalendarController::class, 'update']);
        Route::delete('events/{id}', [SchoolCalendarController::class, 'destroy']);

        // Standard-wise Fee Structure & Installment Schedule Management
        Route::get('fee-structures', [FeeStructureController::class, 'index']);
        Route::get('fee-structures/{classId}', [FeeStructureController::class, 'show']);
        Route::post('fee-structures', [FeeStructureController::class, 'storeOrUpdate']);
        Route::post('fee-structures/{id}/sync-students', [FeeStructureController::class, 'syncStudents']);
        Route::delete('fee-structures/{id}', [FeeStructureController::class, 'destroy']);
    });

    // Teacher & Staff Self Operations (Accessible to Teacher, HR, Admin)
    Route::prefix('teacher')->middleware('role:teacher,admin,hr')->group(function () {
        // Teacher Realtime Dashboard
        Route::get('/dashboard', [TeacherSelfController::class, 'dashboard']);

        // Teacher Resources & Issue Requests
        Route::get('/resources', [ResourceController::class, 'index']);
        Route::get('/resources/requests', [ResourceController::class, 'requests']);
        Route::post('/resources/requests', [ResourceController::class, 'storeRequest']);

        // Timetable creation & schedule
        Route::get('/schedule', [TeacherSelfController::class, 'schedule']);

        // Teacher Attendance punch & history
        Route::get('/my-attendance', [TeacherSelfController::class, 'attendance']);
        Route::post('/punch', [TeacherSelfController::class, 'punch']);

        // Teacher Profile
        Route::get('/profile', [TeacherSelfController::class, 'profile']);
        Route::put('/profile', [TeacherSelfController::class, 'updateProfile']);

        // Teacher Leave Balance & Apply
        Route::get('/leaves', [TeacherSelfController::class, 'leaveBalance']);
        Route::post('/leaves/apply', [TeacherSelfController::class, 'applyLeave']);

        // Student Directory & Academic (Read-Only for Teacher)
        Route::get('/classes', [AcademicController::class, 'classes']);
        Route::get('/subjects', [AcademicController::class, 'subjects']);
        Route::get('/attendance', [AttendanceController::class, 'index']);
        Route::post('/attendance', [AttendanceController::class, 'store']);
        Route::get('/students', [StudentController::class, 'index']);
        Route::get('/students/{student}', [StudentController::class, 'show']);
        Route::get('/teachers', [TeacherController::class, 'index']);
        Route::get('/trainings', [HRController::class, 'trainings']);
    });

    // -------------------------------------------------------------
    // STUDENT & PARENT COMPLETE MODULE ROUTES
    // -------------------------------------------------------------
    Route::prefix('student')->group(function () {
        // Dashboard
        Route::get('/dashboard', [StudentDashboardController::class, 'index']);

        // Profile
        Route::get('/profile', [StudentController::class, 'profile']);
        Route::put('/profile', [StudentController::class, 'updateProfile']);

        // Attendance, Leaves & Heatmap
        Route::get('/attendance', [StudentAttendanceController::class, 'index']);
        Route::post('/leaves/apply', [StudentAttendanceController::class, 'applyLeave']);

        // Fees & Payment Gateway
        Route::get('/fees', [FeeController::class, 'index']);
        Route::post('/fees/pay', [FeeController::class, 'payFee']);

        // Faculty & Academic Feedback
        Route::get('/feedback', [FeedbackController::class, 'index']);
        Route::post('/feedback', [FeedbackController::class, 'store']);
        Route::delete('/feedback/{id}', [FeedbackController::class, 'destroy']);

        // Parent-Teacher Meeting (PTM) Portal
        Route::get('/ptm', [PtmController::class, 'index']);
        Route::post('/ptm/reschedule', [PtmController::class, 'reschedule']);

        // Study Material & Digital Library
        Route::get('/study-material', [StudyMaterialController::class, 'index']);
        Route::post('/study-material', [StudyMaterialController::class, 'store'])->middleware('role:teacher,admin');
        Route::post('/study-material/{id}/download', [StudyMaterialController::class, 'download']);
        Route::delete('/study-material/{id}', [StudyMaterialController::class, 'destroy'])->middleware('role:teacher,admin');

        // Syllabus & Progress Logs
        Route::get('/syllabus', [SyllabusController::class, 'index']);
        Route::post('/syllabus/progress', [SyllabusController::class, 'storeLog'])->middleware('role:teacher,admin');
        Route::delete('/syllabus/progress/{id}', [SyllabusController::class, 'deleteLog'])->middleware('role:teacher,admin');

        // School Period Timetable (Class specific & Teacher editor)
        Route::get('/timetable', [TimetableController::class, 'index']);
        Route::get('/timetable/all-slots', [TimetableController::class, 'allSlots']);
        Route::post('/timetable', [TimetableController::class, 'store'])->middleware('role:teacher,admin');
        Route::post('/timetable/bulk', [TimetableController::class, 'saveBulk'])->middleware('role:teacher,admin');
        Route::post('/timetable/clear-day', [TimetableController::class, 'clearDay'])->middleware('role:teacher,admin');
        Route::delete('/timetable/{id}', [TimetableController::class, 'destroy'])->middleware('role:teacher,admin');

        // School Calendar & Events (Posted by HR/Admin)
        Route::get('/calendar', [SchoolCalendarController::class, 'index']);
        Route::post('/calendar', [SchoolCalendarController::class, 'store'])->middleware('role:admin,hr');
        Route::put('/calendar/{id}', [SchoolCalendarController::class, 'update'])->middleware('role:admin,hr');
        Route::delete('/calendar/{id}', [SchoolCalendarController::class, 'destroy'])->middleware('role:admin,hr');

        // School Notices & Circulars
        Route::get('/notices', [NoticeController::class, 'index']);
        Route::post('/notices', [NoticeController::class, 'store'])->middleware('role:admin,teacher,hr');
        Route::delete('/notices/{id}', [NoticeController::class, 'destroy'])->middleware('role:admin,teacher,hr');
    });

    // -------------------------------------------------------------
    // HR OPERATIONS & MANAGEMENT MODULE ROUTES
    // -------------------------------------------------------------
    Route::prefix('hr')->middleware('role:hr,admin')->group(function () {
        Route::get('/dashboard', [HRController::class, 'dashboard']);
        Route::get('/profile', [HRController::class, 'profile']);
        Route::put('/profile', [HRController::class, 'updateProfile']);
        Route::get('/salaries', [HRController::class, 'salaries']);
        Route::put('/salaries/{id}', [HRController::class, 'updateStaffSalary']);
        Route::post('/salaries/{id}', [HRController::class, 'updateStaffSalary']);
        Route::post('/salaries/disburse', [HRController::class, 'disburseSalary']);
        Route::post('/salaries/request-disbursement', [HRController::class, 'requestSalaryDisbursement']);
        Route::get('/staff-attendance', [HRController::class, 'staffAttendance']);
        Route::post('/staff-attendance/mark', [HRController::class, 'markStaffAttendance']);
        Route::get('/leaves', [HRController::class, 'leaves']);
        Route::post('/leaves/{id}/action', [HRController::class, 'actionLeave']);
        Route::get('/trainings', [HRController::class, 'trainings']);
        Route::post('/trainings', [HRController::class, 'storeTraining']);
        Route::get('/events', [HRController::class, 'events']);
        Route::post('/events', [HRController::class, 'storeEvent']);
        Route::delete('/events/{id}', [HRController::class, 'destroyEvent']);
    });

    // -------------------------------------------------------------
    // ACCOUNTS & FINANCE OPERATIONS MODULE ROUTES
    // -------------------------------------------------------------
    Route::prefix('accounts')->middleware('role:accountant,admin')->group(function () {
        // Realtime Dashboard Metrics
        Route::get('/dashboard', [AccountsController::class, 'dashboard']);

        // Profile View & Update
        Route::get('/profile', [AccountsController::class, 'profile']);
        Route::put('/profile', [AccountsController::class, 'updateProfile']);

        // Student Fees Management & Reminders
        Route::get('/fees', [AccountsController::class, 'feesList']);
        Route::post('/fees/{id}/pay', [AccountsController::class, 'recordFeePayment']);
        Route::post('/fees/{id}/remind', [AccountsController::class, 'sendFeeReminder']);
        Route::post('/fees/bulk-remind', [AccountsController::class, 'sendBulkFeeReminders']);

        // School Expenses & Resource Expenditure
        Route::get('/expenses', [AccountsController::class, 'expensesList']);
        Route::post('/expenses', [AccountsController::class, 'storeExpense']);
        Route::delete('/expenses/{id}', [AccountsController::class, 'destroyExpense']);

        // Staff Salary Disbursement Requests (HR to Accounts Workflow & Direct Staff Recording)
        Route::get('/salary-disbursements', [AccountsController::class, 'disbursementRequests']);
        Route::post('/salary-disbursements/record-staff', [AccountsController::class, 'recordStaffSalaryDisbursement']);
        Route::post('/salary-disbursements/{id}/action', [AccountsController::class, 'actionDisbursementRequest']);
    });

    // -------------------------------------------------------------
    // SUPER ADMIN (SAAS PLATFORM / COMPANY CONTROL) MODULE ROUTES
    // -------------------------------------------------------------
    Route::prefix('super-admin')->middleware('role:super_admin')->group(function () {
        // Platform Overview Dashboard
        Route::get('/dashboard', [SuperAdminController::class, 'dashboard']);

        // Multi-Tenant School Management
        Route::get('/schools', [SuperAdminController::class, 'schoolsList']);
        Route::post('/schools', [SuperAdminController::class, 'storeSchool']);
        Route::get('/schools/{id}', [SuperAdminController::class, 'showSchool']);
        Route::put('/schools/{id}', [SuperAdminController::class, 'updateSchool']);
        Route::patch('/schools/{id}/toggle-status', [SuperAdminController::class, 'toggleSchoolStatus']);
        Route::post('/schools/{id}/reset-admin-password', [SuperAdminController::class, 'resetSchoolAdminPassword']);
        Route::delete('/schools/{id}', [SuperAdminController::class, 'destroySchool']);
    });
});

