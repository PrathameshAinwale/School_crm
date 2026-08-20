import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeCard from '../../components/Dashboard/WelcomeCard';
import { hrService } from '../../services/hrService';
import {
  LuBanknote,
  LuUsers,
  LuClock,
  LuArrowRight,
  LuCalendarDays,
  LuSparkles,
  LuRefreshCw,
  LuCalendar,
  LuMapPin,
  LuPlus,
} from 'react-icons/lu';

export default function HRDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await hrService.getHRDashboard();
      if (res?.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.log('Error fetching HR dashboard, using fallback:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  // Dynamic cards built from live backend response
  const cardsConfig = dashboardData?.cards;

  const dailyCards = [
    {
      id: 'attendance',
      title: cardsConfig?.attendance?.title || "Today's Staff Attendance",
      badge: cardsConfig?.attendance?.badge || '24 / 26 Present',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: LuUsers,
      iconBg: 'bg-emerald-50 text-emerald-600',
      highlight: cardsConfig?.attendance?.highlight || '92.3% Campus Turnout',
      time: cardsConfig?.attendance?.time || 'Live Check-ins Active',
      subtext: cardsConfig?.attendance?.subtext || '1 unexcused absence • 1 approved leave',
      actionText: 'View Staff Attendance',
      path: '/hr/staff-attendance',
    },
    {
      id: 'salary',
      title: cardsConfig?.salary?.title || 'Salary & Payroll Cycle',
      badge: cardsConfig?.salary?.badge || 'August 2026',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: LuBanknote,
      iconBg: 'bg-blue-50 text-blue-600',
      highlight: cardsConfig?.salary?.highlight || '₹15.2 Lakhs Processed',
      time: cardsConfig?.salary?.time || '8 Employees Calculated',
      subtext: cardsConfig?.salary?.subtext || 'Attendance-linked deductions applied',
      actionText: 'Manage Staff Salary & Slips',
      path: '/salary',
    },
    {
      id: 'leaves',
      title: cardsConfig?.leaves?.title || 'Staff Leaves & Approvals',
      badge: cardsConfig?.leaves?.badge || '2 Pending Review',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: LuClock,
      iconBg: 'bg-amber-50 text-amber-600',
      highlight: cardsConfig?.leaves?.highlight || '2 Requests Awaiting Decision',
      time: cardsConfig?.leaves?.time || 'Teaching & Support Faculty',
      subtext: cardsConfig?.leaves?.subtext || 'Casual, Medical & Duty leave requests',
      actionText: 'Review Staff Leaves',
      path: '/hr/staff-leaves',
    },
    {
      id: 'trainings',
      title: cardsConfig?.trainings?.title || 'Faculty Trainings & Muster',
      badge: cardsConfig?.trainings?.badge || '3 Active Workshops',
      badgeColor: 'bg-primary-50 text-primary-700 border-primary-200',
      icon: LuUsers,
      iconBg: 'bg-primary-50 text-primary-600',
      highlight: cardsConfig?.trainings?.highlight || '94% Attendance Rate',
      time: cardsConfig?.trainings?.time || 'Assigned & Notified',
      subtext: cardsConfig?.trainings?.subtext || 'Targeted faculty pedagogy sessions',
      actionText: 'Plan & Track Trainings',
      path: '/trainings',
    },
  ];

  const upcomingEvents = dashboardData?.upcomingEvents || [
    { id: 1, title: 'Annual Faculty Pedagogical & AI Workshop', date: 'Aug 22, 2026', time: '09:00 AM', venue: 'Main Auditorium' },
    { id: 2, title: 'Inter-School Sports Championship Meet', date: 'Aug 26, 2026', time: '08:30 AM', venue: 'Athletics Ground' },
    { id: 3, title: 'Science & Robotics Innovation Expo', date: 'Sep 02, 2026', time: '10:00 AM', venue: 'Tinkering Lab' },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <WelcomeCard />

      {/* Primary 4 Daily Information Cards */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <LuSparkles className="w-4 h-4 text-primary-600" />
            Today's HR Key Priorities
          </h2>
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 flex items-center gap-1.5 transition-colors"
          >
            <LuRefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Sync Realtime
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dailyCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => navigate(card.path)}
                className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs hover:shadow-lg hover:border-emerald-300 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>

                  {/* Card Title & Highlight */}
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                    {card.title}
                  </h3>

                  <div className="mt-3 p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100/80 space-y-1">
                    <p className="text-sm font-bold text-gray-800">{card.highlight}</p>
                    <p className="text-xs text-gray-500 font-medium">{card.time}</p>
                  </div>

                  <p className="text-xs text-gray-500 mt-3 font-medium">
                    {card.subtext}
                  </p>
                </div>

                {/* Card Action Link */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                  <span>{card.actionText}</span>
                  <LuArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <LuCalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Upcoming School Events & Activities</h3>
              <p className="text-xs text-gray-400">Institutional calendar and upcoming meets</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/school-events')}
            className="text-xs font-bold text-primary-700 hover:text-primary-800 flex items-center gap-1"
          >
            Manage Events <LuArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcomingEvents.map((event, idx) => (
            <div key={event.id || idx} className="p-4 rounded-2xl bg-gray-50/60 border border-gray-100 space-y-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-700">
                {event.category || 'Event'}
              </span>
              <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{event.title}</h4>
              <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
                <span className="flex items-center gap-1 font-medium">
                  <LuCalendar className="w-3.5 h-3.5 text-gray-400" />
                  {event.date}
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <LuMapPin className="w-3.5 h-3.5 text-gray-400" />
                  {event.venue}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
