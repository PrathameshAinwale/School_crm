import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  LuBoxes,
  LuSearch,
  LuX,
  LuTrash2,
  LuLoader,
  LuCheck,
  LuCircleCheck,
  LuPlus,
  LuMapPin,
  LuUser,
  LuWrench,
  LuEye,
  LuPencil,
  LuFilter,
  LuCalendar,
  LuShieldAlert,
  LuCircleX,
  LuImage,
  LuFileText,
  LuSparkles,
  LuPaperclip,
} from 'react-icons/lu';

export default function AdminResourcesPage() {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'requests'
  const [resources, setResources] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [requestStatusFilter, setRequestStatusFilter] = useState('ALL');

  // Modals & Forms
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [deleteTargetResource, setDeleteTargetResource] = useState(null);
  const [actioningRequest, setActioningRequest] = useState(null); // Request to approve/reject/resolve
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState(null); // Image lightbox
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Laboratory',
    total_quantity: 1,
    available_quantity: 1,
    condition: 'Good',
    location_room: '',
    unit_cost: '',
    status: 'Available',
    assigned_teacher_id: '',
    notes: '',
  });

  const [actionFormData, setActionFormData] = useState({
    status: 'Approved',
    admin_remarks: '',
  });

  const loadResources = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (categoryFilter && categoryFilter !== 'ALL') params.category = categoryFilter;

      const res = await adminService.getResources(params);
      if (res && res.success) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setResources(list);
      }
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      const res = await adminService.getTeachers({ per_page: 100 });
      if (res && res.success) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setTeachers(list);
      }
    } catch (err) {
      console.error('Failed to load teachers:', err);
    }
  };

  const loadRequests = async () => {
    setRequestsLoading(true);
    try {
      const params = {};
      if (requestStatusFilter && requestStatusFilter !== 'ALL') {
        params.status = requestStatusFilter;
      }
      const res = await adminService.getResourceRequests(params);
      if (res && res.success) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setRequests(list);
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
    loadTeachers();
    loadRequests();
  }, [categoryFilter]);

  useEffect(() => {
    if (activeTab === 'requests') {
      loadRequests();
    }
  }, [activeTab, requestStatusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadResources();
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        assigned_teacher_id: formData.assigned_teacher_id ? Number(formData.assigned_teacher_id) : null,
      };

      const res = await adminService.createResource(payload);
      if (res && res.success) {
        setShowAddModal(false);
        setFormData({
          name: '',
          category: 'Laboratory',
          total_quantity: 1,
          available_quantity: 1,
          condition: 'Good',
          location_room: '',
          unit_cost: '',
          status: 'Available',
          assigned_teacher_id: '',
          notes: '',
        });
        loadResources();
        showToast('Resource asset registered and assigned successfully!');
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to add resource.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingResource) return;
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        assigned_teacher_id: formData.assigned_teacher_id ? Number(formData.assigned_teacher_id) : null,
      };

      const res = await adminService.updateResource(editingResource.id, payload);
      if (res && res.success) {
        setEditingResource(null);
        loadResources();
        showToast('Resource item updated successfully!');
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to update resource.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (resource) => {
    setEditingResource(resource);
    setFormData({
      name: resource.name || '',
      category: resource.category || 'Laboratory',
      total_quantity: resource.total_quantity || 1,
      available_quantity: resource.available_quantity || 1,
      condition: resource.condition || 'Good',
      location_room: resource.location_room || '',
      unit_cost: resource.unit_cost || '',
      status: resource.status || 'Available',
      assigned_teacher_id: resource.assigned_teacher_id || '',
      notes: resource.notes || '',
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetResource) return;
    try {
      await adminService.deleteResource(deleteTargetResource.id);
      setDeleteTargetResource(null);
      loadResources();
      showToast('Resource item deleted successfully.');
    } catch {
      showToast('Failed to delete resource.');
    }
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!actioningRequest) return;
    setSubmitting(true);
    try {
      const res = await adminService.actionResourceRequest(actioningRequest.id, actionFormData);
      if (res && res.success) {
        setActioningRequest(null);
        await Promise.all([loadRequests(), loadResources()]);
        showToast(`Request marked as ${actionFormData.status} and saved to database!`);
      } else {
        showToast(res?.message || 'Failed to update request.');
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to process request.');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingRequestsCount = requests.filter((r) => r.status === 'Pending').length;

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
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/20">
            <LuBoxes className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">School Resources & Asset Inventory</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Assign responsible faculty members, oversee equipment maintenance, and approve repair requests
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingResource(null);
            setFormData({
              name: '',
              category: 'Laboratory',
              total_quantity: 1,
              available_quantity: 1,
              condition: 'Good',
              location_room: '',
              unit_cost: '',
              status: 'Available',
              assigned_teacher_id: '',
              notes: '',
            });
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2 w-full sm:w-auto justify-center self-start sm:self-auto shrink-0 cursor-pointer"
        >
          <LuPlus className="w-4 h-4" /> Add Asset Item
        </button>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
          }`}
        >
          <LuBoxes className="w-4 h-4" />
          <span>Asset Inventory</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeTab === 'inventory' ? 'bg-cyan-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {resources.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'requests'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
          }`}
        >
          <LuWrench className="w-4 h-4" />
          <span>Maintenance & Issue Requests</span>
          {pendingRequestsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
              {pendingRequestsCount} Pending
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: ASSET INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Filter & Search */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by asset name, code, room location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </form>

            {/* Category Dropdown */}
            <div className="flex items-center gap-2">
              <LuFilter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-cyan-500 cursor-pointer min-w-[170px]"
              >
                <option value="ALL">All Categories</option>
                <option value="Laboratory">Laboratory</option>
                <option value="IT & Computers">IT & Computers</option>
                <option value="Sports Equipment">Sports Equipment</option>
                <option value="Audio-Visual">Audio-Visual</option>
                <option value="Library">Library</option>
                <option value="Classroom Furniture">Classroom Furniture</option>
              </select>
            </div>
          </div>

          {/* Resources Table / Grid */}
          {loading ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 flex flex-col items-center justify-center min-h-[250px]">
              <LuLoader className="w-8 h-8 text-cyan-600 animate-spin mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading school resources inventory...</p>
            </div>
          ) : resources.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
              <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <LuBoxes className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Resource Items Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                No inventory matches the current search or category filter.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-5 py-3.5">Asset Code & Item</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5">Responsible Person</th>
                      <th className="px-5 py-3.5">Quantity</th>
                      <th className="px-5 py-3.5">Condition</th>
                      <th className="px-5 py-3.5">Location</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resources.map((item) => {
                      const assigned = item.assigned_teacher;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600 flex items-center justify-center font-bold text-xs shrink-0">
                                {item.category?.[0] || 'R'}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 leading-tight">{item.name}</p>
                                <span className="text-[10px] font-mono text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200 mt-0.5 inline-block">
                                  {item.resource_code}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 font-medium text-slate-700">
                            {item.category}
                          </td>
                          <td className="px-5 py-3.5">
                            {assigned ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                                  {assigned.first_name?.[0]}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-800 leading-tight">{assigned.first_name} {assigned.last_name || ''}</p>
                                  <p className="text-[10px] text-slate-400">{assigned.department || 'Faculty'}</p>
                                </div>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                Unassigned
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-bold text-slate-800">{item.available_quantity}</span>
                            <span className="text-slate-400"> / {item.total_quantity}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border inline-block ${
                              item.condition === 'Good'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : item.condition === 'Needs Repair'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              {item.condition}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                              <LuMapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[140px]">{item.location_room || 'Campus'}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(item)}
                                title="Edit Asset & Assign Responsible Person"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 transition-colors cursor-pointer"
                              >
                                <LuPencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteTargetResource(item)}
                                title="Remove Item"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <LuTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MAINTENANCE & ISSUE REQUESTS (RAISED BY TEACHERS) */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <LuWrench className="w-4 h-4 text-cyan-600" />
              <h3 className="font-bold text-xs text-slate-800">Faculty Maintenance & Damage Reports</h3>
            </div>

            <div className="flex items-center gap-1.5">
              {['ALL', 'Pending', 'Approved', 'In Repair', 'Resolved', 'Rejected'].map((st) => (
                <button
                  key={st}
                  onClick={() => setRequestStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    requestStatusFilter === st
                      ? 'bg-cyan-50 text-cyan-700 border border-cyan-300'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Requests Grid */}
          {requestsLoading ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 flex flex-col items-center justify-center min-h-[250px]">
              <LuLoader className="w-8 h-8 text-cyan-600 animate-spin mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading issue reports...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <LuCheck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Issue Requests</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                There are no maintenance or damage requests matching the selected filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requests.map((req) => {
                const resItem = req.resource;
                const reporter = req.teacher || req.user;
                const severityColors = {
                  Low: 'bg-slate-100 text-slate-700 border-slate-200',
                  Medium: 'bg-blue-50 text-blue-700 border-blue-200',
                  High: 'bg-amber-50 text-amber-700 border-amber-200',
                  Critical: 'bg-rose-50 text-rose-700 border-rose-200',
                };
                const statusColors = {
                  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
                  Approved: 'bg-blue-50 text-blue-700 border-blue-200',
                  'In Repair': 'bg-purple-50 text-purple-700 border-purple-200',
                  Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
                };

                return (
                  <div
                    key={req.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-cyan-300 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Top Bar */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${severityColors[req.severity] || severityColors.Medium}`}>
                              {req.severity} Severity
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[req.status] || statusColors.Pending}`}>
                              {req.status}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {req.issue_type}
                            </span>
                            {req.affected_quantity && (
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                req.issue_type === 'Replace' || (req.issue_type && req.issue_type.toLowerCase().includes('replace'))
                                  ? 'bg-orange-50 text-orange-700 border-orange-200'
                                  : 'bg-purple-50 text-purple-700 border-purple-200'
                              }`}>
                                {req.issue_type === 'Replace' || (req.issue_type && req.issue_type.toLowerCase().includes('replace'))
                                  ? `Replace Qty: ${req.affected_quantity}`
                                  : `Units Affected: ${req.affected_quantity}`}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 leading-snug">{req.title}</h4>
                          <p className="text-[11px] text-cyan-600 font-semibold mt-0.5">
                            Asset: {resItem?.name || 'Resource'} ({resItem?.resource_code || 'N/A'}) • {resItem?.location_room || 'Room'}
                          </p>
                        </div>

                        {req.photo_url && (
                          <button
                            type="button"
                            onClick={() => setPreviewPhotoUrl(req.photo_url)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs shrink-0"
                            title="Click to view full photo attachment"
                          >
                            <LuPaperclip className="w-3.5 h-3.5 text-blue-600" />
                            <span>View Attachment</span>
                          </button>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/70 leading-relaxed">
                        {req.description}
                      </p>

                      {/* Reporter & Date Info */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 text-slate-500">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Reported By:</span>
                          <span className="font-bold text-slate-800">
                            {reporter ? (reporter.full_name || reporter.name || `${reporter.first_name} ${reporter.last_name || ''}`) : 'Faculty Member'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Reported On:</span>
                          <span className="font-medium text-slate-700">
                            {req.created_at ? new Date(req.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                          </span>
                        </div>
                      </div>

                      {/* Admin Remarks if already processed */}
                      {req.admin_remarks && (
                        <div className="p-2.5 bg-cyan-50/70 border border-cyan-200 rounded-xl text-[11px] text-cyan-900">
                          <span className="font-bold block text-[10px] text-cyan-800">Admin Remarks:</span>
                          {req.admin_remarks}
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-400">
                        {req.actioned_at && (
                          <span>Actioned on {new Date(req.actioned_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {req.status === 'Approved' ? (
                          <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-300 inline-flex items-center gap-1.5 select-none cursor-default">
                            <LuCheck className="w-3.5 h-3.5 text-emerald-600" /> Approved
                          </span>
                        ) : req.status === 'Resolved' ? (
                          <span className="px-3.5 py-1.5 bg-teal-100 text-teal-800 font-bold text-xs rounded-xl border border-teal-300 inline-flex items-center gap-1.5 select-none cursor-default">
                            <LuCheck className="w-3.5 h-3.5 text-teal-600" /> Resolved
                          </span>
                        ) : req.status === 'Rejected' ? (
                          <span className="px-3.5 py-1.5 bg-rose-100 text-rose-800 font-bold text-xs rounded-xl border border-rose-300 inline-flex items-center gap-1.5 select-none cursor-default">
                            <LuCircleX className="w-3.5 h-3.5 text-rose-600" /> Rejected
                          </span>
                        ) : req.status === 'In Repair' ? (
                          <span className="px-3.5 py-1.5 bg-purple-100 text-purple-800 font-bold text-xs rounded-xl border border-purple-300 inline-flex items-center gap-1.5 select-none cursor-default">
                            <LuWrench className="w-3.5 h-3.5 text-purple-600" /> In Repair
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setActioningRequest(req);
                              setActionFormData({
                                status: 'Approved',
                                admin_remarks: req.admin_remarks || '',
                              });
                            }}
                            className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <LuWrench className="w-3.5 h-3.5" /> Action / Review Request
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Resource Modal */}
      {(showAddModal || editingResource) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full my-4 sm:my-8 overflow-hidden animate-scale-up">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <LuBoxes className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">{editingResource ? 'Edit Resource Asset' : 'Add Resource Asset'}</h3>
                  <p className="text-cyan-100 text-xs">Specify equipment specs and assign a responsible faculty member</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingResource(null);
                }}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingResource ? handleEditSubmit : handleAddSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Item / Asset Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dual Screen Interactive Panel"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="Laboratory">Laboratory</option>
                    <option value="IT & Computers">IT & Computers</option>
                    <option value="Sports Equipment">Sports Equipment</option>
                    <option value="Audio-Visual">Audio-Visual</option>
                    <option value="Library">Library</option>
                    <option value="Classroom Furniture">Classroom Furniture</option>
                  </select>
                </div>
              </div>

              {/* Responsible Person / Assigned Teacher */}
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <LuUser className="w-4 h-4 text-indigo-600" />
                  <label className="text-xs font-bold text-indigo-950">Responsible Person / Assigned Teacher</label>
                </div>
                <select
                  value={formData.assigned_teacher_id}
                  onChange={(e) => setFormData({ ...formData, assigned_teacher_id: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-indigo-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">-- Unassigned (School Common Pool) --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name || `${t.first_name} ${t.last_name || ''}`} ({t.department || 'Faculty'} - {t.teacher_id})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-indigo-700">
                  When assigned, this teacher can see this asset on their Teacher Portal and submit issue reports with photo attachments.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.total_quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setFormData({
                        ...formData,
                        total_quantity: val,
                        available_quantity: editingResource ? formData.available_quantity : val,
                      });
                    }}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="Good">Good</option>
                    <option value="Needs Repair">Needs Repair</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Discarded">Discarded</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Room Number</label>
                  <input
                    type="text"
                    value={formData.location_room}
                    onChange={(e) => setFormData({ ...formData, location_room: e.target.value })}
                    placeholder="e.g. Physics Lab (Room 204)"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.unit_cost}
                    onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                    placeholder="e.g. 15000"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Description</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Asset serial numbers, warranty details, vendor notes..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500 resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingResource(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuCheck className="w-4 h-4" />}
                  {submitting ? 'Saving...' : editingResource ? 'Update Asset' : 'Add Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Request Modal (Approve/Reject/Resolve) */}
      {actioningRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full my-8 overflow-hidden animate-scale-up">
            <div className="bg-gradient-to-r from-cyan-600 to-indigo-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <LuWrench className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Review Maintenance Request</h3>
                  <p className="text-cyan-100 text-xs">Set approval status and enter remarks for the reporter</p>
                </div>
              </div>
              <button
                onClick={() => setActioningRequest(null)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleActionSubmit} className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <p className="font-bold text-slate-800">{actioningRequest.title}</p>
                <p className="text-slate-500 text-[11px]">Asset: {actioningRequest.resource?.name} ({actioningRequest.resource?.resource_code})</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Action Decision</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { key: 'Approved', label: 'Approve', color: 'border-blue-500 text-blue-700 bg-blue-50' },
                    { key: 'In Repair', label: 'In Repair', color: 'border-purple-500 text-purple-700 bg-purple-50' },
                    { key: 'Resolved', label: 'Resolve', color: 'border-emerald-500 text-emerald-700 bg-emerald-50' },
                    { key: 'Rejected', label: 'Reject', color: 'border-rose-500 text-rose-700 bg-rose-50' },
                  ].map((btn) => (
                    <button
                      key={btn.key}
                      type="button"
                      onClick={() => setActionFormData({ ...actionFormData, status: btn.key })}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                        actionFormData.status === btn.key
                          ? `${btn.color} ring-2 ring-cyan-500/20 shadow-xs font-black`
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Remarks / Feedback for Teacher</label>
                <textarea
                  rows="3"
                  value={actionFormData.admin_remarks}
                  onChange={(e) => setActionFormData({ ...actionFormData, admin_remarks: e.target.value })}
                  placeholder="e.g. Approved. Technician has been dispatched to service the lab microscopes."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500 resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActioningRequest(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuCheck className="w-4 h-4" />}
                  {submitting ? 'Updating...' : 'Submit Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Preview Lightbox */}
      {previewPhotoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2 animate-scale-up">
            <button
              onClick={() => setPreviewPhotoUrl(null)}
              className="absolute right-4 top-4 z-10 w-9 h-9 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-slate-900 transition-colors cursor-pointer"
            >
              <LuX className="w-5 h-5" />
            </button>
            <img src={previewPhotoUrl} alt="Attached Evidence" className="w-full max-h-[75vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center animate-scale-up">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LuTrash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Remove Asset Item?</h3>
            <p className="text-xs text-slate-500 mb-6">
              Are you sure you want to remove <strong>{deleteTargetResource.name}</strong> from school inventory?
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setDeleteTargetResource(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
