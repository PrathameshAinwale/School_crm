import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../services/adminService';
import {
  LuUserPlus,
  LuSearch,
  LuEye,
  LuPhone,
  LuMail,
  LuX,
  LuCircleCheck,
  LuGraduationCap,
  LuCalendar,
  LuPrinter,
  LuFileText,
  LuCheck,
  LuClock,
  LuFilter,
  LuRefreshCw,
  LuUsers,
  LuReceipt,
  LuDownload,
  LuChevronRight,
  LuTrendingUp,
} from 'react-icons/lu';

export default function PrincipalAdmissionsPage() {
  const [pipeline, setPipeline] = useState([]);
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedStatusTab, setSelectedStatusTab] = useState('ALL');

  // Detail Modal
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [admRes, clsRes] = await Promise.all([
        adminService.getAdmissions({
          search: searchQuery || undefined,
          status: selectedStatusTab !== 'ALL' && selectedStatusTab !== 'IN_PROGRESS' ? selectedStatusTab : undefined,
          school_class_id: selectedClass !== 'ALL' ? selectedClass : undefined,
          per_page: 200,
        }),
        adminService.getClasses(),
      ]);

      if (admRes?.success && admRes?.data) {
        const items = Array.isArray(admRes.data.data)
          ? admRes.data.data
          : Array.isArray(admRes.data)
          ? admRes.data
          : [];
        setPipeline(items);
        if (admRes.stats) {
          setStats(admRes.stats);
        }
      }
      if (clsRes?.success && clsRes?.data) {
        setClasses(clsRes.data);
      }
    } catch (err) {
      console.error('Failed to load admissions for principal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedClass, selectedStatusTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  // Helper to normalize status
  const normalizeStatus = (status) => {
    if (!status) return 'Inquiry';
    if (status === 'Pending') return 'Inquiry';
    if (status === 'Under Review') return 'Document Review';
    if (status === 'Approved') return 'Offer Extended';
    return status;
  };

  // Status mapping and colors
  const getStatusBadge = (status) => {
    const norm = normalizeStatus(status);
    switch (norm) {
      case 'Inquiry':
        return {
          label: 'Inquiry / Lead',
          badgeClass: 'bg-primary-50 text-primary-700 border border-primary-200',
          dotClass: 'bg-primary-500',
        };
      case 'Document Review':
        return {
          label: 'Under Scrutiny',
          badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
          dotClass: 'bg-amber-500',
        };
      case 'Assessment/Interview':
        return {
          label: 'Interview / Test',
          badgeClass: 'bg-sky-50 text-sky-700 border border-sky-200',
          dotClass: 'bg-sky-500',
        };
      case 'Offer Extended':
        return {
          label: 'Offer Extended',
          badgeClass: 'bg-primary-100 text-primary-800 border border-primary-300',
          dotClass: 'bg-primary-600',
        };
      case 'Fee Paid':
        return {
          label: 'Fee Paid',
          badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
          dotClass: 'bg-emerald-500',
        };
      case 'Enrolled':
        return {
          label: 'Enrolled Active',
          badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
          dotClass: 'bg-emerald-600',
        };
      case 'Rejected':
        return {
          label: 'Rejected / Dropped',
          badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200',
          dotClass: 'bg-rose-500',
        };
      default:
        return {
          label: status,
          badgeClass: 'bg-gray-50 text-gray-700 border border-gray-200',
          dotClass: 'bg-gray-400',
        };
    }
  };

  // Filtered applications
  const filteredApplicants = useMemo(() => {
    return pipeline.filter((app) => {
      const norm = normalizeStatus(app.status);
      if (selectedStatusTab === 'IN_PROGRESS') {
        return norm === 'Document Review' || norm === 'Assessment/Interview' || norm === 'Offer Extended' || norm === 'Fee Paid';
      }
      if (selectedStatusTab !== 'ALL' && norm !== selectedStatusTab) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const fullName = `${app.first_name || ''} ${app.last_name || ''}`.toLowerCase();
        const appNo = (app.application_number || '').toLowerCase();
        const guardian = (app.guardian_name || '').toLowerCase();
        const phone = (app.guardian_phone || '').toLowerCase();
        return fullName.includes(q) || appNo.includes(q) || guardian.includes(q) || phone.includes(q);
      }
      return true;
    });
  }, [pipeline, selectedStatusTab, searchQuery]);

  // Derived KPI numbers
  const totalApps = stats?.total ?? pipeline.length;
  const inqCount = stats?.inquiry ?? pipeline.filter((p) => normalizeStatus(p.status) === 'Inquiry').length;
  const docReviewCount = stats?.document_review ?? pipeline.filter((p) => normalizeStatus(p.status) === 'Document Review').length;
  const interviewCount = stats?.assessment_interview ?? pipeline.filter((p) => normalizeStatus(p.status) === 'Assessment/Interview').length;
  const offerCount = stats?.offer_extended ?? pipeline.filter((p) => normalizeStatus(p.status) === 'Offer Extended').length;
  const feePaidCount = stats?.fee_paid ?? pipeline.filter((p) => normalizeStatus(p.status) === 'Fee Paid').length;
  const enrolledCount = stats?.enrolled ?? pipeline.filter((p) => normalizeStatus(p.status) === 'Enrolled').length;

  // "How many admissions are going on right now" (Underway = Scrutiny, Interviews, Offers, Fee settling)
  const admissionsOngoingCount = docReviewCount + interviewCount + offerCount + feePaidCount;

  // Print application slip
  const handlePrintSlip = (applicant) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Admission Summary - ${applicant.application_number}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #1e293b; line-height: 1.5; }
            .header { border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; }
            .header h1 { margin: 0 0 4px 0; color: #0284c7; font-size: 22px; font-weight: bold; }
            .badge { display: inline-block; padding: 4px 10px; background: #e0f2fe; color: #0369a1; border-radius: 9999px; font-size: 11px; font-weight: bold; }
            .section-title { font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin: 20px 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; font-size: 13px; }
            .item { padding: 8px 12px; background: #f8fafc; border-radius: 6px; }
            .label { font-size: 11px; color: #64748b; margin-bottom: 2px; }
            .value { font-weight: 600; color: #0f172a; }
            .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; font-size: 12px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>School Admission Application Summary</h1>
            <p style="margin: 0; font-size: 13px; color: #64748b;">Executive Intake Record • Read-Only Reference</p>
            <div style="margin-top: 10px;"><span class="badge">Application No: ${applicant.application_number}</span></div>
          </div>

          <div class="section-title">1. Candidate Information</div>
          <div class="grid">
            <div class="item"><div class="label">Candidate Name</div><div class="value">${applicant.first_name} ${applicant.last_name || ''}</div></div>
            <div class="item"><div class="label">Applying For</div><div class="value">${applicant.school_class?.name || 'Class ' + (applicant.school_class_id || 'N/A')} (${applicant.academic_year || '2026-2027'})</div></div>
            <div class="item"><div class="label">Date of Birth & Gender</div><div class="value">${applicant.date_of_birth ? new Date(applicant.date_of_birth).toLocaleDateString() : 'N/A'} • ${applicant.gender || 'Not specified'}</div></div>
            <div class="item"><div class="label">School Transport</div><div class="value">${applicant.with_transport ? 'YES - Transport Opted' : 'NO - Self Commute'}</div></div>
          </div>

          <div class="section-title">2. Parent / Guardian Details</div>
          <div class="grid">
            <div class="item"><div class="label">Guardian Name & Relation</div><div class="value">${applicant.guardian_name} (${applicant.guardian_relation || 'Parent'})</div></div>
            <div class="item"><div class="label">Contact Mobile & Email</div><div class="value">${applicant.guardian_phone} • ${applicant.guardian_email || 'N/A'}</div></div>
            <div class="item" style="grid-column: span 2;"><div class="label">Address</div><div class="value">${applicant.address || 'Not specified'}</div></div>
          </div>

          <div class="section-title">3. Admission & Enrollment Status</div>
          <div class="grid">
            <div class="item"><div class="label">Admission Status</div><div class="value">${applicant.status}</div></div>
            <div class="item"><div class="label">Inquiry Source</div><div class="value">${applicant.lead_source || 'Walk-in'}</div></div>
            <div class="item"><div class="label">Assessment / Interview</div><div class="value">${applicant.test_score ? applicant.test_score + ' (' + (applicant.test_status || 'Cleared') + ')' : 'Pending / Exempted'}</div></div>
            <div class="item"><div class="label">Fee Status</div><div class="value">${applicant.admission_fee_status === 'Paid' ? 'PAID (₹' + Number(applicant.admission_fee || 0).toLocaleString('en-IN') + ')' : 'Pending'}</div></div>
          </div>

          <div class="footer">
            <div>Printed on: ${new Date().toLocaleString()}</div>
            <div>School Management System • Executive Desk</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-16">
      {/* 1. Executive Admissions Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 border border-primary-100">
            <LuUserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                Student Admissions
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                View-Only Executive Desk
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Current intake status, active admissions underway, and student applicant roster.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 sm:px-3 sm:py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1.5 shadow-2xs"
            title="Refresh Data"
          >
            <LuRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Executive 4 KPI Cards: Status Overview & "How many admissions are going on" */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Applications Received */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500">Total Applications</span>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 tracking-tight">
              {totalApps}
            </h3>
            <span className="text-[11px] font-medium text-blue-600 mt-0.5 block">
              All Intake Inquiries
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <LuUsers className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Admissions Ongoing / Underway (Exact answer to: "how many admission are going on right now") */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/70 shadow-xs flex items-center justify-between bg-amber-50/20">
          <div>
            <span className="text-xs font-semibold text-amber-700">Admissions Ongoing</span>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-700 mt-1 tracking-tight">
              {admissionsOngoingCount}
            </h3>
            <span className="text-[11px] font-medium text-amber-600 mt-0.5 block">
              In Review, Test & Offers
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <LuClock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Successfully Enrolled */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200/70 shadow-xs flex items-center justify-between bg-emerald-50/20">
          <div>
            <span className="text-xs font-semibold text-emerald-700">Enrolled Students</span>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1 tracking-tight">
              {enrolledCount}
            </h3>
            <span className="text-[11px] font-medium text-emerald-600 mt-0.5 block">
              Admission Confirmed
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <LuGraduationCap className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: New / Unprocessed Inquiries */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500">Fresh Inquiries</span>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 tracking-tight">
              {inqCount}
            </h3>
            <span className="text-[11px] font-medium text-gray-500 mt-0.5 block">
              Pending First Review
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <LuUserPlus className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Controls: Search, Status Dropdown, and Class Dropdown */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search applicant name, app #, guardian phone..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-gray-400"
            />
          </form>

          {/* Filter Dropdowns: Status & Grade */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Status Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
              <LuFilter className="w-3.5 h-3.5 text-gray-400" />
              <span>Status:</span>
              <select
                value={selectedStatusTab}
                onChange={(e) => setSelectedStatusTab(e.target.value)}
                className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-gray-800 font-semibold cursor-pointer"
              >
                <option value="ALL">All Applications ({totalApps})</option>
                <option value="IN_PROGRESS">Ongoing Admissions ({admissionsOngoingCount})</option>
                <option value="Inquiry">Inquiries ({inqCount})</option>
                <option value="Document Review">Doc Scrutiny ({docReviewCount})</option>
                <option value="Assessment/Interview">Interviews ({interviewCount})</option>
                <option value="Offer Extended">Offers ({offerCount})</option>
                <option value="Enrolled">Enrolled ({enrolledCount})</option>
              </select>
            </div>

            {/* Class / Grade Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
              <span>Grade:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-gray-800 font-semibold cursor-pointer"
              >
                <option value="ALL">All Classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 4. Clean Applications Roster Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-500 font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Application #</th>
                <th className="py-3 px-4">Applicant Name</th>
                <th className="py-3 px-4">Grade / Class</th>
                <th className="py-3 px-4">Guardian & Contact</th>
                <th className="py-3 px-4">Admission Status</th>
                <th className="py-3 px-4">Fee Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3 px-4"><div className="h-4 bg-gray-100 rounded-md w-24" /></td>
                    <td className="py-3 px-4"><div className="h-4 bg-gray-100 rounded-md w-36" /></td>
                    <td className="py-3 px-4"><div className="h-4 bg-gray-100 rounded-md w-20" /></td>
                    <td className="py-3 px-4"><div className="h-4 bg-gray-100 rounded-md w-32" /></td>
                    <td className="py-3 px-4"><div className="h-5 bg-gray-100 rounded-full w-24" /></td>
                    <td className="py-3 px-4"><div className="h-5 bg-gray-100 rounded-full w-16" /></td>
                    <td className="py-3 px-4 text-right"><div className="h-7 bg-gray-100 rounded-lg w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <LuUserPlus className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="font-semibold text-gray-600">No admission applications found</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {searchQuery ? 'Try clearing your search query or filters.' : 'No candidate records exist in this category.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((app) => {
                  const badge = getStatusBadge(app.status);
                  const isFeePaid = app.admission_fee_status === 'Paid';
                  const dateStr = app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A';

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-gray-50/70 transition-colors cursor-pointer"
                      onClick={() => setSelectedApplicant(app)}
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-gray-900">
                          {app.application_number}
                        </span>
                        <div className="text-[10px] text-gray-400 mt-0.5">{dateStr}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900">
                          {app.first_name} {app.last_name || ''}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {app.gender || 'Not specified'} • {app.with_transport ? 'Bus Transport' : 'Self'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-800">
                          {app.school_class?.name || (app.school_class_id ? `Class ${app.school_class_id}` : 'Unassigned')}
                        </span>
                        <div className="text-[10px] text-gray-400">{app.academic_year || '2026-2027'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{app.guardian_name}</div>
                        <div className="text-[10px] text-gray-500 flex items-center gap-1">
                          <LuPhone className="w-2.5 h-2.5" />
                          <span>{app.guardian_phone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badge.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isFeePaid
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {isFeePaid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedApplicant(app)}
                          className="px-2.5 py-1 text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50/70 hover:bg-primary-100 rounded-lg transition-all inline-flex items-center gap-1"
                        >
                          <LuEye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Count */}
        <div className="text-xs text-gray-500 pt-2 flex items-center justify-between">
          <span>
            Showing <strong className="text-gray-900">{filteredApplicants.length}</strong> of{' '}
            <strong className="text-gray-900">{totalApps}</strong> applications
          </span>
          <span className="text-[11px] text-gray-400">
            Click any row to view full read-only applicant summary.
          </span>
        </div>
      </div>

      {/* 6. Read-Only Applicant Detail Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-gray-200 shadow-2xl overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                  <LuUserPlus className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-gray-900">
                      {selectedApplicant.first_name} {selectedApplicant.last_name || ''}
                    </h2>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(selectedApplicant.status).badgeClass}`}>
                      {getStatusBadge(selectedApplicant.status).label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono">
                    {selectedApplicant.application_number} • Applied:{' '}
                    {selectedApplicant.created_at ? new Date(selectedApplicant.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="w-8 h-8 rounded-lg hover:bg-gray-200/60 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-all"
              >
                <LuX className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content (Read-Only) */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Section 1: Candidate Details */}
              <div>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  1. Candidate Profile
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 block">Applying For Class</span>
                    <strong className="text-gray-800 text-xs">
                      {selectedApplicant.school_class?.name || (selectedApplicant.school_class_id ? `Class ${selectedApplicant.school_class_id}` : 'Unassigned')}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 block">Date of Birth</span>
                    <strong className="text-gray-800 text-xs">
                      {selectedApplicant.date_of_birth ? new Date(selectedApplicant.date_of_birth).toLocaleDateString() : 'N/A'}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 block">Gender</span>
                    <strong className="text-gray-800 text-xs">{selectedApplicant.gender || 'Not specified'}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 block">Bus Transport</span>
                    <strong className="text-gray-800 text-xs">
                      {selectedApplicant.with_transport ? 'YES - Opted' : 'NO - Self Commute'}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 sm:col-span-2">
                    <span className="text-[10px] text-gray-400 block">Previous School & Score</span>
                    <strong className="text-gray-800 text-xs">
                      {selectedApplicant.previous_school || 'N/A'}{' '}
                      {selectedApplicant.previous_score ? `(${selectedApplicant.previous_score})` : ''}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Section 2: Parent / Guardian Info */}
              <div>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  2. Parent / Guardian Contact
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 block">Guardian Name</span>
                    <strong className="text-gray-800 text-xs">
                      {selectedApplicant.guardian_name} ({selectedApplicant.guardian_relation || 'Parent'})
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 block">Contact Phone</span>
                    <strong className="text-gray-800 text-xs">{selectedApplicant.guardian_phone}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 block">Email Address</span>
                    <strong className="text-gray-800 text-xs truncate block">{selectedApplicant.guardian_email || 'N/A'}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 sm:col-span-3">
                    <span className="text-[10px] text-gray-400 block">Residential Address</span>
                    <strong className="text-gray-800 text-xs block">{selectedApplicant.address || 'Not recorded'}</strong>
                  </div>
                </div>
              </div>

              {/* Section 3: Admission Status & Assessment */}
              <div>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  3. Admission Intake Status
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 block">Current Status</span>
                    <strong className="text-gray-800 text-xs">{selectedApplicant.status}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 block">Lead Source</span>
                    <strong className="text-gray-800 text-xs">{selectedApplicant.lead_source || 'Walk-in'}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 block">Admission Fee</span>
                    <strong className="text-gray-800 text-xs">
                      {selectedApplicant.admission_fee_status === 'Paid'
                        ? `PAID (₹${Number(selectedApplicant.admission_fee || 0).toLocaleString('en-IN')})`
                        : 'Pending'}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 sm:col-span-3">
                    <span className="text-[10px] text-gray-400 block">Internal Remarks / Notes</span>
                    <p className="text-gray-700 text-xs mt-0.5">
                      {selectedApplicant.remarks || 'No remarks entered.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <button
                onClick={() => handlePrintSlip(selectedApplicant)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-all flex items-center gap-1.5"
              >
                <LuPrinter className="w-3.5 h-3.5" />
                <span>Print Slip</span>
              </button>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="px-4 py-1.5 text-xs font-bold text-gray-700 bg-gray-200/80 hover:bg-gray-300/80 rounded-xl transition-all"
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
