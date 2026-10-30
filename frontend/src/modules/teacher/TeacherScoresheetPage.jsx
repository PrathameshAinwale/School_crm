import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  LuClipboardList,
  LuFileSpreadsheet,
  LuCircleCheck,
  LuCircleAlert,
  LuLock,
  LuLockOpen,
  LuSave,
  LuSend,
  LuUserCheck,
  LuSearch,
  LuMessageSquare,
  LuCalendar,
  LuAward,
} from 'react-icons/lu';

export default function TeacherScoresheetPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [assignedPapers, setAssignedPapers] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [examData, setExamData] = useState(null);
  const [roster, setRoster] = useState([]);
  const [notification, setNotification] = useState(null);

  // Class teacher remarks modal state
  const [remarksModalOpen, setRemarksModalOpen] = useState(false);
  const [selectedStudentForRemarks, setSelectedStudentForRemarks] = useState(null);
  const [remarksForm, setRemarksForm] = useState({
    teacher_remarks: '',
    attendance_days_present: '',
    attendance_total_days: '',
  });

  const showToast = (msg, isErr = false) => {
    setNotification({ msg, isErr });
    setTimeout(() => setNotification(null), 4000);
  };

  // Load assigned exam papers
  const loadAssignedPapers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/teacher/scoresheets/assigned');
      const papers = res.data?.data || res.data || [];
      setAssignedPapers(papers);
      if (papers.length > 0 && !selectedExamId) {
        setSelectedExamId(String(papers[0].id));
      }
    } catch (err) {
      showToast(err.message || 'Failed to load assigned papers', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignedPapers();
  }, []);

  // Load roster and marks when paper is selected
  const loadExamRoster = async (examId) => {
    if (!examId) return;
    setLoading(true);
    try {
      const res = await api.get(`/teacher/scoresheets/${examId}`);
      const data = res.data || res;
      setExamData(data.exam || null);
      setRoster(data.roster || []);
    } catch (err) {
      showToast(err.message || 'Failed to load student roster', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedExamId) {
      loadExamRoster(selectedExamId);
    }
  }, [selectedExamId]);

  const handleMarkChange = (studentId, val) => {
    setRoster((prev) =>
      prev.map((row) => {
        if (row.student_id !== studentId) return row;
        return {
          ...row,
          marks_obtained: val,
          special_status: null, // Clear special status when entering numeric marks
        };
      })
    );
  };

  const handleSpecialStatusChange = (studentId, status) => {
    setRoster((prev) =>
      prev.map((row) => {
        if (row.student_id !== studentId) return row;
        const newStatus = row.special_status === status ? null : status;
        return {
          ...row,
          special_status: newStatus,
          marks_obtained: newStatus ? '' : row.marks_obtained,
        };
      })
    );
  };

  const handleRemarksChange = (studentId, val) => {
    setRoster((prev) =>
      prev.map((row) => (row.student_id === studentId ? { ...row, teacher_remarks: val } : row))
    );
  };

  const isLocked = examData?.status === 'locked' || examData?.status === 'verified';

  // Save Draft
  const handleSaveDraft = async () => {
    if (!selectedExamId || isLocked) return;
    setSaving(true);
    try {
      const payload = {
        marks: roster.map((r) => ({
          student_id: r.student_id,
          marks_obtained: r.marks_obtained !== '' && r.marks_obtained !== null ? Number(r.marks_obtained) : null,
          special_status: r.special_status || null,
          teacher_remarks: r.teacher_remarks || null,
        })),
      };

      await api.post(`/teacher/scoresheets/${selectedExamId}/save-draft`, payload);
      showToast('Scoresheet draft saved successfully.');
      loadExamRoster(selectedExamId);
    } catch (err) {
      showToast(err.message || 'Failed to save scoresheet draft', true);
    } finally {
      setSaving(false);
    }
  };

  // Submit for Verification
  const handleSubmitMarks = async () => {
    if (!selectedExamId || isLocked) return;

    // Check if 100% evaluated
    const unevaluated = roster.filter(
      (r) => (r.marks_obtained === '' || r.marks_obtained === null) && !r.special_status
    );

    if (unevaluated.length > 0) {
      showToast(
        `Cannot submit: ${unevaluated.length} student(s) still need marks or a special code (AB, ML, EX).`,
        true
      );
      return;
    }

    if (!window.confirm('Are you sure you want to submit this scoresheet? Once submitted, it will be sent to the administration for verification.')) {
      return;
    }

    setSaving(true);
    try {
      // First save latest inputs
      const payload = {
        marks: roster.map((r) => ({
          student_id: r.student_id,
          marks_obtained: r.marks_obtained !== '' && r.marks_obtained !== null ? Number(r.marks_obtained) : null,
          special_status: r.special_status || null,
          teacher_remarks: r.teacher_remarks || null,
        })),
      };
      await api.post(`/teacher/scoresheets/${selectedExamId}/save-draft`, payload);

      // Then submit
      await api.post(`/teacher/scoresheets/${selectedExamId}/submit`, {});
      showToast('Scoresheet submitted for verification successfully!');
      loadExamRoster(selectedExamId);
    } catch (err) {
      showToast(err.message || 'Failed to submit scoresheet', true);
    } finally {
      setSaving(false);
    }
  };

  // Class Teacher Remarks Modal handler
  const openRemarksModal = (student) => {
    setSelectedStudentForRemarks(student);
    setRemarksForm({
      teacher_remarks: student.teacher_remarks || '',
      attendance_days_present: '',
      attendance_total_days: '',
    });
    setRemarksModalOpen(true);
  };

  const handleSaveClassTeacherRemarks = async (e) => {
    e.preventDefault();
    if (!examData?.exam_term_id || !selectedStudentForRemarks) return;

    try {
      await api.post(`/teacher/remarks/${examData.exam_term_id}/${selectedStudentForRemarks.student_id}`, {
        teacher_remarks: remarksForm.teacher_remarks,
        attendance_days_present: remarksForm.attendance_days_present ? Number(remarksForm.attendance_days_present) : null,
        attendance_total_days: remarksForm.attendance_total_days ? Number(remarksForm.attendance_total_days) : null,
      });

      showToast('Class teacher remarks saved successfully.');
      setRemarksModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to save remarks', true);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
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

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <LuClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Scoresheet & Marks Entry</h1>
              <p className="text-xs text-slate-500">Record assessment scores and submit evaluations for verification</p>
            </div>
          </div>
        </div>

        {/* Paper Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Select Paper:</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {assignedPapers.length === 0 && <option value="">No exam papers assigned</option>}
            {assignedPapers.map((paper) => (
              <option key={paper.id} value={paper.id}>
                {paper.exam_term?.name || 'Term'} &bull; {paper.school_class?.name} {paper.section?.name} &bull; {paper.subject?.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Exam Information & Controls */}
      {examData && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="font-semibold text-slate-500">Term:</span>
                <span className="font-bold text-slate-900">{examData.exam_term?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="font-semibold text-slate-500">Class:</span>
                <span className="font-bold text-slate-900">{examData.school_class?.name} - {examData.section?.name}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="font-semibold text-slate-500">Subject:</span>
                <span className="font-bold text-indigo-600">{examData.subject?.name}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="font-semibold text-slate-500">Max / Pass:</span>
                <span className="font-bold text-slate-900">{examData.max_marks} / {examData.pass_marks}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="font-semibold text-slate-500">Date:</span>
                <span className="font-medium text-slate-800">{examData.exam_date || 'TBD'}</span>
              </div>
            </div>

            {/* Status Badge & Action Buttons */}
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                  examData.status === 'locked'
                    ? 'bg-emerald-100 text-emerald-800'
                    : examData.status === 'verified'
                    ? 'bg-indigo-100 text-indigo-800'
                    : examData.status === 'submitted'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {examData.status === 'locked' ? (
                  <>
                    <LuLock className="w-3.5 h-3.5" /> Locked
                  </>
                ) : (
                  <>
                    <LuCircleCheck className="w-3.5 h-3.5" /> {examData.status}
                  </>
                )}
              </span>

              {!isLocked && (
                <>
                  <button
                    onClick={handleSaveDraft}
                    disabled={saving}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1.5 transition-colors"
                  >
                    <LuSave className="w-4 h-4" /> Save Draft
                  </button>
                  <button
                    onClick={handleSubmitMarks}
                    disabled={saving}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <LuSend className="w-4 h-4" /> Submit for Verification
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Locked Notice */}
          {isLocked && (
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-2.5 text-xs text-amber-800">
              <LuLock className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                <strong>Paper Locked:</strong> Marks have been verified and permanently locked by administration. Contact an administrator to request an audited unlock.
              </span>
            </div>
          )}

          {/* Roster Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Roll</th>
                  <th className="py-3 px-4">Adm #</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4 w-36">Marks (Max {examData.max_marks})</th>
                  <th className="py-3 px-4">Special Code</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Remarks</th>
                  <th className="py-3 px-4 text-center">Class Teacher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roster.map((row) => {
                  const numMark = row.marks_obtained !== '' && row.marks_obtained !== null ? Number(row.marks_obtained) : null;
                  const isPass = numMark !== null && numMark >= Number(examData.pass_marks);

                  return (
                    <tr key={row.student_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">{row.roll_number || '-'}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{row.admission_number}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{row.name}</td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max={examData.max_marks}
                          disabled={isLocked || !!row.special_status}
                          value={row.marks_obtained ?? ''}
                          onChange={(e) => handleMarkChange(row.student_id, e.target.value)}
                          placeholder={row.special_status ? row.special_status : '0.00'}
                          className={`w-28 px-2.5 py-1.5 text-xs font-mono font-medium rounded-lg border focus:outline-none transition-all ${
                            row.special_status
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed text-center'
                              : 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500/20'
                          }`}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {['AB', 'ML', 'EX'].map((code) => {
                            const isSelected = row.special_status === code;
                            return (
                              <button
                                key={code}
                                type="button"
                                disabled={isLocked}
                                onClick={() => handleSpecialStatusChange(row.student_id, code)}
                                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                                  isSelected
                                    ? code === 'AB'
                                      ? 'bg-rose-600 text-white shadow-xs'
                                      : code === 'ML'
                                      ? 'bg-purple-600 text-white shadow-xs'
                                      : 'bg-slate-700 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                                title={
                                  code === 'AB'
                                    ? 'Absent (Result Pending)'
                                    : code === 'ML'
                                    ? 'Medical Leave (Excluded from denominator)'
                                    : 'Exempt (Excluded from denominator)'
                                }
                              >
                                {code}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {row.special_status ? (
                          <span className="font-semibold text-[11px] text-slate-500">
                            {row.special_status === 'AB' ? 'PENDING' : 'EXCLUDED'}
                          </span>
                        ) : numMark !== null ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              isPass ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {isPass ? 'PASS' : 'FAIL'}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          disabled={isLocked}
                          value={row.teacher_remarks || ''}
                          onChange={(e) => handleRemarksChange(row.student_id, e.target.value)}
                          placeholder="Feedback..."
                          className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => openRemarksModal(row)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          title="Enter Class Teacher Holistic Remarks & Attendance"
                        >
                          <LuMessageSquare className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Class Teacher Remarks Modal */}
      {remarksModalOpen && selectedStudentForRemarks && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <LuMessageSquare className="w-5 h-5 text-indigo-600" />
              Class Teacher Remarks & Attendance
            </h2>
            <p className="text-xs text-slate-500">
              Entering general term remarks for <strong>{selectedStudentForRemarks.name}</strong> ({selectedStudentForRemarks.admission_number}).
            </p>

            <form onSubmit={handleSaveClassTeacherRemarks} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Teacher Holistic Remarks</label>
                <textarea
                  rows={3}
                  value={remarksForm.teacher_remarks}
                  onChange={(e) => setRemarksForm({ ...remarksForm, teacher_remarks: e.target.value })}
                  placeholder="e.g. Excellent academic consistency, active in debates."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Days Present</label>
                  <input
                    type="number"
                    min="0"
                    value={remarksForm.attendance_days_present}
                    onChange={(e) => setRemarksForm({ ...remarksForm, attendance_days_present: e.target.value })}
                    placeholder="e.g. 88"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Days</label>
                  <input
                    type="number"
                    min="0"
                    value={remarksForm.attendance_total_days}
                    onChange={(e) => setRemarksForm({ ...remarksForm, attendance_total_days: e.target.value })}
                    placeholder="e.g. 95"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRemarksModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Save Remarks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}