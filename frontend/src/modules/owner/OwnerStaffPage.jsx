import React, { useState } from 'react';
import {
  LuUsers,
  LuSearch,
  LuEye,
  LuDownload,
  LuPhone,
  LuMail,
  LuX,
  LuCircleCheck,
  LuBriefcase,
  LuDollarSign,
  LuGraduationCap,
} from 'react-icons/lu';

const OWNER_STAFF_DATA = [
  { id: 'TCH-101', name: 'Dr. Ananya Sen', role: 'Senior PGT Mathematics & HOD', category: 'Teaching', dept: 'Mathematics', subject: 'Calculus, Vectors', tenure: '9 Years', salary: '₹82,000 / mo', pfNo: 'PF-DL-2017-8891', phone: '+91 98112 40101', email: 'ananya.sen@eduflow.edu', status: 'Active', attendance: '98.4%', rating: '4.9/5.0', qualifications: 'Ph.D. Mathematics, B.Ed (Gold Medalist)' },
  { id: 'TCH-102', name: 'Mr. Vikram Rathore', role: 'PGT Physics & Robotics Mentor', category: 'Teaching', dept: 'Science', subject: 'Physics & STEM', tenure: '7 Years', salary: '₹76,000 / mo', pfNo: 'PF-DL-2019-4412', phone: '+91 98112 40102', email: 'vikram.r@eduflow.edu', status: 'Active', attendance: '96.8%', rating: '4.8/5.0', qualifications: 'M.Sc Physics (IIT Delhi), B.Ed' },
  { id: 'TCH-103', name: 'Ms. Sunita Rao', role: 'TGT English Literature', category: 'Teaching', dept: 'Languages', subject: 'English Core', tenure: '5 Years', salary: '₹62,000 / mo', pfNo: 'PF-DL-2021-9920', phone: '+91 98112 40103', email: 'sunita.rao@eduflow.edu', status: 'On Leave', attendance: '94.2%', rating: '4.7/5.0', qualifications: 'M.A. English (JNU), B.Ed' },
  { id: 'TCH-104', name: 'Mr. Rajesh Mehra', role: 'PGT Chemistry & Lab Coordinator', category: 'Teaching', dept: 'Science', subject: 'Chemistry', tenure: '10 Years', salary: '₹80,500 / mo', pfNo: 'PF-DL-2016-1029', phone: '+91 98112 40104', email: 'rajesh.mehra@eduflow.edu', status: 'Active', attendance: '97.5%', rating: '4.85/5.0', qualifications: 'M.Sc, M.Phil, B.Ed' },
  { id: 'TCH-105', name: 'Mrs. Deepa Krishnan', role: 'Head of Computer Science & AI', category: 'Teaching', dept: 'IT & CS', subject: 'Python, AI & ML', tenure: '6 Years', salary: '₹78,000 / mo', pfNo: 'PF-DL-2020-6621', phone: '+91 98112 40105', email: 'deepa.k@eduflow.edu', status: 'Active', attendance: '99.1%', rating: '4.95/5.0', qualifications: 'M.Tech Computer Science, B.Ed' },
  { id: 'EMP-201', name: 'Mr. Rajesh Sharma', role: 'Chief Administrative Officer (CAO)', category: 'Administration', dept: 'Administration', subject: 'Campus Operations', tenure: '11 Years', salary: '₹1,15,000 / mo', pfNo: 'PF-DL-2015-0012', phone: '+91 98112 40201', email: 'rajesh.admin@eduflow.edu', status: 'Active', attendance: '99.0%', rating: '4.9/5.0', qualifications: 'MBA (Public Admin), LL.B' },
  { id: 'EMP-202', name: 'Ms. Priya Verma', role: 'Senior Accounts Officer', category: 'Finance', dept: 'Finance & Accounts', subject: 'Audits & Payroll', tenure: '5 Years', salary: '₹68,000 / mo', pfNo: 'PF-DL-2021-3310', phone: '+91 98112 40202', email: 'priya.accounts@eduflow.edu', status: 'Active', attendance: '96.5%', rating: '4.75/5.0', qualifications: 'CA (Inter), M.Com' },
  { id: 'EMP-203', name: 'Mr. Harish Chandra', role: 'Fleet Manager & Transport Head', category: 'Transport', dept: 'Transport & Fleet', subject: 'Fleet Routing & GPS', tenure: '9 Years', salary: '₹48,000 / mo', pfNo: 'PF-DL-2017-5591', phone: '+91 98112 40203', email: 'harish.fleet@eduflow.edu', status: 'Active', attendance: '99.4%', rating: '4.9/5.0', qualifications: 'Automotive Diploma, HMV Master' },
  { id: 'HR-101', name: 'Mrs. Shweta Kapoor', role: 'Head of Human Resources (HR)', category: 'HR & Ops', dept: 'HR & Personnel', subject: 'Recruitment & Compliance', tenure: '6 Years', salary: '₹88,000 / mo', pfNo: 'PF-DL-2020-1122', phone: '+91 98112 33001', email: 'shweta.hr@eduflow.edu', status: 'Active', attendance: '99.2%', rating: '4.9/5.0', qualifications: 'MBA in Human Resources (XLRI)' },
  { id: 'EMP-204', name: 'Ms. Neha Kulkarni', role: 'Head Nurse & Health Counselor', category: 'Medical', dept: 'Medical & Infirmary', subject: 'Emergency Health Care', tenure: '5 Years', salary: '₹54,000 / mo', pfNo: 'PF-DL-2021-8840', phone: '+91 98112 40204', email: 'health.neha@eduflow.edu', status: 'Active', attendance: '97.0%', rating: '4.85/5.0', qualifications: 'B.Sc Nursing, Pediatric Care' },
];

