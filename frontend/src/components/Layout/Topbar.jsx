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
    if (notif.link) {
      navigate(notif.link);
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
      };
    }
    if (type === 'event' || lowerTitle.includes('event') || lowerTitle.includes('sports') || lowerTitle.includes('championship')) {
      return {
        icon: LuSparkles,
        bg: 'bg-amber-100 text-amber-700',
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        label: 'School Event',
      };
    }
    if (type === 'calendar' || lowerTitle.includes('calendar') || lowerTitle.includes('holiday') || lowerTitle.includes('exam')) {
      return {
        icon: LuCalendarDays,
        bg: 'bg-indigo-100 text-indigo-700',
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        label: lowerTitle.includes('holiday') ? 'Holiday' : 'Academic Calendar',
      };
    }
    if (type === 'alert') {
      return {
        icon: LuCircleAlert,
        bg: 'bg-rose-100 text-rose-700',
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        label: 'Announcement',
      };
    }
    return {
      icon: LuInfo,
      bg: 'bg-blue-100 text-blue-700',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      label: 'Notice',
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

        <div className="relative max-w-[200px] sm:max-w-xs md:max-w-sm w-full">
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
        {/* Role Badge (Static display only) */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>{ROLE_LABELS[currentRole] || currentRole}</span>
        </div>

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
                        className={`p-3.5 hover:bg-gray-50/80 cursor-pointer transition-colors flex items-start gap-3 ${
                          !notif.is_read ? 'bg-primary-50/30' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${meta.bg}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${meta.badge}`}>
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
                          <p className="text-[10px] text-gray-400 mt-1 font-medium">
                            {notif.time_ago || notif.created_at}
                          </p>
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
