import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const ROLES = {
  ADMIN: 'admin',
  OWNER: 'owner',
  TEACHER: 'teacher',
  STUDENT_PARENT: 'student_parent',
  HR: 'hr',
  FINANCE: 'finance',
};

const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.OWNER]: 'School Owner',
  [ROLES.TEACHER]: 'Teacher',
  [ROLES.STUDENT_PARENT]: 'Student / Parent',
  [ROLES.HR]: 'HR Manager',
  [ROLES.FINANCE]: 'Finance Manager',
};

const DEFAULT_USERS = {
  [ROLES.ADMIN]: {
    name: 'Rajesh Kumar',
    email: 'admin@eduflow.com',
    role: ROLES.ADMIN,
    avatar: null,
    school: 'Delhi Public Academy',
  },
  [ROLES.OWNER]: {
    name: 'Priya Sharma',
    email: 'owner@eduflow.com',
    role: ROLES.OWNER,
    avatar: null,
    school: 'Delhi Public Academy',
  },
  [ROLES.TEACHER]: {
    name: 'Ananya Singh',
    email: 'teacher@eduflow.com',
    role: ROLES.TEACHER,
    avatar: null,
    school: 'Delhi Public Academy',
  },
  [ROLES.STUDENT_PARENT]: {
    name: 'Arjun Patel',
    email: 'student@eduflow.com',
    role: ROLES.STUDENT_PARENT,
    avatar: null,
    school: 'Delhi Public Academy',
  },
  [ROLES.HR]: {
    name: 'Meera Gupta',
    email: 'hr@eduflow.com',
    role: ROLES.HR,
    avatar: null,
    school: 'Delhi Public Academy',
  },
  [ROLES.FINANCE]: {
    name: 'Vikram Reddy',
    email: 'finance@eduflow.com',
    role: ROLES.FINANCE,
    avatar: null,
    school: 'Delhi Public Academy',
  },
};

export function AuthProvider({ children }) {
  const [currentRole, setCurrentRole] = useState(ROLES.ADMIN);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const user = DEFAULT_USERS[currentRole];

  const login = (role) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const switchRole = (role) => {
    setCurrentRole(role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentRole,
        isAuthenticated,
        login,
        logout,
        switchRole,
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
