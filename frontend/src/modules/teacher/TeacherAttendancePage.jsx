import React, { useState, useEffect } from 'react';
import { LuCalendarDays, LuCalendarCheck, LuHourglass, LuCalendar, LuCircle, LuFingerprint, LuChevronDown, LuCheck } from 'react-icons/lu';

export default function TeacherAttendancePage() {
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [punchInTime, setPunchInTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval;
    if (isPunchedIn && punchInTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - punchInTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPunchedIn, punchInTime]);

  const handlePunchToggle = () => {
    if (!isPunchedIn) {
      setIsPunchedIn(true);
      setPunchInTime(Date.now());
      setElapsed(0);
    } else {
      setIsPunchedIn(false);
    }
  };

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // Convert elapsed to hours for the progress bar logic
  const hoursCompleted = (elapsed / 3600).toFixed(1);
  const requiredHoursForHalfDay = 4;
  const requiredHoursForFullDay = 7.5;
  let progressState = 'Absent';
  if (hoursCompleted >= requiredHoursForFullDay) progressState = 'Full Day';
  else if (hoursCompleted >= requiredHoursForHalfDay) progressState = 'Half Day';
  
  const progressPercent = Math.min((hoursCompleted / 8) * 100, 100);

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const recentAttendance = [
    { date: '12 Aug 2026', status: 'Present', checkIn: '08:00 AM', checkOut: '04:00 PM', actual: '8:00' },
    { date: '11 Aug 2026', status: 'Present', checkIn: '07:55 AM', checkOut: '04:10 PM', actual: '8:15' },
    { date: '10 Aug 2026', status: 'Absent', checkIn: '-', checkOut: '-', actual: '-' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      
      {/* Today's Attendance Widget */}
      <div className="bg-white rounded-[20px] border border-gray-200 overflow-hidden shadow-xs">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <LuCalendarDays className="w-5 h-5 text-gray-700" />
            <h2 className="text-base font-bold text-gray-900">Today's Attendance</h2>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
            <LuCalendar className="w-4 h-4" />
            {currentDate}
          </div>
        </div>

        {/* Middle Section - Timer */}
        <div className="px-6 py-8 bg-gradient-to-b from-indigo-50/50 to-indigo-50/20 border-y border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <p className="text-sm font-semibold text-gray-500">Total Working Hours</p>
            {isPunchedIn && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            )}
          </div>
          
          <div className="mb-6 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-mono font-bold text-indigo-500 tracking-tight">
              {isPunchedIn ? formatTime(elapsed) : '00:00:00'}
            </span>
            <span className="text-lg sm:text-xl font-mono font-medium text-gray-400">
              / 8:00:00
            </span>
          </div>

          {/* Progress Box */}
          <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-4 sm:px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-100/50 text-amber-600 flex items-center justify-center shrink-0">
                <LuHourglass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <LuCalendarCheck className="w-4 h-4 text-gray-400" />
                  {progressState === 'Absent' ? 'Incomplete' : progressState}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {hoursCompleted} hours completed. Need {requiredHoursForFullDay} hours for Full Day
                </p>
              </div>
            </div>
            
            <div className="w-full sm:w-32 bg-amber-200/30 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-1000" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Section - Action Table */}
        <div className="bg-white overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4 pl-6">Status</th>
                <th className="p-4">Clock In</th>
                <th className="p-4">Clock Out</th>
                <th className="p-4">Required Time</th>
                <th className="p-4">Actual Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr>
                <td className="p-4 pl-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100/60 text-emerald-700 text-xs font-bold cursor-pointer hover:bg-emerald-100 transition-colors">
                    <LuCheck className="w-3.5 h-3.5" />
                    Present
                    <LuChevronDown className="w-3 h-3 opacity-60 ml-1" />
                  </div>
                </td>
                <td className="p-4 text-sm font-bold text-gray-700 font-mono">
                  {!punchInTime ? (
                    <button 
                      onClick={handlePunchToggle}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                    >
                      <LuFingerprint className="w-4 h-4" />
                      Clock In
                    </button>
                  ) : (
                    new Date(punchInTime).toLocaleTimeString('en-US', { hour12: false })
                  )}
                </td>
                <td className="p-4">
                  {isPunchedIn ? (
                    <button 
                      onClick={handlePunchToggle}
                      className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-all shadow-xs"
                      title="Clock Out"
                    >
                      <LuFingerprint className="w-5 h-5" />
                    </button>
                  ) : (
                    punchInTime ? <span className="text-sm font-bold text-gray-700 font-mono">{new Date().toLocaleTimeString('en-US', { hour12: false })}</span> : <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="p-4 text-sm font-medium text-gray-700">8 Hours</td>
                <td className="p-4 text-sm font-bold text-gray-700">
                  {isPunchedIn ? '—' : (punchInTime ? formatTime(elapsed) : '—')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Logs List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden mt-8">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Past Attendance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Clock In</th>
                <th className="p-4">Clock Out</th>
                <th className="p-4">Actual Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentAttendance.map((log, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm text-gray-900 font-medium whitespace-nowrap">{log.date}</td>
                  <td className="p-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                      log.status === 'Present' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600 whitespace-nowrap font-mono">{log.checkIn}</td>
                  <td className="p-4 text-sm text-gray-600 whitespace-nowrap font-mono">{log.checkOut}</td>
                  <td className="p-4 text-sm font-semibold text-gray-800 whitespace-nowrap">{log.actual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
