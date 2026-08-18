import React from 'react';
import { Link } from 'react-router-dom';
import WelcomeCard from '../../components/Dashboard/WelcomeCard';
import StatCard from '../../components/Dashboard/StatCard';
import {
  LuUsers,
  LuGraduationCap,
  LuUserPlus,
  LuBus,
  LuBoxes,
  LuClipboardList,
  LuArrowRight,
  LuCircleCheck,
} from 'react-icons/lu';

export default function AdminDashboard() {
  const quickModules = [
    {
      title: 'Manage Teachers & Staff',
      subtitle: '186 Staff • Profiles, Roles & Status',
      count: '186 Staff',
      status: '96.8% Present',
      icon: LuUsers,
      path: '/manage-teachers',
    },
    {
      title: 'Students & Divisions',
      subtitle: '2,847 Students • 14 Grades & 78 Sections',
      count: '2,847 Students',
      status: 'Nursery to XII',
      icon: LuGraduationCap,
      path: '/students',
    },
    {
      title: 'Staff & HR Attendance',
      subtitle: 'Daily In/Out Muster Roll for all Wings',
      count: '96.4% Present',
      status: '12 On Leave',
      icon: LuClipboardList,
      path: '/attendance',
    },
    {
      title: 'Admissions & Quotas',
      subtitle: 'Active Pipeline: Direct, Mgmt & RTE',
      count: '480 Apps',
      status: '185 Enrolled',
      icon: LuUserPlus,
      path: '/admission',
    },
    {
      title: 'School Vehicles & Transit',
      subtitle: 'Drivers, Onboard Staff & Route Stops',
      count: '24 Fleet',
      status: '22 On Route',
      icon: LuBus,
      path: '/school-vehicles',
    },
    {
      title: 'School Resources & Facilities',
      subtitle: 'Smart Classrooms, Labs & Sports Arenas',
      count: '580+ Units',
      status: '94.2% In-Use',
      icon: LuBoxes,
      path: '/school-resources',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* 1. Welcome Card */}
      <WelcomeCard />

      {/* 2. Top Summary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/manage-teachers" className="group block">
          <StatCard
            label="Faculty & Staff"
            value="186"
            trend="96.8% present"
            trendUp={true}
            icon={LuUsers}
            color="blue"
          />
        </Link>
        <Link to="/students" className="group block">
          <StatCard
            label="Total Students"
            value="2,847"
            trend="+4.2% YoY"
            trendUp={true}
            icon={LuGraduationCap}
            color="green"
          />
        </Link>
        <Link to="/admission" className="group block">
          <StatCard
            label="Active Admissions"
            value="480"
            trend="+14% intake"
            trendUp={true}
            icon={LuUserPlus}
            color="violet"
          />
        </Link>
        <Link to="/school-vehicles" className="group block">
          <StatCard
            label="Transit Fleet"
            value="24 Buses"
            trend="22 on route"
            trendUp={true}
            icon={LuBus}
            color="amber"
          />
        </Link>
      </div>

      {/* 3. Main Administrative Management Modules */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-800">Administrative Management Modules</h2>
            <p className="text-xs text-gray-400">Direct access to school registers, rosters, and operational logs</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap shrink-0">
            Session 2026-27
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.title}
                to={mod.path}
                className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 whitespace-nowrap shrink-0">
                      {mod.count}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-800 text-sm group-hover:text-primary-600 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {mod.subtitle}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium whitespace-nowrap truncate max-w-[140px]">{mod.status}</span>
                  <span className="font-semibold text-primary-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform shrink-0">
                    Open <LuArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 4. Daily Operational Status Overview (Clean 2-Column Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Campus Attendance & Activity Pulse */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <LuCircleCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Campus Attendance & Activity Pulse</h3>
                  <p className="text-[11px] text-gray-400">Live attendance & operational summary</p>
                </div>
              </div>
              <Link to="/attendance" className="text-xs font-semibold text-primary-600 hover:underline shrink-0">
                View Muster Roll →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-[11px] text-gray-500 font-medium">Faculty & Staff Present</p>
                <p className="text-base font-bold text-gray-800 mt-0.5">180 / 186 Staff</p>
                <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">96.8% Presence Rate</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-[11px] text-gray-500 font-medium">Students Present</p>
                <p className="text-base font-bold text-gray-800 mt-0.5">2,740 / 2,847</p>
                <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">96.2% Presence Rate</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-[11px] text-gray-500 font-medium">Fleet on Transit Routes</p>
                <p className="text-base font-bold text-gray-800 mt-0.5">22 Buses Live</p>
                <p className="text-[10px] text-amber-700 font-semibold mt-0.5">2 In Maintenance Bay</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-[11px] text-gray-500 font-medium">Campus Asset Occupancy</p>
                <p className="text-base font-bold text-gray-800 mt-0.5">94.2% Utilization</p>
                <p className="text-[10px] text-primary-700 font-semibold mt-0.5">All 12 Labs Active</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Next School Event: <strong>Zonal Athletics Meet</strong></span>
            <span className="text-primary-600 font-semibold">Aug 28, 2026</span>
          </div>
        </div>

        {/* Admissions & Enrollment Pipeline Summary */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                  <LuUserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Admissions Pipeline Summary</h3>
                  <p className="text-[11px] text-gray-400">480 Active Intake Applications for 2026-27</p>
                </div>
              </div>
              <Link to="/admission" className="text-xs font-semibold text-primary-600 hover:underline shrink-0">
                View Pipeline →
              </Link>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                <div>
                  <span className="font-semibold text-gray-800">Approved & Enrolled</span>
                  <p className="text-[10px] text-gray-400">Admission fees realized</p>
                </div>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap shrink-0">
                  185 Enrolled
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                <div>
                  <span className="font-semibold text-gray-800">Interviews & Tests Scheduled</span>
                  <p className="text-[10px] text-gray-400">Interaction assessments active</p>
                </div>
                <span className="font-semibold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-200 whitespace-nowrap shrink-0">
                  98 Scheduled
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                <div>
                  <span className="font-semibold text-gray-800">Under Document Verification</span>
                  <p className="text-[10px] text-gray-400">Direct, Management & RTE quotas</p>
                </div>
                <span className="font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 whitespace-nowrap shrink-0">
                  142 Under Review
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Primary Sources: <strong>Direct Walk-in & Online Portal</strong></span>
            <Link to="/admission" className="text-primary-600 font-semibold hover:underline shrink-0">
              Manage Admissions →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
