import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/Layout/DashboardLayout';
import Login from './modules/auth/Login';
import AdminDashboard from './modules/admin/AdminDashboard';
import OwnerDashboard from './modules/owner/OwnerDashboard';
import TeacherDashboard from './modules/teachers/TeacherDashboard';
import StudentParentDashboard from './modules/students_parents/StudentParentDashboard';
import HRDashboard from './modules/hr/HRDashboard';
import FinanceDashboard from './modules/finance/FinanceDashboard';
import Placeholder from './modules/common/Placeholder';

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

// Teacher HR Pages
import TeacherAttendancePage from './modules/teacher/TeacherAttendancePage';
import TeacherLeaveBalancePage from './modules/teacher/TeacherLeaveBalancePage';
import TeacherApplyLeavePage from './modules/teacher/TeacherApplyLeavePage';
import StudentRecordsPage from './modules/teacher/StudentRecordsPage';
import ClassAttendancePage from './modules/teacher/ClassAttendancePage';
import StaffAttendancePage from './modules/hr/StaffAttendancePage';
import StaffSalaryPage from './modules/hr/StaffSalaryPage';
import StaffLeavesPage from './modules/hr/StaffLeavesPage';
import SchoolEventsPage from './modules/hr/SchoolEventsPage';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Dashboard router — renders the correct dashboard based on role
function DashboardRouter() {
  const { currentRole } = useAuth();

  const dashboardMap = {
    admin: <AdminDashboard />,
    owner: <OwnerDashboard />,
    teacher: <TeacherDashboard />,
    student_parent: <StudentParentDashboard />,
    hr: <HRDashboard />,
    finance: <FinanceDashboard />,
  };

  return dashboardMap[currentRole] || <AdminDashboard />;
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

        {/* Student & Parent Dedicated Pages */}
        <Route path="profile" element={<ProfilePage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="syllabus" element={<SyllabusPage />} />
        <Route path="calendar" element={<SchoolCalendarPage />} />
        <Route path="timetable" element={<TimetablePage />} />
        <Route path="time-table" element={<TimetablePage />} />
        <Route path="assignment" element={<AssignmentsPage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="study-material" element={<StudyMaterialPage />} />
        <Route path="notices" element={<NoticesPage />} />
        <Route path="fees" element={<FeesPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="ptm" element={<PTMPage />} />

        {/* Finance & Account Module Routes */}
        <Route path="salaries" element={<StaffSalaryPage />} />
        <Route path="salary" element={<StaffSalaryPage />} />
        <Route path="expenses" element={<Placeholder />} />
        <Route path="ratio-analysis" element={<Placeholder />} />
        <Route path="budgeting" element={<Placeholder />} />
        <Route path="forecasting" element={<Placeholder />} />
        <Route path="invoices" element={<Placeholder />} />

        {/* HR Module Routes */}
        <Route path="hr/attendance" element={<TeacherAttendancePage />} />
        <Route path="hr/leave-balance" element={<TeacherLeaveBalancePage />} />
        <Route path="hr/apply-leave" element={<TeacherApplyLeavePage />} />
        <Route path="hr/staff-attendance" element={<StaffAttendancePage />} />
        <Route path="hr/staff-leaves" element={<StaffLeavesPage />} />
        <Route path="hr/leaves" element={<StaffLeavesPage />} />
        <Route path="trainings" element={<Placeholder />} />
        <Route path="school-events" element={<SchoolEventsPage />} />
        <Route path="hr/school-events" element={<SchoolEventsPage />} />
        <Route path="payroll" element={<StaffSalaryPage />} />
        <Route path="recruitment" element={<Placeholder />} />
        <Route path="employees" element={<Placeholder />} />

        {/* Admin Module Routes */}
        <Route path="manage-teachers" element={<Placeholder />} />
        <Route path="subjects" element={<Placeholder />} />
        <Route path="attendance" element={<Placeholder />} />
        <Route path="admission" element={<Placeholder />} />
        <Route path="school-vehicles" element={<Placeholder />} />
        <Route path="school-resources" element={<Placeholder />} />

        {/* School Owner Module Routes */}
        <Route path="staff" element={<Placeholder />} />
        <Route path="student-count" element={<Placeholder />} />
        <Route path="enquiries" element={<Placeholder />} />
        <Route path="external-affairs" element={<Placeholder />} />
        <Route path="vault" element={<Placeholder />} />
        <Route path="schools" element={<Placeholder />} />
        <Route path="administrators" element={<Placeholder />} />
        <Route path="performance" element={<Placeholder />} />

        {/* Teacher & Academic Routes */}
        <Route path="teacher/student-attendance" element={<ClassAttendancePage />} />
        <Route path="class-attendance" element={<ClassAttendancePage />} />
        <Route path="teacher/attendance" element={<TeacherAttendancePage />} />
        <Route path="teacher/leave-balance" element={<TeacherLeaveBalancePage />} />
        <Route path="teacher/apply-leave" element={<TeacherApplyLeavePage />} />
        <Route path="student-records" element={<StudentRecordsPage />} />
        <Route path="scoresheet" element={<Placeholder />} />
        <Route path="my-hr" element={<Placeholder />} />
        <Route path="classes" element={<Placeholder />} />
        <Route path="students" element={<Placeholder />} />
        <Route path="teachers" element={<Placeholder />} />
        <Route path="academics" element={<Placeholder />} />
        <Route path="examinations" element={<Placeholder />} />
        <Route path="messages" element={<Placeholder />} />
        <Route path="leave" element={<Placeholder />} />
        <Route path="results" element={<Placeholder />} />
        <Route path="transport" element={<Placeholder />} />
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
