<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\ClassSubject;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentSubjectEnrollment;
use App\Models\Subject;
use App\Models\Teacher;
use App\Services\SchoolContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClassSubjectController extends Controller
{
    /**
     * Get class subjects roster, enrolled students, and classes catalog.
     */
    public function index(Request $request)
    {
        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()?->school_id;

        // Auto-seed initial class subjects if empty
        $this->ensureInitialClassSubjects($schoolId);

        // Fetch all classes
        $classesQuery = SchoolClass::query();
        if ($schoolId) {
            $classesQuery->where('school_id', $schoolId);
        }
        $classes = $classesQuery->orderBy('id', 'asc')->get();

        // Selected class: requested class_id or first class with students, or first class
        $selectedClassId = $request->query('class_id');
        if (!$selectedClassId) {
            $classWithStudents = Student::whereNotNull('school_class_id')->value('school_class_id');
            $selectedClassId = $classWithStudents ?: ($classes->first()?->id ?? 1);
        } else {
            $selectedClassId = (int) $selectedClassId;
        }

        $currentClass = $classes->firstWhere('id', $selectedClassId) ?: SchoolClass::find($selectedClassId);

        // Fetch all class subjects with subject and teacher, grouped by school_class_id
        $allClassSubjectsGrouped = ClassSubject::with(['subject', 'teacher'])
            ->get()
            ->groupBy('school_class_id');

        // Compute stats for all classes with their individual subjects
        $classesStats = $classes->map(function ($cls) use ($allClassSubjectsGrouped) {
            $clsSubjects = $allClassSubjectsGrouped->get($cls->id, collect())->map(function ($cs) {
                return [
                    'id' => $cs->id,
                    'school_class_id' => $cs->school_class_id,
                    'subject_id' => $cs->subject_id,
                    'subject_name' => $cs->subject?->name ?? 'General Subject',
                    'subject_code' => $cs->subject?->code ?? ('SUB-' . $cs->subject_id),
                    'subject_type' => $cs->subject?->type ?? 'theory',
                    'periods_per_week' => $cs->periods_per_week,
                    'max_marks' => (float) $cs->max_marks,
                    'passing_marks' => (float) $cs->passing_marks,
                    'is_elective' => (bool) $cs->is_elective,
                    'teacher_id' => $cs->teacher_id,
                    'teacher_name' => $cs->teacher ? trim("{$cs->teacher->first_name} {$cs->teacher->last_name}") : null,
                    'teacher_department' => $cs->teacher?->department,
                    'created_at' => $cs->created_at?->toIso8601String(),
                ];
            })->values();

            $studCount = Student::where('school_class_id', $cls->id)->count();

            return [
                'id' => $cls->id,
                'name' => $cls->name,
                'code' => $cls->code,
                'subjects_count' => $clsSubjects->count(),
                'students_count' => $studCount,
                'total_periods_week' => $clsSubjects->sum('periods_per_week'),
                'subjects' => $clsSubjects,
            ];
        });

        // Subjects for the current selected class
        $classSubjects = ClassSubject::with(['subject', 'teacher'])
            ->where('school_class_id', $selectedClassId)
            ->get()
            ->map(function ($cs) {
                return [
                    'id' => $cs->id,
                    'school_class_id' => $cs->school_class_id,
                    'subject_id' => $cs->subject_id,
                    'subject_name' => $cs->subject?->name ?? 'General Subject',
                    'subject_code' => $cs->subject?->code ?? ('SUB-' . $cs->subject_id),
                    'subject_type' => $cs->subject?->type ?? 'theory',
                    'periods_per_week' => $cs->periods_per_week,
                    'max_marks' => (float) $cs->max_marks,
                    'passing_marks' => (float) $cs->passing_marks,
                    'is_elective' => (bool) $cs->is_elective,
                    'teacher_id' => $cs->teacher_id,
                    'teacher_name' => $cs->teacher ? trim("{$cs->teacher->first_name} {$cs->teacher->last_name}") : null,
                    'teacher_department' => $cs->teacher?->department,
                    'created_at' => $cs->created_at?->toIso8601String(),
                ];
            });

        // Students enrolled in this class who inherit/reflect these subjects
        $enrolledStudents = Student::with(['section'])
            ->where('school_class_id', $selectedClassId)
            ->orderBy('roll_number', 'asc')
            ->get()
            ->map(function ($s) use ($classSubjects) {
                return [
                    'id' => $s->id,
                    'roll_number' => $s->roll_number,
                    'admission_number' => $s->admission_number,
                    'first_name' => $s->first_name,
                    'last_name' => $s->last_name,
                    'full_name' => $s->full_name,
                    'section_name' => $s->section?->name ?? 'General',
                    'gender' => $s->gender,
                    'reflected_subjects_count' => $classSubjects->count(),
                    'subjects_preview' => $classSubjects->pluck('subject_name')->take(4)->values(),
                ];
            });

        // Master subjects catalog for dropdown/selection
        $catalogSubjects = Subject::orderBy('name', 'asc')->get()->map(function ($s) {
            return [
                'id' => $s->id,
                'name' => $s->name,
                'code' => $s->code,
                'type' => $s->type,
            ];
        });

        // Master teachers list for allocation
        $teachers = Teacher::select('id', 'first_name', 'last_name', 'department', 'email')
            ->where('status', 'Active')
            ->orderBy('first_name', 'asc')
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'name' => trim("{$t->first_name} {$t->last_name}"),
                    'department' => $t->department,
                    'email' => $t->email,
                ];
            });

        // KPI Summary stats
        $totalClassesCount = $classes->count();
        $configuredClassesCount = ClassSubject::distinct('school_class_id')->count('school_class_id');
        $totalPeriodsWeek = $classSubjects->sum('periods_per_week');

        return response()->json([
            'success' => true,
            'data' => [
                'current_class' => [
                    'id' => $currentClass?->id ?? $selectedClassId,
                    'name' => $currentClass?->name ?? "Class {$selectedClassId}",
                    'code' => $currentClass?->code,
                ],
                'summary' => [
                    'total_classes' => $totalClassesCount,
                    'configured_classes' => $configuredClassesCount,
                    'class_subjects_count' => $classSubjects->count(),
                    'enrolled_students_count' => $enrolledStudents->count(),
                    'total_periods_week' => $totalPeriodsWeek,
                ],
                'classes' => $classesStats,
                'class_subjects' => $classSubjects,
                'reflected_students' => $enrolledStudents,
                'catalog_subjects' => $catalogSubjects,
                'teachers' => $teachers,
            ],
        ]);
    }

    /**
     * Add or assign a subject to a particular class.
     */
    public function store(Request $request)
    {
        $request->validate([
            'school_class_id' => 'required|exists:school_classes,id',
            'subject_id' => 'nullable|exists:subjects,id',
            'name' => 'required_without:subject_id|nullable|string|max:100',
            'code' => 'nullable|string|max:30',
            'type' => 'nullable|string|in:theory,practical,elective',
            'teacher_id' => 'nullable|exists:teachers,id',
            'periods_per_week' => 'nullable|integer|min:1|max:25',
            'max_marks' => 'nullable|numeric|min:10|max:500',
            'passing_marks' => 'nullable|numeric|min:0|max:500',
            'is_elective' => 'nullable|boolean',
            'sync_students' => 'nullable|boolean',
        ]);

        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()?->school_id;

        // Resolve or create Subject
        $subjectId = $request->subject_id;
        if (!$subjectId && $request->filled('name')) {
            $subj = Subject::firstOrCreate(
                ['name' => trim($request->name)],
                [
                    'school_id' => $schoolId,
                    'code' => $request->code ?: ('SUB-' . rand(100, 999)),
                    'type' => $request->type ?: 'theory',
                ]
            );
            $subjectId = $subj->id;
        }

        // Create or update ClassSubject
        $classSubject = ClassSubject::updateOrCreate(
            [
                'school_class_id' => $request->school_class_id,
                'subject_id' => $subjectId,
            ],
            [
                'school_id' => $schoolId,
                'teacher_id' => $request->teacher_id,
                'periods_per_week' => $request->periods_per_week ?: 5,
                'max_marks' => $request->max_marks ?: 100,
                'passing_marks' => $request->passing_marks ?: 35,
                'is_elective' => (bool) $request->is_elective,
            ]
        );

        // Optionally sync to student enrollments
        if ($request->boolean('sync_students', true)) {
            $this->syncClassSubjectsForStudents($request->school_class_id, $schoolId);
        }

        return response()->json([
            'success' => true,
            'message' => 'Subject assigned to class successfully and reflected to enrolled students.',
            'data' => $classSubject->load(['subject', 'teacher']),
        ], 201);
    }

    /**
     * Update class subject configuration.
     */
    public function update(Request $request, $id)
    {
        $classSubject = ClassSubject::findOrFail($id);

        $request->validate([
            'teacher_id' => 'nullable|exists:teachers,id',
            'periods_per_week' => 'nullable|integer|min:1|max:25',
            'max_marks' => 'nullable|numeric|min:10|max:500',
            'passing_marks' => 'nullable|numeric|min:0|max:500',
            'is_elective' => 'nullable|boolean',
        ]);

        $classSubject->update([
            'teacher_id' => $request->has('teacher_id') ? $request->teacher_id : $classSubject->teacher_id,
            'periods_per_week' => $request->filled('periods_per_week') ? $request->periods_per_week : $classSubject->periods_per_week,
            'max_marks' => $request->filled('max_marks') ? $request->max_marks : $classSubject->max_marks,
            'passing_marks' => $request->filled('passing_marks') ? $request->passing_marks : $classSubject->passing_marks,
            'is_elective' => $request->has('is_elective') ? (bool) $request->is_elective : $classSubject->is_elective,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Class subject configuration updated successfully.',
            'data' => $classSubject->load(['subject', 'teacher']),
        ]);
    }

    /**
     * Remove subject from a class.
     */
    public function destroy($id)
    {
        $classSubject = ClassSubject::findOrFail($id);
        $classId = $classSubject->school_class_id;
        $subjectId = $classSubject->subject_id;

        $classSubject->delete();

        // Also clean up student enrollments for optional/elective bindings
        StudentSubjectEnrollment::where('subject_id', $subjectId)
            ->whereHas('student', function ($q) use ($classId) {
                $q->where('school_class_id', $classId);
            })
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Subject removed from class successfully.',
        ]);
    }

    /**
     * Synchronize all subjects of a class to all students enrolled in that class.
     */
    public function syncStudents(Request $request, $classId)
    {
        $schoolId = SchoolContext::getActiveSchoolId() ?: $request->user()?->school_id;
        $count = $this->syncClassSubjectsForStudents($classId, $schoolId);

        return response()->json([
            'success' => true,
            'message' => "Successfully synchronized subjects across {$count} enrolled students of this class.",
            'data' => [
                'students_synced' => $count,
            ],
        ]);
    }

    /**
     * Get reflected subjects for the currently authenticated student.
     */
    public function mySubjects(Request $request)
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)
            ->orWhere('guardian_email', $user->email)
            ->first();

        if (!$student || !$student->school_class_id) {
            return response()->json([
                'success' => true,
                'data' => [
                    'class_name' => 'Unassigned',
                    'subjects' => [],
                ],
            ]);
        }

        $classSubjects = ClassSubject::with(['subject', 'teacher'])
            ->where('school_class_id', $student->school_class_id)
            ->get()
            ->map(function ($cs) {
                return [
                    'id' => $cs->id,
                    'subject_id' => $cs->subject_id,
                    'name' => $cs->subject?->name ?? 'General Subject',
                    'code' => $cs->subject?->code,
                    'type' => $cs->subject?->type ?? 'theory',
                    'periods_per_week' => $cs->periods_per_week,
                    'max_marks' => (float) $cs->max_marks,
                    'passing_marks' => (float) $cs->passing_marks,
                    'is_elective' => (bool) $cs->is_elective,
                    'teacher_name' => $cs->teacher ? trim("{$cs->teacher->first_name} {$cs->teacher->last_name}") : 'Senior Faculty',
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'class_name' => $student->schoolClass?->name ?? "Class {$student->school_class_id}",
                'division' => $student->section?->name ?? 'A',
                'subjects' => $classSubjects,
            ],
        ]);
    }

    /**
     * Helper to sync class subjects into student_subject_enrollments table.
     */
    protected function syncClassSubjectsForStudents(int $classId, ?int $schoolId = null): int
    {
        $students = Student::where('school_class_id', $classId)->get();
        if ($students->isEmpty()) {
            return 0;
        }

        $classSubjects = ClassSubject::where('school_class_id', $classId)->get();
        if ($classSubjects->isEmpty()) {
            return 0;
        }

        $academicYearId = AcademicYear::where('is_current', true)->value('id')
            ?: (AcademicYear::first()?->id ?? 1);

        foreach ($students as $student) {
            foreach ($classSubjects as $cs) {
                StudentSubjectEnrollment::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'subject_id' => $cs->subject_id,
                        'academic_year_id' => $academicYearId,
                    ],
                    [
                        'school_id' => $schoolId ?: $student->school_id ?: 1,
                        'is_optional' => $cs->is_elective,
                    ]
                );
            }
        }

        return $students->count();
    }

    /**
     * Seed initial standard subjects for Class 10 and Class 9 if empty.
     */
    protected function ensureInitialClassSubjects(?int $schoolId = null): void
    {
        $teacher1 = Teacher::where('email', 'shruti@school.com')->first() ?: Teacher::first();

        // 1. Find Class 10 (id: 1) or by name
        $class10 = SchoolClass::where('name', 'like', '%Class 10%')->orWhere('name', 'like', '%10%')->first();
        if ($class10 && ClassSubject::where('school_class_id', $class10->id)->count() === 0) {
            $standardSubjects = [
                ['name' => 'Mathematics', 'code' => 'MATH-041', 'type' => 'theory', 'periods' => 6, 'max' => 100, 'pass' => 35, 'teacher_id' => $teacher1?->id],
                ['name' => 'Science', 'code' => 'SCI-086', 'type' => 'practical', 'periods' => 6, 'max' => 100, 'pass' => 35, 'teacher_id' => null],
                ['name' => 'English Core', 'code' => 'ENG-184', 'type' => 'theory', 'periods' => 5, 'max' => 100, 'pass' => 35, 'teacher_id' => null],
                ['name' => 'Social Science', 'code' => 'SST-087', 'type' => 'theory', 'periods' => 5, 'max' => 100, 'pass' => 35, 'teacher_id' => null],
                ['name' => 'Computer Applications', 'code' => 'CA-165', 'type' => 'practical', 'periods' => 4, 'max' => 100, 'pass' => 35, 'teacher_id' => null],
                ['name' => 'Hindi', 'code' => 'HIN-002', 'type' => 'theory', 'periods' => 4, 'max' => 100, 'pass' => 35, 'teacher_id' => null],
            ];

            foreach ($standardSubjects as $spec) {
                $subj = Subject::firstOrCreate(
                    ['name' => $spec['name']],
                    [
                        'school_id' => $schoolId,
                        'code' => $spec['code'],
                        'type' => $spec['type'],
                    ]
                );

                ClassSubject::firstOrCreate(
                    [
                        'school_class_id' => $class10->id,
                        'subject_id' => $subj->id,
                    ],
                    [
                        'school_id' => $schoolId,
                        'teacher_id' => $spec['teacher_id'],
                        'periods_per_week' => $spec['periods'],
                        'max_marks' => $spec['max'],
                        'passing_marks' => $spec['pass'],
                        'is_elective' => false,
                    ]
                );
            }

            $this->syncClassSubjectsForStudents($class10->id, $schoolId);
        }

        // 2. Find Class 9 (id: 2) or by name
        $class9 = SchoolClass::where('name', 'like', '%Class 9%')->orWhere('name', 'like', '%9%')->first();
        if ($class9 && ClassSubject::where('school_class_id', $class9->id)->count() === 0) {
            $class9Subjects = [
                ['name' => 'Mathematics', 'code' => 'MATH-041', 'type' => 'theory', 'periods' => 6, 'max' => 100, 'pass' => 35, 'teacher_id' => $teacher1?->id],
                ['name' => 'Science', 'code' => 'SCI-086', 'type' => 'practical', 'periods' => 6, 'max' => 100, 'pass' => 35, 'teacher_id' => null],
                ['name' => 'English Core', 'code' => 'ENG-184', 'type' => 'theory', 'periods' => 5, 'max' => 100, 'pass' => 35, 'teacher_id' => null],
                ['name' => 'Social Science', 'code' => 'SST-087', 'type' => 'theory', 'periods' => 5, 'max' => 100, 'pass' => 35, 'teacher_id' => null],
                ['name' => 'Hindi', 'code' => 'HIN-002', 'type' => 'theory', 'periods' => 4, 'max' => 100, 'pass' => 35, 'teacher_id' => null],
            ];

            foreach ($class9Subjects as $spec) {
                $subj = Subject::firstOrCreate(
                    ['name' => $spec['name']],
                    [
                        'school_id' => $schoolId,
                        'code' => $spec['code'],
                        'type' => $spec['type'],
                    ]
                );

                ClassSubject::firstOrCreate(
                    [
                        'school_class_id' => $class9->id,
                        'subject_id' => $subj->id,
                    ],
                    [
                        'school_id' => $schoolId,
                        'teacher_id' => $spec['teacher_id'],
                        'periods_per_week' => $spec['periods'],
                        'max_marks' => $spec['max'],
                        'passing_marks' => $spec['pass'],
                        'is_elective' => false,
                    ]
                );
            }

            $this->syncClassSubjectsForStudents($class9->id, $schoolId);
        }
    }
}

