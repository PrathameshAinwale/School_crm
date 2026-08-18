import React, { useState, useEffect } from 'react';
import {
  LuUsers,
  LuUserPlus,
  LuSearch,
  LuFilter,
  LuDownload,
  LuEye,
  LuPencil,
  LuTrash2,
  LuPhone,
  LuMail,
  LuMapPin,
  LuGraduationCap,
  LuBookOpen,
  LuCalendar,
  LuAward,
  LuShieldAlert,
  LuCircleCheck,
  LuCircleAlert,
  LuCircleX,
  LuClock,
  LuFileSpreadsheet,
  LuX,
  LuCheck,
  LuBriefcase,
  LuBuilding2,
  LuDollarSign,
  LuChevronDown,
  LuLayoutGrid,
  LuList,
  LuIdCard,
} from 'react-icons/lu';

// Initial realistic staff dataset
const INITIAL_STAFF = [
  {
    id: 'TCH-101',
    name: 'Dr. Ananya Sen',
    role: 'Senior PGT Mathematics & HOD',
    category: 'Teaching',
    dept: 'Mathematics',
    subject: 'Pure Mathematics, Calculus',
    classes: 'Class X-A, XII-A, XII-B',
    isClassTeacher: 'Class XII-A',
    email: 'ananya.sen@eduflow.edu',
    phone: '+91 98112 40101',
    altPhone: '+91 98112 40199',
    emergencyContact: 'Mr. Debashish Sen (Spouse) - +91 98112 40100',
    address: 'B-402, Pinecrest Residency, Rohini Sector 14, New Delhi',
    dob: '14 May 1984',
    bloodGroup: 'O+ve',
    joiningDate: '12 Jul 2017',
    experience: '16 Years',
    qualifications: 'Ph.D. in Applied Mathematics (DU), M.Sc, B.Ed (Gold Medalist)',
    employmentType: 'Permanent / Full-Time',
    payGrade: 'Level 11 (Senior Faculty Scale)',
    salaryGross: '₹82,000 / mo',
    salaryNet: '₹74,500 / mo',
    bankAccount: 'HDFC Bank ••••••4812',
    pfNo: 'PF-DL-2017-8891',
    shift: '07:45 AM – 03:45 PM',
    status: 'Active',
    attendanceRate: 98.4,
    leaveBalance: '14/20 Days',
    syllabusProgress: 82,
    rating: 4.9,
    reviewsCount: 142,
    bio: 'Specialist in Senior Secondary Calculus and Competitive Math Olympiad mentoring with 100% board pass track record.',
  },
  {
    id: 'TCH-102',
    name: 'Mr. Vikram Rathore',
    role: 'PGT Physics & Robotics Mentor',
    category: 'Teaching',
    dept: 'Science',
    subject: 'Physics, Ray Optics, Quantum Mechanics',
    classes: 'Class XI-A, XII-A, XII-B',
    isClassTeacher: 'Class XI-A',
    email: 'vikram.r@eduflow.edu',
    phone: '+91 98112 40102',
    altPhone: '+91 98112 40198',
    emergencyContact: 'Mrs. Sunita Rathore (Spouse) - +91 98112 40109',
    address: 'C-12, Greenfield Heights, Pitampura, New Delhi',
    dob: '22 Aug 1987',
    bloodGroup: 'B+ve',
    joiningDate: '01 Sep 2019',
    experience: '12 Years',
    qualifications: 'M.Sc Physics (IIT Delhi), B.Ed, Certified STEM Educator',
    employmentType: 'Permanent / Full-Time',
    payGrade: 'Level 10 (Senior Scale)',
    salaryGross: '₹76,000 / mo',
    salaryNet: '₹68,800 / mo',
    bankAccount: 'SBI Bank ••••••9031',
    pfNo: 'PF-DL-2019-4412',
    shift: '07:45 AM – 03:45 PM',
    status: 'Active',
    attendanceRate: 96.8,
    leaveBalance: '16/20 Days',
    syllabusProgress: 76,
    rating: 4.8,
    reviewsCount: 128,
    bio: 'Lead mentor for CBSE Science Innovation Challenge and Physics Lab Practical Coordinator.',
  },
  {
    id: 'TCH-103',
    name: 'Ms. Sunita Rao',
    role: 'TGT English & Literature In-Charge',
    category: 'Teaching',
    dept: 'Languages',
    subject: 'English Core & Communicative',
    classes: 'Class IX-B, X-B',
    isClassTeacher: 'Class IX-B',
    email: 'sunita.rao@eduflow.edu',
    phone: '+91 98112 40103',
    altPhone: '+91 98112 40197',
    emergencyContact: 'Mr. V. K. Rao (Father) - +91 98112 40188',
    address: 'Flat 104, Maple Woods, Janakpuri, New Delhi',
    dob: '05 Jan 1991',
    bloodGroup: 'A+ve',
    joiningDate: '10 Feb 2021',
    experience: '8 Years',
    qualifications: 'M.A. English Literature (JNU), B.Ed, CELTA Certified',
    employmentType: 'Permanent / Full-Time',
    payGrade: 'Level 9',
    salaryGross: '₹62,000 / mo',
    salaryNet: '₹56,200 / mo',
    bankAccount: 'ICICI Bank ••••••3319',
    pfNo: 'PF-DL-2021-9920',
    shift: '07:45 AM – 03:45 PM',
    status: 'On Leave',
    attendanceRate: 94.2,
    leaveBalance: '8/20 Days',
    syllabusProgress: 85,
    rating: 4.7,
    reviewsCount: 96,
    bio: 'Organizes school debates, annual elocutions, and literary club publications.',
  },
  {
    id: 'TCH-104',
    name: 'Mr. Rajesh Mehra',
    role: 'PGT Chemistry & Lab Coordinator',
    category: 'Teaching',
    dept: 'Science',
    subject: 'Organic & Inorganic Chemistry',
    classes: 'Class X-B, XI-B, XII-A',
    isClassTeacher: 'Class X-B',
    email: 'rajesh.mehra@eduflow.edu',
    phone: '+91 98112 40104',
    altPhone: '+91 98112 40196',
    emergencyContact: 'Mrs. Kavita Mehra (Spouse) - +91 98112 40177',
    address: 'E-88, Vasant Kunj, New Delhi',
    dob: '18 Nov 1982',
    bloodGroup: 'AB+ve',
    joiningDate: '15 Jul 2016',
    experience: '17 Years',
    qualifications: 'M.Sc Chemistry, M.Phil, B.Ed',
    employmentType: 'Permanent / Full-Time',
    payGrade: 'Level 11',
    salaryGross: '₹80,500 / mo',
    salaryNet: '₹73,000 / mo',
    bankAccount: 'Axis Bank ••••••7742',
    pfNo: 'PF-DL-2016-1029',
    shift: '07:45 AM – 03:45 PM',
    status: 'Active',
    attendanceRate: 97.5,
    leaveBalance: '15/20 Days',
    syllabusProgress: 78,
    rating: 4.85,
    reviewsCount: 110,
    bio: 'Chemistry department lead with focus on safety protocols and experimental chemistry kits.',
  },
  {
    id: 'TCH-105',
    name: 'Mrs. Deepa Krishnan',
    role: 'Head of Computer Science & AI',
    category: 'Teaching',
    dept: 'IT & CS',
    subject: 'Computer Science, Python, AI & ML',
    classes: 'Class VIII-A, IX-A, XI-A, XII-A',
    isClassTeacher: 'Class XII-B',
    email: 'deepa.k@eduflow.edu',
    phone: '+91 98112 40105',
    altPhone: '+91 98112 40195',
    emergencyContact: 'Mr. R. Krishnan (Spouse) - +91 98112 40166',
    address: 'Tower 4, Apt 901, Cyber Heights, Gurugram',
    dob: '30 Oct 1989',
    bloodGroup: 'B+ve',
    joiningDate: '01 Jun 2020',
    experience: '10 Years',
    qualifications: 'M.Tech in Computer Science (NIT), B.Ed',
    employmentType: 'Permanent / Full-Time',
    payGrade: 'Level 10',
    salaryGross: '₹78,000 / mo',
    salaryNet: '₹70,400 / mo',
    bankAccount: 'HDFC Bank ••••••5512',
    pfNo: 'PF-DL-2020-6621',
    shift: '07:45 AM – 03:45 PM',
    status: 'Active',
    attendanceRate: 99.1,
    leaveBalance: '19/20 Days',
    syllabusProgress: 88,
    rating: 4.95,
    reviewsCount: 154,
    bio: 'Mentor for Cyber Olympiad, AI Tinkering Club, and Web Technologies curriculum.',
  },
  {
    id: 'TCH-106',
    name: 'Mr. Manoj Joshi',
    role: 'TGT Social Sciences & Civics',
    category: 'Teaching',
    dept: 'Social Sciences',
    subject: 'History, Civics, Geography',
    classes: 'Class VII-A, VIII-B, IX-A',
    isClassTeacher: 'Class VII-A',
    email: 'manoj.joshi@eduflow.edu',
    phone: '+91 98112 40106',
    altPhone: '+91 98112 40194',
    emergencyContact: 'Mrs. Rekha Joshi (Spouse) - +91 98112 40155',
    address: 'D-33, Ashok Vihar Phase 2, New Delhi',
    dob: '12 Mar 1986',
    bloodGroup: 'O-ve',
    joiningDate: '15 Jan 2018',
    experience: '14 Years',
    qualifications: 'M.A. History, B.Ed',
    employmentType: 'Permanent / Full-Time',
    payGrade: 'Level 9',
    salaryGross: '₹64,000 / mo',
    salaryNet: '₹58,000 / mo',
    bankAccount: 'PNB Bank ••••••1194',
    pfNo: 'PF-DL-2018-3382',
    shift: '07:45 AM – 03:45 PM',
    status: 'Suspended',
    attendanceRate: 84.0,
    leaveBalance: '4/20 Days',
    syllabusProgress: 62,
    rating: 3.8,
    reviewsCount: 65,
    bio: 'Under disciplinary inquiry regarding curriculum compliance and student attendance record discrepancies.',
  },
  {
    id: 'TCH-107',
    name: 'Mrs. Kavita Saxena',
    role: 'PRT Primary Educator & Arts Head',
    category: 'Teaching',
    dept: 'Primary Wing',
    subject: 'Environmental Science, Art & Craft',
    classes: 'Class III-A, IV-B',
    isClassTeacher: 'Class III-A',
    email: 'kavita.s@eduflow.edu',
    phone: '+91 98112 40107',
    altPhone: '+91 98112 40193',
    emergencyContact: 'Mr. Arvind Saxena (Spouse) - +91 98112 40144',
    address: 'Flat 202, Palm Greens, Paschim Vihar, New Delhi',
    dob: '09 Sep 1993',
    bloodGroup: 'A+ve',
    joiningDate: '01 Aug 2022',
    experience: '6 Years',
    qualifications: 'B.El.Ed, B.Ed, Diploma in Fine Arts',
    employmentType: 'Permanent / Full-Time',
    payGrade: 'Level 8',
    salaryGross: '₹52,000 / mo',
    salaryNet: '₹47,100 / mo',
    bankAccount: 'Kotak Bank ••••••8821',
    pfNo: 'PF-DL-2022-7719',
    shift: '07:45 AM – 02:45 PM',
    status: 'Active',
    attendanceRate: 95.5,
    leaveBalance: '12/20 Days',
    syllabusProgress: 80,
    rating: 4.8,
    reviewsCount: 88,
    bio: 'Primary wing activity coordinator, expert in early childhood development and experiential learning.',
  },
  {
    id: 'TCH-108',
    name: 'Mr. Alok Verma',
    role: 'TGT Hindi & Sanskrit Faculty',
    category: 'Teaching',
    dept: 'Languages',
    subject: 'Hindi Literature & Sanskrit Grammar',
    classes: 'Class VI-A, VII-B, VIII-A',
    isClassTeacher: 'Class VI-A',
    email: 'alok.verma@eduflow.edu',
    phone: '+91 98112 40108',
    altPhone: '+91 98112 40192',
    emergencyContact: 'Mrs. Maya Verma (Mother) - +91 98112 40133',
    address: 'H-14, Model Town Phase 1, Delhi',
    dob: '19 Jul 1990',
    bloodGroup: 'B-ve',
    joiningDate: '10 Nov 2020',
    experience: '9 Years',
    qualifications: 'M.A. Hindi, Acharya (Sanskrit), B.Ed',
    employmentType: 'Permanent / Full-Time',
    payGrade: 'Level 9',
    salaryGross: '₹59,000 / mo',
    salaryNet: '₹53,500 / mo',
    bankAccount: 'SBI Bank ••••••6630',
    pfNo: 'PF-DL-2020-8812',
    shift: '07:45 AM – 03:45 PM',
    status: 'Active',
    attendanceRate: 97.2,
    leaveBalance: '16/20 Days',
    syllabusProgress: 79,
    rating: 4.65,
    reviewsCount: 74,
    bio: 'Secretary of the Hindi Literary Society and annual Sanskrit Shloka recitation judge.',
  },
  {
    id: 'EMP-201',
    name: 'Mr. Rajesh Sharma',
    role: 'Chief Administrative Officer (CAO)',
    category: 'Administration',
    dept: 'Administration',
    subject: 'Institutional Operations & Compliance',
    classes: 'N/A (Administrative)',
    isClassTeacher: 'None',
    email: 'rajesh.admin@eduflow.edu',
    phone: '+91 98112 40201',
    altPhone: '+91 98112 40299',
    emergencyContact: 'Mrs. Geeta Sharma (Spouse) - +91 98112 40200',
    address: 'Villa 18, Gulmohar Enclave, South Extension, New Delhi',
    dob: '04 Apr 1978',
    bloodGroup: 'O+ve',
    joiningDate: '01 Apr 2015',
    experience: '22 Years',
    qualifications: 'MBA (Public Administration), LL.B',
    employmentType: 'Permanent / Full-Time',
    payGrade: 'Executive Scale 1',
    salaryGross: '₹1,15,000 / mo',
    salaryNet: '₹1,02,000 / mo',
    bankAccount: 'Standard Chartered ••••••1002',
    pfNo: 'PF-DL-2015-0012',
    shift: '08:00 AM – 05:00 PM',
    status: 'Active',
    attendanceRate: 99.0,
    leaveBalance: '21/25 Days',
    syllabusProgress: 100,
    rating: 4.9,
    reviewsCount: 40,
    bio: 'Oversees campus administration, board affiliations, regulatory compliance, and security infrastructure.',
  },
  {
    id: 'EMP-202',
    name: 'Ms. Priya Verma',
    role: 'Senior Accounts & Finance Officer',
    category: 'Administration',
    dept: 'Finance & Accounts',
    subject: 'Fee Realization & Payroll',
    classes: 'N/A (Finance)',
    isClassTeacher: 'None',
    email: 'priya.accounts@eduflow.edu',
    phone: '+91 98112 40202',
    altPhone: '+91 98112 40298',
    emergencyContact: 'Mr. S. K. Verma (Father) - +91 98112 40288',
    address: 'Flat 502, Skyview Towers, Dwarka Sec 10, New Delhi',
    dob: '15 Dec 1992',
    bloodGroup: 'AB+ve',
    joiningDate: '01 Aug 2021',
    experience: '8 Years',
    qualifications: 'Chartered Accountant (Inter), M.Com',
    employmentType: 'Permanent / Full-Time',
    payGrade: 'Level 10',
    salaryGross: '₹68,000 / mo',
    salaryNet: '₹61,500 / mo',
    bankAccount: 'HDFC Bank ••••••9142',
    pfNo: 'PF-DL-2021-3310',
    shift: '08:15 AM – 04:45 PM',
    status: 'Active',
    attendanceRate: 96.5,
    leaveBalance: '15/20 Days',
    syllabusProgress: 100,
    rating: 4.75,
    reviewsCount: 30,
    bio: 'Manages school fee realization systems, institutional vendor disbursements, and PF/tax compliances.',
  },
  {
    id: 'EMP-203',
    name: 'Mr. Harish Chandra',
    role: 'Fleet Manager & Transport Head',
    category: 'Support Staff',
    dept: 'Transport & Fleet',
    subject: 'Fleet Routing, GPS & Safety',
    classes: 'N/A (Fleet Operations)',
    isClassTeacher: 'None',
    email: 'harish.fleet@eduflow.edu',
    phone: '+91 98112 40203',
    altPhone: '+91 98112 40297',
    emergencyContact: 'Mr. Sunil Chandra (Brother) - +91 98112 40277',
    address: 'Qtr 8, School Staff Quarters, Campus North',
    dob: '28 Feb 1980',
    bloodGroup: 'B+ve',
    joiningDate: '15 Mar 2017',
    experience: '18 Years',
    qualifications: 'Automotive Diploma, Heavy Motor Vehicle Certification',
    employmentType: 'Permanent / Full-Time',
    payGrade: 'Level 7',
    salaryGross: '₹48,000 / mo',
    salaryNet: '₹43,800 / mo',
    bankAccount: 'SBI Bank ••••••4409',
    pfNo: 'PF-DL-2017-5591',
    shift: '06:30 AM – 05:30 PM',
    status: 'Active',
    attendanceRate: 99.4,
    leaveBalance: '18/20 Days',
    syllabusProgress: 100,
    rating: 4.9,
    reviewsCount: 82,
    bio: 'Oversees 24 school transit vehicles, speed governors, CCTV feeds, and student pick/drop rosters.',
  },
  {
    id: 'EMP-204',
    name: 'Ms. Neha Kulkarni',
    role: 'Head Nurse & Health Counselor',
    category: 'Support Staff',
    dept: 'Medical & Infirmary',
    subject: 'Student First Aid & Health Care',
    classes: 'N/A (Medical)',
    isClassTeacher: 'None',
    email: 'health.neha@eduflow.edu',
    phone: '+91 98112 40204',
    altPhone: '+91 98112 40296',
    emergencyContact: 'Dr. Anand Kulkarni (Spouse) - +91 98112 40266',
    address: 'Sector 6, Plot 14, Dwarka, New Delhi',
    dob: '11 Jul 1990',
    bloodGroup: 'O+ve',
    joiningDate: '01 Oct 2021',
    experience: '9 Years',
    qualifications: 'B.Sc Nursing, Certified Pediatric Life Support (PALS)',
    employmentType: 'Permanent / Full-Time',
    payGrade: 'Level 8',
    salaryGross: '₹54,000 / mo',
    salaryNet: '₹49,000 / mo',
    bankAccount: 'ICICI Bank ••••••2281',
    pfNo: 'PF-DL-2021-8840',
    shift: '07:45 AM – 04:00 PM',
    status: 'Active',
    attendanceRate: 97.0,
    leaveBalance: '14/20 Days',
    syllabusProgress: 100,
    rating: 4.85,
    reviewsCount: 50,
    bio: 'Manages school medical infirmary, emergency SOS protocols, and annual student health screenings.',
  },
  {
    id: 'EMP-205',
    name: 'Mr. Suresh Kumar',
    role: 'TGT Physical Education & Athletics Coach',
    category: 'Teaching',
    dept: 'Sports & PE',
    subject: 'Athletics, Football, Yoga',
    classes: 'Class VI to XII Sports',
    isClassTeacher: 'None',
    email: 'suresh.k@eduflow.edu',
    phone: '+91 98112 40205',
    altPhone: '+91 98112 40295',
    emergencyContact: 'Mrs. Usha Kumar (Spouse) - +91 98112 40255',
    address: 'B-10, Rajouri Garden, New Delhi',
    dob: '02 Jun 1985',
    bloodGroup: 'A-ve',
    joiningDate: '01 Jul 2019',
    experience: '13 Years',
    qualifications: 'M.P.Ed, NIS Certified Coach (Athletics)',
    employmentType: 'Permanent / Full-Time',
    payGrade: 'Level 9',
    salaryGross: '₹60,000 / mo',
    salaryNet: '₹54,200 / mo',
    bankAccount: 'Bank of Baroda ••••••7102',
    pfNo: 'PF-DL-2019-1192',
    shift: '07:30 AM – 04:00 PM',
    status: 'Inactive',
    attendanceRate: 72.0,
    leaveBalance: '0/20 Days',
    syllabusProgress: 50,
    rating: 4.1,
    reviewsCount: 45,
    bio: 'Currently on unpaid medical sabbatical due to knee surgery. Records placed in Inactive status.',
  },
  {
    id: 'EMP-206',
    name: 'Mr. Arvind Trivedi',
    role: 'Former PGT Commerce & Economics',
    category: 'Teaching',
    dept: 'Commerce',
    subject: 'Accountancy & Macroeconomics',
    classes: 'Class XI-C, XII-C',
    isClassTeacher: 'Former Class XII-C',
    email: 'arvind.trivedi.archived@eduflow.edu',
    phone: '+91 98112 40206',
    altPhone: '+91 98112 40294',
    emergencyContact: 'Mrs. Shashi Trivedi - +91 98112 40244',
    address: 'K-90, Greater Kailash 1, New Delhi',
    dob: '15 Aug 1974',
    bloodGroup: 'O+ve',
    joiningDate: '10 Jul 2014',
    experience: '20 Years',
    qualifications: 'M.Com, M.Ed, UGC NET',
    employmentType: 'Resigned / Relieved',
    payGrade: 'Level 11',
    salaryGross: '₹84,000 / mo',
    salaryNet: '₹76,000 / mo',
    bankAccount: 'HDFC Bank ••••••8830',
    pfNo: 'PF-DL-2014-9912',
    shift: 'Relieved on 31 May 2026',
    status: 'Left',
    attendanceRate: 92.0,
    leaveBalance: '0/0 Days',
    syllabusProgress: 100,
    rating: 4.7,
    reviewsCount: 90,
    bio: 'Resigned due to relocation abroad. Full settlement and clearance certificate issued on 31 May 2026.',
  },
];

