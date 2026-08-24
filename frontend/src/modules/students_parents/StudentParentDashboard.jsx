import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeCard from '../../components/Dashboard/WelcomeCard';
import StatCard from '../../components/Dashboard/StatCard';
import { studentParentService } from '../../services/studentParentService';
import {
  studentParentStats,
  studentSyllabusProgress,
  studentSchoolCalendar,
  studentPeriodTimetable,
  studentAssignmentsList,
} from '../../data/mockData';
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
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // Dynamic Data States
  const [statsData, setStatsData] = useState(studentParentStats);
  const [topSyllabus, setTopSyllabus] = useState(studentSyllabusProgress.slice(0, 3));
  const [topCalendarEvents, setTopCalendarEvents] = useState(studentSchoolCalendar.slice(0, 3));
  const [topTimetablePeriods, setTopTimetablePeriods] = useState(studentPeriodTimetable.slice(0, 3));
  const [urgentAssignments, setUrgentAssignments] = useState(
    studentAssignmentsList.filter(
      (a) => a.status === 'Pending' || a.priority === 'High' || a.priority === 'Medium'
    )
  );

  useEffect(() => {
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
      .catch((err) => console.log('Loaded mock fallback dashboard data:', err));
  }, []);

  // Auto-swipe timer for mobile (advances every 3.5s)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveKpiIndex((prev) => (prev + 1) % statsData.length);
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

      {/* Grid: 1. Syllabus & 2. School Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* 1. Syllabus & Subject */}
        <div
          onClick={() => navigate('/syllabus')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <LuBookOpen className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 group-hover:text-primary-600 transition-colors flex items-center gap-1">
                    Syllabus & Progress <LuChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary-600 shrink-0" />
                  </h3>
                  <p className="text-[11px] text-gray-400">Core Subjects • Curriculum Coverage</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 shrink-0">
                Top {topSyllabus.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {topSyllabus.map((sub) => (
                <div
                  key={sub.subject}
                  className="p-3 rounded-xl bg-gray-50/80 border border-gray-100 group-hover:bg-blue-50/20 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
                    <span className="font-bold text-gray-800 leading-tight">{sub.subject}</span>
                    <span className="font-extrabold text-primary-700 shrink-0">{sub.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        sub.progress >= 80 ? 'bg-emerald-500' : 'bg-primary-600'
                      }`}
                      style={{ width: `${sub.progress}%` }}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-500 gap-0.5">
                    <span>Teacher: <strong className="text-gray-700">{sub.teacher}</strong></span>
                    <span className="text-primary-800 font-medium">Next: {sub.nextTopic}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-primary-600 font-semibold">
            <span>View Full Chapter-wise Syllabus</span>
            <LuArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* 2. School Calendar */}
        <div
          onClick={() => navigate('/calendar')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <LuCalendarDays className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 group-hover:text-emerald-700 transition-colors flex items-center gap-1">
                    School Calendar & Exams <LuChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600 shrink-0" />
                  </h3>
                  <p className="text-[11px] text-gray-400">Upcoming Scheduled School Dates</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 shrink-0">
                {topCalendarEvents.length} Events
              </span>
            </div>

            <div className="space-y-2.5">
              {topCalendarEvents.map((cal, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-gray-50/80 border border-gray-100 flex flex-col gap-1.5 group-hover:bg-emerald-50/20 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${calendarTypeStyles[cal.type] || 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                      {cal.type}
                    </span>
                    <span className="text-xs font-bold text-primary-700">
                      {cal.date}
                    </span>
                  </div>
                  <p className="font-bold text-xs text-gray-800 leading-snug">{cal.event}</p>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1">
                    <LuClock className="w-3 h-3 text-gray-400 shrink-0" /> {cal.time}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-emerald-700 font-semibold">
            <span>View Complete Academic Year Calendar</span>
            <LuArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Grid: 3. Timetable & 4. Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* 3. School Period Timetable */}
        <div
          onClick={() => navigate('/timetable')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <LuClock className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 group-hover:text-primary-600 transition-colors flex items-center gap-1">
                    Period Timetable <LuChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary-600 shrink-0" />
                  </h3>
                  <p className="text-[11px] text-gray-400">Today's Class Schedule</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 shrink-0">
                {topTimetablePeriods.length} Periods
              </span>
            </div>

            <div className="space-y-2.5">
              {topTimetablePeriods.map((p, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-gray-50/80 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 group-hover:bg-blue-50/20 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-[11px] px-2 py-1 rounded bg-primary-50 text-primary-700 border border-primary-100 shrink-0">
                      {p.period}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 leading-tight">{p.subject}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                        <LuUser className="w-3 h-3 text-gray-400" /> {p.teacher} • {p.time}
                      </p>
                    </div>
                  </div>
                  <span className="self-start sm:self-center px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-700 font-semibold text-[10px] shrink-0 inline-flex items-center gap-1">
                    <LuMapPin className="w-3 h-3 text-gray-400" /> {p.room}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-primary-600 font-semibold">
            <span>View Full 6-Period Weekly Schedule</span>
            <LuArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* 4. Assignments */}
        <div
          onClick={() => navigate('/assignment')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <LuClipboardList className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 group-hover:text-amber-700 transition-colors flex items-center gap-1">
                    Assignments Near Deadline <LuChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-amber-600 shrink-0" />
                  </h3>
                  <p className="text-[11px] text-gray-400">Action Required • Upcoming Deadlines</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 shrink-0">
                {urgentAssignments.length} Due
              </span>
            </div>

            <div className="space-y-2.5">
              {urgentAssignments.map((asn) => (
                <div
                  key={asn.id}
                  className="p-3 rounded-xl bg-gray-50/80 border border-gray-100 group-hover:bg-amber-50/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider">{asn.subject}</span>
                      <p className="text-xs font-bold text-gray-800 leading-snug mt-0.5">{asn.title}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                        asn.priority === 'High'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {asn.status}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-500 mt-2 pt-2 border-t border-gray-200/60 gap-1.5">
                    <span className="text-gray-700 font-medium">Due Date: <strong className="text-rose-600">{asn.dueDate}</strong></span>
                    <span className="text-primary-700 font-bold inline-flex items-center gap-1 self-start sm:self-auto hover:underline">
                      <LuUpload className="w-3 h-3" /> Submit Solution &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-amber-700 font-semibold">
            <span>View All Assignments & Graded Scores</span>
            <LuArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
