import React, { useState, useEffect } from 'react';
import { sportsService } from '../../services/sportsService';
import {
  LuBoxes,
  LuPlus,
  LuSearch,
  LuFilter,
  LuCircleCheck,
  LuCircleAlert,
  LuX,
  LuPencil,
  LuTrash2,
  LuLoader,
  LuSave,
  LuUserCheck,
  LuClock,
  LuSparkles,
} from 'react-icons/lu';

export default function SportsInventoryPage() {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'issues'
  const [equipment, setEquipment] = useState([]);
  const [recentIssues, setRecentIssues] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [summary, setSummary] = useState({
    total_items: 0,
    available_items: 0,
    issued_items: 0,
    unique_assets: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');

  // Modals
  const [equipModalOpen, setEquipModalOpen] = useState(false);
  const [equipModalMode, setEquipModalMode] = useState('create');
  const [selectedEquipId, setSelectedEquipId] = useState(null);

  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [selectedItemForIssue, setSelectedItemForIssue] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Equipment Form
  const [equipForm, setEquipForm] = useState({
    sport_id: '',
    item_name: '',
    category: 'Balls & Gear',
    quantity_total: 10,
    condition: 'Good',
    storage_location: 'Sports Room A',
    purchase_date: new Date().toISOString().split('T')[0],
    unit_cost: 0,
  });

  // Issue Form
  const [issueForm, setIssueForm] = useState({
    equipment_id: '',
    student_id: '',
    borrower_name: '',
    borrower_role: 'Student',
    quantity: 1,
    issue_date: new Date().toISOString().split('T')[0],
    expected_return_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    notes: '',
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [equipRes, discRes, studRes] = await Promise.all([
        sportsService.getEquipment({
          category: categoryFilter,
          condition: conditionFilter,
          search,
        }),
        sportsService.getDisciplines(),
        sportsService.getAvailableStudents(),
      ]);

      if (equipRes?.success) {
        setEquipment(equipRes.data?.equipment || []);
        setRecentIssues(equipRes.data?.recent_issues || []);
        if (equipRes.data?.summary) setSummary(equipRes.data.summary);
      }
      if (discRes?.success) setDisciplines(discRes.data || []);
      if (studRes?.success) setAvailableStudents(studRes.data || []);
    } catch (err) {
      console.error('Error fetching sports inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter, conditionFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenCreateEquip = () => {
    setEquipForm({
      sport_id: disciplines[0]?.id || '',
      item_name: '',
      category: 'Balls & Gear',
      quantity_total: 10,
      condition: 'Good',
      storage_location: 'Main Sports Storeroom',
      purchase_date: new Date().toISOString().split('T')[0],
      unit_cost: 500,
    });
    setSelectedEquipId(null);
    setEquipModalMode('create');
    setEquipModalOpen(true);
  };

  const handleOpenEditEquip = (item) => {
    setEquipForm({
      sport_id: item.sport_id || '',
      item_name: item.item_name || '',
      category: item.category || 'Balls & Gear',
      quantity_total: item.quantity_total || 1,
      condition: item.condition || 'Good',
      storage_location: item.storage_location || '',
      purchase_date: item.purchase_date || '',
      unit_cost: item.unit_cost || 0,
    });
    setSelectedEquipId(item.id);
    setEquipModalMode('edit');
    setEquipModalOpen(true);
  };

  const handleSaveEquip = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (equipModalMode === 'create') {
        const res = await sportsService.createEquipment(equipForm);
        if (res?.success) {
          showToast('Equipment added to sports inventory.');
          setEquipModalOpen(false);
          loadData();
        }
      } else {
        const res = await sportsService.updateEquipment(selectedEquipId, equipForm);
        if (res?.success) {
          showToast('Equipment asset updated.');
          setEquipModalOpen(false);
          loadData();
        }
      }
    } catch (err) {
      alert(err.message || 'Error saving equipment item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEquip = async (id) => {
    if (!window.confirm('Delete this equipment asset from inventory?')) return;
    try {
      const res = await sportsService.deleteEquipment(id);
      if (res?.success) {
        showToast('Equipment deleted.');
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Error deleting equipment.');
    }
  };

  const handleOpenIssue = (item) => {
    setSelectedItemForIssue(item);
    setIssueForm({
      equipment_id: item.id,
      student_id: availableStudents[0]?.id || '',
      borrower_name: availableStudents[0]?.full_name || '',
      borrower_role: 'Student',
      quantity: 1,
      issue_date: new Date().toISOString().split('T')[0],
      expected_return_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      notes: '',
    });
    setIssueModalOpen(true);
  };

  const handleSaveIssue = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await sportsService.issueEquipment(issueForm);
      if (res?.success) {
        showToast('Equipment issued successfully.');
        setIssueModalOpen(false);
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Error issuing equipment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnIssue = async (issueId) => {
    try {
      const res = await sportsService.returnEquipment(issueId);
      if (res?.success) {
        showToast('Item checked back into inventory.');
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Error returning item.');
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-slide-up border border-slate-700">
          <LuCircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-base sm:text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <LuBoxes className="w-5 h-5 text-primary-600" />
            Sports Equipment & Inventory
          </h1>
          <p className="text-slate-500 text-[10px] sm:text-xs mt-0.5">
            Track balls, kits, protective gear, track equipment, and student check-outs
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-white text-primary-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Assets ({equipment.length})
            </button>
            <button
              onClick={() => setActiveTab('issues')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'issues'
                  ? 'bg-white text-primary-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Checkout Logs ({recentIssues.length})
            </button>
          </div>

          <button
            onClick={handleOpenCreateEquip}
            className="px-3.5 py-2 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LuPlus className="w-3.5 h-3.5" />
            Add Equipment
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Items in Stock</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{summary.total_items}</div>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">
            {summary.unique_assets} unique gear lines
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-xs font-semibold text-emerald-700">Available on Hand</span>
          <div className="text-2xl font-extrabold text-emerald-900 mt-1">{summary.available_items}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
            In storerooms & lockers
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-xs">
          <span className="text-xs font-semibold text-blue-700">Currently Issued</span>
          <div className="text-2xl font-extrabold text-blue-900 mt-1">{summary.issued_items}</div>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 inline-block">
            With students & coaches
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <span className="text-xs font-semibold text-amber-700">Active Checkouts</span>
          <div className="text-2xl font-extrabold text-amber-900 mt-1">
            {recentIssues.filter((i) => i.status === 'Issued').length}
          </div>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 inline-block">
            Pending return
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[220px] relative">
          <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by equipment name or storage rack..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="all">All Categories</option>
            <option value="Balls & Gear">Balls & Gear</option>
            <option value="Field Equipment">Field & Track</option>
            <option value="Protective">Protective Gear</option>
            <option value="Kits">Uniforms & Kits</option>
            <option value="Medical">Medical & First Aid</option>
          </select>

          {/* Condition Filter */}
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="all">All Conditions</option>
            <option value="Good">Good Condition</option>
            <option value="Fair">Fair</option>
            <option value="Needs Repair">Needs Repair</option>
            <option value="Damaged">Damaged</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <LuLoader className="w-6 h-6 animate-spin mx-auto text-primary-600 mb-2" />
          <p className="text-xs">Loading sports inventory...</p>
        </div>
      ) : activeTab === 'inventory' ? (
        /* Inventory Items Grid */
        equipment.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <LuBoxes className="w-12 h-12 stroke-[1.2] mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">No equipment found</p>
            <p className="text-xs text-slate-400 mt-1">Add items to keep track of gear.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipment.map((item) => {
              const isAvailable = item.quantity_available > 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                        {item.category}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.condition === 'Good'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : item.condition === 'Fair'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                            : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        }`}
                      >
                        {item.condition}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base mt-2.5 group-hover:text-primary-700 transition-colors">
                      {item.item_name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      Sport: <span className="font-semibold text-slate-700">{item.sport?.name || 'General Athletics'}</span>
                    </p>

                    {/* Quantity bar */}
                    <div className="mt-4 p-3 bg-slate-50/80 rounded-xl border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Total Quantity</span>
                        <span className="font-extrabold text-slate-800">{item.quantity_total} Units</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/50 text-[11px]">
                        <div>
                          <span className="text-slate-400">Available:</span>{' '}
                          <span className="font-bold text-emerald-600">{item.quantity_available}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Issued:</span>{' '}
                          <span className="font-bold text-blue-600">{item.quantity_issued}</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 pt-1">
                        <span className="text-slate-400">Location:</span>{' '}
                        <span className="font-medium text-slate-700">{item.storage_location || 'Sports Storeroom'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleOpenIssue(item)}
                      disabled={!isAvailable}
                      className="px-3 py-1.5 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <LuUserCheck className="w-3.5 h-3.5" />
                      Issue Gear
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditEquip(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer"
                        title="Edit equipment"
                      >
                        <LuPencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEquip(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                        title="Delete equipment"
                      >
                        <LuTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Issues and Returns Table */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <LuClock className="w-4 h-4 text-primary-600" />
              Equipment Check-out & Return Logs
            </h3>
            <span className="text-xs text-slate-400">{recentIssues.length} records</span>
          </div>

          {recentIssues.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <p className="text-xs">No equipment has been checked out yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Equipment Item</th>
                    <th className="px-4 py-3">Borrower Name</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Issue Date</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentIssues.map((issue) => {
                    const isIssued = issue.status === 'Issued';

                    return (
                      <tr key={issue.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-800">
                          {issue.equipment?.item_name || 'Gear Item'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">{issue.borrower_name}</div>
                          <span className="text-[10px] text-slate-400">{issue.borrower_role}</span>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-700">{issue.quantity}</td>
                        <td className="px-4 py-3 text-slate-600">{issue.issue_date}</td>
                        <td className="px-4 py-3 text-slate-600 font-medium">{issue.expected_return_date}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isIssued
                                ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            }`}
                          >
                            {issue.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isIssued ? (
                            <button
                              onClick={() => handleReturnIssue(issue.id)}
                              className="px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
                            >
                              Check In (Return)
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                              <LuCircleCheck className="w-3.5 h-3.5" /> Returned
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Equipment Form Modal */}
      {equipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <LuBoxes className="w-5 h-5 text-primary-600" />
                {equipModalMode === 'create' ? 'Add Equipment to Inventory' : 'Edit Equipment'}
              </h2>
              <button
                onClick={() => setEquipModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEquip} className="space-y-4 mt-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Equipment Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cosco Platina Football (Size 5)"
                  value={equipForm.item_name}
                  onChange={(e) => setEquipForm({ ...equipForm, item_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Discipline</label>
                  <select
                    value={equipForm.sport_id}
                    onChange={(e) => setEquipForm({ ...equipForm, sport_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="">General Sports Gear</option>
                    {disciplines.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Category *</label>
                  <select
                    value={equipForm.category}
                    onChange={(e) => setEquipForm({ ...equipForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Balls & Gear">Balls & Gear</option>
                    <option value="Field Equipment">Field Equipment</option>
                    <option value="Protective">Protective Gear</option>
                    <option value="Kits">Uniforms & Kits</option>
                    <option value="Medical">Medical & First Aid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Total Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={equipForm.quantity_total}
                    onChange={(e) =>
                      setEquipForm({ ...equipForm, quantity_total: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block mb-1">Condition *</label>
                  <select
                    value={equipForm.condition}
                    onChange={(e) => setEquipForm({ ...equipForm, condition: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Needs Repair">Needs Repair</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Storage Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Sports Room Rack A-1"
                    value={equipForm.storage_location}
                    onChange={(e) => setEquipForm({ ...equipForm, storage_location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="500"
                    value={equipForm.unit_cost}
                    onChange={(e) => setEquipForm({ ...equipForm, unit_cost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEquipModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-all cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold shadow-md shadow-primary-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuSave className="w-4 h-4" />}
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Modal */}
      {issueModalOpen && selectedItemForIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <LuUserCheck className="w-5 h-5 text-primary-600" />
                  Issue Equipment
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Checking out: <span className="font-bold text-slate-800">{selectedItemForIssue.item_name}</span> (
                  {selectedItemForIssue.quantity_available} units available)
                </p>
              </div>
              <button
                onClick={() => setIssueModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveIssue} className="space-y-4 mt-4 text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Borrower Role *</label>
                  <select
                    value={issueForm.borrower_role}
                    onChange={(e) => setIssueForm({ ...issueForm, borrower_role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Student">Student</option>
                    <option value="Coach">Coach</option>
                    <option value="Teacher">Teacher</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Quantity to Check Out *</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedItemForIssue.quantity_available}
                    required
                    value={issueForm.quantity}
                    onChange={(e) => setIssueForm({ ...issueForm, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {issueForm.borrower_role === 'Student' ? (
                <div>
                  <label className="block mb-1">Select Student Athlete *</label>
                  <select
                    required
                    value={issueForm.student_id}
                    onChange={(e) => {
                      const st = availableStudents.find((s) => s.id === parseInt(e.target.value));
                      setIssueForm({
                        ...issueForm,
                        student_id: e.target.value,
                        borrower_name: st?.full_name || '',
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="">Choose Student</option>
                    {availableStudents.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.full_name} ({st.admission_number} • {st.class_section})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block mb-1">Borrower Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Coach or Teacher Name"
                    value={issueForm.borrower_name}
                    onChange={(e) => setIssueForm({ ...issueForm, borrower_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Issue Date *</label>
                  <input
                    type="date"
                    required
                    value={issueForm.issue_date}
                    onChange={(e) => setIssueForm({ ...issueForm, issue_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block mb-1">Expected Return Date *</label>
                  <input
                    type="date"
                    required
                    value={issueForm.expected_return_date}
                    onChange={(e) => setIssueForm({ ...issueForm, expected_return_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Issue Purpose / Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. For afternoon inter-house cricket match"
                  value={issueForm.notes}
                  onChange={(e) => setIssueForm({ ...issueForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIssueModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-all cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold shadow-md shadow-primary-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuSave className="w-4 h-4" />}
                  Confirm & Check Out
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
