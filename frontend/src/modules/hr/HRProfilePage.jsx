import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  LuUser,
  LuPhone,
  LuMail,
  LuBriefcase,
  LuCalendar,
  LuCircleCheck,
  LuBuilding2,
  LuPencil,
  LuX,
  LuSave,
  LuLoader,
  LuShieldCheck,
  LuUsers,
} from 'react-icons/lu';

export default function HRProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await adminService.getHrProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        setEditForm({
          name: res.data.name || '',
          phone: res.data.phone || '',
          email: res.data.email || '',
        });
      }
    } catch (err) {
      console.error('Failed to load HR profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminService.updateHrProfile(editForm);
      if (res.success) {
        setEditing(false);
        showToast('HR profile details updated successfully!');
        loadProfile();
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center shadow-xs max-w-5xl mx-auto my-8">
        <LuLoader className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
        <h3 className="text-base font-bold text-slate-800">Loading HR Profile...</h3>
        <p className="text-xs text-slate-400 mt-1">Retrieving official HR management records from database</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs max-w-4xl mx-auto my-8">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <LuShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">HR Profile Not Found</h3>
        <p className="text-xs text-slate-400 mt-1">
          We could not resolve an active HR management record for your user account.
        </p>
      </div>
    );
  }

  const initials = (profile.name || 'HR')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-slide-up">
          <LuCircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Profile Header Banner */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-primary-700 p-5 sm:p-7 text-white">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center text-2xl sm:text-3xl font-extrabold border-2 border-white/30 shadow-md shrink-0">
                {initials}
              </div>
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    {profile.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/25 text-white font-mono text-xs font-bold backdrop-blur-xs">
                    {profile.employee_id || 'EMP-HR-001'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 text-xs font-bold">
                    {profile.status || 'Active'}
                  </span>
                </div>

                <p className="text-purple-100 text-xs sm:text-sm font-medium flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span>{profile.role || 'HR Lead'}</span>
                  <span>•</span>
                  <span>{profile.department || 'Human Resources'}</span>
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-3 mt-2 text-xs text-purple-200 flex-wrap">
                  {profile.email && (
                    <span className="flex items-center gap-1">
                      <LuMail className="w-3.5 h-3.5" /> {profile.email}
                    </span>
                  )}
                  {profile.phone && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <LuPhone className="w-3.5 h-3.5" /> {profile.phone}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 active:bg-white/40 text-white font-semibold text-xs border border-white/30 backdrop-blur-md transition-all flex items-center gap-2 shadow-xs shrink-0 self-center sm:self-start cursor-pointer"
            >
              <LuPencil className="w-3.5 h-3.5" /> Edit Profile Details
            </button>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Official Role & Department Information */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <LuBriefcase className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              Official Role & Department Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Designation / Title</p>
              <p className="font-bold text-slate-800 text-xs sm:text-sm mt-0.5">{profile.role || 'HR Lead'}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Department</p>
              <p className="font-bold text-slate-800 text-xs sm:text-sm mt-0.5">{profile.department || 'Human Resources'}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Employee ID</p>
              <p className="font-bold text-slate-800 font-mono text-xs sm:text-sm mt-0.5">{profile.employee_id || 'EMP-HR-001'}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Account Status</p>
              <p className="font-bold text-emerald-600 text-xs sm:text-sm mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {profile.status || 'Active'}
              </p>
            </div>

            {profile.joining_date && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Registration / Joining Date</p>
                <p className="font-bold text-slate-800 text-xs sm:text-sm mt-0.5 flex items-center gap-1.5">
                  <LuCalendar className="w-3.5 h-3.5 text-primary-600" />
                  {profile.joining_date}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <LuPhone className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              Contact & Communication
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <LuPhone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Primary Contact Phone</p>
                <a
                  href={profile.phone ? `tel:${profile.phone}` : undefined}
                  className="font-bold text-slate-800 text-sm hover:text-primary-600 font-mono transition-colors block truncate"
                >
                  {profile.phone || '—'}
                </a>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <LuMail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Official Email Address</p>
                <a
                  href={profile.email ? `mailto:${profile.email}` : undefined}
                  className="font-bold text-slate-800 text-sm hover:text-primary-600 transition-colors block truncate"
                >
                  {profile.email || '—'}
                </a>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <LuUsers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-purple-700 uppercase">Teaching Faculty Managed</p>
                <p className="font-extrabold text-purple-950 text-sm">
                  {profile.managed_staff_count || 0} Staff Members in Registry
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full my-6 overflow-hidden animate-scale-up">
            <div className="bg-gradient-to-r from-purple-700 to-indigo-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <LuPencil className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Edit HR Profile Details</h3>
                  <p className="text-purple-100 text-xs">Update your official name, email, and phone</p>
                </div>
              </div>
              <button
                onClick={() => setEditing(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g. Pooja Sharma"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mobile Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-purple-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Official Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="hr@school.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-purple-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <LuLoader className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <LuSave className="w-3.5 h-3.5" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
