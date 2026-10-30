import { apiRequest } from './api';

const API_BASE_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? 'http://127.0.0.1:8000/api/v1'
  : (import.meta.env.VITE_API_URL || 'https://powderblue-trout-993647.hostingersite.com/api/v1');

export const udiseService = {
  /**
   * Get UDISE+ Dashboard Overview
   */
  getDashboard(params = {}) {
    return apiRequest('/udise/dashboard', {
      method: 'GET',
      params,
    });
  },

  /**
   * School Profile (Section 1)
   */
  getSchoolProfile(params = {}) {
    return apiRequest('/udise/school-profile', {
      method: 'GET',
      params,
    });
  },

  updateSchoolProfile(data) {
    return apiRequest('/udise/school-profile', {
      method: 'POST',
      body: data,
    });
  },

  /**
   * School Facilities & Infrastructure (Section 2)
   */
  getSchoolFacilities(params = {}) {
    return apiRequest('/udise/school-facilities', {
      method: 'GET',
      params,
    });
  },

  updateSchoolFacilities(data) {
    return apiRequest('/udise/school-facilities', {
      method: 'POST',
      body: data,
    });
  },

  /**
   * Teaching Staff Details (Section 3)
   */
  getTeachers() {
    return apiRequest('/udise/teachers');
  },

  updateTeacher(id, data) {
    return apiRequest(`/udise/teachers/${id}`, {
      method: 'POST',
      body: data,
    });
  },

  /**
   * Student Details & PEN (Section 4)
   */
  getStudents(params = {}) {
    return apiRequest('/udise/students', {
      method: 'GET',
      params,
    });
  },

  updateStudent(id, data) {
    return apiRequest(`/udise/students/${id}`, {
      method: 'POST',
      body: data,
    });
  },

  /**
   * Class Enrolment Matrix (Section 5)
   */
  getAcademicEnrolment() {
    return apiRequest('/udise/academic-enrolment');
  },

  /**
   * Export JSON DCF Payload
   */
  async exportJson(academicYear = '2024-2025') {
    const token = localStorage.getItem('auth_token');
    const activeSchoolId = localStorage.getItem('active_school_id');
    const url = `${API_BASE_URL}/udise/export/json?academic_year=${academicYear}`;

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(activeSchoolId ? { 'X-School-Id': activeSchoolId } : {}),
      },
    });

    if (!res.ok) throw new Error('Failed to export UDISE+ JSON');
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `UDISE_DCF_Upload_${academicYear}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  /**
   * Export CSV Files (students or teachers)
   */
  async exportCsv(type = 'students') {
    const token = localStorage.getItem('auth_token');
    const activeSchoolId = localStorage.getItem('active_school_id');
    const url = `${API_BASE_URL}/udise/export/csv/${type}`;

    const res = await fetch(url, {
      headers: {
        'Accept': 'text/csv',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(activeSchoolId ? { 'X-School-Id': activeSchoolId } : {}),
      },
    });

    if (!res.ok) throw new Error(`Failed to export UDISE+ ${type} CSV`);
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `UDISE_Module_${type}_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  /**
   * Download DCF Booklet PDF
   */
  async downloadDcfPdf(academicYear = '2024-2025') {
    const token = localStorage.getItem('auth_token');
    const activeSchoolId = localStorage.getItem('active_school_id');
    const url = `${API_BASE_URL}/udise/export/pdf?academic_year=${academicYear}`;

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/pdf',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(activeSchoolId ? { 'X-School-Id': activeSchoolId } : {}),
      },
    });

    if (!res.ok) throw new Error('Failed to download UDISE+ PDF booklet');
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `UDISE_DCF_Summary_${academicYear}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  /**
   * Certify Submission
   */
  certify(academicYear = '2024-2025') {
    return apiRequest('/udise/certify', {
      method: 'POST',
      body: { academic_year: academicYear },
    });
  },
};
