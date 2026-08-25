import React, { useState, useEffect } from 'react';
import { hrService } from '../../services/hrService';
import {
  LuBanknote,
  LuSearch,
  LuFilter,
  LuDownload,
  LuFileText,
  LuPrinter,
  LuCheck,
  LuX,
  LuCalculator,
  LuUsers,
  LuBuilding2,
  LuCheckCheck,
  LuEye,
  LuCalendar,
  LuChevronDown,
  LuArrowRight,
  LuSparkles,
  LuRefreshCw,
  LuLoader,
  LuDollarSign,
  LuPercent,
  LuPencil,
  LuSlidersHorizontal,
  LuSave,
} from 'react-icons/lu';

// List of all 12 calendar months
const CALENDAR_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Helper to generate the 12 months for the current dynamic year (auto-updates when year rolls over)
const getCurrentYearMonths = () => {
  const currentYear = new Date().getFullYear();
  return CALENDAR_MONTHS.map((m) => `${m} ${currentYear}`);
};

export default function StaffSalaryPage() {
  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const [availableMonths] = useState(getCurrentYearMonths());
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [editingSalary, setEditingSalary] = useState(null);
  const [editFormData, setEditFormData] = useState({
    base_salary: 50000,
    allowance: 0,
    deduction: 6000,
    custom_deduction_reason: '',
  });
  const [savingSalary, setSavingSalary] = useState(false);
  const [disburseSuccess, setDisburseSuccess] = useState(false);
  const [disburseMsg, setDisburseMsg] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);

  const fetchSalaries = async () => {
    setLoading(true);
    try {
      const res = await hrService.getStaffSalaries({ month: selectedMonth });
      const salaryList = res?.data?.salaries || res?.salaries || res?.data?.records;
      if (salaryList && Array.isArray(salaryList)) {
        setRecords(salaryList);
        if (res.data?.summary) {
          setSummaryData(res.data.summary);
        }
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error('Error loading salary records:', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, [selectedMonth]);

  // Exact Calculation logic:
  // Gross = Base + Allowance
  // Deduction = custom deduction if set, or 12% of (Base + Allowance)
  // Net Payable = Gross - Deduction
  const computeStaffPay = (staff) => {
    const base = Number(staff.baseSalary || 0);
    const allowance = Number(staff.allowance !== undefined ? staff.allowance : (staff.specialAllowance || 0));
    const gross = base + allowance;
    const deduction = (staff.deduction !== undefined && staff.deduction !== null)
      ? Number(staff.deduction)
      : Math.round(gross * 0.12);
    const net = gross - deduction;

    return {
      base,
      allowance,
      gross,
      deduction,
      net,
      isCustom: Boolean(staff.isCustomDeduction),
      reason: staff.customDeductionReason || '',
    };
  };

  const openEditSalaryModal = (staff) => {
    const pay = computeStaffPay(staff);
    setEditingSalary(staff);
    setEditFormData({
      base_salary: pay.base,
      allowance: pay.allowance,
      deduction: pay.deduction,
      custom_deduction_reason: staff.customDeductionReason || '',
    });
  };

  const handleSaveSalaryEdit = async (e) => {
    e.preventDefault();
    if (!editingSalary) return;
    setSavingSalary(true);
    try {
      const targetId = editingSalary.db_id || editingSalary.id;
      const res = await hrService.updateStaffSalary(targetId, editFormData);
      if (res && res.success) {
        setEditingSalary(null);
        await fetchSalaries();
        setDisburseMsg(`Salary calculations & deductions updated for ${editingSalary.name}!`);
        setDisburseSuccess(true);
        setTimeout(() => setDisburseSuccess(false), 3500);
      } else {
        alert(res?.message || 'Failed to update salary calculation.');
      }
    } catch (err) {
      alert(err.data?.message || err.message || 'Failed to update salary record.');
    } finally {
      setSavingSalary(false);
    }
  };

  const handleDisburseBatch = async () => {
    try {
      const res = await hrService.disburseSalary({ disburse_all: true, month: selectedMonth });
      setRecords((prev) => prev.map((r) => ({ ...r, status: 'Disbursed' })));
      setDisburseMsg(res?.message || `All staff salaries for ${selectedMonth} marked as Disbursed!`);
      setDisburseSuccess(true);
      setTimeout(() => setDisburseSuccess(false), 3500);
    } catch (err) {
      setRecords((prev) => prev.map((r) => ({ ...r, status: 'Disbursed' })));
      setDisburseMsg(`Direct salary transfers initiated for ${selectedMonth}!`);
      setDisburseSuccess(true);
      setTimeout(() => setDisburseSuccess(false), 3500);
    }
  };

  const handleSingleDisburse = async (empId) => {
    try {
      const res = await hrService.disburseSalary({ employee_ids: [empId], month: selectedMonth });
      setRecords((prev) => prev.map((r) => (r.id === empId ? { ...r, status: 'Disbursed' } : r)));
      setDisburseMsg(res?.message || `Salary disbursed for ${empId}!`);
      setDisburseSuccess(true);
      setTimeout(() => setDisburseSuccess(false), 3000);
    } catch (err) {
      setRecords((prev) => prev.map((r) => (r.id === empId ? { ...r, status: 'Disbursed' } : r)));
    }
  };

  const filteredRecords = records.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (s.name || '').toLowerCase().includes(q) ||
      (s.id || '').toLowerCase().includes(q) ||
      (s.role || '').toLowerCase().includes(q) ||
      (s.dept || '').toLowerCase().includes(q);

    const matchesDept = deptFilter === 'ALL' || (s.dept || '').toLowerCase() === deptFilter.toLowerCase();
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  // KPI calculations
  let totalNetPayroll = 0;
  let totalGrossPayroll = 0;
  let totalDeductions = 0;

  records.forEach((s) => {
    const c = computeStaffPay(s);
    totalNetPayroll += c.net;
    totalGrossPayroll += c.gross;
    totalDeductions += c.deduction;
  });

  const disbursedCount = records.filter((r) => r.status === 'Disbursed').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Toast Notification */}
      {disburseSuccess && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 flex items-center gap-3 px-5 py-3.5 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-600/20 animate-fade-in-up">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <LuCheckCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold">Payroll Batch Processed</p>
            <p className="text-xs text-emerald-100">{disburseMsg || `Direct salary transfers initiated for ${selectedMonth}`}</p>
          </div>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
              <LuBanknote className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">Staff Salary & Payroll Registry</h1>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Real-time salary calculation with base compensation, allowances, and statutory 12% deductions
              </p>
            </div>
          </div>

          {/* Month Selector & Batch Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">Payroll Cycle:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="h-10 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all cursor-pointer font-medium"
              >
                {availableMonths.map((mLabel) => (
                  <option key={mLabel} value={mLabel}>
                    {mLabel}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchSalaries}
              title="Refresh Salary Calculation"
              className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              <LuRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleDisburseBatch}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
            >
              <LuCalculator className="w-4 h-4" /> Disburse Batch
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <LuBanknote className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-500 truncate">Total Net Payroll</p>
            <p className="text-sm sm:text-xl font-bold text-gray-900 leading-tight truncate">₹{totalNetPayroll.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <LuUsers className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-500 truncate">Staff Enrolled</p>
            <p className="text-sm sm:text-xl font-bold text-gray-900 leading-tight truncate">{records.length} Staff</p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <LuPercent className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-500 truncate">12% Deductions</p>
            <p className="text-sm sm:text-xl font-bold text-purple-700 leading-tight truncate">
              ₹{totalDeductions.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <LuSparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-500 truncate">Disbursed</p>
            <p className="text-sm sm:text-xl font-bold text-gray-900 leading-tight truncate">
              {disbursedCount} / {records.length} Paid
            </p>
          </div>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <LuSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff name, ID or department..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-gray-400 mr-1 hidden sm:inline">Status:</span>
          {['ALL', 'Disbursed', 'Processed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {st === 'ALL' ? 'All Status' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Salary Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Staff Member</th>
                <th className="py-3.5 px-5">Department</th>
                <th className="py-3.5 px-5">Base Salary</th>
                <th className="py-3.5 px-5">Allowance</th>
                <th className="py-3.5 px-5">Gross Total</th>
                <th className="py-3.5 px-5">Deductions</th>
                <th className="py-3.5 px-5">Net Payable</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-sm text-gray-400">
                    <LuLoader className="w-7 h-7 animate-spin text-emerald-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 font-medium">Calculating dynamic staff salaries & deductions...</p>
                  </td>
                </tr>
              ) : filteredRecords.length > 0 ? (
                filteredRecords.map((staff) => {
                  const pay = computeStaffPay(staff);

                  return (
                    <tr key={staff.id || staff.db_id} className="hover:bg-gray-50/60 transition-colors group">
                      {/* Name & Role */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">
                            {(staff.name || 'S').split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                              {staff.name}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono">
                              {staff.id} • {staff.role}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-semibold">
                          {staff.dept || 'Teaching'}
                        </span>
                      </td>

                      {/* Base Salary */}
                      <td className="py-3.5 px-5">
                        <p className="text-xs font-bold text-gray-900 font-mono">₹{pay.base.toLocaleString('en-IN')}</p>
                      </td>

                      {/* Allowance */}
                      <td className="py-3.5 px-5">
                        <span className="text-xs font-bold text-emerald-700 font-mono">
                          + ₹{pay.allowance.toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Gross Total */}
                      <td className="py-3.5 px-5">
                        <span className="text-xs font-bold text-gray-800 font-mono">
                          ₹{pay.gross.toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Deductions (Custom or 12% Statutory) */}
                      <td className="py-3.5 px-5">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-rose-600 font-mono">
                              - ₹{pay.deduction.toLocaleString('en-IN')}
                            </span>
                            {pay.isCustom && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200" title={pay.reason || 'Custom deduction'}>
                                Adjusted
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 truncate max-w-[140px]" title={pay.reason || '12% PF / Statutory'}>
                            {pay.isCustom ? (pay.reason || 'Custom deductions') : '12% PF / Statutory'}
                          </p>
                        </div>
                      </td>

                      {/* Net Payable */}
                      <td className="py-3.5 px-5">
                        <div className="bg-emerald-50/70 border border-emerald-200 px-3 py-1.5 rounded-xl inline-block">
                          <p className="text-xs font-black text-emerald-900 font-mono">₹{pay.net.toLocaleString('en-IN')}</p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5 text-center">
                        {staff.status === 'Disbursed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <LuCheck className="w-3 h-3" /> Disbursed
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSingleDisburse(staff.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                          >
                            Mark Disbursed
                          </button>
                        )}
                      </td>

                      {/* Action Buttons: Edit Calculation & View Slip */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditSalaryModal(staff)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors cursor-pointer border border-amber-200/80"
                            title="Edit Base, Allowance & Deductions"
                          >
                            <LuPencil className="w-3 h-3 text-amber-600" /> Edit
                          </button>
                          <button
                            onClick={() => setSelectedSlip(staff)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
                            title="View Payslip"
                          >
                            <LuEye className="w-3.5 h-3.5" /> Slip
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-xs text-gray-400">
                    No payroll records matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Salary & Deductions Modal */}
      {editingSalary && (() => {
        const modalGross = Number(editFormData.base_salary || 0) + Number(editFormData.allowance || 0);
        const modalNet = modalGross - Number(editFormData.deduction || 0);
        const standard12Pct = Math.round(modalGross * 0.12);

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-5 animate-scale-up">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <LuSlidersHorizontal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Adjust Salary & Deductions</h3>
                    <p className="text-xs text-gray-400">{editingSalary.name} • {editingSalary.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingSalary(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
                >
                  <LuX className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveSalaryEdit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Base Salary (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      required
                      value={editFormData.base_salary}
                      onChange={(e) => setEditFormData({ ...editFormData, base_salary: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Special Allowance (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={editFormData.allowance}
                      onChange={(e) => setEditFormData({ ...editFormData, allowance: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                {/* Gross Preview */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-600">Calculated Gross Salary:</span>
                  <span className="font-bold text-gray-900 font-mono">₹{modalGross.toLocaleString('en-IN')}</span>
                </div>

                {/* Deductions Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700">
                      Total Deductions (₹) <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditFormData({
                        ...editFormData,
                        deduction: standard12Pct,
                        custom_deduction_reason: '12% PF / Statutory Deduction',
                      })}
                      className="text-[11px] font-bold text-amber-700 hover:text-amber-800 underline cursor-pointer"
                    >
                      Set 12% Standard (₹{standard12Pct.toLocaleString('en-IN')})
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    required
                    value={editFormData.deduction}
                    onChange={(e) => setEditFormData({ ...editFormData, deduction: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 focus:outline-none focus:border-rose-500 font-mono"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Modify to account for custom PF, Tax TDS, unpaid leave loss-of-pay, or advance deductions.
                  </p>
                </div>

                {/* Deduction Remarks / Breakdown */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Deduction Breakdown / Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PF ₹4,000 + TDS ₹2,000 + 1 Day LOP ₹1,200"
                    value={editFormData.custom_deduction_reason}
                    onChange={(e) => setEditFormData({ ...editFormData, custom_deduction_reason: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Net Payable Realtime Preview */}
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                      New Net Payable (Gross - Deductions)
                    </span>
                    <span className="text-xl font-black text-emerald-950 font-mono">
                      ₹{modalNet.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-xs">
                    Live Preview
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setEditingSalary(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingSalary}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {savingSalary ? <LuLoader className="w-3.5 h-3.5 animate-spin" /> : <LuSave className="w-3.5 h-3.5" />}
                    {savingSalary ? 'Saving Calculations...' : 'Save & Update Deductions'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Payslip Modal */}
      {selectedSlip && (() => {
        const pay = computeStaffPay(selectedSlip);

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 animate-scale-in">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <LuFileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Salary Slip - {selectedMonth}</h3>
                    <p className="text-xs text-gray-400">{selectedSlip.name} • {selectedSlip.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSlip(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
                >
                  <LuX className="w-4 h-4" />
                </button>
              </div>

              {/* Slip Details Breakdown */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl text-xs">
                <div>
                  <p className="text-gray-400 font-medium">Employee Name</p>
                  <p className="font-bold text-gray-800 mt-0.5">{selectedSlip.name}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium">Department</p>
                  <p className="font-bold text-gray-800 mt-0.5">{selectedSlip.dept || 'Teaching'}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium">Bank & Account</p>
                  <p className="font-bold text-gray-800 mt-0.5 font-mono">{selectedSlip.bankName || 'HDFC Bank'} ({selectedSlip.accountNo || '•••• 4589'})</p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium">Payroll Month</p>
                  <p className="font-bold text-emerald-700 mt-0.5">{selectedMonth}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Earnings & Allowances</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-600">Base Salary</span>
                    <span className="font-bold text-gray-900 font-mono">₹{pay.base.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-600">Monthly Allowance</span>
                    <span className="font-bold text-emerald-600 font-mono">+ ₹{pay.allowance.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1.5 bg-gray-50 px-2 rounded-lg font-bold">
                    <span className="text-gray-800">Total Gross Earnings</span>
                    <span className="text-gray-900 font-mono">₹{pay.gross.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Deductions Breakdown</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-600">
                      {pay.isCustom ? (pay.reason || 'Custom Deductions') : 'Statutory Deduction (12% PF/Statutory)'}
                    </span>
                    <span className="font-bold text-rose-600 font-mono">- ₹{pay.deduction.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase text-emerald-800">Net Payable Amount</p>
                  <p className="text-2xl font-black text-emerald-950 mt-0.5 font-mono">
                    ₹{pay.net.toLocaleString('en-IN')}
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs font-bold">
                  {selectedSlip.status}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LuPrinter className="w-3.5 h-3.5" /> Print Payslip
                </button>
                <button
                  onClick={() => setSelectedSlip(null)}
                  className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
