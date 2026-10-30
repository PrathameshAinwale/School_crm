import { apiRequest } from './api';

export const sportsService = {
  // 1. Dashboard Overview
  getDashboard() {
    return apiRequest('/sports/dashboard');
  },

  // 2. Sports Disciplines
  getDisciplines(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/sports/disciplines${qs ? `?${qs}` : ''}`);
  },

  createDiscipline(data) {
    return apiRequest('/sports/disciplines', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateDiscipline(id, data) {
    return apiRequest(`/sports/disciplines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteDiscipline(id) {
    return apiRequest(`/sports/disciplines/${id}`, {
      method: 'DELETE',
    });
  },

  // 3. Competitions / Tournaments
  getCompetitions(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/sports/competitions${qs ? `?${qs}` : ''}`);
  },

  createCompetition(data) {
    return apiRequest('/sports/competitions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCompetition(id, data) {
    return apiRequest(`/sports/competitions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteCompetition(id) {
    return apiRequest(`/sports/competitions/${id}`, {
      method: 'DELETE',
    });
  },

  // 4. Participants & Student Attendance
  getParticipants(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/sports/participants${qs ? `?${qs}` : ''}`);
  },

  enrollParticipant(data) {
    return apiRequest('/sports/participants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateParticipantAttendance(id, data) {
    return apiRequest(`/sports/participants/${id}/attendance`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  recordAchievement(id, data) {
    return apiRequest(`/sports/participants/${id}/achievement`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteParticipant(id) {
    return apiRequest(`/sports/participants/${id}`, {
      method: 'DELETE',
    });
  },

  getAvailableStudents() {
    return apiRequest('/sports/available-students');
  },

  // 5. Profile
  getProfile() {
    return apiRequest('/sports/profile');
  },

  updateProfile(data) {
    return apiRequest('/sports/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 6. Facilities & Grounds
  getFacilities(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/sports/facilities${qs ? `?${qs}` : ''}`);
  },

  createFacility(data) {
    return apiRequest('/sports/facilities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateFacility(id, data) {
    return apiRequest(`/sports/facilities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteFacility(id) {
    return apiRequest(`/sports/facilities/${id}`, {
      method: 'DELETE',
    });
  },

  // 7. Training & Practice Schedules
  getSchedules(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/sports/schedules${qs ? `?${qs}` : ''}`);
  },

  createSchedule(data) {
    return apiRequest('/sports/schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateSchedule(id, data) {
    return apiRequest(`/sports/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteSchedule(id) {
    return apiRequest(`/sports/schedules/${id}`, {
      method: 'DELETE',
    });
  },

  // 8. Equipment & Inventory
  getEquipment(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/sports/equipment${qs ? `?${qs}` : ''}`);
  },

  createEquipment(data) {
    return apiRequest('/sports/equipment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateEquipment(id, data) {
    return apiRequest(`/sports/equipment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteEquipment(id) {
    return apiRequest(`/sports/equipment/${id}`, {
      method: 'DELETE',
    });
  },

  issueEquipment(data) {
    return apiRequest('/sports/equipment/issue', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  returnEquipment(issueId, data = {}) {
    return apiRequest(`/sports/equipment/issues/${issueId}/return`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 9. Athletic Fitness & Health Assessments
  getFitnessAssessments(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/sports/fitness${qs ? `?${qs}` : ''}`);
  },

  createFitnessAssessment(data) {
    return apiRequest('/sports/fitness', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteFitnessAssessment(id) {
    return apiRequest(`/sports/fitness/${id}`, {
      method: 'DELETE',
    });
  },
};
