import { apiRequest } from './api';

export const hrService = {
  // 1. Dashboard
  getHRDashboard: () => {
    return apiRequest('/hr/dashboard');
  },

  // 2. Staff Salaries & Payroll
  getStaffSalaries: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/hr/salaries${qs ? `?${qs}` : ''}`);
  },

  updateStaffSalary: (id, data) => {
    return apiRequest(`/hr/salaries/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  disburseSalary: (data) => {
    return apiRequest('/hr/salaries/disburse', {
      method: 'POST',
      body: data,
    });
  },

  requestSalaryDisbursement: (data) => {
    return apiRequest('/hr/salaries/request-disbursement', {
      method: 'POST',
      body: data,
    });
  },

  // 3. Staff Attendance
  getStaffAttendance: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/hr/staff-attendance${qs ? `?${qs}` : ''}`);
  },

  markStaffAttendance: (data) => {
    return apiRequest('/hr/staff-attendance/mark', {
      method: 'POST',
      body: data,
    });
  },

  // 4. Staff Leaves
  getStaffLeaves: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/hr/leaves${qs ? `?${qs}` : ''}`);
  },

  actionStaffLeave: (id, data) => {
    return apiRequest(`/hr/leaves/${id}/action`, {
      method: 'POST',
      body: data,
    });
  },

  // 5. Faculty Trainings
  getTrainings: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/hr/trainings${qs ? `?${qs}` : ''}`);
  },

  createTraining: (data) => {
    return apiRequest('/hr/trainings', {
      method: 'POST',
      body: data,
    });
  },

  deleteTraining: (id) => {
    return apiRequest(`/hr/trainings/${id}`, {
      method: 'DELETE',
    });
  },

  // 6. School Events
  getSchoolEvents: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/hr/events${qs ? `?${qs}` : ''}`);
  },

  createSchoolEvent: (data) => {
    return apiRequest('/hr/events', {
      method: 'POST',
      body: data,
    });
  },

  deleteSchoolEvent: (id) => {
    return apiRequest(`/hr/events/${id}`, {
      method: 'DELETE',
    });
  },

  // 7. Teachers / Faculty Directory
  getTeachers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/hr/teachers${qs ? `?${qs}` : ''}`);
  },
};

export default hrService;
