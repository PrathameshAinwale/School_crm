import React, { useState, useEffect } from 'react';
import { sportsService } from '../../services/sportsService';
import {
  LuClock,
  LuPlus,
  LuSearch,
  LuFilter,
  LuCalendarDays,
  LuMapPin,
  LuUsers,
  LuCircleCheck,
  LuX,
  LuPencil,
  LuTrash2,
  LuLoader,
  LuSave,
  LuSwords,
  LuSparkles,
} from 'react-icons/lu';

export default function SportsSchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [dayFilter, setDayFilter] = useState('all');
  const [sportFilter, setSportFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedId, setSelectedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [formData, setFormData] = useState({
    sport_id: '',
    facility_id: '',
    squad_name: '',
    coach_name: '',
    day_of_week: 'Mon/Wed/Fri',
    start_time: '06:30',
    end_time: '07:45',
    session_type: 'Morning Practice',
    target_grades: 'Grades 7 - 10',
    capacity: 25,
    status: 'Active',
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [schedRes, discRes, facRes] = await Promise.all([
        sportsService.getSchedules({
          day: dayFilter,
          sport_id: sportFilter,
          search,
        }),
        sportsService.getDisciplines(),
        sportsService.getFacilities(),
      ]);

      if (schedRes?.success) setSchedules(schedRes.data?.schedules || []);
      if (discRes?.success) setDisciplines(discRes.data || []);
      if (facRes?.success) setFacilities(facRes.data?.facilities || []);
    } catch (err) {
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dayFilter, sportFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenCreate = () => {
    setFormData({
      sport_id: disciplines[0]?.id || '',
      facility_id: facilities[0]?.id || '',
      squad_name: '',
      coach_name: disciplines[0]?.coach_name || '',
      day_of_week: 'Mon/Wed/Fri',
      start_time: '06:30',
      end_time: '07:45',
      session_type: 'Morning Practice',
      target_grades: 'Grades 7 - 10',
      capacity: 25,
      status: 'Active',
    });
    setModalMode('create');
    setSelectedId(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (sched) => {
    setFormData({
      sport_id: sched.sport_id || '',
      facility_id: sched.facility_id || '',
      squad_name: sched.squad_name || '',
      coach_name: sched.coach_name || '',
      day_of_week: sched.day_of_week || 'Mon/Wed/Fri',
      start_time: sched.start_time?.substring(0, 5) || '06:30',
      end_time: sched.end_time?.substring(0, 5) || '07:45',
      session_type: sched.session_type || 'Morning Practice',
      target_grades: sched.target_grades || '',
      capacity: sched.capacity || 25,
      status: sched.status || 'Active',
    });
    setSelectedId(sched.id);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        const res = await sportsService.createSchedule(formData);
        if (res?.success) {
          showToast('New practice schedule created successfully!');
          setModalOpen(false);
          loadData();
        }
      } else {
        const res = await sportsService.updateSchedule(selectedId, formData);
        if (res?.success) {
          showToast('Practice schedule updated!');
          setModalOpen(false);
          loadData();
        }
      }
    } catch (err) {
      alert(err.message || 'Error saving training schedule.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel and remove this training schedule?')) return;
    try {
      const res = await sportsService.deleteSchedule(id);
      if (res?.success) {
        showToast('Training schedule removed.');
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Error deleting schedule.');
    }
  };

  const activeCount = schedules.filter((s) => s.status === 'Active').length;
  const morningCount = schedules.filter((s) => s.session_type?.toLowerCase().includes('morning') || s.start_time < '12:00').length;
  const eveningCount = schedules.filter((s) => s.session_type?.toLowerCase().includes('evening') || s.start_time >= '12:00').length;

  return (
    <div className="space-y-5 sm:space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-slide-up border border-slate-700">
          <LuCircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-base sm:text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <LuClock className="w-5 h-5 text-primary-600" />
            Training & Practice Schedules
          </h1>
          <p className="text-slate-500 text-[10px] sm:text-xs mt-0.5">
            Manage weekly training sessions, team practices, coaching drills, and ground allotments
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-3.5 py-2 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
        >
          <LuPlus className="w-3.5 h-3.5" />
          Schedule Training Session
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Practice Batches</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{schedules.length}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
            {activeCount} currently active
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <span className="text-xs font-semibold text-amber-700">Morning Drills</span>
          <div className="text-2xl font-extrabold text-amber-900 mt-1">{morningCount}</div>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 inline-block">
            6:00 AM – 8:00 AM batches
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-xs">
          <span className="text-xs font-semibold text-blue-700">Evening Practices</span>
          <div className="text-2xl font-extrabold text-blue-900 mt-1">{eveningCount}</div>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 inline-block">
            After-school sessions
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-xs font-semibold text-emerald-700">Available Grounds</span>
          <div className="text-2xl font-extrabold text-emerald-900 mt-1">{facilities.length}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
            Allotted courts & fields
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[220px] relative">
          <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by squad name, coach, or session type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Day of Week */}
          <select
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="all">All Days</option>
            <option value="Daily">Daily</option>
            <option value="Mon/Wed/Fri">Mon / Wed / Fri</option>
            <option value="Tue/Thu/Sat">Tue / Thu / Sat</option>
            <option value="Saturday">Saturday Specials</option>
          </select>

          {/* Sport Filter */}
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="all">All Disciplines</option>
            {disciplines.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Schedules Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <LuLoader className="w-6 h-6 animate-spin mx-auto text-primary-600 mb-2" />
          <p className="text-xs">Loading training schedules...</p>
        </div>
      ) : schedules.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <LuClock className="w-12 h-12 stroke-[1.2] mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-600">No practice sessions found</p>
          <p className="text-xs text-slate-400 mt-1">Schedule a new training batch to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map((sched) => (
            <div
              key={sched.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary-50 text-primary-700 border border-primary-200/60">
                    <LuSwords className="w-3 h-3 text-primary-600" />
                    {sched.sport?.name || 'Sports Squad'}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      sched.status === 'Active'
                        ? 'bg-teal-50 text-teal-700 border border-teal-200/60'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {sched.status}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-base mt-2.5 group-hover:text-primary-700 transition-colors">
                  {sched.squad_name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700">Coach:</span> {sched.coach_name}
                </p>

                <div className="mt-4 space-y-2 bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <LuCalendarDays className="w-3.5 h-3.5 text-emerald-600" /> Days
                    </span>
                    <span className="font-bold text-slate-800">{sched.day_of_week}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <LuClock className="w-3.5 h-3.5 text-blue-600" /> Time
                    </span>
                    <span className="font-bold text-slate-800">
                      {sched.start_time?.substring(0, 5)} – {sched.end_time?.substring(0, 5)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <LuMapPin className="w-3.5 h-3.5 text-rose-500" /> Facility
                    </span>
                    <span className="font-bold text-slate-800 truncate max-w-[170px]" title={sched.facility?.name}>
                      {sched.facility?.name || 'Campus Grounds'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200/50">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <LuUsers className="w-3.5 h-3.5 text-purple-600" /> Batch Limit
                    </span>
                    <span className="font-bold text-slate-800">
                      {sched.capacity ? `${sched.capacity} Athletes` : 'Open'} ({sched.target_grades || 'All Grades'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400">
                  {sched.session_type}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(sched)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer"
                    title="Edit session"
                  >
                    <LuPencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(sched.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                    title="Remove schedule"
                  >
                    <LuTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <LuClock className="w-5 h-5 text-primary-600" />
                {modalMode === 'create' ? 'Schedule Training Session' : 'Edit Practice Session'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Squad / Team Batch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Under-17 Senior Boys Football Squad"
                  value={formData.squad_name}
                  onChange={(e) => setFormData({ ...formData, squad_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Sports Discipline *</label>
                  <select
                    required
                    value={formData.sport_id}
                    onChange={(e) => {
                      const sp = disciplines.find((d) => d.id === parseInt(e.target.value));
                      setFormData({
                        ...formData,
                        sport_id: e.target.value,
                        coach_name: sp?.coach_name || formData.coach_name,
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="">Select Sport</option>
                    {disciplines.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Assigned Ground / Facility</label>
                  <select
                    value={formData.facility_id}
                    onChange={(e) => setFormData({ ...formData, facility_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="">Select Facility</option>
                    {facilities.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Assigned Coach / Trainer *</label>
                  <input
                    type="text"
                    required
                    placeholder="Coach name"
                    value={formData.coach_name}
                    onChange={(e) => setFormData({ ...formData, coach_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block mb-1">Days of Week *</label>
                  <select
                    value={formData.day_of_week}
                    onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Mon/Wed/Fri">Mon / Wed / Fri</option>
                    <option value="Tue/Thu/Sat">Tue / Thu / Sat</option>
                    <option value="Daily">Daily</option>
                    <option value="Saturday">Saturday Specials</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block mb-1">End Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1">Session Type</label>
                  <select
                    value={formData.session_type}
                    onChange={(e) => setFormData({ ...formData, session_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Morning Practice">Morning Practice</option>
                    <option value="Evening Drill">Evening Drill</option>
                    <option value="Conditioning">Conditioning</option>
                    <option value="Tactical Briefing">Tactical Briefing</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Target Grades</label>
                  <input
                    type="text"
                    placeholder="Grades 7 - 10"
                    value={formData.target_grades}
                    onChange={(e) => setFormData({ ...formData, target_grades: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block mb-1">Athlete Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 25 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="Active">Active</option>
                  <option value="Paused">Paused (Exams/Holidays)</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-all cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold shadow-md shadow-primary-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuSave className="w-4 h-4" />}
                  {modalMode === 'create' ? 'Save Schedule' : 'Update Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
