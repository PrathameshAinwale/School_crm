import {
  LuLayoutDashboard,
  LuUser,
  LuUsers,
  LuGraduationCap,
  LuBookOpen,
  LuCalendarDays,
  LuClipboardList,
  LuSettings,
  LuChartBar,
  LuBuilding2,
  LuUserCog,
  LuWallet,
  LuFileText,
  LuBell,
  LuMessageSquare,
  LuClock,
  LuTruck,
  LuShield,
  LuReceipt,
  LuPhoneCall,
  LuGlobe,
  LuFolderLock,
  LuHeart,
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
  LuScale,
  LuFileSpreadsheet,
  LuTrendingUp,
  LuFolderDown,
  LuMessageSquareQuote,
  LuCalendarCheck,
  LuLayers,
  LuArrowRightLeft,
  LuCircleAlert,
  LuShieldCheck,
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
      label: 'My Account',
      type: 'group',
      icon: LuUser,
      children: [
        { label: 'Admin Profile', path: '/profile', icon: LuUser },
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
};

export default navigation;
