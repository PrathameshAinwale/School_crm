import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import navigation from '../../data/navigation';
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronDown,
  LuX,
} from 'react-icons/lu';

// Helper to determine if a route is currently active (including query/hash and known aliases)
const isPathActive = (targetPath, currentPath) => {
  if (!targetPath || !currentPath) return false;
  if (currentPath === targetPath) return true;
  if (targetPath === '/dashboard') return currentPath === '/' || currentPath === '/dashboard';
  if ((targetPath === '/library/books' || targetPath === '/library') && (currentPath === '/library' || currentPath === '/library/books')) return true;
  if (targetPath === '/report-cards' && currentPath === '/reportcards') return true;
  if (targetPath === '/marksheets' && currentPath === '/marksheet') return true;
  if (targetPath === '/udise' && (currentPath === '/udise-plus' || currentPath === '/udiseplus')) return true;

  if (targetPath === '/admission/calendar') {
    return currentPath === '/admission/calendar' || currentPath === '/admission/interviews';
  }
  if (targetPath === '/admission/dashboard') {
    return currentPath === '/admission/dashboard' || currentPath === '/admission/desk';
  }
  if (targetPath === '/admission') {
    if (currentPath === '/admission' || currentPath === '/admissions' || currentPath === '/admission-portal') return true;
    if (currentPath.startsWith('/admission/') || currentPath.startsWith('/admissions/')) {
      // Must not highlight Student Admissions when on sibling routes (Calendar or Dashboard)
      if (
        currentPath.startsWith('/admission/calendar') ||
        currentPath.startsWith('/admission/interviews') ||
        currentPath.startsWith('/admission/dashboard') ||
        currentPath.startsWith('/admission/desk')
      ) {
        return false;
      }
      return true;
    }
    return false;
  }

  if (targetPath === '/assignments' && currentPath === '/assignment') return true;
  if (targetPath === '/assignment' && currentPath === '/assignments') return true;
  if (targetPath === '/salary' && (currentPath === '/salaries' || currentPath === '/payroll')) return true;
  if (targetPath === '/timetable' && currentPath === '/time-table') return true;
  if (targetPath === '/hr/staff-leaves' && currentPath === '/hr/leaves') return true;
  if (
    targetPath !== '/' &&
    targetPath !== '/dashboard' &&
    targetPath !== '/library' &&
    targetPath !== '/admission' &&
    currentPath.startsWith(`${targetPath}/`)
  ) {
    return true;
  }
  return false;
};

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileMenuOpen,
  setMobileMenuOpen,
}) {
  const { t } = useTranslation();
  const { currentRole } = useAuth();
  const location = useLocation();
  const navItems = navigation[currentRole] || navigation.admin;

  const [expandedGroups, setExpandedGroups] = useState({
    'Academic Leadership': true,
    'Academic & Students': true,
    'Classroom & Schedule': true,
    'Academics & Classroom': true,
    'Admissions Cell': true,
    'Staff & Leave Management': true,
    'Fee Operations': true,
    'Circulation Desk': true,
    'Sports & Competitions': true,
    'SaaS Platform Control': true,
    'Employee (Self)': true,
  });

  // Automatically expand the group containing the active page
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.type === 'group' && item.children) {
        const hasActiveChild = item.children.some((child) =>
          isPathActive(child.path, location.pathname)
        );

        if (hasActiveChild) {
          setExpandedGroups((prev) => ({
            ...prev,
            [item.label]: true,
          }));
        }
      }
    });
  }, [location.pathname, navItems]);

  const toggleGroup = (label) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [label]: prev[label] === undefined ? false : !prev[label],
    }));
  };

  const getNavLabel = (item) => {
    if (item.labelKey) return t(item.labelKey, item.label);

    const key = `nav.${item.label.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    return t(key, item.label);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-50 flex flex-col bg-white border-r border-slate-200/90 transition-all duration-300 shadow-sm ${
        mobileMenuOpen
          ? 'translate-x-0 shadow-2xl w-72 max-w-[85vw]'
          : '-translate-x-full lg:translate-x-0'
      }`}
      style={{
        width:
          typeof window !== 'undefined' && window.innerWidth >= 1024
            ? collapsed
              ? 72
              : 264
            : undefined,
      }}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-3.5 h-16 border-b border-slate-100 shrink-0 bg-white">
        <div className="flex items-center gap-3 overflow-hidden">
            <img
              src="/logo.svg"
              alt="Arch Campus Logo"
              className="w-7 h-7 object-contain"
            />

          {(!collapsed || mobileMenuOpen) && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold text-slate-800 tracking-tight leading-tight truncate">
                  Arch Campus
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                School Management
              </p>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden transition-colors cursor-pointer"
          aria-label="Close mobile menu"
        >
          <LuX className="w-5 h-5" />
        </button>

        {/* Desktop collapse / expand button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? (
            <LuChevronRight className="w-4 h-4" />
          ) : (
            <LuChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
        {navItems.map((item) => {
          // GROUP ITEM
          if (item.type === 'group') {
            const Icon = item.icon;

            const hasActiveChild = item.children.some((child) =>
              isPathActive(child.path, location.pathname)
            );

            const isExpanded =
              item._forceOpen ||
              (expandedGroups[item.label] !== undefined
                ? expandedGroups[item.label]
                : true);

            return (
              <div key={item.label} className="space-y-0.5">
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={`w-full group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                    hasActiveChild
                      ? 'bg-primary-50/70 text-primary-900 font-bold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        hasActiveChild
                          ? 'text-primary-600'
                          : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    />

                    {(!collapsed || mobileMenuOpen) && (
                      <span className="truncate text-xs tracking-tight">
                        {getNavLabel(item)}
                      </span>
                    )}
                  </div>

                  {(!collapsed || mobileMenuOpen) && (
                    <LuChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 shrink-0 ${
                        isExpanded ? 'rotate-180 text-primary-600' : ''
                      }`}
                    />
                  )}

                  {/* Collapsed Tooltip */}
                  {collapsed && !mobileMenuOpen && (
                    <div className="absolute left-full ml-3 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl border border-slate-800">
                      <p className="font-bold border-b border-slate-700 pb-1 mb-1 text-[11px] text-slate-300">
                        {getNavLabel(item)}
                      </p>

                      <div className="space-y-0.5">
                        {item.children.map((child) => (
                          <div
                            key={child.path}
                            className={`text-[11px] ${
                              isPathActive(child.path, location.pathname)
                                ? 'text-primary-400 font-bold'
                                : 'text-slate-300'
                            }`}
                          >
                            • {getNavLabel(child)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </button>

                {/* Submenu Children Links */}
                {isExpanded && (!collapsed || mobileMenuOpen) && (
                  <div className="pl-6 pr-1 space-y-0.5 mt-0.5 mb-1 animate-slide-up">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = isPathActive(child.path, location.pathname);

                      return (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                            isChildActive
                              ? 'bg-primary-600 text-white font-bold shadow-xs shadow-primary-500/20'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <ChildIcon
                              className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                                isChildActive
                                  ? 'text-white'
                                  : 'text-slate-400 group-hover:text-slate-600'
                              }`}
                            />
                            <span className="truncate">
                              {getNavLabel(child)}
                            </span>
                          </div>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // SINGLE LINK (e.g. Dashboard)
          const Icon = item.icon;
          const isActive = isPathActive(item.path, location.pathname);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                isActive
                  ? 'bg-primary-600 text-white font-bold shadow-xs shadow-primary-500/20'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 font-semibold'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                  }`}
                />

                {(!collapsed || mobileMenuOpen) && (
                  <span className="truncate">{getNavLabel(item)}</span>
                )}
              </div>

              {/* Collapsed Tooltip */}
              {collapsed && !mobileMenuOpen && (
                <div className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl border border-slate-800">
                  {getNavLabel(item)}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
