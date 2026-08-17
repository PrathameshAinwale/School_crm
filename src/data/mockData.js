// ===== STAT CARDS DATA =====
export const adminStats = [
  { label: 'Manage Teachers', value: '186', sub: '180 Present • 6 On Leave', trend: '96.8% attendance', trendUp: true, color: 'blue' },
  { label: 'Total Students', value: '2,847', sub: '78 Active Sections (I-XII)', trend: '94.6% present today', trendUp: true, color: 'green' },
  { label: 'New Admissions', value: '480', sub: '42 Applications Under Review', trend: '+14% vs last session', trendUp: true, color: 'violet' },
  { label: 'School Vehicles', value: '24', sub: '22 On Route • 2 Maintenance', trend: '1,420 students transit', trendUp: true, color: 'amber' },
];

export const adminTeacherList = [
  { id: 'TCH-101', name: 'Dr. Ananya Sen', subject: 'Mathematics (Sr.)', dept: 'Mathematics', classes: 'X-A, XII-A', status: 'Present' },
  { id: 'TCH-102', name: 'Mr. Vikram Rathore', subject: 'Physics (Sr.)', dept: 'Science', classes: 'XI-A, XII-B', status: 'Present' },
  { id: 'TCH-103', name: 'Ms. Sunita Rao', subject: 'English Core', dept: 'Languages', classes: 'IX-B, X-B', status: 'On Leave (Substituted)' },
  { id: 'TCH-104', name: 'Mr. Rajesh Mehra', subject: 'Chemistry', dept: 'Science', classes: 'X-B, XI-B', status: 'Present' },
  { id: 'TCH-105', name: 'Mrs. Deepa Krishnan', subject: 'Computer Science', dept: 'IT & CS', classes: 'VIII-A, IX-A', status: 'Present' },
];

export const adminTimetableSubstitutions = [
  { period: 'Period 3 (10:00 - 10:45 AM)', class: 'Class IX-B', subject: 'English', absentTeacher: 'Ms. Sunita Rao', substitute: 'Mr. Alok Verma (Eng Dept)' },
  { period: 'Period 5 (11:45 - 12:30 PM)', class: 'Class VII-A', subject: 'Social Studies', absentTeacher: 'Mr. Manoj Joshi', substitute: 'Ms. Ritu Roy (History Dept)' },
];

export const adminSubjectProgress = [
  { subject: 'Mathematics', classes: 'Grades VI-XII', completion: 74, status: 'On Track', head: 'Dr. Ananya Sen' },
  { subject: 'Physics & Chemistry', classes: 'Grades IX-XII', completion: 68, status: 'Lab Practical Pending', head: 'Mr. Vikram Rathore' },
  { subject: 'English & Languages', classes: 'Grades I-XII', completion: 82, status: 'Ahead of Schedule', head: 'Ms. Sunita Rao' },
  { subject: 'Computer Science & AI', classes: 'Grades III-XII', completion: 80, status: 'On Track', head: 'Mrs. Deepa K.' },
  { subject: 'Social Sciences', classes: 'Grades VI-X', completion: 70, status: 'On Track', head: 'Mr. Manoj Joshi' },
];

export const adminVehicleFleet = [
  { busNo: 'DL-01-EA-4412 (Bus #04)', route: 'Rohini Sector 14 -> Campus', driver: 'Sukhwinder Singh', contact: '+91 98112-44102', students: 58, status: 'On Route (GPS Live)', speed: '38 km/h' },
  { busNo: 'DL-01-EA-4418 (Bus #09)', route: 'Pitampura -> Model Town -> Campus', driver: 'Rameshwar Lal', contact: '+91 98112-44108', students: 62, status: 'On Route (GPS Live)', speed: '34 km/h' },
  { busNo: 'DL-01-EA-4425 (Bus #15)', route: 'Dwarka Sec 6 -> Janakpuri -> Campus', driver: 'Harish Rawat', contact: '+91 98112-44115', students: 54, status: 'On Route (GPS Live)', speed: '41 km/h' },
  { busNo: 'DL-01-EA-4403 (Bus #02)', route: 'Scheduled Preventive Servicing', driver: 'Assigned Spare Driver', contact: '+91 98112-44100', students: 0, status: 'In Workshop (Fit Test)', speed: '0 km/h' },
];

export const adminResourcesSummary = [
  { name: 'Smart Classrooms', total: 52, active: 48, utilization: 92, note: '4 units maintenance' },
  { name: 'Science & Robotics Labs', total: 6, active: 6, utilization: 100, note: 'All labs occupied' },
  { name: 'Computer Labs (240 PCs)', total: 4, active: 4, utilization: 100, note: 'High speed LAN active' },
  { name: 'Central Library Books', total: 18400, active: 1420, utilization: 8, note: '1,420 currently issued' },
  { name: 'Sports & Athletic Facilities', total: 8, active: 7, utilization: 88, note: 'Outdoor field, Indoor arena' },
];

