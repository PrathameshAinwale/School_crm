import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
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
  LuPencil,
  LuX,
  LuSave,
  LuLoader,
  LuAward,
  LuLayers,
  LuHeart,
} from 'react-icons/lu';

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    phone: '',
    gender: 'Male',
    blood_group: 'O+',
    qualification: '',
    experience: '',
    address: '',
    emergency_contact: '',
  });

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await adminService.getTeacherProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        setEditForm({
          phone: res.data.phone || '',
          gender: res.data.gender || 'Male',
          blood_group: res.data.blood_group || 'O+',
          qualification: res.data.qualification || '',
          experience: res.data.experience || '',
          address: res.data.address || '',
          emergency_contact: res.data.emergency_contact || '',
        });
      }
    } catch (err) {
      console.error('Failed to load teacher profile:', err);
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
      const res = await adminService.updateTeacherProfile(editForm);
      if (res.success) {
        setEditing(false);
        showToast('Faculty profile information updated successfully!');
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
        <h3 className="text-base font-bold text-slate-800">Loading Faculty Profile...</h3>
        <p className="text-xs text-slate-400 mt-1">Retrieving official teacher records from database</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs max-w-4xl mx-auto my-8">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
          <LuUser className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Faculty Profile Not Found</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          We could not resolve an active teacher profile record for your account.
        </p>
      </div>
    );
  }

  const assignedSubjects = Array.isArray(profile.assigned_subjects) && profile.assigned_subjects.length > 0
    ? profile.assigned_subjects
    : [];

  const assignedClasses = Array.isArray(profile.assigned_classes) && profile.assigned_classes.length > 0
    ? profile.assigned_classes
    : [];

  const initials = (profile.full_name || profile.first_name || 'T')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-14 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-slide-up border border-slate-700">
          <LuCircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Profile Header Banner */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-700 p-5 sm:p-7 text-white relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center text-2xl sm:text-3xl font-extrabold border-2 border-white/30 shadow-md shrink-0">
                {initials}
              </div>
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    {profile.full_name || `${profile.first_name} ${profile.last_name || ''}`}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/25 text-white font-mono text-xs font-bold backdrop-blur-xs">
                    {profile.teacher_id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 text-xs font-bold">
                    {profile.status || 'Active'}
                  </span>
                </div>
                <p className="text-primary-100 text-xs sm:text-sm font-medium flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span>{profile.department || 'Academic'} Department</span>
                  {profile.qualification && (
                    <>
                      <span>•</span>
                      <span>{profile.qualification}</span>
                    </>
                  )}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-3 mt-2 text-xs text-primary-200 flex-wrap">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Left Column: Academic & Teaching Assignments */}
        <div className="lg:col-span-1 space-y-5">
          {/* Department & Employment Status */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <LuBuilding2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Employment Details</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Department</span>
                <span className="font-bold text-slate-800">{profile.department || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Joining Date</span>
                <span className="font-bold text-slate-800">{profile.joining_date || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Faculty Role</span>
                <span className="font-bold text-slate-800">Teaching Staff</span>
              </div>
              {profile.class_teacher_class && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Class Teacher</span>
                  <span className="font-bold text-primary-700">
                    {profile.class_teacher_class} {profile.class_teacher_division ? `(${profile.class_teacher_division})` : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Classes Card */}
          {assignedClasses.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                  <LuGraduationCap className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Assigned Classes</h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {assignedClasses.map((cls, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5"
                  >
                    <LuLayers className="w-3.5 h-3.5 text-primary-600" />
                    {cls}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Teaching Subjects Card */}
          {assignedSubjects.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <LuBookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Teaching Subjects</h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {assignedSubjects.map((sub, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold text-xs flex items-center gap-1.5"
                  >
                    <LuAward className="w-3.5 h-3.5 text-indigo-500" />
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Personal & Contact Information */}
        <div className="lg:col-span-2 space-y-5">
          {/* Professional Credentials Card */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <LuBriefcase className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Personal & Demographic Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Highest Qualification</span>
                <span className="font-bold text-slate-800">{profile.qualification || '—'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Teaching Experience</span>
                <span className="font-bold text-slate-800">{profile.experience || '—'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Date of Birth</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <LuCalendar className="w-3.5 h-3.5 text-primary-600" />
                  {profile.date_of_birth || '—'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Gender</span>
                <span className="font-bold text-slate-800">{profile.gender || '—'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Blood Group</span>
                <span className="font-bold text-rose-600 flex items-center gap-1">
                  <LuHeart className="w-3.5 h-3.5 text-rose-500" />
                  {profile.blood_group || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details & Address Card */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <LuPhone className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Contact & Residential Details</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Primary Mobile Number</span>
                  <span className="font-bold text-slate-800 font-mono">{profile.phone || '—'}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Emergency Contact</span>
                  <span className="font-bold text-slate-800 font-mono">{profile.emergency_contact || '—'}</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1 flex items-center gap-1">
                  <LuMapPin className="w-3.5 h-3.5 text-primary-600" /> Residential Address
                </span>
                <span className="font-medium text-slate-700 text-xs leading-relaxed">
                  {profile.address || '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full my-4 sm:my-8 overflow-hidden animate-scale-up">
            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <LuPencil className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Update Profile & Contact Details</h3>
                  <p className="text-primary-100 text-xs">Synchronize personal details directly with school database</p>
                </div>
              </div>
              <button
                onClick={() => setEditing(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-5 sm:p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mobile Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={editForm.emergency_contact}
                    onChange={(e) => setEditForm({ ...editForm, emergency_contact: e.target.value })}
                    placeholder="+91 98223 34455"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={editForm.blood_group}
                    onChange={(e) => setEditForm({ ...editForm, blood_group: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Highest Qualification</label>
                <input
                  type="text"
                  value={editForm.qualification}
                  onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
                  placeholder="e.g. M.Sc. Mathematics, B.Ed."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Teaching Experience</label>
                <input
                  type="text"
                  value={editForm.experience}
                  onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                  placeholder="e.g. 5 Years Senior Secondary Educator"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Residential Street Address</label>
                <textarea
                  rows={2}
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  placeholder="Full permanent residential address..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary-500 font-medium resize-none"
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
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-primary-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-60"
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
