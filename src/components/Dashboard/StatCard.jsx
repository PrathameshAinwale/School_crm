import { LuTrendingUp, LuTrendingDown } from 'react-icons/lu';

const colorMap = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
  green: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', iconBg: 'bg-amber-100' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', iconBg: 'bg-rose-100' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', iconBg: 'bg-violet-100' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', iconBg: 'bg-cyan-100' },
};

export default function StatCard({ label, value, trend, trendUp, color = 'blue', icon: Icon }) {
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-card hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-2">
        {/* SVG Icon and Number placed side-by-side */}
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0`}>
            {Icon ? <Icon className={`w-5 h-5 ${c.text}`} /> : <div className={`w-3 h-3 rounded-full ${c.bg}`} />}
          </div>
          <h3 className="text-2xl font-extrabold text-gray-800 tracking-tight leading-none">{value}</h3>
        </div>

        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
            {trendUp ? <LuTrendingUp className="w-3.5 h-3.5" /> : <LuTrendingDown className="w-3.5 h-3.5" />}
            <span>{trend}</span>
          </div>
        )}
      </div>

      <p className="text-xs font-medium text-gray-500 mt-2">{label}</p>
    </div>
  );
}