export const ownerStats = [
  { label: 'Total Staff', value: '280', sub: '186 Teaching • 94 Support', trend: '96.4% present today', trendUp: true, color: 'amber' },
  { label: 'Monthly Expenses', value: '₹22.1L', sub: 'Budget: ₹25.0L', trend: '-11.6% vs budget', trendUp: true, color: 'rose' },
  { label: 'Student Count', value: '2,847', sub: 'Capacity: 3,200 (89%)', trend: '+12.4% YoY', trendUp: true, color: 'green' },
  { label: 'Admissions Enquiries', value: '642', sub: '436 Converted (68%)', trend: '34 Follow-ups pending', trendUp: true, color: 'blue' },
];

export const ownerExpenseCategories = [
  { name: 'Staff Salaries', amount: 15.2, percentage: 68.7, color: '#3b82f6' },
  { name: 'Campus & Utilities', amount: 3.1, percentage: 14.0, color: '#f59e0b' },
  { name: 'Transport & Fleet', amount: 2.2, percentage: 10.0, color: '#10b981' },
  { name: 'Academic & Labs', amount: 1.6, percentage: 7.3, color: '#8b5cf6' },
];

export const ownerStudentWingBreakdown = [
  { wing: 'Primary (Grades 1-5)', count: 1120, sections: 28, capacity: 1200, fill: 93 },
  { wing: 'Middle (Grades 6-8)', count: 890, sections: 22, capacity: 1000, fill: 89 },
  { wing: 'Senior (Grades 9-12)', count: 837, sections: 20, capacity: 1000, fill: 84 },
];

export const ownerRecentEnquiries = [
  { id: 'ENQ-2026-891', student: 'Aarav Sharma', grade: 'Grade 1', parent: 'Dr. Vivek Sharma', status: 'Interview Scheduled', date: 'Today' },
  { id: 'ENQ-2026-890', student: 'Ishita Gupta', grade: 'Grade 9 (Science)', parent: 'Mrs. Neha Gupta', status: 'Documents Verified', date: 'Yesterday' },
  { id: 'ENQ-2026-889', student: 'Kabir Verma', grade: 'Grade 6', parent: 'Mr. Rajesh Verma', status: 'Follow-up Required', date: 'Aug 15' },
  { id: 'ENQ-2026-888', student: 'Ananya Roy', grade: 'Grade 11 (Commerce)', parent: 'Mr. S. K. Roy', status: 'Fee Paid / Enrolled', date: 'Aug 14' },
];

export const ownerExternalAffairsList = [
  { organization: 'CBSE Regional Board Office', subject: 'Affiliation Extension & Academic Audit 2026', status: 'Compliant / Grade A+', type: 'Regulatory' },
  { organization: 'District Education Office (DEO)', subject: 'Annual School Safety & Infrastructure Inspection', status: 'Passed / Cleared', type: 'Govt Body' },
  { organization: 'National Green Tribunal & Forest Dept', subject: 'Eco-Friendly Campus & Rainwater Harvesting Certification', status: 'Certified', type: 'Environmental' },
  { organization: 'All India School Sports Federation', subject: 'Zonal Inter-School Football & Athletics Championship Host', status: 'Confirmed Host', type: 'Partnership' },
];

export const ownerVaultDocuments = [
  { title: 'CBSE Affiliation Certificate', docNo: 'CBSE/AFF/2130892/2026', category: 'Board Permission', issueDate: 'Apr 2024', expiry: 'Mar 2030', status: 'Valid' },
  { title: 'Fire Safety NOC', docNo: 'FS-DL-NOC-2024-881', category: 'Safety & Compliance', issueDate: 'Nov 2024', expiry: 'Nov 2027', status: 'Valid' },
  { title: 'Building Structural Stability Certificate', docNo: 'PWD-STR-9021', category: 'Infrastructure', issueDate: 'Jan 2024', expiry: 'Jan 2029', status: 'Valid' },
  { title: 'Health & Sanitation Hygiene NOC', docNo: 'MCD-HS-7712', category: 'Municipal / Health', issueDate: 'Aug 2024', expiry: 'Aug 2027', status: 'Valid' },
  { title: 'School Land Title Deed & Registry (12.5 Acres)', docNo: 'REG-TD-10492-DL', category: 'Legal & Property', issueDate: 'Permanent', expiry: 'Lifetime', status: 'Verified' },
  { title: 'Drinking Water & RO Lab Test Clearance', docNo: 'PHED-WT-2026-04', category: 'Health & Safety', issueDate: 'Jan 2026', expiry: 'Dec 2026', status: 'Renewal in 4 mos' },
];

