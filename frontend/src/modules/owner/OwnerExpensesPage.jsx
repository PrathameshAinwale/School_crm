import React, { useState } from 'react';
import {
  LuReceipt,
  LuSearch,
  LuDownload,
  LuCircleCheck,
  LuFileText,
  LuBuilding2,
  LuDollarSign,
  LuPlus,
  LuX,
} from 'react-icons/lu';

const OWNER_EXPENSES_DATA = [
  { id: 'EXP-2026-881', date: '01 Aug 2026', title: 'Monthly Faculty & Staff Payroll', category: 'Payroll & Salaries', vendor: 'EduFlow Institutional Escrow / HDFC', amount: '₹1,24,00,000', paymentMode: 'Direct Bank NEFT', approvedBy: 'Board of Trustees', status: 'Realized / Paid', receiptNo: 'RC-HDFC-88912' },
  { id: 'EXP-2026-882', date: '05 Aug 2026', title: 'Smart Class 4K Displays (Block B - 8 Units)', category: 'Infrastructure & Labs', vendor: 'LG Commercial Electronics Ltd', amount: '₹12,40,000', paymentMode: 'RTGS Transfer', approvedBy: 'Trustee / CAO', status: 'Realized / Paid', receiptNo: 'INV-LG-99201' },
  { id: 'EXP-2026-883', date: '08 Aug 2026', title: 'Fleet Diesel Fuel & GPS Subscriptions', category: 'Transport & Fleet', vendor: 'Indian Oil Corp & Fleetmatics', amount: '₹4,85,000', paymentMode: 'Corporate Card', approvedBy: 'Transport Manager', status: 'Realized / Paid', receiptNo: 'IOC-DL-44120' },
  { id: 'EXP-2026-884', date: '10 Aug 2026', title: 'Physics, Chem & Bio Practical Chemicals & Apparatus', category: 'Infrastructure & Labs', vendor: 'Thermo Fisher Scientific India', amount: '₹3,20,000', paymentMode: 'Net Banking', approvedBy: 'Science HOD / CAO', status: 'Realized / Paid', receiptNo: 'TF-2026-1192' },
  { id: 'EXP-2026-885', date: '12 Aug 2026', title: '150 kW Solar Grid Maintenance & Power Backup', category: 'Utilities & Power', vendor: 'Tata Power Solar Systems', amount: '₹1,80,000', paymentMode: 'NEFT', approvedBy: 'Operations Lead', status: 'Realized / Paid', receiptNo: 'TPS-MNT-8812' },
  { id: 'EXP-2026-886', date: '14 Aug 2026', title: 'Olympic Sports Ground Synthetic Turf Relining', category: 'Sports & Facilities', vendor: 'FieldTurf Sports Infrastructure', amount: '₹6,50,000', paymentMode: 'Cheque #991024', approvedBy: 'Board of Trustees', status: 'Realized / Paid', receiptNo: 'FT-DEL-2026' },
  { id: 'EXP-2026-887', date: '16 Aug 2026', title: 'Enterprise Cloud ERP & Security CCTV Licenses', category: 'IT & Software Licenses', vendor: 'AWS & SecureCloud Systems', amount: '₹2,40,000', paymentMode: 'Corporate Card', approvedBy: 'IT Head / CAO', status: 'Realized / Paid', receiptNo: 'AWS-ED-2026' },
  { id: 'EXP-2026-888', date: '18 Aug 2026', title: 'Annual Institutional Fire Safety NOC Audit', category: 'Compliance & Safety', vendor: 'Delhi Fire Safety Authority', amount: '₹95,000', paymentMode: 'Challan Portal', approvedBy: 'CAO', status: 'Realized / Paid', receiptNo: 'DFS-NOC-2026' },
];

export default function OwnerExpensesPage() {
  const [expensesList] = useState(OWNER_EXPENSES_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedExpense, setSelectedExpense] = useState(null);

  const filtered = expensesList.filter((exp) => {
    const matchesSearch =
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.approvedBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || exp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['ALL', ...Array.from(new Set(expensesList.map((e) => e.category)))];

  const handleExport = () => {
    const headers = ['Voucher ID,Date,Title,Category,Vendor,Amount,Payment Mode,Approved By,Status,Receipt No'];
    const rows = expensesList.map(
      (e) => `"${e.id}","${e.date}","${e.title}","${e.category}","${e.vendor}","${e.amount}","${e.paymentMode}","${e.approvedBy}","${e.status}","${e.receiptNo}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Institutional_Expenses_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Clean Standard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <LuReceipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">School Expenses & Financial Audit</h1>
            <p className="text-xs text-gray-400">Institutional expenditures, payroll disbursements, infrastructure, and operational costs</p>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-2 border border-gray-200 transition-colors shadow-xs self-start sm:self-auto"
        >
          <LuDownload className="w-4 h-4 text-gray-500" /> Export Expense Ledger
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Month Outflow</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">₹1.56 Cr</p>
          <p className="text-xs text-gray-400 mt-0.5">August 2026</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider">Faculty Payroll</span>
          <p className="text-2xl font-bold text-primary-600 mt-1">₹1.24 Cr</p>
          <p className="text-xs text-gray-400 mt-0.5">79.5% of Outflow</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Infrastructure & Labs</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">₹15.60 L</p>
          <p className="text-xs text-emerald-700 font-medium mt-0.5">Approved</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fleet & Utilities</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">₹6.65 L</p>
          <p className="text-xs text-gray-400 mt-0.5">Fuel & Maintenance</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <LuSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search expenses by title, voucher ID, vendor, or approver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Expense Categories' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[780px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 font-semibold">Expense Title & Voucher ID</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Vendor / Beneficiary</th>
                <th className="py-3.5 px-4 font-semibold">Amount Paid</th>
                <th className="py-3.5 px-4 font-semibold">Payment Mode</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((exp) => (
                <tr
                  key={exp.id}
                  onClick={() => setSelectedExpense(exp)}
                  className="hover:bg-gray-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-gray-900">{exp.title}</p>
                    <p className="text-[11px] text-gray-400 font-mono">{exp.id} • {exp.date}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                      {exp.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-gray-800 font-medium">{exp.vendor}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-900 text-sm">{exp.amount}</td>
                  <td className="py-3.5 px-4 text-gray-600 font-mono">{exp.paymentMode}</td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                      {exp.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedExpense(exp);
                      }}
                      className="px-2.5 py-1 rounded bg-gray-100 hover:bg-primary-50 hover:text-primary-700 text-gray-700 font-semibold text-xs transition-colors whitespace-nowrap"
                    >
                      Audit View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EXPENSE DETAIL MODAL */}
      {selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col animate-slide-up border border-gray-200">
            <div className="bg-white border-b border-gray-200 p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-800">{selectedExpense.title}</h3>
                <p className="text-xs text-gray-400">Voucher: {selectedExpense.id} • {selectedExpense.date}</p>
              </div>
              <button
                onClick={() => setSelectedExpense(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Category:</span>
                  <strong className="text-gray-800">{selectedExpense.category}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Vendor / Payee:</span>
                  <strong className="text-gray-800">{selectedExpense.vendor}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount Disbursed:</span>
                  <strong className="text-emerald-700 text-base">{selectedExpense.amount}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Mode:</span>
                  <span className="text-gray-800 font-mono font-semibold">{selectedExpense.paymentMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Approved By:</span>
                  <span className="text-gray-800 font-semibold">{selectedExpense.approvedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Receipt / Transaction Ref:</span>
                  <span className="text-gray-800 font-mono">{selectedExpense.receiptNo}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end">
              <button
                onClick={() => setSelectedExpense(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
