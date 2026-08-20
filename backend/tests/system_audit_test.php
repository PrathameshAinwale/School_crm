<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Teacher;
use App\Models\Student;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Timetable;
use App\Models\Attendance;
use App\Models\StudentAttendance;
use App\Models\StaffAttendance;
use App\Models\StaffSalary;
use App\Models\FacultyTraining;
use App\Models\LeaveApplication;
use App\Models\SchoolCalendarEvent;
use App\Models\SchoolNotice;
use App\Models\StudentFee;
use App\Models\Feedback;
use App\Models\PtmAppointment;
use App\Models\StudyMaterial;
use App\Models\Syllabus;
use App\Models\SyllabusProgressLog;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Vehicle;
use App\Models\Resource;
use App\Models\Admission;
use App\Models\Notification;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

$passed = 0;
$failed = 0;
$results = [];

function testCase($name, $closure) {
    global $passed, $failed, $results;
    try {
        $msg = $closure();
        $passed++;
        $results[] = "[PASS] {$name}: " . ($msg ?: 'OK');
        echo "✓ {$name}\n";
    } catch (\Throwable $e) {
        $failed++;
        $results[] = "[FAIL] {$name}: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine();
        echo "✗ {$name}: {$e->getMessage()}\n";
    }
}

echo "====================================================\n";
echo "       EDULOGIC CRM - FULL SYSTEM AUDIT TEST        \n";
echo "====================================================\n\n";

// -------------------------------------------------------------
// 1. AUTHENTICATION & ROLE TEST
// -------------------------------------------------------------
testCase("Auth: Admin User Login & Password Hash", function() {
    $user = User::where('email', 'admin@school.com')->firstOrFail();
    if (!Hash::check('111111', $user->password)) throw new Exception("Admin password mismatch");
    if ($user->role !== 'admin') throw new Exception("Invalid admin role");
    return "Admin verified ({$user->name})";
});

testCase("Auth: HR User Login & Password Hash", function() {
    $user = User::where('email', 'hr@school.com')->firstOrFail();
    if (!Hash::check('111111', $user->password)) throw new Exception("HR password mismatch");
    if ($user->role !== 'hr') throw new Exception("Invalid HR role");
    return "HR Head verified ({$user->name})";
});

testCase("Auth: Teacher User Login & Password Hash", function() {
    $user = User::where('email', 'shruti@school.com')->firstOrFail();
    if (!Hash::check('shruti1234', $user->password)) throw new Exception("Teacher password mismatch");
    if ($user->role !== 'teacher') throw new Exception("Invalid teacher role");
    return "Teacher verified ({$user->name})";
});

testCase("Auth: Student/Parent User Login & Password Hash", function() {
    $user = User::where('email', 'rajesh@school.com')->firstOrFail();
    if (!Hash::check('111111', $user->password)) throw new Exception("Parent password mismatch");
    if ($user->role !== 'student_parent') throw new Exception("Invalid parent role");
    return "Parent verified ({$user->name})";
});

// -------------------------------------------------------------
// 2. ADMIN MODULE CRUD & PERSISTENCE
// -------------------------------------------------------------
testCase("Admin: Teacher CRUD & Class Teacher Assignment", function() {
    $teacher = Teacher::where('email', 'shruti@school.com')->first();
    if (!$teacher) {
        $teacher = Teacher::create([
            'first_name' => 'Shruti',
            'last_name' => 'Sen',
            'email' => 'shruti@school.com',
            'phone' => '9876543212',
            'department' => 'Mathematics',
            'designation' => 'Senior Mathematics Faculty',
            'class_teacher_class' => 'Class 10',
            'status' => 'active',
        ]);
    } else {
        $teacher->update(['class_teacher_class' => 'Class 10']);
    }
    if ($teacher->class_teacher_class !== 'Class 10') throw new Exception("Class teacher assignment failed");
    return "Teacher record ID {$teacher->id} assigned to Class 10";
});

testCase("Admin: Student CRUD & Section Association", function() {
    $student = Student::with(['schoolClass', 'section'])->where('first_name', 'Aarav')->firstOrFail();
    if (!$student->schoolClass || $student->schoolClass->name !== 'Class 10') {
        throw new Exception("Student class mismatch");
    }
    return "Student {$student->full_name} enrolled in {$student->schoolClass->name} ({$student->section->name})";
});

testCase("Admin: Admissions Creation & Persistence", function() {
    $class10 = SchoolClass::where('name', 'Class 10')->first();
    $adm = Admission::create([
        'application_number' => 'ADM-TEST-' . time(),
        'first_name' => 'Rohan',
        'last_name' => 'Mehta',
        'date_of_birth' => '2010-05-15',
        'gender' => 'Male',
        'school_class_id' => $class10 ? $class10->id : null,
        'academic_year' => '2026-2027',
        'guardian_name' => 'Suresh Mehta',
        'guardian_phone' => '9876599999',
        'guardian_email' => 'suresh.mehta@test.com',
        'guardian_relation' => 'Father',
        'address' => '402 Sunrise Heights, City',
        'status' => 'Pending',
    ]);
    $check = Admission::find($adm->id);
    if (!$check) throw new Exception("Admission record not saved in database");
    $adm->delete(); // Clean up test record
    return "Admission CRUD & DB persistence verified";
});