export const ownerNotices = [
  { id: 1, title: 'Governing Body & Board of Trustees Meeting', date: 'Aug 25, 2026', priority: 'High', source: 'Trust Office', desc: 'Discussion on Phase 2 STEM Innovation Wing and Fee revision for 2027-28.' },
  { id: 2, title: 'CBSE Circular: Revised Guidelines for Senior Secondary Assessment', date: 'Aug 19, 2026', priority: 'Medium', source: 'CBSE Board', desc: 'Mandatory implementation of competency-based practical evaluations.' },
  { id: 3, title: 'State Transport Authority: Bi-Annual School Bus Fitness Drive', date: 'Aug 16, 2026', priority: 'Urgent', source: 'Transport Dept', desc: 'Mandatory inspection for all 24 school transit vehicles scheduled for Aug 28.' },
];

export const teacherStats = [
  { label: 'Assigned Students', value: '214', sub: 'Class X-A, X-B, XII-A', trend: '94.2% Attendance', trendUp: true, color: 'blue' },
  { label: 'Syllabus Progress', value: '74%', sub: '4 Units Completed • 2 Active', trend: 'On Track (Session 26)', trendUp: true, color: 'green' },
  { label: 'Assignments Due', value: '2 Active', sub: '64/80 Submitted', trend: '16 Pending Grading', trendUp: false, color: 'amber' },
  { label: 'My HR Status', value: 'Active', sub: 'Aug Salary Disbursed (₹62.1K)', trend: '18 Leaves Remaining', trendUp: true, color: 'violet' },
];

export const teacherStudentRecords = [
  { rollNo: '101', name: 'Aarav Patel', class: 'Class X-A', attendance: '96%', avgScore: '94/100', assignments: '8/8', parentContact: '+91 98201-11021', remarks: 'Exceptional in Algebra' },
  { rollNo: '102', name: 'Diya Sharma', class: 'Class X-A', attendance: '92%', avgScore: '88/100', assignments: '8/8', parentContact: '+91 98201-11022', remarks: 'Consistent Performer' },
  { rollNo: '103', name: 'Kabir Verma', class: 'Class X-A', attendance: '88%', avgScore: '76/100', assignments: '6/8', parentContact: '+91 98201-11023', remarks: 'Needs attention in Geometry' },
  { rollNo: '104', name: 'Rhea Sen', class: 'Class X-A', attendance: '98%', avgScore: '96/100', assignments: '8/8', parentContact: '+91 98201-11024', remarks: 'Class Topper' },
];

export const teacherSyllabusList = [
  { chapter: 'Unit 1: Real Numbers & Polynomials', status: 'Completed', progress: 100, lectures: '12/12 Done' },
  { chapter: 'Unit 2: Linear & Quadratic Equations', status: 'Completed', progress: 100, lectures: '14/14 Done' },
  { chapter: 'Unit 3: Arithmetic Progressions', status: 'In Progress', progress: 80, lectures: '8/10 Done' },
  { chapter: 'Unit 4: Triangles & Coordinate Geometry', status: 'In Progress', progress: 55, lectures: '6/11 Done' },
  { chapter: 'Unit 5: Trigonometry & Applications', status: 'Scheduled', progress: 0, lectures: 'Starts Sep 01' },
];

export const teacherScoresheetData = [
  { test: 'Unit Test 1', classAvg: 86, highest: 98, lowest: 64 },
  { test: 'Monthly Test 2', classAvg: 82, highest: 100, lowest: 58 },
  { test: 'Mid-Term Exam', classAvg: 88, highest: 99, lowest: 68 },
  { test: 'Practical Quiz', classAvg: 92, highest: 100, lowest: 72 },
];

export const teacherAssignmentsList = [
  { id: 'ASN-01', title: 'Quadratic Equations Word Problems', class: 'Class X-A', dueDate: 'Tomorrow (Aug 18)', submissions: '38/40', status: 'Grading Active' },
  { id: 'ASN-02', title: 'Arithmetic Progressions Proofs & Series', class: 'Class X-B', dueDate: 'Aug 21, 2026', submissions: '26/40', status: 'Submission Open' },
  { id: 'ASN-03', title: 'Coordinate Geometry Cartesian Graphing', class: 'Class XII-A', dueDate: 'Aug 24, 2026', submissions: '12/38', status: 'Submission Open' },
];

