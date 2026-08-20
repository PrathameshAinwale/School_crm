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

const fallbackCalendarEvents = [
  { id: 1, title: 'Mid-Term Mathematics Board Pattern Exam', type: 'Exam', date: 'Aug 20, 2026', time: '9:00 AM - 12:00 PM', venue: 'Main Examination Hall A', month: 'August 2026', desc: 'Syllabus: Units 1 to 3. Bring verified board geometry kit and admit card.' },
  { id: 2, title: 'Science Practical Lab Evaluation & Viva', type: 'Exam', date: 'Aug 22, 2026', time: '10:00 AM - 1:00 PM', venue: 'Senior Physics & Chemistry Labs', month: 'August 2026', desc: 'Submission of completed practical record files is mandatory before entering the lab.' },
  { id: 3, title: 'Janmashtami Institutional Holiday', type: 'Holiday', date: 'Aug 26, 2026', time: 'Full Day', venue: 'Campus Closed', month: 'August 2026', desc: 'School will remain closed on account of Sri Krishna Janmashtami.' },
  { id: 4, title: 'Annual Zonal Inter-School Athletics Championship', type: 'Event', date: 'Aug 28, 2026', time: '8:00 AM - 4:00 PM', venue: 'School Sports Arena & Track', month: 'August 2026', desc: 'House athletic competitions across Track & Field events. Parents cordially invited.' },
  { id: 5, title: 'Distinguished Keynote: "Future of Space STEM" by Dr. K. Radhakrishnan', type: 'Event', date: 'Sep 04, 2026', time: '11:00 AM - 1:00 PM', venue: 'Main Auditorium', month: 'September 2026', desc: 'Special lecture for Grades IX to XII by former ISRO Chairman.' },
  { id: 6, title: 'Parent-Teacher Meeting (PTM Term 1)', type: 'PTM', date: 'Sep 05, 2026', time: '9:00 AM - 1:00 PM', venue: 'Respective Classrooms', month: 'September 2026', desc: '1-on-1 performance review of Unit Tests and Mid-Term examinations with class teachers.' },
  { id: 7, title: 'Ganesh Chaturthi Holiday', type: 'Holiday', date: 'Sep 07, 2026', time: 'Full Day', venue: 'Campus Closed', month: 'September 2026', desc: 'Gazetted holiday for Ganesh Chaturthi.' },
  { id: 8, title: 'Grandparents Day Gathering & Cultural Fiesta', type: 'Event', date: 'Sep 12, 2026', time: '9:30 AM - 1:30 PM', venue: 'Open-Air Amphitheatre', month: 'September 2026', desc: 'Special cultural performances and music dedicated to our grandparents.' },
  { id: 9, title: 'Inter-House Science & Robotics Innovation Expo 2026', type: 'Event', date: 'Sep 20, 2026', time: '10:00 AM - 3:00 PM', venue: 'Senior Science Wings', month: 'September 2026', desc: 'Working model demonstrations and robotics competition for all student houses.' },
  { id: 10, title: 'Gandhi Jayanti Holiday', type: 'Holiday', date: 'Oct 02, 2026', time: 'Full Day', venue: 'Campus Closed', month: 'October 2026', desc: 'National holiday on the occasion of Mahatma Gandhi Birthday.' },
  { id: 11, title: 'Half-Yearly Summative Assessment Exams (SA-1)', type: 'Exam', date: 'Oct 10 - Oct 22, 2026', time: '9:00 AM - 12:30 PM', venue: 'All Classrooms', month: 'October 2026', desc: 'Major mid-session board pattern examinations covering 50% CBSE syllabus.' },
  { id: 12, title: 'Dussehra & Autumn Vacation', type: 'Holiday', date: 'Oct 23 - Oct 28, 2026', time: '6 Days', venue: 'Campus Closed', month: 'October 2026', desc: 'Autumn break for students and faculty. Classes resume Oct 29.' },
];

const eventTypeBadgeStyles = {
  Exam: 'bg-rose-50 text-rose-700 border-rose-200',
  Holiday: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Event: 'bg-blue-50 text-blue-700 border-blue-200',
  PTM: 'bg-purple-50 text-purple-700 border-purple-200',
};

export default function SchoolCalendarPage() {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('All');
  const [events, setEvents] = useState(fallbackCalendarEvents);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    studentParentService.getCalendarEvents({
      type: filterType === 'All' ? '' : filterType,
    })
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          setEvents(res.data);
        }
      })
      .catch((err) => console.log('Loaded fallback events:', err))
      .finally(() => setLoading(false));
  }, [filterType]);

  const filteredEvents = filterType === 'All'
    ? events
    : events.filter(e => e.type === filterType);

  const months = [...new Set(filteredEvents.map(e => e.month))];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
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
