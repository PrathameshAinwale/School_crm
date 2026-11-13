import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  LuClipboardList,
  LuFileSpreadsheet,
  LuCircleCheck,
  LuCircleAlert,
  LuSave,
  LuMessageSquare,
  LuAward,
  LuUser,
  LuGraduationCap,
  LuArrowLeft,
  LuArrowRight,
  LuChevronDown,
  LuCheckCheck,
  LuSparkles,
  LuExternalLink,
  LuLayers,
  LuPlus,
  LuX,
  LuSearch,
  LuPencil,
  LuCheck,
  LuClock,
} from 'react-icons/lu';

export default function TeacherScoresheetPage() {
  const [notification, setNotification] = useState(null);

  // ---------------------------------------------------------------------------
  // STUDENT-WISE ENTRY STATE (List Format + Add Record Modal)
  // ---------------------------------------------------------------------------
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedTermId, setSelectedTermId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('all');
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [studentMarks, setStudentMarks] = useState({});
  const [overallRemarks, setOverallRemarks] = useState('');
  const [loadingStudentData, setLoadingStudentData] = useState(false);
  const [savingStudentMarks, setSavingStudentMarks] = useState(false);
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = (msg, isErr = false) => {
    setNotification({ msg, isErr });
    setTimeout(() => setNotification(null), 4500);
  };

  // ---------------------------------------------------------------------------
  // INITIAL DATA LOADING
  // ---------------------------------------------------------------------------
  // Load Student Entry Filter Options (Terms, Classes, Students, Subjects)
  const loadStudentEntryData = async (termId = '', classId = '', sectionId = '') => {
    setLoadingStudentData(true);
    try {
      const params = {};
      if (termId) params.exam_term_id = termId;
      if (classId) params.class_id = classId;
      if (sectionId && sectionId !== 'all') params.section_id = sectionId;

      const res = await api.get('/teacher/scoresheets/student-entry-data', { params });
      const data = res.data?.data || res.data || {};

      if (data.terms) setTerms(data.terms);
      if (data.classes) setClasses(data.classes);
      if (data.students) setStudents(data.students);
      if (data.subjects) setSubjects(data.subjects);

      // Set active defaults if not yet selected
      const activeTerm = termId || data.selected_term_id || (data.terms?.[0]?.id ? String(data.terms[0].id) : '');
      const activeClass = classId || data.selected_class_id || (data.classes?.[0]?.id ? String(data.classes[0].id) : '');

      setSelectedTermId(String(activeTerm));
      setSelectedClassId(String(activeClass));

      // Auto-select first student if available and none selected or current student not in list
      if (data.students && data.students.length > 0) {
        const stillInList = data.students.some((s) => String(s.id) === String(selectedStudentId));
        if (!selectedStudentId || !stillInList) {
          setSelectedStudentId(String(data.students[0].id));
        }
      } else {
        setSelectedStudentId('');
      }
    } catch (err) {
      showToast(err.message || 'Failed to load examination and student filters', true);
    } finally {
      setLoadingStudentData(false);
    }
  };

  // Load individual student marks across all subjects for selected term
  const loadStudentMarks = async (termId, studentId) => {
    if (!termId || !studentId) return;
    setLoadingStudentData(true);
    try {
      const res = await api.get(`/teacher/scoresheets/student-marks/${termId}/${studentId}`);
      const data = res.data?.data || res.data || {};
      const marksList = data.marks || [];

      // Also sync subjects list if returned
      if (marksList.length > 0 && (!subjects || subjects.length === 0)) {
        setSubjects(marksList);
      }

      const marksMap = {};
      marksList.forEach((m) => {
        marksMap[m.subject_id] = {
          marks_obtained: m.marks_obtained !== null && m.marks_obtained !== undefined ? m.marks_obtained : '',
          theory_marks: m.theory_marks !== null && m.theory_marks !== undefined ? m.theory_marks : '',
          practical_marks: m.practical_marks !== null && m.practical_marks !== undefined ? m.practical_marks : '',
          max_marks: m.max_marks || 100,
          pass_marks: m.pass_marks || 33,
          special_status: m.special_status || null,
          teacher_remarks: m.teacher_remarks || '',
          grade: m.grade || '',
          is_passed: m.is_passed,
        };
      });

      setStudentMarks(marksMap);
      setOverallRemarks(data.summary?.teacher_remarks || '');
    } catch (err) {
      console.error('Failed to load student marks:', err);
    } finally {
      setLoadingStudentData(false);
    }
  };

  // Initial Boot
  useEffect(() => {
    loadStudentEntryData();
  }, []);

  // When class, section, or term changes in Student-wise mode
  const handleFilterChange = (newTermId, newClassId, newSectionId) => {
    setSelectedTermId(newTermId);
    setSelectedClassId(newClassId);
    setSelectedSectionId(newSectionId);
    loadStudentEntryData(newTermId, newClassId, newSectionId);
  };

  // When selected student changes
  useEffect(() => {
    if (selectedTermId && selectedStudentId) {
      loadStudentMarks(selectedTermId, selectedStudentId);
    }
  }, [selectedTermId, selectedStudentId]);

  // ---------------------------------------------------------------------------
  // STUDENT-WISE LOGIC & COMPUTATIONS
  // ---------------------------------------------------------------------------
  const currentStudentIndex = students.findIndex((s) => String(s.id) === String(selectedStudentId));
  const currentStudent = students.find((s) => String(s.id) === String(selectedStudentId));

  const handlePreviousStudent = async () => {
    if (currentStudentIndex > 0) {
      const prevStudent = students[currentStudentIndex - 1];
      const targetId = String(prevStudent.id);
      setSelectedStudentId(targetId);
      if (selectedTermId) {
        await loadStudentMarks(selectedTermId, targetId);
      }
    }
  };

  const handleNextStudent = async () => {
    if (currentStudentIndex < students.length - 1) {
      const nextStudent = students[currentStudentIndex + 1];
      const targetId = String(nextStudent.id);
      setSelectedStudentId(targetId);
      if (selectedTermId) {
        await loadStudentMarks(selectedTermId, targetId);
      }
    }
  };

  const handleSubjectMarkChange = (subjectId, field, value) => {
    setStudentMarks((prev) => {
      const current = prev[subjectId] || {};
      let updated = { ...current, [field]: value };

      if (field === 'theory_marks' || field === 'practical_marks') {
        const th = field === 'theory_marks' ? (value === '' ? 0 : Number(value)) : Number(current.theory_marks || 0);
        const pr = field === 'practical_marks' ? (value === '' ? 0 : Number(value)) : Number(current.practical_marks || 0);
        updated.marks_obtained = th + pr;
        updated.special_status = null;
      } else if (field === 'marks_obtained') {
        const num = value === '' ? '' : Number(value);
        updated.marks_obtained = num;
        if (num !== '') {
          updated.theory_marks = Math.round(num * 0.8);
          updated.practical_marks = num - Math.round(num * 0.8);
        }
        updated.special_status = null;
      }

      return { ...prev, [subjectId]: updated };
    });
  };

  const handleSubjectSpecialStatus = (subjectId, code) => {
    setStudentMarks((prev) => {
      const current = prev[subjectId] || {};
      const newCode = current.special_status === code ? null : code;
      return {
        ...prev,
        [subjectId]: {
          ...current,
          special_status: newCode,
          marks_obtained: newCode ? '' : current.marks_obtained,
          theory_marks: newCode ? '' : current.theory_marks,
          practical_marks: newCode ? '' : current.practical_marks,
        },
      };
    });
  };

  // Real-time calculation of overall student progress
  const liveSummary = useMemo(() => {
    let totObt = 0;
    let totMax = 0;
    let hasFail = false;
    let hasAbsent = false;

    subjects.forEach((sub) => {
      const data = studentMarks[sub.subject_id] || {};
      const maxM = Number(data.max_marks || sub.max_marks || 100);
      const passM = Number(data.pass_marks || sub.pass_marks || 33);
      totMax += maxM;

      if (data.special_status === 'AB') {
        hasAbsent = true;
        hasFail = true;
      } else if (data.marks_obtained !== '' && data.marks_obtained !== null && data.marks_obtained !== undefined) {
        const obt = Number(data.marks_obtained);
        totObt += obt;
        if (obt < passM) hasFail = true;
      }
    });

    const pct = totMax > 0 ? Number(((totObt / totMax) * 100).toFixed(2)) : 0;
    let grade = 'E';
    if (pct >= 90) grade = 'A+';
    else if (pct >= 80) grade = 'A';
    else if (pct >= 70) grade = 'B+';
    else if (pct >= 60) grade = 'B';
    else if (pct >= 50) grade = 'C';
    else if (pct >= 33) grade = 'D';

    let resultStatus = 'PASSED';
    if (hasAbsent) resultStatus = 'RESULT PENDING (ABSENT)';
    else if (hasFail || pct < 33) resultStatus = 'FAILED';
    else if (pct >= 85) resultStatus = 'PASSED WITH DISTINCTION';

    return {
      totalObtained: totObt,
      totalMax: totMax,
      percentage: pct,
      grade,
      resultStatus,
    };
  }, [subjects, studentMarks]);

  // Save Student Marks & Synchronize Results, Report Cards, and Marksheets
  const handleSaveStudentMarks = async (andGoNext = false) => {
    if (!selectedStudentId || !selectedTermId) {
      showToast('Please select a student and exam term first', true);
      return;
    }

    setSavingStudentMarks(true);
    try {
      const marksPayload = subjects.map((sub) => {
        const m = studentMarks[sub.subject_id] || {};
        return {
          subject_id: sub.subject_id,
          marks_obtained:
            m.marks_obtained !== '' && m.marks_obtained !== null && m.marks_obtained !== undefined
              ? Number(m.marks_obtained)
              : null,
          theory_marks:
            m.theory_marks !== '' && m.theory_marks !== null && m.theory_marks !== undefined
              ? Number(m.theory_marks)
              : null,
          practical_marks:
            m.practical_marks !== '' && m.practical_marks !== null && m.practical_marks !== undefined
              ? Number(m.practical_marks)
              : null,
          max_marks: Number(m.max_marks || sub.max_marks || 100),
          pass_marks: Number(m.pass_marks || sub.pass_marks || 33),
          special_status: m.special_status || null,
          teacher_remarks: m.teacher_remarks || null,
        };
      });

      const payload = {
        exam_term_id: selectedTermId,
        student_id: selectedStudentId,
        marks: marksPayload,
        overall_teacher_remarks: overallRemarks,
      };

      const res = await api.post('/teacher/scoresheets/save-student-marks', payload);
      const data = res.data || res;

      showToast(
        data.message ||
          `Marks for ${currentStudent?.name || 'student'} saved! Class results, report cards, and marksheets updated.`
      );

      // Refresh student list with updated marks
      await loadStudentEntryData(selectedTermId, selectedClassId, selectedSectionId);

      if (andGoNext) {
        if (currentStudentIndex < students.length - 1) {
          const nextStudent = students[currentStudentIndex + 1];
          setSelectedStudentId(String(nextStudent.id));
        } else {
          showToast('All students in this class evaluated!');
          setIsMarksModalOpen(false);
        }
      } else {
        setIsMarksModalOpen(false);
      }
    } catch (err) {
      showToast(err.message || 'Failed to save student marks', true);
    } finally {
      setSavingStudentMarks(false);
    }
  };

  // Filtered students for list display and metrics
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.roll_number && String(s.roll_number).toLowerCase().includes(q)) ||
        (s.admission_number && String(s.admission_number).toLowerCase().includes(q))
    );
  }, [students, searchQuery]);

  const listMetrics = useMemo(() => {
    const total = students.length;
    const evaluated = students.filter((s) => s.has_marks).length;
    const pending = total - evaluated;
    const evaluatedStudentsWithPct = students.filter(
      (s) => s.has_marks && s.percentage !== null && !isNaN(Number(s.percentage))
    );
    const avgPct =
      evaluatedStudentsWithPct.length > 0
        ? (
            evaluatedStudentsWithPct.reduce((acc, s) => acc + Number(s.percentage), 0) /
            evaluatedStudentsWithPct.length
          ).toFixed(1)
        : '0.0';
    return { total, evaluated, pending, avgPct };
  }, [students]);

  const handleOpenAddRecord = async () => {
    const unevaluated = students.find((s) => !s.has_marks);
    const target = unevaluated || students[0];
    if (target) {
      const targetId = String(target.id);
      setSelectedStudentId(targetId);
      setIsMarksModalOpen(true);
      if (selectedTermId) {
        await loadStudentMarks(selectedTermId, targetId);
      }
    } else {
      setIsMarksModalOpen(true);
    }
  };

  const handleOpenEditStudent = async (studentId) => {
    const targetId = String(studentId);
    setSelectedStudentId(targetId);
    setIsMarksModalOpen(true);
    if (selectedTermId) {
      await loadStudentMarks(selectedTermId, targetId);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto font-sans">
      {/* Toast Alert */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-semibold animate-scale-up ${
            notification.isErr
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {notification.isErr ? (
            <LuCircleAlert className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <LuCircleCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <LuClipboardList className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 whitespace-nowrap">Scoresheet & Marks Entry</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter student marks subject-by-subject to automatically update class results, report cards, and marksheets.
            </p>
          </div>
        </div>

        {/* Quick Cross-Navigation Links to Generated Documents */}
        
      </div>

      {/* Student Marks List & Record Entry */}
      <div className="space-y-4">
          {/* Top Filter & Action Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
              {/* 1. Exam Term Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <LuAward className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Exam Term</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedTermId}
                    onChange={(e) => handleFilterChange(e.target.value, selectedClassId, selectedSectionId)}
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer"
                  >
                    {terms.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <LuChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* 2. Class Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <LuGraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Academic Class</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedClassId}
                    onChange={(e) => handleFilterChange(selectedTermId, e.target.value, 'all')}
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <LuChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* 3. Section Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <LuLayers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Section</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedSectionId}
                    onChange={(e) => handleFilterChange(selectedTermId, selectedClassId, e.target.value)}
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer"
                  >
                    <option value="all">All Sections</option>
                    {classes
                      .find((c) => String(c.id) === String(selectedClassId))
                      ?.sections?.map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          Section {sec.name}
                        </option>
                      ))}
                  </select>
                  <LuChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Right: Search & Prominent "Add Record" Button */}
            <div className="flex items-end gap-2.5 flex-wrap sm:flex-nowrap">
              <div className="relative w-full sm:w-64">
                <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student or roll #..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={handleOpenAddRecord}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center gap-2 cursor-pointer shrink-0"
              >
                <LuPlus className="w-4 h-4" />
                <span>Add Record</span>
              </button>
            </div>
          </div>

          {/* KPI Summary Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Total Students</span>
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                  <LuUser className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-slate-900 mt-2">{listMetrics.total}</div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-medium">Enrolled in selected class</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
              <div className="flex items-center justify-between text-emerald-600 text-xs font-semibold">
                <span>Marks Recorded</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <LuCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-emerald-700 mt-2">{listMetrics.evaluated}</div>
              <div className="text-[11px] text-emerald-600/80 mt-0.5 font-medium">Evaluated &amp; ready</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
              <div className="flex items-center justify-between text-amber-600 text-xs font-semibold">
                <span>Pending Entry</span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <LuClock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-amber-700 mt-2">{listMetrics.pending}</div>
              <div className="text-[11px] text-amber-600/80 mt-0.5 font-medium">Awaiting marks input</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
              <div className="flex items-center justify-between text-indigo-600 text-xs font-semibold">
                <span>Class Average</span>
                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <LuSparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-indigo-700 mt-2">{listMetrics.avgPct}%</div>
              <div className="text-[11px] text-indigo-500 mt-0.5 font-medium">Across evaluated students</div>
            </div>
          </div>

          {/* Student Marks List Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <LuFileSpreadsheet className="w-4 h-4 text-indigo-600" />
                  <span>Student Marks Sheet</span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    ({filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'})
                  </span>
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddRecord}
                  className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <LuPlus className="w-3.5 h-3.5" />
                  <span>Add Record</span>
                </button>
              </div>
            </div>

            {loadingStudentData ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>Loading student records...</span>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <LuUser className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">No Student Records Found</h4>
                <p className="text-xs text-slate-500 mb-4">
                  {searchQuery
                    ? `No students matching "${searchQuery}" in this class.`
                    : 'No students currently enrolled in this class/section.'}
                </p>
                {!searchQuery && (
                  <button
                    type="button"
                    onClick={handleOpenAddRecord}
                    className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-indigo-700 transition"
                  >
                    + Add First Record
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4 w-16">Roll</th>
                      <th className="py-3 px-4">Student Details</th>
                      <th className="py-3 px-4">Subjects Recorded</th>
                      <th className="py-3 px-4 text-right">Total Marks</th>
                      <th className="py-3 px-4 text-right">Percentage</th>
                      <th className="py-3 px-4 text-center">Grade</th>
                      <th className="py-3 px-4 text-center">Result Status</th>
                      <th className="py-3 px-4 text-center w-32">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredStudents.map((s) => {
                      const isPassed = s.result_status && s.result_status.includes('PASS');
                      const isFailed = s.result_status && s.result_status.includes('FAIL');

                      return (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                            {s.roll_number || '—'}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                                {s.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join('')
                                  .toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{s.name}</div>
                                <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                                  <span>Adm #{s.admission_number || s.id}</span>
                                  {s.section_name && (
                                    <>
                                      <span>&bull;</span>
                                      <span className="text-slate-500">Sec {s.section_name}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {s.has_marks ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  <LuCheck className="w-3 h-3 text-emerald-600" />
                                  <span>
                                    {s.subjects_evaluated || s.subjects_count}/{s.subjects_count} Subjects Recorded
                                  </span>
                                </span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                <LuClock className="w-3 h-3 text-amber-600" />
                                <span>Pending Entry</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono">
                            {s.has_marks && s.total_obtained !== null ? (
                              <div>
                                <span className="font-bold text-slate-900">{s.total_obtained}</span>
                                <span className="text-slate-400 text-[11px]"> / {s.total_max}</span>
                              </div>
                            ) : (
                              <span className="text-slate-300 font-bold">—</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono">
                            {s.has_marks && s.percentage !== null ? (
                              <span className="font-extrabold text-indigo-600">{s.percentage}%</span>
                            ) : (
                              <span className="text-slate-300 font-bold">—</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            {s.has_marks && s.overall_grade ? (
                              <span className="inline-block px-2 py-0.5 font-extrabold text-[11px] rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                                {s.overall_grade}
                              </span>
                            ) : (
                              <span className="text-slate-300 font-bold">—</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            {s.has_marks ? (
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md inline-block ${
                                  isPassed
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : isFailed
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {s.result_status || 'EVALUATED'}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200 inline-block">
                                PENDING
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleOpenEditStudent(s.id)}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 w-full cursor-pointer ${
                                s.has_marks
                                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                              }`}
                            >
                              {s.has_marks ? (
                                <>
                                  <LuPencil className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Edit Marks</span>
                                </>
                              ) : (
                                <>
                                  <LuPlus className="w-3.5 h-3.5" />
                                  <span>Enter Marks</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ======================================================================= */}
          {/* ADD / EDIT RECORD MODAL DIALOG                                          */}
          {/* ======================================================================= */}
          {isMarksModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
                
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-indigo-50/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/25">
                      <LuClipboardList className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <span>{currentStudent?.has_marks ? 'Edit Student Marks Record' : 'Add Student Marks Record'}</span>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {terms.find((t) => String(t.id) === String(selectedTermId))?.name || 'Exam Term'}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {classes.find((c) => String(c.id) === String(selectedClassId))?.name || 'Class'} • {subjects.length} Subjects Curriculum
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsMarksModalOpen(false)}
                    className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
                    title="Close"
                  >
                    <LuX className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body (Scrollable) */}
                <div className="p-6 overflow-y-auto space-y-5 flex-1">
                  {/* Student Quick Selector & Navigation Bar */}
                  <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {currentStudent?.roll_number ? `#${currentStudent.roll_number}` : <LuUser className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Select Student ({currentStudentIndex >= 0 ? currentStudentIndex + 1 : 1} of {students.length})
                        </label>
                        <select
                          value={selectedStudentId}
                          onChange={(e) => {
                            const tid = e.target.value;
                            setSelectedStudentId(tid);
                            if (selectedTermId) loadStudentMarks(selectedTermId, tid);
                          }}
                          className="w-full px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                        >
                          {students.map((s) => (
                            <option key={s.id} value={s.id}>
                              Roll #{s.roll_number || '—'} - {s.name} ({s.admission_number || 'Adm'}) {s.has_marks ? '✓ Recorded' : '• Pending'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Prev / Next Buttons */}
                    <div className="flex items-center gap-1.5 self-end md:self-center">
                      <button
                        type="button"
                        onClick={handlePreviousStudent}
                        disabled={currentStudentIndex <= 0}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <LuArrowLeft className="w-3.5 h-3.5" />
                        <span>Prev</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStudent}
                        disabled={currentStudentIndex >= students.length - 1}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <span>Next</span>
                        <LuArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Student Evaluation Summary Stats (Live Evaluated) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Marks</div>
                      <div className="text-base font-black text-slate-900 mt-1">
                        {liveSummary.totalObtained} <span className="text-xs text-slate-400 font-semibold">/ {liveSummary.totalMax}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Percentage</div>
                      <div className="text-base font-black text-indigo-700 mt-1">
                        {liveSummary.percentage}%
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overall Grade</div>
                      <div className="text-base font-black text-slate-900 mt-1">
                        {liveSummary.grade}
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Result Status</div>
                      <div className="mt-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            liveSummary.resultStatus.includes('PASSED')
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : liveSummary.resultStatus.includes('FAILED')
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {liveSummary.resultStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Subject Marks Table */}
                  {loadingStudentData ? (
                    <div className="py-16 text-center text-slate-500 bg-slate-50/80 rounded-2xl border border-slate-200">
                      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <span className="text-xs font-bold text-slate-700">Loading previously recorded marks...</span>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <LuClipboardList className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Curriculum Subjects Marks ({subjects.length} Subjects)</span>
                        </div>
                        <div className="text-[10px] font-semibold text-slate-500 hidden sm:block">
                          Grading: A+ (&ge;90%), A (&ge;80%), B+ (&ge;70%), B (&ge;60%), Pass (&ge;33%)
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                              <th className="py-2.5 px-3 w-10 text-center">#</th>
                              <th className="py-2.5 px-3 min-w-[160px]">Subject</th>
                              <th className="py-2.5 px-3 text-center">Max / Pass</th>
                              <th className="py-2.5 px-3 w-28 text-center">Theory (80%)</th>
                              <th className="py-2.5 px-3 w-28 text-center">Practical (20%)</th>
                              <th className="py-2.5 px-3 w-32 text-center">Total Marks</th>
                              <th className="py-2.5 px-3 text-center">Special Code</th>
                              <th className="py-2.5 px-3 text-center">Grade</th>
                              <th className="py-2.5 px-3 min-w-[160px]">Remark</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {subjects.map((sub, sIdx) => {
                              const m = studentMarks[sub.subject_id] || {};
                              const maxM = Number(m.max_marks || sub.max_marks || 100);
                              const passM = Number(m.pass_marks || sub.pass_marks || 33);
                              const obtNum = m.marks_obtained !== '' && m.marks_obtained !== null && m.marks_obtained !== undefined ? Number(m.marks_obtained) : null;
                              const isPass = obtNum !== null && obtNum >= passM;

                              let subGrade = '—';
                              if (obtNum !== null) {
                                const pct = (obtNum / maxM) * 100;
                                if (pct >= 90) subGrade = 'A+';
                                else if (pct >= 80) subGrade = 'A';
                                else if (pct >= 70) subGrade = 'B+';
                                else if (pct >= 60) subGrade = 'B';
                                else if (pct >= 50) subGrade = 'C';
                                else if (pct >= 33) subGrade = 'D';
                                else subGrade = 'F';
                              }

                              return (
                                <tr key={sub.subject_id} className="hover:bg-slate-50/70 transition-colors">
                                  <td className="py-2.5 px-3 text-center font-mono text-slate-400 font-bold">{sIdx + 1}</td>
                                  <td className="py-2.5 px-3">
                                    <div className="font-extrabold text-slate-900">{sub.subject_name}</div>
                                    <span className="text-[10px] font-mono text-slate-400">{sub.subject_code}</span>
                                  </td>
                                  <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-600">
                                    <span className="text-slate-900 font-bold">{maxM}</span>
                                    <span className="text-slate-400 text-[10px] block">Pass: {passM}</span>
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <input
                                      type="number"
                                      step="0.5"
                                      min="0"
                                      max={maxM}
                                      disabled={!!m.special_status}
                                      value={m.theory_marks ?? ''}
                                      onChange={(e) =>
                                        handleSubjectMarkChange(sub.subject_id, 'theory_marks', e.target.value)
                                      }
                                      placeholder="0"
                                      className="w-20 px-2 py-1 text-center font-mono font-bold text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100"
                                    />
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <input
                                      type="number"
                                      step="0.5"
                                      min="0"
                                      max={maxM}
                                      disabled={!!m.special_status}
                                      value={m.practical_marks ?? ''}
                                      onChange={(e) =>
                                        handleSubjectMarkChange(sub.subject_id, 'practical_marks', e.target.value)
                                      }
                                      placeholder="0"
                                      className="w-20 px-2 py-1 text-center font-mono font-bold text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100"
                                    />
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <input
                                      type="number"
                                      step="0.5"
                                      min="0"
                                      max={maxM}
                                      disabled={!!m.special_status}
                                      value={m.marks_obtained ?? ''}
                                      onChange={(e) =>
                                        handleSubjectMarkChange(sub.subject_id, 'marks_obtained', e.target.value)
                                      }
                                      placeholder="0"
                                      className="w-24 px-2 py-1 text-center font-mono font-extrabold text-xs rounded-lg border-2 border-indigo-200 bg-indigo-50/40 text-indigo-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-400"
                                    />
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      {['AB', 'ML', 'EX'].map((code) => {
                                        const isSelected = m.special_status === code;
                                        return (
                                          <button
                                            key={code}
                                            type="button"
                                            onClick={() => handleSubjectSpecialStatus(sub.subject_id, code)}
                                            className={`px-1.5 py-0.5 text-[10px] font-extrabold rounded transition cursor-pointer ${
                                              isSelected
                                                ? code === 'AB'
                                                  ? 'bg-rose-600 text-white'
                                                  : code === 'ML'
                                                  ? 'bg-purple-600 text-white'
                                                  : 'bg-slate-700 text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                            title={code === 'AB' ? 'Absent' : code === 'ML' ? 'Medical Leave' : 'Exempt'}
                                          >
                                            {code}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    {m.special_status ? (
                                      <span className="font-bold text-[10px] text-slate-500 uppercase">{m.special_status}</span>
                                    ) : obtNum !== null ? (
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                          isPass
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                                        }`}
                                      >
                                        {subGrade}
                                      </span>
                                    ) : (
                                      <span className="text-slate-300 text-xs">—</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <input
                                      type="text"
                                      value={m.teacher_remarks || ''}
                                      onChange={(e) =>
                                        handleSubjectMarkChange(sub.subject_id, 'teacher_remarks', e.target.value)
                                      }
                                      placeholder="Feedback..."
                                      className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Overall Teacher Remarks */}
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <LuMessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Comprehensive Teacher Remarks for {currentStudent?.name || 'Student'}</span>
                      <span className="text-[10px] text-slate-400 font-normal ml-auto">Printed on Report Card</span>
                    </label>
                    <textarea
                      rows={2}
                      value={overallRemarks}
                      onChange={(e) => setOverallRemarks(e.target.value)}
                      placeholder="e.g. Outstanding academic consistency, demonstrates leadership and sound conceptual clarity."
                      className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-medium"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                    <LuSparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Synchronizes Class Results, Report Cards, and Marksheets automatically.</span>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setIsMarksModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveStudentMarks(false)}
                      disabled={savingStudentMarks}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <LuSave className="w-4 h-4" />
                      <span>{savingStudentMarks ? 'Saving...' : 'Save Record'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveStudentMarks(true)}
                      disabled={savingStudentMarks || currentStudentIndex >= students.length - 1}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      <LuCheckCheck className="w-4 h-4" />
                      <span>Save &amp; Next Student &rarr;</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>


    </div>
  );
}
