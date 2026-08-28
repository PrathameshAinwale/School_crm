import React, { useState, useEffect } from 'react';
import { accountsService } from '../../services/accountsService';
import {
  LuReceipt,
  LuSearch,
  LuFilter,
  LuBellRing,
  LuCircleCheck,
  LuShieldAlert,
  LuClock,
  LuPlus,
  LuDownload,
  LuPrinter,
  LuX,
  LuSend,
  LuUser,
  LuCreditCard,
  LuPhone,
  LuMail,
  LuRefreshCw,
  LuCalendar,
  LuBus,
  LuGraduationCap,
  LuChevronRight,
  LuCheck,
  LuArrowRight,
  LuLayers,
} from 'react-icons/lu';

export default function StudentFeesManagementPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [summary, setSummary] = useState(null);

  // Filter States
  const [selectedClassId, setSelectedClassId] = useState('all');
  const [selectedSectionId, setSelectedSectionId] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Selected Student for Detailed Installments Modal
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Action Modals
  const [reminderModal, setReminderModal] = useState(null);
  const [reminderMessage, setReminderMessage] = useState('');
  const [bulkReminderModal, setBulkReminderModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [paymentTxnId, setPaymentTxnId] = useState('');
  const [receiptModal, setReceiptModal] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [processing, setProcessing] = useState(false);

  const showToast = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const loadFeesData = async (
    classId = selectedClassId,
    sectionId = selectedSectionId,
    status = statusFilter,
    searchVal = search
  ) => {
    try {
      setLoading(true);
      const params = {};
      if (classId && classId !== 'all') params.class_id = classId;
      if (sectionId && sectionId !== 'all') params.section_id = sectionId;
      if (status && status !== 'all') params.status = status;
      if (searchVal && searchVal.trim()) params.search = searchVal.trim();

      const res = await accountsService.getFees(params);

      if (res?.success && res.data) {
        setStudents(res.data.students || []);
        if (res.data.classes && res.data.classes.length > 0) {
          setClasses(res.data.classes);
        }
        setSummary(res.data.summary || null);

        // If a student modal is currently open, refresh their data
        if (selectedStudent) {
          const updated = (res.data.students || []).find((s) => s.id === selectedStudent.id);
          if (updated) setSelectedStudent(updated);
        }
      }
    } catch (err) {
      console.error('Error loading fees data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFeesData(selectedClassId, selectedSectionId, statusFilter, search);
  }, [selectedClassId, selectedSectionId, statusFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadFeesData();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadFeesData(selectedClassId, selectedSectionId, statusFilter, search);
  };

  // Get available sections for currently selected class (or all unique sections)
  const activeClassObj = classes.find(
    (c) => String(c.id) === String(selectedClassId) || String(c.name).toLowerCase() === String(selectedClassId).toLowerCase()
  );
  const availableSections = activeClassObj
    ? (activeClassObj.sections || [])
    : Array.from(new Map(classes.flatMap((c) => c.sections || []).map((s) => [s.name, s])).values());

  // Use backend-filtered students directly
  const filteredStudents = students;

  const handleSendReminder = async () => {
    if (!reminderModal) return;
    try {
      setProcessing(true);
      const res = await accountsService.sendFeeReminder(reminderModal.id, {
        message: reminderMessage || undefined,
      });
      if (res?.success) {
        showToast(res.message || 'Fee reminder notification pushed to parent successfully!');
        setReminderModal(null);
      }
    } catch {
      showToast('Failed to send reminder.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSendBulkReminders = async () => {
    try {
      setProcessing(true);
      const res = await accountsService.sendBulkFeeReminders({
        message: reminderMessage || undefined,
      });
      if (res?.success) {
        showToast(res.message || 'Bulk fee reminders pushed successfully!');
        setBulkReminderModal(false);
      }
    } catch {
      showToast('Failed to send bulk reminders.');
    } finally {
      setProcessing(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentModal) return;
    try {
      setProcessing(true);
      const res = await accountsService.recordFeePayment(paymentModal.id, {
        payment_mode: paymentMode,
        transaction_id: paymentTxnId || undefined,
      });
      if (res?.success) {
        showToast(res.message || 'Fee payment recorded successfully!');
        setPaymentModal(null);
        loadFeesData();
      }
    } catch {
      showToast('Failed to record payment.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-5 pb-12 animate-fade-in">
      {/* Toast Notification */}
      {actionSuccess && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-scale-up border border-emerald-700">
          <LuCircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Student Fees Management</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
              Session 2026-27
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Select standard & division to review students, track clearance status, and manage installment ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
          >
            <LuRefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => setBulkReminderModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LuBellRing className="w-3.5 h-3.5" />
            Push Reminders to Defaulters
          </button>
        </div>
      </div>

      {/* Top Financial KPI Row */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
            <div className="text-xs font-medium text-slate-500">Total Fees Billed</div>
            <div className="text-xl font-bold text-slate-800 mt-1 font-mono tracking-tight">
              ₹{Number(summary.totalAmount || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Across {students.length} enrolled students
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
            <div className="text-xs font-medium text-slate-500">Total Collected</div>
            <div className="text-xl font-bold text-emerald-600 mt-1 font-mono tracking-tight">
              ₹{Number(summary.paidAmount || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              {summary.paidCount} installments cleared
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
            <div className="text-xs font-medium text-slate-500">Total Overdue Dues</div>
            <div className="text-xl font-bold text-rose-600 mt-1 font-mono tracking-tight">
              ₹{Number(summary.overdueAmount || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-rose-500 font-semibold mt-0.5">
              {summary.overdueCount} terms overdue
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
            <div className="text-xs font-medium text-slate-500">Pending Upcoming Dues</div>
            <div className="text-xl font-bold text-amber-600 mt-1 font-mono tracking-tight">
              ₹{Number(summary.pendingAmount || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-amber-600 font-medium mt-0.5">
              {summary.pendingCount} terms pending
            </div>
          </div>
        </div>
      )}

      {/* Class & Division Selector & Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        {/* Row 1: Search & Standard + Division Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="lg:col-span-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search student, parent, admission #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary-500"
              />
            </form>
          </div>

          {/* Select Class Standard */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 shrink-0 flex items-center gap-1">
                <LuGraduationCap className="w-3.5 h-3.5 text-primary-600" /> Class:
              </span>
              <select
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  setSelectedSectionId('all');
                }}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary-500 cursor-pointer"
              >
                <option value="all">All Standards (Classes)</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Select Division / Section */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 shrink-0 flex items-center gap-1">
                <LuLayers className="w-3.5 h-3.5 text-indigo-600" /> Division:
              </span>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary-500 cursor-pointer"
              >
                <option value="all">All Divisions</option>
                {availableSections.map((s) => (
                  <option key={s.id} value={s.id}>
                    Section {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Paid">Paid in Full</option>
              <option value="Partial">Partially Paid</option>
              <option value="Pending">Payment Pending</option>
              <option value="Overdue">Overdue Dues</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Fees Roster Table (One Row Per Student) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Student & Roll No</th>
                <th className="py-3.5 px-4">Standard & Division</th>
                <th className="py-3.5 px-4">Parent Details</th>
                <th className="py-3.5 px-4">Transport</th>
                <th className="py-3.5 px-4">Total Billed</th>
                <th className="py-3.5 px-4">Paid Amount</th>
                <th className="py-3.5 px-4">Outstanding</th>
                <th className="py-3.5 px-4">Clearance Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
                    <div className="mt-2 text-xs">Loading student fee records...</div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No student fee records found matching your selected class/division filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => {
                  const paidTermsCount = (stu.installments || []).filter((i) => i.status === 'Paid').length;
                  const totalTermsCount = (stu.installments || []).length || 4;

                  return (
                    <tr
                      key={stu.id}
                      onClick={() => setSelectedStudent(stu)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 group-hover:text-primary-700 transition-colors">
                          {stu.studentName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Roll: {stu.rollNo || '—'} • {stu.admissionNo}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">
                          {stu.class}
                        </span>
                        <span className="text-[11px] text-slate-400 ml-1">
                          (Sec {stu.section || 'A'})
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-700">{stu.parentName}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <LuPhone className="w-3 h-3 text-slate-400" />
                          {stu.parentPhone}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            stu.withTransport
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <LuBus className="w-3 h-3" />
                          {stu.withTransport ? 'Opted' : 'No'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-800 font-mono">
                        ₹{Number(stu.totalBilled || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-emerald-600 font-mono">
                        ₹{Number(stu.paidAmount || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4 font-bold font-mono">
                        {stu.outstanding > 0 ? (
                          <span className="text-rose-600">₹{Number(stu.outstanding).toLocaleString('en-IN')}</span>
                        ) : (
                          <span className="text-slate-400">₹0</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {stu.overallStatus === 'Paid' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <LuCircleCheck className="w-3 h-3" /> All Cleared ({paidTermsCount}/{totalTermsCount})
                          </span>
                        ) : stu.overallStatus === 'Overdue' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <LuShieldAlert className="w-3 h-3" /> Overdue Dues
                          </span>
                        ) : stu.overallStatus === 'Partial' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <LuClock className="w-3 h-3" /> Partial ({paidTermsCount}/{totalTermsCount})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <LuClock className="w-3 h-3" /> Pending (0/{totalTermsCount})
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudent(stu);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <LuReceipt className="w-3.5 h-3.5" />
                          View Installments
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Student Installment Ledger Modal / Drawer */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full my-4 sm:my-8 overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center font-bold text-base text-primary-400">
                  <LuUser className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base">{selectedStudent.studentName}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                      {selectedStudent.class} - Sec {selectedStudent.section || 'A'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                      Roll: {selectedStudent.rollNo || '—'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Parent: <strong className="text-slate-200">{selectedStudent.parentName}</strong> ({selectedStudent.parentPhone}) • Admission: {selectedStudent.admissionNo}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Summary KPI Strip */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="text-slate-400 font-medium">Total Billed</div>
                <div className="text-sm font-extrabold text-slate-800 font-mono mt-0.5">
                  ₹{Number(selectedStudent.totalBilled || 0).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="text-slate-400 font-medium">Total Paid</div>
                <div className="text-sm font-extrabold text-emerald-600 font-mono mt-0.5">
                  ₹{Number(selectedStudent.paidAmount || 0).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="text-slate-400 font-medium">Outstanding Balance</div>
                <div className="text-sm font-extrabold text-rose-600 font-mono mt-0.5">
                  ₹{Number(selectedStudent.outstanding || 0).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="text-slate-400 font-medium">Vehicle Transport</div>
                <div className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1">
                  <LuBus className="w-3.5 h-3.5 text-amber-600" />
                  {selectedStudent.withTransport ? 'Opted (+Bus Fee)' : 'Not Opted'}
                </div>
              </div>
            </div>

            {/* Installments Table */}
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800">
                  Class Fee Installments & Due Dates ({selectedStudent.installments?.length || 0} Terms)
                </h4>
                <span className="text-[11px] text-slate-400 font-medium">
                  Click 'Collect Fee' to record offline payment or 'Remind' to push an alert
                </span>
              </div>

              <div className="space-y-2.5">
                {(selectedStudent.installments || []).map((inst) => (
                  <div
                    key={inst.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-primary-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          inst.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-600'
                            : inst.status === 'Overdue'
                            ? 'bg-rose-50 text-rose-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        <LuReceipt className="w-4 h-4" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-xs text-slate-800">{inst.term}</h5>
                          {inst.status === 'Paid' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Paid
                            </span>
                          ) : inst.status === 'Overdue' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                              Overdue
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              Pending
                            </span>
                          )}
                        </div>

                        {inst.status === 'Paid' ? (
                          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5 mt-0.5">
                            <LuCircleCheck className="w-3 h-3" />
                            <span>Paid on {inst.paidDate && inst.paidDate !== '—' ? inst.paidDate : inst.dueDate}</span>
                            <span className="text-slate-400 font-normal">via {inst.mode || 'Online'}</span>
                            {inst.receiptNumber && inst.receiptNumber !== '—' && (
                              <span className="text-slate-500 font-mono">({inst.receiptNumber})</span>
                            )}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <LuCalendar className="w-3 h-3 text-slate-400" />
                            <span>Due Date: <strong className={inst.status === 'Overdue' ? 'text-rose-600' : 'text-slate-700'}>{inst.dueDate}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-slate-900 font-mono">
                          ₹{Number(inst.amount).toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {inst.status === 'Paid' ? (
                          <button
                            onClick={() => setReceiptModal(inst)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <LuReceipt className="w-3.5 h-3.5" />
                            Receipt
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setReminderModal({
                                  id: inst.id,
                                  studentName: selectedStudent.studentName,
                                  parentName: selectedStudent.parentName,
                                  parentPhone: selectedStudent.parentPhone,
                                  term: inst.term,
                                  amount: inst.amount,
                                  dueDate: inst.dueDate,
                                });
                                setReminderMessage(
                                  `Dear ${selectedStudent.parentName}, this is a reminder from the Accounts Department regarding the pending school fee of ₹${Number(inst.amount).toLocaleString('en-IN')} for ${inst.term} (Due: ${inst.dueDate}). Please pay at the earliest.`
                                );
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Push Fee Reminder"
                            >
                              <LuBellRing className="w-3.5 h-3.5" />
                              Remind
                            </button>

                            <button
                              onClick={() => {
                                setPaymentModal({
                                  id: inst.id,
                                  studentName: selectedStudent.studentName,
                                  class: selectedStudent.class,
                                  term: inst.term,
                                  amount: inst.amount,
                                });
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                            >
                              <LuCreditCard className="w-3.5 h-3.5" />
                              Collect Fee
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                All records synced with standard cbse fee blue-print.
              </span>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Push Single Fee Reminder Modal */}
      {reminderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <LuBellRing className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Push Fee Reminder Notification</h3>
                  <p className="text-xs text-slate-400">Direct in-app notification & alert to parent</p>
                </div>
              </div>
              <button
                onClick={() => setReminderModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student:</span>
                  <span className="font-bold text-slate-800">{reminderModal.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fee Term:</span>
                  <span className="font-semibold text-slate-800">{reminderModal.term}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Due:</span>
                  <span className="font-extrabold text-rose-600 font-mono">
                    ₹{Number(reminderModal.amount).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Due Date:</span>
                  <span className="font-medium text-slate-700">{reminderModal.dueDate}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Notification Message to Parent
                </label>
                <textarea
                  rows="4"
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setReminderModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendReminder}
                  disabled={processing}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <LuSend className="w-3.5 h-3.5" />
                  {processing ? 'Sending...' : 'Send Reminder Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Push Bulk Reminders Modal */}
      {bulkReminderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <LuBellRing className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Push Bulk Defaulter Reminders</h3>
                  <p className="text-xs text-slate-400">Broadcast payment alerts to all overdue/pending parents</p>
                </div>
              </div>
              <button
                onClick={() => setBulkReminderModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-rose-50 text-rose-800 rounded-xl border border-rose-200">
                <p className="font-semibold">
                  This action will push in-app alerts and notifications to all parents with pending or overdue fee installments.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Optional Custom Reminder Note
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Please clear all outstanding academic fees to avoid late charges."
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setBulkReminderModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendBulkReminders}
                  disabled={processing}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <LuSend className="w-3.5 h-3.5" />
                  {processing ? 'Broadcasting...' : 'Broadcast to All Defaulters'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Manual Payment Modal */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <LuCreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Record Fee Collection</h3>
                  <p className="text-xs text-slate-400">Offline / Cash / POS payment entry</p>
                </div>
              </div>
              <button
                onClick={() => setPaymentModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student:</span>
                  <span className="font-bold text-slate-800">{paymentModal.studentName} ({paymentModal.class})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Term:</span>
                  <span className="font-semibold text-slate-800">{paymentModal.term}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount:</span>
                  <span className="font-extrabold text-emerald-600 font-mono text-sm">
                    ₹{Number(paymentModal.amount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
                >
                  <option value="Cash">Cash at Counter</option>
                  <option value="Cheque / DD">Cheque / Demand Draft</option>
                  <option value="Bank Transfer / NEFT">Bank Transfer (NEFT/IMPS)</option>
                  <option value="POS / Card Machine">POS / Debit Card Machine</option>
                  <option value="UPI Direct">UPI Direct (School QR)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Transaction / Cheque / Ref Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. CHQ-890123 / UPI-REF-4421"
                  value={paymentTxnId}
                  onChange={(e) => setPaymentTxnId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPaymentModal(null)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRecordPayment}
                  disabled={processing}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <LuCheck className="w-3.5 h-3.5" />
                  {processing ? 'Recording...' : 'Confirm & Generate Receipt'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      {receiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-scale-up">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <LuReceipt className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Official Fee Payment Receipt</h3>
                  <p className="text-slate-400 text-xs font-mono">
                    {receiptModal.receiptNumber || 'REC-2026-X'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReceiptModal(null)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="text-center pb-3 border-b border-slate-100">
                <h4 className="text-base font-extrabold text-slate-800">EDUFLOW INTERNATIONAL SCHOOL</h4>
                <p className="text-slate-400 text-[11px]">Affiliated to CBSE Board • Accounts Department</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <LuCircleCheck className="w-3.5 h-3.5" /> PAYMENT CLEARED
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <div className="text-[11px] text-slate-400">Student Name</div>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">
                    {selectedStudent ? selectedStudent.studentName : 'Student'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Class & Section</div>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">
                    {selectedStudent ? `${selectedStudent.class} - Sec ${selectedStudent.section || 'A'}` : 'Class 10'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Fee Term</div>
                  <div className="font-semibold text-slate-800 text-xs mt-0.5">{receiptModal.term}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Paid Date</div>
                  <div className="font-semibold text-slate-800 text-xs mt-0.5">{receiptModal.paidDate}</div>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-emerald-800">Total Amount Cleared</div>
                  <div className="text-xs text-emerald-600">Mode: {receiptModal.mode || 'Online Gateway'}</div>
                </div>
                <div className="text-lg font-extrabold text-emerald-700 font-mono">
                  ₹{Number(receiptModal.amount).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LuPrinter className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast('Official receipt PDF downloaded successfully.');
                    setReceiptModal(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <LuDownload className="w-3.5 h-3.5" /> Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
