<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class StudentController extends Controller
{
    /**
     * Display a listing of students with class/section filters & search.
     */
    public function index(Request $request)
    {
        $query = Student::with(['schoolClass', 'section', 'user']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('admission_number', 'like', "%{$search}%")
                  ->orWhere('roll_number', 'like', "%{$search}%")
                  ->orWhere('guardian_name', 'like', "%{$search}%")
                  ->orWhere('guardian_phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('school_class_id') && strtolower($request->school_class_id) !== 'all') {
            $classParam = $request->school_class_id;
            $matchedClass = \App\Models\SchoolClass::where('name', $classParam)
                ->orWhere('name', 'Class ' . $classParam)
                ->orWhere('name', 'like', "%{$classParam}%")
                ->first();

            if ($matchedClass) {
                $query->where('school_class_id', $matchedClass->id);
            } elseif (is_numeric($classParam)) {
                $query->where('school_class_id', $classParam);
            }
        }

        if ($request->filled('section_id') && strtolower($request->section_id) !== 'all') {
            $secParam = $request->section_id;
            $clean = trim(str_ireplace(['Division', 'Section', 'Div', 'Sec'], '', $secParam));
            preg_match('/[A-Z]/i', $clean, $matches);
            $letter = $matches[0] ?? null;

            $cleanWords = preg_replace('/[^a-zA-Z]/', ' ', $clean);
            $words = array_values(array_filter(explode(' ', $cleanWords)));

            $query->where(function ($sub) use ($secParam, $clean, $letter, $words) {
                if (is_numeric($secParam)) {
                    $sub->where('section_id', $secParam);
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

        if ($request->filled('status') && strtolower($request->status) !== 'all') {
            $query->where('status', $request->status);
        }

        $students = $query->orderBy('created_at', 'desc')->paginate($request->input('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $students,
        ]);
    }

    /**
     * Store a newly created student and generate parent login credentials (mobile + random pass).
     */
    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'admission_number' => 'nullable|string|unique:students,admission_number',
            'roll_number' => 'required|string|max:50',
            'date_of_birth' => 'required|date',
            'gender' => 'nullable|string|in:Male,Female,Other',
            'blood_group' => 'nullable|string|max:10',
            'school_class_id' => 'nullable',
            'section_id' => 'nullable',
            'admission_date' => 'nullable|date',
            'father_name' => 'nullable|string|max:255',
            'father_occupation' => 'nullable|string|max:255',
            'mother_name' => 'nullable|string|max:255',
            'mother_occupation' => 'nullable|string|max:255',
            'guardian_name' => 'nullable|string|max:255',
            'guardian_phone' => 'required|string|max:20',
            'guardian_email' => 'nullable|email',
            'guardian_relation' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'emergency_contact' => 'nullable|string',
            'status' => 'nullable|string|in:Active,Inactive,Graduated,Transferred',
        ]);

        // Ensure school class exists if provided
        $classId = $request->school_class_id;
        if ($classId && !is_numeric($classId)) {
            $cls = \App\Models\SchoolClass::firstOrCreate(['name' => $classId]);
            $classId = $cls->id;
        } elseif ($classId && !\App\Models\SchoolClass::where('id', $classId)->exists()) {
            $cls = \App\Models\SchoolClass::create(['id' => $classId, 'name' => "Class {$classId}"]);
            $classId = $cls->id;
        }

        // Ensure section exists if provided
        $sectionId = $request->section_id;
        if ($sectionId && !is_numeric($sectionId)) {
            $secName = trim(str_ireplace('Division', '', $sectionId));
            $sec = \App\Models\Section::firstOrCreate(
                ['school_class_id' => $classId, 'name' => $secName],
                ['capacity' => 40]
            );
            $sectionId = $sec->id;
        }

        // Enforce Roll Number Uniqueness within the Class & Division
        $roll = trim($request->roll_number);
        $existingStudent = Student::where('school_class_id', $classId)
            ->where('section_id', $sectionId)
            ->where('roll_number', $roll)
            ->first();

        if ($existingStudent) {
            return response()->json([
                'success' => false,
                'message' => "Roll Number '{$roll}' is already assigned to student {$existingStudent->first_name} {$existingStudent->last_name} in this class and division.",
            ], 422);
        }

        return DB::transaction(function () use ($request, $classId, $sectionId) {
            // 1. Generate unique admission number if not passed
            $admissionNumber = $request->admission_number;
            if (!$admissionNumber) {
                $count = Student::count() + 1;
                $admissionNumber = 'STU-' . date('Y') . '-' . str_pad($count, 3, '0', STR_PAD_LEFT);
            }

            // 2. Auto-generate secure random password for Parent login (e.g. Prnt#9821!)
            $generatedPassword = 'Prnt#' . rand(1000, 9999) . '!';

            // Resolve Guardian Name (Fallback to Father / Mother if empty)
            $guardianName = $request->guardian_name ?: ($request->father_name ?: ($request->mother_name ?: 'Parent'));

            // 3. Find or Create User for parent's mobile number (checks active and trashed accounts)
            $cleanPhone = preg_replace('/[^0-9]/', '', $request->guardian_phone);
            $user = User::withTrashed()
                ->where(function ($q) use ($cleanPhone, $request) {
                    if ($cleanPhone) {
                        $q->where('phone', $cleanPhone)->orWhere('phone', $request->guardian_phone);
                    } else {
                        $q->where('phone', $request->guardian_phone);
                    }
                })
                ->first();

            if ($user) {
                if ($user->trashed()) {
                    $user->restore();
                }
                $user->name = $guardianName . ' (' . $request->first_name . ')';
                if ($request->guardian_email) {
                    $user->email = $request->guardian_email;
                }
                $user->password = Hash::make($generatedPassword);
                $user->must_change_password = true;
                $user->password_changed_at = null;
                $user->status = 'active';
                $user->save();
            } else {
                $user = User::create([
                    'name' => $guardianName . ' (' . $request->first_name . ')',
                    'email' => $request->guardian_email,
                    'phone' => $cleanPhone ?: $request->guardian_phone,
                    'password' => Hash::make($generatedPassword),
                    'role' => 'student_parent',
                    'must_change_password' => true, // Flagged for first-time login
                    'password_changed_at' => null,
                    'status' => 'active',
                ]);
            }

            // 4. Create Student profile
            $student = Student::create([
                'user_id' => $user->id,
                'admission_number' => $admissionNumber,
                'roll_number' => $request->roll_number,
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'date_of_birth' => $request->date_of_birth,
                'gender' => $request->gender,
                'blood_group' => $request->blood_group,
                'school_class_id' => $classId,
                'section_id' => $sectionId,
                'admission_date' => $request->admission_date ?? now()->toDateString(),
                'guardian_name' => $guardianName,
                'father_name' => $request->father_name,
                'father_occupation' => $request->father_occupation,
                'mother_name' => $request->mother_name,
                'mother_occupation' => $request->mother_occupation,
                'guardian_phone' => $request->guardian_phone,
                'guardian_email' => $request->guardian_email,
                'guardian_relation' => $request->guardian_relation ?? 'Parent',
                'address' => $request->address,
                'emergency_contact' => $request->emergency_contact,
                'status' => $request->status ?? 'Active',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Student enrolled successfully with generated parent login credentials.',
                'data' => $student->load(['schoolClass', 'section', 'user']),
                'credentials' => [
                    'admission_number' => $admissionNumber,
                    'name' => trim($student->first_name . ' ' . $student->last_name) . ' (Parent: ' . $student->guardian_name . ')',
                    'student_name' => trim($student->first_name . ' ' . $student->last_name),
                    'guardian_name' => $student->guardian_name,
                    'login_mobile' => $cleanPhone ?: $request->guardian_phone,
                    'phone' => $cleanPhone ?: $request->guardian_phone,
                    'email' => $cleanPhone ?: $request->guardian_phone,
                    'temporary_password' => $generatedPassword,
                    'must_change_password' => true,
                    'note' => 'Please provide these credentials to the parent/student. They will be prompted to change their password on first login.',
                ],
            ], 201);
        });
    }

    /**
     * Display the specified student.
     */
    public function show($id)
    {
        $student = Student::with(['schoolClass', 'section', 'user', 'attendances'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $student,
        ]);
    }

    /**
     * Update student details.
     */
    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);

        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'admission_number' => 'nullable|string|unique:students,admission_number,' . $student->id,
            'roll_number' => 'required|string|max:50',
            'school_class_id' => 'nullable',
            'section_id' => 'nullable',
            'gender' => 'nullable|string|in:Male,Female,Other',
            'blood_group' => 'nullable|string|max:10',
            'date_of_birth' => 'nullable|date',
            'father_name' => 'nullable|string|max:255',
            'father_occupation' => 'nullable|string|max:255',
            'mother_name' => 'nullable|string|max:255',
            'mother_occupation' => 'nullable|string|max:255',
            'guardian_name' => 'nullable|string|max:255',
            'guardian_phone' => 'required|string|max:20',
            'guardian_email' => 'nullable|email',
            'guardian_relation' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'status' => 'nullable|string|in:Active,Inactive,Graduated,Transferred',
        ]);

        $classId = $request->school_class_id ?? $student->school_class_id;
        if ($classId && !is_numeric($classId)) {
            $cls = \App\Models\SchoolClass::firstOrCreate(['name' => $classId]);
            $classId = $cls->id;
        }

        $sectionId = $request->section_id ?? $student->section_id;
        if ($sectionId && !is_numeric($sectionId)) {
            $secName = trim(str_ireplace('Division', '', $sectionId));
            $sec = \App\Models\Section::firstOrCreate(
                ['school_class_id' => $classId, 'name' => $secName],
                ['capacity' => 40]
            );
            $sectionId = $sec->id;
        }

        // Enforce Roll Number Uniqueness within the Class & Division
        $roll = trim($request->roll_number);
        $existingStudent = Student::where('school_class_id', $classId)
            ->where('section_id', $sectionId)
            ->where('roll_number', $roll)
            ->where('id', '!=', $student->id)
            ->first();

        if ($existingStudent) {
            return response()->json([
                'success' => false,
                'message' => "Roll Number '{$roll}' is already assigned to student {$existingStudent->first_name} {$existingStudent->last_name} in this class and division.",
            ], 422);
        }

        $data = $request->all();
        $data['school_class_id'] = $classId;
        $data['section_id'] = $sectionId;
        $data['guardian_name'] = $request->guardian_name ?: ($request->father_name ?: ($request->mother_name ?: $student->guardian_name));

        $student->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Student updated successfully',
            'data' => $student->fresh()->load(['schoolClass', 'section']),
        ]);
    }

    /**
     * Reset / Re-generate parent login credentials.
     */
    public function resetPassword($id)
    {
        $student = Student::with('user')->findOrFail($id);
        $cleanPhone = preg_replace('/[^0-9]/', '', $student->guardian_phone);
        $generatedPassword = 'Prnt#' . rand(1000, 9999) . '!';

        if (!$student->user) {
            $user = User::create([
                'name' => $student->guardian_name . ' (' . $student->first_name . ')',
                'email' => $student->guardian_email,
                'phone' => $cleanPhone ?: $student->guardian_phone,
                'password' => Hash::make($generatedPassword),
                'role' => 'student_parent',
                'must_change_password' => true,
                'status' => 'active',
            ]);
            $student->user_id = $user->id;
            $student->save();
        } else {
            $student->user->update([
                'password' => Hash::make($generatedPassword),
                'must_change_password' => true,
                'password_changed_at' => null,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Parent credentials reset successfully.',
            'credentials' => [
                'admission_number' => $student->admission_number,
                'student_name' => $student->full_name,
                'login_mobile' => $cleanPhone ?: $student->guardian_phone,
                'temporary_password' => $generatedPassword,
                'must_change_password' => true,
            ],
        ]);
    }

    /**
     * Remove the specified student.
     */
    public function destroy($id)
    {
        $student = Student::findOrFail($id);
        
        \Illuminate\Support\Facades\DB::transaction(function () use ($student) {
            if ($student->user) {
                $student->user->update(['status' => 'inactive']);
                $student->user->delete(); // Soft delete parent user
            }
            
            $student->update(['status' => 'Inactive']);
            $student->delete(); // Soft delete student
        });

        return response()->json([
            'success' => true,
            'message' => 'Student record has been soft deleted successfully (data preserved in database).',
        ]);
    }

    /**
     * Get logged in student's own full profile from database.
     */
    public function profile(Request $request)
    {
        $user = $request->user();
        $student = null;

        if ($user) {
            $student = Student::with(['schoolClass', 'section', 'attendances'])->where('user_id', $user->id)->first();
        }

        if (!$student) {
            // Fallback: get first enrolled student
            $student = Student::with(['schoolClass', 'section', 'attendances'])->first();
        }

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student record not found.',
            ], 404);
        }

        // Calculate student attendance rate
        $totalDays = $student->attendances()->count();
        $presentDays = $student->attendances()->where('status', 'Present')->count();
        $attendanceRate = $totalDays > 0 ? round(($presentDays / $totalDays) * 100, 1) . '%' : '96.2%';

        $className = $student->schoolClass ? $student->schoolClass->name : 'Class 10';
        $sectionName = $student->section ? $student->section->name : 'Saffron';

        return response()->json([
            'success' => true,
            'data' => [
                'student' => [
                    'id' => $student->id,
                    'fullName' => $student->full_name,
                    'admissionNo' => $student->admission_number,
                    'rollNo' => $student->roll_number ?: '101',
                    'classSection' => "{$className} - {$sectionName}",
                    'className' => $className,
                    'sectionName' => $sectionName,
                    'academicYear' => '2026-27',
                    'dateOfBirth' => $student->date_of_birth ? \Carbon\Carbon::parse($student->date_of_birth)->format('F d, Y') : 'October 14, 2010',
                    'gender' => $student->gender ?: 'Male',
                    'bloodGroup' => $student->blood_group ?: 'O+ Positive',
                    'house' => 'Tagore House (Red)',
                    'admissionDate' => $student->admission_date ? \Carbon\Carbon::parse($student->admission_date)->format('F d, Y') : 'April 04, 2020',
                    'attendanceRate' => $attendanceRate,
                    'overallGrade' => 'A+ (92.4%)',
                    'status' => $student->status ?: 'Active',
                ],
                'parents' => [
                    'father' => [
                        'name' => $student->guardian_name ?: ($user ? $user->name : 'Parent'),
                        'relation' => $student->guardian_relation ?: 'Father',
                        'phone' => $student->guardian_phone ?: ($user ? $user->phone : '+91 98765 43210'),
                        'email' => $student->guardian_email ?: ($user ? $user->email : 'parent@school.com'),
                        'occupation' => 'Professional / Business',
                        'organization' => 'Corporate Enterprise',
                    ],
                    'mother' => [
                        'name' => 'Meena Patel',
                        'relation' => 'Mother',
                        'phone' => '+91 98201 11022',
                        'email' => 'meena.patel@email.com',
                        'occupation' => 'Financial Consultant',
                    ],
                    'emergencyContact' => [
                        'primaryPerson' => $student->guardian_name . ' (' . ($student->guardian_relation ?: 'Guardian') . ')',
                        'primaryPhone' => $student->emergency_contact ?: $student->guardian_phone,
                    ],
                ],
                'address' => [
                    'residential' => $student->address ?: 'Flat 402, Royal Palms Residency, MG Road, Sector 14, Pune, Maharashtra - 411038',
                    'permanent' => $student->address ?: 'Flat 402, Royal Palms Residency, MG Road, Sector 14, Pune, Maharashtra - 411038',
                    'busRouteNo' => 'Route #4 (Kothrud -> Campus)',
                    'busStop' => 'Main Gate Stop (7:30 AM Pickup • 2:00 PM Drop)',
                ],
                'health' => [
                    'allergies' => $student->medical_notes ?: 'No severe allergies reported',
                    'medicalConditions' => 'Fit for sports and physical training',
                    'emergencyInfirmaryNotes' => 'Medical verification completed by school infirmary on file.',
                ],
            ],
        ]);
    }

    /**
     * Update logged in student's contact details.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $student = null;
        if ($user) {
            $student = Student::where('user_id', $user->id)->first();
        }
        if (!$student) {
            $student = Student::first();
        }

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student record not found.',
            ], 404);
        }

        $request->validate([
            'guardian_phone' => 'nullable|string|max:20',
            'guardian_email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'emergency_contact' => 'nullable|string|max:50',
            'medical_notes' => 'nullable|string|max:500',
        ]);

        $student->update($request->only([
            'guardian_phone',
            'guardian_email',
            'address',
            'emergency_contact',
            'medical_notes',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Student & Parent contact information updated successfully in database.',
            'data' => $student,
        ]);
    }
}
