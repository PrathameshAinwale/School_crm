import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LuClock,
  LuArrowLeft,
  LuCalendarDays,
  LuBookOpen,
  LuMapPin,
  LuDownload,
  LuCircleCheck,
} from 'react-icons/lu';

const weeklyTimetable = {
  Monday: [
    { period: 'Period 1', time: '8:00 - 8:45 AM', subject: 'Mathematics', teacher: 'Dr. Ananya Sen', room: 'Room 301', type: 'Theory', topic: 'Quadratic Equations Word Problems' },
    { period: 'Period 2', time: '8:45 - 9:30 AM', subject: 'Science (Physics)', teacher: 'Mr. Vikram Rathore', room: 'Physics Lab 1', type: 'Lab Practical', topic: 'Ray Optics Reflection Experiment' },
    { period: 'Period 3', time: '9:45 - 10:30 AM', subject: 'English Core', teacher: 'Ms. Sunita Rao', room: 'Room 301', type: 'Literature', topic: 'Nelson Mandela: Long Walk to Freedom' },
    { period: 'Period 4', time: '10:30 - 11:15 AM', subject: 'Computer Science (AI & Python)', teacher: 'Mrs. Deepa K.', room: 'Computer Lab 2', type: 'Practical', topic: 'Python Functions & Recursion' },
    { period: 'Period 5', time: '11:30 - 12:15 PM', subject: 'Social Science', teacher: 'Mr. Manoj Joshi', room: 'Room 301', type: 'History', topic: 'Nationalism in India — Section 2' },
    { period: 'Period 6', time: '12:15 - 1:00 PM', subject: 'Physical Education & Athletics', teacher: 'Coach Sandeep', room: 'Sports Arena', type: 'Sports', topic: 'Track Sprinting & Football' },
  ],
  Tuesday: [
    { period: 'Period 1', time: '8:00 - 8:45 AM', subject: 'Science (Chemistry)', teacher: 'Mr. Rajesh Mehra', room: 'Chemistry Lab', type: 'Lab Practical', topic: 'Acids & Bases Titration' },
    { period: 'Period 2', time: '8:45 - 9:30 AM', subject: 'Mathematics', teacher: 'Dr. Ananya Sen', room: 'Room 301', type: 'Theory', topic: 'Arithmetic Progressions nth Term' },
    { period: 'Period 3', time: '9:45 - 10:30 AM', subject: 'Hindi / 2nd Language', teacher: 'Mr. Suresh Kumar', room: 'Room 301', type: 'Literature', topic: 'Kavita Paath & Vyakaran' },
    { period: 'Period 4', time: '10:30 - 11:15 AM', subject: 'Social Science (Geography)', teacher: 'Mr. Manoj Joshi', room: 'Room 301', type: 'Geography', topic: 'Soil Resources in India' },
    { period: 'Period 5', time: '11:30 - 12:15 PM', subject: 'English Core', teacher: 'Ms. Sunita Rao', room: 'Room 301', type: 'Grammar', topic: 'Subject-Verb Concord Practice' },
    { period: 'Period 6', time: '12:15 - 1:00 PM', subject: 'Library & Self Study', teacher: 'Mr. R. K. Verma', room: 'Central Library', type: 'Self Study', topic: 'Reference Reading' },
  ],
  Wednesday: [
    { period: 'Period 1', time: '8:00 - 8:45 AM', subject: 'Mathematics', teacher: 'Dr. Ananya Sen', room: 'Room 301', type: 'Theory', topic: 'AP Sum Formulas' },
    { period: 'Period 2', time: '8:45 - 9:30 AM', subject: 'Science (Biology)', teacher: 'Ms. Deepa Nair', room: 'Biology Lab', type: 'Lab Practical', topic: 'Human Heart Structure Demonstration' },
    { period: 'Period 3', time: '9:45 - 10:30 AM', subject: 'Social Science (Civics)', teacher: 'Mr. Manoj Joshi', room: 'Room 301', type: 'Civics', topic: 'Federalism in India' },
    { period: 'Period 4', time: '10:30 - 11:15 AM', subject: 'English Core', teacher: 'Ms. Sunita Rao', room: 'Room 301', type: 'Writing Skills', topic: 'Letter to Editor Drafting' },
    { period: 'Period 5', time: '11:30 - 12:15 PM', subject: 'Computer Science (Python)', teacher: 'Mrs. Deepa K.', room: 'Computer Lab 2', type: 'Practical', topic: 'Lists & Dictionary Operations' },
    { period: 'Period 6', time: '12:15 - 1:00 PM', subject: 'Arts & Music', teacher: 'Ms. Pallavi Roy', room: 'Fine Arts Studio', type: 'Activity', topic: 'Canvas Painting' },
  ],
  Thursday: [
    { period: 'Period 1', time: '8:00 - 8:45 AM', subject: 'Science (Physics)', teacher: 'Mr. Vikram Rathore', room: 'Room 301', type: 'Theory', topic: 'Refraction & Lens Law' },
    { period: 'Period 2', time: '8:45 - 9:30 AM', subject: 'Mathematics', teacher: 'Dr. Ananya Sen', room: 'Room 301', type: 'Problem Solving', topic: 'Board PYQs Practice' },
    { period: 'Period 3', time: '9:45 - 10:30 AM', subject: 'English Core', teacher: 'Ms. Sunita Rao', room: 'Room 301', type: 'Literature', topic: 'Dust of Snow Poetry Analysis' },
    { period: 'Period 4', time: '10:30 - 11:15 AM', subject: 'Social Science (Economics)', teacher: 'Mr. Manoj Joshi', room: 'Room 301', type: 'Economics', topic: 'Development & National Income' },
    { period: 'Period 5', time: '11:30 - 12:15 PM', subject: 'Hindi / 2nd Language', teacher: 'Mr. Suresh Kumar', room: 'Room 301', type: 'Grammar', topic: 'Samas & Sandhi Practice' },
    { period: 'Period 6', time: '12:15 - 1:00 PM', subject: 'Robotics & STEM Club', teacher: 'Mr. Alok Verma', room: 'Robotics Lab', type: 'Hands-on', topic: 'Microcontroller Programming' },
  ],
  Friday: [
    { period: 'Period 1', time: '8:00 - 8:45 AM', subject: 'Mathematics', teacher: 'Dr. Ananya Sen', room: 'Room 301', type: 'Theory', topic: 'Triangles Similarity Theorems' },
    { period: 'Period 2', time: '8:45 - 9:30 AM', subject: 'Science (Chemistry)', teacher: 'Mr. Rajesh Mehra', room: 'Room 301', type: 'Theory', topic: 'Plaster of Paris & Bleaching Powder' },
    { period: 'Period 3', time: '9:45 - 10:30 AM', subject: 'Social Science', teacher: 'Mr. Manoj Joshi', room: 'Room 301', type: 'History', topic: 'Civil Disobedience Movement' },
    { period: 'Period 4', time: '10:30 - 11:15 AM', subject: 'Computer Science (SQL)', teacher: 'Mrs. Deepa K.', room: 'Computer Lab 2', type: 'Practical', topic: 'SQL Table Constraints' },
    { period: 'Period 5', time: '11:30 - 12:15 PM', subject: 'English Core', teacher: 'Ms. Sunita Rao', room: 'Room 301', type: 'Comprehension', topic: 'Discursive Passage Analysis' },
    { period: 'Period 6', time: '12:15 - 1:00 PM', subject: 'Sports & Games', teacher: 'Coach Sandeep', room: 'Football Ground', type: 'Sports', topic: 'House League Match' },
  ],
  Saturday: [
    { period: 'Period 1', time: '8:00 - 8:45 AM', subject: 'Weekly Assessment Test', teacher: 'Class Invigilator', room: 'Room 301', type: 'Test', topic: 'Weekly Revision Test' },
    { period: 'Period 2', time: '8:45 - 9:30 AM', subject: 'Science Doubt Resolution', teacher: 'Mr. Vikram Rathore', room: 'Room 301', type: 'Remedial', topic: 'Student Doubts Clearance' },
    { period: 'Period 3', time: '9:45 - 10:30 AM', subject: 'Math Doubt Resolution', teacher: 'Dr. Ananya Sen', room: 'Room 301', type: 'Remedial', topic: 'Board Questions Solving' },
    { period: 'Period 4', time: '10:30 - 11:15 AM', subject: 'Co-Curricular & Club Activity', teacher: 'Club Incharges', room: 'Activity Hall', type: 'Club', topic: 'Debate & Quiz Society' },
  ],
};

export default function TimetablePage() {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState('Monday');
  const periods = weeklyTimetable[selectedDay];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
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
            <p className="text-xs text-gray-400">Class X-A • Homeroom: Room 301 • Class Teacher: Dr. Ananya Sen</p>
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
                      {p.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Faculty: <strong>{p.teacher}</strong></p>
                  <p className="text-xs text-gray-600 mt-1 italic font-medium">Topic: "{p.topic}"</p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-200/80 text-xs">
                <span className="font-bold text-primary-600 flex items-center gap-1">
                  <LuClock className="w-3.5 h-3.5" /> {p.time}
                </span>
                <span className="text-gray-500 font-medium mt-0.5 flex items-center gap-1">
                  <LuMapPin className="w-3 h-3 text-gray-400" /> {p.room}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
