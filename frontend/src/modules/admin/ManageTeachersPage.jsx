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

export default function ManageTeachersPage() {
  const [teachers, setTeachers] = useState([]);
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
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // New Teacher Form
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: 'Mathematics',
    qualification: '',
    experience: '',
    salary: '',
    joining_date: new Date().toISOString().split('T')[0],
    assigned_subjects: '',
    assigned_classes: '',
    class_teacher_class: '',
    address: '',
    emergency_contact: '',
    status: 'Active',
  });
  const [isCustomDept, setIsCustomDept] = useState(false);
  const [customDept, setCustomDept] = useState('');

  // Edit Teacher Form
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: 'Mathematics',
    qualification: '',
    experience: '',
    salary: '',
    assigned_subjects: '',
    assigned_classes: '',
    class_teacher_class: '',
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
      if (res.success && res.data) {
        setTeachers(res.data.data || res.data || []);
      }
    } catch (err) {
      console.error('Failed to load teachers:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const finalDept = (isCustomDept ? customDept : formData.department)?.trim();
      if (!finalDept) {
        showToast('Please specify or enter a valid department name.');
        setSubmitting(false);
        return;
      }

      const payload = {
        ...formData,
        department: finalDept,
        class_teacher_class: formData.class_teacher_class || null,
        assigned_subjects: formData.assigned_subjects
          ? formData.assigned_subjects.split(',').map((s) => s.trim())
          : [],
        assigned_classes: formData.assigned_classes
          ? formData.assigned_classes.split(',').map((c) => c.trim())
          : [],
      };

      const res = await adminService.createTeacher(payload);
      if (res.success) {
        setShowAddModal(false);
        setIsCustomDept(false);
        setCustomDept('');
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          department: 'Mathematics',
          qualification: '',
          experience: '',
          salary: '',
          joining_date: new Date().toISOString().split('T')[0],
          assigned_subjects: '',
          assigned_classes: '',
          class_teacher_class: '',
          address: '',
          emergency_contact: '',
          status: 'Active',
        });
        loadTeachers();
        showToast('Teacher created successfully with generated login credentials!');

        // Display generated credentials modal
        if (res.credentials) {
          setCredentialsModalData(res.credentials);
        }
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to create teacher.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setEditFormData({
      first_name: teacher.first_name || '',
      last_name: teacher.last_name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      department: teacher.department || 'Mathematics',
      qualification: teacher.qualification || '',
      experience: teacher.experience || '',
      salary: teacher.salary || '',
      assigned_subjects: Array.isArray(teacher.assigned_subjects) ? teacher.assigned_subjects.join(', ') : '',
      assigned_classes: Array.isArray(teacher.assigned_classes) ? teacher.assigned_classes.join(', ') : '',
      class_teacher_class: teacher.class_teacher_class || '',
      address: teacher.address || '',
      emergency_contact: teacher.emergency_contact || '',
      status: teacher.status || 'Active',
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingTeacher) return;
    setSubmitting(true);
    try {
      const payload = {
        ...editFormData,
        class_teacher_class: editFormData.class_teacher_class || null,
        assigned_subjects: editFormData.assigned_subjects
          ? editFormData.assigned_subjects.split(',').map((s) => s.trim())
          : [],
        assigned_classes: editFormData.assigned_classes
          ? editFormData.assigned_classes.split(',').map((c) => c.trim())
          : [],
      };

      await adminService.updateTeacher(editingTeacher.id, payload);
      setEditingTeacher(null);
      loadTeachers();
      showToast('Teacher details & class assignment updated successfully!');
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to update teacher.');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-primary-500/20">
            <LuUsers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Faculty & Staff Management</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Add staff members, assign Class Teachers, auto-generate login credentials, and manage classes
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <LuUserPlus className="w-4 h-4" /> Add New Staff Member
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, subject, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-primary-500"
          >
            <option value="ALL">All Departments</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
            <option value="English">English</option>
            <option value="Social Studies">Social Studies</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Languages">Languages</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-primary-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Teachers Directory Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <LuLoader className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading faculty directory...</p>
        </div>
      ) : teachers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LuUsers className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No Faculty Records Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
            There are currently no staff members registered in the database. Click the button below to onboard your first teacher.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <LuUserPlus className="w-4 h-4" /> Add First Teacher
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Staff Name & ID</th>
                  <th className="px-5 py-3.5">Class Teacher Role</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Contact Info</th>
                  <th className="px-5 py-3.5">Assigned Subjects</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {teacher.first_name?.[0] || 'T'}{teacher.last_name?.[0] || ''}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{teacher.first_name} {teacher.last_name || ''}</div>
                          <div className="text-[11px] text-primary-600 font-mono font-semibold">{teacher.teacher_id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Class Teacher Assignment */}
                    <td className="px-5 py-4">
                      {teacher.class_teacher_class ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-bold text-[11px]">
                          <LuAward className="w-3.5 h-3.5 text-purple-600" />
                          <span>{teacher.class_teacher_class}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Subject Teacher</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {teacher.department || 'General'}
                      </span>
                    </td>
                    <td className="px-5 py-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <LuMail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{teacher.email}</span>
                      </div>
                      {teacher.phone && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <LuPhone className="w-3 h-3" />
                          <span>{teacher.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {Array.isArray(teacher.assigned_subjects) && teacher.assigned_subjects.length > 0 ? (
                          teacher.assigned_subjects.map((sub, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-primary-50 text-primary-700 text-[10px] font-semibold border border-primary-100">
                              {sub}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Not assigned</span>
                        )}
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
                          className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                          <LuEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(teacher)}
                          title="Edit & Assign Class"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <LuPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetTeacher(teacher)}
                          title="Remove Teacher"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <LuTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
                  <p className="text-primary-100 text-xs">Assign Class Teacher role and auto-generate staff login credentials</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
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
                    placeholder="teacher@school.com"
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

              {/* Class Teacher Assignment */}
              <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2">
                <div className="flex items-center gap-2">
                  <LuAward className="w-4 h-4 text-purple-600" />
                  <label className="text-xs font-bold text-purple-900">Assign as Class Teacher (Homeroom In-Charge)</label>
                </div>
                <select
                  value={formData.class_teacher_class}
                  onChange={(e) => setFormData({ ...formData, class_teacher_class: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-purple-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                >
                  <option value="">None (Subject Teacher Only)</option>
                  <option value="Class 10">Class 10 (Grade 10th)</option>
                  <option value="Class 9">Class 9 (Grade 9th)</option>
                  <option value="Class 8">Class 8 (Grade 8th)</option>
                  <option value="Class 7">Class 7 (Grade 7th)</option>
                  <option value="Class 6">Class 6 (Grade 6th)</option>
                </select>
                <p className="text-[11px] text-purple-700">
                  Teachers assigned as Class Teacher will manage class attendance, syllabus progress, and weekly period timetables.
                </p>
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
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
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
                  <h3 className="font-bold text-base">Edit Faculty Details & Class Assignment</h3>
                  <p className="text-amber-100 text-xs">Update teacher profile, assign class teacher status, or modify subjects</p>
                </div>
              </div>
              <button
                onClick={() => setEditingTeacher(null)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
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

              {/* Class Teacher Assignment */}
              <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2">
                <div className="flex items-center gap-2">
                  <LuAward className="w-4 h-4 text-purple-600" />
                  <label className="text-xs font-bold text-purple-900">Assign as Class Teacher (Homeroom In-Charge)</label>
                </div>
                <select
                  value={editFormData.class_teacher_class}
                  onChange={(e) => setEditFormData({ ...editFormData, class_teacher_class: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-purple-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                >
                  <option value="">None (Subject Teacher Only)</option>
                  <option value="Class 10">Class 10 (Grade 10th)</option>
                  <option value="Class 9">Class 9 (Grade 9th)</option>
                  <option value="Class 8">Class 8 (Grade 8th)</option>
                  <option value="Class 7">Class 7 (Grade 7th)</option>
                  <option value="Class 6">Class 6 (Grade 6th)</option>
                </select>
                <p className="text-[11px] text-purple-700">
                  Assigning a teacher to Class 10th will enable them to create and manage the weekly timetable for that class.
                </p>
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
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
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
                    <span className="px-2.5 py-0.5 rounded-md bg-white/25 text-white font-mono text-xs font-bold">
                      {selectedTeacher.teacher_id}
                    </span>
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-medium mb-1">Qualification</div>
                    <div className="text-xs font-bold text-slate-800">{selectedTeacher.qualification || 'Not Specified'}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-medium mb-1">Experience</div>
                    <div className="text-xs font-bold text-slate-800">{selectedTeacher.experience ? `${selectedTeacher.experience} Years` : 'N/A'}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-medium mb-1">Monthly Salary</div>
                    <div className="text-xs font-bold text-slate-800">{selectedTeacher.salary ? `₹${parseFloat(selectedTeacher.salary).toLocaleString()}` : 'N/A'}</div>
                  </div>
                </div>
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
