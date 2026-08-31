import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import {
  LuBoxes,
  LuSearch,
  LuX,
  LuLoader,
  LuCheck,
  LuCircleCheck,
  LuPlus,
  LuMinus,
  LuMapPin,
  LuUser,
  LuWrench,
  LuEye,
  LuCalendar,
  LuShieldAlert,
  LuImage,
  LuUpload,
  LuSparkles,
  LuClock,
  LuFilter,
  LuPaperclip,
  LuRefreshCw,
} from 'react-icons/lu';

export default function TeacherResourcesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned' | 'my_requests'
  const [resources, setResources] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals & Form
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedResourceForIssue, setSelectedResourceForIssue] = useState(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State for raising an issue
  const [issueFormData, setIssueFormData] = useState({
    resource_id: '',
    title: '',
    issue_type: 'Needs Maintenance',
    severity: 'Medium',
    affected_quantity: 1,
    description: '',
    photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState(null);

  const loadResources = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (categoryFilter && categoryFilter !== 'ALL') params.category = categoryFilter;

      const res = await adminService.getTeacherResources(params);
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

  const loadMyRequests = async () => {
    setRequestsLoading(true);
    try {
      const res = await adminService.getTeacherResourceRequests();
      if (res && res.success) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setMyRequests(list);
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
    loadMyRequests();
  }, [categoryFilter]);

  useEffect(() => {
    if (activeTab === 'my_requests') {
      loadMyRequests();
    }
  }, [activeTab]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIssueFormData((prev) => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter assigned resources (where assigned_teacher matches current user)
  const myAssignedResources = resources.filter((r) => {
    if (!r.assigned_teacher) return false;
    return r.assigned_teacher.user_id === user?.id || r.assigned_teacher.email === user?.email;
  });

  const openRaiseIssueModal = (resource = null) => {
    const defaultResource = resource || myAssignedResources[0] || resources[0];
    setSelectedResourceForIssue(defaultResource);
    setIssueFormData({
      resource_id: defaultResource ? defaultResource.id : '',
      title: defaultResource ? `Maintenance Report for ${defaultResource.name}` : '',
      issue_type: 'Needs Maintenance',
      severity: 'Medium',
      affected_quantity: 1,
      description: '',
      photo: null,
    });
    setPhotoPreview(null);
    setShowIssueModal(true);
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!issueFormData.resource_id) {
      showToast('Please select a resource asset.');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('resource_id', issueFormData.resource_id);
      fd.append('title', issueFormData.title);
      fd.append('issue_type', issueFormData.issue_type);
      fd.append('severity', issueFormData.severity);
      const qtyToSend = issueFormData.affected_quantity !== '' && issueFormData.affected_quantity !== undefined ? Number(issueFormData.affected_quantity) : 0;
      fd.append('affected_quantity', qtyToSend);
      fd.append('description', issueFormData.description);
      if (issueFormData.photo) {
        fd.append('photo', issueFormData.photo);
      }

      const res = await adminService.submitResourceRequest(fd);
      if (res && res.success) {
        setShowIssueModal(false);
        loadMyRequests();
        loadResources();
        showToast('Issue request submitted to Admin successfully with photo evidence!');
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to submit issue request.');
    } finally {
      setSubmitting(false);
    }
  };

  const displayedResources = myAssignedResources;
  const currentSelectedResource = resources.find((r) => String(r.id) === String(issueFormData.resource_id)) || selectedResourceForIssue;

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
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/20">
            <LuBoxes className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">School Resources & Equipment Portal</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              View your responsible assets and submit repair/maintenance/replacement requests with photo attachments
            </p>
          </div>
        </div>

        <button
          onClick={() => openRaiseIssueModal()}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 transition-all flex items-center gap-2 w-full sm:w-auto justify-center self-start sm:self-auto shrink-0 cursor-pointer"
        >
          <LuWrench className="w-4 h-4" /> Raise Issue / Maintenance Request
        </button>
      </div>

      {/* Navigation Tabs (Only My Assigned Assets & My Raised Requests) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('assigned')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'assigned'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
          }`}
        >
          <LuUser className="w-4 h-4" />
          <span>My Assigned Assets</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeTab === 'assigned' ? 'bg-cyan-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {myAssignedResources.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('my_requests')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'my_requests'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
          }`}
        >
          <LuClock className="w-4 h-4" />
          <span>My Raised Requests</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeTab === 'my_requests' ? 'bg-cyan-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {myRequests.length}
          </span>
        </button>
      </div>

      {/* TAB 1: MY ASSIGNED ASSETS */}
      {activeTab === 'assigned' && (
        <div className="space-y-4">
          {/* Filter Bar with Category Dropdown */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by asset name, code, room location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadResources()}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

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

          {/* Grid */}
          {loading ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 flex flex-col items-center justify-center min-h-[250px]">
              <LuLoader className="w-8 h-8 text-cyan-600 animate-spin mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading your assigned resources...</p>
            </div>
          ) : displayedResources.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
              <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <LuBoxes className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Assets Assigned to You Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                The school administrator has not assigned any specific resource items to your account.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedResources.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-5 rounded-2xl border border-cyan-300 ring-1 ring-cyan-500/20 bg-gradient-to-b from-cyan-50/20 to-white shadow-xs flex flex-col justify-between transition-all hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600 flex items-center justify-center font-bold text-sm shrink-0">
                          {item.category?.[0] || 'R'}
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200 font-bold">
                            {item.resource_code}
                          </span>
                          <h3 className="font-bold text-sm text-slate-900 leading-snug mt-0.5">{item.name}</h3>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.condition === 'Good'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.condition === 'Needs Repair'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {item.condition}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">Category:</span>
                        <span className="font-semibold text-slate-800">{item.category}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">Quantity Available:</span>
                        <span className="font-bold text-slate-900 font-mono">{item.available_quantity} / {item.total_quantity}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">Room / Location:</span>
                        <span className="font-medium text-slate-800 truncate max-w-[150px]">{item.location_room || 'Main Campus'}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span className="text-slate-400 text-[11px]">Responsible:</span>
                        <span className="font-bold text-[11px] text-cyan-700 font-black">
                          {item.assigned_teacher?.first_name} {item.assigned_teacher?.last_name || ''} (You)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={() => openRaiseIssueModal(item)}
                      className="w-full py-2 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LuWrench className="w-3.5 h-3.5" /> Report Issue / Request Maintenance
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY RAISED REQUESTS & TRACKING */}
      {activeTab === 'my_requests' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LuWrench className="w-4 h-4 text-cyan-600" />
              <h3 className="font-bold text-xs text-slate-800">Your Submitted Maintenance & Issue Reports</h3>
            </div>
            <button
              onClick={() => openRaiseIssueModal()}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LuPlus className="w-3.5 h-3.5" /> New Request
            </button>
          </div>

          {requestsLoading ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 flex flex-col items-center justify-center min-h-[250px]">
              <LuLoader className="w-8 h-8 text-cyan-600 animate-spin mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading your requests...</p>
            </div>
          ) : myRequests.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <LuCheck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Requests Submitted</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                You haven't raised any maintenance or repair requests yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myRequests.map((req) => {
                const resItem = req.resource;
                const isReplacement = req.issue_type === 'Replace' || (req.issue_type && req.issue_type.toLowerCase().includes('replace'));
                const statusColors = {
                  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
                  Approved: 'bg-blue-50 text-blue-700 border-blue-200',
                  'In Repair': 'bg-purple-50 text-purple-700 border-purple-200',
                  Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
                };
                return (
                  <div key={req.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[req.status] || statusColors.Pending}`}>
                              {req.status}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {req.issue_type}
                            </span>
                            {req.affected_quantity && (
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                isReplacement ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-purple-50 text-purple-700 border-purple-200'
                              }`}>
                                {isReplacement ? `Replace Qty: ${req.affected_quantity}` : `Units Affected: ${req.affected_quantity}`}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 leading-snug">{req.title}</h4>
                          <p className="text-[11px] text-cyan-600 font-semibold mt-0.5">
                            Asset: {resItem?.name || 'Resource'} ({resItem?.resource_code || 'N/A'})
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

                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/70 leading-relaxed">
                        {req.description}
                      </p>

                      {req.admin_remarks && (
                        <div className="p-2.5 bg-cyan-50/70 border border-cyan-200 rounded-xl text-[11px] text-cyan-900">
                          <span className="font-bold block text-[10px] text-cyan-800">Admin Feedback / Action Remarks:</span>
                          {req.admin_remarks}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Raise Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full my-4 sm:my-8 overflow-hidden animate-scale-up">
            <div className="bg-gradient-to-r from-rose-600 to-indigo-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <LuWrench className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Report Resource Issue</h3>
                  <p className="text-rose-100 text-xs">Submit a maintenance ticket or replacement request with photo evidence</p>
                </div>
              </div>
              <button
                onClick={() => setShowIssueModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Resource Asset <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={issueFormData.resource_id}
                  onChange={(e) => {
                    const id = e.target.value;
                    const r = resources.find((item) => String(item.id) === String(id));
                    setSelectedResourceForIssue(r || null);
                    setIssueFormData({ ...issueFormData, resource_id: id });
                  }}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="">-- Select Resource Item --</option>
                  {(myAssignedResources.length > 0 ? myAssignedResources : resources).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.resource_code}) - {r.location_room || 'Room'} (Total: {r.total_quantity || 1})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Issue Category / Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={issueFormData.issue_type}
                    onChange={(e) => setIssueFormData({ ...issueFormData, issue_type: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-rose-500 cursor-pointer font-semibold"
                  >
                    <option value="Replace">Replace / Replacement Required</option>
                    <option value="Needs Maintenance">Needs Maintenance / Servicing</option>
                    <option value="Defective/Broken">Defective / Broken Part</option>
                    <option value="Missing Components">Missing Components / Cables</option>
                    <option value="Damaged">Accidental Damage</option>
                    <option value="Consumables Refill">Consumables Refill Needed</option>
                    <option value="Calibration Required">Calibration Required</option>
                    <option value="Other">Other Reason / Issue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Severity Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={issueFormData.severity}
                    onChange={(e) => setIssueFormData({ ...issueFormData, severity: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    <option value="Low">Low (Can wait for routine check)</option>
                    <option value="Medium">Medium (Affects regular lecture)</option>
                    <option value="High">High (Immediate repair needed)</option>
                    <option value="Critical">Critical (Safety hazard / urgent)</option>
                  </select>
                </div>
              </div>

              {/* Conditional Quantity Section: If 'Replace' is selected */}
              {issueFormData.issue_type === 'Replace' && (
                <div className="p-3.5 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-2 animate-scale-up">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-orange-950">
                      Add Quantity to Replace (Units) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] font-semibold text-orange-800 bg-white px-2 py-0.5 rounded-md border border-orange-200">
                      Max: {currentSelectedResource?.total_quantity || 1} units
                    </span>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => {
                        const cur = parseInt(issueFormData.affected_quantity, 10);
                        const next = isNaN(cur) ? 0 : Math.max(0, cur - 1);
                        setIssueFormData({ ...issueFormData, affected_quantity: next });
                      }}
                      className="w-9 h-9 flex items-center justify-center bg-orange-100 hover:bg-orange-200 active:bg-orange-300 text-orange-800 font-bold rounded-l-xl border border-r-0 border-orange-300 transition-colors cursor-pointer text-sm select-none"
                      title="Decrease quantity"
                    >
                      <LuMinus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      max={currentSelectedResource?.total_quantity || 999}
                      required
                      value={issueFormData.affected_quantity}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const maxVal = currentSelectedResource?.total_quantity || 999;
                        const val = raw === '' ? '' : Math.min(maxVal, Math.max(0, parseInt(raw, 10) || 0));
                        setIssueFormData({ ...issueFormData, affected_quantity: val });
                      }}
                      onBlur={() => {
                        if (issueFormData.affected_quantity === '') {
                          setIssueFormData({ ...issueFormData, affected_quantity: 0 });
                        }
                      }}
                      placeholder="0"
                      className="w-full text-center py-2 bg-white border border-orange-300 text-xs text-slate-800 focus:outline-none focus:border-orange-500 font-mono font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const cur = parseInt(issueFormData.affected_quantity, 10);
                        const maxVal = currentSelectedResource?.total_quantity || 999;
                        const next = isNaN(cur) ? 1 : Math.min(maxVal, cur + 1);
                        setIssueFormData({ ...issueFormData, affected_quantity: next });
                      }}
                      className="w-9 h-9 flex items-center justify-center bg-orange-100 hover:bg-orange-200 active:bg-orange-300 text-orange-800 font-bold rounded-r-xl border border-l-0 border-orange-300 transition-colors cursor-pointer text-sm select-none"
                      title="Increase quantity"
                    >
                      <LuPlus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-orange-700">
                    * Specify the exact number of equipment/items that need new replacement units from administration.
                  </p>
                </div>
              )}

              {/* Conditional Quantity Section: If 'Other' is selected */}
              {issueFormData.issue_type === 'Other' && (
                <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2 animate-scale-up">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-purple-950">
                      How Many Assets / Units Are Affected? <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] font-semibold text-purple-800 bg-white px-2 py-0.5 rounded-md border border-purple-200">
                      Max: {currentSelectedResource?.total_quantity || 1} units
                    </span>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => {
                        const cur = parseInt(issueFormData.affected_quantity, 10);
                        const next = isNaN(cur) ? 0 : Math.max(0, cur - 1);
                        setIssueFormData({ ...issueFormData, affected_quantity: next });
                      }}
                      className="w-9 h-9 flex items-center justify-center bg-purple-100 hover:bg-purple-200 active:bg-purple-300 text-purple-800 font-bold rounded-l-xl border border-r-0 border-purple-300 transition-colors cursor-pointer text-sm select-none"
                      title="Decrease quantity"
                    >
                      <LuMinus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      max={currentSelectedResource?.total_quantity || 999}
                      required
                      value={issueFormData.affected_quantity}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const maxVal = currentSelectedResource?.total_quantity || 999;
                        const val = raw === '' ? '' : Math.min(maxVal, Math.max(0, parseInt(raw, 10) || 0));
                        setIssueFormData({ ...issueFormData, affected_quantity: val });
                      }}
                      onBlur={() => {
                        if (issueFormData.affected_quantity === '') {
                          setIssueFormData({ ...issueFormData, affected_quantity: 0 });
                        }
                      }}
                      placeholder="0"
                      className="w-full text-center py-2 bg-white border border-purple-300 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-mono font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const cur = parseInt(issueFormData.affected_quantity, 10);
                        const maxVal = currentSelectedResource?.total_quantity || 999;
                        const next = isNaN(cur) ? 1 : Math.min(maxVal, cur + 1);
                        setIssueFormData({ ...issueFormData, affected_quantity: next });
                      }}
                      className="w-9 h-9 flex items-center justify-center bg-purple-100 hover:bg-purple-200 active:bg-purple-300 text-purple-800 font-bold rounded-r-xl border border-l-0 border-purple-300 transition-colors cursor-pointer text-sm select-none"
                      title="Increase quantity"
                    >
                      <LuPlus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-purple-700">
                    * Enter the total number of items experiencing this issue.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Issue Summary / Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={issueFormData.title}
                  onChange={(e) => setIssueFormData({ ...issueFormData, title: e.target.value })}
                  placeholder="e.g. Lens cracked in microscope #3 during Grade 10 practicals"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Description & Damage Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="3"
                  required
                  value={issueFormData.description}
                  onChange={(e) => setIssueFormData({ ...issueFormData, description: e.target.value })}
                  placeholder="Provide complete details of what went wrong, symptoms, when it was noticed, and impact on students..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-rose-500 resize-none"
                ></textarea>
              </div>

              {/* Photo Upload with Preview */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Attach Photo Evidence / Damage Picture
                </label>
                <div className="p-3.5 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handlePhotoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {photoPreview ? (
                    <div className="space-y-2">
                      <img src={photoPreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl border border-slate-200 mx-auto shadow-xs" />
                      <p className="text-[11px] text-cyan-600 font-bold">Click to change picture</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 py-2">
                      <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                        <LuUpload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-700">Click or drag image to upload damage photo</p>
                      <p className="text-[10px] text-slate-400">PNG, JPG, JPEG or WEBP up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuCheck className="w-4 h-4" />}
                  {submitting ? 'Submitting Report...' : 'Submit Request to Admin'}
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
    </div>
  );
}
