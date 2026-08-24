import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  LuGraduationCap,
  LuSearch,
  LuEye,
  LuPhone,
  LuMail,
  LuLoader,
  LuX,
  LuBuilding2,
  LuLayers,
  LuUsers,
  LuChevronRight,
  LuArrowLeft,
  LuUserCheck,
  LuBookOpen,
} from 'react-icons/lu';

const STANDARD_CLASSES = [
  { id: 'Nursery', name: 'Nursery' },
  { id: 'LKG', name: 'LKG' },
  { id: 'UKG', name: 'UKG' },
  { id: 'Class 1', name: 'Class 1' },
  { id: 'Class 2', name: 'Class 2' },
  { id: 'Class 3', name: 'Class 3' },
  { id: 'Class 4', name: 'Class 4' },
  { id: 'Class 5', name: 'Class 5' },
  { id: 'Class 6', name: 'Class 6' },
  { id: 'Class 7', name: 'Class 7' },
  { id: 'Class 8', name: 'Class 8' },
  { id: 'Class 9', name: 'Class 9' },
  { id: 'Class 10', name: 'Class 10' },
  { id: 'Class 11', name: 'Class 11' },
  { id: 'Class 12', name: 'Class 12' },
];

const DIVISIONS = [
  {
    id: 'Saffron (A)',
    name: 'Saffron (A)',
    tag: 'A',
    color: 'from-amber-500 to-orange-500',
    border: 'border-amber-200',
    bg: 'bg-amber-50/70',
    text: 'text-amber-800',
    accent: 'bg-amber-500',
  },
  {
    id: 'White (B)',
    name: 'White (B)',
    tag: 'B',
    color: 'from-slate-600 to-slate-800',
    border: 'border-slate-300',
    bg: 'bg-slate-50',
    text: 'text-slate-800',
    accent: 'bg-slate-700',
  },
  {
    id: 'Green (C)',
    name: 'Green (C)',
    tag: 'C',
    color: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50/70',
    text: 'text-emerald-800',
    accent: 'bg-emerald-500',
  },
];

