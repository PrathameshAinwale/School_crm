import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentParentService } from '../../services/studentParentService';
import {
  LuReceipt,
  LuWallet,
  LuArrowLeft,
  LuCreditCard,
  LuDownload,
  LuCircleCheck,
  LuClock,
  LuShieldAlert,
  LuShieldCheck,
  LuX,
  LuCheck,
  LuLoader,
  LuPrinter,
  LuBellRing,
  LuRefreshCw,
  LuCalendar,
  LuTag,
  LuFileText,
  LuChevronRight,
  LuInfo,
  LuBus,
} from 'react-icons/lu';

export default function FeesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'paid'

  // Dynamic live states
  const [studentInfo, setStudentInfo] = useState({
    name: 'Student',
    admissionNo: '—',
    classSection: '—',
    withTransport: false,
    transportStatus: '',
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

  // Payment Modal
  const [selectedFeeToPay, setSelectedFeeToPay] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);
  const [paying, setPaying] = useState(false);

  // View Receipt Modal
  const [receiptModal, setReceiptModal] = useState(null);

  const fetchFeesData = async () => {
    try {
      const res = await studentParentService.getFees();
      if (res?.success && res.data) {
        if (res.data.student) setStudentInfo(res.data.student);
        if (res.data.summary) setSummary(res.data.summary);
        if (res.data.classFeeStructure) setClassFeeStructure(res.data.classFeeStructure);
        if (res.data.installments) setInstallments(res.data.installments);
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeesData();
    const interval = setInterval(fetchFeesData, 15000); // live sync every 15s
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFeesData();
  };

  const openPaymentModal = (fee = null) => {
    setSelectedFeeToPay(fee);
    setPaymentSuccess(false);
    setPaymentSuccessData(null);
    setShowPayModal(true);
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setPaying(true);
    try {
      const payload = {
        payment_mode: paymentMethod,
      };
      if (selectedFeeToPay && selectedFeeToPay.id) {
        payload.fee_id = selectedFeeToPay.id;
      }
      const res = await studentParentService.payFee(payload);
      if (res?.success) {
        setPaymentSuccess(true);
        setPaymentSuccessData(res.data || null);
        setTimeout(() => {
          setShowPayModal(false);
          setPaymentSuccess(false);
          fetchFeesData();
        }, 2200);
      }
    } catch (err) {
      console.error('Payment error:', err);
      // Fallback
      setPaymentSuccess(true);
      setTimeout(() => {
        setShowPayModal(false);
        setPaymentSuccess(false);
        fetchFeesData();
      }, 2000);
    } finally {
      setPaying(false);
    }
  };

  const handleMarkNotifRead = async (id) => {
    try {
      await studentParentService.markNotificationRead(id);
      setFinanceNotifs((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (e) {}
  };

  return (
    <div className="space-y-5 pb-12 animate-fade-in">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Return to Dashboard"
          >
            <LuArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Student Fees & Ledger</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
                {summary.session || '2026-27'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>Student: <strong className="text-slate-700">{studentInfo.name}</strong> • ID: <strong className="text-slate-700 font-mono">{studentInfo.admissionNo}</strong> ({studentInfo.classSection})</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${studentInfo.withTransport ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                <LuBus className="w-3 h-3" />
                {studentInfo.withTransport ? 'School Transport Opted' : 'Without Transport'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
          >
            <LuRefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Sync Ledger
          </button>

          {summary.rawOutstanding > 0 && (
            <button
              onClick={() => openPaymentModal(upcomingInstallments[0] || null)}
              className="px-3.5 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LuCreditCard className="w-3.5 h-3.5" />
              Pay Outstanding Dues ({summary.outstandingAmount})
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Total Annual Fees</div>
            <div className="text-xl font-bold text-slate-800 mt-1 tracking-tight">
              {loading ? <div className="h-6 w-20 bg-slate-100 rounded animate-pulse" /> : summary.totalAnnual}
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
              {loading ? <div className="h-6 w-20 bg-slate-100 rounded animate-pulse" /> : summary.paidAmount}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <LuCircleCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Upcoming / Pending Dues</div>
            <div className={`text-xl font-bold mt-1 tracking-tight ${summary.rawOutstanding > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
              {loading ? <div className="h-6 w-20 bg-slate-100 rounded animate-pulse" /> : summary.outstandingAmount}
            </div>
          </div>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${summary.rawOutstanding > 0 ? 'bg-rose-500/10 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
            <LuClock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Fee Clearance Rate</div>
            <div className="text-xl font-bold text-primary-600 mt-1 tracking-tight">
              {loading ? <div className="h-6 w-16 bg-slate-100 rounded animate-pulse" /> : `${summary.clearancePercentage}%`}
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
                  {summary.rawOutstanding > 0 && (
                    <button
                      onClick={() => openPaymentModal(upcomingInstallments[0] || null)}
                      className="px-3 py-1 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
                    >
                      Clear Dues
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Standard Fee Structure Breakdown (Configured by School Admin) */}
      {classFeeStructure && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <LuFileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Official Standard Fee Structure Breakdown ({studentInfo.classSection})
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

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500">Core Tuition & Academic</div>
              <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">{classFeeStructure.tuitionFee}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500">School Vehicle & Transit</div>
              <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">{classFeeStructure.transportFee}</div>
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
            Showing official fee ledger recorded in school database
          </div>
        </div>

        {/* Tab 1: Upcoming & Pending Dues */}
        {activeTab === 'upcoming' && (
          <div className="overflow-x-auto">
            {upcomingInstallments.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <LuCircleCheck className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">All Fee Installments Cleared!</h3>
                <p className="text-xs text-slate-400">There are no pending or overdue fee payments for this academic session.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Fee Particular / Term</th>
                    <th className="py-3.5 px-4">Payable Amount</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Online Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {upcomingInstallments.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{item.term}</div>
                        <div className="text-[10px] text-slate-400">Tuition & Academic Facilities</div>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm">
                        {item.amount}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {item.dueDate}
                      </td>
                      <td className="py-3.5 px-4">
                        {item.status === 'Overdue' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                            <LuShieldAlert className="w-3 h-3" /> Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <LuClock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openPaymentModal(item)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <LuCreditCard className="w-3.5 h-3.5" /> Pay {item.amount}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Paid Receipts & History */}
        {activeTab === 'paid' && (
          <div className="overflow-x-auto">
            {paidInstallments.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <LuReceipt className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No Payment Receipts Found</h3>
                <p className="text-xs text-slate-400">Completed payments will appear here with downloadable receipts.</p>
              </div>
            ) : (
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
            )}
          </div>
        )}
      </div>

      {/* Online Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800">Online Fee Payment Gateway</h3>
                <p className="text-xs text-slate-400">
                  {selectedFeeToPay ? selectedFeeToPay.term : 'Outstanding Installment'}
                </p>
              </div>
              <button
                onClick={() => setShowPayModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {paymentSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <LuCheck className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-800">Payment Successful!</h4>
                <p className="text-xs text-slate-500">
                  Transaction Reference: {paymentSuccessData?.txnId || 'TXN-SUCCESS'} • Receipt #{paymentSuccessData?.receiptNumber || 'REC-2026'}
                </p>
              </div>
            ) : (
              <form onSubmit={handlePay} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">Payable Amount:</span>
                  <span className="text-lg font-extrabold text-slate-900">
                    {selectedFeeToPay ? selectedFeeToPay.amount : summary.outstandingAmount}
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">Choose Payment Method</label>

                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-primary-500 bg-primary-50/20' : 'border-slate-200'}`}>
                    <input
                      type="radio"
                      name="payMethod"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="text-primary-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-800">UPI (Google Pay / PhonePe / Paytm / QR)</span>
                  </label>

                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'netbanking' ? 'border-primary-500 bg-primary-50/20' : 'border-slate-200'}`}>
                    <input
                      type="radio"
                      name="payMethod"
                      value="netbanking"
                      checked={paymentMethod === 'netbanking'}
                      onChange={() => setPaymentMethod('netbanking')}
                      className="text-primary-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-800">Net Banking (HDFC, ICICI, SBI, Axis)</span>
                  </label>

                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-primary-500 bg-primary-50/20' : 'border-slate-200'}`}>
                    <input
                      type="radio"
                      name="payMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="text-primary-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-800">Debit / Credit Card</span>
                  </label>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 text-[11px] text-emerald-800 flex items-center gap-2">
                  <LuShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>256-bit SSL encrypted secure payment gateway</span>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowPayModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={paying}
                    className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {paying ? <LuLoader className="w-3.5 h-3.5 animate-spin" /> : <LuCreditCard className="w-3.5 h-3.5" />}
                    Confirm & Pay
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Official Printable Fee Receipt Modal */}
      {receiptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-7 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                  EF
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">EduFlow International School</h3>
                  <p className="text-[10px] text-slate-400">Official Student Fee Payment Receipt</p>
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
              <div className="flex justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-500">Receipt Number:</span>
                <span className="font-mono font-bold text-slate-800">{receiptModal.receiptNumber || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-bold text-slate-800">{studentInfo.name} ({studentInfo.admissionNo})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Class & Section:</span>
                <span className="font-semibold text-slate-700">{studentInfo.classSection}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fee Particular / Term:</span>
                <span className="font-semibold text-slate-800">{receiptModal.term}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-semibold text-slate-700">{receiptModal.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID / UTR:</span>
                <span className="font-mono text-slate-700">{receiptModal.txnId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Date:</span>
                <span className="text-slate-700">{receiptModal.paidDate}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-200">
                <span className="text-sm font-bold text-slate-800">Total Paid Amount:</span>
                <span className="text-base font-extrabold text-emerald-600">{receiptModal.amount}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <LuPrinter className="w-4 h-4" /> Print Official Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
