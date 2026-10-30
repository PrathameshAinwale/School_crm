import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { sportsService } from '../../services/sportsService';
import {
  LuTrophy,
  LuPlus,
  LuSearch,
  LuFilter,
  LuCalendarDays,
  LuMapPin,
  LuClock,
  LuSwords,
  LuUsers,
  LuCircleCheck,
  LuX,
  LuPencil,
  LuTrash2,
  LuLoader,
  LuSave,
  LuMedal,
  LuActivity,
} from 'react-icons/lu';

export default function SportsActivitiesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'disciplines' ? 'disciplines' : 'competitions');
  const [competitions, setCompetitions] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sportFilter, setSportFilter] = useState('all');

  // Modals
  const [compModal, setCompModal] = useState(false);
  const [editComp, setEditComp] = useState(null);
  const [compForm, setCompForm] = useState({
    sport_id: '',
    title: '',
    competition_type: 'Inter-School',
    tournament_level: 'Under-17',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    event_time: '09:00',
    venue: '',
    opponent_school: '',
    status: 'Upcoming',
    result: 'Pending',
    score_summary: '',
    remarks: '',
  });

  const [resultModal, setResultModal] = useState(null);
  const [resultForm, setResultForm] = useState({
    status: 'Completed',
    result: 'Won',
    score_summary: '',
    remarks: '',
  });

  const [sportModal, setSportModal] = useState(false);
  const [sportForm, setSportForm] = useState({
    name: '',
    code: '',
    category: 'Outdoor',
    coach_name: '',
    venue: '',
    max_players: 15,
    description: '',
  });

  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [compRes, discRes] = await Promise.all([
        sportsService.getCompetitions({
          search,
          status: statusFilter,
          type: typeFilter,
          sport_id: sportFilter,
        }),
        sportsService.getDisciplines(),
      ]);

      if (compRes?.success) setCompetitions(compRes.data.competitions || []);
      if (discRes?.success) {
        setDisciplines(discRes.data.sports || []);
        if (discRes.data.sports?.length > 0 && !compForm.sport_id) {
          setCompForm((prev) => ({ ...prev, sport_id: discRes.data.sports[0].id }));
        }
      }
    } catch (err) {
      console.error('Error fetching sports data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (searchParams.get('action') === 'new_comp') {
      setCompModal(true);
    }
  }, [statusFilter, typeFilter, sportFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  // Submit Competition Form
  const handleCompSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editComp) {
        const res = await sportsService.updateCompetition(editComp.id, compForm);
        if (res.success) {
          showToast('Competition updated successfully.');
          setCompModal(false);
          setEditComp(null);
          loadData();
        }
      } else {
        const res = await sportsService.createCompetition(compForm);
        if (res.success) {
          showToast('New tournament / competition scheduled.');
          setCompModal(false);
          loadData();
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to save competition.');
    } finally {
      setSaving(false);
    }
  };

  // Submit Result Form
  const handleResultSubmit = async (e) => {
    e.preventDefault();
    if (!resultModal) return;
    setSaving(true);
    try {
      const res = await sportsService.updateCompetition(resultModal.id, resultForm);
      if (res.success) {
        showToast('Match result and final score recorded.');
        setResultModal(null);
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Failed to record result.');
    } finally {
      setSaving(false);
    }
  };

  // Submit Sport Discipline Form
  const handleSportSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await sportsService.createDiscipline(sportForm);
      if (res.success) {
        showToast(`Sports discipline "${sportForm.name}" created.`);
        setSportModal(false);
        setSportForm({
          name: '',
          code: '',
          category: 'Outdoor',
          coach_name: '',
          venue: '',
          max_players: 15,
          description: '',
        });
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Failed to add sport.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteComp = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await sportsService.deleteCompetition(id);
      showToast('Competition deleted.');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const openEditComp = (comp) => {
    setEditComp(comp);
    setCompForm({
      sport_id: comp.sport_id,
      title: comp.title,
      competition_type: comp.competition_type,
      tournament_level: comp.tournament_level,
      start_date: comp.start_date ? comp.start_date.split('T')[0] : '',
      end_date: comp.end_date ? comp.end_date.split('T')[0] : '',
      event_time: comp.event_time || '09:00',
      venue: comp.venue || '',
      opponent_school: comp.opponent_school || '',
      status: comp.status,
      result: comp.result || 'Pending',
      score_summary: comp.score_summary || '',
      remarks: comp.remarks || '',
    });
    setCompModal(true);
  };

  return (
    <div className="space-y-5 sm:space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-slide-up border border-slate-700">
          <LuCircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-base sm:text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <LuTrophy className="w-5 h-5 text-primary-600" />
            Sports Activities & Tournaments
          </h1>
          <p className="text-slate-500 text-[10px] sm:text-xs mt-0.5">
            Add sports activities, schedule tournaments, and review fixtures across disciplines
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setEditComp(null);
              setCompModal(true);
            }}
            className="px-3.5 py-2 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LuPlus className="w-3.5 h-3.5" />
            Schedule Competition
          </button>
          <button
            onClick={() => setSportModal(true)}
            className="px-3.5 py-2 rounded-lg sm:rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LuActivity className="w-3.5 h-3.5 text-primary-600" />
            Add Sport
          </button>
        </div>
      </div>

      {/* Primary Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('competitions')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'competitions'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <LuSwords className="w-4 h-4" />
          Competitions & Tournaments ({competitions.length})
        </button>
        <button
          onClick={() => setActiveTab('disciplines')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'disciplines'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <LuActivity className="w-4 h-4" />
          Sports Disciplines ({disciplines.length})
        </button>
      </div>

      {/* TAB 1: COMPETITIONS & TOURNAMENTS */}
      {activeTab === 'competitions' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[220px] relative">
              <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tournament, venue, or opponent school..."
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </form>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none"
              >
                <option value="All">All Types</option>
                <option value="Inter-School">Inter-School</option>
                <option value="Intra-School / House">Intra-School / House</option>
                <option value="District">District</option>
                <option value="State">State</option>
                <option value="National">National</option>
              </select>

              <select
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none"
              >
                <option value="all">All Sports</option>
                {disciplines.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Competitions Cards List */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 text-xs">
              <LuLoader className="w-6 h-6 animate-spin mx-auto text-primary-600 mb-2" />
              Loading sports tournaments...
            </div>
          ) : competitions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
              <LuTrophy className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No Competitions Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No sports tournaments match your criteria. Click "Schedule Competition" above to add fixtures.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {competitions.map((comp) => {
                const isUpcoming = comp.status === 'Upcoming';
                const isOngoing = comp.status === 'Ongoing';
                const isCompleted = comp.status === 'Completed';

                return (
                  <div
                    key={comp.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {comp.sport?.name}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                              {comp.competition_type}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {comp.tournament_level}
                            </span>
                          </div>
                          <h3 className="text-base font-extrabold text-slate-900 mt-1.5">{comp.title}</h3>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                            isOngoing
                              ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                              : isUpcoming
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {comp.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 truncate">
                          <LuCalendarDays className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{comp.start_date} {comp.end_date ? `to ${comp.end_date}` : ''}</span>
                        </div>
                        {comp.event_time && (
                          <div className="flex items-center gap-1.5">
                            <LuClock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{comp.event_time}</span>
                          </div>
                        )}
                        {comp.venue && (
                          <div className="flex items-center gap-1.5 col-span-2 truncate">
                            <LuMapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{comp.venue}</span>
                          </div>
                        )}
                        {comp.opponent_school && (
                          <div className="col-span-2 text-xs font-semibold text-slate-700">
                            Opponent / Opposing Teams: <span className="text-emerald-700">{comp.opponent_school}</span>
                          </div>
                        )}
                      </div>

                      {/* Result Strip if Completed or Ongoing */}
                      {(comp.result !== 'Pending' || comp.score_summary) && (
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 flex items-center gap-1">
                              <LuMedal className="w-3.5 h-3.5 text-amber-500" /> Result: {comp.result}
                            </span>
                            {comp.score_summary && (
                              <span className="font-mono font-bold text-emerald-700">{comp.score_summary}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Roster Attendance Summary Pills */}
                      <div className="flex items-center gap-2 pt-1 text-[11px]">
                        <span className="font-semibold text-slate-400">Roster:</span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold">
                          {comp.attending_count || 0} Attending
                        </span>
                        {(comp.absent_count || 0) > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold">
                            {comp.absent_count} Absent
                          </span>
                        )}
                        <span className="text-slate-400">Total: {comp.participants_count || 0}</span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                      <button
                        onClick={() => navigate(`/sports/participants?competition_id=${comp.id}`)}
                        className="px-3 py-1.5 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <LuUsers className="w-3.5 h-3.5" />
                        View Student Attendees ({comp.participants_count || 0})
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setResultModal(comp);
                            setResultForm({
                              status: comp.status,
                              result: comp.result || 'Won',
                              score_summary: comp.score_summary || '',
                              remarks: comp.remarks || '',
                            });
                          }}
                          title="Record Match Result & Score"
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                        >
                          Result
                        </button>
                        <button
                          onClick={() => openEditComp(comp)}
                          title="Edit Competition"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <LuPencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteComp(comp.id, comp.title)}
                          title="Delete Competition"
                          className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <LuTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SPORTS DISCIPLINES */}
      {activeTab === 'disciplines' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {disciplines.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {item.category}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-400">{item.code}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mt-2">{item.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{item.description || 'Institutional sports program.'}</p>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Coach in-Charge:</span>
                    <span className="font-semibold text-slate-800">{item.coach_name || 'Assigned PE Faculty'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Venue / Ground:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[150px]">{item.venue || 'Campus Field'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Squad Limit:</span>
                    <span className="font-bold text-emerald-700">{item.max_players} Athletes</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate(`/sports/participants?sport_id=${item.id}`)}
                    className="w-full py-2 rounded-xl bg-slate-50 hover:bg-primary-50 hover:text-primary-700 text-slate-700 text-xs font-bold border border-slate-200/80 transition-all flex items-center justify-center gap-1.5"
                  >
                    <LuUsers className="w-3.5 h-3.5 text-primary-600" />
                    View Enrolled Students ({item.participants_count || 0})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT COMPETITION */}
      {compModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <LuTrophy className="w-5 h-5 text-primary-600" />
                <h3 className="text-base font-bold text-slate-800">
                  {editComp ? 'Edit Competition Details' : 'Schedule New Sports Competition'}
                </h3>
              </div>
              <button
                onClick={() => setCompModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Sports Discipline <span className="text-red-500">*</span>
                </label>
                <select
                  value={compForm.sport_id}
                  onChange={(e) => setCompForm({ ...compForm, sport_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  required
                >
                  {disciplines.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Competition Title / Tournament Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={compForm.title}
                  onChange={(e) => setCompForm({ ...compForm, title: e.target.value })}
                  placeholder="e.g. Inter-School Football Trophy 2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tournament Type</label>
                  <select
                    value={compForm.competition_type}
                    onChange={(e) => setCompForm({ ...compForm, competition_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Inter-School">Inter-School</option>
                    <option value="Intra-School / House">Intra-School / House</option>
                    <option value="District">District</option>
                    <option value="State">State</option>
                    <option value="National">National</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tournament Level</label>
                  <select
                    value={compForm.tournament_level}
                    onChange={(e) => setCompForm({ ...compForm, tournament_level: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Under-14">Under-14 (Sub-Junior)</option>
                    <option value="Under-17">Under-17 (Junior)</option>
                    <option value="Under-19">Under-19 (Senior)</option>
                    <option value="Open">Open</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={compForm.start_date}
                    onChange={(e) => setCompForm({ ...compForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={compForm.end_date}
                    onChange={(e) => setCompForm({ ...compForm, end_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Match Time</label>
                  <input
                    type="time"
                    value={compForm.event_time}
                    onChange={(e) => setCompForm({ ...compForm, event_time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Venue / Ground</label>
                  <input
                    type="text"
                    value={compForm.venue}
                    onChange={(e) => setCompForm({ ...compForm, venue: e.target.value })}
                    placeholder="e.g. Main Turf Field"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Opponent School / Teams</label>
                  <input
                    type="text"
                    value={compForm.opponent_school}
                    onChange={(e) => setCompForm({ ...compForm, opponent_school: e.target.value })}
                    placeholder="e.g. St. Xavier International"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={compForm.status}
                  onChange={(e) => setCompForm({ ...compForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tournament Rules & Instructions</label>
                <textarea
                  rows={2}
                  value={compForm.remarks}
                  onChange={(e) => setCompForm({ ...compForm, remarks: e.target.value })}
                  placeholder="Uniform guidelines, reporting time, medical requirements..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCompModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold flex items-center gap-1.5 shadow-md shadow-primary-500/20 cursor-pointer disabled:opacity-60"
                >
                  {saving ? <LuLoader className="w-3.5 h-3.5 animate-spin" /> : <LuSave className="w-3.5 h-3.5" />}
                  {editComp ? 'Update Competition' : 'Schedule Tournament'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD RESULT & SCORE */}
      {resultModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <LuMedal className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-800">Record Match Result</h3>
              </div>
              <button onClick={() => setResultModal(null)} className="text-slate-400 hover:text-slate-700">
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Recording final outcome for: <strong className="text-slate-800">{resultModal.title}</strong>
            </p>

            <form onSubmit={handleResultSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Match / Tournament Status</label>
                <select
                  value={resultForm.status}
                  onChange={(e) => setResultForm({ ...resultForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Completed">Completed</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Outcome</label>
                <select
                  value={resultForm.result}
                  onChange={(e) => setResultForm({ ...resultForm, result: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Won">Won (1st Place / Gold Medal)</option>
                  <option value="Runner-up">Runner-up (2nd Place / Silver Medal)</option>
                  <option value="3rd Place">3rd Place (Bronze Medal)</option>
                  <option value="Semi-Finalist">Semi-Finalist</option>
                  <option value="Participated">Participation Certificate</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Final Scoreline / Summary</label>
                <input
                  type="text"
                  value={resultForm.score_summary}
                  onChange={(e) => setResultForm({ ...resultForm, score_summary: e.target.value })}
                  placeholder="e.g. DPS 3 - 1 St. Xavier or 52 - 48"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Coach Notes</label>
                <textarea
                  rows={2}
                  value={resultForm.remarks}
                  onChange={(e) => setResultForm({ ...resultForm, remarks: e.target.value })}
                  placeholder="Match highlights, player performance..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResultModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold flex items-center gap-1.5"
                >
                  {saving ? <LuLoader className="w-3.5 h-3.5 animate-spin" /> : <LuSave className="w-3.5 h-3.5" />}
                  Save Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD SPORTS DISCIPLINE */}
      {sportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <LuActivity className="w-5 h-5 text-primary-600" />
                <h3 className="text-base font-bold text-slate-800">Add New Sports Discipline</h3>
              </div>
              <button onClick={() => setSportModal(false)} className="text-slate-400 hover:text-slate-700">
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSportSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Sport Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sportForm.name}
                  onChange={(e) => setSportForm({ ...sportForm, name: e.target.value })}
                  placeholder="e.g. Volleyball, Archery, Swimming"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sport Code *</label>
                  <input
                    type="text"
                    value={sportForm.code}
                    onChange={(e) => setSportForm({ ...sportForm, code: e.target.value.toUpperCase() })}
                    placeholder="SPT-VLB"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={sportForm.category}
                    onChange={(e) => setSportForm({ ...sportForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Outdoor">Outdoor</option>
                    <option value="Indoor">Indoor</option>
                    <option value="Track & Field">Track & Field</option>
                    <option value="Aquatic">Aquatic</option>
                    <option value="Martial Arts">Martial Arts</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Coach in-Charge</label>
                  <input
                    type="text"
                    value={sportForm.coach_name}
                    onChange={(e) => setSportForm({ ...sportForm, coach_name: e.target.value })}
                    placeholder="e.g. Coach Manoj"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Squad Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={sportForm.max_players}
                    onChange={(e) => setSportForm({ ...sportForm, max_players: parseInt(e.target.value) || 15 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Practice Venue / Ground</label>
                <input
                  type="text"
                  value={sportForm.venue}
                  onChange={(e) => setSportForm({ ...sportForm, venue: e.target.value })}
                  placeholder="e.g. Court 2 / Gymnasium"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={sportForm.description}
                  onChange={(e) => setSportForm({ ...sportForm, description: e.target.value })}
                  placeholder="Program overview..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSportModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold flex items-center gap-1.5"
                >
                  {saving ? <LuLoader className="w-3.5 h-3.5 animate-spin" /> : <LuSave className="w-3.5 h-3.5" />}
                  Create Sport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
