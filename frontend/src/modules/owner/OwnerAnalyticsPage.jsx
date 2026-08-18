import React, { useState } from 'react';
import ChartCard from '../../components/Dashboard/ChartCard';
import {
  LuChartBar,
  LuTarget,
  LuTrendingUp,
  LuUsers,
  LuCalendar,
  LuCircleCheck,
  LuAward,
  LuGraduationCap,
  LuCircleAlert,
  LuArrowUpRight,
  LuArrowDownRight,
  LuDownload,
  LuFilter,
  LuLayers,
} from 'react-icons/lu';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from 'recharts';

// 1. TARGET VS ACTUAL DATASET
const TARGET_VS_ACTUAL_DATA = [
  { metric: 'Total Student Enrollment', target: 2800, actual: 2847, unit: 'Students', status: 'Exceeded', diff: '+47 (+1.7%)', color: '#10b981' },
  { metric: 'Fee Realization Rate', target: 97.0, actual: 98.2, unit: '%', status: 'Exceeded', diff: '+1.2%', color: '#10b981' },
  { metric: 'CBSE 90%+ Distinctions', target: 50.0, actual: 54.2, unit: '%', status: 'Exceeded', diff: '+4.2%', color: '#10b981' },
  { metric: 'Staff Retention Rate', target: 92.0, actual: 94.0, unit: '%', status: 'Exceeded', diff: '+2.0%', color: '#10b981' },
  { metric: 'New Intake Admissions', target: 520, actual: 550, unit: 'Students', status: 'Exceeded', diff: '+30 (+5.8%)', color: '#10b981' },
  { metric: 'Annual Outflow Budget', target: 18.5, actual: 18.7, unit: '₹ Cr', status: 'On Budget', diff: '+₹0.2 Cr (+1.1%)', color: '#3b82f6' },
  { metric: 'Avg Student Attendance', target: 96.0, actual: 96.2, unit: '%', status: 'Achieved', diff: '+0.2%', color: '#10b981' },
  { metric: 'Campus Solar Energy Share', target: 35.0, actual: 38.4, unit: '%', status: 'Exceeded', diff: '+3.4%', color: '#10b981' },
];

// Target vs Actual Chart Data
const TARGET_VS_ACTUAL_CHART = [
  { area: 'Enrollment (x10)', target: 280, actual: 284.7, achievement: 101.7 },
  { area: 'Fee Realization %', target: 97, actual: 98.2, achievement: 101.2 },
  { area: 'CBSE Distinctions %', target: 50, actual: 54.2, achievement: 108.4 },
  { area: 'Staff Retention %', target: 92, actual: 94.0, achievement: 102.2 },
  { area: 'New Admissions (x10)', target: 52, actual: 55.0, achievement: 105.8 },
  { area: 'Student Attd %', target: 96, actual: 96.2, achievement: 100.2 },
];

// 2. STAFF ATTENDANCE QUARTERLY & YEARLY
const STAFF_ATTENDANCE_QUARTERLY = [
  { quarter: 'Q1 (Apr - Jun 2026)', teaching: 97.8, admin: 98.4, hr: 99.2, transport: 99.0, overall: 98.1, leavesApproved: 18 },
  { quarter: 'Q2 (Jul - Sep 2026)', teaching: 96.5, admin: 97.6, hr: 98.8, transport: 98.5, overall: 97.1, leavesApproved: 24 },
  { quarter: 'Q3 (Oct - Dec 2025)', teaching: 95.8, admin: 96.8, hr: 98.0, transport: 98.0, overall: 96.4, leavesApproved: 32 },
  { quarter: 'Q4 (Jan - Mar 2026)', teaching: 96.2, admin: 97.4, hr: 98.5, transport: 98.2, overall: 96.9, leavesApproved: 28 },
];

const STAFF_ATTENDANCE_YEARLY = [
  { year: '2022', attendanceRate: 94.8, staffCount: 154, leavesTaken: 112 },
  { year: '2023', attendanceRate: 95.6, staffCount: 165, leavesTaken: 108 },
  { year: '2024', attendanceRate: 96.2, staffCount: 174, leavesTaken: 104 },
  { year: '2025', attendanceRate: 96.8, staffCount: 180, leavesTaken: 98 },
  { year: '2026 (YTD)', attendanceRate: 97.2, staffCount: 186, leavesTaken: 82 },
];

