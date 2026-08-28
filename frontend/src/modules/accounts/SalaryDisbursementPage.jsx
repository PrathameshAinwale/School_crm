import React, { useState, useEffect } from 'react';
import { accountsService } from '../../services/accountsService';
import {
  LuBanknote,
  LuCircleCheck,
  LuClock,
  LuShieldAlert,
  LuEye,
  LuX,
  LuPrinter,
  LuBuilding2,
  LuUserCheck,
  LuArrowRight,
  LuRefreshCw,
  LuFileText,
  LuShieldCheck,
  LuSend,
  LuPlus,
  LuSearch,
  LuFilter,
  LuCreditCard,
  LuLayers,
  LuCheck,
  LuCalendar,
  LuUsers,
} from 'react-icons/lu';

export default function SalaryDisbursementPage() {
  const [requests, setRequests] = useState([]);
  const [disbursedRecords, setDisbursedRecords] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters for Disbursed Records Ledger
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');

  // Modal: Record Direct Staff Salary Disbursement
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    teacher_id: '',
    staff_name: '',
    month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    amount: '',
    payment_mode: 'Direct Bank Transfer (NEFT/IMPS)',
    payment_reference: '',
    bank_name: 'HDFC Bank',
    account_no: '',
    disbursed_date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [savingAdd, setSavingAdd] = useState(false);

  // Modal: Batch Action (HR Batch Disburse / Reject)
  const [actionModal, setActionModal] = useState(null);
  const [actionStatus, setActionStatus] = useState('Disbursed');
  const [payoutReference, setPayoutReference] = useState('');
  const [payoutMode, setPayoutMode] = useState('Direct Bank Transfer (NEFT/RTGS)');
  const [accountsNotes, setAccountsNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Modal: View Batch Staff Details
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Modal: View Individual Payout Voucher / Slip
  const [voucherModal, setVoucherModal] = useState(null);

  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  const fetchDisbursements = async () => {
    try {
      setLoading(true);
      const res = await accountsService.getSalaryDisbursements();
      if (res?.success) {
        setRequests(res.data?.requests || res.requests || []);
        setDisbursedRecords(res.data?.disbursed_records || res.disbursed_records || []);
        setStaffList(res.data?.staff_list || res.staff_list || []);
        setSummary(res.data?.summary || null);
      }
    } catch (err) {
      console.error('Error fetching disbursements:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDisbursements();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDisbursements();
  };

  // When staff selection changes in Add Modal, pre-populate details
  const handleStaffSelect = (e) => {
    const staffId = e.target.value;
    if (!staffId) {
      setAddForm({
        ...addForm,
        teacher_id: '',
        staff_name: '',
        amount: '',
        account_no: '',
      });
      return;
    }

    const matched = staffList.find((s) => String(s.id) === String(staffId));
    if (matched) {
      setAddForm({
        ...addForm,
        teacher_id: matched.id,
        staff_name: matched.name,
        amount: matched.salary || 45000,
        account_no: matched.phone ? `•••• ${matched.phone.slice(-4)}` : '•••• 4589',
        payment_reference: `NEFT-PAY-${Math.floor(100000 + Math.random() * 900000)}`,
      });
    }
  };

  // Submit Direct Staff Salary Disbursement
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.staff_name || !addForm.amount) {
      showToast('Please provide the staff member name and net salary amount.');
      return;
    }

    setSavingAdd(true);
    try {
      const res = await accountsService.recordStaffSalaryDisbursement({
        teacher_id: addForm.teacher_id || undefined,
        staff_name: addForm.staff_name,
        month: addForm.month,
        amount: Number(addForm.amount),
        payment_mode: addForm.payment_mode,
        payment_reference: addForm.payment_reference || `PAY-${Date.now().toString().slice(-6)}`,
        bank_name: addForm.bank_name,
        account_no: addForm.account_no,
        disbursed_date: addForm.disbursed_date,
        notes: addForm.notes,
      });

      if (res?.success) {
        showToast(res.message || `Salary disbursement logged for ${addForm.staff_name}!`);
        setAddModal(false);
        // Reset form
        setAddForm({
          teacher_id: '',
          staff_name: '',
          month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          amount: '',
          payment_mode: 'Direct Bank Transfer (NEFT/IMPS)',
          payment_reference: '',
          bank_name: 'HDFC Bank',
          account_no: '',
          disbursed_date: new Date().toISOString().split('T')[0],
          notes: '',
        });
        fetchDisbursements();
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to log salary disbursement.');
    } finally {
      setSavingAdd(false);
    }
  };

  // Batch action trigger
  const openActionModal = (batch, status) => {
    setActionModal(batch);
    setActionStatus(status);
    setPayoutReference(status === 'Disbursed' ? `NEFT-BATCH-${Math.floor(100000 + Math.random() * 900000)}` : '');
    setPayoutMode('Direct Bank Transfer (NEFT/RTGS)');
    setAccountsNotes(status === 'Disbursed' ? 'Funds transferred to verified staff bank accounts through corporate banking portal.' : '');
  };

  const handleExecuteBatchAction = async (e) => {
    e.preventDefault();
    if (!actionModal) return;
    setActionLoading(true);
    try {
      const res = await accountsService.actionDisbursementRequest(actionModal.id, {
        status: actionStatus,
        payment_reference: payoutReference,
        payout_mode: payoutMode,
        accounts_notes: accountsNotes,
      });
      if (res?.success) {
        showToast(res.message || `Salary disbursement batch ${actionModal.batchCode} processed!`);
        setActionModal(null);
        setSelectedBatch(null);
        fetchDisbursements();
      }
    } catch (err) {
      showToast('Failed to process salary disbursement batch.');
    } finally {
      setActionLoading(false);
    }
  };

  // Available Months and Departments for filters
  const uniqueMonths = Array.from(new Set(disbursedRecords.map((r) => r.month).filter(Boolean)));
  const uniqueDepts = Array.from(new Set(disbursedRecords.map((r) => r.department).filter(Boolean)));

  // Filtered records
  const filteredLedger = disbursedRecords.filter((rec) => {
    if (selectedMonth !== 'all' && rec.month !== selectedMonth) return false;
    if (selectedDept !== 'all' && rec.department !== selectedDept) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = rec.name?.toLowerCase().includes(q);
      const matchEmp = rec.employeeId?.toLowerCase().includes(q);
      const matchRef = rec.paymentRef?.toLowerCase().includes(q);
      if (!matchName && !matchEmp && !matchRef) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-700 animate-slide-up">
          <LuCircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Staff Salary Disbursements</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              Accounts & Payroll
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Record individual staff salary disbursements, log transaction payout receipts, and process monthly payroll batches.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
          >
            <LuRefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => {
              setAddForm({
                teacher_id: '',
                staff_name: '',
                month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                amount: '',
                payment_mode: 'Direct Bank Transfer (NEFT/IMPS)',
                payment_reference: `NEFT-PAY-${Math.floor(100000 + Math.random() * 900000)}`,
                bank_name: 'HDFC Bank',
                account_no: '',
                disbursed_date: new Date().toISOString().split('T')[0],
                notes: '',
              });
              setAddModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LuPlus className="w-4 h-4" />
            + Disburse Staff Salary
          </button>
        </div>
      </div>

      {/* Top Financial KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Total Salary Disbursed</div>
          <div className="text-xl font-bold text-emerald-600 mt-1 font-mono tracking-tight">
            ₹{Number(summary?.totalDisbursed || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            {summary?.disbursedCount || disbursedRecords.filter((r) => r.status === 'Disbursed').length} payouts logged
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Pending Month Payroll</div>
          <div className="text-xl font-bold text-amber-600 mt-1 font-mono tracking-tight">
            ₹{Number(summary?.pendingPayroll || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-amber-600 font-medium mt-0.5">
            {summary?.pendingCount || 0} pending review
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-medium text-slate-500">HR Payroll Batches</div>
          <div className="text-xl font-bold text-indigo-700 mt-1 font-mono tracking-tight">
            {requests.length} Batches
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {requests.filter((r) => r.status === 'Disbursed').length} released to bank
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Active Faculty & Staff</div>
          <div className="text-xl font-bold text-slate-800 mt-1 font-mono tracking-tight">
            {summary?.activeStaffCount || staffList.length || 24} Staff
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Across Academic & Admin
          </div>
        </div>
      </div>

      {/* Disbursed Salary Ledger Section (Logged Records Table) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-3 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <LuBanknote className="w-4 h-4 text-emerald-600" />
              Staff Salary Disbursement Ledger
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Detailed log of staff salaries disbursed by Accounts with payment references and bank transfer details
            </p>
          </div>

          {/* Ledger Search & Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative min-w-[200px]">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff, ID, ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Months</option>
              {uniqueMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Departments</option>
              {uniqueDepts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3.5">Staff Member</th>
                <th className="py-3 px-3.5">Role & Dept</th>
                <th className="py-3 px-3.5">Month</th>
                <th className="py-3 px-3.5">Net Salary</th>
                <th className="py-3 px-3.5">Payment Details</th>
                <th className="py-3 px-3.5">Transaction Ref</th>
                <th className="py-3 px-3.5">Disbursed Date</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Loading salary disbursement records...
                  </td>
                </tr>
              ) : filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <LuBanknote className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No staff salary disbursements logged matching your filters.
                  </td>
                </tr>
              ) : (
                filteredLedger.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-extrabold flex items-center justify-center text-xs shrink-0 border border-emerald-100">
                          {rec.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{rec.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{rec.employeeId || `EMP-${rec.id}`}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3.5">
                      <div className="font-medium text-slate-700">{rec.role || 'Staff Member'}</div>
                      <div className="text-[10px] text-slate-400">{rec.department || 'Academic'}</div>
                    </td>

                    <td className="py-3.5 px-3.5 font-semibold text-slate-700">
                      {rec.month}
                    </td>

                    <td className="py-3.5 px-3.5">
                      <span className="font-extrabold text-emerald-700 font-mono text-sm">
                        ₹{Number(rec.netSalary || rec.baseSalary || 0).toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td className="py-3.5 px-3.5">
                      <div className="font-medium text-slate-700">{rec.bankName || 'Bank Transfer'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{rec.accountNo || '•••• 4589'}</div>
                    </td>

                    <td className="py-3.5 px-3.5 font-mono text-[11px] text-slate-600">
                      {rec.paymentRef || '—'}
                    </td>

                    <td className="py-3.5 px-3.5 text-slate-600">
                      {rec.disbursedDate || '—'}
                    </td>

                    <td className="py-3.5 px-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          rec.status === 'Disbursed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {rec.status === 'Disbursed' ? <LuCheck className="w-3 h-3" /> : <LuClock className="w-3 h-3" />}
                        {rec.status || 'Disbursed'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3.5 text-right">
                      <button
                        onClick={() => setVoucherModal(rec)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                        title="View Disbursement Voucher"
                      >
                        <LuPrinter className="w-3.5 h-3.5" />
                        Voucher
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* HR Monthly Payroll Batches Workflow */}
      {requests.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <LuBuilding2 className="w-4 h-4 text-indigo-600" />
                HR Monthly Payroll Batches (Dual-Authorization Workflow)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review compiled staff payroll batches submitted by HR for bulk bank release
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              {requests.length} Total Batches
            </span>
          </div>

          <div className="space-y-3">
            {requests.map((batch) => (
              <div
                key={batch.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-indigo-600 flex items-center justify-center font-bold font-mono shrink-0 shadow-2xs">
                    {batch.month.slice(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">
                        Payroll Batch: {batch.month}
                      </span>
                      <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                        {batch.batchCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          batch.status === 'Disbursed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {batch.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Submitted by <span className="font-semibold text-slate-700">{batch.requestedBy}</span> • {batch.staffCount} Staff Members • Total Net: <span className="font-bold font-mono text-emerald-700">₹{Number(batch.netAmount).toLocaleString('en-IN')}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedBatch(batch)}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  >
                    <LuEye className="w-3.5 h-3.5" /> View Staff Breakdown
                  </button>

                  {batch.status !== 'Disbursed' && (
                    <button
                      onClick={() => openActionModal(batch, 'Disbursed')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <LuBanknote className="w-3.5 h-3.5" /> Execute Batch Payout
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add / Disburse Direct Staff Salary */}
      {addModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-scale-up my-8">
            <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <LuBanknote className="w-5 h-5 text-emerald-300" />
                  Disburse & Log Staff Salary
                </h3>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Select staff member, specify payout month, and log disbursement transaction
                </p>
              </div>
              <button
                onClick={() => setAddModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <LuX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {/* Select from Active Staff Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Staff Member <span className="text-red-500">*</span>
                </label>
                <select
                  value={addForm.teacher_id}
                  onChange={handleStaffSelect}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white cursor-pointer"
                >
                  <option value="">-- Choose from Faculty / Staff Directory --</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.employeeId}) — {s.role} ({s.department}) • Base: ₹{Number(s.salary).toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Or manual Staff Name Input if not in dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Staff Member Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addForm.staff_name}
                  onChange={(e) => setAddForm({ ...addForm, staff_name: e.target.value })}
                  placeholder="e.g. Shruti Sen"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payroll Month <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.month}
                    onChange={(e) => setAddForm({ ...addForm, month: e.target.value })}
                    placeholder="e.g. August 2026"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Net Disbursed Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={addForm.amount}
                    onChange={(e) => setAddForm({ ...addForm, amount: e.target.value })}
                    placeholder="45000"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={addForm.payment_mode}
                    onChange={(e) => setAddForm({ ...addForm, payment_mode: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Direct Bank Transfer (NEFT/IMPS)">Direct Bank Transfer (NEFT/IMPS)</option>
                    <option value="RTGS Instant Transfer">RTGS Instant Transfer</option>
                    <option value="UPI (Corporate Netbanking)">UPI (Corporate Netbanking)</option>
                    <option value="Cheque Payout">Cheque Payout</option>
                    <option value="Cash Voucher">Cash Voucher</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Transaction Ref / UTR No.
                  </label>
                  <input
                    type="text"
                    value={addForm.payment_reference}
                    onChange={(e) => setAddForm({ ...addForm, payment_reference: e.target.value })}
                    placeholder="NEFT-PAY-892102"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={addForm.bank_name}
                    onChange={(e) => setAddForm({ ...addForm, bank_name: e.target.value })}
                    placeholder="e.g. HDFC Bank"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account / Masked Number
                  </label>
                  <input
                    type="text"
                    value={addForm.account_no}
                    onChange={(e) => setAddForm({ ...addForm, account_no: e.target.value })}
                    placeholder="•••• 4589"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Disbursement Date
                  </label>
                  <input
                    type="date"
                    value={addForm.disbursed_date}
                    onChange={(e) => setAddForm({ ...addForm, disbursed_date: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Disbursement Status
                  </label>
                  <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <LuCircleCheck className="w-4 h-4 text-emerald-600" />
                    <span>Disbursed (Success / Transferred)</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Accounts Notes / Remarks (Optional)
                </label>
                <textarea
                  rows={2}
                  value={addForm.notes}
                  onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                  placeholder="Processed via corporate net banking portal..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAdd}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {savingAdd ? 'Logging Payout...' : 'Disburse & Log Salary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Individual Disbursement Voucher */}
      {voucherModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-scale-up">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Salary Disbursement Voucher</h3>
                <p className="text-xs text-slate-300 mt-0.5">Official Proof of Net Salary Bank Payout</p>
              </div>
              <button
                onClick={() => setVoucherModal(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <LuX className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Employee Name</div>
                  <div className="text-sm font-extrabold text-slate-800 mt-0.5">{voucherModal.name}</div>
                  <div className="text-[11px] text-slate-500">{voucherModal.role} • {voucherModal.department}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Employee ID</div>
                  <div className="text-xs font-bold font-mono text-indigo-600 mt-0.5">{voucherModal.employeeId}</div>
                  <div className="text-[11px] text-slate-500 font-semibold">{voucherModal.month}</div>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Net Disbursed Amount:</span>
                  <span className="text-base font-extrabold text-emerald-700 font-mono">
                    ₹{Number(voucherModal.netSalary || voucherModal.baseSalary || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Bank & Account:</span>
                  <span className="font-semibold text-slate-800">{voucherModal.bankName} ({voucherModal.accountNo})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Transaction UTR / Ref:</span>
                  <span className="font-mono font-bold text-slate-700">{voucherModal.paymentRef}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Disbursed Date:</span>
                  <span className="font-semibold text-slate-800">{voucherModal.disbursedDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Clearance Status:</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Disbursed (Success)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setVoucherModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LuPrinter className="w-3.5 h-3.5" /> Print Payout Voucher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View Batch Staff Breakdown */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-scale-up my-8">
            <div className="p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  Batch Staff Breakdown — {selectedBatch.month}
                </h3>
                <p className="text-xs text-indigo-200 mt-0.5">
                  Code: {selectedBatch.batchCode} • {selectedBatch.staffCount} Staff Accounts
                </p>
              </div>
              <button
                onClick={() => setSelectedBatch(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <LuX className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500">
                      <th className="py-2.5 px-3">Staff Name</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Bank Details</th>
                      <th className="py-2.5 px-3 text-right">Net Salary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedBatch.salaries?.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {s.name}
                          <div className="text-[10px] text-slate-400 font-mono">{s.employeeId}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{s.role}</td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {s.bankName}
                          <div className="text-[10px] text-slate-400 font-mono">{s.accountNo}</div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold font-mono text-emerald-700">
                          ₹{Number(s.netSalary).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedBatch(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close Breakdown
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Action Batch Payout */}
      {actionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-scale-up">
            <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Execute Batch Bank Payout</h3>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Batch: {actionModal.batchCode} ({actionModal.month})
                </p>
              </div>
              <button
                onClick={() => setActionModal(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <LuX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteBatchAction} className="p-6 space-y-4">
              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 space-y-1">
                <div className="text-xs text-emerald-900 font-semibold">
                  Total Staff Accounts: <span className="font-bold">{actionModal.staffCount} Employees</span>
                </div>
                <div className="text-base font-extrabold text-emerald-700 font-mono">
                  Total Payout: ₹{Number(actionModal.netAmount).toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bank Reference / UTR Number
                </label>
                <input
                  type="text"
                  required
                  value={payoutReference}
                  onChange={(e) => setPayoutReference(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Mode
                </label>
                <input
                  type="text"
                  value={payoutMode}
                  onChange={(e) => setPayoutMode(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Accounts Clearance Notes
                </label>
                <textarea
                  rows={2}
                  value={accountsNotes}
                  onChange={(e) => setAccountsNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {actionLoading ? 'Processing...' : 'Confirm & Disburse Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
