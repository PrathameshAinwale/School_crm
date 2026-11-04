import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LuUser,
  LuBuilding2,
  LuShieldCheck,
  LuKey,
  LuMail,
  LuPhone,
  LuLayers,
  LuCheck,
  LuPlus,
  LuTrash2,
  LuLock,
  LuEye,
  LuEyeOff,
  LuLoader,
  LuCircleAlert,
  LuCircleCheck,
  LuArrowRight,
  LuPencil,
  LuSave,
  LuX,
  LuMapPin,
  LuAward,
  LuSparkles,
} from 'react-icons/lu';

export default function AdminProfilePage() {
  const {
    user,
    currentRole,
    currentSchool,
    linkedSchoolAccounts = [],
    addSchoolAccount,
    switchSchoolAccount,
    removeSchoolAccount,
    changePassword,
    updateProfile,
    ROLE_LABELS,
  } = useAuth();

  const userRole = (user?.role || currentRole || '').toLowerCase();
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab') || 'overview';
  const initialTab = (!isAdmin && requestedTab === 'switch-school') ? 'overview' : requestedTab;
  const [activeTab, setActiveTab] = useState(initialTab);

  // Edit Profile Form state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  // Keep form in sync with user
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleStartEditing = () => {
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setEditError('');
    setEditSuccess('');
    setIsEditing(true);
    if (activeTab !== 'overview') {
      handleTabChange('overview');
    }
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditError('');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      setEditError('Full name is required.');
      return;
    }
    if (!editForm.email.trim()) {
      setEditError('Email address is required.');
      return;
    }

    setEditLoading(true);
    setEditError('');
    setEditSuccess('');

    try {
      const res = await updateProfile({
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
      });
      if (res.success) {
        setEditSuccess(res.message || 'Profile details updated successfully!');
        setIsEditing(false);
      } else {
        setEditError(res.message || 'Failed to update profile details.');
      }
    } catch (err) {
      setEditError(err.data?.message || err.message || 'Failed to update profile details.');
    } finally {
      setEditLoading(false);
    }
  };

  // Switch School Form state
  const [connectIdentifier, setConnectIdentifier] = useState('');
  const [connectPassword, setConnectPassword] = useState('');
  const [showConnectPassword, setShowConnectPassword] = useState(false);
  const [autoSwitchConnect, setAutoSwitchConnect] = useState(true);
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectError, setConnectError] = useState('');
  const [connectSuccess, setConnectSuccess] = useState('');

  // Password change state
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  const [switchingAccountId, setSwitchingAccountId] = useState(null);

  // Sync tab with URL
  const handleTabChange = (tabId) => {
    if (!isAdmin && tabId === 'switch-school') return;
    setActiveTab(tabId);
    setSearchParams(tabId === 'overview' ? {} : { tab: tabId });
  };

  const handleConnectSchool = async (e) => {
    e.preventDefault();
    if (!connectIdentifier.trim() || !connectPassword) {
      setConnectError('Please enter both the school admin email and password.');
      return;
    }

    setConnectLoading(true);
    setConnectError('');
    setConnectSuccess('');

    try {
      const res = await addSchoolAccount(connectIdentifier.trim(), connectPassword, autoSwitchConnect);
      if (res.success) {
        setConnectSuccess(res.message || 'School account linked successfully!');
        setConnectIdentifier('');
        setConnectPassword('');
      } else {
        setConnectError(res.message || 'Failed to authenticate school credentials.');
      }
    } catch (err) {
      setConnectError(err.message || 'Failed to connect. Please check credentials.');
    } finally {
      setConnectLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPwd.length < 6) {
      setPwdError('New password must be at least 6 characters.');
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError('New password and confirmation do not match.');
      return;
    }

    setPwdLoading(true);
    setPwdError('');
    setPwdSuccess('');

    try {
      const res = await changePassword(currentPwd, newPwd, confirmPwd);
      if (res.success) {
        setPwdSuccess(`Password for ${user?.name || 'your account'} (${user?.email || ''}) has been updated successfully.`);
        setCurrentPwd('');
        setNewPwd('');
        setConfirmPwd('');
      } else {
        setPwdError(res.message || 'Failed to update password.');
      }
    } catch (err) {
      setPwdError(err.data?.message || err.message || 'Failed to update password.');
    } finally {
      setPwdLoading(false);
    }
  };

  const activeSchoolId = user?.school_id || currentSchool?.id;
  const activeSchoolName = currentSchool?.name || user?.school?.name || '';
  const activeSchoolCode = currentSchool?.code || user?.school?.code || '';

  const initials = (user?.name || '')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-primary-700 via-primary-800 to-indigo-900 p-5 sm:p-7 text-white">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-white/15 backdrop-blur-md text-white flex items-center justify-center text-2xl sm:text-3xl font-extrabold border-2 border-white/20 shadow-md shrink-0">
                {initials || <LuUser className="w-8 h-8" />}
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    {user?.name}
                  </h1>
                  {user?.status && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 text-xs font-bold capitalize">
                      {user.status}
                    </span>
                  )}
                </div>

                {/* Active School Badge in Banner */}
                {activeSchoolName && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm font-semibold text-primary-100 flex-wrap mt-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/20">
                      <LuBuilding2 className="w-3.5 h-3.5 text-amber-300" />
                      <span>{activeSchoolName}</span>
                    </span>
                    {user?.role && (
                      <>
                        <span>•</span>
                        <span>{ROLE_LABELS[user.role] || user.role}</span>
                      </>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-center sm:justify-start gap-3 mt-2.5 text-xs text-primary-200 flex-wrap">
                  {user?.email && (
                    <span className="flex items-center gap-1">
                      <LuMail className="w-3.5 h-3.5" /> {user.email}
                    </span>
                  )}
                  {user?.phone && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <LuPhone className="w-3.5 h-3.5" /> {user.phone}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Button in Banner */}
            <div className="shrink-0 mt-3 sm:mt-0">
              {isEditing ? (
                <button
                  type="button"
                  onClick={handleCancelEditing}
                  className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5 backdrop-blur-xs border border-white/30 transition-all cursor-pointer shadow-xs"
                >
                  <LuX className="w-4 h-4" />
                  <span>Cancel Editing</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartEditing}
                  className="px-4 py-2 rounded-xl bg-white text-primary-800 hover:bg-primary-50 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <LuPencil className="w-3.5 h-3.5 text-primary-600" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. Navigation Tabs */}
        <div className="px-5 sm:px-7 border-t border-gray-100 bg-gray-50/70 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => handleTabChange('overview')}
            className={`py-3.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-primary-600 text-primary-700 bg-white shadow-2xs rounded-t-xl -mb-px'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <LuUser className="w-4 h-4" />
            <span>Profile Overview</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => handleTabChange('switch-school')}
              className={`py-3.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'switch-school'
                  ? 'border-primary-600 text-primary-700 bg-white shadow-2xs rounded-t-xl -mb-px'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <LuLayers className="w-4 h-4 text-primary-600" />
              <span>Switch School</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary-100 text-primary-800 font-extrabold">
                {linkedSchoolAccounts?.length || 0}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleTabChange('security')}
            className={`py-3.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-primary-600 text-primary-700 bg-white shadow-2xs rounded-t-xl -mb-px'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <LuKey className="w-4 h-4" />
            <span>Password & Security</span>
          </button>
        </div>
      </div>

      {/* 3. TAB CONTENT */}

      {/* -------------------- TAB: SWITCH SCHOOL (Requested Feature) -------------------- */}
      {isAdmin && activeTab === 'switch-school' && (
        <div className="space-y-6 animate-fade-in">
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-blue-50/80 via-primary-50/60 to-white rounded-2xl p-4 sm:p-5 border border-primary-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <LuBuilding2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900">
                  Multi-Campus School Switcher
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Link multiple school accounts using their admin email & password. Once added, you can switch between them anytime with a single click without having to enter credentials again.
                </p>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-white border border-primary-200 text-xs font-bold text-primary-700 shrink-0">
              {linkedSchoolAccounts.length} {linkedSchoolAccounts.length === 1 ? 'School Connected' : 'Schools Connected'}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Connected Schools List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-gray-800">
                    Your Connected School Campuses
                  </h2>
                  <p className="text-xs text-gray-400">
                    Click "Switch to this School" to change your active management session.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {linkedSchoolAccounts.map((account) => {
                  const isSelected =
                    account.school_id === activeSchoolId ||
                    (account.email === user?.email && account.id === user?.id);

                  return (
                    <div
                      key={`${account.id}-${account.school_id || account.email}`}
                      className={`relative bg-white rounded-2xl p-4 sm:p-5 border transition-all shadow-xs ${
                        isSelected
                          ? 'border-primary-500 ring-2 ring-primary-100 bg-primary-50/20'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-primary-600 text-white shadow-xs'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            <LuBuilding2 className="w-5 h-5" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm sm:text-base font-bold text-gray-900">
                                {account.school?.name || 'School Campus'}
                              </h3>
                              {isSelected && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                                  <LuCheck className="w-3 h-3" />
                                  Active Campus
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                              <div className="flex items-center gap-1.5 truncate">
                                <LuMail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span className="truncate">{account.email}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          {isSelected ? (
                            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
                              <LuCheck className="w-3.5 h-3.5" /> Current Active
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={switchingAccountId === account.id}
                              onClick={() => {
                                setSwitchingAccountId(account.id);
                                switchSchoolAccount(account);
                              }}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                            >
                              {switchingAccountId === account.id ? (
                                <>
                                  <LuLoader className="w-3.5 h-3.5 animate-spin" />
                                  <span>Switching...</span>
                                </>
                              ) : (
                                <>
                                  <span>Switch to School</span>
                                  <LuArrowRight className="w-3.5 h-3.5" />
                                </>
                              )}
                            </button>
                          )}

                          {/* Unlink button (only for secondary schools) */}
                          {!isSelected && linkedSchoolAccounts.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSchoolAccount(account.id || account.email)}
                              title="Disconnect this school from switcher"
                              className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 border border-gray-200 hover:border-rose-200 transition-colors cursor-pointer"
                            >
                              <LuTrash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 1 Col: Connect Another School Form */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-xs h-fit space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                  <LuPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Connect Another School</h3>
                  <p className="text-[11px] text-gray-400">Add credentials for another campus</p>
                </div>
              </div>

              {connectError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
                  <LuCircleAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{connectError}</span>
                </div>
              )}

              {connectSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-xs text-emerald-800">
                  <LuCircleCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{connectSuccess}</span>
                </div>
              )}

              <form onSubmit={handleConnectSchool} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    School Admin Email
                  </label>
                  <div className="relative">
                    <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={connectIdentifier}
                      onChange={(e) => setConnectIdentifier(e.target.value)}
                      placeholder="e.g. admin@stxavier.com"
                      className="w-full h-9.5 pl-9 pr-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-100 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    School Admin Password
                  </label>
                  <div className="relative">
                    <LuLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showConnectPassword ? 'text' : 'password'}
                      required
                      value={connectPassword}
                      onChange={(e) => setConnectPassword(e.target.value)}
                      placeholder="Enter administrator password"
                      className="w-full h-9.5 pl-9 pr-9 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-100 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConnectPassword(!showConnectPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                    >
                      {showConnectPassword ? (
                        <LuEyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <LuEye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-gray-600 font-medium">
                  <input
                    type="checkbox"
                    checked={autoSwitchConnect}
                    onChange={(e) => setAutoSwitchConnect(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span>Switch to school immediately</span>
                </label>

                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[10px] text-gray-500 leading-relaxed">
                  Saved schools are securely accessible anytime without entering password again.
                </div>

                <button
                  type="submit"
                  disabled={connectLoading}
                  className="w-full py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {connectLoading ? (
                    <>
                      <LuLoader className="w-4 h-4 animate-spin" />
                      <span>Verifying & Connecting...</span>
                    </>
                  ) : (
                    <>
                      <LuBuilding2 className="w-4 h-4" />
                      <span>Verify & Connect School</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- TAB: PROFILE OVERVIEW (Single Form Layout) -------------------- */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 p-5 sm:p-8 shadow-xs animate-fade-in space-y-6">
          {/* Form Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 shadow-2xs">
                <LuUser className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  {isAdmin ? 'Administrator Profile & Account Details' : 'Staff Profile & Account Details'}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Complete user account information and institutional campus affiliation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleStartEditing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                >
                  <LuPencil className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancelEditing}
                    disabled={editLoading}
                    className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="profile-single-form"
                    disabled={editLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-60"
                  >
                    {editLoading ? (
                      <>
                        <LuLoader className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <LuSave className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {editSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800 animate-fade-in">
              <LuCircleCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="font-medium">{editSuccess}</span>
            </div>
          )}

          {editError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-fade-in">
              <LuCircleAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-medium">{editError}</span>
            </div>
          )}

          {/* Single Form with all details listed vertically one below the other */}
          <form id="profile-single-form" onSubmit={handleSaveProfile} className="space-y-6">
            {/* ================= SECTION 1: ACCOUNT & PERSONAL DETAILS ================= */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <LuUser className="w-4 h-4 text-primary-600" />
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Account & Personal Details
                </h3>
              </div>

              {/* 1. Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  {isAdmin ? 'Administrator Name' : 'Full Name'} {isEditing && <span className="text-rose-500">*</span>}
                </label>
                {isEditing ? (
                  <div className="relative">
                    <LuUser className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full h-10.5 pl-10 pr-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 font-semibold focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-100 transition-all"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50/80 border border-gray-200/70 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <LuUser className="w-4 h-4 text-primary-600 shrink-0" />
                      <span className="font-bold text-gray-900 truncate text-xs sm:text-sm">{user?.name}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Official Email Address */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Official Email Address {isEditing && <span className="text-rose-500">*</span>}
                </label>
                {isEditing ? (
                  <div className="relative">
                    <LuMail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="name@school.com"
                      className="w-full h-10.5 pl-10 pr-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 font-semibold focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-100 transition-all"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50/80 border border-gray-200/70 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <LuMail className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-bold text-gray-800 truncate">{user?.email}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Contact Phone Number */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Contact Phone Number
                </label>
                {isEditing ? (
                  <div className="relative">
                    <LuPhone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                      className="w-full h-10.5 pl-10 pr-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 font-semibold focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-100 transition-all"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50/80 border border-gray-200/70 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <LuPhone className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-gray-800">{user?.phone || 'Not configured'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Role / Access Permissions */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Role / Access Level
                </label>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50/80 border border-gray-200/70 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <LuShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-bold text-primary-700 text-xs sm:text-sm">
                      {ROLE_LABELS[userRole] || userRole}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200">
                    System Managed
                  </span>
                </div>
              </div>

              {/* 5. Account Status */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Account Status
                </label>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50/80 border border-gray-200/70 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <LuCircleCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-emerald-700 flex items-center gap-2 capitalize">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      {user?.status || 'Active'}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200">
                    Verified Credentials
                  </span>
                </div>
              </div>
            </div>

            {/* ================= SECTION 2: INSTITUTIONAL CAMPUS AFFILIATION ================= */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <LuBuilding2 className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    School & Campus Affiliation
                  </h3>
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleTabChange('switch-school')}
                    className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 cursor-pointer bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-200 transition-all"
                  >
                    <span>Switch School</span>
                    <LuArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* 6. Affiliated School Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Affiliated School Campus
                </label>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50/80 border border-gray-200/70 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <LuBuilding2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-bold text-gray-900 truncate text-xs sm:text-sm">
                      {currentSchool?.name || activeSchoolName || 'Delhi Public Academy'}
                    </span>
                  </div>
                  {(currentSchool?.code || activeSchoolCode) && (
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                      {currentSchool?.code || activeSchoolCode}
                    </span>
                  )}
                </div>
              </div>

              {/* 7. Campus Code */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Campus Code
                </label>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50/80 border border-gray-200/70 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <LuBuilding2 className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="font-mono font-bold text-gray-800">
                      {currentSchool?.code || activeSchoolCode || 'DPS-101'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 8. Affiliation Board */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Affiliation Board
                </label>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50/80 border border-gray-200/70 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <LuAward className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-bold text-gray-800">
                      {currentSchool?.affiliation || 'CBSE'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 9. Principal / Head of School */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Principal / Head of Institution
                </label>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50/80 border border-gray-200/70 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <LuUser className="w-4 h-4 text-purple-600 shrink-0" />
                    <span className="font-bold text-gray-800">
                      {currentSchool?.principal_name || 'Dr. Rajeshwari Sharma'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 10. Campus Location (City / State) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Campus City & State
                </label>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50/80 border border-gray-200/70 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <LuMapPin className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-bold text-gray-800">
                      {currentSchool?.city ? `${currentSchool.city}${currentSchool.state ? `, ${currentSchool.state}` : ''}` : 'New Delhi, Delhi'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 11. School Phone */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  School Official Phone
                </label>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50/80 border border-gray-200/70 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <LuPhone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-gray-800">
                      {currentSchool?.phone || '+91 11 2890 1200'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 12. School Official Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  School Official Email
                </label>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50/80 border border-gray-200/70 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <LuMail className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-bold text-gray-800">
                      {currentSchool?.email || 'contact@delhipublic.edu'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 13. Subscription Plan */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Campus Subscription Plan
                </label>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50/80 border border-gray-200/70 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <LuSparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-bold text-primary-700">
                      {currentSchool?.subscription_plan || 'Enterprise'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Form Actions (Active in Edit Mode) */}
            {isEditing && (
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100 animate-fade-in">
                <button
                  type="button"
                  onClick={handleCancelEditing}
                  disabled={editLoading}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {editLoading ? (
                    <>
                      <LuLoader className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <LuSave className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* -------------------- TAB: PASSWORD & SECURITY -------------------- */}
      {activeTab === 'security' && (
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-200 p-5 sm:p-7 shadow-xs space-y-5 animate-fade-in">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <LuKey className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900">
                {isAdmin ? 'Change Administrator Password' : `Change ${ROLE_LABELS[userRole] || 'Account'} Password`}
              </h2>
              <p className="text-xs text-gray-400">
                {isAdmin
                  ? 'Keep your school administrator account secure'
                  : `Keep your ${ROLE_LABELS[userRole] || 'staff account'} credentials secure`}
              </p>
            </div>
          </div>

          {/* Active Account Identity Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs shrink-0 border border-primary-200">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-bold text-gray-900 truncate">
                    {user?.name || 'Active Account'}
                  </p>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200 shrink-0">
                    {ROLE_LABELS[userRole] || userRole}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 truncate mt-0.5">
                  {user?.email || 'Logged in account'}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Active Account
              </span>
            </div>
          </div>

          {pwdError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
              <LuCircleAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{pwdError}</span>
            </div>
          )}

          {pwdSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-xs text-emerald-800">
              <LuCircleCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{pwdSuccess}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPwd ? 'text' : 'password'}
                  required
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full h-10 pl-3.5 pr-10 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-100 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showCurrentPwd ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                New Password (Min 6 characters)
              </label>
              <div className="relative">
                <input
                  type={showNewPwd ? 'text' : 'password'}
                  required
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full h-10 pl-3.5 pr-10 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-100 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd(!showNewPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showNewPwd ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPwd ? 'text' : 'password'}
                  required
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full h-10 pl-3.5 pr-10 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-100 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPwd ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={pwdLoading}
              className="w-full py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {pwdLoading ? (
                <>
                  <LuLoader className="w-4 h-4 animate-spin" />
                  <span>Updating Password for ${user?.name || 'Account'}...</span>
                </>
              ) : (
                <>
                  <LuShieldCheck className="w-4 h-4" />
                  <span>Update Password for ${user?.name ? user.name.split(' ')[0] : 'Account'}</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
