import React from 'react';
import { Link } from 'react-router-dom';
import WelcomeCard from '../../components/Dashboard/WelcomeCard';
import StatCard from '../../components/Dashboard/StatCard';
import ChartCard from '../../components/Dashboard/ChartCard';
import {
  LuUsers,
  LuReceipt,
  LuGraduationCap,
  LuFolderLock,
  LuChartBar,
  LuBell,
  LuArrowRight,
  LuCircleCheck,
  LuAward,
  LuTarget,
  LuTrendingUp,
} from 'react-icons/lu';
import {
  BarChart,
  Bar,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// 1. Target vs Actual Chart Data
const TARGET_VS_ACTUAL_DATA = [
  { area: 'Enrollment (x10)', target: 280, actual: 284.7 },
  { area: 'Fee Realization %', target: 97, actual: 98.2 },
  { area: 'CBSE 90%+ Dist %', target: 50, actual: 54.2 },
  { area: 'Staff Retention %', target: 92, actual: 94.0 },
  { area: 'New Intakes (x10)', target: 52, actual: 55.0 },
  { area: 'Student Attd %', target: 96, actual: 96.2 },
];

// 2. Annual Admissions & Cumulative Strength
const ADMISSIONS_GROWTH_DATA = [
  { year: '2021', admissions: 380, totalStrength: 2100 },
  { year: '2022', admissions: 410, totalStrength: 2320 },
  { year: '2023', admissions: 440, totalStrength: 2500 },
  { year: '2024', admissions: 470, totalStrength: 2680 },
  { year: '2025', admissions: 505, totalStrength: 2750 },
  { year: '2026', admissions: 550, totalStrength: 2847 },
];

export default function OwnerDashboard() {
  const quickModules = [
    {
      title: 'Staff & Faculty Overview',
      subtitle: '186 Personnel • ₹1.24 Cr / mo Payroll',
      count: '186 Staff',
      status: '96.8% Attendance',
      icon: LuUsers,
      path: '/staff',
    },
    {
      title: 'Expenses & Financial Audit',
      subtitle: 'Payroll, Infrastructure & Utility Outflows',
      count: '₹1.56 Cr / mo',
      status: '100% Realized',
      icon: LuReceipt,
      path: '/expenses',
    },
    {
      title: 'Cumulative Student Count',
      subtitle: '2,847 Enrolled • Class & Wing Distribution',
      count: '2,847 Students',
      status: '14 Grades (NUR-XII)',
      icon: LuGraduationCap,
      path: '/student-count',
    },
    {
      title: 'Institutional Document Vault',
      subtitle: 'CBSE Affiliation, Fire NOC, Land & Trust Deeds',
      count: '9 Records',
      status: '100% Verified',
      icon: LuFolderLock,
      path: '/vault',
    },
    {
      title: 'Performance Analytics',
      subtitle: 'Academic Growth, Board Results & Focus Areas',
      count: '99.8% Pass',
      status: 'A+ Accreditation',
      icon: LuChartBar,
      path: '/analytics',
    },
    {
      title: 'Executive Notices & Events',
      subtitle: 'Trustee Board Meetings & Campus Ceremonies',
      count: '5 Circulars',
      status: 'Board Meeting Aug 28',
      icon: LuBell,
      path: '/notices',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-7xl mx-auto">
      {/* 1. Welcome Card */}
      <WelcomeCard />

      {/* 2. Top Summary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/staff" className="group block">
          <StatCard
            label="Total Staff Strength"
            value="186"
            trend="96.8% present"
            trendUp={true}
            icon={LuUsers}
            color="amber"
          />
        </Link>
        <Link to="/expenses" className="group block">
          <StatCard
            label="Monthly Outflow"
            value="₹1.56 Cr"
            trend="Payroll verified"
            trendUp={true}
            icon={LuReceipt}
            color="rose"
          />
        </Link>
        <Link to="/student-count" className="group block">
          <StatCard
            label="Cumulative Students"
            value="2,847"
            trend="+4.2% YoY"
            trendUp={true}
            icon={LuGraduationCap}
            color="green"
          />
        </Link>
        <Link to="/vault" className="group block">
          <StatCard
            label="Compliance Vault"
            value="9 Records"
            trend="CBSE 2029 Valid"
            trendUp={true}
            icon={LuFolderLock}
            color="blue"
          />
        </Link>
      </div>

      {/* 3. 2 KEY PERFORMANCE CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Graph 1: Target Wanted vs Actual Achieved */}
        <ChartCard
          title="Targets Wanted vs Actual Target Achieved"
          subtitle="Planned institutional benchmark goals vs actual numbers realized"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              104.2% Composite Index
            </span>
            <Link
              to="/analytics"
              className="text-xs font-semibold text-primary-600 hover:underline flex items-center gap-1"
            >
              Full Analytics <LuArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={215}>
            <BarChart data={TARGET_VS_ACTUAL_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="area" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                formatter={(val, name) => [val, name === 'actual' ? 'Actual Achieved' : 'Planned Target']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="target" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Planned Target" />
              <Bar dataKey="actual" fill="#10b981" radius={[4, 4, 0, 0]} name="Actual Achieved" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Graph 2: Number of Admissions Per Year and Growth Ratio */}
        <ChartCard
          title="Admissions Per Year & Cumulative Strength"
          subtitle="Annual intake student count (bars) alongside overall campus growth (trendline)"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              +8.9% Intake Growth (2026)
            </span>
            <Link
              to="/analytics"
              className="text-xs font-semibold text-primary-600 hover:underline flex items-center gap-1"
            >
              Admissions Ledger <LuArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={215}>
            <ComposedChart data={ADMISSIONS_GROWTH_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="admissions" fill="#2563eb" radius={[4, 4, 0, 0]} name="Annual New Admissions" />
              <Line
                type="monotone"
                dataKey="totalStrength"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Cumulative Strength"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* 4. Main School Owner Management Modules */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-800">School Owner Executive Operations</h2>
            <p className="text-xs text-gray-400">Institutional governance, financial audit, student strength, and compliance documents</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap shrink-0">
            Session 2026-27 Active
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

      {/* 5. Strategic Executive Pulse & Upcoming Events Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Institutional Financial & Academic Snapshot */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <LuCircleCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Executive Performance Pulse</h3>
                  <p className="text-[11px] text-gray-400">Institutional health & revenue metrics</p>
                </div>
              </div>
              <Link to="/analytics" className="text-xs font-semibold text-primary-600 hover:underline shrink-0">
                Full Analytics →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-[11px] text-gray-500 font-medium">Board Exam Pass Rate</p>
                <p className="text-base font-bold text-gray-800 mt-0.5">99.8% Pass</p>
                <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">54% Scored &gt; 90% (A1)</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-[11px] text-gray-500 font-medium">Fee Collection Rate</p>
                <p className="text-base font-bold text-gray-800 mt-0.5">98.2% Realized</p>
                <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">Q1 & Q2 Complete</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-[11px] text-gray-500 font-medium">Teacher-Student Ratio</p>
                <p className="text-base font-bold text-gray-800 mt-0.5">15.3 : 1</p>
                <p className="text-[10px] text-primary-700 font-semibold mt-0.5">Optimal Standard</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-[11px] text-gray-500 font-medium">Faculty Retention</p>
                <p className="text-base font-bold text-gray-800 mt-0.5">94.0%</p>
                <p className="text-[10px] text-teal-700 font-semibold mt-0.5">6.4 Yrs Avg Tenure</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Primary Focus: <strong>STEM Robotics Lab Phase 2</strong></span>
            <Link to="/analytics" className="text-primary-600 font-semibold hover:underline">
              Review Action Items →
            </Link>
          </div>
        </div>

        {/* Executive Notices & Board Agenda Preview */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                  <LuBell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Executive Circulars & Events</h3>
                  <p className="text-[11px] text-gray-400">Board agenda and institutional milestones</p>
                </div>
              </div>
              <Link to="/notices" className="text-xs font-semibold text-primary-600 hover:underline shrink-0">
                All Notices →
              </Link>
            </div>

            <div className="space-y-2 pt-1">
              <Link to="/notices" className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-xs hover:bg-gray-100 transition-colors block">
                <div>
                  <span className="font-semibold text-gray-800">Board & Trustee Quarterly Review Meeting</span>
                  <p className="text-[10px] text-gray-400">Aug 28, 2026 • 10:30 AM (Board Room)</p>
                </div>
                <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 whitespace-nowrap shrink-0">
                  Urgent
                </span>
              </Link>

              <Link to="/notices" className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-xs hover:bg-gray-100 transition-colors block">
                <div>
                  <span className="font-semibold text-gray-800">Inter-School Zonal Athletics Meet Opening</span>
                  <p className="text-[10px] text-gray-400">Sep 04, 2026 • 08:00 AM (Olympic Arena)</p>
                </div>
                <span className="font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200 whitespace-nowrap shrink-0">
                  High
                </span>
              </Link>

              <Link to="/notices" className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-xs hover:bg-gray-100 transition-colors block">
                <div>
                  <span className="font-semibold text-gray-800">CBSE Competency Assessment Framework</span>
                  <p className="text-[10px] text-gray-400">Circular #CBSE-2026-89 • Class X & XII</p>
                </div>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap shrink-0">
                  Compliance
                </span>
              </Link>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Next Executive Meeting: <strong>Friday, Aug 28</strong></span>
            <Link to="/notices" className="text-primary-600 font-semibold hover:underline">
              Issue Notice →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
