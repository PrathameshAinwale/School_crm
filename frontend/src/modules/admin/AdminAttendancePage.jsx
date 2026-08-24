import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  LuUsers,
  LuCalendar,
  LuChevronLeft,
  LuChevronRight,
  LuSearch,
  LuClipboardList,
  LuLoader,
  LuClock,
  LuCalendarCheck,
  LuUserCheck,
  LuUserX,
  LuBuilding2,
  LuFilter,
} from 'react-icons/lu';

export default function AdminAttendancePage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ total: 0, present: 0, absent: 0, late: 0, leave: 0, attendance_rate: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAttendance({
        date: selectedDate,
        type: 'staff',
      });
      if (res.success) {
        setRecords(res.data || []);
        if (res.summary) {
          setSummary(res.summary);
        }
      }
    } catch (err) {
      console.error('Failed to load staff attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [selectedDate]);

  const shiftDate = (deltaDays) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + deltaDays);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Departments list for filter
  const departments = ['ALL', ...new Set(records.map((r) => r.department).filter(Boolean))];

  const filteredRecords = records.filter((r) => {
    if (selectedDept !== 'ALL' && r.department !== selectedDept) {
      return false;
    }
    if (selectedStatus !== 'ALL' && (r.status || '').toLowerCase() !== selectedStatus.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (r.name || '').toLowerCase();
      const empId = (r.employee_id || '').toLowerCase();
      const dept = (r.department || '').toLowerCase();
      return name.includes(q) || empId.includes(q) || dept.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-indigo-600 to-primary-600 text-white flex items-center justify-center shadow-md shadow-primary-500/20 shrink-0">
            <LuClipboardList className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-xl font-bold text-slate-800 leading-tight">Staff Attendance</h1>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px] sm:text-[11px] border border-slate-200">
                View Only
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Daily check-ins, leave records & attendance overview
            </p>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 p-1 sm:p-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => shiftDate(-1)}
            title="Previous Day"
            className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 transition-colors shadow-xs cursor-pointer"
          >
            <LuChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2">
            <LuCalendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600" />
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
            className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 transition-colors shadow-xs cursor-pointer"
          >
            <LuChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 sm:gap-3.5">
        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
            <LuUsers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800">{summary.total || records.length}</div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block">Active staff roster</div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-100 shadow-xs bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Present</span>
            <LuUserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">{summary.present}</div>
          <div className="text-[10px] sm:text-[11px] text-emerald-600/80 mt-0.5 hidden sm:block">On duty today</div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-rose-100 shadow-xs bg-gradient-to-br from-white to-rose-50/30">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-rose-600 uppercase tracking-wider">Absent</span>
            <LuUserX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-700">{summary.absent}</div>
          <div className="text-[10px] sm:text-[11px] text-rose-600/80 mt-0.5 hidden sm:block">Unreported</div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-amber-100 shadow-xs bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-amber-600 uppercase tracking-wider">Late/Leave</span>
            <LuClock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-700">{(summary.late || 0) + (summary.leave || 0)}</div>
          <div className="text-[10px] sm:text-[11px] text-amber-600/80 mt-0.5 hidden sm:block">Late & leave</div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-primary-100 shadow-xs bg-gradient-to-br from-white to-primary-50/30 col-span-2 sm:col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-primary-600 uppercase tracking-wider">Rate</span>
            <LuCalendarCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-primary-700">{summary.attendance_rate || 0}%</div>
          <div className="text-[10px] sm:text-[11px] text-primary-600/80 mt-0.5 hidden sm:block">Presence ratio</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search faculty name, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-2 sm:flex gap-2">
            {/* Department Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 sm:py-1">
              <LuBuilding2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 py-0.5 pr-1 focus:outline-none cursor-pointer w-full"
              >
                <option value="ALL">All Depts</option>
                {departments.filter((d) => d !== 'ALL').map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 sm:py-1">
              <LuFilter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 py-0.5 pr-1 focus:outline-none cursor-pointer w-full"
              >
                <option value="ALL">All Status</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="Half Day">Half Day</option>
                <option value="On Leave">On Leave</option>
                <option value="Not Marked">Not Marked</option>
              </select>
            </div>
          </div>
        </div>

        <div className="text-[11px] sm:text-xs text-slate-400 font-medium text-center sm:text-left">
          Showing <strong>{filteredRecords.length}</strong> staff
        </div>
      </div>

      {/* Staff Attendance Records */}
      {loading ? (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-12 sm:p-16 text-center shadow-xs">
          <LuLoader className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading attendance for {selectedDate}...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-50 text-primary-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3">
            <LuUsers className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-1">No Staff Records Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No attendance data available for this date and filters.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile View: Attendance Cards */}
          <div className="sm:hidden space-y-2.5">
            {filteredRecords.map((staff) => {
              const statusConfig = {
                Present: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Present' },
                Absent: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500', label: 'Absent' },
                Late: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', label: 'Late' },
                Leave: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500', label: 'On Leave' },
              };
              const sc = statusConfig[staff.status] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400', label: staff.status || 'N/A' };

              return (
                <div key={staff.teacher_id} className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs space-y-2.5">
                  {/* Top: Avatar + Name + Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {staff.name?.[0] || 'T'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">{staff.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{staff.employee_id}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${sc.bg} ${sc.text} border ${sc.border} inline-flex items-center gap-1 shrink-0`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
                      {sc.label}
                    </span>
                  </div>

                  {/* Clock In/Out Strip */}
                  <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">In</p>
                      <p className={`text-xs font-bold font-mono ${staff.check_in_time ? 'text-slate-800' : 'text-slate-300'}`}>
                        {staff.check_in_time || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Out</p>
                      <p className={`text-xs font-bold font-mono ${staff.check_out_time ? 'text-slate-800' : 'text-slate-300'}`}>
                        {staff.check_out_time || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Hrs</p>
                      <p className={`text-xs font-bold ${staff.work_duration && staff.work_duration.includes('Active') ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {staff.work_duration || '—'}
                      </p>
                    </div>
                  </div>

                  {/* Dept + Remarks */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold border border-slate-200/60">
                      {staff.department || 'General'}
                    </span>
                    {staff.remarks && (
                      <span className="text-slate-400 italic truncate ml-2 max-w-[140px]">{staff.remarks}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View: Full Table */}
          <div className="hidden sm:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">Faculty Staff</th>
                    <th className="px-5 py-3.5">Employee ID</th>
                    <th className="px-5 py-3.5">Department</th>
                    <th className="px-5 py-3.5">Clock In</th>
                    <th className="px-5 py-3.5">Clock Out</th>
                    <th className="px-5 py-3.5">Duration</th>
                    <th className="px-5 py-3.5">Attendance Status</th>
                    <th className="px-5 py-3.5">Remarks / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredRecords.map((staff) => (
                    <tr key={staff.teacher_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {staff.name?.[0] || 'T'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{staff.name}</div>
                            <div className="text-[11px] text-slate-400">Faculty Staff</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-100 text-[11px]">
                          {staff.employee_id}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200/60">
                          {staff.department || 'General'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-mono font-bold ${staff.check_in_time ? 'text-slate-800' : 'text-slate-400'}`}>
                          {staff.check_in_time || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-mono font-bold ${staff.check_out_time ? 'text-slate-800' : 'text-slate-400'}`}>
                          {staff.check_out_time || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold ${staff.work_duration && staff.work_duration.includes('Active') ? 'text-emerald-600 font-bold' : 'text-slate-700'}`}>
                          {staff.work_duration || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {staff.status === 'Present' && (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Present
                          </span>
                        )}
                        {staff.status === 'Absent' && (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Absent
                          </span>
                        )}
                        {staff.status === 'Late' && (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Late
                          </span>
                        )}
                        {staff.status === 'Leave' && (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            On Leave
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-slate-500 text-xs">
                          {staff.remarks || <span className="text-slate-300 italic">No notes</span>}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
