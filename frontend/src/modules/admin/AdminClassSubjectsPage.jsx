import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  LuBookOpen,
  LuPlus,
  LuTrash2,
  LuPencil,
  LuCheck,
  LuCircleCheck,
  LuCircleAlert,
  LuLoader,
  LuRefreshCw,
  LuSearch,
  LuX,
  LuLayers,
  LuChevronDown,
  LuFilter,
  LuArrowRight,
} from 'react-icons/lu';

export default function AdminClassSubjectsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  // Core Data
  const [classes, setClasses] = useState([]);
  const [catalogSubjects, setCatalogSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all'); // 'all' | 'configured' | 'empty'

  // Modals
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [modalClassId, setModalClassId] = useState(1);
  const [editingSubject, setEditingSubject] = useState(null);

  // Form State for Adding Subject into selected class
  const [isNewSubjectMode, setIsNewSubjectMode] = useState(false);
  const [formData, setFormData] = useState({
    subject_id: '',
    name: '',
    code: '',
    type: 'theory',
    teacher_id: '',
    periods_per_week: 5,
    max_marks: 100,
    passing_marks: 35,
    is_elective: false,
    sync_students: true,
  });

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async (preserveClassId = null) => {
    setLoading(true);
    try {
      const res = await adminService.getClassSubjects({ class_id: preserveClassId || modalClassId });
      if (res?.success && res.data) {
        setClasses(res.data.classes || []);
        setCatalogSubjects(res.data.catalog_subjects || []);
        setTeachers(res.data.teachers || []);

        if (preserveClassId) {
          setModalClassId(preserveClassId);
        } else if (res.data.current_class?.id) {
          setModalClassId(res.data.current_class.id);
        }
      }
    } catch (err) {
      console.error('Failed to load class curriculum:', err);
      showToast(err.message || 'Failed to load class curriculum', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open modal with a specific class pre-selected
  const openModalForClass = (classId) => {
    setModalClassId(classId);
    setIsNewSubjectMode(false);
    setFormData({
      subject_id: catalogSubjects.length > 0 ? catalogSubjects[0].id : '',
      name: '',
      code: '',
      type: 'theory',
      teacher_id: '',
      periods_per_week: 5,
      max_marks: 100,
      passing_marks: 35,
      is_elective: false,
      sync_students: true,
    });
    setShowConfigModal(true);
  };

  // The class object currently selected in the modal
  const activeModalClass = classes.find((c) => c.id === modalClassId) || classes[0] || null;
  const activeModalSubjects = activeModalClass?.subjects || [];

  // Open modal for editing existing class subject
  const openEditModal = (cs, className) => {
    setEditingSubject({ ...cs, className });
    setFormData({
      subject_id: cs.subject_id,
      name: cs.subject_name,
      code: cs.subject_code,
      type: cs.subject_type,
      teacher_id: cs.teacher_id || '',
      periods_per_week: cs.periods_per_week || 5,
      max_marks: cs.max_marks || 100,
      passing_marks: cs.passing_marks || 35,
      is_elective: cs.is_elective || false,
    });
  };

  // Add a subject to the selected class (one by one flow)
  const handleAddSubjectToClass = async (e) => {
    e.preventDefault();
    if (!activeModalClass) return;

    setSubmitting(true);
    try {
      const payload = {
        school_class_id: activeModalClass.id,
        subject_id: isNewSubjectMode ? null : formData.subject_id,
        name: isNewSubjectMode ? formData.name : null,
        code: isNewSubjectMode ? formData.code : null,
        type: isNewSubjectMode ? formData.type : null,
        teacher_id: formData.teacher_id ? parseInt(formData.teacher_id) : null,
        periods_per_week: parseInt(formData.periods_per_week) || 5,
        max_marks: parseFloat(formData.max_marks) || 100,
        passing_marks: parseFloat(formData.passing_marks) || 35,
        is_elective: Boolean(formData.is_elective),
        sync_students: Boolean(formData.sync_students),
      };

      const res = await adminService.assignClassSubject(payload);
      if (res?.success) {
        showToast(`Subject added to ${activeModalClass.name}!`);
        // Reset form inputs for next subject, keeping class selected
        setFormData((prev) => ({
          ...prev,
          name: '',
          code: '',
          teacher_id: '',
          is_elective: false,
        }));
        await loadData(activeModalClass.id);
      } else {
        showToast(res?.message || 'Failed to add subject', 'error');
      }
    } catch (err) {
      console.error('Error adding subject to class:', err);
      showToast(err.message || 'Failed to add subject', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Submit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingSubject) return;
    setSubmitting(true);
    try {
      const payload = {
        teacher_id: formData.teacher_id ? parseInt(formData.teacher_id) : null,
        periods_per_week: parseInt(formData.periods_per_week) || 5,
        max_marks: parseFloat(formData.max_marks) || 100,
        passing_marks: parseFloat(formData.passing_marks) || 35,
        is_elective: Boolean(formData.is_elective),
      };

      const res = await adminService.updateClassSubject(editingSubject.id, payload);
      if (res?.success) {
        showToast('Subject configuration updated successfully!');
        setEditingSubject(null);
        await loadData(modalClassId);
      } else {
        showToast(res?.message || 'Failed to update subject', 'error');
      }
    } catch (err) {
      console.error('Error updating subject:', err);
      showToast(err.message || 'Failed to update subject', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Subject from Class
  const handleDeleteClassSubject = async (subjectId, subjectName, className) => {
    if (!window.confirm(`Are you sure you want to remove "${subjectName}" from ${className}?`)) {
      return;
    }
    try {
      const res = await adminService.deleteClassSubject(subjectId);
      if (res?.success) {
        showToast(`"${subjectName}" removed from ${className}.`);
        await loadData(modalClassId);
      } else {
        showToast(res?.message || 'Failed to remove subject', 'error');
      }
    } catch (err) {
      console.error('Error removing subject:', err);
      showToast(err.message || 'Failed to remove subject', 'error');
    }
  };

  // Filter Classes
  const filteredClasses = classes.filter((cls) => {
    // Class Dropdown Filter (All Classes or specific Class)
    if (classFilter !== 'all' && String(cls.id) !== String(classFilter)) {
      return false;
    }

    // Search query matches class name OR any of its subjects
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();

    const matchesClassName = cls.name?.toLowerCase().includes(q);
    const matchesSubject = cls.subjects?.some(
      (s) =>
        s.subject_name?.toLowerCase().includes(q) ||
        s.subject_code?.toLowerCase().includes(q) ||
        (s.teacher_name && s.teacher_name.toLowerCase().includes(q))
    );

    return matchesClassName || matchesSubject;
  });

  return (
    <div className="space-y-4 pb-12 animate-fade-in font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-semibold animate-scale-up ${
            toastType === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {toastType === 'error' ? (
            <LuCircleAlert className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <LuCircleCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER BANNER */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
            <LuBookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-slate-800 leading-tight">
                Class Subjects & Academic Curriculum
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold inline-flex items-center gap-1">
                <LuLayers className="w-3.5 h-3.5" />
                {classes.filter((c) => (c.subjects_count || 0) > 0).length} of {classes.length} Classes Configured
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any class to configure its curriculum subjects one by one. All assigned subjects automatically reflect to enrolled students.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            onClick={() => loadData(modalClassId)}
            disabled={loading}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition cursor-pointer border border-slate-200 shadow-2xs"
            title="Refresh Curriculum Data"
          >
            <LuRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={() => openModalForClass(classes[0]?.id || 1)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <LuPlus className="w-4 h-4" />
            <span>Configure Class Curriculum</span>
          </button>
        </div>
      </div>

      {/* TOOLBAR: SEARCH ON LEFT & ALL CLASSES DROPDOWN ON RIGHT */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Left: Search Box */}
        <div className="relative flex-1 sm:max-w-md">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search class or subject name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition font-medium shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <LuX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Class Filter Dropdown (Listing all classes) */}
        <div className="relative min-w-[200px] sm:w-64 shrink-0">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <LuFilter className="w-3.5 h-3.5" />
          </div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full pl-8 pr-8 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 transition cursor-pointer appearance-none shadow-2xs"
          >
            <option value="all">All Classes ({classes.length})</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.subjects_count || 0} subjects)
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <LuChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* CLASS CURRICULUM CARDS */}
      <div>
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 shadow-xs">
            <LuLoader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Loading class curricula and subjects...</p>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto mb-3">
              <LuBookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">No Classes Match Your Filter</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              Try clearing your search query or reset the filter dropdown to view all classes.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setClassFilter('all');
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredClasses.map((cls) => {
              const subjects = cls.subjects || [];
              const hasSubjects = subjects.length > 0;

              return (
                <div
                  key={cls.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
                >
                  {/* Class Card Header */}
                  <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                        {cls.name?.replace('Class', '').trim() || cls.name?.[0] || 'C'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-base text-slate-900 leading-tight">
                            {cls.name}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                              hasSubjects
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                          >
                            {subjects.length} {subjects.length === 1 ? 'Subject' : 'Subjects'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{cls.students_count || 0} Enrolled Students</span>
                          {hasSubjects && (
                            <>
                              <span>&bull;</span>
                              <span className="font-semibold text-slate-700">
                                {cls.total_periods_week || subjects.reduce((acc, s) => acc + (s.periods_per_week || 0), 0)} Periods/wk
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Header Actions */}
                    <button
                      onClick={() => openModalForClass(cls.id)}
                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <LuPlus className="w-3.5 h-3.5" />
                      <span>Add Subject</span>
                    </button>
                  </div>

                  {/* Class Card Body: Subjects listed one by one */}
                  <div className="p-4 flex-1">
                    {!hasSubjects ? (
                      <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                          <LuBookOpen className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-semibold text-slate-700">No subjects assigned yet</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 mb-3">
                          Configure curriculum subjects that will be taught in {cls.name}.
                        </p>
                        <button
                          onClick={() => openModalForClass(cls.id)}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-blue-600 font-bold text-xs rounded-lg border border-blue-200 transition cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                        >
                          <LuPlus className="w-3.5 h-3.5" />
                          <span>Add First Subject</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
                          Curriculum Subjects ({subjects.length}):
                        </div>
                        <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50/30">
                          {subjects.map((s, idx) => {
                            const isPractical = s.subject_type === 'practical';
                            const isElective = s.is_elective;

                            return (
                              <div
                                key={s.id || idx}
                                className="p-2.5 sm:px-3 bg-white hover:bg-slate-50/90 transition flex items-center justify-between gap-3 text-xs"
                              >
                                {/* Left: Subject Info */}
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 font-black text-[11px] flex items-center justify-center shrink-0">
                                    {idx + 1}
                                  </span>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-extrabold text-slate-900 truncate">
                                        {s.subject_name}
                                      </span>
                                      <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                        {s.subject_code}
                                      </span>
                                      <span
                                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                                          isElective
                                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                            : isPractical
                                            ? 'bg-teal-50 text-teal-700 border-teal-200'
                                            : 'bg-blue-50 text-blue-700 border-blue-200'
                                        }`}
                                      >
                                        {isElective ? 'Elective' : isPractical ? 'Practical' : 'Theory'}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2 truncate">
                                      <span>{s.periods_per_week || 5} periods/wk</span>
                                      <span>&bull;</span>
                                      <span>Max: {s.max_marks || 100}M</span>
                                      <span>&bull;</span>
                                      <span className="text-slate-600 font-medium">
                                        {s.teacher_name || 'No faculty assigned'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Right: Actions (Delete / Edit) */}
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => openEditModal(s, cls.name)}
                                    className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-blue-600 rounded-lg transition cursor-pointer"
                                    title="Edit Subject Settings"
                                  >
                                    <LuPencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClassSubject(s.id, s.subject_name, cls.name)}
                                    className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                                    title="Delete Subject from Class"
                                  >
                                    <LuTrash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Class Card Footer */}
                  <div className="px-4 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Curriculum for {cls.name}</span>
                    <button
                      onClick={() => openModalForClass(cls.id)}
                      className="font-bold text-blue-600 hover:text-blue-700 transition inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Manage Subjects</span>
                      <LuArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CURRICULUM CONFIGURATION MODAL (SELECT CLASS FIRST, THEN LIST & ADD SUBJECTS ONE BY ONE) */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full my-4 overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 text-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold">
                  <LuBookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Configure Curriculum for Class
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select a class, review its current subjects, and add or remove subjects one by one.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
              {/* STEP 1: SELECT CLASS FIRST */}
              <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200">
                <label className="block text-xs font-black text-blue-900 mb-1.5 flex items-center gap-1.5">
                  <LuLayers className="w-4 h-4 text-blue-700" />
                  <span>STEP 1: Select Academic Class</span>
                </label>
                <div className="relative">
                  <select
                    value={modalClassId}
                    onChange={(e) => {
                      const newId = parseInt(e.target.value);
                      setModalClassId(newId);
                      loadData(newId);
                    }}
                    className="w-full pl-3 pr-8 py-2.5 bg-white border border-blue-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none shadow-2xs"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.subjects_count || 0} subjects configured)
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <LuChevronDown className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[11px] text-blue-700 font-medium mt-1">
                  Managing curriculum for <strong className="text-blue-900">{activeModalClass?.name}</strong>.
                </p>
              </div>

              {/* STEP 2: ALL SUBJECTS TAUGHT IN THIS CLASS LISTED ONE BY ONE */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-800 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                    <LuBookOpen className="w-4 h-4 text-blue-600" />
                    Subjects Taught in {activeModalClass?.name} ({activeModalSubjects.length})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Click trash icon to delete any subject
                  </span>
                </div>

                {activeModalSubjects.length === 0 ? (
                  <div className="p-4 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400 text-xs">
                    No subjects assigned yet to {activeModalClass?.name}. Add subjects below.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto bg-slate-50/40">
                    {activeModalSubjects.map((s, idx) => (
                      <div
                        key={s.id || idx}
                        className="p-2.5 bg-white hover:bg-slate-50 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80 font-black text-[11px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-slate-900 truncate">{s.subject_name}</span>
                              <span className="font-mono text-[10px] text-slate-500 font-bold bg-slate-100 px-1 rounded">
                                {s.subject_code}
                              </span>
                              <span className="text-[9px] uppercase font-bold text-slate-500">
                                ({s.subject_type})
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {s.periods_per_week} periods/wk &bull; {s.teacher_name || 'No teacher allocated'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditModal(s, activeModalClass.name)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                            title="Edit"
                          >
                            <LuPencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClassSubject(s.id, s.subject_name, activeModalClass.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                            title="Delete"
                          >
                            <LuTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* STEP 3: ADD ANOTHER SUBJECT FORM (ONE BY ONE) */}
              <form onSubmit={handleAddSubjectToClass} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                    <LuPlus className="w-4 h-4 text-blue-600" />
                    <span>Add a Subject to {activeModalClass?.name}</span>
                  </h4>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    One by One
                  </span>
                </div>

                {/* Mode Toggle */}
                <div className="flex items-center gap-2 bg-slate-200/70 p-1 rounded-xl text-xs font-bold text-slate-600">
                  <button
                    type="button"
                    onClick={() => setIsNewSubjectMode(false)}
                    className={`flex-1 py-1 rounded-lg transition cursor-pointer text-center ${
                      !isNewSubjectMode ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'hover:text-slate-900'
                    }`}
                  >
                    Pick from Master Catalog
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNewSubjectMode(true)}
                    className={`flex-1 py-1 rounded-lg transition cursor-pointer text-center ${
                      isNewSubjectMode ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'hover:text-slate-900'
                    }`}
                  >
                    Create New Subject Title
                  </button>
                </div>

                {!isNewSubjectMode ? (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Select Subject *
                    </label>
                    <select
                      value={formData.subject_id}
                      onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
                    >
                      {catalogSubjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} {s.code ? `(${s.code})` : ''} - {s.type}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        New Subject Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Sanskrit / Robotics / French"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required={isNewSubjectMode}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Subject Code
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. SAN-022"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Subject Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="theory">Theory</option>
                        <option value="practical">Practical / Lab</option>
                        <option value="elective">Elective / Optional</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Faculty Teacher Allocation */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Assigned Teacher (Optional)
                  </label>
                  <select
                    value={formData.teacher_id}
                    onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">-- No Teacher Assigned Yet --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.department || 'General'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Weekly Periods & Marks Setup */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Periods / Wk
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.periods_per_week}
                      onChange={(e) => setFormData({ ...formData, periods_per_week: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-center text-slate-800 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Max Marks
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="500"
                      value={formData.max_marks}
                      onChange={(e) => setFormData({ ...formData, max_marks: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-center text-slate-800 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Pass Marks
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="500"
                      value={formData.passing_marks}
                      onChange={(e) => setFormData({ ...formData, passing_marks: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-center text-slate-800 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Elective Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.is_elective}
                    onChange={(e) => setFormData({ ...formData, is_elective: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Mark as Optional / Elective Subject for this Class</span>
                </label>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuPlus className="w-4 h-4" />}
                    <span>+ Add This Subject to {activeModalClass?.name}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                All changes reflect automatically to enrolled students of this class.
              </span>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT SUBJECT MODAL */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full my-4 overflow-hidden animate-scale-up">
            <div className="bg-slate-50 border-b border-slate-200 p-4 text-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold">
                  <LuPencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Edit: {editingSubject.subject_name} ({editingSubject.className})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Update teacher allocation, periods, and examination passing marks.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingSubject(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Assigned Faculty Teacher
                </label>
                <select
                  value={formData.teacher_id}
                  onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- No Teacher Assigned Yet --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.department || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Periods / Wk
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.periods_per_week}
                    onChange={(e) => setFormData({ ...formData, periods_per_week: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-center text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Max Marks
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={formData.max_marks}
                    onChange={(e) => setFormData({ ...formData, max_marks: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-center text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Pass Marks
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={formData.passing_marks}
                    onChange={(e) => setFormData({ ...formData, passing_marks: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-center text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.is_elective}
                    onChange={(e) => setFormData({ ...formData, is_elective: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Mark as Optional / Elective Subject for this Class</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuCheck className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
