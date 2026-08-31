import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import {
  LuSearch,
  LuBell,
  LuChevronDown,
  LuUser,
  LuSettings,
  LuLogOut,
  LuMenu,
  LuGraduationCap,
  LuCalendarDays,
  LuCalendar,
  LuSparkles,
  LuInfo,
  LuCircleCheck,
  LuCircleAlert,
  LuFileText,
  LuReceipt,
  LuChevronRight,
} from 'react-icons/lu';

export default function Topbar({ onToggleMobileMenu }) {
  const navigate = useNavigate();
  const { user, currentRole, logout, ROLE_LABELS } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const [notificationsList, setNotificationsList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      const res = await adminService.getNotifications();
      if (res && res.success) {
        setNotificationsList(res.data || []);
        setUnreadCount(res.unread_count || 0);
      }
    } catch (e) {
      // quiet fail
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000); // poll every 15s for new notifications
    return () => clearInterval(interval);
  }, []);

  /**
   * Resolves the target page URL for any notification based on type, keywords, and role
   */
  const resolveNotificationRoute = (notif, role) => {
    if (!notif) return '/dashboard';
    const r = (role || currentRole || '').toLowerCase();
    const type = (notif.type || '').toLowerCase();
    const title = (notif.title || '').toLowerCase();
    const msg = (notif.message || '').toLowerCase();
    const rawLink = (notif.link || '').trim();

    // 1. Trainings & Faculty Workshops
    if (
      type === 'training' ||
      title.includes('training') ||
      title.includes('workshop') ||
      msg.includes('training workshop') ||
      msg.includes('faculty training')
    ) {
      if (r === 'teacher') return '/trainings';
      if (r === 'hr' || r === 'admin') return '/hr/trainings';
      return '/trainings';
    }

    // 2. Staff & Teacher Leaves
    if (
      type === 'leave' ||
      title.includes('leave') ||
      title.includes('vacation') ||
      msg.includes('leave application') ||
      msg.includes('leave request')
    ) {
      if (r === 'hr' || r === 'admin') return '/hr/staff-leaves';
      if (r === 'teacher') return '/hr/apply-leave';
      return '/hr/apply-leave';
    }

    // 3. Salary, Payroll & Salary Disbursements
    if (
      type === 'salary' ||
      type === 'payroll' ||
      title.includes('salary') ||
      title.includes('payroll') ||
      title.includes('disbursement') ||
      msg.includes('salary') ||
      msg.includes('disbursement')
    ) {
      if (r === 'accountant') return '/accounts/salary-disbursements';
      if (r === 'hr' || r === 'admin') return '/salary';
      return '/salary';
    }

    // 4. Student Fees & Fee Reminders
    if (
      type === 'fee' ||
      title.includes('fee') ||
      title.includes('receipt') ||
      title.includes('installment') ||
      title.includes('dues') ||
      msg.includes('pending fee') ||
      msg.includes('fee payment')
    ) {
      if (r === 'student_parent') return '/fees';
      if (r === 'accountant' || r === 'admin') return '/accounts/fees';
      return '/fees';
    }

    // 5. Attendance & Roll Call
    if (
      type === 'attendance' ||
      title.includes('attendance') ||
      msg.includes('attendance')
    ) {
      if (r === 'teacher') return '/class-attendance';
      if (r === 'student_parent') return '/attendance';
      if (r === 'hr') return '/hr/staff-attendance';
      if (r === 'admin') return '/attendance';
      return '/attendance';
    }

    // 6. Assignments & Homework
    if (
      type === 'assignment' ||
      title.includes('assignment') ||
      title.includes('homework') ||
      msg.includes('assignment')
    ) {
      return '/assignment';
    }

    // 7. Syllabus & Completed Units
    if (
      type === 'syllabus' ||
      type === 'academic' ||
      title.includes('syllabus') ||
      title.includes('chapter') ||
      msg.includes('syllabus')
    ) {
      return '/syllabus';
    }

    // 8. Timetable, Schedules & Lectures
    if (
      type === 'timetable' ||
      type === 'schedule' ||
      title.includes('timetable') ||
      title.includes('lecture') ||
      title.includes('schedule')
    ) {
      if (r === 'teacher') return '/teacher/schedule';
      return '/timetable';
    }

    // 9. PTM (Parent Teacher Meetings)
    if (
      type === 'ptm' ||
      title.includes('ptm') ||
      title.includes('parent-teacher') ||
      title.includes('parent teacher')
    ) {
      return '/ptm';
    }

    // 10. School Events & Holidays
    if (
      type === 'event' ||
      type === 'calendar' ||
      title.includes('event') ||
      title.includes('sports') ||
      title.includes('holiday') ||
      title.includes('calendar')
    ) {
      if (r === 'hr') return '/school-events';
      if (r === 'admin') return '/admin/calendar';
      return '/calendar';
    }

    // 11. School Resources & Assets
    if (
      type === 'resource' ||
      title.includes('resource') ||
      title.includes('study material')
    ) {
      if (r === 'teacher') return '/teacher/resources';
      if (r === 'student_parent') return '/study-material';
      if (r === 'admin') return '/school-resources';
    }

    // 12. Notice Board Circulars
    if (
      type === 'notice' ||
      title.includes('notice') ||
      title.includes('circular')
    ) {
      return '/notices';
    }

    // 13. Direct valid link if provided and not generic
    if (rawLink && rawLink !== '/notifications' && rawLink !== '#' && rawLink !== '/') {
      return rawLink;
    }

    return '/dashboard';
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await adminService.markNotificationAsRead(notif.id);
        setNotificationsList((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (e) {}
    }
    setShowNotifications(false);
    
    // Resolve smart route based on notification content and user role
    const targetRoute = resolveNotificationRoute(notif, currentRole);
    if (targetRoute) {
      navigate(targetRoute);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await adminService.markAllNotificationsAsRead();
      setNotificationsList((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  const getNotifMeta = (type, title = '') => {
    const lowerTitle = title.toLowerCase();
    if (type === 'training' || lowerTitle.includes('training') || lowerTitle.includes('workshop')) {
      return {
        icon: LuGraduationCap,
        bg: 'bg-purple-100 text-purple-700',
        badge: 'bg-purple-50 text-purple-700 border-purple-200',
        label: 'Training',
        actionLabel: 'View Training',
      };
    }
    if (type === 'leave' || lowerTitle.includes('leave')) {
      return {
        icon: LuFileText,
        bg: 'bg-teal-100 text-teal-700',
        badge: 'bg-teal-50 text-teal-700 border-teal-200',
        label: 'Leave',
        actionLabel: 'View Leaves',
      };
    }
    if (type === 'salary' || type === 'payroll' || lowerTitle.includes('salary') || lowerTitle.includes('disbursement')) {
      return {
        icon: LuReceipt,
        bg: 'bg-emerald-100 text-emerald-700',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        label: 'Payroll',
        actionLabel: 'View Salary',
      };
    }
    if (type === 'event' || lowerTitle.includes('event') || lowerTitle.includes('sports') || lowerTitle.includes('championship')) {
      return {
        icon: LuSparkles,
        bg: 'bg-amber-100 text-amber-700',
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        label: 'School Event',
        actionLabel: 'View Event',
      };
    }
    if (type === 'calendar' || lowerTitle.includes('calendar') || lowerTitle.includes('holiday') || lowerTitle.includes('exam')) {
      return {
        icon: LuCalendarDays,
        bg: 'bg-indigo-100 text-indigo-700',
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        label: lowerTitle.includes('holiday') ? 'Holiday' : 'Academic Calendar',
        actionLabel: 'View Calendar',
      };
    }
    if (type === 'fee' || lowerTitle.includes('fee') || lowerTitle.includes('receipt') || lowerTitle.includes('due')) {
      return {
        icon: LuReceipt,
        bg: 'bg-emerald-100 text-emerald-700',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        label: 'Accounts / Fee',
        actionLabel: 'View Fees',
      };
    }
    if (type === 'attendance' || lowerTitle.includes('attendance')) {
      return {
        icon: LuCircleCheck,
        bg: 'bg-cyan-100 text-cyan-700',
        badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        label: 'Attendance',
        actionLabel: 'View Attendance',
      };
    }
    if (type === 'assignment' || lowerTitle.includes('assignment') || lowerTitle.includes('homework')) {
      return {
        icon: LuFileText,
        bg: 'bg-blue-100 text-blue-700',
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        label: 'Assignment',
        actionLabel: 'View Assignment',
      };
    }
    if (type === 'syllabus' || lowerTitle.includes('syllabus')) {
      return {
        icon: LuGraduationCap,
        bg: 'bg-violet-100 text-violet-700',
        badge: 'bg-violet-50 text-violet-700 border-violet-200',
        label: 'Syllabus',
        actionLabel: 'View Syllabus',
      };
    }
    if (type === 'alert') {
      return {
        icon: LuCircleAlert,
        bg: 'bg-rose-100 text-rose-700',
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        label: 'Alert',
        actionLabel: 'View Details',
      };
    }
    return {
      icon: LuInfo,
      bg: 'bg-blue-100 text-blue-700',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      label: 'Notice',
      actionLabel: 'View Notice',
    };
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30">
      {/* Left: Mobile Menu Button + Date / Search */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        {/* Mobile Hamburger Drawer Toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden transition-colors shrink-0"
          aria-label="Open mobile menu"
        >
          <LuMenu className="w-5 h-5" />
        </button>

        <p className="text-xs text-gray-400 font-medium hidden xl:block whitespace-nowrap">
          {currentDate}
        </p>

        {/* Tenant School Badge or Super Admin Badge */}

        <div className="relative max-w-[180px] sm:max-w-xs md:max-w-sm w-full">
          <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8.5 pl-8 pr-3 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) loadNotifications();
            }}
            className="relative w-8.5 h-8.5 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <LuBell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-1.5 sm:w-84 bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/75">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-gray-900">Notifications & Alerts</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-primary-600 hover:text-primary-800 font-semibold cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {notificationsList.length > 0 ? (
                  notificationsList.map((notif) => {
                    const meta = getNotifMeta(notif.type, notif.title);
                    const IconComponent = meta.icon;
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`group p-3.5 hover:bg-gray-50/90 cursor-pointer transition-all flex items-start gap-3 ${
                          !notif.is_read ? 'bg-primary-50/30' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${meta.bg}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${meta.badge}`}>
                                {meta.label}
                              </span>
                              <p className={`text-xs ${!notif.is_read ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                                {notif.title}
                              </p>
                            </div>
                            {!notif.is_read && (
                              <span className="w-2 h-2 rounded-full bg-primary-600 shrink-0 mt-1" />
                            )}
                          </div>
                          {notif.message && (
                            <p className="text-[11px] text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                              {notif.message}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-1.5 pt-0.5">
                            <p className="text-[10px] text-gray-400 font-medium">
                              {notif.time_ago || notif.created_at}
                            </p>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-600 opacity-75 group-hover:opacity-100 transition-all">
                              <span>{meta.actionLabel || 'Open'}</span>
                              <LuChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-gray-400 text-xs">
                    No new notifications right now.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-7.5 h-7.5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
              {user?.name ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('') : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-gray-800 leading-tight">{user?.name || 'User'}</p>
              <p className="text-[10px] text-gray-400">{ROLE_LABELS[currentRole] || currentRole}</p>
            </div>
            <LuChevronDown className="w-3 h-3 text-gray-400 hidden md:block" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl border border-gray-200 shadow-xl p-1.5 z-50 animate-fade-in">
              <div className="px-3 py-2 border-b border-gray-100 mb-1">
                <p className="text-xs font-bold text-gray-800 truncate">{user?.name || 'User'}</p>
                <p className="text-[11px] text-gray-400 truncate">{user?.email || user?.phone || ''}</p>
              </div>
              {currentRole !== 'admin' && (
                <button
                  onClick={() => {
                    if (currentRole === 'teacher') {
                      navigate('/teacher/profile');
                    } else if (currentRole === 'hr') {
                      navigate('/hr/profile');
                    } else {
                      navigate('/profile');
                    }
                    setShowProfile(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-gray-600 hover:bg-gray-50 font-medium cursor-pointer"
                >
                  <LuUser className="w-3.5 h-3.5" /> My Profile
                </button>
              )}
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 font-semibold cursor-pointer"
                >
                  <LuLogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
