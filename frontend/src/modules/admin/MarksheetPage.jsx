import React, { useState, useEffect, useMemo } from 'react';
import { marksheetService } from '../../services/marksheetService';
import {
  LuAward,
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
  LuCalendar,
  LuLayers,
  LuBuilding2,
  LuLoader,
  LuCircleCheck,
  LuCircleAlert,
  LuSparkles,
  LuTrendingUp,
  LuBookOpen,
  LuFileCheck,
  LuShieldCheck,
} from 'react-icons/lu';

export default function MarksheetPage() {
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
  const [marksheets, setMarksheets] = useState([]);
  const [stats, setStats] = useState(null);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [currentExam, setCurrentExam] = useState(null);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'distinction' | 'first' | 'second' | 'compartment' | 'failed'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [previewStudentMarksheet, setPreviewStudentMarksheet] = useState(null);
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
        const res = await marksheetService.getFilters();
        if (res.success && res.data) {
          if (res.data.academic_years) setAcademicYears(res.data.academic_years);
          if (res.data.examinations && res.data.examinations.length > 0) {
            setExaminations(res.data.examinations);
            setSelectedExamId(res.data.examinations[0].id);
          }
          if (res.data.classes) setClasses(res.data.classes);
        }
      } catch (err) {
        console.error('Failed to load marksheet filters:', err);
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

  // Primary workflow generate function
  const handleGenerateMarksheets = async () => {
    setLoading(true);
    try {
      const params = {
        academic_year: selectedAcademicYear,
        examination_id: selectedExamId || undefined,
        school_class_id: selectedClassId !== 'all' ? selectedClassId : undefined,
        section_id: selectedDivisionId !== 'all' ? selectedDivisionId : undefined,
        student_id: selectedStudentId !== 'all' ? selectedStudentId : undefined,
      };

      const res = await marksheetService.generateMarksheets(params);
      if (res.success && res.data) {
        setMarksheets(res.data.marksheets || []);
        setStats(res.data.stats || null);
        setSchoolInfo(res.data.school || null);
        setCurrentExam(res.data.examination || null);
        setInitialLoaded(true);
        showToast(`Loaded ${res.data.marksheets?.length || 0} student marksheets.`);
      }
    } catch (err) {
      console.error('Error generating marksheets:', err);
      showToast(err.message || 'Failed to generate marksheets.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate on first load when examinations are available
  useEffect(() => {
    if (selectedExamId && !initialLoaded) {
      handleGenerateMarksheets();
    }
  }, [selectedExamId, initialLoaded]);

  // Download single PDF
  const handleDownloadSinglePdf = async (item) => {
    setDownloadingSingleId(item.student.id);
    try {
      const classNameClean = item.student.school_class?.name || `Class_${item.student.school_class_id}`;
      const divNameClean = item.student.section?.name || 'A';
      const filename = `Marksheet_${classNameClean}_Div_${divNameClean}_Roll_${item.student.roll_number}_${item.student.first_name}_${item.student.last_name}.pdf`;
      await marksheetService.downloadStudentPdf(item.student.id, currentExam?.id || selectedExamId, filename);
      showToast(`Downloaded Marksheet for ${item.student.first_name} ${item.student.last_name}`);
    } catch (err) {
      console.error(err);
      showToast('Could not download marksheet PDF.');
    } finally {
      setDownloadingSingleId(null);
    }
  };

  // Download Bulk ZIP
  const handleDownloadBulkZip = async () => {
    setDownloadingZip(true);
    try {
      const params = {
        academic_year: selectedAcademicYear,
        examination_id: currentExam?.id || selectedExamId,
        school_class_id: selectedClassId !== 'all' ? selectedClassId : undefined,
        section_id: selectedDivisionId !== 'all' ? selectedDivisionId : undefined,
      };
      const zipName = `Marksheets_${currentExam?.code || 'EX'}_${selectedClassId !== 'all' ? `Class_${selectedClassId}` : 'All_Classes'}.zip`;
      await marksheetService.downloadBulkZip(params, zipName);
      showToast('Bulk marksheets archive downloaded successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to download bulk ZIP archive.');
    } finally {
      setDownloadingZip(false);
    }
  };

  // Print all generated marksheets
  const handlePrintAll = () => {
    window.print();
  };

  // Filtered marksheets based on search query & result status
  const filteredMarksheets = useMemo(() => {
    return marksheets.filter((item) => {
      const query = searchQuery.toLowerCase().trim();
      const studentName = `${item.student.first_name} ${item.student.last_name}`.toLowerCase();
      const roll = String(item.student.roll_number || '').toLowerCase();
      const adm = String(item.student.admission_number || '').toLowerCase();
      const matchesSearch = !query || studentName.includes(query) || roll.includes(query) || adm.includes(query);

      if (!matchesSearch) return false;

      if (statusFilter === 'all') return true;
      if (statusFilter === 'distinction') return item.summary.percentage >= 85;
      if (statusFilter === 'first') return item.summary.percentage >= 60 && item.summary.percentage < 85;
      if (statusFilter === 'second') return item.summary.percentage >= 45 && item.summary.percentage < 60;
      if (statusFilter === 'compartment') return item.summary.fail_subject_count === 1;
      if (statusFilter === 'failed') return item.summary.fail_subject_count > 1;

      return true;
    });
  }, [marksheets, searchQuery, statusFilter]);

  // Open Edit Marks modal
  const handleOpenEditMarks = (item) => {
    setEditingStudentMarks({
      student: item.student,
      marks: item.subject_breakdowns.map((sb) => ({
        subject_id: sb.subject_id,
        subject_name: sb.subject_name,
        subject_code: sb.subject_code,
        theory_marks: sb.theory.obtained,
        practical_marks: sb.practical.obtained,
      })),
    });
  };

  // Save updated marks
  const handleSaveMarksSubmit = async () => {
    if (!editingStudentMarks) return;
    setSubmittingMarks(true);
    try {
      await marksheetService.updateMarks({
        examination_id: currentExam?.id || selectedExamId,
        student_id: editingStudentMarks.student.id,
        marks: editingStudentMarks.marks,
      });

      showToast(`Marksheet updated for ${editingStudentMarks.student.first_name}`);
      setEditingStudentMarks(null);
      handleGenerateMarksheets();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to update marks.');
    } finally {
      setSubmittingMarks(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-white text-slate-800 px-4 py-3 rounded-xl shadow-xl border border-slate-200 animate-slide-up text-xs font-semibold">
          <LuCircleCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header (Clean Light Theme) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
            <LuAward className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
                Student Marksheet Generation Module
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold inline-flex items-center gap-1">
                <LuShieldCheck className="w-3.5 h-3.5" />
                Official Statement of Marks
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Generate authentic A4 Statement of Marks, scholastic theory & practical breakdowns, CBSE grades, division honors, and bulk ZIP archives.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handlePrintAll}
            disabled={marksheets.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            <LuPrinter className="w-4 h-4 text-slate-600" />
            <span>Print All Marksheets</span>
          </button>

          <button
            onClick={handleDownloadBulkZip}
            disabled={marksheets.length === 0 || downloadingZip}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {downloadingZip ? (
              <LuLoader className="w-4 h-4 animate-spin" />
            ) : (
              <LuDownload className="w-4 h-4" />
            )}
            <span>{downloadingZip ? 'Packing ZIP...' : 'Download All (ZIP)'}</span>
          </button>
        </div>
      </div>

      {/* Workflow Selection Bar (Clean Light Theme) */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/90">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
          <LuFilter className="w-4 h-4 text-blue-600" />
          Step-by-Step Marksheet Generation Workflow
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
          {/* Step 1: Academic Year */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              1. Academic Year
            </label>
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition"
            >
              {academicYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Examination */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              2. Examination
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition"
            >
              {examinations.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.code || ex.term})
                </option>
              ))}
            </select>
          </div>

          {/* Step 3: Class */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              3. Class (Standard)
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition"
            >
              <option value="all">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Step 4: Division */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              4. Division (Section)
            </label>
            <select
              value={selectedDivisionId}
              onChange={(e) => setSelectedDivisionId(e.target.value)}
              disabled={selectedClassId === 'all'}
              className="w-full px-3 py-2.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition disabled:opacity-50"
            >
              <option value="all">All Divisions</option>
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Generate Action Button */}
          <div>
            <button
              onClick={handleGenerateMarksheets}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <LuLoader className="w-4 h-4 animate-spin" />
              ) : (
                <LuFileCheck className="w-4 h-4" />
              )}
              <span>{loading ? 'Evaluating...' : 'Generate Marksheets'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analytics & KPI Banner (Clean Light Theme) */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Total Marksheets</div>
            <div className="text-2xl font-black text-slate-800 mt-1">{stats.total_marksheets}</div>
            <div className="text-[11px] text-blue-600 font-medium mt-0.5">Students Evaluated</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Class Average</div>
            <div className="text-2xl font-black text-blue-600 mt-1">{stats.class_average}%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Across All Subjects</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Pass Percentage</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{stats.pass_percentage}%</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
              {stats.passed_count} of {stats.total_marksheets} Passed
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Distinctions (85%+)</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{stats.distinction_count}</div>
            <div className="text-[11px] text-amber-700 font-medium mt-0.5">Grade A1 Honors</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">First Division</div>
            <div className="text-2xl font-black text-indigo-600 mt-1">{stats.first_division_count}</div>
            <div className="text-[11px] text-indigo-700 font-medium mt-0.5">Score 60% and above</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Class Topper</div>
            <div className="text-base font-extrabold text-slate-800 mt-1 truncate">
              {stats.top_scorer?.name || 'N/A'}
            </div>
            <div className="text-[11px] text-blue-600 font-bold mt-0.5">
              {stats.top_scorer?.percentage}% ({stats.top_scorer?.grade})
            </div>
          </div>
        </div>
      )}

      {/* Search, Filter & View Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <LuSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name, roll number, admission number..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="all">All Results ({marksheets.length})</option>
            <option value="distinction">Distinctions (85%+)</option>
            <option value="first">First Division (60%+)</option>
            <option value="second">Second Division (45%+)</option>
            <option value="compartment">Compartment</option>
            <option value="failed">Failed</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Certificate Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Registry Table
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <LuLoader className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Calculating Student Marksheets...</h3>
          <p className="text-sm text-slate-500 mt-1">Aggregating Theory & Practical marks, CBSE grades, and division standings.</p>
        </div>
      ) : filteredMarksheets.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <LuAward className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Marksheets Found</h3>
          <p className="text-sm text-slate-500 mt-1">Try selecting a different Academic Year, Examination, or Class from the workflow bar above.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Certificate Cards Grid View (Clean Light Theme) */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredMarksheets.map((item) => {
            const isDistinction = item.summary.percentage >= 85;
            const isFirst = item.summary.percentage >= 60;
            const isPassed = item.summary.is_passed;

            return (
              <div
                key={item.student.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between"
              >
                {/* Certificate Card Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 font-extrabold text-sm flex items-center justify-center border border-blue-200 shrink-0">
                        {item.student.first_name[0]}{item.student.last_name[0]}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">
                          {item.student.first_name} {item.student.last_name}
                        </h3>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>Roll #{item.student.roll_number}</span>
                          <span>&bull;</span>
                          <span>{item.student.school_class?.name || 'Class 10'} - {item.student.section?.name || 'A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                        Rank #{item.summary.class_rank}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scores & Performance Body */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Serial Number & CGPA Tag */}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {item.serial_no}
                    </span>
                    <span className="font-bold text-slate-700">
                      {item.summary.cgpa} CGPA
                    </span>
                  </div>

                  {/* Marks Breakdown Metric Grid */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-400">Theory</div>
                      <div className="text-sm font-extrabold text-slate-800 mt-0.5">
                        {item.summary.tot_theory_obt} <span className="text-[10px] text-slate-400 font-normal">/ {item.summary.tot_theory_max}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-400">Practical</div>
                      <div className="text-sm font-extrabold text-slate-800 mt-0.5">
                        {item.summary.tot_prac_obt} <span className="text-[10px] text-slate-400 font-normal">/ {item.summary.tot_prac_max}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-blue-600">Total</div>
                      <div className="text-sm font-black text-blue-600 mt-0.5">
                        {item.summary.total_marks_obtained} <span className="text-[10px] text-slate-400 font-normal">/ {item.summary.total_max_marks}</span>
                      </div>
                    </div>
                  </div>

                  {/* Percentage Bar & Grade */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-600">Aggregate Percentage</span>
                      <span className="font-bold text-slate-900">{item.summary.percentage}% (Grade {item.summary.overall_grade})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isDistinction ? 'bg-amber-500' : isFirst ? 'bg-blue-600' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, item.summary.percentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Result Status Badge */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-500 font-medium">Awarded Division:</span>
                    <span
                      className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                        isDistinction
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : isFirst
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : isPassed
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {item.summary.division}
                    </span>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="p-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setPreviewStudentMarksheet(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs transition cursor-pointer"
                  >
                    <LuEye className="w-3.5 h-3.5 text-blue-600" />
                    Preview
                  </button>

                  <button
                    onClick={() => handleDownloadSinglePdf(item)}
                    disabled={downloadingSingleId === item.student.id}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                  >
                    {downloadingSingleId === item.student.id ? (
                      <LuLoader className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <LuDownload className="w-3.5 h-3.5" />
                    )}
                    PDF
                  </button>

                  <button
                    onClick={() => handleOpenEditMarks(item)}
                    title="Edit Theory/Practical Marks"
                    className="p-2 bg-white hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 shadow-xs transition cursor-pointer"
                  >
                    <LuPencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Registry Table View (Clean Light Theme) */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Roll</th>
                  <th className="py-3.5 px-4">Candidate Name</th>
                  <th className="py-3.5 px-4">Class & Div</th>
                  <th className="py-3.5 px-4 text-center">Theory</th>
                  <th className="py-3.5 px-4 text-center">Practical</th>
                  <th className="py-3.5 px-4 text-center">Total Marks</th>
                  <th className="py-3.5 px-4 text-center">Percentage</th>
                  <th className="py-3.5 px-4 text-center">Grade / CGPA</th>
                  <th className="py-3.5 px-4 text-center">Awarded Division</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredMarksheets.map((item) => {
                  return (
                    <tr key={item.student.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-bold text-slate-700">
                        #{item.student.roll_number}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {item.student.first_name} {item.student.last_name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.serial_no}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {item.student.school_class?.name} - {item.student.section?.name}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-700">
                        {item.summary.tot_theory_obt}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-700">
                        {item.summary.tot_prac_obt}
                      </td>
                      <td className="py-3 px-4 text-center font-extrabold text-blue-600">
                        {item.summary.total_marks_obtained} / {item.summary.total_max_marks}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900">
                        {item.summary.percentage}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-blue-600">{item.summary.overall_grade}</span>
                        <span className="text-[10px] text-slate-400 ml-1">({item.summary.cgpa})</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            item.summary.percentage >= 85
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : item.summary.percentage >= 60
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : item.summary.is_passed
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {item.summary.division}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setPreviewStudentMarksheet(item)}
                            title="Preview Marksheet"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          >
                            <LuEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadSinglePdf(item)}
                            disabled={downloadingSingleId === item.student.id}
                            title="Download PDF"
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          >
                            <LuDownload className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditMarks(item)}
                            title="Edit Marks"
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
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

      {/* Interactive A4 Marksheet Preview Modal (Clean Light Theme) */}
      {previewStudentMarksheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 my-8 overflow-hidden animate-scale-up">
            {/* Modal Top Action Bar (Clean Light Theme) */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between text-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <LuAward className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Official Statement of Marks &bull; {previewStudentMarksheet.student.first_name} {previewStudentMarksheet.student.last_name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Serial: {previewStudentMarksheet.serial_no} &bull; {previewStudentMarksheet.student.school_class?.name || 'Class 10'} ({previewStudentMarksheet.student.section?.name || 'A'})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 shadow-xs transition cursor-pointer"
                >
                  <LuPrinter className="w-3.5 h-3.5 text-slate-600" />
                  Print
                </button>
                <button
                  onClick={() => handleDownloadSinglePdf(previewStudentMarksheet)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
                >
                  <LuDownload className="w-3.5 h-3.5" />
                  Download A4 PDF
                </button>
                <button
                  onClick={() => setPreviewStudentMarksheet(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                >
                  <LuX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Certificate Body Container */}
            <div className="p-6 sm:p-8 bg-slate-100 max-h-[80vh] overflow-y-auto">
              <div className="bg-white text-slate-900 p-8 rounded-xl shadow-md border-4 border-double border-blue-900 relative max-w-3xl mx-auto">
                {/* School Header */}
                <div className="text-center pb-4 border-b border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Affiliated to {schoolInfo?.affiliation || 'Central Board of Secondary Education (CBSE)'} &bull; Code: {schoolInfo?.code || 'DPS-101'}
                  </div>
                  <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tight mt-1">
                    {schoolInfo?.name || 'Delhi Public Academy'}
                  </h2>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {schoolInfo?.address || 'Plot 42, Institutional Area, Sector 14, New Delhi - 110001'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Tel: {schoolInfo?.phone || '+91 11 2890 1200'} &bull; Email: {schoolInfo?.email || 'contact@delhipublic.edu'}
                  </div>
                </div>

                {/* Title Banner */}
                <div className="my-4 py-2 bg-blue-900 text-white text-center rounded-md border-y-2 border-amber-400">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider">Statement of Marks</h3>
                  <div className="text-[10px] text-blue-200 font-medium">
                    {currentExam?.name?.toUpperCase() || 'PERIODIC TEST'} &bull; ACADEMIC SESSION {selectedAcademicYear}
                  </div>
                </div>

                {/* Student Info Grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs py-3 px-4 bg-slate-50 rounded-lg border border-slate-200 mb-5">
                  <div className="flex">
                    <span className="font-bold text-slate-500 w-32 uppercase text-[10px]">Candidate Name:</span>
                    <span className="font-extrabold text-blue-950 uppercase">{previewStudentMarksheet.student.first_name} {previewStudentMarksheet.student.last_name}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold text-slate-500 w-32 uppercase text-[10px]">Roll Number:</span>
                    <span className="font-bold text-slate-900">#{previewStudentMarksheet.student.roll_number}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold text-slate-500 w-32 uppercase text-[10px]">Father's Name:</span>
                    <span className="font-bold text-slate-900">{previewStudentMarksheet.student.father_name || 'Mr. Ramesh ' + previewStudentMarksheet.student.last_name}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold text-slate-500 w-32 uppercase text-[10px]">Class & Division:</span>
                    <span className="font-bold text-slate-900">{previewStudentMarksheet.student.school_class?.name || 'Class 10'} - {previewStudentMarksheet.student.section?.name || 'A'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold text-slate-500 w-32 uppercase text-[10px]">Mother's Name:</span>
                    <span className="font-bold text-slate-900">{previewStudentMarksheet.student.mother_name || 'Mrs. Sunita ' + previewStudentMarksheet.student.last_name}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold text-slate-500 w-32 uppercase text-[10px]">Admission No:</span>
                    <span className="font-bold text-slate-900">{previewStudentMarksheet.student.admission_number || 'ADM-' + previewStudentMarksheet.student.id}</span>
                  </div>
                </div>

                {/* Subject-wise Marks Table */}
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-xs border border-slate-300 border-collapse">
                    <thead>
                      <tr className="bg-blue-900 text-white text-[10px] uppercase">
                        <th className="p-2 border border-blue-950 text-left">Subject Title</th>
                        <th className="p-2 border border-blue-950 text-center">Theory (80/26)</th>
                        <th className="p-2 border border-blue-950 text-center">Practical (20/7)</th>
                        <th className="p-2 border border-blue-950 text-center">Total (100/33)</th>
                        <th className="p-2 border border-blue-950 text-center">Grade</th>
                        <th className="p-2 border border-blue-950 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {previewStudentMarksheet.subject_breakdowns.map((sb) => (
                        <tr key={sb.subject_id} className="text-center hover:bg-slate-50">
                          <td className="p-2 border border-slate-300 text-left font-bold text-slate-800">
                            {sb.subject_name}
                            <span className="text-[10px] text-slate-400 font-normal ml-2">({sb.subject_code})</span>
                          </td>
                          <td className="p-2 border border-slate-300 font-semibold">{sb.theory.obtained}</td>
                          <td className="p-2 border border-slate-300 font-semibold">{sb.practical.obtained}</td>
                          <td className="p-2 border border-slate-300 font-bold text-blue-900 bg-blue-50/50">{sb.total.obtained}</td>
                          <td className="p-2 border border-slate-300 font-bold text-blue-900">{sb.grade}</td>
                          <td className="p-2 border border-slate-300 font-bold text-emerald-600">{sb.status}</td>
                        </tr>
                      ))}
                      {/* Grand Total Row */}
                      <tr className="bg-slate-100 font-black text-slate-900 text-xs border-t-2 border-blue-900">
                        <td className="p-2 border border-slate-300 text-left">GRAND TOTAL:</td>
                        <td className="p-2 border border-slate-300">{previewStudentMarksheet.summary.tot_theory_obt}</td>
                        <td className="p-2 border border-slate-300">{previewStudentMarksheet.summary.tot_prac_obt}</td>
                        <td className="p-2 border border-slate-300 text-blue-900 text-sm">
                          {previewStudentMarksheet.summary.total_marks_obtained} / {previewStudentMarksheet.summary.total_max_marks}
                        </td>
                        <td className="p-2 border border-slate-300 text-blue-900">{previewStudentMarksheet.summary.overall_grade}</td>
                        <td className="p-2 border border-slate-300 text-emerald-600">PASSED</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Marks in words */}
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs mb-4">
                  <span className="font-bold text-slate-500 uppercase text-[10px] mr-2">Marks in Words:</span>
                  <span className="font-black text-blue-900 uppercase">
                    {previewStudentMarksheet.summary.marks_in_words} OUT OF {previewStudentMarksheet.summary.max_in_words}
                  </span>
                </div>

                {/* KPI Metrics Banner */}
                <div className="grid grid-cols-4 gap-3 text-center mb-6">
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-[10px] font-bold text-blue-600 uppercase">Percentage</div>
                    <div className="text-base font-black text-blue-950 mt-0.5">{previewStudentMarksheet.summary.percentage}%</div>
                  </div>
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-[10px] font-bold text-blue-600 uppercase">CGPA Score</div>
                    <div className="text-base font-black text-blue-950 mt-0.5">{previewStudentMarksheet.summary.cgpa}</div>
                  </div>
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="text-[10px] font-bold text-emerald-600 uppercase">Class Rank</div>
                    <div className="text-base font-black text-emerald-800 mt-0.5">Rank #{previewStudentMarksheet.summary.class_rank}</div>
                  </div>
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="text-[10px] font-bold text-amber-700 uppercase">Division</div>
                    <div className="text-xs font-black text-amber-900 mt-1 truncate">{previewStudentMarksheet.summary.division}</div>
                  </div>
                </div>

                {/* 4 Signatures Section */}
                <div className="grid grid-cols-4 gap-4 pt-6 border-t border-slate-300 text-center">
                  <div>
                    <div className="h-10"></div>
                    <div className="border-t border-slate-400 pt-1 text-[10px] font-bold text-slate-800 uppercase">Prepared By</div>
                    <div className="text-[9px] text-slate-500">Tabulator</div>
                  </div>
                  <div>
                    <div className="h-10"></div>
                    <div className="border-t border-slate-400 pt-1 text-[10px] font-bold text-slate-800 uppercase">Checked By</div>
                    <div className="text-[9px] text-slate-500">Class Teacher</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center text-[9px] font-bold text-slate-400 -mt-2">
                      SEAL
                    </div>
                    <div className="border-t border-slate-400 w-full pt-1 text-[10px] font-bold text-slate-800 uppercase">School Stamp</div>
                  </div>
                  <div>
                    <div className="h-10 font-serif italic text-blue-900 font-bold text-sm flex items-end justify-center">
                      {schoolInfo?.principal_name || 'Dr. R. Sharma'}
                    </div>
                    <div className="border-t border-slate-400 pt-1 text-[10px] font-bold text-slate-800 uppercase">Principal</div>
                    <div className="text-[9px] text-slate-500">Head of Institution</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Marks Modal (Clean Light Theme) */}
      {editingStudentMarks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 p-6 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Edit Marksheet Scores &bull; {editingStudentMarks.student.first_name} {editingStudentMarks.student.last_name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Roll #{editingStudentMarks.student.roll_number} &bull; Adjust Theory and Practical marks
                </p>
              </div>
              <button
                onClick={() => setEditingStudentMarks(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {editingStudentMarks.marks.map((row, idx) => (
                <div key={row.subject_id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-800 mb-2">
                    {row.subject_name} <span className="text-[10px] text-slate-400 font-normal">({row.subject_code})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Theory Marks (Max 80)</label>
                      <input
                        type="number"
                        min="0"
                        max="80"
                        value={row.theory_marks}
                        onChange={(e) => {
                          const val = Math.min(80, Math.max(0, Number(e.target.value) || 0));
                          const updated = [...editingStudentMarks.marks];
                          updated[idx].theory_marks = val;
                          setEditingStudentMarks({ ...editingStudentMarks, marks: updated });
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Practical Marks (Max 20)</label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={row.practical_marks}
                        onChange={(e) => {
                          const val = Math.min(20, Math.max(0, Number(e.target.value) || 0));
                          const updated = [...editingStudentMarks.marks];
                          updated[idx].practical_marks = val;
                          setEditingStudentMarks({ ...editingStudentMarks, marks: updated });
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setEditingStudentMarks(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMarksSubmit}
                disabled={submittingMarks}
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {submittingMarks ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuCheck className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
