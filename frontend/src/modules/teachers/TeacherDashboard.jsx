import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeCard from '../../components/Dashboard/WelcomeCard';
import { studentParentService } from '../../services/studentParentService';
import {
  LuCalendarClock,
  LuClipboardCheck,
  LuClipboardList,
  LuBookOpen,
  LuArrowRight,
  LuClock,
  LuUsers,
  LuTimer,
  LuCalendarDays,
  LuCheck,
  LuSparkles,
  LuMapPin,
  LuBell,
  LuChevronRight,
  LuRefreshCw,
  LuAward,
  LuCheckCheck,
} from 'react-icons/lu';

export default function TeacherDashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await studentParentService.getTeacherDashboard();
      if (res?.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch teacher dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const scheduleCard = dashboardData?.cards?.schedule;
  const attendanceCard = dashboardData?.cards?.attendance;
  const assignmentsCard = dashboardData?.cards?.assignments;
  const todayLectures = dashboardData?.todayLectures || [];
  const notices = dashboardData?.notices || [];
  const teacher = dashboardData?.teacher;

  // Real-time Key Priorities Cards
  const dailyCards = [
    {
      id: 'schedule',
      title: "Today's Schedule",
      badge: scheduleCard?.badge || `${scheduleCard?.totalClasses || 0} Classes Today`,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: LuCalendarClock,
      iconBg: 'bg-blue-50 text-blue-600',
      highlight: scheduleCard?.highlight || "Today's Timetable Synced",
      time: scheduleCard?.time || '08:00 AM - 01:00 PM',
      room: scheduleCard?.room || 'Room 301',
      subtext: scheduleCard?.subtext || 'Daily schedule synced with Timetable',
      actionText: 'View Full Schedule',
      path: '/teacher/schedule',
    },
    {
      id: 'attendance',
      title: 'Class Attendance',
      badge: attendanceCard?.badge || `${teacher?.classTeacherFor || 'Class 10'} Homeroom`,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: LuClipboardCheck,
      iconBg: 'bg-emerald-50 text-emerald-600',
      highlight: attendanceCard?.highlight || '30 / 32 Students Present',
      time: attendanceCard?.isMarked ? 'Marked for Today' : 'Today (Pending)',
      room: attendanceCard?.turnoutRate || '93.8% Turnout',
      subtext: attendanceCard?.subtext || 'Live attendance status for homeroom',
      actionText: 'Mark / Review Attendance',
      path: '/teacher/student-attendance',
    },
    {
      id: 'assignments',
      title: 'Active Assignments',
      badge: assignmentsCard?.badge || '3 Active Sets',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: LuClipboardList,
      iconBg: 'bg-amber-50 text-amber-600',
      highlight: assignmentsCard?.highlight || '12 Pending Evaluations',
      time: assignmentsCard?.time || 'Due Soon: Set 4',
      room: `${teacher?.classTeacherFor || 'Class 10'} & Grade 9`,
      subtext: assignmentsCard?.subtext || 'Student submissions awaiting grading',
      actionText: 'Review Submissions',
      path: '/assignments',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-12 max-w-7xl mx-auto">
      {/* Welcome Banner with Refresh Action */}
      <div className="relative">
        <WelcomeCard />
        <button
          onClick={handleRefresh}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/20 text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          title="Refresh realtime data"
        >
          <LuRefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Syncing...' : 'Sync Realtime'}</span>
        </button>
      </div>

      {/* Primary 3 Daily Information Cards */}
      <div>
        <div className="flex items-center justify-between mb-2.5 sm:mb-3.5">
          <h2 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
            <LuSparkles className="w-4 h-4 text-primary-600" />
            Today's Key Priorities
          </h2>
          {teacher?.classTeacherFor && (
            <span className="text-[10px] sm:text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full flex items-center gap-1">
              <LuAward className="w-3.5 h-3.5" /> Class Teacher: {teacher.classTeacherFor}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-4">
          {dailyCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => navigate(card.path)}
                className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-gray-200/80 shadow-xs hover:shadow-lg hover:border-primary-300 hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Top Accent Stripe on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-2.5 sm:mb-3.5">
                    <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}>
                      <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                    </div>
                    <span className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>

                  {/* Card Title & Main Highlight */}
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {card.title}
                  </h3>

                  <div className="mt-2.5 p-2.5 sm:p-3 rounded-xl bg-gray-50/80 border border-gray-100/80 space-y-0.5">
                    <p className="text-xs sm:text-sm font-bold text-gray-800">{card.highlight}</p>
                    <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500 font-medium pt-0.5">
                      <span className="flex items-center gap-1">
                        <LuClock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" /> {card.time}
                      </span>
                      <span className="text-primary-700 font-semibold">{card.room}</span>
                    </div>
                  </div>

                  <p className="text-[11px] sm:text-xs text-gray-500 mt-2 font-medium line-clamp-2">
                    {card.subtext}
                  </p>
                </div>

                {/* Card Action Link */}
                <div className="mt-3.5 sm:mt-4 pt-2.5 sm:pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] sm:text-xs font-bold text-primary-600 group-hover:text-primary-700">
                  <span>{card.actionText}</span>
                  <LuArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Clean Detail Sections Below */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-6">
        {/* Left 2 Cols: Today's Lecture Schedule Timeline (Real-time from Timetable) */}
        <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <LuCalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Today's Class Schedule</h3>
                <p className="text-xs text-gray-400">Realtime period timetable for {dashboardData?.todayInfo?.dayName || 'Today'}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/teacher/schedule')}
              className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Full Schedule <LuChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-gray-400">Loading daily schedule...</div>
          ) : todayLectures.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-xs font-bold text-gray-500">No lectures scheduled for today.</p>
              <button
                onClick={() => navigate('/teacher/timetable')}
                className="mt-2 text-xs font-bold text-primary-600 underline"
              >
                Open Timetable Builder
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {todayLectures.map((item, idx) => (
                <div
                  key={item.id || idx}
                  onClick={() => navigate('/teacher/schedule')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    idx === 0
                      ? 'bg-primary-50/40 border-primary-200 hover:bg-primary-50/70 shadow-2xs'
                      : 'bg-white border-gray-200/80 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      idx === 0
                        ? 'bg-primary-600 text-white shadow-2xs'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {item.class} • {item.subject}
                        </p>
                        {idx === 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-100 text-primary-700 uppercase tracking-wider">
                            Live Next
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2">
                        <span>{item.time}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold text-gray-700">
                          <LuMapPin className="w-3 h-3 text-gray-400" /> {item.room}
                        </span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                      idx === 0
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {idx === 0 ? 'Next Up' : 'Upcoming'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Daily Staff Announcements & Quick Actions */}
        <div className="space-y-5">
          {/* Quick Notice Board from live Notices */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <LuBell className="w-4 h-4 text-primary-600" />
                Staff Notices & Circulars
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-3">
              {notices.length === 0 ? (
                <p className="text-xs text-gray-400 py-3">No active staff notices.</p>
              ) : (
                notices.map((notice) => (
                  <div key={notice.id} className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-1">
                    <p className="text-xs font-bold text-gray-800 leading-snug">{notice.title}</p>
                    <p className="text-[11px] text-gray-500 flex items-center justify-between pt-1">
                      <span>{notice.date}</span>
                      <span className="text-primary-700 font-semibold">{notice.category || 'Official'}</span>
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Syllabus Shortcut Card */}
          <div
            onClick={() => navigate('/syllabus')}
            className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-6 text-white shadow-md hover:shadow-xl transition-all cursor-pointer group flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary-200">
                Curriculum Tracker
              </span>
              <h4 className="text-base font-bold mt-1">Update Syllabus Progress</h4>
              <p className="text-xs text-primary-100 mt-1">Log today's units & syllabus metrics</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <LuBookOpen className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
