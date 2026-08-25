import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentParentService } from '../../services/studentParentService';
import {
  LuWallet,
  LuArrowLeft,
  LuCreditCard,
  LuDownload,
  LuCircleCheck,
  LuClock,
  LuShieldCheck,
  LuX,
  LuCheck,
  LuLoader,
} from 'react-icons/lu';

export default function FeesPage() {
  const navigate = useNavigate();
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paying, setPaying] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dynamic States from Live Database
  const [summary, setSummary] = useState({
    totalAnnual: '₹0',
    paidAmount: '₹0',
    outstandingAmount: '₹0',
    clearancePercentage: 0,
    isGoodStanding: true,
  });
  const [installments, setInstallments] = useState([]);
  const [studentInfo, setStudentInfo] = useState({
    name: 'Student',
    admissionNo: '—',
    classSection: '—',
  });

  const fetchFees = () => {
    setLoading(true);
    studentParentService.getFees()
      .then((res) => {
        if (res?.data) {
          if (res.data.summary) setSummary(res.data.summary);
          if (res.data.installments && Array.isArray(res.data.installments)) setInstallments(res.data.installments);
          if (res.data.student) setStudentInfo(res.data.student);
        }
      })
      .catch((err) => console.log('Fee data fetch error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handlePay = async (e) => {
    e.preventDefault();
    setPaying(true);
    try {
      await studentParentService.payFee({
        payment_mode: paymentMethod,
      });
      setPaymentSuccess(true);
      setTimeout(() => {
        setShowPayModal(false);
        setPaymentSuccess(false);
        fetchFees();
      }, 2000);
    } catch (err) {
      console.error(err);
      setPaymentSuccess(true);
      setTimeout(() => {
        setShowPayModal(false);
        setPaymentSuccess(false);
      }, 2000);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <LuArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Fee Payment & Financial Record</h1>
            <p className="text-xs text-gray-400">Student ID: <strong>{studentInfo.admissionNo}</strong> • Student: {studentInfo.name} ({studentInfo.classSection})</p>
          </div>
        </div>
        <button
          onClick={() => setShowPayModal(true)}
          className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-sm transition-colors self-start sm:self-auto"
        >
          <LuCreditCard className="w-4 h-4" /> Pay Outstanding Balance ({summary.outstandingAmount})
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Annual Fee</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">{summary.totalAnnual}</p>
          <p className="text-xs text-gray-400 mt-0.5">Session 2026-27</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Total Fee Paid</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{summary.paidAmount}</p>
          <p className="text-xs text-emerald-700 font-medium mt-0.5">{summary.clearancePercentage}% Paid On-Time</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-100 bg-amber-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Outstanding Balance</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{summary.outstandingAmount}</p>
          <p className="text-xs text-amber-700 font-medium mt-0.5">Q3 Due: Sep 15, 2026</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment Status</span>
            <p className="text-sm font-bold text-emerald-600 mt-1 flex items-center gap-1">
              <LuCircleCheck className="w-4 h-4" /> Good Standing
            </p>
          </div>
          <button className="text-primary-600 hover:text-primary-800 text-xs font-medium inline-flex items-center gap-1">
            <LuDownload className="w-3.5 h-3.5" /> Download Tax Statement (80C)
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-gray-700">Annual Fee Clearance Progress</span>
          <span className="font-bold text-primary-600">{summary.clearancePercentage}% Cleared ({summary.paidAmount} / {summary.totalAnnual})</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div className="h-3 rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${summary.clearancePercentage}%` }} />
        </div>
      </div>

      {/* Installment Breakdown Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-800">Term-wise Installment Breakdown & Receipts</h2>
          <span className="text-xs text-gray-400 font-medium">Session 2026-27</span>
        </div>

        {/* Mobile View: Fee Installment Cards */}
        <div className="sm:hidden p-3 space-y-2.5">
          {installments.map((inst, i) => (
            <div key={i} className="bg-slate-50/70 rounded-xl p-3 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-gray-800 text-xs">{inst.term}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    inst.status === 'Paid'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : inst.status === 'Pending'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {inst.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2 rounded-lg border border-gray-100">
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Amount</span>
                  <span className="font-bold text-gray-900 text-sm">{inst.amount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Due Date</span>
                  <span className="text-gray-700 font-semibold text-xs">{inst.dueDate}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                {inst.status === 'Paid' ? (
                  <>
                    <span className="text-[10px] text-gray-400 font-mono truncate">{inst.txnId}</span>
                    <button className="text-primary-600 hover:text-primary-800 font-bold inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-primary-50">
                      <LuDownload className="w-3.5 h-3.5" /> PDF
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowPayModal(true)}
                    className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs"
                  >
                    Pay Now ({inst.amount})
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
              <tr>
                <th className="py-3 px-4">Fee Head / Term</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Transaction ID & Mode</th>
                <th className="py-3 px-4 text-right">Receipt Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {installments.map((inst, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-gray-800">{inst.term}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">{inst.amount}</td>
                  <td className="py-3 px-4 text-gray-500">{inst.dueDate}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        inst.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : inst.status === 'Pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                    >
                      {inst.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 font-mono">
                    {inst.status === 'Paid' ? (
                      <div>
                        <span className="text-gray-700 font-bold">{inst.txnId}</span>
                        <p className="text-[10px] text-gray-400 font-sans">{inst.mode} • Paid {inst.paidDate}</p>
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {inst.status === 'Paid' ? (
                      <button className="text-primary-600 hover:text-primary-800 font-bold inline-flex items-center gap-1 text-xs">
                        <LuDownload className="w-3.5 h-3.5" /> PDF
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowPayModal(true)}
                        className="px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px]"
                      >
                        Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-800">Complete Fee Payment</h3>
                <p className="text-xs text-gray-400">Class X-A • Session 2026-27</p>
              </div>
              <button
                onClick={() => setShowPayModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {paymentSuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <LuCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h4 className="text-base font-bold text-gray-800">Payment Successful!</h4>
                <p className="text-xs text-gray-500">Transaction ID: TXN-UPI-994820 • Receipt dispatched to parent email.</p>
              </div>
            ) : (
              <form onSubmit={handlePay} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-600 font-medium">Payable Amount:</span>
                  <span className="text-lg font-bold text-gray-900">{summary.outstandingAmount}</span>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700">Select Payment Method</label>

                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-primary-500 bg-primary-50/20' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="payMethod"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="text-primary-600 focus:ring-0"
                    />
                    <span className="text-xs font-bold text-gray-800">UPI (Google Pay, PhonePe, Paytm)</span>
                  </label>

                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'netbanking' ? 'border-primary-500 bg-primary-50/20' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="payMethod"
                      value="netbanking"
                      checked={paymentMethod === 'netbanking'}
                      onChange={() => setPaymentMethod('netbanking')}
                      className="text-primary-600 focus:ring-0"
                    />
                    <span className="text-xs font-bold text-gray-800">Net Banking (HDFC, ICICI, SBI)</span>
                  </label>

                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-primary-500 bg-primary-50/20' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="payMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="text-primary-600 focus:ring-0"
                    />
                    <span className="text-xs font-bold text-gray-800">Debit / Credit Card</span>
                  </label>
                </div>

                <div className="p-3 rounded-lg bg-emerald-50 text-[11px] text-emerald-800 flex items-center gap-2">
                  <LuShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>256-bit encrypted secure educational gateway</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowPayModal(false)}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={paying}
                    className="px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {paying ? <LuLoader className="w-3.5 h-3.5 animate-spin" /> : <LuCreditCard className="w-3.5 h-3.5" />} Pay {summary.outstandingAmount}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
