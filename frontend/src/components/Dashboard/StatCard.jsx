import React from 'react';
import { LuTrendingUp, LuTrendingDown } from 'react-icons/lu';

const colorMap = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-50 border border-blue-100' },
  green: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-50 border border-emerald-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', iconBg: 'bg-amber-50 border border-amber-100' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', iconBg: 'bg-rose-50 border border-rose-100' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', iconBg: 'bg-violet-50 border border-violet-100' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', iconBg: 'bg-cyan-50 border border-cyan-100' },
};

export default function StatCard({ label, value, trend, trendUp, color = 'blue', icon: Icon }) {
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4.5 border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full">
      <div className="flex items-center justify-between gap-1.5 mb-1.5 sm:mb-2">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${c.iconBg} flex items-center justify-center shrink-0`}>
          {Icon ? <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${c.text}`} /> : <div className={`w-2.5 h-2.5 rounded-full ${c.bg}`} />}
        </div>
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 text-[9px] sm:text-[11px] font-bold px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full whitespace-nowrap shrink-0 ${
              trendUp
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {trendUp ? <LuTrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" /> : <LuTrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />}
            <span className="truncate max-w-[80px] sm:max-w-[120px]">{trend}</span>
          </span>
        )}
      </div>

      <div className="mt-0.5">
        <h3 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight leading-none">{value}</h3>
        <p className="text-[11px] sm:text-xs font-semibold text-gray-500 mt-1 truncate">{label}</p>
      </div>
    </div>
  );
}
