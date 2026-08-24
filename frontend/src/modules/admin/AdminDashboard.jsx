import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WelcomeCard from '../../components/Dashboard/WelcomeCard';
import StatCard from '../../components/Dashboard/StatCard';
import { adminService } from '../../services/adminService';
import {
  LuUsers,
  LuGraduationCap,
  LuUserPlus,
  LuBus,
  LuBoxes,
  LuClipboardList,
  LuArrowRight,
  LuCircleCheck,
  LuLoader,
  LuPlus,
} from 'react-icons/lu';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboardStats()
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch dashboard stats:', err);
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
    total_classes: 0,
    attendance_rate: 0,
    pending_admissions: 0,
    total_admissions: 0,
    active_vehicles: 0,
    total_vehicles: 0,
    total_resources: 0,
    available_resources: 0,
  };

  const quickModules = [
    {
      title: 'Manage Teachers & Staff',
      subtitle: `${metrics.total_teachers} Staff • Profiles, Roles & Status`,
      count: `${metrics.total_teachers} Staff`,
      status: metrics.total_teachers > 0 ? `${metrics.active_teachers} Active` : 'No Staff Yet',
      icon: LuUsers,
      path: '/manage-teachers',
    },
    {
      title: 'Students & Divisions',
      subtitle: `${metrics.total_students} Students • ${metrics.total_classes} Classes`,
      count: `${metrics.total_students} Students`,
      status: metrics.total_students > 0 ? `${metrics.active_students} Active` : 'No Students Yet',
      icon: LuGraduationCap,
      path: '/students',
    },
    {
      title: 'Staff & Student Attendance',
      subtitle: 'Daily In/Out Muster Roll & Class Attendance',
      count: `${metrics.attendance_rate}% Rate`,
      status: 'Live Tracking',
      icon: LuClipboardList,
      path: '/attendance',
    },
    {
      title: 'Admissions & Pipeline',
      subtitle: `${metrics.pending_admissions} Pending Inquiries`,
      count: `${metrics.total_admissions} Apps`,
      status: `${metrics.pending_admissions} Pending`,
      icon: LuUserPlus,
      path: '/admission',
    },
    {
      title: 'School Vehicles & Transit',
      subtitle: `${metrics.total_vehicles} Transport Fleet registered`,
      count: `${metrics.total_vehicles} Fleet`,
      status: `${metrics.active_vehicles} Active`,
      icon: LuBus,
      path: '/school-vehicles',
    },
    {
      title: 'School Resources & Assets',
      subtitle: `${metrics.total_resources} Total Asset Units`,
      count: `${metrics.total_resources} Units`,
      status: `${metrics.available_resources} Available`,
      icon: LuBoxes,
      path: '/school-resources',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-10">
      {/* 1. Welcome Card */}
      <WelcomeCard />

      {/* 2. Top Summary KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <Link to="/manage-teachers" className="group block">
          <StatCard
            label="Faculty & Staff"
            value={metrics.total_teachers}
            trend={metrics.active_teachers + " Active"}
            trendUp={true}
            icon={LuUsers}
            color="blue"
          />
        </Link>
        <Link to="/students" className="group block">
          <StatCard
            label="Total Students"
            value={metrics.total_students}
            trend={metrics.total_classes + " Classes"}
            trendUp={true}
            icon={LuGraduationCap}
            color="green"
          />
        </Link>
        <Link to="/admission" className="group block">
          <StatCard
            label="Active Admissions"
            value={metrics.total_admissions}
            trend={metrics.pending_admissions + " Pending"}
            trendUp={true}
            icon={LuUserPlus}
            color="violet"
          />
        </Link>
        <Link to="/attendance" className="group block">
          <StatCard
            label="Attendance Rate"
            value={`${metrics.attendance_rate}%`}
            trend="Today's muster"
            trendUp={metrics.attendance_rate >= 80}
            icon={LuClipboardList}
            color="amber"
          />
        </Link>
      </div>

      {/* 3. Core Admin Management Grid */}
      <div>
        <div className="flex items-center justify-between mb-2.5 sm:mb-3.5">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-gray-800">Administrative Modules</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
          {quickModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.path}
                to={mod.path}
                className="group bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md hover:border-primary-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-gray-100 text-gray-700 group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors">
                      {mod.count}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 text-xs sm:text-sm mb-1 group-hover:text-primary-700 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-gray-400 leading-relaxed line-clamp-2">
                    {mod.subtitle}
                  </p>
                </div>

                <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] sm:text-xs">
                  <span className="text-gray-500 font-medium">{mod.status}</span>
                  <span className="text-primary-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Open <LuArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
