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
use App\Http\Controllers\Api\Accounts\VendorPurchaseController;
use App\Http\Controllers\Api\Accounts\FeePaymentController;
use App\Http\Controllers\Api\Accounts\FeeConcessionController;
use App\Http\Controllers\Api\Accounts\FeeRefundController;
use App\Http\Controllers\Api\Accounts\FeeReportController;
use App\Http\Controllers\Api\SuperAdmin\SuperAdminController;
use App\Http\Controllers\Api\TeacherSelfController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\Sports\SportsController;
use App\Http\Controllers\Api\Admin\AcademicYearController;
use App\Http\Controllers\Api\Admin\SchoolSettingsController;
use App\Http\Controllers\Api\Admin\AuditLogController;
use App\Http\Controllers\Api\Admin\CommunicationCampaignController;
use App\Http\Controllers\Api\Admin\CommunicationTemplateController;
use App\Http\Controllers\Api\Admin\CommunicationLogController;
use App\Http\Controllers\Api\Communication\PushTokenController;
use App\Http\Controllers\Api\Communication\OptOutController;
use App\Http\Controllers\Api\Webhooks\WhatsAppWebhookController;
use App\Http\Controllers\Api\Webhooks\SmsWebhookController;
use App\Http\Controllers\Api\MediaFileController;
use App\Http\Controllers\Api\Admin\GradingScaleController;
use App\Http\Controllers\Api\Admin\TeacherAllocationController;
use App\Http\Controllers\Api\Admin\StudentEnrollmentController;
use App\Http\Controllers\Api\Admin\ExamScheduleController;
use App\Http\Controllers\Api\Admin\ExamReportController;
use App\Http\Controllers\Api\Teacher\ScoresheetController;
use App\Http\Controllers\Api\StudentParent\ExamResultController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Authentication & Public Assets & Inbound Webhooks
Route::prefix('v1')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::get('/settings/public', [SchoolSettingsController::class, 'publicConfig']);
    Route::get('/files/public/{token}', [MediaFileController::class, 'publicStream']);

    // Inbound Webhooks (Unauthenticated, identified strictly by school webhook_key)
    Route::get('/webhooks/whatsapp/{webhook_key}', [WhatsAppWebhookController::class, 'verify']);
    Route::post('/webhooks/whatsapp/{webhook_key}', [WhatsAppWebhookController::class, 'handle']);
    Route::match(['get', 'post'], '/webhooks/sms/{webhook_key}', [SmsWebhookController::class, 'handle']);
});

