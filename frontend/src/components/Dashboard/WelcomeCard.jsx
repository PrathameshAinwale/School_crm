import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LuSun, LuSunMedium, LuMoon, LuSparkles } from 'react-icons/lu';

export default function WelcomeCard() {
  const { user, ROLE_LABELS, currentRole } = useAuth();

  const hour = new Date().getHours();
  let greeting = 'Good morning';
  let Icon = LuSun;
  if (hour >= 12 && hour < 17) {
    greeting = 'Good afternoon';
    Icon = LuSunMedium;
  } else if (hour >= 17 || hour < 4) {
    greeting = 'Good evening';
    Icon = LuMoon;
  }

  const userName = user?.name ? user.name : 'User';
  const roleLabel = ROLE_LABELS?.[currentRole] || currentRole || 'Dashboard';

  const currentDateFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 animate-fade-in">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <h1 className="text-base sm:text-2xl font-bold text-gray-900 tracking-tight leading-snug">
            {greeting}, <span className="text-primary-600">{userName}</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 flex items-center gap-1.5 font-medium">
            <span>Welcome to your</span>
            <span className="px-1.5 py-0.2 sm:px-2 sm:py-0.5 bg-primary-50 text-primary-700 rounded-md font-semibold text-[10px] sm:text-[11px]">
              {roleLabel}
            </span>
            <span>overview</span>
          </p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2 px-3.5 py-2 bg-gray-50 rounded-2xl border border-gray-100 text-xs font-semibold text-gray-600 self-start sm:self-auto shrink-0">
        <LuSparkles className="w-4 h-4 text-amber-500" />
        <span>{currentDateFormatted}</span>
      </div>
    </div>
  );
}