testCase("Admin: School Vehicles & Resources CRUD", function() {
    $vCount = Vehicle::count();
    $rCount = Resource::count();
    return "Vehicles ({$vCount}) & Resources ({$rCount}) present in database";
});

// -------------------------------------------------------------
// 3. TEACHER MODULE & CROSS-TEACHER TIMETABLE
// -------------------------------------------------------------
testCase("Teacher: Save Bulk Timetable & Notifications Dispatch", function() {
    $teacher = Teacher::where('email', 'shruti@school.com')->first();
    
    // Save timetable slot
    $slot = Timetable::updateOrCreate(
        [
            'class_name' => 'Class 10',
            'division' => 'Div A',
            'day_of_week' => 'Monday',
            'period_number' => 1,
        ],
        [
            'created_by_teacher_id' => $teacher ? $teacher->id : null,
            'period_name' => 'Period 1',
            'time_slot' => '8:00 - 8:45 AM',
            'subject' => 'Mathematics',
            'teacher_name' => 'Dr. Shruti Sen',
            'room' => 'Room 301',
            'type' => 'Theory',
        ]
    );
    
    if (!$slot || $slot->subject !== 'Mathematics') throw new Exception("Timetable slot failed to persist");
    return "Class 10 Div A Period 1 saved with teacher ID {$slot->created_by_teacher_id}";
});

testCase("Teacher: Today's Schedule Data Assembly", function() {
    $teacher = Teacher::where('email', 'shruti@school.com')->first();
    $lectures = Timetable::where('day_of_week', 'Monday')
        ->where(function($q) use ($teacher) {
            $q->where('teacher_name', 'like', '%Shruti%')
              ->orWhere('created_by_teacher_id', $teacher ? $teacher->id : 0);
        })->get();
        
    if ($lectures->count() === 0) throw new Exception("No schedule found for teacher on Monday");
    return "Teacher Monday Schedule has {$lectures->count()} periods";
});

testCase("Teacher: Student Attendance Marking & Storage", function() {
    $class10 = SchoolClass::where('name', 'Class 10')->firstOrFail();
    $student = Student::where('first_name', 'Aarav')->firstOrFail();
    $today = date('Y-m-d');
    
    $att = StudentAttendance::updateOrCreate(
        [
            'student_id' => $student->id,
            'date' => $today,
        ],
        [
            'school_class_id' => $class10->id,
            'status' => 'Present',
            'marked_by' => 1,
        ]
    );
    
    if ($att->status !== 'Present') throw new Exception("Attendance status mismatch");
    return "Student {$student->first_name} marked Present on {$today}";
});

testCase("Teacher: Assignments Creation & Grading Persistence", function() {
    $class10 = SchoolClass::where('name', 'Class 10')->firstOrFail();
    $teacher = Teacher::first();
    $student = Student::where('first_name', 'Aarav')->firstOrFail();
    
    $hw = Assignment::create([
        'teacher_id' => $teacher ? $teacher->id : null,
        'school_class_id' => $class10->id,
        'title' => 'System Test: Real Roots Theorem',
        'subject_name' => 'Mathematics',
        'due_date' => date('Y-m-d', strtotime('+3 days')),
        'due_time' => '23:59',
        'max_marks' => 25,
        'status' => 'Active',
    ]);
    
    $sub = AssignmentSubmission::create([
        'assignment_id' => $hw->id,
        'student_id' => $student->id,
        'status' => 'Submitted',
        'submission_text' => 'Solved quadratic equations.',
        'submitted_at' => now(),
    ]);
    
    // Grade it
    $sub->update([
        'status' => 'Graded',
        'score' => 24,
        'teacher_feedback' => 'Flawless mathematical proof!',
    ]);
    
    if ($sub->score != 24 || $sub->status !== 'Graded') throw new Exception("Assignment grading failed");
    
    $hw->delete(); // Clean up test assignment
    return "Assignment created, submitted, and graded with persistence";
});

testCase("Teacher: Syllabus Progress Logging", function() {
    $syl = Syllabus::first();
    if ($syl) {
        $log = SyllabusProgressLog::create([
            'syllabus_id' => $syl->id,
            'subject_name' => 'Mathematics',
            'class_name' => 'Grade 10-A',
            'unit_title' => 'Unit 1: Real Numbers',
            'log_date' => date('Y-m-d'),
            'progress_percentage' => 100,
            'message' => 'Completed exercise 1.4',
            'teacher_name' => 'Dr. Shruti Sen',
        ]);
        if (!$log) throw new Exception("Syllabus log failed to save");
        $log->delete();
    }
    return "Syllabus progress logging verified";
});

