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

// Ajay's additional modules
use App\Http\Controllers\Api\LibraryController;
use App\Http\Controllers\Api\LeaveTypeController;
use App\Http\Controllers\Api\ReportCardController;
use App\Http\Controllers\Api\MarksheetController;
use App\Http\Controllers\Api\UdisePlusController;

// Prathamesh's additional modules
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
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');
    Route::get('/settings/public', [SchoolSettingsController::class, 'publicConfig']);
    Route::get('/files/public/{token}', [MediaFileController::class, 'publicStream']);

    // Inbound Webhooks
    Route::get('/webhooks/whatsapp/{webhook_key}', [WhatsAppWebhookController::class, 'verify']);
    Route::post('/webhooks/whatsapp/{webhook_key}', [WhatsAppWebhookController::class, 'handle']);
    Route::match(['get', 'post'], '/webhooks/sms/{webhook_key}', [SmsWebhookController::class, 'handle']);
});

// Driver Mobile Phone GPS Broadcast
Route::prefix('v1/driver')->middleware('throttle:tracking')->group(function () {
    Route::get('/vehicles', [VehicleController::class, 'driverVehiclesList']);
    Route::get('/vehicle/{id}', [VehicleController::class, 'liveTelemetry'])->whereNumber('id');
    Route::post('/gps-ping', [VehicleController::class, 'driverPing']);
    Route::post('/toggle-trip', [VehicleController::class, 'toggleDriverTrip']);
});

