import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import CredentialsModal from '../../components/Common/CredentialsModal';
import {
  LuUsers,
  LuUserPlus,
  LuSearch,
  LuFilter,
  LuEye,
  LuPencil,
  LuTrash2,
  LuPhone,
  LuMail,
  LuGraduationCap,
  LuBookOpen,
  LuCalendar,
  LuCircleCheck,
  LuCircleAlert,
  LuClock,
  LuX,
  LuCheck,
  LuBriefcase,
  LuBuilding2,
  LuDollarSign,
  LuChevronDown,
  LuIdCard,
  LuKey,
  LuLoader,
  LuPlus,
  LuAward,
} from 'react-icons/lu';

const ALL_DEFAULT_CLASSES = [
  { name: 'Class 12', label: 'Class 12 (Grade 12th)' },
  { name: 'Class 11', label: 'Class 11 (Grade 11th)' },
  { name: 'Class 10', label: 'Class 10 (Grade 10th)' },
  { name: 'Class 9', label: 'Class 9 (Grade 9th)' },
  { name: 'Class 8', label: 'Class 8 (Grade 8th)' },
  { name: 'Class 7', label: 'Class 7 (Grade 7th)' },
  { name: 'Class 6', label: 'Class 6 (Grade 6th)' },
  { name: 'Class 5', label: 'Class 5 (Grade 5th)' },
  { name: 'Class 4', label: 'Class 4 (Grade 4th)' },
  { name: 'Class 3', label: 'Class 3 (Grade 3rd)' },
  { name: 'Class 2', label: 'Class 2 (Grade 2nd)' },
  { name: 'Class 1', label: 'Class 1 (Grade 1st)' },
  { name: 'UKG', label: 'UKG (Upper Kindergarten)' },
  { name: 'LKG', label: 'LKG (Lower Kindergarten)' },
  { name: 'Nursery', label: 'Nursery' },
];

