import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeCard from '../../components/Dashboard/WelcomeCard';
import { accountsService } from '../../services/accountsService';
import {
  LuWallet,
  LuReceipt,
  LuBanknote,
  LuFileSpreadsheet,
  LuArrowRight,
  LuTrendingUp,
  LuTrendingDown,
  LuRefreshCw,
  LuShieldAlert,
  LuCircleCheck,
  LuPlus,
  LuBellRing,
  LuBuilding2,
  LuCalendar,
  LuArrowUpRight,
  LuClock,
} from 'react-icons/lu';

export default function AccountsDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bulkReminderLoading, setBulkReminderLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const fetchDashboard = async () => {
    try {
      const res = await accountsService.getDashboard();
      if (res?.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching accounts dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const handleQuickBulkRemind = async () => {
    setBulkReminderLoading(true);
    try {
      const res = await accountsService.sendBulkFeeReminders({ status: 'Overdue' });
      if (res?.success) {
        setToastMsg(res.message || 'Fee reminders sent to all overdue parents successfully!');
        setTimeout(() => setToastMsg(''), 4500);
      }
    } catch (err) {
      setToastMsg('Failed to dispatch bulk reminders.');
      setTimeout(() => setToastMsg(''), 4500);
    } finally {
      setBulkReminderLoading(false);
    }
  };

  const summary = data?.summary || {
    totalFeesBilled: 0,
    totalFeesCollected: 0,
    outstandingFees: 0,
    recoveryRate: 0,
    overdueStudentsCount: 0,
    pendingStudentsCount: 0,
    totalExpensesThisMonth: 0,
    totalPayrollThisMonth: 0,
    disbursedPayrollThisMonth: 0,
    pendingDisbursementBatches: 0,
    netCashflowThisMonth: 0,
    currentMonth: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  };

  const kpis = [
    {
      title: 'Fee Collections',
      value: `₹${Number(summary.totalFeesCollected || 0).toLocaleString('en-IN')}`,
      subtitle: `${summary.recoveryRate || 0}% recovery rate`,
      icon: LuReceipt,
      iconBg: 'bg-emerald-500/10 text-emerald-600',
      path: '/accounts/fees',
    },
    {
      title: 'Outstanding Dues',
      value: `₹${Number(summary.outstandingFees || 0).toLocaleString('en-IN')}`,
      subtitle: `${summary.overdueStudentsCount || 0} overdue terms`,
      icon: LuTrendingDown,
      iconBg: 'bg-rose-500/10 text-rose-600',
      path: '/accounts/fees',
    },
    {
      title: 'Staff Salaries Disbursed',
      value: `₹${Number(summary.totalSalaryDisbursed || summary.disbursedPayrollThisMonth || 0).toLocaleString('en-IN')}`,
      subtitle: `Month of ${summary.currentMonth || 'Current'}`,
      icon: LuBanknote,
      iconBg: 'bg-purple-500/10 text-purple-600',
      path: '/accounts/salary-disbursements',
    },
    {
      title: 'Active Faculty & Staff',
      value: `${summary.activeStaffCount || 24} Staff`,
      subtitle: 'Managed payroll accounts',
      icon: LuUsers,
      iconBg: 'bg-indigo-500/10 text-indigo-600',
      path: '/accounts/salary-disbursements',
    },
  ];

  const recentDisbursements = data?.recentDisbursements || [];
  const recentPayments = data?.recentFeePayments || [];

  return (
    <div className="space-y-5 pb-12 animate-fade-in">
      {/* Toast Banner */}
      {toastMsg && (
        <div className="p-3.5 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl flex items-center justify-between shadow-sm transition-all">
          <div className="flex items-center gap-2.5">
            <LuCircleCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="text-xs font-semibold">{toastMsg}</span>
          </div>
          <button
            onClick={() => setToastMsg('')}
            className="text-xs font-semibold text-teal-600 hover:text-teal-900 ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Welcome Card & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Accounts & Finance Portal</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Student fee recovery, clearance tracking & staff salary disbursements
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
          >
            <LuRefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Sync Ledger
          </button>
          <button
            onClick={handleQuickBulkRemind}
            disabled={bulkReminderLoading}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
          >
            <LuBellRing className="w-3.5 h-3.5" />
            {bulkReminderLoading ? 'Dispatching...' : 'Push Fee Reminders'}
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(kpi.path)}
              className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-sm hover:border-primary-200 transition-all flex items-center justify-between cursor-pointer group"
            >
              <div>
                <div className="text-xs font-medium text-slate-500">{kpi.title}</div>
                <div className="text-xl font-bold text-slate-800 mt-0.5 tracking-tight font-mono">
                  {loading ? (
                    <div className="h-6 w-24 bg-slate-100 rounded animate-pulse my-0.5" />
                  ) : (
                    kpi.value
                  )}
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {kpi.subtitle}
                </div>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.iconBg} shrink-0 group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Two-Column Grid: Recent Salary Disbursements + Recent Fee Collections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent Salary Disbursements */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <LuBanknote className="w-4 h-4 text-purple-600" />
                Recent Staff Salary Disbursements
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Disbursed salary records logged in database</p>
            </div>
            <button
              onClick={() => navigate('/accounts/salary-disbursements')}
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
            >
              Payroll Ledger <LuArrowRight className="w-3 h-3" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3 py-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentDisbursements.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <LuBanknote className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              No staff salary disbursement records logged yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentDisbursements.map((item, idx) => (
                <div key={item.id || idx} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0 border border-purple-100">
                      {item.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {item.role} • {item.month}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-emerald-700 font-mono">
                      ₹{Number(item.amount).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">{item.disbursedDate}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Fee Payments Feed */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <LuReceipt className="w-4 h-4 text-emerald-600" />
                Recent Student Fee Collections
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Real-time payment transactions recorded in database</p>
            </div>
            <button
              onClick={() => navigate('/accounts/fees')}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 cursor-pointer"
            >
              Fee Ledger <LuArrowRight className="w-3 h-3" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3 py-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentPayments.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <LuReceipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              No student fee payment transactions recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentPayments.map((item, idx) => (
                <div key={item.id || idx} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                      <LuReceipt className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{item.studentName}</div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {item.className} • {item.term}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-emerald-700 font-mono">
                      +₹{Number(item.amount).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">{item.mode} • {item.paidDate}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
