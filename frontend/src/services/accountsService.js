import { apiRequest } from './api';

export const accountsService = {
  // 1. Dashboard
  getDashboard: () => {
    return apiRequest('/accounts/dashboard');
  },

  // 2. Student Fees
  getFees: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const qs = new URLSearchParams(cleanParams).toString();
    return apiRequest(`/accounts/fees${qs ? `?${qs}` : ''}`);
  },

  getFeeTemplates: () => {
    return apiRequest('/accounts/fee-templates');
  },

  // Batch 2: Advanced Fee Management
  previewAllocation: (data) => {
    return apiRequest('/accounts/fees/preview-allocation', {
      method: 'POST',
      body: data,
    });
  },

  collectFee: (data) => {
    return apiRequest('/accounts/fees/collect', {
      method: 'POST',
      body: data,
    });
  },

  clearCheque: (id) => {
    return apiRequest(`/accounts/fees/payments/${id}/clear-cheque`, {
      method: 'POST',
    });
  },

  bounceCheque: (id, data = {}) => {
    return apiRequest(`/accounts/fees/payments/${id}/bounce-cheque`, {
      method: 'POST',
      body: data,
    });
  },

  voidPayment: (id, data) => {
    return apiRequest(`/accounts/fees/payments/${id}/void`, {
      method: 'POST',
      body: data,
    });
  },

  getConcessionTypes: () => {
    return apiRequest('/accounts/fees/concession-types');
  },

  createConcessionType: (data) => {
    return apiRequest('/accounts/fees/concession-types', {
      method: 'POST',
      body: data,
    });
  },

  applyConcession: (data) => {
    return apiRequest('/accounts/fees/concessions/apply', {
      method: 'POST',
      body: data,
    });
  },

  approveConcession: (id) => {
    return apiRequest(`/accounts/fees/concessions/${id}/approve`, {
      method: 'POST',
    });
  },

  revokeConcession: (id, data) => {
    return apiRequest(`/accounts/fees/concessions/${id}/revoke`, {
      method: 'POST',
      body: data,
    });
  },

  requestRefund: (data) => {
    return apiRequest('/accounts/fees/refunds/request', {
      method: 'POST',
      body: data,
    });
  },

  approveRefund: (id, data = {}) => {
    return apiRequest(`/accounts/fees/refunds/${id}/approve`, {
      method: 'POST',
      body: data,
    });
  },

  getDailyCollection: (date = '') => {
    return apiRequest(`/accounts/fees/reports/daily-collection${date ? `?date=${date}` : ''}`);
  },

  getDefaulters: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const qs = new URLSearchParams(cleanParams).toString();
    return apiRequest(`/accounts/fees/reports/defaulters${qs ? `?${qs}` : ''}`);
  },

  getStudentLedger: (studentId) => {
    return apiRequest(`/accounts/fees/students/${studentId}/ledger`);
  },

  waiveFine: (data) => {
    return apiRequest('/accounts/fees/waive-fine', {
      method: 'POST',
      body: data,
    });
  },


  sendFeeReminder: (id, data = {}) => {
    return apiRequest(`/accounts/fees/${id}/remind`, {
      method: 'POST',
      body: data,
    });
  },

  sendBulkFeeReminders: (data = {}) => {
    return apiRequest('/accounts/fees/bulk-remind', {
      method: 'POST',
      body: data,
    });
  },

  // 3. School Expenses
  getExpenses: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const qs = new URLSearchParams(cleanParams).toString();
    return apiRequest(`/accounts/expenses${qs ? `?${qs}` : ''}`);
  },

  createExpense: (data) => {
    return apiRequest('/accounts/expenses', {
      method: 'POST',
      body: data,
    });
  },

  deleteExpense: (id) => {
    return apiRequest(`/accounts/expenses/${id}`, {
      method: 'DELETE',
    });
  },

  // 4. Salary Disbursements (HR to Accounts & Direct Recording)
  getSalaryDisbursements: () => {
    return apiRequest('/accounts/salary-disbursements');
  },

  recordStaffSalaryDisbursement: (data) => {
    return apiRequest('/accounts/salary-disbursements/record-staff', {
      method: 'POST',
      body: data,
    });
  },

  actionDisbursementRequest: (id, data) => {
    return apiRequest(`/accounts/salary-disbursements/${id}/action`, {
      method: 'POST',
      body: data,
    });
  },

  // 5. Accounts Officer Profile
  getProfile: () => {
    return apiRequest('/accounts/profile');
  },

  updateProfile: (data) => {
    return apiRequest('/accounts/profile', {
      method: 'PUT',
      body: data,
    });
  },

  // 6. Vendor Management
  getVendors: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const qs = new URLSearchParams(cleanParams).toString();
    return apiRequest(`/accounts/vendors${qs ? `?${qs}` : ''}`);
  },

  createVendor: (data) => {
    return apiRequest('/accounts/vendors', {
      method: 'POST',
      body: data,
    });
  },

  updateVendor: (id, data) => {
    return apiRequest(`/accounts/vendors/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  deleteVendor: (id) => {
    return apiRequest(`/accounts/vendors/${id}`, {
      method: 'DELETE',
    });
  },

  // 7. Sales & Purchase Orders (Procurement)
  getPurchaseOrders: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const qs = new URLSearchParams(cleanParams).toString();
    return apiRequest(`/accounts/purchase-orders${qs ? `?${qs}` : ''}`);
  },

  getPurchaseOrder: (id) => {
    return apiRequest(`/accounts/purchase-orders/${id}`);
  },

  createPurchaseOrder: (data) => {
    return apiRequest('/accounts/purchase-orders', {
      method: 'POST',
      body: data,
    });
  },

  updateOrderStatus: (id, data) => {
    return apiRequest(`/accounts/purchase-orders/${id}/status`, {
      method: 'PATCH',
      body: data,
    });
  },

  updateOrderPayment: (id, data) => {
    return apiRequest(`/accounts/purchase-orders/${id}/payment`, {
      method: 'PATCH',
      body: data,
    });
  },

  deletePurchaseOrder: (id) => {
    return apiRequest(`/accounts/purchase-orders/${id}`, {
      method: 'DELETE',
    });
  },

  getProcurementResources: () => {
    return apiRequest('/accounts/procurement-resources');
  },
};

export default accountsService;
