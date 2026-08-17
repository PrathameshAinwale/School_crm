import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-icons/lu';

const STAFF_MEMBERS = [
  { id: 'EMP-101', name: 'Dr. Ananya Sen', role: 'PGT Mathematics', dept: 'Teaching', clockIn: '07:55 AM', clockOut: '04:10 PM', duration: '8h 15m', status: 'Present', phone: '+91 98765 11001', email: 'ananya.sen@eduflow.edu', rate: 98 },
  { id: 'EMP-102', name: 'Mr. Vikram Rathore', role: 'PGT Physics & Science', dept: 'Teaching', clockIn: '08:02 AM', clockOut: '04:05 PM', duration: '8h 03m', status: 'Present', phone: '+91 98765 11002', email: 'vikram.r@eduflow.edu', rate: 96 },
  { id: 'EMP-103', name: 'Ms. Sunita Rao', role: 'TGT English Language', dept: 'Teaching', clockIn: '07:50 AM', clockOut: '03:55 PM', duration: '8h 05m', status: 'Present', phone: '+91 98765 11003', email: 'sunita.rao@eduflow.edu', rate: 97 },
  { id: 'EMP-104', name: 'Mr. Manoj Joshi', role: 'TGT Social Science', dept: 'Teaching', clockIn: '-', clockOut: '-', duration: '-', status: 'Absent', phone: '+91 98765 11004', email: 'manoj.joshi@eduflow.edu', rate: 88 },
  { id: 'EMP-105', name: 'Mrs. Deepa Krishnan', role: 'Head of Computer Science & AI', dept: 'Teaching', clockIn: '07:45 AM', clockOut: '04:15 PM', duration: '8h 30m', status: 'Present', phone: '+91 98765 11005', email: 'deepa.k@eduflow.edu', rate: 99 },
  { id: 'EMP-106', name: 'Mr. Rajesh Sharma', role: 'Chief Administrative Officer', dept: 'Administration', clockIn: '08:00 AM', clockOut: '05:00 PM', duration: '9h 00m', status: 'Present', phone: '+91 98765 11006', email: 'rajesh.admin@eduflow.edu', rate: 98 },
  { id: 'EMP-107', name: 'Ms. Priya Verma', role: 'Senior Accounts Officer', dept: 'Finance & Accounts', clockIn: '08:10 AM', clockOut: '04:45 PM', duration: '8h 35m', status: 'Present', phone: '+91 98765 11007', email: 'priya.accounts@eduflow.edu', rate: 95 },
  { id: 'EMP-108', name: 'Mr. Suresh Kumar', role: 'TGT Hindi Literature', dept: 'Teaching', clockIn: '-', clockOut: '-', duration: '-', status: 'On Leave', phone: '+91 98765 11008', email: 'suresh.k@eduflow.edu', rate: 92 },
  { id: 'EMP-109', name: 'Mr. Amit Patel', role: 'Senior Lab & IT Technician', dept: 'IT & Labs', clockIn: '07:40 AM', clockOut: '04:30 PM', duration: '8h 50m', status: 'Present', phone: '+91 98765 11009', email: 'amit.it@eduflow.edu', rate: 100 },
  { id: 'EMP-110', name: 'Mrs. Kavita Saxena', role: 'Head Librarian & Archivist', dept: 'Library', clockIn: '08:15 AM', clockOut: '04:00 PM', duration: '7h 45m', status: 'Present', phone: '+91 98765 11010', email: 'kavita.lib@eduflow.edu', rate: 94 },
  { id: 'EMP-111', name: 'Mr. Harish Chandra', role: 'Transport & Fleet Supervisor', dept: 'Support & Transport', clockIn: '06:45 AM', clockOut: '05:30 PM', duration: '10h 45m', status: 'Present', phone: '+91 98765 11011', email: 'harish.fleet@eduflow.edu', rate: 99 },
  { id: 'EMP-112', name: 'Ms. Neha Kulkarni', role: 'School Nurse & Health Counselor', dept: 'Medical', clockIn: '08:00 AM', clockOut: '04:00 PM', duration: '8h 00m', status: 'Present', phone: '+91 98765 11012', email: 'health.neha@eduflow.edu', rate: 96 },
];

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

  // Calendar popover state
  const [showCalendarDropdown, setShowCalendarDropdown] = useState(false);
  const selectedDateObj = new Date(selectedDate);
  const [viewYear, setViewYear] = useState(selectedDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDateObj.getMonth());
  const calendarRef = useRef(null);

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

  // Stats calculation
  const total = 280; // Representing whole campus staff
  const presentCount = 268;
  const absentCount = 8;
  const leaveCount = 4;
  const attendanceRate = ((presentCount / total) * 100).toFixed(1);

  // Filtered members
  const filteredStaff = STAFF_MEMBERS.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.dept.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = deptFilter === 'ALL' || s.dept === deptFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

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
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
              <LuUsers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">Staff & Faculty Attendance</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Campus-Wide Portal
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Real-time tracking of teachers, administrators, IT, and support staff check-ins
              </p>
            </div>
          </div>

          {/* Controls: Date Picker & Export */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Calendar Navigator */}
            <div className="relative flex items-center" ref={calendarRef}>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 shadow-2xs">
                <button
                  onClick={() => shiftDate(-1)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-white transition-colors"
                >
                  <LuChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setShowCalendarDropdown(!showCalendarDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-800 hover:bg-white hover:shadow-2xs transition-all cursor-pointer"
                >
                  <LuCalendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{formattedDate}</span>
                  <LuChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  onClick={() => shiftDate(1)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-white transition-colors"
                >
                  <LuChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={setToday}
                  className="ml-1 px-2.5 py-1 text-[11px] font-bold bg-white text-emerald-700 hover:bg-emerald-50 rounded-lg shadow-2xs border border-gray-200/60 transition-colors"
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
                      className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <LuChevronLeft className="w-4 h-4" />
                    </button>
                    <p className="text-xs font-bold text-gray-900">
                      {MONTHS[viewMonth]} {viewYear}
                    </p>
                    <button
                      onClick={() => shiftMonth(1)}
                      className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
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
                          className={`h-8 w-8 mx-auto flex items-center justify-center rounded-xl text-xs font-semibold transition-all relative ${
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

                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                    <button onClick={setToday} className="text-emerald-600 font-bold hover:text-emerald-700">
                      Jump to Today
                    </button>
                    <button onClick={() => setShowCalendarDropdown(false)} className="text-gray-400 hover:text-gray-700">
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Export Button */}
            <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm">
              <LuDownload className="w-4 h-4" /> Export Report
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <LuBuilding2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500">Total Staff</p>
            <p className="text-xl font-bold text-gray-900 leading-tight">{total}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <LuCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500">Present Today</p>
            <p className="text-xl font-bold text-emerald-600 leading-tight">{presentCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <LuX className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500">Unexcused Absent</p>
            <p className="text-xl font-bold text-rose-600 leading-tight">{absentCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <LuClock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500">On Approved Leave</p>
            <p className="text-xl font-bold text-amber-600 leading-tight">{leaveCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <LuSparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500">Turnout Rate</p>
            <p className="text-xl font-bold text-primary-700 leading-tight">{attendanceRate}%</p>
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Department & Status Filters */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
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
              <option value="Teaching">Teaching Faculty</option>
              <option value="Administration">Administration</option>
              <option value="Finance & Accounts">Finance & Accounts</option>
              <option value="IT & Labs">IT & Labs</option>
              <option value="Library">Library</option>
              <option value="Support & Transport">Support & Transport</option>
              <option value="Medical">Medical / Health</option>
            </select>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
          <span className="text-xs font-semibold text-gray-400 mr-1 hidden sm:inline">Status:</span>
          {['ALL', 'Present', 'Absent', 'On Leave'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab
                  ? 'bg-gray-900 text-white shadow-2xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
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
              {filteredStaff.length > 0 ? (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50/60 transition-colors group">
                    {/* Staff Name & ID */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">
                          {staff.name.split(' ').map((n) => n[0]).join('')}
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
                      <span className={`text-xs font-mono font-bold ${staff.clockIn !== '-' ? 'text-gray-800' : 'text-gray-400'}`}>
                        {staff.clockIn}
                      </span>
                    </td>

                    {/* Clock Out */}
                    <td className="py-3.5 px-5">
                      <span className={`text-xs font-mono font-bold ${staff.clockOut !== '-' ? 'text-gray-800' : 'text-gray-400'}`}>
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
                            : staff.status === 'On Leave'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {staff.status === 'Present' && <LuCheck className="w-3 h-3" />}
                        {staff.status === 'Absent' && <LuX className="w-3 h-3" />}
                        {staff.status === 'On Leave' && <LuClock className="w-3 h-3" />}
                        {staff.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => setSelectedStaffDetail(staff)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                        title="View Profile & Contact"
                      >
                        <LuEye className="w-4 h-4" />
                        <span className="hidden sm:inline">Details</span>
                      </button>
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

      {/* Modal: Staff Details & Attendance Card */}
      {selectedStaffDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs"
            onClick={() => setSelectedStaffDetail(null)}
          />

          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  {selectedStaffDetail.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{selectedStaffDetail.name}</h3>
                  <p className="text-xs text-gray-500">{selectedStaffDetail.role}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStaffDetail(null)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
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
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{selectedStaffDetail.rate}%</p>
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
                    <span>{selectedStaffDetail.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LuMail className="w-4 h-4 text-gray-400" />
                    <span>{selectedStaffDetail.email}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/60 flex justify-end">
              <button
                onClick={() => setSelectedStaffDetail(null)}
                className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-all"
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
