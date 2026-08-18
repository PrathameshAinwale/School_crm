export default function CalendarWidget({ events }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-card">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Upcoming Events</h3>
      <div className="space-y-2.5">
        {events.map((event) => (
          <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="w-11 h-11 rounded-lg flex flex-col items-center justify-center shrink-0 bg-white border border-gray-200">
              <span className="text-[10px] text-gray-400 font-medium">{event.date.split(' ')[0]}</span>
              <span className="text-sm font-bold" style={{ color: event.color }}>{event.date.split(' ')[1]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{event.title}</p>
              <p className="text-xs text-gray-400">{event.time}</p>
            </div>
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: event.color }} />
          </div>
        ))}
      </div>
    </div>
  );
}
