import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { accountsService } from '../../services/accountsService';
import {
  LuStore,
  LuPlus,
  LuSearch,
  LuFilter,
  LuPhone,
  LuMail,
  LuMessageCircle,
  LuPrinter,
  LuSend,
  LuCircleCheck,
  LuClock,
  LuTruck,
  LuPackageCheck,
  LuCircleX,
  LuCreditCard,
  LuTrash2,
  LuPencil,
  LuBuilding2,
  LuCalendar,
  LuMapPin,
  LuFileText,
  LuBoxes,
  LuArrowRight,
  LuX,
  LuRefreshCw,
  LuCircleAlert,
  LuIndianRupee,
  LuTag,
  LuChevronDown,
} from 'react-icons/lu';

const CATEGORIES = [
  'All',
  'Laboratory & Chemicals',
  'IT & Computers',
  'Books & Stationery',
  'Sports Equipment',
  'Furniture & Fixtures',
  'Uniforms',
  'Maintenance & Repairs',
  'Electrical & AV',
  'General Supplies',
];

const ORDER_STATUSES = [
  { key: 'Draft', label: 'Draft', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { key: 'Ordered', label: 'Order Placed', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { key: 'Shipped', label: 'In Transit', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { key: 'Delivered', label: 'Delivered', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { key: 'Cancelled', label: 'Cancelled', color: 'bg-rose-50 text-rose-700 border-rose-200' },
];

export default function VendorsPurchasesPage() {
  const { currentSchool, user } = useAuth();

  const [activeTab, setActiveTab] = useState('vendors'); // 'vendors' | 'purchases'
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState({ type: '', text: '' });

  // Data states
  const [vendors, setVendors] = useState([]);
  const [vendorSummary, setVendorSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [availableResources, setAvailableResources] = useState([]);

  // Filters - Vendors
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorCategory, setVendorCategory] = useState('All');
  const [vendorStatusFilter, setVendorStatusFilter] = useState('All');
  const [showVendorFilterMenu, setShowVendorFilterMenu] = useState(false);

  // Filters - Orders
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('All');
  const [orderCategoryFilter, setOrderCategoryFilter] = useState('All');
  const [showOrderFilterMenu, setShowOrderFilterMenu] = useState(false);

  const activeVendorFiltersCount = (vendorCategory !== 'All' ? 1 : 0) + (vendorStatusFilter !== 'All' ? 1 : 0);
  const activeOrderFiltersCount =
    (orderStatusFilter !== 'All' ? 1 : 0) +
    (orderPaymentFilter !== 'All' ? 1 : 0) +
    (orderCategoryFilter !== 'All' ? 1 : 0);

  // Modals
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [vendorFormData, setVendorFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    category: 'General Supplies',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gst_number: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    status: 'Active',
    notes: '',
  });

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderFormData, setOrderFormData] = useState({
    vendor_id: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    category: 'General Supplies',
    status: 'Ordered',
    payment_status: 'Pending',
    payment_mode: 'Bank Transfer / NEFT',
    tax_rate: 18,
    discount_amount: 0,
    shipping_address: '',
    notes: '',
    terms_and_conditions: 'Standard school procurement terms apply. Delivery inspected on arrival.',
    sync_inventory: true,
    items: [
      { item_name: '', description: '', quantity: 1, unit: 'Pieces', unit_price: 0, resource_id: '' },
    ],
  });

  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState(null);
  const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const schoolName = currentSchool?.name || user?.school?.name || 'School Campus';

  const showToast = (text, type = 'success') => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg({ type: '', text: '' }), 4000);
  };

  // 1. Fetch Vendors
  const fetchVendors = async () => {
    try {
      const params = {};
      if (vendorCategory !== 'All') params.category = vendorCategory;
      if (vendorStatusFilter !== 'All') params.status = vendorStatusFilter;
      if (vendorSearch.trim()) params.search = vendorSearch.trim();

      const res = await accountsService.getVendors(params);
      if (res?.success) {
        setVendors(res.data?.vendors || res.vendors || []);
        setVendorSummary(res.data?.summary || null);
      }
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    }
  };

  // 2. Fetch Orders
  const fetchOrders = async () => {
    try {
      const params = {};
      if (orderStatusFilter !== 'All') params.status = orderStatusFilter;
      if (orderPaymentFilter !== 'All') params.payment_status = orderPaymentFilter;
      if (orderCategoryFilter !== 'All') params.category = orderCategoryFilter;
      if (orderSearch.trim()) params.search = orderSearch.trim();

      const res = await accountsService.getPurchaseOrders(params);
      if (res?.success) {
        setOrders(res.data?.orders || res.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  // 3. Fetch Procurement Resources (for linking in PO)
  const fetchResources = async () => {
    try {
      const res = await accountsService.getProcurementResources();
      if (res?.success) {
        setAvailableResources(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchVendors(), fetchOrders(), fetchResources()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (activeTab === 'vendors') {
      fetchVendors();
    } else {
      fetchOrders();
    }
  }, [vendorCategory, vendorStatusFilter, orderStatusFilter, orderPaymentFilter, orderCategoryFilter, activeTab]);

  // Handle Vendor Form Submit
  const handleSaveVendor = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingVendor) {
        const res = await accountsService.updateVendor(editingVendor.id, vendorFormData);
        if (res?.success) {
          showToast(`Vendor ${vendorFormData.name} updated successfully.`);
          setShowVendorModal(false);
          setEditingVendor(null);
          fetchVendors();
        }
      } else {
        const res = await accountsService.createVendor(vendorFormData);
        if (res?.success) {
          showToast(`Vendor ${vendorFormData.name} added successfully!`);
          setShowVendorModal(false);
          fetchVendors();
        }
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to save vendor details.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Vendor
  const handleDeleteVendor = async (vendor) => {
    if (!window.confirm(`Are you sure you want to delete vendor "${vendor.name}"?`)) return;
    try {
      const res = await accountsService.deleteVendor(vendor.id);
      if (res?.success) {
        showToast('Vendor deleted successfully.');
        fetchVendors();
      } else {
        showToast(res?.message || 'Cannot delete vendor with associated purchase orders.', 'error');
      }
    } catch (err) {
      showToast(err.data?.message || 'Cannot delete vendor with existing purchase records.', 'error');
    }
  };

  // Open Edit Vendor Modal
  const openEditVendor = (v) => {
    setEditingVendor(v);
    setVendorFormData({
      name: v.name || '',
      contact_person: v.contactPerson === '—' ? '' : v.contactPerson,
      phone: v.phone === '—' ? '' : v.phone,
      email: v.email === '—' ? '' : v.email,
      category: v.category || 'General Supplies',
      address: v.address || '',
      city: v.city || '',
      state: v.state || '',
      pincode: v.pincode || '',
      gst_number: v.gstNumber === '—' ? '' : v.gstNumber,
      bank_name: v.bankName === '—' ? '' : v.bankName,
      account_number: v.accountNumber === '—' ? '' : v.accountNumber,
      ifsc_code: v.ifscCode === '—' ? '' : v.ifscCode,
      status: v.status || 'Active',
      notes: v.notes || '',
    });
    setShowVendorModal(true);
  };

  // Reset & Open Create Vendor Modal
  const openNewVendor = () => {
    setEditingVendor(null);
    setVendorFormData({
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      category: 'General Supplies',
      address: '',
      city: '',
      state: '',
      pincode: '',
      gst_number: '',
      bank_name: '',
      account_number: '',
      ifsc_code: '',
      status: 'Active',
      notes: '',
    });
    setShowVendorModal(true);
  };

  // Open Create Order Modal
  const openNewOrder = (presetVendorId = '') => {
    const selectedV = vendors.find((v) => v.id === presetVendorId);
    setOrderFormData({
      vendor_id: presetVendorId || (vendors[0]?.id || ''),
      order_date: new Date().toISOString().split('T')[0],
      expected_delivery_date: '',
      category: selectedV?.category || 'General Supplies',
      status: 'Ordered',
      payment_status: 'Pending',
      payment_mode: 'Bank Transfer / NEFT',
      tax_rate: 18,
      discount_amount: 0,
      shipping_address: selectedV ? `${schoolName}, Main Campus Gate 1` : '',
      notes: '',
      terms_and_conditions: 'Standard school procurement terms apply. Goods inspected upon delivery.',
      sync_inventory: true,
      items: [
        { item_name: '', description: '', quantity: 1, unit: 'Pieces', unit_price: 0, resource_id: '' },
      ],
    });
    setShowOrderModal(true);
  };

  // Order Items Handlers
  const handleItemChange = (index, field, value) => {
    const updated = [...orderFormData.items];
    updated[index][field] = value;

    if (field === 'resource_id') {
      const selectedRes = availableResources.find((r) => r.id === Number(value));
      if (selectedRes) {
        updated[index].item_name = selectedRes.name;
        if (selectedRes.unit_cost) updated[index].unit_price = Number(selectedRes.unit_cost);
      }
    }

    setOrderFormData({ ...orderFormData, items: updated });
  };

  const handleAddItem = () => {
    setOrderFormData({
      ...orderFormData,
      items: [
        ...orderFormData.items,
        { item_name: '', description: '', quantity: 1, unit: 'Pieces', unit_price: 0, resource_id: '' },
      ],
    });
  };

  const handleRemoveItem = (index) => {
    if (orderFormData.items.length <= 1) return;
    const updated = orderFormData.items.filter((_, i) => i !== index);
    setOrderFormData({ ...orderFormData, items: updated });
  };

  // Compute Order Totals
  const calculateTotals = () => {
    const subtotal = orderFormData.items.reduce((acc, item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unit_price) || 0;
      return acc + qty * price;
    }, 0);

    const taxAmount = (subtotal * (Number(orderFormData.tax_rate) || 0)) / 100;
    const discount = Number(orderFormData.discount_amount) || 0;
    const grandTotal = Math.max(0, subtotal + taxAmount - discount);

    return { subtotal, taxAmount, grandTotal };
  };

  // Submit New Order
  const handleSaveOrder = async (e) => {
    e.preventDefault();
    if (!orderFormData.vendor_id) {
      showToast('Please select a vendor for this purchase order.', 'error');
      return;
    }

    for (let item of orderFormData.items) {
      if (!item.item_name.trim()) {
        showToast('Please provide a name for all line items.', 'error');
        return;
      }
      if (Number(item.quantity) <= 0 || Number(item.unit_price) < 0) {
        showToast('Quantity and Unit Price must be valid numbers.', 'error');
        return;
      }
    }

    setActionLoading(true);
    try {
      const payload = {
        ...orderFormData,
        vendor_id: Number(orderFormData.vendor_id),
        expected_delivery_date: orderFormData.expected_delivery_date || null,
        tax_rate: Number(orderFormData.tax_rate) || 0,
        discount_amount: Number(orderFormData.discount_amount) || 0,
        items: orderFormData.items.map((item) => ({
          ...item,
          quantity: Number(item.quantity) || 1,
          unit_price: Number(item.unit_price) || 0,
          resource_id: item.resource_id ? Number(item.resource_id) : null,
        })),
      };

      const res = await accountsService.createPurchaseOrder(payload);
      if (res?.success) {
        showToast(`Purchase Order ${res.data?.po_number || ''} placed successfully!`);
        setShowOrderModal(false);
        fetchOrders();
        fetchVendors();
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to place purchase order.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Update Status of an Order
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await accountsService.updateOrderStatus(orderId, {
        status: newStatus,
        sync_inventory: true,
      });
      if (res?.success) {
        showToast(`Order status updated to '${newStatus}'.`);
        fetchOrders();
      }
    } catch (err) {
      showToast('Failed to update order status.', 'error');
    }
  };

  // Update Payment Status of an Order
  const handleUpdatePaymentStatus = async (orderId, newPaymentStatus) => {
    try {
      const res = await accountsService.updateOrderPayment(orderId, {
        payment_status: newPaymentStatus,
        payment_mode: 'Bank Transfer / NEFT',
      });
      if (res?.success) {
        showToast(`Order payment status marked as '${newPaymentStatus}'.`);
        fetchOrders();
        fetchVendors();
      }
    } catch (err) {
      showToast('Failed to update payment status.', 'error');
    }
  };

  // Delete Order
  const handleDeleteOrder = async (order) => {
    if (!window.confirm(`Are you sure you want to delete Purchase Order "${order.poNumber}"?`)) return;
    try {
      const res = await accountsService.deletePurchaseOrder(order.id);
      if (res?.success) {
        showToast(`Purchase Order ${order.poNumber} deleted.`);
        fetchOrders();
      }
    } catch (err) {
      showToast('Failed to delete purchase order.', 'error');
    }
  };

  // Direct Contact Helpers
  const getCleanPhone = (phone) => (phone || '').replace(/[^0-9]/g, '');

  const openWhatsApp = (vendor, order = null) => {
    const cleanNumber = getCleanPhone(vendor.phone);
    if (!cleanNumber) {
      alert(`No valid phone number found for vendor ${vendor.name}.`);
      return;
    }

    let message = `Hello ${vendor.contactPerson || vendor.name},\nThis is the Accounts Department of ${schoolName}.`;
    if (order) {
      message += `\nRegarding Purchase Order #${order.poNumber} (Category: ${order.category}) for Rs. ${Number(order.totalAmount).toLocaleString('en-IN')}.\nPlease confirm dispatch status.`;
    } else {
      message += `\nWe are inquiring about placing an order for ${vendor.category} supplies for our school campus.`;
    }

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanNumber}?text=${encoded}`, '_blank');
  };

  const openEmail = (vendor, order = null) => {
    if (!vendor.email || vendor.email === '—') {
      alert(`No valid email address recorded for vendor ${vendor.name}.`);
      return;
    }

    let subject = `Procurement Inquiry - ${schoolName}`;
    let body = `Dear ${vendor.contactPerson || vendor.name},\n\nWe are writing from the Accounts & Finance Department of ${schoolName}.\n`;

    if (order) {
      subject = `Official Purchase Order #${order.poNumber} - ${schoolName}`;
      body += `Please find details for Purchase Order #${order.poNumber} below:\n\nOrder Date: ${order.orderDate}\nTotal Value: Rs. ${Number(order.totalAmount).toLocaleString('en-IN')}\n\nKindly acknowledge receipt and confirm expected delivery schedule.\n\nRegards,\nAccounts Lead\n${schoolName}`;
    }

    window.open(`mailto:${vendor.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  return (
    <div className="space-y-5 pb-12 animate-fade-in max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMsg.text && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-scale-up border ${
            toastMsg.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-emerald-900 text-white border-emerald-700'
          }`}
        >
          {toastMsg.type === 'error' ? (
            <LuCircleAlert className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <LuCircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* 1. Header Banner matching Student Fees / School Expenses theme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              Vendor Management & Sales Purchase
            </h1> 
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Maintain certified school resource vendors, dispatch purchase orders, contact suppliers directly, and track inventory deliveries.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">

          <button
            type="button"
            onClick={openNewVendor}
            className="px-3.5 py-2 rounded-xl bg-white border border-primary-200 text-primary-700 hover:bg-primary-50 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LuPlus className="w-3.5 h-3.5 text-primary-600" />
            <span>Add Vendor</span>
          </button>

          <button
            type="button"
            onClick={() => openNewOrder()}
            className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LuBoxes className="w-4 h-4" />
            <span>New Purchase Order</span>
          </button>
        </div>
      </div>

      {/* 2. Top Financial KPI Row matching the application design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <LuStore className="w-3.5 h-3.5 text-slate-400" />
              <span>Active Vendors</span>
            </div>
            <div className="text-xl font-bold text-slate-800 mt-1 font-mono tracking-tight">
              {vendorSummary?.activeVendors ?? vendors.filter((v) => v.status === 'Active').length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {vendors.length} total registered suppliers
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
            <LuStore className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <LuFileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Purchase Orders</span>
            </div>
            <div className="text-xl font-bold text-slate-800 mt-1 font-mono tracking-tight">
              {orders.length}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              {orders.filter((o) => o.status === 'Delivered').length} orders completed
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <LuFileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <LuTruck className="w-3.5 h-3.5 text-slate-400" />
              <span>Active Deliveries</span>
            </div>
            <div className="text-xl font-bold text-amber-600 mt-1 font-mono tracking-tight">
              {orders.filter((o) => ['Ordered', 'Shipped'].includes(o.status)).length}
            </div>
            <div className="text-[11px] text-amber-600 font-semibold mt-0.5">
              Awaiting delivery to campus
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <LuTruck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <LuCreditCard className="w-3.5 h-3.5 text-slate-400" />
              <span>Total Procurement</span>
            </div>
            <div className="text-xl font-bold text-slate-800 mt-1 font-mono tracking-tight">
              ₹{Number(vendorSummary?.totalProcurementValue || orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0)).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Across all campus resources
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
            <LuIndianRupee className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 border-b border-slate-200 bg-slate-50/60 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('vendors')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'vendors'
                ? 'border-primary-600 text-primary-700 bg-white shadow-2xs rounded-t-xl -mb-px'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <LuStore className="w-4 h-4 text-primary-600" />
            <span>Vendors Directory</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary-50 text-primary-700 font-extrabold border border-primary-100">
              {vendors.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('purchases')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'purchases'
                ? 'border-primary-600 text-primary-700 bg-white shadow-2xs rounded-t-xl -mb-px'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <LuBoxes className="w-4 h-4 text-primary-600" />
            <span>Sales & Purchase Orders</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary-50 text-primary-700 font-extrabold border border-primary-100">
              {orders.length}
            </span>
          </button>
        </div>

        {/* -------------------- TAB 1: VENDORS DIRECTORY -------------------- */}
        {activeTab === 'vendors' && (
          <div className="p-5 space-y-5">
            {/* Filters */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200/70">
              <div className="flex-1 relative">
                <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchVendors()}
                  placeholder="Search vendors by company name, code, contact person..."
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-100 font-medium"
                />
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowVendorFilterMenu(!showVendorFilterMenu)}
                  className={`h-9 px-3.5 rounded-lg border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs ${
                    activeVendorFiltersCount > 0
                      ? 'bg-primary-50 text-primary-700 border-primary-300'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <LuFilter className={`w-3.5 h-3.5 ${activeVendorFiltersCount > 0 ? 'text-primary-600' : 'text-slate-400'}`} />
                  <span>Filters</span>
                  {activeVendorFiltersCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-primary-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                      {activeVendorFiltersCount}
                    </span>
                  )}
                  <LuChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showVendorFilterMenu ? 'rotate-180' : ''}`} />
                </button>

                {showVendorFilterMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setShowVendorFilterMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-30 animate-scale-up space-y-3.5">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <LuFilter className="w-3.5 h-3.5 text-primary-600" />
                          <span>Filter Vendors</span>
                        </div>
                        {activeVendorFiltersCount > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setVendorCategory('All');
                              setVendorStatusFilter('All');
                            }}
                            className="text-[11px] font-semibold text-primary-600 hover:text-primary-800 cursor-pointer"
                          >
                            Reset
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Category
                        </label>
                        <select
                          value={vendorCategory}
                          onChange={(e) => setVendorCategory(e.target.value)}
                          className="w-full h-8.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-primary-500 cursor-pointer"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Status
                        </label>
                        <select
                          value={vendorStatusFilter}
                          onChange={(e) => setVendorStatusFilter(e.target.value)}
                          className="w-full h-8.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-primary-500 cursor-pointer"
                        >
                          <option value="All">All Statuses</option>
                          <option value="Active">Active Only</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {vendors.length} vendors found
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowVendorFilterMenu(false)}
                          className="px-3.5 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 cursor-pointer shadow-xs"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Vendors Grid */}
            {loading ? (
              <div className="p-12 text-center text-slate-400">
                <LuRefreshCw className="w-7 h-7 animate-spin mx-auto text-primary-600 mb-2" />
                <p className="text-xs font-medium">Loading vendor directory...</p>
              </div>
            ) : vendors.length === 0 ? (
              <div className="p-12 text-center">
                <LuStore className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800">No Vendors Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  No suppliers match your current filters. Click below to add a new vendor.
                </p>
                <button
                  type="button"
                  onClick={openNewVendor}
                  className="mt-3.5 px-3.5 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <LuPlus className="w-3.5 h-3.5" /> Add Vendor
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vendors.map((vendor) => {
                  const isActive = vendor.status === 'Active';
                  return (
                    <div
                      key={vendor.id}
                      className="bg-white rounded-xl border border-slate-200 hover:border-primary-300 shadow-2xs hover:shadow-xs transition-all p-4.5 flex flex-col justify-between"
                    >
                      <div>
                        {/* Header: Code & Status */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            {vendor.vendorCode}
                          </span>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {vendor.status}
                          </span>
                        </div>

                        {/* Name */}
                        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                          {vendor.name}
                        </h3>

                        {/* Category */}
                        <div className="mt-1">
                          <span className="inline-block text-[10px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100">
                            {vendor.category}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                          {vendor.contactPerson && vendor.contactPerson !== '—' && (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 font-medium w-16">Contact:</span>
                              <span className="font-semibold text-slate-800 truncate">{vendor.contactPerson}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-medium w-16">Phone:</span>
                            <span className="font-mono text-slate-800 font-medium truncate">{vendor.phone}</span>
                          </div>

                          {vendor.email && vendor.email !== '—' && (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 font-medium w-16">Email:</span>
                              <span className="text-slate-700 truncate">{vendor.email}</span>
                            </div>
                          )}

                          {vendor.city && (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 font-medium w-16">Location:</span>
                              <span className="text-slate-700 truncate">
                                {vendor.city}{vendor.state ? `, ${vendor.state}` : ''}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Order Stats */}
                        <div className="mt-3.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Orders</p>
                            <p className="font-bold text-slate-800 mt-0.5">{vendor.totalOrders || 0}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Spend</p>
                            <p className="font-bold text-primary-700 mt-0.5">
                              ₹{Number(vendor.totalSpent || 0).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        {/* Direct Contact Actions using SVG icons */}
                        <div className="flex items-center gap-1">
                          {vendor.phone && vendor.phone !== '—' && (
                            <>
                              <a
                                href={`tel:${vendor.phone}`}
                                title="Call Supplier"
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors"
                              >
                                <LuPhone className="w-3.5 h-3.5" />
                              </a>
                              <button
                                type="button"
                                onClick={() => openWhatsApp(vendor)}
                                title="Message on WhatsApp"
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer"
                              >
                                <LuMessageCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {vendor.email && vendor.email !== '—' && (
                            <button
                              type="button"
                              onClick={() => openEmail(vendor)}
                              title="Send Email"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                            >
                              <LuMail className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Primary Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openNewOrder(vendor.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-semibold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                          >
                            <LuPlus className="w-3 h-3" />
                            <span>Order</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditVendor(vendor)}
                            title="Edit Vendor"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <LuPencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteVendor(vendor)}
                            title="Delete Vendor"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <LuTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* -------------------- TAB 2: SALES & PURCHASE ORDERS -------------------- */}
        {activeTab === 'purchases' && (
          <div className="p-5 space-y-5">
            {/* Order Filters */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200/70">
              <div className="flex-1 relative">
                <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
                  placeholder="Search orders by PO Number, vendor name, item..."
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-100 font-medium"
                />
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowOrderFilterMenu(!showOrderFilterMenu)}
                  className={`h-9 px-3.5 rounded-lg border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs ${
                    activeOrderFiltersCount > 0
                      ? 'bg-primary-50 text-primary-700 border-primary-300'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <LuFilter className={`w-3.5 h-3.5 ${activeOrderFiltersCount > 0 ? 'text-primary-600' : 'text-slate-400'}`} />
                  <span>Filters</span>
                  {activeOrderFiltersCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-primary-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                      {activeOrderFiltersCount}
                    </span>
                  )}
                  <LuChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showOrderFilterMenu ? 'rotate-180' : ''}`} />
                </button>

                {showOrderFilterMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setShowOrderFilterMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-30 animate-scale-up space-y-3.5">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <LuFilter className="w-3.5 h-3.5 text-primary-600" />
                          <span>Filter Orders</span>
                        </div>
                        {activeOrderFiltersCount > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setOrderStatusFilter('All');
                              setOrderPaymentFilter('All');
                              setOrderCategoryFilter('All');
                            }}
                            className="text-[11px] font-semibold text-primary-600 hover:text-primary-800 cursor-pointer"
                          >
                            Reset
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Order Status
                        </label>
                        <select
                          value={orderStatusFilter}
                          onChange={(e) => setOrderStatusFilter(e.target.value)}
                          className="w-full h-8.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-primary-500 cursor-pointer"
                        >
                          <option value="All">All Order Statuses</option>
                          <option value="Draft">Draft</option>
                          <option value="Ordered">Order Placed</option>
                          <option value="Shipped">In Transit</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Payment Status
                        </label>
                        <select
                          value={orderPaymentFilter}
                          onChange={(e) => setOrderPaymentFilter(e.target.value)}
                          className="w-full h-8.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-primary-500 cursor-pointer"
                        >
                          <option value="All">All Payments</option>
                          <option value="Pending">Pending Payment</option>
                          <option value="Paid">Paid</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Category
                        </label>
                        <select
                          value={orderCategoryFilter}
                          onChange={(e) => setOrderCategoryFilter(e.target.value)}
                          className="w-full h-8.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-primary-500 cursor-pointer"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {orders.length} orders found
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowOrderFilterMenu(false)}
                          className="px-3.5 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 cursor-pointer shadow-xs"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Orders Table */}
            {loading ? (
              <div className="p-12 text-center text-slate-400">
                <LuRefreshCw className="w-7 h-7 animate-spin mx-auto text-primary-600 mb-2" />
                <p className="text-xs font-medium">Loading purchase orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center">
                <LuBoxes className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800">No Purchase Orders Recorded</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  No purchase orders match your filter criteria. Create an order to replenish campus supplies.
                </p>
                <button
                  type="button"
                  onClick={() => openNewOrder()}
                  className="mt-3.5 px-3.5 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <LuPlus className="w-3.5 h-3.5" /> Place Order
                </button>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">PO Code & Date</th>
                        <th className="py-3 px-4">Supplier & Contact</th>
                        <th className="py-3 px-4">Resource Items</th>
                        <th className="py-3 px-4">Order Status</th>
                        <th className="py-3 px-4">Total & Payment</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {orders.map((order) => {
                        const statusMeta = ORDER_STATUSES.find((s) => s.key === order.status) || {
                          color: 'bg-slate-100 text-slate-700 border-slate-200',
                          label: order.status,
                        };

                        return (
                          <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                            {/* PO Number & Dates */}
                            <td className="py-3.5 px-4">
                              <span className="font-mono font-bold text-slate-900 block text-xs">
                                {order.poNumber}
                              </span>
                              <span className="text-[11px] text-slate-400 block mt-0.5">
                                Date: {order.orderDate}
                              </span>
                              {order.expectedDeliveryDate && order.expectedDeliveryDate !== '—' && (
                                <span className="text-[10px] text-amber-700 block mt-0.5 font-medium">
                                  Expected: {order.expectedDeliveryDate}
                                </span>
                              )}
                            </td>

                            {/* Vendor Info */}
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-slate-900 block">{order.vendorName}</span>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                                {order.vendorPhone && (
                                  <a
                                    href={`tel:${order.vendorPhone}`}
                                    className="hover:text-blue-600 flex items-center gap-1 font-mono text-[11px]"
                                  >
                                    <LuPhone className="w-3 h-3 text-slate-400" />
                                    <span>{order.vendorPhone}</span>
                                  </a>
                                )}
                              </div>
                            </td>

                            {/* Items Breakdown */}
                            <td className="py-3.5 px-4 max-w-xs">
                              <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100">
                                {order.category}
                              </span>
                              <div className="mt-1 space-y-0.5 text-xs text-slate-600">
                                {order.items.slice(0, 2).map((item, idx) => (
                                  <div key={idx} className="truncate text-[11px]">
                                    - {item.itemName}{' '}
                                    <span className="text-slate-400 font-mono">
                                      ({item.quantity} {item.unit})
                                    </span>
                                  </div>
                                ))}
                                {order.items.length > 2 && (
                                  <span className="text-[10px] text-slate-400 italic">
                                    +{order.items.length - 2} more items
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4">
                              <div className="flex flex-col gap-1.5">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border w-fit ${statusMeta.color}`}
                                >
                                  {order.status === 'Delivered' && <LuPackageCheck className="w-3 h-3" />}
                                  {order.status === 'Shipped' && <LuTruck className="w-3 h-3" />}
                                  {order.status === 'Ordered' && <LuClock className="w-3 h-3" />}
                                  <span>{statusMeta.label}</span>
                                </span>

                                {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                  <select
                                    value={order.status}
                                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                    className="text-[10px] h-6 px-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 font-bold focus:outline-none cursor-pointer w-fit"
                                  >
                                    <option value="Draft">Draft</option>
                                    <option value="Ordered">Order Placed</option>
                                    <option value="Shipped">In Transit</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                )}
                              </div>
                            </td>

                            {/* Total Amount & Payment */}
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-sm text-slate-900 block font-mono">
                                ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                              </span>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    order.paymentStatus === 'Paid'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}
                                >
                                  {order.paymentStatus}
                                </span>

                                {order.paymentStatus !== 'Paid' && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdatePaymentStatus(order.id, 'Paid')}
                                    title="Mark as Paid"
                                    className="text-[10px] font-bold text-primary-600 hover:text-primary-800 underline cursor-pointer"
                                  >
                                    Mark Paid
                                  </button>
                                )}
                              </div>
                            </td>

                            {/* Action Buttons */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrderForDispatch(order)}
                                  title="Contact Supplier"
                                  className="p-1.5 rounded-lg bg-slate-50 hover:bg-primary-50 text-slate-600 hover:text-primary-600 border border-slate-200 transition-colors cursor-pointer"
                                >
                                  <LuSend className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setSelectedOrderForPrint(order)}
                                  title="Print Slip"
                                  className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                                >
                                  <LuPrinter className="w-3.5 h-3.5" />
                                </button>

                                {['Draft', 'Cancelled'].includes(order.status) && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteOrder(order)}
                                    title="Delete Order"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  >
                                    <LuTrash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* -------------------- MODAL 1: ADD / EDIT VENDOR -------------------- */}
      {showVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                  <LuStore className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {editingVendor ? 'Edit Vendor Details' : 'Add New Resource Vendor'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Register supplier details for school procurement
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVendorModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <LuX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vendor / Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={vendorFormData.name}
                    onChange={(e) => setVendorFormData({ ...vendorFormData, name: e.target.value })}
                    placeholder="e.g. Apex Scientific & Lab Instruments"
                    className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Resource Category *
                  </label>
                  <select
                    required
                    value={vendorFormData.category}
                    onChange={(e) => setVendorFormData({ ...vendorFormData, category: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-primary-500 cursor-pointer"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    value={vendorFormData.contact_person}
                    onChange={(e) =>
                      setVendorFormData({ ...vendorFormData, contact_person: e.target.value })
                    }
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone / Mobile Number
                  </label>
                  <input
                    type="text"
                    value={vendorFormData.phone}
                    onChange={(e) => setVendorFormData({ ...vendorFormData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vendor Email Address
                  </label>
                  <input
                    type="email"
                    value={vendorFormData.email}
                    onChange={(e) => setVendorFormData({ ...vendorFormData, email: e.target.value })}
                    placeholder="sales@apexscientific.com"
                    className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Warehouse / Business Address
                  </label>
                  <input
                    type="text"
                    value={vendorFormData.address}
                    onChange={(e) => setVendorFormData({ ...vendorFormData, address: e.target.value })}
                    placeholder="Plot 45, Industrial Area Phase II"
                    className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={vendorFormData.city}
                    onChange={(e) => setVendorFormData({ ...vendorFormData, city: e.target.value })}
                    placeholder="New Delhi"
                    className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">GSTIN / Tax ID</label>
                  <input
                    type="text"
                    value={vendorFormData.gst_number}
                    onChange={(e) => setVendorFormData({ ...vendorFormData, gst_number: e.target.value })}
                    placeholder="07AAAAA0000A1Z5"
                    className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={vendorFormData.bank_name}
                    onChange={(e) => setVendorFormData({ ...vendorFormData, bank_name: e.target.value })}
                    placeholder="State Bank of India"
                    className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account & IFSC</label>
                  <input
                    type="text"
                    value={vendorFormData.account_number}
                    onChange={(e) =>
                      setVendorFormData({ ...vendorFormData, account_number: e.target.value })
                    }
                    placeholder="Account Number / IFSC code"
                    className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={vendorFormData.status}
                    onChange={(e) => setVendorFormData({ ...vendorFormData, status: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-primary-500 cursor-pointer"
                  >
                    <option value="Active">Active Supplier</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={vendorFormData.notes}
                    onChange={(e) => setVendorFormData({ ...vendorFormData, notes: e.target.value })}
                    placeholder="Resource specialties, credit terms, warranty policy..."
                    className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowVendorModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : editingVendor ? 'Update Vendor' : 'Save Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- MODAL 2: PLACE PURCHASE ORDER -------------------- */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                  <LuBoxes className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Generate Purchase Order</h3>
                  <p className="text-[11px] text-slate-400">
                    Order supplies & resources from registered school suppliers
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <LuX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveOrder} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Vendor *</label>
                  <select
                    required
                    value={orderFormData.vendor_id}
                    onChange={(e) => {
                      const vId = e.target.value;
                      const selectedV = vendors.find((v) => v.id === Number(vId));
                      setOrderFormData({
                        ...orderFormData,
                        vendor_id: vId,
                        category: selectedV?.category || orderFormData.category,
                      });
                    }}
                    className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-primary-500 cursor-pointer"
                  >
                    <option value="">-- Choose Vendor --</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Order Date *</label>
                  <input
                    type="date"
                    required
                    value={orderFormData.order_date}
                    onChange={(e) => setOrderFormData({ ...orderFormData, order_date: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-primary-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    value={orderFormData.expected_delivery_date}
                    onChange={(e) =>
                      setOrderFormData({ ...orderFormData, expected_delivery_date: e.target.value })
                    }
                    className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-primary-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Line Items Table Builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
                    Resource Items
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <LuPlus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Item / Resource Name *</th>
                        <th className="py-2.5 px-3 w-28">Quantity</th>
                        <th className="py-2.5 px-3 w-28">Unit</th>
                        <th className="py-2.5 px-3 w-32">Unit Price (₹)</th>
                        <th className="py-2.5 px-3 w-32 text-right">Total (₹)</th>
                        <th className="py-2.5 px-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orderFormData.items.map((item, idx) => {
                        const lineTotal = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                required
                                placeholder="e.g. Compound Microscopes 1000x"
                                value={item.item_name}
                                onChange={(e) => handleItemChange(idx, 'item_name', e.target.value)}
                                className="w-full h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-primary-500"
                              />

                              {availableResources.length > 0 && (
                                <div className="mt-1 flex items-center gap-1.5">
                                  <span className="text-[10px] text-slate-400">or pick resource:</span>
                                  <select
                                    value={item.resource_id}
                                    onChange={(e) => handleItemChange(idx, 'resource_id', e.target.value)}
                                    className="text-[10px] h-5 bg-transparent border-b border-slate-200 text-primary-700 font-semibold focus:outline-none"
                                  >
                                    <option value="">-- Manual item --</option>
                                    {availableResources.map((res) => (
                                      <option key={res.id} value={res.id}>
                                        {res.name} ({res.category})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </td>

                            <td className="py-2 px-3">
                              <input
                                type="number"
                                min="1"
                                required
                                value={item.quantity}
                                onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                className="w-full h-8 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-primary-500 text-center"
                              />
                            </td>

                            <td className="py-2 px-3">
                              <select
                                value={item.unit}
                                onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                                className="w-full h-8 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:border-primary-500"
                              >
                                <option value="Pieces">Pieces</option>
                                <option value="Boxes">Boxes</option>
                                <option value="Sets">Sets</option>
                                <option value="Kg">Kg</option>
                                <option value="Liters">Liters</option>
                                <option value="Units">Units</option>
                              </select>
                            </td>

                            <td className="py-2 px-3">
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                required
                                value={item.unit_price}
                                onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                                className="w-full h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-primary-500 text-right"
                              />
                            </td>

                            <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                              ₹{lineTotal.toLocaleString('en-IN')}
                            </td>

                            <td className="py-2 px-2 text-center">
                              {orderFormData.items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="text-slate-400 hover:text-rose-600 p-1 rounded-md cursor-pointer"
                                  title="Remove item"
                                >
                                  <LuTrash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals & Tax Calculation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Shipping / Delivery Location
                    </label>
                    <input
                      type="text"
                      value={orderFormData.shipping_address}
                      onChange={(e) =>
                        setOrderFormData({ ...orderFormData, shipping_address: e.target.value })
                      }
                      placeholder="e.g. Science Block, Main Campus Gate 1"
                      className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Order Notes</label>
                    <input
                      type="text"
                      value={orderFormData.notes}
                      onChange={(e) => setOrderFormData({ ...orderFormData, notes: e.target.value })}
                      placeholder="Special packaging or dispatch instructions..."
                      className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none pt-1">
                    <input
                      type="checkbox"
                      checked={orderFormData.sync_inventory}
                      onChange={(e) =>
                        setOrderFormData({ ...orderFormData, sync_inventory: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-primary-600 border-slate-300 focus:ring-primary-500"
                    />
                    <span>Increment School Resources stock automatically when delivered</span>
                  </label>
                </div>

                {/* Calculation Summary Box */}
                {(() => {
                  const { subtotal, taxAmount, grandTotal } = calculateTotals();
                  return (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Items Subtotal:</span>
                        <span className="font-mono font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-2">
                          <span>GST / Tax Rate:</span>
                          <select
                            value={orderFormData.tax_rate}
                            onChange={(e) =>
                              setOrderFormData({ ...orderFormData, tax_rate: Number(e.target.value) })
                            }
                            className="h-6 px-1.5 rounded bg-white border border-slate-300 font-bold text-xs"
                          >
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="12">12%</option>
                            <option value="18">18%</option>
                            <option value="28">28%</option>
                          </select>
                        </span>
                        <span className="font-mono font-bold">₹{taxAmount.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span>Discount (₹):</span>
                        <input
                          type="number"
                          min="0"
                          value={orderFormData.discount_amount}
                          onChange={(e) =>
                            setOrderFormData({
                              ...orderFormData,
                              discount_amount: Number(e.target.value),
                            })
                          }
                          className="w-24 h-6 px-2 rounded bg-white border border-slate-300 text-right font-mono font-bold text-xs"
                        />
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-bold text-slate-900">
                        <span>Grand Total:</span>
                        <span className="font-mono text-primary-700 text-base font-extrabold">
                          ₹{grandTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <LuCircleCheck className="w-4 h-4" />
                  <span>{actionLoading ? 'Placing Order...' : 'Place Purchase Order'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- MODAL 3: PRINTABLE PURCHASE ORDER SLIP -------------------- */}
      {selectedOrderForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <LuPrinter className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-bold text-slate-800">Purchase Order Document Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <LuPrinter className="w-3.5 h-3.5" />
                  <span>Print Order Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrderForPrint(null)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <LuX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Print Slip Document */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-800" id="printable-po-slip">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
                    {schoolName}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Resource Procurement & Purchase Order</p>
                  <p className="text-xs text-slate-400">Accounts & Financial Operations</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-slate-900 block">
                    {selectedOrderForPrint.poNumber}
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">Date: {selectedOrderForPrint.orderDate}</p>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-1 bg-primary-50 text-primary-700 border border-primary-100">
                    Status: {selectedOrderForPrint.status}
                  </span>
                </div>
              </div>

              {/* Vendor & Delivery Box */}
              <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 uppercase text-[10px] mb-1">Vendor Details:</h4>
                  <p className="font-bold text-sm text-slate-900">{selectedOrderForPrint.vendorName}</p>
                  {selectedOrderForPrint.vendorContact && (
                    <p className="text-slate-600">Attn: {selectedOrderForPrint.vendorContact}</p>
                  )}
                  {selectedOrderForPrint.vendorPhone && (
                    <p className="text-slate-600">Phone: {selectedOrderForPrint.vendorPhone}</p>
                  )}
                  {selectedOrderForPrint.vendorEmail && (
                    <p className="text-slate-600">Email: {selectedOrderForPrint.vendorEmail}</p>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 uppercase text-[10px] mb-1">Delivery / Ship To:</h4>
                  <p className="font-bold text-sm text-slate-900">{schoolName}</p>
                  <p className="text-slate-600">
                    {selectedOrderForPrint.shippingAddress || 'Main Campus Central Gate'}
                  </p>
                  {selectedOrderForPrint.expectedDeliveryDate && (
                    <p className="text-primary-700 font-semibold mt-1">
                      Expected Delivery: {selectedOrderForPrint.expectedDeliveryDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-center">Unit</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedOrderForPrint.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3 font-medium text-slate-900">
                          {item.itemName}
                          {item.description && (
                            <span className="block text-[11px] text-slate-500 font-normal">
                              {item.description}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center font-bold">{item.quantity}</td>
                        <td className="py-2 px-3 text-center text-slate-600">{item.unit}</td>
                        <td className="py-2 px-3 text-right font-mono">
                          ₹{Number(item.unitPrice).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold">
                          ₹{Number(item.totalPrice).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-bold">
                      ₹{Number(selectedOrderForPrint.subtotal).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {selectedOrderForPrint.taxAmount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>GST / Tax ({selectedOrderForPrint.taxRate}%):</span>
                      <span className="font-mono font-bold">
                        ₹{Number(selectedOrderForPrint.taxAmount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  {selectedOrderForPrint.discountAmount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Discount:</span>
                      <span className="font-mono font-bold">
                        - ₹{Number(selectedOrderForPrint.discountAmount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Grand Total:</span>
                    <span className="font-mono text-primary-700 font-extrabold text-base">
                      ₹{Number(selectedOrderForPrint.totalAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms & Signatures */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-500">
                <div>
                  <p className="font-bold text-slate-700">Terms & Conditions:</p>
                  <p className="mt-1 leading-relaxed text-[11px]">
                    {selectedOrderForPrint.termsAndConditions ||
                      'Standard school procurement terms apply. All items must pass quality checks before acceptance.'}
                  </p>
                </div>
                <div className="text-right flex flex-col justify-end">
                  <div className="w-48 ml-auto border-b border-slate-300 pb-1"></div>
                  <p className="font-bold text-slate-800 mt-2">Authorized Signatory</p>
                  <p className="text-[11px] text-slate-400">Accounts & Finance Lead</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- MODAL 4: CONTACT & DISPATCH TO VENDOR -------------------- */}
      {selectedOrderForDispatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <LuSend className="w-4 h-4 text-primary-600" />
                <h3 className="text-sm font-bold text-slate-800">Dispatch Order to Vendor</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForDispatch(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <LuX className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900 text-sm">
                  {selectedOrderForDispatch.vendorName}
                </p>
                <p className="text-slate-500">
                  PO Code: <span className="font-mono font-bold">{selectedOrderForDispatch.poNumber}</span>
                </p>
                <p className="text-slate-500">
                  Total Order Value:{' '}
                  <span className="font-bold text-primary-700 font-mono">
                    ₹{Number(selectedOrderForDispatch.totalAmount).toLocaleString('en-IN')}
                  </span>
                </p>
              </div>

              <p className="text-slate-600 leading-relaxed">
                Send official purchase order confirmation directly to the vendor via WhatsApp or Email:
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const vendorObj = vendors.find((v) => v.id === selectedOrderForDispatch.vendorId) || {
                      name: selectedOrderForDispatch.vendorName,
                      phone: selectedOrderForDispatch.vendorPhone,
                    };
                    openWhatsApp(vendorObj, selectedOrderForDispatch);
                  }}
                  className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LuMessageCircle className="w-4 h-4" />
                  <span>Send WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const vendorObj = vendors.find((v) => v.id === selectedOrderForDispatch.vendorId) || {
                      name: selectedOrderForDispatch.vendorName,
                      email: selectedOrderForDispatch.vendorEmail,
                    };
                    openEmail(vendorObj, selectedOrderForDispatch);
                  }}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LuMail className="w-4 h-4" />
                  <span>Send Email</span>
                </button>
              </div>

              {selectedOrderForDispatch.vendorPhone && (
                <div className="pt-2 text-center">
                  <a
                    href={`tel:${selectedOrderForDispatch.vendorPhone}`}
                    className="inline-flex items-center gap-1.5 text-primary-600 font-semibold hover:underline"
                  >
                    <LuPhone className="w-3.5 h-3.5" />
                    <span>Call Supplier Directly ({selectedOrderForDispatch.vendorPhone})</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
