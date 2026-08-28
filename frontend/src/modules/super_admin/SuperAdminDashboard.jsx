import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminService } from '../../services/superAdminService';
import {
  LuBuilding2,
  LuGraduationCap,
  LuUsers,
  LuWallet,
  LuTrendingUp,
  LuPlus,
  LuArrowRight,
  LuCircleCheck,
  LuShieldAlert,
  LuRefreshCw,
  LuSparkles,
  LuSearch,
  LuKeyRound,
  LuLayers,
} from 'react-icons/lu';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await superAdminService.getDashboard();
      if (res?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error loading super admin dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const summary = data?.summary || {
    totalSchools: 3,
    activeSchools: 3,
    suspendedSchools: 0,
    trialSchools: 0,
    totalStudents: 10,
    totalTeachers: 8,
    estimatedMRR: 115000,
    estimatedARR: 1380000,
  };

  const planDist = data?.planDistribution || {
    Enterprise: 1,
    Pro: 1,
    Standard: 1,
    Trial: 0,
  };

  const recentSchools = data?.recentSchools || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2 max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Super Admin Portal
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Manage all client schools, oversee tenant data isolation, monitor platform subscriptions & provision administrator credentials.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchDashboardData();
            }}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LuRefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/super-admin/schools?action=new')}
            className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-lg shadow-primary-500/30 flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <LuPlus className="w-4 h-4" />
            Onboard New School
          </button>
        </div>
      </div>

      {/* Platform KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Client Schools</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <LuBuilding2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-2">
            {summary.totalSchools}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <LuCircleCheck className="w-3 h-3" /> {summary.activeSchools} Active • {summary.suspendedSchools} Suspended
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Managed Students</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <LuGraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-2">
            {Number(summary.totalStudents).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across all school tenants</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Teachers & Staff</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <LuUsers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-2">
            {Number(summary.totalTeachers).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Active faculty & HR</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Estimated MRR</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <LuWallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-2">
            ₹{Number(summary.estimatedMRR).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            ARR: ₹{Number(summary.estimatedARR).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Subscription Plan Distribution Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50/50 p-4 rounded-2xl border border-purple-100 shadow-2xs">
          <div className="text-xs font-bold text-purple-900">Enterprise Plan</div>
          <div className="text-2xl font-extrabold text-purple-700 mt-1">{planDist.Enterprise || 0} Schools</div>
          <div className="text-[10px] text-purple-600 mt-0.5">₹60,000 / mo • Up to 3,000 students</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-sky-50/50 p-4 rounded-2xl border border-blue-100 shadow-2xs">
          <div className="text-xs font-bold text-blue-900">Pro Plan</div>
          <div className="text-2xl font-extrabold text-blue-700 mt-1">{planDist.Pro || 0} Schools</div>
          <div className="text-[10px] text-blue-600 mt-0.5">₹35,000 / mo • Up to 1,500 students</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4 rounded-2xl border border-emerald-100 shadow-2xs">
          <div className="text-xs font-bold text-emerald-900">Standard Plan</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{planDist.Standard || 0} Schools</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">₹20,000 / mo • Up to 1,000 students</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50/50 p-4 rounded-2xl border border-amber-100 shadow-2xs">
          <div className="text-xs font-bold text-amber-900">Trial Plan</div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{planDist.Trial || 0} Schools</div>
          <div className="text-[10px] text-amber-600 mt-0.5">30-day Free Pilot sandbox</div>
        </div>
      </div>

      {/* Recent Onboarded Schools Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Recently Onboarded Schools</h2>
            <p className="text-xs text-slate-400 mt-0.5">Client schools configured on the SaaS platform</p>
          </div>
          <button
            onClick={() => navigate('/super-admin/schools')}
            className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1.5 cursor-pointer"
          >
            View All Schools <LuArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">School Details</th>
                <th className="py-3.5 px-4">Subscription Plan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Enrolled Students</th>
                <th className="py-3.5 px-4">Primary Admin</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
              {recentSchools.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No schools registered yet. Click 'Onboard New School' to add your first tenant.
                  </td>
                </tr>
              ) : (
                recentSchools.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{s.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Code: {s.code} • {s.city}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <LuLayers className="w-3 h-3 text-indigo-500" />
                        {s.plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {s.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <LuCircleCheck className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <LuShieldAlert className="w-3 h-3" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {s.studentsCount} Students
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{s.adminName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{s.adminEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate(`/super-admin/schools?id=${s.id}`)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
