import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  LuCalendarDays,
  LuCalendarCheck,
  LuHourglass,
  LuCalendar,
  LuFingerprint,
  LuCheck,
  LuLoader,
  LuCircleCheck,
  LuClock,
  LuUserCheck,
  LuUserX,
} from 'react-icons/lu';

export default function TeacherAttendancePage() {
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [punchInTime, setPunchInTime] = useState(null);
  const [punchOutTime, setPunchOutTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [punching, setPunching] = useState(false);
  const [history, setHistory] = useState([]);
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [summary, setSummary] = useState({ present_days: 0, absent_days: 0, late_days: 0 });
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const res = await adminService.getTeacherMyAttendance();
      if (res.success) {
        setTeacherInfo(res.teacher);
        setIsPunchedIn(res.today.is_punched_in);
        setPunchInTime(res.today.punch_in_time);
        setPunchOutTime(res.today.punch_out_time);
        setElapsed(res.today.elapsed_seconds || 0);
        setHistory(res.history || []);
        if (res.summary) setSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to load teacher attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  // Live seconds ticker when punched in
  useEffect(() => {
    let interval;
    if (isPunchedIn) {
      interval = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPunchedIn]);

  const handlePunchToggle = async () => {
    setPunching(true);
    try {
      const res = await adminService.teacherPunch();
      if (res.success) {
        showToast(res.message);
        loadAttendance();
      }
    } catch (err) {
      showToast(err.data?.message || 'Failed to record attendance punch.');
    } finally {
      setPunching(false);
    }
  };

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // Convert elapsed to hours for progress bar
  const hoursCompleted = (elapsed / 3600).toFixed(1);
  const requiredHoursForHalfDay = 4;
  const requiredHoursForFullDay = 7.5;
  let progressState = 'Incomplete';
  if (hoursCompleted >= requiredHoursForFullDay) progressState = 'Full Day';
  else if (hoursCompleted >= requiredHoursForHalfDay) progressState = 'Half Day';

  const progressPercent = Math.min((hoursCompleted / 8) * 100, 100);

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 animate-scale-up">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <LuCircleCheck className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-primary-500/20 shrink-0">
            <LuFingerprint className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Faculty Attendance & Time Tracker</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {teacherInfo ? `${teacherInfo.name} (${teacherInfo.employee_id || 'Faculty'})` : 'Daily Clock-in / Clock-out Register'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-gray-100 rounded-xl text-xs font-bold text-gray-700 self-start sm:self-auto">
          <LuCalendar className="w-4 h-4 text-primary-600" />
          <span>{currentDate}</span>
        </div>
      </div>

      {/* Today's Live Punch Clock Widget */}
      <div className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <LuCalendarDays className="w-5 h-5 text-primary-600" />
            <h2 className="text-sm font-bold text-gray-900">Today's Live Working Status</h2>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isPunchedIn
                  ? 'bg-emerald-100 text-emerald-800'
                  : punchInTime
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isPunchedIn ? '● Clocked In (Active)' : punchInTime ? 'Checked Out' : 'Not Clocked In Today'}
            </span>
          </div>
        </div>

        {/* Middle Section - Timer */}
        <div className="px-6 py-8 bg-gradient-to-b from-indigo-50/40 to-indigo-50/10 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Working Hours Today</p>
            {isPunchedIn && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider animate-pulse">
                Live Active
              </span>
            )}
          </div>

          <div className="mb-6 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-mono font-black text-indigo-600 tracking-tight">
              {formatTime(elapsed)}
            </span>
            <span className="text-lg sm:text-xl font-mono font-medium text-gray-400">
              / 08:00:00 Target
            </span>
          </div>

          {/* Progress Box */}
          <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-4 sm:px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <LuHourglass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <LuCalendarCheck className="w-4 h-4 text-amber-600" />
                  Status: {progressState}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {hoursCompleted} hrs recorded today. Requires {requiredHoursForFullDay} hrs for standard Full Day presence.
                </p>
              </div>
            </div>

            <div className="w-full sm:w-40 bg-amber-200/40 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Section - Action Bar */}
        <div className="p-6 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6 text-xs text-gray-600">
            <div>
              <span className="text-gray-400 block text-[11px] font-bold uppercase">Clock In Time</span>
              <span className="font-bold text-gray-800 font-mono text-sm">
                {punchInTime || '—'}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px] font-bold uppercase">Clock Out Time</span>
              <span className="font-bold text-gray-800 font-mono text-sm">
                {punchOutTime || (isPunchedIn ? 'In Progress...' : '—')}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px] font-bold uppercase">Today's Duration</span>
              <span className="font-bold text-indigo-700 font-mono text-sm">
                {formatTime(elapsed)}
              </span>
            </div>
          </div>

          <button
            onClick={handlePunchToggle}
            disabled={punching}
            className={`px-6 py-3 rounded-2xl text-xs font-bold text-white transition-all shadow-md flex items-center gap-2.5 disabled:opacity-50 ${
              isPunchedIn
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
            }`}
          >
            {punching ? (
              <LuLoader className="w-4 h-4 animate-spin" />
            ) : (
              <LuFingerprint className="w-4 h-4" />
            )}
            <span>{isPunchedIn ? 'Clock Out for the Day' : punchInTime ? 'Clock In Again' : 'Clock In Now'}</span>
          </button>
        </div>
      </div>

      {/* Past Attendance Register */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Attendance Log History</h2>
            <p className="text-xs text-gray-400 mt-0.5">Recent daily attendance records & check-in timestamps</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">
              {summary.present_days} Present
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700">
              {summary.absent_days} Absent
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <LuLoader className="w-6 h-6 animate-spin text-primary-600 mx-auto mb-2" />
            <p className="text-xs text-gray-500 font-medium">Fetching attendance history...</p>
          </div>
        ) : history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="p-4 pl-6">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Clock In</th>
                  <th className="p-4">Clock Out</th>
                  <th className="p-4">Actual Working Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {history.map((log, i) => (
                  <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4 pl-6 text-gray-900 font-bold whitespace-nowrap">{log.date}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          log.status === 'Present'
                            ? 'bg-emerald-50 text-emerald-700'
                            : log.status === 'Late'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-700 font-mono">{log.checkIn}</td>
                    <td className="p-4 text-gray-700 font-mono">{log.checkOut}</td>
                    <td className="p-4 font-bold text-gray-900">{log.actual}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400 text-xs">
            No past attendance records found yet.
          </div>
        )}
      </div>
    </div>
  );
}
