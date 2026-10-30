import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/Layout/DashboardLayout';
import Login from './modules/auth/Login';
import SuperAdminLogin from './modules/auth/SuperAdminLogin';
import AdminDashboard from './modules/admin/AdminDashboard';
import AdminProfilePage from './modules/admin/AdminProfilePage';
import CommunicationHubPage from './modules/admin/communication/CommunicationHubPage';
import TeacherDashboard from './modules/teacher/TeacherDashboard';
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
import TeacherResourcesPage from './modules/teacher/TeacherResourcesPage';

// HR Operations Pages
import StaffAttendancePage from './modules/hr/StaffAttendancePage';
import StaffSalaryPage from './modules/hr/StaffSalaryPage';
import StaffLeavesPage from './modules/hr/StaffLeavesPage';
import SchoolEventsPage from './modules/hr/SchoolEventsPage';
import HRTrainingsPage from './modules/hr/HRTrainingsPage';
import HRProfilePage from './modules/hr/HRProfilePage';

// Super Admin Platform Pages
import SuperAdminDashboard from './modules/super_admin/SuperAdminDashboard';
import ManageSchoolsPage from './modules/super_admin/ManageSchoolsPage';
import PlatformSubscriptionsPage from './modules/super_admin/PlatformSubscriptionsPage';

// Accounts & Finance Pages
import AccountsDashboard from './modules/accounts/AccountsDashboard';
import StudentFeesManagementPage from './modules/accounts/StudentFeesManagementPage';
import SchoolExpensesPage from './modules/accounts/SchoolExpensesPage';
import SalaryDisbursementPage from './modules/accounts/SalaryDisbursementPage';
import AccountsProfilePage from './modules/accounts/AccountsProfilePage';
import VendorsPurchasesPage from './modules/accounts/VendorsPurchasesPage';

// Sports & Athletics Module Pages
import SportsDashboard from './modules/sports/SportsDashboard';
import SportsActivitiesPage from './modules/sports/SportsActivitiesPage';
import SportsParticipantsPage from './modules/sports/SportsParticipantsPage';
import SportsAchievementsPage from './modules/sports/SportsAchievementsPage';
import SportsProfilePage from './modules/sports/SportsProfilePage';
import SportsSchedulesPage from './modules/sports/SportsSchedulesPage';
import SportsFacilitiesPage from './modules/sports/SportsFacilitiesPage';
import SportsInventoryPage from './modules/sports/SportsInventoryPage';
import SportsFitnessPage from './modules/sports/SportsFitnessPage';

// Administrator Detailed Pages
import ManageTeachersPage from './modules/admin/ManageTeachersPage';
import AdminStudentsPage from './modules/admin/AdminStudentsPage';
import AdminAttendancePage from './modules/admin/AdminAttendancePage';
import AdminAdmissionPage from './modules/admin/AdminAdmissionPage';
import AdminVehiclesPage from './modules/admin/AdminVehiclesPage';
import AdminResourcesPage from './modules/admin/AdminResourcesPage';
import AdminEventsCalendarPage from './modules/admin/AdminEventsCalendarPage';
import AdminFeeStructurePage from './modules/admin/AdminFeeStructurePage';
import SchoolSettingsPage from './modules/admin/SchoolSettingsPage';
import AdminExaminationsPage from './modules/admin/AdminExaminationsPage';

// Teacher Examination & Scoresheet Pages
import TeacherScoresheetPage from './modules/teacher/TeacherScoresheetPage';

// Shared Academic Results Page
import ResultsPage from './modules/shared/ResultsPage';

// Principal & Admission Portal Pages
import PrincipalDashboard from './modules/principal/PrincipalDashboard';
import PrincipalAdmissionsPage from './modules/principal/PrincipalAdmissionsPage';
import AdmissionPortalPage from './modules/admission/AdmissionPortalPage';
import AdmissionDashboard from './modules/admission/AdmissionDashboard';
import AdmissionInquiriesPage from './modules/admission/AdmissionInquiriesPage';
import AdmissionDocumentsPage from './modules/admission/AdmissionDocumentsPage';
import AdmissionInterviewsPage from './modules/admission/AdmissionInterviewsPage';
import AdmissionOffersPage from './modules/admission/AdmissionOffersPage';
import AdmissionInterviewCalendarPage from './modules/admission/AdmissionInterviewCalendarPage';

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
    super_admin: <SuperAdminDashboard />,
    admin: <AdminDashboard />,
    principal: <PrincipalDashboard />,
    admission_officer: <AdminAdmissionPage />,
    teacher: <TeacherDashboard />,
    student_parent: <StudentParentDashboard />,
    hr: <HRDashboard />,
    accountant: <AccountsDashboard />,
    sports_incharge: <SportsDashboard />,
  };

  return dashboardMap[currentRole] || <AdminDashboard />;
}

