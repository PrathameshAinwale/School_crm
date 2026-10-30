import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LuGraduationCap,
  LuUser,
  LuLock,
  LuArrowRight,
  LuShieldAlert,
  LuEye,
  LuEyeOff,
  LuLoader,
  LuKey,
  LuZap,
  LuBookOpen,
  LuWallet,
  LuUsers,
  LuTrophy,
  LuBuilding2,
  LuUserPlus,
} from 'react-icons/lu';

const DEMO_ACCOUNTS = [
  {
    role: 'School Principal (Executive Desk)',
    shortRole: 'Principal',
    name: 'Dr. Rajeshwari Sharma (Principal)',
    identifier: 'principal@school.com',
    password: '111111',
    description: 'Executive dashboard, student strength, pass rates & teacher muster',
    iconColor: 'text-indigo-600',
    icon: LuGraduationCap,
  },
  {
    role: 'Admission & Enrollment Cell',
    shortRole: 'Admissions',
    name: 'Meera Joshi (Admissions Officer)',
    identifier: 'admissions@school.com',
    password: '111111',
    description: '6-stage intake pipeline, walk-ins, interviews, fees & enrollment',
    iconColor: 'text-rose-600',
    icon: LuUserPlus,
  },
  {
    role: 'School Administrator',
    shortRole: 'Admin',
    name: 'System Administrator (DPS)',
    identifier: 'admin@school.com',
    password: '111111',
    description: 'Full school operations, admissions oversight, staff, exams & settings',
    iconColor: 'text-blue-600',
    icon: LuBuilding2,
  },
  {
    role: 'Academic Teacher',
    shortRole: 'Teacher',
    name: 'Shruti Sen',
    identifier: 'shruti@school.com',
    password: 'shruti1234',
    description: 'Scoresheet marks entry, student attendance & timetable',
    iconColor: 'text-emerald-600',
    icon: LuBookOpen,
  },
  {
    role: 'Accounts & Finance',
    shortRole: 'Accounts',
    name: 'Vikram Malhotra',
    identifier: 'accounts@school.com',
    password: '111111',
    description: 'Fee collections, receipts, ledger, defaulters & vouchers',
    iconColor: 'text-teal-600',
    icon: LuWallet,
  },
  {
    role: 'Human Resources (HR)',
    shortRole: 'HR Head',
    name: 'Pooja Sharma',
    identifier: 'hr@school.com',
    password: '111111',
    description: 'Staff attendance, leave approvals, payroll & trainings',
    iconColor: 'text-amber-600',
    icon: LuUsers,
  },
  {
    role: 'Sports & Athletics',
    shortRole: 'Sports Head',
    name: 'Col. Ranveer Rana',
    identifier: 'sports@school.com',
    password: '111111',
    description: 'Grounds & facilities, equipment issues & fitness tests',
    iconColor: 'text-cyan-600',
    icon: LuTrophy,
  },
  {
    role: 'Student & Parent Portal',
    shortRole: 'Parent Portal',
    name: 'Rajesh Patel (Aarav - 10A)',
    identifier: 'rajesh@school.com',
    password: '111111',
    description: 'Ward performance results, report card PDF & fee dues',
    iconColor: 'text-purple-600',
    icon: LuUser,
  },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggingInId, setLoggingInId] = useState('');
  const [error, setError] = useState('');
  const [activePreset, setActivePreset] = useState('');

  const executeLogin = async (id, pass) => {
    setError('');
    const cleanId = id.trim();
    if (!cleanId) {
      setError('Please enter your email address or mobile number.');
      return;
    }
    if (!pass) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(cleanId, pass);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Network error connecting to backend server.');
    } finally {
      setLoading(false);
      setLoggingInId('');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    await executeLogin(identifier, password);
  };

  const fillCredentials = (id, pass, roleLabel = '') => {
    setIdentifier(id);
    setPassword(pass);
    setError('');
    setActivePreset(roleLabel);
  };

  const directAutoLogin = async (id, pass, roleLabel = '') => {
    setIdentifier(id);
    setPassword(pass);
    setActivePreset(roleLabel);
    setLoggingInId(id);
    await executeLogin(id, pass);
  };

  return (
    <div className="min-h-screen bg-slate-100/80 py-8 px-4 flex items-center justify-center">
      <div className="w-full max-w-lg mx-auto">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src="/logo.svg"
            alt="Arch Campus Logo"
            className="w-24 h-24 object-contain mb-3 drop-shadow-sm"
          />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Arch Campus</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
            Enterprise School Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Account Sign In</h2>
            </div>
            {activePreset && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
                {activePreset}
              </span>
            )}
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-700 animate-shake">
              <LuShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Identifier Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address / Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <LuUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="admin@school.com or 9876543210"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <LuLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold text-xs sm:text-sm shadow-md shadow-primary-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading && !loggingInId ? (
                <>
                  <LuLoader className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <LuArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credentials Buttons (Inside the Login Form Card) */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <LuKey className="w-3.5 h-3.5 text-amber-500" />
                Quick Credentials
              </span>
            </div>

            {/* Compact Grid of All 8 Module Quick Credentials */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
              {DEMO_ACCOUNTS.map((acc) => {
                const IconComponent = acc.icon;
                const isLoggingIn = loading && loggingInId === acc.identifier;
                const isSelected = activePreset === acc.role;

                return (
                  <div
                    key={acc.identifier}
                    onClick={() => fillCredentials(acc.identifier, acc.password, acc.role)}
                    title={`Click to fill: ${acc.role} (${acc.identifier})`}
                    className={`p-1.5 px-2 rounded-xl border text-left transition-all flex items-center justify-between gap-1 group cursor-pointer ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50/80 ring-1 ring-primary-500/30'
                        : 'bg-slate-50 hover:bg-slate-100/90 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <IconComponent className={`w-3.5 h-3.5 shrink-0 ${acc.iconColor}`} />
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-slate-800 block truncate leading-tight">
                          {acc.shortRole}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block truncate">
                          {acc.identifier}
                        </span>
                      </div>
                    </div>

                    {/* Instant 1-Click Auto Login Button */}
                    <button
                      type="button"
                      disabled={loading}
                      onClick={(e) => {
                        e.stopPropagation();
                        directAutoLogin(acc.identifier, acc.password, acc.role);
                      }}
                      title={`Instant 1-Click Login as ${acc.shortRole}`}
                      className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-100/60 transition-colors shrink-0 cursor-pointer"
                    >
                      {isLoggingIn ? (
                        <LuLoader className="w-3 h-3 text-primary-600 animate-spin" />
                      ) : (
                        <LuZap className="w-3 h-3 text-amber-500" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