export default function ManageTeachersPage() {
  const [staffList, setStaffList] = useState(() => {
    const saved = localStorage.getItem('eduflow_admin_staff_list');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [viewMode, setViewMode] = useState('table');

  // Modals state
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deleteTargetStaff, setDeleteTargetStaff] = useState(null);
  const [deleteReason, setDeleteReason] = useState('Left');
  const [toastMessage, setToastMessage] = useState(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('eduflow_admin_staff_list', JSON.stringify(staffList));
  }, [staffList]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered staff
  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.phone.includes(searchQuery);

    const matchesDept = selectedDept === 'ALL' || staff.dept === selectedDept;
    const matchesCategory = selectedCategory === 'ALL' || staff.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || staff.status === selectedStatus;

    return matchesSearch && matchesDept && matchesCategory && matchesStatus;
  });

  // KPI Calculations
  const totalStaffCount = staffList.length;
  const teachingCount = staffList.filter((s) => s.category === 'Teaching').length;
  const adminSupportCount = staffList.filter((s) => s.category !== 'Teaching').length;
  const activeCount = staffList.filter((s) => s.status === 'Active').length;
  const onLeaveCount = staffList.filter((s) => s.status === 'On Leave').length;
  const inactiveSuspendedLeftCount = staffList.filter((s) =>
    ['Inactive', 'Suspended', 'Left'].includes(s.status)
  ).length;

  const departments = ['ALL', ...Array.from(new Set(staffList.map((s) => s.dept)))];

  const handleStatusChange = (staffId, newStatus) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, status: newStatus } : s))
    );
    if (selectedStaff && selectedStaff.id === staffId) {
      setSelectedStaff((prev) => ({ ...prev, status: newStatus }));
    }
    showToast(`Status updated to "${newStatus}" for ${staffId}`);
  };

  const handleAddStaff = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newStaff = {
      id: formData.get('id') || `TCH-${Math.floor(100 + Math.random() * 900)}`,
      name: formData.get('name'),
      role: formData.get('role'),
      category: formData.get('category') || 'Teaching',
      dept: formData.get('dept') || 'Mathematics',
      subject: formData.get('subject') || 'General Curriculum',
      classes: formData.get('classes') || 'Class IX-A, X-A',
      isClassTeacher: formData.get('isClassTeacher') || 'None',
      email: formData.get('email'),
      phone: formData.get('phone'),
      altPhone: formData.get('altPhone') || '-',
      emergencyContact: formData.get('emergencyContact') || 'Parent / Relative',
      address: formData.get('address') || 'Campus Residential Colony, New Delhi',
      dob: formData.get('dob') || '15 Aug 1990',
      bloodGroup: formData.get('bloodGroup') || 'B+ve',
      joiningDate: formData.get('joiningDate') || new Date().toISOString().split('T')[0],
      experience: formData.get('experience') || '5 Years',
      qualifications: formData.get('qualifications') || 'M.Sc, B.Ed',
      employmentType: formData.get('employmentType') || 'Permanent / Full-Time',
      payGrade: formData.get('payGrade') || 'Level 9',
      salaryGross: formData.get('salaryGross') || '₹60,000 / mo',
      salaryNet: formData.get('salaryNet') || '₹54,000 / mo',
      bankAccount: 'HDFC Bank ••••••' + Math.floor(1000 + Math.random() * 9000),
      pfNo: 'PF-DL-2026-' + Math.floor(1000 + Math.random() * 9000),
      shift: formData.get('shift') || '07:45 AM – 03:45 PM',
      status: formData.get('status') || 'Active',
      attendanceRate: 100,
      leaveBalance: '20/20 Days',
      syllabusProgress: 75,
      rating: 5.0,
      reviewsCount: 0,
      bio: formData.get('bio') || 'New faculty member enrolled in the school repository.',
    };

    setStaffList((prev) => [newStaff, ...prev]);
    setShowAddModal(false);
    showToast(`Staff member "${newStaff.name}" added successfully!`);
  };

  const handleEditStaff = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updated = {
      ...editingStaff,
      name: formData.get('name'),
      role: formData.get('role'),
      category: formData.get('category'),
      dept: formData.get('dept'),
      subject: formData.get('subject'),
      classes: formData.get('classes'),
      isClassTeacher: formData.get('isClassTeacher'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      qualifications: formData.get('qualifications'),
      salaryGross: formData.get('salaryGross'),
      status: formData.get('status'),
      shift: formData.get('shift'),
    };

    setStaffList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    if (selectedStaff && selectedStaff.id === updated.id) {
      setSelectedStaff(updated);
    }
    setEditingStaff(null);
    showToast(`Staff details for "${updated.name}" updated!`);
  };

  const executeStaffDeletion = () => {
    if (!deleteTargetStaff) return;
    const targetId = deleteTargetStaff.id;
    const targetName = deleteTargetStaff.name;

    setStaffList((prev) => prev.filter((s) => s.id !== targetId));
    if (selectedStaff && selectedStaff.id === targetId) {
      setSelectedStaff(null);
    }
    setDeleteTargetStaff(null);
    showToast(`Staff member "${targetName}" (${deleteReason}) has been removed.`);
  };

  const handleExportCSV = () => {
    const headers = ['ID,Name,Role,Category,Department,Subject,Status,Phone,Email,Gross Salary'];
    const rows = staffList.map(
      (s) =>
        `"${s.id}","${s.name}","${s.role}","${s.category}","${s.dept}","${s.subject}","${s.status}","${s.phone}","${s.email}","${s.salaryGross}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `School_Staff_Roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Staff roster exported to CSV!');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <LuCircleCheck className="w-3.5 h-3.5 text-emerald-600" /> Active
          </span>
        );
      case 'On Leave':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <LuClock className="w-3.5 h-3.5 text-blue-600" /> On Leave
          </span>
        );
      case 'Suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <LuShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Suspended
          </span>
        );
      case 'Inactive':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <LuCircleAlert className="w-3.5 h-3.5 text-amber-600" /> Inactive
          </span>
        );
      case 'Left':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
            <LuCircleX className="w-3.5 h-3.5 text-gray-500" /> Left (Relieved)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up border border-gray-700 text-sm">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <LuCheck className="w-4 h-4" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Clean Standard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <LuUsers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Manage Teachers & Staff</h1>
            <p className="text-xs text-gray-400">Complete faculty & staff roster, profile dossiers, and status management</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-2 border border-gray-200 transition-colors shadow-xs"
          >
            <LuDownload className="w-4 h-4 text-gray-500" /> Export CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <LuUserPlus className="w-4 h-4" /> Add Staff
          </button>
        </div>
      </div>

      {/* Top KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Staff</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">{totalStaffCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">All Departments</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider">Teaching Faculty</span>
          <p className="text-2xl font-bold text-primary-600 mt-1">{teachingCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">PGT, TGT, PRT</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Admin & Support</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">{adminSupportCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">Operations & Labs</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Active on Duty</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</p>
          <p className="text-xs text-emerald-700 font-medium mt-0.5">
            {Math.round((activeCount / totalStaffCount) * 100)}% Presence
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-100 bg-blue-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">On Leave</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">{onLeaveCount}</p>
          <p className="text-xs text-blue-700 font-medium mt-0.5">Approved</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-100 bg-rose-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Inactive / Susp / Left</span>
          <p className="text-2xl font-bold text-rose-600 mt-1">{inactiveSuspendedLeftCount}</p>
          <p className="text-xs text-rose-700 font-medium mt-0.5">Manage / Delete</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <LuSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Name, Employee ID, Subject, Department, Phone, or Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-gray-500 mr-2">
              Showing <strong className="text-gray-800">{filteredStaff.length}</strong> of {staffList.length} staff
            </span>
            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  viewMode === 'table' ? 'bg-white text-primary-600 shadow-xs' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LuList className="w-4 h-4" /> <span className="hidden sm:inline">Table</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  viewMode === 'grid' ? 'bg-white text-primary-600 shadow-xs' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LuLayoutGrid className="w-4 h-4" /> <span className="hidden sm:inline">Cards</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">Department:</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === 'ALL' ? 'All Departments' : d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="ALL">All Categories</option>
              <option value="Teaching">Teaching Faculty Only</option>
              <option value="Administration">Administration & Leadership</option>
              <option value="Support Staff">Support & Technical Staff</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="On Leave">On Leave</option>
              <option value="Suspended">Suspended</option>
              <option value="Inactive">Inactive</option>
              <option value="Left">Left (Resigned / Relieved)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Staff Content */}
      {filteredStaff.length === 0 ? (
        <div className="bg-white rounded-xl p-10 border border-gray-200 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto border border-gray-200">
            <LuUsers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-800">No staff members found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            No records matched your search filter criteria. Try adjusting your query.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDept('ALL');
              setSelectedCategory('ALL');
              setSelectedStatus('ALL');
            }}
            className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-xs font-bold hover:bg-primary-100 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 font-semibold">Teacher / Staff Member</th>
                  <th className="py-3.5 px-4 font-semibold">Department & Role</th>
                  <th className="py-3.5 px-4 font-semibold">Assigned Classes / Subject</th>
                  <th className="py-3.5 px-4 font-semibold">Contact Info</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStaff.map((staff) => {
                  const isDeletable = ['Left', 'Inactive', 'Suspended'].includes(staff.status);
                  return (
                    <tr
                      key={staff.id}
                      onClick={() => setSelectedStaff(staff)}
                      className="hover:bg-gray-50/80 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-700 font-bold text-xs flex items-center justify-center shrink-0 border border-primary-100">
                            {staff.name
                              .replace('Dr. ', '')
                              .replace('Mr. ', '')
                              .replace('Ms. ', '')
                              .replace('Mrs. ', '')
                              .substring(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors flex items-center gap-1.5">
                              {staff.name}
                              {staff.isClassTeacher !== 'None' && staff.isClassTeacher && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-50 text-primary-700 font-medium">
                                  CT: {staff.isClassTeacher}
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-gray-400 font-mono mt-0.5">{staff.id} • {staff.experience}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-medium text-gray-800">{staff.role}</p>
                        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 mt-0.5">
                          {staff.dept}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="text-gray-800 font-medium truncate max-w-xs">{staff.subject}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 truncate max-w-xs">{staff.classes}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="text-gray-700 flex items-center gap-1.5">
                          <LuPhone className="w-3 h-3 text-gray-400" /> {staff.phone}
                        </p>
                        <p className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5 truncate max-w-[180px]">
                          <LuMail className="w-3 h-3 text-gray-400" /> {staff.email}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-block relative">
                          <select
                            value={staff.status}
                            onChange={(e) => handleStatusChange(staff.id, e.target.value)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${
                              staff.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : staff.status === 'On Leave'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : staff.status === 'Suspended'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : staff.status === 'Inactive'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-gray-100 text-gray-700 border-gray-300'
                            }`}
                          >
                            <option value="Active">Active</option>
                            <option value="On Leave">On Leave</option>
                            <option value="Suspended">Suspended</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Left">Left</option>
                          </select>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedStaff(staff)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                            title="View Full Teacher Profile"
                          >
                            <LuEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingStaff(staff)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-gray-100 transition-colors"
                            title="Edit Details"
                          >
                            <LuPencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteTargetStaff(staff);
                              setDeleteReason(staff.status === 'Left' ? 'Left' : staff.status === 'Suspended' ? 'Suspended' : staff.status === 'Inactive' ? 'Inactive' : 'Left');
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDeletable
                                ? 'text-rose-600 hover:bg-rose-50 font-bold'
                                : 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title="Remove / Delete Staff"
                          >
                            <LuTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((staff) => {
            const isDeletable = ['Left', 'Inactive', 'Suspended'].includes(staff.status);
            return (
              <div
                key={staff.id}
                onClick={() => setSelectedStaff(staff)}
                className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-700 font-bold text-sm flex items-center justify-center shrink-0 border border-primary-100">
                        {staff.name
                          .replace('Dr. ', '')
                          .replace('Mr. ', '')
                          .replace('Ms. ', '')
                          .replace('Mrs. ', '')
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 group-hover:text-primary-600 transition-colors">
                          {staff.name}
                        </h4>
                        <p className="text-xs text-gray-400 font-mono">{staff.id} • {staff.dept}</p>
                      </div>
                    </div>
                    {getStatusBadge(staff.status)}
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-3">
                    <p className="font-semibold text-gray-800">{staff.role}</p>
                    <p className="text-gray-500">
                      <strong className="text-gray-700">Subject:</strong> {staff.subject}
                    </p>
                    <p className="text-gray-500">
                      <strong className="text-gray-700">Classes:</strong> {staff.classes}
                    </p>
                    {staff.isClassTeacher !== 'None' && staff.isClassTeacher && (
                      <p className="text-primary-700 font-medium">
                        Class Teacher: {staff.isClassTeacher}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-gray-500">
                    <p className="flex items-center gap-2">
                      <LuPhone className="w-3.5 h-3.5 text-gray-400" /> {staff.phone}
                    </p>
                    <p className="flex items-center gap-2 truncate">
                      <LuMail className="w-3.5 h-3.5 text-gray-400" /> {staff.email}
                    </p>
                  </div>
                </div>

                <div
                  className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[11px] text-gray-400 font-medium">
                    Exp: {staff.experience} • {staff.attendanceRate}% Attd
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedStaff(staff)}
                      className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 text-xs font-semibold flex items-center gap-1"
                    >
                      <LuEye className="w-3.5 h-3.5" /> Details
                    </button>
                    <button
                      onClick={() => setEditingStaff(staff)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-gray-100"
                      title="Edit"
                    >
                      <LuPencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTargetStaff(staff);
                        setDeleteReason(staff.status === 'Left' ? 'Left' : staff.status === 'Suspended' ? 'Suspended' : staff.status === 'Inactive' ? 'Inactive' : 'Left');
                      }}
                      className={`p-1.5 rounded-lg ${
                        isDeletable ? 'text-rose-600 hover:bg-rose-50' : 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title="Delete / Remove"
                    >
                      <LuTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL TEACHER / STAFF DETAIL MODAL */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-xl overflow-hidden flex flex-col animate-slide-up border border-gray-200">
            {/* Modal Header */}
            <div className="bg-white border-b border-gray-200 p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-700 font-bold text-lg flex items-center justify-center border border-primary-100 shrink-0">
                  {selectedStaff.name
                    .replace('Dr. ', '')
                    .replace('Mr. ', '')
                    .replace('Ms. ', '')
                    .replace('Mrs. ', '')
                    .substring(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-800">{selectedStaff.name}</h2>
                    {getStatusBadge(selectedStaff.status)}
                    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                      {selectedStaff.id}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedStaff.role} • {selectedStaff.dept} • Joined {selectedStaff.joiningDate}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStaff(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Attendance</span>
                  <p className="text-lg font-bold text-gray-800 mt-0.5">{selectedStaff.attendanceRate}%</p>
                  <p className="text-[10px] text-gray-500">Muster record</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Student Rating</span>
                  <p className="text-lg font-bold text-gray-800 mt-0.5">{selectedStaff.rating} / 5.0 ⭐</p>
                  <p className="text-[10px] text-gray-500">{selectedStaff.reviewsCount} reviews</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Leave Balance</span>
                  <p className="text-lg font-bold text-gray-800 mt-0.5">{selectedStaff.leaveBalance}</p>
                  <p className="text-[10px] text-gray-500">Remaining</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Syllabus Progress</span>
                  <p className="text-lg font-bold text-gray-800 mt-0.5">{selectedStaff.syllabusProgress}%</p>
                  <p className="text-[10px] text-emerald-600 font-medium">On Schedule</p>
                </div>
              </div>

              {/* Section 1: Academic & Teaching */}
              <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-2.5">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                  <LuGraduationCap className="w-4 h-4 text-primary-600" /> Academic & Teaching Responsibilities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400">Core Subject(s):</span>
                    <p className="text-gray-800 font-semibold mt-0.5">{selectedStaff.subject}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Assigned Classes:</span>
                    <p className="text-gray-800 font-semibold mt-0.5">{selectedStaff.classes}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Class Teacher:</span>
                    <p className="text-primary-700 font-semibold mt-0.5">{selectedStaff.isClassTeacher || 'None'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Qualifications:</span>
                    <p className="text-gray-800 font-semibold mt-0.5">{selectedStaff.qualifications}</p>
                  </div>
                </div>
                <div className="pt-2 text-xs">
                  <span className="text-gray-400">Bio & Remarks:</span>
                  <p className="text-gray-700 mt-1 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    {selectedStaff.bio}
                  </p>
                </div>
              </div>

              {/* Section 2: Contact & Personal */}
              <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-2.5">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                  <LuIdCard className="w-4 h-4 text-emerald-600" /> Contact & Personal Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400">Official Email:</span>
                    <p className="text-gray-800 font-semibold mt-0.5">{selectedStaff.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Mobile Phone:</span>
                    <p className="text-gray-800 font-semibold mt-0.5">{selectedStaff.phone}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Emergency Contact:</span>
                    <p className="text-gray-800 font-semibold mt-0.5">{selectedStaff.emergencyContact}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Date of Birth:</span>
                    <p className="text-gray-800 font-semibold mt-0.5">{selectedStaff.dob}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Blood Group:</span>
                    <p className="text-gray-800 font-semibold mt-0.5">{selectedStaff.bloodGroup}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Residential Address:</span>
                    <p className="text-gray-800 font-medium mt-0.5">{selectedStaff.address}</p>
                  </div>
                </div>
              </div>

              {/* Section 3: Employment & Payroll */}
              <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-2.5">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                  <LuBriefcase className="w-4 h-4 text-violet-600" /> Employment & Shift
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400">Employment Type:</span>
                    <p className="text-gray-800 font-semibold mt-0.5">{selectedStaff.employmentType}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Gross Monthly Pay:</span>
                    <p className="text-gray-800 font-semibold mt-0.5">{selectedStaff.salaryGross}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Daily Working Shift:</span>
                    <p className="text-gray-800 font-semibold mt-0.5">{selectedStaff.shift}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">Status:</span>
                <select
                  value={selectedStaff.status}
                  onChange={(e) => handleStatusChange(selectedStaff.id, e.target.value)}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white shadow-xs focus:ring-1 focus:ring-primary-500"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Left">Left (Resigned)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const toEdit = selectedStaff;
                    setSelectedStaff(null);
                    setEditingStaff(toEdit);
                  }}
                  className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold border border-gray-200 flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <LuPencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => {
                    const toDelete = selectedStaff;
                    setSelectedStaff(null);
                    setDeleteTargetStaff(toDelete);
                    setDeleteReason(toDelete.status === 'Left' ? 'Left' : toDelete.status === 'Suspended' ? 'Suspended' : toDelete.status === 'Inactive' ? 'Inactive' : 'Left');
                  }}
                  className="px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold border border-rose-200 flex items-center gap-1.5 transition-colors"
                >
                  <LuTrash2 className="w-3.5 h-3.5" /> Delete / Archive
                </button>
                <button
                  onClick={() => setSelectedStaff(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW STAFF MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-xl shadow-xl overflow-hidden flex flex-col animate-slide-up border border-gray-200">
            <div className="bg-white border-b border-gray-200 p-5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold text-gray-800">Add New Staff Member</h3>
                <p className="text-xs text-gray-400">Enroll faculty or administrative personnel</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input
                    name="name"
                    required
                    placeholder="e.g. Dr. Ramesh Gupta"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Employee ID</label>
                  <input
                    name="id"
                    placeholder="Auto-generated if empty"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category *</label>
                  <select
                    name="category"
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white text-xs"
                  >
                    <option value="Teaching">Teaching Faculty</option>
                    <option value="Administration">Administration & Leadership</option>
                    <option value="Support Staff">Support & Technical Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Role / Designation *</label>
                  <input
                    name="role"
                    required
                    placeholder="e.g. PGT Biology"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Department *</label>
                  <input
                    name="dept"
                    required
                    placeholder="e.g. Science, Mathematics"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Core Subjects</label>
                  <input
                    name="subject"
                    placeholder="e.g. Zoology, Botany"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Assigned Classes</label>
                  <input
                    name="classes"
                    placeholder="e.g. Class IX-A, XI-A"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Official Email *</label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="e.g. ramesh.g@eduflow.edu"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone Number *</label>
                  <input
                    name="phone"
                    required
                    placeholder="e.g. +91 98112 40120"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Gross Salary</label>
                  <input
                    name="salaryGross"
                    placeholder="e.g. ₹70,000 / mo"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Bio / Notes</label>
                <textarea
                  name="bio"
                  rows={2}
                  placeholder="Specialization, achievements..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white text-xs"
                />
              </div>

              <div className="p-4 bg-gray-50 -mx-5 -mb-5 border-t border-gray-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                >
                  Save & Register Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STAFF MODAL */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-xl shadow-xl overflow-hidden flex flex-col animate-slide-up border border-gray-200">
            <div className="bg-white border-b border-gray-200 p-5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold text-gray-800">Edit Profile: {editingStaff.name}</h3>
                <p className="text-xs text-gray-400">ID: {editingStaff.id}</p>
              </div>
              <button
                onClick={() => setEditingStaff(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditStaff} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    name="name"
                    defaultValue={editingStaff.name}
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={editingStaff.status}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white text-xs font-semibold"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Left">Left (Resigned / Relieved)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Role / Designation</label>
                  <input
                    name="role"
                    defaultValue={editingStaff.role}
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Department</label>
                  <input
                    name="dept"
                    defaultValue={editingStaff.dept}
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Core Subjects</label>
                  <input
                    name="subject"
                    defaultValue={editingStaff.subject}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Assigned Classes</label>
                  <input
                    name="classes"
                    defaultValue={editingStaff.classes}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    name="email"
                    defaultValue={editingStaff.email}
                    required
                    type="email"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    name="phone"
                    defaultValue={editingStaff.phone}
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Residential Address</label>
                <input
                  name="address"
                  defaultValue={editingStaff.address}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white text-xs"
                />
              </div>

              <div className="p-4 bg-gray-50 -mx-5 -mb-5 border-t border-gray-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE / ARCHIVE CONFIRMATION MODAL */}
      {deleteTargetStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden animate-slide-up border border-gray-200">
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
                <LuTrash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-800">Delete / Archive Staff Member?</h3>
              <p className="text-xs text-gray-500">
                Remove <strong className="text-gray-800">{deleteTargetStaff.name}</strong> ({deleteTargetStaff.id}) from the active staff roster.
              </p>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-left text-xs space-y-1.5 mt-2">
                <label className="block font-semibold text-gray-700">Removal Reason:</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="delReason"
                    value="Left"
                    checked={deleteReason === 'Left'}
                    onChange={() => setDeleteReason('Left')}
                    className="text-rose-600"
                  />
                  <span>Staff has <strong>Left / Resigned / Relieved</strong></span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="delReason"
                    value="Inactive"
                    checked={deleteReason === 'Inactive'}
                    onChange={() => setDeleteReason('Inactive')}
                    className="text-rose-600"
                  />
                  <span>Staff is <strong>Inactive / Non-participating</strong></span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="delReason"
                    value="Suspended"
                    checked={deleteReason === 'Suspended'}
                    onChange={() => setDeleteReason('Suspended')}
                    className="text-rose-600"
                  />
                  <span>Staff is <strong>Suspended / Terminated</strong></span>
                </label>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDeleteTargetStaff(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeStaffDeletion}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
              >
                <LuTrash2 className="w-4 h-4" /> Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
