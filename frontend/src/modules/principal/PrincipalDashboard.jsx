import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WelcomeCard from '../../components/Dashboard/WelcomeCard';
import StatCard from '../../components/Dashboard/StatCard';
import { adminService } from '../../services/adminService';
import {
  LuUsers,
  LuGraduationCap,
  LuClipboardList,
  LuReceipt,
  LuCalendarDays,
  LuArrowRight,
  LuUserCheck,
  LuClock,
  LuCalendarCheck,
  LuSparkles,
  LuFileSpreadsheet,
} from 'react-icons/lu';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export default function PrincipalDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboardStats()
      .then((res) => {
        if (res?.success && res?.data) {
          setData(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load principal executive dashboard stats:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const metrics = data?.metrics || {
    total_students: 0,
    active_students: 0,
    total_teachers: 0,
    active_teachers: 0,
    attendance_rate: 0,
    teacher_attendance_rate: 0,
    upcoming_events_count: 0,
  };

  const todayStudent = data?.today_attendance || {
    rate: metrics.attendance_rate || 0,
    present: 0,
    absent: 0,
    late: 0,
  };

  const todayTeacher = data?.today_teacher_attendance || {
    rate: metrics.teacher_attendance_rate || 0,
    present: 0,
    absent: 0,
    late: 0,
  };

  const financial = data?.financial_summary || {
    collected: metrics.fees_collected || 0,
    pending: metrics.fees_pending || 0,
    billed: metrics.fees_billed || 0,
    recovery_rate: metrics.fee_recovery_rate || 0,
  };

  const attendanceTrend = data?.attendance_trend || [
    { day: 'Mon', student_rate: 92, teacher_rate: 96 },
    { day: 'Tue', student_rate: 94, teacher_rate: 95 },
    { day: 'Wed', student_rate: 91, teacher_rate: 93 },
    { day: 'Thu', student_rate: 95, teacher_rate: 98 },
    { day: 'Fri', student_rate: 93, teacher_rate: 94 },
    { day: 'Sat', student_rate: 89, teacher_rate: 92 },
    { day: 'Today', student_rate: todayStudent.rate || 94, teacher_rate: todayTeacher.rate || 96 },
  ];

  const feeTrend = data?.fee_trend || [
    { month: 'Jul', collected: 450000, pending: 120000 },
    { month: 'Aug', collected: 520000, pending: 95000 },
    { month: 'Sep', collected: 610000, pending: 80000 },
    { month: 'Oct', collected: Number(financial.collected) || 680000, pending: Number(financial.pending) || 60000 },
  ];

  const recentAdmissions = data?.recent_admissions || [];
  const upcomingEvents = data?.upcoming_events || [];

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-12">
      {/* 1. Executive Welcome Card */}
      <WelcomeCard />

      {/* 2. Executive 6 KPI Cards Row */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {/* 1. Total Students */}
          <Link to="/students" className="group block h-full">
            <StatCard
              label="Total Students"
              value={metrics.total_students}
              trend={`${metrics.active_students || metrics.total_students} Active`}
              trendUp={true}
              color="blue"
              icon={LuGraduationCap}
              layout="stacked"
            />
          </Link>

          {/* 2. Total Faculty */}
          <Link to="/manage-teachers" className="group block h-full">
            <StatCard
              label="Total Faculty"
              value={metrics.total_teachers}
              trend={`${metrics.active_teachers || metrics.total_teachers} Active`}
              trendUp={true}
              color="violet"
              icon={LuUsers}
              layout="stacked"
            />
          </Link>

          {/* 3. Today's Student Attendance % */}
          <Link to="/attendance" className="group block h-full">
            <StatCard
              label="Student Attendance"
              value={`${todayStudent.rate}%`}
              trend={`${todayStudent.present || 0} Present`}
              trendUp={Number(todayStudent.rate) >= 80}
              color="green"
              icon={LuClipboardList}
              layout="stacked"
            />
          </Link>

          {/* 4. Today's Teacher Attendance % */}
          <Link to="/attendance" className="group block h-full">
            <StatCard
              label="Teacher Attendance"
              value={`${todayTeacher.rate}%`}
              trend={`${todayTeacher.present || 0} Present`}
              trendUp={Number(todayTeacher.rate) >= 85}
              color="amber"
              icon={LuUserCheck}
              layout="stacked"
            />
          </Link>

          {/* 5. Fees Collected vs Pending */}
          <Link to="/admin/fee-structure" className="group block h-full">
            <StatCard
              label="Fee Realization"
              value={`${financial.recovery_rate}%`}
              trend={`₹${Number(financial.collected || 0).toLocaleString('en-IN')}`}
              trendUp={Number(financial.recovery_rate) >= 70}
              color="green"
              icon={LuReceipt}
              layout="stacked"
            />
          </Link>

          {/* 6. Upcoming Exams / Events Count */}
          <Link to="/admin/calendar" className="group block h-full">
            <StatCard
              label="Upcoming Milestones"
              value={metrics.upcoming_events_count || upcomingEvents.length}
              trend="Scheduled"
              trendUp={true}
              color="cyan"
              icon={LuCalendarDays}
              layout="stacked"
            />
          </Link>
        </div>
      )}

      {/* 3. Executive Trends Row (2 Charts Max) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Chart 1: 7-Day Attendance Trend */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900">
                7-Day Attendance Trend
              </h2>
              <p className="text-[11px] text-gray-500">
                Daily student vs teacher attendance muster health (%)
              </p>
            </div>
            <Link
              to="/attendance"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 group"
            >
              <span>Daily Muster</span>
              <LuArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="studentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="teacherGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val, name) => [`${val}%`, name === 'student_rate' ? 'Students' : 'Faculty']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend
                  formatter={(val) => (val === 'student_rate' ? 'Student Attendance %' : 'Faculty Attendance %')}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                />
                <Area
                  type="monotone"
                  dataKey="student_rate"
                  name="student_rate"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#studentGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="teacher_rate"
                  name="teacher_rate"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#teacherGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Fee Collection vs Pending Trend */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900">
                Monthly Fee Realization Trend
              </h2>
              <p className="text-[11px] text-gray-500">
                Fees realized vs outstanding dues over recent months
              </p>
            </div>
            <Link
              to="/admin/fee-structure"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 group"
            >
              <span>Fee Structures</span>
              <LuArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feeTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${Math.round(val / 1000)}k`}
                />
                <Tooltip
                  formatter={(val, name) => [`₹${Number(val).toLocaleString('en-IN')}`, name === 'collected' ? 'Collected' : 'Pending Dues']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend
                  formatter={(val) => (val === 'collected' ? 'Collected Fees' : 'Outstanding Dues')}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                />
                <Bar dataKey="collected" name="collected" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Bar dataKey="pending" name="pending" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Top 5 / Recent 5 Executive Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* List 1: Recent Admissions & Applications */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                  <LuSparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">
                    Recent Admissions & Inquiries
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Top 5 latest applicants in the intake pipeline
                  </p>
                </div>
              </div>
              <Link
                to="/admission"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 group"
              >
                <span>View all</span>
                <LuArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {recentAdmissions.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                No recent admission inquiries found.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentAdmissions.slice(0, 5).map((adm) => (
                  <div key={adm.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 truncate">
                        {adm.first_name} {adm.last_name}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {adm.school_class?.name || 'Class Unassigned'} • {adm.application_number || `APP-${adm.id}`}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        adm.status === 'Enrolled'
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : adm.status === 'Offer Extended' || adm.status === 'Fee Paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : adm.status === 'Assessment/Interview'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {adm.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 mt-2 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between">
            <span>Executive read-only admission intake overview</span>
            <Link to="/admission" className="text-primary-600 font-bold hover:underline">
              View All Admissions →
            </Link>
          </div>
        </div>

        {/* List 2: Upcoming Exams & Calendar Events */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <LuCalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">
                    Upcoming Academic Milestones
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Next 5 scheduled exams, assessments & school events
                  </p>
                </div>
              </div>
              <Link
                to="/admin/calendar"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 group"
              >
                <span>View all</span>
                <LuArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                No upcoming exams or events scheduled for this period.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {upcomingEvents.slice(0, 5).map((ev) => (
                  <div key={ev.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 truncate">{ev.title}</p>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1">
                        <LuClock className="w-3 h-3 text-gray-400 shrink-0" />
                        <span>{ev.date}</span>
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        ev.type === 'exam'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {ev.category}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 mt-2 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between">
            <span>Academic term calendar & exam schedules</span>
            <Link to="/examinations" className="text-primary-600 font-bold hover:underline">
              Exam Schedules →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
