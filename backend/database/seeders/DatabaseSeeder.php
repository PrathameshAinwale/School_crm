<?php

namespace Database\Seeders;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Feedback;
use App\Models\FacultyTraining;
use App\Models\LeaveApplication;
use App\Models\Notification;
use App\Models\PtmAppointment;
use App\Models\SchoolCalendarEvent;
use App\Models\SchoolClass;
use App\Models\SchoolNotice;
use App\Models\Section;
use App\Models\StaffAttendance;
use App\Models\StaffSalary;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\StudentFee;
use App\Models\StudyMaterial;
use App\Models\Subject;
use App\Models\Syllabus;
use App\Models\SyllabusProgressLog;
use App\Models\SyllabusUnit;
use App\Models\Teacher;
use App\Models\Timetable;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with complete, interconnected data.
     */
    public function run(): void
    {
        // -------------------------------------------------------------
        // 1. CORE USERS
        // -------------------------------------------------------------
        $admin = User::create([
            'name' => 'System Administrator',
            'email' => 'admin@school.com',
            'phone' => '9876543210',
            'password' => Hash::make('111111'),
            'role' => 'admin',
            'must_change_password' => false,
            'status' => 'active',
        ]);

        $teacherUser = User::create([
            'name' => 'Shruti Sen',
            'email' => 'shruti@school.com',
            'phone' => '9876543212',
            'password' => Hash::make('shruti1234'),
            'role' => 'teacher',
            'must_change_password' => false,
            'status' => 'active',
        ]);

        $parentUser = User::create([
            'name' => 'Rajesh Patel',
            'email' => 'rajesh@school.com',
            'phone' => '8767227125',
            'password' => Hash::make('111111'),
            'role' => 'student_parent',
            'must_change_password' => false,
            'status' => 'active',
        ]);

        $hrUser = User::create([
            'name' => 'Pooja Sharma (HR Head)',
            'email' => 'hr@school.com',
            'phone' => '9876543213',
            'password' => Hash::make('111111'),
            'role' => 'hr',
            'must_change_password' => false,
            'status' => 'active',
        ]);

        // -------------------------------------------------------------
        // 2. ACADEMIC STRUCTURE (Classes, Sections, Subjects)
        // -------------------------------------------------------------
        $classes = [
            'Class 10', 'Class 9', 'Class 8', 'Class 7', 'Class 6',
            'Class 5', 'Class 4', 'Class 3', 'Class 2', 'Class 1',
            'UKG', 'LKG', 'Nursery'
        ];

        $classModels = [];
        foreach ($classes as $className) {
            $classModels[$className] = SchoolClass::create(['name' => $className]);
        }

        $section10A = Section::create([
            'school_class_id' => $classModels['Class 10']->id,
            'name' => 'Saffron (A)',
        ]);
        $section10B = Section::create([
            'school_class_id' => $classModels['Class 10']->id,
            'name' => 'Emerald (B)',
        ]);

        $subjects = ['Mathematics', 'Science', 'English Core', 'Social Science', 'Computer Applications', 'Hindi'];
        foreach ($subjects as $sub) {
            Subject::create(['name' => $sub]);
        }

        // -------------------------------------------------------------
        // 3. TEACHER RECORD
        // -------------------------------------------------------------
        $shrutiTeacher = Teacher::create([
            'user_id' => $teacherUser->id,
            'teacher_id' => 'TCH-001',
            'first_name' => 'Shruti',
            'last_name' => 'Sen',
            'email' => 'shruti@school.com',
            'phone' => '9876543212',
            'gender' => 'Female',
            'qualification' => 'Ph.D. in Mathematics, B.Ed',
            'department' => 'Mathematics',
            'assigned_subjects' => ['Mathematics', 'Advanced Algebra'],
            'assigned_classes' => ['Class 10', 'Class 9'],
            'class_teacher_class' => 'Class 10',
            'joining_date' => '2019-06-10',
            'status' => 'Active',
        ]);

        // -------------------------------------------------------------
        // 4. STUDENT RECORD (Aarav Patel linked to rajesh@school.com)
        // -------------------------------------------------------------
        $student = Student::create([
            'user_id' => $parentUser->id,
            'admission_number' => 'STU-2024-X-101',
            'roll_number' => '101',
            'first_name' => 'Aarav',
            'last_name' => 'Patel',
            'date_of_birth' => '2010-10-14',
            'gender' => 'Male',
            'blood_group' => 'O+ Positive',
            'school_class_id' => $classModels['Class 10']->id,
            'section_id' => $section10A->id,
            'admission_date' => '2020-04-04',
            'guardian_name' => 'Rajesh Patel',
            'guardian_phone' => '+91 87672 27125',
            'guardian_email' => 'rajesh@school.com',
            'guardian_relation' => 'Father',
            'address' => 'Flat 402, Royal Palms Residency, MG Road, Sector 14, Pune, Maharashtra - 411038',
            'emergency_contact' => '+91 87672 27125',
            'medical_notes' => 'Fit for sports and physical training. No severe allergies.',
            'status' => 'Active',
        ]);

        // -------------------------------------------------------------
        // 5. ATTENDANCE RECORDS (Daily logs + Absences)
        // -------------------------------------------------------------
        $augustLogs = [
            ['2026-08-17', 'Present', '7:52 AM', 'In Session', 'RFID Smart Gate 1', 'On Time'],
            ['2026-08-16', 'Weekend', null, null, '—', 'Sunday Holiday'],
            ['2026-08-15', 'Present', '7:45 AM', '11:30 AM', 'Biometric Turnstile', 'Independence Day Assembly'],
            ['2026-08-14', 'Present', '7:50 AM', '1:15 PM', 'RFID Smart Gate 1', 'On Time'],
            ['2026-08-13', 'Late', '8:05 AM', '1:15 PM', 'Manual Attendance', 'Late Arrival (10 mins bus delay)'],
            ['2026-08-12', 'Present', '7:54 AM', '1:15 PM', 'RFID Smart Gate 1', 'On Time'],
            ['2026-08-11', 'Present', '7:48 AM', '1:15 PM', 'RFID Smart Gate 1', 'On Time'],
            ['2026-08-10', 'Present', '7:51 AM', '1:15 PM', 'RFID Smart Gate 1', 'On Time'],
            ['2026-08-09', 'Weekend', null, null, '—', 'Sunday Holiday'],
            ['2026-08-08', 'Present', '7:55 AM', '12:30 PM', 'RFID Smart Gate 2', 'On Time'],
            ['2026-08-07', 'Present', '7:53 AM', '1:15 PM', 'RFID Smart Gate 1', 'On Time'],
            ['2026-08-06', 'Present', '7:49 AM', '1:15 PM', 'RFID Smart Gate 1', 'On Time'],
            ['2026-08-05', 'Absent', null, null, 'Absence Recorded', 'Viral Fever & Medical Rest'],
            ['2026-08-04', 'Present', '7:50 AM', '1:15 PM', 'RFID Smart Gate 1', 'On Time'],
            ['2026-08-03', 'Present', '7:52 AM', '1:15 PM', 'RFID Smart Gate 1', 'On Time'],
            ['2026-08-02', 'Weekend', null, null, '—', 'Sunday Holiday'],
            ['2026-08-01', 'Present', '7:56 AM', '12:30 PM', 'RFID Smart Gate 1', 'On Time'],
            ['2026-07-18', 'Absent', null, null, 'Absence Recorded', 'Family Function (Sibling Wedding)'],
            ['2026-06-26', 'Absent', null, null, 'Absence Recorded', 'Severe Waterlogging / Transit Disruption'],
            ['2026-05-14', 'Absent', null, null, 'Absence Recorded', 'Dental Surgery & Recovery'],
        ];

        foreach ($augustLogs as $log) {
            StudentAttendance::create([
                'student_id' => $student->id,
                'date' => $log[0],
                'status' => $log[1],
                'check_in_time' => $log[2] ? '07:52:00' : null,
                'check_out_time' => $log[3] ? '13:15:00' : null,
                'mode' => $log[4],
                'remarks' => $log[5],
            ]);
        }

        // -------------------------------------------------------------
        // 6. FEES & FINANCIAL LEDGER
        // -------------------------------------------------------------
        $feeInstallments = [
            ['Quarter 1 (Apr - Jun 2026)', 30000, '2026-04-15', 'Paid', '2026-04-10', 'TXN-HDFC-991823', 'Net Banking', 'REC-2026-0101'],
            ['Quarter 2 (Jul - Sep 2026)', 30000, '2026-07-15', 'Paid', '2026-07-12', 'TXN-UPI-883192', 'UPI (GPay)', 'REC-2026-0188'],
            ['Transport & Transit (Annual)', 15000, '2026-04-15', 'Paid', '2026-04-10', 'TXN-HDFC-991824', 'Net Banking', 'REC-2026-0102'],
            ['Science & Lab Fee (Annual)', 15000, '2026-07-15', 'Paid', '2026-07-12', 'TXN-UPI-883193', 'UPI', 'REC-2026-0189'],
            ['Quarter 3 (Oct - Dec 2026)', 15000, '2026-09-15', 'Pending', null, null, null, null],
            ['Quarter 4 (Jan - Mar 2027)', 15000, '2026-12-15', 'Upcoming', null, null, null, null],
        ];

        foreach ($feeInstallments as $f) {
            StudentFee::create([
                'student_id' => $student->id,
                'term_name' => $f[0],
                'amount' => $f[1],
                'due_date' => $f[2],
                'status' => $f[3],
                'paid_date' => $f[4],
                'transaction_id' => $f[5],
                'payment_mode' => $f[6],
                'receipt_number' => $f[7],
                'tax_deductible' => true,
            ]);
        }

        // -------------------------------------------------------------
        // 7. FACULTY FEEDBACKS
        // -------------------------------------------------------------
        $feedbacks = [
            [
                'Mathematics',
                'Dr. Ananya Sen (PGT)',
                5.0,
                ['clarity' => 5, 'doubtResolution' => 5, 'homeworkPace' => 5],
                'Exceptional teaching methodology in Quadratic Equations and board exam problem sets. Regular weekly tests have significantly improved Aarav confidence.',
                'Thank you for your valuable feedback! Dr. Ananya has been commended for her dedication in senior academic reviews.',
            ],
            [
                'Science (Physics)',
                'Mr. Vikram Rathore (PGT)',
                4.5,
                ['clarity' => 5, 'doubtResolution' => 4, 'homeworkPace' => 4.5],
                'Practical sessions in Ray Optics and lab demonstrations are very engaging. Requesting additional practice questions for numericals.',
                'Noted with thanks. Additional chapterwise numerical question banks have been uploaded to the Study Material tab.',
            ],
            [
                'English Core',
                'Ms. Sunita Rao (TGT)',
                4.0,
                ['clarity' => 4, 'doubtResolution' => 4, 'homeworkPace' => 4],
                'Good grammar explanations and essay writing feedback. Thorough correction of worksheets.',
                null,
            ],
        ];

        foreach ($feedbacks as $fb) {
            Feedback::create([
                'user_id' => $parentUser->id,
                'student_id' => $student->id,
                'subject' => $fb[0],
                'teacher_name' => $fb[1],
                'rating' => $fb[2],
                'category_ratings' => $fb[3],
                'comment' => $fb[4],
                'admin_response' => $fb[5],
            ]);
        }

        // -------------------------------------------------------------
        // 8. PTM APPOINTMENTS & PAST HISTORY
        // -------------------------------------------------------------
        PtmAppointment::create([
            'student_id' => $student->id,
            'user_id' => $parentUser->id,
            'term_title' => 'Upcoming PTM Term 1',
            'meeting_date' => '2026-09-05',
            'time_slot' => '10:30 AM - 11:00 AM',
            'venue' => 'Room 301 (Senior Academic Wing)',
            'teacher_name' => 'Dr. Ananya Sen (Class Teacher)',
            'status' => 'Confirmed',
            'agenda_notes' => 'Would like to discuss mid-term preparation and recommended reference books for Class X Math.',
        ]);

        PtmAppointment::create([
            'student_id' => $student->id,
            'user_id' => $parentUser->id,
            'term_title' => 'Orientation & Term 1 Initial PTM',
            'meeting_date' => '2026-05-02',
            'time_slot' => '10:00 AM - 10:30 AM',
            'venue' => 'Room 301',
            'teacher_name' => 'Dr. Ananya Sen (Class Teacher)',
            'status' => 'Completed',
            'discussion_summary' => 'Discussion on Class X curriculum pace, board examination registration, and focus areas for mathematics problem solving.',
            'key_decisions' => 'Parent agreed to monitor 2 hours daily study schedule. Aarav enrolled in weekly advanced problem-solving club.',
        ]);

        PtmAppointment::create([
            'student_id' => $student->id,
            'user_id' => $parentUser->id,
            'term_title' => 'Class IX Annual Final PTM',
            'meeting_date' => '2026-03-24',
            'time_slot' => '11:00 AM - 11:30 AM',
            'venue' => 'Science Block Lab 2',
            'teacher_name' => 'Mr. Vikram Rathore (Ex-Class Teacher)',
            'status' => 'Completed',
            'discussion_summary' => 'Class IX Annual report card discussion. Overall Grade: 91.8% (A1). Commended for excellent lab work.',
            'key_decisions' => 'Recommended for Senior Mathematics Standard in Class X.',
        ]);

        // -------------------------------------------------------------
        // 9. STUDY MATERIALS / DIGITAL LIBRARY
        // -------------------------------------------------------------
        $studyMaterials = [
            ['SM-01', 'Class 10 Mathematics: All Board Formulas & Solved Exemplar Problems 2026', 'Mathematics', 'PDF', '4.2 MB', 'Dr. Ananya Sen (PGT)', '2026-08-12', 142, 'Complete formula sheet covering Quadratic Equations, AP, Triangles, and Coordinate Geometry with 50+ solved CBSE previous year questions.'],
            ['SM-02', 'Science NCERT Exemplar Solutions & Comprehensive Physics Lab Manual', 'Science', 'PDF', '6.8 MB', 'Mr. Vikram Rathore (PGT)', '2026-08-10', 188, 'Step-by-step practical record write-ups for Ray Optics and Chemical Reactions with ray diagrams and expected viva questions.'],
            ['SM-03', 'English Literature Question Bank & Reference Guide (First Flight)', 'English', 'PDF', '3.1 MB', 'Ms. Sunita Rao (TGT)', '2026-08-08', 95, 'Character sketches, theme summaries, extract-based multiple choice questions, and standard letter formats.'],
            ['SM-04', 'Social Science: Nationalism in India Complete Mindmaps & Map Practice', 'Social Science', 'PDF', '5.5 MB', 'Mr. Manoj Joshi (TGT)', '2026-08-05', 110, 'Visual flowcharts of the Freedom Movement, historical dates timeline, and high-resolution state maps for board practice.'],
            ['SM-05', 'Computer Science: Python 3 Cheatsheet & SQL Database Practice Queries', 'Computer Science', 'ZIP', '8.4 MB', 'Mrs. Deepa K. (PGT)', '2026-08-02', 160, 'Code examples for Python functions, list comprehensions, and ready-to-run SQL schema creation scripts for board project.'],
            ['SM-06', 'Mathematics: Chapterwise Mock Test Papers with Marking Scheme', 'Mathematics', 'PDF', '3.8 MB', 'Dr. Ananya Sen (PGT)', '2026-07-28', 204, 'Five 80-mark sample papers following the latest 2026-27 CBSE pattern with detailed solution keys and marking distribution.'],
        ];

        foreach ($studyMaterials as $sm) {
            StudyMaterial::create([
                'code' => $sm[0],
                'school_class_id' => $classModels['Class 10']->id,
                'class_name' => 'Class 10',
                'title' => $sm[1],
                'subject' => $sm[2],
                'type' => $sm[3],
                'file_size' => $sm[4],
                'uploader_name' => $sm[5],
                'publish_date' => $sm[6],
                'downloads_count' => $sm[7],
                'description' => $sm[8],
            ]);
        }

        // -------------------------------------------------------------
        // 10. SCHOOL TIMETABLE (Class 10)
        // -------------------------------------------------------------
        $weeklyTimetable = [
            'Monday' => [
                [1, '8:00 - 8:45 AM', 'Mathematics', 'Dr. Ananya Sen', 'Room 301', 'Theory', 'Quadratic Equations Word Problems'],
                [2, '8:45 - 9:30 AM', 'Science (Physics)', 'Mr. Vikram Rathore', 'Physics Lab 1', 'Lab Practical', 'Ray Optics Reflection Experiment'],
                [3, '9:45 - 10:30 AM', 'English Core', 'Ms. Sunita Rao', 'Room 301', 'Literature', 'Nelson Mandela: Long Walk to Freedom'],
                [4, '10:30 - 11:15 AM', 'Computer Science (AI & Python)', 'Mrs. Deepa K.', 'Computer Lab 2', 'Practical', 'Python Functions & Recursion'],
                [5, '11:30 - 12:15 PM', 'Social Science', 'Mr. Manoj Joshi', 'Room 301', 'History', 'Nationalism in India — Section 2'],
                [6, '12:15 - 1:00 PM', 'Physical Education & Athletics', 'Coach Sandeep', 'Sports Arena', 'Sports', 'Track Sprinting & Football'],
            ],
            'Tuesday' => [
                [1, '8:00 - 8:45 AM', 'Science (Chemistry)', 'Mr. Rajesh Mehra', 'Chemistry Lab', 'Lab Practical', 'Acids & Bases Titration'],
                [2, '8:45 - 9:30 AM', 'Mathematics', 'Dr. Ananya Sen', 'Room 301', 'Theory', 'Arithmetic Progressions nth Term'],
                [3, '9:45 - 10:30 AM', 'Hindi / 2nd Language', 'Mr. Suresh Kumar', 'Room 301', 'Literature', 'Kavita Paath & Vyakaran'],
                [4, '10:30 - 11:15 AM', 'Social Science (Geography)', 'Mr. Manoj Joshi', 'Room 301', 'Geography', 'Soil Resources in India'],
                [5, '11:30 - 12:15 PM', 'English Core', 'Ms. Sunita Rao', 'Room 301', 'Grammar', 'Subject-Verb Concord Practice'],
                [6, '12:15 - 1:00 PM', 'Library & Self Study', 'Mr. R. K. Verma', 'Central Library', 'Self Study', 'Reference Reading'],
            ],
            'Wednesday' => [
                [1, '8:00 - 8:45 AM', 'Mathematics', 'Dr. Ananya Sen', 'Room 301', 'Theory', 'AP Sum Formulas'],
                [2, '8:45 - 9:30 AM', 'Science (Biology)', 'Ms. Deepa Nair', 'Biology Lab', 'Lab Practical', 'Human Heart Structure Demonstration'],
                [3, '9:45 - 10:30 AM', 'Social Science (Civics)', 'Mr. Manoj Joshi', 'Room 301', 'Civics', 'Federalism in India'],
                [4, '10:30 - 11:15 AM', 'English Core', 'Ms. Sunita Rao', 'Room 301', 'Writing Skills', 'Letter to Editor Drafting'],
                [5, '11:30 - 12:15 PM', 'Computer Science (Python)', 'Mrs. Deepa K.', 'Computer Lab 2', 'Practical', 'Lists & Dictionary Operations'],
                [6, '12:15 - 1:00 PM', 'Arts & Music', 'Ms. Pallavi Roy', 'Fine Arts Studio', 'Activity', 'Canvas Painting'],
            ],
            'Thursday' => [
                [1, '8:00 - 8:45 AM', 'Science (Physics)', 'Mr. Vikram Rathore', 'Room 301', 'Theory', 'Refraction & Lens Law'],
                [2, '8:45 - 9:30 AM', 'Mathematics', 'Dr. Ananya Sen', 'Room 301', 'Problem Solving', 'Board PYQs Practice'],
                [3, '9:45 - 10:30 AM', 'English Core', 'Ms. Sunita Rao', 'Room 301', 'Literature', 'Dust of Snow Poetry Analysis'],
                [4, '10:30 - 11:15 AM', 'Social Science (Economics)', 'Mr. Manoj Joshi', 'Room 301', 'Economics', 'Development & National Income'],
                [5, '11:30 - 12:15 PM', 'Hindi / 2nd Language', 'Mr. Suresh Kumar', 'Room 301', 'Grammar', 'Samas & Sandhi Practice'],
                [6, '12:15 - 1:00 PM', 'Robotics & STEM Club', 'Mr. Alok Verma', 'Robotics Lab', 'Hands-on', 'Microcontroller Programming'],
            ],
            'Friday' => [
                [1, '8:00 - 8:45 AM', 'Mathematics', 'Dr. Ananya Sen', 'Room 301', 'Theory', 'Triangles Similarity Theorems'],
                [2, '8:45 - 9:30 AM', 'Science (Chemistry)', 'Mr. Rajesh Mehra', 'Room 301', 'Theory', 'Plaster of Paris & Bleaching Powder'],
                [3, '9:45 - 10:30 AM', 'Social Science', 'Mr. Manoj Joshi', 'Room 301', 'History', 'Civil Disobedience Movement'],
                [4, '10:30 - 11:15 AM', 'Computer Science (SQL)', 'Mrs. Deepa K.', 'Computer Lab 2', 'Practical', 'SQL Table Constraints'],
                [5, '11:30 - 12:15 PM', 'English Core', 'Ms. Sunita Rao', 'Room 301', 'Comprehension', 'Discursive Passage Analysis'],
                [6, '12:15 - 1:00 PM', 'Sports & Games', 'Coach Sandeep', 'Football Ground', 'Sports', 'House League Match'],
            ],
            'Saturday' => [
                [1, '8:00 - 8:45 AM', 'Weekly Assessment Test', 'Class Invigilator', 'Room 301', 'Test', 'Weekly Revision Test'],
                [2, '8:45 - 9:30 AM', 'Science Doubt Resolution', 'Mr. Vikram Rathore', 'Room 301', 'Remedial', 'Student Doubts Clearance'],
                [3, '9:45 - 10:30 AM', 'Math Doubt Resolution', 'Dr. Ananya Sen', 'Room 301', 'Remedial', 'Board Questions Solving'],
                [4, '10:30 - 11:15 AM', 'Co-Curricular & Club Activity', 'Club Incharges', 'Activity Hall', 'Club', 'Debate & Quiz Society'],
            ],
        ];

        foreach ($weeklyTimetable as $day => $slots) {
            foreach ($slots as $slot) {
                Timetable::create([
                    'school_class_id' => $classModels['Class 10']->id,
                    'section_id' => $section10A->id,
                    'created_by_teacher_id' => $shrutiTeacher->id,
                    'class_name' => 'Class 10',
                    'division' => 'Div A',
                    'day_of_week' => $day,
                    'period_number' => $slot[0],
                    'period_name' => 'Period ' . $slot[0],
                    'time_slot' => $slot[1],
                    'subject' => $slot[2],
                    'teacher_name' => $slot[3],
                    'room' => $slot[4],
                    'type' => $slot[5],
                ]);
            }
        }

        $extraClassLectures = [
            'Monday' => [
                ['Class 9', 'Div A', 2, '8:45 - 9:30 AM', 'Mathematics (Algebra)', 'Shruti Sen', 'Room 204', 'Theory', $shrutiTeacher->id],
                ['Class 9', 'Div B', 4, '10:30 - 11:15 AM', 'Advanced Geometry', 'Shruti Sen', 'Room 205', 'Theory', $shrutiTeacher->id],
                ['Class 8', 'Div A', 5, '11:30 - 12:15 PM', 'Foundation Mathematics', 'Shruti Sen', 'Room 102', 'Theory', $shrutiTeacher->id],
            ],
            'Tuesday' => [
                ['Class 9', 'Div A', 1, '8:00 - 8:45 AM', 'Mathematics', 'Shruti Sen', 'Room 204', 'Theory', $shrutiTeacher->id],
                ['Class 8', 'Div B', 4, '10:30 - 11:15 AM', 'Mathematics (Pre-Algebra)', 'Shruti Sen', 'Room 103', 'Theory', $shrutiTeacher->id],
            ],
            'Wednesday' => [
                ['Class 9', 'Div A', 2, '8:45 - 9:30 AM', 'Math Lab & Geometry', 'Shruti Sen', 'Math Lab', 'Practical', $shrutiTeacher->id],
                ['Class 8', 'Div A', 4, '10:30 - 11:15 AM', 'Linear Equations', 'Shruti Sen', 'Room 102', 'Theory', $shrutiTeacher->id],
            ],
            'Thursday' => [
                ['Class 9', 'Div B', 1, '8:00 - 8:45 AM', 'Mathematics', 'Shruti Sen', 'Room 205', 'Theory', $shrutiTeacher->id],
                ['Class 8', 'Div A', 3, '9:45 - 10:30 AM', 'Foundation Maths', 'Shruti Sen', 'Room 102', 'Theory', $shrutiTeacher->id],
            ],
            'Friday' => [
                ['Class 9', 'Div A', 3, '9:45 - 10:30 AM', 'Algebraic Expressions', 'Shruti Sen', 'Room 204', 'Theory', $shrutiTeacher->id],
                ['Class 8', 'Div B', 5, '11:30 - 12:15 PM', 'Math Olympiad Club', 'Shruti Sen', 'Activity Hall', 'Activity', $shrutiTeacher->id],
            ],
            'Saturday' => [
                ['Class 9', 'Div A', 2, '8:45 - 9:30 AM', 'Weekly Math Quiz', 'Shruti Sen', 'Room 204', 'Assessment', $shrutiTeacher->id],
            ],
        ];

        foreach ($extraClassLectures as $day => $slots) {
            foreach ($slots as $s) {
                Timetable::create([
                    'class_name' => $s[0],
                    'division' => $s[1],
                    'day_of_week' => $day,
                    'period_number' => $s[2],
                    'period_name' => 'Period ' . $s[2],
                    'time_slot' => $s[3],
                    'subject' => $s[4],
                    'teacher_name' => $s[5],
                    'room' => $s[6],
                    'type' => $s[7],
                    'created_by_teacher_id' => $s[8],
                ]);
            }
        }

        // -------------------------------------------------------------
        // 11. SYLLABUS, UNITS & TEACHER PROGRESS LOGS
        // -------------------------------------------------------------
        $syllabusData = [
            'math' => [
                'name' => 'Mathematics (Standard)',
                'code' => 'MATH-041',
                'teacher' => 'Dr. Ananya Sen (PGT)',
                'completion' => 78,
                'units' => [
                    [1, 'Unit 1: Number Systems — Real Numbers', 'Completed', 100, '12 Lectures', ['Fundamental Theorem of Arithmetic', 'Revisiting Irrational Numbers', 'Decimal Expansions']],
                    [2, 'Unit 2: Algebra — Polynomials & Quadratic Equations', 'Completed', 100, '18 Lectures', ['Zeroes of a Polynomial', 'Quadratic Formula & Factorization', 'Nature of Roots']],
                    [3, 'Unit 3: Algebra — Arithmetic Progressions', 'In Progress', 80, '8/10 Lectures', ['nth Term of an AP', 'Sum of First n Terms', 'Application Word Problems']],
                    [4, 'Unit 4: Geometry — Triangles & Coordinate Geometry', 'In Progress', 55, '6/11 Lectures', ['Similarity Criteria (AAA, SAS, SSS)', 'Areas of Similar Triangles', 'Distance & Section Formula']],
                    [5, 'Unit 5: Trigonometry & Its Applications', 'Scheduled', 0, 'Starts Sep 01', ['Trigonometric Ratios & Identities', 'Heights and Distances', 'Angle of Elevation & Depression']],
                    [6, 'Unit 6: Statistics & Probability', 'Scheduled', 0, 'Starts Oct 15', ['Mean, Median, Mode of Grouped Data', 'Classical Definition of Probability']],
                ],
            ],
            'science' => [
                'name' => 'Science (Physics, Chemistry & Biology)',
                'code' => 'SCI-086',
                'teacher' => 'Mr. Vikram Rathore (PGT)',
                'completion' => 72,
                'units' => [
                    [1, 'Unit 1: Chemical Reactions and Equations', 'Completed', 100, '10 Lectures', ['Balancing Chemical Equations', 'Types of Reactions', 'Oxidation & Reduction']],
                    [2, 'Unit 2: Acids, Bases and Salts', 'Completed', 100, '12 Lectures', ['pH Scale & Importance', 'Preparation of Bleaching Powder, Baking Soda, Plaster of Paris']],
                    [3, 'Unit 3: Light — Reflection and Refraction', 'In Progress', 70, '9/14 Lectures', ['Mirror & Lens Formulas', 'Refraction through Glass Slab', 'Power of a Lens']],
                    [4, 'Unit 4: Human Eye and Colourful World', 'Scheduled', 0, 'Starts Sep 05', ['Defects of Vision & Correction', 'Dispersion & Atmospheric Refraction']],
                    [5, 'Unit 5: Life Processes — Nutrition & Respiration', 'Completed', 100, '14 Lectures', ['Autotrophic & Heterotrophic Nutrition', 'Human Circulatory & Excretory System']],
                ],
            ],
            'english' => [
                'name' => 'English Language & Literature',
                'code' => 'ENG-184',
                'teacher' => 'Ms. Sunita Rao (TGT)',
                'completion' => 85,
                'units' => [
                    [1, 'First Flight — Prose & Poetry', 'Completed', 100, '16 Lectures', ['A Letter to God', 'Nelson Mandela: Long Walk to Freedom', 'Dust of Snow & Fire and Ice']],
                    [2, 'Footprints without Feet — Supplementary Reader', 'In Progress', 85, '8/10 Lectures', ['A Triumph of Surgery', 'The Thief’s Story', 'The Midnight Visitor']],
                    [3, 'Grammar & Formal Letter Writing', 'In Progress', 80, '6/8 Lectures', ['Subject-Verb Concord', 'Tenses & Modals', 'Formal Letters to Editor & Complaint']],
                    [4, 'Analytical Paragraph & Reading Comprehension', 'Scheduled', 0, 'Starts Sep 10', ['Data & Chart-based Analytical Paragraphs', 'Discursive Unseen Passages']],
                ],
            ],
            'social' => [
                'name' => 'Social Science (History, Civics, Geography, Economics)',
                'code' => 'SST-087',
                'teacher' => 'Mr. Manoj Joshi (TGT)',
                'completion' => 70,
                'units' => [
                    [1, 'History: The Rise of Nationalism in Europe', 'Completed', 100, '12 Lectures', ['The French Revolution & Idea of Nation', 'The Age of Revolutions: 1830-1848', 'Making of Germany and Italy']],
                    [2, 'History: Nationalism in India', 'In Progress', 75, '6/8 Lectures', ['Non-Cooperation Movement', 'Salt March & Civil Disobedience', 'Sense of Collective Belonging']],
                    [3, 'Geography: Resources and Development', 'Completed', 100, '8 Lectures', ['Resource Planning in India', 'Land Use Pattern', 'Soil Classification']],
                    [4, 'Civics: Power Sharing and Federalism', 'In Progress', 60, '5/8 Lectures', ['Case Studies of Belgium & Sri Lanka', 'Features of Federalism in India']],
                ],
            ],
            'cs' => [
                'name' => 'Computer Applications & AI',
                'code' => 'CA-165',
                'teacher' => 'Mrs. Deepa Krishnan (PGT)',
                'completion' => 90,
                'units' => [
                    [1, 'Unit 1: Networking Basics & Internet Protocols', 'Completed', 100, '8 Lectures', ['TCP/IP, HTTP, FTP', 'Cloud Computing & Cyber Safety']],
                    [2, 'Unit 2: HTML5, CSS & Web Page Design', 'Completed', 100, '14 Lectures', ['Tables, Forms, Embedded Media', 'Responsive CSS Layouts']],
                    [3, 'Unit 3: Python Programming & Logic', 'In Progress', 85, '12/14 Lectures', ['Conditionals & Loops', 'Lists, Dictionaries & Functions']],
                    [4, 'Unit 4: Database Management & SQL', 'Scheduled', 0, 'Starts Sep 01', ['CREATE, SELECT, INSERT, UPDATE Queries', 'Table Constraints']],
                ],
            ],
        ];

        foreach ($syllabusData as $key => $sData) {
            $syllabus = Syllabus::create([
                'school_class_id' => $classModels['Class 10']->id,
                'class_name' => 'Class 10',
                'subject_key' => $key,
                'subject_name' => $sData['name'],
                'subject_code' => $sData['code'],
                'teacher_name' => $sData['teacher'],
                'completion_percentage' => $sData['completion'],
            ]);

            foreach ($sData['units'] as $u) {
                SyllabusUnit::create([
                    'syllabus_id' => $syllabus->id,
                    'unit_number' => $u[0],
                    'title' => $u[1],
                    'status' => $u[2],
                    'progress_percentage' => $u[3],
                    'lectures_info' => $u[4],
                    'topics' => $u[5],
                ]);
            }
        }

        // Seed Progress Logs
        $mathSyllabus = Syllabus::where('subject_key', 'math')->first();
        $scienceSyllabus = Syllabus::where('subject_key', 'science')->first();

        SyllabusProgressLog::create([
            'syllabus_id' => $mathSyllabus->id,
            'subject_name' => 'Mathematics',
            'class_name' => 'Grade 10-A',
            'unit_title' => 'Unit 3: Arithmetic Progressions',
            'log_date' => '2026-08-17',
            'progress_percentage' => 80,
            'message' => 'Completed derivation of Sum of first n terms formula. Solved 6 word problems in class. All students submitted notebook exercises.',
            'teacher_name' => 'Dr. Ananya Sen',
        ]);

        SyllabusProgressLog::create([
            'syllabus_id' => $scienceSyllabus->id,
            'subject_name' => 'Science (Physics)',
            'class_name' => 'Grade 10-A',
            'unit_title' => 'Unit 3: Light — Reflection and Refraction',
            'log_date' => '2026-08-14',
            'progress_percentage' => 70,
            'message' => 'Demonstrated convex lens ray diagrams and image formation in physics lab. Practical records verified.',
            'teacher_name' => 'Mr. Vikram Rathore',
        ]);

        // -------------------------------------------------------------
        // 12. SCHOOL CALENDAR EVENTS & HOLIDAYS (Posted by HR/Admin)
        // -------------------------------------------------------------
        $calendarEvents = [
            ['Mid-Term Mathematics Board Pattern Exam', 'Exam', 'Aug 20, 2026', '2026-08-20', null, '9:00 AM - 12:00 PM', 'Main Examination Hall A', 'August 2026', 'Syllabus: Units 1 to 3. Bring verified board geometry kit and admit card.'],
            ['Science Practical Lab Evaluation & Viva', 'Exam', 'Aug 22, 2026', '2026-08-22', null, '10:00 AM - 1:00 PM', 'Senior Physics & Chemistry Labs', 'August 2026', 'Submission of completed practical record files is mandatory before entering the lab.'],
            ['Janmashtami Institutional Holiday', 'Holiday', 'Aug 26, 2026', '2026-08-26', null, 'Full Day', 'Campus Closed', 'August 2026', 'School will remain closed on account of Sri Krishna Janmashtami.'],
            ['Annual Zonal Inter-School Athletics Championship', 'Event', 'Aug 28, 2026', '2026-08-28', null, '8:00 AM - 4:00 PM', 'School Sports Arena & Track', 'August 2026', 'House athletic competitions across Track & Field events. Parents cordially invited.'],
            ['Distinguished Keynote: "Future of Space STEM"', 'Event', 'Sep 04, 2026', '2026-09-04', null, '11:00 AM - 1:00 PM', 'Main Auditorium', 'September 2026', 'Special lecture for Grades IX to XII by former ISRO Chairman.'],
            ['Parent-Teacher Meeting (PTM Term 1)', 'PTM', 'Sep 05, 2026', '2026-09-05', null, '9:00 AM - 1:00 PM', 'Respective Classrooms', 'September 2026', '1-on-1 performance review of Unit Tests and Mid-Term examinations with class teachers.'],
            ['Ganesh Chaturthi Holiday', 'Holiday', 'Sep 07, 2026', '2026-09-07', null, 'Full Day', 'Campus Closed', 'September 2026', 'Gazetted holiday for Ganesh Chaturthi.'],
            ['Grandparents Day Gathering & Cultural Fiesta', 'Event', 'Sep 12, 2026', '2026-09-12', null, '9:30 AM - 1:30 PM', 'Open-Air Amphitheatre', 'September 2026', 'Special cultural performances and music dedicated to our grandparents.'],
            ['Inter-House Science & Robotics Innovation Expo 2026', 'Event', 'Sep 20, 2026', '2026-09-20', null, '10:00 AM - 3:00 PM', 'Senior Science Wings', 'September 2026', 'Working model demonstrations and robotics competition for all student houses.'],
            ['Gandhi Jayanti Holiday', 'Holiday', 'Oct 02, 2026', '2026-10-02', null, 'Full Day', 'Campus Closed', 'October 2026', 'National holiday on the occasion of Mahatma Gandhi Birthday.'],
            ['Half-Yearly Summative Assessment Exams (SA-1)', 'Exam', 'Oct 10 - Oct 22, 2026', '2026-10-10', '2026-10-22', '9:00 AM - 12:30 PM', 'All Classrooms', 'October 2026', 'Major mid-session board pattern examinations covering 50% CBSE syllabus.'],
            ['Dussehra & Autumn Vacation', 'Holiday', 'Oct 23 - Oct 28, 2026', '2026-10-23', '2026-10-28', '6 Days', 'Campus Closed', 'October 2026', 'Autumn break for students and faculty. Classes resume Oct 29.'],
        ];

        foreach ($calendarEvents as $ce) {
            SchoolCalendarEvent::create([
                'title' => $ce[0],
                'event_type' => $ce[1],
                'date_label' => $ce[2],
                'start_date' => $ce[3],
                'end_date' => $ce[4],
                'time_slot' => $ce[5],
                'venue' => $ce[6],
                'month_label' => $ce[7],
                'description' => $ce[8],
            ]);
        }

        // -------------------------------------------------------------
        // 13. SCHOOL NOTICES & CIRCULARS
        // -------------------------------------------------------------
        $notices = [
            ['Registration Open for Inter-School STEM & Robotics Innovation Expo 2026', 'Academic', 'Important', 'Principal Office & STEM Innovation Cell', '2026-08-16', 'Students of Grades IX to XII with keen interest in Robotics, AI, IoT, and Clean Energy innovations are invited to register their working projects by Aug 25. Selected models will represent the school at the National TechFest with full mentorship and sponsorship.', 'STEM_Expo_Registration_Guidelines_2026.pdf'],
            ['Mandatory CBSE Board Candidate Registration Data Verification for Class X', 'Examination', 'Urgent', 'Examination Controller', '2026-08-14', 'All Class X parents are requested to verify their child’s spelling, Date of Birth, Aadhaar details, and subject selection (Math Standard/Basic) in the CBSE LOC portal before Aug 22. Any discrepancy after final submission will not be entertainable by the board.', 'CBSE_LOC_Verification_Form.pdf'],
            ['Annual Comprehensive Eye & Dental Health Checkup Camp in Campus', 'Health & Wellness', 'Normal', 'School Health & Wellness Department', '2026-08-12', 'A team of specialist doctors from Apollo Super Specialty Hospitals will conduct free eye, dental, and general pediatric checkups for all students on Aug 24 in the campus infirmary. Individual health report cards will be shared with parents via portal.', null],
            ['Switch to Compulsory Winter Uniform from October 15, 2026', 'Administrative', 'Normal', 'Administrative Office', '2026-08-08', 'Parents are advised that winter school uniform (Navy blue blazer, grey woolen trousers/skirt, school tie, and navy sweater) will be mandatory starting from Oct 15. The official uniform store is open on all working days from 9 AM to 3 PM.', 'Uniform_Specifications_2026.pdf'],
        ];

        foreach ($notices as $n) {
            SchoolNotice::create([
                'title' => $n[0],
                'category' => $n[1],
                'priority' => $n[2],
                'sender' => $n[3],
                'publish_date' => $n[4],
                'content' => $n[5],
                'attachment_name' => $n[6],
            ]);
        }

        // -------------------------------------------------------------
        // 14. ASSIGNMENTS FOR CLASS 10
        // -------------------------------------------------------------
        $teacherRecord = Teacher::first();
        $hw1 = Assignment::create([
            'teacher_id' => $teacherRecord ? $teacherRecord->id : null,
            'school_class_id' => $classModels['Class 10']->id,
            'title' => 'Quadratic Equations Board Problem Set & Real Roots Proof',
            'subject_name' => 'Mathematics',
            'due_date' => '2026-08-22',
            'due_time' => '23:59',
            'max_marks' => 25,
            'priority' => 'High',
            'description' => 'Complete Exercise 4.3 from NCERT Exemplar. Solve standard board questions on finding real roots using quadratic formula and discriminant analysis.',
            'status' => 'Active',
        ]);

        $hw2 = Assignment::create([
            'teacher_id' => $teacherRecord ? $teacherRecord->id : null,
            'school_class_id' => $classModels['Class 10']->id,
            'title' => 'Ray Optics & Reflection Experiment Lab Record Write-up',
            'subject_name' => 'Science',
            'due_date' => '2026-08-25',
            'due_time' => '17:00',
            'max_marks' => 20,
            'priority' => 'Medium',
            'description' => 'Document experimental observations of light reflection through concave mirrors with calculated focal length tables.',
            'status' => 'Active',
        ]);

        $hw3 = Assignment::create([
            'teacher_id' => $teacherRecord ? $teacherRecord->id : null,
            'school_class_id' => $classModels['Class 10']->id,
            'title' => 'Nelson Mandela: Long Walk to Freedom Analytical Essay',
            'subject_name' => 'English Core',
            'due_date' => '2026-08-15',
            'due_time' => '23:59',
            'max_marks' => 15,
            'priority' => 'Medium',
            'description' => 'Write a 350-word analytical paragraph highlighting the themes of courage and humanity in Mandela inauguration address.',
            'status' => 'Active',
        ]);

        // Aarav's submitted work for English
        AssignmentSubmission::create([
            'assignment_id' => $hw3->id,
            'student_id' => $student->id,
            'status' => 'Graded',
            'score' => 14,
            'teacher_feedback' => 'Excellent articulation of themes and superb vocabulary! Keep it up.',
            'submission_text' => 'Submitted completed essay with citations from the textbook.',
            'submitted_at' => '2026-08-14 18:30:00',
        ]);

        // -------------------------------------------------------------
        // 15. HR MODULE: SALARIES, TRAININGS & STAFF LEAVES
        // -------------------------------------------------------------
        $staffSalaryList = [
            ['EMP-101', 'Dr. Ananya Sen', 'PGT Mathematics', 'Teaching', 65000, 26, 25, 1, 0, 12000, 8000, 5000, 4500, 3500, 0, 90000, 82000, 'Disbursed', '•••• •••• 4589', 'HDFC Bank'],
            ['EMP-102', 'Mr. Vikram Rathore', 'PGT Physics & Science', 'Teaching', 62000, 26, 24, 2, 0, 11000, 7500, 4500, 4200, 3000, 0, 85000, 77800, 'Disbursed', '•••• •••• 8821', 'State Bank of India'],
            ['EMP-103', 'Ms. Sunita Rao', 'TGT English Language', 'Teaching', 52000, 26, 26, 0, 0, 10000, 6500, 4000, 3800, 2500, 0, 72500, 66200, 'Disbursed', '•••• •••• 1045', 'ICICI Bank'],
            ['EMP-104', 'Mr. Rajesh Sharma', 'Senior Admin Officer', 'Administration', 48000, 26, 25, 1, 0, 9000, 6000, 3500, 3500, 2000, 0, 66500, 61000, 'Disbursed', '•••• •••• 6712', 'Axis Bank'],
            ['EMP-105', 'Mrs. Deepa Krishnan', 'IT Head & Computer Science', 'Teaching', 58000, 26, 26, 0, 0, 11000, 7000, 4000, 4000, 2800, 0, 80000, 73200, 'Disbursed', '•••• •••• 9934', 'HDFC Bank'],
            ['EMP-106', 'Mr. Suresh Kumar', 'TGT Hindi & Sanskrit', 'Teaching', 49000, 26, 23, 2, 1, 9000, 6000, 3000, 3600, 2200, 1884, 67000, 59316, 'Processed', '•••• •••• 3418', 'Punjab National Bank'],
            ['EMP-107', 'Ms. Kavita Deshmukh', 'Primary Section Coordinator', 'Primary Wing', 46000, 26, 25, 1, 0, 8500, 5500, 3000, 3400, 2000, 0, 63000, 57600, 'Disbursed', '•••• •••• 5519', 'Bank of Baroda'],
            ['EMP-108', 'Mr. Harish Chandra', 'Head Physical Education', 'Sports', 45000, 26, 26, 0, 0, 8000, 5500, 3000, 3300, 1800, 0, 61500, 56400, 'Disbursed', '•••• •••• 7720', 'Kotak Mahindra Bank'],
        ];

        foreach ($staffSalaryList as $sal) {
            StaffSalary::create([
                'employee_id' => $sal[0],
                'name' => $sal[1],
                'role' => $sal[2],
                'department' => $sal[3],
                'month' => 'August 2026',
                'base_salary' => $sal[4],
                'working_days' => $sal[5],
                'days_present' => $sal[6],
                'paid_leaves' => $sal[7],
                'unpaid_leaves' => $sal[8],
                'hra' => $sal[9],
                'da' => $sal[10],
                'special_allowance' => $sal[11],
                'pf_deduction' => $sal[12],
                'tds_deduction' => $sal[13],
                'unpaid_leave_deduction' => $sal[14],
                'gross_salary' => $sal[15],
                'net_salary' => $sal[16],
                'status' => $sal[17],
                'account_no' => $sal[18],
                'bank_name' => $sal[19],
            ]);
        }

        // Faculty Trainings
        FacultyTraining::create([
            'training_id' => 'TRN-101',
            'title' => 'AI-Powered Lesson Planning & Assessment Creation',
            'category' => 'Technology & AI',
            'trainer_name' => 'Dr. Arvind Swamy (NCERT Tech Advisor)',
            'date' => '2026-08-22',
            'time_slot' => '09:00 AM - 01:30 PM',
            'venue' => 'Main Auditorium & Computer Lab 1',
            'target_audience' => 'All High School & Senior Faculty',
            'enrolled_count' => 32,
            'attendance_rate' => 94,
            'status' => 'Scheduled',
            'description' => 'Comprehensive hands-on workshop on leveraging AI tools for rubric creation, differentiated question paper formulation, and automated classroom analytics.',
        ]);

        FacultyTraining::create([
            'training_id' => 'TRN-102',
            'title' => 'Experiential Learning & NEP 2020 Pedagogical Shift',
            'category' => 'Pedagogy',
            'trainer_name' => 'Prof. Meenakshi Sundaram (CBSE Master Trainer)',
            'date' => '2026-08-29',
            'time_slot' => '10:00 AM - 02:00 PM',
            'venue' => 'Audio-Visual Seminar Room',
            'target_audience' => 'Middle & Primary Wing Educators',
            'enrolled_count' => 28,
            'attendance_rate' => 89,
            'status' => 'Scheduled',
            'description' => 'Interactive module on transdisciplinary inquiry, toy-based pedagogy, and competency assessment matrices mandated by NEP 2020 framework.',
        ]);

        FacultyTraining::create([
            'training_id' => 'TRN-103',
            'title' => 'Student Mental Health & Emotional First Aid',
            'category' => 'Classroom Management',
            'trainer_name' => 'Dr. Radhika Sen (Adolescent Psychologist)',
            'date' => '2026-08-10',
            'time_slot' => '09:30 AM - 12:30 PM',
            'venue' => 'Conference Hall B',
            'target_audience' => 'Homeroom & Class Teachers (All Grades)',
            'enrolled_count' => 35,
            'attendance_rate' => 100,
            'status' => 'Completed',
            'description' => 'Techniques for identifying early signs of exam stress, peer bullying, and building inclusive, empathetic emotional safety nets in secondary classrooms.',
        ]);

        // Staff Leave Requests
        LeaveApplication::create([
            'user_id' => $shrutiTeacher->user_id,
            'teacher_id' => $shrutiTeacher->id,
            'type' => 'Casual Leave',
            'from_date' => '2026-08-22',
            'to_date' => '2026-08-23',
            'days' => 2,
            'reason' => 'Family ceremony and urgent personal obligation at hometown.',
            'status' => 'Pending',
        ]);

        LeaveApplication::create([
            'user_id' => $teacherUser->id,
            'teacher_id' => $teacherRecord ? $teacherRecord->id : null,
            'type' => 'Medical Leave',
            'from_date' => '2026-08-25',
            'to_date' => '2026-08-27',
            'days' => 3,
            'reason' => 'Recovery following medical diagnostic surgery.',
            'status' => 'Pending',
        ]);

        LeaveApplication::create([
            'user_id' => $teacherUser->id,
            'teacher_id' => $teacherRecord ? $teacherRecord->id : null,
            'type' => 'Duty Leave',
            'from_date' => '2026-08-12',
            'to_date' => '2026-08-13',
            'days' => 2,
            'reason' => 'Official CBSE Inter-School Science Olympiad judge deputation.',
            'status' => 'Approved',
            'remarks' => 'Approved as official duty leave. Reliever teacher assigned.',
            'approved_by' => $hrUser->id,
        ]);
    }
}
