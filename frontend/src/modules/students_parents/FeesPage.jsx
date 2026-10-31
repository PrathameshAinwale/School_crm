import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentParentService } from '../../services/studentParentService';
import {
  LuReceipt,
  LuWallet,
  LuArrowLeft,
  LuDownload,
  LuCircleCheck,
  LuClock,
  LuShieldCheck,
  LuX,
  LuLoader,
  LuPrinter,
  LuBellRing,
  LuFileText,
  LuInfo,
  LuHistory,
  LuBuilding2,
} from 'react-icons/lu';

export default function FeesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'paid'

  // Dynamic live states from database
  const [studentInfo, setStudentInfo] = useState({
    name: 'Student',
    admissionNo: '—',
    classSection: 'Class 10-A',
  });
  const [summary, setSummary] = useState({
    totalAnnual: '₹0',
    paidAmount: '₹0',
    outstandingAmount: '₹0',
    rawTotalAnnual: 0,
    rawPaid: 0,
    rawOutstanding: 0,
    paidCount: 0,
    pendingCount: 0,
    overdueCount: 0,
    clearancePercentage: 0,
    isGoodStanding: true,
    session: 'Academic Session 2026-27',
  });
  const [installments, setInstallments] = useState([]);
  const [paidInstallments, setPaidInstallments] = useState([]);
  const [upcomingInstallments, setUpcomingInstallments] = useState([]);
  const [financeNotifs, setFinanceNotifs] = useState([]);
  const [classFeeStructure, setClassFeeStructure] = useState(null);
  const [counterNotice, setCounterNotice] = useState(
    'Please pay your fee dues at the school fee counter.'
  );

  // View Receipt Modal
  const [receiptModal, setReceiptModal] = useState(null);

  // Student Running Ledger Modal
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerData, setLedgerData] = useState(null);

  const fetchFeesData = async () => {
    try {
      const res = await studentParentService.getFees();
      if (res?.success && res.data) {
        if (res.data.student) setStudentInfo(res.data.student);
        if (res.data.summary) setSummary(res.data.summary);
        if (res.data.classFeeStructure) setClassFeeStructure(res.data.classFeeStructure);
        if (res.data.installments) setInstallments(res.data.installments);
        if (res.data.counterNotice) setCounterNotice(res.data.counterNotice);
        if (res.data.paidInstallments) {
          setPaidInstallments(res.data.paidInstallments);
        } else if (res.data.installments) {
          setPaidInstallments(res.data.installments.filter((f) => f.status === 'Paid'));
        }
        if (res.data.upcomingInstallments) {
          setUpcomingInstallments(res.data.upcomingInstallments);
        } else if (res.data.installments) {
          setUpcomingInstallments(res.data.installments.filter((f) => f.status !== 'Paid'));
        }
        if (res.data.financeNotifications) {
          setFinanceNotifs(res.data.financeNotifications);
        }
      }
    } catch (err) {
      console.error('Error fetching fee ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLedger = async () => {
    setShowLedgerModal(true);
    setLedgerLoading(true);
    try {
      const res = await studentParentService.getFeeLedger();
      if (res?.success && res.data) {
        setLedgerData(res.data);
      }
    } catch (err) {
      console.error('Error fetching student fee ledger:', err);
    } finally {
      setLedgerLoading(false);
    }
  };

  useEffect(() => {
    fetchFeesData();
    const interval = setInterval(fetchFeesData, 15000); // live sync every 15s
    return () => clearInterval(interval);
  }, []);

  const handleMarkNotifRead = async (id) => {
    try {
      await studentParentService.markNotificationRead(id);
      setFinanceNotifs((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Header & Quick Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors text-slate-600 cursor-pointer"
            title="Go back"
          >
            <LuArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              Fee Ledger & Receipts
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
                {summary?.session || 'Session 2026-27'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Student: <strong className="text-slate-700">{studentInfo?.name || 'Aarav Patel'}</strong> • Roll #{' '}
              {studentInfo?.admissionNo || 'STU-101'} • {studentInfo?.classSection || 'Class 10-A'}
            </p>
          </div>
        </div>

        {/* Action Button: View Complete Running Ledger */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLedger}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <LuHistory className="w-4 h-4 text-primary-600" /> View Account Statement & Ledger
          </button>
        </div>
      </div>

      {/* Prominent Counter Payment Notice (Online Gateways Disabled) */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-2xl p-4 sm:p-5 border border-blue-200/70 shadow-xs flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <LuBuilding2 className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-blue-900 flex items-center gap-2">
            School Fee Counter Payment Notice
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              Offline Desk Active
            </span>
          </h2>
          <p className="text-xs text-blue-800/90 leading-relaxed font-medium">
            {counterNotice}
          </p>
          <p className="text-[11px] text-blue-700/80 font-normal">
            Accepted modes: <strong>Cash, Cheque, Bank Transfer (NEFT/RTGS), or Counter UPI</strong>. Official computer-generated receipts are issued immediately upon payment.
          </p>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Total Annual Fees</div>
            <div className="text-xl font-bold text-slate-800 mt-1 tracking-tight">
              {loading ? <div className="h-6 w-20 bg-slate-100 rounded animate-pulse" /> : (summary?.totalAnnual || '₹0')}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <LuWallet className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Total Fees Paid</div>
            <div className="text-xl font-bold text-emerald-600 mt-1 tracking-tight">
              {loading ? <div className="h-6 w-20 bg-slate-100 rounded animate-pulse" /> : (summary?.paidAmount || '₹0')}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <LuCircleCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Upcoming / Pending Dues</div>
            <div className={`text-xl font-bold mt-1 tracking-tight ${(summary?.rawOutstanding ?? 0) > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
              {loading ? <div className="h-6 w-20 bg-slate-100 rounded animate-pulse" /> : (summary?.outstandingAmount || '₹0')}
            </div>
          </div>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${(summary?.rawOutstanding ?? 0) > 0 ? 'bg-rose-500/10 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
            <LuClock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Fee Clearance Rate</div>
            <div className="text-xl font-bold text-primary-600 mt-1 tracking-tight">
              {loading ? <div className="h-6 w-16 bg-slate-100 rounded animate-pulse" /> : `${summary?.clearancePercentage || 0}%`}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-primary-500/10 text-primary-600 flex items-center justify-center shrink-0">
            <LuShieldCheck className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Finance Department Official Notices & Reminders Stream */}
      {financeNotifs.length > 0 && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <LuBellRing className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-800">
                Finance & Accounts Department Notices & Reminders
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {financeNotifs.filter((n) => !n.is_read).length} Unread
            </span>
          </div>

          <div className="space-y-2.5">
            {financeNotifs.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  !notif.is_read
                    ? 'bg-amber-50/50 border-amber-200/80 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200/60'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-primary-600 mt-1.5 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-800">{notif.title}</span>
                      <span className="text-[10px] text-slate-400 font-medium">({notif.time_ago || notif.created_at})</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {!notif.is_read && (
                    <button
                      onClick={() => handleMarkNotifRead(notif.id)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Standard Fee Structure Breakdown */}
      {classFeeStructure && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <LuFileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Official Standard Fee Structure Breakdown ({studentInfo?.classSection || 'Class 10-A'})
                </h2>
                <p className="text-[11px] text-slate-400">
                  Approved annual fee heads and composite curriculum schedule by School Administration.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg">
              Total {classFeeStructure.totalAnnualFee} / Year
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500">Core Tuition & Academic</div>
              <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">{classFeeStructure.tuitionFee}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500">Science Lab & Library</div>
              <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">{classFeeStructure.labLibraryFee}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500">Activities, Sports & Other</div>
              <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">
                ₹{(classFeeStructure.rawActivity + classFeeStructure.rawOther).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Tabs: Upcoming & Pending vs Paid Receipts */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl max-w-fit">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'upcoming'
                  ? 'bg-white text-slate-800 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Upcoming & Pending Payments ({upcomingInstallments.length})
            </button>
            <button
              onClick={() => setActiveTab('paid')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'paid'
                  ? 'bg-white text-slate-800 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Paid Receipts & History ({paidInstallments.length})
            </button>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Official fee installment schedule recorded in school database
          </div>
        </div>

        {/* Tab 1: Upcoming & Pending Dues */}
        {activeTab === 'upcoming' && (
          <div>
            {upcomingInstallments.length === 0 ? (
              <div className="py-8 sm:py-12 text-center text-slate-400 space-y-2">
                <LuCircleCheck className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">All Fee Installments Cleared!</h3>
                <p className="text-xs text-slate-400">There are no pending or overdue fee payments for this academic session.</p>
              </div>
            ) : (
              <>
                {/* Mobile Cards View */}
                <div className="sm:hidden space-y-2.5 p-3">
                  {upcomingInstallments.map((item) => (
                    <div key={item.id} className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 leading-tight">{item.term}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">Due: {item.dueDate}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${
                          item.status === 'Overdue' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                        <span className="text-sm font-black font-mono text-slate-900">{item.amount}</span>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-200/80 text-slate-700 text-[10px] font-semibold">
                          Pay at Fee Counter
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Fee Particular / Term</th>
                        <th className="py-3.5 px-4">Payable Amount</th>
                        <th className="py-3.5 px-4">Due Date</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Payment Method</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {upcomingInstallments.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-800">{item.term}</div>
                            <div className="text-[10px] text-slate-400">Tuition & School Amenities</div>
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm">
                            {item.amount}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {item.dueDate}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              item.status === 'Overdue'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                              <LuBuilding2 className="w-3.5 h-3.5 text-blue-600" /> Pay at Fee Counter
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 2: Paid Receipts & History */}
        {activeTab === 'paid' && (
          <div>
            {paidInstallments.length === 0 ? (
              <div className="py-8 sm:py-12 text-center text-slate-400 space-y-2">
                <LuInfo className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No Receipts Found</h3>
                <p className="text-xs text-slate-400">Payment receipts will appear here once cleared by Accounts desk.</p>
              </div>
            ) : (
              <>
                {/* Mobile Cards View */}
                <div className="sm:hidden space-y-2.5 p-3">
                  {paidInstallments.map((item) => (
                    <div key={item.id} className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 leading-tight">{item.term}</h4>
                          <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                            <LuCircleCheck className="w-2.5 h-2.5" /> Paid on {item.paidDate}
                          </p>
                        </div>
                        <span className="text-xs font-black font-mono text-emerald-700">{item.amount}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] text-slate-500">
                        <span className="font-mono">{item.receiptNumber}</span>
                        <button
                          onClick={() => setReceiptModal(item)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <LuReceipt className="w-3 h-3" /> Receipt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Fee Particular</th>
                        <th className="py-3.5 px-4">Amount Paid</th>
                        <th className="py-3.5 px-4">Payment Date</th>
                        <th className="py-3.5 px-4">Payment Mode & Txn ID</th>
                        <th className="py-3.5 px-4">Receipt #</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {paidInstallments.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-800">{item.term}</div>
                            <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                              <LuCircleCheck className="w-3 h-3" /> Fully Cleared
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-emerald-700 text-sm">
                            {item.amount}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-medium">
                            {item.paidDate}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-700">{item.mode}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{item.txnId}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                              {item.receiptNumber}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setReceiptModal(item)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <LuReceipt className="w-3.5 h-3.5" /> View Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Official Printable Fee Receipt Modal */}
      {receiptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                  AC
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">Official Student Fee Receipt</h3>
                  <p className="text-[10px] text-slate-400">Validated computer-generated voucher</p>
                </div>
              </div>
              <button
                onClick={() => setReceiptModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              {receiptModal.receiptNumber?.includes('LEGACY') && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] leading-relaxed">
                  <strong>Notice:</strong> No receipt on record (legacy entry). Historical payments prior to system migration do not have downloadable PDF vouchers.
                </div>
              )}
              <div className="flex justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-500">Receipt Number:</span>
                <span className="font-mono font-bold text-slate-800">{receiptModal.receiptNumber || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-bold text-slate-800">{studentInfo.name} ({studentInfo.admissionNo})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Class & Division:</span>
                <span className="font-semibold text-slate-700">{studentInfo.classSection}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fee Particular / Head:</span>
                <span className="font-semibold text-slate-800">{receiptModal.term}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-semibold text-slate-700">{receiptModal.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reference / Txn ID:</span>
                <span className="font-mono text-slate-700">{receiptModal.txnId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Date:</span>
                <span className="text-slate-700">{receiptModal.paidDate}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-200">
                <span className="text-sm font-bold text-slate-800">Total Paid:</span>
                <span className="text-base font-extrabold text-emerald-600">{receiptModal.amount}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <LuPrinter className="w-4 h-4" /> Print Receipt
              </button>
              {receiptModal.receiptNumber?.includes('LEGACY') && (
                <button
                  onClick={() => window.open(`/api/v1/student/fees/installments/${receiptModal.id}/legacy-receipt`, '_blank')}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <LuFileText className="w-4 h-4" /> View Legacy Record
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Student Running Fee Ledger Modal */}
      {showLedgerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  <LuHistory className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Student Fee Account Statement</h3>
                  <p className="text-xs text-slate-400">Append-only chronological audit ledger</p>
                </div>
              </div>
              <button
                onClick={() => setShowLedgerModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-4 grow">
              {ledgerLoading ? (
                <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
                  <LuLoader className="w-6 h-6 animate-spin text-primary-600" />
                  <span className="text-xs">Loading ledger entries...</span>
                </div>
              ) : !ledgerData || ledgerData.entries?.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No ledger transactions recorded yet.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <div className="text-slate-400 text-[11px]">Total Debits (Fees Billed)</div>
                      <div className="text-sm font-bold text-slate-800 mt-0.5">
                        ₹{Number(ledgerData.summary?.total_debits || 0).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">Total Credits (Paid / Relieved)</div>
                      <div className="text-sm font-bold text-emerald-600 mt-0.5">
                        ₹{Number(ledgerData.summary?.total_credits || 0).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">Net Outstanding Due</div>
                      <div className="text-sm font-bold text-rose-600 mt-0.5">
                        ₹{Number(ledgerData.summary?.net_balance_due || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3 text-right">Debit (₹)</th>
                        <th className="py-2.5 px-3 text-right">Credit (₹)</th>
                        <th className="py-2.5 px-3 text-right">Balance (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ledgerData.entries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-medium text-slate-600 whitespace-nowrap">{entry.formatted_date}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                              {entry.entry_type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-800">{entry.description}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                            {entry.debit > 0 ? Number(entry.debit).toFixed(2) : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-emerald-600">
                            {entry.credit > 0 ? Number(entry.credit).toFixed(2) : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {Number(entry.running_balance).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
              <button
                onClick={() => setShowLedgerModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
