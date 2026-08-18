import React, { useState } from 'react';
import {
  LuBell,
  LuSearch,
  LuPlus,
  LuEye,
  LuCalendar,
  LuCircleCheck,
  LuClock,
  LuX,
  LuFileText,
  LuSparkles,
} from 'react-icons/lu';

const OWNER_NOTICES_DATA = [
  {
    id: 'NTC-OWN-101',
    title: 'Governing Board & Trustee Quarterly Review Meeting',
    date: '28 Aug 2026',
    time: '10:30 AM',
    location: 'Board Room, Administration Block',
    category: 'Governing Board',
    priority: 'Urgent',
    postedBy: 'Chairman / Secretary Office',
    summary: 'Quarterly review of institutional CapEx budget, Class XI/XII Science division expansion, and FY 2026-27 balance sheet ratification.',
    content: 'All Trustees and Executive Board Members are requested to attend the Q2 Institutional Review Meeting on Friday, August 28, 2026. Agenda includes approval of the STEM Tinkering Lab expansion, new bus procurement, and employee health insurance renewals.',
  },
  {
    id: 'NTC-OWN-102',
    title: 'Inter-School Zonal Athletics Meet 2026 — Opening Ceremony',
    date: '04 Sep 2026',
    time: '08:00 AM',
    location: 'Olympic Synthetic Arena, Campus South',
    category: 'School Events',
    priority: 'High',
    postedBy: 'Sports & PE Department',
    summary: 'EduFlow School will host 32 regional schools for the Annual Inter-School Athletic Meet. The School Owner is invited as Chief Patron.',
    content: 'The Annual Zonal Athletics Meet will commence with the flag-hoisting ceremony. Over 800 student athletes will compete in 24 track and field events. Security protocols and emergency medical stations have been fully pre-inspected.',
  },
  {
    id: 'NTC-OWN-103',
    title: 'CBSE New Assessment & Curriculum Framework Circular #CBSE-2026-89',
    date: '15 Aug 2026',
    time: '02:00 PM',
    location: 'Academic Council',
    category: 'Regulatory & CBSE',
    priority: 'High',
    postedBy: 'Academic Director',
    summary: 'Revised competency-based questions guidelines for Class X and Class XII Board Examinations for academic session 2026-27.',
    content: 'CBSE has released notification detailing 50% competency-based MCQs and case studies for Board Exams. Faculty training workshops conducted by HODs are scheduled for next Saturday.',
  },
  {
    id: 'NTC-OWN-104',
    title: 'Phase 2 Rooftop Solar & Green Campus Tender Realization',
    date: '10 Aug 2026',
    time: '11:00 AM',
    location: 'Finance & Accounts Desk',
    category: 'Campus Operations',
    priority: 'General',
    postedBy: 'Estate & Facilities Manager',
    summary: 'Execution of 50 kW expansion to the existing 150 kW solar array completed under budget with ₹4.2 Lakhs annual savings projected.',
    content: 'The net-metering grid synchronization with Tata Power Solar has been verified. Green campus accreditation submitted to the Directorate of Education.',
  },
  {
    id: 'NTC-OWN-105',
    title: 'Annual Institutional Grand Parent-Teacher Conference (PTM)',
    date: '12 Sep 2026',
    time: '09:00 AM',
    location: 'Campus Classrooms & Main Auditorium',
    category: 'School Events',
    priority: 'General',
    postedBy: 'Principal Office',
    summary: 'Mid-term academic assessment report cards distribution across all 78 class divisions.',
    content: 'Over 2,500 parents expected across staggered time slots. Digital queue management and shuttle transport between parking lots active.',
  },
];

