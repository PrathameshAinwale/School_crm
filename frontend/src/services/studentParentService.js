import { apiRequest } from './api';

export const studentParentService = {
  // Dashboard
  getDashboardStats() {
    return apiRequest('/student/dashboard');
  },

  // Profile
  getProfile() {
    return apiRequest('/student/profile');
  },
  updateProfile(data) {
    return apiRequest('/student/profile', {
      method: 'PUT',
      body: data,
    });
  },

  // Attendance & Leaves
  getAttendance() {
    return apiRequest('/student/attendance');
  },
  applyLeave(data) {
    return apiRequest('/student/leaves/apply', {
      method: 'POST',
      body: data,
    });
  },

  // Fees
  getFees() {
    return apiRequest('/student/fees');
  },
  payFee(data) {
    return apiRequest('/student/fees/pay', {
      method: 'POST',
      body: data,
    });
  },

  // Faculty Feedback
  getFeedback() {
    return apiRequest('/student/feedback');
  },
  submitFeedback(data) {
    return apiRequest('/student/feedback', {
      method: 'POST',
      body: data,
    });
  },
  deleteFeedback(id) {
    return apiRequest(`/student/feedback/${id}`, {
      method: 'DELETE',
    });
  },

  // PTM Portal
  getPtmInfo() {
    return apiRequest('/student/ptm');
  },
  reschedulePtm(data) {
    return apiRequest('/student/ptm/reschedule', {
      method: 'POST',
      body: data,
    });
  },

  // Study Material
  getStudyMaterials(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/student/study-material${qs ? `?${qs}` : ''}`);
  },
  downloadStudyMaterial(id) {
    return apiRequest(`/student/study-material/${id}/download`, {
      method: 'POST',
    });
  },
  uploadStudyMaterial(data) {
    return apiRequest('/student/study-material', {
      method: 'POST',
      body: data,
    });
  },

  // Syllabus & Progress
  getSyllabus(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/student/syllabus${qs ? `?${qs}` : ''}`);
  },
  updateSyllabusProgress(data) {
    return apiRequest('/student/syllabus/progress', {
      method: 'POST',
      body: data,
    });
  },
  addSyllabusUnit(data) {
    return apiRequest('/student/syllabus/unit', {
      method: 'POST',
      body: data,
    });
  },
  updateSyllabusUnit(id, data) {
    return apiRequest(`/student/syllabus/unit/${id}`, {
      method: 'PUT',
      body: data,
    });
  },
  deleteSyllabusProgressLog(id) {
    return apiRequest(`/student/syllabus/progress/${id}`, {
      method: 'DELETE',
    });
  },

  // Timetable
  getTimetable(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/student/timetable${qs ? `?${qs}` : ''}`);
  },
  saveTimetableSlot(data) {
    return apiRequest('/student/timetable', {
      method: 'POST',
      body: data,
    });
  },
  saveBulkTimetable(data) {
    return apiRequest('/student/timetable/bulk', {
      method: 'POST',
      body: data,
    });
  },
  clearDayTimetable(data) {
    return apiRequest('/student/timetable/clear-day', {
      method: 'POST',
      body: data,
    });
  },
  deleteTimetableSlot(id) {
    return apiRequest(`/student/timetable/${id}`, {
      method: 'DELETE',
    });
  },

  // School Calendar (HR/Admin posted)
  getCalendarEvents(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/student/calendar${qs ? `?${qs}` : ''}`);
  },

  // Teacher Daily Schedule & Dashboard
  getTeacherDashboard() {
    return apiRequest('/teacher/dashboard');
  },
  getTeacherSchedule(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/teacher/schedule${qs ? `?${qs}` : ''}`);
  },

  // School Notices & Circulars
  getNotices(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/student/notices${qs ? `?${qs}` : ''}`);
  },
  createNotice(data) {
    return apiRequest('/student/notices', {
      method: 'POST',
      body: data,
    });
  },
  deleteNotice(id) {
    return apiRequest(`/student/notices/${id}`, {
      method: 'DELETE',
    });
  },

  // Notifications
  getNotifications() {
    return apiRequest('/notifications');
  },
  markNotificationRead(id) {
    return apiRequest(`/notifications/${id}/read`, {
      method: 'POST',
    });
  },
  markAllNotificationsRead() {
    return apiRequest('/notifications/read-all', {
      method: 'POST',
    });
  },
};

export default studentParentService;
