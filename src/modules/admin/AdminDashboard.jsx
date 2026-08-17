import WelcomeCard from '../../components/Dashboard/WelcomeCard';
import StatCard from '../../components/Dashboard/StatCard';
import ChartCard from '../../components/Dashboard/ChartCard';
import {
  adminStats,
  weeklyAttendanceData,
  adminTeacherList,
  adminTimetableSubstitutions,
  adminSubjectProgress,
  adminVehicleFleet,
  adminResourcesSummary,
} from '../../data/mockData';
import {
  LuUsers,
  LuGraduationCap,
  LuCalendarClock,
  LuBookOpen,
  LuClipboardList,
  LuUserPlus,
  LuBus,
  LuBoxes,
  LuCircleCheck,
  LuClock,
  LuCircleAlert,
  LuPhone,
  LuMapPin,
} from 'react-icons/lu';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const statIcons = [LuUsers, LuGraduationCap, LuUserPlus, LuBus];
const statColors = ['blue', 'green', 'violet', 'amber'];

export default function AdminDashboard() {
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Welcome Banner */}
      <WelcomeCard />

      {/* Main KPI Row: Manage Teachers, Students, Admission, School Vehicles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminStats.map((stat, i) => (
          <div key={stat.label} className="relative">
            <StatCard
              label={stat.label}
              value={stat.value}
              trend={stat.trend}
              trendUp={stat.trendUp}
              icon={statIcons[i]}
              color={statColors[i]}
            />
            {stat.sub && (
              <div className="px-5 pb-3 -mt-2 bg-white rounded-b-xl border-x border-b border-gray-100 text-xs text-gray-500 font-medium">
                {stat.sub}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Section 1: Manage Teachers & Attendance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Manage Teachers Overview */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <LuUsers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Manage Teachers</h3>
                <p className="text-xs text-gray-400">186 Faculty Members • 180 Present Today</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
              96.8% Present
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400">
                  <th className="pb-2 font-medium">Teacher</th>
                  <th className="pb-2 font-medium">Department / Subject</th>
                  <th className="pb-2 font-medium">Classes</th>
                  <th className="pb-2 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {adminTeacherList.map((tch) => (
                  <tr key={tch.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 pr-2">
                      <p className="font-semibold text-gray-800">{tch.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{tch.id}</p>
                    </td>
                    <td className="py-2.5 pr-2">
                      <p className="text-gray-700">{tch.subject}</p>
                      <p className="text-[10px] text-gray-400">{tch.dept}</p>
                    </td>
                    <td className="py-2.5 pr-2 text-gray-600 font-medium">{tch.classes}</td>
                    <td className="py-2.5 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium ${
                          tch.status === 'Present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {tch.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Attendance Trends (Students vs Teachers) */}
        <ChartCard title="Daily Attendance Monitoring" subtitle="Weekly Attendance rate for 2,847 Students & 186 Teachers">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={weeklyAttendanceData}>
              <defs>
                <linearGradient id="gAdmStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gAdmTeachers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="students" stroke="#3b82f6" fill="url(#gAdmStudents)" strokeWidth={2} name="Students Present" />
              <Area type="monotone" dataKey="teachers" stroke="#10b981" fill="url(#gAdmTeachers)" strokeWidth={2} name="Teachers Present" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Section 2: Time Table & Subjects Progress Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 3. Time Table & Live Substitutions */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                  <LuCalendarClock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Time Table & Class Schedules</h3>
                  <p className="text-xs text-gray-400">78 Active Classrooms • Live period tracking</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                Period 4 Active (10:45 AM)
              </span>
            </div>

            <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
              <LuCircleAlert className="w-3.5 h-3.5 text-amber-500" /> Today's Teacher Substitutions Assigned
            </p>

            <div className="space-y-2.5">
              {adminTimetableSubstitutions.map((sub, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-800">{sub.class} — {sub.subject}</span>
                    <span className="text-gray-500 font-medium">{sub.period}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-500 mt-1 pt-1 border-t border-gray-200/50 text-[11px]">
                    <span>Absent: <strong className="text-rose-600 font-medium">{sub.absentTeacher}</strong></span>
                    <span>Substitute: <strong className="text-emerald-700 font-medium">{sub.substitute}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Class IX & X Schedule Review</span>
            <span className="font-semibold text-primary-600">All 78 Sections Scheduled</span>
          </div>
        </div>

        {/* 4. Subjects & Curriculum Coverage */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <LuBookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Subjects & Syllabus Progress</h3>
                <p className="text-xs text-gray-400">38 Core & Elective Subjects (Session 2026-27)</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-600">Avg 74.8% Complete</span>
          </div>

          <div className="space-y-3">
            {adminSubjectProgress.map((sub) => (
              <div key={sub.subject} className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div>
                    <span className="font-bold text-gray-800">{sub.subject}</span>
                    <span className="text-gray-400 ml-2">({sub.classes})</span>
                  </div>
                  <span className="font-bold text-primary-700">{sub.completion}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      sub.completion >= 80 ? 'bg-emerald-500' : sub.completion >= 70 ? 'bg-primary-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${sub.completion}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>HOD: {sub.head}</span>
                  <span className="text-emerald-600 font-medium">{sub.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: School Vehicles (Fleet) */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <LuBus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">School Vehicles & Transport Tracking</h3>
              <p className="text-xs text-gray-400">24 Buses & Vans • 1,420 Students in Daily Transit • 100% GPS & Speed Governor Active</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-1">
            <LuCircleCheck className="w-3.5 h-3.5" /> 22 Active Routes Live
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {adminVehicleFleet.map((veh) => (
            <div
              key={veh.busNo}
              className="p-3.5 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100/70 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <span className="text-xs font-bold text-gray-800">{veh.busNo.split(' ')[1]}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      veh.status.includes('Live') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {veh.speed !== '0 km/h' ? veh.speed : 'Parked'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 font-mono">{veh.busNo.split(' ')[0]}</p>

                <div className="mt-2 space-y-1 text-[11px] text-gray-600">
                  <div className="flex items-start gap-1">
                    <LuMapPin className="w-3.5 h-3.5 text-primary-600 shrink-0 mt-0.5" />
                    <span className="truncate">{veh.route}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-500 pt-1">
                    <span>Driver: <strong className="text-gray-700">{veh.driver.split(' ')[0]}</strong></span>
                    <span>Students: <strong className="text-primary-600">{veh.students}</strong></span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-200 flex items-center justify-between text-xs">
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <LuPhone className="w-3 h-3 text-gray-500" /> {veh.contact}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">GPS Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: School Resources Utilization */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <LuBoxes className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">School Resources & Facility Utilization</h3>
              <p className="text-xs text-gray-400">Classrooms, Laboratories, Digital Hubs, and Athletic Assets</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-primary-600">94% Campus Occupancy</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {adminResourcesSummary.map((res) => (
            <div key={res.name} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
              <p className="text-xs font-bold text-gray-800 truncate mb-1">{res.name}</p>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-lg font-bold text-primary-600">{res.active} / {res.total}</span>
                <span className="text-xs font-semibold text-emerald-600">{res.utilization}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1.5">
                <div
                  className="h-1.5 rounded-full bg-primary-600"
                  style={{ width: `${res.utilization}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400 truncate">{res.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