// 3. PREDICTED VS ACTUAL PASS & FAIL RATES
const EXAM_PREDICTION_DATA = [
  { grade: 'Class X (Board)', predictedPass: 99.2, actualPass: 100.0, predictedFail: 0.8, actualFail: 0.0, totalCandidates: 248, accuracy: '99.2%' },
  { grade: 'Class XII Science', predictedPass: 98.5, actualPass: 99.4, predictedFail: 1.5, actualFail: 0.6, totalCandidates: 114, accuracy: '99.1%' },
  { grade: 'Class XII Commerce', predictedPass: 97.8, actualPass: 98.8, predictedFail: 2.2, actualFail: 1.2, totalCandidates: 56, accuracy: '98.9%' },
  { grade: 'Class XII Humanities', predictedPass: 98.0, actualPass: 99.0, predictedFail: 2.0, actualFail: 1.0, totalCandidates: 40, accuracy: '99.0%' },
  { grade: 'Class IX (Secondary)', predictedPass: 96.5, actualPass: 97.2, predictedFail: 3.5, actualFail: 2.8, totalCandidates: 236, accuracy: '99.3%' },
  { grade: 'Class XI (Senior Sec)', predictedPass: 95.8, actualPass: 96.8, predictedFail: 4.2, actualFail: 3.2, totalCandidates: 224, accuracy: '99.0%' },
];

const SUBJECT_PASS_PREDICTIONS = [
  { subject: 'Mathematics', predictedPass: 96.5, actualPass: 98.2, predictedFail: 3.5, actualFail: 1.8 },
  { subject: 'Physics', predictedPass: 97.0, actualPass: 98.6, predictedFail: 3.0, actualFail: 1.4 },
  { subject: 'Chemistry', predictedPass: 98.0, actualPass: 99.2, predictedFail: 2.0, actualFail: 0.8 },
  { subject: 'Biology', predictedPass: 99.0, actualPass: 100.0, predictedFail: 1.0, actualFail: 0.0 },
  { subject: 'English Core', predictedPass: 99.5, actualPass: 100.0, predictedFail: 0.5, actualFail: 0.0 },
  { subject: 'Accountancy', predictedPass: 96.0, actualPass: 97.8, predictedFail: 4.0, actualFail: 2.2 },
  { subject: 'Computer Sci / AI', predictedPass: 99.2, actualPass: 100.0, predictedFail: 0.8, actualFail: 0.0 },
];

// 4. ADMISSIONS PER YEAR & GROWTH RATIO
const ADMISSIONS_GROWTH_DATA = [
  { year: '2021', admissions: 380, totalStrength: 2100, growthCount: '+30', growthRatio: 8.6, prePrimary: 90, primary: 120, middle: 80, secondary: 90 },
  { year: '2022', admissions: 410, totalStrength: 2320, growthCount: '+30', growthRatio: 7.9, prePrimary: 95, primary: 130, middle: 85, secondary: 100 },
  { year: '2023', admissions: 440, totalStrength: 2500, growthCount: '+30', growthRatio: 7.3, prePrimary: 100, primary: 140, middle: 90, secondary: 110 },
  { year: '2024', admissions: 470, totalStrength: 2680, growthCount: '+30', growthRatio: 6.8, prePrimary: 105, primary: 150, middle: 95, secondary: 120 },
  { year: '2025', admissions: 505, totalStrength: 2750, growthCount: '+35', growthRatio: 7.4, prePrimary: 110, primary: 165, middle: 100, secondary: 130 },
  { year: '2026', admissions: 550, totalStrength: 2847, growthCount: '+45', growthRatio: 8.9, prePrimary: 120, primary: 180, middle: 110, secondary: 140 },
];

