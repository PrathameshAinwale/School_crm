import React, { useState } from 'react';
import {
  LuGraduationCap,
  LuSearch,
  LuChevronRight,
  LuUserPlus,
  LuX,
  LuArrowLeft,
} from 'react-icons/lu';

const SCHOOL_CLASSES_DATA = [
  {
    id: 'class-12',
    name: 'Class XII (Senior Secondary)',
    shortName: 'Class XII',
    wing: 'Senior Secondary',
    totalStudents: 210,
    attendanceRate: 95.8,
    classHead: 'Dr. Ananya Sen',
    divisions: [
      {
        id: '12-A',
        name: 'Section A (Science - PCM)',
        code: 'XII-A',
        room: 'Room 401',
        classTeacher: 'Dr. Ananya Sen',
        capacity: 42,
        studentsCount: 38,
        avgScore: '89.4%',
        students: [
          { roll: '1201', admNo: 'ADM-2018-401', name: 'Aarav Sharma', gender: 'Male', dob: '14 Jan 2009', blood: 'O+', parent: 'Dr. Vivek Sharma', phone: '+91 98112 11001', email: 'sharma.vivek@gmail.com', attendance: '97.5%', avgGrade: '94.2% (A1)', feeStatus: 'Paid', busRoute: 'Bus #04 (Rohini)', address: 'Sector 14, Rohini, New Delhi' },
          { roll: '1202', admNo: 'ADM-2018-402', name: 'Diya Rathore', gender: 'Female', dob: '22 Mar 2009', blood: 'B+', parent: 'Mr. R. S. Rathore', phone: '+91 98112 11002', email: 'rathore.rs@yahoo.com', attendance: '98.2%', avgGrade: '96.8% (A1)', feeStatus: 'Paid', busRoute: 'Bus #09 (Pitampura)', address: 'Pitampura, New Delhi' },
          { roll: '1203', admNo: 'ADM-2018-403', name: 'Kabir Verma', gender: 'Male', dob: '05 Sep 2008', blood: 'AB+', parent: 'Mr. Rajesh Verma', phone: '+91 98112 11003', email: 'verma.rajesh@gmail.com', attendance: '92.0%', avgGrade: '84.5% (A2)', feeStatus: 'Paid', busRoute: 'Bus #15 (Dwarka)', address: 'Janakpuri, New Delhi' },
          { roll: '1204', admNo: 'ADM-2018-404', name: 'Rhea Sengupta', gender: 'Female', dob: '18 Nov 2008', blood: 'A+', parent: 'Dr. P. Sengupta', phone: '+91 98112 11004', email: 'sengupta.p@hospital.org', attendance: '99.1%', avgGrade: '98.4% (A1)', feeStatus: 'Paid', busRoute: 'Day Scholar', address: 'Model Town Phase 2, Delhi' },
        ],
      },
      {
        id: '12-B',
        name: 'Section B (Science - PCB)',
        code: 'XII-B',
        room: 'Room 402',
        classTeacher: 'Mr. Vikram Rathore',
        capacity: 40,
        studentsCount: 36,
        avgScore: '86.2%',
        students: [],
      },
      {
        id: '12-C',
        name: 'Section C (Commerce)',
        code: 'XII-C',
        room: 'Room 403',
        classTeacher: 'Mrs. Deepa Krishnan',
        capacity: 42,
        studentsCount: 40,
        avgScore: '87.8%',
        students: [],
      },
      {
        id: '12-D',
        name: 'Section D (Humanities)',
        code: 'XII-D',
        room: 'Room 404',
        classTeacher: 'Mr. Alok Verma',
        capacity: 40,
        studentsCount: 36,
        avgScore: '88.5%',
        students: [],
      },
    ],
  },
  {
    id: 'class-11',
    name: 'Class XI (Senior Secondary)',
    shortName: 'Class XI',
    wing: 'Senior Secondary',
    totalStudents: 224,
    attendanceRate: 94.5,
    classHead: 'Mr. Vikram Rathore',
    divisions: [
      { id: '11-A', name: 'Section A (Science - PCM)', code: 'XI-A', room: 'Room 301', classTeacher: 'Mr. Vikram Rathore', capacity: 42, studentsCount: 40, avgScore: '86.5%', students: [] },
      { id: '11-B', name: 'Section B (Science - PCB)', code: 'XI-B', room: 'Room 302', classTeacher: 'Mr. Rajesh Mehra', capacity: 40, studentsCount: 38, avgScore: '85.2%', students: [] },
      { id: '11-C', name: 'Section C (Commerce)', code: 'XI-C', room: 'Room 303', classTeacher: 'Ms. Sunita Rao', capacity: 42, studentsCount: 41, avgScore: '87.0%', students: [] },
      { id: '11-D', name: 'Section D (Humanities)', code: 'XI-D', room: 'Room 304', classTeacher: 'Mr. Alok Verma', capacity: 40, studentsCount: 35, avgScore: '88.1%', students: [] },
    ],
  },
  {
    id: 'class-10',
    name: 'Class X (Secondary)',
    shortName: 'Class X',
    wing: 'Secondary',
    totalStudents: 248,
    attendanceRate: 96.4,
    classHead: 'Ms. Sunita Rao',
    divisions: [
      { id: '10-A', name: 'Section A', code: 'X-A', room: 'Room 201', classTeacher: 'Dr. Ananya Sen', capacity: 42, studentsCount: 41, avgScore: '91.2%', students: [] },
      { id: '10-B', name: 'Section B', code: 'X-B', room: 'Room 202', classTeacher: 'Mr. Rajesh Mehra', capacity: 42, studentsCount: 40, avgScore: '88.0%', students: [] },
      { id: '10-C', name: 'Section C', code: 'X-C', room: 'Room 203', classTeacher: 'Ms. Sunita Rao', capacity: 42, studentsCount: 39, avgScore: '86.5%', students: [] },
      { id: '10-D', name: 'Section D', code: 'X-D', room: 'Room 204', classTeacher: 'Mrs. Deepa Krishnan', capacity: 40, studentsCount: 38, avgScore: '89.4%', students: [] },
    ],
  },
  {
    id: 'class-9',
    name: 'Class IX (Secondary)',
    shortName: 'Class IX',
    wing: 'Secondary',
    totalStudents: 236,
    attendanceRate: 95.0,
    classHead: 'Mr. Rajesh Mehra',
    divisions: [
      { id: '9-A', name: 'Section A', code: 'IX-A', room: 'Room 101', classTeacher: 'Mrs. Deepa Krishnan', capacity: 42, studentsCount: 40, avgScore: '87.4%', students: [] },
      { id: '9-B', name: 'Section B', code: 'IX-B', room: 'Room 102', classTeacher: 'Ms. Sunita Rao', capacity: 42, studentsCount: 39, avgScore: '86.0%', students: [] },
    ],
  },
  {
    id: 'class-8',
    name: 'Class VIII (Middle Wing)',
    shortName: 'Class VIII',
    wing: 'Middle Wing',
    totalStudents: 240,
    attendanceRate: 96.0,
    classHead: 'Mrs. Kavita Saxena',
    divisions: [
      { id: '8-A', name: 'Section A', code: 'VIII-A', room: 'Room M-201', classTeacher: 'Mrs. Deepa K.', capacity: 42, studentsCount: 41, avgScore: '88.5%', students: [] },
      { id: '8-B', name: 'Section B', code: 'VIII-B', room: 'Room M-202', classTeacher: 'Mr. Alok Verma', capacity: 42, studentsCount: 40, avgScore: '87.2%', students: [] },
    ],
  },
  {
    id: 'class-7',
    name: 'Class VII (Middle Wing)',
    shortName: 'Class VII',
    wing: 'Middle Wing',
    totalStudents: 232,
    attendanceRate: 95.5,
    classHead: 'Mr. Alok Verma',
    divisions: [
      { id: '7-A', name: 'Section A', code: 'VII-A', room: 'Room M-101', classTeacher: 'Mr. Manoj Joshi', capacity: 42, studentsCount: 39, avgScore: '87.0%', students: [] },
    ],
  },
  {
    id: 'class-6',
    name: 'Class VI (Middle Wing)',
    shortName: 'Class VI',
    wing: 'Middle Wing',
    totalStudents: 228,
    attendanceRate: 96.2,
    classHead: 'Mrs. Kavita Saxena',
    divisions: [
      { id: '6-A', name: 'Section A', code: 'VI-A', room: 'Room M-01', classTeacher: 'Mr. Alok Verma', capacity: 42, studentsCount: 39, avgScore: '89.1%', students: [] },
    ],
  },
  {
    id: 'class-primary',
    name: 'Primary Wing (Classes I - V)',
    shortName: 'Primary (I-V)',
    wing: 'Primary Wing',
    totalStudents: 1083,
    attendanceRate: 97.2,
    classHead: 'Mrs. Kavita Saxena',
    divisions: [
      { id: 'p-5a', name: 'Class V - Section A', code: 'V-A', room: 'Room P-301', classTeacher: 'Mrs. Kavita Saxena', capacity: 40, studentsCount: 38, avgScore: '92.0%', students: [] },
      { id: 'p-4a', name: 'Class IV - Section A', code: 'IV-A', room: 'Room P-201', classTeacher: 'Mrs. N. Sharma', capacity: 40, studentsCount: 36, avgScore: '93.0%', students: [] },
      { id: 'p-3a', name: 'Class III - Section A', code: 'III-A', room: 'Room P-101', classTeacher: 'Mrs. K. Saxena', capacity: 40, studentsCount: 37, avgScore: '94.1%', students: [] },
      { id: 'p-2a', name: 'Class II - Section A', code: 'II-A', room: 'Room KG-201', classTeacher: 'Mrs. R. Bose', capacity: 38, studentsCount: 35, avgScore: '95.0%', students: [] },
      { id: 'p-1a', name: 'Class I - Section A', code: 'I-A', room: 'Room KG-101', classTeacher: 'Mrs. K. Saxena', capacity: 38, studentsCount: 37, avgScore: '96.2%', students: [] },
    ],
  },
  {
    id: 'class-kg',
    name: 'Kindergarten & Nursery (Pre-Primary)',
    shortName: 'Pre-Primary',
    wing: 'Pre-Primary',
    totalStudents: 176,
    attendanceRate: 98.4,
    classHead: 'Mrs. Kavita Saxena',
    divisions: [
      { id: 'kg-a', name: 'Nursery Wing A', code: 'NUR-A', room: 'Playroom 01', classTeacher: 'Mrs. A. David', capacity: 30, studentsCount: 28, avgScore: 'Grade A+', students: [] },
      { id: 'kg-b', name: 'KG Prep Wing B', code: 'KG-B', room: 'Playroom 02', classTeacher: 'Mrs. S. Gill', capacity: 30, studentsCount: 29, avgScore: 'Grade A+', students: [] },
    ],
  },
];