export default function ManageTeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [classList, setClassList] = useState(ALL_DEFAULT_CLASSES);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals & form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [deleteTargetTeacher, setDeleteTargetTeacher] = useState(null);
  const [credentialsModalData, setCredentialsModalData] = useState(null);
  const [overwriteModalData, setOverwriteModalData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // New Teacher Form
  const [formData, setFormData] = useState({
    role: 'teacher',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: 'Mathematics',
    qualification: '',
    experience: '',
    salary: '',
    allowance: '',
    joining_date: new Date().toISOString().split('T')[0],
    assigned_subjects: '',
    assigned_classes: '',
    class_teacher_class: '',
    class_teacher_division: 'Div A',
    address: '',
    emergency_contact: '',
    status: 'Active',
  });
  const [isCustomDept, setIsCustomDept] = useState(false);
  const [customDept, setCustomDept] = useState('');

  // Edit Teacher Form
  const [editFormData, setEditFormData] = useState({
    role: 'teacher',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: 'Mathematics',
    qualification: '',
    experience: '',
    salary: '',
    allowance: '',
    assigned_subjects: '',
    assigned_classes: '',
    class_teacher_class: '',
    class_teacher_division: 'Div A',
    address: '',
    emergency_contact: '',
    status: 'Active',
  });

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getTeachers({
        search: searchQuery,
        department: selectedDept,
        status: selectedStatus,
      });
      if (res && res.success && res.data) {
        const list = Array.isArray(res.data)
          ? res.data
          : (res.data.data && Array.isArray(res.data.data) ? res.data.data : []);
        setTeachers(list);
      } else {
        setTeachers([]);
      }
    } catch (err) {
      console.error('Failed to load teachers:', err);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const res = await adminService.getClasses();
      if (res.success && res.data && res.data.length > 0) {
        const fetched = res.data.map((c) => ({
          name: c.name,
          label: `${c.name} (${c.code || c.name})`,
        }));
        setClassList(fetched);
      }
    } catch (err) {
      console.log('Using default classes list:', err);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    loadTeachers();
  }, [selectedDept, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadTeachers();
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDeptSelectChange = (e) => {
    const val = e.target.value;
    if (val === 'Other') {
      setIsCustomDept(true);
      setFormData((prev) => ({ ...prev, department: customDept || '' }));
    } else {
      setIsCustomDept(false);
      setFormData((prev) => ({ ...prev, department: val }));
    }
  };

  const findExistingClassTeacher = (className, division, excludeTeacherId = null) => {
    if (!className) return null;
    return teachers.find((t) => {
      if (excludeTeacherId && t.id === excludeTeacherId) return false;
      if (t.class_teacher_class !== className) return false;
      if (division && t.class_teacher_division && t.class_teacher_division !== division) return false;
      return true;
    });
  };

  const handleAddSubmit = async (e, force = false) => {
    if (e) e.preventDefault();

    // Check if another teacher is already class teacher for this class & division
    if (!force && formData.class_teacher_class && formData.role !== 'hr') {
      const existing = findExistingClassTeacher(formData.class_teacher_class, formData.class_teacher_division);
      if (existing) {
        setOverwriteModalData({
          actionType: 'add',
          targetClass: formData.class_teacher_class,
          targetDivision: formData.class_teacher_division || 'Div A',
          currentTeacherName: existing.full_name || `${existing.first_name} ${existing.last_name || ''}`.trim(),
          newTeacherName: `${formData.first_name} ${formData.last_name || ''}`.trim() || 'New Staff Member',
        });
        return;
      }
    }

    setSubmitting(true);
    try {
      const isHR = formData.role === 'hr';
      const finalDept = isHR ? 'Human Resources' : ((isCustomDept ? customDept : formData.department)?.trim());
      if (!finalDept) {
        showToast('Please specify or enter a valid department name.');
        setSubmitting(false);
        return;
      }

      const payload = {
        ...formData,
        role: formData.role || 'teacher',
        department: finalDept,
        salary: formData.salary ? Number(formData.salary) : (isHR ? 55000 : 50000),
        allowance: formData.allowance ? Number(formData.allowance) : 0,
        class_teacher_class: isHR ? null : (formData.class_teacher_class || null),
        class_teacher_division: isHR ? null : (formData.class_teacher_class ? (formData.class_teacher_division || 'Div A') : null),
        assigned_subjects: isHR ? [] : (formData.assigned_subjects
          ? formData.assigned_subjects.split(',').map((s) => s.trim()).filter(Boolean)
          : []),
        assigned_classes: isHR ? [] : (formData.class_teacher_class
          ? [formData.class_teacher_class]
          : (formData.assigned_classes ? formData.assigned_classes.split(',').map((c) => c.trim()).filter(Boolean) : [])),
      };

      const res = await adminService.createTeacher(payload);
      if (res.success) {
        setShowAddModal(false);
        setIsCustomDept(false);
        setCustomDept('');
        setFormData({
          role: 'teacher',
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          department: 'Mathematics',
          qualification: '',
          experience: '',
          salary: '',
          allowance: '',
          joining_date: new Date().toISOString().split('T')[0],
          assigned_subjects: '',
          assigned_classes: '',
          class_teacher_class: '',
          class_teacher_division: 'Div A',
          address: '',
          emergency_contact: '',
          status: 'Active',
        });
        loadTeachers();
        showToast(`${isHR ? 'HR Staff member' : 'Teacher'} onboarded successfully!`);

        // Display generated credentials modal
        if (res.credentials) {
          setCredentialsModalData(res.credentials);
        }
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to create staff member.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (teacher) => {
    const resolvedRole = teacher.user?.role || ((teacher.teacher_id && teacher.teacher_id.startsWith('HR-')) || teacher.department === 'Human Resources' ? 'hr' : 'teacher');
    setEditingTeacher(teacher);
    setEditFormData({
      role: resolvedRole,
      first_name: teacher.first_name || '',
      last_name: teacher.last_name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      department: teacher.department || (resolvedRole === 'hr' ? 'Human Resources' : 'Mathematics'),
      qualification: teacher.qualification || '',
      experience: teacher.experience || '',
      salary: teacher.salary !== undefined && teacher.salary !== null ? teacher.salary : '',
      allowance: teacher.allowance !== undefined && teacher.allowance !== null ? teacher.allowance : '',
      assigned_subjects: Array.isArray(teacher.assigned_subjects) ? teacher.assigned_subjects.join(', ') : '',
      assigned_classes: Array.isArray(teacher.assigned_classes) ? teacher.assigned_classes.join(', ') : '',
      class_teacher_class: teacher.class_teacher_class || '',
      class_teacher_division: teacher.class_teacher_division || 'Div A',
      address: teacher.address || '',
      emergency_contact: teacher.emergency_contact || '',
      status: teacher.status || 'Active',
    });
  };

  const handleEditSubmit = async (e, force = false) => {
    if (e) e.preventDefault();
    if (!editingTeacher) return;

    // Check if another teacher is already class teacher for this class & division
    if (!force && editFormData.class_teacher_class && editFormData.role !== 'hr') {
      const existing = findExistingClassTeacher(editFormData.class_teacher_class, editFormData.class_teacher_division, editingTeacher.id);
      if (existing) {
        setOverwriteModalData({
          actionType: 'edit',
          targetClass: editFormData.class_teacher_class,
          targetDivision: editFormData.class_teacher_division || 'Div A',
          currentTeacherName: existing.full_name || `${existing.first_name} ${existing.last_name || ''}`.trim(),
          newTeacherName: `${editFormData.first_name} ${editFormData.last_name || ''}`.trim() || editingTeacher.full_name,
        });
        return;
      }
    }

    setSubmitting(true);
    try {
      const isHR = editFormData.role === 'hr';
      const payload = {
        ...editFormData,
        role: editFormData.role || 'teacher',
        department: isHR ? 'Human Resources' : editFormData.department,
        salary: editFormData.salary ? Number(editFormData.salary) : (isHR ? 55000 : 50000),
        allowance: editFormData.allowance ? Number(editFormData.allowance) : 0,
        class_teacher_class: isHR ? null : (editFormData.class_teacher_class || null),
        class_teacher_division: isHR ? null : (editFormData.class_teacher_class ? (editFormData.class_teacher_division || 'Div A') : null),
        assigned_subjects: isHR ? [] : (editFormData.assigned_subjects
          ? editFormData.assigned_subjects.split(',').map((s) => s.trim()).filter(Boolean)
          : []),
        assigned_classes: isHR ? [] : (editFormData.class_teacher_class
          ? [editFormData.class_teacher_class]
          : (editFormData.assigned_classes ? editFormData.assigned_classes.split(',').map((c) => c.trim()).filter(Boolean) : [])),
      };

      await adminService.updateTeacher(editingTeacher.id, payload);
      setEditingTeacher(null);
      loadTeachers();
      showToast('Staff details & role assignment updated successfully!');
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to update staff member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetTeacher) return;
    try {
      await adminService.deleteTeacher(deleteTargetTeacher.id);
      setDeleteTargetTeacher(null);
      loadTeachers();
      showToast('Staff member removed successfully.');
    } catch (err) {
      showToast('Failed to delete staff member.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-scale-up border border-slate-700">
          <LuCircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-primary-500/20">
            <LuUsers className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-bold text-slate-800 leading-tight">Faculty & Staff</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-primary-50 text-primary-700">
                {teachers.length} Total
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Staff profiles, roles, class in-charges & salary management
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto px-4 py-2 sm:py-2.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
        >
          <LuUserPlus className="w-4 h-4" /> Add Staff Member
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, subject, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-500"
          />
        </form>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full sm:w-auto px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-primary-500 font-medium cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
            <option value="English">English</option>
            <option value="Social Studies">Social Studies</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Languages">Languages</option>
            <option value="Human Resources">Human Resources</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-auto px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-primary-500 font-medium cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Teachers Directory */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <LuLoader className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading faculty directory...</p>
        </div>
      ) : teachers.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl sm:rounded-3xl border border-slate-200">
          <p className="text-sm font-bold text-slate-700">No faculty members found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <>
          {/* Mobile View: Clean Staff Cards */}
          <div className="sm:hidden space-y-3">
            {teachers.map((teacher) => {
              const base = Number(teacher.salary || 50000);
              const allow = Number(teacher.allowance || 0);
              const gross = base + allow;
              const deduction = Math.round(gross * 0.12);
              const net = gross - deduction;
              const isHR = teacher.user?.role === 'hr' || (teacher.teacher_id && teacher.teacher_id.startsWith('HR-')) || teacher.department === 'Human Resources';

              return (
                <div
                  key={teacher.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3"
                >
                  {/* Top Row: Avatar + Name + Badges */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isHR ? 'bg-indigo-100 text-indigo-800' : 'bg-primary-100 text-primary-800'
                      }`}>
                        {teacher.first_name?.[0] || 'S'}{teacher.last_name?.[0] || ''}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-slate-900 text-sm truncate">
                            {teacher.first_name} {teacher.last_name || ''}
                          </p>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isHR ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {isHR ? 'HR Staff' : 'Teacher'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                          {teacher.teacher_id || `STF-${teacher.id}`} • {teacher.email}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 shrink-0 ${
                      teacher.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : teacher.status === 'On Leave'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        teacher.status === 'Active' ? 'bg-emerald-500' : teacher.status === 'On Leave' ? 'bg-amber-500' : 'bg-rose-500'
                      }`}></span>
                      {teacher.status}
                    </span>
                  </div>

                  {/* Chips: Department & Class In-Charge */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      {teacher.department || 'General'}
                    </span>
                    {isHR ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 text-[11px] font-bold">
                        HR Operations
                      </span>
                    ) : teacher.class_teacher_class ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-bold">
                        <LuAward className="w-3 h-3 text-purple-600" />
                        <span>{teacher.class_teacher_class}</span>
                        {teacher.class_teacher_division && (
                          <span className="text-[10px] text-purple-600 font-semibold">
                            ({teacher.class_teacher_division})
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">Subject Teacher</span>
                    )}
                  </div>

                  {/* Salary Info Strip */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Gross Salary</p>
                      <p className="font-bold text-slate-800">₹{gross.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase">Net Pay (-12%)</p>
                      <p className="font-black text-emerald-700">₹{net.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelectedTeacher(teacher)}
                      className="px-3 py-1.5 rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <LuEye className="w-3.5 h-3.5 text-slate-500" /> Profile
                    </button>
                    <button
                      onClick={() => openEditModal(teacher)}
                      className="px-3 py-1.5 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <LuPencil className="w-3.5 h-3.5 text-amber-600" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteTargetTeacher(teacher)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <LuTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View: Full Data Table */}
          <div className="hidden sm:block bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3.5">Staff Member</th>
                    <th className="px-5 py-3.5">Class In-Charge</th>
                    <th className="px-5 py-3.5">Department</th>
                    <th className="px-5 py-3.5">Monthly Pay (Base + Allow)</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {teachers.map((teacher) => {
                    const base = Number(teacher.salary || 50000);
                    const allow = Number(teacher.allowance || 0);
                    const gross = base + allow;
                    const deduction = Math.round(gross * 0.12);
                    const net = gross - deduction;

                    return (
                      <tr key={teacher.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              teacher.user?.role === 'hr' || (teacher.teacher_id && teacher.teacher_id.startsWith('HR-'))
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-primary-100 text-primary-800'
                            }`}>
                              {teacher.first_name?.[0] || 'S'}{teacher.last_name?.[0] || ''}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-slate-900">
                                  {teacher.first_name} {teacher.last_name || ''}
                                </p>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  teacher.user?.role === 'hr' || (teacher.teacher_id && teacher.teacher_id.startsWith('HR-')) || teacher.department === 'Human Resources'
                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}>
                                  {teacher.user?.role === 'hr' || (teacher.teacher_id && teacher.teacher_id.startsWith('HR-')) || teacher.department === 'Human Resources'
                                    ? 'HR Staff'
                                    : 'Teacher'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 font-mono">
                                {teacher.teacher_id || `STF-${teacher.id}`} • {teacher.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {teacher.user?.role === 'hr' || (teacher.teacher_id && teacher.teacher_id.startsWith('HR-')) || teacher.department === 'Human Resources' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold">
                              HR Operations
                            </span>
                          ) : teacher.class_teacher_class ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold">
                              <LuAward className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                              <span>{teacher.class_teacher_class}</span>
                              {teacher.class_teacher_division && (
                                <span className="text-[10px] text-purple-600 font-semibold">
                                  ({teacher.class_teacher_division})
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">Subject Teacher</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold">
                            {teacher.department || 'General'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-bold text-slate-900">₹{base.toLocaleString('en-IN')}</p>
                            <p className="text-[10px] text-emerald-600 font-semibold">
                              + ₹{allow.toLocaleString('en-IN')} allowance (Net: ₹{net.toLocaleString('en-IN')})
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 ${
                            teacher.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : teacher.status === 'On Leave'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              teacher.status === 'Active' ? 'bg-emerald-500' : teacher.status === 'On Leave' ? 'bg-amber-500' : 'bg-rose-500'
                            }`}></span>
                            {teacher.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedTeacher(teacher)}
                              title="View Profile"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer"
                            >
                              <LuEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(teacher)}
                              title="Edit Staff & Salary"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            >
                              <LuPencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTargetTeacher(teacher)}
                              title="Remove Teacher"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <LuTrash2 className="w-4 h-4" />
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
        </>
      )}

      {/* Add New Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full my-8 overflow-hidden animate-scale-up">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <LuUserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Onboard New Faculty Member</h3>
                  <p className="text-primary-100 text-xs">Set Base Salary, Allowance, and auto-generate staff login credentials</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Staff Role Selector (Teacher vs HR) */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                <label className="block text-xs font-bold text-indigo-950">
                  Staff Role & Portal Access <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'teacher', department: formData.department === 'Human Resources' ? 'Mathematics' : formData.department })}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      formData.role === 'teacher'
                        ? 'bg-white border-primary-600 ring-2 ring-primary-500/20 shadow-xs'
                        : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                      formData.role === 'teacher' ? 'border-primary-600 bg-primary-600' : 'border-slate-300'
                    }`}>
                      {formData.role === 'teacher' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Teaching Faculty (Teacher)</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Access to Classroom, Student Attendance, Timetable & Syllabus
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'hr', department: 'Human Resources', class_teacher_class: '', assigned_subjects: '' })}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      formData.role === 'hr'
                        ? 'bg-white border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                      formData.role === 'hr' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                    }`}>
                      {formData.role === 'hr' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Human Resources (HR)</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Access to HR Module: Staff Salaries, Attendance & Leaves
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="e.g. Shruti"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="e.g. Sen"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Email (Username) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="staff@school.com"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Salary & Allowances Section */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LuDollarSign className="w-4 h-4 text-emerald-600" />
                    <label className="text-xs font-bold text-emerald-900">Salary & Monthly Allowances</label>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                    HR Payroll Integrated
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                      Base Salary (₹ / month) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      required
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      placeholder="e.g. 50000"
                      className="w-full px-3.5 py-2 bg-white border border-emerald-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                      Monthly Allowance (₹ / month)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={formData.allowance}
                      onChange={(e) => setFormData({ ...formData, allowance: e.target.value })}
                      placeholder="e.g. 10000"
                      className="w-full px-3.5 py-2 bg-white border border-emerald-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                {/* Calculation preview badge */}
                {(() => {
                  const b = Number(formData.salary || 0);
                  const a = Number(formData.allowance || 0);
                  const gross = b + a;
                  const ded = Math.round(gross * 0.12);
                  const net = gross - ded;
                  return (
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-200/80 text-[11px]">
                      <div className="bg-white p-2 rounded-lg border border-emerald-100">
                        <span className="text-slate-400 block text-[10px]">Gross Pay:</span>
                        <span className="font-bold text-slate-800 font-mono">₹{gross.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-emerald-100">
                        <span className="text-slate-400 block text-[10px]">12% Deduction:</span>
                        <span className="font-bold text-rose-600 font-mono">- ₹{ded.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="bg-emerald-100/70 p-2 rounded-lg border border-emerald-300">
                        <span className="text-emerald-800 block text-[10px] font-bold">Net Payable:</span>
                        <span className="font-bold text-emerald-900 font-mono">₹{net.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Class Teacher Assignment */}
              <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 space-y-3">
                <div className="flex items-center gap-2">
                  <LuAward className="w-4 h-4 text-purple-600" />
                  <label className="text-xs font-bold text-purple-900">Assign as Class Teacher (Homeroom In-Charge)</label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-purple-800 mb-1">Class / Grade</label>
                    <select
                      value={formData.class_teacher_class}
                      onChange={(e) => setFormData({ ...formData, class_teacher_class: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white border border-purple-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="">None (Subject Teacher Only)</option>
                      {classList.map((cls) => (
                        <option key={cls.name} value={cls.name}>
                          {cls.label || cls.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-purple-800 mb-1">Division / Section</label>
                    <select
                      value={formData.class_teacher_division}
                      onChange={(e) => setFormData({ ...formData, class_teacher_division: e.target.value })}
                      disabled={!formData.class_teacher_class}
                      className="w-full px-3.5 py-2 bg-white border border-purple-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-500 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="Div A">Div A (Division A)</option>
                      <option value="Div B">Div B (Division B)</option>
                      <option value="Div C">Div C (Division C)</option>
                      <option value="Div D">Div D (Division D)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={isCustomDept ? 'Other' : formData.department}
                    onChange={handleDeptSelectChange}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Languages">Languages</option>
                    <option value="Other">Other / Custom Department</option>
                  </select>
                </div>

                {isCustomDept ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Department Name</label>
                    <input
                      type="text"
                      required
                      value={customDept}
                      onChange={(e) => setCustomDept(e.target.value)}
                      placeholder="e.g. Performing Arts"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Highest Qualification</label>
                    <input
                      type="text"
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      placeholder="e.g. M.Sc. Mathematics, B.Ed"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Subjects (comma-separated)</label>
                <input
                  type="text"
                  value={formData.assigned_subjects}
                  onChange={(e) => setFormData({ ...formData, assigned_subjects: e.target.value })}
                  placeholder="e.g. Mathematics, Advanced Geometry"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <strong>Notice:</strong> An auto-generated random temporary password will be created for this staff email and displayed to you upon submission.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuCheck className="w-4 h-4" />}
                  {submitting ? 'Creating Staff Member...' : 'Confirm & Generate Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full my-8 overflow-hidden animate-scale-up">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 to-primary-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <LuPencil className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Edit Faculty Details, Salary & Allowances</h3>
                  <p className="text-amber-100 text-xs">Update teacher profile, salary, allowance, and class assignments</p>
                </div>
              </div>
              <button
                onClick={() => setEditingTeacher(null)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Staff Role Selector (Teacher vs HR) */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <label className="block text-xs font-bold text-amber-950">
                  Staff Role & System Access <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, role: 'teacher' })}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      editFormData.role === 'teacher'
                        ? 'bg-white border-primary-600 ring-2 ring-primary-500/20 shadow-xs'
                        : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                      editFormData.role === 'teacher' ? 'border-primary-600 bg-primary-600' : 'border-slate-300'
                    }`}>
                      {editFormData.role === 'teacher' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Teaching Faculty (Teacher)</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Teacher Portal & Classrooms</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, role: 'hr', department: 'Human Resources', class_teacher_class: '', assigned_subjects: '' })}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      editFormData.role === 'hr'
                        ? 'bg-white border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                      editFormData.role === 'hr' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                    }`}>
                      {editFormData.role === 'hr' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Human Resources (HR)</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">HR Module & Staff Operations</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.first_name}
                    onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editFormData.last_name}
                    onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Salary & Allowances Section */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LuDollarSign className="w-4 h-4 text-emerald-600" />
                    <label className="text-xs font-bold text-emerald-900">Salary & Monthly Allowances</label>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                    HR Payroll Linked
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                      Base Salary (₹ / month)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={editFormData.salary}
                      onChange={(e) => setEditFormData({ ...editFormData, salary: e.target.value })}
                      placeholder="e.g. 50000"
                      className="w-full px-3.5 py-2 bg-white border border-emerald-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                      Monthly Allowance (₹ / month)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={editFormData.allowance}
                      onChange={(e) => setEditFormData({ ...editFormData, allowance: e.target.value })}
                      placeholder="e.g. 10000"
                      className="w-full px-3.5 py-2 bg-white border border-emerald-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                {/* Calculation preview badge */}
                {(() => {
                  const b = Number(editFormData.salary || 0);
                  const a = Number(editFormData.allowance || 0);
                  const gross = b + a;
                  const ded = Math.round(gross * 0.12);
                  const net = gross - ded;
                  return (
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-200/80 text-[11px]">
                      <div className="bg-white p-2 rounded-lg border border-emerald-100">
                        <span className="text-slate-400 block text-[10px]">Gross Pay:</span>
                        <span className="font-bold text-slate-800 font-mono">₹{gross.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-emerald-100">
                        <span className="text-slate-400 block text-[10px]">12% Deduction:</span>
                        <span className="font-bold text-rose-600 font-mono">- ₹{ded.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="bg-emerald-100/70 p-2 rounded-lg border border-emerald-300">
                        <span className="text-emerald-800 block text-[10px] font-bold">Net Payable:</span>
                        <span className="font-bold text-emerald-900 font-mono">₹{net.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Class Teacher Assignment */}
              <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 space-y-3">
                <div className="flex items-center gap-2">
                  <LuAward className="w-4 h-4 text-purple-600" />
                  <label className="text-xs font-bold text-purple-900">Assign as Class Teacher (Homeroom In-Charge)</label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-purple-800 mb-1">Class / Grade</label>
                    <select
                      value={editFormData.class_teacher_class}
                      onChange={(e) => setEditFormData({ ...editFormData, class_teacher_class: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white border border-purple-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="">None (Subject Teacher Only)</option>
                      {classList.map((cls) => (
                        <option key={cls.name} value={cls.name}>
                          {cls.label || cls.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-purple-800 mb-1">Division / Section</label>
                    <select
                      value={editFormData.class_teacher_division}
                      onChange={(e) => setEditFormData({ ...editFormData, class_teacher_division: e.target.value })}
                      disabled={!editFormData.class_teacher_class}
                      className="w-full px-3.5 py-2 bg-white border border-purple-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-500 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="Div A">Div A (Division A)</option>
                      <option value="Div B">Div B (Division B)</option>
                      <option value="Div C">Div C (Division C)</option>
                      <option value="Div D">Div D (Division D)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={editFormData.department}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Languages">Languages</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Subjects (comma-separated)</label>
                <input
                  type="text"
                  value={editFormData.assigned_subjects}
                  onChange={(e) => setEditFormData({ ...editFormData, assigned_subjects: e.target.value })}
                  placeholder="e.g. Mathematics, Advanced Geometry"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuCheck className="w-4 h-4" />}
                  {submitting ? 'Saving Changes...' : 'Save Teacher Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center animate-scale-up">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LuTrash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Remove Faculty Member?</h3>
            <p className="text-xs text-slate-500 mb-6">
              Are you sure you want to remove <strong>{deleteTargetTeacher.first_name} {deleteTargetTeacher.last_name}</strong>? Their login access will also be revoked.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setDeleteTargetTeacher(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Profile View Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full my-8 overflow-hidden animate-scale-up">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-700 p-6 text-white relative">
              <button
                onClick={() => setSelectedTeacher(null)}
                className="absolute right-4 top-4 w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center text-xl font-bold border border-white/30 shrink-0">
                  {selectedTeacher.first_name?.[0] || 'T'}{selectedTeacher.last_name?.[0] || ''}
                </div>
                <div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                    <h2 className="text-xl font-bold">
                      {selectedTeacher.first_name} {selectedTeacher.last_name || ''}
                    </h2>
                    {selectedTeacher.class_teacher_class && (
                      <span className="px-2.5 py-0.5 rounded-md bg-purple-400/40 text-white font-bold text-xs border border-white/30">
                        Class Teacher: {selectedTeacher.class_teacher_class}
                      </span>
                    )}
                  </div>
                  <p className="text-primary-100 text-xs">
                    {selectedTeacher.department} Faculty • {selectedTeacher.qualification || 'Educator'}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Content Body */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Status & Department Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium">Department:</span>
                  <span className="font-bold text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                    {selectedTeacher.department || 'General'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium">Status:</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                    selectedTeacher.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      selectedTeacher.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}></span>
                    {selectedTeacher.status || 'Active'}
                  </span>
                </div>
              </div>

              {/* Class Teacher Details */}
              {selectedTeacher.class_teacher_class && (
                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <LuAward className="w-5 h-5 text-purple-600" />
                    <div>
                      <h4 className="text-xs font-bold text-purple-900">Class Teacher In-Charge</h4>
                      <p className="text-[11px] text-purple-700">Manages academic schedules, attendance, and timetable for {selectedTeacher.class_teacher_class}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold shadow-xs">
                    {selectedTeacher.class_teacher_class}
                  </span>
                </div>
              )}

              {/* Contact Information */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mb-1">
                      <LuMail className="w-3.5 h-3.5 text-primary-600" /> Official Email (Login ID)
                    </div>
                    <div className="text-xs font-bold text-slate-800 select-all">{selectedTeacher.email}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mb-1">
                      <LuPhone className="w-3.5 h-3.5 text-primary-600" /> Mobile Number
                    </div>
                    <div className="text-xs font-bold text-slate-800">{selectedTeacher.phone || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Academic & Professional Details */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Academic & Employment Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-medium mb-1">Qualification</div>
                    <div className="text-xs font-bold text-slate-800">{selectedTeacher.qualification || 'Not Specified'}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-medium mb-1">Experience</div>
                    <div className="text-xs font-bold text-slate-800">{selectedTeacher.experience ? `${selectedTeacher.experience} Years` : 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Compensation & Salary Breakdown */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Monthly Compensation & Net Payable
                </h4>
                {(() => {
                  const b = Number(selectedTeacher.salary || 50000);
                  const a = Number(selectedTeacher.allowance || 0);
                  const gross = b + a;
                  const ded = Math.round(gross * 0.12);
                  const net = gross - ded;
                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                        <div className="text-[11px] text-slate-400 font-medium mb-1">Base Salary</div>
                        <div className="text-xs font-bold text-slate-900 font-mono">₹{b.toLocaleString('en-IN')}</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                        <div className="text-[11px] text-slate-400 font-medium mb-1">Allowance</div>
                        <div className="text-xs font-bold text-emerald-700 font-mono">+ ₹{a.toLocaleString('en-IN')}</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                        <div className="text-[11px] text-slate-400 font-medium mb-1">12% Deduction</div>
                        <div className="text-xs font-bold text-rose-600 font-mono">- ₹{ded.toLocaleString('en-IN')}</div>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300">
                        <div className="text-[11px] text-emerald-800 font-bold mb-1">Net Payable</div>
                        <div className="text-xs font-bold text-emerald-900 font-mono">₹{net.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Assigned Subjects & Classes */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Teaching Subjects & Classes
                </h4>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block mb-1">Assigned Subjects:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.isArray(selectedTeacher.assigned_subjects) && selectedTeacher.assigned_subjects.length > 0 ? (
                        selectedTeacher.assigned_subjects.map((sub, i) => (
                          <span key={i} className="px-2.5 py-0.5 bg-white border border-primary-200 text-primary-800 rounded-lg text-xs font-semibold">
                            {sub}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No subjects assigned.</span>
                      )}
                    </div>
                  </div>
                  {Array.isArray(selectedTeacher.assigned_classes) && selectedTeacher.assigned_classes.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="text-[11px] text-slate-400 font-medium block mb-1">Assigned Classes:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTeacher.assigned_classes.map((cls, i) => (
                          <span key={i} className="px-2.5 py-0.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold">
                            {cls}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                onClick={() => setSelectedTeacher(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overwrite Class Teacher Confirmation Modal */}
      {overwriteModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-200 animate-scale-up space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
                <LuCircleAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Overwrite Class Teacher?</h3>
                <p className="text-xs text-slate-500">
                  {overwriteModalData.targetClass} ({overwriteModalData.targetDivision}) is already assigned
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-slate-700 space-y-2.5">
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                <span className="font-semibold text-slate-500">Target Class:</span>
                <span className="font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-lg">
                  {overwriteModalData.targetClass} ({overwriteModalData.targetDivision})
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                <span className="font-semibold text-slate-500">Current In-Charge:</span>
                <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  {overwriteModalData.currentTeacherName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">New In-Charge:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {overwriteModalData.newTeacherName}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>{overwriteModalData.currentTeacherName}</strong> is currently assigned as the Class Teacher for this class. Do you want to overwrite and reassign this class to <strong>{overwriteModalData.newTeacherName}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setOverwriteModalData(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel / Keep Existing
              </button>
              <button
                type="button"
                onClick={() => {
                  const action = overwriteModalData.actionType;
                  setOverwriteModalData(null);
                  if (action === 'add') {
                    handleAddSubmit(null, true);
                  } else {
                    handleEditSubmit(null, true);
                  }
                }}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-xs cursor-pointer"
              >
                Yes, Overwrite & Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Modal Display */}
      <CredentialsModal
        isOpen={!!credentialsModalData}
        onClose={() => setCredentialsModalData(null)}
        credentials={credentialsModalData}
        title="Staff Login Credentials"
      />
    </div>
  );
}
