import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  LuGraduationCap,
  LuCalendarDays,
  LuLock,
  LuLockOpen,
  LuCircleCheck,
  LuCircleAlert,
  LuPlus,
  LuTrash2,
  LuSend,
  LuFileSpreadsheet,
  LuAward,
  LuUsers,
  LuLayers,
} from 'react-icons/lu';

export default function AdminExaminationsPage() {
  const { currentRole } = useAuth();
  const isPrincipal = currentRole === 'principal';
  const [activeTab, setActiveTab] = useState('terms'); // terms, allocations, grading, electives
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Data states
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [scales, setScales] = useState([]);
  const [assignments, setAssignments] = useState([]);

  // Modals
  const [showTermModal, setShowTermModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [unlockReason, setUnlockReason] = useState('');

  // Form states
  const [termForm, setTermForm] = useState({
    name: '',
    code: '',
    term_type: 'term',
    weightage_percentage: '',
    grading_scale_id: '',
    start_date: '',
    end_date: '',
    description: '',
  });

  const [examForm, setExamForm] = useState({
    exam_term_id: '',
    school_class_id: '',
    section_id: '',
    subject_id: '',
    exam_date: '',
    start_time: '09:00',
    end_time: '12:00',
    room: 'Hall A',
    max_marks: '100',
    pass_marks: '35',
  });

  const showToast = (msg, isErr = false) => {
    setNotification({ msg, isErr });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [termsRes, classesRes, subjectsRes, teachersRes, scalesRes, assignRes] = await Promise.all([
        api.get('/admin/exams/terms').catch(() => ({ data: { data: [] } })),
        api.get('/academic/classes').catch(() => ({ data: { data: [] } })),
        api.get('/academic/subjects').catch(() => ({ data: { data: [] } })),
        api.get('/teachers').catch(() => ({ data: { data: [] } })),
        api.get('/admin/grading-scales').catch(() => ({ data: { data: [] } })),
        api.get('/admin/teacher-assignments').catch(() => ({ data: { data: [] } })),
      ]);

      setTerms(termsRes.data?.data || []);
      setClasses(classesRes.data?.data || []);
      setSubjects(subjectsRes.data?.data || []);
      setTeachers(teachersRes.data?.data || []);
      setScales(scalesRes.data?.data || []);
      setAssignments(assignRes.data?.data || []);
    } catch (e) {
      showToast('Error loading examination data', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTerm = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/exams/terms', termForm);
      showToast('Exam term created successfully.');
      setShowTermModal(false);
      setTermForm({ name: '', code: '', term_type: 'term', weightage_percentage: '', grading_scale_id: '', start_date: '', end_date: '', description: '' });
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create term.', true);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/exams/schedules', examForm);
      showToast('Exam paper scheduled successfully.');
      setShowScheduleModal(false);
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to schedule exam paper.', true);
    }
  };

  const handleLockExam = async (examId) => {
    try {
      await api.post(`/admin/exams/${examId}/lock`);
      showToast('Exam paper locked. Marks are now finalized.');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to lock exam.', true);
    }
  };

  const handleUnlockExam = async () => {
    if (!unlockReason.trim()) {
      showToast('Unlock reason is required.', true);
      return;
    }
    try {
      await api.post(`/admin/exams/${selectedExamId}/unlock`, { reason: unlockReason });
      showToast('Exam unlocked for corrections.');
      setShowUnlockModal(false);
      setSelectedExamId(null);
      setUnlockReason('');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to unlock exam.', true);
    }
  };

  const handlePublishTerm = async (termId) => {
    if (!window.confirm('Are you sure you want to publish results for this term? This will freeze report card grades and make results visible on the student portal.')) return;
    try {
      const res = await api.post(`/admin/exams/terms/${termId}/publish`);
      showToast(res.data?.message || 'Results published successfully.');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to publish term results.', true);
    }
  };

  const handleBroadcast = async (termId) => {
    try {
      const res = await api.post(`/admin/exams/terms/${termId}/broadcast`);
      showToast('Result notification circular broadcast drafted successfully.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to broadcast notification.', true);
    }
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div className={`p-4 rounded-xl text-sm font-medium border flex items-center justify-between ${notification.isErr ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
          <span>{notification.msg}</span>
          <button onClick={() => setNotification(null)} className="text-xs uppercase font-bold underline">Dismiss</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <LuGraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-gray-900 leading-tight">
              Examinations & Academic Assessment
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
              Configure examination sessions, date sheet schedules, grading scales, teacher allocations, and portal publication
            </p>
          </div>
        </div>
        {!isPrincipal && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowTermModal(true)}
              className="px-4 py-2 sm:py-2.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <LuPlus className="w-4 h-4" />
              <span>New Exam Term</span>
            </button>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-2 sm:py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <LuCalendarDays className="w-4 h-4" />
              <span>Schedule Paper</span>
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-gray-200/80 pb-2 overflow-x-auto scrollbar-none">
        {[
          { key: 'terms', label: 'Terms & Date Sheets', icon: LuCalendarDays },
          { key: 'allocations', label: 'Teacher Subject Allocations', icon: LuUsers },
          { key: 'grading', label: 'Grading Scales & Tiers', icon: LuAward },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-1.5 sm:py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? 'bg-primary-50 text-primary-700 font-bold border border-primary-200/60 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.key ? 'text-primary-600' : 'text-gray-400'}`} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Terms & Date Sheets */}
      {activeTab === 'terms' && (
        <div className="space-y-6">
          {terms.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <LuCalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">No Examination Terms Scheduled</h3>
              <p className="text-xs text-slate-400 mt-1">Create an examination term to begin scheduling date sheet papers.</p>
            </div>
          ) : (
            terms.map((t) => (
              <div key={t.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900">{t.name}</h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-800">
                        Weightage: {t.weightage_percentage}%
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${t.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        Status: {t.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Scale: {t.grading_scale?.name || 'Default'} | {t.exams?.length || 0} Scheduled Papers</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isPrincipal && (
                      t.status !== 'published' ? (
                        <button
                          onClick={() => handlePublishTerm(t.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                        >
                          <LuCircleCheck className="w-3.5 h-3.5" />
                          Publish Results
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBroadcast(t.id)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                        >
                          <LuSend className="w-3.5 h-3.5" />
                          Send Notification
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Exam Papers Table */}
                <div className="p-4 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase">
                        <th className="py-2.5 px-3">Subject</th>
                        <th className="py-2.5 px-3">Class & Section</th>
                        <th className="py-2.5 px-3">Date & Time</th>
                        <th className="py-2.5 px-3 text-right">Max Marks</th>
                        <th className="py-2.5 px-3 text-right">Pass Marks</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(t.exams || []).map((ex) => (
                        <tr key={ex.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-semibold text-slate-800">{ex.subject?.name}</td>
                          <td className="py-3 px-3 text-slate-600">{ex.school_class?.name} - {ex.section?.name}</td>
                          <td className="py-3 px-3 text-slate-600">{ex.exam_date} ({ex.start_time || '09:00'} - {ex.end_time || '12:00'})</td>
                          <td className="py-3 px-3 text-right font-medium text-slate-800">{ex.max_marks}</td>
                          <td className="py-3 px-3 text-right text-slate-600">{ex.pass_marks}</td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${ex.status === 'locked' ? 'bg-slate-900 text-white' : (ex.status === 'submitted' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800')}`}>
                              {ex.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {!isPrincipal ? (
                              ex.status === 'locked' ? (
                                <button
                                  onClick={() => { setSelectedExamId(ex.id); setShowUnlockModal(true); }}
                                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[11px] font-semibold inline-flex items-center gap-1"
                                >
                                  <LuLockOpen className="w-3 h-3" />
                                  Unlock
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleLockExam(ex.id)}
                                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-semibold inline-flex items-center gap-1"
                                >
                                  <LuLock className="w-3 h-3" />
                                  Lock
                                </button>
                              )
                            ) : (
                              <span className="text-[10px] text-slate-400 italic font-semibold">
                                {ex.status.toUpperCase()}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Teacher Allocations */}
      {activeTab === 'allocations' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Assigned Subject Teachers</h2>
            <p className="text-xs text-slate-500">Only assigned teachers can input marks on the scoresheet.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <th className="py-2 px-3">Class</th>
                  <th className="py-2 px-3">Section</th>
                  <th className="py-2 px-3">Subject</th>
                  <th className="py-2 px-3">Assigned Teacher</th>
                  <th className="py-2 px-3">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{a.school_class?.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{a.section?.name}</td>
                    <td className="py-2.5 px-3 text-slate-700">{a.subject?.name}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{a.teacher?.first_name} {a.teacher?.last_name}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700">{a.role.toUpperCase()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Grading Scales */}
      {activeTab === 'grading' && (
        <div className="space-y-4">
          {scales.map((sc) => (
            <div key={sc.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{sc.name}</h3>
                  <p className="text-xs text-slate-400">{sc.description || 'Validated gapless grading scale'}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${sc.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                  {sc.is_active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                {(sc.tiers || []).map((tr) => (
                  <div key={tr.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-sm font-bold text-indigo-700">{tr.grade}</div>
                    <div className="text-[10px] text-slate-600 font-medium">{tr.min_percentage}% - {tr.max_percentage}%</div>
                    <div className="text-[9px] text-slate-400">GPA: {tr.grade_point}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: New Term */}
      {showTermModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Create New Examination Term</h2>
            <form onSubmit={handleCreateTerm} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Term Name *</label>
                <input
                  type="text"
                  required
                  value={termForm.name}
                  onChange={(e) => setTermForm({ ...termForm, name: e.target.value })}
                  placeholder="e.g. Term 1 (Mid-Term)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Term Code</label>
                  <input
                    type="text"
                    value={termForm.code}
                    onChange={(e) => setTermForm({ ...termForm, code: e.target.value })}
                    placeholder="TERM-1"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Weightage (%) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={termForm.weightage_percentage}
                    onChange={(e) => setTermForm({ ...termForm, weightage_percentage: e.target.value })}
                    placeholder="e.g. 50"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Grading Scale *</label>
                <select
                  required
                  value={termForm.grading_scale_id}
                  onChange={(e) => setTermForm({ ...termForm, grading_scale_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none bg-white"
                >
                  <option value="">Select Grading Scale</option>
                  {scales.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowTermModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold">Create Term</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Schedule Paper */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Schedule Examination Paper</h2>
            <form onSubmit={handleCreateExam} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Term *</label>
                <select
                  required
                  value={examForm.exam_term_id}
                  onChange={(e) => setExamForm({ ...examForm, exam_term_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none bg-white"
                >
                  <option value="">Select Term</option>
                  {terms.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Class *</label>
                  <select
                    required
                    value={examForm.school_class_id}
                    onChange={(e) => setExamForm({ ...examForm, school_class_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none bg-white"
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Section *</label>
                  <select
                    required
                    value={examForm.section_id}
                    onChange={(e) => setExamForm({ ...examForm, section_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none bg-white"
                  >
                    <option value="">Select Section</option>
                    {(classes.find((c) => String(c.id) === String(examForm.school_class_id))?.sections || []).map((sec) => (
                      <option key={sec.id} value={sec.id}>{sec.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
                <select
                  required
                  value={examForm.subject_id}
                  onChange={(e) => setExamForm({ ...examForm, subject_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none bg-white"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={examForm.exam_date}
                    onChange={(e) => setExamForm({ ...examForm, exam_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Marks *</label>
                  <input
                    type="number"
                    required
                    value={examForm.max_marks}
                    onChange={(e) => setExamForm({ ...examForm, max_marks: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pass Marks *</label>
                  <input
                    type="number"
                    required
                    value={examForm.pass_marks}
                    onChange={(e) => setExamForm({ ...examForm, pass_marks: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowScheduleModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold">Schedule Paper</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Audited Unlock */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <LuLockOpen className="w-5 h-5 text-amber-600" />
              Unlock Exam Paper
            </h2>
            <p className="text-xs text-slate-500">
              Unlocking allows teachers to edit marks. A mandatory audited reason must be provided and will be permanently stored in the system audit trail.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unlock Reason *</label>
              <textarea
                required
                rows={3}
                value={unlockReason}
                onChange={(e) => setUnlockReason(e.target.value)}
                placeholder="e.g. Scrutiny correction requested by Principal for Student ID 10"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowUnlockModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
              <button onClick={handleUnlockExam} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold">Confirm Unlock</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
