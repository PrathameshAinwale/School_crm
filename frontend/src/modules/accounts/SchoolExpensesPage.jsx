import React, { useState, useEffect } from 'react';
import { accountsService } from '../../services/accountsService';
import {
  LuFileSpreadsheet,
  LuPlus,
  LuSearch,
  LuFilter,
  LuCircleCheck,
  LuTrash2,
  LuBuilding2,
  LuCalendar,
  LuCreditCard,
  LuX,
  LuRefreshCw,
  LuTag,
  LuReceipt,
} from 'react-icons/lu';

export default function SchoolExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // New Expense Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Resources & Equipment',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    payment_mode: 'Bank Transfer / NEFT',
    vendor_name: '',
    invoice_number: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const fetchExpenses = async () => {
    try {
      const params = {};
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (search) params.search = search;

      const res = await accountsService.getExpenses(params);
      if (res?.success) {
        setExpenses(res.data?.expenses || res.expenses || []);
        setSummary(res.data?.summary || null);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchExpenses();
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await accountsService.createExpense(formData);
      if (res?.success) {
        setToastMsg(`School expense of ₹${Number(formData.amount).toLocaleString('en-IN')} logged successfully!`);
        setShowAddModal(false);
        setFormData({
          title: '',
          category: 'Resources & Equipment',
          amount: '',
          expense_date: new Date().toISOString().split('T')[0],
          payment_mode: 'Bank Transfer / NEFT',
          vendor_name: '',
          invoice_number: '',
          notes: '',
        });
        fetchExpenses();
        setTimeout(() => setToastMsg(''), 4500);
      }
    } catch (err) {
      setToastMsg('Failed to record expense.');
      setTimeout(() => setToastMsg(''), 4500);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExpense = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete expense "${title}"?`)) return;
    try {
      const res = await accountsService.deleteExpense(id);
      if (res?.success) {
        setToastMsg('Expense record deleted successfully.');
        fetchExpenses();
        setTimeout(() => setToastMsg(''), 4000);
      }
    } catch (err) {
      setToastMsg('Failed to delete expense.');
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  const categories = [
    'All',
    'Resources & Equipment',
    'Maintenance & Repairs',
    'Utilities & Bills',
    'Transport & Fuel',
    'Academic & Lab Supplies',
    'Events & Functions',
    'Administrative',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toastMsg && (
        <div className="p-4 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <LuCircleCheck className="w-5 h-5 text-teal-600 shrink-0" />
            <span className="text-sm font-semibold">{toastMsg}</span>
          </div>
          <button
            onClick={() => setToastMsg('')}
            className="text-xs font-semibold text-teal-600 hover:text-teal-900 ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">School Expenses & Resources</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Audit and record campus equipment, lab supplies, utilities, fleet maintenance & vendor invoices
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchExpenses();
            }}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <LuRefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs font-semibold shadow-md shadow-primary-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <LuPlus className="w-4 h-4" />
            Log New Expense
          </button>
        </div>
      </div>

      {/* Summary Stat Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Total School Expenditure</div>
          <div className="text-xl font-bold text-slate-800 mt-1 tracking-tight">
            ₹{Number(summary?.totalAmount || 0).toLocaleString('en-IN')}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Active Categories</div>
          <div className="text-xl font-bold text-primary-600 mt-1 tracking-tight">
            {summary?.categoryBreakdown?.length || 0} Categories
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Average Expense / Entry</div>
          <div className="text-xl font-bold text-amber-600 mt-1 tracking-tight">
            ₹{expenses.length > 0 ? Math.round(Number(summary?.totalAmount || 0) / expenses.length).toLocaleString('en-IN') : '0'}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expense title, code, vendor, invoice..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Code & Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Vendor & Invoice</th>
                <th className="py-3.5 px-4">Payment Mode</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No expense records found matching your filters.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{exp.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {exp.code} {exp.resourceName ? `• ${exp.resourceName}` : ''}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        <LuTag className="w-3 h-3 text-slate-400" />
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{Number(exp.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{exp.expenseDate}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-700">{exp.vendorName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{exp.invoiceNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{exp.paymentMode}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteExpense(exp.id, exp.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete expense"
                      >
                        <LuTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <LuFileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Log School Expenditure</h3>
                  <p className="text-xs text-slate-400">Record operational, resource & maintenance costs</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Title / Description *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Smart Projector Repair & Lamp Replacement"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                  >
                    <option value="Resources & Equipment">Resources & Equipment</option>
                    <option value="Maintenance & Repairs">Maintenance & Repairs</option>
                    <option value="Utilities & Bills">Utilities & Bills</option>
                    <option value="Transport & Fuel">Transport & Fuel</option>
                    <option value="Academic & Lab Supplies">Academic & Lab Supplies</option>
                    <option value="Events & Functions">Events & Functions</option>
                    <option value="Administrative">Administrative</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="1"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="25000"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Mode *</label>
                  <select
                    value={formData.payment_mode}
                    onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                  >
                    <option value="Bank Transfer / NEFT">Bank Transfer / NEFT</option>
                    <option value="UPI">UPI (GPay / PhonePe)</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vendor / Payee Name</label>
                  <input
                    type="text"
                    value={formData.vendor_name}
                    onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                    placeholder="e.g. NextGen EdTech"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice / Bill Number</label>
                  <input
                    type="text"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    placeholder="INV-2026-901"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Audit Notes / Item Specifications</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Warranty terms, quantity details, or maintenance breakdown..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <LuCircleCheck className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
