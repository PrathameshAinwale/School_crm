import React, { useState } from 'react';
import { LuSearch, LuPlus, LuUser, LuSettings, LuMail, LuPhone, LuGraduationCap, LuX } from 'react-icons/lu';

export default function StudentRecordsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const students = [
    { id: 'STU-101', name: 'Alice Johnson', grade: '10th', section: 'A', email: 'alice.j@example.com', phone: '+1 234 567 8900', status: 'Active' },
    { id: 'STU-102', name: 'Bob Smith', grade: '10th', section: 'A', email: 'bob.s@example.com', phone: '+1 234 567 8901', status: 'Active' },
    { id: 'STU-103', name: 'Charlie Davis', grade: '10th', section: 'B', email: 'charlie.d@example.com', phone: '+1 234 567 8902', status: 'Inactive' },
    { id: 'STU-104', name: 'Diana Prince', grade: '9th', section: 'A', email: 'diana.p@example.com', phone: '+1 234 567 8903', status: 'Active' },
    { id: 'STU-105', name: 'Evan Wright', grade: '11th', section: 'C', email: 'evan.w@example.com', phone: '+1 234 567 8904', status: 'Suspended' },
  ];

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <LuGraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Student Records</h1>
            <p className="text-sm text-gray-500">Manage and view all students in your classes</p>
          </div>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <LuPlus className="w-4 h-4" />
          Add Student
        </button>
      </div>

      {/* Toolbar / Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by student name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select className="h-10 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none w-full sm:w-auto cursor-pointer">
            <option value="all">All Grades</option>
            <option value="9">9th Grade</option>
            <option value="10">10th Grade</option>
            <option value="11">11th Grade</option>
          </select>
          <select className="h-10 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none w-full sm:w-auto cursor-pointer">
            <option value="all">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student ID</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Class Info</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold shrink-0">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{student.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-semibold text-gray-600 font-mono">{student.id}</td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-gray-800">{student.grade}</p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">Section {student.section}</p>
                    </td>
                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <LuMail className="w-3.5 h-3.5 text-gray-400" />
                        {student.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <LuPhone className="w-3.5 h-3.5 text-gray-400" />
                        {student.phone}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        student.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                        student.status === 'Inactive' ? 'bg-gray-100 text-gray-600 border border-gray-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                        <LuSettings className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500 text-sm">
                    No students found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Add New Student</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">First Name</label>
                  <input type="text" className="w-full h-10 px-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-gray-50" placeholder="e.g. John" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Last Name</label>
                  <input type="text" className="w-full h-10 px-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-gray-50" placeholder="e.g. Doe" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Grade/Class</label>
                  <select className="w-full h-10 px-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-gray-50">
                    <option>Select Grade</option>
                    <option>9th</option>
                    <option>10th</option>
                    <option>11th</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Section</label>
                  <select className="w-full h-10 px-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-gray-50">
                    <option>Select Section</option>
                    <option>A</option>
                    <option>B</option>
                    <option>C</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Email Address (Parent/Student)</label>
                <div className="relative">
                  <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" className="w-full h-10 pl-9 pr-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-gray-50" placeholder="john@example.com" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Contact Number</label>
                <div className="relative">
                  <LuPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="tel" className="w-full h-10 pl-9 pr-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-gray-50" placeholder="+1 234 567 8900" />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-md"
              >
                Save Student
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
