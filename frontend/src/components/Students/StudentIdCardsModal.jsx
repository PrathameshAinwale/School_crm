import React, { useState, useMemo } from 'react';
import StudentIdCard from './StudentIdCard';
import { printIdCardsDirectly } from './printIdCardsHelper';
import {
  LuIdCard,
  LuPrinter,
  LuX,
  LuSearch,
  LuUsers,
  LuLayers,
  LuDownload,
  LuCheck,
} from 'react-icons/lu';

export default function StudentIdCardsModal({
  isOpen,
  onClose,
  students = [],
  title = 'Student Identity Cards',
  schoolName = 'ARCH CAMPUS',
  schoolTagline = 'School of Excellence & Learning',
  academicYear = '2024 - 2025',
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentForSinglePrint, setSelectedStudentForSinglePrint] = useState(null);

  // Filter students based on modal search
  const filteredStudents = useMemo(() => {
    if (!students || !Array.isArray(students)) return [];
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase().trim();
    return students.filter((s) => {
      const name = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
      const roll = String(s.roll_number || '').toLowerCase();
      const adm = String(s.admission_number || '').toLowerCase();
      const cls = String(s.school_class?.name || s.school_class_id || '').toLowerCase();
      const sec = String(s.section?.name || s.section_id || '').toLowerCase();
      return name.includes(q) || roll.includes(q) || adm.includes(q) || cls.includes(q) || sec.includes(q);
    });
  }, [students, searchQuery]);

  if (!isOpen) return null;

  const handlePrint = (singleStudent = null) => {
    const targetStudents = singleStudent ? [singleStudent] : filteredStudents;
    printIdCardsDirectly(targetStudents, {
      schoolName,
      schoolTagline,
      academicYear,
      title: singleStudent
        ? `${singleStudent.first_name || 'Student'} - Identity Card`
        : title,
    });
  };

  const studentsToRender = selectedStudentForSinglePrint
    ? [selectedStudentForSinglePrint]
    : filteredStudents;

  return (
    <>
      {/* Print Specific CSS Rules for in-page printing */}
      <style>{`
        @media print {
          aside,
          header,
          nav,
          .no-print {
            display: none !important;
          }
          body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .id-cards-modal-overlay {
            position: static !important;
            display: block !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
          }
          .id-cards-modal-container {
            border: none !important;
            box-shadow: none !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
          }
          .id-cards-modal-scroll {
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          .id-cards-print-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 7mm 5mm !important;
            width: 100% !important;
          }
          .id-card-print-item {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            border: 1.5px solid #cbd5e1 !important;
            box-shadow: none !important;
            margin-bottom: 2mm !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm 6mm;
          }
        }
      `}</style>

      {/* Main Modal Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in id-cards-modal-overlay">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full h-[92vh] flex flex-col overflow-hidden animate-scale-up id-cards-modal-container">
          {/* Header Bar */}
          <div className="no-print bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 p-4 sm:p-5 text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 text-white shadow-xs">
                <LuIdCard className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                    {title}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 text-xs font-bold border border-emerald-400/30">
                    {students.length} {students.length === 1 ? 'Student' : 'Students'}
                  </span>
                </div>
                <p className="text-xs text-emerald-100/80 mt-0.5">
                  Standard format: Student photo on left side & details on right side
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePrint(null)}
                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <LuPrinter className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">Print All I-Cards ({filteredStudents.length})</span>
                <span className="sm:hidden">Print ({filteredStudents.length})</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                title="Close Modal"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter & Toolbar Area */}
          <div className="no-print p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
            {/* Search filter within modal */}
            <div className="relative flex-1 max-w-md">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filter cards by student name, roll no, adm no, class..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold">
                Showing: {filteredStudents.length} of {students.length} Cards
              </span>
              <span className="hidden md:inline text-slate-400 text-[11px]">
                Tip: Click "Print Card" on any card to print only that student
              </span>
            </div>
          </div>

          {/* Cards Display / Printable Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60 id-cards-modal-scroll">
            {filteredStudents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-3">
                  <LuIdCard className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">No Student Records Found</h4>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  {searchQuery
                    ? `No students matching "${searchQuery}". Clear your search to view all cards.`
                    : 'There are currently no students available to generate I-cards for.'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            ) : (
              <div id="printable-id-cards-container">
                <div className="id-cards-print-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                  {studentsToRender.map((student) => (
                    <StudentIdCard
                      key={student.id || student.admission_number}
                      student={student}
                      schoolName={schoolName}
                      schoolTagline={schoolTagline}
                      academicYear={academicYear}
                      onPrintSingle={(s) => handlePrint(s)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="no-print p-3.5 sm:p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>
                Ready for standard card / A4 batch printing (2 cards/row)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handlePrint(null)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <LuPrinter className="w-4 h-4" />
                <span>Print All ({filteredStudents.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
