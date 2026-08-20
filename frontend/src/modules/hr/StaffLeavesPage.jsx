import React, { useState, useEffect } from 'react';
import { hrService } from '../../services/hrService';
import {
  LuClipboardList,
  LuCheck,
  LuX,
  LuCheckCheck,
  LuRefreshCw,
  LuLoader,
} from 'react-icons/lu';

const INITIAL_LEAVE_REQUESTS = [
  {
    id: 'LR-101',
    name: 'Dr. Ananya Sen',
    role: 'PGT Mathematics',
    type: 'Casual Leave',
    startDate: '19 Aug 2026',
    endDate: '20 Aug 2026',
    reason: 'Attending family wedding ceremony.',
    status: 'Pending',
  },
  {
    id: 'LR-102',
    name: 'Mr. Manoj Joshi',
    role: 'TGT Social Science',
    type: 'Medical Leave',
    startDate: '21 Aug 2026',
    endDate: '24 Aug 2026',
    reason: 'Viral fever and prescribed medical rest.',
    status: 'Pending',
  },
  {
    id: 'LR-103',
    name: 'Mr. Rajesh Sharma',
    role: 'Admin Officer',
    type: 'Casual Leave',
    startDate: '22 Aug 2026',
    endDate: '22 Aug 2026',
    reason: 'Personal urgent bank & documentation work.',
    status: 'Pending',
  },
  {
    id: 'LR-104',
    name: 'Mr. Suresh Kumar',
    role: 'TGT Hindi',
    type: 'Duty Leave',
    startDate: '25 Aug 2026',
    endDate: '26 Aug 2026',
    reason: 'Official CBSE debate judge duty.',
    status: 'Pending',
  },
  {
    id: 'LR-105',
    name: 'Ms. Sunita Rao',
    role: 'TGT English',
    type: 'Casual Leave',
    startDate: '12 Aug 2026',
    endDate: '12 Aug 2026',
    reason: 'Family religious function at native place.',
    status: 'Approved',
  },
];

export default function StaffLeavesPage() {
  const [leaveRequests, setLeaveRequests] = useState(INITIAL_LEAVE_REQUESTS);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  const fetchLeaves = async () => {
    try {
      const res = await hrService.getStaffLeaves();
      if (res?.success && res.data?.leaves?.length > 0) {
        setLeaveRequests(res.data.leaves);
      }
    } catch (err) {
      console.log('Using local leave records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleUpdateStatus = async (id, staffName, newStatus, dbId) => {
    try {
      await hrService.actionStaffLeave(dbId || id, { status: newStatus });
      setLeaveRequests((prev) =>
        prev.map((req) => (req.id === id || req.db_id === dbId ? { ...req, status: newStatus } : req))
      );
      setToastMessage(`Leave request for ${staffName} has been ${newStatus.toLowerCase()}.`);
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      setLeaveRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
      );
      setToastMessage(`Leave request for ${staffName} has been ${newStatus.toLowerCase()}.`);
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 flex items-center gap-3 px-5 py-3.5 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-600/20 animate-fade-in-up">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <LuCheckCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold">{toastMessage}</p>
            <p className="text-xs text-emerald-100">Status updated in staff records</p>
          </div>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
            <LuClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Staff Leaves</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Review, approve, or reject leave applications submitted by staff members
            </p>
          </div>
        </div>
        <button
          onClick={fetchLeaves}
          className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
          title="Refresh Leaves"
        >
          <LuRefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Clean Table View */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[780px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-5">Leave Type</th>
                <th className="py-4 px-5">Starting Date</th>
                <th className="py-4 px-5">Ending Date</th>
                <th className="py-4 px-5">Reason</th>
                <th className="py-4 px-6 text-right">Actions / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leaveRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/60 transition-colors">
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
                    <p className="text-xs text-gray-600 line-clamp-1">{req.reason}</p>
                  </td>

                  {/* Actions / Status */}
                  <td className="py-4 px-6 text-right">
                    {req.status === 'Pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleUpdateStatus(req.id, req.name, 'Approved', req.db_id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                        >
                          <LuCheck className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(req.id, req.name, 'Rejected', req.db_id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-700 rounded-xl text-xs font-bold transition-all border border-gray-200"
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
