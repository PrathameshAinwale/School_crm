import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { LuFileText, LuUmbrella, LuHeart, LuBaby, LuPlus, LuLoader, LuCalendar, LuCheck, LuClock, LuCircleX } from 'react-icons/lu';

export default function TeacherLeaveBalancePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [leaveTypes, setLeaveTypes] = useState([
    { code: 'CL', type: 'Casual Leave (CL)', total: 12, used: 0, remaining: 12, color: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-500' },
    { code: 'SL', type: 'Sick Leave (SL)', total: 10, used: 0, remaining: 10, color: 'text-rose-600', bg: 'bg-rose-50', bar: 'bg-rose-500' },
    { code: 'ML', type: 'Maternity/Paternity', total: 90, used: 0, remaining: 90, color: 'text-purple-600', bg: 'bg-purple-50', bar: 'bg-purple-500' },
  ]);
  const [leaveHistory, setLeaveHistory] = useState([]);

  const iconMap = {
    CL: LuUmbrella,
    SL: LuHeart,
    ML: LuBaby,
  };

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const res = await adminService.getTeacherLeaves();
      if (res.success) {
        if (res.leave_types && res.leave_types.length > 0) {
          setLeaveTypes(res.leave_types);
        }
        setLeaveHistory(res.leave_history || []);
      }
    } catch (err) {
      console.error('Failed to load leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-primary-500/20 shrink-0">
            <LuFileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Faculty Leave Balance & Quotas</h1>
            <p className="text-xs text-gray-500 mt-0.5">Overview of annual available, approved and pending leaves</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/teacher/apply-leave')}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-primary-500/20 self-start sm:self-auto shrink-0"
        >
          <LuPlus className="w-4 h-4" />
          Apply for Leave
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-200/80">
          <LuLoader className="w-6 h-6 animate-spin text-primary-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500 font-medium">Fetching live leave balance...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leaveTypes.map((leave, i) => {
            const Icon = iconMap[leave.code] || LuFileText;
            const percentUsed = leave.total > 0 ? Math.round((leave.used / leave.total) * 100) : 0;
            return (
              <div key={i} className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs hover:border-gray-300 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${leave.bg} ${leave.color} shadow-xs`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Remaining Balance</p>
                    <p className="text-2xl font-black text-gray-900">{leave.remaining} Days</p>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-3">{leave.type}</h3>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500 font-medium">
                    <span>Used: <strong className="text-gray-800">{leave.used}</strong></span>
                    <span>Total Quota: <strong className="text-gray-800">{leave.total}</strong></span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className={`h-full ${leave.bar} rounded-full transition-all duration-1000`} style={{ width: `${percentUsed}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Leave History */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Leave Applications & History</h2>
            <p className="text-xs text-gray-400 mt-0.5">Status of your submitted leave applications</p>
          </div>
          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
            {leaveHistory.length} Total Applications
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <LuLoader className="w-6 h-6 animate-spin text-primary-600 mx-auto mb-2" />
            <p className="text-xs text-gray-500 font-medium">Loading history...</p>
          </div>
        ) : leaveHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="p-4 pl-6">Leave Type</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Days</th>
                  <th className="p-4">Reason for Leave</th>
                  <th className="p-4">Application Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {leaveHistory.map((leave, i) => (
                  <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4 pl-6 font-bold text-gray-900 whitespace-nowrap">{leave.type}</td>
                    <td className="p-4 text-gray-600 whitespace-nowrap font-medium">
                      {leave.from} - {leave.to}
                    </td>
                    <td className="p-4 text-gray-700 font-bold whitespace-nowrap">{leave.days} Day(s)</td>
                    <td className="p-4 text-gray-600 max-w-xs truncate" title={leave.reason}>{leave.reason}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide inline-flex items-center gap-1 ${
                          leave.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : leave.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {leave.status === 'Approved' ? <LuCheck className="w-3 h-3" /> : leave.status === 'Pending' ? <LuClock className="w-3 h-3" /> : <LuCircleX className="w-3 h-3" />}
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400 text-xs">
            No leave applications submitted yet.
          </div>
        )}
      </div>
    </div>
  );
}
