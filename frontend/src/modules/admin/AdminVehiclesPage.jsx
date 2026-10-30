import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import {
  LuBus,
  LuPhone,
  LuSearch,
  LuX,
  LuTrash2,
  LuLoader,
  LuCheck,
  LuCircleCheck,
  LuPlus,
  LuMapPin,
  LuRadio,
  LuSmartphone,
  LuBox,
  LuSparkles,
  LuRoute,
  LuUsers,
  LuUser,
  LuHash,
  LuArrowRight,
  LuShieldCheck,
  LuPencil,
} from 'react-icons/lu';
import VehicleGpsTracker, { getVehicleTypeInfo } from './VehicleGpsTracker';
import Vehicle3DInspectorModal from './vehicle3d/Vehicle3DInspectorModal';
const VEHICLE_CARD_OPTIONS = [
  {
    type: 'Bus',
    title: 'School Bus',
    badge: 'Starline 3D',
    hint: '40–60 Seats',
    image: '/vehicles/bus.png',
    defaultCapacity: 40,
    modelPreset: 'Tata Starbus Ultra',
  },
  {
    type: 'Mini-bus',
    title: 'Mini-Bus',
    badge: 'Traveller 3D',
    hint: '20–30 Seats',
    image: '/vehicles/minibus.png',
    defaultCapacity: 25,
    modelPreset: 'Force Traveller 3350',
  },
  {
    type: 'Van',
    title: 'School Van',
    badge: 'Compact 3D',
    hint: '8–14 Seats',
    image: '/vehicles/van.png',
    defaultCapacity: 12,
    modelPreset: 'Maruti Eeco / Omni',
  },
];

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // View Mode: 'fleet' (Table) or 'gps' (Live Real-Time Map Tracker)
  const [viewMode, setViewMode] = useState('fleet');
  const [selectedGpsVehicleId, setSelectedGpsVehicleId] = useState(null);
  const [inspect3DVehicle, setInspect3DVehicle] = useState(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTargetVehicle, setDeleteTargetVehicle] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Listen to incoming track_id or view from route builder
  useEffect(() => {
    const trackId = searchParams.get('track_id');
    const view = searchParams.get('view');
    if (trackId) {
      setSelectedGpsVehicleId(trackId);
    }
    if (view === 'gps') {
      setViewMode('gps');
    }
  }, [searchParams]);

  // Navigate to Dedicated Full-Page Bus Route Builder
  const handleOpenRouteBuilder = (vehicle = null) => {
    if (vehicle?.id) {
      navigate(`/bus-route-builder?vehicle_id=${vehicle.id}`);
    } else {
      navigate('/bus-route-builder');
    }
  };

  // Set Route Modal
  const [setRouteVehicle, setSetRouteVehicle] = useState(null);
  const [routeFormData, setRouteFormData] = useState({ route_from: '', route_to: '', route_name: '' });
  const [savingRoute, setSavingRoute] = useState(false);

  const handleOpenSetRouteModal = (vehicle) => {
    setSetRouteVehicle(vehicle);
    setRouteFormData({
      route_from: vehicle.route_from || '',
      route_to: vehicle.route_to || '',
      route_name: vehicle.route_name || '',
    });
  };

  const handleSaveRoute = async (andTrack = false) => {
    if (!setRouteVehicle) return;
    setSavingRoute(true);
    try {
      const generatedName = routeFormData.route_from && routeFormData.route_to
        ? `${routeFormData.route_from} ➔ ${routeFormData.route_to}`
        : (routeFormData.route_name || routeFormData.route_from || routeFormData.route_to || 'Assigned Route');

      await adminService.updateVehicle(setRouteVehicle.id, {
        vehicle_number: setRouteVehicle.vehicle_number,
        type: setRouteVehicle.type,
        capacity: setRouteVehicle.capacity,
        driver_name: setRouteVehicle.driver_name,
        driver_phone: setRouteVehicle.driver_phone,
        status: setRouteVehicle.status,
        route_from: routeFormData.route_from,
        route_to: routeFormData.route_to,
        route_name: generatedName,
      });

      showToast(`Route assigned to ${setRouteVehicle.vehicle_number} successfully!`);
      const targetId = setRouteVehicle.id;
      setSetRouteVehicle(null);
      await loadVehicles();

      if (andTrack) {
        setSelectedGpsVehicleId(targetId);
        setViewMode('gps');
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to update route.');
    } finally {
      setSavingRoute(false);
    }
  };

  const [formData, setFormData] = useState({
    vehicle_number: '',
    type: 'Bus',
    model: '',
    capacity: 40,
    driver_name: '',
    driver_phone: '',
    driver_license: '',
    route_from: '',
    route_to: '',
    route_name: '',
    route_stops: null,
    fuel_type: 'Diesel',
    status: 'Active',
  });

  const [selectedSavedRouteId, setSelectedSavedRouteId] = useState('');

  // Extract all distinct routes configured in Bus Route Builder or vehicles fleet
  const existingRoutes = useMemo(() => {
    const list = [];
    const seen = new Set();

    vehicles.forEach((v) => {
      let stops = v.route_stops;
      if (typeof stops === 'string') {
        try {
          stops = JSON.parse(stops);
        } catch (e) {
          stops = null;
        }
      }

      const from = (v.route_from || (Array.isArray(stops) && stops[0]?.name) || '').trim();
      const to = (v.route_to || (Array.isArray(stops) && stops[stops.length - 1]?.name) || '').trim();

      if (from && to) {
        const key = `${from.toLowerCase()}-->${to.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          const stopCount = Array.isArray(stops) && stops.length > 0 ? stops.length : 2;
          list.push({
            id: `v-${v.id}`,
            name: v.route_name || `${from} ➔ ${to}`,
            from,
            to,
            stops: Array.isArray(stops) ? stops : null,
            stopCount,
            sourceVehicle: v.vehicle_number,
          });
        }
      }
    });

    // Default standard route if none found
    if (list.length === 0) {
      list.push({
        id: 'preset-nashik-kthm',
        name: 'KTHM College ➔ Khutawad Nagar (City Bus Route)',
        from: 'KTHM College, Gangapur Road',
        to: 'Khutawad Nagar, Nashik',
        stops: [
          { name: 'KTHM College, Gangapur Road', lat: 20.007, lng: 73.778, type: 'start' },
          { name: 'Khutawad Nagar, Nashik', lat: 19.983, lng: 73.748, type: 'end' },
        ],
        stopCount: 2,
      });
    }

    return list;
  }, [vehicles]);

  const handleSelectSavedRoute = (routeId) => {
    setSelectedSavedRouteId(routeId);
    if (!routeId || routeId === 'CUSTOM') {
      return;
    }

    const found = existingRoutes.find((r) => r.id === routeId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        route_from: found.from,
        route_to: found.to,
        route_name: found.name,
        route_stops: found.stops,
      }));
      showToast(`Selected route: ${found.from} ➔ ${found.to}`);
    }
  };

  // Edit Vehicle Modal States
  const [editVehicle, setEditVehicle] = useState(null);
  const [editFormData, setEditFormData] = useState({
    vehicle_number: '',
    type: 'Bus',
    model: '',
    capacity: 40,
    driver_name: '',
    driver_phone: '',
    driver_license: '',
    route_from: '',
    route_to: '',
    route_name: '',
    route_stops: null,
    fuel_type: 'Diesel',
    status: 'Active',
  });
  const [editSelectedRouteId, setEditSelectedRouteId] = useState('');

  const handleOpenEditModal = (vehicle) => {
    setEditVehicle(vehicle);
    setEditFormData({
      vehicle_number: vehicle.vehicle_number || '',
      type: vehicle.type || 'Bus',
      model: vehicle.model || '',
      capacity: vehicle.capacity || 40,
      driver_name: vehicle.driver_name || '',
      driver_phone: vehicle.driver_phone || '',
      driver_license: vehicle.driver_license || '',
      route_from: vehicle.route_from || '',
      route_to: vehicle.route_to || '',
      route_name: vehicle.route_name || '',
      route_stops: vehicle.route_stops || null,
      fuel_type: vehicle.fuel_type || 'Diesel',
      status: vehicle.status || 'Active',
    });

    const match = existingRoutes.find(
      (r) =>
        r.from.toLowerCase() === (vehicle.route_from || '').toLowerCase().trim() &&
        r.to.toLowerCase() === (vehicle.route_to || '').toLowerCase().trim()
    );
    setEditSelectedRouteId(match ? match.id : (vehicle.route_from ? 'CUSTOM' : ''));
  };

  const handleSelectEditSavedRoute = (routeId) => {
    setEditSelectedRouteId(routeId);
    if (!routeId || routeId === 'CUSTOM') {
      return;
    }

    const found = existingRoutes.find((r) => r.id === routeId);
    if (found) {
      setEditFormData((prev) => ({
        ...prev,
        route_from: found.from,
        route_to: found.to,
        route_name: found.name,
        route_stops: found.stops,
      }));
      showToast(`Route applied: ${found.from} ➔ ${found.to}`);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editVehicle) return;
    setSubmitting(true);
    try {
      const route_name = editFormData.route_from && editFormData.route_to
        ? `${editFormData.route_from} ➔ ${editFormData.route_to}`
        : (editFormData.route_name || editFormData.route_from || editFormData.route_to || '');

      const res = await adminService.updateVehicle(editVehicle.id, {
        ...editFormData,
        route_name,
      });

      if (res.success) {
        setEditVehicle(null);
        await loadVehicles();
        showToast(`Vehicle ${editFormData.vehicle_number} updated successfully!`);
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to update vehicle.');
    } finally {
      setSubmitting(false);
    }
  };

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedStatus && selectedStatus !== 'ALL') params.status = selectedStatus;

      const res = await adminService.getVehicles(params);
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setVehicles(list);
      }
    } catch (err) {
      console.error('Failed to load vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, [selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadVehicles();
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const route_name = formData.route_from && formData.route_to
        ? `${formData.route_from} ➔ ${formData.route_to}`
        : (formData.route_from || formData.route_to || '');

      const res = await adminService.createVehicle({
        ...formData,
        route_name,
      });
      if (res.success) {
        setShowAddModal(false);
        setSelectedSavedRouteId('');
        setFormData({
          vehicle_number: '',
          type: 'Bus',
          model: '',
          capacity: 40,
          driver_name: '',
          driver_phone: '',
          driver_license: '',
          route_from: '',
          route_to: '',
          route_name: '',
          route_stops: null,
          fuel_type: 'Diesel',
          status: 'Active',
        });
        loadVehicles();
        showToast('Vehicle registered successfully with route origin and destination!');
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to register vehicle.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetVehicle) return;
    try {
      await adminService.deleteVehicle(deleteTargetVehicle.id);
      setDeleteTargetVehicle(null);
      loadVehicles();
      showToast('Vehicle removed successfully.');
    } catch {
      showToast('Failed to delete vehicle.');
    }
  };

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
            <LuBus className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-slate-800 leading-tight">School Vehicles & Transport Fleet</h1>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Manage school buses, vans, assigned drivers, and real-time GPS transport routes
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/70 w-full sm:w-auto">
            <button
              onClick={() => setViewMode('fleet')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                viewMode === 'fleet'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LuBus className="w-3.5 h-3.5" /> Fleet List
            </button>
            <button
              onClick={() => setViewMode('gps')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                viewMode === 'gps'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-orange-600'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <LuRadio className="w-3.5 h-3.5" /> Live GPS Tracking
            </button>
          </div>

          <button
            onClick={() => handleOpenRouteBuilder(null)}
            className="px-3.5 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 w-full sm:w-auto justify-center hover:scale-[1.02] active:scale-[0.98]"
          >
            <LuRoute className="w-4 h-4 text-blue-200" />
            <span>Add Bus Route</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <LuPlus className="w-4 h-4" /> Add Vehicle
          </button>
        </div>
      </div>

      {/* Body Content: Live GPS Tracking or Fleet Roster */}
      {viewMode === 'gps' ? (
        <div className="space-y-4 animate-fade-in">
          <VehicleGpsTracker
            vehicles={vehicles}
            selectedVehicleId={selectedGpsVehicleId}
            onSelectVehicle={(id) => setSelectedGpsVehicleId(id)}
            onClose={() => setViewMode('fleet')}
          />
        </div>
      ) : (
        <>
          {/* Filter & Search Bar */}
          <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by vehicle number, driver name, route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
              />
            </form>

            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full sm:w-auto px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-orange-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Out of Service">Out of Service</option>
              </select>
            </div>
          </div>

          {/* Vehicles Table */}
          {loading ? (
            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-8 sm:p-12 text-center">
              <LuLoader className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading fleet from database...</p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LuBus className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">No Transport Vehicles Registered</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
                There are currently no transport vehicles registered in the database.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-xl transition-colors inline-flex items-center gap-2 shadow-sm"
              >
                <LuPlus className="w-4 h-4" /> Add First Vehicle
              </button>
            </div>
          ) : (
            <>
              {/* Mobile View: Vehicle Cards */}
              <div className="sm:hidden space-y-2.5">
                {vehicles.map((v) => (
                  <div key={v.id} className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-12 h-9 rounded-lg bg-slate-50 border border-slate-200/90 p-0.5 flex items-center justify-center shrink-0">
                          <img
                            src={getVehicleTypeInfo(v.type).image}
                            alt={v.type}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{v.vehicle_number}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{v.type} • {v.model || 'Standard'} • {v.capacity} Seats</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          v.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${
                            v.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}></span>
                          {v.status}
                        </span>
                        <button
                          onClick={() => handleOpenEditModal(v)}
                          title="Edit Vehicle"
                          className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <LuPencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetVehicle(v)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <LuTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs py-1.5 px-2 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">Driver</span>
                        <span className="font-semibold text-slate-700 text-xs truncate block">{v.driver_name || 'Unassigned'}</span>
                        {v.driver_phone && (
                          <span className="text-[10px] text-slate-500 font-mono block">{v.driver_phone}</span>
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">Route</span>
                        <span className="font-semibold text-slate-700 text-xs truncate block">{v.route_name || 'No route'}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedGpsVehicleId(v.id);
                          setViewMode('gps');
                        }}
                        className="flex-1 py-2 px-3 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 hover:from-orange-500/20 hover:to-amber-500/20 text-orange-700 font-bold text-xs rounded-xl border border-orange-200 flex items-center justify-center gap-2 transition-all shadow-2xs"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        <LuRadio className="w-3.5 h-3.5 text-orange-600" />
                        Live Map
                      </button>
                      <button
                        onClick={() => handleOpenRouteBuilder(v)}
                        className="py-2 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                        title="Set Route & Pickup Points for vehicle"
                      >
                        <LuRoute className="w-3.5 h-3.5 text-blue-600" />
                        Set Route
                      </button>
                      <button
                        onClick={() => {
                          setSelectedGpsVehicleId(v.id);
                          setViewMode('gps');
                          window.open(`/driver-tracker?vehicle_id=${v.id}`, '_blank', 'width=420,height=780');
                        }}
                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                      >
                        <LuSmartphone className="w-3.5 h-3.5 text-emerald-600" />
                        Driver App
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="px-5 py-3.5">Vehicle Number & Type</th>
                        <th className="px-5 py-3.5">Capacity</th>
                        <th className="px-5 py-3.5">Driver & Contact</th>
                        <th className="px-5 py-3.5">Assigned Route</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {vehicles.map((v) => (
                        <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-13 h-9 rounded-lg bg-slate-50 border border-slate-200/90 p-0.5 flex items-center justify-center shrink-0">
                                <img
                                  src={getVehicleTypeInfo(v.type).image}
                                  alt={v.type}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div>
                                <div className="font-bold text-slate-800">{v.vehicle_number}</div>
                                <div className="text-[11px] text-slate-400">{v.type} • {v.model || 'Standard'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-semibold text-slate-800">{v.capacity} Seats</span>
                          </td>
                          <td className="px-5 py-4 space-y-0.5">
                            <div className="font-semibold text-slate-800">{v.driver_name}</div>
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <LuPhone className="w-3 h-3 text-slate-400" />
                              <span>{v.driver_phone}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <LuMapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                              <span className="truncate max-w-xs">{v.route_name || 'No route assigned'}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 ${
                              v.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                v.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}></span>
                              {v.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedGpsVehicleId(v.id);
                                  setViewMode('gps');
                                }}
                                title="Track live route on GPS map"
                                className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 active:bg-orange-200 text-orange-700 font-bold text-xs flex items-center gap-1.5 border border-orange-200/90 shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                                <LuRadio className="w-3.5 h-3.5 text-orange-600" />
                                Track Route
                              </button>
                              <button
                                onClick={() => handleOpenRouteBuilder(v)}
                                title="Configure vehicle route, stops & pickup points on map"
                                className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 font-bold text-xs flex items-center gap-1.5 border border-blue-200/90 shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                              >
                                <LuRoute className="w-3.5 h-3.5 text-blue-600" />
                                Set Route
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedGpsVehicleId(v.id);
                                  setViewMode('gps');
                                  window.open(`/driver-tracker?vehicle_id=${v.id}`, '_blank', 'width=420,height=780');
                                }}
                                title="Open Driver Mobile App (Uber Phone GPS Mode)"
                                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 border border-slate-200 shadow-2xs transition-all hover:scale-[1.02]"
                              >
                                <LuSmartphone className="w-3.5 h-3.5 text-emerald-600" />
                                Driver App
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(v)}
                                title="Edit Vehicle Details & Route"
                                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200/90 shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                              >
                                <LuPencil className="w-3.5 h-3.5 text-slate-600" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => setDeleteTargetVehicle(v)}
                                title="Remove Vehicle"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <LuTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/65 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative bg-white rounded-3xl shadow-2xl shadow-slate-900/35 border border-slate-200/80 max-w-2xl w-full my-auto overflow-hidden animate-scale-up">
            {/* Top decorative gradient accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />

            {/* Modal Header */}
            <div className="p-5 sm:p-6 pb-4 bg-white border-b border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/25 flex items-center justify-center shrink-0">
                  <LuBus className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Add New Vehicle</h3>
                    <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 text-[10px] font-extrabold border border-orange-200 uppercase tracking-wider">
                      Fleet Asset
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Register transport fleet vehicle with 3D GPS physics & route profile</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-9 h-9 rounded-xl hover:bg-slate-100 active:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors shrink-0"
                title="Close Modal"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleAddSubmit} className="p-5 sm:p-6 space-y-4 max-h-[78vh] overflow-y-auto">
              
              {/* 1. VISUAL VEHICLE TYPE SELECTION CARDS */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>Select Vehicle Category</span>
                    <span className="text-red-500">*</span>
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">Click card to switch 3D model</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {VEHICLE_CARD_OPTIONS.map((opt) => {
                    const isSelected = formData.type === opt.type;
                    return (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            type: opt.type,
                            model: prev.model ? prev.model : opt.modelPreset,
                            capacity: prev.capacity === 40 || !prev.capacity ? opt.defaultCapacity : prev.capacity,
                          }));
                        }}
                        className={`relative p-3 rounded-2xl border text-left transition-all flex flex-col justify-between group cursor-pointer ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/50 shadow-sm shadow-orange-500/10 ring-2 ring-orange-500/15'
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="w-16 h-10 rounded-xl bg-white border border-slate-100 p-1 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                            <img src={opt.image} alt={opt.title} className="w-full h-full object-contain" />
                          </div>
                          {isSelected ? (
                            <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs shadow-xs">
                              <LuCheck className="w-3 h-3 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 font-mono">{opt.hint}</span>
                          )}
                        </div>

                        <div>
                          <div className="text-xs font-extrabold text-slate-900 group-hover:text-orange-700 transition-colors">
                            {opt.title}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono text-[9px] font-bold border border-slate-200">
                              {opt.badge}
                            </span>
                            <span>{opt.hint}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* 3D Physics & Model Studio Banner */}
                <div className="mt-2.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-50 border border-orange-200/70 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-orange-500/15 text-orange-600 flex items-center justify-center shrink-0">
                      <LuBox className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 text-[11px] text-slate-700 truncate">
                      <span className="font-bold text-slate-900">{getVehicleTypeInfo(formData.type).label}</span>
                      <span className="text-slate-500"> • Steerable wheels & live heading radar</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspect3DVehicle({ type: formData.type, vehicle_number: formData.vehicle_number || 'DEMO-3D' })}
                    className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs shrink-0 transition-all hover:scale-105 active:scale-95"
                  >
                    <LuSparkles className="w-3 h-3 text-amber-200" />
                    3D Studio
                  </button>
                </div>
              </div>

              {/* 2. REGISTRATION & MODEL SPECIFICATIONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Vehicle Registration Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Vehicle Registration Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 w-6 h-5 rounded bg-slate-200/80 border border-slate-300/80 flex items-center justify-center text-[9px] font-black text-slate-600 tracking-wider font-mono">
                      IND
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.vehicle_number}
                      onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value.toUpperCase() })}
                      placeholder="MH-15-AB-4050"
                      className="w-full pl-12 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:border-orange-500 focus:ring-3 focus:ring-orange-500/15 focus:outline-none transition-all tracking-wider uppercase"
                    />
                  </div>
                </div>

                {/* Make / Model */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Make / Manufacturer Model
                  </label>
                  <div className="relative flex items-center">
                    <LuBus className="absolute left-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="e.g. Tata Starbus Ultra 2024"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:border-orange-500 focus:ring-3 focus:ring-orange-500/15 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Seating Capacity with Quick Presets */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <LuUsers className="w-3.5 h-3.5 text-slate-500" />
                    <span>Seating Capacity (Passengers)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-semibold mr-1">Quick:</span>
                    {[12, 25, 40, 50].map((cap) => (
                      <button
                        key={cap}
                        type="button"
                        onClick={() => setFormData({ ...formData, capacity: cap })}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${
                          formData.capacity === cap
                            ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                        }`}
                      >
                        {cap}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:ring-3 focus:ring-orange-500/15 focus:outline-none transition-all"
                  />
                  <span className="absolute right-3.5 text-xs font-semibold text-slate-400 pointer-events-none">
                    seats
                  </span>
                </div>
              </div>

              {/* 3. ASSIGNED DRIVER DETAILS */}
              <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <LuUser className="w-3.5 h-3.5 text-orange-600" />
                  <span>Assigned Driver Details</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Driver Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <LuUser className="absolute left-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={formData.driver_name}
                        onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                        placeholder="e.g. Ramesh Sharma"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:border-orange-500 focus:ring-3 focus:ring-orange-500/15 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Driver Mobile Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <LuPhone className="absolute left-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={formData.driver_phone}
                        onChange={(e) => setFormData({ ...formData, driver_phone: e.target.value })}
                        placeholder="e.g. 9870011221"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:border-orange-500 focus:ring-3 focus:ring-orange-500/15 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. TRANSPORT ROUTE (ORIGIN & DESTINATION) */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50/40 via-white to-amber-50/40 border border-orange-200/80 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-orange-600 text-white flex items-center justify-center text-xs shadow-2xs">
                      <LuRoute className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-slate-900">Transport Route (Origin ➔ Destination)</span>
                      <p className="text-[10.5px] text-slate-500">Scheduled starting origin & ending campus terminus</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100/80 text-orange-800 font-bold border border-orange-200">
                    Terminal Stops
                  </span>
                </div>

                {/* ROUTE DROPDOWN OPTION: Set route from routes already added in Bus Route Builder */}
                <div className="space-y-1.5 bg-white p-3 rounded-xl border border-orange-200/80 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <LuRoute className="w-3.5 h-3.5 text-orange-600" />
                      <span>Choose Route Added in Bus Route Builder:</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleOpenRouteBuilder()}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 hover:underline"
                    >
                      <span>🗺️ Open Route Builder</span>
                      <LuArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <select
                    value={selectedSavedRouteId}
                    onChange={(e) => handleSelectSavedRoute(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 hover:border-orange-400 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-3 focus:ring-orange-500/15 cursor-pointer transition-all"
                  >
                    <option value="">-- Select an existing route or type below --</option>
                    {existingRoutes.length > 0 && (
                      <optgroup label="Saved Bus Routes (From Route Builder)">
                        {existingRoutes.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.from} ➔ {r.to} ({r.stopCount} stops {r.sourceVehicle ? `• ${r.sourceVehicle}` : ''})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <option value="CUSTOM">➕ Custom / Type New Route Manually</option>
                  </select>

                  {selectedSavedRouteId && selectedSavedRouteId !== 'CUSTOM' && (
                    <div className="pt-1 flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <LuCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Route stops & road curves linked from Bus Route Builder</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSavedRouteId('');
                          setFormData((prev) => ({ ...prev, route_stops: null }));
                        }}
                        className="text-[10px] text-slate-400 hover:text-slate-600 underline font-medium"
                      >
                        Clear Selection
                      </button>
                    </div>
                  )}
                </div>

                {/* Origin and Destination text inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Route Origin (Starting Point)</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.route_from}
                      onChange={(e) => setFormData({ ...formData, route_from: e.target.value })}
                      placeholder="e.g. KTHM College / School Main Gate"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 focus:outline-none transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      <span>Destination (Terminus)</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.route_to}
                      onChange={(e) => setFormData({ ...formData, route_to: e.target.value })}
                      placeholder="e.g. Khutawad Nagar / Green Valley"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:border-purple-500 focus:ring-3 focus:ring-purple-500/15 focus:outline-none transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {formData.route_from && formData.route_to && (
                  <div className="p-2.5 rounded-xl bg-white border border-orange-200/90 text-xs text-slate-800 flex items-center justify-between gap-2 shadow-2xs animate-fade-in">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-emerald-600 font-bold">🏁 {formData.route_from}</span>
                      <LuArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-purple-600 font-bold">🏫 {formData.route_to}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">Road map ready</span>
                  </div>
                )}
              </div>

              {/* 5. FOOTER ACTIONS */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="text-[11px] text-slate-400 font-medium hidden sm:block">
                  💡 Detailed road curves can be refined in the <span className="text-orange-600 font-bold">Route Builder</span> anytime.
                </div>
                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuCheck className="w-4 h-4" />}
                    {submitting ? 'Registering Vehicle...' : 'Add Vehicle to Fleet'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {editVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/65 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative bg-white rounded-3xl shadow-2xl shadow-slate-900/35 border border-slate-200/80 max-w-2xl w-full my-auto overflow-hidden animate-scale-up">
            {/* Top decorative gradient accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-700" />

            {/* Modal Header */}
            <div className="p-5 sm:p-6 pb-4 bg-white border-b border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 flex items-center justify-center shrink-0">
                  <LuBus className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Edit Vehicle Details</h3>
                    <span className="font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
                      {editVehicle.vehicle_number}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Update specifications, driver assignment, status & transport route</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditVehicle(null)}
                className="w-9 h-9 rounded-xl hover:bg-slate-100 active:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors shrink-0"
                title="Close Modal"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleEditSubmit} className="p-5 sm:p-6 space-y-4 max-h-[78vh] overflow-y-auto">
              
              {/* 1. STATUS & VEHICLE CATEGORY */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>Vehicle Category & Fleet Status</span>
                    <span className="text-red-500">*</span>
                  </label>
                  
                  {/* Status Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 font-medium">Status:</span>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Out of Service">Out of Service</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {VEHICLE_CARD_OPTIONS.map((opt) => {
                    const isSelected = editFormData.type === opt.type;
                    return (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => {
                          setEditFormData((prev) => ({
                            ...prev,
                            type: opt.type,
                            model: prev.model ? prev.model : opt.modelPreset,
                            capacity: prev.capacity === 40 || !prev.capacity ? opt.defaultCapacity : prev.capacity,
                          }));
                        }}
                        className={`relative p-3 rounded-2xl border text-left transition-all flex flex-col justify-between group cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 shadow-sm shadow-blue-500/10 ring-2 ring-blue-500/15'
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="w-16 h-10 rounded-xl bg-white border border-slate-100 p-1 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                            <img src={opt.image} alt={opt.title} className="w-full h-full object-contain" />
                          </div>
                          {isSelected ? (
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shadow-xs">
                              <LuCheck className="w-3 h-3 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 font-mono">{opt.hint}</span>
                          )}
                        </div>

                        <div>
                          <div className="text-xs font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                            {opt.title}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono text-[9px] font-bold border border-slate-200">
                              {opt.badge}
                            </span>
                            <span>{opt.hint}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* 3D Physics & Model Studio Banner */}
                <div className="mt-2.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50 border border-blue-200/70 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0">
                      <LuBox className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 text-[11px] text-slate-700 truncate">
                      <span className="font-bold text-slate-900">{getVehicleTypeInfo(editFormData.type).label}</span>
                      <span className="text-slate-500"> • 3D WebGL physics, steerable wheels & heading radar</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspect3DVehicle({ type: editFormData.type, vehicle_number: editFormData.vehicle_number || editVehicle.vehicle_number })}
                    className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs shrink-0 transition-all hover:scale-105 active:scale-95"
                  >
                    <LuSparkles className="w-3 h-3 text-blue-200" />
                    3D Studio
                  </button>
                </div>
              </div>

              {/* 2. REGISTRATION & MODEL SPECIFICATIONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Vehicle Registration Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Vehicle Registration Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 w-6 h-5 rounded bg-slate-200/80 border border-slate-300/80 flex items-center justify-center text-[9px] font-black text-slate-600 tracking-wider font-mono">
                      IND
                    </div>
                    <input
                      type="text"
                      required
                      value={editFormData.vehicle_number}
                      onChange={(e) => setEditFormData({ ...editFormData, vehicle_number: e.target.value.toUpperCase() })}
                      placeholder="MH-15-AB-4050"
                      className="w-full pl-12 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15 focus:outline-none transition-all tracking-wider uppercase"
                    />
                  </div>
                </div>

                {/* Make / Model */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Make / Manufacturer Model
                  </label>
                  <div className="relative flex items-center">
                    <LuBus className="absolute left-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={editFormData.model}
                      onChange={(e) => setEditFormData({ ...editFormData, model: e.target.value })}
                      placeholder="e.g. Tata Starbus Ultra 2024"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Seating Capacity with Quick Presets */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <LuUsers className="w-3.5 h-3.5 text-slate-500" />
                    <span>Seating Capacity (Passengers)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-semibold mr-1">Quick:</span>
                    {[12, 25, 40, 50].map((cap) => (
                      <button
                        key={cap}
                        type="button"
                        onClick={() => setEditFormData({ ...editFormData, capacity: cap })}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${
                          editFormData.capacity === cap
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                        }`}
                      >
                        {cap}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={editFormData.capacity}
                    onChange={(e) => setEditFormData({ ...editFormData, capacity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15 focus:outline-none transition-all"
                  />
                  <span className="absolute right-3.5 text-xs font-semibold text-slate-400 pointer-events-none">
                    seats
                  </span>
                </div>
              </div>

              {/* 3. ASSIGNED DRIVER DETAILS */}
              <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <LuUser className="w-3.5 h-3.5 text-blue-600" />
                  <span>Assigned Driver Details</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Driver Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <LuUser className="absolute left-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={editFormData.driver_name}
                        onChange={(e) => setEditFormData({ ...editFormData, driver_name: e.target.value })}
                        placeholder="e.g. Ramesh Sharma"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Driver Mobile Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <LuPhone className="absolute left-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={editFormData.driver_phone}
                        onChange={(e) => setEditFormData({ ...editFormData, driver_phone: e.target.value })}
                        placeholder="e.g. 9870011221"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. TRANSPORT ROUTE (ORIGIN & DESTINATION) */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/40 border border-blue-200/80 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs shadow-2xs">
                      <LuRoute className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-slate-900">Transport Route (Origin ➔ Destination)</span>
                      <p className="text-[10.5px] text-slate-500">Scheduled starting origin & ending campus terminus</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100/80 text-blue-800 font-bold border border-blue-200">
                    Terminal Stops
                  </span>
                </div>

                {/* ROUTE DROPDOWN OPTION: Select from routes already added in Bus Route Builder */}
                <div className="space-y-1.5 bg-white p-3 rounded-xl border border-blue-200/80 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <LuRoute className="w-3.5 h-3.5 text-blue-600" />
                      <span>Choose Route Added in Bus Route Builder:</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleOpenRouteBuilder(editVehicle)}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 hover:underline"
                    >
                      <span>🗺️ Open Route Builder</span>
                      <LuArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <select
                    value={editSelectedRouteId}
                    onChange={(e) => handleSelectEditSavedRoute(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 hover:border-blue-400 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15 cursor-pointer transition-all"
                  >
                    <option value="">-- Select an existing route or type below --</option>
                    {existingRoutes.length > 0 && (
                      <optgroup label="Saved Bus Routes (From Route Builder)">
                        {existingRoutes.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.from} ➔ {r.to} ({r.stopCount} stops {r.sourceVehicle ? `• ${r.sourceVehicle}` : ''})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <option value="CUSTOM">➕ Custom / Type New Route Manually</option>
                  </select>

                  {editSelectedRouteId && editSelectedRouteId !== 'CUSTOM' && (
                    <div className="pt-1 flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <LuCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Route stops & road curves linked from Bus Route Builder</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditSelectedRouteId('');
                          setEditFormData((prev) => ({ ...prev, route_stops: null }));
                        }}
                        className="text-[10px] text-slate-400 hover:text-slate-600 underline font-medium"
                      >
                        Clear Selection
                      </button>
                    </div>
                  )}
                </div>

                {/* Origin and Destination text inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Route Origin (Starting Point)</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.route_from}
                      onChange={(e) => setEditFormData({ ...editFormData, route_from: e.target.value })}
                      placeholder="e.g. KTHM College / School Main Gate"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 focus:outline-none transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      <span>Destination (Terminus)</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.route_to}
                      onChange={(e) => setEditFormData({ ...editFormData, route_to: e.target.value })}
                      placeholder="e.g. Khutawad Nagar / Green Valley"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:border-purple-500 focus:ring-3 focus:ring-purple-500/15 focus:outline-none transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {editFormData.route_from && editFormData.route_to && (
                  <div className="p-2.5 rounded-xl bg-white border border-blue-200/90 text-xs text-slate-800 flex items-center justify-between gap-2 shadow-2xs animate-fade-in">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-emerald-600 font-bold">🏁 {editFormData.route_from}</span>
                      <LuArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-purple-600 font-bold">🏫 {editFormData.route_to}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">Road map ready</span>
                  </div>
                )}
              </div>

              {/* 5. FOOTER ACTIONS */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="text-[11px] text-slate-400 font-medium hidden sm:block">
                  💡 Intermediate stops and waypoints can be customized in <span className="text-blue-600 font-bold">Route Builder</span>.
                </div>
                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setEditVehicle(null)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuCheck className="w-4 h-4" />}
                    {submitting ? 'Updating Vehicle...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTargetVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center animate-scale-up">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LuTrash2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Remove Vehicle?</h3>
            <p className="text-xs text-slate-500 mb-6">
              Are you sure you want to remove <strong>{deleteTargetVehicle.vehicle_number}</strong>?
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setDeleteTargetVehicle(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3D Fleet Physics & Steering Studio Modal */}
      {inspect3DVehicle && (
        <Vehicle3DInspectorModal
          vehicle={inspect3DVehicle}
          onClose={() => setInspect3DVehicle(null)}
        />
      )}

      {/* Set Route Modal */}
      {setRouteVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 text-slate-800 shadow-2xl relative animate-scale-up border border-slate-100">
            {/* Close Button */}
            <button
              onClick={() => setSetRouteVehicle(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <LuX className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                <LuMapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  Set Assigned Route
                </h2>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                    {setRouteVehicle.vehicle_number}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {setRouteVehicle.type} • Driver: {setRouteVehicle.driver_name}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Quick Preset Routes (Click to Auto-Fill)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { from: 'Khutawad Nagar, Nashik', to: 'Panchavati Circle, Nashik', label: 'Route 1: Khutawad Nagar ➔ Panchavati' },
                  { from: 'College Road, Nashik', to: 'ABB Circle, Nashik', label: 'Route 2: College Road ➔ ABB Circle' },
                  { from: 'Gangapur Road, Nashik', to: 'Ashok Stambh, Nashik', label: 'Route 3: Gangapur Road ➔ Ashok Stambh' },
                  { from: 'Indira Nagar, Nashik', to: 'CBS Terminal, Nashik', label: 'Route 4: Indira Nagar ➔ CBS' },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setRouteFormData({
                        route_from: preset.from,
                        route_to: preset.to,
                        route_name: `${preset.from} ➔ ${preset.to}`,
                      });
                    }}
                    className="p-2.5 rounded-xl text-left border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 transition-all text-xs group"
                  >
                    <div className="font-bold text-slate-800 group-hover:text-blue-700 leading-snug">
                      {preset.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Route Inputs Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSaveRoute(false); }} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Route Origin (Starting Point)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Khutawad Nagar (School Gate)"
                    value={routeFormData.route_from}
                    onChange={(e) => setRouteFormData({ ...routeFormData, route_from: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <LuMapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Route Destination (Final Stop / Campus)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Panchavati Circle (Main Terminal)"
                    value={routeFormData.route_to}
                    onChange={(e) => setRouteFormData({ ...routeFormData, route_to: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <LuMapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500 pointer-events-none" />
                </div>
              </div>

              {/* Live Preview Route Badge */}
              {routeFormData.route_from && routeFormData.route_to && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200/80 flex items-center gap-2.5 text-xs text-blue-900 font-semibold animate-fade-in">
                  <LuMapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate">
                    <strong>{routeFormData.route_from}</strong> ➔ <strong>{routeFormData.route_to}</strong>
                  </span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSetRouteVehicle(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRoute}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5"
                >
                  {savingRoute ? <LuLoader className="w-3.5 h-3.5 animate-spin" /> : <LuCheck className="w-3.5 h-3.5" />}
                  Save Route
                </button>
                <button
                  type="button"
                  disabled={savingRoute}
                  onClick={() => handleSaveRoute(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5"
                >
                  <LuRadio className="w-3.5 h-3.5 text-amber-200" />
                  Save & Open GPS Map
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
