import { useState } from 'react';
import WelcomeCard from '../../components/Dashboard/WelcomeCard';
import StatCard from '../../components/Dashboard/StatCard';
import ChartCard from '../../components/Dashboard/ChartCard';
import {
  ownerStats,
  ownerExpenseCategories,
  ownerStudentWingBreakdown,
  ownerRecentEnquiries,
  ownerExternalAffairsList,
  ownerVaultDocuments,
  ownerNotices,
} from '../../data/mockData';
import {
  LuUsers,
  LuReceipt,
  LuGraduationCap,
  LuPhoneCall,
  LuFolderLock,
  LuGlobe,
  LuBell,
  LuFileText,
  LuShieldCheck,
  LuCircleCheck,
  LuTriangleAlert,
  LuArrowUpRight,
  LuDownload,
  LuClock,
} from 'react-icons/lu';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const statIcons = [LuUsers, LuReceipt, LuGraduationCap, LuPhoneCall];
const statColors = ['amber', 'rose', 'green', 'blue'];

const enquiryStatusStyles = {
  'Interview Scheduled': 'bg-blue-50 text-blue-700 border-blue-200',
  'Documents Verified': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Follow-up Required': 'bg-amber-50 text-amber-700 border-amber-200',
  'Fee Paid / Enrolled': 'bg-purple-50 text-purple-700 border-purple-200',
};

const noticePriorityStyles = {
  Urgent: 'bg-rose-50 text-rose-700 border-rose-200',
  High: 'bg-amber-50 text-amber-700 border-amber-200',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200',
};

