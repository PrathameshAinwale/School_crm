import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  LuBoxes,
  LuSearch,
  LuX,
  LuTrash2,
  LuLoader,
  LuCheck,
  LuCircleCheck,
  LuPlus,
  LuMapPin,
} from 'react-icons/lu';

export default function AdminResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTargetResource, setDeleteTargetResource] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Laboratory',
    total_quantity: 1,
    available_quantity: 1,
    condition: 'Good',
    location_room: '',
    unit_cost: '',
    status: 'Available',
  });

  const loadResources = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (categoryFilter && categoryFilter !== 'ALL') params.category = categoryFilter;

      const res = await adminService.getResources(params);
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setResources(list);
      }
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadResources();
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await adminService.createResource(formData);
      if (res.success) {
        setShowAddModal(false);
        setFormData({
          name: '',
          category: 'Laboratory',
          total_quantity: 1,
          available_quantity: 1,
          condition: 'Good',
          location_room: '',
          unit_cost: '',
          status: 'Available',
        });
        loadResources();
        showToast('Resource asset added successfully!');
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to add resource.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetResource) return;
    try {
      await adminService.deleteResource(deleteTargetResource.id);
      setDeleteTargetResource(null);
      loadResources();
      showToast('Resource item deleted successfully.');
    } catch {
      showToast('Failed to delete resource.');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-scale-up border border-slate-700">
          <LuCircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/20">
            <LuBoxes className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-slate-800 leading-tight">School Resources & Asset Inventory</h1>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Track scientific laboratory apparatus, IT equipment, sports items, and classroom furniture
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2 w-full sm:w-auto justify-center self-start sm:self-auto shrink-0"
        >
          <LuPlus className="w-4 h-4" /> Add New Asset Item
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by asset name, code, room location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
          />
        </form>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Categories</option>
            <option value="Laboratory">Laboratory</option>
            <option value="IT & Computers">IT & Computers</option>
            <option value="Sports Equipment">Sports Equipment</option>
            <option value="Audio-Visual">Audio-Visual</option>
            <option value="Library">Library</option>
            <option value="Classroom Furniture">Classroom Furniture</option>
          </select>
        </div>
      </div>

      {/* Resources Table */}
      {loading ? (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-8 sm:p-12 text-center">
          <LuLoader className="w-8 h-8 animate-spin text-cyan-600 mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading inventory from database...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LuBoxes className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No Resource Assets Registered</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
            There are currently no items in the inventory database.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs rounded-xl transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <LuPlus className="w-4 h-4" /> Add First Item
          </button>
        </div>
      ) : (
        <>
          {/* Mobile View: Resource Cards (2 columns) */}
          <div className="sm:hidden grid grid-cols-2 gap-2.5">
            {resources.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 truncate max-w-[80px]">
                      {item.category}
                    </span>
                    <button
                      onClick={() => setDeleteTargetResource(item)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors -mr-1"
                    >
                      <LuTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-800 text-xs line-clamp-2 leading-snug">{item.name}</h4>
                  <div className="text-[10px] text-cyan-700 font-mono font-bold mt-0.5">{item.resource_code}</div>
                </div>

                <div className="space-y-1 pt-1.5 border-t border-slate-100 text-[10px]">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Qty:</span>
                    <span className="font-bold text-slate-800">{item.available_quantity}/{item.total_quantity}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Cond:</span>
                    <span className="font-medium text-slate-700 truncate">{item.condition}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold inline-flex items-center gap-1 ${
                      item.status === 'Available'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${
                        item.status === 'Available' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}></span>
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">Asset Code & Item</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Quantity (Total / Avail)</th>
                    <th className="px-5 py-3.5">Condition</th>
                    <th className="px-5 py-3.5">Location / Room</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {resources.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-800">{item.name}</div>
                        <div className="text-[11px] text-cyan-700 font-mono font-bold">{item.resource_code}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-800">
                          {item.available_quantity} / {item.total_quantity} Units
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-slate-700 font-medium">{item.condition}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <LuMapPin className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                          <span>{item.location_room || 'General Storage'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 ${
                          item.status === 'Available'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            item.status === 'Available' ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}></span>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setDeleteTargetResource(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <LuTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full my-4 sm:my-8 overflow-hidden animate-scale-up">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <LuBoxes className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Add Resource Item</h3>
                  <p className="text-cyan-100 text-xs">Record new equipment or inventory asset</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Item / Equipment Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Compound Microscopes (1000x)"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Laboratory">Laboratory</option>
                    <option value="IT & Computers">IT & Computers</option>
                    <option value="Sports Equipment">Sports Equipment</option>
                    <option value="Audio-Visual">Audio-Visual</option>
                    <option value="Library">Library</option>
                    <option value="Classroom Furniture">Classroom Furniture</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Quantity</label>
                  <input
                    type="number"
                    required
                    value={formData.total_quantity}
                    onChange={(e) => setFormData({ ...formData, total_quantity: parseInt(e.target.value) || 0, available_quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Good">Good</option>
                    <option value="Needs Repair">Needs Repair</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Discarded">Discarded</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Room</label>
                  <input
                    type="text"
                    value={formData.location_room}
                    onChange={(e) => setFormData({ ...formData, location_room: e.target.value })}
                    placeholder="e.g. Science Lab 1 (Room 301)"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.unit_cost}
                    onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                    placeholder="8500"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuCheck className="w-4 h-4" />}
                  {submitting ? 'Adding...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTargetResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center animate-scale-up">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LuTrash2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Remove Asset Item?</h3>
            <p className="text-xs text-slate-500 mb-6">
              Are you sure you want to remove <strong>{deleteTargetResource.name}</strong>?
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setDeleteTargetResource(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
