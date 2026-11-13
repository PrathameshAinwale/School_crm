<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\ClassTeacherAllocation;
use App\Models\Exam;
use App\Models\Examination;
use App\Models\ExamMark;
use App\Models\ExamScore;
use App\Models\ExamTerm;
use App\Models\ReportCard;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentReportSummary;
use App\Models\StudentSubjectEnrollment;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeacherSubjectAssignment;
use App\Services\AcademicYearContext;
use App\Services\Exams\ExamRankingService;
use App\Services\SchoolContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScoresheetController extends Controller
{
    /**
     * Get initial dropdowns and student list for student-wise marks entry.
     */
    public function studentEntryData(Request $request)
    {
        $user = $request->user();
        $schoolId = SchoolContext::getActiveSchoolId() ?: ($user->school_id ?? 1);
        $academicYearId = AcademicYearContext::getActiveAcademicYearId($schoolId) ?: 1;

        // Auto-sync examinations from exam_terms if empty
        if (Examination::where('school_id', $schoolId)->count() === 0) {
            $existingTerms = ExamTerm::where('school_id', $schoolId)->get();
            if ($existingTerms->isEmpty()) {
                $existingTerms = ExamTerm::all();
            }
            foreach ($existingTerms as $t) {
                Examination::firstOrCreate(
                    ['school_id' => $schoolId, 'name' => $t->name],
                    [
                        'academic_year' => '2026-2027',
                        'code' => $t->code ?: 'TERM-' . $t->id,
                        'term' => 'Term ' . $t->id,
                        'max_marks_default' => 100,
                        'passing_marks_default' => 33,
                        'status' => 'Completed',
                        'description' => $t->description,
                    ]
                );
            }
        }

        // Available terms
        $terms = ExamTerm::where('school_id', $schoolId)->orderBy('id', 'asc')->get();
        if ($terms->isEmpty()) {
            $terms = ExamTerm::all();
        }

        // Available classes
        $classes = SchoolClass::with('sections')
            ->where(function ($q) use ($schoolId) {
                $q->where('school_id', $schoolId)->orWhereNull('school_id');
            })
            ->orderBy('id', 'asc')
            ->get();

        $selectedClassId = $request->input('class_id') ?: ($classes->first()->id ?? 1);
        $selectedTermId = $request->input('exam_term_id') ?: ($terms->first()->id ?? 1);
        $selectedSectionId = $request->input('section_id');

        // Fetch subjects for this class and term
        $subjectsMap = collect();

        // 1. Check ClassSubject assignments
        $classSubjects = \App\Models\ClassSubject::where('school_class_id', $selectedClassId)
            ->with('subject')
            ->get();

        foreach ($classSubjects as $cs) {
            if ($cs->subject && !$subjectsMap->has($cs->subject_id)) {
                $subjectsMap->put($cs->subject_id, [
                    'subject_id' => $cs->subject_id,
                    'exam_id' => null,
                    'subject_name' => $cs->subject->name,
                    'subject_code' => $cs->subject->code ?: ('SUB-' . $cs->subject_id),
                    'max_marks' => (float)($cs->max_marks ?: 100),
                    'pass_marks' => (float)($cs->passing_marks ?: 33),
                ]);
            }
        }

        // 2. Check Exam papers
        $exams = Exam::where('exam_term_id', $selectedTermId)
            ->where('school_class_id', $selectedClassId)
            ->with('subject')
            ->get();

        foreach ($exams as $ex) {
            if ($ex->subject) {
                if (!$subjectsMap->has($ex->subject_id)) {
                    $subjectsMap->put($ex->subject_id, [
                        'subject_id' => $ex->subject_id,
                        'exam_id' => $ex->id,
                        'subject_name' => $ex->subject->name,
                        'subject_code' => $ex->subject->code ?: ('SUB-' . $ex->subject_id),
                        'max_marks' => (float) $ex->max_marks,
                        'pass_marks' => (float) $ex->pass_marks,
                    ]);
                } else {
                    $item = $subjectsMap->get($ex->subject_id);
                    $item['exam_id'] = $ex->id;
                    $subjectsMap->put($ex->subject_id, $item);
                }
            }
        }

        // 3. If no exams/class-subjects yet configured for this class, fallback to standard curriculum subjects
        if ($subjectsMap->isEmpty()) {
            $standardSubjects = Subject::where('status', 'active')->get();
            if ($standardSubjects->isEmpty()) {
                $standardSubjects = Subject::all();
            }
            if ($standardSubjects->isEmpty()) {
                $standardSubjects = collect([
                    (object)['id' => 1, 'name' => 'Mathematics', 'code' => 'MATH-041'],
                    (object)['id' => 2, 'name' => 'Science', 'code' => 'SCI-086'],
                    (object)['id' => 3, 'name' => 'English Core', 'code' => 'ENG-184'],
                    (object)['id' => 4, 'name' => 'Social Science', 'code' => 'SST-087'],
                    (object)['id' => 5, 'name' => 'Computer Applications', 'code' => 'CA-165'],
                    (object)['id' => 6, 'name' => 'Hindi', 'code' => 'HIN-002'],
                ]);
            }

            foreach ($standardSubjects as $s) {
                if (!$subjectsMap->has($s->id)) {
                    $subjectsMap->put($s->id, [
                        'subject_id' => $s->id,
                        'exam_id' => null,
                        'subject_name' => $s->name,
                        'subject_code' => $s->code ?? ('SUB-' . $s->id),
                        'max_marks' => 100,
                        'pass_marks' => 33,
                    ]);
                }
            }
        }

        // Fetch students in this class
        $studentsQuery = Student::where('status', 'Active')
            ->where('school_class_id', $selectedClassId);

        if (!empty($selectedSectionId) && $selectedSectionId !== 'all') {
            $studentsQuery->where('section_id', $selectedSectionId);
        }

        $rawStudents = $studentsQuery->with('section')->orderBy('roll_number', 'asc')->get();
        $studentIds = $rawStudents->pluck('id');

        $selectedTerm = $terms->firstWhere('id', $selectedTermId);
        $examination = Examination::where(function ($q) use ($schoolId) {
            $q->where('school_id', $schoolId)->orWhereNull('school_id');
        })->where(function ($q) use ($selectedTerm) {
            if ($selectedTerm) {
                $q->where('name', $selectedTerm->name)
                  ->orWhere('term', 'Term ' . $selectedTerm->id)
                  ->orWhere('code', $selectedTerm->code);
            }
        })->first();

        $examMarksByStudent = $examination
            ? ExamMark::where('examination_id', $examination->id)
                ->whereIn('student_id', $studentIds)
                ->whereNotNull('marks_obtained')
                ->get()
                ->groupBy('student_id')
            : collect();

        $summaries = StudentReportSummary::where('exam_term_id', $selectedTermId)
            ->whereIn('student_id', $studentIds)
            ->get()
            ->keyBy('student_id');

        $examIds = $exams->unique('subject_id')->pluck('id');
        $scoresByStudent = $examIds->isNotEmpty()
            ? ExamScore::whereIn('exam_id', $examIds)
                ->whereIn('student_id', $studentIds)
                ->with(['exam.subject'])
                ->get()
                ->groupBy('student_id')
            : collect();

        $students = $rawStudents->map(function ($s) use ($summaries, $scoresByStudent, $examMarksByStudent, $subjectsMap) {
            $summary = $summaries->get($s->id);
            $scores = $scoresByStudent->get($s->id, collect());
            $evalScores = $scores->whereNotNull('marks_obtained');
            $evalCount = $evalScores->count();
            $eMarks = $examMarksByStudent->get($s->id, collect());
            $hasMarks = $evalCount > 0 || $eMarks->isNotEmpty() || ($summary && (float)$summary->total_obtained_marks > 0);

            $subjectScores = $scores->map(function ($sc) {
                return [
                    'subject_id' => $sc->exam->subject_id ?? null,
                    'subject_name' => $sc->exam->subject->name ?? 'Subject',
                    'marks_obtained' => $sc->marks_obtained !== null ? (float) $sc->marks_obtained : null,
                    'max_marks' => (float) ($sc->exam->max_marks ?? 100),
                    'grade' => $sc->grade,
                    'special_status' => $sc->special_status,
                ];
            })->values();

            $totalObt = $evalCount > 0
                ? (float) $evalScores->sum('marks_obtained')
                : ($eMarks->isNotEmpty()
                    ? (float) $eMarks->sum('marks_obtained')
                    : ($summary ? (float) $summary->total_obtained_marks : null));

            $totalMax = $evalCount > 0
                ? (float) $evalScores->sum(fn($sc) => (float)($sc->exam->max_marks ?? 100))
                : ($eMarks->isNotEmpty()
                    ? (float) $eMarks->sum(fn($em) => (float)($em->max_marks ?: 100))
                    : ($summary ? (float) $summary->total_max_marks : (count($subjectsMap) * 100)));

            $pct = $totalMax > 0 && $totalObt !== null ? round(($totalObt / $totalMax) * 100, 2) : ($summary ? (float) $summary->percentage : null);

            return [
                'id' => $s->id,
                'name' => trim($s->first_name . ' ' . ($s->last_name ?? '')),
                'roll_number' => $s->roll_number,
                'admission_number' => $s->admission_number,
                'school_class_id' => $s->school_class_id,
                'section_id' => $s->section_id,
                'section_name' => $s->section->name ?? '',
                'has_marks' => $hasMarks,
                'total_obtained' => $totalObt,
                'total_max' => $totalMax,
                'percentage' => $pct,
                'overall_grade' => $summary ? $summary->overall_grade : ($pct !== null ? ExamMark::calculateGrade($totalObt, $totalMax) : null),
                'result_status' => $summary ? $summary->result_status : ($hasMarks ? 'EVALUATED' : 'PENDING'),
                'class_rank' => $summary ? $summary->class_rank : null,
                'subjects_count' => count($subjectsMap),
                'subjects_evaluated' => $evalCount,
                'subject_scores' => $subjectScores,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'terms' => $terms,
                'classes' => $classes,
                'selected_term_id' => $selectedTermId,
                'selected_class_id' => $selectedClassId,
                'students' => $students,
                'subjects' => $subjectsMap->values(),
            ],
        ]);
    }

    /**
     * Get subject-wise marks and overall status for a single student in a specific exam term.
     * Ensures all curriculum subjects for the student's class are loaded and any previously entered marks are returned.
     */
    public function getStudentMarks(Request $request, $termId, $studentId)
    {
        $schoolId = SchoolContext::getActiveSchoolId() ?: ($request->user()->school_id ?? 1);
        $student = Student::with(['schoolClass', 'section'])->findOrFail($studentId);
        $term = ExamTerm::findOrFail($termId);

        // 1. Resolve all curriculum subjects for this student's class
        $subjectsMap = collect();

        // Check ClassSubject assignments first
        $classSubjects = \App\Models\ClassSubject::where('school_class_id', $student->school_class_id)
            ->with('subject')
            ->get();

        foreach ($classSubjects as $cs) {
            if ($cs->subject && !$subjectsMap->has($cs->subject_id)) {
                $subjectsMap->put($cs->subject_id, [
                    'subject_id' => $cs->subject_id,
                    'subject_name' => $cs->subject->name,
                    'subject_code' => $cs->subject->code ?: ('SUB-' . $cs->subject_id),
                    'max_marks' => (float)($cs->max_marks ?: 100),
                    'pass_marks' => (float)($cs->passing_marks ?: 33),
                    'exam_id' => null,
                ]);
            }
        }

        // Check Exam papers configured for this class and term
        $examsQuery = Exam::where('exam_term_id', $term->id)
            ->where('school_class_id', $student->school_class_id);

        if ($student->section_id) {
            $examsQuery->where(function ($q) use ($student) {
                $q->where('section_id', $student->section_id)
                  ->orWhereNull('section_id');
            });
        }

        $exams = $examsQuery->with('subject')->get()->unique('subject_id')->values();

        foreach ($exams as $ex) {
            if ($ex->subject) {
                if (!$subjectsMap->has($ex->subject_id)) {
                    $subjectsMap->put($ex->subject_id, [
                        'subject_id' => $ex->subject_id,
                        'subject_name' => $ex->subject->name,
                        'subject_code' => $ex->subject->code ?: ('SUB-' . $ex->subject_id),
                        'max_marks' => (float) $ex->max_marks,
                        'pass_marks' => (float) $ex->pass_marks,
                        'exam_id' => $ex->id,
                    ]);
                } else {
                    $item = $subjectsMap->get($ex->subject_id);
                    $item['exam_id'] = $ex->id;
                    $subjectsMap->put($ex->subject_id, $item);
                }
            }
        }

        // Fallback to active standard subjects if still empty
        if ($subjectsMap->isEmpty()) {
            $standardSubjects = Subject::where('status', 'active')->get();
            if ($standardSubjects->isEmpty()) {
                $standardSubjects = Subject::all();
            }
            if ($standardSubjects->isEmpty()) {
                $standardSubjects = collect([
                    (object)['id' => 1, 'name' => 'Mathematics', 'code' => 'MATH-041'],
                    (object)['id' => 2, 'name' => 'Science', 'code' => 'SCI-086'],
                    (object)['id' => 3, 'name' => 'English Core', 'code' => 'ENG-184'],
                    (object)['id' => 4, 'name' => 'Social Science', 'code' => 'SST-087'],
                    (object)['id' => 5, 'name' => 'Computer Applications', 'code' => 'CA-165'],
                    (object)['id' => 6, 'name' => 'Hindi', 'code' => 'HIN-002'],
                ]);
            }

            foreach ($standardSubjects as $s) {
                if (!$subjectsMap->has($s->id)) {
                    $subjectsMap->put($s->id, [
                        'subject_id' => $s->id,
                        'subject_name' => $s->name,
                        'subject_code' => $s->code ?? ('SUB-' . $s->id),
                        'max_marks' => 100,
                        'pass_marks' => 33,
                        'exam_id' => null,
                    ]);
                }
            }
        }

        // 2. Fetch corresponding Examination
        $examination = Examination::where(function ($q) use ($schoolId) {
            $q->where('school_id', $schoolId)->orWhereNull('school_id');
        })->where(function ($q) use ($term) {
            $q->where('name', $term->name)
              ->orWhere('term', 'Term ' . $term->id)
              ->orWhere('code', $term->code);
        })->first();

        // 3. Fetch previous ExamMark records
        $examMarks = $examination ? ExamMark::where('examination_id', $examination->id)
            ->where('student_id', $student->id)
            ->get()
            ->keyBy('subject_id') : collect();

        // 4. Fetch previous ExamScore records
        $examScores = ExamScore::where('student_id', $student->id)
            ->whereHas('exam', function ($q) use ($term, $student) {
                $q->where('exam_term_id', $term->id)
                  ->where('school_class_id', $student->school_class_id);
            })
            ->with('exam')
            ->get()
            ->keyBy(fn($sc) => $sc->exam->subject_id ?? 0);

        $subjectsData = [];
        $totalMax = 0;
        $totalObtained = 0;

        foreach ($subjectsMap as $subId => $sMeta) {
            $em = $examMarks->get($subId);
            $sc = $examScores->get($subId);

            $maxM = $em ? (float)$em->max_marks : (float)($sMeta['max_marks'] ?? 100);
            $passM = $em ? (float)$em->passing_marks : (float)($sMeta['pass_marks'] ?? 33);

            $obt = null;
            if ($em && $em->marks_obtained !== null) {
                $obt = (float) $em->marks_obtained;
            } elseif ($sc && $sc->marks_obtained !== null) {
                $obt = (float) $sc->marks_obtained;
            }

            $th = $em && $em->theory_marks !== null
                ? (float)$em->theory_marks
                : ($obt !== null ? (float)round($obt * 0.8) : null);

            $pr = $em && $em->practical_marks !== null
                ? (float)$em->practical_marks
                : ($obt !== null ? (float)max(0, $obt - ($th ?: 0)) : null);

            $special = $sc ? $sc->special_status : null;
            $remark = $em ? $em->remarks : ($sc ? $sc->teacher_remarks : '');
            $grade = $em && $em->grade ? $em->grade : ($sc && $sc->grade ? $sc->grade : ($obt !== null ? ExamMark::calculateGrade($obt, $maxM) : null));
            $isPassed = $obt !== null ? ($obt >= $passM) : null;

            if ($obt !== null) {
                $totalMax += $maxM;
                $totalObtained += $obt;
            }

            $subjectsData[] = [
                'subject_id' => $subId,
                'subject_name' => $sMeta['subject_name'],
                'subject_code' => $sMeta['subject_code'],
                'exam_id' => $sMeta['exam_id'] ?? ($sc ? $sc->exam_id : null),
                'max_marks' => $maxM,
                'pass_marks' => $passM,
                'marks_obtained' => $obt,
                'theory_marks' => $th,
                'practical_marks' => $pr,
                'special_status' => $special,
                'teacher_remarks' => $remark,
                'grade' => $grade,
                'is_passed' => $isPassed,
            ];
        }

        // Summary & Remarks
        $reportSummary = StudentReportSummary::where('exam_term_id', $term->id)
            ->where('student_id', $student->id)
            ->first();

        $reportCard = $examination ? ReportCard::where('examination_id', $examination->id)
            ->where('student_id', $student->id)
            ->first() : null;

        $overallRemarks = $reportCard ? $reportCard->teacher_remarks : ($reportSummary ? $reportSummary->teacher_remarks : '');

        $pct = $totalMax > 0 ? round(($totalObtained / $totalMax) * 100, 2) : 0;
        $overallGrade = ExamMark::calculateGrade($totalObtained, $totalMax ?: 600);

        return response()->json([
            'success' => true,
            'student' => [
                'id' => $student->id,
                'name' => trim($student->first_name . ' ' . ($student->last_name ?? '')),
                'roll_number' => $student->roll_number,
                'admission_number' => $student->admission_number,
                'class_name' => $student->schoolClass->name ?? '',
                'section_name' => $student->section->name ?? '',
            ],
            'term' => [
                'id' => $term->id,
                'name' => $term->name,
            ],
            'marks' => $subjectsData,
            'summary' => [
                'total_max' => $totalMax,
                'total_obtained' => $totalObtained,
                'percentage' => $reportSummary ? (float)$reportSummary->percentage : $pct,
                'grade' => $reportSummary ? $reportSummary->overall_grade : $overallGrade,
                'class_rank' => $reportSummary ? $reportSummary->class_rank : null,
                'result_status' => $reportSummary ? $reportSummary->result_status : ($pct >= 33 ? 'PASSED' : 'FAILED'),
                'teacher_remarks' => $overallRemarks,
            ],
        ]);
    }

    /**
     * Save marks of a single student subject-by-subject.
     * Automatically synchronizes Class Result, Student Report Card, and Student Marksheet.
     */
    public function saveStudentMarks(Request $request)
    {
        $user = $request->user();
        $schoolId = SchoolContext::getActiveSchoolId() ?: ($user->school_id ?? 1);
        $academicYearId = AcademicYearContext::getActiveAcademicYearId($schoolId) ?: 1;

        $request->validate([
            'exam_term_id' => 'required|exists:exam_terms,id',
            'student_id' => 'required|exists:students,id',
            'marks' => 'required|array|min:1',
            'marks.*.subject_id' => 'required|exists:subjects,id',
            'marks.*.marks_obtained' => 'nullable|numeric|min:0',
            'marks.*.special_status' => 'nullable|in:AB,ML,EX',
            'marks.*.theory_marks' => 'nullable|numeric|min:0',
            'marks.*.practical_marks' => 'nullable|numeric|min:0',
            'marks.*.max_marks' => 'nullable|numeric|min:1',
            'marks.*.pass_marks' => 'nullable|numeric|min:0',
            'marks.*.teacher_remarks' => 'nullable|string|max:500',
            'overall_teacher_remarks' => 'nullable|string|max:1000',
        ]);

        return DB::transaction(function () use ($schoolId, $academicYearId, $user, $request) {
            $student = Student::with(['schoolClass', 'section'])->findOrFail($request->student_id);
            $term = ExamTerm::findOrFail($request->exam_term_id);
            $classId = $student->school_class_id;
            $sectionId = $student->section_id;

            // 1. Ensure corresponding Examination exists
            $examination = Examination::firstOrCreate(
                [
                    'school_id' => $schoolId,
                    'name' => $term->name,
                ],
                [
                    'academic_year' => '2026-2027',
                    'code' => $term->code ?: 'TERM-' . $term->id,
                    'term' => 'Term ' . $term->id,
                    'start_date' => $term->start_date ?: now()->toDateString(),
                    'end_date' => $term->end_date ?: now()->toDateString(),
                    'max_marks_default' => 100,
                    'passing_marks_default' => 33,
                    'status' => 'Completed',
                ]
            );

            $grandObtained = 0;
            $grandMax = 0;

            foreach ($request->marks as $m) {
                $subjectId = $m['subject_id'];
                $maxMarks = (float)($m['max_marks'] ?? 100);
                $passMarks = (float)($m['pass_marks'] ?? 33);
                $obtained = isset($m['marks_obtained']) && $m['marks_obtained'] !== '' ? (float)$m['marks_obtained'] : null;
                $special = !empty($m['special_status']) ? strtoupper($m['special_status']) : null;

                // 2. Find or create Exam row for this paper
                $exam = Exam::firstOrCreate(
                    [
                        'school_id' => $schoolId,
                        'academic_year_id' => $term->academic_year_id ?: $academicYearId,
                        'exam_term_id' => $term->id,
                        'school_class_id' => $classId,
                        'section_id' => $sectionId ?: 1,
                        'subject_id' => $subjectId,
                    ],
                    [
                        'exam_date' => now()->toDateString(),
                        'max_marks' => $maxMarks,
                        'pass_marks' => $passMarks,
                        'status' => 'submitted',
                    ]
                );

                // 3. Save ExamScore
                $isPassed = ($obtained !== null) ? ($obtained >= $passMarks) : null;
                $grade = ($obtained !== null) ? ExamMark::calculateGrade($obtained, $maxMarks) : null;

                ExamScore::updateOrCreate(
                    [
                        'school_id' => $schoolId,
                        'academic_year_id' => $exam->academic_year_id,
                        'exam_id' => $exam->id,
                        'student_id' => $student->id,
                    ],
                    [
                        'marks_obtained' => $actualObt,
                        'special_status' => $special,
                        'is_passed' => $isPassed,
                        'grade' => $grade,
                        'teacher_remarks' => $m['teacher_remarks'] ?? null,
                        'entered_by_user_id' => $user->id,
                    ]
                );

                // 4. Save ExamMark (for Marksheets & Report Cards)
                $th = isset($m['theory_marks']) && $m['theory_marks'] !== '' ? (float)$m['theory_marks'] : ($obtained !== null ? round($obtained * 0.8) : 0);
                $pr = isset($m['practical_marks']) && $m['practical_marks'] !== '' ? (float)$m['practical_marks'] : ($obtained !== null ? max(0, $obtained - $th) : 0);
                $actualObt = $obtained !== null ? $obtained : ($th + $pr);

                ExamMark::updateOrCreate(
                    [
                        'examination_id' => $examination->id,
                        'student_id' => $student->id,
                        'subject_id' => $subjectId,
                    ],
                    [
                        'school_id' => $schoolId,
                        'theory_marks' => $th,
                        'practical_marks' => $pr,
                        'marks_obtained' => $actualObt,
                        'max_marks' => $maxMarks,
                        'passing_marks' => $passMarks,
                        'grade' => $grade,
                        'remarks' => $m['teacher_remarks'] ?? ExamMark::getRemarkForGrade($grade),
                    ]
                );

                if ($actualObt !== null) {
                    $grandObtained += $actualObt;
                    $grandMax += $maxMarks;
                }
            }

            // 5. Re-run term calculation to immediately generate Class Results
            ExamRankingService::computeTermSummariesAndRanks($term);

            // 6. Update ReportCard for this student and examination
            $pct = $grandMax > 0 ? round(($grandObtained / $grandMax) * 100, 2) : 0;
            $overallGrade = ExamMark::calculateGrade($grandObtained, $grandMax ?: 600);
            $resultStatus = $pct >= 85 ? 'PASSED WITH DISTINCTION' : ($pct >= 33 ? 'PASSED' : 'FAILED');

            ReportCard::updateOrCreate(
                [
                    'examination_id' => $examination->id,
                    'student_id' => $student->id,
                ],
                [
                    'school_id' => $schoolId,
                    'academic_year' => $examination->academic_year,
                    'total_max_marks' => $grandMax ?: 600,
                    'total_marks_obtained' => $grandObtained,
                    'percentage' => $pct,
                    'overall_grade' => $overallGrade,
                    'result_status' => $resultStatus,
                    'teacher_remarks' => $request->input('overall_teacher_remarks') ?: 'Demonstrates consistent effort and academic performance.',
                    'principal_remarks' => $resultStatus === 'PASSED WITH DISTINCTION' ? 'Splendid academic achievement.' : 'Satisfactory progress.',
                ]
            );

            $studentSummary = StudentReportSummary::where('exam_term_id', $term->id)
                ->where('student_id', $student->id)
                ->first();

            return response()->json([
                'success' => true,
                'message' => "Marks for {$student->first_name} {$student->last_name} saved successfully! Class results, report cards, and marksheets have been generated.",
                'data' => [
                    'student_id' => $student->id,
                    'student_name' => "{$student->first_name} {$student->last_name}",
                    'total_obtained' => $grandObtained,
                    'total_max' => $grandMax,
                    'percentage' => $pct,
                    'grade' => $overallGrade,
                    'class_rank' => $studentSummary ? $studentSummary->class_rank : null,
                    'result_status' => $resultStatus,
                ],
            ]);
        });
    }

    public function assignedPapers(Request $request)
    {
        $user = $request->user();
        $schoolId = SchoolContext::getActiveSchoolId() ?: $user->school_id;
        $academicYearId = AcademicYearContext::getActiveAcademicYearId($schoolId);

        if (in_array($user->role, ['admin', 'super_admin', 'principal'], true)) {
            $exams = Exam::where('school_id', $schoolId)
                ->where('academic_year_id', $academicYearId)
                ->with(['examTerm', 'schoolClass', 'section', 'subject'])
                ->get();

            return response()->json(['success' => true, 'data' => $exams]);
        }

        $teacher = Teacher::where('user_id', $user->id)->first();
        if (!$teacher) {
            return response()->json(['success' => false, 'message' => 'Teacher record not found.'], 403);
        }

        $assignedTriplets = TeacherSubjectAssignment::where('school_id', $schoolId)
            ->where('academic_year_id', $academicYearId)
            ->where('teacher_id', $teacher->id)
            ->get();

        $exams = Exam::where('school_id', $schoolId)
            ->where('academic_year_id', $academicYearId)
            ->where(function ($query) use ($assignedTriplets) {
                foreach ($assignedTriplets as $assign) {
                    $query->orWhere(function ($q) use ($assign) {
                        $q->where('school_class_id', $assign->school_class_id)
                          ->where('section_id', $assign->section_id)
                          ->where('subject_id', $assign->subject_id);
                    });
                }
            })
            ->with(['examTerm', 'schoolClass', 'section', 'subject'])
            ->get();

        return response()->json(['success' => true, 'data' => $exams]);
    }

    public function examRoster(Request $request, $examId)
    {
        $user = $request->user();
        $schoolId = SchoolContext::getActiveSchoolId() ?: $user->school_id;
        $exam = Exam::where('school_id', $schoolId)->with(['examTerm', 'schoolClass', 'section', 'subject'])->findOrFail($examId);

        // Teacher authorization check: must be assigned to this section and subject
        if (!in_array($user->role, ['admin', 'super_admin', 'principal'], true)) {
            $teacher = Teacher::where('user_id', $user->id)->first();
            $isAssigned = $teacher && TeacherSubjectAssignment::where('school_id', $schoolId)
                ->where('teacher_id', $teacher->id)
                ->where('school_class_id', $exam->school_class_id)
                ->where('section_id', $exam->section_id)
                ->where('subject_id', $exam->subject_id)
                ->exists();

            if (!$isAssigned) {
                return response()->json(['success' => false, 'message' => 'Forbidden: You are not assigned to teach this subject in this section.'], 403);
            }
        }

        // Fetch students in section, filtering optional subjects by elective enrollment
        $isOptional = (strtolower($exam->subject?->type ?? '') === 'optional');
        $studentsQuery = Student::where('school_id', $schoolId)
            ->where('school_class_id', $exam->school_class_id)
            ->where('section_id', $exam->section_id)
            ->where('status', 'Active');

        if ($isOptional) {
            $enrolledStudentIds = StudentSubjectEnrollment::where('academic_year_id', $exam->academic_year_id)
                ->where('subject_id', $exam->subject_id)
                ->pluck('student_id');
            $studentsQuery->whereIn('id', $enrolledStudentIds);
        }

        $students = $studentsQuery->orderBy('roll_number')->get();

        $marks = ExamScore::where('exam_id', $exam->id)->get()->keyBy('student_id');

        $roster = $students->map(function ($stu) use ($marks) {
            $mark = $marks->get($stu->id);
            return [
                'student_id' => $stu->id,
                'name' => $stu->first_name . ' ' . ($stu->last_name ?? ''),
                'roll_number' => $stu->roll_number,
                'admission_number' => $stu->admission_number,
                'marks_obtained' => $mark ? $mark->marks_obtained : null,
                'special_status' => $mark ? $mark->special_status : null,
                'is_passed' => $mark ? $mark->is_passed : null,
                'teacher_remarks' => $mark ? $mark->teacher_remarks : null,
            ];
        });

        return response()->json([
            'success' => true,
            'exam' => $exam,
            'roster' => $roster,
        ]);
    }

    public function saveDraft(Request $request, $examId)
    {
        $user = $request->user();
        $schoolId = SchoolContext::getActiveSchoolId() ?: $user->school_id;

        $request->validate([
            'marks' => 'required|array',
            'marks.*.student_id' => 'required|exists:students,id',
            'marks.*.marks_obtained' => 'nullable|numeric|min:0',
            'marks.*.special_status' => 'nullable|in:AB,ML,EX',
            'marks.*.teacher_remarks' => 'nullable|string|max:255',
        ]);

        return DB::transaction(function () use ($schoolId, $examId, $user, $request) {
            $exam = Exam::where('school_id', $schoolId)->lockForUpdate()->findOrFail($examId);

            if ($exam->isLocked()) {
                return response()->json(['success' => false, 'message' => 'Exam is locked. Marks cannot be modified.'], 422);
            }

            // Teacher authorization check
            if (!in_array($user->role, ['admin', 'super_admin', 'principal'], true)) {
                $teacher = Teacher::where('user_id', $user->id)->first();
                $isAssigned = $teacher && TeacherSubjectAssignment::where('school_id', $schoolId)
                    ->where('teacher_id', $teacher->id)
                    ->where('school_class_id', $exam->school_class_id)
                    ->where('section_id', $exam->section_id)
                    ->where('subject_id', $exam->subject_id)
                    ->exists();

                if (!$isAssigned) {
                    return response()->json(['success' => false, 'message' => 'Forbidden: You are not assigned to teach this subject in this section.'], 403);
                }
            } else {
                // Admin mark override: audited
                AuditLog::create([
                    'school_id' => $schoolId,
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                    'user_role' => $user->role,
                    'auditable_type' => Exam::class,
                    'auditable_id' => $exam->id,
                    'event' => 'admin_mark_override',
                    'old_values' => ['status' => $exam->status],
                    'new_values' => ['updated_by_admin' => true, 'marks_count' => count($request->marks)],
                    'ip_address' => $request->ip(),
                    'user_agent' => substr($request->userAgent() ?? '', 0, 500),
                    'created_at' => now(),
                ]);
            }

            foreach ($request->marks as $m) {
                $obtained = isset($m['marks_obtained']) && $m['marks_obtained'] !== '' ? (float)$m['marks_obtained'] : null;
                $special = !empty($m['special_status']) ? strtoupper($m['special_status']) : null;

                // Validation bounds & mutual exclusivity
                if ($obtained !== null && $special !== null) {
                    return response()->json(['success' => false, 'message' => "Student ID {$m['student_id']}: cannot specify both numeric marks and special status."], 422);
                }

                if ($obtained !== null && ($obtained < 0 || $obtained > (float)$exam->max_marks)) {
                    return response()->json(['success' => false, 'message' => "Student ID {$m['student_id']}: marks must be between 0 and {$exam->max_marks}."], 422);
                }

                ExamScore::updateOrCreate(
                    [
                        'school_id' => $schoolId,
                        'academic_year_id' => $exam->academic_year_id,
                        'exam_id' => $exam->id,
                        'student_id' => $m['student_id'],
                    ],
                    [
                        'marks_obtained' => $obtained,
                        'special_status' => $special,
                        'teacher_remarks' => $m['teacher_remarks'] ?? null,
                        'entered_by_user_id' => $user->id,
                    ]
                );
            }

            $exam->status = 'draft';
            $exam->save();

            return response()->json([
                'success' => true,
                'message' => 'Scoresheet draft saved successfully.',
            ]);
        });
    }

    public function submitMarks(Request $request, $examId)
    {
        $user = $request->user();
        $schoolId = SchoolContext::getActiveSchoolId() ?: $user->school_id;

        return DB::transaction(function () use ($schoolId, $examId, $user) {
            $exam = Exam::where('school_id', $schoolId)->lockForUpdate()->findOrFail($examId);

            if ($exam->isLocked()) {
                return response()->json(['success' => false, 'message' => 'Exam is already locked.'], 422);
            }

            // Check that all roster students have marks or code
            $isOptional = (strtolower($exam->subject?->type ?? '') === 'optional');
            $studentsQuery = Student::where('school_id', $schoolId)
                ->where('school_class_id', $exam->school_class_id)
                ->where('section_id', $exam->section_id)
                ->where('status', 'Active');

            if ($isOptional) {
                $enrolledStudentIds = StudentSubjectEnrollment::where('academic_year_id', $exam->academic_year_id)
                    ->where('subject_id', $exam->subject_id)
                    ->pluck('student_id');
                $studentsQuery->whereIn('id', $enrolledStudentIds);
            }

            $studentsCount = $studentsQuery->count();

            $evaluatedCount = ExamScore::where('exam_id', $exam->id)
                ->where(function ($q) {
                    $q->whereNotNull('marks_obtained')
                      ->orWhereNotNull('special_status');
                })
                ->count();

            if ($evaluatedCount < $studentsCount) {
                return response()->json([
                    'success' => false,
                    'message' => "Cannot submit scoresheet: every student must have either a score or a special code (AB, ML, EX). Evaluated {$evaluatedCount}/{$studentsCount}.",
                ], 422);
            }

            $teacher = Teacher::where('user_id', $user->id)->first();

            $exam->status = 'submitted';
            $exam->submitted_at = now();
            $exam->submitted_by_teacher_id = $teacher?->id;
            $exam->save();

            return response()->json([
                'success' => true,
                'message' => 'Scoresheet submitted for administrative verification.',
                'data' => $exam,
            ]);
        });
    }

    public function saveClassTeacherRemarks(Request $request, $termId, $studentId)
    {
        $user = $request->user();
        $schoolId = SchoolContext::getActiveSchoolId() ?: $user->school_id;

        $request->validate([
            'remarks' => 'nullable|string|max:1000',
            'teacher_remarks' => 'nullable|string|max:1000',
        ]);

        $remarksText = $request->input('remarks') ?? $request->input('teacher_remarks');
        if (empty($remarksText)) {
            return response()->json(['success' => false, 'message' => 'The remarks field is required.'], 422);
        }

        $term = ExamTerm::where('school_id', $schoolId)->findOrFail($termId);
        $student = Student::where('school_id', $schoolId)->findOrFail($studentId);

        // Authorization check: User must be designated Class Teacher for student's section, or Admin
        if (!in_array($user->role, ['admin', 'super_admin', 'principal'], true)) {
            $teacher = Teacher::where('user_id', $user->id)->first();
            $isClassTeacher = $teacher && ClassTeacherAllocation::where('school_id', $schoolId)
                ->where('academic_year_id', $term->academic_year_id)
                ->where('school_class_id', $student->school_class_id)
                ->where('section_id', $student->section_id)
                ->where('teacher_id', $teacher->id)
                ->exists();

            if (!$isClassTeacher) {
                return response()->json(['success' => false, 'message' => 'Forbidden: Only the designated Class Teacher can enter report card remarks.'], 403);
            }
        }

        $summary = StudentReportSummary::updateOrCreate(
            [
                'school_id' => $schoolId,
                'academic_year_id' => $term->academic_year_id,
                'student_id' => $student->id,
                'summary_type' => 'term',
                'term_scope_id' => $term->id,
            ],
            [
                'exam_term_id' => $term->id,
                'school_class_id' => $student->school_class_id,
                'section_id' => $student->section_id,
                'total_max_marks' => 0.00,
                'total_obtained_marks' => 0.00,
                'percentage' => 0.00,
                'result_status' => 'RESULT_PENDING',
                'teacher_remarks' => $remarksText,
            ]
        );

        $summary->teacher_remarks = $remarksText;
        $summary->save();

        return response()->json([
            'success' => true,
            'message' => 'Class teacher remarks saved successfully.',
            'data' => $summary,
        ]);
    }
}
