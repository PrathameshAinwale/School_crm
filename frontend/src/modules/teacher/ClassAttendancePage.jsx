import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import {
  LuClipboardCheck,
  LuCalendar,
  LuChevronLeft,
  LuChevronRight,
  LuCheck,
  LuSearch,
  LuUsers,
  LuUserCheck,
  LuUserX,
  LuBuilding2,
  LuLayers,
  LuLoader,
  LuCircleCheck,
  LuClock,
  LuLock,
  LuShieldAlert,
  LuCircleAlert,
  LuInfo,
} from 'react-icons/lu';

const STANDARD_CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12'
];

const DIVISIONS = [
  { id: 'Div A', name: 'Division A (Saffron)' },
  { id: 'Div B', name: 'Division B (White)' },
  { id: 'Div C', name: 'Division C (Green)' },
  { id: 'Div D', name: 'Division D' },
  { id: 'Saffron (A)', name: 'Division Saffron (A)' },
  { id: 'White (B)', name: 'Division White (B)' },
  { id: 'Green (C)', name: 'Division Green (C)' },
];

export default function ClassAttendancePage() {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [classList, setClassList] = useState(STANDARD_CLASSES);
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ total: 0, present: 0, absent: 0, late: 0, attendance_rate: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Check if viewing past date and locked for teachers
  const isPastDate = selectedDate < todayStr;
  const isToday = selectedDate === todayStr;
  const isLocked = isTeacher && isPastDate;

  // 1. Initial Load: Auto-resolve teacher's assigned class & division
  useEffect(() => {
    const initClassAttendance = async () => {
      setLoading(true);
      try {
        // Load classes
        const classesRes = await adminService.getClasses();
        if (classesRes.success && classesRes.data && classesRes.data.length > 0) {
          setClassList(classesRes.data.map((c) => c.name));
        }

        // Load teacher profile
        const profileRes = await adminService.getTeacherProfile();
        if (profileRes.success && profileRes.data) {
          const t = profileRes.data;
          setTeacherInfo(t);

          const defaultClass =
            t.class_teacher_class ||
            (Array.isArray(t.assigned_classes) && t.assigned_classes[0]) ||
            'Class 10';

          const defaultDiv = t.class_teacher_division || 'Div A';

          setSelectedClass(defaultClass);
          setSelectedDivision(defaultDiv);
          setIsInitialized(true);
        } else {
          setSelectedClass('Class 10');
          setSelectedDivision('Div A');
          setIsInitialized(true);
        }
      } catch (err) {
        console.error('Failed to init class attendance:', err);
        setSelectedClass('Class 10');
        setSelectedDivision('Div A');
        setIsInitialized(true);
      }
    };

    initClassAttendance();
  }, []);

  const loadAttendance = async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const res = await adminService.getAttendance({
        date: selectedDate,
        type: 'student',
        school_class_id: selectedClass,
        section_id: selectedDivision,
      });

      if (res.success) {
        setRecords(res.data || []);
        if (res.summary) {
          setSummary(res.summary);
        }
      }
    } catch (err) {
      console.error('Failed to load student attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialized && selectedClass) {
      loadAttendance();
    }
  }, [selectedClass, selectedDivision, selectedDate, isInitialized]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const shiftDate = (deltaDays) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + deltaDays);
    const newDateStr = d.toISOString().split('T')[0];

    // Prevent teachers from navigating into future dates
    if (isTeacher && newDateStr > todayStr) {
      showToast('Cannot navigate to future dates for attendance marking.');
      return;
    }
    setSelectedDate(newDateStr);
  };

  const handleStatusChange = (index, newStatus) => {
    if (isLocked) {
      showToast('Attendance for past dates is locked and cannot be edited by teachers.');
      return;
    }
    const updated = [...records];
    updated[index].status = newStatus;
    setRecords(updated);
    recomputeSummary(updated);
  };

  const handleRemarksChange = (index, remarks) => {
    if (isLocked) return;
    const updated = [...records];
    updated[index].remarks = remarks;
    setRecords(updated);
  };

  const markAllPresent = () => {
    if (isLocked) {
      showToast('Attendance for past dates is locked.');
      return;
    }
    const updated = records.map((r) => ({ ...r, status: 'Present' }));
    setRecords(updated);
    recomputeSummary(updated);
    showToast(`All students marked Present for ${selectedClass} - Division ${selectedDivision}`);
  };

  const recomputeSummary = (list) => {
    const total = list.length;
    const present = list.filter((r) => r.status === 'Present').length;
    const absent = list.filter((r) => r.status === 'Absent').length;
    const late = list.filter((r) => r.status === 'Late').length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    setSummary({ total, present, absent, late, attendance_rate: rate });
  };

  const handleSaveAttendance = async () => {
    if (isLocked) {
      showToast('Attendance for past dates is locked and cannot be edited by teachers.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        date: selectedDate,
        type: 'student',
        records: records.map((r) => ({
          id: r.student_id,
          status: r.status,
          remarks: r.remarks || '',
        })),
      };

      const res = await adminService.saveAttendance(payload);
      if (res.success) {
        showToast('Student attendance roll recorded and saved in database!');
        loadAttendance();
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to save student attendance.');
    } finally {
      setSaving(false);
    }
  };

  const filteredRecords = records.filter((r) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (r.name || '').toLowerCase();
      const roll = String(r.roll_number || '').toLowerCase();
      const adm = (r.admission_number || '').toLowerCase();
      return name.includes(q) || roll.includes(q) || adm.includes(q);
    }
    return true;
  });

  const isAnyMarked = records.some((r) => r.is_marked);

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
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-primary-500/20 shrink-0">
            <LuClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-xl font-bold text-slate-800 leading-tight">Student Attendance Register</h1>
              {isToday && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                  Live Today
                </span>
              )}
              {isLocked && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
                  <LuLock className="w-3 h-3" /> Locked & Archived
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Take roll call and record daily presence. Records for completed days are automatically locked for historical integrity.
            </p>
          </div>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => shiftDate(-1)}
            title="Previous Day"
            className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
          >
            <LuChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-2">
            <LuCalendar className="w-4 h-4 text-primary-600" />
            <input
              type="date"
              max={isTeacher ? todayStr : undefined}
              value={selectedDate}
              onChange={(e) => {
                const val = e.target.value;
                if (isTeacher && val > todayStr) {
                  showToast('Cannot select future dates for attendance.');
                  return;
                }
                setSelectedDate(val);
              }}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>
          <button
            onClick={() => shiftDate(1)}
            disabled={isTeacher && selectedDate >= todayStr}
            title={isTeacher && selectedDate >= todayStr ? "Cannot navigate to future date" : "Next Day"}
            className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 transition-colors shadow-xs disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <LuChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Locked Past Date Warning Banner */}
      {isLocked && (
        <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex items-start gap-3.5 text-amber-900 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
            <LuLock className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-amber-900 text-sm">Attendance Locked for Completed Day ({selectedDate})</p>
            <p className="text-amber-800 mt-1 leading-relaxed">
              Student attendance records for past dates are archived in read-only mode and cannot be modified by teachers. Once a day has finished, attendance records are finalized to preserve compliance. For any retroactive corrections, please contact the Principal or Admin office.
            </p>
          </div>
        </div>
      )}

      {/* Today's Submission Status Callout */}
      {isToday && (
        <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
          isAnyMarked
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            : 'bg-blue-50/80 border-blue-200 text-blue-900'
        }`}>
          <div className="flex items-center gap-2.5">
            {isAnyMarked ? (
              <LuCircleCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <LuInfo className="w-5 h-5 text-blue-600 shrink-0" />
            )}
            <div>
              <span className="font-bold">
                {isAnyMarked
                  ? "Today's Attendance is Recorded in Database"
                  : "Today's Attendance Roll is Pending Submission"}
              </span>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {isAnyMarked
                  ? `Roll call marked and synchronized for ${selectedClass} (${selectedDivision}). Click "Save Attendance Roll" anytime to submit updates.`
                  : `Please review presence for all students below and click "Save Attendance Roll" before the end of the school day.`}
              </p>
            </div>
          </div>
          <div className="shrink-0 font-bold px-2.5 py-1 rounded-lg text-[11px] uppercase tracking-wider bg-white border border-slate-200 shadow-2xs">
            {isAnyMarked ? '✓ Logged' : '● Action Required'}
          </div>
        </div>
      )}

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Class Enrolled</span>
            <LuUsers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800">{records.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Students in division</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Present</span>
            <LuUserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">{summary.present}</div>
          <div className="text-[11px] text-emerald-600/80 mt-0.5">Attending class</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs bg-gradient-to-br from-white to-rose-50/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Absent</span>
            <LuUserX className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-700">{summary.absent}</div>
          <div className="text-[11px] text-rose-600/80 mt-0.5">Not present</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-primary-100 shadow-xs bg-gradient-to-br from-white to-primary-50/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-primary-600 uppercase tracking-wider">Attendance Rate</span>
            <LuClipboardCheck className="w-4 h-4 text-primary-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-primary-700">{summary.attendance_rate || 0}%</div>
          <div className="text-[11px] text-primary-600/80 mt-0.5">Class presence ratio</div>
        </div>
      </div>

      {/* Class & Division Selector Toolbar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Class Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
            <LuBuilding2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 py-1 pr-2 focus:outline-none cursor-pointer"
            >
              {classList.map((cls) => (
                <option key={cls} value={cls}>
                  {cls} {teacherInfo?.class_teacher_class === cls ? '★' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Division Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
            <LuLayers className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 py-1 pr-2 focus:outline-none cursor-pointer"
            >
              {DIVISIONS.map((div) => (
                <option key={div.id} value={div.id}>
                  {div.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search inside division */}
          <div className="relative w-full sm:w-56">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search student name, roll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={markAllPresent}
            disabled={isLocked || records.length === 0}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <LuCheck className="w-3.5 h-3.5 text-emerald-600" /> Mark All Present
          </button>
          <button
            onClick={handleSaveAttendance}
            disabled={isLocked || saving || records.length === 0}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? (
              <LuLoader className="w-3.5 h-3.5 animate-spin" />
            ) : isLocked ? (
              <LuLock className="w-3.5 h-3.5" />
            ) : (
              <LuCircleCheck className="w-3.5 h-3.5" />
            )}
            {saving ? 'Saving...' : isLocked ? 'Attendance Locked' : 'Save Attendance Roll'}
          </button>
        </div>
      </div>

      {/* Student Attendance Matrix Table */}
      {loading ? (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-8 sm:p-16 text-center shadow-xs">
          <LuLoader className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading roster for {selectedClass} - Division {selectedDivision}...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <LuUsers className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No Students in {selectedClass} - Division {selectedDivision}</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Enroll students in this class and division from the <strong>Student Records</strong> page to start taking daily attendance.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card View: Interactive Student Attendance Cards */}
          <div className="sm:hidden space-y-2.5">
            {filteredRecords.map((student) => {
              const realIndex = records.findIndex((r) => r.student_id === student.student_id);
              return (
                <div key={student.student_id} className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {student.roll_number || '0'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">{student.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Adm: {student.admission_number}</p>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Toggle Buttons */}
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => handleStatusChange(realIndex, 'Present')}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
                        student.status === 'Present'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : isLocked
                          ? 'text-slate-400 cursor-not-allowed opacity-50'
                          : 'text-slate-600 hover:bg-slate-200 cursor-pointer'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => handleStatusChange(realIndex, 'Absent')}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
                        student.status === 'Absent'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : isLocked
                          ? 'text-slate-400 cursor-not-allowed opacity-50'
                          : 'text-slate-600 hover:bg-slate-200 cursor-pointer'
                      }`}
                    >
                      Absent
                    </button>
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => handleStatusChange(realIndex, 'Late')}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
                        student.status === 'Late'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : isLocked
                          ? 'text-slate-400 cursor-not-allowed opacity-50'
                          : 'text-slate-600 hover:bg-slate-200 cursor-pointer'
                      }`}
                    >
                      Late
                    </button>
                  </div>

                  {/* Remarks input */}
                  <input
                    type="text"
                    disabled={isLocked}
                    placeholder={isLocked ? "No remarks" : "Remarks / reason (optional)..."}
                    value={student.remarks || ''}
                    onChange={(e) => handleRemarksChange(realIndex, e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  />
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">Roll No & Student Name</th>
                    <th className="px-5 py-3.5">Admission No</th>
                    <th className="px-5 py-3.5">Class & Division</th>
                    <th className="px-5 py-3.5">Mark Attendance</th>
                    <th className="px-5 py-3.5">Remarks / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredRecords.map((student) => {
                    const realIndex = records.findIndex((r) => r.student_id === student.student_id);
                    return (
                      <tr key={student.student_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {student.roll_number || '0'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800">{student.name}</div>
                              <div className="text-[11px] text-slate-400">Roll: {student.roll_number || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-mono font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-100 text-[11px]">
                            {student.admission_number}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200/60">
                            {student.class_name || selectedClass} - {student.section_name || selectedDivision}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit border border-slate-200/60">
                            <button
                              type="button"
                              disabled={isLocked}
                              onClick={() => handleStatusChange(realIndex, 'Present')}
                              className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                student.status === 'Present'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : isLocked
                                  ? 'text-slate-400 cursor-not-allowed opacity-50'
                                  : 'text-slate-600 hover:bg-slate-200 cursor-pointer'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              disabled={isLocked}
                              onClick={() => handleStatusChange(realIndex, 'Absent')}
                              className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                student.status === 'Absent'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : isLocked
                                  ? 'text-slate-400 cursor-not-allowed opacity-50'
                                  : 'text-slate-600 hover:bg-slate-200 cursor-pointer'
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              type="button"
                              disabled={isLocked}
                              onClick={() => handleStatusChange(realIndex, 'Late')}
                              className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                student.status === 'Late'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : isLocked
                                  ? 'text-slate-400 cursor-not-allowed opacity-50'
                                  : 'text-slate-600 hover:bg-slate-200 cursor-pointer'
                              }`}
                            >
                              Late
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <input
                            type="text"
                            disabled={isLocked}
                            placeholder={isLocked ? "—" : "e.g. Fever, Leave note..."}
                            value={student.remarks || ''}
                            onChange={(e) => handleRemarksChange(realIndex, e.target.value)}
                            className="w-full max-w-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                          />
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
    </div>
  );
}
