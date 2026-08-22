import React, { useState, useEffect } from 'react';
import { hrService } from '../../services/hrService';
import {
  LuClipboardList,
  LuCheck,
  LuX,
  LuCheckCheck,
  LuRefreshCw,
  LuLoader,
  LuCalendar,
  LuUser,
  LuClock,
  LuFileText,
} from 'react-icons/lu';

export default function StaffLeavesPage() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await hrService.getStaffLeaves();
      const leavesList = res?.data?.leaves || res?.leaves;
      if (leavesList && Array.isArray(leavesList)) {
        setLeaveRequests(leavesList);
      }
    } catch (err) {
      console.error('Error fetching staff leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleUpdateStatus = async (id, staffName, newStatus, dbId) => {
    const targetId = dbId || id;
    setProcessingId(targetId);
    try {
      const res = await hrService.actionStaffLeave(targetId, { status: newStatus });
      if (res?.success) {
        setLeaveRequests((prev) =>
          prev.map((req) => (req.id === id || req.db_id === dbId ? { ...req, status: newStatus } : req))
        );
        setToastMessage(`Leave request for ${staffName} has been ${newStatus.toLowerCase()}.`);
        setTimeout(() => setToastMessage(''), 3500);
      }
    } catch (err) {
      console.error('Failed to update leave status:', err);
      setToastMessage(err.data?.message || err.message || 'Failed to update leave status.');
      setTimeout(() => setToastMessage(''), 3500);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 flex items-center gap-3 px-5 py-3.5 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 animate-scale-up">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <LuCheckCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold">{toastMessage}</p>
            <p className="text-xs text-slate-400">Synced in institutional staff records</p>
          </div>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
            <LuClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Faculty & Staff Leaves</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Review, approve, or reject leave applications submitted by teaching & support staff
            </p>
          </div>
        </div>
        <button
          onClick={fetchLeaves}
          disabled={loading}
          className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          title="Refresh Leaves"
        >
          <LuRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Clean Table View */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[780px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6">Staff Member</th>
                <th className="py-4 px-5">Leave Type</th>
                <th className="py-4 px-5">From Date</th>
                <th className="py-4 px-5">To Date</th>
                <th className="py-4 px-5">Reason</th>
                <th className="py-4 px-6 text-right">Actions / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-gray-400">
                    <LuLoader className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-600" />
                    <span className="text-xs font-semibold">Loading leave applications from database...</span>
                  </td>
                </tr>
              ) : leaveRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-gray-400">
                    <LuFileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-bold text-gray-700">No Leave Applications Found</p>
                    <p className="text-xs text-gray-400 mt-0.5">There are currently no pending or past leave records.</p>
                  </td>
                </tr>
              ) : (
                leaveRequests.map((req) => (
                  <tr key={req.id || req.db_id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Name & Role */}
                    <td className="py-4 px-6">
                      <p className="text-xs font-bold text-gray-900">{req.name}</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">{req.role}</p>
                    </td>

                    {/* Leave Type */}
                    <td className="py-4 px-5">
                      <span className="text-xs font-bold text-gray-800 px-2.5 py-1 rounded-lg bg-gray-100">
                        {req.type}
                      </span>
                    </td>

                    {/* Starting Date */}
                    <td className="py-4 px-5">
                      <span className="text-xs font-semibold text-gray-700">{req.startDate}</span>
                    </td>

                    {/* Ending Date */}
                    <td className="py-4 px-5">
                      <span className="text-xs font-semibold text-gray-700">{req.endDate}</span>
                    </td>

                    {/* Reason */}
                    <td className="py-4 px-5 max-w-[220px]">
                      <p className="text-xs text-gray-600 line-clamp-2" title={req.reason}>
                        {req.reason}
                      </p>
                    </td>

                    {/* Actions / Status */}
                    <td className="py-4 px-6 text-right">
                      {req.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleUpdateStatus(req.id, req.name, 'Approved', req.db_id)}
                            disabled={processingId === (req.db_id || req.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                          >
                            <LuCheck className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(req.id, req.name, 'Rejected', req.db_id)}
                            disabled={processingId === (req.db_id || req.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-700 rounded-xl text-xs font-bold transition-all border border-gray-200 disabled:opacity-50 cursor-pointer"
                          >
                            <LuX className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                            req.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {req.status === 'Approved' ? <LuCheck className="w-3 h-3" /> : <LuX className="w-3 h-3" />}
                          {req.status}
                        </span>
                      )}
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