export default function AdminStudentsPage() {
  const [classesData] = useState(SCHOOL_CLASSES_DATA);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [wingFilter, setWingFilter] = useState('ALL');

  const totalStudents = classesData.reduce((acc, c) => acc + c.totalStudents, 0);
  const totalSections = classesData.reduce((acc, c) => acc + c.divisions.length, 0);

  const handleSelectClass = (cls) => {
    setSelectedClass(cls);
    if (cls.divisions && cls.divisions.length > 0) {
      setSelectedDivision(cls.divisions[0]);
    } else {
      setSelectedDivision(null);
    }
  };

  const getActiveDivisionStudents = () => {
    if (!selectedDivision) return [];
    if (selectedDivision.students && selectedDivision.students.length > 0) {
      return selectedDivision.students;
    }
    const names = [
      'Aarav Sharma', 'Diya Rathore', 'Kabir Verma', 'Rhea Sengupta', 'Siddharth Iyer',
      'Ananya Roy', 'Rohan Mehra', 'Tanvi Kapoor', 'Ishaan Batra', 'Kavya Nair',
      'Aditya Mathur', 'Pranav Saxena', 'Simran Chadha', 'Zoya Khan', 'Armaan Malik'
    ];
    return Array.from({ length: selectedDivision.studentsCount || 15 }).map((_, idx) => ({
      roll: `${selectedDivision.code}-${String(idx + 1).padStart(2, '0')}`,
      admNo: `ADM-2022-${100 + idx}`,
      name: names[idx % names.length] + (idx >= names.length ? ` (${idx + 1})` : ''),
      gender: idx % 2 === 0 ? 'Female' : 'Male',
      dob: '12 Aug 2012',
      blood: ['O+', 'A+', 'B+', 'AB+'][idx % 4],
      parent: `Mr. & Mrs. ${names[idx % names.length].split(' ')[1]}`,
      phone: `+91 98112 ${10000 + idx * 5}`,
      email: `parent.${idx + 1}@eduflow.edu`,
      attendance: `${92 + (idx % 7)}%`,
      avgGrade: `${84 + (idx % 15)}% (A1)`,
      feeStatus: idx % 6 === 0 ? 'Pending' : 'Paid',
      busRoute: idx % 2 === 0 ? 'Bus #04 (Rohini)' : 'Day Scholar',
      address: 'Rohini Sector 14, New Delhi',
    }));
  };

  const currentStudents = getActiveDivisionStudents().filter((s) => {
    return (
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roll.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.parent.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredClasses = classesData.filter((c) => {
    if (wingFilter !== 'ALL' && c.wing !== wingFilter) return false;
    if (searchQuery && !selectedClass) {
      return (
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.divisions.some((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Clean Standard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <LuGraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Students & Class Divisions</h1>
            <p className="text-xs text-gray-400">Class directories, division strengths, and student rosters</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {selectedClass && (
            <button
              onClick={() => {
                setSelectedClass(null);
                setSelectedDivision(null);
              }}
              className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-gray-200 transition-colors shadow-xs"
            >
              <LuArrowLeft className="w-4 h-4" /> All Classes
            </button>
          )}
          <button
            onClick={() => alert('Enrollment Form')}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <LuUserPlus className="w-4 h-4" /> Enroll Student
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Enrolled</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">{totalStudents.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-0.5">Nursery to Grade XII</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider">Active Grades</span>
          <p className="text-2xl font-bold text-primary-600 mt-1">{classesData.length} Grades</p>
          <p className="text-xs text-gray-400 mt-0.5">All Wings</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Sections</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">{totalSections} Sections</p>
          <p className="text-xs text-gray-400 mt-0.5">Avg 38 per div</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Attendance Rate</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">96.2%</p>
          <p className="text-xs text-emerald-700 font-medium mt-0.5">Today's Presence</p>
        </div>
      </div>

      {/* VIEW 1: CLASS SELECTION */}
      {!selectedClass ? (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <LuSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search classes, divisions, or wings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-500">Wing:</label>
              <select
                value={wingFilter}
                onChange={(e) => setWingFilter(e.target.value)}
                className="py-1.5 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none"
              >
                <option value="ALL">All Wings</option>
                <option value="Senior Secondary">Senior Secondary (XI - XII)</option>
                <option value="Secondary">Secondary (IX - X)</option>
                <option value="Middle Wing">Middle Wing (VI - VIII)</option>
                <option value="Primary Wing">Primary (I - V)</option>
                <option value="Pre-Primary">Pre-Primary & Kindergarten</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClasses.map((cls) => (
              <div
                key={cls.id}
                onClick={() => handleSelectClass(cls)}
                className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-700 font-bold text-sm flex items-center justify-center border border-primary-100 shrink-0">
                        {cls.shortName.replace('Class ', '')}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 group-hover:text-primary-600 transition-colors">
                          {cls.name}
                        </h3>
                        <span className="text-[11px] text-gray-400">{cls.wing}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 whitespace-nowrap shrink-0">
                      {cls.totalStudents} Students
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 space-y-1 text-xs text-gray-600 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Coordinator:</span>
                      <span className="font-semibold text-gray-800 truncate max-w-[150px]">{cls.classHead}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Attendance Rate:</span>
                      <span className="font-semibold text-emerald-700">{cls.attendanceRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Divisions:</span>
                      <span className="font-semibold text-primary-700">{cls.divisions.length} Sections</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {cls.divisions.map((div) => (
                      <span
                        key={div.id}
                        className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[11px] font-medium whitespace-nowrap border border-gray-200"
                      >
                        {div.code} ({div.studentsCount} st)
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-primary-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>View Divisions & Students</span>
                  <LuChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* VIEW 2: DIVISION & ROSTER */
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold">
            <button
              onClick={() => {
                setSelectedClass(null);
                setSelectedDivision(null);
              }}
              className="text-primary-600 hover:underline shrink-0"
            >
              All Classes
            </button>
            <LuChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-gray-800 font-bold shrink-0">{selectedClass.name}</span>
            {selectedDivision && (
              <>
                <LuChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-md border border-primary-200 text-xs font-semibold whitespace-nowrap shrink-0">
                  {selectedDivision.code} ({selectedDivision.name})
                </span>
              </>
            )}
          </div>

          {/* Division Selector Tabs */}
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 pb-2">
              Select Division / Section:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {selectedClass.divisions.map((div) => {
                const isSelected = selectedDivision?.id === div.id;
                return (
                  <button
                    key={div.id}
                    onClick={() => setSelectedDivision(div)}
                    className={`p-3 rounded-lg text-left transition-all border ${
                      isSelected
                        ? 'bg-primary-50 text-primary-900 border-primary-300 ring-1 ring-primary-500'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-sm">{div.code}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white text-gray-700 border border-gray-200 whitespace-nowrap shrink-0">
                        {div.studentsCount} Students
                      </span>
                    </div>
                    <p className="text-xs mt-1 text-gray-600 truncate">{div.name}</p>
                    <p className="text-[11px] text-gray-400 mt-1 truncate">Teacher: {div.classTeacher}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Students Roster Table */}
          {selectedDivision && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">
                    Student Roster — {selectedDivision.name}
                  </h3>
                  <p className="text-xs text-gray-400">Classroom: {selectedDivision.room} • Average Grade: {selectedDivision.avgScore}</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <LuSearch className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search student..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4 font-semibold">Roll No & Student Name</th>
                      <th className="py-3 px-4 font-semibold">Admission ID</th>
                      <th className="py-3 px-4 font-semibold">Parent / Guardian</th>
                      <th className="py-3 px-4 font-semibold">Contact & Route</th>
                      <th className="py-3 px-4 font-semibold text-center">Attendance</th>
                      <th className="py-3 px-4 font-semibold text-center">Term Grade</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentStudents.map((st) => (
                      <tr
                        key={st.roll}
                        onClick={() => setSelectedStudentDetail(st)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 font-semibold text-gray-800">
                          {st.name} <span className="text-[11px] text-gray-400 font-mono">({st.roll})</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-600">{st.admNo}</td>
                        <td className="py-3 px-4 text-gray-700">{st.parent}</td>
                        <td className="py-3 px-4 text-gray-600">{st.phone}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                            {st.attendance}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-primary-700 whitespace-nowrap">
                          {st.avgGrade}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStudentDetail(st);
                            }}
                            className="px-2.5 py-1 rounded bg-gray-100 hover:bg-primary-50 hover:text-primary-700 text-gray-700 font-semibold text-xs transition-colors whitespace-nowrap"
                          >
                            Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STUDENT PROFILE DOSSIER MODAL */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden flex flex-col animate-slide-up border border-gray-200">
            <div className="bg-white border-b border-gray-200 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-primary-50 text-primary-700 font-bold text-base flex items-center justify-center border border-primary-100 shrink-0">
                  {selectedStudentDetail.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">{selectedStudentDetail.name}</h3>
                  <p className="text-xs text-gray-400">Roll: {selectedStudentDetail.roll} • Adm: {selectedStudentDetail.admNo}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div>
                  <span className="text-gray-400">Gender / DOB:</span>
                  <p className="font-semibold text-gray-800 mt-0.5">{selectedStudentDetail.gender} • {selectedStudentDetail.dob}</p>
                </div>
                <div>
                  <span className="text-gray-400">Blood Group:</span>
                  <p className="font-semibold text-rose-600 mt-0.5">{selectedStudentDetail.blood}</p>
                </div>
                <div>
                  <span className="text-gray-400">Attendance:</span>
                  <p className="font-semibold text-emerald-700 mt-0.5">{selectedStudentDetail.attendance}</p>
                </div>
                <div>
                  <span className="text-gray-400">Transit Route:</span>
                  <p className="font-semibold text-gray-800 mt-0.5">{selectedStudentDetail.busRoute}</p>
                </div>
                <div>
                  <span className="text-gray-400">Parent:</span>
                  <p className="font-semibold text-gray-800 mt-0.5">{selectedStudentDetail.parent}</p>
                </div>
                <div>
                  <span className="text-gray-400">Phone:</span>
                  <p className="font-semibold text-gray-800 mt-0.5">{selectedStudentDetail.phone}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end">
              <button
                onClick={() => setSelectedStudentDetail(null)}
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
