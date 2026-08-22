import React, { useState, useEffect } from 'react';
import { hrService } from '../../services/hrService';
import {
  LuCalendarDays,
  LuPlus,
  LuSearch,
  LuFilter,
  LuMapPin,
  LuClock,
  LuUsers,
  LuSparkles,
  LuCheckCheck,
  LuX,
  LuCalendar,
  LuMegaphone,
  LuShare2,
  LuRefreshCw,
  LuLoader,
} from 'react-icons/lu';

const INITIAL_EVENTS = [
  {
    id: 'EVT-01',
    title: 'Annual Faculty Pedagogical & AI Workshop',
    category: 'Workshop',
    date: '22 Aug 2026',
    time: '09:00 AM - 01:30 PM',
    venue: 'Main Auditorium',
    audience: 'All Teaching Faculty (184 Members)',
    coordinator: 'Mrs. Deepa Krishnan (IT Head)',
    speaker: 'Dr. Arvind Swamy (NCERT Advisor)',
    status: 'Upcoming',
    description: 'Hands-on training session on modern digital teaching aids, AI-assisted assessment generation, and inclusive classroom techniques.',
  },
  {
    id: 'EVT-02',
    title: 'Inter-School Athletics & Sports Championship',
    category: 'Sports',
    date: '26 Aug 2026',
    time: '08:30 AM - 04:00 PM',
    venue: 'School Athletics Stadium',
    audience: 'Grade 6 to 12 & Parents',
    coordinator: 'Mr. Harish Chandra (Sports Dept)',
    speaker: 'Olympic Bronze Medalist Guest',
    status: 'Upcoming',
    description: 'Track and field events including 100m sprint, relay, long jump, and inter-house football tournament finals.',
  },
  {
    id: 'EVT-03',
    title: 'Science & Robotics Innovation Expo 2026',
    category: 'Exhibition',
    date: '02 Sep 2026',
    time: '10:00 AM - 03:00 PM',
    venue: 'Senior Science & Tinkering Labs',
    audience: 'Students, Faculty & Visiting Parents',
    coordinator: 'Mr. Vikram Rathore (PGT Physics)',
    speaker: 'Dr. Meera Nambiar (ISRO Scientist)',
    status: 'Upcoming',
    description: 'Student-built prototypes showcasing renewable energy models, automated irrigation sensors, and robotics automation.',
  },
  {
    id: 'EVT-04',
    title: 'Parent-Teacher Consultative Meeting (Term 1)',
    category: 'PTM',
    date: '10 Sep 2026',
    time: '08:30 AM - 01:00 PM',
    venue: 'Classrooms (Wing A & B)',
    audience: 'Parents & Class Teachers (All Grades)',
    coordinator: 'Mr. Rajesh Sharma (Admin)',
    speaker: 'Principal Address at 08:30 AM',
    status: 'Upcoming',
    description: 'Comprehensive one-on-one academic feedback and progress review following unit tests and mid-term preparatory scores.',
  },
];

const categoryColorStyles = {
  Workshop: 'bg-purple-50 text-purple-700 border-purple-200',
  Sports: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Exhibition: 'bg-blue-50 text-blue-700 border-blue-200',
  PTM: 'bg-amber-50 text-amber-700 border-amber-200',
  Cultural: 'bg-rose-50 text-rose-700 border-rose-200',
  General: 'bg-gray-50 text-gray-700 border-gray-200',
};

