import React, { useState, useEffect, useMemo } from 'react';
import { reportCardService } from '../../services/reportCardService';
import {
  LuFileSpreadsheet,
  LuDownload,
  LuPrinter,
  LuSearch,
  LuEye,
  LuPencil,
  LuCheck,
  LuX,
  LuFilter,
  LuRefreshCw,
  LuGraduationCap,
  LuUsers,
  LuAward,
  LuCalendar,
  LuLayers,
  LuBuilding2,
  LuLoader,
  LuCircleCheck,
  LuCircleAlert,
  LuSparkles,
  LuTrendingUp,
  LuBookOpen,
  LuMessageSquareQuote,
  LuUser,
  LuClock,
  LuShieldCheck,
} from 'react-icons/lu';

export default function ReportCardsPage() {
  // Filter Workflow States
  const [academicYears, setAcademicYears] = useState(['2024-2025', '2025-2026', '2026-2027']);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2024-2025');

  const [examinations, setExaminations] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('all');

  const [divisions, setDivisions] = useState([]);
  const [selectedDivisionId, setSelectedDivisionId] = useState('all');

  const [selectedStudentId, setSelectedStudentId] = useState('all');

  // Data & Results
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [reportCards, setReportCards] = useState([]);
  const [stats, setStats] = useState(null);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [currentExam, setCurrentExam] = useState(null);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'DISTINCTION' | 'PASSED' | 'FAILED'
  const [previewStudentCard, setPreviewStudentCard] = useState(null);
  const [editingStudentMarks, setEditingStudentMarks] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [submittingMarks, setSubmittingMarks] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [downloadingSingleId, setDownloadingSingleId] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load initial dropdown options
  useEffect(() => {
    async function fetchFilters() {
      try {
        const res = await reportCardService.getFilters();
        if (res.success && res.data) {
          if (res.data.academic_years) setAcademicYears(res.data.academic_years);
          if (res.data.examinations && res.data.examinations.length > 0) {
            setExaminations(res.data.examinations);
            setSelectedExamId(res.data.examinations[0].id);
          }
          if (res.data.classes) setClasses(res.data.classes);
        }
      } catch (err) {
        console.error('Failed to load report card filters:', err);
      }
    }
    fetchFilters();
  }, []);

  // Update divisions dropdown when class changes
  useEffect(() => {
    if (selectedClassId === 'all') {
      setDivisions([]);
      setSelectedDivisionId('all');
    } else {
      const cls = classes.find((c) => String(c.id) === String(selectedClassId));
      if (cls && cls.sections) {
        setDivisions(cls.sections);
      } else {
        setDivisions([]);
      }
      setSelectedDivisionId('all');
    }
  }, [selectedClassId, classes]);

  // Main Generation Function
  const handleGenerate = async (overrideParams = {}) => {
    setLoading(true);
    try {
      const params = {
        academic_year: selectedAcademicYear,
        examination_id: selectedExamId || undefined,
        school_class_id: selectedClassId !== 'all' ? selectedClassId : undefined,
        section_id: selectedDivisionId !== 'all' ? selectedDivisionId : undefined,
        student_id: selectedStudentId !== 'all' ? selectedStudentId : undefined,
        ...overrideParams,
      };

      const res = await reportCardService.generateReportCards(params);
      if (res.success && res.data) {
        setReportCards(res.data.report_cards || []);
        setStats(res.data.stats || null);
        setSchoolInfo(res.data.school || null);
        setCurrentExam(res.data.examination || null);
        setInitialLoaded(true);
        showToast(`Generated ${res.data.report_cards.length} student report cards.`);
      }
    } catch (err) {
      console.error('Failed to generate report cards:', err);
      showToast('Error generating report cards. Please check selection criteria.');
    } finally {
      setLoading(false);
    }
  };

  // Automatically generate on first load once filters are ready
  useEffect(() => {
    if (selectedExamId && !initialLoaded) {
      handleGenerate();
    }
  }, [selectedExamId, initialLoaded]);

  // Filter students based on in-page search query and status
  const filteredReportCards = useMemo(() => {
    return reportCards.filter((item) => {
      // Status filter
      if (statusFilter !== 'all' && item.summary?.result_status !== statusFilter) {
        return false;
      }

      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const s = item.student;
      const name = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
      const roll = String(s.roll_number || '').toLowerCase();
      const adm = String(s.admission_number || '').toLowerCase();
      const cls = String(s.school_class?.name || '').toLowerCase();
      const sec = String(s.section?.name || '').toLowerCase();

      return name.includes(q) || roll.includes(q) || adm.includes(q) || cls.includes(q) || sec.includes(q);
    });
  }, [reportCards, searchQuery, statusFilter]);

  // Download Single Student PDF
  const handleDownloadSinglePdf = async (item) => {
    const s = item.student;
    const exam = currentExam || item.examination;
    setDownloadingSingleId(s.id);
    try {
      const filename = `Report_Card_${s.school_class?.name || 'Class'}_${s.roll_number}_${s.first_name}_${s.last_name || ''}.pdf`;
      await reportCardService.downloadStudentPdf(s.id, exam.id, filename);
      showToast(`Downloaded Report Card for ${s.first_name}.`);
    } catch (err) {
      console.error('PDF download error:', err);
      showToast('Error downloading PDF report card.');
    } finally {
      setDownloadingSingleId(null);
    }
  };

  // Download Bulk ZIP
  const handleDownloadBulkZip = async () => {
    if (!currentExam) return;
    setDownloadingZip(true);
    try {
      const params = {
        examination_id: currentExam.id,
        school_class_id: selectedClassId !== 'all' ? selectedClassId : undefined,
        section_id: selectedDivisionId !== 'all' ? selectedDivisionId : undefined,
      };
      const zipName = `Report_Cards_${currentExam.code || 'SA1'}_${selectedClassId !== 'all' ? 'Class_' + selectedClassId : 'All'}.zip`;
      await reportCardService.downloadBulkZip(params, zipName);
      showToast('ZIP archive downloaded successfully!');
    } catch (err) {
      console.error('Bulk ZIP download error:', err);
      showToast('Error generating bulk ZIP archive.');
    } finally {
      setDownloadingZip(false);
    }
  };

  // Print all cards or single card
  const handlePrint = (singleStudent = null) => {
    if (singleStudent) {
      setPreviewStudentCard(singleStudent);
    }
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Open Edit Marks Modal
  const openEditMarksModal = (item) => {
    setEditingStudentMarks({
      student: item.student,
      examination: item.examination,
      marks: item.marks.map((m) => ({
        id: m.id,
        subject_id: m.subject_id,
        subject_name: m.subject?.name || 'Subject',
        theory_marks: m.theory_marks || 0,
        practical_marks: m.practical_marks || 0,
        marks_obtained: m.marks_obtained || 0,
        max_marks: m.max_marks || 100,
        passing_marks: m.passing_marks || 35,
        grade: m.grade || 'A',
      })),
      teacher_remarks: item.summary.teacher_remarks || '',
      principal_remarks: item.summary.principal_remarks || '',
    });
  };

  // Handle Mark Change in Modal
  const handleMarkChange = (index, field, value) => {
    if (!editingStudentMarks) return;
    const updated = [...editingStudentMarks.marks];
    const num = Math.max(0, Math.min(100, parseFloat(value) || 0));
    updated[index][field] = num;

    const theory = field === 'theory_marks' ? num : (parseFloat(updated[index].theory_marks) || 0);
    const practical = field === 'practical_marks' ? num : (parseFloat(updated[index].practical_marks) || 0);
    const total = theory + practical;
    updated[index].marks_obtained = total;

    // Recalculate Grade
    const pct = (total / updated[index].max_marks) * 100;
    let grade = 'E';
    if (pct >= 90) grade = 'A+';
    else if (pct >= 80) grade = 'A';
    else if (pct >= 70) grade = 'B+';
    else if (pct >= 60) grade = 'B';
    else if (pct >= 50) grade = 'C';
    else if (pct >= 35) grade = 'D';
    updated[index].grade = grade;

    setEditingStudentMarks({
      ...editingStudentMarks,
      marks: updated,
    });
  };

  // Submit Updated Marks
  const handleSaveMarksSubmit = async (e) => {
    e.preventDefault();
    if (!editingStudentMarks) return;
    setSubmittingMarks(true);
    try {
      const payload = {
        examination_id: editingStudentMarks.examination.id,
        student_id: editingStudentMarks.student.id,
        marks: editingStudentMarks.marks.map((m) => ({
          subject_id: m.subject_id,
          theory_marks: m.theory_marks,
          practical_marks: m.practical_marks,
        })),
        teacher_remarks: editingStudentMarks.teacher_remarks,
        principal_remarks: editingStudentMarks.principal_remarks,
      };

      const res = await reportCardService.saveMarks(payload);
      if (res.success) {
        setEditingStudentMarks(null);
        showToast(`Marks updated for ${editingStudentMarks.student.first_name}.`);
        handleGenerate();
      }
    } catch (err) {
      console.error('Failed to save student marks:', err);
      showToast('Error saving marks.');
    } finally {
      setSubmittingMarks(false);
    }
  };

  // Helper: Format marks cleanly without ugly trailing .00
  const formatMark = (val) => {
    if (val === null || val === undefined || val === '') return '0';
    const n = parseFloat(val);
    if (isNaN(n)) return val;
    return Number.isInteger(n) ? String(n) : n.toFixed(1);
  };

  // Helper: Grade Badge Colors
  const getGradeBadge = (grade) => {
    const g = String(grade || '').toUpperCase();
    if (g.includes('A+') || g === 'A1') return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-black';
    if (g.includes('A') || g === 'A2') return 'bg-blue-50 text-blue-800 border-blue-300 font-bold';
    if (g.includes('B+') || g === 'B1') return 'bg-teal-50 text-teal-800 border-teal-300 font-bold';
    if (g.includes('B') || g === 'B2') return 'bg-sky-50 text-sky-800 border-sky-300 font-bold';
    if (g.includes('C')) return 'bg-amber-50 text-amber-800 border-amber-300 font-bold';
    if (g.includes('D')) return 'bg-orange-50 text-orange-800 border-orange-300 font-bold';
    return 'bg-rose-50 text-rose-800 border-rose-300 font-bold';
  };

  // RENDER REPORT CARD SHEET (Shared between Preview Modal & Pure Print Container)
  const renderReportCardSheet = (card) => {
    if (!card) return null;
    const s = card.student;
    const summary = card.summary;
    const exam = card.examination;

    return (
      <div className="print-full-a4 bg-white border-2 border-slate-900/40 rounded-xl shadow-lg p-5 sm:p-6 max-w-[840px] w-full text-slate-800 font-sans space-y-3 relative box-border">
        {/* School Institutional Header */}
        <div className="border-b-2 border-emerald-900/30 pb-3 flex items-center justify-between gap-3">
          {/* Crest / Emblem */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-950 text-white flex flex-col items-center justify-center shadow-md p-1.5 text-center shrink-0 border border-emerald-700/60">
            <LuAward className="w-6 h-6 text-amber-300" />
            <span className="text-[7px] font-black uppercase tracking-widest text-emerald-100 mt-0.5">ESTD. 1998</span>
          </div>

          {/* Institution Details */}
          <div className="text-center flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-serif uppercase leading-tight">
              {schoolInfo?.name || 'DELHI PUBLIC ACADEMY'}
            </h2>
            <p className="text-[10.5px] font-bold text-emerald-800 mt-0.5 tracking-wide uppercase">
              SENIOR SECONDARY SCHOOL &bull; {schoolInfo?.affiliation || 'CBSE AFFILIATED'}
            </p>
            <p className="text-[9.5px] text-slate-500 font-medium">
              Affiliation No. 27200100142 &bull; School Code: {schoolInfo?.code || 'DPS-101'} &bull; UDISE+: 27200100142
            </p>
            <p className="text-[9px] text-slate-400">
              {schoolInfo?.address || 'Plot 42, Institutional Area, Sector 14, New Delhi'} &bull; Tel: {schoolInfo?.phone || '+91 11 2890 1200'} &bull; {schoolInfo?.email || 'office@dpsacademy.edu.in'}
            </p>
            <div className="mt-1.5 inline-flex items-center gap-2 px-3.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-extrabold uppercase tracking-widest shadow-2xs">
              <span>ANNUAL STUDENT PROGRESS & CUMULATIVE REPORT</span>
              <span className="text-amber-300 font-bold">&bull; SESSION {exam?.academic_year || '2024-2025'}</span>
            </div>
          </div>

          {/* Student Passport Photo Box */}
          <div className="w-18 h-22 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center p-1 text-center shrink-0 shadow-inner">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-black text-xs">
              {s.first_name?.[0]}{s.last_name?.[0] || ''}
            </div>
            <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-tighter mt-1 leading-tight">
              STUDENT PHOTO
            </span>
          </div>
        </div>

        {/* Exam Title & Result Strip */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Examination:</span>
            <strong className="text-slate-900 font-black">{exam?.name}</strong>
            <span className="px-2 py-0.2 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">
              {exam?.term || 'Term 1'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Evaluation Status:</span>
            <span className={`px-2.5 py-0.5 rounded-full font-black text-xs uppercase tracking-wider inline-flex items-center gap-1 border shadow-2xs ${
              summary.result_status === 'DISTINCTION'
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : summary.result_status === 'PASSED'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              <LuCircleCheck className="w-3.5 h-3.5" />
              {summary.result_status}
            </span>
          </div>
        </div>

        {/* Student Demographics Profile Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white text-xs">
          <div className="bg-slate-50 px-3 py-1 border-b border-slate-200 font-bold text-[9.5px] text-slate-600 uppercase tracking-wider flex items-center justify-between">
            <span>Part A: Student Academic Bio-Data</span>
            <span className="text-slate-400 font-mono text-[9px]">PEN: {s.admission_number ? '2024100' + s.roll_number : 'PEN-REG-2024'}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 p-2.5 gap-y-2">
            <div className="pr-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Student Name</span>
              <strong className="text-slate-900 font-black text-xs block truncate">
                {s.first_name} {s.last_name || ''}
              </strong>
            </div>
            <div className="sm:px-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Roll Number</span>
              <strong className="text-slate-900 font-black text-xs block">
                #{s.roll_number || 'N/A'}
              </strong>
            </div>
            <div className="sm:px-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Class & Division</span>
              <strong className="text-slate-900 font-black text-xs block">
                {s.school_class?.name || 'Class 10'} - {s.section?.name || 'Div A'}
              </strong>
            </div>
            <div className="sm:pl-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Admission No</span>
              <strong className="font-mono text-slate-900 font-bold text-xs block">
                {s.admission_number}
              </strong>
            </div>

            <div className="pr-2 pt-1.5 sm:pt-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Father's Name</span>
              <span className="text-slate-800 font-semibold block truncate">
                {s.father_name || s.guardian_name || 'Ramesh Singhania'}
              </span>
            </div>
            <div className="sm:px-2 pt-1.5 sm:pt-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Mother's Name</span>
              <span className="text-slate-800 font-semibold block truncate">
                {s.mother_name || 'Sunita Patel'}
              </span>
            </div>
            <div className="sm:px-2 pt-1.5 sm:pt-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Date of Birth</span>
              <span className="text-slate-800 font-semibold block">
                {s.date_of_birth ? new Date(s.date_of_birth).toLocaleDateString('en-GB') : '15/01/2010'}
              </span>
            </div>
            <div className="sm:pl-2 pt-1.5 sm:pt-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Attendance Record</span>
              <strong className="text-emerald-700 font-black block">
                {summary.attendance_percentage}% ({summary.present_days}/{summary.working_days} d)
              </strong>
            </div>
          </div>
        </div>

        {/* Scholastic Performance Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
          <div className="bg-slate-900 text-white px-3 py-1 font-bold text-[9.5px] uppercase tracking-wider flex items-center justify-between">
            <span>Part 1: Scholastic Achievement &bull; Curricular Subjects</span>
            <span className="text-slate-400 text-[8.5px] font-normal">CBSE Evaluation Scheme</span>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[9.5px] uppercase tracking-wider">
              <tr>
                <th className="py-1.5 px-2.5 w-7 text-center">#</th>
                <th className="py-1.5 px-2.5">Subject Name & Code</th>
                <th className="py-1.5 px-2.5 text-center">Max</th>
                <th className="py-1.5 px-2.5 text-center">Pass</th>
                <th className="py-1.5 px-2.5 text-center">Theory (80)</th>
                <th className="py-1.5 px-2.5 text-center">Practical (20)</th>
                <th className="py-1.5 px-2.5 text-center bg-slate-100/60 font-black">Total Obtained</th>
                <th className="py-1.5 px-2.5 text-center">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {card.marks.map((m, idx) => (
                <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-1 px-2.5 text-center text-slate-400 font-mono text-[10px]">{idx + 1}</td>
                  <td className="py-1 px-2.5 font-bold text-slate-800">
                    {m.subject?.name || 'Subject'}
                    {m.subject?.code && <span className="text-[9px] text-slate-400 font-normal ml-1 font-mono">({m.subject.code})</span>}
                  </td>
                  <td className="py-1 px-2.5 text-center text-slate-600">{formatMark(m.max_marks || 100)}</td>
                  <td className="py-1 px-2.5 text-center text-slate-500">{formatMark(m.passing_marks || 35)}</td>
                  <td className="py-1 px-2.5 text-center font-bold text-slate-800">{formatMark(m.theory_marks || 0)}</td>
                  <td className="py-1 px-2.5 text-center font-bold text-slate-800">{formatMark(m.practical_marks || 0)}</td>
                  <td className="py-1 px-2.5 text-center font-black text-slate-900 bg-slate-50/70 text-xs">
                    {formatMark(m.marks_obtained || 0)}
                  </td>
                  <td className="py-1 px-2.5 text-center">
                    <span className={`px-2 py-0.2 rounded border text-[9.5px] ${getGradeBadge(m.grade)}`}>
                      {m.grade}
                    </span>
                  </td>
                </tr>
              ))}
              {/* Grand Scholastic Total Row */}
              <tr className="bg-slate-100/90 font-black border-t-2 border-slate-900 text-slate-900">
                <td colSpan="2" className="py-1.5 px-2.5 text-slate-900 font-black uppercase text-[11px]">
                  GRAND SCHOLASTIC TOTAL
                </td>
                <td className="py-1.5 px-2.5 text-center">{formatMark(summary.total_max_marks || 600)}</td>
                <td className="py-1.5 px-2.5 text-center">210</td>
                <td colSpan="2" className="py-1.5 px-2.5 text-center text-[9px] text-slate-500 font-medium">
                  Aggregate Scholastic Performance
                </td>
                <td className="py-1.5 px-2.5 text-center text-emerald-950 font-black text-sm bg-emerald-100/70">
                  {formatMark(summary.total_marks_obtained || 0)}
                </td>
                <td className="py-1.5 px-2.5 text-center text-emerald-950 font-black text-xs">
                  {summary.overall_grade}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Part 2: Co-Scholastic & Personal Traits Assessment */}
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          <div className="bg-slate-50 px-3 py-1 border-b border-slate-200 font-bold text-[9.5px] text-slate-600 uppercase tracking-wider flex items-center justify-between">
            <span>Part 2: Co-Scholastic Areas & Life Skills (3-Point Scale: A, B, C)</span>
            <span className="text-slate-400 text-[8.5px]">Graded by Faculty Committee</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 text-xs">
            <div className="p-2 flex items-center justify-between">
              <span className="font-semibold text-slate-700 text-[10.5px]">Work Education & ICT</span>
              <span className="px-2 py-0.2 rounded bg-blue-50 text-blue-800 border border-blue-200 font-black text-[9.5px]">A</span>
            </div>
            <div className="p-2 flex items-center justify-between">
              <span className="font-semibold text-slate-700 text-[10.5px]">Visual & Performing Arts</span>
              <span className="px-2 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-black text-[9.5px]">A</span>
            </div>
            <div className="p-2 flex items-center justify-between">
              <span className="font-semibold text-slate-700 text-[10.5px]">Health & Physical Fitness</span>
              <span className="px-2 py-0.2 rounded bg-teal-50 text-teal-800 border border-teal-200 font-black text-[9.5px]">A</span>
            </div>
            <div className="p-2 flex items-center justify-between">
              <span className="font-semibold text-slate-700 text-[10.5px]">Discipline, Values & Ethics</span>
              <span className="px-2 py-0.2 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 font-black text-[9.5px]">A</span>
            </div>
          </div>
        </div>

        {/* Score Summary Metrics Strip */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
          <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">Total Marks</span>
            <strong className="text-xs font-black text-slate-900 mt-0.5 block">
              {formatMark(summary.total_marks_obtained)} / {formatMark(summary.total_max_marks)}
            </strong>
          </div>
          <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg">
            <span className="text-[9px] font-bold text-emerald-700 block uppercase tracking-wider">Percentage</span>
            <strong className="text-xs font-black text-emerald-800 mt-0.5 block">
              {summary.percentage}%
            </strong>
          </div>
          <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">Final Grade</span>
            <strong className="text-xs font-black text-slate-900 mt-0.5 block">
              {summary.overall_grade}
            </strong>
          </div>
          <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg">
            <span className="text-[9px] font-bold text-emerald-700 block uppercase tracking-wider">Result</span>
            <strong className="text-xs font-black text-emerald-800 mt-0.5 block">
              {summary.result_status}
            </strong>
          </div>
          <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">Class Rank</span>
            <strong className="text-xs font-black text-slate-900 mt-0.5 block">
              #{summary.class_rank}
            </strong>
          </div>
          <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">Division Rank</span>
            <strong className="text-xs font-black text-slate-900 mt-0.5 block">
              #{summary.division_rank}
            </strong>
          </div>
        </div>

        {/* Grading Scale Reference Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-[9px] text-slate-500 text-center font-medium">
          <strong className="text-slate-700 uppercase">CBSE Grading Scheme:</strong>{' '}
          A1 (91-100) &bull; A2 (81-90) &bull; B1 (71-80) &bull; B2 (61-70) &bull; C1 (51-60) &bull; C2 (41-50) &bull; D (33-40) &bull; E (Needs Remedial)
        </div>

        {/* Remarks Section */}
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs">
          <div className="flex items-start gap-1.5">
            <strong className="text-slate-800 shrink-0 font-bold text-[11px]">Class Teacher Remarks:</strong>
            <span className="italic text-slate-700 text-[11px]">"{summary.teacher_remarks}"</span>
          </div>
          <div className="flex items-start gap-1.5 pt-1 border-t border-slate-200/60">
            <strong className="text-slate-800 shrink-0 font-bold text-[11px]">Principal Remarks:</strong>
            <span className="font-semibold text-emerald-850 text-[11px]">
              {summary.principal_remarks || 'Promoted with commendable effort. Keep aiming for higher scholastic excellence.'}
            </span>
          </div>
        </div>

        {/* Official 3-Column Signatures & Stamp Seal */}
        <div className="pt-2 grid grid-cols-3 gap-4 text-center items-end">
          {/* Signature 1 */}
          <div>
            <div className="h-6 border-b border-slate-400 flex items-end justify-center pb-0.5">
              <span className="font-serif italic text-slate-500 text-xs">S. Sharma</span>
            </div>
            <span className="text-[9.5px] font-bold uppercase text-slate-700 mt-1 block">Class Teacher Signature</span>
            <span className="text-[8.5px] text-slate-400">Date: 30/10/2026</span>
          </div>

          {/* Seal Stamp */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full border-2 border-dashed border-emerald-800/70 bg-emerald-50/40 flex flex-col items-center justify-center text-center p-0.5 rotate-[-6deg] shadow-2xs">
              <span className="text-[5.5px] font-black uppercase tracking-wider text-emerald-950 leading-tight">DELHI PUBLIC ACADEMY</span>
              <LuShieldCheck className="w-3.5 h-3.5 text-emerald-800 my-0.2" />
              <span className="text-[5px] font-black uppercase tracking-tight text-emerald-900">OFFICIAL SEAL</span>
            </div>
            <span className="text-[9.5px] font-bold uppercase text-slate-700 mt-0.5 block">Institutional Seal</span>
          </div>

          {/* Signature 3 */}
          <div>
            <div className="h-6 border-b border-slate-400 flex items-end justify-center pb-0.5">
              <span className="font-serif italic text-slate-700 text-xs font-bold">Dr. Rajeshwari Sharma</span>
            </div>
            <span className="text-[9.5px] font-bold uppercase text-slate-700 mt-1 block">Principal Signature</span>
            <span className="text-[8.5px] text-slate-400">Delhi Public Academy</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in pb-16">
      {/* Print Specific CSS - Perfectly un-constrains printable area and prevents clipping */}
      <style>{`
        @media print {
          /* 1. Hide on-screen UI elements, sidebars, topbars, buttons, alerts */
          aside, header, nav, .no-print, button, input {
            display: none !important;
          }

          /* 2. Remove all overflow and height restrictions from all parents */
          html, body, #root, #root > div, main {
            overflow: visible !important;
            overflow-x: visible !important;
            overflow-y: visible !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            position: static !important;
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* 3. Make dedicated print container visible and unconstrained */
          .print-only-container {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          .print-sheet-wrapper {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-page-break {
            page-break-after: always !important;
            break-after: page !important;
          }

          .print-full-a4 {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 4mm 6mm !important;
            box-sizing: border-box !important;
            border: 2px solid #0f172a !important;
            border-radius: 6px !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          @page {
            size: A4 portrait;
            margin: 6mm 6mm 6mm 6mm;
          }
        }
      `}</style>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="no-print fixed bottom-5 right-5 z-50 bg-white text-slate-800 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-scale-up border border-slate-200">
          <LuCircleCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP BANNER HEADER (Clean Light Theme matching School CRM) */}
      <div className="no-print bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
            <LuFileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
                Student Report Cards & Evaluation Engine
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold inline-flex items-center gap-1">
                <LuShieldCheck className="w-3.5 h-3.5" />
                Automated Grading
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Generate, preview, print and download official A4 PDF report cards student-wise, class-wise & division-wise.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => handleGenerate()}
            disabled={loading}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition cursor-pointer border border-slate-200"
            title="Refresh Report Cards"
          >
            <LuRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          <button
            onClick={handleDownloadBulkZip}
            disabled={downloadingZip || reportCards.length === 0}
            className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Download all report cards as ZIP"
          >
            {downloadingZip ? <LuLoader className="w-4 h-4 animate-spin text-emerald-600" /> : <LuDownload className="w-4 h-4 text-emerald-600" />}
            <span>Download All (ZIP)</span>
          </button>

          <button
            onClick={() => handlePrint(null)}
            disabled={reportCards.length === 0}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <LuPrinter className="w-4 h-4" />
            <span>Print All Cards</span>
          </button>
        </div>
      </div>

      {/* STEP-BY-STEP EVALUATION CRITERIA FILTER CARD */}
      <div className="no-print bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-black text-xs">
              1
            </span>
            <h3 className="font-extrabold text-sm text-slate-800">Select Evaluation Criteria</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Workflow: Academic Year → Examination → Class → Division → Generate
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5 items-end">
          {/* 1. Academic Year */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <LuCalendar className="w-3.5 h-3.5 text-emerald-600" /> Academic Year
            </label>
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 cursor-pointer transition"
            >
              {academicYears.map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          {/* 2. Examination */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <LuAward className="w-3.5 h-3.5 text-emerald-600" /> Examination
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 cursor-pointer transition"
            >
              {examinations.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.code || ex.term})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Class */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <LuBuilding2 className="w-3.5 h-3.5 text-emerald-600" /> Academic Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 cursor-pointer transition"
            >
              <option value="all">All Classes (Entire School)</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          {/* 4. Division */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <LuLayers className="w-3.5 h-3.5 text-emerald-600" /> Division / Section
            </label>
            <select
              value={selectedDivisionId}
              onChange={(e) => setSelectedDivisionId(e.target.value)}
              disabled={selectedClassId === 'all'}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-50 transition"
            >
              <option value="all">All Divisions</option>
              {divisions.map((div) => (
                <option key={div.id} value={div.id}>{div.name}</option>
              ))}
            </select>
          </div>

          {/* 5. Generate Button */}
          <div>
            <button
              onClick={() => handleGenerate()}
              disabled={loading}
              className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 h-[38px]"
            >
              {loading ? (
                <>
                  <LuLoader className="w-4 h-4 animate-spin" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <LuSparkles className="w-4 h-4" />
                  <span>Generate Report Cards</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* KPI & ANALYTICS BAR (Clean Real Theme Stat Cards) */}
      {stats && (
        <div className="no-print grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Evaluated</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <LuGraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-800">{stats.total_students}</div>
            <span className="text-[11px] text-slate-500 font-medium mt-1">Students Enrolled</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Class Average</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <LuTrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-700">{stats.class_average}%</div>
            <span className="text-[11px] text-emerald-700 font-bold mt-1">
              Grade {stats.class_average >= 80 ? 'A' : 'B+'} Level
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pass Rate</span>
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                <LuCircleCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-teal-700">{stats.pass_percentage}%</div>
            <span className="text-[11px] text-slate-500 font-medium mt-1">
              {stats.passed_count} of {stats.total_students} Passed
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Distinctions</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <LuAward className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-indigo-700">{stats.distinction_count}</div>
            <span className="text-[11px] text-indigo-600 font-medium mt-1">Grade A+ (≥85%)</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Compartment</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <LuCircleAlert className="w-4 h-4" />
              </div>
            </div>
            <div className={`text-2xl font-black ${stats.failed_count > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
              {stats.failed_count}
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-1">
              {stats.failed_count === 0 ? '0 Backlogs' : 'Needs Remedial'}
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Top Ranker</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <LuSparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-sm font-extrabold text-slate-900 truncate" title={stats.top_scorer?.name}>
              {stats.top_scorer?.name || 'Aarav Patel'}
            </div>
            <span className="text-[11px] text-amber-700 font-bold mt-1">
              {stats.top_scorer?.percentage || 92}% ({stats.top_scorer?.grade || 'A+'})
            </span>
          </div>
        </div>
      )}

      {/* ACTION & SEARCH TOOLBAR */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, roll number, admission number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Status Filter Tabs */}
          <div className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
            {[
              { id: 'all', label: 'All Status' },
              { id: 'DISTINCTION', label: 'Distinction' },
              { id: 'PASSED', label: 'Passed' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-[11px] font-bold ${
                  statusFilter === f.id ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2.5 justify-between sm:justify-end">
          <span className="text-xs font-bold text-slate-600 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
            {filteredReportCards.length} Student Cards
          </span>

          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold text-slate-600">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'hover:text-slate-900'
              }`}
            >
              Card View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'hover:text-slate-900'
              }`}
            >
              Table View
            </button>
          </div>
        </div>
      </div>

      {/* STUDENT REPORT CARDS GRID / TABLE (Clean Light Theme) */}
      {filteredReportCards.length === 0 ? (
        <div className="no-print bg-white rounded-2xl p-12 text-center border border-slate-200/90 shadow-xs">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-100">
            <LuFileSpreadsheet className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">No Report Cards Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery
              ? `No student matches "${searchQuery}". Clear your search query.`
              : 'Click "Generate Report Cards" above to calculate and render evaluations for this class.'}
          </p>
          <button
            onClick={() => handleGenerate()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer inline-flex items-center gap-2 shadow-xs"
          >
            <LuSparkles className="w-4 h-4" />
            <span>Generate Now</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* PROFESSIONAL GRID VIEW OF REPORT CARDS (100% Light Theme) */
        <div className="no-print grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReportCards.map((item) => {
            const s = item.student;
            const summary = item.summary;
            const isDistinction = summary.result_status === 'DISTINCTION';
            const isTopRank = summary.division_rank <= 3;

            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
              >
                {/* Clean Light Card Header */}
                <div className="p-4 sm:p-4.5 border-b border-slate-100 bg-slate-50/60">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
                        {s.first_name?.[0]}{s.last_name?.[0] || ''}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-sm text-slate-900 leading-tight truncate group-hover:text-emerald-700 transition-colors">
                          {s.first_name} {s.last_name || ''}
                        </h4>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-600">Roll #{s.roll_number || '•'}</span>
                          <span>&bull;</span>
                          <span>{s.school_class?.name || 'Class 10'} ({s.section?.name || 'Div A'})</span>
                        </div>
                      </div>
                    </div>

                    {/* Rank Badge */}
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 border ${
                        isTopRank
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {isTopRank && <LuAward className="w-3 h-3 text-amber-600" />}
                        Rank #{summary.division_rank}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                        isDistinction
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {summary.result_status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score Summary Metrics Body */}
                <div className="p-4 sm:p-4.5 space-y-3.5 flex-1 flex flex-col justify-between">
                  {/* 3 Metric Tiles */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Total</span>
                      <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
                        {summary.total_marks_obtained}
                      </span>
                      <span className="text-[10px] text-slate-400">/ {summary.total_max_marks}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase block tracking-wider">Percentage</span>
                      <span className="text-sm font-extrabold text-emerald-800 mt-0.5 block">
                        {summary.percentage}%
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold">Grade {summary.overall_grade}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Attendance</span>
                      <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
                        {summary.attendance_percentage}%
                      </span>
                      <span className="text-[10px] text-slate-400">{summary.present_days}/{summary.working_days} d</span>
                    </div>
                  </div>

                  {/* Percentage Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-500">Academic Score Progression</span>
                      <span className="font-extrabold text-slate-800">{summary.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isDistinction ? 'bg-indigo-600' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${Math.min(100, summary.percentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Subject Scores Preview Strip */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Subject Performance</span>
                    <div className="space-y-1">
                      {item.marks.slice(0, 4).map((m) => (
                        <div key={m.id} className="flex items-center justify-between text-xs py-0.5">
                          <span className="text-slate-600 font-medium text-[11px] truncate pr-2">
                            {m.subject?.name || 'Subject'}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="font-bold text-slate-800 text-[11px]">{formatMark(m.marks_obtained)}</span>
                            <span className={`px-1.5 py-0.2 rounded border text-[9px] ${getGradeBadge(m.grade)}`}>
                              {m.grade}
                            </span>
                          </div>
                        </div>
                      ))}
                      {item.marks.length > 4 && (
                        <div className="text-[10px] text-slate-400 font-medium text-right pt-0.5">
                          + {item.marks.length - 4} more subjects
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Teacher Remarks Callout */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border-l-2 border-emerald-500 text-[11px] text-slate-600 italic line-clamp-2">
                    "{summary.teacher_remarks}"
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => setPreviewStudentCard(item)}
                    className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs rounded-lg transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <LuEye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={() => handleDownloadSinglePdf(item)}
                    disabled={downloadingSingleId === s.id}
                    className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 shadow-2xs"
                  >
                    {downloadingSingleId === s.id ? <LuLoader className="w-3.5 h-3.5 animate-spin" /> : <LuDownload className="w-3.5 h-3.5" />}
                    <span>PDF</span>
                  </button>

                  <button
                    onClick={() => handlePrint(item)}
                    className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg transition cursor-pointer"
                    title="Quick Print"
                  >
                    <LuPrinter className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => openEditMarksModal(item)}
                    className="p-1.5 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 rounded-lg transition cursor-pointer"
                    title="Edit Marks & Remarks"
                  >
                    <LuPencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW OF REPORT CARDS (Clean Light Theme) */
        <div className="no-print bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3.5">Roll & Student Name</th>
                  <th className="px-4 py-3.5">Class & Div</th>
                  <th className="px-4 py-3.5 text-center">Marks Obtained</th>
                  <th className="px-4 py-3.5 text-center">Percentage</th>
                  <th className="px-4 py-3.5 text-center">Grade</th>
                  <th className="px-4 py-3.5 text-center">Rank</th>
                  <th className="px-4 py-3.5 text-center">Attendance</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReportCards.map((item) => {
                  const s = item.student;
                  const summary = item.summary;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center justify-center shrink-0">
                            {s.roll_number || '•'}
                          </span>
                          <div>
                            <div className="font-extrabold text-slate-900 leading-tight">
                              {s.first_name} {s.last_name || ''}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {s.admission_number}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-700 font-semibold">
                        {s.school_class?.name || 'Class 10'} - {s.section?.name || 'Div A'}
                      </td>

                      <td className="px-4 py-3 text-center font-bold text-slate-900">
                        {summary.total_marks_obtained} <span className="text-slate-400 font-normal">/ {summary.total_max_marks}</span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="font-extrabold text-emerald-700 text-xs">
                          {summary.percentage}%
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-md border text-[10px] ${getGradeBadge(summary.overall_grade)}`}>
                          {summary.overall_grade}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center font-extrabold text-slate-800">
                        #{summary.division_rank}
                      </td>

                      <td className="px-4 py-3 text-center text-slate-600 font-medium text-[11px]">
                        {summary.attendance_percentage}% ({summary.present_days}/{summary.working_days}d)
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          summary.result_status === 'DISTINCTION'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : summary.result_status === 'PASSED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {summary.result_status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewStudentCard(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                            title="Preview Full Report Card"
                          >
                            <LuEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadSinglePdf(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                            title="Download PDF"
                          >
                            <LuDownload className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePrint(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                            title="Print Card"
                          >
                            <LuPrinter className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditMarksModal(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition cursor-pointer"
                            title="Edit Marks"
                          >
                            <LuPencil className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FULL-SCREEN A4 REPORT CARD PREVIEW MODAL (Screen Only - Does not trap or interfere with print) */}
      {previewStudentCard && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full my-4 overflow-hidden animate-scale-up flex flex-col max-h-[95vh]">
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 text-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold shadow-2xs">
                  <LuAward className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base leading-tight text-slate-900">
                      Report Card: {previewStudentCard.student.first_name} {previewStudentCard.student.last_name || ''}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      CBSE A4 Standard
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {previewStudentCard.student.school_class?.name || 'Class 10'} &bull; Roll #{previewStudentCard.student.roll_number} &bull; {previewStudentCard.examination?.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadSinglePdf(previewStudentCard)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <LuDownload className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => handlePrint(previewStudentCard)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <LuPrinter className="w-4 h-4 text-slate-600" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setPreviewStudentCard(null)}
                  className="w-9 h-9 rounded-xl hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  <LuX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Displays the exact A4 sheet on screen */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70 flex justify-center">
              {renderReportCardSheet(previewStudentCard)}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Official A4 Institutional Format &bull; Ready for High-Resolution Print & PDF Generation
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrint(previewStudentCard)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition cursor-pointer flex items-center gap-1.5"
                >
                  <LuPrinter className="w-4 h-4" />
                  <span>Print Copy</span>
                </button>
                <button
                  onClick={() => setPreviewStudentCard(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED PRINT CONTAINER (Pure Unconstrained A4 Sheet for Print & PDF) */}
      <div className="print-only-container hidden print:block">
        {previewStudentCard ? (
          <div className="print-sheet-wrapper">
            {renderReportCardSheet(previewStudentCard)}
          </div>
        ) : (
          filteredReportCards.map((card, idx) => (
            <div
              key={card.student.id}
              className={`print-sheet-wrapper ${idx < filteredReportCards.length - 1 ? 'print-page-break' : ''}`}
            >
              {renderReportCardSheet(card)}
            </div>
          ))
        )}
      </div>

      {/* EDIT MARKS MODAL (Clean Light Theme) */}
      {editingStudentMarks && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full my-4 overflow-hidden animate-scale-up">
            <div className="bg-slate-50 border-b border-slate-200 p-4 text-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                  <LuPencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Edit Marks: {editingStudentMarks.student.first_name} {editingStudentMarks.student.last_name || ''}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Roll #{editingStudentMarks.student.roll_number} • {editingStudentMarks.examination?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingStudentMarks(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMarksSubmit} className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Subject</th>
                      <th className="p-2.5 text-center">Theory (80)</th>
                      <th className="p-2.5 text-center">Practical (20)</th>
                      <th className="p-2.5 text-center">Total (100)</th>
                      <th className="p-2.5 text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {editingStudentMarks.marks.map((row, idx) => (
                      <tr key={row.subject_id} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-bold text-slate-800">{row.subject_name}</td>
                        <td className="p-2.5 text-center">
                          <input
                            type="number"
                            min="0"
                            max="80"
                            value={row.theory_marks}
                            onChange={(e) => handleMarkChange(idx, 'theory_marks', e.target.value)}
                            className="w-16 px-2 py-1 bg-slate-50 border border-slate-300 rounded text-center font-bold focus:bg-white focus:border-emerald-500 focus:outline-none"
                          />
                        </td>
                        <td className="p-2.5 text-center">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            value={row.practical_marks}
                            onChange={(e) => handleMarkChange(idx, 'practical_marks', e.target.value)}
                            className="w-16 px-2 py-1 bg-slate-50 border border-slate-300 rounded text-center font-bold focus:bg-white focus:border-emerald-500 focus:outline-none"
                          />
                        </td>
                        <td className="p-2.5 text-center font-black text-slate-900 text-sm">
                          {row.marks_obtained}
                        </td>
                        <td className="p-2.5 text-center font-black text-emerald-800 text-sm">
                          {row.grade}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Class Teacher Remarks
                </label>
                <textarea
                  rows="2"
                  value={editingStudentMarks.teacher_remarks}
                  onChange={(e) => setEditingStudentMarks({ ...editingStudentMarks, teacher_remarks: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Principal Remarks
                </label>
                <input
                  type="text"
                  value={editingStudentMarks.principal_remarks}
                  onChange={(e) => setEditingStudentMarks({ ...editingStudentMarks, principal_remarks: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudentMarks(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingMarks}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submittingMarks ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuCheck className="w-4 h-4" />}
                  <span>Save Marks</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