// Role-aware Attendance Router
function AttendanceRouter() {
  const { currentRole } = useAuth();
  if (currentRole === 'admin' || currentRole === 'principal') {
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
  if (currentRole === 'admin' || currentRole === 'principal') {
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
  if (role === 'admin' || role === 'principal' || role === 'admission_officer') {
    return <AdminProfilePage />;
  }
  if (role === 'teacher') {
    return <TeacherProfilePage />;
  }
  if (role === 'hr' || role === 'staff') {
    return <HRProfilePage />;
  }
  if (role === 'accountant') {
    return <AccountsProfilePage />;
  }
  if (role === 'sports_incharge') {
    return <SportsProfilePage />;
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
      {/* Public School Login */}
      <Route path="/login" element={<Login />} />

      {/* Dedicated Super Admin Company Platform Login (Direct URL Access Only) */}
      <Route path="/superadmin" element={<SuperAdminLogin />} />
      <Route path="/superadmin/login" element={<SuperAdminLogin />} />
      <Route path="/super-admin" element={<SuperAdminLogin />} />

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
        <Route path="admin/profile" element={<RoleRoute allowedRoles={['admin']} moduleName="Admin Profile"><AdminProfilePage /></RoleRoute>} />
        <Route path="teacher/profile" element={<RoleRoute allowedRoles={['teacher', 'admin']} moduleName="Teacher Profile"><TeacherProfilePage /></RoleRoute>} />
        <Route path="hr/profile" element={<RoleRoute allowedRoles={['hr', 'staff', 'admin']} moduleName="HR Profile"><HRProfilePage /></RoleRoute>} />
        <Route path="accounts/profile" element={<RoleRoute allowedRoles={['accountant', 'admin']} moduleName="Accounts Profile"><AccountsProfilePage /></RoleRoute>} />
        <Route path="student/profile" element={<RoleRoute allowedRoles={['student_parent', 'admin']} moduleName="Student Profile"><ProfilePage /></RoleRoute>} />

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

        {/* Super Admin Company Platform Routes */}
        <Route path="super-admin/schools" element={<RoleRoute allowedRoles={['super_admin']} moduleName="Manage Schools"><ManageSchoolsPage /></RoleRoute>} />
        <Route path="super-admin/subscriptions" element={<RoleRoute allowedRoles={['super_admin']} moduleName="Subscriptions & MRR"><PlatformSubscriptionsPage /></RoleRoute>} />

        {/* Accounts & Finance Module Routes */}
        <Route path="accounts/fees" element={<RoleRoute allowedRoles={['accountant', 'admin']} moduleName="Student Fees"><StudentFeesManagementPage /></RoleRoute>} />
        <Route path="accounts/expenses" element={<RoleRoute allowedRoles={['accountant', 'admin']} moduleName="School Expenses"><SchoolExpensesPage /></RoleRoute>} />
        <Route path="accounts/salary-disbursements" element={<RoleRoute allowedRoles={['accountant', 'admin']} moduleName="Salary Disbursements"><SalaryDisbursementPage /></RoleRoute>} />
        <Route path="accounts/vendors" element={<RoleRoute allowedRoles={['accountant', 'admin']} moduleName="Vendors & Purchases"><VendorsPurchasesPage /></RoleRoute>} />
        <Route path="accounts/purchases" element={<RoleRoute allowedRoles={['accountant', 'admin']} moduleName="Vendors & Purchases"><VendorsPurchasesPage /></RoleRoute>} />
        <Route path="accounts/dashboard" element={<RoleRoute allowedRoles={['accountant', 'admin']} moduleName="Accounts Dashboard"><AccountsDashboard /></RoleRoute>} />

        {/* Sports & Athletics Module Routes */}
        <Route path="sports/dashboard" element={<RoleRoute allowedRoles={['sports_incharge', 'admin']} moduleName="Sports Dashboard"><SportsDashboard /></RoleRoute>} />
        <Route path="sports/activities" element={<RoleRoute allowedRoles={['sports_incharge', 'admin']} moduleName="Sports Activities"><SportsActivitiesPage /></RoleRoute>} />
        <Route path="sports/competitions" element={<RoleRoute allowedRoles={['sports_incharge', 'admin']} moduleName="Sports Competitions"><SportsActivitiesPage /></RoleRoute>} />
        <Route path="sports/participants" element={<RoleRoute allowedRoles={['sports_incharge', 'admin']} moduleName="Student Athletes Roster"><SportsParticipantsPage /></RoleRoute>} />
        <Route path="sports/attendance" element={<RoleRoute allowedRoles={['sports_incharge', 'admin']} moduleName="Student Athletes Attendance"><SportsParticipantsPage /></RoleRoute>} />
        <Route path="sports/schedules" element={<RoleRoute allowedRoles={['sports_incharge', 'admin']} moduleName="Training Schedules"><SportsSchedulesPage /></RoleRoute>} />
        <Route path="sports/facilities" element={<RoleRoute allowedRoles={['sports_incharge', 'admin']} moduleName="Grounds & Facilities"><SportsFacilitiesPage /></RoleRoute>} />
        <Route path="sports/inventory" element={<RoleRoute allowedRoles={['sports_incharge', 'admin']} moduleName="Sports Inventory"><SportsInventoryPage /></RoleRoute>} />
        <Route path="sports/equipment" element={<RoleRoute allowedRoles={['sports_incharge', 'admin']} moduleName="Sports Equipment"><SportsInventoryPage /></RoleRoute>} />
        <Route path="sports/fitness" element={<RoleRoute allowedRoles={['sports_incharge', 'admin']} moduleName="Fitness Assessments"><SportsFitnessPage /></RoleRoute>} />
        <Route path="sports/achievements" element={<RoleRoute allowedRoles={['sports_incharge', 'admin']} moduleName="Sports Honors"><SportsAchievementsPage /></RoleRoute>} />
        <Route path="sports/profile" element={<RoleRoute allowedRoles={['sports_incharge', 'admin']} moduleName="Sports Incharge Profile"><SportsProfilePage /></RoleRoute>} />

        {/* HR Module Routes */}
        <Route path="salary" element={<RoleRoute allowedRoles={['hr', 'admin']} moduleName="Staff Salaries"><StaffSalaryPage /></RoleRoute>} />
        <Route path="salaries" element={<RoleRoute allowedRoles={['hr', 'admin']} moduleName="Staff Salaries"><StaffSalaryPage /></RoleRoute>} />
        <Route path="payroll" element={<RoleRoute allowedRoles={['hr', 'admin']} moduleName="Payroll"><StaffSalaryPage /></RoleRoute>} />
        <Route path="hr/attendance" element={<RoleRoute allowedRoles={['hr', 'teacher', 'accountant', 'sports_incharge', 'admission_officer', 'admin']} moduleName="Staff Attendance"><TeacherAttendancePage /></RoleRoute>} />
        <Route path="hr/leave-balance" element={<RoleRoute allowedRoles={['hr', 'teacher', 'accountant', 'sports_incharge', 'admission_officer', 'admin']} moduleName="Leave Balance"><TeacherLeaveBalancePage /></RoleRoute>} />
        <Route path="hr/apply-leave" element={<RoleRoute allowedRoles={['hr', 'teacher', 'accountant', 'sports_incharge', 'admission_officer', 'admin']} moduleName="Apply for Leave"><TeacherApplyLeavePage /></RoleRoute>} />
        <Route path="hr/staff-attendance" element={<RoleRoute allowedRoles={['hr', 'admin']} moduleName="Staff Attendance"><StaffAttendancePage /></RoleRoute>} />
        <Route path="hr/staff-leaves" element={<RoleRoute allowedRoles={['hr', 'admin']} moduleName="Staff Leaves"><StaffLeavesPage /></RoleRoute>} />
        <Route path="hr/leaves" element={<RoleRoute allowedRoles={['hr', 'admin']} moduleName="Staff Leaves"><StaffLeavesPage /></RoleRoute>} />
        <Route path="school-events" element={<SchoolEventsPage />} />
        <Route path="hr/school-events" element={<SchoolEventsPage />} />
        <Route path="recruitment" element={<RoleRoute allowedRoles={['hr', 'admin']} moduleName="Recruitment"><Placeholder /></RoleRoute>} />
        <Route path="employees" element={<RoleRoute allowedRoles={['hr', 'admin']} moduleName="Employees"><Placeholder /></RoleRoute>} />

        {/* Principal Executive Desk & Admission Portal Dedicated Routes */}
        <Route path="principal/dashboard" element={<RoleRoute allowedRoles={['principal', 'admin', 'super_admin']} moduleName="Principal Executive Desk"><PrincipalDashboard /></RoleRoute>} />
        <Route path="principal/admissions" element={<RoleRoute allowedRoles={['principal', 'admin', 'super_admin']} moduleName="Student Admissions"><PrincipalAdmissionsPage /></RoleRoute>} />
        <Route path="admission/overview" element={<RoleRoute allowedRoles={['admission_officer', 'admin', 'principal', 'super_admin']} moduleName="Student Admissions"><AdminAdmissionPage /></RoleRoute>} />
        <Route path="admission/dashboard" element={<RoleRoute allowedRoles={['admission_officer', 'admin', 'principal', 'super_admin']} moduleName="Student Admissions"><AdminAdmissionPage /></RoleRoute>} />
        <Route path="admission-portal" element={<RoleRoute allowedRoles={['admission_officer', 'admin', 'principal', 'super_admin']} moduleName="Admission Portal"><AdminAdmissionPage /></RoleRoute>} />
        <Route path="admission/calendar" element={<RoleRoute allowedRoles={['admission_officer', 'admin', 'principal', 'super_admin']} moduleName="Interview Calendar"><AdmissionInterviewCalendarPage /></RoleRoute>} />
        <Route path="admission/inquiries" element={<RoleRoute allowedRoles={['admission_officer', 'admin', 'principal', 'super_admin']} moduleName="Student Admissions"><AdminAdmissionPage /></RoleRoute>} />
        <Route path="admission/documents" element={<RoleRoute allowedRoles={['admission_officer', 'admin', 'principal', 'super_admin']} moduleName="Student Admissions"><AdminAdmissionPage /></RoleRoute>} />
        <Route path="admission/interviews" element={<RoleRoute allowedRoles={['admission_officer', 'admin', 'principal', 'super_admin']} moduleName="Interview Calendar"><AdmissionInterviewCalendarPage /></RoleRoute>} />
        <Route path="admission/offers" element={<RoleRoute allowedRoles={['admission_officer', 'admin', 'principal', 'super_admin']} moduleName="Student Admissions"><AdminAdmissionPage /></RoleRoute>} />
        <Route path="admission/pipeline" element={<RoleRoute allowedRoles={['admission_officer', 'admin', 'principal', 'super_admin']} moduleName="Admission Pipeline"><AdminAdmissionPage /></RoleRoute>} />

        {/* Admin & Principal Operational Module Routes */}
        <Route path="manage-teachers" element={<RoleRoute allowedRoles={['admin', 'principal', 'super_admin']} moduleName="Manage Teachers"><ManageTeachersPage /></RoleRoute>} />
        <Route path="teachers" element={<RoleRoute allowedRoles={['admin', 'principal', 'super_admin']} moduleName="Teachers Directory"><ManageTeachersPage /></RoleRoute>} />
        <Route path="admin/fee-structure" element={<RoleRoute allowedRoles={['admin', 'principal', 'admission_officer', 'super_admin']} moduleName="Fee Structure"><AdminFeeStructurePage /></RoleRoute>} />
        <Route path="fee-structure" element={<RoleRoute allowedRoles={['admin', 'principal', 'admission_officer', 'super_admin']} moduleName="Fee Structure"><AdminFeeStructurePage /></RoleRoute>} />
        <Route path="admission" element={<RoleRoute allowedRoles={['admin', 'principal', 'admission_officer', 'super_admin']} moduleName="Admissions"><AdminAdmissionPage /></RoleRoute>} />
        <Route path="admissions" element={<RoleRoute allowedRoles={['admin', 'principal', 'admission_officer', 'super_admin']} moduleName="Admissions"><AdminAdmissionPage /></RoleRoute>} />
        <Route path="school-vehicles" element={<RoleRoute allowedRoles={['admin', 'principal', 'super_admin']} moduleName="School Vehicles"><AdminVehiclesPage /></RoleRoute>} />
        <Route path="school-resources" element={<RoleRoute allowedRoles={['admin', 'principal', 'super_admin']} moduleName="School Resources"><AdminResourcesPage /></RoleRoute>} />
        <Route path="admin/calendar" element={<RoleRoute allowedRoles={['admin', 'principal', 'admission_officer', 'super_admin']} moduleName="Calendar & Events"><AdminEventsCalendarPage /></RoleRoute>} />
        <Route path="admin/events" element={<RoleRoute allowedRoles={['admin', 'principal', 'admission_officer', 'super_admin']} moduleName="Calendar & Events"><AdminEventsCalendarPage /></RoleRoute>} />
        <Route path="subjects" element={<Placeholder />} />

        {/* Teacher & Staff Academic & Self Routes */}
        <Route path="teacher/resources" element={<RoleRoute allowedRoles={['teacher', 'admin']} moduleName="School Resources"><TeacherResourcesPage /></RoleRoute>} />
        <Route path="teacher/schedule" element={<RoleRoute allowedRoles={['teacher', 'admin']} moduleName="Today's Schedule"><TeacherTodaySchedulePage /></RoleRoute>} />
        <Route path="teacher/timetable" element={<RoleRoute allowedRoles={['teacher', 'admin']} moduleName="Create Timetable"><CreateTimetablePage /></RoleRoute>} />
        <Route path="teacher/student-attendance" element={<RoleRoute allowedRoles={['teacher', 'admin']} moduleName="Student Attendance"><ClassAttendancePage /></RoleRoute>} />
        <Route path="class-attendance" element={<RoleRoute allowedRoles={['teacher', 'admin']} moduleName="Class Attendance"><ClassAttendancePage /></RoleRoute>} />
        <Route path="teacher/attendance" element={<RoleRoute allowedRoles={['hr', 'teacher', 'admin']} moduleName="Staff Attendance"><TeacherAttendancePage /></RoleRoute>} />
        <Route path="teacher/leave-balance" element={<RoleRoute allowedRoles={['hr', 'teacher', 'admin']} moduleName="Leave Balance"><TeacherLeaveBalancePage /></RoleRoute>} />
        <Route path="teacher/apply-leave" element={<RoleRoute allowedRoles={['hr', 'teacher', 'admin']} moduleName="Apply Leave"><TeacherApplyLeavePage /></RoleRoute>} />
        <Route path="student-records" element={<RoleRoute allowedRoles={['teacher', 'admin']} moduleName="Student Records"><StudentRecordsPage /></RoleRoute>} />
        <Route path="scoresheet" element={<RoleRoute allowedRoles={['teacher', 'admin']} moduleName="Scoresheet Entry"><TeacherScoresheetPage /></RoleRoute>} />
        <Route path="my-hr" element={<Placeholder />} />
        <Route path="classes" element={<RoleRoute allowedRoles={['admin', 'principal', 'teacher', 'super_admin']} moduleName="Classes"><AdminStudentsPage /></RoleRoute>} />
        <Route path="academics" element={<Placeholder />} />
        <Route path="examinations" element={<RoleRoute allowedRoles={['admin', 'principal', 'super_admin']} moduleName="Examinations"><AdminExaminationsPage /></RoleRoute>} />
        <Route path="admin/communication" element={<RoleRoute allowedRoles={['admin', 'super_admin']} moduleName="Communication"><CommunicationHubPage /></RoleRoute>} />
        <Route path="messages" element={<Navigate to="/admin/communication" replace />} />
        <Route path="leave" element={<Placeholder />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="transport" element={<RoleRoute allowedRoles={['admin', 'principal', 'super_admin']} moduleName="Transport"><AdminVehiclesPage /></RoleRoute>} />
        <Route path="health" element={<Placeholder />} />
        <Route path="settings" element={<RoleRoute allowedRoles={['admin', 'principal', 'super_admin']} moduleName="School Settings"><SchoolSettingsPage /></RoleRoute>} />

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