export const teacherOwnHRData = {
  employeeId: 'EMP-TCH-2024-88',
  designation: 'Senior Faculty — Mathematics (PGT)',
  salaryGross: '₹68,500',
  salaryNet: '₹62,100',
  salaryStatus: 'Disbursed (Aug 01, 2026)',
  attendancePercentage: '98.2%',
  casualLeaveBalance: '18 Days remaining (out of 20)',
  medicalLeaveBalance: '10 Days remaining',
  nextTraining: 'CBSE NEP 2020 Pedagogical Workshop (Aug 22, 2026)',
  upcomingHolidays: [
    { name: 'Janmashtami', date: 'Aug 26, 2026' },
    { name: 'Ganesh Chaturthi', date: 'Sep 07, 2026' },
    { name: 'Gandhi Jayanti', date: 'Oct 02, 2026' },
  ],
  circulars: [
    { title: 'Mandatory Submission of Class X Internal Assessment Marks by Aug 30', date: 'Aug 16' },
    { title: 'Faculty Dress Code Guidelines for Annual Sports Meet', date: 'Aug 14' },
  ],
};

export const studentParentStats = [
  { label: 'Syllabus Coverage', value: '78%', sub: 'Class X (Session 2026-27)', trendUp: true, color: 'blue' },
  { label: 'Attendance Rate', value: '94.5%', sub: '112/118 Working Days', trendUp: true, color: 'green' },
  { label: 'Active Assignments', value: '2 Due', sub: 'Math Problem Set & English Essay', trendUp: false, color: 'amber' },
  { label: 'Fee Summary', value: '75% Paid', sub: 'Paid ₹90K • Balance ₹30K', trendUp: true, color: 'violet' },
];

export const studentSyllabusProgress = [
  { subject: 'Mathematics (Standard)', teacher: 'Dr. Ananya Sen', progress: 78, nextTopic: 'Quadratic Equations Word Problems' },
  { subject: 'Science (Physics & Chem)', teacher: 'Mr. Vikram Rathore', progress: 72, nextTopic: 'Ray Optics Reflection Lab' },
  { subject: 'English Language & Lit', teacher: 'Ms. Sunita Rao', progress: 85, nextTopic: 'Nelson Mandela Chapter Revision' },
  { subject: 'Social Science (History/Civics)', teacher: 'Mr. Manoj Joshi', progress: 70, nextTopic: 'Nationalism in India Chapter 3' },
  { subject: 'Computer Science (AI & Python)', teacher: 'Mrs. Deepa K.', progress: 90, nextTopic: 'SQL Database Tables & Queries' },
];

export const studentSchoolCalendar = [
  { event: 'Mid-Term Mathematics Board Pattern Exam', type: 'Exam', date: 'Aug 20, 2026', time: '9:00 AM - 12:00 PM' },
  { event: 'Science Practical Lab Evaluation', type: 'Exam', date: 'Aug 22, 2026', time: '10:00 AM - 1:00 PM' },
  { event: 'Janmashtami Institutional Holiday', type: 'Holiday', date: 'Aug 26, 2026', time: 'Full Day' },
  { event: 'Annual Inter-School Sports Championship', type: 'Event', date: 'Aug 28, 2026', time: '8:00 AM - 4:00 PM' },
  { event: 'Parent-Teacher Meeting (PTM Term 1)', type: 'PTM', date: 'Sep 05, 2026', time: '9:00 AM - 1:00 PM' },
];

export const studentPeriodTimetable = [
  { period: '1st Period', time: '8:00 - 8:45 AM', subject: 'Mathematics', teacher: 'Dr. Ananya Sen', room: 'Room 301' },
  { period: '2nd Period', time: '8:45 - 9:30 AM', subject: 'Science (Physics)', teacher: 'Mr. Vikram Rathore', room: 'Physics Lab 1' },
  { period: '3rd Period', time: '9:45 - 10:30 AM', subject: 'English Core', teacher: 'Ms. Sunita Rao', room: 'Room 301' },
  { period: '4th Period', time: '10:30 - 11:15 AM', subject: 'Computer Science (Python)', teacher: 'Mrs. Deepa K.', room: 'Computer Lab 2' },
  { period: '5th Period', time: '11:30 - 12:15 PM', subject: 'Social Science', teacher: 'Mr. Manoj Joshi', room: 'Room 301' },
  { period: '6th Period', time: '12:15 - 1:00 PM', subject: 'Physical Education & Sports', teacher: 'Coach Sandeep', room: 'Sports Complex' },
];

