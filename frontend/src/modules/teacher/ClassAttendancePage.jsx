import React, { useState, useEffect } from 'react';
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
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleStatusChange = (index, newStatus) => {
    const updated = [...records];
    updated[index].status = newStatus;
    setRecords(updated);
    recomputeSummary(updated);
  };

  const handleRemarksChange = (index, remarks) => {
    const updated = [...records];
    updated[index].remarks = remarks;
    setRecords(updated);
  };

  const markAllPresent = () => {
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
      showToast(err.data?.message || 'Failed to save student attendance.');
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

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-scale-up border border-slate-700">
          <LuCircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-primary-500/20 shrink-0">
            <LuClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Student Attendance Marking</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Select class and division to mark daily student presence (Present, Absent, Late)
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
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>
          <button
            onClick={() => shiftDate(1)}
            title="Next Day"
            className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
          >
            <LuChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Class Enrolled</span>
            <LuUsers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-800">{records.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Students in division</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Present</span>
            <LuUserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{summary.present}</div>
          <div className="text-[11px] text-emerald-600/80 mt-0.5">Attending class</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs bg-gradient-to-br from-white to-rose-50/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Absent</span>
            <LuUserX className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700">{summary.absent}</div>
          <div className="text-[11px] text-rose-600/80 mt-0.5">Not present</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-primary-100 shadow-xs bg-gradient-to-br from-white to-primary-50/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-primary-600 uppercase tracking-wider">Attendance Rate</span>
            <LuClipboardCheck className="w-4 h-4 text-primary-600" />
          </div>
          <div className="text-2xl font-black text-primary-700">{summary.attendance_rate || 0}%</div>
          <div className="text-[11px] text-primary-600/80 mt-0.5">Class presence ratio</div>
        </div>
      </div>

      {/* Class & Division Selector Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
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
            <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search student name, roll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={markAllPresent}
            disabled={records.length === 0}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <LuCheck className="w-3.5 h-3.5 text-emerald-600" /> Mark All Present
          </button>
          <button
            onClick={handleSaveAttendance}
            disabled={saving || records.length === 0}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <LuLoader className="w-3.5 h-3.5 animate-spin" /> : <LuCircleCheck className="w-3.5 h-3.5" />}
            {saving ? 'Saving...' : 'Save Attendance Roll'}
          </button>
        </div>
      </div>

      {/* Student Attendance Matrix Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-xs">
          <LuLoader className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading roster for {selectedClass} - Division {selectedDivision}...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <LuUsers className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No Students in {selectedClass} - Division {selectedDivision}</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Enroll students in this class and division from the <strong>Student Records</strong> page to start taking daily attendance.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
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
                            onClick={() => handleStatusChange(realIndex, 'Present')}
                            className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              student.status === 'Present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(realIndex, 'Absent')}
                            className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              student.status === 'Absent'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(realIndex, 'Late')}
                            className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              student.status === 'Late'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Late
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <input
                          type="text"
                          placeholder="e.g. Fever, Leave note..."
                          value={student.remarks || ''}
                          onChange={(e) => handleRemarksChange(realIndex, e.target.value)}
                          className="w-full max-w-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-primary-500"
                        />
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
  );
}
