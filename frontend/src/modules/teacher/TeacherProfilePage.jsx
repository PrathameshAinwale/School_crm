import React, { useState, useEffect } from 'react';
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
} from 'react-icons/lu';

export default function TeacherProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    phone: '',
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
        showToast('Profile information updated successfully in database!');
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
          We could not resolve an active teacher profile record for your user account.
        </p>
      </div>
    );
  }

  const assignedSubjects = Array.isArray(profile.assigned_subjects)
    ? profile.assigned_subjects
    : [profile.assigned_subjects || 'General Curriculum'];

  const assignedClasses = Array.isArray(profile.assigned_classes)
    ? profile.assigned_classes
    : [profile.assigned_classes || 'Assigned Division'];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-14 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-scale-up border border-slate-700">
          <LuCircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Profile Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-700 p-6 sm:p-8 text-white relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center text-2xl sm:text-3xl font-extrabold border-2 border-white/30 shadow-lg shrink-0">
                {profile.first_name?.[0] || 'T'}{profile.last_name?.[0] || ''}
              </div>
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {profile.full_name || profile.name}
                  </h1>
                  <span className="px-3 py-1 rounded-full bg-white/25 text-white font-mono text-xs font-bold backdrop-blur-xs">
                    {profile.teacher_id}
                  </span>
                  <span className="px-3 py-0.5 rounded-full bg-emerald-400/30 text-emerald-100 text-xs font-semibold border border-emerald-300/40">
                    ● {profile.status || 'Active'}
                  </span>
                </div>
                <p className="text-primary-100 text-xs sm:text-sm font-medium flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span>{profile.department} Department</span>
                  <span>•</span>
                  <span>{profile.qualification}</span>
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-3 mt-3 text-xs text-primary-200 flex-wrap">
                  <span className="flex items-center gap-1">
                    <LuMail className="w-3.5 h-3.5" /> {profile.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <LuPhone className="w-3.5 h-3.5" /> {profile.phone}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white font-semibold text-xs border border-white/30 backdrop-blur-md transition-all flex items-center gap-2 shadow-sm shrink-0 self-center sm:self-start"
            >
              <LuPencil className="w-3.5 h-3.5" /> Edit Profile Contact
            </button>
          </div>
        </div>

        {/* Quick Highlights Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 bg-slate-50/70 border-t border-slate-100">
          <div className="p-4 sm:p-5 text-center">
            <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Attendance Rate</div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-0.5">
              {profile.stats?.attendance_rate || '98.5%'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Muster turnout this month</div>
          </div>
          <div className="p-4 sm:p-5 text-center">
            <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Assignments</div>
            <div className="text-xl sm:text-2xl font-extrabold text-primary-600 mt-0.5">
              {profile.stats?.assignments_created || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Created for assigned classes</div>
          </div>
          <div className="p-4 sm:p-5 text-center">
            <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Submissions</div>
            <div className="text-xl sm:text-2xl font-extrabold text-indigo-600 mt-0.5">
              {profile.stats?.submissions_reviewed || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Student homework received</div>
          </div>
          <div className="p-4 sm:p-5 text-center">
            <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Leaves Taken</div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-700 mt-0.5">
              {profile.stats?.leaves_taken || '0 Days'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Approved academic year leaves</div>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Academic & Teaching Assignments */}
        <div className="lg:col-span-1 space-y-6">
          {/* Assigned Classes Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                <LuGraduationCap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Assigned Classes</h3>
            </div>

            <div className="space-y-2">
              {assignedClasses.map((cls, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-50 hover:bg-primary-50/50 rounded-2xl border border-slate-200/60 transition-colors"
                >
                  <span className="text-xs font-bold text-slate-700">{cls}</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-primary-700">
                    Class Teacher / Faculty
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Teaching Subjects Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
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

          {/* Department & Employment Status */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <LuBuilding2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Department Info</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Department</span>
                <span className="font-bold text-slate-800">{profile.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Joined On</span>
                <span className="font-bold text-slate-800">{profile.joining_date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Role</span>
                <span className="font-bold text-slate-800">Faculty Educator</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Personal & Contact Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Professional Credentials Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <LuBriefcase className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Professional Qualifications & Experience</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">Highest Qualification</span>
                <span className="font-bold text-slate-800 text-sm">{profile.qualification || 'M.A., B.Ed'}</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">Teaching Experience</span>
                <span className="font-bold text-slate-800 text-sm">{profile.experience || '5+ Years'}</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">Date of Birth</span>
                <span className="font-bold text-slate-800 text-sm">{profile.date_of_birth}</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">Gender</span>
                <span className="font-bold text-slate-800 text-sm">{profile.gender}</span>
              </div>
            </div>
          </div>

          {/* Contact Details & Address Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <LuPhone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Contact & Residential Details</h3>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">Primary Mobile Number</span>
                  <span className="font-bold text-slate-800 text-sm">{profile.phone || '—'}</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">Emergency Contact</span>
                  <span className="font-bold text-slate-800 text-sm">{profile.emergency_contact || '—'}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
                  <LuMapPin className="w-3.5 h-3.5 text-primary-600" /> Residential Address
                </span>
                <span className="font-medium text-slate-800 text-xs leading-relaxed">
                  {profile.address || 'Address not updated in system'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full my-8 overflow-hidden animate-scale-up">
            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <LuPencil className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Update Profile Contact Details</h3>
                  <p className="text-primary-100 text-xs">Synchronize personal details directly with school database</p>
                </div>
              </div>
              <button
                onClick={() => setEditing(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={editForm.emergency_contact}
                    onChange={(e) => setEditForm({ ...editForm, emergency_contact: e.target.value })}
                    placeholder="+91 98223 34455"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Educational Qualification</label>
                <input
                  type="text"
                  value={editForm.qualification}
                  onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
                  placeholder="M.A. English Literature, B.Ed."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Teaching Experience</label>
                <input
                  type="text"
                  value={editForm.experience}
                  onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                  placeholder="6 Years Senior Secondary Educator"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
                <textarea
                  rows={3}
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  placeholder="Full permanent residential address..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-medium resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-primary-500/20 flex items-center gap-2 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <LuLoader className="w-3.5 h-3.5 animate-spin" /> Saving Changes...
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
