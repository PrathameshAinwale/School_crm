import React, { useState, useEffect } from 'react';
import { accountsService } from '../../services/accountsService';
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
  LuCreditCard,
  LuReceipt,
  LuWallet,
  LuLayers,
  LuBadgeCheck,
  LuGraduationCap,
} from 'react-icons/lu';

export default function AccountsProfilePage() {
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
      const res = await accountsService.getProfile();
      if (res?.success && res.data) {
        setProfile(res.data);
        setEditForm({
          name: res.data.name || '',
          phone: res.data.phone || '',
          email: res.data.email || '',
        });
      }
    } catch (err) {
      console.error('Failed to load accounts profile:', err);
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
      const res = await accountsService.updateProfile(editForm);
      if (res?.success) {
        setEditing(false);
        showToast('Accounts profile details updated successfully!');
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
      <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center shadow-xs max-w-5xl mx-auto my-8 animate-pulse">
        <LuLoader className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-4" />
        <h3 className="text-base font-bold text-slate-800">Loading Accounts Profile...</h3>
        <p className="text-xs text-slate-400 mt-1">Retrieving official financial officer records from database</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs max-w-4xl mx-auto my-8">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <LuShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Accounts Profile Not Found</h3>
        <p className="text-xs text-slate-400 mt-1">
          We could not resolve an active Accounts & Finance management record for your user account.
        </p>
      </div>
    );
  }

  const initials = (profile.name || 'Accounts')
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
        <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-indigo-800 p-5 sm:p-7 text-white">
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
                    {profile.employee_id || 'ACC-001'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-300 text-emerald-950 text-xs font-bold">
                    {profile.status || 'Active'}
                  </span>
                </div>

                <p className="text-emerald-100 text-xs sm:text-sm font-medium flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span>{profile.role || 'Accounts & Finance Lead'}</span>
                  <span>•</span>
                  <span>{profile.department || 'Accounts & Finance'}</span>
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-3 mt-2 text-xs text-emerald-200 flex-wrap">
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

      {/* Financial Leadership KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <LuCreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fee Collections Cleared</div>
            <div className="text-lg font-extrabold text-emerald-600 font-mono tracking-tight mt-0.5">
              ₹{Number(profile.total_fees_collected || 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <LuReceipt className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recorded Campus Expenses</div>
            <div className="text-lg font-extrabold text-slate-800 font-mono tracking-tight mt-0.5">
              ₹{Number(profile.total_expenses_recorded || 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <LuLayers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Managed Student Accounts</div>
            <div className="text-lg font-extrabold text-indigo-700 font-mono tracking-tight mt-0.5">
              {profile.managed_accounts_count || 1} Enrolled
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Official Role & Department Information */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <LuBriefcase className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              Official Role & Department Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Designation / Title</p>
              <p className="font-bold text-slate-800 text-xs sm:text-sm mt-0.5">{profile.role || 'Accounts & Finance Lead'}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Department</p>
              <p className="font-bold text-slate-800 text-xs sm:text-sm mt-0.5">{profile.department || 'Accounts & Finance'}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Employee ID</p>
              <p className="font-bold text-slate-800 font-mono text-xs sm:text-sm mt-0.5">{profile.employee_id || 'ACC-001'}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Account Status</p>
              <p className="font-bold text-emerald-600 text-xs sm:text-sm mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {profile.status || 'Active'}
              </p>
            </div>

            {profile.qualification && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Educational Qualification</p>
                <p className="font-bold text-slate-800 text-xs sm:text-sm mt-0.5 flex items-center gap-1.5">
                  <LuGraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  {profile.qualification}
                </p>
              </div>
            )}

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
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
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
                <p className="text-[10px] font-bold text-slate-400 uppercase">Primary Official Phone</p>
                <a
                  href={profile.phone ? `tel:${profile.phone}` : undefined}
                  className="font-bold text-slate-800 text-sm hover:text-emerald-600 font-mono transition-colors block truncate"
                >
                  {profile.phone || '—'}
                </a>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <LuMail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Official Email (Username)</p>
                <a
                  href={profile.email ? `mailto:${profile.email}` : undefined}
                  className="font-bold text-slate-800 text-sm hover:text-teal-600 transition-colors block truncate"
                >
                  {profile.email || '—'}
                </a>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <LuBuilding2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Campus Office / Desk</p>
                <p className="font-bold text-slate-800 text-xs mt-0.5">Finance Department • Room 104, Admin Block</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Authorized Financial Privileges & Module Access */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
            <LuBadgeCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Authorized Financial Privileges</h2>
            <p className="text-[11px] text-slate-400">Institutional responsibilities assigned to Accounts Officer credentials</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <LuCreditCard className="w-4 h-4 text-emerald-600" />
              <span>Fee Collection Ledgers</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Review standard/division dues, record cash/cheque/UPI receipts, push reminders.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <LuReceipt className="w-4 h-4 text-amber-600" />
              <span>Campus Expenses</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Log vendor invoices, academic procurement, utility bills, and resource expenditures.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <LuWallet className="w-4 h-4 text-indigo-600" />
              <span>Salary Disbursements</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Review monthly HR payroll batches, approve disbursements & generate bank references.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <LuShieldCheck className="w-4 h-4 text-primary-600" />
              <span>Audit & Reconciliation</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Track net monthly cashflow, recovery rate, outstanding term arrears & tax compliance.</p>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-scale-up">
            <div className="p-5 bg-gradient-to-r from-emerald-700 to-teal-700 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Edit Profile Details</h3>
                <p className="text-xs text-emerald-100 mt-0.5">Update your officer contact & display information</p>
              </div>
              <button
                onClick={() => setEditing(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <LuX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Accounts Officer Name"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="accounts@school.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Contact Number
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
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
