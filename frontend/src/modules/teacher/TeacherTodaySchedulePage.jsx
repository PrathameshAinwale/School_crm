import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentParentService } from '../../services/studentParentService';
import {
  LuClock,
  LuCalendarDays,
  LuGraduationCap,
  LuArrowLeft,
  LuLayers,
} from 'react-icons/lu';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Fallback initial schedule with exact 4 fields: class, division, subject, timing
const fallbackLectures = {
  Monday: [
    { id: 1, class_name: 'Class 10', division: 'Div A', subject: 'Mathematics', time_slot: '8:00 - 8:45 AM' },
    { id: 2, class_name: 'Class 9', division: 'Div A', subject: 'Mathematics (Algebra)', time_slot: '8:45 - 9:30 AM' },
    { id: 3, class_name: 'Class 9', division: 'Div B', subject: 'Advanced Geometry', time_slot: '10:30 - 11:15 AM' },
    { id: 4, class_name: 'Class 8', division: 'Div A', subject: 'Foundation Mathematics', time_slot: '11:30 - 12:15 PM' },
  ],
  Tuesday: [
    { id: 5, class_name: 'Class 9', division: 'Div A', subject: 'Mathematics', time_slot: '8:00 - 8:45 AM' },
    { id: 6, class_name: 'Class 10', division: 'Div A', subject: 'Mathematics (AP & Quadratics)', time_slot: '8:45 - 9:30 AM' },
    { id: 7, class_name: 'Class 8', division: 'Div B', subject: 'Mathematics (Pre-Algebra)', time_slot: '10:30 - 11:15 AM' },
  ],
  Wednesday: [
    { id: 8, class_name: 'Class 10', division: 'Div A', subject: 'Mathematics', time_slot: '8:00 - 8:45 AM' },
    { id: 9, class_name: 'Class 9', division: 'Div A', subject: 'Math Lab & Geometry', time_slot: '8:45 - 9:30 AM' },
    { id: 10, class_name: 'Class 8', division: 'Div A', subject: 'Linear Equations', time_slot: '10:30 - 11:15 AM' },
  ],
  Thursday: [
    { id: 11, class_name: 'Class 9', division: 'Div B', subject: 'Mathematics', time_slot: '8:00 - 8:45 AM' },
    { id: 12, class_name: 'Class 8', division: 'Div A', subject: 'Foundation Maths', time_slot: '9:45 - 10:30 AM' },
  ],
  Friday: [
    { id: 13, class_name: 'Class 10', division: 'Div A', subject: 'Mathematics (Triangles)', time_slot: '8:00 - 8:45 AM' },
    { id: 14, class_name: 'Class 9', division: 'Div A', subject: 'Algebraic Expressions', time_slot: '9:45 - 10:30 AM' },
    { id: 15, class_name: 'Class 8', division: 'Div B', subject: 'Math Olympiad Club', time_slot: '11:30 - 12:15 PM' },
  ],
  Saturday: [
    { id: 16, class_name: 'Class 9', division: 'Div A', subject: 'Weekly Math Quiz', time_slot: '8:45 - 9:30 AM' },
  ],
};

export default function TeacherTodaySchedulePage() {
  const navigate = useNavigate();

  // Current day of the week (automatically selected to today)
  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayDay = daysOfWeek.includes(currentDayName) ? currentDayName : 'Monday';

  const [selectedDay, setSelectedDay] = useState(todayDay);
  const [lectures, setLectures] = useState(fallbackLectures[todayDay] || []);
  const [loading, setLoading] = useState(true);

  const fetchSchedule = async (day) => {
    try {
      const res = await studentParentService.getTeacherSchedule({ day });
      if (res?.success && res.data?.lectures?.length > 0) {
        setLectures(res.data.lectures);
      } else if (fallbackLectures[day]) {
        setLectures(fallbackLectures[day]);
      } else {
        setLectures([]);
      }
    } catch (err) {
      setLectures(fallbackLectures[day] || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchSchedule(selectedDay);
  }, [selectedDay]);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-12 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <LuArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-slate-800 leading-tight">Today's Schedule</h1>
            <p className="text-xs text-slate-400">Class, division, subject, and timings for {selectedDay}</p>
          </div>
        </div>
      </div>

      {/* Days of the Week Tabs (Automatically Selected to Today) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {daysOfWeek.map((day) => {
          const isSelected = selectedDay === day;
          const isToday = day === todayDay;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                isSelected
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{day}</span>
              {isToday && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-extrabold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-primary-50 text-primary-700'
                  }`}
                >
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Timetable Card List */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <LuCalendarDays className="w-4 h-4 text-primary-600" />
            {selectedDay} Timetable
          </h2>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
            {lectures.length} Lectures
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading schedule...</div>
        ) : lectures.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-bold text-slate-700">No lectures scheduled for {selectedDay}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Class</th>
                  <th className="px-5 py-3.5">Division</th>
                  <th className="px-5 py-3.5">Subject</th>
                  <th className="px-5 py-3.5">Timing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lectures.map((lec, idx) => (
                  <tr key={lec.id || idx} className="hover:bg-slate-50/60 transition-colors">
                    {/* 1. Class */}
                    <td className="px-5 py-4 font-bold text-slate-800">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 font-extrabold text-xs">
                        <LuGraduationCap className="w-3.5 h-3.5" />
                        {lec.class_name || 'Class 10'}
                      </div>
                    </td>

                    {/* 2. Division */}
                    <td className="px-5 py-4 font-bold text-slate-700">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs">
                        {lec.division || 'Div A'}
                      </span>
                    </td>

                    {/* 3. Subject */}
                    <td className="px-5 py-4 font-bold text-slate-900 text-sm">
                      {lec.subject}
                    </td>

                    {/* 4. Timing */}
                    <td className="px-5 py-4 font-bold text-primary-700">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary-50 text-primary-700 border border-primary-100 font-extrabold text-xs">
                        <LuClock className="w-3.5 h-3.5 text-primary-600" />
                        {lec.time_slot}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
