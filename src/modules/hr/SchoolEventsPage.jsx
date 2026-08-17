import React, { useState } from 'react';
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
    time: '08:00 AM - 01:00 PM',
    venue: 'Respective Classrooms',
    audience: 'Parents & Class Teachers (All Grades)',
    coordinator: 'Mr. Rajesh Sharma (Admin)',
    speaker: 'Principal Address at 08:30 AM',
    status: 'Upcoming',
    description: 'Comprehensive one-on-one academic feedback and progress review following unit tests and mid-term preparatory scores.',
  },
  {
    id: 'EVT-05',
    title: 'Independence Day Cultural Celebrations',
    category: 'Cultural',
    date: '15 Aug 2026',
    time: '08:00 AM - 11:30 AM',
    venue: 'Campus Front Grounds',
    audience: 'Whole School Community',
    coordinator: 'Cultural Committee',
    speaker: 'Chief Guest Flag Hoisting',
    status: 'Completed',
    description: 'Patriotic musical tributes, march-past parade, and annual student honors ceremony.',
  },
];

const categoryColorStyles = {
  Workshop: 'bg-purple-50 text-purple-700 border-purple-200',
  Sports: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Exhibition: 'bg-blue-50 text-blue-700 border-blue-200',
  PTM: 'bg-amber-50 text-amber-700 border-amber-200',
  Cultural: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function SchoolEventsPage() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Workshop');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newVenue, setNewVenue] = useState('');
  const [newAudience, setNewAudience] = useState('');
  const [newCoordinator, setNewCoordinator] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newEventObj = {
      id: `EVT-0${events.length + 1}`,
      title: newTitle,
      category: newCategory,
      date: newDate || 'Upcoming Date',
      time: newTime || '09:00 AM - 01:00 PM',
      venue: newVenue || 'School Auditorium',
      audience: newAudience || 'All Staff & Students',
      coordinator: newCoordinator || 'HR Coordinator',
      speaker: '',
      status: 'Upcoming',
      description: newDescription || 'Official event details and schedule.',
    };

    setEvents((prev) => [newEventObj, ...prev]);
    setShowAddModal(false);
    setNewTitle('');
    setNewVenue('');
    setNewDate('');
    setNewTime('');
    setNewAudience('');
    setNewCoordinator('');
    setNewDescription('');
    setToastMessage('New school event created and published to campus calendar!');
    setTimeout(() => setToastMessage(''), 3500);
  };

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.coordinator.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || evt.category === categoryFilter;

    return matchesSearch && matchesCategory;
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
            <p className="text-sm font-bold">{toastMessage}</p>
            <p className="text-xs text-emerald-100">Calendar synced for teachers and parents</p>
          </div>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 shadow-xs">
              <LuMegaphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">School Events & Activities</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">
                  Campus Calendar 2026-27
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Plan, organize, and manage institutional events, athletic championships, and faculty workshops
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 self-start sm:self-auto"
          >
            <LuPlus className="w-4 h-4" />
            Create School Event
          </button>
        </div>
      </div>

      {/* Toolbar: Search & Category Filter Dropdown */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search event, venue or coordinator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
          />
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-gray-600 shrink-0">Select Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all cursor-pointer w-full sm:w-56"
          >
            <option value="ALL">All Categories</option>
            <option value="Workshop">Workshop & Training</option>
            <option value="Sports">Sports & Athletics</option>
            <option value="Exhibition">Exhibition / Science Fair</option>
            <option value="PTM">Parent-Teacher Meeting (PTM)</option>
            <option value="Cultural">Cultural / Gathering</option>
          </select>
        </div>
      </div>

      {/* Events Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-2xs hover:shadow-md hover:border-gray-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Row: Category & Status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`text-[11px] font-bold px-3 py-1 rounded-lg border ${
                      categoryColorStyles[evt.category] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {evt.category}
                  </span>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
                      evt.status === 'Completed'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {evt.status}
                  </span>
                </div>

                {/* Event Title */}
                <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug">
                  {evt.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-600 bg-gray-50/80 p-3 rounded-2xl border border-gray-100 mb-3.5 leading-relaxed">
                  {evt.description}
                </p>

                {/* Event Logistics & Meta Info */}
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <LuCalendarDays className="w-4 h-4 text-primary-600 shrink-0" />
                    <span className="font-bold text-gray-800">{evt.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <LuClock className="w-3.5 h-3.5 text-gray-400" /> {evt.time}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <LuMapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="font-medium text-gray-700">Venue: <strong>{evt.venue}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <LuUsers className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Audience: {evt.audience}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Coordinator */}
              <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Coordinator: <strong className="text-gray-700">{evt.coordinator}</strong></span>
                <button className="text-primary-600 hover:text-primary-800 font-bold flex items-center gap-1">
                  <LuShare2 className="w-3.5 h-3.5" /> Share
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 bg-white p-12 rounded-3xl border border-gray-200/80 text-center text-gray-400 text-sm">
            No events found for the selected filter.
          </div>
        )}
      </div>

      {/* Modal: Create School Event */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs"
            onClick={() => setShowAddModal(false)}
          />

          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden animate-fade-in-up">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <LuSparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Create New School Event</h2>
                  <p className="text-xs text-gray-500">Schedule an activity on the campus calendar</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">
                  Event Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Annual Science & Tinkering Exhibition"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-xl text-xs text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                />
              </div>

              {/* Category & Venue */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Event Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer"
                  >
                    <option value="Workshop">Workshop & Training</option>
                    <option value="Sports">Sports & Athletics</option>
                    <option value="Exhibition">Exhibition / Science Fair</option>
                    <option value="PTM">Parent-Teacher Meeting (PTM)</option>
                    <option value="Cultural">Cultural / Gathering</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Venue</label>
                  <input
                    type="text"
                    placeholder="E.g., Main Auditorium"
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl text-xs text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Date</label>
                  <input
                    type="text"
                    placeholder="E.g., 28 Aug 2026"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl text-xs text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Time</label>
                  <input
                    type="text"
                    placeholder="E.g., 09:30 AM - 01:00 PM"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl text-xs text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                </div>
              </div>

              {/* Audience & Coordinator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Target Audience</label>
                  <input
                    type="text"
                    placeholder="E.g., Grade 9-12 & Parents"
                    value={newAudience}
                    onChange={(e) => setNewAudience(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl text-xs text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Faculty Coordinator</label>
                  <input
                    type="text"
                    placeholder="E.g., Mr. Rajesh Sharma"
                    value={newCoordinator}
                    onChange={(e) => setNewCoordinator(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl text-xs text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Event Description & Agenda</label>
                <textarea
                  rows="3"
                  placeholder="Outline the agenda, guests, and schedule..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl text-xs text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-md flex items-center gap-1.5"
                >
                  <LuPlus className="w-3.5 h-3.5" />
                  Save & Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
