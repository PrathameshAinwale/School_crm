import React from 'react';
import { LuFileText, LuUmbrella, LuHeart, LuBaby } from 'react-icons/lu';

export default function TeacherLeaveBalancePage() {
  const leaveTypes = [
    { type: 'Casual Leave (CL)', total: 12, used: 4, icon: LuUmbrella, color: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-500' },
    { type: 'Sick Leave (SL)', total: 10, used: 2, icon: LuHeart, color: 'text-rose-600', bg: 'bg-rose-50', bar: 'bg-rose-500' },
    { type: 'Maternity/Paternity', total: 90, used: 0, icon: LuBaby, color: 'text-purple-600', bg: 'bg-purple-50', bar: 'bg-purple-500' },
  ];

  const leaveHistory = [
    { type: 'Casual Leave (CL)', from: '10 Oct 2026', to: '12 Oct 2026', days: 3, status: 'Approved', reason: 'Attending a family wedding out of town.' },
    { type: 'Sick Leave (SL)', from: '05 Sep 2026', to: '06 Sep 2026', days: 2, status: 'Approved', reason: 'High fever and cold.' },
    { type: 'Casual Leave (CL)', from: '15 Aug 2026', to: '15 Aug 2026', days: 1, status: 'Approved', reason: 'Personal errands.' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
          <LuFileText className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Leave Balance</h1>
          <p className="text-sm text-gray-500">Overview of your available and used leaves</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {leaveTypes.map((leave, i) => {
          const remaining = leave.total - leave.used;
          const percentUsed = Math.round((leave.used / leave.total) * 100);
          return (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${leave.bg} ${leave.color}`}>
                  <leave.icon className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Remaining</p>
                  <p className="text-2xl font-black text-gray-900">{remaining}</p>
                </div>
              </div>
              <h3 className="text-sm font-bold text-gray-800 mb-4">{leave.type}</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>Used: {leave.used}</span>
                  <span>Total: {leave.total}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full ${leave.bar} rounded-full`} style={{ width: `${percentUsed}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leave History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden mt-8">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Leave History</h2>
          <p className="text-sm text-gray-500 mt-1">Record of all leaves taken till now</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Leave Type</th>
                <th className="p-4 font-semibold">Duration</th>
                <th className="p-4 font-semibold">Days</th>
                <th className="p-4 font-semibold">Reason</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leaveHistory.map((leave, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm font-bold text-gray-800 whitespace-nowrap">{leave.type}</td>
                  <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                    {leave.from} - {leave.to}
                  </td>
                  <td className="p-4 text-sm text-gray-600 font-medium whitespace-nowrap">{leave.days}</td>
                  <td className="p-4 text-sm text-gray-600 max-w-xs truncate" title={leave.reason}>{leave.reason}</td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700">
                      {leave.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
