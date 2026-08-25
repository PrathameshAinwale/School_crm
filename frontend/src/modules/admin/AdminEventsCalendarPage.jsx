import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  LuCalendarDays,
  LuPlus,
  LuSearch,
  LuFilter,
  LuMapPin,
  LuClock,
  LuUsers,
  LuSparkles,
  LuX,
  LuCalendar,
  LuMegaphone,
  LuTrash2,
  LuPencil,
  LuLoader,
  LuCheck,
  LuCircleCheck,
  LuDownload,
  LuArrowLeft,
  LuArrowRight,
  LuLayers,
} from 'react-icons/lu';

const DEFAULT_EVENT_TYPES = [
  'Holiday',
  'Sports',
  'Exam',
  'PTM',
  'Cultural',
  'Workshop',
  'Exhibition',
  'Annual Day',
  'Competition',
  'Celebration',
  'Other',
];

const categoryBadgeStyles = {
  Holiday: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Sports: 'bg-orange-50 text-orange-700 border-orange-200',
  Exam: 'bg-rose-50 text-rose-700 border-rose-200',
  PTM: 'bg-purple-50 text-purple-700 border-purple-200',
  Cultural: 'bg-pink-50 text-pink-700 border-pink-200',
  Workshop: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Exhibition: 'bg-blue-50 text-blue-700 border-blue-200',
  'Annual Day': 'bg-amber-50 text-amber-700 border-amber-200',
  Competition: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Celebration: 'bg-teal-50 text-teal-700 border-teal-200',
  Other: 'bg-slate-50 text-slate-700 border-slate-200',
};

