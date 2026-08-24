import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import CredentialsModal from '../../components/Common/CredentialsModal';
import {
  LuGraduationCap,
  LuSearch,
  LuUserPlus,
  LuX,
  LuPhone,
  LuMail,
  LuTrash2,
  LuEye,
  LuLoader,
  LuCheck,
  LuCircleCheck,
  LuBuilding2,
  LuLayers,
} from 'react-icons/lu';

const STANDARD_CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12'
];

const STANDARD_DIVISIONS = [
  { id: 'Saffron (A)', name: 'Saffron (A)' },
  { id: 'White (B)', name: 'White (B)' },
  { id: 'Green (C)', name: 'Green (C)' },
];

export default function StudentRecordsPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('ALL');
  const [selectedSectionId, setSelectedSectionId] = useState('ALL');

  // Modals & form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deleteTargetStudent, setDeleteTargetStudent] = useState(null);
  const [credentialsModalData, setCredentialsModalData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [modalError, setModalError] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    roll_number: '',
    school_class_id: 'Class 1',
    section_id: 'Saffron (A)',
    gender: 'Male',
    blood_group: 'O+',
    date_of_birth: '2012-05-15',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
    guardian_relation: 'Father',
    address: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsRes, classesRes] = await Promise.all([
        adminService.getStudents({
          search: searchQuery,
          school_class_id: selectedClassId,
          section_id: selectedSectionId,
        }),
        adminService.getClasses(),
      ]);

      if (studentsRes.success && studentsRes.data) {
        setStudents(studentsRes.data.data || studentsRes.data || []);
      }
      if (classesRes.success && classesRes.data && classesRes.data.length > 0) {
        setClasses(classesRes.data);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedClassId, selectedSectionId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);
    try {
      const res = await adminService.createStudent(formData);
      if (res.success) {
        setShowAddModal(false);
        setModalError(null);
        setFormData({
          first_name: '',
          last_name: '',
          roll_number: '',
          school_class_id: 'Class 1',
          section_id: 'Saffron (A)',
          gender: 'Male',
          blood_group: 'O+',
          date_of_birth: '2012-05-15',
          guardian_name: '',
          guardian_phone: '',
          guardian_email: '',
          guardian_relation: 'Father',
          address: '',
        });
        loadData();
        showToast('Student enrolled successfully with parent login credentials!');

        if (res.credentials) {
          setCredentialsModalData(res.credentials);
        }
      } else {
        setModalError(res.message || 'Failed to enroll student.');
      }
    } catch (err) {
      const errMsg = err.data?.message || err.message || 'Failed to enroll student. Please check the fields.';
      setModalError(errMsg);
      showToast(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetStudent) return;
    try {
      await adminService.deleteStudent(deleteTargetStudent.id);
      setDeleteTargetStudent(null);
      loadData();
      showToast('Student record deactivated and soft-deleted.');
    } catch {
      showToast('Failed to delete student.');
    }
  };

  // Ensure all standard grades are always available in order
  const dbClassMap = new Map(classes.map((c) => [c.name.toLowerCase().trim(), c]));
  const classesList = STANDARD_CLASSES.map((name) => {
    return dbClassMap.get(name.toLowerCase().trim()) || { id: name, name };
  });

  const formClassObj = classes.find((c) => String(c.id) === String(formData.school_class_id) || c.name === formData.school_class_id);
  const formSections = formClassObj?.sections && formClassObj.sections.length > 0 ? formClassObj.sections : STANDARD_DIVISIONS;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-scale-up border border-slate-700">
          <LuCircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-primary-500/20">
            <LuGraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-slate-800 leading-tight">Student Enrollment & Class Records</h1>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Add student details, assign class & division, and generate parent login credentials
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all flex items-center gap-2 w-full sm:w-auto justify-center self-start sm:self-auto shrink-0"
        >
          <LuUserPlus className="w-4 h-4" /> Add Student Details
        </button>
      </div>

      {/* Class & Division Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, roll no, parent phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              setSelectedSectionId('ALL');
            }}
            className="w-full sm:w-auto px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-primary-500 cursor-pointer"
          >
            <option value="ALL">All Classes / Grades</option>
            {classesList.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="w-full sm:w-auto px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-primary-500 cursor-pointer"
          >
            <option value="ALL">All Divisions</option>
            <option value="Saffron (A)">Division Saffron (A)</option>
            <option value="White (B)">Division White (B)</option>
            <option value="Green (C)">Division Green (C)</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-8 sm:p-12 text-center">
          <LuLoader className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading student records from database...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LuGraduationCap className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No Student Records Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
            Click the button below to enroll a student and generate their parent login credentials.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <LuUserPlus className="w-4 h-4" /> Add First Student
          </button>
        </div>
      ) : (
        <>
          {/* Mobile View: Student Cards (2 columns) */}
          <div className="sm:hidden grid grid-cols-2 gap-2.5">
            {students.map((student) => (
              <div
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2 cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                      {student.first_name?.[0]}{student.last_name?.[0] || ''}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-xs truncate">
                        {student.first_name} {student.last_name?.[0] ? student.last_name[0] + '.' : ''}
                      </p>
                      <p className="text-[10px] text-slate-400">Roll: {student.roll_number || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="font-mono text-primary-700 font-bold bg-primary-50 px-1.5 py-0.5 rounded border border-primary-100 text-[10px] block w-fit">
                      {student.admission_number}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 truncate block">
                      {student.school_class?.name || 'Class ' + (student.school_class_id || '')}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                    {student.status || 'Active'}
                  </span>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setDeleteTargetStudent(student)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <LuTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">Student Name & Roll</th>
                    <th className="px-5 py-3.5">Admission Number</th>
                    <th className="px-5 py-3.5">Class & Division</th>
                    <th className="px-5 py-3.5">Parent / Guardian (Login ID)</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {student.first_name?.[0]}{student.last_name?.[0] || ''}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{student.first_name} {student.last_name || ''}</div>
                            <div className="text-[11px] text-slate-400">Roll: {student.roll_number || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-primary-700 font-bold bg-primary-50 px-2 py-0.5 rounded border border-primary-100 text-[11px]">
                          {student.admission_number}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-700">
                          {student.school_class?.name || 'Class ' + (student.school_class_id || '')}
                          {student.section ? ` - Division ${student.section.name.replace(/^Division\s*/i, '')}` : ''}
                        </span>
                      </td>
                      <td className="px-5 py-4 space-y-0.5">
                        <div className="font-semibold text-slate-800">{student.guardian_name}</div>
                        <div className="flex items-center gap-1.5 text-primary-700 font-mono text-[11px] font-bold">
                          <LuPhone className="w-3 h-3 text-slate-400" />
                          <span>{student.guardian_phone}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {student.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            title="View Profile"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          >
                            <LuEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetStudent(student)}
                            title="Delete Student"
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
        </>
      )}

      {/* Add New Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full my-4 sm:my-8 overflow-hidden animate-scale-up">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <LuUserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Add Student Details</h3>
                  <p className="text-primary-100 text-xs">Parent login will be auto-generated with their mobile number</p>
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
            <form onSubmit={handleAddSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-[75vh] overflow-y-auto">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <span className="font-bold">Error:</span> {modalError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="e.g. Aarav"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="e.g. Patel"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Class / Grade <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.school_class_id}
                    onChange={(e) => setFormData({ ...formData, school_class_id: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-semibold"
                  >
                    {classesList.map((c) => (
                      <option key={c.id} value={c.id || c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Division <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.section_id}
                    onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-semibold"
                  >
                    {formSections.map((s) => (
                      <option key={s.id} value={s.name || s.id}>
                        Division {s.name.replace(/^Division\s*/i, '')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Roll Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.roll_number}
                    onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                    placeholder="e.g. 1"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={formData.blood_group}
                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Guardian / Parent Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.guardian_name}
                    onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                    placeholder="e.g. Rajesh Patel"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Parent Mobile Number (Login ID) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.guardian_phone}
                    onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                    placeholder="e.g. 9812345601"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Parent Email</label>
                  <input
                    type="email"
                    value={formData.guardian_email}
                    onChange={(e) => setFormData({ ...formData, guardian_email: e.target.value })}
                    placeholder="rajesh.patel@gmail.com"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
                  <input
                    type="text"
                    value={formData.guardian_relation}
                    onChange={(e) => setFormData({ ...formData, guardian_relation: e.target.value })}
                    placeholder="Father / Mother / Guardian"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <strong>Parent Credentials:</strong> A random temporary password will be auto-generated for the parent mobile login ID upon submission. Provide this password to the parent.
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
                  {submitting ? 'Adding...' : 'Add Student & Generate Parent Pass'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center animate-scale-up">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LuTrash2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Remove Student?</h3>
            <p className="text-xs text-slate-500 mb-6">
              Are you sure you want to remove <strong>{deleteTargetStudent.first_name} {deleteTargetStudent.last_name}</strong>?
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setDeleteTargetStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile View Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full my-4 sm:my-8 overflow-hidden animate-scale-up">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-700 p-6 text-white relative">
              <button
                onClick={() => setSelectedStudent(null)}
                className="absolute right-4 top-4 w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center text-xl font-bold border border-white/30 shrink-0">
                  {selectedStudent.first_name?.[0] || 'S'}{selectedStudent.last_name?.[0] || ''}
                </div>
                <div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                    <h2 className="text-xl font-bold">
                      {selectedStudent.first_name} {selectedStudent.last_name || ''}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-md bg-white/25 text-white font-mono text-xs font-bold">
                      {selectedStudent.admission_number}
                    </span>
                  </div>
                  <p className="text-primary-100 text-xs">
                    {selectedStudent.school_class?.name || 'Class ' + (selectedStudent.school_class_id || '')}
                    {selectedStudent.section ? ` (Division ${selectedStudent.section.name})` : ''} • Roll: {selectedStudent.roll_number || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Content Body */}
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium">Academic Class:</span>
                  <span className="font-bold text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                    {selectedStudent.school_class?.name || 'Class ' + (selectedStudent.school_class_id || '')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium">Status:</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {selectedStudent.status || 'Active'}
                  </span>
                </div>
              </div>

              {/* Personal Details */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Student Personal Profile
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-medium mb-1">Gender</div>
                    <div className="text-xs font-bold text-slate-800">{selectedStudent.gender || 'Not Specified'}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-medium mb-1">Blood Group</div>
                    <div className="text-xs font-bold text-slate-800">{selectedStudent.blood_group || 'N/A'}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-medium mb-1">Date of Birth</div>
                    <div className="text-xs font-bold text-slate-800">
                      {selectedStudent.date_of_birth
                        ? new Date(selectedStudent.date_of_birth).toLocaleDateString()
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Parent Details */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Parent / Guardian Login Profile
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-medium mb-1">Guardian Name</div>
                    <div className="text-xs font-bold text-slate-800">{selectedStudent.guardian_name}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mb-1">
                      <LuPhone className="w-3.5 h-3.5 text-primary-600" /> Parent Mobile (Login ID)
                    </div>
                    <div className="text-xs font-bold text-primary-700 font-mono select-all">
                      {selectedStudent.guardian_phone}
                    </div>
                  </div>
                  {selectedStudent.guardian_email && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mb-1">
                        <LuMail className="w-3.5 h-3.5 text-slate-400" /> Parent Email
                      </div>
                      <div className="text-xs font-bold text-slate-800">{selectedStudent.guardian_email}</div>
                    </div>
                  )}
                  {selectedStudent.guardian_relation && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="text-[11px] text-slate-400 font-medium mb-1">Relationship</div>
                      <div className="text-xs font-bold text-slate-800">{selectedStudent.guardian_relation}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      <CredentialsModal
        isOpen={!!credentialsModalData}
        onClose={() => setCredentialsModalData(null)}
        credentials={credentialsModalData}
        title="Parent Login Credentials"
      />
    </div>
  );
}