export default function OwnerNoticesPage() {
  const [notices, setNotices] = useState(OWNER_NOTICES_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filtered = notices.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.postedBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || n.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['ALL', ...Array.from(new Set(notices.map((n) => n.category)))];

  const handleCreateNotice = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newNotice = {
      id: `NTC-OWN-${Math.floor(100 + Math.random() * 900)}`,
      title: formData.get('title'),
      date: formData.get('date') || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: formData.get('time') || '10:00 AM',
      location: formData.get('location') || 'Main Campus',
      category: formData.get('category') || 'Governing Board',
      priority: formData.get('priority') || 'High',
      postedBy: 'Office of the School Owner',
      summary: formData.get('summary'),
      content: formData.get('content') || formData.get('summary'),
    };

    setNotices([newNotice, ...notices]);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Clean Standard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <LuBell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Executive Notices & Institutional Events</h1>
            <p className="text-xs text-gray-400">Board meetings, regulatory circulars, campus ceremonies, and institutional updates</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-sm self-start sm:self-auto"
        >
          <LuPlus className="w-4 h-4" /> Issue Executive Notice
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Circulars</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">{notices.length} Notices</p>
          <p className="text-xs text-gray-400 mt-0.5">Session 2026-27</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-100 bg-rose-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Urgent Action</span>
          <p className="text-2xl font-bold text-rose-600 mt-1">1 Board Meeting</p>
          <p className="text-xs text-rose-700 font-medium mt-0.5">Aug 28, 2026</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-primary-100 bg-primary-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider">Upcoming Events</span>
          <p className="text-2xl font-bold text-primary-600 mt-1">2 Major Events</p>
          <p className="text-xs text-primary-700 font-medium mt-0.5">Zonal Sports & PTM</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Regulatory Compliance</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">CBSE Updated</p>
          <p className="text-xs text-emerald-700 font-medium mt-0.5">Circular #2026-89</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <LuSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notices, events, or circulars..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Notice Categories' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-3">
        {filtered.map((notice) => (
          <div
            key={notice.id}
            onClick={() => setSelectedNotice(notice)}
            className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    notice.priority === 'Urgent'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : notice.priority === 'High'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-primary-50 text-primary-700 border border-primary-200'
                  }`}
                >
                  {notice.priority}
                </span>
                <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {notice.category}
                </span>
                <span className="text-[11px] text-gray-400 font-mono">
                  {notice.id} • Posted by {notice.postedBy}
                </span>
              </div>

              <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                {notice.title}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                {notice.summary}
              </p>
            </div>

            <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1 shrink-0 text-xs border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
              <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
                <LuCalendar className="w-3.5 h-3.5 text-primary-600" />
                <span>{notice.date}</span>
              </div>
              <span className="text-[11px] text-gray-400">{notice.time}</span>
              <span className="text-primary-600 font-bold text-xs mt-1 group-hover:translate-x-0.5 transition-transform hidden sm:inline-block">
                View Details →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* NOTICE DETAIL MODAL */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col animate-slide-up border border-gray-200">
            <div className="bg-white border-b border-gray-200 p-5 flex items-center justify-between">
              <div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedNotice.priority === 'Urgent'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-primary-50 text-primary-700 border border-primary-200'
                  }`}
                >
                  {selectedNotice.priority} • {selectedNotice.category}
                </span>
                <h3 className="text-base font-bold text-gray-800 mt-1">{selectedNotice.title}</h3>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs overflow-y-auto max-h-[70vh]">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1.5 text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-400">Date & Timing:</span>
                  <strong className="text-gray-800">{selectedNotice.date} ({selectedNotice.time})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Venue / Location:</span>
                  <strong className="text-gray-800">{selectedNotice.location}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Issuing Office:</span>
                  <span className="text-gray-800 font-medium">{selectedNotice.postedBy}</span>
                </div>
              </div>

              <div className="p-3 bg-white border border-gray-200 rounded-lg space-y-1.5">
                <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[10px]">Notice Brief & Action Items</h4>
                <p className="text-gray-700 leading-relaxed">{selectedNotice.content}</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end">
              <button
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NOTICE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col animate-slide-up border border-gray-200">
            <div className="bg-white border-b border-gray-200 p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-800">Issue Executive Notice</h3>
                <p className="text-xs text-gray-400">Publish notice from Owner's desk</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Notice Title *</label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Annual Trustee Budget Review 2026"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category</label>
                  <select name="category" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                    <option value="Governing Board">Governing Board</option>
                    <option value="School Events">School Events</option>
                    <option value="Regulatory & CBSE">Regulatory & CBSE</option>
                    <option value="Campus Operations">Campus Operations</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Priority</label>
                  <select name="priority" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Venue / Location</label>
                <input
                  name="location"
                  placeholder="e.g. Board Room / Main Auditorium"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Notice Summary *</label>
                <textarea
                  name="summary"
                  required
                  rows={3}
                  placeholder="Brief summary of event or executive circular..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div className="p-4 bg-gray-50 -mx-5 -mb-5 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
