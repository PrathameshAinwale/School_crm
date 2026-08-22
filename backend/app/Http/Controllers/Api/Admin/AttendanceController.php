<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\StaffAttendance;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\Teacher;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    /**
     * Get attendance list/matrix for a given date and class.
     */
    public function index(Request $request)
    {
        $date = $request->input('date', Carbon::today()->toDateString());
        $type = $request->input('type', 'student');
        $classId = $request->input('school_class_id');
        $sectionId = $request->input('section_id');

        if ($type === 'staff') {
            $teachers = Teacher::where('status', 'Active')->orderBy('first_name')->get();
            $attendances = StaffAttendance::where('date', $date)->get()->keyBy('teacher_id');

            $records = $teachers->map(function ($teacher) use ($attendances, $date) {
                $att = $attendances->get($teacher->id);
                
                $checkInFormatted = null;
                $checkOutFormatted = null;
                $workDuration = '—';

                if ($att) {
                    if ($att->check_in_time) {
                        $checkInFormatted = Carbon::parse($att->check_in_time)->format('h:i A');
                    }
                    if ($att->check_out_time) {
                        $checkOutFormatted = Carbon::parse($att->check_out_time)->format('h:i A');
                    }

                    if ($att->check_in_time && $att->check_out_time) {
                        $in = Carbon::parse($date . ' ' . $att->check_in_time);
                        $out = Carbon::parse($date . ' ' . $att->check_out_time);
                        $hours = max(0, $out->diffInMinutes($in)) / 60;
                        $workDuration = number_format($hours, 1) . ' hrs';
                    } elseif ($att->check_in_time) {
                        if ($date === Carbon::today()->toDateString()) {
                            $in = Carbon::parse($date . ' ' . $att->check_in_time);
                            $hours = max(0, Carbon::now()->diffInMinutes($in)) / 60;
                            $workDuration = number_format($hours, 1) . ' hrs (Active)';
                        } else {
                            $workDuration = 'Incomplete';
                        }
                    }
                }

                return [
                    'teacher_id' => $teacher->id,
                    'employee_id' => $teacher->teacher_id,
                    'name' => $teacher->full_name,
                    'department' => $teacher->department,
                    'phone' => $teacher->phone,
                    'email' => $teacher->email,
                    'status' => $att ? $att->status : 'Not Marked',
                    'check_in_time' => $checkInFormatted ?: ($att && $att->check_in_time ? $att->check_in_time : '—'),
                    'check_out_time' => $checkOutFormatted ?: ($att && $att->check_out_time ? $att->check_out_time : '—'),
                    'work_duration' => $workDuration,
                    'remarks' => $att ? $att->remarks : null,
                    'is_marked' => (bool) $att,
                ];
            });

            // Summary counts for staff
            $total = $records->count();
            $markedRecords = $records->where('is_marked', true);
            $present = $markedRecords->where('status', 'Present')->count();
            $absent = $markedRecords->where('status', 'Absent')->count();
            $late = $markedRecords->where('status', 'Late')->count();
            $leave = $markedRecords->where('status', 'Leave')->count();
            $rate = $total > 0 ? round(($present / $total) * 100, 1) : 0;

            return response()->json([
                'success' => true,
                'date' => $date,
                'type' => 'staff',
                'summary' => [
                    'total' => $total,
                    'present' => $present,
                    'absent' => $absent,
                    'late' => $late,
                    'leave' => $leave,
                    'attendance_rate' => $rate,
                ],
                'data' => $records,
            ]);
        }

        // Student attendance
        $query = Student::with(['schoolClass', 'section'])->where('status', 'Active');
        if ($classId && strtolower($classId) !== 'all') {
            // Resolve class by name ("Class 10", "10", "Class 1"), or numeric ID
            $matchedClass = SchoolClass::where('name', $classId)
                ->orWhere('name', 'Class ' . $classId)
                ->orWhere('name', 'like', "%{$classId}%")
                ->first();

            if ($matchedClass) {
                $query->where('school_class_id', $matchedClass->id);
            } elseif (is_numeric($classId)) {
                $query->where('school_class_id', $classId);
            }
        }

        if ($sectionId && strtolower($sectionId) !== 'all') {
            $clean = trim(str_ireplace(['Division', 'Section', 'Div', 'Sec'], '', $sectionId));
            preg_match('/[A-Z]/i', $clean, $matches);
            $letter = $matches[0] ?? null;

            $cleanWords = preg_replace('/[^a-zA-Z]/', ' ', $clean);
            $words = array_values(array_filter(explode(' ', $cleanWords)));

            $query->where(function ($sub) use ($sectionId, $clean, $letter, $words) {
                if (is_numeric($sectionId)) {
                    $sub->where('section_id', $sectionId);
                }
                $sub->orWhereHas('section', function ($secQ) use ($clean, $letter, $words) {
                    $secQ->where('name', $clean)
                         ->orWhere('name', 'like', "%{$clean}%");
                    if ($letter) {
                        $secQ->orWhere('name', 'like', "%({$letter})%")
                             ->orWhere('name', 'like', "%{$letter}%");
                    }
                    foreach ($words as $word) {
                        if (strlen($word) > 2) {
                            $secQ->orWhere('name', 'like', "%{$word}%");
                        }
                    }
                });
            });
        }

        $students = $query->orderBy('roll_number', 'asc')->orderBy('first_name', 'asc')->get();

        $attendances = StudentAttendance::where('date', $date)
            ->get()
            ->keyBy('student_id');

        $records = $students->map(function ($student) use ($attendances) {
            $att = $attendances->get($student->id);
            return [
                'student_id' => $student->id,
                'admission_number' => $student->admission_number,
                'roll_number' => $student->roll_number,
                'name' => $student->full_name,
                'class_name' => $student->schoolClass ? $student->schoolClass->name : null,
                'section_name' => $student->section ? $student->section->name : null,
                'status' => $att ? $att->status : 'Present', // default Present
                'remarks' => $att ? $att->remarks : null,
                'is_marked' => (bool) $att,
            ];
        });

        // Summary counts
        $total = $records->count();
        $present = $records->where('status', 'Present')->count();
        $absent = $records->where('status', 'Absent')->count();
        $late = $records->where('status', 'Late')->count();
        $rate = $total > 0 ? round(($present / $total) * 100, 1) : 0;

        return response()->json([
            'success' => true,
            'date' => $date,
            'type' => 'student',
            'summary' => [
                'total' => $total,
                'present' => $present,
                'absent' => $absent,
                'late' => $late,
                'attendance_rate' => $rate,
            ],
            'data' => $records,
        ]);
    }

    /**
     * Batch save / record attendance for students or staff in their dedicated tables.
     */
    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'type' => 'required|in:student,staff',
            'records' => 'required|array',
            'records.*.id' => 'required|integer',
            'records.*.status' => 'required|string',
            'records.*.remarks' => 'nullable|string',
        ]);

        $date = $request->date;
        $type = $request->type;
        $markedBy = $request->user()->id;

        DB::transaction(function () use ($request, $date, $type, $markedBy) {
            foreach ($request->records as $record) {
                if ($type === 'student') {
                    $student = Student::find($record['id']);
                    if (!$student) continue;

                    StudentAttendance::updateOrCreate(
                        [
                            'date' => $date,
                            'student_id' => $student->id,
                        ],
                        [
                            'school_class_id' => $student->school_class_id,
                            'section_id' => $student->section_id,
                            'status' => $record['status'],
                            'remarks' => $record['remarks'] ?? null,
                            'marked_by' => $markedBy,
                        ]
                    );
                } else {
                    $teacher = Teacher::find($record['id']);
                    if (!$teacher) continue;

                    StaffAttendance::updateOrCreate(
                        [
                            'date' => $date,
                            'teacher_id' => $teacher->id,
                        ],
                        [
                            'status' => $record['status'],
                            'remarks' => $record['remarks'] ?? null,
                            'marked_by' => $markedBy,
                        ]
                    );
                }
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Attendance saved successfully for ' . count($request->records) . ' records.',
        ]);
    }
}
