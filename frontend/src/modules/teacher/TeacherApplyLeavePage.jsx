import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import {
  LuClipboardList,
  LuCalendar,
  LuLoader,
  LuCircleCheck,
  LuArrowLeft,
  LuInfo,
} from 'react-icons/lu';

export default function TeacherApplyLeavePage() {
  const navigate = useNavigate();
  const { currentRole, user } = useAuth();
  const role = (user?.role || currentRole || '').toLowerCase();
  const leaveBalancePath = role === 'hr' ? '/hr/leave-balance' : '/teacher/leave-balance';

  const [leaveType, setLeaveType] = useState('CL');
  const [fromDate, setFromDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const calculateDays = () => {
    if (!fromDate || !toDate) return 1;
    const f = new Date(fromDate);
    const t = new Date(toDate);
    const diffTime = t - f;
    if (diffTime < 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const daysCount = calculateDays();

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast('Please provide a brief reason for your leave request.');
      return;
    }
    if (daysCount <= 0) {
      showToast('To Date must be equal to or after From Date.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminService.applyTeacherLeave({
        type: leaveType,
        from_date: fromDate,
        to_date: toDate,
        reason: reason,
      });

      if (res.success) {
        showToast(res.message || 'Leave application submitted successfully!');
        setTimeout(() => {
          navigate(leaveBalancePath);
        }, 1200);
      }
    } catch (err) {
      showToast(err.data?.message || 'Failed to submit leave application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 animate-scale-up">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <LuCircleCheck className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate(leaveBalancePath)}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <LuArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Apply for Leave</h1>
            <p className="text-xs text-gray-500 mt-0.5">Submit a new leave application for administration approval</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 sm:p-8">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Leave Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all cursor-pointer"
            >
              <option value="CL">Casual Leave (CL) - Standard</option>
              <option value="SL">Sick Leave (SL) - Medical</option>
              <option value="ML">Maternity / Paternity Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                From Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <LuCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  required
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all cursor-pointer font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                To Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <LuCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  required
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all cursor-pointer font-medium"
                />
              </div>
            </div>
          </div>

          {/* Computed Duration Info Box */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs text-indigo-900 font-semibold">
            <span className="flex items-center gap-1.5">
              <LuInfo className="w-4 h-4 text-indigo-600" /> Total Leave Duration Requested:
            </span>
            <span className="font-extrabold text-indigo-700 bg-white px-3 py-1 rounded-xl shadow-xs">
              {daysCount} Day(s)
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Reason / Remarks <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="State the purpose of your leave (e.g. Attending brother's wedding, Medical emergency)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-gray-200 text-xs text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all resize-none font-medium"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(leaveBalancePath)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800 transition-all shadow-md shadow-primary-500/20 flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuCircleCheck className="w-4 h-4" />}
              {submitting ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
