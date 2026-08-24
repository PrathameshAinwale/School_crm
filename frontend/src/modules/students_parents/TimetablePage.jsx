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

const fallbackWeeklyTimetable = {
  Monday: [
    { period: 'Period 1', time: '8:00 - 8:45 AM', subject: 'Mathematics', teacher: 'Dr. Ananya Sen', room: 'Room 301', type: 'Theory' },
    { period: 'Period 2', time: '8:45 - 9:30 AM', subject: 'Science (Physics)', teacher: 'Mr. Vikram Rathore', room: 'Physics Lab 1', type: 'Lab Practical' },
    { period: 'Period 3', time: '9:45 - 10:30 AM', subject: 'English Core', teacher: 'Ms. Sunita Rao', room: 'Room 301', type: 'Literature' },
    { period: 'Period 4', time: '10:30 - 11:15 AM', subject: 'Computer Science (AI & Python)', teacher: 'Mrs. Deepa K.', room: 'Computer Lab 2', type: 'Practical' },
    { period: 'Period 5', time: '11:30 - 12:15 PM', subject: 'Social Science', teacher: 'Mr. Manoj Joshi', room: 'Room 301', type: 'History' },
    { period: 'Period 6', time: '12:15 - 1:00 PM', subject: 'Physical Education & Athletics', teacher: 'Coach Sandeep', room: 'Sports Arena', type: 'Sports' },
  ],
  Tuesday: [
    { period: 'Period 1', time: '8:00 - 8:45 AM', subject: 'Science (Chemistry)', teacher: 'Mr. Rajesh Mehra', room: 'Chemistry Lab', type: 'Lab Practical' },
    { period: 'Period 2', time: '8:45 - 9:30 AM', subject: 'Mathematics', teacher: 'Dr. Ananya Sen', room: 'Room 301', type: 'Theory' },
    { period: 'Period 3', time: '9:45 - 10:30 AM', subject: 'Hindi / 2nd Language', teacher: 'Mr. Suresh Kumar', room: 'Room 301', type: 'Literature' },
    { period: 'Period 4', time: '10:30 - 11:15 AM', subject: 'Social Science (Geography)', teacher: 'Mr. Manoj Joshi', room: 'Room 301', type: 'Geography' },
    { period: 'Period 5', time: '11:30 - 12:15 PM', subject: 'English Core', teacher: 'Ms. Sunita Rao', room: 'Room 301', type: 'Grammar' },
    { period: 'Period 6', time: '12:15 - 1:00 PM', subject: 'Library & Self Study', teacher: 'Mr. R. K. Verma', room: 'Central Library', type: 'Self Study' },
  ],
  Wednesday: [
    { period: 'Period 1', time: '8:00 - 8:45 AM', subject: 'Mathematics', teacher: 'Dr. Ananya Sen', room: 'Room 301', type: 'Theory' },
    { period: 'Period 2', time: '8:45 - 9:30 AM', subject: 'Science (Biology)', teacher: 'Ms. Deepa Nair', room: 'Biology Lab', type: 'Lab Practical' },
    { period: 'Period 3', time: '9:45 - 10:30 AM', subject: 'Social Science (Civics)', teacher: 'Mr. Manoj Joshi', room: 'Room 301', type: 'Civics' },
    { period: 'Period 4', time: '10:30 - 11:15 AM', subject: 'English Core', teacher: 'Ms. Sunita Rao', room: 'Room 301', type: 'Writing Skills' },
    { period: 'Period 5', time: '11:30 - 12:15 PM', subject: 'Computer Science (Python)', teacher: 'Mrs. Deepa K.', room: 'Computer Lab 2', type: 'Practical' },
    { period: 'Period 6', time: '12:15 - 1:00 PM', subject: 'Arts & Music', teacher: 'Ms. Pallavi Roy', room: 'Fine Arts Studio', type: 'Activity' },
  ],
  Thursday: [
    { period: 'Period 1', time: '8:00 - 8:45 AM', subject: 'Science (Physics)', teacher: 'Mr. Vikram Rathore', room: 'Room 301', type: 'Theory' },
    { period: 'Period 2', time: '8:45 - 9:30 AM', subject: 'Mathematics', teacher: 'Dr. Ananya Sen', room: 'Room 301', type: 'Problem Solving' },
    { period: 'Period 3', time: '9:45 - 10:30 AM', subject: 'English Core', teacher: 'Ms. Sunita Rao', room: 'Room 301', type: 'Literature' },
    { period: 'Period 4', time: '10:30 - 11:15 AM', subject: 'Social Science (Economics)', teacher: 'Mr. Manoj Joshi', room: 'Room 301', type: 'Economics' },
    { period: 'Period 5', time: '11:30 - 12:15 PM', subject: 'Hindi / 2nd Language', teacher: 'Mr. Suresh Kumar', room: 'Room 301', type: 'Grammar' },
    { period: 'Period 6', time: '12:15 - 1:00 PM', subject: 'Robotics & STEM Club', teacher: 'Mr. Alok Verma', room: 'Robotics Lab', type: 'Hands-on' },
  ],
  Friday: [
    { period: 'Period 1', time: '8:00 - 8:45 AM', subject: 'Mathematics', teacher: 'Dr. Ananya Sen', room: 'Room 301', type: 'Theory' },
    { period: 'Period 2', time: '8:45 - 9:30 AM', subject: 'Science (Chemistry)', teacher: 'Mr. Rajesh Mehra', room: 'Room 301', type: 'Theory' },
    { period: 'Period 3', time: '9:45 - 10:30 AM', subject: 'Social Science', teacher: 'Mr. Manoj Joshi', room: 'Room 301', type: 'History' },
    { period: 'Period 4', time: '10:30 - 11:15 AM', subject: 'Computer Science (SQL)', teacher: 'Mrs. Deepa K.', room: 'Computer Lab 2', type: 'Practical' },
    { period: 'Period 5', time: '11:30 - 12:15 PM', subject: 'English Core', teacher: 'Ms. Sunita Rao', room: 'Room 301', type: 'Comprehension' },
    { period: 'Period 6', time: '12:15 - 1:00 PM', subject: 'Sports & Games', teacher: 'Coach Sandeep', room: 'Football Ground', type: 'Sports' },
  ],
  Saturday: [
    { period: 'Period 1', time: '8:00 - 8:45 AM', subject: 'Weekly Assessment Test', teacher: 'Class Invigilator', room: 'Room 301', type: 'Test' },
    { period: 'Period 2', time: '8:45 - 9:30 AM', subject: 'Science Doubt Resolution', teacher: 'Mr. Vikram Rathore', room: 'Room 301', type: 'Remedial' },
    { period: 'Period 3', time: '9:45 - 10:30 AM', subject: 'Math Doubt Resolution', teacher: 'Dr. Ananya Sen', room: 'Room 301', type: 'Remedial' },
    { period: 'Period 4', time: '10:30 - 11:15 AM', subject: 'Co-Curricular & Club Activity', teacher: 'Club Incharges', room: 'Activity Hall', type: 'Club' },
  ],
};

