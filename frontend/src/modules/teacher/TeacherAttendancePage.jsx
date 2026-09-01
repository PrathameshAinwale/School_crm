import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  LuCalendarDays,
  LuCalendar,
  LuFingerprint,
  LuLoader,
  LuCircleCheck,
  LuLogIn,
  LuLogOut,
  LuX,
  LuChevronLeft,
  LuChevronRight,
  LuFlame,
  LuCheck,
  LuTrendingUp,
} from 'react-icons/lu';

export default function TeacherAttendancePage() {
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [isCompletedToday, setIsCompletedToday] = useState(false);
  const [punchInTime, setPunchInTime] = useState(null);
  const [punchOutTime, setPunchOutTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [punching, setPunching] = useState(false);
  const [history, setHistory] = useState([]);
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [summary, setSummary] = useState({ present_days: 0, absent_days: 0, late_days: 0 });
  const [toastMessage, setToastMessage] = useState(null);

  // Heatmap State
  const [showHeatmapModal, setShowHeatmapModal] = useState(false);
  const [heatmapData, setHeatmapData] = useState(null);
  const [heatmapMonth, setHeatmapMonth] = useState(() => new Date().getMonth() + 1);
  const [heatmapYear, setHeatmapYear] = useState(() => new Date().getFullYear());
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [selectedDayDetail, setSelectedDayDetail] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAttendance = async (month = heatmapMonth, year = heatmapYear) => {
    setLoading(true);
    try {
      const res = await adminService.getTeacherMyAttendance({ month, year });
      if (res.success) {
        setTeacherInfo(res.teacher);
        setIsPunchedIn(Boolean(res.today?.is_punched_in));
        setIsCompletedToday(Boolean(res.today?.is_completed_today));
        setPunchInTime(res.today?.punch_in_time);
        setPunchOutTime(res.today?.punch_out_time);
        setHistory(res.history || []);
        if (res.summary) setSummary(res.summary);
        if (res.heatmap) {
          setHeatmapData(res.heatmap);
          const todayItem = res.heatmap.days?.find((d) => d.is_today) || res.heatmap.days?.[0];
          setSelectedDayDetail(todayItem || null);
        }
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

  const loadHeatmapMonth = async (month, year) => {
    setHeatmapLoading(true);
    try {
      const res = await adminService.getTeacherMyAttendance({ month, year });
      if (res.success && res.heatmap) {
        setHeatmapData(res.heatmap);
        const todayItem = res.heatmap.days?.find((d) => d.is_today) || res.heatmap.days?.[0];
        setSelectedDayDetail(todayItem || null);
      }
    } catch (err) {
      console.error('Failed to load heatmap:', err);
    } finally {
      setHeatmapLoading(false);
    }
  };

  const handlePrevMonth = () => {
    let m = heatmapMonth - 1;
    let y = heatmapYear;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    setHeatmapMonth(m);
    setHeatmapYear(y);
    loadHeatmapMonth(m, y);
  };

  const handleNextMonth = () => {
    let m = heatmapMonth + 1;
    let y = heatmapYear;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setHeatmapMonth(m);
    setHeatmapYear(y);
    loadHeatmapMonth(m, y);
  };

  const handleCurrentMonthJump = () => {
    const nowM = new Date().getMonth() + 1;
    const nowY = new Date().getFullYear();
    setHeatmapMonth(nowM);
    setHeatmapYear(nowY);
    loadHeatmapMonth(nowM, nowY);
  };

  const handlePunchToggle = async () => {
    if (isCompletedToday) {
      showToast('Attendance for today is already completed.');
      return;
    }

    setPunching(true);
    try {
      const res = await adminService.teacherPunch();
      if (res.success) {
        showToast(res.message);
        loadAttendance();
      } else {
        showToast(res.message || 'Action failed.');
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to record attendance punch.');
    } finally {
      setPunching(false);
    }
  };

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
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-3.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-primary-500/20 shrink-0">
            <LuFingerprint className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-gray-900">Attendance & Time Tracker</h1>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
              {teacherInfo ? `${teacherInfo.name}` : 'Daily Clock-in / Clock-out Register'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap self-start sm:self-auto">
          {/* Heat Map Button in Top Corner */}
          <button
            onClick={() => {
              setShowHeatmapModal(true);
              if (!heatmapData) loadHeatmapMonth(heatmapMonth, heatmapYear);
            }}
            className="px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-[11px] sm:text-xs shadow-md shadow-amber-500/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <LuFlame className="w-3.5 h-3.5 animate-pulse" /> Heat Map
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2.5 bg-gray-100 rounded-xl text-[11px] sm:text-xs font-bold text-gray-700">
            <LuCalendar className="w-3.5 h-3.5 text-primary-600" />
            <span>{currentDate}</span>
          </div>
        </div>
      </div>

      {/* Today's Punch Attendance Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <LuCalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            <h2 className="text-xs sm:text-sm font-bold text-gray-900">Today's Attendance Status</h2>
          </div>
          <span
            className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold ${
              isCompletedToday
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : isPunchedIn
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {isCompletedToday
              ? '✓ Completed Today'
              : isPunchedIn
              ? '● Clocked In (Active)'
              : 'Not Clocked In'}
          </span>
        </div>

        {/* Clock In & Clock Out Details */}
        <div className="p-3 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4 bg-gradient-to-b from-slate-50/50 to-white">
          {/* Clock In Card */}
          <div className="p-2.5 sm:p-5 rounded-xl sm:rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3.5">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <LuLogIn className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="text-[9px] sm:text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Clock In Time
                </span>
                <span className="text-sm sm:text-xl font-bold font-mono text-gray-900 mt-0.5 block">
                  {punchInTime || '—'}
                </span>
              </div>
            </div>
            {punchInTime && (
              <span className="text-[9px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                Marked
              </span>
            )}
          </div>

          {/* Clock Out Card */}
          <div className="p-2.5 sm:p-5 rounded-xl sm:rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3.5">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <LuLogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="text-[9px] sm:text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
                  Clock Out Time
                </span>
                <span className="text-sm sm:text-xl font-bold font-mono text-gray-900 mt-0.5 block">
                  {punchOutTime || (isPunchedIn ? 'In Progress...' : '—')}
                </span>
              </div>
            </div>
            {punchOutTime ? (
              <span className="text-[9px] sm:text-[11px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">
                Marked
              </span>
            ) : isPunchedIn ? (
              <span className="text-[9px] sm:text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md animate-pulse">
                Active
              </span>
            ) : null}
          </div>
        </div>

        {/* Punch Action Footer */}
        <div className="px-6 py-4.5 bg-gray-50/80 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-500 font-medium">
            {isCompletedToday
              ? `You have completed your attendance for today (In: ${punchInTime} • Out: ${punchOutTime}).`
              : isPunchedIn
              ? `Currently clocked in since ${punchInTime}. Click Clock Out when your shift ends.`
              : 'Click Clock In Now to register your start time for today.'}
          </div>

          {isCompletedToday ? (
            <button
              disabled={true}
              className="px-6 py-3 rounded-2xl text-xs font-bold bg-slate-200 text-slate-600 cursor-not-allowed border border-slate-300 flex items-center gap-2.5 w-full sm:w-auto justify-center shadow-2xs"
            >
              <LuCheck className="w-4 h-4 text-emerald-600 stroke-[3]" />
              <span>Attendance Completed for Today</span>
            </button>
          ) : isPunchedIn ? (
            <button
              onClick={handlePunchToggle}
              disabled={punching}
              className="px-6 py-3 rounded-2xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-md shadow-rose-600/20 transition-all flex items-center gap-2.5 disabled:opacity-50 w-full sm:w-auto justify-center cursor-pointer"
            >
              {punching ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuLogOut className="w-4 h-4" />}
              <span>Clock Out Now</span>
            </button>
          ) : (
            <button
              onClick={handlePunchToggle}
              disabled={punching}
              className="px-6 py-3 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2.5 disabled:opacity-50 w-full sm:w-auto justify-center cursor-pointer"
            >
              {punching ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuLogIn className="w-4 h-4" />}
              <span>Clock In Now</span>
            </button>
          )}
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

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Clock In</th>
                <th className="py-3.5 px-6">Clock Out</th>
                <th className="py-3.5 px-6">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
              {history.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-400">
                    No past attendance records found.
                  </td>
                </tr>
              ) : (
                history.map((record) => (
                  <tr key={record.id || record.date} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-gray-900">{record.date}</td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                          record.status === 'Present'
                            ? 'bg-emerald-50 text-emerald-700'
                            : record.status === 'Late'
                            ? 'bg-amber-50 text-amber-700'
                            : record.status === 'Half Day'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-mono font-bold text-gray-800">
                      {record.checkIn || '—'}
                    </td>
                    <td className="py-3.5 px-6 font-mono font-bold text-gray-800">
                      {record.checkOut || '—'}
                    </td>
                    <td className="py-3.5 px-6 text-gray-400">
                      {record.actual !== '-' ? `Duration: ${record.actual}` : 'Standard Shift'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ATTENDANCE HEAT MAP MODAL */}
      {showHeatmapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in overflow-hidden">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative z-10 flex flex-col max-h-[92vh] overflow-hidden border border-slate-200 animate-scale-up">
            {/* 1. Header (Fixed at top) */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white shrink-0 relative overflow-hidden">
              <div className="flex items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30 text-sm font-black shrink-0">
                    {teacherInfo?.name ? teacherInfo.name.substring(0, 2).toUpperCase() : 'FT'}
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black tracking-tight leading-tight">
                      {teacherInfo?.name || 'Faculty Member'}
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Attendance Heat Map • {teacherInfo?.department || 'Academic Faculty'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCurrentMonthJump}
                    className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setShowHeatmapModal(false)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <LuX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Month Navigator Toolbar */}
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 bg-slate-800/90 rounded-xl p-1 border border-slate-700/60 shadow-inner">
                  <button
                    onClick={handlePrevMonth}
                    title="Previous Month"
                    className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <LuChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2.5 text-xs font-black tracking-wide text-amber-400 font-mono">
                    {heatmapData?.month_name || 'Current Month'}
                  </span>
                  <button
                    onClick={handleNextMonth}
                    title="Next Month"
                    className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <LuChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-800/60 px-3 py-1 rounded-xl border border-slate-700/40">
                  <LuTrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Present:</span>
                  <strong className="text-emerald-400 font-mono">{heatmapData?.stats?.present ?? 0}d</strong>
                </div>
              </div>
            </div>

            {/* 2. Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
              {/* KPI Strip */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-emerald-200/80 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Present</span>
                  <span className="text-base font-black text-emerald-600 font-mono">
                    {heatmapData?.stats?.present ?? 0} <span className="text-[10px] font-medium text-slate-400">days</span>
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-rose-200/80 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Absent</span>
                  <span className="text-base font-black text-rose-600 font-mono">
                    {heatmapData?.stats?.absent ?? 0} <span className="text-[10px] font-medium text-slate-400">days</span>
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-amber-200/80 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Late</span>
                  <span className="text-base font-black text-amber-600 font-mono">
                    {heatmapData?.stats?.late ?? 0} <span className="text-[10px] font-medium text-slate-400">days</span>
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Weekend / Off</span>
                  <span className="text-base font-black text-slate-700 font-mono">
                    {heatmapData?.stats?.holiday ?? 0} <span className="text-[10px] font-medium text-slate-400">days</span>
                  </span>
                </div>
              </div>

              {/* 7-Column Calendar Heatmap Card */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
                    <div
                      key={day}
                      className="py-0.5 text-[10px] font-black text-slate-400 tracking-wider"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {heatmapLoading ? (
                  <div className="py-12 text-center text-slate-400">
                    <LuLoader className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                    <span className="text-xs font-semibold">Generating monthly attendance tiles...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-1.5">
                    {/* Empty padding before day 1 */}
                    {heatmapData?.start_day_offset > 0 &&
                      [...Array(heatmapData.start_day_offset)].map((_, i) => (
                        <div key={`offset-${i}`} className="min-h-[48px] rounded-xl bg-transparent" />
                      ))}

                    {/* Day Tiles */}
                    {(heatmapData?.days || []).map((dayObj) => {
                      const isSelected = selectedDayDetail?.day === dayObj.day;

                      return (
                        <div
                          key={dayObj.day}
                          onClick={() => setSelectedDayDetail(dayObj)}
                          className={`min-h-[48px] p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative group select-none ${
                            isSelected ? 'ring-2 ring-slate-900 shadow-md scale-[1.03] z-10' : 'hover:scale-[1.02]'
                          } ${
                            dayObj.status === 'Present'
                              ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 font-bold'
                              : dayObj.status === 'Late'
                              ? 'bg-amber-50/90 border-amber-300 text-amber-950 font-bold'
                              : dayObj.status === 'Absent'
                              ? 'bg-rose-50 border-rose-200 text-rose-800 font-bold'
                              : dayObj.status === 'Holiday'
                              ? 'bg-slate-50 border-slate-200/70 text-slate-400'
                              : 'bg-white border-slate-200/80 text-slate-600'
                          }`}
                        >
                          {/* Tile Top: Day number + Status Indicator */}
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black">{dayObj.day}</span>
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                dayObj.status === 'Present'
                                  ? 'bg-emerald-500'
                                  : dayObj.status === 'Late'
                                  ? 'bg-amber-500'
                                  : dayObj.status === 'Absent'
                                  ? 'bg-rose-500'
                                  : dayObj.status === 'Holiday'
                                  ? 'bg-slate-300'
                                  : 'bg-slate-200'
                              }`}
                            />
                          </div>

                          {/* Tile Bottom: Time or Label */}
                          <div className="text-[9px] font-mono leading-none truncate mt-0.5">
                            {dayObj.check_in ? (
                              <span className="font-bold text-emerald-700">{dayObj.check_in}</span>
                            ) : dayObj.status === 'Holiday' ? (
                              <span className="text-slate-400 font-sans text-[8.5px]">Sunday</span>
                            ) : dayObj.status === 'Absent' ? (
                              <span className="text-rose-600 font-sans font-bold text-[8.5px]">Absent</span>
                            ) : dayObj.is_today ? (
                              <span className="text-primary-600 font-sans font-bold text-[8.5px]">Today</span>
                            ) : (
                              <span className="text-slate-300 text-[8.5px]">—</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Day Inspector Strip */}
              {selectedDayDetail && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0">
                      {selectedDayDetail.day}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">
                          {selectedDayDetail.date}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold ${
                            selectedDayDetail.status === 'Present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : selectedDayDetail.status === 'Late'
                              ? 'bg-amber-100 text-amber-800'
                              : selectedDayDetail.status === 'Absent'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {selectedDayDetail.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {selectedDayDetail.check_in
                          ? `Clock In: ${selectedDayDetail.check_in} ${selectedDayDetail.check_out ? `• Clock Out: ${selectedDayDetail.check_out}` : '(Active Shift)'}`
                          : selectedDayDetail.status === 'Holiday'
                          ? 'Weekend Holiday'
                          : selectedDayDetail.is_future
                          ? 'Upcoming Scheduled Working Day'
                          : 'Standard Working Day'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Legend Bar */}
              <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-semibold text-slate-600 pt-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Present
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Late
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Absent
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" /> Weekend
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-100 border border-slate-300 inline-block" /> Standard
                </span>
              </div>
            </div>

            {/* 3. Footer (Fixed at bottom) */}
            <div className="p-3 border-t border-slate-100 bg-white flex items-center justify-between text-xs shrink-0">
              <span className="text-slate-400 text-[11px]">
                Biometric attendance records synced with institutional server
              </span>
              <button
                onClick={() => setShowHeatmapModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors cursor-pointer text-xs"
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
