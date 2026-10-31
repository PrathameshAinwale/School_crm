<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\ClassTeacherAllocation;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeacherSubjectAssignment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class TeacherSubjectAssignmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @param bool $dryRun
     * @return array
     */
    public function run(bool $dryRun = true): array
    {
        $report = [
            'dry_run' => $dryRun,
            'timetable_assignments_matched' => 0,
            'timetable_assignments_created' => 0,
            'class_teachers_matched' => 0,
            'class_teachers_created' => 0,
            'unresolved_entries' => [],
        ];

        $schools = School::all();

        foreach ($schools as $school) {
            $schoolId = $school->id;
            $academicYearId = AcademicYear::where('school_id', $schoolId)->where('is_current', true)->value('id')
                ?? AcademicYear::where('school_id', $schoolId)->value('id')
                ?? 1;

            // 1. Process Timetables into TeacherSubjectAssignment
            if (Schema::hasTable('timetables')) {
                $timetableEntries = DB::table('timetables')
                    ->whereNotNull('created_by_teacher_id')
                    ->whereNotNull('school_class_id')
                    ->whereNotNull('section_id')
                    ->get();

                foreach ($timetableEntries as $tt) {
                    $subject = Subject::where('name', $tt->subject)->first();
                    if (!$subject) {
                        // Attempt fallback by matching partial string
                        $subject = Subject::where('name', 'like', "%{$tt->subject}%")->first();
                    }

                    if ($subject) {
                        $report['timetable_assignments_matched']++;

                        if (!$dryRun) {
                            $existing = TeacherSubjectAssignment::where('school_id', $schoolId)
                                ->where('academic_year_id', $academicYearId)
                                ->where('school_class_id', $tt->school_class_id)
                                ->where('section_id', $tt->section_id)
                                ->where('subject_id', $subject->id)
                                ->where('teacher_id', $tt->created_by_teacher_id)
                                ->first();

                            if (!$existing) {
                                TeacherSubjectAssignment::create([
                                    'school_id' => $schoolId,
                                    'academic_year_id' => $academicYearId,
                                    'teacher_id' => $tt->created_by_teacher_id,
                                    'school_class_id' => $tt->school_class_id,
                                    'section_id' => $tt->section_id,
                                    'subject_id' => $subject->id,
                                    'role' => 'lead',
                                ]);
                                $report['timetable_assignments_created']++;
                            }
                        }
                    } else {
                        $report['unresolved_entries'][] = [
                            'timetable_id' => $tt->id,
                            'subject' => $tt->subject,
                            'reason' => 'Subject name could not be mapped to subjects table',
                        ];
                    }
                }
            }

            // 2. Process Class Teacher Allocations from teachers table
            $teachersWithClass = Teacher::where('school_id', $schoolId)
                ->whereNotNull('class_teacher_class')
                ->get();

            foreach ($teachersWithClass as $tch) {
                // Parse class name e.g. "Class 10" and division "A"
                $className = trim($tch->class_teacher_class);
                $class = SchoolClass::where('name', $className)->first();

                if ($class) {
                    $divName = trim($tch->class_teacher_division ?: 'A');
                    // Strip 'Div ' prefix if present e.g. 'Div A' -> 'A'
                    $divClean = preg_replace('/^Div\s+/i', '', $divName);

                    $section = Section::where('school_class_id', $class->id)
                        ->where(function ($q) use ($divClean) {
                            $q->where('name', $divClean)
                              ->orWhere('name', 'like', "%{$divClean}%");
                        })
                        ->first();

                    if ($section) {
                        $report['class_teachers_matched']++;

                        if (!$dryRun) {
                            $exists = ClassTeacherAllocation::where('school_id', $schoolId)
                                ->where('academic_year_id', $academicYearId)
                                ->where('school_class_id', $class->id)
                                ->where('section_id', $section->id)
                                ->first();

                            if (!$exists) {
                                ClassTeacherAllocation::create([
                                    'school_id' => $schoolId,
                                    'academic_year_id' => $academicYearId,
                                    'school_class_id' => $class->id,
                                    'section_id' => $section->id,
                                    'teacher_id' => $tch->id,
                                ]);
                                $report['class_teachers_created']++;
                            }
                        }
                    }
                }
            }
        }

        return $report;
    }
}
