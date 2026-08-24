import React, { useState, useRef, useEffect } from 'react';
import { hrService } from '../../services/hrService';
import {
  LuUsers,
  LuCalendar,
  LuChevronLeft,
  LuChevronRight,
  LuChevronDown,
  LuSearch,
  LuFilter,
  LuDownload,
  LuCheck,
  LuX,
  LuClock,
  LuMapPin,
  LuPhone,
  LuMail,
  LuBuilding2,
  LuSparkles,
  LuCheckCheck,
  LuEye,
  LuLoader,
  LuPencil,
  LuRefreshCw,
  LuCircleCheck,
  LuCircleAlert,
} from 'react-icons/lu';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function StaffAttendancePage() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedStaffDetail, setSelectedStaffDetail] = useState(null);
  const [editingAttendanceStaff, setEditingAttendanceStaff] = useState(null);
  const [markingStatus, setMarkingStatus] = useState('Present');
  const [checkInTime, setCheckInTime] = useState('08:00');
  const [checkOutTime, setCheckOutTime] = useState('16:00');
  const [markingRemarks, setMarkingRemarks] = useState('');
  const [submittingMark, setSubmittingMark] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [staffList, setStaffList] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    half_day: 0,
    leave: 0,
    not_marked: 0,
    attendance_rate: 100,
  });
  const [loading, setLoading] = useState(true);

  // Calendar popover state
  const [showCalendarDropdown, setShowCalendarDropdown] = useState(false);
  const selectedDateObj = new Date(selectedDate);
  const [viewYear, setViewYear] = useState(selectedDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDateObj.getMonth());
  const calendarRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const res = await hrService.getStaffAttendance({ date: selectedDate });
      const list = res?.data?.staff || res?.staff || [];
      setStaffList(list);
      if (res?.data?.summary) {
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Failed to load staff attendance:', err);
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [selectedDate]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendarDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const setToday = () => {
    setSelectedDate(todayStr);
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setShowCalendarDropdown(false);
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();

  const openMarkModal = (staff) => {
    setEditingAttendanceStaff(staff);
    setMarkingStatus(staff.status === 'Not Marked' ? 'Present' : staff.status);
    setCheckInTime(staff.clockIn && staff.clockIn !== '—' ? staff.clockIn : '08:00');
    setCheckOutTime(staff.clockOut && staff.clockOut !== '—' ? staff.clockOut : '16:00');
    setMarkingRemarks(staff.remarks || '');
  };

  const handleSaveAttendance = async (e) => {
    if (e) e.preventDefault();
    if (!editingAttendanceStaff) return;

    setSubmittingMark(true);
    try {
      await hrService.markStaffAttendance({
        teacher_id: editingAttendanceStaff.teacher_id,
        date: selectedDate,
        status: markingStatus,
        check_in_time: ['Present', 'Late', 'Half Day'].includes(markingStatus) ? (checkInTime.includes(':') && checkInTime.length === 5 ? `${checkInTime}:00` : checkInTime) : null,
        check_out_time: ['Present', 'Half Day'].includes(markingStatus) ? (checkOutTime.includes(':') && checkOutTime.length === 5 ? `${checkOutTime}:00` : checkOutTime) : null,
        remarks: markingRemarks,
      });

      setEditingAttendanceStaff(null);
      loadAttendance();
      showToast(`Attendance for ${editingAttendanceStaff.name} updated to ${markingStatus}!`);
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to update attendance.');
    } finally {
      setSubmittingMark(false);
    }
  };

  // Stats calculation
  const total = summary.total || staffList.length;
  const presentCount = summary.present || staffList.filter((s) => s.status === 'Present').length;
  const absentCount = summary.absent || staffList.filter((s) => s.status === 'Absent').length;
  const lateCount = summary.late || staffList.filter((s) => s.status === 'Late').length;
  const leaveCount = summary.leave || staffList.filter((s) => s.status === 'Leave' || s.status === 'On Leave').length;
  const notMarkedCount = summary.not_marked || staffList.filter((s) => s.status === 'Not Marked').length;
  const attendanceRate = summary.attendance_rate !== undefined ? summary.attendance_rate : (total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 100);

  // Filtered members
  const filteredStaff = staffList.filter((s) => {
    const name = (s.name || '').toLowerCase();
    const id = (s.id || '').toLowerCase();
    const role = (s.role || '').toLowerCase();
    const dept = (s.dept || '').toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch = name.includes(q) || id.includes(q) || role.includes(q) || dept.includes(q);
    const matchesDept = deptFilter === 'ALL' || dept === deptFilter.toLowerCase() || dept.includes(deptFilter.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      s.status === statusFilter ||
      (statusFilter === 'On Leave' && (s.status === 'Leave' || s.status === 'On Leave'));

    return matchesSearch && matchesDept && matchesStatus;
  });

  const formattedDate = new Date(selectedDate).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-scale-up border border-gray-700">
          <LuCircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
              <LuUsers className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-xl font-bold text-gray-900">Staff & Faculty Attendance</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Campus-Wide
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                Real-time tracking of teachers, administrators, IT, and faculty check-ins
              </p>
            </div>
          </div>

          {/* Controls: Date Picker & Refresh */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Calendar Navigator */}
            <div className="relative flex items-center" ref={calendarRef}>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 shadow-2xs">
                <button
                  onClick={() => shiftDate(-1)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-white transition-colors cursor-pointer"
                >
                  <LuChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setShowCalendarDropdown(!showCalendarDropdown)}
                  className="px-3 py-1 text-xs font-bold text-gray-800 flex items-center gap-1.5 hover:bg-white rounded-lg transition-colors cursor-pointer"
                >
                  <LuCalendarDays className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{formattedDate}</span>
                </button>

                <button
                  onClick={() => shiftDate(1)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-white transition-colors cursor-pointer"
                >
                  <LuChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={goToToday}
                  className={`ml-1 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                    isTodayDate
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-gray-600 hover:bg-white hover:text-emerald-700'
                  }`}
                >
                  Today
                </button>
              </div>

              {/* Popover Calendar Dropdown */}
              {showCalendarDropdown && (
                <div className="absolute right-0 top-full mt-2 z-50 w-80 bg-white rounded-2xl border border-gray-200 shadow-2xl p-4 animate-fade-in">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                    <button
                      onClick={() => shiftMonth(-1)}
                      className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <LuChevronLeft className="w-4 h-4" />
                    </button>
                    <p className="text-xs font-bold text-gray-900">
                      {MONTHS[viewMonth]} {viewYear}
                    </p>
                    <button
                      onClick={() => shiftMonth(1)}
                      className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <LuChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 uppercase mb-1">
                    <span>Su</span>
                    <span>Mo</span>
                    <span>Tu</span>
                    <span>We</span>
                    <span>Th</span>
                    <span>Fr</span>
                    <span>Sa</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {Array.from({ length: firstDayIndex }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-8" />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateString = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const isSelected = selectedDate === dateString;
                      const isToday = todayStr === dateString;

                      return (
                        <button
                          key={day}
                          onClick={() => selectSpecificDate(viewYear, viewMonth, day)}
                          className={`h-8 w-8 mx-auto flex items-center justify-center rounded-xl text-xs font-semibold transition-all relative cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white font-bold shadow-xs scale-105'
                              : isToday
                              ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={fetchAttendance}
              title="Refresh attendance data"
              className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-emerald-700 transition-colors cursor-pointer"
            >
              <LuRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Realtime KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <LuBuilding2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-500 truncate">Total Staff</p>
            <p className="text-sm sm:text-xl font-bold text-gray-900 leading-tight truncate">{total}</p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <LuCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-500 truncate">Present</p>
            <p className="text-sm sm:text-xl font-bold text-emerald-600 leading-tight truncate">{presentCount}</p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <LuX className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-500 truncate">Absent</p>
            <p className="text-sm sm:text-xl font-bold text-rose-600 leading-tight truncate">{absentCount}</p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <LuClock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-500 truncate">On Leave / Late</p>
            <p className="text-sm sm:text-xl font-bold text-amber-600 leading-tight truncate">{leaveCount + lateCount}</p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-2.5 sm:gap-3 col-span-2 sm:col-span-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <LuSparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-500 truncate">Turnout Rate</p>
            <p className="text-sm sm:text-xl font-bold text-emerald-700 leading-tight truncate">{attendanceRate}%</p>
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Department & Status Filters */}
      <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, role, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 shrink-0">Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="English">English</option>
              <option value="Social Studies">Social Studies</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Teaching">Teaching Faculty</option>
              <option value="Administration">Administration</option>
            </select>
          </div>
        </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="ALL">ALL (All Status)</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
      </div>

      {/* Staff Attendance Roster Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Staff Member</th>
                <th className="py-3.5 px-5">Department</th>
                <th className="py-3.5 px-5">Clock In</th>
                <th className="py-3.5 px-5">Clock Out</th>
                <th className="py-3.5 px-5">Working Time</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-sm text-gray-400">
                    <LuLoader className="w-7 h-7 animate-spin text-emerald-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 font-medium">Fetching faculty attendance records...</p>
                  </td>
                </tr>
              ) : filteredStaff.length > 0 ? (
                filteredStaff.map((staff) => (
                  <tr key={staff.id || staff.teacher_id} className="hover:bg-gray-50/60 transition-colors group">
                    {/* Staff Name & ID */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">
                          {(staff.name || 'S').split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                            {staff.name}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono">
                            {staff.id} • {staff.role}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-5">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-gray-100 text-gray-700">
                        {staff.dept}
                      </span>
                    </td>

                    {/* Clock In */}
                    <td className="py-3.5 px-5">
                      <span className={`text-xs font-mono font-bold ${staff.clockIn !== '—' ? 'text-gray-800' : 'text-gray-400'}`}>
                        {staff.clockIn}
                      </span>
                    </td>

                    {/* Clock Out */}
                    <td className="py-3.5 px-5">
                      <span className={`text-xs font-mono font-bold ${staff.clockOut !== '—' ? 'text-gray-800' : 'text-gray-400'}`}>
                        {staff.clockOut}
                      </span>
                    </td>

                    {/* Working Duration */}
                    <td className="py-3.5 px-5">
                      <span className="text-xs font-semibold text-gray-700">
                        {staff.duration}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          staff.status === 'Present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : staff.status === 'Late'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : staff.status === 'Half Day'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : staff.status === 'On Leave' || staff.status === 'Leave'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : staff.status === 'Absent'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {staff.status === 'Present' && <LuCheck className="w-3 h-3" />}
                        {staff.status === 'Absent' && <LuX className="w-3 h-3" />}
                        {staff.status === 'Late' && <LuClock className="w-3 h-3" />}
                        {staff.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openMarkModal(staff)}
                          className="px-2.5 py-1 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors inline-flex items-center gap-1 text-xs font-bold cursor-pointer"
                          title="Mark or Update Attendance"
                        >
                          <LuPencil className="w-3.5 h-3.5" />
                          <span>Mark</span>
                        </button>
                        <button
                          onClick={() => setSelectedStaffDetail(staff)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors inline-flex items-center gap-1 text-xs font-semibold cursor-pointer"
                          title="View Profile & Contact"
                        >
                          <LuEye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-sm text-gray-400">
                    No staff records found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Mark / Override Staff Attendance */}
      {editingAttendanceStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-200 overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-emerald-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  <LuClock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Mark Attendance</h3>
                  <p className="text-xs text-gray-500 font-medium">{editingAttendanceStaff.name} • {formattedDate}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingAttendanceStaff(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAttendance} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Select Attendance Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Present', 'Absent', 'Late', 'Half Day', 'Leave'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setMarkingStatus(st)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        markingStatus === st
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {['Present', 'Late', 'Half Day'].includes(markingStatus) && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Clock In Time</label>
                    <input
                      type="time"
                      value={checkInTime}
                      onChange={(e) => setCheckInTime(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Clock Out Time</label>
                    <input
                      type="time"
                      value={checkOutTime}
                      onChange={(e) => setCheckOutTime(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Admin Remarks (Optional)</label>
                <input
                  type="text"
                  value={markingRemarks}
                  onChange={(e) => setMarkingRemarks(e.target.value)}
                  placeholder="e.g. On-duty event, delayed due to weather..."
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingAttendanceStaff(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingMark}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {submittingMark ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuCheck className="w-4 h-4" />}
                  {submittingMark ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Staff Details & Attendance Card */}
      {selectedStaffDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-200 relative z-10 overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  {(selectedStaffDetail.name || 'S').split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{selectedStaffDetail.name}</h3>
                  <p className="text-xs text-gray-500">{selectedStaffDetail.role}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStaffDetail(null)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Today's Status</p>
                  <p className="text-sm font-bold text-emerald-700 mt-0.5">{selectedStaffDetail.status}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Monthly Turnout</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{selectedStaffDetail.rate || 96}%</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Clock In</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5 font-mono">{selectedStaffDetail.clockIn}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Clock Out</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5 font-mono">{selectedStaffDetail.clockOut}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <p className="font-bold text-gray-800">Official Contact & Dept</p>
                <div className="space-y-1.5 text-gray-600">
                  <div className="flex items-center gap-2">
                    <LuBuilding2 className="w-4 h-4 text-gray-400" />
                    <span>Department: {selectedStaffDetail.dept}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LuPhone className="w-4 h-4 text-gray-400" />
                    <span>{selectedStaffDetail.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LuMail className="w-4 h-4 text-gray-400" />
                    <span>{selectedStaffDetail.email || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/60 flex justify-end">
              <button
                onClick={() => setSelectedStaffDetail(null)}
                className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
