import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import navigation from '../../data/navigation';
import { LuChevronLeft, LuLogOut, LuGraduationCap, LuX, LuChevronDown, LuChevronRight } from 'react-icons/lu';

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileMenuOpen,
  setMobileMenuOpen,
}) {
  const { user, currentRole, logout } = useAuth();
  const location = useLocation();
  const navItems = navigation[currentRole] || navigation.admin;
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = (label) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-50 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
        mobileMenuOpen
          ? 'translate-x-0 shadow-2xl w-72 max-w-[85vw]'
          : '-translate-x-full lg:translate-x-0'
      }`}
      style={{
        width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? (collapsed ? 72 : 256) : undefined,
      }}
    >
      {/* Logo & Mobile Close */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center shrink-0 shadow-xs">
            <LuGraduationCap className="w-5 h-5 text-white" />
          </div>
          {(!collapsed || mobileMenuOpen) && (
            <div>
              <h1 className="text-lg font-bold text-gray-800 leading-tight">EduFlow</h1>
              <p className="text-[10px] text-gray-400">School CRM</p>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 lg:hidden transition-colors"
        >
          <LuX className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {navItems.map((item) => {
          if (item.type === 'group') {
            const Icon = item.icon;
            const isExpanded = expandedGroups[item.label];
            return (
              <div key={item.label} className="space-y-1">
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={`w-full group relative flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-[18px] h-[18px] shrink-0 text-gray-400 group-hover:text-gray-600" />
                    {(!collapsed || mobileMenuOpen) && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>
                  {(!collapsed || mobileMenuOpen) && (
                    isExpanded ? (
                      <LuChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <LuChevronRight className="w-4 h-4 text-gray-400" />
                    )
                  )}
                  {collapsed && !mobileMenuOpen && (
                    <div className="absolute left-full ml-2 px-2.5 py-1 rounded-md bg-gray-800 text-white text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
                      {item.label}
                    </div>
                  )}
                </button>
                
                {/* Children */}
                {isExpanded && (!collapsed || mobileMenuOpen) && (
                  <div className="pl-9 space-y-1 mt-1">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = location.pathname === child.path;
                      return (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isChildActive
                              ? 'bg-primary-50 text-primary-700 font-semibold'
                              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          <ChildIcon
                            className={`w-4 h-4 shrink-0 ${
                              isChildActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                            }`}
                          />
                          <span className="truncate">{child.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon
                className={`w-[18px] h-[18px] shrink-0 ${
                  isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                }`}
              />
              {(!collapsed || mobileMenuOpen) && (
                <span className="truncate">{item.label}</span>
              )}
              {collapsed && !mobileMenuOpen && (
                <div className="absolute left-full ml-2 px-2.5 py-1 rounded-md bg-gray-800 text-white text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
