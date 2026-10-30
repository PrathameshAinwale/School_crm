import { useState, useEffect } from 'react';
import api from '../../../services/api';
import {
  LuMegaphone,
  LuSend,
  LuCalendar,
  LuClock,
  LuCircleCheck,
  LuCircleAlert,
  LuRefreshCw,
  LuUsers,
  LuFileText,
  LuFilter,
  LuPlus,
  LuTrash2,
  LuEye,
  LuSearch,
  LuInfo,
  LuShieldCheck,
  LuSmartphone,
  LuMail,
  LuMessageCircle,
  LuBell,
  LuBan,
  LuLayers,
} from 'react-icons/lu';

export default function CommunicationHubPage() {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Campaigns Data
  const [campaigns, setCampaigns] = useState([]);
  const [campaignStats, setCampaignStats] = useState({
    sentToday: 0,
    dailyLimit: 1000,
    quotaRemaining: 1000,
    successRate: '100%',
  });
  const [campaignPage, setCampaignPage] = useState(1);
  const [campaignTotalPages, setCampaignTotalPages] = useState(1);
  const [campaignChannelFilter, setCampaignChannelFilter] = useState('all');

  // Templates Data
  const [templates, setTemplates] = useState([]);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    code: '',
    channel: 'sms',
    message_category: 'transactional',
    subject: '',
    content: '',
    dlt_template_id: '',
    dlt_header: '',
    whatsapp_template_name: '',
    whatsapp_language: 'en_US',
    is_active: true,
  });

  // Composer Modal State
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerForm, setComposerForm] = useState({
    title: '',
    channel: 'sms',
    message_category: 'transactional',
    subject: '',
    message_body: '',
    audience_type: 'class',
    audience_filters: { school_class_ids: [] },
    template_id: '',
    is_test_mode: false,
    test_recipients: '',
    scheduled_at: '',
  });
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [classesList, setClassesList] = useState([]);

  // Delivery Logs Data
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logChannelFilter, setLogChannelFilter] = useState('all');
  const [logStatusFilter, setLogStatusFilter] = useState('all');
  const [logSearch, setLogSearch] = useState('');
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);

  // Opt-outs Data
  const [optOuts, setOptOuts] = useState([]);
  const [newOptOut, setNewOptOut] = useState({ phone_or_email: '', channel: 'all', reason: '' });

  // Push tokens
  const [pushTokens, setPushTokens] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, [campaignPage, campaignChannelFilter]);

  const fetchInitialData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      // 1. Fetch campaigns
      const res = await api.get(`/admin/communication/campaigns?page=${campaignPage}&channel=${campaignChannelFilter}`);
      if (res.success && res.data) {
        setCampaigns(res.data.data || []);
        setCampaignTotalPages(res.data.last_page || 1);
      }

      // 2. Fetch classes for audience targeting
      const classesRes = await api.get('/admin/academic/classes');
      if (classesRes.success && classesRes.data) {
        setClassesList(classesRes.data || []);
      }

      // 3. Fetch templates
      const tplRes = await api.get('/admin/communication/templates');
      if (tplRes.success) {
        setTemplates(tplRes.data || []);
      }
    } catch (err) {
      setErrorMessage(err.data?.message || err.message || 'Failed to load communication dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await api.get(
        `/admin/communication/logs?page=${logsPage}&channel=${logChannelFilter}&status=${logStatusFilter}&search=${encodeURIComponent(logSearch)}`
      );
      if (res.success && res.data) {
        setLogs(res.data.data || []);
        setLogsTotalPages(res.data.last_page || 1);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    } else if (activeTab === 'opt_outs') {
      fetchOptOuts();
      fetchPushTokens();
    }
  }, [activeTab, logsPage, logChannelFilter, logStatusFilter]);

  const fetchOptOuts = async () => {
    try {
      const res = await api.get('/admin/communication/opt-outs');
      if (res.success && res.data) {
        setOptOuts(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch opt-outs:', err);
    }
  };

  const fetchPushTokens = async () => {
    try {
      const res = await api.get('/admin/communication/push-tokens');
      if (res.success && res.data) {
        setPushTokens(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch push tokens:', err);
    }
  };

  // Pre-Send Estimation Check
  const handleCalculatePreview = async () => {
    if (!composerForm.message_body) {
      alert('Please enter a message body first.');
      return;
    }
    setPreviewLoading(true);
    try {
      const payload = {
        channel: composerForm.channel,
        message_category: composerForm.message_category,
        audience_type: composerForm.audience_type,
        audience_filters: composerForm.audience_filters,
        message_body: composerForm.message_body,
        is_test_mode: composerForm.is_test_mode,
        test_recipients: composerForm.test_recipients
          ? composerForm.test_recipients.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      };
      const res = await api.post('/admin/communication/campaigns/preview', payload);
      if (res.success && res.data) {
        setPreviewData(res.data);
      }
    } catch (err) {
      alert(err.data?.message || err.message || 'Failed to estimate recipient count.');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Submit Broadcast Campaign
  const handleLaunchCampaign = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        title: composerForm.title,
        channel: composerForm.channel,
        message_category: composerForm.message_category,
        subject: composerForm.subject || null,
        message_body: composerForm.message_body,
        audience_type: composerForm.audience_type,
        audience_filters: composerForm.audience_filters,
        template_id: composerForm.template_id || null,
        is_test_mode: composerForm.is_test_mode,
        test_recipients: composerForm.test_recipients
          ? composerForm.test_recipients.split(',').map((s) => s.trim()).filter(Boolean)
          : null,
        scheduled_at: composerForm.scheduled_at || null,
      };

      const res = await api.post('/admin/communication/campaigns', payload);
      if (res.success) {
        setIsComposerOpen(false);
        setSuccessMessage(res.message || 'Broadcast campaign submitted successfully.');
        setPreviewData(null);
        fetchInitialData();
      }
    } catch (err) {
      setErrorMessage(err.data?.message || err.message || 'Failed to dispatch broadcast campaign.');
    }
  };

  // Cancel Scheduled Campaign
  const handleCancelCampaign = async (id) => {
    if (!window.confirm('Cancel this scheduled campaign?')) return;
    try {
      const res = await api.post(`/admin/communication/campaigns/${id}/cancel`);
      if (res.success) {
        setSuccessMessage('Campaign cancelled.');
        fetchInitialData();
      }
    } catch (err) {
      alert(err.data?.message || err.message || 'Failed to cancel campaign.');
    }
  };

  // Retry Failed Campaign Logs
  const handleRetryCampaign = async (id) => {
    try {
      const res = await api.post(`/admin/communication/campaigns/${id}/retry-failed`);
      if (res.success) {
        setSuccessMessage(res.message || 'Retrying failed logs.');
        fetchInitialData();
      }
    } catch (err) {
      alert(err.data?.message || err.message || 'Failed to retry failed logs.');
    }
  };

  // Retry Single Log
  const handleRetrySingleLog = async (id) => {
    try {
      const res = await api.post(`/admin/communication/logs/${id}/retry`);
      if (res.success) {
        alert('Log queued for retry.');
        fetchLogs();
      }
    } catch (err) {
      alert(err.data?.message || err.message || 'Failed to retry log.');
    }
  };

  // Template Save
  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await api.put(`/admin/communication/templates/${editingTemplate.id}`, templateForm);
        setSuccessMessage('Template updated successfully.');
      } else {
        await api.post('/admin/communication/templates', templateForm);
        setSuccessMessage('Template created successfully.');
      }
      setIsTemplateModalOpen(false);
      setEditingTemplate(null);
      const tplRes = await api.get('/admin/communication/templates');
      if (tplRes.success) setTemplates(tplRes.data || []);
    } catch (err) {
      alert(err.data?.message || err.message || 'Failed to save template.');
    }
  };

  // Add Opt-Out
  const handleAddOptOut = async (e) => {
    e.preventDefault();
    if (!newOptOut.phone_or_email) return;
    try {
      const res = await api.post('/admin/communication/opt-outs', newOptOut);
      if (res.success) {
        setNewOptOut({ phone_or_email: '', channel: 'all', reason: '' });
        fetchOptOuts();
      }
    } catch (err) {
      alert(err.data?.message || err.message || 'Failed to add opt-out.');
    }
  };

  // Delete Opt-Out
  const handleDeleteOptOut = async (id) => {
    if (!window.confirm('Remove this opt-out entry?')) return;
    try {
      await api.delete(`/admin/communication/opt-outs/${id}`);
      fetchOptOuts();
    } catch (err) {
      alert('Failed to delete opt-out.');
    }
  };

  const channelBadges = {
    sms: { label: 'SMS', icon: LuSmartphone, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    whatsapp: { label: 'WhatsApp', icon: LuMessageCircle, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    email: { label: 'Email', icon: LuMail, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    push: { label: 'Push', icon: LuBell, color: 'bg-purple-50 text-purple-700 border-purple-200' },
    in_app: { label: 'In-App', icon: LuMegaphone, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <LuMegaphone className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-gray-900 leading-tight">Communication & Notification Hub</h1>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
              Multi-channel broadcast messaging (SMS, WhatsApp, Email, Push & In-App) with India DLT compliance and delivery tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setComposerForm({
                title: '',
                channel: 'sms',
                message_category: 'transactional',
                subject: '',
                message_body: '',
                audience_type: 'class',
                audience_filters: { school_class_ids: [] },
                template_id: '',
                is_test_mode: false,
                test_recipients: '',
                scheduled_at: '',
              });
              setPreviewData(null);
              setIsComposerOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 bg-primary-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-primary-700 active:bg-primary-800 transition cursor-pointer"
          >
            <LuSend className="w-3.5 h-3.5" />
            <span>New Broadcast</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LuCircleAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-rose-500 hover:text-rose-700">Dismiss</button>
        </div>
      )}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LuCircleCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-500 hover:text-emerald-700">Dismiss</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-gray-200/80 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'campaigns', label: 'Broadcast Campaigns', icon: LuSend },
          { id: 'templates', label: 'Templates & DLT', icon: LuFileText },
          { id: 'logs', label: 'Delivery Logs & Status', icon: LuClock },
          { id: 'opt_outs', label: 'DND Opt-Outs & Push Tokens', icon: LuBan },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 sm:py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-bold border border-primary-200/60 shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Campaigns */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          {/* Campaigns Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Channel Filter:</span>
                <select
                  value={campaignChannelFilter}
                  onChange={(e) => {
                    setCampaignChannelFilter(e.target.value);
                    setCampaignPage(1);
                  }}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200"
                >
                  <option value="all">All Channels</option>
                  <option value="sms">SMS</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="push">Push Notification</option>
                  <option value="in_app">In-App Notice</option>
                </select>
              </div>
              <button
                onClick={fetchInitialData}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs rounded-xl hover:bg-slate-200 transition"
              >
                <LuRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Campaign Title</th>
                    <th className="py-3 px-3">Channel</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Audience</th>
                    <th className="py-3 px-3 text-center">Progress</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No broadcast campaigns found. Click &quot;New Broadcast&quot; to send your first message.
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((camp) => {
                      const ch = channelBadges[camp.channel] || channelBadges.sms;
                      const ChIcon = ch.icon;
                      const progressPct = camp.total_recipients > 0
                        ? Math.round(((camp.sent_count + camp.failed_count + camp.skipped_count) / camp.total_recipients) * 100)
                        : 0;

                      return (
                        <tr key={camp.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-4 font-medium text-slate-900 max-w-[220px] truncate">
                            <div className="font-semibold">{camp.title}</div>
                            {camp.subject && <div className="text-[11px] text-slate-400 truncate">{camp.subject}</div>}
                          </td>
                          <td className="py-3.5 px-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] font-medium ${ch.color}`}>
                              <ChIcon className="w-3 h-3" />
                              <span>{ch.label}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-3 capitalize text-slate-600">
                            {camp.message_category}
                          </td>
                          <td className="py-3.5 px-3 capitalize text-slate-600">
                            {camp.audience_type}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <div className="w-24 mx-auto space-y-1">
                              <div className="flex justify-between text-[10px] text-slate-500">
                                <span>{camp.sent_count}/{camp.total_recipients}</span>
                                <span>{progressPct}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              camp.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : camp.status === 'processing'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                                : camp.status === 'scheduled'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : camp.status === 'failed'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {camp.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-slate-500 text-[11px]">
                            {camp.scheduled_at ? new Date(camp.scheduled_at).toLocaleDateString() : new Date(camp.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {camp.status === 'scheduled' && (
                                <button
                                  onClick={() => handleCancelCampaign(camp.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                                  title="Cancel Scheduled"
                                >
                                  <LuBan className="w-4 h-4" />
                                </button>
                              )}
                              {camp.failed_count > 0 && (
                                <button
                                  onClick={() => handleRetryCampaign(camp.id)}
                                  className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                                  title="Retry Failed"
                                >
                                  <LuRefreshCw className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setActiveTab('logs');
                                  setLogSearch(`Campaign #${camp.id}`);
                                }}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                                title="View Logs"
                              >
                                <LuEye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {campaignTotalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Page {campaignPage} of {campaignTotalPages}</span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={campaignPage <= 1}
                    onClick={() => setCampaignPage((p) => p - 1)}
                    className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    disabled={campaignPage >= campaignTotalPages}
                    onClick={() => setCampaignPage((p) => p + 1)}
                    className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Templates */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Message Templates & DLT Registrations</h2>
            <button
              onClick={() => {
                setEditingTemplate(null);
                setTemplateForm({
                  name: '',
                  code: '',
                  channel: 'sms',
                  message_category: 'transactional',
                  subject: '',
                  content: '',
                  dlt_template_id: '',
                  dlt_header: '',
                  whatsapp_template_name: '',
                  whatsapp_language: 'en_US',
                  is_active: true,
                });
                setIsTemplateModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-xl hover:bg-indigo-700 transition"
            >
              <LuPlus className="w-3.5 h-3.5" />
              <span>Create Template</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tpl) => {
              const ch = channelBadges[tpl.channel] || channelBadges.sms;
              const ChIcon = ch.icon;

              return (
                <div key={tpl.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-semibold ${ch.color}`}>
                        <ChIcon className="w-3 h-3" />
                        <span>{ch.label}</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">{tpl.code}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-800">{tpl.name}</h3>

                    {tpl.subject && (
                      <div className="text-[11px] font-medium text-slate-600 truncate">
                        Subject: {tpl.subject}
                      </div>
                    )}

                    <p className="text-xs text-slate-600 line-clamp-3 bg-slate-50 p-2 rounded-xl border border-slate-100 font-mono">
                      {tpl.content}
                    </p>

                    {tpl.dlt_template_id && (
                      <div className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                        DLT ID: <span className="font-mono font-semibold">{tpl.dlt_template_id}</span> ({tpl.dlt_header || 'Default Header'})
                      </div>
                    )}
                    {tpl.whatsapp_template_name && (
                      <div className="text-[10px] text-emerald-700 bg-emerald-50 p-1.5 rounded-lg border border-emerald-200">
                        Meta Template: <span className="font-mono font-semibold">{tpl.whatsapp_template_name}</span> ({tpl.whatsapp_language})
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setEditingTemplate(tpl);
                        setTemplateForm({
                          name: tpl.name,
                          code: tpl.code,
                          channel: tpl.channel,
                          message_category: tpl.message_category || 'transactional',
                          subject: tpl.subject || '',
                          content: tpl.content,
                          dlt_template_id: tpl.dlt_template_id || '',
                          dlt_header: tpl.dlt_header || '',
                          whatsapp_template_name: tpl.whatsapp_template_name || '',
                          whatsapp_language: tpl.whatsapp_language || 'en_US',
                          is_active: tpl.is_active,
                        });
                        setIsTemplateModalOpen(true);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Delivery Logs */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Channel</label>
                <select
                  value={logChannelFilter}
                  onChange={(e) => setLogChannelFilter(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200"
                >
                  <option value="all">All Channels</option>
                  <option value="sms">SMS</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="push">Push</option>
                  <option value="in_app">In-App</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</label>
                <select
                  value={logStatusFilter}
                  onChange={(e) => setLogStatusFilter(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200"
                >
                  <option value="all">All Statuses</option>
                  <option value="queued">Queued</option>
                  <option value="sent">Sent</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                  <option value="skipped">Skipped</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Search Recipient</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="Search by name, phone, email, or message..."
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200"
                  />
                  <button
                    onClick={fetchLogs}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs hover:bg-indigo-700"
                  >
                    <LuSearch className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-3">Contact</th>
                    <th className="py-3 px-3">Channel</th>
                    <th className="py-3 px-4">Message Snippet</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Sent / Deliv. At</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        {logsLoading ? 'Loading logs...' : 'No communication logs matching the selected filters.'}
                      </td>
                    </tr>
                  ) : (
                    logs.map((lg) => {
                      const ch = channelBadges[lg.channel] || channelBadges.sms;
                      const ChIcon = ch.icon;

                      return (
                        <tr key={lg.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {lg.recipient_name || 'System / Batch'}
                          </td>
                          <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                            {lg.recipient_phone || lg.recipient_email || '—'}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-medium ${ch.color}`}>
                              <ChIcon className="w-3 h-3" />
                              <span>{ch.label}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-[280px] truncate text-slate-600 font-mono text-[11px]">
                            {lg.message_body}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              lg.status === 'delivered'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : lg.status === 'sent'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : lg.status === 'queued'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : lg.status === 'failed'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {lg.status}
                            </span>
                            {lg.error_message && (
                              <div className="text-[10px] text-rose-600 max-w-[150px] truncate" title={lg.error_message}>
                                {lg.error_message}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-[11px] text-slate-500">
                            {lg.delivered_at
                              ? new Date(lg.delivered_at).toLocaleTimeString()
                              : lg.sent_at
                              ? new Date(lg.sent_at).toLocaleTimeString()
                              : '—'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {lg.status === 'failed' && (
                              <button
                                onClick={() => handleRetrySingleLog(lg.id)}
                                className="px-2 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-[10px] font-semibold"
                              >
                                Retry
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {logsTotalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Page {logsPage} of {logsTotalPages}</span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={logsPage <= 1}
                    onClick={() => setLogsPage((p) => p - 1)}
                    className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    disabled={logsPage >= logsTotalPages}
                    onClick={() => setLogsPage((p) => p + 1)}
                    className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: DND Opt-Outs & Device Push Tokens */}
      {activeTab === 'opt_outs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Opt-Outs */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">DND & Unsubscribe Opt-Outs</h2>
              <p className="text-xs text-slate-500">
                Numbers or emails listed here are automatically excluded from promotional broadcasts. Transactional notices still deliver.
              </p>
            </div>

            <form onSubmit={handleAddOptOut} className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">Phone or Email</label>
                  <input
                    type="text"
                    value={newOptOut.phone_or_email}
                    onChange={(e) => setNewOptOut({ ...newOptOut, phone_or_email: e.target.value })}
                    placeholder="+919876543210 or email"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">Channel</label>
                  <select
                    value={newOptOut.channel}
                    onChange={(e) => setNewOptOut({ ...newOptOut, channel: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200"
                  >
                    <option value="all">All Channels</option>
                    <option value="sms">SMS Only</option>
                    <option value="whatsapp">WhatsApp Only</option>
                    <option value="email">Email Only</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
              >
                Add to Opt-Out Registry
              </button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {optOuts.map((op) => (
                <div key={op.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="font-mono font-medium text-slate-800">{op.phone_or_email}</span>
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-slate-200 uppercase font-semibold text-slate-600">
                      {op.channel}
                    </span>
                  </div>
                  <button onClick={() => handleDeleteOptOut(op.id)} className="text-slate-400 hover:text-rose-600">
                    <LuTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Device Push Tokens */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Active Mobile / Web Push Tokens</h2>
              <p className="text-xs text-slate-500">
                Registered FCM tokens for real-time mobile push alerts.
              </p>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {pushTokens.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">No push tokens registered yet.</div>
              ) : (
                pushTokens.map((pt) => (
                  <div key={pt.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <span>{pt.user?.name || `User #${pt.user_id}`}</span>
                      <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                        {pt.platform}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 truncate" title={pt.token}>
                      Hash: {pt.token_hash?.slice(0, 16)}...
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Composer Modal */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <LuSend className="w-4 h-4 text-indigo-600" />
                <span>Compose New Broadcast Campaign</span>
              </h3>
              <button onClick={() => setIsComposerOpen(false)} className="text-slate-400 hover:text-slate-700 text-sm">✕</button>
            </div>

            <form onSubmit={handleLaunchCampaign} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Campaign Title</label>
                  <input
                    type="text"
                    value={composerForm.title}
                    onChange={(e) => setComposerForm({ ...composerForm, title: e.target.value })}
                    placeholder="e.g. Term 1 Fee Reminder"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Delivery Channel</label>
                  <select
                    value={composerForm.channel}
                    onChange={(e) => setComposerForm({ ...composerForm, channel: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  >
                    <option value="sms">SMS (DLT Registered)</option>
                    <option value="whatsapp">Meta WhatsApp</option>
                    <option value="email">Email (SMTP)</option>
                    <option value="push">Mobile Push Notification</option>
                    <option value="in_app">In-App Notice Bell</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Message Category</label>
                  <select
                    value={composerForm.message_category}
                    onChange={(e) => setComposerForm({ ...composerForm, message_category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  >
                    <option value="transactional">Transactional (Fees, Academic, Security)</option>
                    <option value="promotional">Promotional (Events, Admission Open)</option>
                    <option value="emergency">Emergency / Alert (Weather, Urgent Closure)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Target Audience</label>
                  <select
                    value={composerForm.audience_type}
                    onChange={(e) => setComposerForm({ ...composerForm, audience_type: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  >
                    <option value="all">All School (Students, Guardians & Staff)</option>
                    <option value="class">Specific Class(es)</option>
                    <option value="staff">All Staff / Teachers Only</option>
                  </select>
                </div>
              </div>

              {composerForm.audience_type === 'class' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Select Class</label>
                  <select
                    onChange={(e) => {
                      const id = parseInt(e.target.value, 10);
                      setComposerForm({
                        ...composerForm,
                        audience_filters: { school_class_ids: id ? [id] : [] },
                      });
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  >
                    <option value="">-- All Classes --</option>
                    {classesList.map((cls) => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {(composerForm.channel === 'email' || composerForm.channel === 'in_app') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Subject Header</label>
                  <input
                    type="text"
                    value={composerForm.subject}
                    onChange={(e) => setComposerForm({ ...composerForm, subject: e.target.value })}
                    placeholder="Subject line for notification or email..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase">Message Body</label>
                  <div className="flex items-center gap-1">
                    {['{student_name}', '{class}', '{guardian_name}', '{fee_due}', '{due_date}', '{days_overdue}'].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setComposerForm({ ...composerForm, message_body: composerForm.message_body + ' ' + v })}
                        className="text-[10px] px-1.5 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded text-slate-600 font-mono"
                      >
                        +{v}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  rows={4}
                  value={composerForm.message_body}
                  onChange={(e) => setComposerForm({ ...composerForm, message_body: e.target.value })}
                  placeholder="Type message content with {variables}..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono"
                  required
                />
                <div className="text-[10px] text-slate-400 text-right">
                  {composerForm.message_body.length} characters (approx. {Math.ceil(composerForm.message_body.length / 160) || 1} SMS segments)
                </div>
              </div>

              {/* Test Mode */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">Test Mode (Safe Sandbox Send)</span>
                  <input
                    type="checkbox"
                    checked={composerForm.is_test_mode}
                    onChange={(e) => setComposerForm({ ...composerForm, is_test_mode: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                </div>
                {composerForm.is_test_mode && (
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Test Numbers / Emails (Comma separated)</label>
                    <input
                      type="text"
                      value={composerForm.test_recipients}
                      onChange={(e) => setComposerForm({ ...composerForm, test_recipients: e.target.value })}
                      placeholder="+919876543210, test@school.edu.in"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                    />
                  </div>
                )}
              </div>

              {/* Pre-Send Calculation Box */}
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-900">Pre-Send Audit & Estimator</span>
                  <button
                    type="button"
                    onClick={handleCalculatePreview}
                    disabled={previewLoading}
                    className="text-[11px] px-2.5 py-1 bg-white text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 font-medium"
                  >
                    {previewLoading ? 'Calculating...' : 'Recalculate Counts'}
                  </button>
                </div>

                {previewData ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs pt-1">
                    <div className="p-2 bg-white rounded-lg border border-indigo-100">
                      <div className="text-[10px] text-slate-400">Total Audience</div>
                      <div className="font-bold text-slate-800">{previewData.total_candidates}</div>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-indigo-100">
                      <div className="text-[10px] text-emerald-600 font-semibold">Will Receive</div>
                      <div className="font-bold text-emerald-700">{previewData.eligible_count}</div>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-indigo-100">
                      <div className="text-[10px] text-rose-500 font-semibold">Skipped (No Phone)</div>
                      <div className="font-bold text-rose-600">{previewData.skipped_no_contact}</div>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-indigo-100">
                      <div className="text-[10px] text-slate-400">Daily Quota Left</div>
                      <div className="font-bold text-slate-800">{previewData.daily_quota_remaining}</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Click &quot;Recalculate Counts&quot; to verify eligible recipients, skipped contacts (missing guardian phone), and deduplication before launching.
                  </p>
                )}
              </div>

              {/* Schedule For Later */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Schedule For Later (Optional)</label>
                <input
                  type="datetime-local"
                  value={composerForm.scheduled_at}
                  onChange={(e) => setComposerForm({ ...composerForm, scheduled_at: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 shadow-sm"
                >
                  {composerForm.scheduled_at ? 'Schedule Broadcast' : 'Dispatch Broadcast Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingTemplate ? 'Edit Template' : 'Create Communication Template'}
            </h3>

            <form onSubmit={handleSaveTemplate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Template Name</label>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Unique Code</label>
                  <input
                    type="text"
                    value={templateForm.code}
                    onChange={(e) => setTemplateForm({ ...templateForm, code: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 uppercase font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Channel</label>
                  <select
                    value={templateForm.channel}
                    onChange={(e) => setTemplateForm({ ...templateForm, channel: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200"
                  >
                    <option value="sms">SMS</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="push">Push Notification</option>
                    <option value="in_app">In-App Notice</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Category</label>
                  <select
                    value={templateForm.message_category}
                    onChange={(e) => setTemplateForm({ ...templateForm, message_category: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200"
                  >
                    <option value="transactional">Transactional</option>
                    <option value="promotional">Promotional</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Message Content</label>
                <textarea
                  rows={3}
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                  placeholder="Dear {guardian_name}, fee of {fee_due} is due on {due_date}."
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 font-mono"
                  required
                />
              </div>

              {templateForm.channel === 'sms' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50/50 rounded-xl border border-amber-200">
                  <div>
                    <label className="block text-[10px] font-semibold text-amber-800 uppercase mb-1">India DLT Template ID</label>
                    <input
                      type="text"
                      value={templateForm.dlt_template_id}
                      onChange={(e) => setTemplateForm({ ...templateForm, dlt_template_id: e.target.value })}
                      placeholder="19-digit numerical DLT ID"
                      className="w-full px-2.5 py-1 text-xs rounded-lg border border-amber-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-amber-800 uppercase mb-1">DLT Sender Header</label>
                    <input
                      type="text"
                      value={templateForm.dlt_header}
                      onChange={(e) => setTemplateForm({ ...templateForm, dlt_header: e.target.value })}
                      placeholder="e.g. SCHOOL"
                      className="w-full px-2.5 py-1 text-xs rounded-lg border border-amber-200 font-mono uppercase"
                    />
                  </div>
                </div>
              )}

              {templateForm.channel === 'whatsapp' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                  <div>
                    <label className="block text-[10px] font-semibold text-emerald-800 uppercase mb-1">Meta WhatsApp Template Name</label>
                    <input
                      type="text"
                      value={templateForm.whatsapp_template_name}
                      onChange={(e) => setTemplateForm({ ...templateForm, whatsapp_template_name: e.target.value })}
                      placeholder="e.g. fee_overdue_notice"
                      className="w-full px-2.5 py-1 text-xs rounded-lg border border-emerald-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-emerald-800 uppercase mb-1">Language Code</label>
                    <input
                      type="text"
                      value={templateForm.whatsapp_language}
                      onChange={(e) => setTemplateForm({ ...templateForm, whatsapp_language: e.target.value })}
                      placeholder="en_US"
                      className="w-full px-2.5 py-1 text-xs rounded-lg border border-emerald-200"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
