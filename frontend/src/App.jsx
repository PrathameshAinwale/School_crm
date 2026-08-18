import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/Layout/DashboardLayout';
import Login from './modules/auth/Login';
import AdminDashboard from './modules/admin/AdminDashboard';
import OwnerDashboard from './modules/owner/OwnerDashboard';
import TeacherDashboard from './modules/teachers/TeacherDashboard';
import StudentParentDashboard from './modules/students_parents/StudentParentDashboard';
import HRDashboard from './modules/hr/HRDashboard';
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

// Teacher HR & Academic Pages
import TeacherAttendancePage from './modules/teacher/TeacherAttendancePage';
import TeacherLeaveBalancePage from './modules/teacher/TeacherLeaveBalancePage';
import TeacherApplyLeavePage from './modules/teacher/TeacherApplyLeavePage';
import StudentRecordsPage from './modules/teacher/StudentRecordsPage';
import ClassAttendancePage from './modules/teacher/ClassAttendancePage';
import TeacherTrainingsPage from './modules/teacher/TeacherTrainingsPage';

// HR Operations Pages
import StaffAttendancePage from './modules/hr/StaffAttendancePage';
import StaffSalaryPage from './modules/hr/StaffSalaryPage';
import StaffLeavesPage from './modules/hr/StaffLeavesPage';
import SchoolEventsPage from './modules/hr/SchoolEventsPage';
import HRTrainingsPage from './modules/hr/HRTrainingsPage';

// Administrator Detailed Pages
import ManageTeachersPage from './modules/admin/ManageTeachersPage';
import AdminStudentsPage from './modules/admin/AdminStudentsPage';
import AdminAttendancePage from './modules/admin/AdminAttendancePage';
import AdminAdmissionPage from './modules/admin/AdminAdmissionPage';
import AdminVehiclesPage from './modules/admin/AdminVehiclesPage';
import AdminResourcesPage from './modules/admin/AdminResourcesPage';

// School Owner Detailed Pages
import OwnerStaffPage from './modules/owner/OwnerStaffPage';
import OwnerExpensesPage from './modules/owner/OwnerExpensesPage';
import OwnerStudentCountPage from './modules/owner/OwnerStudentCountPage';
import OwnerVaultPage from './modules/owner/OwnerVaultPage';
import OwnerAnalyticsPage from './modules/owner/OwnerAnalyticsPage';
import OwnerNoticesPage from './modules/owner/OwnerNoticesPage';

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
  if (currentRole === 'owner') {
    return <OwnerStudentCountPage />;
  }
  if (currentRole === 'admin') {
    return <AdminStudentsPage />;
  }
  if (currentRole === 'teacher') {
    return <StudentRecordsPage />;
  }
  return <ProfilePage />;
}

// Role-aware Notices Router
function NoticesRouter() {
  const { currentRole } = useAuth();
  if (currentRole === 'owner') {
    return <OwnerNoticesPage />;
  }
  return <NoticesPage />;
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
        <Route path="notices" element={<NoticesRouter />} />
        <Route path="trainings" element={<TrainingsRouter />} />
        <Route path="hr/trainings" element={<HRTrainingsPage />} />
        <Route path="teacher/trainings" element={<TeacherTrainingsPage />} />

        {/* Student & Parent Dedicated Pages */}
        <Route path="profile" element={<ProfilePage />} />
        <Route path="syllabus" element={<SyllabusPage />} />
        <Route path="calendar" element={<SchoolCalendarPage />} />
        <Route path="timetable" element={<TimetablePage />} />
        <Route path="time-table" element={<TimetablePage />} />
        <Route path="assignment" element={<AssignmentsPage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="study-material" element={<StudyMaterialPage />} />
        <Route path="fees" element={<FeesPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="ptm" element={<PTMPage />} />

        {/* HR Module Routes */}
        <Route path="salary" element={<StaffSalaryPage />} />
        <Route path="salaries" element={<StaffSalaryPage />} />
        <Route path="payroll" element={<StaffSalaryPage />} />
        <Route path="hr/attendance" element={<TeacherAttendancePage />} />
        <Route path="hr/leave-balance" element={<TeacherLeaveBalancePage />} />
        <Route path="hr/apply-leave" element={<TeacherApplyLeavePage />} />
        <Route path="hr/staff-attendance" element={<StaffAttendancePage />} />
        <Route path="hr/staff-leaves" element={<StaffLeavesPage />} />
        <Route path="hr/leaves" element={<StaffLeavesPage />} />
        <Route path="school-events" element={<SchoolEventsPage />} />
        <Route path="hr/school-events" element={<SchoolEventsPage />} />
        <Route path="recruitment" element={<Placeholder />} />
        <Route path="employees" element={<Placeholder />} />

        {/* Admin Module Dedicated Routes */}
        <Route path="manage-teachers" element={<ManageTeachersPage />} />
        <Route path="teachers" element={<ManageTeachersPage />} />
        <Route path="admission" element={<AdminAdmissionPage />} />
        <Route path="admissions" element={<AdminAdmissionPage />} />
        <Route path="school-vehicles" element={<AdminVehiclesPage />} />
        <Route path="school-resources" element={<AdminResourcesPage />} />
        <Route path="subjects" element={<Placeholder />} />

        {/* School Owner Module Routes */}
        <Route path="staff" element={<OwnerStaffPage />} />
        <Route path="expenses" element={<OwnerExpensesPage />} />
        <Route path="student-count" element={<OwnerStudentCountPage />} />
        <Route path="vault" element={<OwnerVaultPage />} />
        <Route path="analytics" element={<OwnerAnalyticsPage />} />
        <Route path="performance" element={<OwnerAnalyticsPage />} />
        <Route path="owner/notices" element={<OwnerNoticesPage />} />

        {/* Teacher & Academic Routes */}
        <Route path="teacher/student-attendance" element={<ClassAttendancePage />} />
        <Route path="class-attendance" element={<ClassAttendancePage />} />
        <Route path="teacher/attendance" element={<TeacherAttendancePage />} />
        <Route path="teacher/leave-balance" element={<TeacherLeaveBalancePage />} />
        <Route path="teacher/apply-leave" element={<TeacherApplyLeavePage />} />
        <Route path="student-records" element={<StudentRecordsPage />} />
        <Route path="scoresheet" element={<Placeholder />} />
        <Route path="my-hr" element={<Placeholder />} />
        <Route path="classes" element={<AdminStudentsPage />} />
        <Route path="academics" element={<Placeholder />} />
        <Route path="examinations" element={<Placeholder />} />
        <Route path="messages" element={<Placeholder />} />
        <Route path="leave" element={<Placeholder />} />
        <Route path="results" element={<Placeholder />} />
        <Route path="transport" element={<AdminVehiclesPage />} />
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
