import React, { useState } from 'react';
import {
  LuUsers,
  LuCalendar,
  LuChevronLeft,
  LuChevronRight,
  LuSearch,
  LuClipboardList,
  LuBuilding2,
} from 'react-icons/lu';

const ALL_STAFF_ATTENDANCE = [
  // HR Operations Staff
  { id: 'HR-101', name: 'Mrs. Shweta Kapoor', role: 'Head of Human Resources (HR)', dept: 'HR & Personnel', inTime: '07:50 AM', outTime: '04:30 PM', duration: '8h 40m', status: 'Present', device: 'RFID (Admin Gate)', rate: 99.2, phone: '+91 98112 33001' },
  { id: 'HR-102', name: 'Mr. Nikhil Malhotra', role: 'HR & Payroll Operations Lead', dept: 'HR & Personnel', inTime: '07:55 AM', outTime: '04:15 PM', duration: '8h 20m', status: 'Present', device: 'RFID (Admin Gate)', rate: 98.0, phone: '+91 98112 33002' },
  { id: 'HR-103', name: 'Ms. Aarti Nair', role: 'Talent Acquisition & Faculty Welfare', dept: 'HR & Personnel', inTime: '08:05 AM', outTime: '04:30 PM', duration: '8h 25m', status: 'Present', device: 'RFID (Admin Gate)', rate: 97.4, phone: '+91 98112 33003' },

  // Teaching Staff
  { id: 'TCH-101', name: 'Dr. Ananya Sen', role: 'Senior PGT Mathematics & HOD', dept: 'Teaching Faculty', inTime: '07:42 AM', outTime: '03:50 PM', duration: '8h 08m', status: 'Present', device: 'Facial Recog (Academic)', rate: 98.4, phone: '+91 98112 40101' },
  { id: 'TCH-102', name: 'Mr. Vikram Rathore', role: 'PGT Physics & Robotics Mentor', dept: 'Teaching Faculty', inTime: '07:48 AM', outTime: '03:45 PM', duration: '7h 57m', status: 'Present', device: 'Facial Recog (Academic)', rate: 96.8, phone: '+91 98112 40102' },
  { id: 'TCH-103', name: 'Ms. Sunita Rao', role: 'TGT English Literature', dept: 'Teaching Faculty', inTime: '-', outTime: '-', duration: '-', status: 'On Leave', device: 'Leave App #LV-891', rate: 94.2, phone: '+91 98112 40103' },
  { id: 'TCH-104', name: 'Mr. Rajesh Mehra', role: 'PGT Chemistry & Lab Coordinator', dept: 'Teaching Faculty', inTime: '07:45 AM', outTime: '03:45 PM', duration: '8h 00m', status: 'Present', device: 'Facial Recog (Academic)', rate: 97.5, phone: '+91 98112 40104' },
  { id: 'TCH-105', name: 'Mrs. Deepa Krishnan', role: 'Head of Computer Science & AI', dept: 'Teaching Faculty', inTime: '07:40 AM', outTime: '04:10 PM', duration: '8h 30m', status: 'Present', device: 'RFID (CS Wing)', rate: 99.1, phone: '+91 98112 40105' },
  { id: 'TCH-106', name: 'Mr. Manoj Joshi', role: 'TGT Social Sciences', dept: 'Teaching Faculty', inTime: '-', outTime: '-', duration: '-', status: 'Suspended', device: 'Suspension Order', rate: 84.0, phone: '+91 98112 40106' },
  { id: 'TCH-107', name: 'Mrs. Kavita Saxena', role: 'PRT Primary Educator & Arts Head', dept: 'Teaching Faculty', inTime: '07:44 AM', outTime: '02:50 PM', duration: '7h 06m', status: 'Present', device: 'Facial Recog (Primary)', rate: 95.5, phone: '+91 98112 40107' },
  { id: 'TCH-108', name: 'Mr. Alok Verma', role: 'TGT Hindi & Sanskrit', dept: 'Teaching Faculty', inTime: '07:50 AM', outTime: '03:45 PM', duration: '7h 55m', status: 'Present', device: 'Facial Recog (Academic)', rate: 97.2, phone: '+91 98112 40108' },

  // Administration & Support
  { id: 'EMP-201', name: 'Mr. Rajesh Sharma', role: 'Chief Administrative Officer (CAO)', dept: 'Administration', inTime: '07:55 AM', outTime: '05:10 PM', duration: '9h 15m', status: 'Present', device: 'RFID (Admin Gate)', rate: 99.0, phone: '+91 98112 40201' },
  { id: 'EMP-202', name: 'Ms. Priya Verma', role: 'Senior Accounts Officer', dept: 'Finance & Accounts', inTime: '08:08 AM', outTime: '04:45 PM', duration: '8h 37m', status: 'Late', device: 'RFID (Admin Gate)', rate: 96.5, phone: '+91 98112 40202' },
  { id: 'EMP-203', name: 'Mr. Harish Chandra', role: 'Fleet Manager & Transport Head', dept: 'Transport & Fleet', inTime: '06:30 AM', outTime: '05:30 PM', duration: '11h 00m', status: 'Present', device: 'RFID (Transport Bay)', rate: 99.4, phone: '+91 98112 40203' },
  { id: 'EMP-204', name: 'Ms. Neha Kulkarni', role: 'School Nurse & Health Counselor', dept: 'Medical & Infirmary', inTime: '07:45 AM', outTime: '04:00 PM', duration: '8h 15m', status: 'Present', device: 'RFID (Infirmary)', rate: 97.0, phone: '+91 98112 40204' },
];

