import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LuClipboardList,
  LuArrowLeft,
  LuCircleCheck,
  LuCircleAlert,
  LuClock,
  LuCalendar,
  LuCalendarDays,
  LuDownload,
  LuFilter,
  LuUserCheck,
  LuUserX,
  LuCheck,
  LuX,
  LuSend,
  LuUpload,
  LuShieldCheck,
  LuChevronLeft,
  LuChevronRight,
} from 'react-icons/lu';

// Absence records data
const absenceRecords = [
  {
    id: 'ABS-01',
    date: 'Wednesday, Aug 05, 2026',
    reason: 'Viral Fever & Medical Rest',
    leaveType: 'Medical Leave',
    approvalStatus: 'Approved by Class Teacher',
    approvedBy: 'Dr. Ananya Sen',
    medicalCert: 'Submitted (Dr. Mehta Clinic.pdf)',
    teacherRemarks: 'Medical certificate verified. Granted 1 day medical leave.',
  },
  {
    id: 'ABS-02',
    date: 'Saturday, Jul 18, 2026',
    reason: 'Family Function (Sibling Wedding)',
    leaveType: 'Casual / Planned Leave',
    approvalStatus: 'Approved in Advance',
    approvedBy: 'Dr. Ananya Sen',
    medicalCert: 'Not Applicable',
    teacherRemarks: 'Prior leave letter submitted on Jul 14.',
  },
  {
    id: 'ABS-03',
    date: 'Friday, Jun 26, 2026',
    reason: 'Severe Waterlogging / Transit Disruption',
    leaveType: 'Excused Weather Absence',
    approvalStatus: 'Auto-Excused by School',
    approvedBy: 'Principal Office',
    medicalCert: 'Not Applicable',
    teacherRemarks: 'Excused due to civic transport advisories.',
  },
  {
    id: 'ABS-04',
    date: 'Thursday, May 14, 2026',
    reason: 'Dental Surgery & Recovery',
    leaveType: 'Medical Leave',
    approvalStatus: 'Approved by Class Teacher',
    approvedBy: 'Dr. Ananya Sen',
    medicalCert: 'Submitted (Max Dental Care.pdf)',
    teacherRemarks: 'Exempted from physical education.',
  },
];

// Daily logs for August 2026
const dailyAugustLogs = [
  { date: 'Aug 17, 2026', day: 'Monday', checkIn: '7:52 AM', checkOut: 'In Session', status: 'Present', mode: 'RFID Smart Gate 1', remarks: 'On Time' },
  { date: 'Aug 16, 2026', day: 'Sunday', checkIn: '—', checkOut: '—', status: 'Weekend', mode: '—', remarks: 'Sunday Holiday' },
  { date: 'Aug 15, 2026', day: 'Saturday', checkIn: '7:45 AM', checkOut: '11:30 AM', status: 'Present', mode: 'Biometric Turnstile', remarks: 'Independence Day Assembly' },
  { date: 'Aug 14, 2026', day: 'Friday', checkIn: '7:50 AM', checkOut: '1:15 PM', status: 'Present', mode: 'RFID Smart Gate 1', remarks: 'On Time' },
  { date: 'Aug 13, 2026', day: 'Thursday', checkIn: '8:05 AM', checkOut: '1:15 PM', status: 'Late', mode: 'Manual Attendance', remarks: 'Late Arrival (10 mins bus delay)' },
  { date: 'Aug 12, 2026', day: 'Wednesday', checkIn: '7:54 AM', checkOut: '1:15 PM', status: 'Present', mode: 'RFID Smart Gate 1', remarks: 'On Time' },
  { date: 'Aug 11, 2026', day: 'Tuesday', checkIn: '7:48 AM', checkOut: '1:15 PM', status: 'Present', mode: 'RFID Smart Gate 1', remarks: 'On Time' },
  { date: 'Aug 10, 2026', day: 'Monday', checkIn: '7:51 AM', checkOut: '1:15 PM', status: 'Present', mode: 'RFID Smart Gate 1', remarks: 'On Time' },
  { date: 'Aug 09, 2026', day: 'Sunday', checkIn: '—', checkOut: '—', status: 'Weekend', mode: '—', remarks: 'Sunday Holiday' },
  { date: 'Aug 08, 2026', day: 'Saturday', checkIn: '7:55 AM', checkOut: '12:30 PM', status: 'Present', mode: 'RFID Smart Gate 2', remarks: 'On Time' },
  { date: 'Aug 07, 2026', day: 'Friday', checkIn: '7:53 AM', checkOut: '1:15 PM', status: 'Present', mode: 'RFID Smart Gate 1', remarks: 'On Time' },
  { date: 'Aug 06, 2026', day: 'Thursday', checkIn: '7:49 AM', checkOut: '1:15 PM', status: 'Present', mode: 'RFID Smart Gate 1', remarks: 'On Time' },
  { date: 'Aug 05, 2026', day: 'Wednesday', checkIn: '—', checkOut: '—', status: 'Absent', mode: 'Absence Recorded', remarks: 'Medical Leave (Viral Fever)' },
  { date: 'Aug 04, 2026', day: 'Tuesday', checkIn: '7:50 AM', checkOut: '1:15 PM', status: 'Present', mode: 'RFID Smart Gate 1', remarks: 'On Time' },
  { date: 'Aug 03, 2026', day: 'Monday', checkIn: '7:52 AM', checkOut: '1:15 PM', status: 'Present', mode: 'RFID Smart Gate 1', remarks: 'On Time' },
  { date: 'Aug 02, 2026', day: 'Sunday', checkIn: '—', checkOut: '—', status: 'Weekend', mode: '—', remarks: 'Sunday Holiday' },
  { date: 'Aug 01, 2026', day: 'Saturday', checkIn: '7:56 AM', checkOut: '12:30 PM', status: 'Present', mode: 'RFID Smart Gate 1', remarks: 'On Time' },
];