export default function SchoolEventsPage() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Workshop');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newVenue, setNewVenue] = useState('');
  const [newAudience, setNewAudience] = useState('');
  const [newCoordinator, setNewCoordinator] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await hrService.getSchoolEvents();
      const eventsList = res?.data?.events || res?.events || (Array.isArray(res?.data) ? res.data : null);
      if (eventsList && Array.isArray(eventsList) && eventsList.length > 0) {
        setEvents(eventsList);
      }
    } catch (err) {
      console.log('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      await hrService.createSchoolEvent({
        title: newTitle,
        category: newCategory,
        date: newDate || new Date().toISOString().split('T')[0],
        time: newTime || '09:00 AM - 01:00 PM',
        venue: newVenue || 'School Auditorium',
        audience: newAudience || 'Grade 6 to 12 & Parents',
        coordinator: newCoordinator || 'HR Head',
        description: newDescription,
      });
      fetchEvents();
      setToastMessage('New school event created and published.');
      setTimeout(() => setToastMessage(''), 3000);
      setShowAddModal(false);
      // Reset
      setNewTitle('');
      setNewDate('');
      setNewTime('');
      setNewVenue('');
      setNewAudience('');
      setNewCoordinator('');
      setNewDescription('');
    } catch (err) {
      console.log('Error creating event:', err);
      const newEventObj = {
        id: `EVT-0${events.length + 1}`,
        title: newTitle,
        category: newCategory,
        date: newDate || '25 Aug 2026',
        time: newTime || '09:00 AM - 01:00 PM',
        venue: newVenue || 'School Auditorium',
        audience: newAudience || 'All Staff & Students',
        coordinator: newCoordinator || 'HR Coordinator',
        speaker: '',
        status: 'Upcoming',
        description: newDescription || 'Official event details and schedule.',
      };
      setEvents([newEventObj, ...events]);
      setToastMessage('New school event published.');
      setTimeout(() => setToastMessage(''), 3000);
      setShowAddModal(false);
    }
  };

  const handleDeleteEvent = async (id, dbId) => {
    try {
      await hrService.deleteSchoolEvent(dbId || id);
      fetchEvents();
      setToastMessage('School event removed.');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      setEvents((prev) => prev.filter((e) => e.id !== id && e.db_id !== dbId));
      setToastMessage('School event removed.');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchesCategory = categoryFilter === 'ALL' || e.category === categoryFilter;
    const matchesSearch =
      e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.coordinator?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 flex items-center gap-3 px-5 py-3.5 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-600/20 animate-fade-in-up">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <LuCheckCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold">Event Published</p>
            <p className="text-xs text-emerald-100">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 shadow-xs">
            <LuMegaphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-gray-900">School Events & Institutional Calendar</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-800">
                HR & Admin Managed
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Publish and manage school-wide assemblies, workshops, sports championships, and exhibitions
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-primary-500/20 shrink-0"
        >
          <LuPlus className="w-4 h-4" /> Create New Event
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <LuSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search event title, venue or coordinator..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:bg-white transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'Workshop', 'Sports', 'Exhibition', 'PTM', 'Cultural'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {cat === 'ALL' ? 'All Events' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map((evt) => {
          const categoryStyle = categoryColorStyles[evt.category] || 'bg-gray-100 text-gray-700 border-gray-200';

          return (
            <div
              key={evt.id}
              className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${categoryStyle}`}>
                    {evt.category}
                  </span>
                  <span className="text-[11px] font-mono text-gray-400 font-semibold">{evt.id}</span>
                </div>

                <h3 className="text-base font-bold text-gray-900">{evt.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{evt.description}</p>
              </div>

              <div className="pt-3 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <LuCalendar className="w-4 h-4 text-primary-500" />
                    {evt.date}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <LuClock className="w-4 h-4 text-gray-400" />
                    {evt.time}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <LuMapPin className="w-4 h-4 text-gray-400" />
                    {evt.venue}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                    <LuUsers className="w-4 h-4 text-gray-400" />
                    {evt.audience}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                  <LuPlus className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Publish New School Event</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                <LuX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Annual Inter-School Science Fair 2026"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 font-medium"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Sports">Sports</option>
                    <option value="Exhibition">Exhibition</option>
                    <option value="PTM">PTM</option>
                    <option value="Cultural">Cultural</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Timing Slot</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="09:00 AM - 01:30 PM"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Venue Location</label>
                  <input
                    type="text"
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    placeholder="Main Auditorium"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Target Audience</label>
                <input
                  type="text"
                  value={newAudience}
                  onChange={(e) => setNewAudience(e.target.value)}
                  placeholder="e.g. All Students & Faculty"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Event Description</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Key agenda, guidelines, and schedule..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold transition-all shadow-md shadow-primary-500/20"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
