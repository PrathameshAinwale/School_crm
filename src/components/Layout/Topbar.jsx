import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LuSearch,
  LuBell,
  LuChevronDown,
  LuUser,
  LuSettings,
  LuLogOut,
  LuRepeat,
  LuMenu,
} from 'react-icons/lu';

export default function Topbar({ onToggleMobileMenu }) {
  const navigate = useNavigate();
  const { user, currentRole, switchRole, logout, ROLES, ROLE_LABELS } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const roleRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (roleRef.current && !roleRef.current.contains(e.target)) setShowRoleSwitcher(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const notifications = [
    { id: 1, title: 'New fee payment received', time: '2 mins ago', unread: true },
    { id: 2, title: 'Leave request pending approval', time: '15 mins ago', unread: true },
    { id: 3, title: 'Exam results published', time: '1 hour ago', unread: false },
  ];
  const unreadCount = notifications.filter((n) => n.unread).length;

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
        {/* Role Switcher */}
        <div ref={roleRef} className="relative hidden lg:block">
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary-50 text-primary-700 text-xs font-semibold hover:bg-primary-100 transition-colors"
          >
            <LuRepeat className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline truncate max-w-[110px]">
              {ROLE_LABELS[currentRole]}
            </span>
            <LuChevronDown className="w-3 h-3 text-primary-600 shrink-0" />
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl border border-gray-200 shadow-xl p-1.5 z-50 animate-fade-in">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider px-2.5 py-1.5 font-bold">
                Switch Module Role
              </p>
              {Object.entries(ROLES).map(([key, value]) => (
                <button
                  key={value}
                  onClick={() => {
                    switchRole(value);
                    setShowRoleSwitcher(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                    currentRole === value
                      ? 'bg-primary-50 text-primary-700 font-bold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {ROLE_LABELS[value]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-8.5 h-8.5 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          >
            <LuBell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-1.5 w-72 max-w-[90vw] bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden z-50 animate-fade-in">
              <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-800">Notifications</h3>
                <span className="text-[10px] text-primary-600 font-semibold">{unreadCount} new</span>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-4 py-2.5 hover:bg-gray-50 cursor-pointer ${
                      notif.unread ? 'bg-primary-50/40' : ''
                    }`}
                  >
                    <p className="text-xs font-medium text-gray-700">{notif.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{notif.time}</p>
                  </div>
                ))}
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
              {user.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-gray-800 leading-tight">{user.name}</p>
              <p className="text-[10px] text-gray-400">{ROLE_LABELS[currentRole]}</p>
            </div>
            <LuChevronDown className="w-3 h-3 text-gray-400 hidden md:block" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl border border-gray-200 shadow-xl p-1.5 z-50 animate-fade-in">
              <div className="px-3 py-2 border-b border-gray-100 mb-1">
                <p className="text-xs font-bold text-gray-800 truncate">{user.name}</p>
                <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  navigate('/profile');
                  setShowProfile(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-gray-600 hover:bg-gray-50 font-medium"
              >
                <LuUser className="w-3.5 h-3.5" /> My Profile
              </button>
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 font-semibold"
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
