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
  LuBoxes,
  LuWrench,
  LuMapPin,
  LuStore,
  LuIndianRupee,
} from 'react-icons/lu';

export default function SchoolExpensesPage() {
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' | 'resources'
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [resources, setResources] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
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
    vendor_mode: 'existing', // 'existing' | 'custom'
    vendor_id: '',
    vendor_name: '',
    invoice_number: '',
    resource_id: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // 1. Fetch Expenses
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
    }
  };

  // 2. Fetch Resources
  const fetchResources = async () => {
    try {
      const res = await accountsService.getProcurementResources();
      if (res?.success) {
        setResources(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching procurement resources:', err);
    }
  };

  // 3. Fetch Registered Vendors
  const fetchVendors = async () => {
    try {
      const res = await accountsService.getVendors();
      if (res?.success) {
        setVendors(res.data?.vendors || res.vendors || []);
      }
    } catch (err) {
      console.error('Error fetching vendors:', err);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchExpenses(), fetchResources(), fetchVendors()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchExpenses();
  };

  const openLogExpenseForResource = (resItem) => {
    setFormData({
      title: `Maintenance & Supplies for ${resItem.name}`,
      category: resItem.category?.includes('Lab') ? 'Academic & Lab Supplies' : 'Resources & Equipment',
      amount: resItem.unit_cost ? String(resItem.unit_cost) : '',
      expense_date: new Date().toISOString().split('T')[0],
      payment_mode: 'Bank Transfer / NEFT',
      vendor_mode: 'existing',
      vendor_id: '',
      vendor_name: '',
      invoice_number: '',
      resource_id: String(resItem.id),
      notes: `Asset Ref: ${resItem.resource_code}. Location: ${resItem.location_room || 'Campus'}`,
    });
    setShowAddModal(true);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let resolvedVendorName = formData.vendor_name;
      if (formData.vendor_mode === 'existing' && formData.vendor_id) {
        const selectedV = vendors.find((v) => v.id === Number(formData.vendor_id));
        if (selectedV) resolvedVendorName = selectedV.name;
      }

      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        amount: Number(formData.amount),
        expense_date: formData.expense_date,
        payment_mode: formData.payment_mode,
        vendor_name: resolvedVendorName || null,
        invoice_number: formData.invoice_number ? formData.invoice_number.trim() : null,
        resource_id: formData.resource_id ? Number(formData.resource_id) : null,
        notes: formData.notes ? formData.notes.trim() : null,
      };

      const res = await accountsService.createExpense(payload);
      if (res?.success) {
        setToastMsg(`School expense of ₹${Number(formData.amount).toLocaleString('en-IN')} logged successfully!`);
        setShowAddModal(false);
        setFormData({
          title: '',
          category: 'Resources & Equipment',
          amount: '',
          expense_date: new Date().toISOString().split('T')[0],
          payment_mode: 'Bank Transfer / NEFT',
          vendor_mode: 'existing',
          vendor_id: '',
          vendor_name: '',
          invoice_number: '',
          resource_id: '',
          notes: '',
        });
        fetchExpenses();
        fetchResources();
        setTimeout(() => setToastMsg(''), 4500);
      }
    } catch (err) {
      setToastMsg(err.data?.message || err.message || 'Failed to record expense.');
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

  const totalResourceValuation = resources.reduce(
    (acc, r) => acc + (Number(r.available_quantity) || 0) * (Number(r.unit_cost) || 0),
    0
  );

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">School Expenses & Resources</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Real-time audit of campus equipment, lab supplies, utilities, fleet maintenance & vendor invoices
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setFormData({
                title: '',
                category: 'Resources & Equipment',
                amount: '',
                expense_date: new Date().toISOString().split('T')[0],
                payment_mode: 'Bank Transfer / NEFT',
                vendor_mode: 'existing',
                vendor_id: vendors[0]?.id ? String(vendors[0].id) : '',
                vendor_name: '',
                invoice_number: '',
                resource_id: '',
                notes: '',
              });
              setShowAddModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs font-semibold shadow-md shadow-primary-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <LuPlus className="w-4 h-4" />
            Log New Expense
          </button>
        </div>
      </div>

      {/* Dynamic Summary Stat Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Total School Expenditure</span>
            <LuReceipt className="w-4 h-4 text-primary-500" />
          </div>
          <div className="text-xl font-bold text-slate-800 mt-1 font-mono tracking-tight">
            ₹{Number(summary?.totalAmount || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {expenses.length} recorded expense vouchers
          </div>
        </div>

        <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Campus Resources</span>
            <LuBoxes className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-600 mt-1 font-mono tracking-tight">
            {resources.length} Assets Registered
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            Valuation: ₹{Math.round(totalResourceValuation).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Active Categories</span>
            <LuTag className="w-4 h-4 text-primary-500" />
          </div>
          <div className="text-xl font-bold text-primary-600 mt-1 tracking-tight">
            {summary?.categoryBreakdown?.length || 0} Categories
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Across operational & lab expenditure
          </div>
        </div>

        <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Average Expense / Voucher</span>
            <LuIndianRupee className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 mt-1 font-mono tracking-tight">
            ₹{expenses.length > 0 ? Math.round(Number(summary?.totalAmount || 0) / expenses.length).toLocaleString('en-IN') : '0'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Per audit entry
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 border-b border-slate-200 bg-slate-50/60 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('expenses')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'expenses'
                ? 'border-primary-600 text-primary-700 bg-white shadow-2xs rounded-t-xl -mb-px'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <LuFileSpreadsheet className="w-4 h-4 text-primary-600" />
            <span>School Expenses Directory</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary-50 text-primary-700 font-extrabold border border-primary-100">
              {expenses.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('resources')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'resources'
                ? 'border-primary-600 text-primary-700 bg-white shadow-2xs rounded-t-xl -mb-px'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <LuBoxes className="w-4 h-4 text-emerald-600" />
            <span>Campus Resources & Assets</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-100">
              {resources.length}
            </span>
          </button>
        </div>

        {/* TAB 1: EXPENSES DIRECTORY */}
        {activeTab === 'expenses' && (
          <div className="p-5 space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200/70">
              <form onSubmit={handleSearch} className="relative w-full md:w-96">
                <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search expense title, code, vendor, invoice..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                />
              </form>

              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                <span className="text-xs font-semibold text-slate-500 shrink-0">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary-500 cursor-pointer"
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
            <div className="border border-slate-200/80 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4">Code & Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Vendor & Invoice</th>
                      <th className="py-3 px-4">Payment Mode</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          <LuRefreshCw className="w-6 h-6 animate-spin mx-auto text-primary-600 mb-2" />
                          <p>Loading dynamic school expenses...</p>
                        </td>
                      </tr>
                    ) : expenses.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          <LuReceipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <p className="font-semibold text-slate-700">No expense records found.</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Click "Log New Expense" to record campus expenditure.</p>
                        </td>
                      </tr>
                    ) : (
                      expenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-800 leading-snug">{exp.title}</div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                              <span>{exp.code}</span>
                              {exp.resourceName && (
                                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-emerald-100">
                                  <LuBoxes className="w-3 h-3 text-emerald-500" />
                                  {exp.resourceName}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              <LuTag className="w-3 h-3 text-slate-400" />
                              {exp.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                            ₹{Number(exp.amount).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-medium">{exp.expenseDate}</td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-700">{exp.vendorName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{exp.invoiceNumber}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-700">
                              {exp.paymentMode}
                            </span>
                          </td>
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
          </div>
        )}

        {/* TAB 2: CAMPUS RESOURCES & ASSETS */}
        {activeTab === 'resources' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between gap-3 bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <LuBoxes className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Campus Laboratory, IT & Asset Inventory</h3>
                  <p className="text-[11px] text-slate-500">Live resources tracked from database across campus facilities</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 font-mono">
                {resources.length} Assets Found
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-400">
                  <LuBoxes className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No campus resources recorded yet.</p>
                </div>
              ) : (
                resources.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {item.resource_code}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.available_quantity} Available
                        </span>
                      </div>

                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                        {item.name}
                      </h3>

                      <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="px-2 py-0.5 rounded bg-primary-50 text-primary-700 font-semibold text-[10px]">
                          {item.category}
                        </span>
                        {item.location_room && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <LuMapPin className="w-3 h-3 text-slate-400" />
                            {item.location_room}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">Unit Cost</div>
                        <div className="text-xs font-bold text-slate-800 font-mono">
                          ₹{Number(item.unit_cost || 0).toLocaleString('en-IN')}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => openLogExpenseForResource(item)}
                        className="px-2.5 py-1 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <LuWrench className="w-3 h-3" />
                        <span>Log Expense</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Log Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-scale-up max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
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
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
                  />
                </div>
              </div>

              {/* Dynamic Resource Link Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Link to Campus Resource / Asset (Optional)
                </label>
                <select
                  value={formData.resource_id}
                  onChange={(e) => {
                    const rId = e.target.value;
                    const rObj = resources.find((r) => r.id === Number(rId));
                    setFormData({
                      ...formData,
                      resource_id: rId,
                      title: formData.title || (rObj ? `Maintenance / Supplies for ${rObj.name}` : ''),
                    });
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
                >
                  <option value="">-- No linked resource (General expenditure) --</option>
                  {resources.map((r) => (
                    <option key={r.id} value={r.id}>
                      [{r.resource_code}] {r.name} ({r.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Mode *</label>
                  <select
                    value={formData.payment_mode}
                    onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
                  >
                    <option value="Bank Transfer / NEFT">Bank Transfer / NEFT</option>
                    <option value="UPI">UPI (GPay / PhonePe)</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Vendor Selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Vendor / Payee</label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, vendor_mode: 'existing' })}
                      className={`font-semibold cursor-pointer ${
                        formData.vendor_mode === 'existing' ? 'text-primary-600 underline' : 'text-slate-400'
                      }`}
                    >
                      Registered Vendor
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, vendor_mode: 'custom' })}
                      className={`font-semibold cursor-pointer ${
                        formData.vendor_mode === 'custom' ? 'text-primary-600 underline' : 'text-slate-400'
                      }`}
                    >
                      Custom Payee
                    </button>
                  </div>
                </div>

                {formData.vendor_mode === 'existing' ? (
                  <select
                    value={formData.vendor_id}
                    onChange={(e) => {
                      const vId = e.target.value;
                      const selV = vendors.find((v) => v.id === Number(vId));
                      setFormData({
                        ...formData,
                        vendor_id: vId,
                        vendor_name: selV ? selV.name : '',
                      });
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
                  >
                    <option value="">-- Select Registered Vendor --</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.category})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.vendor_name}
                    onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                    placeholder="e.g. NextGen EdTech"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice / Bill Number</label>
                <input
                  type="text"
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                  placeholder="INV-2026-901"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Audit Notes / Item Specifications</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Warranty terms, quantity details, or maintenance breakdown..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 resize-none font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
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
