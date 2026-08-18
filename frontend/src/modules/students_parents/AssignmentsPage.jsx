import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
} from 'react-icons/lu';

const initialAssignmentsData = [
  {
    id: 'ASN-01',
    classId: '10-A',
    className: 'Grade 10-A',
    subject: 'Mathematics',
    title: 'Quadratic Equations Board Problem Set 4.2',
    teacher: 'Dr. Ananya Sen',
    assignedDate: 'Aug 14, 2026',
    dueDate: 'Tomorrow (Aug 18, 2026 at 5:00 PM)',
    maxMarks: '25 Marks',
    status: 'Pending',
    priority: 'High',
    submissionsCount: '28 / 32 Submitted',
    instructions: 'Solve all word problems from Section 4.2. Show step-by-step discriminant calculation and root determinations. Upload handwritten solution PDF.',
    attachment: 'Quadratic_Problem_Set_4.2.pdf',
  },
  {
    id: 'ASN-02',
    classId: '10-A',
    className: 'Grade 10-A',
    subject: 'English Core',
    title: 'Analytical Essay: "Impact of Artificial Intelligence on Society"',
    teacher: 'Ms. Sunita Rao',
    assignedDate: 'Aug 12, 2026',
    dueDate: 'Aug 21, 2026 at 11:59 PM',
    maxMarks: '20 Marks',
    status: 'Pending',
    priority: 'Medium',
    submissionsCount: '24 / 32 Submitted',
    instructions: 'Write a well-structured discursive essay of 250-300 words discussing positive transformation vs. ethical risks of AI in education and job markets.',
    attachment: 'Essay_Writing_Rubrics.pdf',
  },
  {
    id: 'ASN-03',
    classId: '10-B',
    className: 'Grade 10-B',
    subject: 'Mathematics',
    title: 'Trigonometric Identities & Proofs Worksheet 1',
    teacher: 'Dr. Ananya Sen',
    assignedDate: 'Aug 15, 2026',
    dueDate: 'Aug 22, 2026 at 4:00 PM',
    maxMarks: '30 Marks',
    status: 'Pending',
    priority: 'High',
    submissionsCount: '19 / 30 Submitted',
    instructions: 'Prove all 12 trigonometric identity problems given in the worksheet. Use standard identities sin²θ + cos²θ = 1.',
    attachment: 'Trig_Identities_Worksheet.pdf',
  },
  {
    id: 'ASN-04',
    classId: '10-A',
    className: 'Grade 10-A',
    subject: 'Science (Physics)',
    title: 'Ray Optics Reflection Practical File & Viva Notes',
    teacher: 'Mr. Vikram Rathore',
    assignedDate: 'Aug 08, 2026',
    dueDate: 'Aug 15, 2026',
    maxMarks: '20 Marks',
    status: 'Graded',
    priority: 'Medium',
    submissionsCount: '32 / 32 Graded',
    score: '19 / 20 (Grade A+)',
    teacherFeedback: 'Excellent ray diagrams with precise focal measurements. Viva answers were very thorough.',
    submittedDate: 'Aug 14, 2026',
    submittedFile: 'Kabir_Sharma_Physics_Practical.pdf',
  },
  {
    id: 'ASN-05',
    classId: '9-A',
    className: 'Grade 9-A',
    subject: 'Mathematics',
    title: 'Polynomials Division Algorithm & Remainder Theorem',
    teacher: 'Dr. Ananya Sen',
    assignedDate: 'Aug 10, 2026',
    dueDate: 'Aug 16, 2026',
    maxMarks: '15 Marks',
    status: 'Graded',
    priority: 'Normal',
    submissionsCount: '29 / 29 Graded',
    score: '15 / 15 (Grade A+)',
    teacherFeedback: 'All polynomial long division steps accurately verified.',
    submittedDate: 'Aug 15, 2026',
    submittedFile: 'Grade9_Polynomials.pdf',
  },
];

