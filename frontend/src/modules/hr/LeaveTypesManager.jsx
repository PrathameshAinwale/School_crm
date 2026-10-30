import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  LuPlus,
  LuPencil,
  LuTrash2,
  LuLoader,
  LuCheck,
  LuX,
  LuCalendar,
  LuFileText,
  LuImage,
  LuShieldCheck,
  LuSparkles,
  LuRefreshCw,
  LuLayers,
} from 'react-icons/lu';

const COLOR_OPTIONS = [
  { id: 'amber', label: 'Amber / Gold', class: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  { id: 'rose', label: 'Rose / Red', class: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  { id: 'purple', label: 'Purple / Violet', class: 'bg-purple-500', text: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  { id: 'emerald', label: 'Emerald / Green', class: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { id: 'blue', label: 'Blue / Ocean', class: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'indigo', label: 'Indigo / Navy', class: 'bg-indigo-500', text: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  { id: 'cyan', label: 'Cyan / Sky', class: 'bg-cyan-500', text: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-200' },
];

export default function LeaveTypesManager({ onUpdated, isModal = false, onClose = () => {} }) {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Form Modal State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    total_days: 12,
    description: '',
    color: 'amber',
    is_active: true,
    requires_attachment: false,
  });

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchLeaveTypes = async () => {
    setLoading(true);
    try {
      const res = await adminService.getLeaveTypes({ include_inactive: true });
      if (res.success && res.leave_types) {
        setLeaveTypes(res.leave_types);
      }
    } catch (err) {
      console.error('Failed to fetch leave types:', err);
      showToast(err.message || 'Failed to load leave types', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      code: '',
      total_days: 12,
      description: '',
      color: 'amber',
      is_active: true,
      requires_attachment: false,
    });
    setShowFormModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      code: item.code,
      total_days: item.total_days,
      description: item.description || '',
      color: item.color || 'amber',
      is_active: item.is_active,
      requires_attachment: item.requires_attachment,
    });
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      showToast('Please provide both Leave Type Name and Short Code.', 'error');
      return;
    }
    if (!formData.total_days || Number(formData.total_days) <= 0) {
      showToast('Total leave amount must be greater than 0 days.', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        const res = await adminService.updateLeaveType(editingItem.id, formData);
        if (res.success) {
          showToast(`Leave type '${formData.name}' updated successfully!`);
          setShowFormModal(false);
          fetchLeaveTypes();
          if (onUpdated) onUpdated();
        }
      } else {
        const res = await adminService.createLeaveType(formData);
        if (res.success) {
          showToast(`New leave type '${formData.name}' added with ${formData.total_days} days quota!`);
          setShowFormModal(false);
          fetchLeaveTypes();
          if (onUpdated) onUpdated();
        }
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to save leave type', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete leave type "${item.name}"?`)) {
      return;
    }

    try {
      const res = await adminService.deleteLeaveType(item.id);
      if (res.success) {
        showToast(`Leave type "${item.name}" deleted successfully.`);
        fetchLeaveTypes();
        if (onUpdated) onUpdated();
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to delete leave type', 'error');
    }
  };

  const handleQuickQuotaUpdate = async (item, delta) => {
    const newTotal = Math.max(1, item.total_days + delta);
    if (newTotal === item.total_days) return;

    try {
      const res = await adminService.updateLeaveType(item.id, { total_days: newTotal });
      if (res.success) {
        setLeaveTypes((prev) =>
          prev.map((lt) => (lt.id === item.id ? { ...lt, total_days: newTotal } : lt))
        );
        showToast(`Quota for ${item.name} set to ${newTotal} days.`);
        if (onUpdated) onUpdated();
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to update quota', 'error');
    }
  };

  return (
    <div className={`space-y-6 ${isModal ? '' : 'animate-fade-in'}`}>
      {/* Toast Banner */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-white animate-scale-up ${
            toastType === 'error' ? 'bg-rose-900 border-rose-700' : 'bg-slate-900 border-slate-700'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
              toastType === 'error' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            <LuCheck className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <LuLayers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              Leave Types & Annual Quotas Configuration
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60">
                Dynamic
              </span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Add new custom leave categories and dynamically set the total leaves amount/quota per employee
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            onClick={fetchLeaveTypes}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
            title="Refresh Leave Types"
          >
            <LuRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-primary-500/20 transition-all cursor-pointer"
          >
            <LuPlus className="w-4 h-4 stroke-[3]" />
            <span>Add Leave Type & Quota</span>
          </button>
        </div>
      </div>

      {/* Leave Types List / Grid */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-200/80">
          <LuLoader className="w-7 h-7 animate-spin text-primary-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500 font-medium">Loading leave categories & quotas...</p>
        </div>
      ) : leaveTypes.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-200/80 space-y-3">
          <p className="text-sm font-bold text-gray-800">No leave types configured yet</p>
          <p className="text-xs text-gray-400">Click the button below to add your institution's first leave type.</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold shadow-sm"
          >
            Create First Leave Type
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {leaveTypes.map((item) => {
            const colorMeta = COLOR_OPTIONS.find((c) => c.id === item.color) || COLOR_OPTIONS[0];

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group relative overflow-hidden"
              >
                {/* Top Badge Strip */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm text-white shrink-0 shadow-xs ${colorMeta.class}`}
                    >
                      {item.code}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {item.name}
                        </h3>
                        {!item.is_active && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-500">
                            Inactive
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-gray-400 font-semibold">
                        Code: <strong>{item.code}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => openEditModal(item)}
                      title="Edit Leave Type"
                      className="p-2 rounded-xl text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer"
                    >
                      <LuPencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      title="Delete Leave Type"
                      className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <LuTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {item.description || 'Standard institutional leave policy quota.'}
                </p>

                {/* Total Leaves Amount / Quota Display & Quick Adjuster */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                      Total Leaves Allowed
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-xl font-black text-gray-900">{item.total_days}</span>
                      <span className="text-xs font-bold text-gray-500">Days / Year</span>
                    </div>
                  </div>

                  {/* Quick Adjust Buttons */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200/80 shadow-2xs">
                    <button
                      onClick={() => handleQuickQuotaUpdate(item, -1)}
                      title="Decrease 1 Day"
                      className="w-7 h-7 rounded-lg text-gray-600 hover:bg-gray-100 flex items-center justify-center font-black text-xs cursor-pointer active:scale-95 transition-all"
                    >
                      -
                    </button>
                    <span className="px-2 text-xs font-mono font-bold text-gray-700">
                      {item.total_days}d
                    </span>
                    <button
                      onClick={() => handleQuickQuotaUpdate(item, 1)}
                      title="Increase 1 Day"
                      className="w-7 h-7 rounded-lg text-gray-600 hover:bg-gray-100 flex items-center justify-center font-black text-xs cursor-pointer active:scale-95 transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1.5">
                    {item.requires_attachment ? (
                      <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md font-bold">
                        <LuImage className="w-3 h-3" /> Medical Certificate Required
                      </span>
                    ) : (
                      <span className="text-gray-400">Self-Certified (No Doctor Note)</span>
                    )}
                  </span>
                  <span className="text-gray-400">Theme: {colorMeta.label.split(' ')[0]}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <LuSparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    {editingItem ? 'Edit Leave Type & Quota' : 'Add New Leave Type & Quota'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Define leave category and total annual allowed leave days
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Leave Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Leave Type Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Earned Leave, Bereavement Leave, Study Leave"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-gray-50 focus:bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                />
              </div>

              {/* Code & Total Leaves Amount */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Short Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    placeholder="e.g. EL, BL, SL"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-bold font-mono text-gray-800 bg-gray-50 focus:bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all uppercase"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Max 8 uppercase characters</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Total Leave Quota (Days) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={365}
                    placeholder="e.g. 15"
                    value={formData.total_days}
                    onChange={(e) => setFormData({ ...formData, total_days: parseInt(e.target.value) || 0 })}
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-black text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Annual allowed balance</span>
                </div>
              </div>

              {/* Color Theme */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Badge & Bar Color Theme</label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c.id })}
                      className={`h-9 rounded-xl flex items-center justify-center border-2 transition-all cursor-pointer ${
                        formData.color === c.id
                          ? 'border-slate-900 scale-105 shadow-xs'
                          : 'border-transparent hover:scale-102'
                      }`}
                      style={{ backgroundColor: c.class.replace('bg-', '') }}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${c.class} shadow-2xs`}></span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Policy / Description <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain when staff can request this leave and relevant guidelines..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 bg-gray-50 focus:bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all resize-none"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requires_attachment}
                    onChange={(e) => setFormData({ ...formData, requires_attachment: e.target.checked })}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Require Proof / Certificate</span>
                    <span className="text-[11px] text-gray-500">
                      Staff must attach photo or doctor slip when submitting this leave request
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Active Status</span>
                    <span className="text-[11px] text-gray-500">
                      Visible in staff leave application and balance quotas
                    </span>
                  </div>
                </label>
              </div>

              {/* Form Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving && <LuLoader className="w-4 h-4 animate-spin" />}
                  <span>{editingItem ? 'Save Changes' : 'Create Leave Type'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
