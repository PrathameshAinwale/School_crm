import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LuGraduationCap, LuMail, LuLock, LuChevronDown, LuArrowRight } from 'react-icons/lu';

export default function Login() {
  const { login, ROLES, ROLE_LABELS } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES.ADMIN);
  const [showRoles, setShowRoles] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    login(selectedRole);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-primary-600 flex items-center justify-center mb-3">
            <LuGraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">EduFlow</h1>
          <p className="text-gray-400 text-sm mt-0.5">School Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl p-7 border border-gray-200 shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Welcome back</h2>
          <p className="text-sm text-gray-400 mb-6">Sign in to your account to continue</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Role Selector */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Login as</label>
              <button
                type="button"
                onClick={() => setShowRoles(!showRoles)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 hover:border-gray-300 transition-colors"
              >
                <span>{ROLE_LABELS[selectedRole]}</span>
                <LuChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showRoles ? 'rotate-180' : ''}`} />
              </button>
              {showRoles && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-dropdown p-1 z-20">
                  {Object.entries(ROLES).map(([key, value]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => { setSelectedRole(value); setShowRoles(false); }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedRole === value ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {ROLE_LABELS[value]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Email address</label>
              <div className="relative">
                <LuMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <LuLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                />
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-200 accent-primary-600" />
                <span className="text-xs text-gray-500">Remember me</span>
              </label>
              <button type="button" className="text-xs text-primary-600 hover:text-primary-700">Forgot password?</button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-primary-600 text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors"
            >
              Sign In <LuArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              <span className="text-primary-600 font-medium">Demo Mode</span> — Select any role and click Sign In
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">© 2026 EduFlow CRM. All rights reserved.</p>
      </div>
    </div>
  );
}
