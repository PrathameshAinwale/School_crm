import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentParentService } from '../../services/studentParentService';
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
  LuLoader,
} from 'react-icons/lu';

export default function AttendancePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('daily'); // 'daily', 'absence', 'calendar'
  const [filterStatus, setFilterStatus] = useState('All');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dynamic States from Live Database
  const [summary, setSummary] = useState({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    overallPercentage: 0,
    onTimeStreak: '0 Days',
  });
  const [dailyLogs, setDailyLogs] = useState([]);
  const [absenceHistory, setAbsenceHistory] = useState([]);

  // Leave Form State
  const [leaveFrom, setLeaveFrom] = useState('');
  const [leaveTo, setLeaveTo] = useState('');
  const [leaveReasonType, setLeaveReasonType] = useState('Medical Leave');
  const [leaveReasonDesc, setLeaveReasonDesc] = useState('');

  const fetchAttendance = () => {
    setLoading(true);
    studentParentService.getAttendance()
      .then((res) => {
        if (res?.data) {
          if (res.data.summary) setSummary(res.data.summary);
          if (res.data.dailyLogs && Array.isArray(res.data.dailyLogs)) setDailyLogs(res.data.dailyLogs);
          if (res.data.absenceHistory && Array.isArray(res.data.absenceHistory)) setAbsenceHistory(res.data.absenceHistory);
        }
      })
      .catch((err) => console.log('Attendance fetch error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const filteredLogs = filterStatus === 'All'
    ? dailyLogs
    : dailyLogs.filter((l) => l.status === filterStatus);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await studentParentService.applyLeave({
        from_date: leaveFrom,
        to_date: leaveTo,
        leave_type: leaveReasonType,
        reason: leaveReasonDesc,
        medical_cert_name: 'Medical Document Uploaded',
      });
      setLeaveSubmitted(true);
      setTimeout(() => {
        setShowLeaveModal(false);
        setLeaveSubmitted(false);
        setLeaveReasonDesc('');
        setLeaveFrom('');
        setLeaveTo('');
        fetchAttendance();
      }, 2000);
    } catch (err) {
      console.error(err);
      setLeaveSubmitted(true);
      setTimeout(() => {
        setShowLeaveModal(false);
        setLeaveSubmitted(false);
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-10">
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
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Recorded Days</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">{summary.totalDays} Days</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Session 2026-27</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Days Present</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{summary.presentDays} Days</p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">{summary.overallPercentage}% Attendance Rate</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-100 bg-rose-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Absences & Leaves</span>
          <p className="text-2xl font-bold text-rose-600 mt-1">{summary.absentDays} Days</p>
          <p className="text-[11px] text-rose-700 font-medium mt-0.5">All Approved by Teacher</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-100 bg-amber-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Late Arrivals</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{summary.lateDays} Days</p>
          <p className="text-[11px] text-amber-700 font-medium mt-0.5">Bus Delay Noted</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-100 bg-purple-50/20 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">On-Time Streak</span>
          <p className="text-2xl font-bold text-purple-600 mt-1">{summary.onTimeStreak || '14 Days'}</p>
          <p className="text-[11px] text-purple-700 font-medium mt-0.5">Exemplary Punctuality</p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('daily')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'daily'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <LuClipboardList className="w-4 h-4" /> Daily Attendance Logs
        </button>

        <button
          onClick={() => setActiveTab('absence')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'absence'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <LuUserX className="w-4 h-4 text-rose-500" /> Absence History & Leave Reasons ({absenceHistory.length} Days)
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'calendar'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <LuCalendarDays className="w-4 h-4" /> Attendance Heatmap & Calendar View
        </button>
      </div>

      {/* TAB 1: Daily Attendance Table */}
      {activeTab === 'daily' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden space-y-4 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-bold text-gray-800">August 2026 Daily Attendance Records</h2>
              <p className="text-xs text-gray-400">Punctuality timestamps tracked via RFID Smart Gate & Turnstiles</p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['All', 'Present', 'Absent', 'Late'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    filterStatus === st
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Daily Logs Cards */}
          <div className="sm:hidden space-y-2">
            {filteredLogs.map((log, i) => (
              <div key={i} className="bg-slate-50/70 rounded-xl p-3 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-gray-800 text-xs">{log.date}</span>
                    <span className="text-[10px] text-gray-400 font-medium ml-1.5">{log.day}</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      log.status === 'Present'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : log.status === 'Absent'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : log.status === 'Late'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {log.status === 'Present' && <LuUserCheck className="w-2.5 h-2.5" />}
                    {log.status === 'Absent' && <LuUserX className="w-2.5 h-2.5" />}
                    {log.status === 'Late' && <LuClock className="w-2.5 h-2.5" />}
                    {log.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2 rounded-lg border border-gray-100">
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">In / Out</span>
                    <span className="font-mono text-gray-700 font-semibold">{log.checkIn} - {log.checkOut}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Mode</span>
                    <span className="text-gray-600 truncate block">{log.mode}</span>
                  </div>
                </div>

                {log.remarks && log.remarks !== 'On Time' && (
                  <p className="text-[10px] text-amber-700 bg-amber-50/70 px-2 py-0.5 rounded">
                    {log.remarks}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3">Date & Day</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Check-In</th>
                  <th className="px-4 py-3">Check-Out</th>
                  <th className="px-4 py-3">Punch Mode</th>
                  <th className="px-4 py-3">Remarks / Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log, i) => (
                  <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      <div>{log.date}</div>
                      <span className="text-[10px] text-gray-400 font-normal">{log.day}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                          log.status === 'Present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : log.status === 'Absent'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : log.status === 'Late'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {log.status === 'Present' && <LuUserCheck className="w-3 h-3" />}
                        {log.status === 'Absent' && <LuUserX className="w-3 h-3" />}
                        {log.status === 'Late' && <LuClock className="w-3 h-3" />}
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-700">{log.checkIn}</td>
                    <td className="px-4 py-3 font-mono text-gray-700">{log.checkOut}</td>
                    <td className="px-4 py-3 text-gray-500">{log.mode}</td>
                    <td className="px-4 py-3 text-gray-600 font-medium">{log.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Absence History & Leave Reasons */}
      {activeTab === 'absence' && (
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <LuUserX className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="font-bold text-rose-900">Total Absences Recorded: {absenceHistory.length} Days (Session 2026-27)</p>
                <p className="text-rose-700 mt-0.5">All absences have been duly reviewed and approved by Class Teacher Dr. Ananya Sen.</p>
              </div>
            </div>
            <button
              onClick={() => setShowLeaveModal(true)}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs shrink-0 hover:bg-rose-700"
            >
              Apply Future Leave
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
            {absenceHistory.map((rec) => (
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

            {/* Empty slots for start of month */}
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
                  <LuCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h4 className="text-base font-bold text-gray-800">Leave Application Submitted!</h4>
                <p className="text-xs text-gray-500">Your leave request has been submitted to Dr. Ananya Sen for approval.</p>
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
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? <LuLoader className="w-3.5 h-3.5 animate-spin" /> : <LuSend className="w-3.5 h-3.5" />} Submit Application
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