// Protected Routes (Sanctum)
Route::prefix('v1')->middleware(['auth:sanctum', 'resolve.school', 'throttle:api'])->group(function () {

    // Academic Year Context
    Route::get('/academic-years', [AcademicYearController::class, 'index']);
    Route::post('/academic-years/switch', [AcademicYearController::class, 'switchYear']);

    // Device Push Token Registration
    Route::post('/communication/push/register-token', [PushTokenController::class, 'registerToken']);

    // Media & Document Vault
    Route::post('/files/upload', [MediaFileController::class, 'upload']);
    Route::get('/files/{token}/preview', [MediaFileController::class, 'preview']);
    Route::get('/files/{token}/download', [MediaFileController::class, 'download']);

    // Auth Actions
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::put('/auth/me', [AuthController::class, 'updateProfile']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->whereNumber('id');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);

    // Assignments & Homework Management
    Route::get('/assignments', [AssignmentController::class, 'index']);
    Route::post('/assignments', [AssignmentController::class, 'store'])->middleware('role:teacher,admin');
    Route::get('/assignments/{id}', [AssignmentController::class, 'show'])->whereNumber('id');
    Route::get('/assignments/{id}/submissions', [AssignmentController::class, 'submissions'])->whereNumber('id')->middleware('role:teacher,admin');
    Route::post('/assignments/{id}/submit', [AssignmentController::class, 'submitWork'])->whereNumber('id');
    Route::post('/assignments/{id}/grade/{submissionId}', [AssignmentController::class, 'gradeSubmission'])->whereNumber(['id', 'submissionId'])->middleware('role:teacher,admin');

    // Academic Structure
    Route::get('/admin/academic/classes', [AcademicController::class, 'classes']);
    Route::get('/admin/academic/subjects', [AcademicController::class, 'subjects']);
    Route::get('/academic/classes', [AcademicController::class, 'classes']);
    Route::get('/academic/subjects', [AcademicController::class, 'subjects']);
    Route::get('/exams/terms', [ExamScheduleController::class, 'listTerms']);

    // Students Directory
    Route::get('admin/students', [StudentController::class, 'index'])->middleware('role:admin,teacher,librarian');
    Route::get('admin/students/{student}', [StudentController::class, 'show'])->whereNumber('student')->middleware('role:admin,teacher,librarian');

    // Teachers Directory
    Route::get('admin/teachers', [TeacherController::class, 'index'])->middleware('role:admin,teacher,hr');

    // Attendance
    Route::get('/admin/attendance', [AttendanceController::class, 'index'])->middleware('role:admin,teacher');
    Route::post('/admin/attendance', [AttendanceController::class, 'store'])->middleware('role:admin,teacher');

    // Student Report Cards & Academic Evaluations
    Route::prefix('report-cards')->middleware('role:admin,teacher')->group(function () {
        Route::get('/filters', [ReportCardController::class, 'filters']);
        Route::get('/generate', [ReportCardController::class, 'generate']);
        Route::get('/pdf/{studentId}', [ReportCardController::class, 'pdf'])->whereNumber('studentId');
        Route::get('/bulk-zip', [ReportCardController::class, 'bulkZip']);
        Route::post('/save-marks', [ReportCardController::class, 'saveMarks']);
    });

    // Admin Module
    Route::prefix('admin')->middleware('role:admin')->group(function () {

        // Dashboard
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);

        // Academic Structure
        Route::post('/academic/classes', [AcademicController::class, 'storeClass']);

        // Students Management
        Route::apiResource('students', StudentController::class)->except(['index', 'show'])->whereNumber('student');
        Route::post('students/{student}/reset-password', [StudentController::class, 'resetPassword'])->whereNumber('student');

        // Teachers
        Route::apiResource('teachers', TeacherController::class)->except(['index']);
        Route::post('teachers/{teacher}/reset-password', [TeacherController::class, 'resetPassword'])->whereNumber('teacher');

        // Admissions Pipeline
        Route::apiResource('admissions', AdmissionController::class);
        Route::patch('admissions/{admission}/status', [AdmissionController::class, 'updateStatus'])->whereNumber('admission');
        Route::post('admissions/{admission}/enroll', [AdmissionController::class, 'enroll'])->whereNumber('admission');

        // School Transport / Vehicles
        Route::get('vehicles/{id}/live-telemetry', [VehicleController::class, 'liveTelemetry'])->whereNumber('id')->withoutMiddleware('throttle:api')->middleware('throttle:tracking');
        Route::post('vehicles/{id}/driver-ping', [VehicleController::class, 'driverPing'])->whereNumber('id')->withoutMiddleware('throttle:api')->middleware('throttle:tracking');
        Route::post('vehicles/toggle-trip', [VehicleController::class, 'toggleDriverTrip'])->withoutMiddleware('throttle:api')->middleware('throttle:tracking');
        Route::put('vehicles/{id}/route', [VehicleController::class, 'updateRoute'])->whereNumber('id');
        Route::apiResource('vehicles', VehicleController::class);

        // School Resources
        Route::get('resources/requests', [ResourceController::class, 'requests']);
        Route::post('resources/requests/{id}/action', [ResourceController::class, 'actionRequest'])->whereNumber('id');
        Route::apiResource('resources', ResourceController::class);

        // School Calendar & Events
        Route::get('events', [SchoolCalendarController::class, 'index']);
        Route::post('events', [SchoolCalendarController::class, 'store']);
        Route::put('events/{id}', [SchoolCalendarController::class, 'update'])->whereNumber('id');
        Route::delete('events/{id}', [SchoolCalendarController::class, 'destroy'])->whereNumber('id');

        // Fee Structure
        Route::get('fee-structures', [FeeStructureController::class, 'index']);
        Route::get('fee-structures/{classId}', [FeeStructureController::class, 'show'])->whereNumber('classId');
        Route::post('fee-structures', [FeeStructureController::class, 'storeOrUpdate']);
        Route::post('fee-structures/{id}/sync-students', [FeeStructureController::class, 'syncStudents'])->whereNumber('id');
        Route::delete('fee-structures/{id}', [FeeStructureController::class, 'destroy'])->whereNumber('id');

        // Academic Years Management
        Route::post('academic-years', [AcademicYearController::class, 'store']);
        Route::put('academic-years/{id}', [AcademicYearController::class, 'update'])->whereNumber('id');
        Route::post('academic-years/{id}/set-current', [AcademicYearController::class, 'setCurrent'])->whereNumber('id');
        Route::delete('academic-years/{id}', [AcademicYearController::class, 'destroy'])->whereNumber('id');

        // School Settings
        Route::get('settings', [SchoolSettingsController::class, 'index']);
        Route::post('settings', [SchoolSettingsController::class, 'updateGroup']);
        Route::post('settings/regenerate-webhook-key', [SchoolSettingsController::class, 'regenerateWebhookKey']);

        // Audit Logs
        Route::get('audit-logs', [AuditLogController::class, 'index']);

        // Communication Campaigns
        Route::get('communication/campaigns', [CommunicationCampaignController::class, 'index']);
        Route::post('communication/campaigns', [CommunicationCampaignController::class, 'store']);
        Route::post('communication/campaigns/preview', [CommunicationCampaignController::class, 'preview']);
        Route::get('communication/campaigns/{id}', [CommunicationCampaignController::class, 'show'])->whereNumber('id');
        Route::post('communication/campaigns/{id}/cancel', [CommunicationCampaignController::class, 'cancel'])->whereNumber('id');
        Route::post('communication/campaigns/{id}/retry-failed', [CommunicationCampaignController::class, 'retryFailed'])->whereNumber('id');

        Route::apiResource('communication/templates', CommunicationTemplateController::class);

        Route::get('communication/logs', [CommunicationLogController::class, 'index']);
        Route::post('communication/logs/{id}/retry', [CommunicationLogController::class, 'retry'])->whereNumber('id');

        Route::get('communication/push-tokens', [PushTokenController::class, 'index']);
        Route::get('communication/opt-outs', [OptOutController::class, 'index']);
        Route::post('communication/opt-outs', [OptOutController::class, 'store']);
        Route::delete('communication/opt-outs/{id}', [OptOutController::class, 'destroy'])->whereNumber('id');

        // Examination Management
        Route::apiResource('grading-scales', GradingScaleController::class);

        Route::get('teacher-assignments', [TeacherAllocationController::class, 'index']);
        Route::post('teacher-assignments', [TeacherAllocationController::class, 'store']);
        Route::delete('teacher-assignments/{id}', [TeacherAllocationController::class, 'destroy'])->whereNumber('id');

        Route::get('class-teacher-assignments', [TeacherAllocationController::class, 'classTeachersIndex']);
        Route::post('class-teacher-assignments', [TeacherAllocationController::class, 'classTeachersStore']);

        Route::get('student-enrollments', [StudentEnrollmentController::class, 'index']);
        Route::post('student-enrollments', [StudentEnrollmentController::class, 'store']);
        Route::delete('student-enrollments/{id}', [StudentEnrollmentController::class, 'destroy'])->whereNumber('id');

        Route::get('exams/terms', [ExamScheduleController::class, 'listTerms']);
        Route::post('exams/terms', [ExamScheduleController::class, 'storeTerm']);
        Route::post('exams/schedules', [ExamScheduleController::class, 'storeExam']);
        Route::post('exams/{id}/verify', [ExamScheduleController::class, 'verifyExam'])->whereNumber('id');
        Route::post('exams/{id}/lock', [ExamScheduleController::class, 'lockExam'])->whereNumber('id');
        Route::post('exams/{id}/unlock', [ExamScheduleController::class, 'unlockExam'])->whereNumber('id');
        Route::post('exams/terms/{id}/publish', [ExamScheduleController::class, 'publishTerm'])->whereNumber('id');
        Route::post('exams/terms/{id}/broadcast', [ExamScheduleController::class, 'broadcastNotification'])->whereNumber('id');

        Route::get('settings/audit-retention', [ExamReportController::class, 'getAuditRetention']);
        Route::post('settings/audit-retention', [ExamReportController::class, 'updateAuditRetention']);

        Route::post('exams/reports/bulk-generate', [ExamReportController::class, 'bulkGenerateReportCards']);
        Route::get('exams/reports/download-zip/{token}', [ExamReportController::class, 'downloadZip']);
    });

    // Teacher & Staff Self Operations
    Route::prefix('teacher')->middleware(
        'role:teacher,admin,hr,librarian,accountant,staff,sports_incharge,admission_officer'
    )->group(function () {

        // Teacher Dashboard
        Route::get('/dashboard', [TeacherSelfController::class, 'dashboard']);

        // Teacher Resources
        Route::get('/resources', [ResourceController::class, 'index']);
        Route::get('/resources/requests', [ResourceController::class, 'requests']);
        Route::post('/resources/requests', [ResourceController::class, 'storeRequest']);

        // Timetable
        Route::get('/schedule', [TeacherSelfController::class, 'schedule']);

        // Teacher Attendance
        Route::get('/my-attendance', [TeacherSelfController::class, 'attendance']);
        Route::post('/punch', [TeacherSelfController::class, 'punch']);

        // Teacher Profile
        Route::get('/profile', [TeacherSelfController::class, 'profile']);
        Route::put('/profile', [TeacherSelfController::class, 'updateProfile']);

        // Teacher Leave
        Route::get('/leaves', [TeacherSelfController::class, 'leaveBalance']);
        Route::post('/leaves/apply', [TeacherSelfController::class, 'applyLeave']);

        // Student Directory & Academic
        Route::get('/classes', [AcademicController::class, 'classes']);
        Route::get('/subjects', [AcademicController::class, 'subjects']);
        Route::get('/attendance', [AttendanceController::class, 'index']);
        Route::post('/attendance', [AttendanceController::class, 'store']);
        Route::get('/students', [StudentController::class, 'index']);
        Route::get('/students/{student}', [StudentController::class, 'show']);
        Route::get('/teachers', [TeacherController::class, 'index']);
        Route::get('/trainings', [HRController::class, 'trainings']);

        // Scoresheets & Remarks
        Route::get('/scoresheets/assigned', [ScoresheetController::class, 'assignedPapers']);
        Route::get('/scoresheets/{exam_id}', [ScoresheetController::class, 'examRoster']);
        Route::post('/scoresheets/{exam_id}/save-draft', [ScoresheetController::class, 'saveDraft']);
        Route::post('/scoresheets/{exam_id}/submit', [ScoresheetController::class, 'submitMarks']);
        Route::post('/remarks/{term_id}/{student_id}', [ScoresheetController::class, 'saveClassTeacherRemarks']);
    });

    // Employee Universal Self-Service Routes
    Route::prefix('employee')->middleware('role:teacher,admin,hr,librarian,accountant,staff')->group(function () {
        Route::get('/my-attendance', [TeacherSelfController::class, 'attendance']);
        Route::post('/punch', [TeacherSelfController::class, 'punch']);
        Route::get('/leaves', [TeacherSelfController::class, 'leaveBalance']);
        Route::post('/leaves/apply', [TeacherSelfController::class, 'applyLeave']);
        Route::get('/profile', [TeacherSelfController::class, 'profile']);
        Route::put('/profile', [TeacherSelfController::class, 'updateProfile']);
    });

    // STUDENT & PARENT MODULE ROUTES
    Route::prefix('student')->group(function () {

        // Dashboard
        Route::get('/dashboard', [StudentDashboardController::class, 'index']);

        // Profile
        Route::get('/profile', [StudentController::class, 'profile']);
        Route::put('/profile', [StudentController::class, 'updateProfile']);

        // Attendance, Leaves & Heatmap
        Route::get('/attendance', [StudentAttendanceController::class, 'index']);
        Route::post('/leaves/apply', [StudentAttendanceController::class, 'applyLeave']);

        // Fees
        Route::get('/fees', [FeeController::class, 'index']);
        Route::get('/fees/ledger', [FeeReportController::class, 'studentLedger']);
        Route::get('/fees/receipts/{id}/download', [FeePaymentController::class, 'downloadReceipt']);
        Route::get('/fees/installments/{id}/legacy-receipt', [FeePaymentController::class, 'legacyInstallmentReceipt']);

        // Academic Results
        Route::get('/results', [ExamResultController::class, 'index']);
        Route::get('/results/report-card/{term_id}/pdf', [ExamResultController::class, 'downloadReportCard']);

        // Feedback
        Route::get('/feedback', [FeedbackController::class, 'index']);
        Route::post('/feedback', [FeedbackController::class, 'store']);
        Route::delete('/feedback/{id}', [FeedbackController::class, 'destroy']);

        // Parent-Teacher Meeting
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

        // Timetable
        Route::get('/timetable', [TimetableController::class, 'index']);
        Route::get('/timetable/all-slots', [TimetableController::class, 'allSlots']);
        Route::post('/timetable', [TimetableController::class, 'store'])->middleware('role:teacher,admin');
        Route::post('/timetable/bulk', [TimetableController::class, 'saveBulk'])->middleware('role:teacher,admin');
        Route::post('/timetable/clear-day', [TimetableController::class, 'clearDay'])->middleware('role:teacher,admin');
        Route::delete('/timetable/{id}', [TimetableController::class, 'destroy'])->middleware('role:teacher,admin');

        // School Calendar
        Route::get('/calendar', [SchoolCalendarController::class, 'index']);
        Route::post('/calendar', [SchoolCalendarController::class, 'store'])->middleware('role:admin,hr');
        Route::put('/calendar/{id}', [SchoolCalendarController::class, 'update'])->middleware('role:admin,hr');
        Route::delete('/calendar/{id}', [SchoolCalendarController::class, 'destroy'])->middleware('role:admin,hr');

        // Notices
        Route::get('/notices', [NoticeController::class, 'index']);
        Route::post('/notices', [NoticeController::class, 'store'])->middleware('role:admin,teacher,hr');
        Route::delete('/notices/{id}', [NoticeController::class, 'destroy'])->middleware('role:admin,teacher,hr');
    });

    // HR OPERATIONS & MANAGEMENT MODULE ROUTES
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
        Route::get('/leave-types', [LeaveTypeController::class, 'index']);
        Route::post('/leave-types', [LeaveTypeController::class, 'store']);
        Route::put('/leave-types/{id}', [LeaveTypeController::class, 'update']);
        Route::delete('/leave-types/{id}', [LeaveTypeController::class, 'destroy']);
        Route::get('/trainings', [HRController::class, 'trainings']);
        Route::post('/trainings', [HRController::class, 'storeTraining']);
        Route::delete('/trainings/{id}', [HRController::class, 'destroyTraining']);
        Route::get('/teachers', [TeacherController::class, 'index']);
        Route::get('/events', [HRController::class, 'events']);
        Route::post('/events', [HRController::class, 'storeEvent']);
        Route::delete('/events/{id}', [HRController::class, 'destroyEvent']);
    });

    // Universal Leave Types
    Route::get('/leave-types', [LeaveTypeController::class, 'index']);

    // ACCOUNTS & FINANCE OPERATIONS MODULE ROUTES
    Route::prefix('accounts')->middleware('role:accountant,admin')->group(function () {

        // Dashboard
        Route::get('/dashboard', [AccountsController::class, 'dashboard']);

        // Profile
        Route::get('/profile', [AccountsController::class, 'profile']);
        Route::put('/profile', [AccountsController::class, 'updateProfile']);

        // Student Fees
        Route::get('/fees', [AccountsController::class, 'feesList']);
        Route::get('/fee-templates', [AccountsController::class, 'feeTemplates']);
        Route::post('/fees/{id}/remind', [AccountsController::class, 'sendFeeReminder'])->whereNumber('id');
        Route::post('/fees/bulk-remind', [AccountsController::class, 'sendBulkFeeReminders']);

        // Advanced Fee Management
        Route::post('/fees/preview-allocation', [FeePaymentController::class, 'previewAllocation']);
        Route::post('/fees/collect', [FeePaymentController::class, 'collect']);
        Route::post('/fees/payments/{id}/clear-cheque', [FeePaymentController::class, 'clearCheque'])->whereNumber('id');
        Route::post('/fees/payments/{id}/bounce-cheque', [FeePaymentController::class, 'bounceCheque'])->whereNumber('id');
        Route::post('/fees/payments/{id}/void', [FeePaymentController::class, 'voidPayment'])->whereNumber('id')->middleware('role:admin,super_admin');
        Route::get('/fees/payments/{id}/receipt', [FeePaymentController::class, 'downloadReceipt'])->whereNumber('id');
        Route::get('/fees/installments/{id}/legacy-receipt', [FeePaymentController::class, 'legacyInstallmentReceipt'])->whereNumber('id');

        // Concessions & Scholarships
        Route::get('/fees/concession-types', [FeeConcessionController::class, 'typesList']);
        Route::post('/fees/concession-types', [FeeConcessionController::class, 'storeType'])->middleware('role:admin,super_admin');
        Route::post('/fees/concessions/apply', [FeeConcessionController::class, 'apply']);
        Route::post('/fees/concessions/{id}/approve', [FeeConcessionController::class, 'approve'])->whereNumber('id')->middleware('role:admin,super_admin');
        Route::post('/fees/concessions/{id}/revoke', [FeeConcessionController::class, 'revoke'])->whereNumber('id')->middleware('role:admin,super_admin');

        // Refunds & Disbursements
        Route::post('/fees/refunds/request', [FeeRefundController::class, 'requestRefund']);
        Route::post('/fees/refunds/{id}/approve', [FeeRefundController::class, 'approve'])->whereNumber('id')->middleware('role:admin,super_admin');

        // Reports, Defaulters & Ledger
        Route::get('/fees/reports/daily-collection', [FeeReportController::class, 'dailyCollection']);
        Route::get('/fees/reports/defaulters', [FeeReportController::class, 'defaulters']);
        Route::get('/fees/students/{studentId}/ledger', [FeeReportController::class, 'studentLedger'])->whereNumber('studentId');
        Route::post('/fees/waive-fine', [FeeReportController::class, 'waiveFine'])->middleware('role:admin,super_admin');

        // School Expenses
        Route::get('/expenses', [AccountsController::class, 'expensesList']);
        Route::post('/expenses', [AccountsController::class, 'storeExpense']);
        Route::delete('/expenses/{id}', [AccountsController::class, 'destroyExpense'])->whereNumber('id');

        // Staff Salary Disbursement
        Route::get('/salary-disbursements', [AccountsController::class, 'disbursementRequests']);
        Route::post('/salary-disbursements/record-staff', [AccountsController::class, 'recordStaffSalaryDisbursement']);
        Route::post('/salary-disbursements/{id}/action', [AccountsController::class, 'actionDisbursementRequest'])->whereNumber('id');

        // Vendor Management & Purchase Orders
        Route::middleware('role:accountant,admin')->group(function () {
            Route::get('/vendors', [VendorPurchaseController::class, 'vendorsList']);
            Route::post('/vendors', [VendorPurchaseController::class, 'storeVendor']);
            Route::put('/vendors/{id}', [VendorPurchaseController::class, 'updateVendor'])->whereNumber('id');
            Route::delete('/vendors/{id}', [VendorPurchaseController::class, 'destroyVendor'])->whereNumber('id');

            Route::get('/purchase-orders', [VendorPurchaseController::class, 'ordersList']);
            Route::get('/purchase-orders/{id}', [VendorPurchaseController::class, 'showOrder'])->whereNumber('id');
            Route::post('/purchase-orders', [VendorPurchaseController::class, 'storeOrder']);
            Route::patch('/purchase-orders/{id}/status', [VendorPurchaseController::class, 'updateOrderStatus'])->whereNumber('id');
            Route::patch('/purchase-orders/{id}/payment', [VendorPurchaseController::class, 'updatePaymentStatus'])->whereNumber('id');
            Route::delete('/purchase-orders/{id}', [VendorPurchaseController::class, 'destroyOrder'])->whereNumber('id');
            Route::get('/procurement-resources', [VendorPurchaseController::class, 'availableResources']);
        });
    });

    // ACADEMIC EXAMINATION ANALYTICS & EXPORTS
    Route::get('/exams/analytics/class-summary', [ExamReportController::class, 'classSummary'])
        ->middleware('role:admin,super_admin,teacher');

    Route::get('/exams/analytics/export-csv', [ExamReportController::class, 'exportCsv'])
        ->middleware('role:admin,super_admin,teacher');

    // LIBRARY OPERATIONS MODULE ROUTES
    Route::prefix('library')->middleware('role:librarian,admin')->group(function () {
        Route::get('/stats', [LibraryController::class, 'stats']);
        Route::get('/students', [LibraryController::class, 'students']);
        Route::get('/books', [LibraryController::class, 'index']);
        Route::post('/books', [LibraryController::class, 'store']);
        Route::put('/books/{id}', [LibraryController::class, 'update'])->whereNumber('id');
        Route::delete('/books/{id}', [LibraryController::class, 'destroy'])->whereNumber('id');
        Route::get('/issues', [LibraryController::class, 'issues']);
        Route::post('/issues/issue', [LibraryController::class, 'issueBook']);
        Route::post('/issues/{id}/return', [LibraryController::class, 'returnBook'])->whereNumber('id');
        Route::patch('/issues/{id}/fine', [LibraryController::class, 'updateFine'])->whereNumber('id');
        Route::get('/settings/fine-rules', [LibraryController::class, 'getFineRules']);
        Route::post('/settings/fine-rules', [LibraryController::class, 'updateFineRules']);
    });

    // SUPER ADMIN MODULE ROUTES
    Route::prefix('super-admin')->middleware('role:super_admin')->group(function () {

        // Platform Overview Dashboard
        Route::get('/dashboard', [SuperAdminController::class, 'dashboard']);

        // Multi-Tenant School Management
        Route::get('/schools', [SuperAdminController::class, 'schoolsList']);
        Route::post('/schools', [SuperAdminController::class, 'storeSchool']);
        Route::get('/schools/{id}', [SuperAdminController::class, 'showSchool'])->whereNumber('id');
        Route::put('/schools/{id}', [SuperAdminController::class, 'updateSchool'])->whereNumber('id');
        Route::patch('/schools/{id}/toggle-status', [SuperAdminController::class, 'toggleSchoolStatus'])->whereNumber('id');
        Route::post('/schools/{id}/reset-admin-password', [SuperAdminController::class, 'resetSchoolAdminPassword'])->whereNumber('id');
        Route::delete('/schools/{id}', [SuperAdminController::class, 'destroySchool'])->whereNumber('id');
    });

    // STUDENT REPORT CARDS MODULE ROUTES
    Route::prefix('report-cards')->group(function () {
        Route::get('/filters', [ReportCardController::class, 'filters']);
        Route::get('/generate', [ReportCardController::class, 'generate']);
        Route::get('/pdf/{studentId}', [ReportCardController::class, 'pdf'])->whereNumber('studentId');
        Route::get('/bulk-zip', [ReportCardController::class, 'bulkZip']);
        Route::post('/save-marks', [ReportCardController::class, 'saveMarks']);
    });

    // STUDENT MARKSHEET GENERATION MODULE ROUTES
    Route::prefix('marksheets')->group(function () {
        Route::get('/filters', [MarksheetController::class, 'filters']);
        Route::get('/generate', [MarksheetController::class, 'generate']);
        Route::get('/pdf/{studentId}', [MarksheetController::class, 'pdf'])->whereNumber('studentId');
        Route::get('/bulk-zip', [MarksheetController::class, 'bulkZip']);
        Route::post('/update-marks', [MarksheetController::class, 'updateMarks']);
    });

    // UDISE+ MANAGEMENT MODULE ROUTES
    Route::prefix('udise')->group(function () {
        Route::get('/dashboard', [UdisePlusController::class, 'dashboard']);
        Route::get('/school-profile', [UdisePlusController::class, 'getSchoolProfile']);
        Route::post('/school-profile', [UdisePlusController::class, 'updateSchoolProfile']);
        Route::get('/school-facilities', [UdisePlusController::class, 'getSchoolFacilities']);
        Route::post('/school-facilities', [UdisePlusController::class, 'updateSchoolFacilities']);
        Route::get('/teachers', [UdisePlusController::class, 'getTeachers']);
        Route::post('/teachers/{id}', [UdisePlusController::class, 'updateTeacher'])->whereNumber('id');
        Route::get('/students', [UdisePlusController::class, 'getStudents']);
        Route::post('/students/{id}', [UdisePlusController::class, 'updateStudent'])->whereNumber('id');
        Route::get('/academic-enrolment', [UdisePlusController::class, 'getAcademicEnrolment']);
        Route::get('/export/json', [UdisePlusController::class, 'exportJson']);
        Route::get('/export/csv/{type}', [UdisePlusController::class, 'exportCsv']);
        Route::get('/export/pdf', [UdisePlusController::class, 'exportDcfPdf']);
        Route::post('/certify', [UdisePlusController::class, 'certifySubmission']);
    });

    // MULTI-SCHOOL / MULTI-BRANCH CAMPUS SWITCHER
    Route::get('/schools/branches', [BranchController::class, 'branches']);
    Route::post('/schools/switch-branch', [BranchController::class, 'switchBranch'])
        ->middleware('role:admin,super_admin');
});

// Direct PDF and Bulk ZIP access routes
Route::prefix('v1/report-cards')->group(function () {
    Route::get('/pdf/{studentId}', [ReportCardController::class, 'pdf'])->whereNumber('studentId');
    Route::get('/bulk-zip', [ReportCardController::class, 'bulkZip']);
});

Route::prefix('v1/marksheets')->group(function () {
    Route::get('/pdf/{studentId}', [MarksheetController::class, 'pdf'])->whereNumber('studentId');
    Route::get('/bulk-zip', [MarksheetController::class, 'bulkZip']);
});

Route::prefix('v1/udise')->group(function () {
    Route::get('/export/pdf', [UdisePlusController::class, 'exportDcfPdf']);
    Route::get('/export/json', [UdisePlusController::class, 'exportJson']);
    Route::get('/export/csv/{type}', [UdisePlusController::class, 'exportCsv']);
});
