import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentParentService } from '../../services/studentParentService';
import { adminService } from '../../services/adminService';
import {
  LuBookOpen,
  LuCircleCheck,
  LuCalendar,
  LuPlus,
  LuX,
  LuArrowLeft,
  LuSend,
  LuLoader,
  LuLayers,
  LuBuilding2,
  LuTrash2,
  LuAward,
  LuFilter,
  LuSearch,
  LuClock,
} from 'react-icons/lu';

const DEFAULT_CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12'
];

const DEFAULT_DIVISIONS = ['Div A', 'Div B', 'Div C', 'Div D'];

const STANDARD_SUBJECTS = [
  'Mathematics',
  'Science (Physics & Chemistry)',
  'Science (Biology)',
  'English Language & Literature',
  'Social Studies (History & Civics)',
  'Social Studies (Geography)',
  'Hindi / 2nd Language',
  'Computer Applications & AI',
  'General Knowledge',
  'Fine Arts & Music',
];

export default function SyllabusPage() {
  const navigate = useNavigate();
  const { user, currentRole } = useAuth();
  const isTeacherOrAdmin = currentRole === 'teacher' || currentRole === 'admin';

  // Selection state
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedDivision, setSelectedDivision] = useState('Div A');
  const [availableClasses, setAvailableClasses] = useState(DEFAULT_CLASSES);
  const [availableDivisions, setAvailableDivisions] = useState(DEFAULT_DIVISIONS);
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Completed chapters list & filters
  const [completedChapters, setCompletedChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Recording Completed Chapter
  const [showAddModal, setShowAddModal] = useState(false);
  const [formClass, setFormClass] = useState('Class 10');
  const [formDivision, setFormDivision] = useState('Div A');
  const [formSubject, setFormSubject] = useState('Mathematics');
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [customSubjectName, setCustomSubjectName] = useState('');
  const [formCompletedDate, setFormCompletedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formChapterName, setFormChapterName] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initial Load: Auto-resolve teacher's assigned class & division
  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      try {
        if (isTeacherOrAdmin) {
          const profileRes = await adminService.getTeacherProfile().catch(() => null);
          if (profileRes?.data) {
            const t = profileRes.data;
            setTeacherInfo(t);
            const defClass = t.class_teacher_class || (Array.isArray(t.assigned_classes) && t.assigned_classes[0]) || 'Class 10';
            const defDiv = t.class_teacher_division || 'Div A';
            setSelectedClass(defClass);
            setSelectedDivision(defDiv);
            setFormClass(defClass);
            setFormDivision(defDiv);
          }
        }

        const classesRes = await adminService.getClasses().catch(() => null);
        if (classesRes?.data && classesRes.data.length > 0) {
          setAvailableClasses(classesRes.data.map((c) => c.name));
        }

        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize syllabus:', err);
        setIsInitialized(true);
      }
    };

    initPage();
  }, []);

  // 2. Fetch completed syllabus chapters for selected Class & Division
  const loadCompletedChapters = async (className, division) => {
    setLoading(true);
    try {
      const res = await studentParentService.getSyllabus({
        class_name: className || selectedClass,
        division: division || selectedDivision,
      });

      if (res?.data) {
        if (res.data.availableClasses && res.data.availableClasses.length > 0) {
          setAvailableClasses(res.data.availableClasses);
        }
        if (res.data.availableDivisions && res.data.availableDivisions.length > 0) {
          setAvailableDivisions(res.data.availableDivisions);
        }
        if (res.data.currentClass) {
          setSelectedClass(res.data.currentClass);
          setFormClass(res.data.currentClass);
        }
        if (res.data.currentDivision) {
          setSelectedDivision(res.data.currentDivision);
          setFormDivision(res.data.currentDivision);
        }
        setCompletedChapters(res.data.completedChapters || []);
      }
    } catch (err) {
      console.error('Failed to load completed chapters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialized) {
      loadCompletedChapters(selectedClass, selectedDivision);
    }
  }, [selectedClass, selectedDivision, isInitialized]);

  // Open Record Modal
  const openRecordModal = () => {
    setFormClass(selectedClass);
    setFormDivision(selectedDivision);
    setFormSubject('Mathematics');
    setIsCustomSubject(false);
    setCustomSubjectName('');
    setFormCompletedDate(new Date().toISOString().split('T')[0]);
    setFormChapterName('');
    setFormDescription('');
    setShowAddModal(true);
  };

  // Submit Completed Chapter
  const handleRecordChapterSubmit = async (e) => {
    e.preventDefault();
    const finalSubject = isCustomSubject ? customSubjectName.trim() : formSubject;

    if (!finalSubject || !formChapterName.trim() || !formDescription.trim()) {
      showToast('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    try {
      const res = await studentParentService.updateSyllabusProgress({
        class_name: formClass,
        division: formDivision,
        subject_name: finalSubject,
        chapter_name: formChapterName.trim(),
        completed_date: formCompletedDate,
        description: formDescription.trim(),
        teacher_name: user?.name || 'Faculty',
      });

      if (res?.success) {
        showToast(`Chapter "${formChapterName}" recorded for ${formClass} (${formDivision})! Notifications sent.`);
        setShowAddModal(false);
        setFormChapterName('');
        setFormDescription('');
        loadCompletedChapters(formClass, formDivision);
      }
    } catch (err) {
      console.error('Failed to record chapter:', err);
      showToast(err.data?.message || 'Failed to record chapter.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Completed Chapter Entry
  const handleDeleteChapter = async (id, chapterName) => {
    if (!window.confirm(`Are you sure you want to remove "${chapterName}" from the completed syllabus list?`)) return;
    try {
      await studentParentService.deleteSyllabusProgressLog(id);
      showToast('Chapter record removed.');
      loadCompletedChapters(selectedClass, selectedDivision);
    } catch (err) {
      showToast('Failed to delete chapter record.');
    }
  };

  // Filter chapters list
  const filteredChapters = completedChapters.filter((c) => {
    const matchSubject = selectedSubjectFilter === 'ALL' || c.subject === selectedSubjectFilter;
    const matchSearch =
      !searchQuery.trim() ||
      c.chapter_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.topics_covered?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.teacher_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubject && matchSearch;
  });

  // Unique subjects in the completed list for quick filters
  const subjectsInList = Array.from(new Set(completedChapters.map((c) => c.subject).filter(Boolean)));

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-12 max-w-5xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 animate-scale-up">
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
              <h1 className="text-xl font-bold text-gray-900">Syllabus & Chapter Completion</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200/60">
                {selectedClass} • {selectedDivision}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Record completed chapters, date of completion, and topics covered for {selectedClass} ({selectedDivision})
            </p>
          </div>
        </div>

        {isTeacherOrAdmin && (
          <button
            onClick={openRecordModal}
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all flex items-center gap-2 w-full sm:w-auto justify-center self-start sm:self-auto shrink-0"
          >
            <LuPlus className="w-4 h-4" /> Record Completed Chapter
          </button>
        )}
      </div>

      {/* Class & Division Selection Toolbar (for Teachers & Admins) */}
      {isTeacherOrAdmin && (
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Class / Grade Selector */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <LuBuilding2 className="w-4 h-4 text-slate-400" />
              <label className="text-[10px] font-bold uppercase text-slate-400">Class:</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                {availableClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls} {teacherInfo?.class_teacher_class === cls ? '★' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Division Selector */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <LuLayers className="w-4 h-4 text-slate-400" />
              <label className="text-[10px] font-bold uppercase text-slate-400">Division:</label>
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                {availableDivisions.map((div) => (
                  <option key={div} value={div}>
                    {div} {teacherInfo?.class_teacher_division === div ? '★' : ''}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Viewing syllabus for <strong className="text-slate-700">{selectedClass} ({selectedDivision})</strong>
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 font-bold text-xs self-start md:self-auto">
            <LuAward className="w-4 h-4 text-purple-600 shrink-0" />
            <span>
              {teacherInfo?.class_teacher_class
                ? `${teacherInfo.class_teacher_class} (${teacherInfo.class_teacher_division || 'Div A'}) In-Charge`
                : 'Faculty Workspace'}
            </span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search chapter, topic, or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <LuFilter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="w-full sm:w-auto px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 cursor-pointer focus:outline-none focus:border-primary-500 cursor-pointer w-full md:w-auto"
          >
            <option value="ALL">All Subjects ({completedChapters.length})</option>
            {subjectsInList.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Completed Chapters List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
            <LuLoader className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">Loading syllabus records...</p>
          </div>
        ) : filteredChapters.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-xs space-y-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto">
              <LuBookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              No Completed Chapters Logged for {selectedClass} ({selectedDivision})
            </h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              {isTeacherOrAdmin
                ? 'Select the class & grade, enter the chapter name, completion date, and covered topics to log your first completed chapter.'
                : 'Your teachers have not published completed chapters for your class yet. Check back soon!'}
            </p>
            {isTeacherOrAdmin && (
              <button
                onClick={openRecordModal}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-sm"
              >
                <LuPlus className="w-4 h-4" /> Record First Chapter
              </button>
            )}
          </div>
        ) : (
          filteredChapters.map((chapter) => (
            <div
              key={chapter.id}
              className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-2xs hover:border-gray-300 transition-all space-y-3"
            >
              {/* Card Top: Subject & Date */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 border border-primary-100 font-bold text-xs">
                    {chapter.subject}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                    {chapter.class_name} • {chapter.division}
                  </span>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-200/60">
                    <LuCircleCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Completed on {chapter.completed_date_formatted}</span>
                  </div>

                  {isTeacherOrAdmin && (
                    <button
                      onClick={() => handleDeleteChapter(chapter.id, chapter.chapter_name)}
                      title="Remove Record"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LuTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Chapter Name & Description */}
              <div className="space-y-1.5">
                <h3 className="text-sm font-black text-gray-900">{chapter.chapter_name}</h3>
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {chapter.topics_covered}
                </div>
              </div>

              {/* Card Footer: Teacher Name */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>
                  Logged by: <strong className="text-slate-700">{chapter.teacher_name || 'Faculty'}</strong>
                </span>
                <span>{chapter.created_at}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: Record Completed Chapter */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative z-10 overflow-hidden animate-scale-up my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <LuBookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Record Completed Chapter</h2>
                  <p className="text-xs text-gray-500">Log finished chapter and notify class students</p>
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
            <form onSubmit={handleRecordChapterSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4 text-xs">
              {/* 1. Class & Division Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                    Class / Grade <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl font-bold text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 cursor-pointer"
                  >
                    {availableClasses.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                    Division / Section <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formDivision}
                    onChange={(e) => setFormDivision(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl font-bold text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 cursor-pointer"
                  >
                    {availableDivisions.map((div) => (
                      <option key={div} value={div}>
                        {div}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. Subject Selection */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomSubject(!isCustomSubject)}
                    className="text-[11px] text-primary-600 hover:underline font-semibold"
                  >
                    {isCustomSubject ? 'Choose from standard list' : '+ Enter other subject'}
                  </button>
                </div>

                {isCustomSubject ? (
                  <input
                    type="text"
                    required
                    placeholder="Enter custom subject name (e.g., Sanskrit, Robotics)"
                    value={customSubjectName}
                    onChange={(e) => setCustomSubjectName(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500"
                  />
                ) : (
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl font-semibold text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 cursor-pointer"
                  >
                    {STANDARD_SUBJECTS.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* 3. Date Completed */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                  Date When Completed <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 h-10 bg-gray-50">
                  <LuCalendar className="w-4 h-4 text-primary-600 shrink-0" />
                  <input
                    type="date"
                    required
                    value={formCompletedDate}
                    onChange={(e) => setFormCompletedDate(e.target.value)}
                    className="w-full bg-transparent text-gray-800 font-bold focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* 4. Name of Chapter */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                  Name of the Chapter <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4: Quadratic Equations & Formulae"
                  value={formChapterName}
                  onChange={(e) => setFormChapterName(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 font-medium"
                />
              </div>

              {/* 5. Description / Topics Covered */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                  Topics Covered (Description) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Enter detailed topics covered, exercises completed, formulas derived, and practice problems solved in class..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 resize-none leading-relaxed"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800 transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? <LuLoader className="w-3.5 h-3.5 animate-spin" /> : <LuSend className="w-3.5 h-3.5" />}
                  Save & Notify Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