export default function AssignmentsPage() {
  const navigate = useNavigate();
  const { currentRole } = useAuth();
  const [assignments, setAssignments] = useState(initialAssignmentsData);
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Student submission modal state
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submissionRemarks, setSubmissionRemarks] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // New Assignment Form State
  const [newClassId, setNewClassId] = useState('10-A');
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newMaxMarks, setNewMaxMarks] = useState('25');
  const [newPriority, setNewPriority] = useState('High');
  const [newInstructions, setNewInstructions] = useState('');
  const [newAttachmentName, setNewAttachmentName] = useState('');

  // Filtered list based on Class, Subject and Status
  const filteredAssignments = assignments.filter((asn) => {
    const matchesClass = selectedClassFilter === 'ALL' || asn.classId === selectedClassFilter;
    const matchesSubject =
      selectedSubjectFilter === 'ALL' ||
      asn.subject.toLowerCase().includes(selectedSubjectFilter.toLowerCase());
    const matchesStatus = statusFilter === 'All' || asn.status === statusFilter;
    return matchesClass && matchesSubject && matchesStatus;
  });

  const handleOpenSubmit = (asn) => {
    setSelectedAssignment(asn);
    setSubmissionFile(null);
    setSubmissionRemarks('');
    setSubmittedSuccess(false);
  };

  const handleSubmitAssignment = (e) => {
    e.preventDefault();
    setSubmittedSuccess(true);
    setTimeout(() => {
      setSelectedAssignment(null);
      setSubmittedSuccess(false);
    }, 1800);
  };

  const handleCreateAssignment = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const classNamesMap = {
      '10-A': 'Grade 10-A',
      '10-B': 'Grade 10-B',
      '9-A': 'Grade 9-A',
      '9-B': 'Grade 9-B',
    };

    const newAsn = {
      id: `ASN-0${assignments.length + 1}`,
      classId: newClassId,
      className: classNamesMap[newClassId] || `Grade ${newClassId}`,
      subject: newSubject,
      title: newTitle,
      teacher: 'Dr. Ananya Sen (You)',
      assignedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      dueDate: newDueDate || 'In 7 Days',
      maxMarks: `${newMaxMarks} Marks`,
      status: 'Pending',
      priority: newPriority,
      submissionsCount: `0 / ${newClassId === '10-A' ? 32 : 30} Submitted`,
      instructions: newInstructions || 'Complete all questions thoroughly and upload your scanned solution file before the deadline.',
      attachment: newAttachmentName || 'Assignment_Task_Details.pdf',
    };

    setAssignments((prev) => [newAsn, ...prev]);
    setShowAddModal(false);
    setNewTitle('');
    setNewInstructions('');
    setNewAttachmentName('');
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3500);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 flex items-center gap-3 px-5 py-3.5 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-600/20 animate-fade-in-up">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <LuCheckCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold">New Assignment Created</p>
            <p className="text-xs text-emerald-100">Assigned and published to students</p>
          </div>
        </div>
      )}

      {/* Header */}
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
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">
                Classroom Management
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Create, track submissions, and evaluate coursework across your classes
            </p>
          </div>
        </div>

        {/* Add Assignment Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 self-start sm:self-auto"
        >
          <LuPlus className="w-4 h-4" />
          Create New Assignment
        </button>
      </div>

      {/* Filter & Toolbar Controls */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Class & Subject Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Class Selector Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 shrink-0 flex items-center gap-1.5">
              <LuFilter className="w-3.5 h-3.5 text-primary-600" />
              Class:
            </span>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="h-10 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all cursor-pointer"
            >
              <option value="ALL">All Classes</option>
              <option value="10-A">Grade 10 - Section A</option>
              <option value="10-B">Grade 10 - Section B</option>
              <option value="9-A">Grade 9 - Section A</option>
              <option value="9-B">Grade 9 - Section B</option>
            </select>
          </div>

          {/* Subject Selector Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 shrink-0 flex items-center gap-1.5">
              <LuBookOpen className="w-3.5 h-3.5 text-primary-600" />
              Subject:
            </span>
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="h-10 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all cursor-pointer"
            >
              <option value="ALL">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="English">English</option>
              <option value="Social Science">Social Science</option>
              <option value="Computer Applications">Computer Applications</option>
            </select>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
          {['All', 'Pending', 'Graded'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab
                  ? 'bg-gray-900 text-white shadow-2xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab === 'All' ? 'All Status' : tab === 'Pending' ? 'Active / Pending' : 'Graded & Closed'}
            </button>
          ))}
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((asn) => (
            <div
              key={asn.id}
              className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-2xs hover:border-gray-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-primary-50 text-primary-700">
                      {asn.className}
                    </span>
                    <span className="text-xs font-bold text-gray-700">• {asn.subject}</span>
                    <span className="text-[10px] font-mono text-gray-400">({asn.id})</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      Max: {asn.maxMarks}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900">{asn.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Assigned by: <strong className="text-gray-800">{asn.teacher}</strong> • Assigned on: {asn.assignedDate}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-lg ${
                      asn.status === 'Pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200/70'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                    }`}
                  >
                    {asn.status === 'Pending' ? 'Active Assignment' : 'Graded & Evaluated'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-600 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 my-3.5 leading-relaxed">
                {asn.instructions}
              </p>

              {/* Submissions & Attachment Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs mb-3.5">
                {asn.attachment && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium">Assignment Sheet:</span>
                    <button className="text-primary-600 hover:text-primary-800 font-bold inline-flex items-center gap-1">
                      <LuDownload className="w-3.5 h-3.5" /> {asn.attachment}
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 bg-gray-100/70 px-3 py-1 rounded-lg text-gray-700 font-semibold">
                  <LuUsers className="w-3.5 h-3.5 text-gray-500" />
                  <span>Submissions: <strong className="text-primary-700">{asn.submissionsCount}</strong></span>
                </div>
              </div>

              {asn.status === 'Graded' && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 mb-3.5 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-emerald-800">Score Awarded: {asn.score}</span>
                    <span className="text-gray-500 text-[11px]">Submitted: {asn.submittedDate}</span>
                  </div>
                  <p className="text-emerald-700 italic">Teacher Feedback: "{asn.teacherFeedback}"</p>
                </div>
              )}

              <div className="pt-3.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-gray-500 flex items-center gap-1.5 font-medium">
                  <LuClock className="w-4 h-4 text-gray-400" /> Due: <strong className="text-gray-800">{asn.dueDate}</strong>
                </span>

                {asn.status === 'Pending' ? (
                  <button
                    onClick={() => handleOpenSubmit(asn)}
                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <LuUpload className="w-3.5 h-3.5" /> Submit Solution
                  </button>
                ) : (
                  <button className="text-gray-700 hover:text-primary-600 font-bold inline-flex items-center gap-1">
                    <LuFileText className="w-3.5 h-3.5" /> View Submission File
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-gray-200/80 text-center text-gray-400 text-sm">
            No assignments found for the selected class and status filters.
          </div>
        )}
      </div>

      {/* Modal: Create New Assignment */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs"
            onClick={() => setShowAddModal(false)}
          />

          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden animate-fade-in-up">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <LuClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Create New Assignment</h2>
                  <p className="text-xs text-gray-500">Assign coursework to a specific class</p>
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
            <form onSubmit={handleCreateAssignment} className="p-6 space-y-4">
              {/* Select Target Class & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Target Class & Section <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newClassId}
                    onChange={(e) => setNewClassId(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer"
                  >
                    <option value="10-A">Grade 10 - Section A</option>
                    <option value="10-B">Grade 10 - Section B</option>
                    <option value="9-A">Grade 9 - Section A</option>
                    <option value="9-B">Grade 9 - Section B</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science (Physics/Chem/Bio)</option>
                    <option value="English Core">English Core</option>
                    <option value="Social Science">Social Science</option>
                    <option value="Computer Applications">Computer Applications</option>
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
                  placeholder="E.g., Chapter 5 Trigonometry Problem Set 5.1"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-xl text-xs text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                />
              </div>

              {/* Due Date & Max Marks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Due Date</label>
                  <input
                    type="text"
                    placeholder="E.g. Aug 25, 2026 at 5:00 PM"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl text-xs text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Max Marks</label>
                  <input
                    type="number"
                    value={newMaxMarks}
                    onChange={(e) => setNewMaxMarks(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl text-xs text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">
                  Instructions & Guidelines
                </label>
                <textarea
                  rows="3"
                  placeholder="Detail what students need to complete, submission format, and steps..."
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl text-xs text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none"
                />
              </div>

              {/* Attachment Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Attachment File Name (Optional)</label>
                <input
                  type="text"
                  placeholder="E.g., Trig_Worksheet_Ch5.pdf"
                  value={newAttachmentName}
                  onChange={(e) => setNewAttachmentName(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-xl text-xs text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-md flex items-center gap-1.5"
                >
                  <LuPlus className="w-3.5 h-3.5" />
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Student Submission */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold text-primary-600">{selectedAssignment.subject} • {selectedAssignment.className}</span>
                <h3 className="text-base font-bold text-gray-800">{selectedAssignment.title}</h3>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {submittedSuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <LuCheck className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-gray-800">Assignment Submitted Successfully!</h4>
                <p className="text-xs text-gray-500">Your solution file has been sent to {selectedAssignment.teacher}.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitAssignment} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Upload Solution Document (PDF, Word or Images)
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary-400 transition-colors cursor-pointer">
                    <LuUpload className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                    <p className="text-xs font-medium text-gray-700">Click to browse or drag and drop file here</p>
                    <p className="text-[11px] text-gray-400 mt-1">Maximum file size: 25 MB</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Student Notes / Remarks for Teacher (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={submissionRemarks}
                    onChange={(e) => setSubmissionRemarks(e.target.value)}
                    placeholder="e.g. Solved all 10 problems with rough working on page 4..."
                    className="w-full p-3 rounded-lg border border-gray-200 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setSelectedAssignment(null)}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <LuSend className="w-3.5 h-3.5" /> Submit Assignment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
