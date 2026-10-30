import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  LuBuilding2,
  LuPalette,
  LuCalendarCheck,
  LuReceipt,
  LuAward,
  LuKeyRound,
  LuHistory,
  LuPlus,
  LuSave,
  LuCheck,
  LuTriangleAlert,
  LuClock,
  LuUpload,
  LuEye,
  LuTrash2,
  LuShieldAlert,
  LuRefreshCw,
  LuCopy,
  LuGlobe,
  LuPhone,
  LuMail,
  LuMapPin,
  LuShieldCheck,
  LuCalendar,
} from 'react-icons/lu';

export default function SchoolSettingsPage() {
  const { currentRole } = useAuth();
  const isPrincipal = currentRole === 'principal';
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Settings State
  const [settings, setSettings] = useState({
    general: {},
    branding: {},
    financial_rules: {},
    grading: {},
    integrations: {},
  });

  // Academic Years State
  const [academicYears, setAcademicYears] = useState([]);
  const [currentYearId, setCurrentYearId] = useState(null);
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [yearForm, setYearForm] = useState({
    name: '2027-2028',
    code: 'AY-2027-28',
    start_date: '2027-04-01',
    end_date: '2028-03-31',
    description: '',
    is_current: false,
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFilter, setAuditFilter] = useState({ event: 'all', search: '', date_from: '', date_to: '' });
  const [activeDiffModal, setActiveDiffModal] = useState(null);

  // File Upload State
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [webhookInfo, setWebhookInfo] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const [settingsRes, yearsRes] = await Promise.all([
        api.get('/admin/settings'),
        api.get('/academic-years'),
      ]);

      if (settingsRes.success && settingsRes.data?.settings) {
        setSettings(settingsRes.data.settings);
        if (settingsRes.data.webhooks) {
          setWebhookInfo(settingsRes.data.webhooks);
        }
      }

      if (yearsRes.success && yearsRes.data) {
        setAcademicYears(yearsRes.data.academic_years || []);
        setCurrentYearId(yearsRes.data.current_year?.id || null);
      }
    } catch (err) {
      setErrorMessage(err.data?.message || err.message || 'Failed to load school settings.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const params = {};
      if (auditFilter.event !== 'all') params.event = auditFilter.event;
      if (auditFilter.search) params.search = auditFilter.search;
      if (auditFilter.date_from) params.date_from = auditFilter.date_from;
      if (auditFilter.date_to) params.date_to = auditFilter.date_to;

      const res = await api.get('/admin/audit-logs', { params });
      if (res.success && res.data) {
        setAuditLogs(res.data.data || []);
      }
    } catch (err) {
      setErrorMessage(err.data?.message || err.message || 'Failed to fetch audit logs.');
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'audit_trail') {
      fetchAuditLogs();
    }
  }, [activeTab]);

  const handleSettingChange = (group, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: value,
      },
    }));
  };

  const handleSaveGroup = async (group) => {
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const res = await api.post('/admin/settings', {
        group,
        settings: settings[group],
      });

      if (res.success) {
        setSuccessMessage(`Settings for ${group.replace('_', ' ')} saved successfully.`);
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      setErrorMessage(err.data?.message || err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  // Logo Upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', 'school_logo');
    formData.append('visibility', 'public');

    try {
      const res = await api.post('/files/upload', formData);
      if (res.success && res.data) {
        const previewUrl = `/api/v1/files/public/${res.data.file_token}`;
        handleSettingChange('branding', 'logo_token', res.data.file_token);
        handleSettingChange('branding', 'logo_url', previewUrl);
        setSuccessMessage('Logo uploaded. Click "Save Branding" to apply changes.');
      }
    } catch (err) {
      setErrorMessage(err.data?.message || err.message || 'Logo upload failed.');
    } finally {
      setUploadingLogo(false);
    }
  };

  // Academic Year Actions
  const handleSetCurrentYear = async (id, name) => {
    if (!window.confirm(`Set session '${name}' as the active current academic year for this campus?`)) return;

    try {
      const res = await api.post(`/admin/academic-years/${id}/set-current`);
      if (res.success) {
        setCurrentYearId(id);
        localStorage.setItem('active_academic_year_id', id);
        setSuccessMessage(`Active academic year switched to '${name}'.`);
        fetchInitialData();
      }
    } catch (err) {
      setErrorMessage(err.data?.message || err.message || 'Failed to set current academic year.');
    }
  };

  const handleCreateYear = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');

    try {
      const res = await api.post('/admin/academic-years', yearForm);
      if (res.success) {
        setIsYearModalOpen(false);
        setSuccessMessage('New academic session created successfully.');
        fetchInitialData();
      }
    } catch (err) {
      setErrorMessage(err.data?.message || err.message || 'Failed to create academic year.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteYear = async (id, isCurrent) => {
    if (isCurrent) {
      alert('Cannot delete the active current academic year.');
      return;
    }

    if (!window.confirm('Are you sure you want to archive this academic year session?')) return;

    try {
      const res = await api.delete(`/admin/academic-years/${id}`);
      if (res.success) {
        setSuccessMessage('Academic session archived.');
        fetchInitialData();
      }
    } catch (err) {
      setErrorMessage(err.data?.message || err.message || 'Failed to delete academic year.');
    }
  };

  const tabs = [
    { id: 'profile', label: 'School Profile', icon: LuBuilding2 },
    { id: 'branding', label: 'Branding & Logo', icon: LuPalette },
    { id: 'academic_years', label: 'Academic Sessions', icon: LuCalendarCheck },
    { id: 'financial', label: 'Fee & Billing Rules', icon: LuReceipt },
    { id: 'grading', label: 'Grading Scheme', icon: LuAward },
    { id: 'integrations', label: 'Integration Keys', icon: LuKeyRound },
    { id: 'audit_trail', label: 'System Audit Trail', icon: LuHistory },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-10">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <LuBuilding2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-gray-900 leading-tight">School Administration & Settings</h1>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
              Configure school profile, multi-year academic cycles, financial rules, branding, and integration credentials
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm animate-fade-in">
          <LuCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm animate-fade-in">
          <LuTriangleAlert className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-gray-200/80 pb-2 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
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

      {/* Tab 1: School Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-semibold text-slate-900">Campus Identity & Profile</h2>
            <p className="text-xs text-slate-500">Official information printed on report cards, fee receipts, and certificates.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">School Name</label>
              <input
                type="text"
                value={settings.general?.school_name || ''}
                onChange={(e) => handleSettingChange('general', 'school_name', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                placeholder="e.g. Delhi Public Academy"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Affiliation Number</label>
              <input
                type="text"
                value={settings.general?.affiliation_no || ''}
                onChange={(e) => handleSettingChange('general', 'affiliation_no', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                placeholder="e.g. CBSE/AFF/2026/8891"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Affiliated Education Board</label>
              <input
                type="text"
                value={settings.general?.board || ''}
                onChange={(e) => handleSettingChange('general', 'board', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                placeholder="e.g. CBSE, ICSE, Maharashtra State Board"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Principal / Head of School</label>
              <input
                type="text"
                value={settings.general?.principal_name || ''}
                onChange={(e) => handleSettingChange('general', 'principal_name', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                placeholder="e.g. Dr. Rajeshwari Sharma"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Campus Contact Phone</label>
              <input
                type="text"
                value={settings.general?.phone || ''}
                onChange={(e) => handleSettingChange('general', 'phone', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Official Email</label>
              <input
                type="email"
                value={settings.general?.email || ''}
                onChange={(e) => handleSettingChange('general', 'email', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                placeholder="principal@school.edu.in"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Campus Postal Address</label>
              <textarea
                rows={3}
                value={settings.general?.address || ''}
                onChange={(e) => handleSettingChange('general', 'address', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                placeholder="Full address with pin code"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => handleSaveGroup('general')}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-xl shadow-sm hover:bg-indigo-700 transition"
            >
              <LuSave className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Details'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Branding & Logo */}
      {activeTab === 'branding' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-semibold text-slate-900">Branding, Logo & Visual Assets</h2>
            <p className="text-xs text-slate-500">Upload school emblem and favicon. Assets are stored securely on Hostinger storage disk.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 flex flex-col items-center justify-center text-center">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">Official School Logo (Max 2MB)</label>
              
              {settings.branding?.logo_url ? (
                <div className="mb-4 p-3 bg-white rounded-xl shadow-sm border border-slate-200">
                  <img src={settings.branding.logo_url} alt="School Logo" className="h-20 object-contain mx-auto" />
                </div>
              ) : (
                <div className="mb-4 p-3 bg-white rounded-xl shadow-sm border border-slate-200">
                  <img src="/logo.svg" alt="Default Arch Campus Logo" className="h-20 object-contain mx-auto" />
                </div>
              )}

              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition shadow-sm">
                <LuUpload className="w-4 h-4" />
                <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo PNG/JPG'}</span>
                <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogoUpload} className="hidden" />
              </label>
              <p className="text-[11px] text-slate-400 mt-2">Recommended resolution: 512x512 with transparent background.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Direct Logo URL / Storage Fallback</label>
                <input
                  type="text"
                  value={settings.branding?.logo_url || ''}
                  onChange={(e) => handleSettingChange('branding', 'logo_url', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  placeholder="/logo.svg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Brand Accent Color Hex</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.branding?.theme_color || '#1e3a8a'}
                    onChange={(e) => handleSettingChange('branding', 'theme_color', e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={settings.branding?.theme_color || '#1e3a8a'}
                    onChange={(e) => handleSettingChange('branding', 'theme_color', e.target.value)}
                    className="w-32 px-3 py-2 text-sm rounded-xl border border-slate-200 font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => handleSaveGroup('branding')}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-xl shadow-sm hover:bg-indigo-700 transition"
            >
              <LuSave className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Branding Assets'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Academic Sessions */}
      {activeTab === 'academic_years' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Academic Sessions & Cycles</h2>
              <p className="text-xs text-slate-500">Manage school calendar cycles (April 1 to March 31). Active year controls student enrollment and billing.</p>
            </div>
            <button
              onClick={() => setIsYearModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium text-xs rounded-xl shadow-sm hover:bg-indigo-700 transition"
            >
              <LuPlus className="w-4 h-4" />
              <span>New Academic Session</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-xs border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Session Name</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Cycle Period</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Active Current</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {academicYears.map((yr) => {
                  const isCurrent = (yr.id === currentYearId || yr.is_current);
                  return (
                    <tr key={yr.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900">{yr.name}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-xs">{yr.code}</td>
                      <td className="py-3 px-4 text-slate-600 text-xs">
                        {yr.start_date} ➔ {yr.end_date}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          yr.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                          yr.status === 'upcoming' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {yr.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-semibold shadow-sm">
                            <LuCheck className="w-3.5 h-3.5" />
                            <span>Current Active</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetCurrentYear(yr.id, yr.name)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                          >
                            Set as Current
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isCurrent && (
                          <button
                            onClick={() => handleDeleteYear(yr.id, isCurrent)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                            title="Archive Session"
                          >
                            <LuTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Fee & Billing Rules */}
      {activeTab === 'financial' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-semibold text-slate-900">Fee Calculation & Billing Rules</h2>
            <p className="text-xs text-slate-500">Configure receipt prefixes, late fine formulas, counter payment instructions, and auto-reminders.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Fee Receipt Prefix</label>
              <input
                type="text"
                value={settings.financial_rules?.fee_receipt_prefix ?? settings.financial_rules?.receipt_prefix ?? 'REC'}
                onChange={(e) => handleSettingChange('financial_rules', 'fee_receipt_prefix', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
                placeholder="REC"
              />
              <p className="text-[11px] text-slate-400 mt-1">Receipt format: &#123;PREFIX&#125;/&#123;YEAR&#125;/&#123;SEQ&#125; (e.g. REC/2026-27/00001)</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Fee Refund Prefix</label>
              <input
                type="text"
                value={settings.financial_rules?.fee_refund_prefix || 'REF'}
                onChange={(e) => handleSettingChange('financial_rules', 'fee_refund_prefix', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
                placeholder="REF"
              />
              <p className="text-[11px] text-slate-400 mt-1">Refund format: &#123;PREFIX&#125;/&#123;YEAR&#125;/&#123;SEQ&#125; (e.g. REF/2026-27/00001)</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Currency Symbol</label>
              <input
                type="text"
                value={settings.financial_rules?.currency_symbol || '₹'}
                onChange={(e) => handleSettingChange('financial_rules', 'currency_symbol', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                placeholder="₹"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Default Due Days After Term Starts</label>
              <input
                type="number"
                value={settings.financial_rules?.default_due_days ?? 0}
                onChange={(e) => handleSettingChange('financial_rules', 'default_due_days', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                placeholder="0 (unset)"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Late Fine Calculation Type</label>
              <select
                value={settings.financial_rules?.fee_late_fine_type || 'daily'}
                onChange={(e) => handleSettingChange('financial_rules', 'fee_late_fine_type', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              >
                <option value="daily">Daily Accrual (Per Day Overdue)</option>
                <option value="flat">Flat Fixed Penalty</option>
                <option value="percentage">Percentage of Installment Amount</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Late Fine Rate (₹ or %)</label>
              <input
                type="number"
                step="0.01"
                value={settings.financial_rules?.fee_late_fine_rate ?? settings.financial_rules?.late_fee_per_day ?? 0}
                onChange={(e) => handleSettingChange('financial_rules', 'fee_late_fine_rate', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Fine Grace Period (Days)</label>
              <input
                type="number"
                value={settings.financial_rules?.fee_late_fine_grace_days ?? settings.financial_rules?.grace_period_days ?? 0}
                onChange={(e) => handleSettingChange('financial_rules', 'fee_late_fine_grace_days', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                placeholder="0"
              />
              <p className="text-[11px] text-slate-400 mt-1">Days after due date before fines begin to accrue.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Late Fine Maximum Cap (₹)</label>
              <input
                type="number"
                step="0.01"
                value={settings.financial_rules?.fee_late_fine_max_cap ?? 0}
                onChange={(e) => handleSettingChange('financial_rules', 'fee_late_fine_max_cap', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                placeholder="0.00"
              />
              <p className="text-[11px] text-amber-600 mt-1 font-medium">0 = no fine / fines disabled. Set greater than 0 to activate late penalties.</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Fee Counter Notice (Parent Portal Banner)</label>
              <textarea
                rows={2}
                value={settings.financial_rules?.fee_counter_notice || 'Please pay your fee dues at the school fee counter.'}
                onChange={(e) => handleSettingChange('financial_rules', 'fee_counter_notice', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                placeholder="Please pay your fee dues at the school fee counter."
              />
              <p className="text-[11px] text-slate-400 mt-1">Offline payment instruction banner displayed to parents in the Fee Center.</p>
            </div>

            <div className="md:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-800">Automated Overdue Fee Reminders</div>
                <div className="text-xs text-slate-500">Automatically dispatch SMS/WhatsApp notifications to guardians of overdue students daily (default: OFF).</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(settings.financial_rules?.fee_auto_reminders_enabled === true || settings.financial_rules?.fee_auto_reminders_enabled === '1' || settings.financial_rules?.fee_auto_reminders_enabled === 1)}
                  onChange={(e) => handleSettingChange('financial_rules', 'fee_auto_reminders_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => handleSaveGroup('financial_rules')}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-xl shadow-sm hover:bg-indigo-700 transition"
            >
              <LuSave className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Financial Rules'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 5: Grading Scheme */}
      {activeTab === 'grading' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-semibold text-slate-900">Academic Grading Framework</h2>
            <p className="text-xs text-slate-500">Defines the default grading scale for examination report cards across classes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Grading Scale Template</label>
              <select
                value={settings.grading?.grading_scale || 'CBSE 9-Point Scale (A1 to E)'}
                onChange={(e) => handleSettingChange('grading', 'grading_scale', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="CBSE 9-Point Scale (A1 to E)">CBSE 9-Point Scale (A1, A2, B1, B2, C1, C2, D, E)</option>
                <option value="Percentage Bands (Distinction, 1st, 2nd, 3rd)">Percentage Bands (Distinction, 1st, 2nd, 3rd)</option>
                <option value="GPA 4.0 Scale">GPA 4.0 Standard Scale</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Minimum Pass Percentage (%)</label>
              <input
                type="number"
                value={settings.grading?.pass_percentage || 33}
                onChange={(e) => handleSettingChange('grading', 'pass_percentage', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => handleSaveGroup('grading')}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-xl shadow-sm hover:bg-indigo-700 transition"
            >
              <LuSave className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Grading Framework'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 6: Integration Keys */}
      {activeTab === 'integrations' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-semibold text-slate-900">Third-Party Gateway API Credentials</h2>
            <p className="text-xs text-slate-500">
              Credentials are encrypted with AES-256 in the database. Secrets are masked with bullets; entering new values replaces the key, while empty or masked values keep existing secrets.
            </p>
          </div>

          {/* Payment Gateway (Razorpay) */}
          <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-4">
            <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
              <LuKeyRound className="w-4 h-4 text-indigo-600" />
              <span>Razorpay Payment Gateway</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Key ID</label>
                <input
                  type="text"
                  value={settings.integrations?.razorpay_key_id || ''}
                  onChange={(e) => handleSettingChange('integrations', 'razorpay_key_id', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-mono"
                  placeholder="rzp_live_..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Key Secret (Masked)</label>
                <input
                  type="text"
                  value={settings.integrations?.razorpay_key_secret || ''}
                  onChange={(e) => handleSettingChange('integrations', 'razorpay_key_secret', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-mono"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Webhook Secret</label>
                <input
                  type="text"
                  value={settings.integrations?.razorpay_webhook_secret || ''}
                  onChange={(e) => handleSettingChange('integrations', 'razorpay_webhook_secret', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-mono"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {/* SMS Gateway */}
          <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-4">
            <div className="flex items-center justify-between font-semibold text-slate-800 text-sm">
              <div className="flex items-center gap-2">
                <LuKeyRound className="w-4 h-4 text-indigo-600" />
                <span>Transactional SMS Gateway (DLT Compliant)</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-normal">
                Generic HTTP Adapter
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  SMS Endpoint URL <span className="text-slate-400 font-normal">(Super Admin / .env restricted)</span>
                </label>
                <input
                  type="text"
                  value={settings.integrations?.sms_endpoint_url || ''}
                  onChange={(e) => handleSettingChange('integrations', 'sms_endpoint_url', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-mono"
                  placeholder="https://api.sms-gateway.com/v1/send"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Sender ID / DLT Header</label>
                <input
                  type="text"
                  value={settings.integrations?.sms_sender_id || ''}
                  onChange={(e) => handleSettingChange('integrations', 'sms_sender_id', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-mono uppercase"
                  placeholder="e.g. SCHOOL"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">DLT Principal Entity ID</label>
                <input
                  type="text"
                  value={settings.integrations?.sms_dlt_principal_entity_id || ''}
                  onChange={(e) => handleSettingChange('integrations', 'sms_dlt_principal_entity_id', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-mono"
                  placeholder="170115..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Auth Token (Masked)</label>
                <input
                  type="text"
                  value={settings.integrations?.sms_auth_token || settings.integrations?.sms_api_key || ''}
                  onChange={(e) => handleSettingChange('integrations', 'sms_auth_token', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-mono"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Webhook Callback Secret</label>
                <input
                  type="text"
                  value={settings.integrations?.sms_webhook_secret || ''}
                  onChange={(e) => handleSettingChange('integrations', 'sms_webhook_secret', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-mono"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {/* WhatsApp API */}
          <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-4">
            <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
              <LuKeyRound className="w-4 h-4 text-emerald-600" />
              <span>Meta WhatsApp Cloud API</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Phone Number ID</label>
                <input
                  type="text"
                  value={settings.integrations?.whatsapp_phone_number_id || settings.integrations?.whatsapp_phone_id || ''}
                  onChange={(e) => handleSettingChange('integrations', 'whatsapp_phone_number_id', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-mono"
                  placeholder="10928374650"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Permanent Access Token (Masked)</label>
                <input
                  type="text"
                  value={settings.integrations?.whatsapp_access_token || ''}
                  onChange={(e) => handleSettingChange('integrations', 'whatsapp_access_token', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-mono"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Meta App Secret (for HMAC Webhook)</label>
                <input
                  type="text"
                  value={settings.integrations?.whatsapp_app_secret || ''}
                  onChange={(e) => handleSettingChange('integrations', 'whatsapp_app_secret', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-mono"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Webhook Verify Token</label>
                <input
                  type="text"
                  value={settings.integrations?.whatsapp_verify_token || ''}
                  onChange={(e) => handleSettingChange('integrations', 'whatsapp_verify_token', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-mono"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">API Graph Version</label>
                <input
                  type="text"
                  value={settings.integrations?.whatsapp_api_version || 'v21.0'}
                  onChange={(e) => handleSettingChange('integrations', 'whatsapp_api_version', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-mono"
                  placeholder="v21.0"
                />
              </div>
            </div>
          </div>

          {/* Safety & Cost Controls */}
          <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-4">
            <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
              <LuShieldAlert className="w-4 h-4 text-indigo-600" />
              <span>Safety & Rate Limits (Hostinger Safe)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Daily Communication Send Cap
                </label>
                <input
                  type="number"
                  value={settings.integrations?.communication_daily_limit || 1000}
                  onChange={(e) => handleSettingChange('integrations', 'communication_daily_limit', parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  placeholder="1000"
                />
                <span className="text-[11px] text-slate-500">Max outbound notifications permitted per day for this campus.</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Hourly Outgoing Email Limit (Hostinger Safe)
                </label>
                <input
                  type="number"
                  value={settings.integrations?.email_hourly_limit || 100}
                  onChange={(e) => handleSettingChange('integrations', 'email_hourly_limit', parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  placeholder="100"
                />
                <span className="text-[11px] text-slate-500">Hostinger shared hosting enforces 100-200 emails/hr.</span>
              </div>
            </div>
          </div>

          {/* Webhook URLs Display */}
          {webhookInfo && (
            <div className="p-5 rounded-2xl border border-indigo-100 bg-indigo-50/40 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-indigo-900 text-sm">
                <LuGlobe className="w-4 h-4 text-indigo-600" />
                <span>Inbound Webhook URLs for this Campus</span>
              </div>
              <p className="text-xs text-indigo-700">
                Copy and paste these unique URLs into Meta Business Manager and your SMS gateway to receive instant delivery confirmations:
              </p>
              <div className="space-y-2 text-xs font-mono">
                {webhookInfo.whatsapp_webhook_url && (
                  <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-indigo-100">
                    <span className="truncate mr-2"><strong className="text-slate-700">WhatsApp:</strong> {webhookInfo.whatsapp_webhook_url}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(webhookInfo.whatsapp_webhook_url);
                        alert('WhatsApp Webhook URL copied to clipboard!');
                      }}
                      className="p-1 text-indigo-600 hover:text-indigo-800"
                      title="Copy URL"
                    >
                      <LuCopy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {webhookInfo.sms_webhook_url && (
                  <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-indigo-100">
                    <span className="truncate mr-2"><strong className="text-slate-700">SMS DLR:</strong> {webhookInfo.sms_webhook_url}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(webhookInfo.sms_webhook_url);
                        alert('SMS Webhook URL copied to clipboard!');
                      }}
                      className="p-1 text-indigo-600 hover:text-indigo-800"
                      title="Copy URL"
                    >
                      <LuCopy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => handleSaveGroup('integrations')}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-xl shadow-sm hover:bg-indigo-700 transition"
            >
              <LuSave className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Integration Credentials'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 7: Audit Trail */}
      {activeTab === 'audit_trail' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">System Audit Trail</h2>
              <p className="text-xs text-slate-500">Immutable tracking of created, updated, and deleted records across campus models.</p>
            </div>
            <button
              onClick={fetchAuditLogs}
              disabled={auditLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-medium text-xs rounded-xl hover:bg-slate-200 transition"
            >
              <LuRefreshCw className={`w-3.5 h-3.5 ${auditLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Log</span>
            </button>
          </div>

          {/* Audit Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Filter Action</label>
              <select
                value={auditFilter.event}
                onChange={(e) => setAuditFilter((prev) => ({ ...prev, event: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              >
                <option value="all">All Events</option>
                <option value="created">Created</option>
                <option value="updated">Updated</option>
                <option value="deleted">Deleted</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Search User / Target</label>
              <input
                type="text"
                value={auditFilter.search}
                onChange={(e) => setAuditFilter((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="Search by user name, role, IP or record ID..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>

          {/* Logs Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Model</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No audit log records found for this filter criteria.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => {
                    const shortModel = log.auditable_type ? log.auditable_type.split('\\').pop() : 'Record';
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 text-slate-500 font-mono">
                          {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {log.user_name || 'System'}
                          <span className="block text-[10px] text-slate-400 uppercase font-mono">{log.user_role}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                            log.event === 'created' ? 'bg-emerald-50 text-emerald-700' :
                            log.event === 'updated' ? 'bg-blue-50 text-blue-700' :
                            log.event === 'deleted' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {log.event}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700">
                          {shortModel} #{log.auditable_id}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono">{log.ip_address || '—'}</td>
                        <td className="py-3 px-4 text-right">
                          {(log.old_values || log.new_values) && (
                            <button
                              onClick={() => setActiveDiffModal(log)}
                              className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline inline-flex items-center gap-1"
                            >
                              <LuEye className="w-3.5 h-3.5" />
                              <span>Diff</span>
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
        </div>
      )}

      {/* New Academic Year Modal */}
      {isYearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-slate-900 text-base">Add New Academic Session</h3>
              <button onClick={() => setIsYearModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
            </div>

            <form onSubmit={handleCreateYear} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Session Name</label>
                  <input
                    type="text"
                    required
                    value={yearForm.name}
                    onChange={(e) => setYearForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    placeholder="2027-2028"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Code</label>
                  <input
                    type="text"
                    required
                    value={yearForm.code}
                    onChange={(e) => setYearForm((p) => ({ ...p, code: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    placeholder="AY-2027-28"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={yearForm.start_date}
                    onChange={(e) => setYearForm((p) => ({ ...p, start_date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={yearForm.end_date}
                    onChange={(e) => setYearForm((p) => ({ ...p, end_date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={yearForm.description}
                  onChange={(e) => setYearForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  placeholder="Notes about this academic cycle..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_current"
                  checked={yearForm.is_current}
                  onChange={(e) => setYearForm((p) => ({ ...p, is_current: e.target.checked }))}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label htmlFor="is_current" className="text-xs text-slate-700 font-medium">
                  Set immediately as active current session for this school
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsYearModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700"
                >
                  {saving ? 'Creating...' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Log Diff Modal */}
      {activeDiffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-semibold text-slate-900 text-base">Change Details Inspection</h3>
                <p className="text-xs text-slate-500">
                  {activeDiffModal.auditable_type?.split('\\').pop()} #{activeDiffModal.auditable_id} • {activeDiffModal.event?.toUpperCase()} by {activeDiffModal.user_name}
                </p>
              </div>
              <button onClick={() => setActiveDiffModal(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl overflow-x-auto max-h-80">
                <div className="text-[11px] font-bold text-rose-800 uppercase mb-2">Previous Attributes</div>
                <pre>{JSON.stringify(activeDiffModal.old_values || {}, null, 2)}</pre>
              </div>

              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl overflow-x-auto max-h-80">
                <div className="text-[11px] font-bold text-emerald-800 uppercase mb-2">Updated Attributes</div>
                <pre>{JSON.stringify(activeDiffModal.new_values || {}, null, 2)}</pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveDiffModal(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