export default function AttendancePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('daily'); // 'daily', 'absence', 'calendar'
  const [filterStatus, setFilterStatus] = useState('All');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);

  // Leave Form State
  const [leaveFrom, setLeaveFrom] = useState('');
  const [leaveTo, setLeaveTo] = useState('');
  const [leaveReasonType, setLeaveReasonType] = useState('Medical Leave');
  const [leaveReasonDesc, setLeaveReasonDesc] = useState('');

  const filteredLogs = filterStatus === 'All'
    ? dailyAugustLogs
    : dailyAugustLogs.filter((l) => l.status === filterStatus);

  const handleApplyLeave = (e) => {
    e.preventDefault();
    setLeaveSubmitted(true);
    setTimeout(() => {
      setShowLeaveModal(false);
      setLeaveSubmitted(false);
      setLeaveReasonDesc('');
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <LuArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Student Attendance & Absence Records</h1>
            <p className="text-xs text-gray-400">
              Student ID: <strong>STU-2024-X-101</strong> • Aarav Patel (Class X-A) • Academic Session 2026-27
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowLeaveModal(true)}
            className="px-3.5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <LuClock className="w-3.5 h-3.5" /> Apply for Leave +
          </button>
          <button className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium inline-flex items-center gap-1">
            <LuDownload className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Working Days</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">118 Days</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Apr 01 - Aug 17, 2026</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Days Present</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">112 Days</p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">94.9% Attendance Rate</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-100 bg-rose-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Total Absent Days</span>
          <p className="text-2xl font-bold text-rose-600 mt-1">4 Days</p>
          <p className="text-[11px] text-rose-700 font-medium mt-0.5">All 4 Pre-Excused</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-100 bg-amber-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Late Arrivals</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">2 Times</p>
          <p className="text-[11px] text-amber-700 font-medium mt-0.5">Avg Delay: 8 mins</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-100 bg-blue-50/20 shadow-sm col-span-2 lg:col-span-1 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">CBSE Board Criteria</span>
            <p className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1">
              <LuCircleCheck className="w-4 h-4 text-emerald-600" /> Safe (&gt; 75.0%)
            </p>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Minimum 75% needed for board admit card</p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('daily')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'daily'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <LuClock className="w-3.5 h-3.5" /> Daily Check-In Logs (August 2026)
        </button>

        <button
          onClick={() => setActiveTab('absence')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'absence'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <LuUserX className="w-3.5 h-3.5 text-rose-500" /> Absence History & Leave Reasons (4 Days)
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'calendar'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <LuCalendarDays className="w-3.5 h-3.5" /> Monthly Calendar Heatmap
        </button>
      </div>

      {/* TAB 1: Daily Check-In Logs */}
      {activeTab === 'daily' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-gray-800">Daily RFID Gate & Roll-Call Logs</h2>
              <p className="text-xs text-gray-400">August 2026 • Verified by Biometric Gate & Homeroom Teacher</p>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {['All', 'Present', 'Absent', 'Late', 'Weekend'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    filterStatus === st
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto px-4 pb-4">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                <tr>
                  <th className="py-2.5 px-3">Date & Day</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Check-In Time</th>
                  <th className="py-2.5 px-3">Check-Out Time</th>
                  <th className="py-2.5 px-3">Capture Mode</th>
                  <th className="py-2.5 px-3 text-right">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log, i) => (
                  <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-gray-800">{log.date}</p>
                      <p className="text-[10px] text-gray-400">{log.day}</p>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-flex items-center gap-1 ${
                          log.status === 'Present'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : log.status === 'Absent'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : log.status === 'Late'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        {log.status === 'Present' && <LuCheck className="w-3 h-3" />}
                        {log.status === 'Absent' && <LuX className="w-3 h-3" />}
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-gray-700">{log.checkIn}</td>
                    <td className="py-2.5 px-3 font-mono text-gray-500">{log.checkOut}</td>
                    <td className="py-2.5 px-3 text-gray-500 text-[11px]">{log.mode}</td>
                    <td className="py-2.5 px-3 text-right text-gray-600 text-[11px]">{log.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Detailed Absence Records & Leave Reasons */}
      {activeTab === 'absence' && (
        <div className="space-y-4">
          <div className="bg-rose-50/70 border border-rose-200 p-4 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <LuUserX className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="font-bold text-rose-900">Total Absences Recorded: 4 Days (All Session 2026-27)</p>
                <p className="text-rose-700 mt-0.5">All 4 absences have been duly reviewed and approved by Class Teacher Dr. Ananya Sen.</p>
              </div>
            </div>
            <button
              onClick={() => setShowLeaveModal(true)}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs shrink-0 hover:bg-rose-700"
            >
              Apply Future Leave
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {absenceRecords.map((rec) => (
              <div
                key={rec.id}
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                        {rec.leaveType}
                      </span>
                      <h3 className="text-sm font-bold text-gray-800 mt-1.5">{rec.date}</h3>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400">{rec.id}</span>
                  </div>

                  <div className="space-y-1.5 my-3 p-3 rounded-lg bg-gray-50 border border-gray-100 text-xs">
                    <p className="text-gray-700">
                      <strong>Reason for Absence:</strong> {rec.reason}
                    </p>
                    <p className="text-gray-600">
                      <strong>Supporting Certificate:</strong> {rec.medicalCert}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-[11px] text-emerald-800">
                    <p><strong>Teacher Note:</strong> "{rec.teacherRemarks}"</p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <span>Status: <strong className="text-emerald-700">{rec.approvalStatus}</strong></span>
                  <span>Reviewer: <strong>{rec.approvedBy}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Monthly Calendar Heatmap */}
      {activeTab === 'calendar' && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-800">Monthly Attendance Calendar View</h2>
              <p className="text-xs text-gray-400">August 2026 • 31 Calendar Days</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Present (15)
              </span>
              <span className="flex items-center gap-1 text-rose-700 ml-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Absent (1)
              </span>
              <span className="flex items-center gap-1 text-amber-700 ml-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Late (1)
              </span>
              <span className="flex items-center gap-1 text-gray-500 ml-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300" /> Holiday (3)
              </span>
            </div>
          </div>

          {/* 7-column Calendar grid */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="py-1.5 font-bold text-gray-400 uppercase text-[11px] bg-gray-50 rounded-md">
                {day}
              </div>
            ))}

            {/* Empty slots for start of month (August 2026 starts on Saturday, so 5 empty days Mon-Fri) */}
            {[...Array(5)].map((_, i) => (
              <div key={`empty-${i}`} className="p-2 bg-transparent text-gray-300 rounded-lg min-h-[55px]" />
            ))}

            {/* Days 1 to 31 */}
            {[
              { d: 1, s: 'P', time: '7:56 AM' },
              { d: 2, s: 'H', time: 'Sun' },
              { d: 3, s: 'P', time: '7:52 AM' },
              { d: 4, s: 'P', time: '7:50 AM' },
              { d: 5, s: 'A', time: 'Fever' },
              { d: 6, s: 'P', time: '7:49 AM' },
              { d: 7, s: 'P', time: '7:53 AM' },
              { d: 8, s: 'P', time: '7:55 AM' },
              { d: 9, s: 'H', time: 'Sun' },
              { d: 10, s: 'P', time: '7:51 AM' },
              { d: 11, s: 'P', time: '7:48 AM' },
              { d: 12, s: 'P', time: '7:54 AM' },
              { d: 13, s: 'L', time: '8:05 AM' },
              { d: 14, s: 'P', time: '7:50 AM' },
              { d: 15, s: 'P', time: 'Indep. Day' },
              { d: 16, s: 'H', time: 'Sun' },
              { d: 17, s: 'P', time: '7:52 AM' },
              { d: 18, s: 'UP', time: 'Scheduled' },
              { d: 19, s: 'UP', time: 'Scheduled' },
              { d: 20, s: 'UP', time: 'Math Exam' },
              { d: 21, s: 'UP', time: 'Scheduled' },
              { d: 22, s: 'UP', time: 'Sci Exam' },
              { d: 23, s: 'H', time: 'Sun' },
              { d: 24, s: 'UP', time: 'Scheduled' },
              { d: 25, s: 'UP', time: 'Scheduled' },
              { d: 26, s: 'H', time: 'Holiday' },
              { d: 27, s: 'UP', time: 'Scheduled' },
              { d: 28, s: 'UP', time: 'Sports' },
              { d: 29, s: 'UP', time: 'Scheduled' },
              { d: 30, s: 'H', time: 'Sun' },
              { d: 31, s: 'UP', time: 'Scheduled' },
            ].map((dayItem) => (
              <div
                key={dayItem.d}
                className={`p-2 rounded-lg border text-left min-h-[58px] flex flex-col justify-between transition-all ${
                  dayItem.s === 'P'
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : dayItem.s === 'A'
                    ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                    : dayItem.s === 'L'
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : dayItem.s === 'H'
                    ? 'bg-gray-100 border-gray-200 text-gray-500'
                    : 'bg-white border-gray-200 text-gray-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{dayItem.d}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      dayItem.s === 'P'
                        ? 'bg-emerald-500'
                        : dayItem.s === 'A'
                        ? 'bg-rose-500'
                        : dayItem.s === 'L'
                        ? 'bg-amber-500'
                        : dayItem.s === 'H'
                        ? 'bg-gray-400'
                        : 'bg-gray-200'
                    }`}
                  />
                </div>
                <p className="text-[10px] font-medium truncate">{dayItem.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-800">Submit Online Leave Application</h3>
                <p className="text-xs text-gray-400">Class X-A • Homeroom Teacher: Dr. Ananya Sen</p>
              </div>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {leaveSubmitted ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <LuCheck className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-gray-800">Leave Application Submitted!</h4>
                <p className="text-xs text-gray-500">Your leave request has been routed to Dr. Ananya Sen for approval.</p>
              </div>
            ) : (
              <form onSubmit={handleApplyLeave} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Leave From Date</label>
                    <input
                      type="date"
                      required
                      value={leaveFrom}
                      onChange={(e) => setLeaveFrom(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-primary-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Leave To Date</label>
                    <input
                      type="date"
                      required
                      value={leaveTo}
                      onChange={(e) => setLeaveTo(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-primary-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Reason Category</label>
                  <select
                    value={leaveReasonType}
                    onChange={(e) => setLeaveReasonType(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-primary-400"
                  >
                    <option>Medical Leave / Health Illness</option>
                    <option>Family Emergency / Function</option>
                    <option>Out of Station Travel</option>
                    <option>Other Pre-Approved Absence</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Parent Explanation & Notes</label>
                  <textarea
                    rows={3}
                    required
                    value={leaveReasonDesc}
                    onChange={(e) => setLeaveReasonDesc(e.target.value)}
                    placeholder="Provide details of illness or reason for absence..."
                    className="w-full p-2.5 rounded-lg border border-gray-200 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-primary-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Attach Doctor Prescription / Note (Optional)</label>
                  <div className="border border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-50">
                    <LuUpload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <p className="text-[11px] text-gray-600">Click to upload doctor certificate or supporting PDF</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowLeaveModal(false)}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <LuSend className="w-3.5 h-3.5" /> Submit Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
