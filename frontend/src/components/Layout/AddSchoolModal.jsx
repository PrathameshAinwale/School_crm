import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import {
  LuBuilding2,
  LuMail,
  LuLock,
  LuEye,
  LuEyeOff,
  LuX,
  LuCircleAlert,
  LuCheck,
  LuLoader,
  LuShieldCheck,
  LuSparkles,
} from 'react-icons/lu';

export default function AddSchoolModal({ isOpen, onClose, onSuccess }) {
  const { t } = useTranslation();
  const { addSchoolAccount, linkedSchoolAccounts } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [autoSwitch, setAutoSwitch] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setSuccessMsg('');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please provide both the email/username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await addSchoolAccount(identifier.trim(), password, autoSwitch);
      if (res.success) {
        setSuccessMsg(res.message || 'School account linked successfully!');
        if (onSuccess) onSuccess(res.school);
        if (!autoSwitch) {
          setTimeout(() => {
            onClose();
          }, 1200);
        }
      } else {
        setError(res.message || 'Failed to authenticate with the provided credentials.');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to the server. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <LuX className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0">
              <LuBuilding2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight">
                {t('branches.add_school_account', 'Connect School Account')}
              </h2>
              <p className="text-xs text-primary-100 mt-0.5">
                {t(
                  'branches.add_school_desc',
                  'Link another school campus using its admin credentials'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
              <LuCircleAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
              <LuCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-semibold leading-relaxed">{successMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Username */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {t('auth.email_or_identifier', 'Admin Email / Phone')}
              </label>
              <div className="relative">
                <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. admin@stxavier.com"
                  className="w-full h-10 pl-9.5 pr-3 rounded-xl bg-gray-50/80 border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {t('auth.password', 'Admin Password')}
              </label>
              <div className="relative">
                <LuLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full h-10 pl-9.5 pr-10 rounded-xl bg-gray-50/80 border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                >
                  {showPassword ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Switch immediately option */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-600 font-medium pt-1">
              <input
                type="checkbox"
                checked={autoSwitch}
                onChange={(e) => setAutoSwitch(e.target.checked)}
                className="w-4 h-4 rounded text-primary-600 border-gray-300 focus:ring-primary-500 rounded-sm cursor-pointer"
              />
              <span>{t('branches.switch_immediately', 'Switch to this school immediately after connecting')}</span>
            </label>

            {/* Safe note */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[11px] text-gray-500">
              <LuShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {t(
                  'branches.credentials_saved_note',
                  'Credentials are securely validated and saved locally in your browser so you can switch anytime without re-entering password.'
                )}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-600/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <LuLoader className="w-4 h-4 animate-spin" />
                    <span>{t('branches.verifying', 'Verifying & Connecting...')}</span>
                  </>
                ) : (
                  <>
                    <LuBuilding2 className="w-4 h-4" />
                    <span>{t('branches.verify_and_connect', 'Verify & Connect School')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
