import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentParentService } from '../../services/studentParentService';
import {
  LuClock,
  LuArrowLeft,
  LuCalendarDays,
  LuBookOpen,
  LuMapPin,
  LuDownload,
  LuCircleCheck,
  LuLoader,
} from 'react-icons/lu';

export default function TimetablePage() {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState('Monday');

  const [timetableData, setTimetableData] = useState(null);
  const [headerInfo, setHeaderInfo] = useState({
    className: 'Class 10',
    sectionName: 'Section A',
    homeroom: 'Senior Academic Wing • Room 301',
    classTeacher: 'Dr. Ananya Sen (PGT Math)',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentParentService.getTimetable()
      .then((res) => {
        if (res?.data) {
          if (res.data.timetable && typeof res.data.timetable === 'object') {
            setTimetableData(res.data.timetable);
          }
          if (res.data.className) {
            setHeaderInfo({
              className: res.data.className,
              sectionName: res.data.sectionName || 'Section A',
              homeroom: res.data.homeroom || 'Senior Academic Wing • Room 301',
              classTeacher: res.data.classTeacher || 'Dr. Ananya Sen (PGT Math)',
            });
          }
        }
      })
      .catch((err) => console.error('Timetable data fetch error from database:', err))
      .finally(() => setLoading(false));
  }, []);

  const periods = (timetableData && timetableData[selectedDay]) ? timetableData[selectedDay] : [];

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <LuArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">School Period Timetable</h1>
            <p className="text-xs text-gray-400">{headerInfo.className} ({headerInfo.sectionName}) • Homeroom: {headerInfo.homeroom} • Class Teacher: {headerInfo.classTeacher}</p>
          </div>
        </div>
        <button className="px-3.5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto">
          <LuDownload className="w-3.5 h-3.5" /> Download Timetable PDF
        </button>
      </div>

      {/* Day Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
              selectedDay === day
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Periods Table & Cards */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <LuCalendarDays className="w-4 h-4 text-primary-600" /> {selectedDay} Schedule ({periods.length} Periods)
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
            Timetable Active
          </span>
        </div>

        <div className="space-y-3">
          {periods.map((p, idx) => (
            <div
              key={idx}
              className="p-2.5 sm:p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:border-primary-200 hover:shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3"
            >
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white border border-gray-200 text-primary-700 font-extrabold text-xs sm:text-sm flex items-center justify-center shrink-0">
                  P{idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-800 truncate">{p.subject}</h3>
                    <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                      {p.type || 'Theory'}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">Faculty: <strong className="text-gray-700">{p.teacher}</strong></p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-center sm:flex-col sm:items-end border-t sm:border-t-0 pt-1.5 sm:pt-0 border-gray-200/80 text-[11px] sm:text-xs">
                <span className="font-bold text-primary-600 flex items-center gap-1">
                  <LuClock className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {p.time}
                </span>
                <span className="text-gray-500 font-medium sm:mt-0.5 flex items-center gap-1">
                  <LuMapPin className="w-3 h-3 text-gray-400" /> {p.room || 'Room 301'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
