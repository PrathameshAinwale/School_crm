import React, { useState } from 'react';
import {
  LuGraduationCap,
  LuSearch,
  LuDownload,
  LuUsers,
  LuBus,
  LuChartPie,
  LuBuilding2,
} from 'react-icons/lu';

const CLASS_WISE_STUDENTS = [
  { grade: 'Class XII', wing: 'Senior Secondary', sections: 4, enrolled: 210, capacity: 220, boys: 112, girls: 98, transitUsers: 142, dayScholars: 68, coordinator: 'Dr. Ananya Sen', avgAttendance: '95.8%' },
  { grade: 'Class XI', wing: 'Senior Secondary', sections: 4, enrolled: 224, capacity: 230, boys: 120, girls: 104, transitUsers: 156, dayScholars: 68, coordinator: 'Mr. Vikram Rathore', avgAttendance: '94.5%' },
  { grade: 'Class X', wing: 'Secondary', sections: 4, enrolled: 248, capacity: 250, boys: 130, girls: 118, transitUsers: 168, dayScholars: 80, coordinator: 'Ms. Sunita Rao', avgAttendance: '96.4%' },
  { grade: 'Class IX', wing: 'Secondary', sections: 4, enrolled: 236, capacity: 250, boys: 124, girls: 112, transitUsers: 154, dayScholars: 82, coordinator: 'Mr. Rajesh Mehra', avgAttendance: '95.0%' },
  { grade: 'Class VIII', wing: 'Middle Wing', sections: 4, enrolled: 240, capacity: 250, boys: 126, girls: 114, transitUsers: 160, dayScholars: 80, coordinator: 'Mrs. Deepa Krishnan', avgAttendance: '96.0%' },
  { grade: 'Class VII', wing: 'Middle Wing', sections: 3, enrolled: 232, capacity: 240, boys: 118, girls: 114, transitUsers: 148, dayScholars: 84, coordinator: 'Mr. Alok Verma', avgAttendance: '95.5%' },
  { grade: 'Class VI', wing: 'Middle Wing', sections: 3, enrolled: 228, capacity: 240, boys: 115, girls: 113, transitUsers: 142, dayScholars: 86, coordinator: 'Mrs. Kavita Saxena', avgAttendance: '96.2%' },
  { grade: 'Class V', wing: 'Primary Wing', sections: 3, enrolled: 215, capacity: 225, boys: 110, girls: 105, transitUsers: 138, dayScholars: 77, coordinator: 'Mrs. Kavita Saxena', avgAttendance: '97.0%' },
  { grade: 'Class IV', wing: 'Primary Wing', sections: 3, enrolled: 210, capacity: 220, boys: 108, girls: 102, transitUsers: 134, dayScholars: 76, coordinator: 'Mrs. Kavita Saxena', avgAttendance: '96.8%' },
  { grade: 'Class III', wing: 'Primary Wing', sections: 3, enrolled: 212, capacity: 220, boys: 112, girls: 100, transitUsers: 136, dayScholars: 76, coordinator: 'Mrs. Kavita Saxena', avgAttendance: '97.2%' },
  { grade: 'Class II', wing: 'Primary Wing', sections: 3, enrolled: 208, capacity: 220, boys: 106, girls: 102, transitUsers: 130, dayScholars: 78, coordinator: 'Mrs. Kavita Saxena', avgAttendance: '97.5%' },
  { grade: 'Class I', wing: 'Primary Wing', sections: 3, enrolled: 208, capacity: 220, boys: 107, girls: 101, transitUsers: 132, dayScholars: 76, coordinator: 'Mrs. Kavita Saxena', avgAttendance: '97.4%' },
  { grade: 'Kindergarten (KG)', wing: 'Pre-Primary', sections: 2, enrolled: 92, capacity: 100, boys: 48, girls: 44, transitUsers: 40, dayScholars: 52, coordinator: 'Mrs. S. Gill', avgAttendance: '98.0%' },
  { grade: 'Nursery', wing: 'Pre-Primary', sections: 2, enrolled: 84, capacity: 90, boys: 44, girls: 40, transitUsers: 34, dayScholars: 50, coordinator: 'Mrs. A. David', avgAttendance: '98.5%' },
];