export default function OwnerStaffPage() {
  const [staffList] = useState(OWNER_STAFF_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [selectedStaff, setSelectedStaff] = useState(null);

  const filtered = staffList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.dept.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = deptFilter === 'ALL' || s.dept === deptFilter;
    return matchesSearch && matchesDept;
  });

  const departments = ['ALL', ...Array.from(new Set(staffList.map((s) => s.dept)))];

  const handleExport = () => {
    const headers = ['ID,Name,Role,Department,Tenure,Monthly Salary,Status,Phone,Email,Rating'];
    const rows = staffList.map(
      (s) => `"${s.id}","${s.name}","${s.role}","${s.dept}","${s.tenure}","${s.salary}","${s.status}","${s.phone}","${s.email}","${s.rating}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Executive_Staff_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Clean Standard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <LuUsers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">School Staff & Faculty Overview</h1>
            <p className="text-xs text-gray-400">Complete institutional staff roster, payroll commitments, and performance metrics</p>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-2 border border-gray-200 transition-colors shadow-xs self-start sm:self-auto"
        >
          <LuDownload className="w-4 h-4 text-gray-500" /> Export Staff Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Staff Strength</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">186 Personnel</p>
          <p className="text-xs text-gray-400 mt-0.5">Faculty & Support</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider">Monthly Payroll</span>
          <p className="text-2xl font-bold text-primary-600 mt-1">₹1.24 Cr / mo</p>
          <p className="text-xs text-gray-400 mt-0.5">Disbursed 1st of month</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Avg Staff Attendance</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">96.8%</p>
          <p className="text-xs text-emerald-700 font-medium mt-0.5">Verified Biometric</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Average Tenure</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">6.4 Years</p>
          <p className="text-xs text-gray-400 mt-0.5">94% Retention Rate</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <LuSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search staff by name, ID, role or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d === 'ALL' ? 'All Departments' : d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 font-semibold">Staff Member</th>
                <th className="py-3.5 px-4 font-semibold">Designation & Department</th>
                <th className="py-3.5 px-4 font-semibold">Tenure & Exp</th>
                <th className="py-3.5 px-4 font-semibold">Monthly Salary</th>
                <th className="py-3.5 px-4 font-semibold">Performance Rating</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((staff) => (
                <tr
                  key={staff.id}
                  onClick={() => setSelectedStaff(staff)}
                  className="hover:bg-gray-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-gray-900">{staff.name}</p>
                    <p className="text-[11px] text-gray-400 font-mono">{staff.id}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-medium text-gray-800">{staff.role}</p>
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600 mt-0.5">
                      {staff.dept}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-gray-700 font-medium">{staff.tenure}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">{staff.salary}</td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-amber-600">⭐ {staff.rating}</span>
                    <span className="text-[10px] text-gray-400 block">{staff.attendance} Attd</span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                        staff.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {staff.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStaff(staff);
                      }}
                      className="px-2.5 py-1 rounded bg-gray-100 hover:bg-primary-50 hover:text-primary-700 text-gray-700 font-semibold text-xs transition-colors whitespace-nowrap"
                    >
                      Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* STAFF DETAIL MODAL */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col animate-slide-up border border-gray-200">
            <div className="bg-white border-b border-gray-200 p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-800">{selectedStaff.name}</h3>
                <p className="text-xs text-gray-400">{selectedStaff.role} • {selectedStaff.id}</p>
              </div>
              <button
                onClick={() => setSelectedStaff(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Department & Category:</span>
                  <strong className="text-gray-800">{selectedStaff.dept} ({selectedStaff.category})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Monthly Remuneration:</span>
                  <strong className="text-emerald-700 text-sm">{selectedStaff.salary}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">PF Number:</span>
                  <strong className="text-gray-800 font-mono">{selectedStaff.pfNo}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Qualifications:</span>
                  <span className="text-gray-800 font-medium">{selectedStaff.qualifications}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Contact:</span>
                  <span className="text-gray-800">{selectedStaff.phone} • {selectedStaff.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Attendance & Rating:</span>
                  <span className="font-semibold text-primary-700">{selectedStaff.attendance} Attendance • ⭐ {selectedStaff.rating}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end">
              <button
                onClick={() => setSelectedStaff(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