export default function OwnerDashboard() {
  const [selectedTab, setSelectedTab] = useState('all');

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Welcome Banner */}
      <WelcomeCard />

      {/* Main KPI Row for Owner: Staff, Expenses, Student Count, Enquiries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ownerStats.map((stat, i) => (
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

      {/* Section 1: Staff & Expenses Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Staff Details */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <LuUsers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Staff Overview</h3>
                  <p className="text-xs text-gray-400">Teaching & Support personnel metrics</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                96.4% Present
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Teaching Staff</p>
                <p className="text-xl font-bold text-gray-800">186</p>
                <p className="text-[11px] text-emerald-600 font-medium mt-0.5">180 Present</p>
              </div>
              <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Support & Admin</p>
                <p className="text-xl font-bold text-gray-800">94</p>
                <p className="text-[11px] text-emerald-600 font-medium mt-0.5">90 Present</p>
              </div>
              <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Teacher-Student</p>
                <p className="text-xl font-bold text-primary-600">1:15</p>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">Ideal Ratio</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Monthly Payroll Commitment</span>
                <span className="font-semibold text-gray-800">₹15.2 Lakhs / month</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Active Leave Requests Today</span>
                <span className="font-semibold text-amber-600">10 on Leave (6 planned, 4 medical)</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-500">Open Vacancies for Next Term</span>
                <span className="font-semibold text-primary-600">3 Positions (Sr. Physics, TGT French, Lab Tech)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Expenses Details */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <LuReceipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Monthly Expenses</h3>
                  <p className="text-xs text-gray-400">Total: ₹22.1L (Budget: ₹25.0L)</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                Within Budget (-11.6%)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-3">
              <div className="w-40 h-40 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ownerExpenseCategories}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={65}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {ownerExpenseCategories.map((entry, index) => (
                        <Cell key={`expense-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [`₹${val} Lakhs`, 'Amount']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 w-full space-y-2">
                {ownerExpenseCategories.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-800">₹{item.amount}L</span>
                      <span className="text-gray-400 ml-1.5">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Next Major CapEx: Smart Lab Upgrade</span>
              <span className="font-semibold text-gray-700">Allocated ₹4.5L (Oct 2026)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Student Count & Enquiries Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 3. Student Count Wing Breakdown */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <LuGraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Student Count & Capacity</h3>
                <p className="text-xs text-gray-400">Total: 2,847 / 3,200 Capacity (89% Full)</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-600">+12.4% YoY</span>
          </div>

          <div className="space-y-3.5">
            {ownerStudentWingBreakdown.map((wing) => (
              <div key={wing.wing} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <span className="font-semibold text-gray-700">{wing.wing}</span>
                  <span className="text-gray-500">
                    <strong className="text-gray-800">{wing.count}</strong> / {wing.capacity} students ({wing.sections} sections)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      wing.fill > 90 ? 'bg-emerald-500' : wing.fill > 85 ? 'bg-primary-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${wing.fill}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                  <span>Capacity Utilization: {wing.fill}%</span>
                  <span>{wing.capacity - wing.count} seats remaining</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Enquiries & Admissions Pipeline */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <LuPhoneCall className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Recent Enquiries & Admissions</h3>
                <p className="text-xs text-gray-400">642 Enquiries this session • 68% Conversion</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-primary-600">34 Active</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400">
                  <th className="pb-2 font-medium">Applicant</th>
                  <th className="pb-2 font-medium">Grade</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ownerRecentEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 pr-2">
                      <p className="font-semibold text-gray-800">{enq.student}</p>
                      <p className="text-[10px] text-gray-400">{enq.parent}</p>
                    </td>
                    <td className="py-2.5 pr-2 text-gray-600">{enq.grade}</td>
                    <td className="py-2.5 pr-2">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium border ${enquiryStatusStyles[enq.status] || 'bg-gray-50 text-gray-600'}`}>
                        {enq.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-gray-400 text-[11px]">{enq.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section 3: Vault (Permission Documents) - Key Compliance Section */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <LuFolderLock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">Vault & Permission Documents</h3>
              <p className="text-xs text-gray-400">Official government affiliations, safety NOCs, land registry, and statutory permits</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-1">
              <LuShieldCheck className="w-3.5 h-3.5" /> 6 Documents Verified
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {ownerVaultDocuments.map((doc) => (
            <div
              key={doc.docNo}
              className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/70 hover:bg-gray-50 hover:border-gray-200 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <LuFileText className="w-4 h-4 text-primary-600 shrink-0" />
                    <span className="text-xs font-bold text-gray-800 leading-snug">{doc.title}</span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0 ${
                      doc.status === 'Valid' || doc.status === 'Verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 font-mono">{doc.docNo}</p>
                <div className="mt-2 text-[11px] text-gray-500 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <span className="text-gray-700 font-medium">{doc.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valid Expiry:</span>
                    <span className="text-gray-700 font-medium">{doc.expiry}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-gray-200 flex items-center justify-between text-xs">
                <span className="text-[11px] text-gray-400">Issued: {doc.issueDate}</span>
                <button className="text-primary-600 hover:text-primary-800 font-medium text-[11px] flex items-center gap-1">
                  <LuDownload className="w-3 h-3" /> Download Copy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: External Affairs & Notices Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 6. External Affairs */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                <LuGlobe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">External Affairs & Board Relations</h3>
                <p className="text-xs text-gray-400">Regulatory bodies, DEO, and institutional affiliations</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-primary-600 flex items-center gap-1">
              <LuCircleCheck className="w-3.5 h-3.5 text-emerald-500" /> All Active
            </span>
          </div>

          <div className="space-y-3">
            {ownerExternalAffairsList.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-gray-50 border border-gray-100 flex items-start gap-3">
                <div className="w-7 h-7 rounded-md bg-white border border-gray-200 text-primary-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-gray-800">{item.organization}</p>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-600">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{item.subject}</p>
                  <p className="text-[11px] text-emerald-600 font-medium mt-1">Status: {item.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Management Notices */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <LuBell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Management Notices & Directives</h3>
                <p className="text-xs text-gray-400">Board circulars, trustee meetings, and statutory orders</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-rose-600">3 Priority</span>
          </div>

          <div className="space-y-3">
            {ownerNotices.map((n) => (
              <div key={n.id} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-bold text-gray-800 leading-snug">{n.title}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${noticePriorityStyles[n.priority]}`}>
                    {n.priority}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{n.desc}</p>
                <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2 pt-1.5 border-t border-gray-200/60">
                  <span>Source: {n.source}</span>
                  <span className="flex items-center gap-1">
                    <LuClock className="w-3 h-3" /> {n.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
