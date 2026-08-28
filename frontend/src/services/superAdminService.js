import { apiRequest } from './api';

export const superAdminService = {
  // Platform Overview Metrics
  getDashboard: () => {
    return apiRequest('/super-admin/dashboard');
  },

  // Schools Directory & Filters
  getSchools: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/super-admin/schools${qs ? `?${qs}` : ''}`);
  },

  // Onboard New School & Provision Admin
  createSchool: (schoolData) => {
    return apiRequest('/super-admin/schools', {
      method: 'POST',
      body: schoolData,
    });
  },

  // View Single School Details
  getSchoolById: (id) => {
    return apiRequest(`/super-admin/schools/${id}`);
  },

  // Update School Details & Subscription
  updateSchool: (id, data) => {
    return apiRequest(`/super-admin/schools/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  // Toggle School Active / Suspended Status
  toggleSchoolStatus: (id) => {
    return apiRequest(`/super-admin/schools/${id}/toggle-status`, {
      method: 'PATCH',
    });
  },

  // Reset School Admin Password
  resetAdminPassword: (id, newPassword = '') => {
    return apiRequest(`/super-admin/schools/${id}/reset-admin-password`, {
      method: 'POST',
      body: { new_password: newPassword },
    });
  },

  // Delete School
  deleteSchool: (id) => {
    return apiRequest(`/super-admin/schools/${id}`, {
      method: 'DELETE',
    });
  },
};