export const studentAssignmentsList = [
  { id: 'ASN-01', subject: 'Mathematics', title: 'Quadratic Equations Problem Set 4.2', dueDate: 'Tomorrow (Aug 18)', status: 'Pending Submission', priority: 'High' },
  { id: 'ASN-02', subject: 'English', title: 'Essay: "Impact of Artificial Intelligence on Society"', dueDate: 'Aug 21, 2026', status: 'Draft Saved', priority: 'Medium' },
  { id: 'ASN-03', subject: 'Science', title: 'Ray Optics Reflection Practical File & Viva Notes', dueDate: 'Submitted', status: 'Graded (19/20 - Grade A)', priority: 'Completed' },
];

export const studentStudyMaterials = [
  { id: 'SM-01', subject: 'Mathematics', title: 'Class X Board Formulas & Solved Examples 2026', size: '4.2 MB', type: 'PDF', downloads: '142 Downloads' },
  { id: 'SM-02', subject: 'Science', title: 'NCERT Exemplar Solutions & Physics Lab Manual', size: '6.8 MB', type: 'PDF', downloads: '188 Downloads' },
  { id: 'SM-03', subject: 'English', title: 'Literature Question Bank & Grammar Worksheets', size: '3.1 MB', type: 'PDF', downloads: '95 Downloads' },
  { id: 'SM-04', subject: 'Social Science', title: 'Nationalism in India Mindmaps & Map Practice', size: '5.5 MB', type: 'PDF', downloads: '110 Downloads' },
];

export const studentParentNotices = [
  { id: 1, title: 'Registration Open for Inter-School STEM & Robotics Expo 2026', date: 'Aug 16, 2026', sender: 'Principal Office', category: 'Academic' },
  { id: 2, title: 'Mandatory CBSE Board Registration Data Verification for Class X', date: 'Aug 14, 2026', sender: 'Exam Dept', category: 'Important' },
  { id: 3, title: 'Annual Health & Eye Checkup Camp in Campus on Aug 24', date: 'Aug 12, 2026', sender: 'Health Dept', category: 'Health' },
];

export const studentFeeDetails = {
  totalFee: '₹1,20,000',
  paidAmount: '₹90,000',
  pendingAmount: '₹30,000',
  nextDueDate: 'Sep 15, 2026',
  paymentPercentage: 75,
  breakdown: [
    { head: 'Tuition Fee (Q1, Q2 & Q3)', amount: '₹75,000', status: 'Paid' },
    { head: 'Transport & Transit Fee (Annual)', amount: '₹15,000', status: 'Paid' },
    { head: 'Science & Computer Lab Fee (Q4)', amount: '₹15,000', status: 'Due Sep 15' },
    { head: 'Examination & Library Fee (Q4)', amount: '₹15,000', status: 'Due Sep 15' },
  ],
};

export const studentFeedbackItems = [
  { subject: 'Mathematics (Dr. Ananya Sen)', rating: 5, comment: 'Excellent doubt resolution and board exam practice problems.' },
  { subject: 'Science (Mr. Vikram Rathore)', rating: 4.5, comment: 'Very engaging practical sessions in the physics lab.' },
  { subject: 'English (Ms. Sunita Rao)', rating: 4, comment: 'Good grammar explanations and reading comprehension tasks.' },
];

export const studentPTMDetails = {
  date: 'Saturday, Sep 05, 2026',
  timeSlot: '10:30 AM - 11:00 AM (Slot Confirmed)',
  teacher: 'Dr. Ananya Sen (Class Teacher & PGT Math)',
  venue: 'Room 301, Senior Academic Block',
  agenda: 'Review of Unit Test 1 scores, mid-term preparation strategy, and Class X board guidance.',
  status: 'Slot Booked',
};

export const hrStats = [
  { label: 'Monthly Salary', value: '₹15.2L', sub: '280 Staff Paid (100% Disbursed)', trend: 'Processed on Aug 01', trendUp: true, color: 'green' },
  { label: 'Staff Attendance', value: '96.4%', sub: '268 Present Today • 12 On Leave', trend: '4 Pending Leave Approvals', trendUp: true, color: 'blue' },
  { label: 'Faculty Trainings', value: '8 Programs', sub: '184 Teachers Enrolled (Session 26)', trend: 'Next: NEP 2020 on Aug 22', trendUp: true, color: 'violet' },
  { label: 'School Events', value: '6 Upcoming', sub: 'Sports, Guest Speakers & Fiestas', trend: 'Next: Sports Meet on Aug 28', trendUp: true, color: 'amber' },
];

