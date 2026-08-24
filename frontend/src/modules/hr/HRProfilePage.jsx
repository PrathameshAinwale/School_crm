import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import {
  LuUser,
  LuPhone,
  LuMail,
  LuMapPin,
  LuBriefcase,
  LuGraduationCap,
  LuCalendar,
  LuCircleCheck,
  LuBuilding2,
  LuBookOpen,
  LuClock,
  LuPencil,
  LuX,
  LuSave,
  LuLoader,
  LuHeartHandshake,
  LuAward,
  LuClipboardCheck,
  LuFileText,
  LuShieldCheck,
  LuBanknote,
  LuUsers,
  LuPresentation,
  LuMegaphone,
  LuArrowRight,
  LuSparkles,
} from 'react-icons/lu';

export default function HRProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    phone: '',
    office_location: '',
    qualification: '',
    experience: '',
    address: '',
    emergency_contact: '',
  });

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await adminService.getHrProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        setEditForm({
          phone: res.data.phone || '',
          office_location: res.data.office_location || '',
          qualification: res.data.qualification || '',
          experience: res.data.experience || '',
          address: res.data.address || '',
          emergency_contact: res.data.emergency_contact || '',
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
      <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center shadow-xs max-w-5xl mx-auto my-8">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <LuShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">HR Profile Not Found</h3>
        <p className="text-xs text-slate-400 mt-1">
          We could not resolve an active HR management record for your user account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-800 animate-bounce">
          <LuCircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Profile Header Banner */}
      <div className="relative bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute right-6 top-6 flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs font-semibold">
            <LuSparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>HR Administration Portal</span>
          </div>
        </div>

        <div className="px-6 pb-6 pt-0 sm:flex sm:items-end sm:justify-between -mt-14 relative z-10">
          <div className="sm:flex sm:items-center sm:gap-5">
            <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg border-2 border-white shrink-0">
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary-600 to-indigo-700 text-white flex items-center justify-center font-black text-2xl tracking-wider shadow-inner">
                {profile.first_name?.[0] || 'H'}{profile.last_name?.[0] || 'R'}
              </div>
            </div>

            <div className="mt-3 sm:mt-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  {profile.full_name || profile.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary-50 text-primary-700 border border-primary-100">
                  {profile.employee_id || 'EMP-HR-001'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {profile.status || 'Active'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 font-medium mt-1">
                <span className="text-primary-700 font-semibold">{profile.designation}</span>
                <span>•</span>
                <span>{profile.department}</span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <LuMail className="w-3.5 h-3.5 text-slate-400" /> {profile.email}
                </span>
                <span className="flex items-center gap-1">
                  <LuPhone className="w-3.5 h-3.5 text-slate-400" /> {profile.phone}
                </span>
                <span className="flex items-center gap-1">
                  <LuBuilding2 className="w-3.5 h-3.5 text-slate-400" /> {profile.office_location}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-0 shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <LuPencil className="w-3.5 h-3.5" /> Edit Profile Contact
            </button>
          </div>
        </div>

        {/* 4 Overview Metric Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-slate-100 bg-slate-50/50 divide-x divide-y sm:divide-y-0 divide-slate-100">
          <div className="p-4 text-center">
            <p className="text-xl font-bold text-slate-900">
              {profile.stats?.total_staff || 12}
            </p>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Faculty Staff Managed</p>
          </div>

          <div className="p-4 text-center">
            <p className="text-xl font-bold text-amber-600">
              {profile.stats?.pending_leaves || 0}
            </p>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Pending Leave Requests</p>
          </div>

          <div className="p-4 text-center">
            <p className="text-xl font-bold text-emerald-600">
              {profile.stats?.disbursed_salaries || 12}
            </p>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Salaries Disbursed (Month)</p>
          </div>

          <div className="p-4 text-center">
            <p className="text-xl font-bold text-purple-600">
              {profile.stats?.active_trainings || 2}
            </p>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Faculty Trainings Muster</p>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Employment & Personal Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Official Designation & Employment Info */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
              <LuBriefcase className="w-4 h-4 text-primary-600" />
              Official Employment & Designation Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400">Designation / Title</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{profile.designation}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400">Department</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{profile.department}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400">Office Work Station</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{profile.office_location}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400">Joining Date</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{profile.joining_date}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400">Highest Qualification</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{profile.qualification}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400">Total Experience</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{profile.experience}</p>
              </div>
            </div>
          </div>

          {/* Key HR Responsibilities */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
              <LuClipboardCheck className="w-4 h-4 text-emerald-600" />
              HR Scope of Responsibilities & Administrative Authority
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(profile.responsibilities || [
                'Faculty Recruitment, Onboarding & Contracts',
                'Biometric Staff Attendance & Overtime Auditing',
                'Monthly Payroll Calculation & Disbursals',
                'Faculty Training & Professional Development Muster',
                'Leave Policy Administration & Sanctions',
                'Institutional Event Coordination & Compliance',
              ]).map((resp, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <LuCircleCheck className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed">{resp}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Personal Info & HR Action Shortcuts */}
        <div className="space-y-6">
          {/* Personal & Emergency Contacts */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
              <LuUser className="w-4 h-4 text-primary-600" />
              Personal & Contact Details
            </h2>

            <div className="space-y-3.5 text-xs">
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Gender & DOB</p>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {profile.gender} • {profile.date_of_birth}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400">Official Email</p>
                <p className="font-semibold text-slate-800 mt-0.5">{profile.email}</p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400">Contact Number</p>
                <p className="font-semibold text-slate-800 mt-0.5">{profile.phone}</p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400">Emergency Contact</p>
                <p className="font-semibold text-rose-600 mt-0.5">{profile.emergency_contact}</p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400">Residential Address</p>
                <p className="font-medium text-slate-600 mt-0.5 leading-relaxed">{profile.address}</p>
              </div>
            </div>
          </div>

          {/* Quick Operations Shortcuts */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
              <LuShieldCheck className="w-4 h-4 text-indigo-600" />
              HR Operations Shortcuts
            </h2>

            <div className="space-y-2">
              <button
                onClick={() => navigate('/hr/staff-leaves')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-50/70 hover:bg-amber-100/70 text-amber-900 text-xs font-semibold transition-colors border border-amber-100 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <LuFileText className="w-4 h-4 text-amber-600" />
                  <span>Review Staff Leave Requests</span>
                </div>
                <LuArrowRight className="w-3.5 h-3.5 text-amber-600" />
              </button>

              <button
                onClick={() => navigate('/salary')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-900 text-xs font-semibold transition-colors border border-emerald-100 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <LuBanknote className="w-4 h-4 text-emerald-600" />
                  <span>Process Staff Payroll & Salaries</span>
                </div>
                <LuArrowRight className="w-3.5 h-3.5 text-emerald-600" />
              </button>

              <button
                onClick={() => navigate('/hr/staff-attendance')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-blue-50/70 hover:bg-blue-100/70 text-blue-900 text-xs font-semibold transition-colors border border-blue-100 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <LuClock className="w-4 h-4 text-blue-600" />
                  <span>Audit Daily Staff Attendance</span>
                </div>
                <LuArrowRight className="w-3.5 h-3.5 text-blue-600" />
              </button>

              <button
                onClick={() => navigate('/trainings')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-purple-50/70 hover:bg-purple-100/70 text-purple-900 text-xs font-semibold transition-colors border border-purple-100 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <LuPresentation className="w-4 h-4 text-purple-600" />
                  <span>Schedule Faculty Trainings</span>
                </div>
                <LuArrowRight className="w-3.5 h-3.5 text-purple-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  <LuPencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Edit HR Contact Information</h3>
                  <p className="text-[11px] text-slate-400">Update official contact and workstation details</p>
                </div>
              </div>
              <button
                onClick={() => setEditing(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <LuX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-primary-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Office Work Station / Cabin
                </label>
                <input
                  type="text"
                  value={editForm.office_location}
                  onChange={(e) => setEditForm({ ...editForm, office_location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-primary-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Qualifications & Certs
                  </label>
                  <input
                    type="text"
                    value={editForm.qualification}
                    onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-primary-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Experience Details
                  </label>
                  <input
                    type="text"
                    value={editForm.experience}
                    onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-primary-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  value={editForm.emergency_contact}
                  onChange={(e) => setEditForm({ ...editForm, emergency_contact: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-primary-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Residential Address
                </label>
                <textarea
                  rows="2"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-primary-500 font-medium resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {saving ? <LuLoader className="w-3.5 h-3.5 animate-spin" /> : <LuSave className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
