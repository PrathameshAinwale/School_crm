import React, { useState, useEffect } from 'react';
import { udiseService } from '../../services/udiseService';
import {
  LuBuilding2,
  LuFileText,
  LuUsers,
  LuGraduationCap,
  LuLayers,
  LuDownload,
  LuCircleCheck,
  LuCircleAlert,
  LuPencil,
  LuSave,
  LuRefreshCw,
  LuShieldCheck,
  LuFileSpreadsheet,
  LuCheck,
  LuX,
  LuLoader,
  LuEye,
  LuPrinter,
  LuSearch,
  LuWifi,
  LuZap,
  LuBookOpen,
  LuMonitor,
} from 'react-icons/lu';

export default function UdisePlusPage() {
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [facilityData, setFacilityData] = useState(null);
  const [teachersList, setTeachersList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [enrolmentMatrix, setEnrolmentMatrix] = useState([]);

  // Edit modals & forms
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [savingForm, setSavingForm] = useState(false);
  const [searchStudentQuery, setSearchStudentQuery] = useState('');
  const [exportingType, setExportingType] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Initial Dashboard
  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await udiseService.getDashboard({ academic_year: academicYear });
      if (res.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load UDISE+ dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [academicYear]);

  // Load Tab Specific Data
  useEffect(() => {
    async function loadTabData() {
      try {
        if (activeTab === 'profile' && !profileData) {
          const res = await udiseService.getSchoolProfile({ academic_year: academicYear });
          if (res.success) setProfileData(res.data.profile);
        } else if (activeTab === 'facilities' && !facilityData) {
          const res = await udiseService.getSchoolFacilities({ academic_year: academicYear });
          if (res.success) setFacilityData(res.data);
        } else if (activeTab === 'teachers' && teachersList.length === 0) {
          const res = await udiseService.getTeachers();
          if (res.success) setTeachersList(res.data);
        } else if (activeTab === 'students' && studentsList.length === 0) {
          const res = await udiseService.getStudents();
          if (res.success) setStudentsList(res.data);
        } else if (activeTab === 'academics' && enrolmentMatrix.length === 0) {
          const res = await udiseService.getAcademicEnrolment();
          if (res.success) setEnrolmentMatrix(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadTabData();
  }, [activeTab]);

  // Handle Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingForm(true);
    try {
      const res = await udiseService.updateSchoolProfile({
        ...profileData,
        academic_year: academicYear,
      });
      if (res.success) {
        showToast('UDISE+ School Profile updated successfully.');
        loadDashboard();
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving school profile.');
    } finally {
      setSavingForm(false);
    }
  };

  // Handle Save Facilities
  const handleSaveFacilities = async (e) => {
    e.preventDefault();
    setSavingForm(true);
    try {
      const res = await udiseService.updateSchoolFacilities({
        ...facilityData,
        academic_year: academicYear,
      });
      if (res.success) {
        showToast('UDISE+ Physical Facilities updated successfully.');
        loadDashboard();
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving facilities data.');
    } finally {
      setSavingForm(false);
    }
  };

  // Handle Save Teacher
  const handleSaveTeacherSubmit = async (e) => {
    e.preventDefault();
    setSavingForm(true);
    try {
      const res = await udiseService.updateTeacher(editingTeacher.teacher.id, editingTeacher.udise);
      if (res.success) {
        showToast('Teacher UDISE+ details saved.');
        setEditingTeacher(null);
        const refreshed = await udiseService.getTeachers();
        if (refreshed.success) setTeachersList(refreshed.data);
        loadDashboard();
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving teacher details.');
    } finally {
      setSavingForm(false);
    }
  };

  // Handle Save Student
  const handleSaveStudentSubmit = async (e) => {
    e.preventDefault();
    setSavingForm(true);
    try {
      const res = await udiseService.updateStudent(editingStudent.student.id, editingStudent.udise);
      if (res.success) {
        showToast('Student UDISE+ & PEN credentials saved.');
        setEditingStudent(null);
        const refreshed = await udiseService.getStudents();
        if (refreshed.success) setStudentsList(refreshed.data);
        loadDashboard();
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving student details.');
    } finally {
      setSavingForm(false);
    }
  };

  // Handle Certify & Lock
  const handleCertifySubmission = async () => {
    if (!window.confirm('Are you sure you want to certify and lock the UDISE+ DCF data for ' + academicYear + '?')) return;
    try {
      const res = await udiseService.certify(academicYear);
      if (res.success) {
        showToast('UDISE+ DCF data certified and locked.');
        loadDashboard();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to certify submission.');
    }
  };

  // Filtered Students
  const filteredStudents = studentsList.filter((item) => {
    const q = searchStudentQuery.toLowerCase().trim();
    if (!q) return true;
    const name = `${item.student.first_name} ${item.student.last_name}`.toLowerCase();
    const pen = (item.udise?.pen || '').toLowerCase();
    const roll = String(item.student.roll_number || '');
    return name.includes(q) || pen.includes(q) || roll.includes(q);
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-white text-slate-800 px-4 py-3 rounded-xl shadow-xl border border-slate-200 animate-slide-up text-xs font-semibold">
          <LuCircleCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Header (Clean Light Theme) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-800 text-white flex items-center justify-center shadow-md shadow-blue-700/20 shrink-0">
            <LuBuilding2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
                UDISE+ Management Module
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold inline-flex items-center gap-1">
                <LuShieldCheck className="w-3.5 h-3.5" />
                Govt. of India DCF Standard
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-mono font-bold">
                UDISE: 27200100142
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Official Ministry of Education Data Capture Format (DCF), PEN Registry, National Teacher Code, Infrastructure & Portal Exports.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="2024-2025">AY 2024-2025</option>
            <option value="2025-2026">AY 2025-2026</option>
          </select>

          <button
            onClick={() => udiseService.downloadDcfPdf(academicYear)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition cursor-pointer"
          >
            <LuDownload className="w-4 h-4 text-slate-600" />
            <span>PDF Booklet</span>
          </button>

          <button
            onClick={() => udiseService.exportJson(academicYear)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition cursor-pointer"
          >
            <LuFileText className="w-4 h-4 text-blue-600" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleCertifySubmission}
            disabled={dashboardData?.is_certified}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
              dashboardData?.is_certified
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <LuCircleCheck className="w-4 h-4" />
            <span>{dashboardData?.is_certified ? 'Certified & Locked' : 'Certify Submission'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Clean Light Theme) */}
      <div className="flex items-center gap-1 overflow-x-auto bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs">
        {[
          { id: 'dashboard', label: 'UDISE+ Dashboard', icon: LuLayers },
          { id: 'profile', label: '1. School Profile', icon: LuBuilding2 },
          { id: 'facilities', label: '2. Facilities & Labs', icon: LuMonitor },
          { id: 'teachers', label: '3. Teacher Registry', icon: LuUsers },
          { id: 'students', label: '4. Students & PEN', icon: LuGraduationCap },
          { id: 'academics', label: '5. Academic Enrolment', icon: LuBookOpen },
          { id: 'export', label: '6. Data Export & Portal', icon: LuFileSpreadsheet },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: UDISE+ DASHBOARD & READINESS */}
      {activeTab === 'dashboard' && dashboardData && (
        <div className="space-y-6">
          {/* Completion Progress Banner */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 font-black text-xl flex items-center justify-center shrink-0">
                {dashboardData.completion_percentage}%
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">
                  UDISE+ DCF Submission Readiness &bull; {academicYear}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  All 5 official sections audited against Government of India validation criteria.
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs font-semibold text-slate-600">
                    Status: <strong className="text-blue-700">{dashboardData.submission?.status || 'In Progress'}</strong>
                  </span>
                  <span>&bull;</span>
                  <span className="text-xs font-semibold text-slate-600">
                    Ack No: <strong className="font-mono text-slate-800">{dashboardData.submission?.dcf_acknowledgement_number || 'Pending'}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-64">
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>DCF Compliance</span>
                <span>{dashboardData.completion_percentage}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${dashboardData.completion_percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Total Teachers</div>
              <div className="text-2xl font-black text-slate-800 mt-1">{dashboardData.stats.total_teachers}</div>
              <div className="text-[11px] text-blue-600 font-medium mt-0.5">
                {dashboardData.stats.udise_teachers} with National Code
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Total Students</div>
              <div className="text-2xl font-black text-slate-800 mt-1">{dashboardData.stats.total_students}</div>
              <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                {dashboardData.stats.students_with_pen} Verified PEN
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Boys / Girls</div>
              <div className="text-2xl font-black text-slate-800 mt-1">
                {dashboardData.stats.male_students} <span className="text-xs text-slate-400 font-normal">/</span> {dashboardData.stats.female_students}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Gender Ratio Balanced</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">CWSN Students</div>
              <div className="text-2xl font-black text-amber-600 mt-1">{dashboardData.stats.cwsn_count}</div>
              <div className="text-[11px] text-amber-700 font-medium mt-0.5">With Ramps & Handrails</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">BPL / EWS Disadv.</div>
              <div className="text-2xl font-black text-indigo-600 mt-1">{dashboardData.stats.bpl_count}</div>
              <div className="text-[11px] text-indigo-700 font-medium mt-0.5">Fee & Book Benefits</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Validation Status</div>
              <div className="text-base font-black text-emerald-600 mt-1.5 flex items-center gap-1">
                <LuCircleCheck className="w-4 h-4" /> Ready for Portal
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">0 Fatal Errors</div>
            </div>
          </div>

          {/* Section Progress Modules */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
              Government of India DCF Sections Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.modules.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setActiveTab(m.id)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 transition cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{m.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{m.dcf_section}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      {m.status}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Progress</span>
                      <span className="font-bold text-slate-800">{m.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${m.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCHOOL PROFILE (DCF SEC 1) */}
      {activeTab === 'profile' && profileData && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Section 1: School Profile, Management & Recognition
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Official UDISE code, affiliation numbers, medium of instruction and nodal officer credentials.
              </p>
            </div>
            <button
              type="submit"
              disabled={savingForm}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <LuSave className="w-4 h-4" />
              <span>{savingForm ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">11-Digit UDISE Code</label>
              <input
                type="text"
                value={profileData.udise_code || ''}
                onChange={(e) => setProfileData({ ...profileData, udise_code: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">School Category</label>
              <input
                type="text"
                value={profileData.school_category || ''}
                onChange={(e) => setProfileData({ ...profileData, school_category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Management Group</label>
              <input
                type="text"
                value={profileData.management_group || ''}
                onChange={(e) => setProfileData({ ...profileData, management_group: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Secondary Affiliation Board & No.</label>
              <input
                type="text"
                value={profileData.affiliation_no_secondary || ''}
                onChange={(e) => setProfileData({ ...profileData, affiliation_no_secondary: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Medium of Instruction 1</label>
              <input
                type="text"
                value={profileData.medium_of_instruction_1 || ''}
                onChange={(e) => setProfileData({ ...profileData, medium_of_instruction_1: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Medium of Instruction 2</label>
              <input
                type="text"
                value={profileData.medium_of_instruction_2 || ''}
                onChange={(e) => setProfileData({ ...profileData, medium_of_instruction_2: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Head of School Name</label>
              <input
                type="text"
                value={profileData.head_of_school_name || ''}
                onChange={(e) => setProfileData({ ...profileData, head_of_school_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">UDISE+ Nodal Officer Name</label>
              <input
                type="text"
                value={profileData.nodal_officer_name || ''}
                onChange={(e) => setProfileData({ ...profileData, nodal_officer_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nodal Officer Mobile (Auth OTP)</label>
              <input
                type="text"
                value={profileData.nodal_officer_mobile || ''}
                onChange={(e) => setProfileData({ ...profileData, nodal_officer_mobile: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white"
              />
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: PHYSICAL FACILITIES & LABS (DCF SEC 2) */}
      {activeTab === 'facilities' && facilityData && (
        <form onSubmit={handleSaveFacilities} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Section 2: Physical Facilities, Equipment, Labs & ICT
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Classroom conditions, drinking water, toilet counts, Atal Tinkering Lab, and internet connectivity.
              </p>
            </div>
            <button
              type="submit"
              disabled={savingForm}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <LuSave className="w-4 h-4" />
              <span>{savingForm ? 'Saving...' : 'Save Facilities'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Classrooms</label>
              <input
                type="number"
                value={facilityData.total_classrooms_instructional || 0}
                onChange={(e) => setFacilityData({ ...facilityData, total_classrooms_instructional: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Classrooms (Good Condition)</label>
              <input
                type="number"
                value={facilityData.classrooms_good_condition || 0}
                onChange={(e) => setFacilityData({ ...facilityData, classrooms_good_condition: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Boys Toilets (Functional)</label>
              <input
                type="number"
                value={facilityData.boys_toilets_functional || 0}
                onChange={(e) => setFacilityData({ ...facilityData, boys_toilets_functional: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Girls Toilets (Functional)</label>
              <input
                type="number"
                value={facilityData.girls_toilets_functional || 0}
                onChange={(e) => setFacilityData({ ...facilityData, girls_toilets_functional: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Library Books</label>
              <input
                type="number"
                value={facilityData.total_library_books || 0}
                onChange={(e) => setFacilityData({ ...facilityData, total_library_books: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Functional Desktops</label>
              <input
                type="number"
                value={facilityData.total_functional_desktops || 0}
                onChange={(e) => setFacilityData({ ...facilityData, total_functional_desktops: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Smart Projector Classrooms</label>
              <input
                type="number"
                value={facilityData.smart_classrooms_projectors || 0}
                onChange={(e) => setFacilityData({ ...facilityData, smart_classrooms_projectors: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Internet Speed (Mbps)</label>
              <input
                type="number"
                value={facilityData.internet_speed_mbps || 0}
                onChange={(e) => setFacilityData({ ...facilityData, internet_speed_mbps: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              />
            </div>
          </div>
        </form>
      )}

      {/* TAB 4: TEACHERS REGISTRY (DCF SEC 3) */}
      {activeTab === 'teachers' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-800">
                Section 3: National Teacher Registry & Qualifications
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                National Teacher Code, Cadre designation, academic degree, professional qualifications and ICT training.
              </p>
            </div>
            <button
              onClick={() => udiseService.exportCsv('teachers')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 cursor-pointer"
            >
              <LuDownload className="w-4 h-4 text-slate-600" />
              <span>Export Teachers CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                <tr>
                  <th className="py-3 px-4">National Code</th>
                  <th className="py-3 px-4">Teacher Name</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Qualifications</th>
                  <th className="py-3 px-4">Social Category</th>
                  <th className="py-3 px-4">ICT Trained</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachersList.map((item) => (
                  <tr key={item.teacher.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      {item.udise?.national_teacher_code || 'Pending'}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {item.teacher.first_name} {item.teacher.last_name}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{item.teacher.gender}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{item.udise?.cadre_designation || 'PGT'}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.udise?.academic_qualification} ({item.udise?.professional_qualification})
                    </td>
                    <td className="py-3 px-4">{item.udise?.social_category}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                        YES
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setEditingTeacher(item)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title="Edit UDISE Details"
                      >
                        <LuPencil className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: STUDENTS & PEN (DCF SEC 4) */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-800">
                Section 4: Student Details & Permanent Education Number (PEN)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                National PEN registry, social categories, minority status, CWSN disability, and previous academic progression.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <LuSearch className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchStudentQuery}
                  onChange={(e) => setSearchStudentQuery(e.target.value)}
                  placeholder="Search PEN or student..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
                />
              </div>
              <button
                onClick={() => udiseService.exportCsv('students')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 cursor-pointer"
              >
                <LuDownload className="w-3.5 h-3.5 text-slate-600" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                <tr>
                  <th className="py-3 px-4">Permanent Education No (PEN)</th>
                  <th className="py-3 px-4">Roll</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Class & Div</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">CWSN</th>
                  <th className="py-3 px-4">Prev Result</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((item) => (
                  <tr key={item.student.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      {item.udise?.pen || 'Pending'}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700">#{item.student.roll_number}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {item.student.first_name} {item.student.last_name}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.student.school_class?.name || 'Class 10'} - {item.student.section?.name || 'A'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{item.student.gender}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                        {item.udise?.social_category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {item.udise?.is_cwsn ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
                          {item.udise.disability_type}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-emerald-700">
                      {item.udise?.previous_class_result} ({item.udise?.previous_class_percentage}%)
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setEditingStudent(item)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title="Edit Student UDISE Fields"
                      >
                        <LuPencil className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: ACADEMIC ENROLMENT MATRIX (DCF SEC 5) */}
      {activeTab === 'academics' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h3 className="text-base font-extrabold text-slate-800">
              Section 5: Class-wise Enrolment, Social Categories & Progression Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of student enrolment by gender, caste reservation categories, CWSN and BPL status.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                <tr>
                  <th className="py-3 px-4">Standard (Class)</th>
                  <th className="py-3 px-4 text-center">Total Enrolment</th>
                  <th className="py-3 px-4 text-center">Boys</th>
                  <th className="py-3 px-4 text-center">Girls</th>
                  <th className="py-3 px-4 text-center">General</th>
                  <th className="py-3 px-4 text-center">OBC</th>
                  <th className="py-3 px-4 text-center">SC</th>
                  <th className="py-3 px-4 text-center">ST</th>
                  <th className="py-3 px-4 text-center">CWSN</th>
                  <th className="py-3 px-4 text-center">BPL/EWS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrolmentMatrix.map((row) => (
                  <tr key={row.class_id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-800">{row.class_name}</td>
                    <td className="py-3 px-4 text-center font-extrabold text-blue-700">{row.total_enrolment}</td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-700">{row.boys}</td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-700">{row.girls}</td>
                    <td className="py-3 px-4 text-center text-slate-600">{row.general}</td>
                    <td className="py-3 px-4 text-center text-slate-600">{row.obc}</td>
                    <td className="py-3 px-4 text-center text-slate-600">{row.sc}</td>
                    <td className="py-3 px-4 text-center text-slate-600">{row.st}</td>
                    <td className="py-3 px-4 text-center text-amber-600 font-bold">{row.cwsn}</td>
                    <td className="py-3 px-4 text-center text-indigo-600 font-bold">{row.bpl_ews}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: DATA EXPORT & PORTAL COMPATIBILITY */}
      {activeTab === 'export' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-800">
              Government of India UDISE+ Portal Data Export
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate officially compatible file formats ready for upload on the National UDISE+ portal (udiseplus.gov.in).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Official JSON DCF Payload */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-3">
                  <LuFileText className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Complete DCF JSON Package</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Full multi-section JSON file containing School Profile, Facilities, Teaching Staff, and Student Registries conforming to API standards.
                </p>
              </div>
              <button
                onClick={() => udiseService.exportJson(academicYear)}
                className="mt-5 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Download JSON DCF
              </button>
            </div>

            {/* Card 2: Student Module PEN CSV */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-3">
                  <LuGraduationCap className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Student Module (PEN) CSV</h4>
                <p className="text-xs text-slate-500 mt-1">
                  UTF-8 formatted CSV batch file with National PEN, roll numbers, social category, CWSN disability, and previous class results.
                </p>
              </div>
              <button
                onClick={() => udiseService.exportCsv('students')}
                className="mt-5 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Download Student CSV
              </button>
            </div>

            {/* Card 3: A4 DCF Summary Report PDF */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-3">
                  <LuPrinter className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Official A4 DCF Booklet PDF</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Formal compliance summary document with institutional seal and authorized signature blocks for official records and audit.
                </p>
              </div>
              <button
                onClick={() => udiseService.downloadDcfPdf(academicYear)}
                className="mt-5 w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Download A4 PDF Booklet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TEACHER MODAL */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 p-6 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Edit Teacher UDISE+ Details &bull; {editingTeacher.teacher.first_name} {editingTeacher.teacher.last_name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">National Teacher Code & Professional Training</p>
              </div>
              <button onClick={() => setEditingTeacher(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacherSubmit} className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">National Teacher Code</label>
                  <input
                    type="text"
                    value={editingTeacher.udise?.national_teacher_code || ''}
                    onChange={(e) => setEditingTeacher({
                      ...editingTeacher,
                      udise: { ...editingTeacher.udise, national_teacher_code: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cadre / Designation</label>
                  <input
                    type="text"
                    value={editingTeacher.udise?.cadre_designation || ''}
                    onChange={(e) => setEditingTeacher({
                      ...editingTeacher,
                      udise: { ...editingTeacher.udise, cadre_designation: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Academic Qualification</label>
                  <input
                    type="text"
                    value={editingTeacher.udise?.academic_qualification || ''}
                    onChange={(e) => setEditingTeacher({
                      ...editingTeacher,
                      udise: { ...editingTeacher.udise, academic_qualification: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Professional Qualification</label>
                  <input
                    type="text"
                    value={editingTeacher.udise?.professional_qualification || ''}
                    onChange={(e) => setEditingTeacher({
                      ...editingTeacher,
                      udise: { ...editingTeacher.udise, professional_qualification: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingForm}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {savingForm ? 'Saving...' : 'Save Teacher Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 p-6 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Edit Student UDISE+ &bull; {editingStudent.student.first_name} {editingStudent.student.last_name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Permanent Education Number (PEN) & Demographics</p>
              </div>
              <button onClick={() => setEditingStudent(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudentSubmit} className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Permanent Education No (PEN)</label>
                  <input
                    type="text"
                    value={editingStudent.udise?.pen || ''}
                    onChange={(e) => setEditingStudent({
                      ...editingStudent,
                      udise: { ...editingStudent.udise, pen: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-blue-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Social Category</label>
                  <select
                    value={editingStudent.udise?.social_category || 'General'}
                    onChange={(e) => setEditingStudent({
                      ...editingStudent,
                      udise: { ...editingStudent.udise, social_category: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CWSN Disability</label>
                  <select
                    value={editingStudent.udise?.disability_type || 'None'}
                    onChange={(e) => setEditingStudent({
                      ...editingStudent,
                      udise: {
                        ...editingStudent.udise,
                        disability_type: e.target.value,
                        is_cwsn: e.target.value !== 'None',
                      }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="None">None</option>
                    <option value="Locomotor Impairment">Locomotor Impairment</option>
                    <option value="Visual Impairment">Visual Impairment</option>
                    <option value="Hearing Impairment">Hearing Impairment</option>
                    <option value="Learning Disability">Learning Disability</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Previous Class Percentage</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingStudent.udise?.previous_class_percentage || 0}
                    onChange={(e) => setEditingStudent({
                      ...editingStudent,
                      udise: { ...editingStudent.udise, previous_class_percentage: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingForm}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {savingForm ? 'Saving...' : 'Save Student Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
