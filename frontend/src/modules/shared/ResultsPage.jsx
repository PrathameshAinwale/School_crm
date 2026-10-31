import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  LuAward,
  LuFileText,
  LuDownload,
  LuFileSpreadsheet,
  LuCircleCheck,
  LuCircleAlert,
  LuUsers,
  LuGraduationCap,
  LuTrendingUp,
  LuPercent,
  LuCalendar,
  LuFolderArchive,
  LuFilter,
} from 'react-icons/lu';

const API_BASE_URL =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:8000/api/v1'
    : import.meta.env.VITE_API_URL || 'https://powderblue-trout-993647.hostingersite.com/api/v1';

export default function ResultsPage() {
  const { currentRole, user } = useAuth();
  const isParent = currentRole === 'student_parent';
  const isAdminOrTeacher = !isParent;

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Parent State
  const [parentData, setParentData] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedTermSummary, setSelectedTermSummary] = useState(null);

  // Admin / Teacher Analytics State
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedTermId, setSelectedTermId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [classSummaries, setClassSummaries] = useState([]);

  // Bulk ZIP generation state
  const [bulkGenerating, setBulkGenerating] = useState(false);

  const showToast = (msg, isErr = false) => {
    setNotification({ msg, isErr });
    setTimeout(() => setNotification(null), 4000);
  };

  // -------------------------------------------------------------
  // Parent Flow: Load Results & Child List
  // -------------------------------------------------------------
  const loadParentResults = async (studentId = '') => {
    setLoading(true);
    try {
      const url = studentId ? `/student/results?student_id=${studentId}` : '/student/results';
      const res = await api.get(url);
      const data = res.data || res;
      setParentData(data);

      if (data.results && data.results.length > 0) {
        setSelectedTermSummary(data.results[0]);
      } else {
        setSelectedTermSummary(null);
      }

      if (data.student?.id && !selectedStudentId) {
        setSelectedStudentId(String(data.student.id));
      }
    } catch (err) {
      showToast(err.message || 'Failed to load examination results', true);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Admin / Teacher Flow: Load Filter Options & Analytics
  // -------------------------------------------------------------
  const loadFilterOptions = async () => {
    try {
      const [termsRes, classesRes] = await Promise.all([
        api.get('/admin/exams/terms').catch(() => ({ data: [] })),
        api.get('/academic/classes').catch(() => ({ data: [] })),
      ]);

      const termList = termsRes.data?.data || termsRes.data || [];
      const classList = classesRes.data?.data || classesRes.data || [];

      setTerms(termList);
      setClasses(classList);

      if (termList.length > 0) setSelectedTermId(String(termList[0].id));
      if (classList.length > 0) setSelectedClassId(String(classList[0].id));
    } catch (err) {
      showToast('Failed to load examination filter options', true);
    }
  };

  const loadClassAnalytics = async () => {
    if (!selectedTermId || !selectedClassId) return;
    setLoading(true);
    try {
      const params = {
        exam_term_id: selectedTermId,
        school_class_id: selectedClassId,
      };
      if (selectedSectionId) params.section_id = selectedSectionId;

      const res = await api.get('/exams/analytics/class-summary', { params });
      const data = res.data || res;
      setAnalytics(data.analytics || null);
      setClassSummaries(data.summaries || []);
    } catch (err) {
      setAnalytics(null);
      setClassSummaries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isParent) {
      loadParentResults();
    } else {
      loadFilterOptions();
    }
  }, [isParent]);

  useEffect(() => {
    if (isAdminOrTeacher && selectedTermId && selectedClassId) {
      loadClassAnalytics();
    }
  }, [selectedTermId, selectedClassId, selectedSectionId]);

  // Handle Child Switch
  const handleChildChange = (id) => {
    setSelectedStudentId(id);
    loadParentResults(id);
  };

  // Download Report Card PDF helper
  const handleDownloadPdf = async (termId, studentId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const activeSchoolId = localStorage.getItem('active_school_id');
      const activeAcademicYearId = localStorage.getItem('active_academic_year_id');

      const res = await fetch(
        `${API_BASE_URL}/student/results/report-card/${termId}/pdf?student_id=${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(activeSchoolId ? { 'X-School-Id': activeSchoolId } : {}),
            ...(activeAcademicYearId ? { 'X-Academic-Year-Id': activeAcademicYearId } : {}),
          },
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to download report card');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_card_student_${studentId}_term_${termId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast('Report card downloaded successfully.');
    } catch (err) {
      showToast(err.message || 'Failed to download report card', true);
    }
  };

  // Export CSV
  const handleExportCsv = async () => {
    if (!selectedTermId || !selectedClassId) return;
    try {
      const token = localStorage.getItem('auth_token');
      const activeSchoolId = localStorage.getItem('active_school_id');
      const activeAcademicYearId = localStorage.getItem('active_academic_year_id');

      let url = `${API_BASE_URL}/exams/analytics/export-csv?term_id=${selectedTermId}&school_class_id=${selectedClassId}`;
      if (selectedSectionId) url += `&section_id=${selectedSectionId}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...(activeSchoolId ? { 'X-School-Id': activeSchoolId } : {}),
          ...(activeAcademicYearId ? { 'X-Academic-Year-Id': activeAcademicYearId } : {}),
        },
      });

      if (!res.ok) throw new Error('Failed to export CSV marksheet');

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `marksheet_term_${selectedTermId}_class_${selectedClassId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
      showToast('CSV marksheet exported.');
    } catch (err) {
      showToast(err.message || 'Error exporting CSV', true);
    }
  };

  // Admin Bulk Generate Report Cards
  const handleBulkGenerate = async () => {
    if (!selectedTermId || !selectedClassId) return;
    setBulkGenerating(true);
    try {
      const res = await api.post('/admin/exams/reports/bulk-generate', {
        exam_term_id: selectedTermId,
        school_class_id: selectedClassId,
        section_id: selectedSectionId || null,
      });

      const token = res.data?.token || res.token;
      if (token) {
        showToast('Bulk ZIP generated. Starting download...');
        const downloadUrl = `${API_BASE_URL}/admin/exams/reports/download-zip/${token}`;
        window.open(downloadUrl, '_blank');
      } else {
        showToast('Bulk generation completed.');
      }
    } catch (err) {
      showToast(err.message || 'Failed to generate bulk report cards', true);
    } finally {
      setBulkGenerating(false);
    }
  };

  const selectedClass = classes.find((c) => String(c.id) === String(selectedClassId));

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-10">
      {/* Toast Alert */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2 text-sm transition-all ${
            notification.isErr
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {notification.isErr ? <LuCircleAlert className="w-5 h-5 shrink-0" /> : <LuCircleCheck className="w-5 h-5 shrink-0" />}
          <span className="font-medium">{notification.msg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <LuAward className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-gray-900 leading-tight">
              {isParent ? 'Academic Examination Results' : 'Academic Performance & Results'}
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
              {isParent
                ? 'Official term assessment summaries and verified report cards'
                : 'Class-wide scoresheets, ranking analytics and marksheet exports'}
            </p>
          </div>
        </div>

        {/* Multi-Child Selector for Parents */}
        {isParent && parentData?.accessible_students?.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Select Child:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => handleChildChange(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {parentData.accessible_students.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name} ({child.class}-{child.section})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PARENT / STUDENT VIEW */}
      {/* ------------------------------------------------------------- */}
      {isParent && (
        <div className="space-y-6">
          {parentData?.student && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-base">
                  {parentData.student.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{parentData.student.name}</h2>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span>Adm: <strong>{parentData.student.admission_number}</strong></span>
                    <span>&bull;</span>
                    <span>Roll: <strong>{parentData.student.roll_number || 'N/A'}</strong></span>
                    <span>&bull;</span>
                    <span>Class: <strong>{parentData.student.class} - {parentData.student.section}</strong></span>
                  </div>
                </div>
              </div>

              {selectedTermSummary && (
                <button
                  onClick={() => handleDownloadPdf(selectedTermSummary.exam_term_id, parentData.student.id)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
                >
                  <LuDownload className="w-4 h-4" /> Download Official Report Card (PDF)
                </button>
              )}
            </div>
          )}

          {/* Published Term Selector Tabs */}
          {parentData?.results && parentData.results.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {parentData.results.map((resItem) => {
                  const isSelected = selectedTermSummary?.id === resItem.id;
                  return (
                    <button
                      key={resItem.id}
                      onClick={() => setSelectedTermSummary(resItem)}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {resItem.exam_term?.name || 'Term'} &bull; {resItem.overall_grade || 'Grade'}
                    </button>
                  );
                })}
              </div>

              {selectedTermSummary && (
                <div className="space-y-5">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-xs font-semibold text-slate-500 uppercase">Score / Percentage</span>
                      <div className="text-xl font-bold text-slate-900 mt-1">
                        {selectedTermSummary.total_obtained_marks} / {selectedTermSummary.total_max_marks}
                      </div>
                      <span className="text-xs font-bold text-indigo-600">{selectedTermSummary.percentage}%</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-xs font-semibold text-slate-500 uppercase">Overall Grade</span>
                      <div className="text-xl font-bold text-slate-900 mt-1">
                        {selectedTermSummary.overall_grade || 'N/A'}
                      </div>
                      <span className="text-xs text-slate-500">GPA: {selectedTermSummary.overall_gpa || 'N/A'}</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-xs font-semibold text-slate-500 uppercase">Rankings</span>
                      <div className="text-xl font-bold text-slate-900 mt-1">
                        Rank #{selectedTermSummary.class_rank || '-'}
                      </div>
                      <span className="text-xs text-slate-500">Section Rank #{selectedTermSummary.section_rank || '-'}</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-xs font-semibold text-slate-500 uppercase">Result Status</span>
                      <div className="mt-1">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            selectedTermSummary.result_status === 'PASSED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : selectedTermSummary.result_status === 'RESULT_PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {selectedTermSummary.result_status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 block">Verified &amp; Published</span>
                    </div>
                  </div>

                  {/* Subject Breakdown Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-slate-100">
                      <h3 className="text-sm font-bold text-slate-900">Subject-wise Assessment Breakdown</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                            <th className="py-3 px-4">Subject</th>
                            <th className="py-3 px-4">Marks Obtained</th>
                            <th className="py-3 px-4">Max Marks</th>
                            <th className="py-3 px-4">Pass Marks</th>
                            <th className="py-3 px-4">Grade</th>
                            <th className="py-3 px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(selectedTermSummary.subject_marks || []).map((sub, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/70">
                              <td className="py-3 px-4 font-semibold text-slate-900">{sub.subject_name}</td>
                              <td className="py-3 px-4 font-mono font-bold text-slate-800">
                                {sub.special_status ? (
                                  <span className="text-amber-600">{sub.special_status}</span>
                                ) : (
                                  sub.marks_obtained ?? '-'
                                )}
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-500">{sub.max_marks}</td>
                              <td className="py-3 px-4 font-mono text-slate-500">{sub.pass_marks}</td>
                              <td className="py-3 px-4 font-bold text-indigo-600">{sub.grade || '-'}</td>
                              <td className="py-3 px-4">
                                {sub.special_status ? (
                                  <span className="text-xs font-semibold text-slate-500">{sub.special_status}</span>
                                ) : sub.is_passed ? (
                                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-700">PASS</span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700">FAIL</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Teacher Holistic Remarks */}
                  {selectedTermSummary.teacher_remarks && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Class Teacher Remarks:
                      </span>
                      <p className="text-xs text-slate-600 italic">
                        &ldquo;{selectedTermSummary.teacher_remarks}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
              <LuAward className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Published Examination Results</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Examination results for current terms are either undergoing assessment or have not been officially published by administration.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ADMIN & TEACHER VIEW: ANALYTICS & CLASS MARKSHEET */}
      {/* ------------------------------------------------------------- */}
      {isAdminOrTeacher && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Exam Term</label>
                <select
                  value={selectedTermId}
                  onChange={(e) => setSelectedTermId(e.target.value)}
                  className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none"
                >
                  {terms.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Class</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value);
                    setSelectedSectionId('');
                  }}
                  className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Section (Optional)</label>
                <select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none"
                >
                  <option value="">All Sections</option>
                  {(selectedClass?.sections || []).map((sec) => (
                    <option key={sec.id} value={sec.id}>{sec.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Export & Bulk Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCsv}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <LuFileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export CSV
              </button>

              {currentRole === 'admin' && (
                <button
                  onClick={handleBulkGenerate}
                  disabled={bulkGenerating}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <LuFolderArchive className="w-4 h-4" />
                  {bulkGenerating ? 'Generating...' : 'Bulk Report Cards ZIP'}
                </button>
              )}
            </div>
          </div>

          {/* Analytics KPI Cards */}
          {analytics && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 uppercase">Assessed Students</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">{analytics.total_students}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 uppercase">Pass Rate</span>
                <div className="text-2xl font-bold text-emerald-600 mt-1">{analytics.pass_rate}%</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 uppercase">Average %</span>
                <div className="text-2xl font-bold text-indigo-600 mt-1">{analytics.average_percentage}%</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 uppercase">Passed</span>
                <div className="text-2xl font-bold text-emerald-600 mt-1">{analytics.passed}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 uppercase">Failed / Pending</span>
                <div className="text-2xl font-bold text-rose-600 mt-1">
                  {analytics.failed} <span className="text-xs text-amber-600 font-semibold">({analytics.pending} pending)</span>
                </div>
              </div>
            </div>
          )}

          {/* Class Marksheet Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Class Performance &amp; Marksheet Roster</h3>
              <span className="text-xs text-slate-500">Ranking method: Standard Competition (1, 2, 2, 4)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Roll</th>
                    <th className="py-3 px-4">Adm #</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Section</th>
                    <th className="py-3 px-4">Total Marks</th>
                    <th className="py-3 px-4">Percentage</th>
                    <th className="py-3 px-4">Grade</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Report Card</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classSummaries.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                        {item.class_rank ? `#${item.class_rank}` : '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">{item.student?.roll_number || '-'}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{item.student?.admission_number}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {item.student?.first_name} {item.student?.last_name || ''}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{item.section?.name || '-'}</td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">
                        {item.total_obtained_marks} / {item.total_max_marks}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{item.percentage}%</td>
                      <td className="py-3 px-4 font-bold text-indigo-600">{item.overall_grade || '-'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            item.result_status === 'PASSED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.result_status === 'RESULT_PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.result_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDownloadPdf(item.exam_term_id, item.student_id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          title="Download Student Report Card (PDF)"
                        >
                          <LuDownload className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {classSummaries.length === 0 && (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400">
                        No examination records found for the selected term and class filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}