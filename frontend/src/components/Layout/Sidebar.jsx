import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import navigation from '../../data/navigation';
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronDown,
  LuGraduationCap,
  LuX,
} from 'react-icons/lu';

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

  const [expandedGroups, setExpandedGroups] = useState({});

  // Automatically expand group containing the currently active path
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.type === 'group' && item.children) {
        const hasActiveChild = item.children.some(
          (child) =>
            location.pathname === child.path ||
            (location.pathname === '/library' && child.path === '/library/books') ||
            (child.path !== '/dashboard' &&
              child.path !== '/library' &&
              location.pathname.startsWith(`${child.path}/`))
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 via-primary-700 to-indigo-800 flex items-center justify-center shrink-0 shadow-md shadow-primary-500/25">
            <LuGraduationCap className="w-5 h-5 text-white" />
          </div>
          {(!collapsed || mobileMenuOpen) && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold text-slate-800 tracking-tight leading-tight truncate">
                  Arch Campus
                </h1>
                <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-1.5 py-0.2 rounded-md border border-primary-200">
                  ERP
                </span>
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

        {/* Desktop collapse / expand icon in header */}
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
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200">
        {navItems.map((item) => {
          // GROUP ITEM
          if (item.type === 'group') {
            const Icon = item.icon;
            const hasActiveChild = item.children.some(
              (child) =>
                location.pathname === child.path ||
                (location.pathname === '/library' && child.path === '/library/books') ||
                (child.path !== '/dashboard' &&
                  child.path !== '/library' &&
                  location.pathname.startsWith(`${child.path}/`))
            );
            // Open by default unless user explicitly collapsed it
            const isExpanded =
              item._forceOpen ||
              (expandedGroups[item.label] !== undefined
                ? expandedGroups[item.label]
                : true);

            return (
              <div key={item.label} className="space-y-1">
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={`w-full group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold tracking-tight transition-all cursor-pointer ${
                    hasActiveChild
                      ? 'text-primary-800 bg-primary-50/60 font-bold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        hasActiveChild
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200/80 group-hover:text-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {(!collapsed || mobileMenuOpen) && (
                      <span className="truncate text-xs font-semibold text-slate-700 group-hover:text-slate-900">
                        {getNavLabel(item)}
                      </span>
                    )}
                  </div>

                  {(!collapsed || mobileMenuOpen) && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100/90 px-1.5 py-0.5 rounded-full">
                        {item.children.length}
                      </span>
                      <LuChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-primary-600' : ''
                        }`}
                      />
                    </div>
                  )}

                  {/* Collapsed Tooltip */}
                  {collapsed && !mobileMenuOpen && (
                    <div className="absolute left-full ml-3 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl border border-slate-800">
                      <p className="font-bold border-b border-slate-700 pb-1 mb-1 text-[11px] text-slate-300">
                        {getNavLabel(item)}
                      </p>
                      <div className="space-y-0.5">
                        {item.children.map((c) => (
                          <div
                            key={c.path}
                            className={`text-[11px] ${
                              location.pathname === c.path
                                ? 'text-primary-400 font-bold'
                                : 'text-slate-300'
                            }`}
                          >
                            • {getNavLabel(c)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </button>

                {/* Submenu Children Links */}
                {isExpanded && (!collapsed || mobileMenuOpen) && (
                  <div className="border-l-2 border-slate-200/90 ml-5.5 pl-3 space-y-0.5 mt-0.5 mb-1.5 animate-slide-up">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive =
                        location.pathname === child.path ||
                        (location.pathname === '/library' && child.path === '/library/books') ||
                        (child.path !== '/dashboard' &&
                          child.path !== '/library' &&
                          location.pathname.startsWith(`${child.path}/`));

                      return (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                            isChildActive
                              ? 'bg-gradient-to-r from-primary-50 to-primary-100/70 text-primary-700 font-bold shadow-xs border-l-[3px] border-primary-600'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/90 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <ChildIcon
                              className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                                isChildActive
                                  ? 'text-primary-600'
                                  : 'text-slate-400 group-hover:text-slate-600'
                              }`}
                            />
                            <span className="truncate">{getNavLabel(child)}</span>
                          </div>

                          {isChildActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-600 shrink-0" />
                          )}
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
          const isDashboard = item.path === '/dashboard';
          const isActive =
            location.pathname === item.path ||
            (isDashboard && (location.pathname === '/' || location.pathname === '/dashboard')) ||
            (item.path !== '/dashboard' &&
              item.path !== '/library' &&
              location.pathname.startsWith(`${item.path}/`));

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`group relative flex items-center justify-between px-2.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md shadow-primary-500/25'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 font-semibold'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {(!collapsed || mobileMenuOpen) && (
                  <span className="truncate">{getNavLabel(item)}</span>
                )}
              </div>

              {isActive && (!collapsed || mobileMenuOpen) && (
                <span className="w-2 h-2 rounded-full bg-white shrink-0 mr-1 shadow-xs animate-pulse" />
              )}

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
