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
  LuImage,
  LuUpload,
  LuTrash2,
  LuPaperclip,
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
  const [photoProof, setPhotoProof] = useState(null);
  const [photoName, setPhotoName] = useState('');
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

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file size must be under 5MB.');
      return;
    }

    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoProof(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoProof(null);
    setPhotoName('');
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
        photo_proof: photoProof,
        photo_name: photoName,
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
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 animate-scale-up">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <LuCircleCheck className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
        <div className="flex items-center gap-3">
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

          {/* Photo Proof Field (Active for Sick Leave) */}
          {leaveType === 'SL' && (
            <div className="p-4 bg-rose-50/60 border border-rose-200/80 rounded-2xl space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <LuImage className="w-4 h-4 text-rose-600" /> Medical Certificate / Photo Proof
                </label>
                <span className="text-[10px] font-semibold text-rose-600 bg-rose-100/80 px-2 py-0.5 rounded-md">
                  Sick Leave Attachment
                </span>
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                Attach a doctor's prescription, clinic slip, or medical report photo for verification.
              </p>

              {photoProof ? (
                <div className="flex items-center justify-between gap-3 p-3 bg-white border border-rose-200 rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={photoProof}
                      alt="Medical Proof"
                      className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{photoName || 'Medical_Proof.png'}</p>
                      <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <LuCircleCheck className="w-3 h-3" /> Image attached successfully
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove Photo"
                  >
                    <LuTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-rose-300 rounded-xl bg-white/80 hover:bg-rose-50/50 transition-colors cursor-pointer text-center group">
                  <LuUpload className="w-6 h-6 text-rose-400 group-hover:text-rose-600 mb-1.5 transition-colors" />
                  <span className="text-xs font-bold text-slate-700">Click to upload medical photo proof</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, JPEG, WEBP up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Reason / Remarks <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="State the purpose of your leave (e.g. Diagnosed with viral fever, prescribed 3 days bed rest)..."
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
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800 transition-all shadow-md shadow-primary-500/20 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
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
