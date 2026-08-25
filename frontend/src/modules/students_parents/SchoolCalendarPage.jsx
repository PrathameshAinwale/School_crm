import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentParentService } from '../../services/studentParentService';
import {
  LuCalendarDays,
  LuArrowLeft,
  LuClock,
  LuMapPin,
  LuDownload,
  LuCalendarPlus,
  LuFilter,
  LuLoader,
} from 'react-icons/lu';

const eventTypeBadgeStyles = {
  Exam: 'bg-rose-50 text-rose-700 border-rose-200',
  Holiday: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Event: 'bg-blue-50 text-blue-700 border-blue-200',
  PTM: 'bg-purple-50 text-purple-700 border-purple-200',
};

export default function SchoolCalendarPage() {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('All');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    studentParentService.getCalendarEvents({
      type: filterType === 'All' ? '' : filterType,
    })
      .then((res) => {
        const eventsData = res?.data?.events || res?.data || res?.events;
        if (Array.isArray(eventsData)) {
          setEvents(eventsData);
        } else {
          setEvents([]);
        }
      })
      .catch((err) => {
        console.log('Calendar events fetch error:', err);
        setEvents([]);
      })
      .finally(() => setLoading(false));
  }, [filterType]);

  const filteredEvents = filterType === 'All'
    ? events
    : events.filter(e => e.type === filterType);

  const months = [...new Set(filteredEvents.map(e => e.month))];

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <LuArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">School Calendar & Events</h1>
            <p className="text-xs text-gray-400">Exam Schedules, Holidays, PTMs & Institutional Gatherings (Session 2026-27)</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button className="px-3.5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors">
            <LuDownload className="w-3.5 h-3.5" /> Download Academic Calendar PDF
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'Exam', 'Holiday', 'Event', 'PTM'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              filterType === type
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {type === 'All' ? 'All Events & Dates' : type === 'Exam' ? 'Exam Dates' : type === 'Holiday' ? 'School Holidays' : type === 'Event' ? 'Events & Sports' : 'PTMs'}
          </button>
        ))}
      </div>

      {/* Events grouped by month */}
      {months.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-200 text-center">
          <p className="text-gray-500 text-sm">No events found matching the selected filter.</p>
        </div>
      ) : (
        months.map((month) => {
          const monthEvents = filteredEvents.filter(e => e.month === month);
          return (
            <div key={month} className="space-y-3">
              <div className="flex items-center gap-2">
                <LuCalendarDays className="w-4 h-4 text-primary-600" />
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">{month}</h2>
                <span className="text-xs text-gray-400 font-medium">({monthEvents.length} scheduled)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {monthEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${eventTypeBadgeStyles[evt.type] || 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                          {evt.type}
                        </span>
                        <span className="text-xs font-bold text-primary-600 flex items-center gap-1">
                          <LuCalendarDays className="w-3.5 h-3.5" /> {evt.date}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-gray-800 leading-snug mb-1">{evt.title}</h3>
                      <p className="text-xs text-gray-600 leading-relaxed mb-3">{evt.desc}</p>

                      <div className="space-y-1 text-[11px] text-gray-500 pt-2.5 border-t border-gray-100">
                        <div className="flex items-center gap-1.5">
                          <LuClock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{evt.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <LuMapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{evt.venue}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                      <button className="text-primary-600 hover:text-primary-800 text-[11px] font-medium inline-flex items-center gap-1">
                        <LuCalendarPlus className="w-3 h-3" /> Add to Calendar
                      </button>
                      <span className="text-[11px] text-emerald-600 font-medium">Verified by School Office</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
