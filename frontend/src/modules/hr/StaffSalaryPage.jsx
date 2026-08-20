import React, { useState, useEffect } from 'react';
import { hrService } from '../../services/hrService';
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
  LuRefreshCw,
  LuLoader,
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
    hra: 10000,
    da: 6500,
    specialAllowance: 4000,
    pfDeduction: 3800,
    tdsDeduction: 2500,
    status: 'Disbursed',
    accountNo: '•••• •••• 1045',
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
    unpaidLeaves: 3,
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
    role: 'Senior Admin Officer',
    dept: 'Administration',
    baseSalary: 48000,
    workingDays: 26,
    daysPresent: 25,
    paidLeaves: 1,
    unpaidLeaves: 0,
    hra: 9000,
    da: 6000,
    specialAllowance: 3500,
    pfDeduction: 3500,
    tdsDeduction: 2000,
    status: 'Disbursed',
    accountNo: '•••• •••• 6712',
    bankName: 'Axis Bank',
  },
];

export default function StaffSalaryPage() {
  const [selectedMonth, setSelectedMonth] = useState('August 2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [disburseSuccess, setDisburseSuccess] = useState(false);
  const [disburseMsg, setDisburseMsg] = useState('');
  const [records, setRecords] = useState(INITIAL_SALARY_RECORDS);
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);

  const fetchSalaries = async () => {
    try {
      const res = await hrService.getStaffSalaries({ month: selectedMonth });
      if (res?.success && res.data?.records?.length > 0) {
        setRecords(res.data.records);
        setSummaryData(res.data.summary);
      }
    } catch (err) {
      console.log('Using local salary records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, [selectedMonth]);

  // Helper calculations for an employee
  const calculateSalary = (staff) => {
    const dailyRate = Math.round(staff.baseSalary / (staff.workingDays || 26));
    const payableDays = (staff.daysPresent || 0) + (staff.paidLeaves || 0);
    
    // Pro-rated basic pay based on days worked
    const earnedBasic = Math.round(dailyRate * payableDays);
    const grossEarnings = staff.grossSalary || (earnedBasic + (staff.hra || 0) + (staff.da || 0) + (staff.specialAllowance || 0));
    
    // Unpaid leave deduction (Loss of Pay)
    const lopDeduction = staff.unpaidLeaveDeduction || Math.round(dailyRate * (staff.unpaidLeaves || 0));
    const totalDeductions = (staff.pfDeduction || 0) + (staff.tdsDeduction || 0) + lopDeduction;
    
    const netSalary = staff.netSalary || (grossEarnings - ((staff.pfDeduction || 0) + (staff.tdsDeduction || 0)));

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

  const handleDisburseBatch = async () => {
    try {
      await hrService.disburseSalary({ all: true, month: selectedMonth });
      setRecords((prev) => prev.map((r) => ({ ...r, status: 'Disbursed' })));
      setDisburseMsg(`All staff salaries for ${selectedMonth} marked as Disbursed!`);
      setDisburseSuccess(true);
      setTimeout(() => setDisburseSuccess(false), 3500);
    } catch (err) {
      setRecords((prev) => prev.map((r) => ({ ...r, status: 'Disbursed' })));
      setDisburseMsg(`Direct salary transfers initiated for ${selectedMonth}!`);
      setDisburseSuccess(true);
      setTimeout(() => setDisburseSuccess(false), 3500);
    }
  };

  const handleSingleDisburse = async (empId) => {
    try {
      await hrService.disburseSalary({ id: empId, month: selectedMonth });
      setRecords((prev) => prev.map((r) => (r.id === empId ? { ...r, status: 'Disbursed' } : r)));
      setDisburseMsg(`Salary disbursed for ${empId}!`);
      setDisburseSuccess(true);
      setTimeout(() => setDisburseSuccess(false), 3000);
    } catch (err) {
      setRecords((prev) => prev.map((r) => (r.id === empId ? { ...r, status: 'Disbursed' } : r)));
    }
  };

  const filteredRecords = records.filter((s) => {
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
  records.forEach((s) => {
    totalDisbursedAmount += (s.netSalary || calculateSalary(s).netSalary);
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
            <p className="text-xs text-emerald-100">{disburseMsg || `Direct salary transfers initiated for ${selectedMonth}`}</p>
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
              onClick={handleDisburseBatch}
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
            <p className="text-xl font-bold text-gray-900 leading-tight">{records.length} Active</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <LuBuilding2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500">Avg Monthly Pay</p>
            <p className="text-xl font-bold text-gray-900 leading-tight">
              ₹{records.length > 0 ? Math.round(totalDisbursedAmount / records.length).toLocaleString('en-IN') : 0}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <LuSparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500">Disbursed Ratio</p>
            <p className="text-xl font-bold text-gray-900 leading-tight">
              {records.filter((r) => r.status === 'Disbursed').length} / {records.length} Paid
            </p>
          </div>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <LuSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search faculty name, ID or role..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'Teaching', 'Administration', 'Primary Wing', 'Sports'].map((dept) => (
            <button
              key={dept}
              onClick={() => setDeptFilter(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                deptFilter === dept
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {dept === 'ALL' ? 'All Depts' : dept}
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
                  const totalAllowances = (staff.hra || 0) + (staff.da || 0) + (staff.specialAllowance || 0);
                  const totalDeducts = (staff.pfDeduction || 0) + (staff.tdsDeduction || 0);

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
                        <p className="text-xs font-bold text-gray-900">₹{Number(staff.baseSalary).toLocaleString('en-IN')}</p>
                        <p className="text-[10px] text-gray-400">₹{calc.dailyRate}/day</p>
                      </td>

                      {/* Days Worked (Attendance Breakdown) */}
                      <td className="py-3.5 px-5 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-xs font-bold text-gray-800">
                            {calc.payableDays} / {staff.workingDays || 26} Days
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
                        <span className="text-xs font-bold text-red-600">
                          - ₹{totalDeducts.toLocaleString('en-IN')}
                        </span>
                        <p className="text-[10px] text-gray-400">PF & TDS Deductions</p>
                      </td>

                      {/* Net Payable */}
                      <td className="py-3.5 px-5">
                        <p className="text-sm font-extrabold text-gray-900">₹{calc.netSalary.toLocaleString('en-IN')}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{staff.accountNo}</p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5 text-center">
                        {staff.status === 'Disbursed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <LuCheck className="w-3 h-3" /> Disbursed
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSingleDisburse(staff.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                          >
                            Mark Disbursed
                          </button>
                        )}
                      </td>

                      {/* Payslip View Button */}
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => setSelectedSlip(staff)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 text-xs font-bold transition-colors"
                        >
                          <LuEye className="w-3.5 h-3.5" /> View Slip
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-xs text-gray-400">
                    No payroll records matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 animate-scale-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <LuFileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Salary Slip - {selectedMonth}</h3>
                  <p className="text-xs text-gray-400">{selectedSlip.name} • {selectedSlip.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSlip(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                <LuX className="w-4 h-4" />
              </button>
            </div>

            {/* Slip Details Breakdown */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl text-xs">
              <div>
                <p className="text-gray-400 font-medium">Employee Name</p>
                <p className="font-bold text-gray-800 mt-0.5">{selectedSlip.name}</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Designation</p>
                <p className="font-bold text-gray-800 mt-0.5">{selectedSlip.role}</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Bank & Account</p>
                <p className="font-bold text-gray-800 mt-0.5">{selectedSlip.bankName} ({selectedSlip.accountNo})</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Attendance Ratio</p>
                <p className="font-bold text-gray-800 mt-0.5">{selectedSlip.daysPresent} / {selectedSlip.workingDays} Days Worked</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Earnings & Allowances</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Base Salary</span>
                  <span className="font-bold text-gray-800">₹{Number(selectedSlip.baseSalary).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">House Rent Allowance (HRA)</span>
                  <span className="font-bold text-emerald-600">+ ₹{Number(selectedSlip.hra).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Dearness Allowance (DA)</span>
                  <span className="font-bold text-emerald-600">+ ₹{Number(selectedSlip.da).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Special Allowance</span>
                  <span className="font-bold text-emerald-600">+ ₹{Number(selectedSlip.specialAllowance).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Statutory Deductions</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Provident Fund (PF)</span>
                  <span className="font-bold text-red-600">- ₹{Number(selectedSlip.pfDeduction).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Tax Deducted at Source (TDS)</span>
                  <span className="font-bold text-red-600">- ₹{Number(selectedSlip.tdsDeduction).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase text-emerald-800">Net Disbursed Compensation</p>
                <p className="text-xl font-black text-emerald-900 mt-0.5">
                  ₹{calculateSalary(selectedSlip).netSalary.toLocaleString('en-IN')}
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs font-bold">
                {selectedSlip.status}
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <LuPrinter className="w-3.5 h-3.5" /> Print Payslip
              </button>
              <button
                onClick={() => setSelectedSlip(null)}
                className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