export const hrSalaryBreakdown = [
  { dept: 'Senior Secondary Faculty (PGT)', staffCount: 46, gross: '₹4.85L', deductions: '₹42,000', netPay: '₹4.43L', status: 'Disbursed' },
  { dept: 'High & Middle School (TGT)', staffCount: 78, gross: '₹5.60L', deductions: '₹51,000', netPay: '₹5.09L', status: 'Disbursed' },
  { dept: 'Primary & Pre-Primary (PRT)', staffCount: 62, gross: '₹3.40L', deductions: '₹30,000', netPay: '₹3.10L', status: 'Disbursed' },
  { dept: 'Administrative & Clerical Staff', staffCount: 32, gross: '₹1.80L', deductions: '₹16,000', netPay: '₹1.64L', status: 'Disbursed' },
  { dept: 'Lab, Transport & Support Staff', staffCount: 62, gross: '₹1.15L', deductions: '₹11,000', netPay: '₹1.04L', status: 'Disbursed' },
];

export const hrTrainingsList = [
  { id: 'TRN-101', title: 'CBSE NEP 2020: Competency-Based Pedagogy & Assessment', trainer: 'Dr. Meenakshi S. (CBSE Master Trainer)', enrolled: 64, date: 'Aug 22, 2026', mode: 'Campus Workshop', status: 'Enrolling' },
  { id: 'TRN-102', title: 'AI & Smart Tools for Interactive Lesson Planning', trainer: 'TechEd Innovations Group', enrolled: 48, date: 'Aug 26, 2026', mode: 'Computer Lab 1', status: 'Confirmed' },
  { id: 'TRN-103', title: 'Child Psychology, Student Wellbeing & POCSO Norms', trainer: 'Dr. Radhika Singhal (Clinical Psychologist)', enrolled: 280, date: 'Sep 02, 2026', mode: 'Main Auditorium', status: 'Mandatory' },
  { id: 'TRN-104', title: 'Emergency First Aid, Disaster Management & CPR Drills', trainer: 'Indian Red Cross Society', enrolled: 36, date: 'Sep 08, 2026', mode: 'Sports Arena', status: 'Registration Open' },
];

export const hrSchoolEventsList = [
  { id: 'EVT-01', title: 'Annual Zonal Inter-School Athletics Championship', category: 'Sports', date: 'Aug 28, 2026', time: '8:00 AM - 4:00 PM', venue: 'Main Sports Complex & Track', audience: '12 Schools • 850 Athletes' },
  { id: 'EVT-02', title: 'External Speaker Series: "Future of Space Exploration & STEM"', category: 'External Speaker', date: 'Sep 04, 2026', time: '11:00 AM - 1:00 PM', venue: 'Main Auditorium', speaker: 'Dr. K. Radhakrishnan (Ex-ISRO Chairman)', audience: 'Grades IX-XII Students & Faculty' },
  { id: 'EVT-03', title: 'Annual Grandparents Day Gathering & Cultural Fiesta', category: 'Gathering & Cultural', date: 'Sep 12, 2026', time: '9:30 AM - 1:30 PM', venue: 'Open-Air Amphitheatre', audience: '600+ Grandparents & Primary Students' },
  { id: 'EVT-04', title: 'Inter-House Science & Robotics Innovation Expo 2026', category: 'Academic Expo', date: 'Sep 20, 2026', time: '10:00 AM - 3:00 PM', venue: 'Senior Science Wings & Robotics Lab', audience: 'All Students, Teachers & Parents' },
];

export const financeStats = [
  { label: 'Total Salaries Disbursed', value: '₹15.2L', sub: '280 Staff Paid (100%)', trend: 'Processed Aug 01', trendUp: true, color: 'blue' },
  { label: 'Total Operating Expenses', value: '₹22.1L', sub: 'Budget: ₹25.0L (-11.6%)', trend: 'Saved ₹2.9L', trendUp: true, color: 'rose' },
  { label: 'Monthly Fee Realized', value: '₹48.5L', sub: 'Target: ₹52.0L (93.3%)', trend: '+8.4% vs last month', trendUp: true, color: 'green' },
  { label: 'Net Cash Flow Surplus', value: '₹26.4L', sub: 'Liquidity Ratio: 2.4 : 1', trend: '+14.2% YoY', trendUp: true, color: 'amber' },
];

export const financePatternData = [
  { month: 'Mar', income: 42.5, expenses: 24.2, surplus: 18.3 },
  { month: 'Apr (Session Start)', income: 68.4, expenses: 29.8, surplus: 38.6 },
  { month: 'May', income: 44.0, expenses: 25.1, surplus: 18.9 },
  { month: 'Jun (Summer Break)', income: 28.2, expenses: 22.0, surplus: 6.2 },
  { month: 'Jul', income: 46.5, expenses: 24.6, surplus: 21.9 },
  { month: 'Aug (Current)', income: 48.5, expenses: 22.1, surplus: 26.4 },
];

