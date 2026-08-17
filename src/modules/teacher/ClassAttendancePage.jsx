import React, { useState, useRef, useEffect } from 'react';
import {
  LuClipboardCheck,
  LuCalendar,
  LuChevronLeft,
  LuChevronRight,
  LuChevronDown,
  LuCheck,
  LuX,
  LuSearch,
  LuSave,
  LuUsers,
  LuUserCheck,
  LuUserX,
  LuSparkles,
  LuCheckCheck,
} from 'react-icons/lu';

const INITIAL_STUDENTS = [
  { id: 'STU-101', roll: '01', name: 'Aarav Sharma', parentPhone: '+91 98765 43210', attendanceRate: 96 },
  { id: 'STU-102', roll: '02', name: 'Ananya Patel', parentPhone: '+91 98765 43211', attendanceRate: 98 },
  { id: 'STU-103', roll: '03', name: 'Devansh Verma', parentPhone: '+91 98765 43212', attendanceRate: 88 },
  { id: 'STU-104', roll: '04', name: 'Diya Nair', parentPhone: '+91 98765 43213', attendanceRate: 94 },
  { id: 'STU-105', roll: '05', name: 'Ishaan Gupta', parentPhone: '+91 98765 43214', attendanceRate: 91 },
  { id: 'STU-106', roll: '06', name: 'Kavya Reddy', parentPhone: '+91 98765 43215', attendanceRate: 100 },
  { id: 'STU-107', roll: '07', name: 'Manish Joshi', parentPhone: '+91 98765 43216', attendanceRate: 82 },
  { id: 'STU-108', roll: '08', name: 'Neha Singhania', parentPhone: '+91 98765 43217', attendanceRate: 95 },
  { id: 'STU-109', roll: '09', name: 'Pranav Rao', parentPhone: '+91 98765 43218', attendanceRate: 89 },
  { id: 'STU-110', roll: '10', name: 'Riya Sen', parentPhone: '+91 98765 43219', attendanceRate: 97 },
  { id: 'STU-111', roll: '11', name: 'Samar Malhotra', parentPhone: '+91 98765 43220', attendanceRate: 93 },
  { id: 'STU-112', roll: '12', name: 'Tanvi Deshmukh', parentPhone: '+91 98765 43221', attendanceRate: 85 },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function ClassAttendancePage() {
  const [selectedClass, setSelectedClass] = useState('10-A');
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [saveToast, setSaveToast] = useState(false);

  // Calendar dropdown states
  const [showCalendarDropdown, setShowCalendarDropdown] = useState(false);
  const selectedDateObj = new Date(selectedDate);
  const [viewYear, setViewYear] = useState(selectedDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDateObj.getMonth());
  const calendarRef = useRef(null);

  // Click outside to close calendar
  useEffect(() => {
    function handleClickOutside(e) {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendarDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Store attendance records keyed by `YYYY-MM-DD`
  const [attendanceRecords, setAttendanceRecords] = useState({
    [todayStr]: {
      'STU-101': { status: 'Present', remark: '' },
      'STU-102': { status: 'Present', remark: '' },
      'STU-103': { status: 'Absent', remark: 'Viral fever' },
      'STU-104': { status: 'Present', remark: '' },
      'STU-105': { status: 'Present', remark: '' },
      'STU-106': { status: 'Present', remark: '' },
      'STU-107': { status: 'Absent', remark: 'Family function' },
      'STU-108': { status: 'Present', remark: '' },
      'STU-109': { status: 'Present', remark: '' },
      'STU-110': { status: 'Present', remark: '' },
      'STU-111': { status: 'Present', remark: '' },
      'STU-112': { status: 'Present', remark: '' },
    },
  });

  // Current day's map or default all present
  const currentDayMap = attendanceRecords[selectedDate] || {};

  const getStudentStatus = (id) => currentDayMap[id]?.status || 'Present';
  const getStudentRemark = (id) => currentDayMap[id]?.remark || '';

  const setStatus = (id, status) => {
    setAttendanceRecords((prev) => {
      const dayData = prev[selectedDate] || {};
      return {
        ...prev,
        [selectedDate]: {
          ...dayData,
          [id]: {
            ...dayData[id],
            status,
          },
        },
      };
    });
  };

  const setRemark = (id, remark) => {
    setAttendanceRecords((prev) => {
      const dayData = prev[selectedDate] || {};
      return {
        ...prev,
        [selectedDate]: {
          ...dayData,
          [id]: {
            ...dayData[id],
            status: dayData[id]?.status || 'Present',
            remark,
          },
        },
      };
    });
  };

  const handleSave = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3500);
  };

  // Date picker actions
  const selectSpecificDate = (year, month, day) => {
    const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(formatted);
    setShowCalendarDropdown(false);
  };

  const shiftMonth = (delta) => {
    let newMonth = viewMonth + delta;
    let newYear = viewYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setViewMonth(newMonth);
    setViewYear(newYear);
  };

  const shiftDate = (days) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    const newDateStr = current.toISOString().split('T')[0];
    setSelectedDate(newDateStr);
    setViewYear(current.getFullYear());
    setViewMonth(current.getMonth());
  };

  const setToday = () => {
    setSelectedDate(todayStr);
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setShowCalendarDropdown(false);
  };

  // Calendar calculations
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();

  // Stats calculation
  const total = INITIAL_STUDENTS.length;
  let presentCount = 0;
  let absentCount = 0;

  INITIAL_STUDENTS.forEach((s) => {
    const st = getStudentStatus(s.id);
    if (st === 'Present') presentCount++;
    else if (st === 'Absent') absentCount++;
  });

  const attendanceRate = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  // Filter students
  const filteredStudents = INITIAL_STUDENTS.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.roll.includes(searchQuery) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase());

    const studentStatus = getStudentStatus(student.id);
    const matchesFilter = filterStatus === 'ALL' || studentStatus === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const formattedDate = new Date(selectedDate).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Banner */}
      {saveToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 flex items-center gap-3 px-5 py-3.5 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-600/20 animate-fade-in-up">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <LuCheckCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold">Attendance Saved Successfully</p>
            <p className="text-xs text-emerald-100">
              Class {selectedClass} • {formattedDate}
            </p>
          </div>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 shadow-xs">
              <LuClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">Student Attendance</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">
                  Class Teacher
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Mark daily presence and check historical class records
              </p>
            </div>
          </div>

          {/* Class & Date Selector Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Class Selector */}
            <div className="flex items-center gap-2">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="h-10 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all cursor-pointer"
              >
                <option value="10-A">Grade 10 - Section A (Class Teacher)</option>
                <option value="10-B">Grade 10 - Section B (Maths)</option>
                <option value="9-A">Grade 9 - Section A (Maths)</option>
              </select>
            </div>

            {/* Interactive Calendar Dropdown Navigator */}
            <div className="relative flex items-center" ref={calendarRef}>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 shadow-2xs">
                {/* Prev Day */}
                <button
                  onClick={() => shiftDate(-1)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-white transition-colors"
                  title="Previous Day"
                >
                  <LuChevronLeft className="w-4 h-4" />
                </button>

                {/* Calendar Dropdown Trigger Button */}
                <button
                  onClick={() => setShowCalendarDropdown(!showCalendarDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-800 hover:bg-white hover:shadow-2xs transition-all cursor-pointer"
                  title="Click to open calendar"
                >
                  <LuCalendar className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                  <span>{formattedDate}</span>
                  <LuChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {/* Next Day */}
                <button
                  onClick={() => shiftDate(1)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-white transition-colors"
                  title="Next Day"
                >
                  <LuChevronRight className="w-4 h-4" />
                </button>

                {/* Quick Today Button */}
                <button
                  onClick={setToday}
                  className="ml-1 px-2.5 py-1 text-[11px] font-bold bg-white text-primary-700 hover:bg-primary-50 rounded-lg shadow-2xs border border-gray-200/60 transition-colors"
                >
                  Today
                </button>
              </div>

              {/* Popover Calendar Dropdown */}
              {showCalendarDropdown && (
                <div className="absolute right-0 top-full mt-2 z-50 w-80 bg-white rounded-2xl border border-gray-200 shadow-2xl p-4 animate-fade-in">
                  {/* Calendar Header with Month/Year Navigation */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                    <button
                      onClick={() => shiftMonth(-1)}
                      className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <LuChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="text-center">
                      <p className="text-xs font-bold text-gray-900">
                        {MONTHS[viewMonth]} {viewYear}
                      </p>
                    </div>
                    <button
                      onClick={() => shiftMonth(1)}
                      className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <LuChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Weekday Labels */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 uppercase mb-1">
                    <span>Su</span>
                    <span>Mo</span>
                    <span>Tu</span>
                    <span>We</span>
                    <span>Th</span>
                    <span>Fr</span>
                    <span>Sa</span>
                  </div>

                  {/* Calendar Days Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {/* Empty Slots Before Month Starts */}
                    {Array.from({ length: firstDayIndex }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-8" />
                    ))}

                    {/* Actual Days */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateString = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const isSelected = selectedDate === dateString;
                      const isToday = todayStr === dateString;

                      return (
                        <button
                          key={day}
                          onClick={() => selectSpecificDate(viewYear, viewMonth, day)}
                          className={`h-8 w-8 mx-auto flex items-center justify-center rounded-xl text-xs font-semibold transition-all relative ${
                            isSelected
                              ? 'bg-primary-600 text-white font-bold shadow-xs scale-105'
                              : isToday
                              ? 'bg-primary-50 text-primary-700 font-bold border border-primary-200'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {day}
                          {isToday && !isSelected && (
                            <span className="absolute bottom-1 w-1 h-1 bg-primary-600 rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Bottom Footer Actions */}
                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                    <button
                      onClick={setToday}
                      className="text-primary-600 font-bold hover:text-primary-700 transition-colors"
                    >
                      Jump to Today
                    </button>
                    <button
                      onClick={() => setShowCalendarDropdown(false)}
                      className="text-gray-400 hover:text-gray-700 font-medium transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 ml-auto lg:ml-0"
            >
              <LuSave className="w-4 h-4" />
              Save Attendance
            </button>
          </div>
        </div>

        {/* Selected Date Summary Banner */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <p className="font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-500" />
            Showing Attendance for: <span className="font-bold text-gray-900">{formattedDate}</span>
          </p>
          <p className="text-gray-500 font-medium">
            Academic Year: 2026-2027 • Term 1
          </p>
        </div>
      </div>

      {/* KPI Cards Row (4 clean cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <LuUsers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500">Total Enrolled</p>
            <p className="text-xl font-bold text-gray-900 leading-tight">{total}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <LuUserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500">Present</p>
            <p className="text-xl font-bold text-emerald-600 leading-tight">{presentCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <LuUserX className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500">Absent</p>
            <p className="text-xl font-bold text-rose-600 leading-tight">{absentCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <LuSparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500">Turnout Rate</p>
            <p className="text-xl font-bold text-primary-700 leading-tight">{attendanceRate}%</p>
          </div>
        </div>
      </div>

      {/* Toolbar: Search & Filter Pills */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search student by name or roll..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9.5 pl-9 pr-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-gray-400 mr-1 hidden sm:inline">Filter:</span>
          {['ALL', 'Present', 'Absent'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                filterStatus === f
                  ? 'bg-gray-900 text-white shadow-2xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Student Attendance Roster Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Roll No</th>
                <th className="py-3.5 px-5">Student</th>
                <th className="py-3.5 px-5 text-center">Status Action</th>
                <th className="py-3.5 px-5">Remarks / Reason</th>
                <th className="py-3.5 px-5 text-right">Avg Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const currentStatus = getStudentStatus(student.id);
                  const currentRemark = getStudentRemark(student.id);

                  return (
                    <tr key={student.id} className="hover:bg-gray-50/60 transition-colors group">
                      {/* Roll No */}
                      <td className="py-3.5 px-5">
                        <span className="font-mono font-bold text-xs text-gray-700 px-2 py-1 rounded-lg bg-gray-100">
                          #{student.roll}
                        </span>
                      </td>

                      {/* Student Info */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {student.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                              {student.name}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono">
                              {student.id} • {student.parentPhone}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status Toggle Button Group (Present / Absent) */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-center gap-1.5 p-1 bg-gray-100 rounded-xl max-w-[200px] mx-auto">
                          <button
                            type="button"
                            onClick={() => setStatus(student.id, 'Present')}
                            className={`flex items-center justify-center gap-1.5 flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              currentStatus === 'Present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                            }`}
                          >
                            <LuCheck className="w-3.5 h-3.5" />
                            Present
                          </button>

                          <button
                            type="button"
                            onClick={() => setStatus(student.id, 'Absent')}
                            className={`flex items-center justify-center gap-1.5 flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              currentStatus === 'Absent'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                            }`}
                          >
                            <LuX className="w-3.5 h-3.5" />
                            Absent
                          </button>
                        </div>
                      </td>

                      {/* Remark Input */}
                      <td className="py-3.5 px-5">
                        <input
                          type="text"
                          placeholder={
                            currentStatus === 'Absent'
                              ? 'Enter reason for absence...'
                              : 'Optional remark...'
                          }
                          value={currentRemark}
                          onChange={(e) => setRemark(student.id, e.target.value)}
                          className={`w-full h-8 px-2.5 rounded-lg border text-xs transition-all focus:outline-none focus:ring-1 ${
                            currentStatus === 'Absent'
                              ? 'border-rose-200 bg-rose-50/40 text-rose-900 placeholder-rose-400 focus:border-rose-400 focus:ring-rose-200'
                              : 'border-gray-200 bg-gray-50 text-gray-700 placeholder-gray-400 focus:border-primary-400 focus:ring-primary-100'
                          }`}
                        />
                      </td>

                      {/* Overall Rate */}
                      <td className="py-3.5 px-5 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            student.attendanceRate >= 90
                              ? 'bg-emerald-50 text-emerald-700'
                              : student.attendanceRate >= 75
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {student.attendanceRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-sm text-gray-400">
                    No students match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
