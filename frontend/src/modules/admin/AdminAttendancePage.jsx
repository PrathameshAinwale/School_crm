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
} from 'react-icons/lu';

export default function AdminAttendancePage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ total: 0, present: 0, absent: 0, late: 0, leave: 0, attendance_rate: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

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
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-primary-600 text-white flex items-center justify-center shadow-md shadow-primary-500/20 shrink-0">
            <LuClipboardList className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800">Faculty & Staff Attendance</h1>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[11px] border border-slate-200">
                View Only
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily attendance register, check-ins, and leave records for school teaching & administrative staff
            </p>
          </div>
        </div>

        {/* Date Selector */}
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

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Faculty</span>
            <LuUsers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-800">{summary.total || records.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Active staff roster</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Present</span>
            <LuUserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{summary.present}</div>
          <div className="text-[11px] text-emerald-600/80 mt-0.5">On duty today</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs bg-gradient-to-br from-white to-rose-50/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Absent</span>
            <LuUserX className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700">{summary.absent}</div>
          <div className="text-[11px] text-rose-600/80 mt-0.5">Unreported absence</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Late / Leave</span>
            <LuClock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">{(summary.late || 0) + (summary.leave || 0)}</div>
          <div className="text-[11px] text-amber-600/80 mt-0.5">Late check-in & leave</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-primary-100 shadow-xs bg-gradient-to-br from-white to-primary-50/30 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-primary-600 uppercase tracking-wider">Attendance Rate</span>
            <LuCalendarCheck className="w-4 h-4 text-primary-600" />
          </div>
          <div className="text-2xl font-black text-primary-700">{summary.attendance_rate || 0}%</div>
          <div className="text-[11px] text-primary-600/80 mt-0.5">Staff presence ratio</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search faculty name, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 w-full sm:w-auto">
            <LuBuilding2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 py-1 pr-2 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {departments.filter((d) => d !== 'ALL').map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <strong>{filteredRecords.length}</strong> faculty staff
        </div>
      </div>

      {/* Staff Attendance Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-xs">
          <LuLoader className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading faculty attendance for {selectedDate}...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <LuUsers className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No Staff Records Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No teaching or administrative staff registered in this department.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
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
                    {/* Clock In */}
                    <td className="px-5 py-4">
                      <span className={`text-xs font-mono font-bold ${staff.check_in_time ? 'text-slate-800' : 'text-slate-400'}`}>
                        {staff.check_in_time || '—'}
                      </span>
                    </td>
                    {/* Clock Out */}
                    <td className="px-5 py-4">
                      <span className={`text-xs font-mono font-bold ${staff.check_out_time ? 'text-slate-800' : 'text-slate-400'}`}>
                        {staff.check_out_time || '—'}
                      </span>
                    </td>
                    {/* Working Duration */}
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
      )}
    </div>
  );
}