export default function TimetablePage() {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [timetableData, setTimetableData] = useState(fallbackWeeklyTimetable);
  const [headerInfo, setHeaderInfo] = useState({
    className: 'Class 10',
    sectionName: 'Saffron A',
    homeroom: 'Room 301',
    classTeacher: 'Shruti Sen',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentParentService.getTimetable()
      .then((res) => {
        if (res?.data) {
          if (res.data.timetable && Object.keys(res.data.timetable).length > 0) {
            setTimetableData(res.data.timetable);
          }
          if (res.data.className) {
            setHeaderInfo({
              className: res.data.className,
              sectionName: res.data.sectionName || 'A',
              homeroom: res.data.homeroom || 'Room 301',
              classTeacher: res.data.classTeacher || 'Shruti Sen',
            });
          }
        }
      })
      .catch((err) => console.log('Loaded fallback timetable:', err))
      .finally(() => setLoading(false));
  }, []);

  const periods = timetableData[selectedDay] || [];

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
              className="p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:border-primary-200 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 text-primary-700 font-extrabold text-sm flex items-center justify-center shrink-0">
                  P{idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-800">{p.subject}</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {p.type || 'Theory'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Faculty: <strong>{p.teacher}</strong></p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-200/80 text-xs">
                <span className="font-bold text-primary-600 flex items-center gap-1">
                  <LuClock className="w-3.5 h-3.5" /> {p.time}
                </span>
                <span className="text-gray-500 font-medium mt-0.5 flex items-center gap-1">
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
