import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LuGraduationCap, LuUser, LuLock, LuArrowRight, LuShieldAlert, LuEye, LuEyeOff, LuLoader, LuShieldCheck } from 'react-icons/lu';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setError('Please enter your email address or mobile number.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(cleanIdentifier, password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Network error connecting to backend server.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (id, pass) => {
    setIdentifier(id);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center mb-3 shadow-lg shadow-primary-500/30">
            <LuGraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">EduFlow SMS</h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">Enterprise School Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-7 sm:p-8 border border-slate-200/80 shadow-xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">Account Sign In</h2>
            <p className="text-xs text-slate-500 mt-1">Enter your registered email or mobile number & password</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-shake">
              <LuShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email / Mobile Identifier */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address / Mobile Number <span className="text-red-500">*</span>
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password <span className="text-red-500">*</span>
                </label>
              </div>
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
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold text-sm shadow-md shadow-primary-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <LuLoader className="w-4 h-4 animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                <>
                  Sign In <LuArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Seeded Credentials Helper Bar */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider mb-2.5 text-center">
              Quick Test Credentials
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin@school.com', '111111')}
                className="p-2.5 bg-slate-50 hover:bg-primary-50 hover:border-primary-200 border border-slate-200 rounded-xl text-left transition-all group"
              >
                <div className="text-xs font-semibold text-slate-700 group-hover:text-primary-700 flex items-center gap-1.5">
                  <LuShieldCheck className="w-3.5 h-3.5 text-primary-500" />
                  Admin
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">admin@school.com</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('hr@school.com', '111111')}
                className="p-2.5 bg-slate-50 hover:bg-amber-50 hover:border-amber-200 border border-slate-200 rounded-xl text-left transition-all group"
              >
                <div className="text-xs font-semibold text-slate-700 group-hover:text-amber-700 flex items-center gap-1.5">
                  <LuShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  HR Manager (Pooja)
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">hr@school.com</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('shruti@school.com', 'shruti1234')}
                className="p-2.5 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 rounded-xl text-left transition-all group"
              >
                <div className="text-xs font-semibold text-slate-700 group-hover:text-emerald-700 flex items-center gap-1.5">
                  <LuShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Teacher (Shruti)
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">shruti@school.com</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('rajesh@school.com', '111111')}
                className="p-2.5 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 rounded-xl text-left transition-all group"
              >
                <div className="text-xs font-semibold text-slate-700 group-hover:text-purple-700 flex items-center gap-1.5">
                  <LuShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                  Student/Parent
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">rajesh@school.com</div>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Protected by role-based authentication • EduFlow SMS
        </p>
      </div>
    </div>
  );
}