export const financeIncomeSources = [
  { name: 'Tuition Fee', amount: 35.0, percentage: 72.2, color: '#3b82f6' },
  { name: 'Transport & Transit', amount: 6.8, percentage: 14.0, color: '#10b981' },
  { name: 'Admission & Lab Fees', amount: 4.8, percentage: 9.9, color: '#8b5cf6' },
  { name: 'Exams & Annual Events', amount: 1.9, percentage: 3.9, color: '#f59e0b' },
];

export const financeRatioAnalysisList = [
  { ratio: 'Operating Expense Ratio', value: '45.5%', benchmark: '< 60%', status: 'Optimal', note: 'Operating costs well controlled relative to total revenue' },
  { ratio: 'Salary-to-Income Ratio', value: '31.3%', benchmark: '30% - 40%', status: 'Healthy', note: 'Staff payroll is sustainable within educational norms' },
  { ratio: 'Current Liquidity Ratio', value: '2.4 : 1', benchmark: '> 1.5 : 1', status: 'Strong', note: 'High ability to cover short-term liabilities & vendors' },
  { ratio: 'Fee Realization Rate', value: '93.3%', benchmark: '> 90%', status: 'Excellent', note: '93.3% demanded student fees recovered on time' },
  { ratio: 'Capital Debt-to-Asset', value: '0.12 : 1', benchmark: '< 0.35 : 1', status: 'Very Safe', note: 'Negligible institutional debt burden' },
];

export const financeBudgetAllocations = [
  { head: 'Campus Infrastructure & Civil Repairs', allocated: '₹18.0L', spent: '₹11.2L', percentage: 62.2, status: 'On Track' },
  { head: 'Transport Fuel, Fleet Maintenance & GPS', allocated: '₹15.0L', spent: '₹9.8L', percentage: 65.3, status: 'On Track' },
  { head: 'Academic Labs, Books & STEM Kits', allocated: '₹12.0L', spent: '₹8.4L', percentage: 70.0, status: 'Active' },
  { head: 'IT, Digital Smartboards & Cloud Software', allocated: '₹10.0L', spent: '₹6.8L', percentage: 68.0, status: 'On Track' },
  { head: 'Sports, Cultural Events & Annual Day', allocated: '₹8.0L', spent: '₹4.6L', percentage: 57.5, status: 'Planned for Q3' },
];

export const financeForecastData = [
  { period: 'Sep 2026 (P)', projectedIncome: 50.2, projectedExpense: 23.4, projectedSurplus: 26.8 },
  { period: 'Oct 2026 (P)', projectedIncome: 52.0, projectedExpense: 24.8, projectedSurplus: 27.2 },
  { period: 'Nov 2026 (P)', projectedIncome: 49.5, projectedExpense: 23.0, projectedSurplus: 26.5 },
  { period: 'Dec 2026 (P)', projectedIncome: 56.4, projectedExpense: 26.2, projectedSurplus: 30.2 },
  { period: 'Jan 2027 (P)', projectedIncome: 62.0, projectedExpense: 27.0, projectedSurplus: 35.0 },
  { period: 'Feb 2027 (P)', projectedIncome: 48.0, projectedExpense: 22.5, projectedSurplus: 25.5 },
];

// ===== CHART DATA =====
export const weeklyAttendanceData = [
  { day: 'Mon', students: 2680, teachers: 178 },
  { day: 'Tue', students: 2720, teachers: 182 },
  { day: 'Wed', students: 2650, teachers: 175 },
  { day: 'Thu', students: 2700, teachers: 180 },
  { day: 'Fri', students: 2580, teachers: 170 },
  { day: 'Sat', students: 1800, teachers: 120 },
];

export const monthlyRevenueData = [
  { month: 'Mar', revenue: 42, expenses: 28 },
  { month: 'Apr', revenue: 45, expenses: 27 },
  { month: 'May', revenue: 38, expenses: 30 },
  { month: 'Jun', revenue: 25, expenses: 26 },
  { month: 'Jul', revenue: 44, expenses: 29 },
  { month: 'Aug', revenue: 48, expenses: 25 },
];

export const feeCollectionData = [
  { name: 'Collected', value: 78, color: '#10b981' },
  { name: 'Pending', value: 15, color: '#f59e0b' },
  { name: 'Overdue', value: 7, color: '#f43f5e' },
];

