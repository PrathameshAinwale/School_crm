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

  recordFeePayment: (id, data) => {
    return apiRequest(`/accounts/fees/${id}/pay`, {
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
};

export default accountsService;
