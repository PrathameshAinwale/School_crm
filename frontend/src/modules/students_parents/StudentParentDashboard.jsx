import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeCard from '../../components/Dashboard/WelcomeCard';
import StatCard from '../../components/Dashboard/StatCard';
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

  // Top 3 Syllabus items
  const topSyllabus = studentSyllabusProgress.slice(0, 3);

  // Top 3 Calendar cards
  const topCalendarEvents = studentSchoolCalendar.slice(0, 3);

  // Top 3 Timetable periods
  const topTimetablePeriods = studentPeriodTimetable.slice(0, 3);

  // Near deadline assignments only
  const urgentAssignments = studentAssignmentsList.filter(
    (a) => a.status === 'Pending' || a.priority === 'High' || a.priority === 'Medium'
  );

  // Auto-swipe timer for mobile (advances every 3.5s)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveKpiIndex((prev) => (prev + 1) % studentParentStats.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isPaused]);

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
      // Swiped left -> Next
      setActiveKpiIndex((prev) => (prev + 1) % studentParentStats.length);
    } else if (distance < -45) {
      // Swiped right -> Prev
      setActiveKpiIndex((prev) => (prev - 1 + studentParentStats.length) % studentParentStats.length);
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

      {/* Main KPI Row: Auto-Swipeable Carousel on Mobile (< sm), Grid on Tablet & Desktop (>= sm) */}
      <div className="relative">
        {/* Mobile View: Swipeable + Auto-sliding Container */}
        <div
          className="sm:hidden overflow-hidden rounded-2xl"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${activeKpiIndex * 100}%)` }}
          >
            {studentParentStats.map((stat, i) => (
              <div
                key={stat.label}
                onClick={() => handleKpiClick(i)}
                className="w-full shrink-0 px-0.5 cursor-pointer"
              >
                <div className="relative transition-transform duration-200">
                  <StatCard
                    label={stat.label}
                    value={stat.value}
                    trend={stat.trend}
                    trendUp={stat.trendUp}
                    icon={statIcons[i]}
                    color={statColors[i]}
                  />
                  {stat.sub && (
                    <div className="px-4 py-2.5 -mt-2 bg-white rounded-b-xl border-x border-b border-gray-100 text-[11px] text-gray-500 font-medium flex items-center justify-between shadow-xs">
                      <span className="truncate">{stat.sub}</span>
                      <LuArrowUpRight className="w-3.5 h-3.5 text-primary-600 shrink-0 ml-1" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Carousel Indicators (Dots) */}
          <div className="flex items-center justify-center gap-2 mt-2.5">
            {studentParentStats.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveKpiIndex(idx);
                  setIsPaused(true);
                  setTimeout(() => setIsPaused(false), 3000);
                }}
                className={`transition-all rounded-full ${
                  activeKpiIndex === idx
                    ? 'w-6 h-2 bg-primary-600'
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop / Tablet View (>= sm): Standard 4-Column Grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {studentParentStats.map((stat, i) => (
            <div
              key={stat.label}
              onClick={() => handleKpiClick(i)}
              className="cursor-pointer group"
            >
              <div className="relative transition-transform duration-200 group-hover:-translate-y-0.5">
                <StatCard
                  label={stat.label}
                  value={stat.value}
                  trend={stat.trend}
                  trendUp={stat.trendUp}
                  icon={statIcons[i]}
                  color={statColors[i]}
                />
                {stat.sub && (
                  <div className="px-5 pb-3 -mt-2 bg-white rounded-b-xl border-x border-b border-gray-100 text-xs text-gray-500 font-medium flex items-center justify-between">
                    <span>{stat.sub}</span>
                    <LuArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: 1. Syllabus (Top 3) & 2. School Calendar (3 Info Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* 1. Syllabus & Subject (Top 3) */}
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
                  <p className="text-[11px] text-gray-400">Top 3 Core Subjects • Class X-A</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 shrink-0">
                Top 3
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

        {/* 2. School Calendar (3 Information Cards) */}
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
                  <p className="text-[11px] text-gray-400">Next 3 Scheduled School Dates</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 shrink-0">
                3 Events
              </span>
            </div>

            <div className="space-y-2.5">
              {topCalendarEvents.map((cal, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-gray-50/80 border border-gray-100 flex flex-col gap-1.5 group-hover:bg-emerald-50/20 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${calendarTypeStyles[cal.type]}`}>
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

      {/* Grid: 3. School Period Timetable (3 Periods) & 4. Assignments (Near Deadline Only) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* 3. School Period Timetable (3 Periods) */}
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
                  <p className="text-[11px] text-gray-400">Class X-A • Today's Schedule</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 shrink-0">
                3 Periods
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

        {/* 4. Assignments (Near to Deadline Only) */}
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
