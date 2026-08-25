import { apiRequest } from './api';

export const adminService = {
  // Dashboard
  getDashboardStats() {
    return apiRequest('/admin/dashboard');
  },

  // Academic
  getClasses() {
    return apiRequest('/admin/academic/classes');
  },
  getSubjects() {
    return apiRequest('/admin/academic/subjects');
  },

  // Teachers (Staff)
  getTeachers(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/admin/teachers${qs ? `?${qs}` : ''}`);
  },
  createTeacher(data) {
    return apiRequest('/admin/teachers', {
      method: 'POST',
      body: data,
    });
  },
  updateTeacher(id, data) {
    return apiRequest(`/admin/teachers/${id}`, {
      method: 'PUT',
      body: data,
    });
  },
  deleteTeacher(id) {
    return apiRequest(`/admin/teachers/${id}`, {
      method: 'DELETE',
    });
  },
  resetTeacherPassword(id) {
    return apiRequest(`/admin/teachers/${id}/reset-password`, {
      method: 'POST',
    });
  },

  // Students (Admin Managed)
  getStudents(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/admin/students${qs ? `?${qs}` : ''}`);
  },
  createStudent(data) {
    return apiRequest('/admin/students', {
      method: 'POST',
      body: data,
    });
  },
  updateStudent(id, data) {
    return apiRequest(`/admin/students/${id}`, {
      method: 'PUT',
      body: data,
    });
  },
  deleteStudent(id) {
    return apiRequest(`/admin/students/${id}`, {
      method: 'DELETE',
    });
  },

  // Attendance
  getAttendance(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/admin/attendance${qs ? `?${qs}` : ''}`);
  },
  saveAttendance(data) {
    return apiRequest('/admin/attendance', {
      method: 'POST',
      body: data,
    });
  },

  // Admissions
  getAdmissions(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/admin/admissions${qs ? `?${qs}` : ''}`);
  },
  createAdmission(data) {
    return apiRequest('/admin/admissions', {
      method: 'POST',
      body: data,
    });
  },
  updateAdmissionStatus(id, status, remarks = null) {
    return apiRequest(`/admin/admissions/${id}/status`, {
      method: 'PATCH',
      body: { status, remarks },
    });
  },
  enrollAdmission(id, data = {}) {
    return apiRequest(`/admin/admissions/${id}/enroll`, {
      method: 'POST',
      body: data,
    });
  },

  // Vehicles
  getVehicles(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/admin/vehicles${qs ? `?${qs}` : ''}`);
  },
  createVehicle(data) {
    return apiRequest('/admin/vehicles', {
      method: 'POST',
      body: data,
    });
  },
  updateVehicle(id, data) {
    return apiRequest(`/admin/vehicles/${id}`, {
      method: 'PUT',
      body: data,
    });
  },
  deleteVehicle(id) {
    return apiRequest(`/admin/vehicles/${id}`, {
      method: 'DELETE',
    });
  },

  // Resources
  getResources(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/admin/resources${qs ? `?${qs}` : ''}`);
  },
  createResource(data) {
    return apiRequest('/admin/resources', {
      method: 'POST',
      body: data,
    });
  },
  updateResource(id, data) {
    return apiRequest(`/admin/resources/${id}`, {
      method: 'PUT',
      body: data,
    });
  },
  deleteResource(id) {
    return apiRequest(`/admin/resources/${id}`, {
      method: 'DELETE',
    });
  },
  getResourceRequests(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/admin/resources/requests${qs ? `?${qs}` : ''}`);
  },
  actionResourceRequest(id, data) {
    return apiRequest(`/admin/resources/requests/${id}/action`, {
      method: 'POST',
      body: data,
    });
  },

  // Teacher Resources Self Operations
  getTeacherResources(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/teacher/resources${qs ? `?${qs}` : ''}`);
  },
  getTeacherResourceRequests(params = {}) {
    const query = { my_requests: '1', ...params };
    const qs = new URLSearchParams(query).toString();
    return apiRequest(`/teacher/resources/requests${qs ? `?${qs}` : ''}`);
  },
  submitResourceRequest(formData) {
    return apiRequest('/teacher/resources/requests', {
      method: 'POST',
      body: formData,
    });
  },

  // School Calendar & Events (Admin / HR)
  getAdminEvents(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/admin/events${qs ? `?${qs}` : ''}`);
  },
  createAdminEvent(data) {
    return apiRequest('/admin/events', {
      method: 'POST',
      body: data,
    });
  },
  updateAdminEvent(id, data) {
    return apiRequest(`/admin/events/${id}`, {
      method: 'PUT',
      body: data,
    });
  },
  deleteAdminEvent(id) {
    return apiRequest(`/admin/events/${id}`, {
      method: 'DELETE',
    });
  },

  // Assignments & Homework
  getAssignments(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/assignments${qs ? `?${qs}` : ''}`);
  },
  getAssignment(id) {
    return apiRequest(`/assignments/${id}`);
  },
  createAssignment(formData) {
    return apiRequest('/assignments', {
      method: 'POST',
      body: formData,
    });
  },
  getAssignmentSubmissions(id) {
    return apiRequest(`/assignments/${id}/submissions`);
  },
  submitAssignment(id, formData) {
    return apiRequest(`/assignments/${id}/submit`, {
      method: 'POST',
      body: formData,
    });
  },
  gradeAssignmentSubmission(assignmentId, submissionId, data) {
    return apiRequest(`/assignments/${assignmentId}/grade/${submissionId}`, {
      method: 'POST',
      body: data,
    });
  },

  // Notifications
  getNotifications() {
    return apiRequest('/notifications');
  },
  markNotificationAsRead(id) {
    return apiRequest(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },
  markAllNotificationsAsRead() {
    return apiRequest('/notifications/mark-all-read', {
      method: 'POST',
    });
  },

  // Teacher Self Operations
  getTeacherProfile() {
    return apiRequest('/teacher/profile');
  },
  updateTeacherProfile(data) {
    return apiRequest('/teacher/profile', {
      method: 'PUT',
      body: data,
    });
  },
  getTeacherMyAttendance(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/teacher/my-attendance${qs ? `?${qs}` : ''}`);
  },
  teacherPunch() {
    return apiRequest('/teacher/punch', {
      method: 'POST',
    });
  },
  getTeacherLeaves() {
    return apiRequest('/teacher/leaves');
  },
  applyTeacherLeave(data) {
    return apiRequest('/teacher/leaves/apply', {
      method: 'POST',
      body: data,
    });
  },

  // HR Self Operations
  getHrProfile() {
    return apiRequest('/hr/profile');
  },
  updateHrProfile(data) {
    return apiRequest('/hr/profile', {
      method: 'PUT',
      body: data,
    });
  },

  // Student & Parent Self Operations
  getStudentProfile() {
    return apiRequest('/student/profile');
  },
  updateStudentProfile(data) {
    return apiRequest('/student/profile', {
      method: 'PUT',
      body: data,
    });
  },
};

export default adminService;
