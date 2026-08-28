import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT_PARENT: 'student_parent',
  HR: 'hr',
  ACCOUNTANT: 'accountant',
};

const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin (Company Platform Owner)',
  [ROLES.ADMIN]: 'School Administrator',
  [ROLES.TEACHER]: 'Teacher',
  [ROLES.STUDENT_PARENT]: 'Student / Parent',
  [ROLES.HR]: 'HR Manager',
  [ROLES.ACCOUNTANT]: 'Accounts & Finance Lead',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(false);

  const currentRole = user?.role || ROLES.ADMIN;
  const currentSchool = user?.school || null;

  // Verify token on mount if available
  useEffect(() => {
    if (token) {
      authService.me()
        .then((res) => {
          if (res.user) {
            setUser(res.user);
            localStorage.setItem('user', JSON.stringify(res.user));
            setIsAuthenticated(true);
          }
        })
        .catch(() => {
          // Token expired or invalid
          logout();
        });
    }
  }, []);

  const login = async (identifier, password) => {
    setLoading(true);
    try {
      const res = await authService.login(identifier, password);
      if (res.success && res.token) {
        setUser(res.user);
        setToken(res.token);
        setIsAuthenticated(true);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      return {
        success: false,
        message: err.data?.message || err.message || 'Unable to connect to the backend server. Please ensure the server is running.',
      };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword, newPasswordConfirmation) => {
    const res = await authService.changePassword(currentPassword, newPassword, newPasswordConfirmation);
    if (res.success && res.user) {
      const updatedUser = { ...user, ...res.user, must_change_password: false };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    return res;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    } finally {
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        currentRole,
        currentSchool,
        isAuthenticated,
        loading,
        login,
        logout,
        changePassword,
        ROLES,
        ROLE_LABELS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { ROLES, ROLE_LABELS };
