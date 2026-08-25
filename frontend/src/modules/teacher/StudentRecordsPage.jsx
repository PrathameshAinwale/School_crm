import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  LuGraduationCap,
  LuSearch,
  LuX,
  LuPhone,
  LuMail,
  LuEye,
  LuLoader,
  LuBuilding2,
  LuLayers,
  LuUsers,
  LuMapPin,
  LuHeart,
} from 'react-icons/lu';

const STANDARD_CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12'
];

const STANDARD_DIVISIONS = [
  { id: 'Saffron (A)', name: 'Saffron (A)' },
  { id: 'White (B)', name: 'White (B)' },
  { id: 'Green (C)', name: 'Green (C)' },
];

export default function StudentRecordsPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('ALL');
  const [selectedSectionId, setSelectedSectionId] = useState('ALL');

  // Modals state
  const [selectedStudent, setSelectedStudent] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsRes, classesRes] = await Promise.all([
        adminService.getStudents({
          search: searchQuery,
          school_class_id: selectedClassId,
          section_id: selectedSectionId,
        }),
        adminService.getClasses(),
      ]);

      if (studentsRes.success && studentsRes.data) {
        setStudents(studentsRes.data.data || studentsRes.data || []);
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
  }, [selectedClassId, selectedSectionId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  // Ensure all standard grades are always available in order
  const dbClassMap = new Map(classes.map((c) => [c.name.toLowerCase().trim(), c]));
  const classesList = STANDARD_CLASSES.map((name) => {
    return dbClassMap.get(name.toLowerCase().trim()) || { id: name, name };
  });

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-primary-500/20">
            <LuGraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-bold text-slate-800 leading-tight">Student Class Records & Profiles</h1>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px] sm:text-[11px] border border-blue-200">
                Teacher Access
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Browse enrolled students, family contact info, academic rosters, and emergency details
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold self-start sm:self-auto">
          <LuUsers className="w-4 h-4 text-primary-600" />
          <span>Total: <strong>{students.length}</strong> Students</span>
        </div>
      </div>

      {/* Class & Division Filters */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, roll number, admission ID, parent mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Class selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <LuBuilding2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary-500 cursor-pointer"
            >
              <option value="ALL">All Classes</option>
              {classesList.map((cls) => (
                <option key={cls.id || cls.name} value={cls.name}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Division selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <LuLayers className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary-500 cursor-pointer"
            >
              <option value="ALL">All Divisions</option>
              <option value="Saffron (A)">Division Saffron (A)</option>
              <option value="White (B)">Division White (B)</option>
              <option value="Green (C)">Division Green (C)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 flex flex-col items-center justify-center min-h-[300px]">
          <LuLoader className="w-8 h-8 text-primary-600 animate-spin mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading student records...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
          <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <LuGraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Student Records Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            No students found matching your selected class, division, or search criteria.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Student & Roll No</th>
                  <th className="px-5 py-3.5">Class & Division</th>
                  <th className="px-5 py-3.5">Parents / Guardians</th>
                  <th className="px-5 py-3.5">Blood Group</th>
                  <th className="px-5 py-3.5">Contact Number</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => {
                  const fatherDisplay = student.father_name || student.guardian_name;
                  const motherDisplay = student.mother_name;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary-50 border border-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {student.first_name?.[0]}{student.last_name?.[0] || ''}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">
                              {student.first_name} {student.last_name || ''}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-mono text-primary-600 bg-primary-50 px-1.5 py-0.2 rounded border border-primary-200">
                                {student.admission_number}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                Roll: {student.roll_number || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-slate-800 block">
                          {student.school_class?.name || (student.school_class_id ? `Class ${student.school_class_id}` : 'Unassigned')}
                        </span>
                        <span className="text-[10px] text-purple-700 font-semibold bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200 inline-block mt-0.5">
                          {student.section?.name || student.section_id || 'Division A'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 font-medium">
                        <div>
                          <span className="font-bold text-slate-800 block">F: {fatherDisplay}</span>
                          {motherDisplay && (
                            <span className="text-[11px] text-slate-500 block">M: {motherDisplay}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold rounded-md border border-rose-200 text-[11px]">
                          {student.blood_group || 'O+'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 text-slate-700 font-mono text-xs">
                          <LuPhone className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                          <span>{student.guardian_phone || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <LuEye className="w-3.5 h-3.5" /> View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Profile View Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full my-4 sm:my-8 overflow-hidden animate-scale-up">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-700 p-6 text-white relative">
              <button
                onClick={() => setSelectedStudent(null)}
                className="absolute right-4 top-4 w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
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
                  <p className="text-primary-100 text-xs">
                    {selectedStudent.school_class?.name || 'Class ' + (selectedStudent.school_class_id || '')}
                    {selectedStudent.section ? ` (Division ${selectedStudent.section.name})` : ''} • Roll: {selectedStudent.roll_number || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Content Body */}
            <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium">Academic Class:</span>
                  <span className="font-bold text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                    {selectedStudent.school_class?.name || 'Class ' + (selectedStudent.school_class_id || '')} - {selectedStudent.section?.name || 'Div A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium">Status:</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {selectedStudent.status || 'Active'}
                  </span>
                </div>
              </div>

              {/* Personal & Demographic Profile */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Student Personal & Demographic Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-medium mb-1">Gender</div>
                    <div className="text-xs font-bold text-slate-800">{selectedStudent.gender || 'Not Specified'}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-medium mb-1">Blood Group</div>
                    <div className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md inline-block border border-rose-200">
                      {selectedStudent.blood_group || 'O+'}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-medium mb-1">Date of Birth</div>
                    <div className="text-xs font-bold text-slate-800">
                      {selectedStudent.date_of_birth
                        ? new Date(selectedStudent.date_of_birth).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Parents & Family Profile */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Parents & Guardian Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
                    <div className="text-[11px] text-blue-900 font-bold mb-1">Father's Name & Occupation</div>
                    <div className="text-xs font-bold text-slate-800">{selectedStudent.father_name || selectedStudent.guardian_name || 'Not Provided'}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{selectedStudent.father_occupation ? `Occupation: ${selectedStudent.father_occupation}` : 'Occupation: Not specified'}</div>
                  </div>
                  <div className="p-3 bg-pink-50/60 rounded-xl border border-pink-200">
                    <div className="text-[11px] text-pink-900 font-bold mb-1">Mother's Name & Occupation</div>
                    <div className="text-xs font-bold text-slate-800">{selectedStudent.mother_name || 'Not Provided'}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{selectedStudent.mother_occupation ? `Occupation: ${selectedStudent.mother_occupation}` : 'Occupation: Not specified'}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mb-1">
                      <LuPhone className="w-3.5 h-3.5 text-primary-600" /> Parent Mobile (Login ID)
                    </div>
                    <div className="text-xs font-bold text-primary-700 font-mono select-all">
                      {selectedStudent.guardian_phone}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mb-1">
                      <LuMail className="w-3.5 h-3.5 text-slate-400" /> Parent Email
                    </div>
                    <div className="text-xs font-bold text-slate-800">{selectedStudent.guardian_email || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Residential Address */}
              {selectedStudent.address && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Residential Address
                  </h4>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2">
                    <LuMapPin className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-700 leading-relaxed">{selectedStudent.address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
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
