import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import {
  LuClipboardList,
  LuArrowLeft,
  LuClock,
  LuCircleCheck,
  LuUpload,
  LuFileText,
  LuSend,
  LuDownload,
  LuX,
  LuCheck,
  LuPlus,
  LuFilter,
  LuCheckCheck,
  LuUsers,
  LuCalendar,
  LuSparkles,
  LuBookOpen,
  LuLoader,
  LuPaperclip,
  LuImage,
  LuEye,
  LuAward,
  LuMessageSquare,
  LuShieldAlert,
  LuFolderCheck,
} from 'react-icons/lu';

const STANDARD_CLASSES = [
  'Class 10', 'Class 9', 'Class 8', 'Class 7', 'Class 6',
  'Class 5', 'Class 4', 'Class 3', 'Class 2', 'Class 1',
  'UKG', 'LKG', 'Nursery', 'Class 11', 'Class 12'
];

const STANDARD_SUBJECTS = [
  'Mathematics',
  'Science',
  'English Core',
  'Social Science',
  'Computer Applications',
  'Hindi',
  'Physics',
  'Chemistry',
  'Biology',
  'General'
];

export default function AssignmentsPage() {
  const navigate = useNavigate();
  const { currentRole, user } = useAuth();
  const isTeacherOrAdmin = currentRole === 'teacher' || currentRole === 'admin';

  const [assignments, setAssignments] = useState([]);
  const [classesList, setClassesList] = useState(STANDARD_CLASSES);
  const [loading, setLoading] = useState(true);
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Modal: Create New Assignment
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formClass, setFormClass] = useState('Class 10');
  const [formSubject, setFormSubject] = useState('Mathematics');
  const [formTitle, setFormTitle] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formDueTime, setFormDueTime] = useState('17:00');
  const [formMaxMarks, setFormMaxMarks] = useState('25');
  const [formPriority, setFormPriority] = useState('High');
  const [formDescription, setFormDescription] = useState('');
  const [formFile, setFormFile] = useState(null);
  const fileInputRef = useRef(null);

  // Modal: Student Submission
  const [selectedAssignmentForSubmit, setSelectedAssignmentForSubmit] = useState(null);
  const [submittingWork, setSubmittingWork] = useState(false);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submissionRemarks, setSubmissionRemarks] = useState('');
  const studentFileInputRef = useRef(null);

  // Modal: Submissions Roster & Evaluation (Teacher)
  const [rosterAssignment, setRosterAssignment] = useState(null);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterData, setRosterData] = useState([]);
  const [rosterSummary, setRosterSummary] = useState({ total: 0, submitted: 0, graded: 0, pending: 0 });
  const [gradingStudent, setGradingStudent] = useState(null); // student being evaluated
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [savingGrade, setSavingGrade] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAssignments({
        school_class_id: selectedClassFilter,
        subject: selectedSubjectFilter,
        status: statusFilter,
        search: searchQuery,
      });
      if (res.success) {
        setAssignments(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [selectedClassFilter, selectedSubjectFilter, statusFilter]);

  useEffect(() => {
    // Attempt to load live academic classes if available
    adminService.getClasses().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setClassesList(res.data.map((c) => c.name));
      }
    }).catch(() => {});
  }, []);

  // Handle Assignment Creation
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setCreating(true);
    try {
      const formData = new FormData();
      formData.append('title', formTitle);
      formData.append('school_class_id', formClass);
      formData.append('subject_name', formSubject);
      formData.append('due_date', formDueDate);
      formData.append('due_time', formDueTime);
      formData.append('max_marks', formMaxMarks);
      formData.append('priority', formPriority);
      formData.append('description', formDescription);
      if (formFile) {
        formData.append('attachment', formFile);
      }

      const res = await adminService.createAssignment(formData);
      if (res.success) {
        showToast('Assignment published! Notification sent to all students in ' + formClass);
        setShowAddModal(false);
        setFormTitle('');
        setFormDescription('');
        setFormDueDate('');
        setFormFile(null);
        loadAssignments();
      }
    } catch (err) {
      showToast(err.data?.message || 'Failed to create assignment.');
    } finally {
      setCreating(false);
    }
  };

  // Handle Student Homework Submission
  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!selectedAssignmentForSubmit) return;

    setSubmittingWork(true);
    try {
      const formData = new FormData();
      formData.append('submission_text', submissionRemarks);
      if (submissionFile) {
        formData.append('attachment', submissionFile);
      }

      const res = await adminService.submitAssignment(selectedAssignmentForSubmit.id, formData);
      if (res.success) {
        showToast('Assignment work submitted successfully to teacher!');
        setSelectedAssignmentForSubmit(null);
        setSubmissionFile(null);
        setSubmissionRemarks('');
        loadAssignments();
      }
    } catch (err) {
      showToast(err.data?.message || 'Failed to submit assignment.');
    } finally {
      setSubmittingWork(false);
    }
  };

  // Open Submissions Roster Modal (Teacher View)
  const handleOpenRoster = async (asn) => {
    setRosterAssignment(asn);
    setRosterLoading(true);
    setGradingStudent(null);
    try {
      const res = await adminService.getAssignmentSubmissions(asn.id);
      if (res.success) {
        setRosterData(res.data || []);
        if (res.summary) setRosterSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to load roster:', err);
    } finally {
      setRosterLoading(false);
    }
  };

  // Open Grading Drawer for a specific student submission
  const handleStartGrading = (studentItem) => {
    setGradingStudent(studentItem);
    setGradeScore(studentItem.score !== null ? String(studentItem.score) : '');
    setGradeFeedback(studentItem.teacher_feedback || '');
  };

  // Save Evaluated Grade
  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!gradingStudent || !rosterAssignment) return;

    setSavingGrade(true);
    try {
      const res = await adminService.gradeAssignmentSubmission(
        rosterAssignment.id,
        gradingStudent.submission_id,
        {
          score: parseInt(gradeScore, 10),
          teacher_feedback: gradeFeedback,
        }
      );
      if (res.success) {
        showToast(`Grade awarded to ${gradingStudent.student_name}!`);
        setGradingStudent(null);
        // Refresh submissions roster
        handleOpenRoster(rosterAssignment);
        loadAssignments();
      }
    } catch (err) {
      showToast(err.data?.message || 'Failed to save grade.');
    } finally {
      setSavingGrade(false);
    }
  };

  const filteredAssignments = assignments.filter((asn) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      asn.title.toLowerCase().includes(q) ||
      (asn.subject && asn.subject.toLowerCase().includes(q)) ||
      (asn.class_name && asn.class_name.toLowerCase().includes(q)) ||
      (asn.description && asn.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 animate-scale-up">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <LuCircleCheck className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <LuArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">Assignments & Homework</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-100">
                {isTeacherOrAdmin ? 'Teacher Classroom Hub' : 'Student Coursework'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {isTeacherOrAdmin
                ? 'Publish homework, attach PDF worksheets/photos, and evaluate student submissions'
                : 'View assigned coursework, download question papers, and submit your homework online'}
            </p>
          </div>
        </div>

        {/* Action Button: Teacher Create Assignment */}
        {isTeacherOrAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-primary-500/20 hover:-translate-y-0.5 self-start sm:self-auto shrink-0"
          >
            <LuPlus className="w-4 h-4" />
            Create New Assignment
          </button>
        )}
      </div>

      {/* Filter & Toolbar Controls */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Class & Subject Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Class Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 shrink-0 flex items-center gap-1.5">
              <LuFilter className="w-3.5 h-3.5 text-primary-600" />
              Class:
            </span>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="h-9 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all cursor-pointer"
            >
              <option value="ALL">All Classes</option>
              {classesList.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 shrink-0 flex items-center gap-1.5">
              <LuBookOpen className="w-3.5 h-3.5 text-primary-600" />
              Subject:
            </span>
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="h-9 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all cursor-pointer"
            >
              <option value="ALL">All Subjects</option>
              {STANDARD_SUBJECTS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
          {['All', 'Active', 'Closed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab === 'All' ? 'All Assignments' : tab === 'Active' ? 'Active Homework' : 'Completed / Graded'}
            </button>
          ))}
        </div>
      </div>

      {/* Assignments List */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-200/80 p-16 text-center shadow-xs">
          <LuLoader className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
          <p className="text-xs text-gray-500 font-medium">Loading assignments & coursework roster...</p>
        </div>
      ) : filteredAssignments.length > 0 ? (
        <div className="space-y-4">
          {filteredAssignments.map((asn) => {
            const hasMySubmission = !isTeacherOrAdmin && asn.my_submission;
            const isGraded = hasMySubmission && asn.my_submission.status === 'Graded';

            return (
              <div
                key={asn.id}
                className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs hover:border-gray-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-primary-50 text-primary-700">
                        {asn.class_name}
                      </span>
                      <span className="text-xs font-bold text-gray-700">• {asn.subject}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        Max: {asn.max_marks}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          asn.priority === 'High'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {asn.priority} Priority
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900">{asn.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Assigned by: <strong className="text-gray-800">{asn.teacher}</strong> • Assigned on: {asn.assigned_date}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-lg ${
                        asn.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}
                    >
                      {asn.status === 'Active' ? 'Active' : 'Closed'}
                    </span>
                  </div>
                </div>

                {asn.description && (
                  <p className="text-xs text-gray-600 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 my-3.5 leading-relaxed">
                    {asn.description}
                  </p>
                )}

                {/* Submissions & Attachment Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs mb-3.5">
                  {asn.attachment_url ? (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-medium">Attachment / Worksheet:</span>
                      <a
                        href={asn.attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary-600 hover:text-primary-800 font-bold inline-flex items-center gap-1 bg-primary-50 px-3 py-1 rounded-lg border border-primary-100 hover:underline"
                      >
                        {asn.attachment_type === 'image' ? (
                          <LuImage className="w-3.5 h-3.5" />
                        ) : (
                          <LuFileText className="w-3.5 h-3.5" />
                        )}
                        <span>{asn.attachment || 'View Attached Worksheet'}</span>
                        <LuDownload className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic text-[11px]">No file attached</span>
                  )}

                  {/* Submission Statistics */}
                  {isTeacherOrAdmin ? (
                    <div className="flex items-center gap-2 bg-indigo-50/80 border border-indigo-100 px-3 py-1.5 rounded-xl text-indigo-900 font-semibold">
                      <LuUsers className="w-3.5 h-3.5 text-indigo-600" />
                      <span>
                        Submissions: <strong className="text-indigo-700">{asn.submissions_count}</strong>
                        {asn.graded_count > 0 && ` (${asn.graded_count} Graded)`}
                      </span>
                    </div>
                  ) : (
                    hasMySubmission && (
                      <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                        Status: {asn.my_submission.status}
                      </span>
                    )
                  )}
                </div>

                {/* Student Score / Feedback Card if graded */}
                {isGraded && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-100 mb-3.5 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                        <LuAward className="w-4 h-4 text-emerald-600" />
                        Score Awarded: {asn.my_submission.score} / {asn.max_marks_num} Marks
                      </span>
                      <span className="text-gray-500 text-[11px]">Submitted: {asn.my_submission.submitted_at}</span>
                    </div>
                    {asn.my_submission.teacher_feedback && (
                      <p className="text-emerald-700 mt-1 italic">
                        Teacher Feedback: "{asn.my_submission.teacher_feedback}"
                      </p>
                    )}
                  </div>
                )}

                {/* Bottom Footer Actions */}
                <div className="pt-3.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-gray-500 flex items-center gap-1.5 font-medium">
                    <LuClock className="w-4 h-4 text-gray-400" /> Due Date: <strong className="text-gray-800">{asn.due_date}</strong>
                  </span>

                  {isTeacherOrAdmin ? (
                    <button
                      onClick={() => handleOpenRoster(asn)}
                      className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-md shadow-primary-500/20 hover:-translate-y-0.5"
                    >
                      <LuFolderCheck className="w-4 h-4" /> View Submissions & Grade ({asn.submitted_count})
                    </button>
                  ) : hasMySubmission ? (
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <LuCircleCheck className="w-4 h-4" /> Homework Submitted
                      </span>
                      {asn.my_submission.attachment_url && (
                        <a
                          href={asn.my_submission.attachment_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary-600 hover:underline font-bold text-xs"
                        >
                          View My Solution File
                        </a>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedAssignmentForSubmit(asn)}
                      className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-md shadow-primary-500/20 hover:-translate-y-0.5"
                    >
                      <LuUpload className="w-3.5 h-3.5" /> Submit Homework Solution
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-gray-200/80 text-center text-gray-400 text-sm">
          No assignments found matching the selected class and subject filters.
        </div>
      )}

      {/* MODAL 1: Create New Assignment (Teacher View) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs"
            onClick={() => setShowAddModal(false)}
          />

          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl relative z-10 overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <LuClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Create New Assignment</h2>
                  <p className="text-xs text-gray-500">Assign coursework & worksheets with PDF/Photo attachments</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateAssignment} className="p-6 space-y-4 overflow-y-auto">
              {/* Select Target Class & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Target Class <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer"
                  >
                    {classesList.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Subject</label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer"
                  >
                    {STANDARD_SUBJECTS.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Assignment Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">
                  Assignment Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4 Quadratic Equations Problem Set 4.2"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-xl text-xs text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-medium"
                />
              </div>

              {/* Due Date, Max Marks & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl text-xs text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Max Marks</label>
                  <input
                    type="number"
                    value={formMaxMarks}
                    onChange={(e) => setFormMaxMarks(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl text-xs text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {/* Description / Instructions */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Instructions & Guidelines</label>
                <textarea
                  rows={3}
                  placeholder="Detail questions to solve, steps to show, submission formatting..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl text-xs text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none font-medium"
                />
              </div>

              {/* Attachment Uploader (PDF or Photo) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">
                  Attach Worksheet / Document (PDF or Photo)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                  onChange={(e) => setFormFile(e.target.files[0] || null)}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className="border-2 border-dashed border-gray-200 hover:border-primary-400 bg-gray-50/50 hover:bg-primary-50/30 rounded-2xl p-4 text-center cursor-pointer transition-colors"
                >
                  {formFile ? (
                    <div className="flex items-center justify-center gap-2 text-primary-700 font-semibold text-xs">
                      <LuFileText className="w-5 h-5 text-primary-600" />
                      <span>{formFile.name} ({(formFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormFile(null);
                        }}
                        className="p-1 hover:bg-rose-100 rounded-full text-rose-500 ml-2"
                      >
                        <LuX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <LuUpload className="w-6 h-6 text-primary-600 mx-auto mb-1.5" />
                      <p className="text-xs font-bold text-gray-700">
                        Click to upload Worksheet PDF or Photo
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Supports PDF, PNG, JPG up to 10 MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800 transition-all shadow-md shadow-primary-500/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {creating ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuPlus className="w-4 h-4" />}
                  {creating ? 'Publishing...' : 'Publish & Notify Students'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Student Homework Submission */}
      {selectedAssignmentForSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs"
            onClick={() => setSelectedAssignmentForSubmit(null)}
          />

          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden animate-scale-up p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold text-primary-600">
                  {selectedAssignmentForSubmit.subject} • {selectedAssignmentForSubmit.class_name}
                </span>
                <h3 className="text-base font-bold text-gray-900">{selectedAssignmentForSubmit.title}</h3>
              </div>
              <button
                onClick={() => setSelectedAssignmentForSubmit(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Upload Solution File (PDF or Photo)
                </label>
                <input
                  type="file"
                  ref={studentFileInputRef}
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                  onChange={(e) => setSubmissionFile(e.target.files[0] || null)}
                  className="hidden"
                />

                <div
                  onClick={() => studentFileInputRef.current && studentFileInputRef.current.click()}
                  className="border-2 border-dashed border-gray-200 hover:border-primary-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-primary-50/20"
                >
                  {submissionFile ? (
                    <div className="flex items-center justify-center gap-2 text-primary-700 font-semibold text-xs">
                      <LuFileText className="w-6 h-6 text-primary-600" />
                      <span>{submissionFile.name}</span>
                    </div>
                  ) : (
                    <div>
                      <LuUpload className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                      <p className="text-xs font-bold text-gray-800">
                        Click to browse or drop your completed solution
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">PDF, JPG or PNG format (Max 10 MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Student Notes / Remarks (Optional)
                </label>
                <textarea
                  rows={3}
                  value={submissionRemarks}
                  onChange={(e) => setSubmissionRemarks(e.target.value)}
                  placeholder="e.g., Completed all 10 problems with step-by-step proofs on page 3..."
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedAssignmentForSubmit(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWork}
                  className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-primary-500/20 disabled:opacity-50"
                >
                  {submittingWork ? <LuLoader className="w-3.5 h-3.5 animate-spin" /> : <LuSend className="w-3.5 h-3.5" />}
                  {submittingWork ? 'Submitting...' : 'Submit Homework'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Submissions Roster & Evaluation (Teacher View) */}
      {rosterAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs"
            onClick={() => setRosterAssignment(null)}
          />

          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl relative z-10 overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <LuUsers className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary-50 text-primary-700">
                      {rosterAssignment.class_name}
                    </span>
                    <span className="text-xs font-bold text-gray-500">• {rosterAssignment.subject}</span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mt-0.5">{rosterAssignment.title}</h2>
                </div>
              </div>
              <button
                onClick={() => setRosterAssignment(null)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 border-b border-gray-100 bg-white shrink-0">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Enrolled</div>
                <div className="text-xl font-black text-slate-800 mt-1">{rosterSummary.total} Students</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-100">
                <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Submitted</div>
                <div className="text-xl font-black text-emerald-700 mt-1">{rosterSummary.submitted} Submissions</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-100">
                <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Graded</div>
                <div className="text-xl font-black text-indigo-700 mt-1">{rosterSummary.graded} Evaluated</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-100">
                <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Pending</div>
                <div className="text-xl font-black text-amber-700 mt-1">{rosterSummary.pending} Not Turned In</div>
              </div>
            </div>

            {/* Student Submissions Table */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* If Grading Drawer is open for a student */}
              {gradingStudent && (
                <form
                  onSubmit={handleSaveGrade}
                  className="p-5 rounded-2xl bg-primary-50/50 border border-primary-100 space-y-3 animate-fade-in"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-primary-900 flex items-center gap-2">
                      <LuAward className="w-4 h-4 text-primary-600" />
                      Evaluating Submission: <span className="font-extrabold">{gradingStudent.student_name}</span> (Roll #{gradingStudent.roll_number})
                    </h4>
                    <button
                      type="button"
                      onClick={() => setGradingStudent(null)}
                      className="text-xs font-semibold text-gray-500 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Award Score (Out of {rosterAssignment.max_marks_num || 100})
                      </label>
                      <input
                        type="number"
                        required
                        max={rosterAssignment.max_marks_num || 100}
                        min={0}
                        value={gradeScore}
                        onChange={(e) => setGradeScore(e.target.value)}
                        placeholder="e.g. 24"
                        className="w-full h-9 px-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 bg-white focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Feedback / Remarks to Student
                      </label>
                      <input
                        type="text"
                        value={gradeFeedback}
                        onChange={(e) => setGradeFeedback(e.target.value)}
                        placeholder="e.g., Excellent proofs and neat diagrams. Keep it up!"
                        className="w-full h-9 px-3 border border-gray-200 rounded-xl text-xs text-gray-800 bg-white focus:outline-none focus:border-primary-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={savingGrade}
                      className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {savingGrade ? <LuLoader className="w-3.5 h-3.5 animate-spin" /> : <LuCircleCheck className="w-3.5 h-3.5" />}
                      {savingGrade ? 'Saving...' : 'Save Grade & Feedback'}
                    </button>
                  </div>
                </form>
              )}

              {rosterLoading ? (
                <div className="py-12 text-center">
                  <LuLoader className="w-6 h-6 animate-spin text-primary-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 font-medium">Fetching class roster...</p>
                </div>
              ) : rosterData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/80 text-gray-500 text-[11px] uppercase tracking-wider border-b border-gray-100">
                        <th className="p-3.5 font-bold">Roll / Student</th>
                        <th className="p-3.5 font-bold">Status</th>
                        <th className="p-3.5 font-bold">Submitted File</th>
                        <th className="p-3.5 font-bold">Score</th>
                        <th className="p-3.5 font-bold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {rosterData.map((item) => (
                        <tr key={item.student_id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="p-3.5 font-medium">
                            <div className="font-bold text-gray-900">{item.student_name}</div>
                            <div className="text-[11px] text-gray-400">
                              Roll #{item.roll_number || '-'} • Adm: {item.admission_number}
                            </div>
                          </td>

                          <td className="p-3.5 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                item.status === 'Graded'
                                  ? 'bg-indigo-50 text-indigo-700'
                                  : item.status === 'Submitted'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : item.status === 'Late'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {item.status}
                            </span>
                            {item.submitted_at && (
                              <div className="text-[10px] text-gray-400 mt-0.5">{item.submitted_at}</div>
                            )}
                          </td>

                          <td className="p-3.5">
                            {item.attachment_url ? (
                              <a
                                href={item.attachment_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary-600 hover:underline font-bold inline-flex items-center gap-1 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-100 text-xs"
                              >
                                <LuPaperclip className="w-3 h-3" />
                                <span>{item.attachment_name || 'View Solution'}</span>
                              </a>
                            ) : item.submission_text ? (
                              <span className="text-gray-600 italic truncate max-w-xs block" title={item.submission_text}>
                                "{item.submission_text}"
                              </span>
                            ) : (
                              <span className="text-gray-400 italic text-[11px]">No submission file</span>
                            )}
                          </td>

                          <td className="p-3.5 whitespace-nowrap">
                            {item.score !== null ? (
                              <div>
                                <span className="font-extrabold text-emerald-700">
                                  {item.score} / {item.max_marks}
                                </span>
                                {item.teacher_feedback && (
                                  <div className="text-[10px] text-gray-500 truncate max-w-xs" title={item.teacher_feedback}>
                                    "{item.teacher_feedback}"
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>

                          <td className="p-3.5 text-right whitespace-nowrap">
                            {item.status !== 'Pending' ? (
                              <button
                                onClick={() => handleStartGrading(item)}
                                className="px-3 py-1.5 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold text-xs border border-primary-200 transition-colors"
                              >
                                {item.score !== null ? 'Re-Evaluate' : 'Grade Solution'}
                              </button>
                            ) : (
                              <span className="text-gray-400 text-[11px] italic">Awaiting Turn-in</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400 text-xs">
                  No enrolled students found for {rosterAssignment.class_name}.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
