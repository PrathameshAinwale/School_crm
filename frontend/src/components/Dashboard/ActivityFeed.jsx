import { LuUserPlus, LuDollarSign, LuFileText, LuClock, LuBell, LuCircleCheck } from 'react-icons/lu';

const iconMap = {
  'user-plus': LuUserPlus, dollar: LuDollarSign, file: LuFileText,
  clock: LuClock, bell: LuBell, check: LuCircleCheck,
};

const typeColorMap = {
  enrollment: 'bg-blue-50 text-blue-600',
  fee: 'bg-emerald-50 text-emerald-600',
  exam: 'bg-violet-50 text-violet-600',
  leave: 'bg-amber-50 text-amber-600',
  notice: 'bg-rose-50 text-rose-600',
  attendance: 'bg-cyan-50 text-cyan-600',
};

export default function ActivityFeed({ activities }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-card">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Recent Activity</h3>
      <div className="space-y-0">
        {activities.map((activity) => {
          const Icon = iconMap[activity.icon] || LuBell;
          const color = typeColorMap[activity.type] || typeColorMap.notice;
          return (
            <div key={activity.id} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 leading-relaxed">{activity.message}</p>
                <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
