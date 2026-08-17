import React, { useState } from 'react';
import {
  LuBanknote,
  LuSearch,
  LuFilter,
  LuDownload,
  LuFileText,
  LuPrinter,
  LuCheck,
  LuX,
  LuCalculator,
  LuUsers,
  LuBuilding2,
  LuCheckCheck,
  LuEye,
  LuCalendar,
  LuChevronDown,
  LuArrowRight,
  LuSparkles,
} from 'react-icons/lu';

const INITIAL_SALARY_RECORDS = [
  {
    id: 'EMP-101',
    name: 'Dr. Ananya Sen',
    role: 'PGT Mathematics',
    dept: 'Teaching',
    baseSalary: 65000,
    workingDays: 26,
    daysPresent: 25,
    paidLeaves: 1,
    unpaidLeaves: 0,
    hra: 12000,
    da: 8000,
    specialAllowance: 5000,
    pfDeduction: 4500,
    tdsDeduction: 3500,
    status: 'Disbursed',
    accountNo: '•••• •••• 4589',
    bankName: 'HDFC Bank',
  },
  {
    id: 'EMP-102',
    name: 'Mr. Vikram Rathore',
    role: 'PGT Physics & Science',
    dept: 'Teaching',
    baseSalary: 62000,
    workingDays: 26,
    daysPresent: 24,
    paidLeaves: 2,
    unpaidLeaves: 0,
    hra: 11000,
    da: 7500,
    specialAllowance: 4500,
    pfDeduction: 4200,
    tdsDeduction: 3000,
    status: 'Disbursed',
    accountNo: '•••• •••• 8821',
    bankName: 'State Bank of India',
  },
  {
    id: 'EMP-103',
    name: 'Ms. Sunita Rao',
    role: 'TGT English Language',
    dept: 'Teaching',
    baseSalary: 52000,
    workingDays: 26,
    daysPresent: 26,
    paidLeaves: 0,
    unpaidLeaves: 0,
    hra: 9500,
    da: 6000,
    specialAllowance: 3500,
    pfDeduction: 3800,
    tdsDeduction: 2200,
    status: 'Disbursed',
    accountNo: '•••• •••• 9912',
    bankName: 'ICICI Bank',
  },
  {
    id: 'EMP-104',
    name: 'Mr. Manoj Joshi',
    role: 'TGT Social Science',
    dept: 'Teaching',
    baseSalary: 50000,
    workingDays: 26,
    daysPresent: 22,
    paidLeaves: 1,
    unpaidLeaves: 3, // 3 days unpaid absence
    hra: 9000,
    da: 5500,
    specialAllowance: 3000,
    pfDeduction: 3600,
    tdsDeduction: 1800,
    status: 'Processed',
    accountNo: '•••• •••• 3411',
    bankName: 'Axis Bank',
  },
  {
    id: 'EMP-105',
    name: 'Mrs. Deepa Krishnan',
    role: 'Head of Computer Science & AI',
    dept: 'Teaching',
    baseSalary: 70000,
    workingDays: 26,
    daysPresent: 26,
    paidLeaves: 0,
    unpaidLeaves: 0,
    hra: 14000,
    da: 9000,
    specialAllowance: 6000,
    pfDeduction: 5000,
    tdsDeduction: 4500,
    status: 'Disbursed',
    accountNo: '•••• •••• 1204',
    bankName: 'HDFC Bank',
  },
  {
    id: 'EMP-106',
    name: 'Mr. Rajesh Sharma',
    role: 'Chief Administrative Officer',
    dept: 'Administration',
    baseSalary: 58000,
    workingDays: 26,
    daysPresent: 25,
    paidLeaves: 1,
    unpaidLeaves: 0,
    hra: 10500,
    da: 7000,
    specialAllowance: 4000,
    pfDeduction: 4000,
    tdsDeduction: 2800,
    status: 'Disbursed',
    accountNo: '•••• •••• 6702',
    bankName: 'Kotak Bank',
  },
  {
    id: 'EMP-107',
    name: 'Mr. Suresh Kumar',
    role: 'TGT Hindi Literature',
    dept: 'Teaching',
    baseSalary: 48000,
    workingDays: 26,
    daysPresent: 21,
    paidLeaves: 2,
    unpaidLeaves: 3, // 3 days unpaid absence
    hra: 8500,
    da: 5000,
    specialAllowance: 2500,
    pfDeduction: 3400,
    tdsDeduction: 1500,
    status: 'Processed',
    accountNo: '•••• •••• 5590',
    bankName: 'Punjab National Bank',
  },
  {
    id: 'EMP-108',
    name: 'Mr. Amit Patel',
    role: 'Senior IT & Labs Specialist',
    dept: 'IT & Labs',
    baseSalary: 45000,
    workingDays: 26,
    daysPresent: 26,
    paidLeaves: 0,
    unpaidLeaves: 0,
    hra: 8000,
    da: 4500,
    specialAllowance: 2000,
    pfDeduction: 3200,
    tdsDeduction: 1200,
    status: 'Disbursed',
    accountNo: '•••• •••• 7731',
    bankName: 'State Bank of India',
  },
];

