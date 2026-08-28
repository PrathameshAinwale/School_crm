import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { superAdminService } from '../../services/superAdminService';
import {
  LuBuilding2,
  LuPlus,
  LuSearch,
  LuFilter,
  LuCircleCheck,
  LuShieldAlert,
  LuEye,
  LuKeyRound,
  LuTrash2,
  LuRefreshCw,
  LuX,
  LuCheck,
  LuCopy,
  LuUser,
  LuMail,
  LuPhone,
  LuLayers,
  LuCalendar,
  LuSparkles,
  LuLock,
} from 'react-icons/lu';

export default function ManageSchoolsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // New School Onboarding Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    affiliation: 'CBSE',
    city: '',
    state: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    principal_name: '',
    subscription_plan: 'Enterprise',
    max_students: 3000,
    max_staff: 100,
    admin_name: '',
    admin_email: '',
    admin_password: '',
    admin_phone: '',
  });
  const [saving, setSaving] = useState(false);
  const [createdResult, setCreatedResult] = useState(null); // success credentials view

  // View Details Modal
  const [selectedSchool, setSelectedSchool] = useState(null);

  // Password Reset Modal
  const [resetModal, setResetModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const [toastMsg, setToastMsg] = useState('');
  const [copiedText, setCopiedText] = useState(false);

  const fetchSchools = async () => {
    try {
      const params = {};
      if (planFilter !== 'All') params.plan = planFilter;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (search) params.search = search;

      const res = await superAdminService.getSchools(params);
      if (res?.success) {
        setSchools(res.data?.schools || res.schools || []);
      }
    } catch (err) {
      console.error('Error fetching schools:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSchools();
    if (searchParams.get('action') === 'new') {
      setShowAddModal(true);
    }
  }, [planFilter, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSchools();
  };

  const handleOnboardSchool = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await superAdminService.createSchool(formData);
      if (res?.success) {
        setCreatedResult({
          school: res.data?.school,
          admin: res.data?.admin,
          plainPassword: formData.admin_password,
        });
        setToastMsg(`School "${formData.name}" onboarded and Admin account provisioned!`);
        fetchSchools();
      }
    } catch (err) {
      alert(err.data?.message || err.message || 'Failed to onboard school. Please check code or email uniqueness.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (school) => {
    const actionText = school.status === 'active' ? 'suspend' : 'activate';
    if (!window.confirm(`Are you sure you want to ${actionText} access for "${school.name}"?`)) return;

    try {
      const res = await superAdminService.toggleSchoolStatus(school.id);
      if (res?.success) {
        setToastMsg(`School status updated to ${res.status}.`);
        fetchSchools();
        setTimeout(() => setToastMsg(''), 4000);
      }
    } catch (err) {
      setToastMsg('Failed to update status.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetModal) return;
    setResetLoading(true);
    try {
      const res = await superAdminService.resetAdminPassword(resetModal.id, newPassword);
      if (res?.success) {
        setToastMsg(res.message || 'Admin password reset successfully.');
        setResetModal(null);
        setNewPassword('');
        setTimeout(() => setToastMsg(''), 6000);
      }
    } catch (err) {
      setToastMsg('Failed to reset password.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleDeleteSchool = async (school) => {
    if (!window.confirm(`WARNING: Are you sure you want to permanently delete "${school.name}" and all its tenant data?`)) return;
    try {
      const res = await superAdminService.deleteSchool(school.id);
      if (res?.success) {
        setToastMsg(`School "${school.name}" deleted.`);
        fetchSchools();
        setTimeout(() => setToastMsg(''), 4000);
      }
    } catch (err) {
      setToastMsg('Failed to delete school.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const resetForm = () => {
    setShowAddModal(false);
    setCreatedResult(null);
    setStep(1);
    setFormData({
      name: '',
      code: '',
      affiliation: 'CBSE',
      city: '',
      state: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      principal_name: '',
      subscription_plan: 'Enterprise',
      max_students: 3000,
      max_staff: 100,
      admin_name: '',
      admin_email: '',
      admin_password: '',
      admin_phone: '',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toastMsg && (
        <div className="p-4 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <LuCircleCheck className="w-5 h-5 text-teal-600 shrink-0" />
            <span className="text-sm font-semibold">{toastMsg}</span>
          </div>
          <button
            onClick={() => setToastMsg('')}
            className="text-xs font-semibold text-teal-600 hover:text-teal-900 ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Client Schools Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Onboard educational institutions, manage subscription plans & provision school administrator credentials
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchSchools();
            }}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <LuRefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => {
              setShowAddModal(true);
              setStep(1);
            }}
            className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs font-bold shadow-md shadow-primary-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <LuPlus className="w-4 h-4" />
            Onboard New School
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search school name, code, city, email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Plan:</span>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary-500"
            >
              <option value="All">All Plans</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Pro">Pro</option>
              <option value="Standard">Standard</option>
              <option value="Trial">Trial</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary-500"
            >
              <option value="All">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Schools Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">School & Code</th>
                <th className="py-3.5 px-4">Board / City</th>
                <th className="py-3.5 px-4">Subscription Plan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Capacity Utilization</th>
                <th className="py-3.5 px-4">Admin Account</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
              {schools.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No schools found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                schools.map((school) => (
                  <tr key={school.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{school.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Code: {school.code} • {school.email || '—'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-700">{school.affiliation}</div>
                      <div className="text-[11px] text-slate-400">{school.city}, {school.state}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <LuLayers className="w-3 h-3 text-indigo-500" />
                        {school.subscription_plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {school.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <LuCircleCheck className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <LuShieldAlert className="w-3 h-3" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">
                        {school.studentsCount} / {school.max_students} Students
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {school.staffCount} / {school.max_staff} Staff
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {school.admin ? (
                        <div>
                          <div className="font-semibold text-slate-800">{school.admin.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{school.admin.email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No admin assigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedSchool(school)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer"
                          title="View School Details"
                        >
                          <LuEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setResetModal(school);
                            setNewPassword(`admin@${school.code.toLowerCase()}`);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                          title="Reset Admin Password"
                        >
                          <LuKeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(school)}
                          className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                            school.status === 'active'
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={school.status === 'active' ? 'Suspend School Access' : 'Activate School'}
                        >
                          <LuShieldAlert className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSchool(school)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete School"
                        >
                          <LuTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard New School Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-scale-up my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                  <LuBuilding2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">
                    {createdResult ? 'School Onboarded Successfully!' : 'Onboard New School (Tenant)'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {createdResult
                      ? 'Save and share the generated administrator credentials.'
                      : `Step ${step} of 2: ${step === 1 ? 'School Information' : 'Admin Account Provisioning'}`}
                  </p>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {createdResult ? (
              <div className="py-6 space-y-5">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900">
                  <LuCircleCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">Tenant Provisioned: {createdResult.school.name}</h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      School Code: <strong>{createdResult.school.code}</strong> • Plan: <strong>{createdResult.school.subscription_plan}</strong>
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 font-mono text-xs shadow-inner">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-sans">
                    <span className="text-slate-400 font-bold">Generated Admin Login Credentials</span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `School: ${createdResult.school.name}\nSchool Code: ${createdResult.school.code}\nLogin URL: ${window.location.origin}/login\nEmail: ${createdResult.admin.email}\nPassword: ${createdResult.plainPassword}`
                        )
                      }
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedText ? <LuCheck className="w-3.5 h-3.5 text-emerald-400" /> : <LuCopy className="w-3.5 h-3.5" />}
                      {copiedText ? 'Copied!' : 'Copy Credentials'}
                    </button>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div>
                      <span className="text-slate-500">School Admin Name: </span>
                      <span className="text-amber-300 font-bold">{createdResult.admin.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Login Email / Identifier: </span>
                      <span className="text-amber-300 font-bold">{createdResult.admin.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Initial Password: </span>
                      <span className="text-emerald-400 font-bold">{createdResult.plainPassword}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={resetForm}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                  >
                    Done & Return to Schools Directory
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleOnboardSchool} className="space-y-4 pt-4">
                {step === 1 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">School Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => {
                            const name = e.target.value;
                            const autoCode = name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() + '-101';
                            setFormData({
                              ...formData,
                              name,
                              code: formData.code || autoCode,
                              admin_email: formData.admin_email || `admin@${name.replace(/[^a-zA-Z]/g, '').toLowerCase()}.com`,
                            });
                          }}
                          placeholder="e.g. Oakridge International School"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Unique School Code *</label>
                        <input
                          type="text"
                          required
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                          placeholder="e.g. OIS-101"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-primary-500 uppercase"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Board / Affiliation</label>
                        <select
                          value={formData.affiliation}
                          onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                        >
                          <option value="CBSE">CBSE</option>
                          <option value="ICSE">ICSE</option>
                          <option value="IB">IB (International Baccalaureate)</option>
                          <option value="Cambridge">Cambridge IGCSE</option>
                          <option value="State Board">State Board</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="e.g. Bengaluru"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          placeholder="e.g. Karnataka"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Subscription Plan *</label>
                        <select
                          value={formData.subscription_plan}
                          onChange={(e) => setFormData({ ...formData, subscription_plan: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-indigo-700 focus:outline-none focus:border-primary-500"
                        >
                          <option value="Enterprise">Enterprise (₹60,000/mo)</option>
                          <option value="Pro">Pro (₹35,000/mo)</option>
                          <option value="Standard">Standard (₹20,000/mo)</option>
                          <option value="Trial">Trial (30 Days)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Student Capacity Limit</label>
                        <input
                          type="number"
                          value={formData.max_students}
                          onChange={(e) => setFormData({ ...formData, max_students: Number(e.target.value) })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Limit</label>
                        <input
                          type="number"
                          value={formData.max_staff}
                          onChange={(e) => setFormData({ ...formData, max_staff: Number(e.target.value) })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (!formData.name || !formData.code || !formData.city) {
                            alert('Please fill in school name, code, and city.');
                            return;
                          }
                          setStep(2);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md cursor-pointer"
                      >
                        Next: Provision School Admin &rarr;
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                      <strong>Admin Credentials Provisioning:</strong> This account will be created with full School Administrator privileges scoped to <strong>{formData.name}</strong> ({formData.code}).
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Administrator Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.admin_name}
                        onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                        placeholder="e.g. Ramesh Kumar (Principal / Admin)"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Email (Login ID) *</label>
                        <input
                          type="email"
                          required
                          value={formData.admin_email}
                          onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                          placeholder="admin@school.com"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Password *</label>
                        <input
                          type="text"
                          required
                          value={formData.admin_password}
                          onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                          placeholder="e.g. 111111 or secretPass123"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        &larr; Back to School Info
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        <LuCircleCheck className="w-4 h-4" />
                        {saving ? 'Creating School & Admin...' : 'Create School & Generate Credentials'}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}

      {/* School Details Drawer / Modal */}
      {selectedSchool && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-scale-up space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <LuBuilding2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">{selectedSchool.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">Code: {selectedSchool.code}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSchool(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Board Affiliation:</span>
                <span className="font-bold text-slate-800">{selectedSchool.affiliation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-semibold text-slate-800">{selectedSchool.city}, {selectedSchool.state}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subscription Tier:</span>
                <span className="font-bold text-indigo-700">{selectedSchool.subscription_plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Renewal Date:</span>
                <span className="font-semibold text-slate-800">{selectedSchool.subscription_expires_at}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Student Capacity:</span>
                <span className="font-bold text-emerald-700">{selectedSchool.studentsCount} / {selectedSchool.max_students}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Staff Count:</span>
                <span className="font-bold text-purple-700">{selectedSchool.staffCount} / {selectedSchool.max_staff}</span>
              </div>
            </div>

            {selectedSchool.admin && (
              <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 text-xs space-y-1">
                <div className="font-bold text-amber-900">Primary Administrator</div>
                <div className="text-slate-700">{selectedSchool.admin.name}</div>
                <div className="text-slate-500 font-mono">{selectedSchool.admin.email}</div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedSchool(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Admin Password Modal */}
      {resetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-up space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <LuKeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Reset School Admin Password</h3>
                  <p className="text-xs text-slate-400">{resetModal.name}</p>
                </div>
              </div>
              <button
                onClick={() => setResetModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Temporary Password *</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="e.g. 111111"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-primary-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  The admin will be able to log in with this password and will be prompted to update it.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-60"
                >
                  {resetLoading ? 'Resetting...' : 'Confirm Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