export default function OwnerStudentCountPage() {
  const [classList] = useState(CLASS_WISE_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [wingFilter, setWingFilter] = useState('ALL');

  const totalStudents = classList.reduce((acc, c) => acc + c.enrolled, 0);
  const totalCapacity = classList.reduce((acc, c) => acc + c.capacity, 0);
  const totalBoys = classList.reduce((acc, c) => acc + c.boys, 0);
  const totalGirls = classList.reduce((acc, c) => acc + c.girls, 0);
  const totalTransit = classList.reduce((acc, c) => acc + c.transitUsers, 0);
  const totalSections = classList.reduce((acc, c) => acc + c.sections, 0);

  const filtered = classList.filter((c) => {
    const matchesSearch =
      c.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.wing.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.coordinator.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesWing = wingFilter === 'ALL' || c.wing === wingFilter;
    return matchesSearch && matchesWing;
  });

  const wings = ['ALL', ...Array.from(new Set(classList.map((c) => c.wing)))];

  const handleExport = () => {
    const headers = ['Grade,Wing,Sections,Enrolled,Capacity,Utilization,Boys,Girls,Transit Users,Day Scholars,Coordinator,Attendance'];
    const rows = classList.map(
      (c) =>
        `"${c.grade}","${c.wing}","${c.sections}","${c.enrolled}","${c.capacity}","${Math.round((c.enrolled / c.capacity) * 100)}%","${c.boys}","${c.girls}","${c.transitUsers}","${c.dayScholars}","${c.coordinator}","${c.avgAttendance}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Cumulative_Student_Count_Report_${new Date().toISOString().split('T')[0]}.csv`);
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
            <LuGraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Student Strength & Class-wise Directory</h1>
            <p className="text-xs text-gray-400">Cumulative enrollment statistics, capacity utilization, gender ratio, and transit metrics</p>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-2 border border-gray-200 transition-colors shadow-xs self-start sm:self-auto"
        >
          <LuDownload className="w-4 h-4 text-gray-500" /> Export Student Count Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cumulative Enrollment</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">{totalStudents.toLocaleString()} Students</p>
          <p className="text-xs text-gray-400 mt-0.5">14 Grades • {totalSections} Sections</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Capacity Utilization</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {Math.round((totalStudents / totalCapacity) * 100)}%
          </p>
          <p className="text-xs text-emerald-700 font-medium mt-0.5">
            {totalStudents} / {totalCapacity} Seats
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider">Gender Breakdown</span>
          <p className="text-2xl font-bold text-primary-600 mt-1">
            {totalBoys}B • {totalGirls}G
          </p>
          <p className="text-xs text-gray-400 mt-0.5">52.3% Boys / 47.7% Girls</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">School Transit Users</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">{totalTransit.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-0.5">62.6% Fleet Bus Riders</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <LuSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by grade, wing, or class coordinator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={wingFilter}
            onChange={(e) => setWingFilter(e.target.value)}
            className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none"
          >
            {wings.map((w) => (
              <option key={w} value={w}>
                {w === 'ALL' ? 'All Wings (Nursery - XII)' : w}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Class Wise Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 font-semibold">Grade & Wing</th>
                <th className="py-3.5 px-4 font-semibold">Sections</th>
                <th className="py-3.5 px-4 font-semibold">Enrolled Students</th>
                <th className="py-3.5 px-4 font-semibold">Capacity & Occupancy</th>
                <th className="py-3.5 px-4 font-semibold">Boys / Girls</th>
                <th className="py-3.5 px-4 font-semibold">Transit Fleet Users</th>
                <th className="py-3.5 px-4 font-semibold">Class Coordinator</th>
                <th className="py-3.5 px-4 font-semibold text-center">Avg Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item) => {
                const util = Math.round((item.enrolled / item.capacity) * 100);
                return (
                  <tr key={item.grade} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900 text-sm">{item.grade}</p>
                      <span className="text-[10px] text-gray-400 font-medium">{item.wing}</span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-primary-700">
                      {item.sections} Sections
                    </td>

                    <td className="py-3.5 px-4">
                      <strong className="text-gray-900 text-sm font-bold">{item.enrolled}</strong>
                      <span className="text-gray-400 text-xs"> students</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-700 font-medium">{item.enrolled} / {item.capacity}</span>
                        <span className="font-bold text-emerald-700">{util}%</span>
                      </div>
                      <div className="w-28 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-600"
                          style={{ width: `${util}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-gray-700 font-medium">
                      {item.boys} Boys • {item.girls} Girls
                    </td>

                    <td className="py-3.5 px-4 text-gray-700">
                      <span className="font-semibold text-gray-900">{item.transitUsers}</span> ({item.dayScholars} Day Scholars)
                    </td>

                    <td className="py-3.5 px-4 text-gray-800 font-medium">{item.coordinator}</td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                        {item.avgAttendance}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