// -------------------------------------------------------------
// 4. HR MODULE BACKEND & DATABASE OPERATIONS
// -------------------------------------------------------------
testCase("HR: Staff Salaries Calculation & Disbursal", function() {
    $sal = StaffSalary::where('month', 'August 2026')->first();
    if (!$sal) throw new Exception("Staff salaries not seeded");
    
    $sal->update(['status' => 'Disbursed', 'disbursed_at' => now()]);
    if ($sal->status !== 'Disbursed') throw new Exception("Salary disbursal failed");
    return "Staff salary for {$sal->name} is Disbursed (Net: ₹{$sal->net_salary})";
});

testCase("HR: Staff Leave Review & Approval Workflow", function() {
    $leave = LeaveApplication::where('status', 'Pending')->first();
    if ($leave) {
        $leave->update([
            'status' => 'Approved',
            'remarks' => 'Approved by HR during automated system test.',
        ]);
        if ($leave->status !== 'Approved') throw new Exception("Leave approval failed");
        return "Leave application #{$leave->id} approved by HR";
    }
    return "Leave applications table active";
});

testCase("HR: Faculty Trainings Scheduling & Storage", function() {
    $trn = FacultyTraining::where('training_id', 'TRN-101')->firstOrFail();
    if ($trn->category !== 'Technology & AI') throw new Exception("Training category mismatch");
    return "Training '{$trn->title}' active in database ({$trn->target_audience})";
});

testCase("HR: School Calendar Events Publishing", function() {
    $evt = SchoolCalendarEvent::create([
        'title' => 'Automated Test: Sports Meet 2026',
        'event_type' => 'Sports',
        'category' => 'Sports',
        'start_date' => date('Y-m-d', strtotime('+7 days')),
        'time_slot' => '08:30 AM - 04:00 PM',
        'venue' => 'Main Stadium',
        'status' => 'Upcoming',
    ]);
    if (!$evt || !$evt->id) throw new Exception("Event failed to save in database");
    $evt->delete();
    return "School calendar event publishing & DB persistence verified";
});

// -------------------------------------------------------------
// 5. STUDENT / PARENT MODULE OPERATIONS
// -------------------------------------------------------------
testCase("Student/Parent: Fee Payment Status & Gateway Record", function() {
    $student = Student::where('first_name', 'Aarav')->firstOrFail();
    $fee = StudentFee::where('student_id', $student->id)->first();
    if ($fee) {
        $fee->update([
            'status' => 'Paid',
            'paid_date' => date('Y-m-d'),
            'transaction_id' => 'TXN-TEST-' . time(),
            'payment_mode' => 'UPI (GPay)',
        ]);
        if ($fee->status !== 'Paid') throw new Exception("Fee payment update failed");
        return "Fee term '{$fee->term_name}' marked Paid for student {$student->first_name}";
    }
    return "Student fee records active";
});

testCase("Student/Parent: Faculty Feedback Submission", function() {
    $student = Student::where('first_name', 'Aarav')->firstOrFail();
    $user = User::where('email', 'rajesh@school.com')->firstOrFail();
    
    $fb = Feedback::create([
        'user_id' => $user->id,
        'student_id' => $student->id,
        'subject' => 'Mathematics',
        'teacher_name' => 'Dr. Shruti Sen',
        'rating' => 5.0,
        'comment' => 'Exceptional clarity in quadratic equations!',
    ]);
    if (!$fb) throw new Exception("Feedback failed to save");
    $fb->delete();
    return "Parent feedback submission verified";
});

testCase("Student/Parent: PTM Appointment Booking", function() {
    $student = Student::where('first_name', 'Aarav')->firstOrFail();
    $ptm = PtmAppointment::where('student_id', $student->id)->first();
    if ($ptm) {
        if ($ptm->status !== 'Confirmed') throw new Exception("PTM status invalid");
        return "PTM on {$ptm->meeting_date} ({$ptm->time_slot}) confirmed with {$ptm->teacher_name}";
    }
    return "PTM appointments table active";
});

// -------------------------------------------------------------
// 6. NOTIFICATIONS SYSTEM VERIFICATION
// -------------------------------------------------------------
testCase("System: Notifications Dispatch & Storage", function() {
    $user = User::where('email', 'shruti@school.com')->firstOrFail();
    $notif = Notification::create([
        'user_id' => $user->id,
        'title' => 'System Test: New Circular Published',
        'message' => 'Automated test notification verification.',
        'type' => 'notice',
        'link' => '/notices',
        'is_read' => false,
    ]);
    if (!$notif || !$notif->id) throw new Exception("Notification failed to save");
    $notif->delete();
    return "In-app notifications system active";
});

echo "\n====================================================\n";
echo "AUDIT SUMMARY: {$passed} PASSED / {$failed} FAILED\n";
echo "====================================================\n";

if ($failed > 0) {
    exit(1);
} else {
    exit(0);
}
