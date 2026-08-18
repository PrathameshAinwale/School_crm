import { LuUserPlus, LuDollarSign, LuFileText, LuCircleCheck, LuBell } from 'react-icons/lu';

const iconMap = {
  'user-plus': LuUserPlus, dollar: LuDollarSign, file: LuFileText,
  check: LuCircleCheck, bell: LuBell,
};

const colorMap = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', hover: 'hover:bg-blue-100' },
  green: { bg: 'bg-emerald-50', text: 'text-emerald-600', hover: 'hover:bg-emerald-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', hover: 'hover:bg-amber-100' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', hover: 'hover:bg-rose-100' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', hover: 'hover:bg-violet-100' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', hover: 'hover:bg-cyan-100' },
};

export default function QuickActions({ actions }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-card">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-3 gap-2.5">
        {actions.map((action) => {
          const Icon = iconMap[action.icon] || LuCircleCheck;
          const c = colorMap[action.color] || colorMap.blue;
          return (
            <button key={action.label} className={`flex flex-col items-center gap-2 p-3.5 rounded-lg border border-gray-100 ${c.hover} transition-colors cursor-pointer`}>
              <Icon className={`w-5 h-5 ${c.text}`} />
              <span className="text-xs font-medium text-gray-600 text-center leading-tight">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
