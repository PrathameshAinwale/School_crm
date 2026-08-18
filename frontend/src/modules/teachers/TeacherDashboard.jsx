import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeCard from '../../components/Dashboard/WelcomeCard';
import {
  LuCalendarClock,
  LuClipboardCheck,
  LuClipboardList,
  LuBookOpen,
  LuArrowRight,
  LuClock,
  LuUsers,
  LuTimer,
  LuCalendarDays,
  LuCheck,
  LuSparkles,
  LuMapPin,
  LuBell,
  LuChevronRight,
} from 'react-icons/lu';

export default function TeacherDashboard() {
  const navigate = useNavigate();

  // 3 Primary Daily Action Cards for the Teacher
  const dailyCards = [
    {
      id: 'schedule',
      title: "Today's Schedule",
      badge: '5 Classes Today',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: LuCalendarClock,
      iconBg: 'bg-blue-50 text-blue-600',
      highlight: 'Next: Grade 10-A (Maths)',
      time: '09:30 AM - 10:15 AM',
      room: 'Room 204',
      subtext: '4 classes remaining today • 1 Free Period',
      actionText: 'View Full Timetable',
      path: '/calendar',
    },
    {
      id: 'attendance',
      title: 'Class Attendance',
      badge: 'Grade 10-A',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: LuClipboardCheck,
      iconBg: 'bg-emerald-50 text-emerald-600',
      highlight: '28 / 32 Students Present',
      time: 'Marked for Today',
      room: '90.6% Turnout',
      subtext: '4 students absent • Notes recorded',
      actionText: 'Manage Student Attendance',
      path: '/teacher/student-attendance',
    },
    {
      id: 'assignments',
      title: 'Active Assignments',
      badge: '3 Active Sets',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: LuClipboardList,
      iconBg: 'bg-amber-50 text-amber-600',
      highlight: '12 Pending Evaluations',
      time: 'Due Tomorrow: Set 4.2',
      room: 'Grade 10-A & 10-B',
      subtext: '28 submissions received awaiting review',
      actionText: 'Review Submissions',
      path: '/assignments',
    },
  ];

  // Quick Daily Schedule Preview (Next 3 upcoming items)
  const todayLectures = [
    { period: 'Period 1', time: '08:30 - 09:15 AM', class: 'Grade 9-A', subject: 'Mathematics', room: 'Room 102', status: 'Completed' },
    { period: 'Period 2', time: '09:30 - 10:15 AM', class: 'Grade 10-A', subject: 'Mathematics (Standard)', room: 'Room 204', status: 'Next Up' },
    { period: 'Period 3', time: '10:30 - 11:15 AM', class: 'Grade 10-B', subject: 'Mathematics (Trigonometry)', room: 'Room 206', status: 'Upcoming' },
  ];

  // Quick notices for teachers
  const dailyNotices = [
    { id: 1, title: 'Staff Briefing on Term 1 Assessments', time: 'Today at 03:30 PM', room: 'Conference Hall' },
    { id: 2, title: 'Science Fair Project Submissions Open', time: 'Deadline: Friday', room: 'Lab 3' },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <WelcomeCard />

      {/* Primary 3 Daily Information Cards */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <LuSparkles className="w-4 h-4 text-primary-600" />
            Today's Key Priorities
          </h2>
          <span className="text-xs text-gray-400 font-medium">Click any card to open details</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {dailyCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => navigate(card.path)}
                className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs hover:shadow-lg hover:border-primary-300 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Top Accent Stripe on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>

                  {/* Card Title & Main Highlight */}
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {card.title}
                  </h3>

                  <div className="mt-3 p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100/80 space-y-1">
                    <p className="text-sm font-bold text-gray-800">{card.highlight}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 font-medium pt-1">
                      <span className="flex items-center gap-1">
                        <LuClock className="w-3.5 h-3.5 text-gray-400" /> {card.time}
                      </span>
                      <span className="text-primary-700 font-semibold">{card.room}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-3 font-medium">
                    {card.subtext}
                  </p>
                </div>

                {/* Card Action Link */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-primary-600 group-hover:text-primary-700">
                  <span>{card.actionText}</span>
                  <LuArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Clean Detail Sections Below */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Lecture Schedule Timeline */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <LuCalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Today's Class Schedule</h3>
                <p className="text-xs text-gray-400">Class periods and assigned rooms</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/calendar')}
              className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Full Schedule <LuChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {todayLectures.map((item, idx) => (
              <div
                key={idx}
                onClick={() => navigate('/calendar')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  item.status === 'Next Up'
                    ? 'bg-primary-50/40 border-primary-200 hover:bg-primary-50/70 shadow-2xs'
                    : item.status === 'Completed'
                    ? 'bg-gray-50/60 border-gray-100 opacity-75'
                    : 'bg-white border-gray-200/80 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    item.status === 'Next Up'
                      ? 'bg-primary-600 text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-gray-900 truncate">{item.class} • {item.subject}</p>
                      {item.status === 'Next Up' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-100 text-primary-700 uppercase tracking-wider">
                          Live Next
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2">
                      <span>{item.time}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-gray-700">
                        <LuMapPin className="w-3 h-3 text-gray-400" /> {item.room}
                      </span>
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                    item.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : item.status === 'Next Up'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Daily Staff Announcements & Quick Actions */}
        <div className="space-y-5">
          {/* Quick Notice Board */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <LuBell className="w-4 h-4 text-primary-600" />
                Staff Notices Today
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-3">
              {dailyNotices.map((notice) => (
                <div key={notice.id} className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-1">
                  <p className="text-xs font-bold text-gray-800 leading-snug">{notice.title}</p>
                  <p className="text-[11px] text-gray-500 flex items-center justify-between pt-1">
                    <span>{notice.time}</span>
                    <span className="text-primary-700 font-semibold">{notice.room}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Syllabus Shortcut Card */}
          <div
            onClick={() => navigate('/syllabus')}
            className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-6 text-white shadow-md hover:shadow-xl transition-all cursor-pointer group flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary-200">
                Curriculum Tracker
              </span>
              <h4 className="text-base font-bold mt-1">Update Syllabus Progress</h4>
              <p className="text-xs text-primary-100 mt-1">Log today's topics and chapters</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <LuBookOpen className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
