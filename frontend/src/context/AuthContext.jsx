import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  PRINCIPAL: 'principal',
  ADMISSION_OFFICER: 'admission_officer',
  TEACHER: 'teacher',
  STUDENT_PARENT: 'student_parent',
  HR: 'hr',
  ACCOUNTANT: 'accountant',
  SPORTS_INCHARGE: 'sports_incharge',
};

const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin (Company Platform Owner)',
  [ROLES.ADMIN]: 'School Administrator',
  [ROLES.PRINCIPAL]: 'School Principal (Executive)',
  [ROLES.ADMISSION_OFFICER]: 'Admissions & Enrollment Officer',
  [ROLES.TEACHER]: 'Teacher',
  [ROLES.STUDENT_PARENT]: 'Student / Parent',
  [ROLES.HR]: 'HR Manager',
  [ROLES.ACCOUNTANT]: 'Accounts & Finance Lead',
  [ROLES.SPORTS_INCHARGE]: 'Sports & Athletics Incharge',
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

  const [linkedSchoolAccounts, setLinkedSchoolAccounts] = useState(() => {
    try {
      const stored = localStorage.getItem('linked_school_accounts');
      const list = stored ? JSON.parse(stored) : [];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  });

  // Keep currently active user and school in linkedSchoolAccounts
  useEffect(() => {
    if (user && token && user.school) {
      setLinkedSchoolAccounts((prev) => {
        const currentEntry = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          school_id: user.school_id || user.school.id,
          school: user.school,
          token: token,
          lastActiveAt: new Date().toISOString(),
        };

        const existingIdx = prev.findIndex(
          (acc) => acc.email === user.email || (acc.school?.id === currentEntry.school_id && acc.id === user.id)
        );

        let updated;
        if (existingIdx >= 0) {
          updated = [...prev];
          updated[existingIdx] = { ...updated[existingIdx], ...currentEntry };
        } else {
          updated = [currentEntry, ...prev];
        }
        localStorage.setItem('linked_school_accounts', JSON.stringify(updated));
        return updated;
      });
    }
  }, [user, token]);

  // Verify and link a new school account using admin email and password
  const addSchoolAccount = async (identifier, password, autoSwitch = true) => {
    try {
      const res = await authService.verifyCredentials(identifier, password);
      if (!res.success || !res.token || !res.user) {
        return { success: false, message: res.message || 'Invalid credentials' };
      }

      const newUser = res.user;
      const newToken = res.token;

      if (!newUser.school && !newUser.school_id) {
        return {
          success: false,
          message: 'The authenticated user account is not associated with any school campus.',
        };
      }

      const newEntry = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        school_id: newUser.school_id || newUser.school?.id,
        school: newUser.school,
        token: newToken,
        lastActiveAt: new Date().toISOString(),
      };

      const stored = localStorage.getItem('linked_school_accounts');
      const list = stored ? JSON.parse(stored) : [];
      const existingIdx = list.findIndex(
        (acc) => acc.email === newUser.email || (acc.school?.id === newEntry.school_id && acc.id === newEntry.id)
      );

      let updatedList;
      if (existingIdx >= 0) {
        updatedList = [...list];
        updatedList[existingIdx] = { ...updatedList[existingIdx], ...newEntry };
      } else {
        updatedList = [...list, newEntry];
      }

      localStorage.setItem('linked_school_accounts', JSON.stringify(updatedList));
      setLinkedSchoolAccounts(updatedList);

      if (autoSwitch) {
        switchSchoolAccount(newEntry);
      }

      return {
        success: true,
        user: newUser,
        school: newUser.school,
        message: `School '${newUser.school?.name || 'Campus'}' connected successfully!`,
      };
    } catch (err) {
      return {
        success: false,
        message: err.data?.message || err.message || 'Authentication failed. Please verify credentials.',
      };
    }
  };

  // Switch active session to a linked school account without requiring password again
  const switchSchoolAccount = (targetAccount) => {
    if (!targetAccount || !targetAccount.token) return;

    localStorage.setItem('auth_token', targetAccount.token);
    localStorage.setItem('user', JSON.stringify({
      id: targetAccount.id,
      name: targetAccount.name,
      email: targetAccount.email,
      role: targetAccount.role,
      school_id: targetAccount.school_id,
      school: targetAccount.school,
    }));
    if (targetAccount.school_id) {
      localStorage.setItem('active_school_id', targetAccount.school_id);
      localStorage.setItem('active_school_name', targetAccount.school?.name || '');
    }

    setToken(targetAccount.token);
    setUser({
      id: targetAccount.id,
      name: targetAccount.name,
      email: targetAccount.email,
      role: targetAccount.role,
      school_id: targetAccount.school_id,
      school: targetAccount.school,
    });
    setIsAuthenticated(true);

    // Refresh context and queries for the newly activated school
    window.location.reload();
  };

  // Unlink / remove a school account from the switcher
  const removeSchoolAccount = (accountEmailOrId) => {
    setLinkedSchoolAccounts((prev) => {
      const updated = prev.filter(
        (acc) => acc.id !== accountEmailOrId && acc.email !== accountEmailOrId
      );
      localStorage.setItem('linked_school_accounts', JSON.stringify(updated));
      return updated;
    });
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
      localStorage.removeItem('active_school_id');
      localStorage.removeItem('active_school_name');
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
        linkedSchoolAccounts,
        addSchoolAccount,
        switchSchoolAccount,
        removeSchoolAccount,
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
