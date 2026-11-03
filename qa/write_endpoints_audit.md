# Comprehensive Backend Write Endpoints Audit

Total write methods audited: 149

| # | Controller | Method | Existing Validation | Fields Handled | Gaps / Hardening Needs |
|---|------------|--------|---------------------|----------------|------------------------|
| 1 | `AccountsController` | `recordFeePayment` | Inline $request->validate | payment_mode (required\|string), transaction_id (nullable\|string), paid_date (n | Strings lack max length constraints |
| 2 | `AccountsController` | `storeExpense` | Inline $request->validate | title (required\|string\|max:255), category (required\|string\|max:100), amount  | Foreign key exists rule lacks school_id tenant scoping |
| 3 | `AccountsController` | `destroyExpense` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 4 | `AccountsController` | `recordStaffSalaryDisbursement` | Inline $request->validate | staff_name (required\|string\|max:255), month (required\|string), amount (requir | Well constrained |
| 5 | `AccountsController` | `actionDisbursementRequest` | Inline $request->validate | status (required\|in:Disbursed,Rejected), payment_reference (nullable\|string),  | Strings lack max length constraints |
| 6 | `AccountsController` | `updateProfile` | Inline $request->validate | name (nullable\|string\|max:255), phone (nullable\|string\|max:20), email (nulla | Well constrained |
| 7 | `FeeConcessionController` | `storeType` | Inline $request->validate | name (required\|string\|max:100), discount_type (required\|string\|in:percentage | Well constrained |
| 8 | `FeeConcessionController` | `apply` | Inline $request->validate | student_id (required\|exists:students,id), fee_concession_type_id (required\|exi | Well constrained |
| 9 | `FeeConcessionController` | `approve` | None | use | No validation rules applied (unvalidated request execution) |
| 10 | `FeeRefundController` | `approve` | Inline $request->validate | disbursement_reference (nullable\|string\|max:100), admin_remarks (nullable\|str | Well constrained |
| 11 | `FeeReportController` | `waiveFine` | Inline $request->validate | student_fee_id (required\|exists:student_fees,id), waive_amount (required\|numer | Foreign key exists rule lacks school_id tenant scoping |
| 12 | `VendorPurchaseController` | `storeVendor` | Inline $request->validate | name (required\|string\|max:255), contact_person (nullable\|string\|max:255), ph | Well constrained |
| 13 | `VendorPurchaseController` | `updateVendor` | Inline $request->validate | name (required\|string\|max:255), contact_person (nullable\|string\|max:255), ph | Well constrained |
| 14 | `VendorPurchaseController` | `destroyVendor` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 15 | `VendorPurchaseController` | `storeOrder` | Inline $request->validate | vendor_id (required\|exists:vendors,id), order_date (required\|date), expected_d | Foreign key exists rule lacks school_id tenant scoping |
| 16 | `VendorPurchaseController` | `updateOrderStatus` | Inline $request->validate | status (required\|string\|in:Draft,Ordered,Shipped,Delivered,Cancelled), deliver | Strings lack max length constraints |
| 17 | `VendorPurchaseController` | `updatePaymentStatus` | Inline $request->validate | payment_status (required\|string\|in:Pending,Partial,Paid), payment_mode (nullab | Well constrained |
| 18 | `VendorPurchaseController` | `destroyOrder` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 19 | `AcademicController` | `storeClass` | Inline $request->validate | name (required\|string\|max:100), code (nullable\|string\|max:50), sections (nul | Well constrained |
| 20 | `AcademicYearController` | `store` | Inline $request->validate | name (required\|string\|max:50), code (required\|string\|max:50), start_date (re | Well constrained |
| 21 | `AcademicYearController` | `update` | Inline $request->validate | name (required\|string\|max:50), code (required\|string\|max:50), start_date (re | Well constrained |
| 22 | `AcademicYearController` | `switchYear` | Inline $request->validate | academic_year_id (required\|integer) | Strings lack max length constraints |
| 23 | `AcademicYearController` | `destroy` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 24 | `AdmissionController` | `store` | Inline $request->validate | first_name (required\|string\|max:255), last_name (nullable\|string\|max:255), d | Well constrained |
| 25 | `AdmissionController` | `updateStatus` | Inline $request->validate | status (required\|string\|in:Pending,Under Review,Approved,Rejected,Enrolled,Inq | Strings lack max length constraints |
| 26 | `AdmissionController` | `enroll` | Inline $request->validate | section_id (nullable\|exists:sections,id), roll_number (nullable\|string\|max:50 | Well constrained |
| 27 | `AdmissionController` | `update` | None | onl | No validation rules applied (unvalidated request execution) |
| 28 | `AdmissionController` | `destroy` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 29 | `AttendanceController` | `store` | Inline $request->validate | date (required\|date), type (required\|in:student,staff), records (required\|arr | Strings lack max length constraints |
| 30 | `CommunicationCampaignController` | `store` | Inline $request->validate | title (required\|string\|max:150), channel (required\|string\|in:sms,whatsapp,em | Foreign key exists rule lacks school_id tenant scoping |
| 31 | `CommunicationCampaignController` | `cancel` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 32 | `CommunicationTemplateController` | `store` | Inline $request->validate | name (required\|string\|max:150), code ([
                ), channel (required\| | Well constrained |
| 33 | `CommunicationTemplateController` | `update` | Inline $request->validate | name (required\|string\|max:150), code ([
                ), channel (required\| | Well constrained |
| 34 | `CommunicationTemplateController` | `destroy` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 35 | `ExamReportController` | `updateAuditRetention` | Inline $request->validate | exam_retention_days (required\|integer\|min:365\|max:3650), general_retention_da | Well constrained |
| 36 | `ExamScheduleController` | `storeTerm` | Inline $request->validate | name (required\|string\|max:255), code (nullable\|string\|max:50), term_type (re | Well constrained |
| 37 | `ExamScheduleController` | `storeExam` | Inline $request->validate | exam_term_id (required\|exists:exam_terms,id), school_class_id (required\|exists | Well constrained |
| 38 | `FeeStructureController` | `storeOrUpdate` | Inline $request->validate | school_class_id (required\|exists:school_classes,id), academic_year (nullable\|s | Strings lack max length constraints; Foreign key exists rule lacks school_id tenant scoping |
| 39 | `FeeStructureController` | `destroy` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 40 | `GradingScaleController` | `store` | Inline $request->validate | name (required\|string\|max:255), description (nullable\|string), is_active (boo | Well constrained |
| 41 | `GradingScaleController` | `update` | Inline $request->validate | name (sometimes\|required\|string\|max:255), description (nullable\|string), is_ | Well constrained |
| 42 | `GradingScaleController` | `destroy` | None | use | No validation rules applied (unvalidated request execution) |
| 43 | `ResourceController` | `store` | Inline $request->validate | name (required\|string\|max:255), category (required\|string\|max:100), total_qu | Foreign key exists rule lacks school_id tenant scoping |
| 44 | `ResourceController` | `update` | Inline $request->validate | name (required\|string\|max:255), category (required\|string\|max:100), total_qu | Uses $request->all() directly on model write; Foreign key exists rule lacks school_id tenant scoping |
| 45 | `ResourceController` | `destroy` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 46 | `ResourceController` | `storeRequest` | Inline $request->validate | resource_id (required\|exists:resources,id), title (required\|string\|max:255),  | Well constrained |
| 47 | `ResourceController` | `actionRequest` | Inline $request->validate | status (required\|string\|in:Approved,Rejected,Resolved,In Repair), admin_remark | Strings lack max length constraints |
| 48 | `SchoolSettingsController` | `updateGroup` | Inline $request->validate | group (required\|string\|in:general,branding,financial_rules,grading,integration | Strings lack max length constraints |
| 49 | `StudentController` | `store` | Inline $request->validate | first_name (required\|string\|max:255), last_name (nullable\|string\|max:255), a | Well constrained |
| 50 | `StudentController` | `update` | Inline $request->validate | first_name (required\|string\|max:255), last_name (nullable\|string\|max:255), a | Uses $request->all() directly on model write |
| 51 | `StudentController` | `resetPassword` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 52 | `StudentController` | `destroy` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 53 | `StudentController` | `updateProfile` | Inline $request->validate | first_name (nullable\|string\|max:100), last_name (nullable\|string\|max:100), d | Well constrained |
| 54 | `StudentEnrollmentController` | `store` | Inline $request->validate | student_ids (required\|array\|min:1), student_ids.* (exists:students,id), subjec | Strings lack max length constraints |
| 55 | `StudentEnrollmentController` | `destroy` | None | use | No validation rules applied (unvalidated request execution) |
| 56 | `TeacherAllocationController` | `store` | Inline $request->validate | teacher_id (required\|exists:teachers,id), school_class_id (required\|exists:sch | Strings lack max length constraints |
| 57 | `TeacherAllocationController` | `destroy` | None | use | No validation rules applied (unvalidated request execution) |
| 58 | `TeacherAllocationController` | `classTeachersStore` | Inline $request->validate | school_class_id (required\|exists:school_classes,id), section_id (required\|exis | Strings lack max length constraints |
| 59 | `TeacherController` | `store` | Inline $request->validate | role (nullable\|string\|in:teacher,hr,admin,accountant), first_name (required\|s | Well constrained |
| 60 | `TeacherController` | `update` | Inline $request->validate | role (nullable\|string\|in:teacher,hr,admin,accountant), first_name (required\|s | Well constrained |
| 61 | `TeacherController` | `resetPassword` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 62 | `TeacherController` | `destroy` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 63 | `VehicleController` | `store` | Inline $request->validate | vehicle_number (required\|string\|unique:vehicles,vehicle_number), type (require | Uses $request->all() directly on model write |
| 64 | `VehicleController` | `update` | Inline $request->validate | vehicle_number (required\|string\|unique:vehicles,vehicle_number,), type (requir | Uses $request->all() directly on model write |
| 65 | `VehicleController` | `updateRoute` | Inline $request->validate | route_from (required\|string\|max:255), route_to (required\|string\|max:255), ro | Well constrained |
| 66 | `VehicleController` | `destroy` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 67 | `VehicleController` | `toggleDriverTrip` | Inline $request->validate | vehicle_id (required), is_online (required\|boolean), latitude (nullable\|numeri | Strings lack max length constraints |
| 68 | `AssignmentController` | `store` | Inline $request->validate | title (required\|string\|max:255), school_class_id (required), subject (nullable | Well constrained |
| 69 | `BranchController` | `switchBranch` | Inline $request->validate | branch_id (required\|exists:schools,id) | Strings lack max length constraints; Foreign key exists rule lacks school_id tenant scoping |
| 70 | `OptOutController` | `store` | Inline $request->validate | phone_or_email (required\|string\|max:150), channel (required\|string\|in:sms,wh | Well constrained |
| 71 | `OptOutController` | `destroy` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 72 | `PushTokenController` | `registerToken` | Inline $request->validate | token (required\|string), platform (required\|string\|in:web,android,ios), devic | Well constrained |
| 73 | `HRController` | `updateProfile` | Inline $request->validate | name (nullable\|string\|max:255), phone (nullable\|string\|max:20), email (nulla | Well constrained |
| 74 | `HRController` | `actionLeave` | Inline $request->validate | status (required\|in:Approved,Rejected,Pending), remarks (nullable\|string) | Strings lack max length constraints |
| 75 | `HRController` | `markStaffAttendance` | Inline $request->validate | teacher_id (required), date (required\|date), status (required\|string\|in:Prese | Strings lack max length constraints |
| 76 | `HRController` | `updateStaffSalary` | None | base_salary, allowance, deduction, custom_deduction_reason, status, ha, inpu | No validation rules applied (unvalidated request execution) |
| 77 | `HRController` | `storeTraining` | Inline $request->validate | title (required\|string), category (required\|string), trainer_name (required\|s | Strings lack max length constraints |
| 78 | `HRController` | `storeEvent` | Inline $request->validate | title (required\|string), category (required\|string), date (required), time (nu | Strings lack max length constraints |
| 79 | `HRController` | `destroyEvent` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 80 | `HRController` | `destroyTraining` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 81 | `LeaveTypeController` | `store` | Inline $request->validate | name (required\|string\|max:100), code (required\|string\|max:10), total_days (r | Well constrained |
| 82 | `LeaveTypeController` | `update` | Inline $request->validate | name (sometimes\|required\|string\|max:100), code (sometimes\|required\|string\| | Well constrained |
| 83 | `LeaveTypeController` | `destroy` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 84 | `LibraryController` | `store` | Inline $request->validate | title (required\|string\|max:255), author (required\|string\|max:255), category  | Well constrained |
| 85 | `LibraryController` | `update` | Inline $request->validate | title (sometimes\|required\|string\|max:255), author (sometimes\|required\|strin | Well constrained |
| 86 | `LibraryController` | `destroy` | None | boolea | No validation rules applied (unvalidated request execution) |
| 87 | `LibraryController` | `issues` | None | fille, book_id, borrower_type, from_date, to_date, status, search | No validation rules applied (unvalidated request execution) |
| 88 | `LibraryController` | `issueBook` | Inline $request->validate | book_id (required\|exists:books,id), borrower_type (required\|in:student,teacher | Foreign key exists rule lacks school_id tenant scoping |
| 89 | `LibraryController` | `returnBook` | None | return_date, fine_amount, fine_status, notes, inpu | No validation rules applied (unvalidated request execution) |
| 90 | `LibraryController` | `updateFine` | Inline $request->validate | fine_status (required\|in:paid,unpaid,waived), fine_amount (nullable\|numeric\|m | Strings lack max length constraints |
| 91 | `LibraryController` | `updateFineRules` | Inline $request->validate | fine_per_day (required\|numeric\|min:0), grace_period_days (required\|integer\|m | Well constrained |
| 92 | `MarksheetController` | `updateMarks` | Inline $request->validate | examination_id (required\|exists:examinations,id), student_id (required\|exists: | Strings lack max length constraints; Foreign key exists rule lacks school_id tenant scoping |
| 93 | `MediaFileController` | `upload` | Inline $request->validate | file (required\|file), document_type (nullable\|string\|max:50), visibility (nul | Well constrained |
| 94 | `NotificationController` | `markAsRead` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 95 | `NotificationController` | `markAllAsRead` | None | use | No validation rules applied (unvalidated request execution) |
| 96 | `ReportCardController` | `saveMarks` | Inline $request->validate | examination_id (required\|exists:examinations,id), student_id (required\|exists: | Strings lack max length constraints; Foreign key exists rule lacks school_id tenant scoping |
| 97 | `SportsController` | `storeSport` | Inline $request->validate | name (required\|string\|max:150), code (required\|string\|max:50), category (nul | Well constrained |
| 98 | `SportsController` | `updateSport` | Inline $request->validate | name (sometimes\|required\|string\|max:150), code (sometimes\|required\|string\| | Well constrained |
| 99 | `SportsController` | `destroySport` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 100 | `SportsController` | `storeCompetition` | Inline $request->validate | sport_id (required\|exists:sports,id), title (required\|string\|max:200), compet | Foreign key exists rule lacks school_id tenant scoping |
| 101 | `SportsController` | `updateCompetition` | Inline $request->validate | sport_id (sometimes\|required\|exists:sports,id), title (sometimes\|required\|st | Foreign key exists rule lacks school_id tenant scoping |
| 102 | `SportsController` | `destroyCompetition` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 103 | `SportsController` | `enrollParticipant` | Inline $request->validate | student_id (required\|exists:students,id), sport_id (required\|exists:sports,id) | Well constrained |
| 104 | `SportsController` | `updateParticipantAttendance` | Inline $request->validate | attendance_status (required\|string\|in:Attending,Absent,Excused,Injured), perfo | Strings lack max length constraints |
| 105 | `SportsController` | `recordAchievement` | Inline $request->validate | achievement (required\|string\|max:100), performance_notes (nullable\|string) | Well constrained |
| 106 | `SportsController` | `destroyParticipant` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 107 | `SportsController` | `updateProfile` | Inline $request->validate | name (required\|string\|max:150), phone (nullable\|string\|max:30), email (requi | Well constrained |
| 108 | `SportsController` | `storeFacility` | Inline $request->validate | name (required\|string\|max:150), facility_type (required\|string\|max:50), capa | Well constrained |
| 109 | `SportsController` | `updateFacility` | Inline $request->validate | name (required\|string\|max:150), facility_type (required\|string\|max:50), capa | Well constrained |
| 110 | `SportsController` | `destroyFacility` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 111 | `SportsController` | `storeSchedule` | Inline $request->validate | sport_id (required\|exists:sports,id), facility_id (nullable\|exists:sports_faci | Foreign key exists rule lacks school_id tenant scoping |
| 112 | `SportsController` | `updateSchedule` | Inline $request->validate | sport_id (required\|exists:sports,id), facility_id (nullable\|exists:sports_faci | Foreign key exists rule lacks school_id tenant scoping |
| 113 | `SportsController` | `destroySchedule` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 114 | `SportsController` | `storeEquipment` | Inline $request->validate | sport_id (nullable\|exists:sports,id), item_name (required\|string\|max:150), ca | Foreign key exists rule lacks school_id tenant scoping |
| 115 | `SportsController` | `updateEquipment` | Inline $request->validate | sport_id (nullable\|exists:sports,id), item_name (required\|string\|max:150), ca | Foreign key exists rule lacks school_id tenant scoping |
| 116 | `SportsController` | `destroyEquipment` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 117 | `SportsController` | `issueEquipment` | Inline $request->validate | equipment_id (required\|exists:sports_equipment,id), student_id (nullable\|exist | Foreign key exists rule lacks school_id tenant scoping |
| 118 | `SportsController` | `returnEquipment` | None | notes, inpu | No validation rules applied (unvalidated request execution) |
| 119 | `SportsController` | `storeFitnessAssessment` | Inline $request->validate | student_id (required\|exists:students,id), assessment_date (required\|date), aca | Foreign key exists rule lacks school_id tenant scoping |
| 120 | `SportsController` | `destroyFitnessAssessment` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 121 | `FeedbackController` | `store` | Inline $request->validate | subject (required\|string\|max:255), teacher (nullable\|string\|max:255), rating | Well constrained |
| 122 | `FeedbackController` | `destroy` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 123 | `NoticeController` | `store` | Inline $request->validate | title (required\|string\|max:255), category (required\|string\|in:Academic,Exami | Well constrained |
| 124 | `NoticeController` | `destroy` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 125 | `SchoolCalendarController` | `store` | Inline $request->validate | title (required\|string\|max:255), event_type (nullable\|string\|max:100), categ | Well constrained |
| 126 | `SchoolCalendarController` | `update` | Inline $request->validate | title (required\|string\|max:255), event_type (nullable\|string\|max:100), start | Well constrained |
| 127 | `SchoolCalendarController` | `destroy` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 128 | `StudentAttendanceController` | `applyLeave` | Inline $request->validate | from_date (required\|date), to_date (required\|date\|after_or_equal:from_date),  | Well constrained |
| 129 | `StudyMaterialController` | `store` | Inline $request->validate | title (required\|string\|max:255), subject (required\|string\|max:100), type (nu | Well constrained |
| 130 | `StudyMaterialController` | `destroy` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 131 | `SyllabusController` | `storeLog` | Inline $request->validate | class_name (required\|string\|max:100), division (required\|string\|max:50), sub | Well constrained |
| 132 | `SyllabusController` | `deleteLog` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 133 | `TimetableController` | `store` | Inline $request->validate | day_of_week (required\|string\|in:Monday,Tuesday,Wednesday,Thursday,Friday,Satur | Well constrained |
| 134 | `TimetableController` | `saveBulk` | Inline $request->validate | class_name (required\|string\|max:50), division (nullable\|string\|max:50), day_ | Well constrained |
| 135 | `TimetableController` | `destroy` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 136 | `SuperAdminController` | `storeSchool` | Inline $request->validate | name (required\|string\|max:255), code (required\|string\|max:50\|unique:schools | Well constrained |
| 137 | `SuperAdminController` | `updateSchool` | Inline $request->validate | name (required\|string\|max:255), code (required\|string\|max:50\|unique:schools | Uses $request->all() directly on model write |
| 138 | `SuperAdminController` | `toggleSchoolStatus` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 139 | `SuperAdminController` | `resetSchoolAdminPassword` | None | new_password, inpu | No validation rules applied (unvalidated request execution) |
| 140 | `SuperAdminController` | `destroySchool` | None | None / ID only | No validation rules applied (unvalidated request execution) |
| 141 | `ScoresheetController` | `saveDraft` | Inline $request->validate | marks (required\|array), marks.*.student_id (required\|exists:students,id), mark | Well constrained |
| 142 | `ScoresheetController` | `submitMarks` | None | use | No validation rules applied (unvalidated request execution) |
| 143 | `ScoresheetController` | `saveClassTeacherRemarks` | Inline $request->validate | remarks (nullable\|string\|max:1000), teacher_remarks (nullable\|string\|max:100 | Well constrained |
| 144 | `TeacherSelfController` | `applyLeave` | Inline $request->validate | type ([), from_date (required\|date), to_date (required\|date\|after_or_equal:fr | Well constrained |
| 145 | `TeacherSelfController` | `updateProfile` | Inline $request->validate | first_name (nullable\|string\|max:100), last_name (nullable\|string\|max:100), e | Well constrained |
| 146 | `UdisePlusController` | `updateSchoolProfile` | None | academic_year, inpu, excep | No validation rules applied (unvalidated request execution) |
| 147 | `UdisePlusController` | `updateSchoolFacilities` | None | academic_year, inpu, excep | No validation rules applied (unvalidated request execution) |
| 148 | `UdisePlusController` | `updateTeacher` | None | excep | No validation rules applied (unvalidated request execution) |
| 149 | `UdisePlusController` | `updateStudent` | None | excep | No validation rules applied (unvalidated request execution) |