export default function AdminAttendancePage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const shiftDate = (deltaDays) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + deltaDays);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const filteredAttendance = ALL_STAFF_ATTENDANCE.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.dept.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = deptFilter === 'ALL' || staff.dept === deptFilter;
    const matchesStatus = statusFilter === 'ALL' || staff.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalStaff = ALL_STAFF_ATTENDANCE.length;
  const presentCount = ALL_STAFF_ATTENDANCE.filter((s) => s.status === 'Present' || s.status === 'Late').length;
  const onLeaveCount = ALL_STAFF_ATTENDANCE.filter((s) => s.status === 'On Leave').length;
  const hrStaffCount = ALL_STAFF_ATTENDANCE.filter((s) => s.dept === 'HR & Personnel').length;
  const hrPresentCount = ALL_STAFF_ATTENDANCE.filter((s) => s.dept === 'HR & Personnel' && s.status === 'Present').length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Clean Standard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <LuClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Staff & HR Daily Attendance</h1>
            <p className="text-xs text-gray-400">School-wide biometric muster roll for faculty, HR, and support staff</p>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
          <button
            onClick={() => shiftDate(-1)}
            className="p-1.5 hover:bg-white rounded text-gray-600 transition-colors"
          >
            <LuChevronLeft className="w-4 h-4" />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-gray-800 font-semibold text-xs focus:outline-none cursor-pointer px-1"
          />
          <button
            onClick={() => shiftDate(1)}
            className="p-1.5 hover:bg-white rounded text-gray-600 transition-colors"
          >
            <LuChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Staff</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">{totalStaff} Roster</p>
          <p className="text-xs text-gray-400 mt-0.5">All Wings</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Staff Present</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{presentCount}</p>
          <p className="text-xs text-emerald-700 font-medium mt-0.5">
            {Math.round((presentCount / totalStaff) * 100)}% Verified
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider">HR Operations Team</span>
          <p className="text-2xl font-bold text-primary-600 mt-1">{hrPresentCount}/{hrStaffCount}</p>
          <p className="text-xs text-primary-700 font-medium mt-0.5">100% Present</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-100 bg-blue-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">On Leave</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">{onLeaveCount}</p>
          <p className="text-xs text-blue-700 font-medium mt-0.5">Approved</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <LuSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by staff name, ID, role or department..."
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
              <option value="ALL">All Departments (Inc. HR)</option>
              <option value="HR & Personnel">HR & Personnel Only</option>
              <option value="Teaching Faculty">Teaching Faculty</option>
              <option value="Administration">Administration</option>
              <option value="Finance & Accounts">Finance & Accounts</option>
              <option value="Transport & Fleet">Transport & Fleet</option>
              <option value="Medical & Infirmary">Medical & Infirmary</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="Present">Present Only</option>
              <option value="On Leave">On Leave</option>
              <option value="Late">Late Clock-In</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 font-semibold">Staff Member & ID</th>
                <th className="py-3.5 px-4 font-semibold">Department & Role</th>
                <th className="py-3.5 px-4 font-semibold">In Time</th>
                <th className="py-3.5 px-4 font-semibold">Out Time</th>
                <th className="py-3.5 px-4 font-semibold">Work Duration</th>
                <th className="py-3.5 px-4 font-semibold">Biometric Terminal</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAttendance.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-gray-900">{staff.name}</p>
                    <p className="text-[11px] text-gray-400 font-mono">{staff.id}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-medium text-gray-800">{staff.role}</p>
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md mt-0.5 ${
                        staff.dept === 'HR & Personnel'
                          ? 'bg-primary-50 text-primary-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {staff.dept}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-gray-800">{staff.inTime}</td>
                  <td className="py-3.5 px-4 font-semibold text-gray-800">{staff.outTime}</td>
                  <td className="py-3.5 px-4 font-mono text-gray-700">{staff.duration}</td>
                  <td className="py-3.5 px-4 text-[11px] text-gray-500">{staff.device}</td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        staff.status === 'Present'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : staff.status === 'Late'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : staff.status === 'On Leave'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {staff.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
