import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/Layout/DashboardLayout';
import Login from './modules/auth/Login';
import AdminDashboard from './modules/admin/AdminDashboard';
import TeacherDashboard from './modules/teachers/TeacherDashboard';
import StudentParentDashboard from './modules/students_parents/StudentParentDashboard';
import HRDashboard from './modules/hr/HRDashboard';
import Placeholder from './modules/common/Placeholder';
import UnauthorizedAccess from './components/Common/UnauthorizedAccess';

// Student & Parent Detailed Pages
import SyllabusPage from './modules/students_parents/SyllabusPage';
import SchoolCalendarPage from './modules/students_parents/SchoolCalendarPage';
import TimetablePage from './modules/students_parents/TimetablePage';
import AssignmentsPage from './modules/students_parents/AssignmentsPage';
import StudyMaterialPage from './modules/students_parents/StudyMaterialPage';
import NoticesPage from './modules/students_parents/NoticesPage';
import FeesPage from './modules/students_parents/FeesPage';
import FeedbackPage from './modules/students_parents/FeedbackPage';
import PTMPage from './modules/students_parents/PTMPage';
import AttendancePage from './modules/students_parents/AttendancePage';
import ProfilePage from './modules/students_parents/ProfilePage';

// Teacher HR & Academic Pages
import TeacherProfilePage from './modules/teacher/TeacherProfilePage';
import TeacherAttendancePage from './modules/teacher/TeacherAttendancePage';
import TeacherLeaveBalancePage from './modules/teacher/TeacherLeaveBalancePage';
import TeacherApplyLeavePage from './modules/teacher/TeacherApplyLeavePage';
import StudentRecordsPage from './modules/teacher/StudentRecordsPage';
import ClassAttendancePage from './modules/teacher/ClassAttendancePage';
import TeacherTrainingsPage from './modules/teacher/TeacherTrainingsPage';
import CreateTimetablePage from './modules/teacher/CreateTimetablePage';
import TeacherTodaySchedulePage from './modules/teacher/TeacherTodaySchedulePage';

// HR Operations Pages
import StaffAttendancePage from './modules/hr/StaffAttendancePage';
import StaffSalaryPage from './modules/hr/StaffSalaryPage';
import StaffLeavesPage from './modules/hr/StaffLeavesPage';
import SchoolEventsPage from './modules/hr/SchoolEventsPage';
import HRTrainingsPage from './modules/hr/HRTrainingsPage';
import HRProfilePage from './modules/hr/HRProfilePage';

// Administrator Detailed Pages
import ManageTeachersPage from './modules/admin/ManageTeachersPage';
import AdminStudentsPage from './modules/admin/AdminStudentsPage';
import AdminAttendancePage from './modules/admin/AdminAttendancePage';
import AdminAdmissionPage from './modules/admin/AdminAdmissionPage';
import AdminVehiclesPage from './modules/admin/AdminVehiclesPage';
import AdminResourcesPage from './modules/admin/AdminResourcesPage';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Role-guarded route wrapper
function RoleRoute({ children, allowedRoles, moduleName }) {
  const { currentRole } = useAuth();
  if (!allowedRoles.includes(currentRole)) {
    return <UnauthorizedAccess allowedRoles={allowedRoles} moduleName={moduleName} />;
  }
  return children;
}

// Dashboard router — renders the correct dashboard based on role
function DashboardRouter() {
  const { currentRole } = useAuth();

  const dashboardMap = {
    admin: <AdminDashboard />,
    teacher: <TeacherDashboard />,
    student_parent: <StudentParentDashboard />,
    hr: <HRDashboard />,
  };

  return dashboardMap[currentRole] || <AdminDashboard />;
}

// Role-aware Attendance Router
function AttendanceRouter() {
  const { currentRole } = useAuth();
  if (currentRole === 'admin') {
    return <AdminAttendancePage />;
  }
  if (currentRole === 'hr') {
    return <StaffAttendancePage />;
  }
  if (currentRole === 'teacher') {
    return <ClassAttendancePage />;
  }
  return <AttendancePage />;
}

// Role-aware Students Router
function StudentsRouter() {
  const { currentRole } = useAuth();
  if (currentRole === 'admin') {
    return <AdminStudentsPage />;
  }
  if (currentRole === 'teacher') {
    return <StudentRecordsPage />;
  }
  return <ProfilePage />;
}

