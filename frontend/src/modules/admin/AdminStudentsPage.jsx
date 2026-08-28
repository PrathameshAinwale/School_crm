import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import CredentialsModal from '../../components/Common/CredentialsModal';
import {
  LuGraduationCap,
  LuSearch,
  LuEye,
  LuPencil,
  LuTrash2,
  LuPhone,
  LuMail,
  LuLoader,
  LuX,
  LuBuilding2,
  LuLayers,
  LuUsers,
  LuChevronRight,
  LuArrowLeft,
  LuUserPlus,
  LuCheck,
  LuCircleCheck,
  LuMapPin,
  LuRefreshCw,
} from 'react-icons/lu';

const STANDARD_CLASSES = [
  { id: 'Nursery', name: 'Nursery' },
  { id: 'LKG', name: 'LKG' },
  { id: 'UKG', name: 'UKG' },
  { id: 'Class 1', name: 'Class 1' },
  { id: 'Class 2', name: 'Class 2' },
  { id: 'Class 3', name: 'Class 3' },
  { id: 'Class 4', name: 'Class 4' },
  { id: 'Class 5', name: 'Class 5' },
  { id: 'Class 6', name: 'Class 6' },
  { id: 'Class 7', name: 'Class 7' },
  { id: 'Class 8', name: 'Class 8' },
  { id: 'Class 9', name: 'Class 9' },
  { id: 'Class 10', name: 'Class 10' },
  { id: 'Class 11', name: 'Class 11' },
  { id: 'Class 12', name: 'Class 12' },
];

const DIVISIONS = [
  {
    id: 'Saffron (A)',
    name: 'Saffron (A)',
    tag: 'A',
    color: 'from-amber-500 to-orange-500',
    border: 'border-amber-200',
    bg: 'bg-amber-50/70',
    text: 'text-amber-800',
    accent: 'bg-amber-500',
  },
  {
    id: 'White (B)',
    name: 'White (B)',
    tag: 'B',
    color: 'from-slate-600 to-slate-800',
    border: 'border-slate-300',
    bg: 'bg-slate-50',
    text: 'text-slate-800',
    accent: 'bg-slate-700',
  },
  {
    id: 'Green (C)',
    name: 'Green (C)',
    tag: 'C',
    color: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50/70',
    text: 'text-emerald-800',
    accent: 'bg-emerald-500',
  },
];