export default function OwnerAnalyticsPage() {
  const [activeTab, setActiveTab] = useState('targets');

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Clean Standard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <LuChartBar className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">School Performance & Strategic Analytics</h1>
            <p className="text-xs text-gray-400">Target vs actual benchmarks, staff muster trends, pass/fail prediction model, and annual intake growth</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <LuAward className="w-4 h-4 text-emerald-600" /> 104.2% Composite Target Index
          </span>
        </div>
      </div>

      {/* Top 4 Primary Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Target vs Actual</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">104.2%</p>
          <p className="text-xs text-gray-500 mt-0.5">8 of 8 Key KPIs Exceeded</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider">Staff Attendance (YTD)</span>
          <p className="text-2xl font-bold text-primary-600 mt-1">97.2%</p>
          <p className="text-xs text-gray-500 mt-0.5">Q1 (98.1%) • Q2 (97.1%)</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">CBSE Board Pass Rate</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">99.8%</p>
          <p className="text-xs text-emerald-700 font-medium mt-0.5">Pred: 98.8% • Actual: 99.8%</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Admissions Growth</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">+8.9% YoY</p>
          <p className="text-xs text-gray-500 mt-0.5">550 Intakes in 2026</p>
        </div>
      </div>

      {/* Analytics Section Navigation Tabs */}
      <div className="flex bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('targets')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'targets'
              ? 'bg-primary-50 text-primary-700 border border-primary-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <LuTarget className="w-4 h-4" /> Targets Wanted vs Actuals
        </button>

        <button
          onClick={() => setActiveTab('staff-attd')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'staff-attd'
              ? 'bg-primary-50 text-primary-700 border border-primary-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <LuUsers className="w-4 h-4" /> Staff Attendance (Quarterly & Yearly)
        </button>

        <button
          onClick={() => setActiveTab('pass-fail')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'pass-fail'
              ? 'bg-primary-50 text-primary-700 border border-primary-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <LuGraduationCap className="w-4 h-4" /> Pass/Fail (Predicted vs Actual)
        </button>

        <button
          onClick={() => setActiveTab('admissions-growth')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'admissions-growth'
              ? 'bg-primary-50 text-primary-700 border border-primary-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <LuTrendingUp className="w-4 h-4" /> Admissions & Growth Ratio
        </button>
      </div>

      {/* TAB 1: TARGET WANTED VS ACTUAL ACHIEVED */}
      {activeTab === 'targets' && (
        <div className="space-y-6 animate-fade-in">
          {/* Target vs Actual Chart & Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <ChartCard
                title="Institutional Target vs Actual Achievement Index"
                subtitle="Planned institutional benchmark goals vs actual numbers realized (Session 2026-27)"
              >
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={TARGET_VS_ACTUAL_CHART}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="area" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      formatter={(val, name) => [val, name === 'actual' ? 'Actual Achieved' : 'Planned Target']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="target" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Planned Target" />
                    <Bar dataKey="actual" fill="#2563eb" radius={[4, 4, 0, 0]} name="Actual Achieved" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Target Highlights Box */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <LuCircleCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">Target Achievement Summary</h3>
                    <p className="text-[11px] text-gray-400">Institutional performance vs plan</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Target Enrollment Goal:</span>
                    <strong className="text-emerald-700">2,847 / 2,800 (+47)</strong>
                  </div>

                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Target Fee Realization:</span>
                    <strong className="text-emerald-700">98.2% / 97.0% (+1.2%)</strong>
                  </div>

                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Target 90%+ Distinctions:</span>
                    <strong className="text-emerald-700">54.2% / 50.0% (+4.2%)</strong>
                  </div>

                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Target New Admissions:</span>
                    <strong className="text-emerald-700">550 / 520 (+30)</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-gray-100 text-[11px] text-gray-500">
                <span>Composite Goal Completion: <strong className="text-emerald-700 font-bold">104.2% Realized</strong></span>
              </div>
            </div>
          </div>

          {/* Detailed Target vs Actual Ledger Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Target vs Actual Performance Ledger</h3>
                <p className="text-xs text-gray-400">Institutional scorecard across academic, financial, operational, and green goals</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Session 2026-27
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 font-semibold">Institutional Metric</th>
                    <th className="py-3 px-4 font-semibold text-center">Planned Target</th>
                    <th className="py-3 px-4 font-semibold text-center">Actual Achieved</th>
                    <th className="py-3 px-4 font-semibold text-center">Variance / Difference</th>
                    <th className="py-3 px-4 font-semibold text-center">Achievement %</th>
                    <th className="py-3 px-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {TARGET_VS_ACTUAL_DATA.map((item) => {
                    const pct = Math.round((item.actual / item.target) * 100);
                    return (
                      <tr key={item.metric} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-gray-900">{item.metric}</td>
                        <td className="py-3.5 px-4 text-center font-mono text-gray-600">
                          {item.target} {item.unit}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-gray-900 font-mono">
                          {item.actual} {item.unit}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {item.diff}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-primary-700">{pct}%</td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STAFF ATTENDANCE QUARTERLY & YEARLY */}
      {activeTab === 'staff-attd' && (
        <div className="space-y-6 animate-fade-in">
          {/* Charts: Quarterly vs 5-Year Multi-Year Staff Attendance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartCard
              title="Staff Attendance by Quarter (2025 - 2026)"
              subtitle="Quarterly muster roll attendance across Teaching, Administration, and Transport wings"
            >
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={STAFF_ATTENDANCE_QUARTERLY}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="quarter" stroke="#94a3b8" fontSize={11} />
                  <YAxis domain={[90, 100]} stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="teaching" fill="#2563eb" radius={[4, 4, 0, 0]} name="Teaching Staff %" />
                  <Bar dataKey="admin" fill="#10b981" radius={[4, 4, 0, 0]} name="Administration %" />
                  <Bar dataKey="transport" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Transport & Fleet %" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="5-Year Annual Staff Attendance Trend (2022 - 2026)"
              subtitle="Yearly overall staff attendance percentage and faculty growth"
            >
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={STAFF_ATTENDANCE_YEARLY}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
                  <YAxis domain={[90, 100]} stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line
                    type="monotone"
                    dataKey="attendanceRate"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    name="Annual Staff Attendance %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Quarterly Muster Ledger Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Quarterly Staff Attendance & Leave Ledger</h3>
                <p className="text-xs text-gray-400">Departmental breakdown of staff muster rates per financial quarter</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-primary-50 text-primary-700 border border-primary-200">
                186 Staff Strength
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 font-semibold">Quarter Period</th>
                    <th className="py-3 px-4 font-semibold text-center">Teaching Faculty %</th>
                    <th className="py-3 px-4 font-semibold text-center">Administration %</th>
                    <th className="py-3 px-4 font-semibold text-center">HR & Operations %</th>
                    <th className="py-3 px-4 font-semibold text-center">Transport Fleet %</th>
                    <th className="py-3 px-4 font-semibold text-center">Overall Presence %</th>
                    <th className="py-3 px-4 font-semibold text-right">Leaves Approved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {STAFF_ATTENDANCE_QUARTERLY.map((q) => (
                    <tr key={q.quarter} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-gray-900">{q.quarter}</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-primary-700">{q.teaching}%</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-emerald-700">{q.admin}%</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-indigo-700">{q.hr}%</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-amber-700">{q.transport}%</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {q.overall}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-600">{q.leavesApproved} Leaves</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PASS/FAIL (PREDICTED VS ACTUAL) */}
      {activeTab === 'pass-fail' && (
        <div className="space-y-6 animate-fade-in">
          {/* Charts: Subject-wise Pass Prediction vs Actual */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartCard
              title="Subject-wise Pass Rate: Predicted vs Actual Results"
              subtitle="Pre-Board ML performance forecast model vs actual CBSE final results"
            >
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={SUBJECT_PASS_PREDICTIONS}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                  <YAxis domain={[90, 100]} stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="predictedPass" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Predicted Pass %" />
                  <Bar dataKey="actualPass" fill="#10b981" radius={[4, 4, 0, 0]} name="Actual Pass %" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Failure / Remedial Rate: Predicted vs Actual"
              subtitle="Predicted at-risk students who were remediated and passed"
            >
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={SUBJECT_PASS_PREDICTIONS}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                  <YAxis domain={[0, 5]} stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="predictedFail" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Predicted Risk Fail %" />
                  <Bar dataKey="actualFail" fill="#64748b" radius={[4, 4, 0, 0]} name="Actual Final Fail %" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Grade-wise Pass / Fail Prediction Model Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Class & Stream Pass/Fail Prediction Breakdown</h3>
                <p className="text-xs text-gray-400">Comparison of pre-assessment forecast models vs board examination realization</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                99.1% Model Accuracy
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 font-semibold">Grade & Stream</th>
                    <th className="py-3 px-4 font-semibold text-center">Candidates</th>
                    <th className="py-3 px-4 font-semibold text-center">Predicted Pass %</th>
                    <th className="py-3 px-4 font-semibold text-center">Actual Pass %</th>
                    <th className="py-3 px-4 font-semibold text-center">Predicted Fail %</th>
                    <th className="py-3 px-4 font-semibold text-center">Actual Fail %</th>
                    <th className="py-3 px-4 font-semibold text-right">Model Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {EXAM_PREDICTION_DATA.map((row) => (
                    <tr key={row.grade} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-gray-900">{row.grade}</td>
                      <td className="py-3.5 px-4 text-center font-mono text-gray-600">{row.totalCandidates}</td>
                      <td className="py-3.5 px-4 text-center font-mono text-gray-700">{row.predictedPass}%</td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-700">{row.actualPass}%</td>
                      <td className="py-3.5 px-4 text-center font-mono text-rose-600">{row.predictedFail}%</td>
                      <td className="py-3.5 px-4 text-center font-bold text-gray-800">
                        {row.actualFail === 0 ? (
                          <span className="text-emerald-700 font-bold">0.0% (Zero Fail)</span>
                        ) : (
                          `${row.actualFail}%`
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-200">
                          {row.accuracy}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ADMISSIONS PER YEAR & GROWTH RATIO */}
      {activeTab === 'admissions-growth' && (
        <div className="space-y-6 animate-fade-in">
          {/* Charts: Admissions per year & Growth % */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartCard
              title="New Student Admissions Per Year (2021 - 2026)"
              subtitle="Annual new intake student count and cumulative campus strength"
            >
              <ResponsiveContainer width="100%" height={240}>
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

            <ChartCard
              title="Year-on-Year Admissions Growth Ratio (%)"
              subtitle="Percentage growth in student intake year over year"
            >
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={ADMISSIONS_GROWTH_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
                  <YAxis domain={[5, 12]} stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line
                    type="monotone"
                    dataKey="growthRatio"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    name="Growth Ratio % YoY"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Annual Admissions & Growth Breakdown Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Historical Admissions & Growth Ratio Ledger</h3>
                <p className="text-xs text-gray-400">Annual intake distribution across Pre-Primary, Primary, Middle, and Secondary Wings</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                +8.9% Growth in 2026
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[780px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 font-semibold">Academic Year</th>
                    <th className="py-3 px-4 font-semibold text-center">New Admissions</th>
                    <th className="py-3 px-4 font-semibold text-center">Cumulative Strength</th>
                    <th className="py-3 px-4 font-semibold text-center">Annual Growth</th>
                    <th className="py-3 px-4 font-semibold text-center">Growth Ratio (%)</th>
                    <th className="py-3 px-4 font-semibold text-center">Pre-Primary</th>
                    <th className="py-3 px-4 font-semibold text-center">Primary (I-V)</th>
                    <th className="py-3 px-4 font-semibold text-right">Secondary & Sr Sec</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ADMISSIONS_GROWTH_DATA.map((item) => (
                    <tr key={item.year} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-gray-900 text-sm">{item.year}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-primary-700 font-mono text-sm">
                        {item.admissions}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-gray-800 font-semibold">
                        {item.totalStrength}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-emerald-700 font-semibold">
                        {item.growthCount} St.
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          +{item.growthRatio}% YoY
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-gray-600">{item.prePrimary}</td>
                      <td className="py-3.5 px-4 text-center text-gray-600">{item.primary}</td>
                      <td className="py-3.5 px-4 text-right font-medium text-gray-800">
                        {item.middle + item.secondary} St.
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