export default function StaffSalaryPage() {
  const [selectedMonth, setSelectedMonth] = useState('August 2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [disburseSuccess, setDisburseSuccess] = useState(false);

  // Helper calculations for an employee
  const calculateSalary = (staff) => {
    const dailyRate = Math.round(staff.baseSalary / staff.workingDays);
    const payableDays = staff.daysPresent + staff.paidLeaves;
    
    // Pro-rated basic pay based on days worked
    const earnedBasic = Math.round(dailyRate * payableDays);
    const grossEarnings = earnedBasic + staff.hra + staff.da + staff.specialAllowance;
    
    // Unpaid leave deduction (Loss of Pay)
    const lopDeduction = Math.round(dailyRate * staff.unpaidLeaves);
    const totalDeductions = staff.pfDeduction + staff.tdsDeduction + lopDeduction;
    
    const netSalary = grossEarnings - (staff.pfDeduction + staff.tdsDeduction);

    return {
      dailyRate,
      payableDays,
      earnedBasic,
      grossEarnings,
      lopDeduction,
      totalDeductions,
      netSalary,
    };
  };

  const filteredRecords = INITIAL_SALARY_RECORDS.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = deptFilter === 'ALL' || s.dept === deptFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Overall totals calculation
  let totalDisbursedAmount = 0;
  INITIAL_SALARY_RECORDS.forEach((s) => {
    totalDisbursedAmount += calculateSalary(s).netSalary;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Toast Notification */}
      {disburseSuccess && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 flex items-center gap-3 px-5 py-3.5 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-600/20 animate-fade-in-up">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <LuCheckCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold">Payroll Batch Processed</p>
            <p className="text-xs text-emerald-100">Direct salary transfers initiated for {selectedMonth}</p>
          </div>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
              <LuBanknote className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">Staff Salary & Payroll Calculation</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Attendance-Based Payroll
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Calculates teacher compensation based on actual days worked, allowances, and statutory deductions
              </p>
            </div>
          </div>

          {/* Month Selector & Batch Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="h-10 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all cursor-pointer"
              >
                <option value="August 2026">Cycle: August 2026</option>
                <option value="July 2026">Cycle: July 2026</option>
                <option value="June 2026">Cycle: June 2026</option>
              </select>
            </div>

            <button
              onClick={() => {
                setDisburseSuccess(true);
                setTimeout(() => setDisburseSuccess(false), 3500);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <LuCalculator className="w-4 h-4" /> Disburse Batch
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <LuBanknote className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500">Total Net Payroll</p>
            <p className="text-xl font-bold text-gray-900 leading-tight">₹{totalDisbursedAmount.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <LuUsers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500">Staff Count</p>
            <p className="text-xl font-bold text-gray-900 leading-tight">{INITIAL_SALARY_RECORDS.length} Active</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <LuCalendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500">Working Days in Cycle</p>
            <p className="text-xl font-bold text-purple-700 leading-tight">26 Days (5 Offs)</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <LuSparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500">Salary Status</p>
            <p className="text-xl font-bold text-emerald-600 leading-tight">100% Processed</p>
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Department & Status Filters */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search teacher, staff or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 shrink-0">Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              <option value="Teaching">Teaching Faculty</option>
              <option value="Administration">Administration</option>
              <option value="IT & Labs">IT & Labs</option>
            </select>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
          <span className="text-xs font-semibold text-gray-400 mr-1 hidden sm:inline">Status:</span>
          {['ALL', 'Disbursed', 'Processed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab
                  ? 'bg-gray-900 text-white shadow-2xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Salary Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Employee / Faculty</th>
                <th className="py-3.5 px-5">Base Monthly</th>
                <th className="py-3.5 px-5 text-center">Days Worked</th>
                <th className="py-3.5 px-5">Allowances</th>
                <th className="py-3.5 px-5">Deductions</th>
                <th className="py-3.5 px-5">Net Payable</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((staff) => {
                  const calc = calculateSalary(staff);
                  const totalAllowances = staff.hra + staff.da + staff.specialAllowance;
                  const totalDeducts = staff.pfDeduction + staff.tdsDeduction;

                  return (
                    <tr key={staff.id} className="hover:bg-gray-50/60 transition-colors group">
                      {/* Name & Role */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">
                            {staff.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                              {staff.name}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono">
                              {staff.id} • {staff.role}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Base Salary */}
                      <td className="py-3.5 px-5">
                        <p className="text-xs font-bold text-gray-900">₹{staff.baseSalary.toLocaleString('en-IN')}</p>
                        <p className="text-[10px] text-gray-400">₹{calc.dailyRate}/day</p>
                      </td>

                      {/* Days Worked (Attendance Breakdown) */}
                      <td className="py-3.5 px-5 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-xs font-bold text-gray-800">
                            {calc.payableDays} / {staff.workingDays} Days
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {staff.daysPresent} Present • {staff.paidLeaves} Leave {staff.unpaidLeaves > 0 && `• ${staff.unpaidLeaves} LWP`}
                          </span>
                        </div>
                      </td>

                      {/* Allowances */}
                      <td className="py-3.5 px-5">
                        <span className="text-xs font-bold text-emerald-600">
                          + ₹{totalAllowances.toLocaleString('en-IN')}
                        </span>
                        <p className="text-[10px] text-gray-400">HRA, DA & Special</p>
                      </td>

                      {/* Deductions */}
                      <td className="py-3.5 px-5">
                        <span className="text-xs font-bold text-rose-600">
                          - ₹{totalDeducts.toLocaleString('en-IN')}
                        </span>
                        <p className="text-[10px] text-gray-400">PF & Tax TDS</p>
                      </td>

                      {/* Net Payable Salary */}
                      <td className="py-3.5 px-5">
                        <p className="text-sm font-black text-gray-900 font-mono">
                          ₹{calc.netSalary.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] text-emerald-600 font-semibold">100% Calculated</p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            staff.status === 'Disbursed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          <LuCheck className="w-3 h-3" />
                          {staff.status}
                        </span>
                      </td>

                      {/* View Payslip Action */}
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => setSelectedSlip({ staff, calc })}
                          className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                        >
                          <LuFileText className="w-3.5 h-3.5" />
                          <span>View Slip</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-sm text-gray-400">
                    No salary records match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Official Salary Slip Breakdown */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs"
            onClick={() => setSelectedSlip(null)}
          />

          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden animate-fade-in-up">
            {/* Payslip Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <LuBanknote className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Salary Slip — {selectedMonth}</h3>
                  <p className="text-xs text-gray-500">EduFlow Public School • Official Employee Compensation</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSlip(null)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Payslip Body Content */}
            <div className="p-6 space-y-5 text-xs">
              {/* Employee Summary Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Staff Name</p>
                  <p className="text-xs font-bold text-gray-900 mt-0.5">{selectedSlip.staff.name}</p>
                  <p className="text-[10px] text-gray-400">{selectedSlip.staff.id}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Designation</p>
                  <p className="text-xs font-bold text-gray-900 mt-0.5">{selectedSlip.staff.role}</p>
                  <p className="text-[10px] text-gray-400">{selectedSlip.staff.dept}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Days Worked</p>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5">
                    {selectedSlip.calc.payableDays} / {selectedSlip.staff.workingDays} Days
                  </p>
                  <p className="text-[10px] text-gray-400">Daily: ₹{selectedSlip.calc.dailyRate}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Bank Account</p>
                  <p className="text-xs font-bold text-gray-900 mt-0.5">{selectedSlip.staff.bankName}</p>
                  <p className="text-[10px] text-gray-400">{selectedSlip.staff.accountNo}</p>
                </div>
              </div>

              {/* Earnings & Deductions Breakdown Tables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Earnings Table */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="bg-emerald-50/70 p-3 border-b border-gray-200">
                    <p className="font-bold text-emerald-900 text-xs">Gross Earnings</p>
                  </div>
                  <div className="p-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Earned Basic Salary</span>
                      <span className="font-bold text-gray-800">₹{selectedSlip.calc.earnedBasic.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">House Rent Allowance (HRA)</span>
                      <span className="font-bold text-gray-800">₹{selectedSlip.staff.hra.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dearness Allowance (DA)</span>
                      <span className="font-bold text-gray-800">₹{selectedSlip.staff.da.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Special Teaching Allowance</span>
                      <span className="font-bold text-gray-800">₹{selectedSlip.staff.specialAllowance.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-100 flex justify-between font-bold text-emerald-700">
                      <span>Total Earnings</span>
                      <span>₹{selectedSlip.calc.grossEarnings.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions Table */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="bg-rose-50/70 p-3 border-b border-gray-200">
                    <p className="font-bold text-rose-900 text-xs">Statutory Deductions</p>
                  </div>
                  <div className="p-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Provident Fund (EPF 12%)</span>
                      <span className="font-bold text-gray-800">₹{selectedSlip.staff.pfDeduction.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Income Tax (TDS)</span>
                      <span className="font-bold text-gray-800">₹{selectedSlip.staff.tdsDeduction.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loss of Pay ({selectedSlip.staff.unpaidLeaves} Days)</span>
                      <span className="font-bold text-gray-800">₹{selectedSlip.calc.lopDeduction.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Professional Tax</span>
                      <span>₹0</span>
                    </div>
                    <div className="pt-2 border-t border-gray-100 flex justify-between font-bold text-rose-600">
                      <span>Total Deductions</span>
                      <span>₹{selectedSlip.calc.totalDeductions.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Disbursed Total Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shadow-md">
                <div>
                  <p className="text-[10px] uppercase font-bold text-emerald-100 tracking-wider">
                    Net Take-Home Salary
                  </p>
                  <p className="text-2xl font-black font-mono mt-0.5">
                    ₹{selectedSlip.calc.netSalary.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                    {selectedSlip.staff.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
              <button
                onClick={() => setSelectedSlip(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
              >
                <LuPrinter className="w-4 h-4" />
                Print / Download Payslip PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