// Role-aware Profile Router
function ProfileRouter() {
  const { currentRole, user } = useAuth();
  const role = (user?.role || currentRole || '').toLowerCase();
  if (role === 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  if (role === 'teacher') {
    return <TeacherProfilePage />;
  }
  if (role === 'hr') {
    return <HRProfilePage />;
  }
  if (role === 'student_parent') {
    return <ProfilePage />;
  }
  return <Navigate to="/dashboard" replace />;
}

// Role-aware Trainings Router
function TrainingsRouter() {
  const { currentRole } = useAuth();
  if (currentRole === 'teacher') {
    return <TeacherTrainingsPage />;
  }
  return <HRTrainingsPage />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected Dashboard Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Default redirect to dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Role-aware dashboard */}
        <Route path="dashboard" element={<DashboardRouter />} />

        {/* Dynamic Role-aware Routes */}
        <Route path="attendance" element={<AttendanceRouter />} />
        <Route path="students" element={<StudentsRouter />} />
        <Route path="notices" element={<NoticesPage />} />
        <Route path="trainings" element={<TrainingsRouter />} />
        <Route path="hr/trainings" element={<RoleRoute allowedRoles={['hr', 'admin']} moduleName="HR Trainings"><HRTrainingsPage /></RoleRoute>} />
        <Route path="teacher/trainings" element={<RoleRoute allowedRoles={['teacher', 'admin']} moduleName="Teacher Trainings"><TeacherTrainingsPage /></RoleRoute>} />

        {/* Role Aware Profile Route */}
        <Route path="profile" element={<ProfileRouter />} />
        <Route path="teacher/profile" element={<RoleRoute allowedRoles={['teacher']} moduleName="Teacher Profile"><TeacherProfilePage /></RoleRoute>} />
        <Route path="hr/profile" element={<RoleRoute allowedRoles={['hr']} moduleName="HR Profile"><HRProfilePage /></RoleRoute>} />
        <Route path="student/profile" element={<RoleRoute allowedRoles={['student_parent']} moduleName="Student Profile"><ProfilePage /></RoleRoute>} />

        {/* Student & Parent Dedicated Pages */}
        <Route path="syllabus" element={<SyllabusPage />} />
        <Route path="calendar" element={<SchoolCalendarPage />} />
        <Route path="timetable" element={<TimetablePage />} />
        <Route path="time-table" element={<TimetablePage />} />
        <Route path="assignment" element={<AssignmentsPage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="study-material" element={<StudyMaterialPage />} />
        <Route path="fees" element={<RoleRoute allowedRoles={['student_parent', 'admin']} moduleName="Fees"><FeesPage /></RoleRoute>} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="ptm" element={<PTMPage />} />

        {/* HR Module Routes */}
        <Route path="salary" element={<RoleRoute allowedRoles={['hr', 'admin']} moduleName="Staff Salaries"><StaffSalaryPage /></RoleRoute>} />
        <Route path="salaries" element={<RoleRoute allowedRoles={['hr', 'admin']} moduleName="Staff Salaries"><StaffSalaryPage /></RoleRoute>} />
        <Route path="payroll" element={<RoleRoute allowedRoles={['hr', 'admin']} moduleName="Payroll"><StaffSalaryPage /></RoleRoute>} />
        <Route path="hr/attendance" element={<RoleRoute allowedRoles={['hr', 'teacher', 'admin']} moduleName="Staff Attendance"><TeacherAttendancePage /></RoleRoute>} />
        <Route path="hr/leave-balance" element={<RoleRoute allowedRoles={['hr', 'teacher', 'admin']} moduleName="Leave Balance"><TeacherLeaveBalancePage /></RoleRoute>} />
        <Route path="hr/apply-leave" element={<RoleRoute allowedRoles={['hr', 'teacher', 'admin']} moduleName="Apply for Leave"><TeacherApplyLeavePage /></RoleRoute>} />
        <Route path="hr/staff-attendance" element={<RoleRoute allowedRoles={['hr', 'admin']} moduleName="Staff Attendance"><StaffAttendancePage /></RoleRoute>} />
        <Route path="hr/staff-leaves" element={<RoleRoute allowedRoles={['hr', 'admin']} moduleName="Staff Leaves"><StaffLeavesPage /></RoleRoute>} />
        <Route path="hr/leaves" element={<RoleRoute allowedRoles={['hr', 'admin']} moduleName="Staff Leaves"><StaffLeavesPage /></RoleRoute>} />
        <Route path="school-events" element={<SchoolEventsPage />} />
        <Route path="hr/school-events" element={<SchoolEventsPage />} />
        <Route path="recruitment" element={<RoleRoute allowedRoles={['hr', 'admin']} moduleName="Recruitment"><Placeholder /></RoleRoute>} />
        <Route path="employees" element={<RoleRoute allowedRoles={['hr', 'admin']} moduleName="Employees"><Placeholder /></RoleRoute>} />

        {/* Admin Module Dedicated Routes */}
        <Route path="manage-teachers" element={<RoleRoute allowedRoles={['admin']} moduleName="Manage Teachers"><ManageTeachersPage /></RoleRoute>} />
        <Route path="teachers" element={<RoleRoute allowedRoles={['admin']} moduleName="Teachers Directory"><ManageTeachersPage /></RoleRoute>} />
        <Route path="admission" element={<RoleRoute allowedRoles={['admin']} moduleName="Admissions"><AdminAdmissionPage /></RoleRoute>} />
        <Route path="admissions" element={<RoleRoute allowedRoles={['admin']} moduleName="Admissions"><AdminAdmissionPage /></RoleRoute>} />
        <Route path="school-vehicles" element={<RoleRoute allowedRoles={['admin']} moduleName="School Vehicles"><AdminVehiclesPage /></RoleRoute>} />
        <Route path="school-resources" element={<RoleRoute allowedRoles={['admin']} moduleName="School Resources"><AdminResourcesPage /></RoleRoute>} />
        <Route path="subjects" element={<Placeholder />} />

        {/* Teacher & Staff Academic & Self Routes */}
        <Route path="teacher/schedule" element={<RoleRoute allowedRoles={['teacher', 'admin']} moduleName="Today's Schedule"><TeacherTodaySchedulePage /></RoleRoute>} />
        <Route path="teacher/timetable" element={<RoleRoute allowedRoles={['teacher', 'admin']} moduleName="Create Timetable"><CreateTimetablePage /></RoleRoute>} />
        <Route path="teacher/student-attendance" element={<RoleRoute allowedRoles={['teacher', 'admin']} moduleName="Student Attendance"><ClassAttendancePage /></RoleRoute>} />
        <Route path="class-attendance" element={<RoleRoute allowedRoles={['teacher', 'admin']} moduleName="Class Attendance"><ClassAttendancePage /></RoleRoute>} />
        <Route path="teacher/attendance" element={<RoleRoute allowedRoles={['hr', 'teacher', 'admin']} moduleName="Staff Attendance"><TeacherAttendancePage /></RoleRoute>} />
        <Route path="teacher/leave-balance" element={<RoleRoute allowedRoles={['hr', 'teacher', 'admin']} moduleName="Leave Balance"><TeacherLeaveBalancePage /></RoleRoute>} />
        <Route path="teacher/apply-leave" element={<RoleRoute allowedRoles={['hr', 'teacher', 'admin']} moduleName="Apply Leave"><TeacherApplyLeavePage /></RoleRoute>} />
        <Route path="student-records" element={<RoleRoute allowedRoles={['teacher', 'admin']} moduleName="Student Records"><StudentRecordsPage /></RoleRoute>} />
        <Route path="scoresheet" element={<Placeholder />} />
        <Route path="my-hr" element={<Placeholder />} />
        <Route path="classes" element={<RoleRoute allowedRoles={['admin', 'teacher']} moduleName="Classes"><AdminStudentsPage /></RoleRoute>} />
        <Route path="academics" element={<Placeholder />} />
        <Route path="examinations" element={<Placeholder />} />
        <Route path="messages" element={<Placeholder />} />
        <Route path="leave" element={<Placeholder />} />
        <Route path="results" element={<Placeholder />} />
        <Route path="transport" element={<RoleRoute allowedRoles={['admin']} moduleName="Transport"><AdminVehiclesPage /></RoleRoute>} />
        <Route path="health" element={<Placeholder />} />
        <Route path="settings" element={<Placeholder />} />

        {/* Catch-all */}
        <Route path="*" element={<Placeholder />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