export default function AdminStudentsPage() {
  const [allStudents, setAllStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Drill-down navigation state
  // activeClass: null | string (e.g. 'Class 10')
  // activeDivision: null | string (e.g. 'Saffron (A)')
  const [activeClass, setActiveClass] = useState(null);
  const [activeDivision, setActiveDivision] = useState(null);

  // Search & Profile Modal
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Load all students and classes from API
  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsRes, classesRes] = await Promise.all([
        adminService.getStudents({ per_page: 500 }),
        adminService.getClasses(),
      ]);

      if (studentsRes.success && studentsRes.data) {
        setAllStudents(studentsRes.data.data || studentsRes.data || []);
      }
      if (classesRes.success && classesRes.data && classesRes.data.length > 0) {
        setClasses(classesRes.data);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const dbClassMap = new Map(classes.map((c) => [c.name.toLowerCase().trim(), c]));
  const classesList = STANDARD_CLASSES.map((item) => {
    const name = item.name || item;
    return dbClassMap.get(name.toLowerCase().trim()) || { id: name, name };
  });

  // Helper to count students for a given class & division
  const getStudentCount = (className, divisionName = null) => {
    return allStudents.filter((s) => {
      const studentClass = s.school_class?.name || (s.school_class_id ? `Class ${s.school_class_id}` : '');
      const classMatch = studentClass.toLowerCase().trim() === className.toLowerCase().trim();
      if (!classMatch) return false;

      if (!divisionName) return true;

      const studentSec = s.section?.name || s.section_id || '';
      return (
        studentSec.toLowerCase().includes(divisionName.toLowerCase()) ||
        divisionName.toLowerCase().includes(studentSec.toLowerCase())
      );
    }).length;
  };

  // Filter students for the active view
  const currentRoster = allStudents.filter((s) => {
    if (!activeClass) return false;

    const studentClass = s.school_class?.name || (s.school_class_id ? `Class ${s.school_class_id}` : '');
    const classMatch = studentClass.toLowerCase().trim() === activeClass.toLowerCase().trim();
    if (!classMatch) return false;

    if (activeDivision) {
      const studentSec = s.section?.name || s.section_id || '';
      const divMatch =
        studentSec.toLowerCase().includes(activeDivision.toLowerCase()) ||
        activeDivision.toLowerCase().includes(studentSec.toLowerCase());
      if (!divMatch) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
      const roll = (s.roll_number || '').toLowerCase();
      const adm = (s.admission_number || '').toLowerCase();
      const phone = (s.guardian_phone || '').toLowerCase();
      return name.includes(q) || roll.includes(q) || adm.includes(q) || phone.includes(q);
    }

    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
            <LuGraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-xl font-bold text-slate-800 leading-tight">Student Directory</h1>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] sm:text-[11px] border border-emerald-200">
                View Only
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Browse classes, divisions & enrolled student profiles
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold self-start sm:self-auto">
          <LuUsers className="w-4 h-4 text-emerald-600" />
          <span>Total: <strong>{allStudents.length}</strong> Students</span>
        </div>
      </div>

      {/* Interactive Breadcrumb Bar */}
      <div className="bg-white px-3.5 sm:px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-2 sm:gap-3 text-xs">
        <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500 font-medium overflow-x-auto">
          <button
            onClick={() => {
              setActiveClass(null);
              setActiveDivision(null);
            }}
            className={`hover:text-emerald-600 transition-colors font-bold whitespace-nowrap cursor-pointer ${
              !activeClass ? 'text-emerald-700 font-bold' : ''
            }`}
          >
            All Classes
          </button>

          {activeClass && (
            <>
              <LuChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <button
                onClick={() => setActiveDivision(null)}
                className={`hover:text-emerald-600 transition-colors whitespace-nowrap cursor-pointer ${
                  !activeDivision ? 'text-emerald-700 font-bold' : ''
                }`}
              >
                {activeClass}
              </button>
            </>
          )}

          {activeClass && activeDivision && (
            <>
              <LuChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span className="text-emerald-700 font-bold whitespace-nowrap truncate max-w-[120px] sm:max-w-none">{activeDivision}</span>
            </>
          )}
        </div>

        {/* Back Button */}
        {(activeClass || activeDivision) && (
          <button
            onClick={() => {
              if (activeDivision) {
                setActiveDivision(null);
              } else if (activeClass) {
                setActiveClass(null);
              }
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer text-[11px] sm:text-xs"
          >
            <LuArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{activeDivision ? `Back to Divisions` : `Back to All Classes`}</span>
            <span className="sm:hidden">Back</span>
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-xs">
          <LuLoader className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading school classes & student records from database...</p>
        </div>
      ) : null}

      {/* ========================================================================= */}
      {/* LEVEL 1: CLASS CARDS GRID (When no class is selected)                    */}
      {/* ========================================================================= */}
      {!loading && !activeClass && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <LuBuilding2 className="w-4 h-4 text-emerald-600" /> <span className="hidden sm:inline">Select a Class / Grade to View Divisions</span><span className="sm:hidden">Select a Class</span>
            </h2>
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium">
              {classesList.length} Classes
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {classesList.map((cls) => {
              const count = getStudentCount(cls.name);
              return (
                <div
                  key={cls.id || cls.name}
                  onClick={() => {
                    setActiveClass(cls.name);
                    setActiveDivision(null);
                    setSearchQuery('');
                  }}
                  className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3 sm:p-5 shadow-xs hover:shadow-lg hover:border-emerald-300 sm:hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-xs">
                        <LuBookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-slate-100 text-slate-700 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors border border-slate-200/60">
                        {count}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                      {cls.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 hidden sm:block">Click to inspect divisions</p>
                  </div>

                  {/* Division Pills Preview */}
                  <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500" title="Saffron (A)"></span>
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-400" title="White (B)"></span>
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500" title="Green (C)"></span>
                      <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium ml-0.5 sm:ml-1">3 Div</span>
                    </div>
                    <LuChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 2: DIVISION CARDS VIEW (When class is selected, division not yet) */}
      {/* ========================================================================= */}
      {!loading && activeClass && !activeDivision && (
        <div className="space-y-3 sm:space-y-5 animate-fade-in">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 sm:p-6 rounded-xl sm:rounded-2xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <span className="text-emerald-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Class Selected</span>
              <h2 className="text-lg sm:text-2xl font-bold mt-0.5">{activeClass}</h2>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-1">
                Select a division below to view enrolled students
              </p>
            </div>
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs font-semibold self-start sm:self-auto">
              {getStudentCount(activeClass)} Students
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-5">
            {DIVISIONS.map((div) => {
              const count = getStudentCount(activeClass, div.name);
              return (
                <div
                  key={div.id}
                  onClick={() => {
                    setActiveDivision(div.name);
                    setSearchQuery('');
                  }}
                  className={`bg-white rounded-xl sm:rounded-2xl border-2 ${div.border} p-3 sm:p-6 shadow-xs hover:shadow-xl sm:hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r ${div.color}`} />

                  <div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-4 gap-1.5">
                      <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr ${div.color} text-white flex items-center justify-center font-extrabold text-sm sm:text-base shadow-md`}>
                        {div.tag}
                      </div>
                      <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold ${div.bg} ${div.text} border ${div.border}`}>
                        {count}
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-lg font-bold text-slate-800 group-hover:text-emerald-600 transition-colors leading-tight">
                      <span className="hidden sm:inline">Division </span>{div.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 leading-relaxed hidden sm:block">
                      Section {div.name} students
                    </p>
                  </div>

                  <div className="mt-2.5 sm:mt-6 pt-2 sm:pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                    <span className="hidden sm:inline">View Student Roster</span>
                    <span className="sm:hidden">View</span>
                    <LuChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 3: STUDENTS ROSTER IN SELECTED DIVISION                            */}
      {/* ========================================================================= */}
      {!loading && activeClass && activeDivision && (
        <div className="space-y-3 sm:space-y-4 animate-fade-in">
          {/* Active Division Banner */}
          <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                <LuLayers className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-lg font-bold text-slate-800 leading-tight">
                    {activeClass} - {activeDivision}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {currentRoster.length} Students
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 hidden sm:block">
                  Student records enrolled by faculty in Teacher Module
                </p>
              </div>
            </div>

            {/* In-Division Search */}
            <div className="relative w-full md:w-72">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, roll no, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
              />
            </div>
          </div>

          {/* Roster */}
          {currentRoster.length === 0 ? (
            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 text-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3">
                <LuGraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-1">
                No Students in {activeClass} - {activeDivision}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No student has been assigned to this division yet.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile View: Student Cards */}
              <div className="sm:hidden grid grid-cols-2 gap-2.5">
                {currentRoster.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {student.first_name?.[0]}{student.last_name?.[0] || ''}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-xs truncate">
                          {student.first_name} {student.last_name?.[0] ? student.last_name[0] + '.' : ''}
                        </p>
                        <p className="text-[10px] text-slate-400">Roll: {student.roll_number || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 text-[10px] block w-fit">
                        {student.admission_number}
                      </span>
                      {student.guardian_name && (
                        <p className="text-[10px] text-slate-500 truncate">
                          👤 {student.guardian_name}
                        </p>
                      )}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                        {student.status || 'Active'}
                      </span>
                      <LuEye className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View: Full Table */}
              <div className="hidden sm:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="px-5 py-3.5">Student Name & Roll</th>
                        <th className="px-5 py-3.5">Admission Number</th>
                        <th className="px-5 py-3.5">Class & Division</th>
                        <th className="px-5 py-3.5">Parent / Guardian (Login ID)</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">View Profile</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {currentRoster.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                                {student.first_name?.[0]}{student.last_name?.[0] || ''}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800">{student.first_name} {student.last_name || ''}</div>
                                <div className="text-[11px] text-slate-400">Roll: {student.roll_number || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-[11px]">
                              {student.admission_number}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-semibold text-slate-700">
                              {student.school_class?.name || 'Class ' + (student.school_class_id || '')}
                              {student.section ? ` - Division ${student.section.name.replace(/^Division\s*/i, '')}` : ''}
                            </span>
                          </td>
                          <td className="px-5 py-4 space-y-0.5">
                            <div className="font-semibold text-slate-800">{student.guardian_name}</div>
                            <div className="flex items-center gap-1.5 text-emerald-700 font-mono text-[11px] font-bold">
                              <LuPhone className="w-3 h-3 text-slate-400" />
                              <span>{student.guardian_phone}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              {student.status || 'Active'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => setSelectedStudent(student)}
                              title="View Student Profile"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors inline-flex items-center gap-1 font-semibold text-xs cursor-pointer"
                            >
                              <LuEye className="w-4 h-4" /> Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STUDENT PROFILE VIEW MODAL                                                */}
      {/* ========================================================================= */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full my-8 overflow-hidden animate-scale-up">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white relative">
              <button
                onClick={() => setSelectedStudent(null)}
                className="absolute right-4 top-4 w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center text-xl font-bold border border-white/30 shrink-0">
                  {selectedStudent.first_name?.[0] || 'S'}{selectedStudent.last_name?.[0] || ''}
                </div>
                <div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                    <h2 className="text-xl font-bold">
                      {selectedStudent.first_name} {selectedStudent.last_name || ''}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-md bg-white/25 text-white font-mono text-xs font-bold">
                      {selectedStudent.admission_number}
                    </span>
                  </div>
                  <p className="text-emerald-100 text-xs">
                    {selectedStudent.school_class?.name || 'Class ' + (selectedStudent.school_class_id || '')}
                    {selectedStudent.section ? ` (Division ${selectedStudent.section.name.replace(/^Division\s*/i, '')})` : ''} • Roll No: {selectedStudent.roll_number || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Content Body */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Status Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium">Academic Class & Division:</span>
                  <span className="font-bold text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                    {selectedStudent.school_class?.name || 'Class ' + (selectedStudent.school_class_id || '')}
                    {selectedStudent.section ? ` - Division ${selectedStudent.section.name.replace(/^Division\s*/i, '')}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium">Student Status:</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {selectedStudent.status || 'Active'}
                  </span>
                </div>
              </div>

              {/* Personal Details */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Student Personal Profile
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-medium mb-1">Gender</div>
                    <div className="text-xs font-bold text-slate-800">{selectedStudent.gender || 'Not Specified'}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-medium mb-1">Blood Group</div>
                    <div className="text-xs font-bold text-slate-800">{selectedStudent.blood_group || 'N/A'}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-medium mb-1">Date of Birth</div>
                    <div className="text-xs font-bold text-slate-800">
                      {selectedStudent.date_of_birth
                        ? new Date(selectedStudent.date_of_birth).toLocaleDateString()
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Guardian / Parent Details */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Parent / Guardian Information (Login Account)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-medium mb-1">Guardian Name</div>
                    <div className="text-xs font-bold text-slate-800">{selectedStudent.guardian_name}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mb-1">
                      <LuPhone className="w-3.5 h-3.5 text-emerald-600" /> Parent Mobile (Login ID)
                    </div>
                    <div className="text-xs font-bold text-emerald-700 font-mono select-all">
                      {selectedStudent.guardian_phone}
                    </div>
                  </div>
                  {selectedStudent.guardian_email && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mb-1">
                        <LuMail className="w-3.5 h-3.5 text-slate-400" /> Parent Email
                      </div>
                      <div className="text-xs font-bold text-slate-800">{selectedStudent.guardian_email}</div>
                    </div>
                  )}
                  {selectedStudent.guardian_relation && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="text-[11px] text-slate-400 font-medium mb-1">Relationship</div>
                      <div className="text-xs font-bold text-slate-800">{selectedStudent.guardian_relation}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Address & Emergency Info */}
              {(selectedStudent.address || selectedStudent.emergency_contact || selectedStudent.admission_date) && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                    Enrollment & Residence
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {selectedStudent.admission_date && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                        <div className="text-[11px] text-slate-400 font-medium mb-0.5">Date of Admission</div>
                        <div className="font-bold text-slate-800">
                          {new Date(selectedStudent.admission_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      </div>
                    )}
                    {selectedStudent.emergency_contact && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                        <div className="text-[11px] text-slate-400 font-medium mb-0.5">Emergency Contact</div>
                        <div className="font-bold text-slate-800">{selectedStudent.emergency_contact}</div>
                      </div>
                    )}
                    {selectedStudent.address && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 sm:col-span-2">
                        <div className="text-[11px] text-slate-400 font-medium mb-0.5">Home Address</div>
                        <div className="font-medium text-slate-800 leading-relaxed">{selectedStudent.address}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