export default function AdminStudentsPage() {
  const [allStudents, setAllStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Drill-down navigation state
  // activeClass: null | string (e.g. 'Class 10')
  // activeDivision: null | string (e.g. 'Saffron (A)')
  const [activeClass, setActiveClass] = useState(null);
  const [activeDivision, setActiveDivision] = useState(null);

  // Search & Profile Modal
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Add Student State
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [credentialsModalData, setCredentialsModalData] = useState(null);

  // Edit Student State
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    admission_number: '',
    roll_number: '',
    school_class_id: 'Class 10',
    section_id: 'Saffron (A)',
    date_of_birth: '2012-05-15',
    gender: 'Male',
    blood_group: 'O+',
    father_name: '',
    father_occupation: '',
    mother_name: '',
    mother_occupation: '',
    guardian_phone: '',
    guardian_email: '',
    guardian_relation: 'Father',
    address: '',
    emergency_contact: '',
    status: 'Active',
  });
  const [editModalError, setEditModalError] = useState(null);

  // Delete Target State
  const [deleteTargetStudent, setDeleteTargetStudent] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    roll_number: '',
    school_class_id: 'Class 10',
    section_id: 'Saffron (A)',
    date_of_birth: '2012-05-15',
    gender: 'Male',
    blood_group: 'O+',
    father_name: '',
    father_occupation: '',
    mother_name: '',
    mother_occupation: '',
    guardian_phone: '',
    guardian_email: '',
    guardian_relation: 'Father',
    address: '',
    emergency_contact: '',
    with_transport: false,
  });

  // Load all students and classes from API
  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsRes, classesRes] = await Promise.all([
        adminService.getStudents({ per_page: 500 }),
        adminService.getClasses(),
      ]);

      if (studentsRes.success && studentsRes.data) {
        const studentList = Array.isArray(studentsRes.data)
          ? studentsRes.data
          : (studentsRes.data.data || []);
        setAllStudents(studentList);
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
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openAddStudentModal = (presetClass = null, presetDivision = null) => {
    setFormData({
      first_name: '',
      last_name: '',
      roll_number: '',
      school_class_id: presetClass || activeClass || 'Class 10',
      section_id: presetDivision || activeDivision || 'Saffron (A)',
      date_of_birth: '2012-05-15',
      gender: 'Male',
      blood_group: 'O+',
      father_name: '',
      father_occupation: '',
      mother_name: '',
      mother_occupation: '',
      guardian_phone: '',
      guardian_email: '',
      guardian_relation: 'Father',
      address: '',
      emergency_contact: '',
    });
    setModalError(null);
    setShowAddModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);
    try {
      const payload = {
        ...formData,
        guardian_name: formData.father_name || formData.mother_name || 'Parent',
      };

      const res = await adminService.createStudent(payload);
      if (res.success) {
        setShowAddModal(false);
        setModalError(null);
        await loadData();
        showToast('Student enrolled into class successfully with parent credentials!');

        if (res.credentials) {
          setCredentialsModalData(res.credentials);
        }
      } else {
        setModalError(res.message || 'Failed to enroll student.');
      }
    } catch (err) {
      const errMsg = err.data?.message || err.message || 'Failed to enroll student. Please check fields.';
      setModalError(errMsg);
      showToast(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (student) => {
    const className = student.school_class?.name || (student.school_class_id ? `Class ${student.school_class_id}` : (activeClass || 'Class 10'));
    const secName = student.section?.name || student.section_id || (activeDivision || 'Saffron (A)');

    setEditingStudent(student);
    setEditFormData({
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      admission_number: student.admission_number || '',
      roll_number: student.roll_number || '',
      school_class_id: className,
      section_id: secName,
      date_of_birth: student.date_of_birth ? String(student.date_of_birth).substring(0, 10) : '2012-05-15',
      gender: student.gender || 'Male',
      blood_group: student.blood_group || 'O+',
      father_name: student.father_name || student.guardian_name || '',
      father_occupation: student.father_occupation || '',
      mother_name: student.mother_name || '',
      mother_occupation: student.mother_occupation || '',
      guardian_phone: student.guardian_phone || '',
      guardian_email: student.guardian_email || '',
      guardian_relation: student.guardian_relation || 'Father',
      address: student.address || '',
      emergency_contact: student.emergency_contact || '',
      status: student.status || 'Active',
    });
    setEditModalError(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    setSubmitting(true);
    setEditModalError(null);
    try {
      const payload = {
        ...editFormData,
        guardian_name: editFormData.father_name || editFormData.mother_name || 'Parent',
      };

      const res = await adminService.updateStudent(editingStudent.id, payload);
      if (res.success) {
        setEditingStudent(null);
        setEditModalError(null);
        await loadData();
        showToast('Student information updated successfully!');
      } else {
        setEditModalError(res.message || 'Failed to update student.');
      }
    } catch (err) {
      const errMsg = err.data?.message || err.message || 'Failed to update student details.';
      setEditModalError(errMsg);
      showToast(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetStudent) return;
    setSubmitting(true);
    try {
      const res = await adminService.deleteStudent(deleteTargetStudent.id);
      if (res.success) {
        setDeleteTargetStudent(null);
        await loadData();
        showToast('Student record deactivated and deleted successfully.');
      } else {
        showToast(res.message || 'Failed to delete student.');
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to delete student.');
    } finally {
      setSubmitting(false);
    }
  };

  const dbClassMap = new Map(classes.map((c) => [c.name.toLowerCase().trim(), c]));
  const classesList = STANDARD_CLASSES.map((item) => {
    const name = item.name || item;
    return dbClassMap.get(name.toLowerCase().trim()) || { id: name, name };
  });

  // Robust matching helper to count students for a given class & division
  const getStudentCount = (className, divisionName = null) => {
    const cleanClassName = String(className).toLowerCase().replace('class ', '').trim();

    return allStudents.filter((s) => {
      const sClassName = s.school_class?.name || (s.school_class_id ? (typeof s.school_class_id === 'string' ? s.school_class_id : `Class ${s.school_class_id}`) : '');
      const cleanSClass = String(sClassName).toLowerCase().replace('class ', '').trim();
      
      const classMatch = cleanSClass === cleanClassName || sClassName.toLowerCase().trim() === String(className).toLowerCase().trim() || String(s.school_class_id) === String(className);
      if (!classMatch) return false;

      if (!divisionName) return true;

      const studentSec = s.section?.name || s.section_id || '';
      const cleanSec = String(studentSec).toLowerCase().replace('division ', '').trim();
      const cleanDiv = String(divisionName).toLowerCase().replace('division ', '').trim();

      return cleanSec.includes(cleanDiv) || cleanDiv.includes(cleanSec) || String(studentSec).toLowerCase().includes(String(divisionName).toLowerCase());
    }).length;
  };

  // Filter students for the active view
  const currentRoster = allStudents.filter((s) => {
    if (!activeClass) return false;

    const cleanActiveClass = String(activeClass).toLowerCase().replace('class ', '').trim();
    const sClassName = s.school_class?.name || (s.school_class_id ? (typeof s.school_class_id === 'string' ? s.school_class_id : `Class ${s.school_class_id}`) : '');
    const cleanSClass = String(sClassName).toLowerCase().replace('class ', '').trim();
    const classMatch = cleanSClass === cleanActiveClass || sClassName.toLowerCase().trim() === String(activeClass).toLowerCase().trim() || String(s.school_class_id) === String(activeClass);
    if (!classMatch) return false;

    if (activeDivision) {
      const studentSec = s.section?.name || s.section_id || '';
      const cleanSec = String(studentSec).toLowerCase().replace('division ', '').trim();
      const cleanDiv = String(activeDivision).toLowerCase().replace('division ', '').trim();
      const divMatch = cleanSec.includes(cleanDiv) || cleanDiv.includes(cleanSec) || String(studentSec).toLowerCase().includes(String(activeDivision).toLowerCase());
      if (!divMatch) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const name = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
      const roll = String(s.roll_number || '').toLowerCase();
      const adm = String(s.admission_number || '').toLowerCase();
      const phone = String(s.guardian_phone || '').toLowerCase();
      const father = String(s.father_name || s.guardian_name || '').toLowerCase();
      const mother = String(s.mother_name || '').toLowerCase();
      return name.includes(q) || roll.includes(q) || adm.includes(q) || phone.includes(q) || father.includes(q) || mother.includes(q);
    }

    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-scale-up border border-slate-700">
          <LuCircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
            <LuGraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-xl font-bold text-slate-800 leading-tight">Student Directory & Enrollment</h1>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] sm:text-[11px] border border-emerald-200">
                Admin Management
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Browse classes, divisions & enrolled student profiles
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={loadData}
            title="Refresh student list"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <LuRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold">
            <LuUsers className="w-4 h-4 text-emerald-600" />
            <span>Total: <strong>{allStudents.length}</strong> Students</span>
          </div>

          <button
            onClick={() => openAddStudentModal()}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <LuUserPlus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      {/* Interactive Breadcrumb Bar */}
      <div className="bg-white px-3.5 sm:px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-2 sm:gap-3 text-xs">
        <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500 font-medium overflow-x-auto">
          <button
            onClick={() => {
              setActiveClass(null);
              setActiveDivision(null);
            }}
            className={`hover:text-emerald-600 transition-colors font-bold whitespace-nowrap cursor-pointer ${
              !activeClass ? 'text-emerald-700 font-bold' : ''
            }`}
          >
            All Classes
          </button>

          {activeClass && (
            <>
              <LuChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <button
                onClick={() => setActiveDivision(null)}
                className={`hover:text-emerald-600 transition-colors font-bold whitespace-nowrap cursor-pointer ${
                  !activeDivision ? 'text-emerald-700 font-bold' : ''
                }`}
              >
                {activeClass}
              </button>
            </>
          )}

          {activeDivision && (
            <>
              <LuChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-emerald-700 font-bold whitespace-nowrap">
                Division {activeDivision}
              </span>
            </>
          )}
        </div>

        {activeClass && (
          <button
            onClick={() => {
              if (activeDivision) {
                setActiveDivision(null);
              } else {
                setActiveClass(null);
              }
            }}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors text-xs cursor-pointer"
          >
            <LuArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        )}
      </div>

      {/* LEVEL 1: CLASS SELECTION CARDS */}
      {!activeClass && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
              <LuBuilding2 className="w-4 h-4 text-emerald-600" />
              <span>Select Academic Class</span>
            </h2>
            <span className="text-xs text-slate-400">Click any class card to view division rosters</span>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 flex flex-col items-center justify-center min-h-[300px]">
              <LuLoader className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading classes and student counts...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {classesList.map((cls) => {
                const count = getStudentCount(cls.name);
                return (
                  <div
                    key={cls.name}
                    onClick={() => setActiveClass(cls.name)}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between text-center relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base mx-auto mb-3 group-hover:scale-110 transition-transform">
                      {cls.name.replace('Class ', '')}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {cls.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        <strong className={`font-mono text-sm ${count > 0 ? 'text-emerald-700 font-bold' : 'text-slate-700'}`}>{count}</strong> Enrolled
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* LEVEL 2: DIVISION CARDS (WHEN A CLASS IS SELECTED) */}
      {activeClass && !activeDivision && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <LuLayers className="w-4 h-4 text-emerald-600" />
                <span>{activeClass} - Select Division</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Total {getStudentCount(activeClass)} students enrolled across all divisions in {activeClass}
              </p>
            </div>

            <button
              onClick={() => openAddStudentModal(activeClass)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <LuUserPlus className="w-4 h-4" /> Add Student to {activeClass}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DIVISIONS.map((div) => {
              const count = getStudentCount(activeClass, div.name);
              return (
                <div
                  key={div.id}
                  onClick={() => setActiveDivision(div.name)}
                  className={`bg-white p-5 rounded-2xl border ${div.border} hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${div.color} text-white font-bold flex items-center justify-center text-sm shadow-xs`}>
                      {div.tag}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${div.bg} ${div.text} border ${div.border}`}>
                      Division {div.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {div.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Enrolled: <strong className={`font-mono text-sm ${count > 0 ? 'text-emerald-700 font-bold' : 'text-slate-800'}`}>{count}</strong> Students
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
                    <span>View Student Roster</span>
                    <LuChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LEVEL 3: STUDENTS ROSTER (WHEN A DIVISION IS SELECTED) */}
      {activeClass && activeDivision && (
        <div className="space-y-4">
          {/* Top Filter & Search */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search students by name, roll no, admission no, parent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <button
              onClick={() => openAddStudentModal(activeClass, activeDivision)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 justify-center cursor-pointer shrink-0"
            >
              <LuUserPlus className="w-4 h-4" /> Enroll Student in {activeDivision}
            </button>
          </div>

          {/* Roster Table */}
          {currentRoster.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <LuUsers className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Students in this Division</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                No students enrolled in {activeClass} - Division {activeDivision} matching your query.
              </p>
              <button
                onClick={() => openAddStudentModal(activeClass, activeDivision)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <LuUserPlus className="w-4 h-4" /> Add First Student
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-5 py-3.5">Student & Roll No</th>
                      <th className="px-5 py-3.5">Parents / Guardians</th>
                      <th className="px-5 py-3.5">Blood Group</th>
                      <th className="px-5 py-3.5">Parent Mobile</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentRoster.map((student) => {
                      const fatherDisplay = student.father_name || student.guardian_name || 'Father';
                      const motherDisplay = student.mother_name;

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                                {student.first_name?.[0]}{student.last_name?.[0] || ''}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 leading-tight">
                                  {student.first_name} {student.last_name || ''}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] text-slate-400 font-semibold">
                                    Roll: {student.roll_number || 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-700 font-medium">
                            <div>
                              <span className="font-bold text-slate-800 block">
                                F: {fatherDisplay} {student.father_occupation ? `(${student.father_occupation})` : ''}
                              </span>
                              {motherDisplay && (
                                <span className="text-[11px] text-slate-500 block">
                                  M: {motherDisplay} {student.mother_occupation ? `(${student.mother_occupation})` : ''}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold rounded-md border border-rose-200 text-[11px]">
                              {student.blood_group || 'O+'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1 text-slate-700 font-mono text-xs">
                              <LuPhone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{student.guardian_phone || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              {student.status || 'Active'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedStudent(student)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                                title="View Details"
                              >
                                <LuEye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openEditModal(student)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                                title="Edit Student Record"
                              >
                                <LuPencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteTargetStudent(student)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete / Deactivate Student"
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
          )}
        </div>
      )}

      {/* Add Student Modal (Admin Full Capability) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full my-4 sm:my-8 overflow-hidden animate-scale-up">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <LuUserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Admit / Add Student to Class</h3>
                  <p className="text-emerald-100 text-xs">Record student identity, class division, parent details, and generate credentials</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Section 1: Academic & Class Placement */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <LuBuilding2 className="w-4 h-4 text-emerald-700" />
                  <label className="text-xs font-bold text-emerald-950">Academic Class Placement & Roll No</label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                      Academic Class <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.school_class_id}
                      onChange={(e) => setFormData({ ...formData, school_class_id: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer font-semibold"
                    >
                      {STANDARD_CLASSES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                      Section / Division <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.section_id}
                      onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer font-semibold"
                    >
                      <option value="Saffron (A)">Division Saffron (A)</option>
                      <option value="White (B)">Division White (B)</option>
                      <option value="Green (C)">Division Green (C)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                      Class Roll Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.roll_number}
                      onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                      placeholder="e.g. 01, 14, 25"
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Transport Transit Toggle */}
                <div className="pt-2 border-t border-emerald-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.with_transport}
                      onChange={(e) => setFormData({ ...formData, with_transport: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-emerald-950">
                      Opt for School Vehicle / Bus Transport (+ Vehicle Transit Fee)
                    </span>
                  </label>
                </div>
              </div>

              {/* Section 2: Student Personal Profile */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800">Student Identity & Demographics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      placeholder="e.g. Aarav"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      placeholder="e.g. Sharma"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Date of Birth (DOB) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Blood Group <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.blood_group}
                      onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer font-bold text-rose-700"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Parents Information (Father & Mother Names and Occupations) */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <LuUsers className="w-4 h-4 text-blue-700" />
                  <label className="text-xs font-bold text-blue-950">Parents / Guardians Details</label>
                </div>

                {/* Father Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-blue-900 mb-1">
                      Father's Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.father_name}
                      onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                      placeholder="e.g. Rajesh Sharma"
                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-blue-900 mb-1">
                      Father's Occupation
                    </label>
                    <input
                      type="text"
                      value={formData.father_occupation}
                      onChange={(e) => setFormData({ ...formData, father_occupation: e.target.value })}
                      placeholder="e.g. Civil Engineer / Business"
                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Mother Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-blue-900 mb-1">
                      Mother's Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.mother_name}
                      onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                      placeholder="e.g. Sunita Sharma"
                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-blue-900 mb-1">
                      Mother's Occupation
                    </label>
                    <input
                      type="text"
                      value={formData.mother_occupation}
                      onChange={(e) => setFormData({ ...formData, mother_occupation: e.target.value })}
                      placeholder="e.g. Professor / Homemaker"
                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Contact Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-blue-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-blue-900 mb-1">
                      Primary Contact Mobile (Login ID) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.guardian_phone}
                      onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-mono font-bold"
                    />
                    <p className="text-[10px] text-blue-700 mt-0.5">Used as Parent Mobile login number for the portal.</p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-blue-900 mb-1">
                      Parent Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.guardian_email}
                      onChange={(e) => setFormData({ ...formData, guardian_email: e.target.value })}
                      placeholder="parents@gmail.com"
                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Residential Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Residential Street Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="2"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter full residential address with flat/house no, landmark, city and pincode..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 resize-none"
                ></textarea>
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuCheck className="w-4 h-4" />}
                  {submitting ? 'Enrolling...' : 'Enroll Student & Generate Parent Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full my-4 sm:my-8 overflow-hidden animate-scale-up">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <LuPencil className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Edit Student Record</h3>
                  <p className="text-blue-100 text-xs">Update academic placement, demographics, and parent contact information</p>
                </div>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {editModalError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <span>{editModalError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Section 1: Academic & Class Placement */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <LuBuilding2 className="w-4 h-4 text-blue-700" />
                  <label className="text-xs font-bold text-blue-950">Academic Class Placement & Roll No</label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-blue-900 mb-1">
                      Admission Number
                    </label>
                    <input
                      type="text"
                      disabled
                      readOnly
                      value={editFormData.admission_number}
                      className="w-full px-3 py-2 bg-slate-100 border border-blue-200 rounded-xl text-xs text-slate-700 font-mono font-bold cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-blue-900 mb-1">
                      Academic Class <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editFormData.school_class_id}
                      onChange={(e) => setEditFormData({ ...editFormData, school_class_id: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer font-semibold"
                    >
                      {STANDARD_CLASSES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-blue-900 mb-1">
                      Section / Division <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editFormData.section_id}
                      onChange={(e) => setEditFormData({ ...editFormData, section_id: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer font-semibold"
                    >
                      <option value="Saffron (A)">Division Saffron (A)</option>
                      <option value="White (B)">Division White (B)</option>
                      <option value="Green (C)">Division Green (C)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-blue-900 mb-1">
                      Roll Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.roll_number}
                      onChange={(e) => setEditFormData({ ...editFormData, roll_number: e.target.value })}
                      placeholder="e.g. 01, 14"
                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Student Personal Profile */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800">Student Personal Profile</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.first_name}
                      onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={editFormData.last_name}
                      onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      value={editFormData.gender}
                      onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Date of Birth (DOB)
                    </label>
                    <input
                      type="date"
                      value={editFormData.date_of_birth}
                      onChange={(e) => setEditFormData({ ...editFormData, date_of_birth: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Blood Group
                    </label>
                    <select
                      value={editFormData.blood_group}
                      onChange={(e) => setEditFormData({ ...editFormData, blood_group: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer font-bold text-rose-700"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Enrollment Status
                    </label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer font-semibold"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Transferred">Transferred</option>
                      <option value="Graduated">Graduated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Parents Information */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <LuUsers className="w-4 h-4 text-amber-700" />
                  <label className="text-xs font-bold text-amber-950">Parents & Guardians Contact Information</label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                      Father's Full Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.father_name}
                      onChange={(e) => setEditFormData({ ...editFormData, father_name: e.target.value })}
                      placeholder="e.g. Rajesh Sharma"
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                      Father's Occupation
                    </label>
                    <input
                      type="text"
                      value={editFormData.father_occupation}
                      onChange={(e) => setEditFormData({ ...editFormData, father_occupation: e.target.value })}
                      placeholder="e.g. Architect"
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                      Mother's Full Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.mother_name}
                      onChange={(e) => setEditFormData({ ...editFormData, mother_name: e.target.value })}
                      placeholder="e.g. Sunita Sharma"
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                      Mother's Occupation
                    </label>
                    <input
                      type="text"
                      value={editFormData.mother_occupation}
                      onChange={(e) => setEditFormData({ ...editFormData, mother_occupation: e.target.value })}
                      placeholder="e.g. Doctor"
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                      Parent Mobile Number (Login ID) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={editFormData.guardian_phone}
                      onChange={(e) => setEditFormData({ ...editFormData, guardian_phone: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                      Parent Email
                    </label>
                    <input
                      type="email"
                      value={editFormData.guardian_email}
                      onChange={(e) => setEditFormData({ ...editFormData, guardian_email: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Residential Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Residential Street Address
                </label>
                <textarea
                  rows="2"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  placeholder="Enter full residential address..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuCheck className="w-4 h-4" />}
                  {submitting ? 'Saving Changes...' : 'Save Student Changes'}
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
              <LuTrash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Deactivate & Remove Student?</h3>
            <p className="text-xs text-slate-500 mb-6">
              Are you sure you want to remove <strong>{deleteTargetStudent.first_name} {deleteTargetStudent.last_name || ''}</strong> (Roll: {deleteTargetStudent.roll_number || 'N/A'})? This will soft-delete their profile from the active class roster.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => setDeleteTargetStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {submitting && <LuLoader className="w-3.5 h-3.5 animate-spin" />}
                <span>Yes, Delete Student</span>
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
            <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 p-6 text-white relative">
              <button
                onClick={() => setSelectedStudent(null)}
                className="absolute right-4 top-4 w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
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
                  <p className="text-emerald-100 text-xs">
                    {selectedStudent.school_class?.name || 'Class ' + (selectedStudent.school_class_id || '')}
                    {selectedStudent.section ? ` (${selectedStudent.section.name})` : ''} • Roll: {selectedStudent.roll_number || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Content Body */}
            <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium">Academic Placement:</span>
                  <span className="font-bold text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                    {selectedStudent.school_class?.name || 'Class ' + (selectedStudent.school_class_id || '')} - {selectedStudent.section?.name || 'Div A'}
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

              {/* Personal & Demographic Profile */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Student Personal & Health Profile
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-medium mb-1">Gender</div>
                    <div className="text-xs font-bold text-slate-800">{selectedStudent.gender || 'Not Specified'}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-medium mb-1">Blood Group</div>
                    <div className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md inline-block border border-rose-200">
                      {selectedStudent.blood_group || 'O+'}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-medium mb-1">Date of Birth</div>
                    <div className="text-xs font-bold text-slate-800">
                      {selectedStudent.date_of_birth
                        ? new Date(selectedStudent.date_of_birth).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Parents & Family Profile */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Parents & Guardian Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
                    <div className="text-[11px] text-blue-900 font-bold mb-1">Father's Name & Occupation</div>
                    <div className="text-xs font-bold text-slate-800">{selectedStudent.father_name || selectedStudent.guardian_name || 'Not Provided'}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{selectedStudent.father_occupation ? `Occupation: ${selectedStudent.father_occupation}` : 'Occupation: Not specified'}</div>
                  </div>
                  <div className="p-3 bg-pink-50/60 rounded-xl border border-pink-200">
                    <div className="text-[11px] text-pink-900 font-bold mb-1">Mother's Name & Occupation</div>
                    <div className="text-xs font-bold text-slate-800">{selectedStudent.mother_name || 'Not Provided'}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{selectedStudent.mother_occupation ? `Occupation: ${selectedStudent.mother_occupation}` : 'Occupation: Not specified'}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mb-1">
                      <LuPhone className="w-3.5 h-3.5 text-emerald-600" /> Parent Mobile (Login ID)
                    </div>
                    <div className="text-xs font-bold text-emerald-700 font-mono select-all">
                      {selectedStudent.guardian_phone}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mb-1">
                      <LuMail className="w-3.5 h-3.5 text-slate-400" /> Parent Email
                    </div>
                    <div className="text-xs font-bold text-slate-800">{selectedStudent.guardian_email || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Residential Address */}
              {selectedStudent.address && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Residential Address
                  </h4>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2">
                    <LuMapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-700 leading-relaxed">{selectedStudent.address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  const s = selectedStudent;
                  setSelectedStudent(null);
                  openEditModal(s);
                }}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer border border-blue-200"
              >
                <LuPencil className="w-3.5 h-3.5" /> Edit Student Record
              </button>

              <button
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Modal (Displays auto-generated Parent Login Mobile & Password) */}
      <CredentialsModal
        isOpen={!!credentialsModalData}
        onClose={() => setCredentialsModalData(null)}
        credentials={credentialsModalData}
        title="Parent Login Credentials"
      />
    </div>
  );
}