export default function AdminEventsCalendarPage() {
  const [events, setEvents] = useState([]);
  const [classList, setClassList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteTargetEvent, setDeleteTargetEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    event_type: 'Holiday',
    target_type: 'all', // 'all' | 'specific'
    target_classes: [],
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    start_time: '09:00 AM',
    end_time: '01:00 PM',
    venue: 'School Main Campus',
    coordinator: 'Principal Office',
    speaker: '',
    description: '',
  });

  const loadEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (typeFilter !== 'ALL') params.type = typeFilter;
      const res = await adminService.getAdminEvents(params);
      if (res && res.success) {
        const list = Array.isArray(res.data) ? res.data : (res.events || []);
        setEvents(list);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAcademicClasses = async () => {
    try {
      const res = await adminService.getClasses();
      if (res && res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data.classes || []);
        setClassList(list);
      }
    } catch (err) {
      console.error('Failed to load classes:', err);
    }
  };

  useEffect(() => {
    loadEvents();
    loadAcademicClasses();
  }, [typeFilter]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleClassToggle = (className) => {
    setFormData((prev) => {
      const exists = prev.target_classes.includes(className);
      const updated = exists
        ? prev.target_classes.filter((c) => c !== className)
        : [...prev.target_classes, className];
      return { ...prev, target_classes: updated };
    });
  };

  const handleSelectAllClasses = () => {
    const allNames = classList.map((c) => c.name || c.label);
    setFormData((prev) => ({ ...prev, target_classes: allNames }));
  };

  const handleClearClasses = () => {
    setFormData((prev) => ({ ...prev, target_classes: [] }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Please enter an event title.');
      return;
    }
    if (formData.target_type === 'specific' && formData.target_classes.length === 0) {
      showToast('Please select at least one class, or choose "All Classes".');
      return;
    }

    setSubmitting(true);
    try {
      const targetClasses = formData.target_type === 'all' ? ['All'] : formData.target_classes;
      const payload = {
        title: formData.title,
        event_type: formData.event_type,
        category: formData.event_type,
        start_date: formData.start_date,
        end_date: formData.end_date || formData.start_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        venue: formData.venue,
        target_classes: targetClasses,
        audience: formData.target_type === 'all' ? 'All Classes & Faculty' : targetClasses.join(', '),
        coordinator: formData.coordinator,
        speaker: formData.speaker,
        description: formData.description,
      };

      const res = await adminService.createAdminEvent(payload);
      if (res && res.success) {
        setShowAddModal(false);
        loadEvents();
        showToast('Event published successfully & students/teachers notified!');
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to create event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingEvent) return;
    setSubmitting(true);
    try {
      const targetClasses = formData.target_type === 'all' ? ['All'] : formData.target_classes;
      const payload = {
        title: formData.title,
        event_type: formData.event_type,
        category: formData.event_type,
        start_date: formData.start_date,
        end_date: formData.end_date || formData.start_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        venue: formData.venue,
        target_classes: targetClasses,
        audience: formData.target_type === 'all' ? 'All Classes & Faculty' : targetClasses.join(', '),
        coordinator: formData.coordinator,
        speaker: formData.speaker,
        description: formData.description,
      };

      const res = await adminService.updateAdminEvent(editingEvent.id, payload);
      if (res && res.success) {
        setEditingEvent(null);
        loadEvents();
        showToast('Calendar event updated successfully!');
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to update event.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (evt) => {
    const isAll = !evt.target_classes || evt.target_classes.includes('All') || evt.audience === 'All Classes & Faculty';
    setEditingEvent(evt);
    setFormData({
      title: evt.title || '',
      event_type: evt.type || evt.category || 'Holiday',
      target_type: isAll ? 'all' : 'specific',
      target_classes: isAll ? [] : (evt.target_classes || []),
      start_date: evt.startDate || evt.start_date || new Date().toISOString().split('T')[0],
      end_date: evt.endDate || evt.end_date || evt.startDate || new Date().toISOString().split('T')[0],
      start_time: evt.start_time || '09:00 AM',
      end_time: evt.end_time || '01:00 PM',
      venue: evt.venue || 'School Campus',
      coordinator: evt.coordinator || 'School Admin',
      speaker: evt.speaker || '',
      description: evt.desc || evt.description || '',
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetEvent) return;
    try {
      await adminService.deleteAdminEvent(deleteTargetEvent.id);
      setDeleteTargetEvent(null);
      loadEvents();
      showToast('Event removed from calendar.');
    } catch {
      showToast('Failed to delete event.');
    }
  };

  // Filter events based on search & class selection
  const filteredEvents = events.filter((evt) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (evt.title || '').toLowerCase().includes(q);
      const matchDesc = (evt.desc || evt.description || '').toLowerCase().includes(q);
      const matchVenue = (evt.venue || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchVenue) return false;
    }

    if (classFilter !== 'ALL') {
      const classes = evt.target_classes || [];
      const hasAll = classes.includes('All') || classes.length === 0;
      const hasClass = classes.includes(classFilter);
      if (!hasAll && !hasClass) return false;
    }

    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-scale-up border border-slate-700">
          <LuCircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-primary-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <LuCalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">Admin School Calendar & Events</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Publish holidays, sports days, board exams & PTMs with class-targeted student notifications
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => {
              setEditingEvent(null);
              setFormData({
                title: '',
                event_type: 'Holiday',
                target_type: 'all',
                target_classes: [],
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date().toISOString().split('T')[0],
                start_time: '09:00 AM',
                end_time: '01:00 PM',
                venue: 'School Main Campus',
                coordinator: 'Principal Office',
                speaker: '',
                description: '',
              });
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <LuPlus className="w-4 h-4" /> Add New Event
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="relative flex-1">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search events by title, description, or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Class Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <LuLayers className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary-500 cursor-pointer"
            >
              <option value="ALL">All Classes (Target)</option>
              {classList.map((cls) => (
                <option key={cls.name || cls.id} value={cls.name}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Event Category Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <LuFilter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary-500 cursor-pointer"
            >
              <option value="ALL">All Event Types</option>
              {DEFAULT_EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* CONTENT: EVENT LIST VIEW */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 flex flex-col items-center justify-center min-h-[250px]">
            <LuLoader className="w-8 h-8 text-primary-600 animate-spin mb-3" />
            <p className="text-xs text-slate-500 font-medium">Loading school calendar events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
            <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <LuCalendarDays className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Events Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              No calendar events match the current search, type, or class filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.map((evt) => {
              const startDateDisplay = evt.startDate || evt.start_date;
              const endDateDisplay = evt.endDate || evt.end_date;
              const isDateRange = endDateDisplay && endDateDisplay !== startDateDisplay;
              const formattedDate = startDateDisplay
                ? isDateRange
                  ? `${new Date(startDateDisplay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(endDateDisplay).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                  : new Date(startDateDisplay).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Date TBA';

              const formattedTime = (evt.startTime || evt.start_time)
                ? (evt.endTime || evt.end_time)
                  ? `${evt.startTime || evt.start_time} - ${evt.endTime || evt.end_time}`
                  : `${evt.startTime || evt.start_time}`
                : null;

              const targetDisplay = (evt.target_type === 'specific' && evt.target_classes && evt.target_classes.length > 0)
                ? (Array.isArray(evt.target_classes) ? evt.target_classes.join(', ') : evt.target_classes)
                : 'All Classes (School-wide)';

              return (
                <div
                  key={evt.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:shadow-md transition-all flex flex-col justify-between group relative"
                >
                  <div className="space-y-3">
                    {/* Top Row: Type & Dates & Actions */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            categoryBadgeStyles[evt.type] || categoryBadgeStyles.Other
                          }`}
                        >
                          {evt.type || 'Event'}
                        </span>

                        <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-md border border-primary-100 flex items-center gap-1 font-mono">
                          <LuCalendar className="w-3 h-3" />
                          <span>{formattedDate}</span>
                        </span>
                      </div>

                      {/* Card Action Icons */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(evt)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-slate-50 transition-colors cursor-pointer"
                          title="Edit Event"
                        >
                          <LuPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetEvent(evt)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Event"
                        >
                          <LuTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                      {evt.title}
                    </h3>

                    {/* Target Audience Badge */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="text-[11px] text-slate-400 font-medium">Target Audience:</span>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        evt.target_type === 'specific'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {targetDisplay}
                      </span>
                    </div>

                    {/* Description */}
                    {evt.description && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                        {evt.description}
                      </p>
                    )}
                  </div>

                  {/* Metadata Row */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-3 flex-wrap">
                      {formattedTime && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-600">
                          <LuClock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formattedTime}</span>
                        </div>
                      )}
                      {evt.venue && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-600">
                          <LuMapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{evt.venue}</span>
                        </div>
                      )}
                    </div>

                    {evt.coordinator && (
                      <span className="text-[10px] text-slate-400 font-medium ml-auto">
                        Coord: {evt.coordinator}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Event Modal */}
      {(showAddModal || editingEvent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full my-6 overflow-hidden animate-scale-up">
            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <LuCalendarDays className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">{editingEvent ? 'Edit Calendar Event' : 'Publish New Calendar Event'}</h3>
                  <p className="text-primary-100 text-xs">Configure date range, timing, target classes, and instant notifications</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingEvent(null);
                }}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingEvent ? handleEditSubmit : handleAddSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Event Title / Headline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Annual Inter-School Sports Meet 2026"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Event Type / Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 cursor-pointer font-semibold"
                  >
                    {DEFAULT_EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target Audience & Class Selector */}
              <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LuUsers className="w-4 h-4 text-purple-600" />
                    <label className="text-xs font-bold text-purple-950">Target Classes & Notification Audience</label>
                  </div>
                  <span className="text-[10px] text-purple-700 bg-white px-2 py-0.5 rounded-full border border-purple-200 font-semibold">
                    Smart Push Notified
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, target_type: 'all' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left ${
                      formData.target_type === 'all'
                        ? 'bg-white border-purple-600 ring-2 ring-purple-500/20 text-purple-950 shadow-xs'
                        : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    All Classes (School-wide)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, target_type: 'specific' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left ${
                      formData.target_type === 'specific'
                        ? 'bg-white border-purple-600 ring-2 ring-purple-500/20 text-purple-950 shadow-xs'
                        : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    Specific Class(es) Only
                  </button>
                </div>

                {formData.target_type === 'specific' && (
                  <div className="space-y-2 pt-2 border-t border-purple-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-purple-900 font-bold">Select Classes to include:</span>
                      <div className="flex gap-2 text-[10px]">
                        <button type="button" onClick={handleSelectAllClasses} className="text-purple-700 hover:underline font-bold">
                          Select All
                        </button>
                        <button type="button" onClick={handleClearClasses} className="text-slate-500 hover:underline">
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-32 overflow-y-auto p-2 bg-white rounded-xl border border-purple-200">
                      {classList.map((cls) => {
                        const name = cls.name || cls.label;
                        const isChecked = formData.target_classes.includes(name);
                        return (
                          <label
                            key={name}
                            className={`flex items-center gap-2 p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-purple-50 border-purple-300 text-purple-900 font-bold'
                                : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleClassToggle(name)}
                              className="w-3.5 h-3.5 text-purple-600 rounded border-slate-300 focus:ring-0 cursor-pointer"
                            />
                            <span className="truncate">{name}</span>
                          </label>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-purple-800">
                      * Only students in the selected classes and their assigned faculty will receive notifications and view this event.
                    </p>
                  </div>
                )}
              </div>

              {/* Date Selector (From & To) */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <LuCalendar className="w-4 h-4 text-blue-600" />
                  <label className="text-xs font-bold text-blue-950">Date Range (From & To)</label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-blue-900 mb-1">
                      From Date (Start Date) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value, end_date: formData.end_date < e.target.value ? e.target.value : formData.end_date })}
                      className="w-full px-3.5 py-2 bg-white border border-blue-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-blue-900 mb-1">
                      To Date (End Date)
                    </label>
                    <input
                      type="date"
                      min={formData.start_date}
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white border border-blue-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Time Selector (Starts At & Ends At) */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <LuClock className="w-4 h-4 text-emerald-600" />
                  <label className="text-xs font-bold text-emerald-950">Event Timing (Starts At & Ends At)</label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                      Starts At (Start Time)
                    </label>
                    <input
                      type="text"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      placeholder="e.g. 09:00 AM"
                      className="w-full px-3.5 py-2 bg-white border border-emerald-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                      Ends At (End Time)
                    </label>
                    <input
                      type="text"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      placeholder="e.g. 01:30 PM (or Full Day)"
                      className="w-full px-3.5 py-2 bg-white border border-emerald-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Venue / Location</label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g. Main Auditorium & Sports Arena"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Coordinator / In-Charge</label>
                  <input
                    type="text"
                    value={formData.coordinator}
                    onChange={(e) => setFormData({ ...formData, coordinator: e.target.value })}
                    placeholder="e.g. Sports Dept / Head of Academics"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Event Description & Agenda</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide comprehensive details of the event schedule, dress code, instructions for parents and students..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingEvent(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuCheck className="w-4 h-4" />}
                  {submitting ? 'Publishing...' : editingEvent ? 'Update Event' : 'Publish & Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTargetEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center animate-scale-up">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LuTrash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Delete Calendar Event?</h3>
            <p className="text-xs text-slate-500 mb-6">
              Are you sure you want to remove <strong>{deleteTargetEvent.title}</strong> from the school calendar?
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setDeleteTargetEvent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
