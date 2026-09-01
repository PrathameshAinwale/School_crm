import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeCard from '../../components/Dashboard/WelcomeCard';
import StatCard from '../../components/Dashboard/StatCard';
import { studentParentService } from '../../services/studentParentService';
import {
  LuBookOpen,
  LuCalendarDays,
  LuClock,
  LuClipboardList,
  LuChevronRight,
  LuArrowUpRight,
  LuUpload,
  LuMapPin,
  LuUser,
  LuLoader,
  LuReceipt,
  LuCreditCard,
  LuWallet,
} from 'react-icons/lu';

const statIcons = [LuBookOpen, LuClock, LuClipboardList, LuCalendarDays];
const statColors = ['blue', 'green', 'amber', 'violet'];

const calendarTypeStyles = {
  Exam: 'bg-rose-50 text-rose-700 border-rose-200',
  Holiday: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Event: 'bg-blue-50 text-blue-700 border-blue-200',
  PTM: 'bg-purple-50 text-purple-700 border-purple-200',
};

export default function StudentParentDashboard() {
  const navigate = useNavigate();

  // Mobile Auto-Swipe Carousel State
  const [activeKpiIndex, setActiveKpiIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // Dynamic Data States from database
  const [statsData, setStatsData] = useState([]);
  const [topSyllabus, setTopSyllabus] = useState([]);
  const [topCalendarEvents, setTopCalendarEvents] = useState([]);
  const [topTimetablePeriods, setTopTimetablePeriods] = useState([]);
  const [urgentAssignments, setUrgentAssignments] = useState([]);
  const [feeSummary, setFeeSummary] = useState(null);

  useEffect(() => {
    // Load dashboard stats
    studentParentService.getDashboardStats()
      .then((res) => {
        if (res?.data) {
          const d = res.data;
          if (d.stats && d.stats.length > 0) {
            setStatsData(d.stats.map(s => ({
              label: s.title,
              value: s.value,
              trend: s.change,
              trendUp: s.trend === 'up',
              sub: s.subtext,
            })));
          }
          if (d.topSyllabus && d.topSyllabus.length > 0) {
            setTopSyllabus(d.topSyllabus.map(s => ({
              subject: s.subject,
              progress: s.progress,
              teacher: s.teacher,
              nextTopic: s.currentChapter || 'In Progress',
            })));
          }
          if (d.topCalendarEvents && d.topCalendarEvents.length > 0) {
            setTopCalendarEvents(d.topCalendarEvents.map(e => ({
              date: e.date_label || e.month_label,
              event: e.title,
              type: e.event_type || 'Event',
              time: e.time_slot || 'Full Day',
            })));
          }
          if (d.todayTimetable && d.todayTimetable.length > 0) {
            setTopTimetablePeriods(d.todayTimetable.slice(0, 3).map(p => ({
              period: p.period_name || ('Period ' + p.period_number),
              subject: p.subject,
              teacher: p.teacher_name,
              time: p.time_slot,
              room: p.room,
            })));
          }
          if (d.urgentAssignments && d.urgentAssignments.length > 0) {
            setUrgentAssignments(d.urgentAssignments.map(a => ({
              id: a.id,
              subject: a.subject_name || a.subject || 'Academic',
              title: a.title,
              dueDate: a.due_date,
              status: a.status || 'Pending',
              priority: a.priority || 'High',
            })));
          }
        }
      })
      .catch((err) => console.log('Failed to load dashboard stats:', err))
      .finally(() => setLoading(false));

    // Load Fee ledger summary
    studentParentService.getFees()
      .then((res) => {
        if (res?.success && res.data) {
          setFeeSummary(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Auto-swipe timer for mobile (advances every 3.5s)
  useEffect(() => {
    if (isPaused || statsData.length === 0) return;
    const interval = setInterval(() => {
      setActiveKpiIndex((prev) => (statsData.length > 0 ? (prev + 1) % statsData.length : 0));
    }, 3500);
    return () => clearInterval(interval);
  }, [isPaused, statsData.length]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e) => {
    setIsPaused(true);
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) {
      setIsPaused(false);
      return;
    }
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 45) {
      setActiveKpiIndex((prev) => (prev + 1) % statsData.length);
    } else if (distance < -45) {
      setActiveKpiIndex((prev) => (prev - 1 + statsData.length) % statsData.length);
    }
    touchStartX.current = null;
    touchEndX.current = null;
    setTimeout(() => setIsPaused(false), 2000);
  };

  const handleKpiClick = (index) => {
    if (index === 0) navigate('/syllabus');
    else if (index === 1) navigate('/attendance');
    else if (index === 2) navigate('/assignment');
    else if (index === 3) navigate('/calendar');
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-10">
      {/* Welcome Banner */}
      <WelcomeCard />

      {/* Main KPI Row: Compact 2-Col on Mobile, 4-Col on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {statsData.map((stat, i) => (
          <div
            key={stat.label + i}
            onClick={() => handleKpiClick(i)}
            className="cursor-pointer group block"
          >
            <div className="relative transition-transform duration-200 group-hover:-translate-y-0.5 h-full">
              <StatCard
                label={stat.label}
                value={stat.value}
                trend={stat.trend}
                trendUp={stat.trendUp}
                icon={statIcons[i % statIcons.length]}
                color={statColors[i % statColors.length]}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Fee & Installment Status Card */}
      {feeSummary && (
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${feeSummary.summary?.rawOutstanding > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <LuReceipt className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                  Fee Account • {feeSummary.student?.classSection || 'Class 10'}
                </h3>
                <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full ${feeSummary.summary?.rawOutstanding > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                  {feeSummary.summary?.rawOutstanding > 0 ? `${feeSummary.summary?.pendingCount + feeSummary.summary?.overdueCount} Due` : 'Cleared'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                Paid: <strong className="text-emerald-600">{feeSummary.summary?.paidAmount}</strong>
                <span className="hidden sm:inline"> • Annual: <strong className="text-slate-700">{feeSummary.summary?.totalAnnual}</strong> ({feeSummary.summary?.clearancePercentage}% cleared)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <div className="text-left sm:text-right">
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Due</div>
              <div className={`text-sm sm:text-base font-extrabold font-mono ${feeSummary.summary?.rawOutstanding > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                {feeSummary.summary?.outstandingAmount}
              </div>
            </div>

            <button
              onClick={() => navigate('/fees')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                feeSummary.summary?.rawOutstanding > 0
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <LuCreditCard className="w-3.5 h-3.5" />
              {feeSummary.summary?.rawOutstanding > 0 ? 'Pay Installment' : 'View Ledger'}
            </button>
          </div>
        </div>
      )}

      {/* Grid: 1. Syllabus & 2. School Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-5">
        {/* 1. Syllabus & Subject */}
        <div
          onClick={() => navigate('/syllabus')}
          className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-200 shadow-sm hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-2.5 sm:mb-3.5">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <LuBookOpen className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-primary-600 transition-colors flex items-center gap-1">
                    Syllabus & Progress <LuChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary-600 shrink-0" />
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-gray-400">Core Subjects • Coverage</p>
                </div>
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 shrink-0">
                Top {topSyllabus.length}
              </span>
            </div>

            <div className="space-y-2 sm:space-y-2.5">
              {topSyllabus.map((sub) => (
                <div
                  key={sub.subject}
                  className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-gray-50/80 border border-gray-100 group-hover:bg-blue-50/20 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1 gap-2">
                    <span className="font-bold text-gray-800 leading-tight truncate">{sub.subject}</span>
                    <span className="font-extrabold text-primary-700 shrink-0 text-xs">{sub.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        sub.progress >= 80 ? 'bg-emerald-500' : 'bg-primary-600'
                      }`}
                      style={{ width: `${sub.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-gray-500 gap-1">
                    <span className="truncate">Teacher: <strong className="text-gray-700">{sub.teacher}</strong></span>
                    <span className="text-primary-800 font-medium hidden sm:inline truncate">Next: {sub.nextTopic}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2.5 sm:mt-3.5 pt-2 sm:pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] sm:text-xs text-primary-600 font-semibold">
            <span>View Full Syllabus</span>
            <LuArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>

        {/* 2. School Calendar */}
        <div
          onClick={() => navigate('/calendar')}
          className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-2.5 sm:mb-3.5">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <LuCalendarDays className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-emerald-700 transition-colors flex items-center gap-1">
                    Calendar & Exams <LuChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600 shrink-0" />
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-gray-400">Scheduled School Dates</p>
                </div>
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 shrink-0">
                {topCalendarEvents.length} Events
              </span>
            </div>

            <div className="space-y-2 sm:space-y-2.5">
              {topCalendarEvents.map((cal, i) => (
                <div
                  key={i}
                  className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-gray-50/80 border border-gray-100 flex flex-col gap-1 group-hover:bg-emerald-50/20 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border ${calendarTypeStyles[cal.type] || 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                      {cal.type}
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-primary-700">
                      {cal.date}
                    </span>
                  </div>
                  <p className="font-bold text-xs text-gray-800 leading-snug truncate">{cal.event}</p>
                  <p className="text-[10px] sm:text-[11px] text-gray-500 flex items-center gap-1">
                    <LuClock className="w-3 h-3 text-gray-400 shrink-0" /> {cal.time}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2.5 sm:mt-3.5 pt-2 sm:pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] sm:text-xs text-emerald-700 font-semibold">
            <span>View Calendar</span>
            <LuArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
      </div>

      {/* Grid: 3. Timetable & 4. Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-5">
        {/* 3. School Period Timetable */}
        <div
          onClick={() => navigate('/timetable')}
          className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-200 shadow-sm hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-2.5 sm:mb-3.5">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <LuClock className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-primary-600 transition-colors flex items-center gap-1">
                    Period Timetable <LuChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary-600 shrink-0" />
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-gray-400">Today's Class Schedule</p>
                </div>
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 shrink-0">
                {topTimetablePeriods.length} Periods
              </span>
            </div>

            <div className="space-y-2 sm:space-y-2.5">
              {topTimetablePeriods.map((p, i) => (
                <div
                  key={i}
                  className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-gray-50/80 border border-gray-100 flex items-center justify-between gap-2 group-hover:bg-blue-50/20 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-100 shrink-0">
                      {p.period}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 leading-tight truncate">{p.subject}</p>
                      <p className="text-[10px] sm:text-[11px] text-gray-500 flex items-center gap-1 truncate">
                        {p.teacher} <span className="hidden sm:inline">• {p.time}</span>
                      </p>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-700 font-semibold text-[9px] sm:text-[10px] shrink-0 inline-flex items-center gap-1">
                    <LuMapPin className="w-2.5 h-2.5 text-gray-400" /> {p.room}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2.5 sm:mt-3.5 pt-2 sm:pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] sm:text-xs text-primary-600 font-semibold">
            <span>View Full Schedule</span>
            <LuArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>

        {/* 4. Assignments */}
        <div
          onClick={() => navigate('/assignment')}
          className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-200 shadow-sm hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-2.5 sm:mb-3.5">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <LuClipboardList className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-amber-700 transition-colors flex items-center gap-1">
                    Assignments <LuChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-amber-600 shrink-0" />
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-gray-400">Upcoming Deadlines</p>
                </div>
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 shrink-0">
                {urgentAssignments.length} Due
              </span>
            </div>

            <div className="space-y-2 sm:space-y-2.5">
              {urgentAssignments.map((asn) => (
                <div
                  key={asn.id}
                  className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-gray-50/80 border border-gray-100 group-hover:bg-amber-50/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] sm:text-[10px] font-bold text-primary-600 uppercase tracking-wider">{asn.subject}</span>
                      <p className="text-xs font-bold text-gray-800 leading-snug mt-0.5 truncate">{asn.title}</p>
                    </div>
                    <span
                      className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                        asn.priority === 'High'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {asn.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-gray-500 mt-1.5 pt-1.5 border-t border-gray-200/60 gap-1.5">
                    <span className="text-gray-700 font-medium">Due: <strong className="text-rose-600">{asn.dueDate}</strong></span>
                    <span className="text-primary-700 font-bold hover:underline">
                      Submit &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2.5 sm:mt-3.5 pt-2 sm:pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] sm:text-xs text-amber-700 font-semibold">
            <span>View All Assignments</span>
            <LuArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