// Protected Routes (Sanctum)
Route::prefix('v1')->middleware(['auth:sanctum', 'resolve.school'])->group(function () {
    // Academic Year Context (All Authenticated)
    Route::get('/academic-years', [AcademicYearController::class, 'index']);
    Route::post('/academic-years/switch', [AcademicYearController::class, 'switchYear']);

    // Device Push Token registration (All authenticated users)
    Route::post('/communication/push/register-token', [PushTokenController::class, 'registerToken']);

    // Media & Document Vault
    Route::post('/files/upload', [MediaFileController::class, 'upload']);
    Route::get('/files/{token}/preview', [MediaFileController::class, 'preview']);
    Route::get('/files/{token}/download', [MediaFileController::class, 'download']);

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

    // Teachers Directory (Accessible to Admin, Teacher, HR)
    Route::get('admin/teachers', [TeacherController::class, 'index'])->middleware('role:admin,teacher,hr');

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

        // Academic Years Management (Admin CRUD)
        Route::post('academic-years', [AcademicYearController::class, 'store']);
        Route::put('academic-years/{id}', [AcademicYearController::class, 'update']);
        Route::post('academic-years/{id}/set-current', [AcademicYearController::class, 'setCurrent']);
        Route::delete('academic-years/{id}', [AcademicYearController::class, 'destroy']);

        // School Settings Management
        Route::get('settings', [SchoolSettingsController::class, 'index']);
        Route::post('settings', [SchoolSettingsController::class, 'updateGroup']);
        Route::post('settings/regenerate-webhook-key', [SchoolSettingsController::class, 'regenerateWebhookKey']);

        // System Audit Trail Logs
        Route::get('audit-logs', [AuditLogController::class, 'index']);

        // Communication Module (Admin Broadcasts, Templates, Logs, Opt-Outs)
        Route::get('communication/campaigns', [CommunicationCampaignController::class, 'index']);
        Route::post('communication/campaigns', [CommunicationCampaignController::class, 'store']);
        Route::post('communication/campaigns/preview', [CommunicationCampaignController::class, 'preview']);
        Route::get('communication/campaigns/{id}', [CommunicationCampaignController::class, 'show']);
        Route::post('communication/campaigns/{id}/cancel', [CommunicationCampaignController::class, 'cancel']);
        Route::post('communication/campaigns/{id}/retry-failed', [CommunicationCampaignController::class, 'retryFailed']);

        Route::apiResource('communication/templates', CommunicationTemplateController::class);

        Route::get('communication/logs', [CommunicationLogController::class, 'index']);
        Route::post('communication/logs/{id}/retry', [CommunicationLogController::class, 'retry']);

        Route::get('communication/push-tokens', [PushTokenController::class, 'index']);
        Route::get('communication/opt-outs', [OptOutController::class, 'index']);
        Route::post('communication/opt-outs', [OptOutController::class, 'store']);
        Route::delete('communication/opt-outs/{id}', [OptOutController::class, 'destroy']);

        // --- Batch 3: Examinations & Results (Admin) ---
        Route::apiResource('grading-scales', GradingScaleController::class);
        Route::get('teacher-assignments', [TeacherAllocationController::class, 'index']);
        Route::post('teacher-assignments', [TeacherAllocationController::class, 'store']);
        Route::delete('teacher-assignments/{id}', [TeacherAllocationController::class, 'destroy']);
        Route::get('class-teacher-assignments', [TeacherAllocationController::class, 'classTeachersIndex']);
        Route::post('class-teacher-assignments', [TeacherAllocationController::class, 'classTeachersStore']);
        Route::get('student-enrollments', [StudentEnrollmentController::class, 'index']);
        Route::post('student-enrollments', [StudentEnrollmentController::class, 'store']);
        Route::delete('student-enrollments/{id}', [StudentEnrollmentController::class, 'destroy']);
        Route::get('exams/terms', [ExamScheduleController::class, 'listTerms']);
        Route::post('exams/terms', [ExamScheduleController::class, 'storeTerm']);
        Route::post('exams/schedules', [ExamScheduleController::class, 'storeExam']);
        Route::post('exams/{id}/verify', [ExamScheduleController::class, 'verifyExam']);
        Route::post('exams/{id}/lock', [ExamScheduleController::class, 'lockExam']);
        Route::post('exams/{id}/unlock', [ExamScheduleController::class, 'unlockExam']);
        Route::post('exams/terms/{id}/publish', [ExamScheduleController::class, 'publishTerm']);
        Route::post('exams/terms/{id}/broadcast', [ExamScheduleController::class, 'broadcastNotification']);
        Route::get('settings/audit-retention', [ExamReportController::class, 'getAuditRetention']);
        Route::post('settings/audit-retention', [ExamReportController::class, 'updateAuditRetention']);
        Route::post('exams/reports/bulk-generate', [ExamReportController::class, 'bulkGenerateReportCards']);
        Route::get('exams/reports/download-zip/{token}', [ExamReportController::class, 'downloadZip']);
    });

    // Teacher & Staff Self Operations (Accessible to Faculty and Employee Staff)
    Route::prefix('teacher')->middleware('role:teacher,admin,hr,accountant,sports_incharge,admission_officer')->group(function () {
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

        // Batch 3: Scoresheets & Remarks
        Route::get('/scoresheets/assigned', [ScoresheetController::class, 'assignedPapers']);
        Route::get('/scoresheets/{exam_id}', [ScoresheetController::class, 'examRoster']);
        Route::post('/scoresheets/{exam_id}/save-draft', [ScoresheetController::class, 'saveDraft']);
        Route::post('/scoresheets/{exam_id}/submit', [ScoresheetController::class, 'submitMarks']);
        Route::post('/remarks/{term_id}/{student_id}', [ScoresheetController::class, 'saveClassTeacherRemarks']);
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

        // Fees Summary, Ledger & Receipts
        Route::get('/fees', [FeeController::class, 'index']);
        Route::get('/fees/ledger', [FeeReportController::class, 'studentLedger']);
        Route::get('/fees/receipts/{id}/download', [FeePaymentController::class, 'downloadReceipt']);
        Route::get('/fees/installments/{id}/legacy-receipt', [FeePaymentController::class, 'legacyInstallmentReceipt']);

        // Batch 3: Academic Results & Report Card
        Route::get('/results', [ExamResultController::class, 'index']);
        Route::get('/results/report-card/{term_id}/pdf', [ExamResultController::class, 'downloadReportCard']);

        // Faculty & Academic Feedback
        Route::get('/feedback', [FeedbackController::class, 'index']);
        Route::post('/feedback', [FeedbackController::class, 'store']);
        Route::delete('/feedback/{id}', [FeedbackController::class, 'destroy']);

        // Parent-Teacher Meeting (PTM) Portal
        Route::get('/ptm', [PtmController::class, 'index']);
        Route::post('/ptm/reschedule', [PtmController::class, 'reschedule']);

        // Study Material & Digital Library
        Route::get('/study-material', [StudyMaterialController::class, 'index']);
        Route::get('/study-materials', [StudyMaterialController::class, 'index']);
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
        Route::delete('/trainings/{id}', [HRController::class, 'destroyTraining']);
        Route::get('/teachers', [TeacherController::class, 'index']);
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
        Route::get('/fee-templates', [AccountsController::class, 'feeTemplates']);
        Route::post('/fees/{id}/remind', [AccountsController::class, 'sendFeeReminder']);
        Route::post('/fees/bulk-remind', [AccountsController::class, 'sendBulkFeeReminders']);

        // Batch 2: Advanced Fee Management (Payments, Cheques, Receipts, Ledgers, Reports)
        Route::post('/fees/preview-allocation', [FeePaymentController::class, 'previewAllocation']);
        Route::post('/fees/collect', [FeePaymentController::class, 'collect']);
        Route::post('/fees/payments/{id}/clear-cheque', [FeePaymentController::class, 'clearCheque']);
        Route::post('/fees/payments/{id}/bounce-cheque', [FeePaymentController::class, 'bounceCheque']);
        Route::post('/fees/payments/{id}/void', [FeePaymentController::class, 'voidPayment'])->middleware('role:admin,super_admin');
        Route::get('/fees/payments/{id}/receipt', [FeePaymentController::class, 'downloadReceipt']);
        Route::get('/fees/installments/{id}/legacy-receipt', [FeePaymentController::class, 'legacyInstallmentReceipt']);

        // Concessions & Scholarships
        Route::get('/fees/concession-types', [FeeConcessionController::class, 'typesList']);
        Route::post('/fees/concession-types', [FeeConcessionController::class, 'storeType'])->middleware('role:admin,super_admin');
        Route::post('/fees/concessions/apply', [FeeConcessionController::class, 'apply']);
        Route::post('/fees/concessions/{id}/approve', [FeeConcessionController::class, 'approve'])->middleware('role:admin,super_admin');
        Route::post('/fees/concessions/{id}/revoke', [FeeConcessionController::class, 'revoke'])->middleware('role:admin,super_admin');

        // Refunds & Disbursements
        Route::post('/fees/refunds/request', [FeeRefundController::class, 'requestRefund']);
        Route::post('/fees/refunds/{id}/approve', [FeeRefundController::class, 'approve'])->middleware('role:admin,super_admin');

        // Reports, Defaulters & Ledger
        Route::get('/fees/reports/daily-collection', [FeeReportController::class, 'dailyCollection']);
        Route::get('/fees/reports/defaulters', [FeeReportController::class, 'defaulters']);
        Route::get('/fees/students/{studentId}/ledger', [FeeReportController::class, 'studentLedger']);
        Route::post('/fees/waive-fine', [FeeReportController::class, 'waiveFine'])->middleware('role:admin,super_admin');

        // Batch 3: Academic Examination Analytics & Exports
        Route::get('/exams/analytics/class-summary', [ExamReportController::class, 'classSummary'])->middleware('role:admin,super_admin,teacher');
        Route::get('/exams/analytics/export-csv', [ExamReportController::class, 'exportCsv'])->middleware('role:admin,super_admin,teacher');


        // School Expenses & Resource Expenditure
        Route::get('/expenses', [AccountsController::class, 'expensesList']);
        Route::post('/expenses', [AccountsController::class, 'storeExpense']);
        Route::delete('/expenses/{id}', [AccountsController::class, 'destroyExpense']);

        // Staff Salary Disbursement Requests (HR to Accounts Workflow & Direct Staff Recording)
        Route::get('/salary-disbursements', [AccountsController::class, 'disbursementRequests']);
        Route::post('/salary-disbursements/record-staff', [AccountsController::class, 'recordStaffSalaryDisbursement']);
        Route::post('/salary-disbursements/{id}/action', [AccountsController::class, 'actionDisbursementRequest']);

        // Vendor Management & Sales/Purchase Orders
        Route::middleware('role:accountant,admin')->group(function () {
            Route::get('/vendors', [VendorPurchaseController::class, 'vendorsList']);
            Route::post('/vendors', [VendorPurchaseController::class, 'storeVendor']);
            Route::put('/vendors/{id}', [VendorPurchaseController::class, 'updateVendor']);
            Route::delete('/vendors/{id}', [VendorPurchaseController::class, 'destroyVendor']);

            Route::get('/purchase-orders', [VendorPurchaseController::class, 'ordersList']);
            Route::get('/purchase-orders/{id}', [VendorPurchaseController::class, 'showOrder']);
            Route::post('/purchase-orders', [VendorPurchaseController::class, 'storeOrder']);
            Route::patch('/purchase-orders/{id}/status', [VendorPurchaseController::class, 'updateOrderStatus']);
            Route::patch('/purchase-orders/{id}/payment', [VendorPurchaseController::class, 'updatePaymentStatus']);
            Route::delete('/purchase-orders/{id}', [VendorPurchaseController::class, 'destroyOrder']);
            Route::get('/procurement-resources', [VendorPurchaseController::class, 'availableResources']);
        });
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

    // -------------------------------------------------------------
    // SPORTS & ATHLETICS MODULE ROUTES
    // -------------------------------------------------------------
    Route::prefix('sports')->middleware('role:sports_incharge,admin')->group(function () {
        Route::get('/dashboard', [SportsController::class, 'dashboard']);
        
        // Sports Disciplines
        Route::get('/disciplines', [SportsController::class, 'sportsList']);
        Route::get('/activities', [SportsController::class, 'sportsList']);
        Route::post('/disciplines', [SportsController::class, 'storeSport']);
        Route::put('/disciplines/{id}', [SportsController::class, 'updateSport']);
        Route::delete('/disciplines/{id}', [SportsController::class, 'destroySport']);

        // Competitions & Tournaments
        Route::get('/competitions', [SportsController::class, 'competitionsList']);
        Route::post('/competitions', [SportsController::class, 'storeCompetition']);
        Route::put('/competitions/{id}', [SportsController::class, 'updateCompetition']);
        Route::delete('/competitions/{id}', [SportsController::class, 'destroyCompetition']);

        // Participants & Student Attendance
        Route::get('/participants', [SportsController::class, 'participantsList']);
        Route::post('/participants', [SportsController::class, 'enrollParticipant']);
        Route::patch('/participants/{id}/attendance', [SportsController::class, 'updateParticipantAttendance']);
        Route::patch('/participants/{id}/achievement', [SportsController::class, 'recordAchievement']);
        Route::delete('/participants/{id}', [SportsController::class, 'destroyParticipant']);
        Route::get('/available-students', [SportsController::class, 'availableStudents']);

        // Profile
        Route::get('/profile', [SportsController::class, 'profile']);
        Route::put('/profile', [SportsController::class, 'updateProfile']);

        // Facilities & Grounds
        Route::get('/facilities', [SportsController::class, 'facilitiesList']);
        Route::post('/facilities', [SportsController::class, 'storeFacility']);
        Route::put('/facilities/{id}', [SportsController::class, 'updateFacility']);
        Route::delete('/facilities/{id}', [SportsController::class, 'destroyFacility']);

        // Training & Practice Schedules
        Route::get('/schedules', [SportsController::class, 'schedulesList']);
        Route::post('/schedules', [SportsController::class, 'storeSchedule']);
        Route::put('/schedules/{id}', [SportsController::class, 'updateSchedule']);
        Route::delete('/schedules/{id}', [SportsController::class, 'destroySchedule']);

        // Equipment & Inventory
        Route::get('/equipment', [SportsController::class, 'equipmentList']);
        Route::post('/equipment', [SportsController::class, 'storeEquipment']);
        Route::put('/equipment/{id}', [SportsController::class, 'updateEquipment']);
        Route::delete('/equipment/{id}', [SportsController::class, 'destroyEquipment']);
        Route::post('/equipment/issue', [SportsController::class, 'issueEquipment']);
        Route::post('/equipment/issues/{id}/return', [SportsController::class, 'returnEquipment']);

        // Athletic Fitness & Health Assessments
        Route::get('/fitness', [SportsController::class, 'fitnessAssessmentsList']);
        Route::post('/fitness', [SportsController::class, 'storeFitnessAssessment']);
        Route::delete('/fitness/{id}', [SportsController::class, 'destroyFitnessAssessment']);
    });

    // -------------------------------------------------------------
    // BATCH 3: ACADEMIC EXAMINATION ANALYTICS & EXPORTS
    // -------------------------------------------------------------
    Route::get('/exams/analytics/class-summary', [ExamReportController::class, 'classSummary'])->middleware('role:admin,super_admin,teacher');
    Route::get('/exams/analytics/export-csv', [ExamReportController::class, 'exportCsv'])->middleware('role:admin,super_admin,teacher');

    // -------------------------------------------------------------
    // MULTI-SCHOOL / MULTI-BRANCH CAMPUS SWITCHER
    // -------------------------------------------------------------
    Route::get('/schools/branches', [BranchController::class, 'branches']);
    Route::post('/schools/switch-branch', [BranchController::class, 'switchBranch'])->middleware('role:admin,super_admin');
});

