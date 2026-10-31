
import {
  LuLayoutDashboard,
  LuUser,
  LuUsers,
  LuGraduationCap,
  LuBookOpen,
  LuCalendarDays,
  LuClipboardList,
  LuSettings,
  LuBuilding2,
  LuUserCog,
  LuWallet,
  LuFileText,
  LuBell,
  LuMessageSquare,
  LuClock,
  LuShield,
  LuReceipt,
  LuAward,
  LuBus,
  LuRoute,
  LuBoxes,
  LuUserPlus,
  LuCalendarClock,
  LuBanknote,
  LuTimer,
  LuPresentation,
  LuMegaphone,
  LuFileSpreadsheet,
  LuTrendingUp,
  LuFolderDown,
  LuMessageSquareQuote,
  LuLayers,
  LuArrowRightLeft,
  LuCircleAlert,
  LuShieldCheck,
  LuStore,
  LuTrophy,
  LuSwords,
  LuMedal,
  LuActivity,
  LuMapPin,
} from 'react-icons/lu';

const navigation = {
  super_admin: [
    {
      label: 'Platform Overview',
      path: '/dashboard',
      icon: LuLayoutDashboard,
    },
    {
      label: 'SaaS Platform Control',
      type: 'group',
      icon: LuBuilding2,
      children: [
        { label: 'Manage Client Schools', path: '/super-admin/schools', icon: LuBuilding2 },
        { label: 'Subscriptions & MRR', path: '/super-admin/subscriptions', icon: LuWallet },
        { label: 'UDISE+ Compliance', path: '/udise', icon: LuShieldCheck },
      ],
    },
    {
      label: 'My Account',
      type: 'group',
      icon: LuUserCog,
      children: [
        { label: 'Platform Profile', path: '/profile', icon: LuUser },
      ],
    },
  ],

  admin: [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LuLayoutDashboard,
    },
    {
      label: 'Principal Executive View',
      path: '/principal/dashboard',
      icon: LuTrendingUp,
    },
    {
      label: 'Academic Management',
      type: 'group',
      icon: LuGraduationCap,
      children: [
        { label: 'Manage Teachers', path: '/manage-teachers', icon: LuUsers },
        { label: 'Students Directory', path: '/students', icon: LuGraduationCap },
        { label: 'Student Admissions', path: '/admission', icon: LuUserPlus },
        { label: 'Attendance Register', path: '/attendance', icon: LuClipboardList },
        { label: 'Student Report Cards', path: '/report-cards', icon: LuFileSpreadsheet },
        { label: 'Student Marksheets', path: '/marksheets', icon: LuAward },
        { label: 'UDISE+ Portal & DCF', path: '/udise', icon: LuShieldCheck },
        { label: 'School Timetable', path: '/timetable', icon: LuClock },
        { label: 'Examinations', path: '/examinations', icon: LuGraduationCap },
        { label: 'Academic Results', path: '/results', icon: LuAward },
        { label: 'Notice Board', path: '/notices', icon: LuBell },
      ],
    },
    {
      label: 'Library Management',
      type: 'group',
      icon: LuBookOpen,
      children: [
        { label: 'Books Catalog', path: '/library/books', icon: LuBookOpen },
        { label: 'Circulation Desk', path: '/library/circulation', icon: LuArrowRightLeft },
        { label: 'Overdue Tracker', path: '/library/overdue', icon: LuCircleAlert },
        { label: 'Digital E-Library', path: '/library/elibrary', icon: LuLayers },
        { label: 'School Resources', path: '/school-resources', icon: LuBoxes },
      ],
    },
    {
      label: 'Campus & Logistics',
      type: 'group',
      icon: LuBuilding2,
      children: [
        { label: 'School Vehicles', path: '/school-vehicles', icon: LuBus },
        { label: 'Bus Route Builder', path: '/bus-route-builder', icon: LuRoute },
        { label: 'Calendar & Events', path: '/admin/calendar', icon: LuCalendarDays },
      ],
    },
    {
      label: 'Finance & Accounts',
      type: 'group',
      icon: LuWallet,
      children: [
        { label: 'Fee Structure', path: '/admin/fee-structure', icon: LuReceipt },
        { label: 'Student Fees', path: '/accounts/fees', icon: LuBanknote },
        { label: 'School Expenses', path: '/accounts/expenses', icon: LuFileSpreadsheet },
        { label: 'Salary Disbursements', path: '/accounts/salary-disbursements', icon: LuWallet },
      ],
    },
    {
      label: 'HR & Staff Operations',
      type: 'group',
      icon: LuUserCog,
      children: [
        { label: 'Staff Salaries', path: '/salary', icon: LuBanknote },
        { label: 'Staff Attendance', path: '/hr/staff-attendance', icon: LuTimer },
        { label: 'Staff Leaves', path: '/hr/staff-leaves', icon: LuClipboardList },
        { label: 'Leave Types & Quotas', path: '/hr/leave-types', icon: LuSettings },
        { label: 'Faculty Trainings', path: '/hr/trainings', icon: LuPresentation },
        { label: 'School Events', path: '/school-events', icon: LuMegaphone },
      ],
    },
    {
      label: 'Additional Features',
      type: 'group',
      icon: LuSettings,
      children: [
        { label: 'Sports & Athletics', path: '/sports/activities', icon: LuTrophy },
        { label: 'Communication', path: '/admin/communication', icon: LuMessageSquare },
        { label: 'School Settings', path: '/settings', icon: LuSettings },
      ],
    },
    {
      label: 'My Account',
      type: 'group',
      icon: LuUser,
      children: [
        { label: 'Admin Profile', path: '/profile', icon: LuUser },
      ],
    },
  ],

  principal: [
    { label: 'Executive Dashboard', path: '/dashboard', icon: LuLayoutDashboard },
    { label: 'Manage Teachers', path: '/manage-teachers', icon: LuUsers },
    { label: 'Students Roster', path: '/students', icon: LuGraduationCap },
    { label: 'Attendance Health', path: '/attendance', icon: LuClipboardList },
    { label: 'Student Admissions', path: '/admission', icon: LuUserPlus },
    { label: 'Examinations', path: '/examinations', icon: LuGraduationCap },
    { label: 'Academic Results', path: '/results', icon: LuAward },
    { label: 'Fee Structures', path: '/admin/fee-structure', icon: LuReceipt },
    { label: 'School Vehicles', path: '/school-vehicles', icon: LuBus },
    { label: 'School Resources', path: '/school-resources', icon: LuBoxes },
    { label: 'Calendar & Events', path: '/admin/calendar', icon: LuCalendarDays },
    { label: 'School Settings', path: '/settings', icon: LuSettings },
    { label: 'My Profile', path: '/profile', icon: LuUser },
  ],

  admission_officer: [
    {
      label: 'Admissions Desk',
      type: 'group',
      icon: LuUserPlus,
      children: [
        { label: 'Student Admissions', path: '/admission', icon: LuUserPlus },
        { label: 'Class Fees & Structure', path: '/admin/fee-structure', icon: LuBoxes },
        { label: 'Interview Calendar', path: '/admission/calendar', icon: LuCalendarDays },
      ],
    },
    {
      label: 'Employee (Self)',
      type: 'group',
      icon: LuUserCog,
      children: [
        { label: 'My Attendance', path: '/hr/attendance', icon: LuTimer },
        { label: 'Leave Balance', path: '/hr/leave-balance', icon: LuFileText },
        { label: 'Apply for Leave', path: '/hr/apply-leave', icon: LuClipboardList },
        { label: 'My Profile', path: '/profile', icon: LuUser },
      ],
    },
  ],

  teacher: [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LuLayoutDashboard,
    },
    {
      label: 'Academic Classroom',
      type: 'group',
      icon: LuGraduationCap,
      children: [
        { label: "Today's Schedule", path: '/teacher/schedule', icon: LuCalendarClock },
        { label: 'Student Attendance', path: '/teacher/student-attendance', icon: LuClipboardList },
        { label: 'Student Records', path: '/student-records', icon: LuGraduationCap },
        { label: 'Student Report Cards', path: '/report-cards', icon: LuFileSpreadsheet },
        { label: 'Student Marksheets', path: '/marksheets', icon: LuAward },
        { label: 'Assignments & Homework', path: '/assignments', icon: LuClipboardList },
        { label: 'Syllabus & Curriculum', path: '/syllabus', icon: LuBookOpen },
        { label: 'Create Timetable', path: '/teacher/timetable', icon: LuClock },
        { label: 'School Resources', path: '/teacher/resources', icon: LuBoxes },
        { label: 'Books Catalog', path: '/library/books', icon: LuBookOpen },
        { label: 'Digital E-Library', path: '/library/elibrary', icon: LuLayers },
        { label: 'School Calendar', path: '/calendar', icon: LuCalendarDays },
        { label: 'Notice Board', path: '/notices', icon: LuBell },
        { label: 'Scoresheet Entry', path: '/scoresheet', icon: LuFileSpreadsheet },
        { label: 'Class Results', path: '/results', icon: LuAward },
      ],
    },
    {
      label: 'Employee (Self)',
      type: 'group',
      icon: LuUserCog,
      children: [
        { label: 'My Attendance', path: '/teacher/attendance', icon: LuTimer },
        { label: 'Leave Balance', path: '/teacher/leave-balance', icon: LuFileText },
        { label: 'Apply for Leave', path: '/teacher/apply-leave', icon: LuClipboardList },
        { label: 'Trainings & Workshops', path: '/teacher/trainings', icon: LuPresentation },
        { label: 'My Profile', path: '/profile', icon: LuUser },
      ],
    },
  ],

  student_parent: [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LuLayoutDashboard,
    },
    {
      label: 'Academics & Learning',
      type: 'group',
      icon: LuGraduationCap,
      children: [
        { label: 'Attendance', path: '/attendance', icon: LuClipboardList },
        { label: 'Report Cards', path: '/report-cards', icon: LuFileSpreadsheet },
        { label: 'Student Marksheets', path: '/marksheets', icon: LuAward },
        { label: 'Exam Results', path: '/results', icon: LuAward },
        { label: 'Class Timetable', path: '/timetable', icon: LuClock },
        { label: 'Assignments & Homework', path: '/assignment', icon: LuClipboardList },
        { label: 'Syllabus Progress', path: '/syllabus', icon: LuBookOpen },
        { label: 'Study Material', path: '/study-material', icon: LuFolderDown },
        { label: 'Digital E-Library', path: '/library/elibrary', icon: LuLayers },
      ],
    },
    {
      label: 'Campus & Finance',
      type: 'group',
      icon: LuBuilding2,
      children: [
        { label: 'School Fees & Dues', path: '/fees', icon: LuReceipt },
        { label: 'School Calendar', path: '/calendar', icon: LuCalendarDays },
        { label: 'Notices & Circulars', path: '/notices', icon: LuBell },
        { label: 'PTM Meetings', path: '/ptm', icon: LuUsers },
        { label: 'Parent Feedback', path: '/feedback', icon: LuMessageSquareQuote },
      ],
    },
    {
      label: 'My Account',
      type: 'group',
      icon: LuUser,
      children: [
        { label: 'Student Profile', path: '/profile', icon: LuUser },
      ],
    },
  ],

  hr: [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LuLayoutDashboard,
    },
    {
      label: 'HR Operations',
      type: 'group',
      icon: LuUsers,
      children: [
        { label: 'Staff Salary', path: '/salary', icon: LuBanknote },
        { label: 'Staff Attendance', path: '/hr/staff-attendance', icon: LuTimer },
        { label: 'Staff Leaves', path: '/hr/staff-leaves', icon: LuClipboardList },
        { label: 'Leave Types & Quotas', path: '/hr/leave-types', icon: LuSettings },
        { label: 'Trainings', path: '/trainings', icon: LuPresentation },
        { label: 'School Events', path: '/school-events', icon: LuMegaphone },
        { label: 'Notice Board', path: '/notices', icon: LuBell },
      ],
    },
    {
      label: 'Employee (Self)',
      type: 'group',
      icon: LuUserCog,
      children: [
        { label: 'My Attendance', path: '/hr/attendance', icon: LuTimer },
        { label: 'Leave Balance', path: '/hr/leave-balance', icon: LuFileText },
        { label: 'Apply for Leave', path: '/hr/apply-leave', icon: LuClipboardList },
        { label: 'My Profile', path: '/hr/profile', icon: LuUser },
      ],
    },
  ],

  accountant: [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LuLayoutDashboard,
    },
    {
      label: 'Accounts & Finance',
      type: 'group',
      icon: LuWallet,
      children: [
        { label: 'Student Fees', path: '/accounts/fees', icon: LuReceipt },
        { label: 'School Expenses', path: '/accounts/expenses', icon: LuFileSpreadsheet },
        { label: 'Salary Disbursements', path: '/accounts/salary-disbursements', icon: LuBanknote },
        { label: 'Vendors & Purchases', path: '/accounts/vendors', icon: LuStore },
      ],
    },
    {
      label: 'Campus & Calendar',
      type: 'group',
      icon: LuCalendarDays,
      children: [
        { label: 'School Calendar', path: '/calendar', icon: LuCalendarDays },
        { label: 'Notice Board', path: '/notices', icon: LuBell },
      ],
    },
    {
      label: 'Employee (Self)',
      type: 'group',
      icon: LuUserCog,
      children: [
        { label: 'My Attendance', path: '/hr/attendance', icon: LuTimer },
        { label: 'Leave Balance', path: '/hr/leave-balance', icon: LuFileText },
        { label: 'Apply for Leave', path: '/hr/apply-leave', icon: LuClipboardList },
        { label: 'My Profile', path: '/profile', icon: LuUser },
      ],
    },
  ],

  librarian: [
    {
      label: 'Library Dashboard',
      path: '/dashboard',
      icon: LuLayoutDashboard,
    },
    {
      label: 'Library Operations',
      type: 'group',
      icon: LuBookOpen,
      children: [
        { label: 'Books Catalog', path: '/library/books', icon: LuBookOpen },
        { label: 'Circulation Desk', path: '/library/circulation', icon: LuArrowRightLeft },
        { label: 'Overdue Tracker', path: '/library/overdue', icon: LuCircleAlert },
        { label: 'Digital E-Library', path: '/library/elibrary', icon: LuLayers },
        { label: 'School Resources', path: '/school-resources', icon: LuBoxes },
      ],
    },
    {
      label: 'Campus & Notices',
      type: 'group',
      icon: LuCalendarDays,
      children: [
        { label: 'School Calendar', path: '/calendar', icon: LuCalendarDays },
        { label: 'Notice Board', path: '/notices', icon: LuBell },
      ],
    },
    {
      label: 'Employee (Self)',
      type: 'group',
      icon: LuUserCog,
      children: [
        { label: 'My Attendance', path: '/hr/attendance', icon: LuTimer },
        { label: 'Leave Balance', path: '/hr/leave-balance', icon: LuFileText },
        { label: 'Apply for Leave', path: '/hr/apply-leave', icon: LuClipboardList },
        { label: 'My Profile', path: '/profile', icon: LuUser },
      ],
    },
  ],

  sports_incharge: [
    {
      label: 'Sports Operations',
      type: 'group',
      icon: LuTrophy,
      children: [
        { label: 'Dashboard', path: '/dashboard', icon: LuLayoutDashboard },
        { label: 'Sports & Competitions', path: '/sports/activities', icon: LuSwords },
        { label: 'Student Attendees & Roster', path: '/sports/participants', icon: LuUsers },
        { label: 'Practice & Schedules', path: '/sports/schedules', icon: LuClock },
        { label: 'Grounds & Facilities', path: '/sports/facilities', icon: LuMapPin },
        { label: 'Equipment & Inventory', path: '/sports/inventory', icon: LuBoxes },
        { label: 'Fitness & Assessments', path: '/sports/fitness', icon: LuActivity },
        { label: 'Hall of Fame & Medals', path: '/sports/achievements', icon: LuMedal },
      ],
    },
    {
      label: 'Employee (Self)',
      type: 'group',
      icon: LuUserCog,
      children: [
        { label: 'My Attendance', path: '/hr/attendance', icon: LuTimer },
        { label: 'Leave Balance', path: '/hr/leave-balance', icon: LuFileText },
        { label: 'Apply for Leave', path: '/hr/apply-leave', icon: LuClipboardList },
        { label: 'My Profile', path: '/sports/profile', icon: LuUser },
      ],
    },
  ],
};

export default navigation;
