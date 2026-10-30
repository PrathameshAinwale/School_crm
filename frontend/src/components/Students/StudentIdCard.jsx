import React from 'react';
import { LuGraduationCap, LuPhone, LuMapPin, LuCalendar, LuUser, LuHeart } from 'react-icons/lu';

export default function StudentIdCard({
  student,
  schoolName = 'ARCH CAMPUS',
  schoolTagline = 'School of Excellence & Learning',
  academicYear = '2024 - 2025',
  onPrintSingle,
}) {
  if (!student) return null;

  const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student Name';
  const rollNo = student.roll_number || 'N/A';
  const className = student.school_class?.name || (student.school_class_id ? (typeof student.school_class_id === 'string' ? student.school_class_id : `Class ${student.school_class_id}`) : 'Class 10');
  const sectionName = student.section?.name || student.section_id || 'A';
  const admissionNo = student.admission_number || `ADM-${student.id || '001'}`;
  const bloodGroup = student.blood_group || 'O+';
  const dob = student.date_of_birth
    ? new Date(student.date_of_birth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'N/A';
  const parentName = student.father_name || student.guardian_name || student.mother_name || 'Parent / Guardian';
  const phone = student.guardian_phone || student.emergency_contact || 'N/A';
  const address = student.address || 'Campus Residential, Pune, MH';

  // Generate initials for placeholder avatar
  const initials = `${student.first_name?.[0] || 'S'}${student.last_name?.[0] || ''}`.toUpperCase();

  return (
    <div className="id-card-print-item relative w-full max-w-[420px] bg-white rounded-2xl border-2 border-slate-300 shadow-md hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between text-slate-800 font-sans mx-auto select-none print:shadow-none print:border-slate-400 print:rounded-xl">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 text-white px-3.5 py-2.5 flex items-center justify-between relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute -left-3 -top-3 w-12 h-12 bg-white/10 rounded-full pointer-events-none" />

        <div className="flex items-center gap-2 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/30 shrink-0">
            <LuGraduationCap className="w-4 h-4 text-white" />
          </div>
          <div className="leading-tight">
            <h3 className="font-extrabold text-xs tracking-wider uppercase drop-shadow-xs">
              {schoolName}
            </h3>
            <p className="text-[9px] text-emerald-200 tracking-wide font-medium">
              {schoolTagline}
            </p>
          </div>
        </div>

        <div className="text-right relative z-10 shrink-0">
          <span className="inline-block px-2 py-0.5 rounded-full bg-white text-emerald-900 font-black text-[9px] uppercase tracking-wider shadow-xs">
            STUDENT I-CARD
          </span>
          <p className="text-[8.5px] text-emerald-200 font-semibold mt-0.5">
            {academicYear}
          </p>
        </div>
      </div>

      {/* Main Body: Photo on Left Side, Details on Right Side */}
      <div className="p-3 sm:p-3.5 flex items-start gap-3 bg-gradient-to-b from-white via-slate-50/40 to-slate-50/80">
        {/* LEFT COLUMN: Student Photo & Badge */}
        <div className="w-[100px] shrink-0 flex flex-col items-center">
          {/* Photo Frame */}
          <div className="w-[96px] h-[116px] rounded-xl bg-slate-100 border-2 border-emerald-600/40 p-1 shadow-xs flex flex-col items-center justify-center overflow-hidden relative group">
            {student.photo_url || student.avatar ? (
              <img
                src={student.photo_url || student.avatar}
                alt={fullName}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full rounded-lg bg-gradient-to-tr from-slate-200 via-slate-100 to-emerald-50 flex flex-col items-center justify-center text-slate-400 relative">
                {/* Silhouette avatar illustration */}
                <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center font-black text-base shadow-inner">
                  {initials}
                </div>
                <span className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-wider">
                  Photo
                </span>
              </div>
            )}
            <span className="absolute bottom-1.5 left-1 right-1 bg-emerald-700 text-white text-[8px] font-bold text-center py-0.5 rounded uppercase tracking-wider shadow-xs">
              STUDENT
            </span>
          </div>

          {/* Blood Group Tag */}
          <div className="mt-1.5 w-full flex items-center justify-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[9px] font-black">
            <LuHeart className="w-2.5 h-2.5 fill-rose-500 text-rose-500 shrink-0" />
            <span>Blood: {bloodGroup}</span>
          </div>

          {/* Barcode Graphic */}
          <div className="mt-1.5 w-full bg-white border border-slate-200 rounded px-1 py-0.5 text-center flex flex-col items-center">
            {/* Simulated Barcode lines */}
            <div className="w-full h-4 flex items-stretch justify-center gap-[1.5px] overflow-hidden py-0.5">
              {[1, 2, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 2, 3, 1, 1, 2, 1].map((w, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800"
                  style={{ width: `${w}px` }}
                />
              ))}
            </div>
            <span className="text-[7.5px] font-mono font-bold text-slate-600 tracking-wider">
              {admissionNo}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Student Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
          <div>
            {/* Student Name */}
            <h4 className="font-extrabold text-sm text-slate-900 leading-tight tracking-tight uppercase truncate">
              {fullName}
            </h4>

            {/* Class & Roll Pill */}
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="px-2 py-0.5 bg-emerald-100/80 text-emerald-900 text-[10px] font-black rounded-md border border-emerald-300">
                {className} ({sectionName})
              </span>
              <span className="px-2 py-0.5 bg-slate-200/80 text-slate-800 text-[10px] font-bold rounded-md border border-slate-300">
                Roll: {rollNo}
              </span>
            </div>

            {/* Information Grid */}
            <div className="mt-2 space-y-1 text-[10px] text-slate-700">
              <div className="flex items-baseline">
                <span className="w-16 text-slate-400 font-semibold uppercase text-[9px] shrink-0">
                  Adm No:
                </span>
                <span className="font-bold font-mono text-slate-900 truncate">
                  {admissionNo}
                </span>
              </div>

              <div className="flex items-baseline">
                <span className="w-16 text-slate-400 font-semibold uppercase text-[9px] shrink-0">
                  DOB:
                </span>
                <span className="font-semibold text-slate-800">
                  {dob}
                </span>
              </div>

              <div className="flex items-baseline">
                <span className="w-16 text-slate-400 font-semibold uppercase text-[9px] shrink-0">
                  Parent:
                </span>
                <span className="font-bold text-slate-900 truncate">
                  {parentName}
                </span>
              </div>

              <div className="flex items-baseline">
                <span className="w-16 text-slate-400 font-semibold uppercase text-[9px] shrink-0">
                  Mobile:
                </span>
                <span className="font-bold font-mono text-emerald-800">
                  {phone}
                </span>
              </div>

              <div className="flex items-start">
                <span className="w-16 text-slate-400 font-semibold uppercase text-[9px] shrink-0 mt-0.5">
                  Address:
                </span>
                <span className="text-slate-600 font-medium text-[9px] line-clamp-2 leading-tight">
                  {address}
                </span>
              </div>
            </div>
          </div>

          {/* Individual Print Button (Hover on Screen, Hidden during Print) */}
          {onPrintSingle && (
            <div className="mt-2 pt-1.5 border-t border-slate-200/80 flex items-center justify-between print:hidden">
              <span className="text-[9px] text-slate-400 font-medium">Valid for Academic Session</span>
              <button
                type="button"
                onClick={() => onPrintSingle(student)}
                className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors cursor-pointer"
              >
                Print Card
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Band */}
      <div className="bg-slate-100 border-t border-slate-200 px-3.5 py-1.5 flex items-center justify-between text-[8px] text-slate-500">
        <div className="flex items-center gap-1 truncate pr-2">
          <span className="font-semibold text-slate-600">Helpline:</span>
          <span className="font-mono">{phone !== 'N/A' ? phone : '+91 98201 11223'}</span>
        </div>

        <div className="text-right shrink-0">
          <div className="h-3 w-16 border-b border-slate-400/80 mb-0.5 mx-auto" />
          <span className="font-bold text-[7.5px] uppercase text-slate-600 tracking-wider">
            Principal Signature
          </span>
        </div>
      </div>
    </div>
  );
}
