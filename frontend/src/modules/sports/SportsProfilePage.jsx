import React, { useState, useEffect } from 'react';
import { sportsService } from '../../services/sportsService';
import {
  LuUser,
  LuPhone,
  LuMail,
  LuBriefcase,
  LuCalendar,
  LuBuilding2,
  LuPencil,
  LuX,
  LuSave,
  LuLoader,
  LuShieldCheck,
  LuTrophy,
  LuMedal,
  LuAward,
} from 'react-icons/lu';

export default function SportsProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await sportsService.getProfile();
      if (res?.success && res.data) {
        setProfile(res.data);
        setEditForm({
          name: res.data.name || '',
          phone: res.data.phone || '',
          email: res.data.email || '',
        });
      }
    } catch (err) {
      console.error('Failed to load sports profile:', err);
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
      const res = await sportsService.updateProfile(editForm);
      if (res?.success) {
        setEditing(false);
        showToast('Profile information successfully updated.');
        loadProfile();
      }
    } catch (err) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 gap-3">
        <LuLoader className="w-8 h-8 animate-spin text-primary-600" />
        <span className="text-xs font-semibold">Loading sports incharge profile...</span>
      </div>
    );
  }

  if (!profile) return null;

  const initials = profile.name
    ? profile.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'SP';

  return (
    <div className="space-y-5 sm:space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-slide-up border border-slate-700">
          <LuAward className="w-4 h-4 text-primary-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Profile Hero Header Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-primary-700 via-indigo-700 to-primary-900 p-5 sm:p-7 text-white relative">
          <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center text-2xl sm:text-3xl font-extrabold border-2 border-white/30 shadow-md shrink-0">
                {initials}
              </div>
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    {profile.name}
                  </h1>
                </div>

                <p className="text-primary-100 text-xs sm:text-sm font-medium flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span>{profile.role || 'Sports Incharge & PE Director'}</span>
                  <span>•</span>
                  <span>{profile.department || 'Physical Education & Athletics'}</span>
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-3 mt-2 text-xs text-primary-200 flex-wrap">
                  {profile.email && (
                    <span className="flex items-center gap-1">
                      <LuMail className="w-3.5 h-3.5" /> {profile.email}
                    </span>
                  )}
                  {profile.phone && (
                    <span className="flex items-center gap-1">
                      <LuPhone className="w-3.5 h-3.5" /> {profile.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="px-3.5 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs border border-white/30 backdrop-blur-md transition-all flex items-center gap-1.5 shadow-xs shrink-0 self-center sm:self-start cursor-pointer"
            >
              <LuPencil className="w-3.5 h-3.5" /> Edit Profile Details
            </button>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Official Role & Department Information */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              <LuBriefcase className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              Official Role & Department Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">Designation</span>
              <p className="font-bold text-slate-800 mt-0.5">{profile.designation || 'Sports Incharge'}</p>
            </div>
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">Department</span>
              <p className="font-bold text-slate-800 mt-0.5">{profile.department}</p>
            </div>
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">Academic & PE Qualifications</span>
              <p className="font-bold text-slate-800 mt-0.5">{profile.qualifications}</p>
            </div>
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">Coaching Specialization</span>
              <p className="font-bold text-slate-800 mt-0.5">{profile.specialization}</p>
            </div>
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">Date of Appointment</span>
              <p className="font-bold text-slate-800 mt-0.5">{profile.joining_date || '2022-07-01'}</p>
            </div>
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">Employee Reference ID</span>
              <p className="font-mono font-bold text-slate-800 mt-0.5">{profile.employee_id}</p>
            </div>
          </div>
        </div>

        {/* Contact & Office Information */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <LuBuilding2 className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              Campus Office & Contact
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">Email Address</span>
              <p className="font-bold text-slate-800 mt-0.5">{profile.email}</p>
            </div>
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">Mobile Number</span>
              <p className="font-bold text-slate-800 mt-0.5">{profile.phone || '—'}</p>
            </div>
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 col-span-1 sm:col-span-2">
              <span className="text-[11px] text-slate-400 font-medium">Campus Physical Education Office</span>
              <p className="font-bold text-slate-800 mt-0.5">
                Sports Pavilion Room 102, Near Main Athletics Turf, Delhi Public Academy
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Edit Profile Details</h3>
              <button onClick={() => setEditing(false)} className="text-slate-400 hover:text-slate-700">
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-3.5 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-lg sm:rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving ? <LuLoader className="w-3.5 h-3.5 animate-spin" /> : <LuSave className="w-3.5 h-3.5" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
