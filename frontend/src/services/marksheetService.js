import { apiRequest } from './api';

const API_BASE_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? 'http://127.0.0.1:8000/api/v1'
  : (import.meta.env.VITE_API_URL || 'https://powderblue-trout-993647.hostingersite.com/api/v1');

export const marksheetService = {
  /**
   * Get academic years, examinations, classes, and sections
   */
  getFilters() {
    return apiRequest('/marksheets/filters');
  },

  /**
   * Generate / fetch official marksheets
   * @param {Object} params - { academic_year, examination_id, school_class_id, section_id, student_id }
   */
  generateMarksheets(params = {}) {
    return apiRequest('/marksheets/generate', {
      method: 'GET',
      params,
    });
  },

  /**
   * Update student marks and recalculate totals
   */
  updateMarks(data) {
    return apiRequest('/marksheets/update-marks', {
      method: 'POST',
      body: data,
    });
  },

  /**
   * Download single student PDF as Blob and trigger file save
   */
  async downloadStudentPdf(studentId, examinationId, filename = 'Official_Marksheet.pdf') {
    const token = localStorage.getItem('auth_token');
    const activeSchoolId = localStorage.getItem('active_school_id');
    const url = `${API_BASE_URL}/marksheets/pdf/${studentId}?examination_id=${examinationId}&download=1`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/pdf',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(activeSchoolId ? { 'X-School-Id': activeSchoolId } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download marksheet PDF: ${response.status}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  /**
   * Download bulk marksheets ZIP for class/division
   */
  async downloadBulkZip(params = {}, filename = 'Official_Marksheets_Archive.zip') {
    const token = localStorage.getItem('auth_token');
    const activeSchoolId = localStorage.getItem('active_school_id');
    const qs = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/marksheets/bulk-zip${qs ? `?${qs}` : ''}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/zip',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(activeSchoolId ? { 'X-School-Id': activeSchoolId } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download bulk ZIP archive: ${response.status}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  /**
   * Get direct preview stream URL
   */
  getPdfStreamUrl(studentId, examinationId) {
    const token = localStorage.getItem('auth_token');
    return `${API_BASE_URL}/marksheets/pdf/${studentId}?examination_id=${examinationId}${token ? `&token=${token}` : ''}`;
  },
};
