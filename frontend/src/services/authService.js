import { apiRequest } from './api';

export const authService = {
  /**
   * Login with email or phone + password
   */
  async login(identifier, password) {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: { identifier, password },
    });
    if (res.token) {
      localStorage.setItem('auth_token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
    }
    return res;
  },

  /**
   * Change Password (sets must_change_password to false in backend)
   */
  async changePassword(currentPassword, newPassword, newPasswordConfirmation) {
    const res = await apiRequest('/auth/change-password', {
      method: 'POST',
      body: {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation,
      },
    });
    if (res.user) {
      localStorage.setItem('user', JSON.stringify(res.user));
    }
    return res;
  },

  /**
   * Fetch current authenticated profile
   */
  async me() {
    return apiRequest('/auth/me');
  },

  /**
   * Logout
   */
  async logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser() {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
};

export default authService;