export const classPerformanceData = [
  { className: 'Class X-A', avg: 88 },
  { className: 'Class X-B', avg: 82 },
  { className: 'Class IX-A', avg: 91 },
  { className: 'Class IX-B', avg: 79 },
  { className: 'Class VIII-A', avg: 85 },
  { className: 'Class VIII-B', avg: 87 },
];

export const studentGradesData = [
  { subject: 'Mathematics', marks: 92, total: 100 },
  { subject: 'Science', marks: 88, total: 100 },
  { subject: 'English', marks: 95, total: 100 },
  { subject: 'Hindi', marks: 82, total: 100 },
  { subject: 'Social Science', marks: 90, total: 100 },
  { subject: 'Computer Sc.', marks: 97, total: 100 },
];

// ===== ACTIVITY FEED =====
export const recentActivities = [
  {
    id: 1,
    type: 'enrollment',
    message: 'New student Aanya Kapoor enrolled in Class IX-A',
    time: '10 mins ago',
    icon: 'user-plus',
  },
  {
    id: 2,
    type: 'fee',
    message: 'Fee payment of ₹45,000 received from Rohan Mehta (X-B)',
    time: '25 mins ago',
    icon: 'dollar',
  },
  {
    id: 3,
    type: 'exam',
    message: 'Mid-term exam results published for Class X',
    time: '1 hour ago',
    icon: 'file',
  },
  {
    id: 4,
    type: 'leave',
    message: 'Leave request from Ms. Priya (Math Teacher) — 2 days',
    time: '2 hours ago',
    icon: 'clock',
  },
  {
    id: 5,
    type: 'notice',
    message: 'Annual sports day scheduled for 25th August',
    time: '3 hours ago',
    icon: 'bell',
  },
  {
    id: 6,
    type: 'attendance',
    message: 'Class VII-A attendance marked — 38/40 present',
    time: '4 hours ago',
    icon: 'check',
  },
];

// ===== CALENDAR EVENTS =====
export const upcomingEvents = [
  { id: 1, title: 'Staff Meeting', date: 'Aug 18', time: '10:00 AM', type: 'meeting', color: '#7c3aed' },
  { id: 2, title: 'Math Exam — Class X', date: 'Aug 20', time: '9:00 AM', type: 'exam', color: '#f43f5e' },
  { id: 3, title: 'Parent-Teacher Meet', date: 'Aug 22', time: '2:00 PM', type: 'meeting', color: '#06b6d4' },
  { id: 4, title: 'Independence Day Event', date: 'Aug 15', time: '8:00 AM', type: 'event', color: '#10b981' },
  { id: 5, title: 'Fee Deadline', date: 'Aug 25', time: '—', type: 'deadline', color: '#f59e0b' },
  { id: 6, title: 'Annual Sports Day', date: 'Aug 28', time: '7:30 AM', type: 'event', color: '#10b981' },
];

// ===== QUICK ACTIONS =====
export const adminQuickActions = [
  { label: 'Add Student', icon: 'user-plus', color: 'blue' },
  { label: 'Add Teacher', icon: 'user-plus', color: 'green' },
  { label: 'Collect Fee', icon: 'dollar', color: 'amber' },
  { label: 'Mark Attendance', icon: 'check', color: 'violet' },
  { label: 'Send Notice', icon: 'bell', color: 'rose' },
  { label: 'Generate Report', icon: 'file', color: 'cyan' },
];

// ===== TEACHER SCHEDULE =====
export const todaySchedule = [
  { period: '1st', time: '8:00 - 8:45', class: 'X-A', subject: 'Mathematics', room: '301' },
  { period: '2nd', time: '8:45 - 9:30', class: 'IX-B', subject: 'Mathematics', room: '205' },
  { period: '3rd', time: '9:45 - 10:30', class: 'X-B', subject: 'Mathematics', room: '302' },
  { period: '4th', time: '10:30 - 11:15', class: 'Free', subject: '—', room: '—' },
  { period: '5th', time: '11:30 - 12:15', class: 'VIII-A', subject: 'Mathematics', room: '108' },
  { period: '6th', time: '12:15 - 1:00', class: 'IX-A', subject: 'Mathematics', room: '204' },
];

// ===== TOP STUDENTS =====
export const topStudents = [
  { name: 'Priya Verma', class: 'X-A', score: '98.4%', rank: 1 },
  { name: 'Aarav Joshi', class: 'X-B', score: '97.8%', rank: 2 },
  { name: 'Diya Iyer', class: 'X-A', score: '96.9%', rank: 3 },
  { name: 'Karthik Nair', class: 'IX-A', score: '96.5%', rank: 4 },
  { name: 'Sneha Rao', class: 'IX-B', score: '95.8%', rank: 5 },
];
