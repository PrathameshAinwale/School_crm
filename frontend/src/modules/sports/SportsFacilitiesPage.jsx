import React, { useState, useEffect } from 'react';
import { sportsService } from '../../services/sportsService';
import {
  LuMapPin,
  LuPlus,
  LuSearch,
  LuFilter,
  LuCircleCheck,
  LuCircleAlert,
  LuX,
  LuPencil,
  LuTrash2,
  LuLoader,
  LuSave,
  LuUsers,
  LuSun,
  LuSparkles,
} from 'react-icons/lu';

export default function SportsFacilitiesPage() {
  const [facilities, setFacilities] = useState([]);
  const [summary, setSummary] = useState({ total: 0, available: 0, maintenance: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedId, setSelectedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    facility_type: 'Ground',
    capacity: 200,
    surface_type: 'Synthetic Turf',
    floodlights: true,
    maintenance_status: 'Available',
    location: '',
    rules_notes: '',
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const loadFacilities = async () => {
    setLoading(true);
    try {
      const res = await sportsService.getFacilities({
        type: typeFilter,
        status: statusFilter,
        search,
      });

      if (res?.success) {
        setFacilities(res.data?.facilities || []);
        if (res.data?.summary) setSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Error fetching facilities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacilities();
  }, [typeFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadFacilities();
  };

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      facility_type: 'Ground',
      capacity: 200,
      surface_type: 'Synthetic Turf',
      floodlights: true,
      maintenance_status: 'Available',
      location: '',
      rules_notes: '',
    });
    setModalMode('create');
    setSelectedId(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (fac) => {
    setFormData({
      name: fac.name || '',
      facility_type: fac.facility_type || 'Ground',
      capacity: fac.capacity || 200,
      surface_type: fac.surface_type || 'Synthetic Turf',
      floodlights: !!fac.floodlights,
      maintenance_status: fac.maintenance_status || 'Available',
      location: fac.location || '',
      rules_notes: fac.rules_notes || '',
    });
    setSelectedId(fac.id);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        const res = await sportsService.createFacility(formData);
        if (res?.success) {
          showToast('Facility added successfully!');
          setModalOpen(false);
          loadFacilities();
        }
      } else {
        const res = await sportsService.updateFacility(selectedId, formData);
        if (res?.success) {
          showToast('Facility details updated!');
          setModalOpen(false);
          loadFacilities();
        }
      }
    } catch (err) {
      alert(err.message || 'Error saving facility.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sports facility?')) return;
    try {
      const res = await sportsService.deleteFacility(id);
      if (res?.success) {
        showToast('Facility removed.');
        loadFacilities();
      }
    } catch (err) {
      alert(err.message || 'Error deleting facility.');
    }
  };

  const floodlightCount = facilities.filter((f) => f.floodlights).length;

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
            <LuMapPin className="w-5 h-5 text-primary-600" />
            Sports Grounds & Facilities
          </h1>
          <p className="text-slate-500 text-[10px] sm:text-xs mt-0.5">
            Oversee school stadiums, athletic tracks, tennis courts, and track maintenance readiness
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-3.5 py-2 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
        >
          <LuPlus className="w-3.5 h-3.5" />
          Add Sports Facility
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Sports Facilities</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{summary.total || facilities.length}</div>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">Fields, courts & arenas</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-xs font-semibold text-emerald-700">Available / Open</span>
          <div className="text-2xl font-extrabold text-emerald-900 mt-1">{summary.available}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
            Ready for practice & games
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <span className="text-xs font-semibold text-amber-700">Under Maintenance</span>
          <div className="text-2xl font-extrabold text-amber-900 mt-1">{summary.maintenance}</div>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 inline-block">
            Scheduled repairs / turf resting
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-teal-200 bg-teal-50/20 shadow-xs">
          <span className="text-xs font-semibold text-teal-700">Floodlit Facilities</span>
          <div className="text-2xl font-extrabold text-teal-900 mt-1">{floodlightCount}</div>
          <span className="text-[11px] text-teal-600 font-semibold mt-1 inline-block">
            Evening match enabled
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[220px] relative">
          <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by facility name, surface, or campus location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Facility Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="all">All Types</option>
            <option value="Ground">Grounds & Turfs</option>
            <option value="Court">Courts</option>
            <option value="Arena">Indoor Arenas</option>
            <option value="Track">Tracks</option>
            <option value="Pool">Pools</option>
          </select>

          {/* Maintenance Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="all">All Statuses</option>
            <option value="Available">Available</option>
            <option value="In Use">In Use</option>
            <option value="Scheduled Maintenance">Scheduled Maintenance</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Facilities Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <LuLoader className="w-6 h-6 animate-spin mx-auto text-primary-600 mb-2" />
          <p className="text-xs">Loading sports facilities...</p>
        </div>
      ) : facilities.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <LuMapPin className="w-12 h-12 stroke-[1.2] mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-600">No sports facilities found</p>
          <p className="text-xs text-slate-400 mt-1">Add your school's grounds and courts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {facilities.map((fac) => {
            const isAvail = fac.maintenance_status === 'Available';
            const isMaint = fac.maintenance_status === 'Scheduled Maintenance';

            return (
              <div
                key={fac.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                      {fac.facility_type}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isAvail
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : isMaint
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isAvail ? 'bg-emerald-500' : isMaint ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                      />
                      {fac.maintenance_status}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base mt-2.5 group-hover:text-primary-700 transition-colors">
                    {fac.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
                    <LuMapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {fac.location || 'Campus Sports Complex'}
                  </p>

                  <div className="mt-4 space-y-2 bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-500 font-medium">Surface</span>
                      <span className="font-bold text-slate-800">{fac.surface_type || 'Natural Grass'}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-500 font-medium">Spectator Capacity</span>
                      <span className="font-bold text-slate-800">{fac.capacity ? `${fac.capacity} people` : '-'}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-500 font-medium">Floodlights</span>
                      <span
                        className={`font-bold flex items-center gap-1 ${
                          fac.floodlights ? 'text-amber-600' : 'text-slate-400'
                        }`}
                      >
                        <LuSun className="w-3 h-3" />
                        {fac.floodlights ? 'Enabled (Day/Night)' : 'No Floodlights'}
                      </span>
                    </div>

                    {fac.rules_notes && (
                      <p className="pt-2 border-t border-slate-200/50 text-[11px] text-slate-500 italic line-clamp-2">
                        "{fac.rules_notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">
                    {fac.schedules_count || 0} active training batches
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(fac)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer"
                      title="Edit facility"
                    >
                      <LuPencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(fac.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                      title="Delete facility"
                    >
                      <LuTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Facility Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <LuMapPin className="w-5 h-5 text-primary-600" />
                {modalMode === 'create' ? 'Add Sports Facility' : 'Edit Facility Details'}
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
                <label className="block mb-1">Facility Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Synthetic Basketball Court A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Facility Type *</label>
                  <select
                    value={formData.facility_type}
                    onChange={(e) => setFormData({ ...formData, facility_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Ground">Ground</option>
                    <option value="Court">Court</option>
                    <option value="Arena">Indoor Arena</option>
                    <option value="Track">Athletic Track</option>
                    <option value="Pool">Pool</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Surface Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Synthetic Acrylic, Maple Wood"
                    value={formData.surface_type}
                    onChange={(e) => setFormData({ ...formData, surface_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="250"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block mb-1">Maintenance Status *</label>
                  <select
                    value={formData.maintenance_status}
                    onChange={(e) => setFormData({ ...formData, maintenance_status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Available">Available</option>
                    <option value="In Use">In Use</option>
                    <option value="Scheduled Maintenance">Scheduled Maintenance</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1">Campus Location</label>
                <input
                  type="text"
                  placeholder="e.g. East Campus Sports Complex, Zone B"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="floodlights"
                  checked={formData.floodlights}
                  onChange={(e) => setFormData({ ...formData, floodlights: e.target.checked })}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
                />
                <label htmlFor="floodlights" className="text-slate-700 cursor-pointer">
                  Equipped with Night Floodlights
                </label>
              </div>

              <div>
                <label className="block mb-1">Rules & Ground Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Non-marking shoes required, maximum 90 minutes per batch..."
                  value={formData.rules_notes}
                  onChange={(e) => setFormData({ ...formData, rules_notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
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
                  {modalMode === 'create' ? 'Save Facility' : 'Update Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
