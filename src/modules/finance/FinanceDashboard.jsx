import WelcomeCard from '../../components/Dashboard/WelcomeCard';
import StatCard from '../../components/Dashboard/StatCard';
import ChartCard from '../../components/Dashboard/ChartCard';
import {
  financeStats,
  financePatternData,
  financeIncomeSources,
  financeRatioAnalysisList,
  financeBudgetAllocations,
  financeForecastData,
  hrSalaryBreakdown,
} from '../../data/mockData';
import {
  LuBanknote,
  LuReceipt,
  LuScale,
  LuFileSpreadsheet,
  LuTrendingUp,
  LuCircleCheck,
  LuArrowUpRight,
  LuDownload,
  LuCalculator,
  LuShieldAlert,
} from 'react-icons/lu';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const statIcons = [LuBanknote, LuReceipt, LuTrendingUp, LuScale];
const statColors = ['blue', 'rose', 'green', 'amber'];

const ratioStatusStyles = {
  Optimal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Healthy: 'bg-blue-50 text-blue-700 border-blue-200',
  Strong: 'bg-purple-50 text-purple-700 border-purple-200',
  Excellent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Very Safe': 'bg-teal-50 text-teal-700 border-teal-200',
};

export default function FinanceDashboard() {
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Welcome Banner */}
      <WelcomeCard />

      {/* Main KPI Row: Salaries, Expenses, Income Patterns, Ratio Analysis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {financeStats.map((stat, i) => (
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

      {/* Section 1: Dashboard of Expense Patterns & Income Pattern */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Income vs Expense Pattern 6-Month Chart */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Dashboard of Expense Patterns & Income Pattern"
            subtitle="6-Month Historical Cashflow Analysis (Mar 2026 – Aug 2026 in Lakhs ₹)"
          >
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={financePatternData}>
                <defs>
                  <linearGradient id="gFinIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gFinExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={12} unit="L" />
                <Tooltip
                  formatter={(val) => [`₹${val} Lakhs`]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#gFinIncome)" strokeWidth={2.5} name="Total Income / Fee Collections" />
                <Area type="monotone" dataKey="expenses" stroke="#f43f5e" fill="url(#gFinExpense)" strokeWidth={2} name="Total Operating Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Income Sources Breakdown */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-800">Income Inflow Sources</h3>
              <span className="text-xs font-semibold text-emerald-600">₹48.5L Total</span>
            </div>

            <div className="h-36 mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={financeIncomeSources}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={32}
                    outerRadius={58}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {financeIncomeSources.map((entry, index) => (
                      <Cell key={`income-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`₹${val} Lakhs`]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5">
              {financeIncomeSources.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600 truncate">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-800 shrink-0">₹{item.amount}L ({item.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>Fee Realization Rate</span>
            <span className="font-bold text-emerald-600">93.3% Collected</span>
          </div>
        </div>
      </div>

      {/* Section 2: Salaries & Expenses Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Salaries Summary */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <LuBanknote className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Salaries & Staff Payroll</h3>
                <p className="text-xs text-gray-400">Monthly Compensation: ₹15.2L across 280 Employees</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
              100% Disbursed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400">
                  <th className="pb-2 font-medium">Department</th>
                  <th className="pb-2 font-medium text-center">Staff</th>
                  <th className="pb-2 font-medium text-right">Net Payroll</th>
                  <th className="pb-2 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {hrSalaryBreakdown.map((row) => (
                  <tr key={row.dept} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 pr-2">
                      <p className="font-semibold text-gray-800">{row.dept}</p>
                    </td>
                    <td className="py-2.5 px-2 text-center text-gray-600">{row.staffCount}</td>
                    <td className="py-2.5 px-2 text-right font-bold text-gray-800">{row.netPay}</td>
                    <td className="py-2.5 text-right">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses Summary */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <LuReceipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Operating Expenses Breakdown</h3>
                  <p className="text-xs text-gray-400">Actual: ₹22.1L • Approved Budget: ₹25.0L</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                Savings: ₹2.9L (11.6%)
              </span>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Staff Salaries & Teaching Compensation', amount: '₹15.2L', pct: 68.7, color: 'bg-blue-500' },
                { name: 'Campus Utilities, Electricity & Generator Fuel', amount: '₹3.1L', pct: 14.0, color: 'bg-amber-500' },
                { name: 'School Bus Transit Fuel & Fleet Repairs', amount: '₹2.2L', pct: 10.0, color: 'bg-emerald-500' },
                { name: 'Laboratory Consumables & IT Software Subscriptions', amount: '₹1.6L', pct: 7.3, color: 'bg-purple-500' },
              ].map((exp) => (
                <div key={exp.name} className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-700 truncate pr-2">{exp.name}</span>
                    <span className="font-bold text-gray-800 shrink-0">{exp.amount} ({exp.pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${exp.color}`} style={{ width: `${exp.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 mt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Vendor Invoices Cleared this Month</span>
            <span className="font-semibold text-emerald-600">38 / 38 Paid (Zero Overdue)</span>
          </div>
        </div>
      </div>

      {/* Section 3: Ratio Analysis */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <LuScale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">Financial Ratio Analysis</h3>
              <p className="text-xs text-gray-400">Audited institutional solvency, liquidity, salary ratios, and operational efficiency</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-1">
            <LuCircleCheck className="w-3.5 h-3.5" /> All Ratios in Safe Zone
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {financeRatioAnalysisList.map((item) => (
            <div key={item.ratio} className="p-3.5 rounded-lg border border-gray-100 bg-gray-50 flex flex-col justify-between">
              <div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border inline-block mb-1.5 ${ratioStatusStyles[item.status]}`}>
                  {item.status}
                </span>
                <p className="text-xs font-bold text-gray-800 leading-snug mb-1">{item.ratio}</p>
                <p className="text-xl font-extrabold text-primary-600 my-1">{item.value}</p>
                <p className="text-[11px] text-gray-500">Target: <strong className="text-gray-700">{item.benchmark}</strong></p>
              </div>
              <p className="text-[10px] text-gray-400 mt-2.5 pt-2 border-t border-gray-200/60 leading-tight">
                {item.note}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Budgeting & Forecasting Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Budgeting Allocation */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <LuFileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Budgeting (FY 2026-27)</h3>
                <p className="text-xs text-gray-400">Annual Department CapEx & Operational Allocations</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-purple-600">65.2% Expended</span>
          </div>

          <div className="space-y-3">
            {financeBudgetAllocations.map((item) => (
              <div key={item.head} className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-gray-800">{item.head}</span>
                  <span className="font-bold text-primary-700">{item.spent} / {item.allocated}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                  <div
                    className={`h-1.5 rounded-full ${
                      item.percentage > 75 ? 'bg-amber-500' : 'bg-primary-600'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Utilization: {item.percentage}%</span>
                  <span className="text-emerald-600 font-medium">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Forecasting */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <LuTrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Financial Forecasting (Next 6 Months)</h3>
                <p className="text-xs text-gray-400">Projected Revenue vs. Expenses with Admission Inflows</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-600">+11.8% Projected Growth</span>
          </div>

          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={financeForecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="period" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={11} unit="L" />
              <Tooltip
                formatter={(val) => [`₹${val} Lakhs`]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="projectedIncome" fill="#10b981" radius={[4, 4, 0, 0]} name="Projected Income" />
              <Bar dataKey="projectedExpense" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Projected Expenses" />
            </BarChart>
          </ResponsiveContainer>

          <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
            <span>Projected Annual Net Reserves</span>
            <span className="font-bold text-emerald-600">₹1.74 Cr Reserve Fund</span>
          </div>
        </div>
      </div>
    </div>
  );
}
