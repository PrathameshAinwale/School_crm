import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import PrincipalAdmissionsPage from '../principal/PrincipalAdmissionsPage';
import { useAuth } from '../../context/AuthContext';
import {
  LuUserPlus,
  LuSearch,
  LuPhone,
  LuCircleCheck,
  LuCheck,
  LuLoader,
  LuPlus,
  LuGraduationCap,
  LuBus,
  LuCalendarDays,
  LuPrinter,
  LuTable,
  LuArrowRight,
  LuChevronRight,
  LuClipboardCheck,
  LuLayers,
  LuFileCheck,
} from 'react-icons/lu';

// Standard 6-Stage Pipeline definition
const PIPELINE_STAGES = [
  { id: 'Inquiry', step: 1, name: 'Inquiry & Lead', color: 'primary', desc: 'Prospect inquiries & walk-ins' },
  { id: 'Document Review', step: 2, name: 'Document Scrutiny', color: 'amber', desc: 'Verifying certificates & records' },
  { id: 'Assessment/Interview', step: 3, name: 'Assessment & Interview', color: 'sky', desc: 'Entrance test & interview' },
  { id: 'Offer Extended', step: 4, name: 'Provisional Offer', color: 'primary', desc: 'Admission offer extended' },
  { id: 'Fee Paid', step: 5, name: 'Fee Paid', color: 'emerald', desc: 'Admission fee collected' },
  { id: 'Enrolled', step: 6, name: 'Confirmed Enrolled', color: 'emerald', desc: 'Active student roster & parent login' },
];

export default function AdminAdmissionPage() {
  const { currentRole } = useAuth();
  const isPrincipal = currentRole === 'principal';
  const navigate = useNavigate();

  const [pipeline, setPipeline] = useState([]);
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & View state
  const [viewMode, setViewMode] = useState('table'); // 'table' (default) | 'kanban'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedLeadSource, setSelectedLeadSource] = useState('ALL');
  const [selectedStageTab, setSelectedStageTab] = useState('ALL');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const queryParams = { per_page: 200 };
      if (searchQuery?.trim()) queryParams.search = searchQuery.trim();
      if (selectedStageTab !== 'ALL') queryParams.status = selectedStageTab;
      if (selectedClass !== 'ALL') queryParams.school_class_id = selectedClass;
      if (selectedLeadSource !== 'ALL') queryParams.lead_source = selectedLeadSource;

      const [admRes, clsRes] = await Promise.all([
        adminService.getAdmissions(queryParams),
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
      console.error('Failed to load admissions:', err);
      showToast('Failed to load admission pipeline data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedClass, selectedLeadSource, selectedStageTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  // Helper to normalize status into our 6 standard stages
  const normalizeStage = (status) => {
    if (!status) return 'Inquiry';
    if (status === 'Pending') return 'Inquiry';
    if (status === 'Under Review') return 'Document Review';
    if (status === 'Approved') return 'Offer Extended';
    return status;
  };

  // Stage progress metadata helper
  const getStageProgressInfo = (status) => {
    const norm = normalizeStage(status);
    switch (norm) {
      case 'Inquiry':
        return {
          step: 1,
          label: 'Step 1 of 6: Basic Details Registered',
          subtext: 'Next: Document Uploadation',
          badgeClass: 'bg-primary-50 text-primary-700 border-primary-200',
        };
      case 'Document Review':
        return {
          step: 2,
          label: 'Step 2 of 6: Document Scrutiny',
          subtext: 'Next: Entrance Assessment & Interview',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'Assessment/Interview':
        return {
          step: 3,
          label: 'Step 3 of 6: Assessment & Interview',
          subtext: 'Next: Provisional Offer Letter',
          badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
        };
      case 'Offer Extended':
        return {
          step: 4,
          label: 'Step 4 of 6: Provisional Offer Letter',
          subtext: 'Next: Admission Fee Settlement',
          badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
      case 'Fee Paid':
        return {
          step: 5,
          label: 'Step 5 of 6: Admission Fee Paid',
          subtext: 'Next: Confirmed Classroom Enrollment',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'Enrolled':
        return {
          step: 6,
          label: 'Step 6 of 6: Confirmed & Enrolled',
          subtext: 'Active Student & Parent Login Ready',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black',
        };
      case 'Rejected':
        return {
          step: 0,
          label: 'Withdrawn / Rejected',
          subtext: 'Application Closed',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      default:
        return {
          step: 1,
          label: `Stage: ${status}`,
          subtext: 'In Process',
          badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  // Filtered applicants for Table / Kanban
  const filteredApplicants = useMemo(() => {
    return pipeline.filter((app) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = `${app.first_name} ${app.last_name || ''}`.toLowerCase().includes(q);
        const matchesAppNo = (app.application_number || '').toLowerCase().includes(q);
        const matchesPhone = (app.guardian_phone || '').toLowerCase().includes(q);
        const matchesGuardian = (app.guardian_name || '').toLowerCase().includes(q);
        if (!matchesName && !matchesAppNo && !matchesPhone && !matchesGuardian) {
          return false;
        }
      }
      return true;
    });
  }, [pipeline, searchQuery]);

  // Group applicants by pipeline stage for Kanban Board
  const stageGroups = useMemo(() => {
    const groups = {};
    PIPELINE_STAGES.forEach((stage) => {
      groups[stage.id] = [];
    });
    groups['Rejected'] = [];

    filteredApplicants.forEach((item) => {
      const stage = normalizeStage(item.status);
      if (groups[stage]) {
        groups[stage].push(item);
      } else if (item.status === 'Rejected') {
        groups['Rejected'].push(item);
      } else {
        groups['Inquiry'].push(item);
      }
    });

    return groups;
  }, [filteredApplicants]);

  if (isPrincipal) {
    return <PrincipalAdmissionsPage />;
  }

  // Print application slip / admission summary
  const handlePrintSlip = (applicant) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Admission Application Slip - ${applicant.application_number}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #1e293b; max-width: 800px; margin: auto; }
            .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
            .header h1 { margin: 0; font-size: 24px; color: #1d4ed8; }
            .header p { margin: 4px 0 0; font-size: 13px; color: #64748b; }
            .badge { display: inline-block; padding: 4px 12px; background: #dbeafe; color: #1e40af; font-weight: bold; border-radius: 9999px; font-size: 12px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
            .item { padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
            .label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 4px; }
            .value { font-size: 14px; font-weight: 600; color: #0f172a; }
            .section-title { font-size: 14px; font-weight: bold; color: #334155; margin: 16px 0 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
            .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 24px; }
            .signature { text-align: center; width: 180px; }
            .line { border-top: 1px solid #475569; margin-top: 40px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>School Admission & Enrollment Cell</h1>
            <p>Official Candidate Application & Pipeline Verification Record</p>
            <div style="margin-top: 8px;"><span class="badge">Application No: ${applicant.application_number}</span></div>
          </div>

          <div class="section-title">1. Candidate Information</div>
          <div class="grid">
            <div class="item"><div class="label">Candidate Name</div><div class="value">${applicant.first_name} ${applicant.last_name || ''}</div></div>
            <div class="item"><div class="label">Target Class / Grade</div><div class="value">${applicant.school_class?.name || 'Class ' + (applicant.school_class_id || '')} (${applicant.academic_year || '2026-2027'})</div></div>
            <div class="item"><div class="label">Date of Birth & Gender</div><div class="value">${applicant.date_of_birth ? new Date(applicant.date_of_birth).toLocaleDateString() : 'N/A'} • ${applicant.gender || 'Not specified'}</div></div>
            <div class="item"><div class="label">School Bus Transport</div><div class="value">${applicant.with_transport ? 'YES - Opted for School Transport' : 'NO - Self Commute'}</div></div>
          </div>

          <div class="section-title">2. Parent / Guardian Details</div>
          <div class="grid">
            <div class="item"><div class="label">Guardian Name & Relation</div><div class="value">${applicant.guardian_name} (${applicant.guardian_relation || 'Parent'})</div></div>
            <div class="item"><div class="label">Contact Mobile & Email</div><div class="value">${applicant.guardian_phone} • ${applicant.guardian_email || 'N/A'}</div></div>
            <div class="item" style="grid-column: span 2;"><div class="label">Residential Address</div><div class="value">${applicant.address || 'Not recorded'}</div></div>
          </div>

          <div class="section-title">3. Admission Pipeline Status</div>
          <div class="grid">
            <div class="item"><div class="label">Current Pipeline Stage</div><div class="value">${applicant.status}</div></div>
            <div class="item"><div class="label">Lead Inflow Source</div><div class="value">${applicant.lead_source || 'Walk-in'}</div></div>
            <div class="item"><div class="label">Entrance Assessment Result</div><div class="value">${applicant.test_score ? applicant.test_score + ' (' + (applicant.test_status || 'Cleared') + ')' : 'Exempted / Pending'}</div></div>
            <div class="item"><div class="label">Admission Fee Status</div><div class="value">${applicant.admission_fee_status === 'Paid' ? 'PAID (Receipt #' + (applicant.admission_fee_receipt || 'REC-CONFIRMED') + ')' : 'Pending'}</div></div>
          </div>

          <div class="footer">
            <div class="signature">
              <div>Parent / Guardian Signature</div>
              <div class="line"></div>
            </div>
            <div class="signature">
              <div>Admission Officer Signature</div>
              <div class="line"></div>
            </div>
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

  const getDocVerifiedCount = (applicant) => {
    if (!applicant.documents) return { verified: 0, total: 6, percent: 0 };
    const keys = Object.keys(applicant.documents);
    const verified = keys.filter((k) => {
      const doc = applicant.documents[k];
      return doc === 'verified' || doc?.status === 'verified';
    }).length;
    const total = 6;
    return {
      verified,
      total,
      percent: Math.round((verified / total) * 100),
    };
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-scale-up border border-slate-700">
          <LuCircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <LuUserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-bold text-gray-900 leading-tight">Student Admissions</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-primary-50 text-primary-700">
                {stats?.total ?? pipeline.length} Applications
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
              Prospect inquiries, document scrutiny, entrance assessments & enrollment workflow
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {/* Segmented View Switcher: Directory vs Stage Board */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-primary-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LuTable className="w-3.5 h-3.5" />
              <span>Directory</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-primary-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LuLayers className="w-3.5 h-3.5" />
              <span>Stage Board</span>
            </button>
          </div>

          <Link
            to="/admission/calendar"
            className="px-3.5 py-2 sm:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <LuCalendarDays className="w-3.5 h-3.5 text-primary-600" />
            <span>Interview Calendar</span>
          </Link>

          {/* DEDICATED PAGE LINK TO REGISTER NEW STUDENT (NO POPUP!) */}
          <Link
            to="/admission/new"
            className="px-4 py-2 sm:py-2.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <LuPlus className="w-4 h-4" />
            <span>+ Register New Student</span>
          </Link>
        </div>
      </div>

      {/* 4 Standard Admission KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Inquiries & Leads</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {stats?.inquiry ?? stageGroups['Inquiry']?.length ?? 0}
            </p>
            <p className="text-[11px] text-primary-600 font-medium mt-0.5">Fresh prospect walk-ins & leads</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <LuUserPlus className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Document Scrutiny</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {stats?.document_review ?? stageGroups['Document Review']?.length ?? 0}
            </p>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">Certificates & IDs pending</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <LuFileCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Entrance Tests & Interviews</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {stats?.assessment_interview ?? stageGroups['Assessment/Interview']?.length ?? 0}
            </p>
            <p className="text-[11px] text-sky-600 font-medium mt-0.5">Written tests & panel slots</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <LuClipboardCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Confirmed Enrolled</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {stats?.enrolled ?? stageGroups['Enrolled']?.length ?? 0}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Fee settled & roll allocated</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <LuGraduationCap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, application number, parent contact, mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-500"
          />
        </form>

        <div className="grid grid-cols-1 sm:flex sm:items-center gap-2">
          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full sm:w-auto px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-primary-500 font-medium cursor-pointer"
          >
            <option value="ALL">All Grades / Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>

          {/* Lead Source Filter */}
          <select
            value={selectedLeadSource}
            onChange={(e) => setSelectedLeadSource(e.target.value)}
            className="w-full sm:w-auto px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-primary-500 font-medium cursor-pointer"
          >
            <option value="ALL">All Lead Sources</option>
            <option value="Walk-in">Walk-in Inquiry</option>
            <option value="Website">Website Portal</option>
            <option value="Referral">Alumni / Word of Mouth</option>
            <option value="Social Media">Social Media Campaign</option>
            <option value="Phone">Phone Inquiry</option>
          </select>

          {/* Stage Tab Filter */}
          <select
            value={selectedStageTab}
            onChange={(e) => setSelectedStageTab(e.target.value)}
            className="w-full sm:w-auto px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-primary-500 font-medium cursor-pointer"
          >
            <option value="ALL">All Stages</option>
            <option value="Inquiry">1. Inquiry / Lead</option>
            <option value="Document Review">2. Document Scrutiny</option>
            <option value="Assessment/Interview">3. Assessment & Interview</option>
            <option value="Offer Extended">4. Provisional Offer</option>
            <option value="Fee Paid">5. Fee Paid</option>
            <option value="Enrolled">6. Confirmed Enrolled</option>
            <option value="Rejected">Rejected / Withdrawn</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-xs">
          <LuLoader className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-semibold">Synchronizing admission pipeline...</p>
        </div>
      ) : pipeline.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LuUserPlus className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No Admission Applications Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
            {selectedClass !== 'ALL' || selectedLeadSource !== 'ALL' || selectedStageTab !== 'ALL' || searchQuery
              ? 'No candidates match your currently selected filters.'
              : 'There are currently no admission inquiries registered in this school branch.'}
          </p>
          <div className="flex items-center justify-center gap-2">
            {(selectedClass !== 'ALL' || selectedLeadSource !== 'ALL' || selectedStageTab !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedClass('ALL');
                  setSelectedLeadSource('ALL');
                  setSelectedStageTab('ALL');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            )}
            <Link
              to="/admission/new"
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <LuPlus className="w-4 h-4" /> Register New Student
            </Link>
          </div>
        </div>
      ) : viewMode === 'kanban' ? (
        /* ================= KANBAN PIPELINE VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => {
            const applicants = stageGroups[stage.id] || [];

            return (
              <div
                key={stage.id}
                className="bg-slate-50/70 rounded-2xl border border-slate-200/80 flex flex-col max-h-[820px] shadow-xs"
              >
                {/* Column Header */}
                <div className="p-3 border-b border-slate-200/80 bg-white/80 rounded-t-2xl flex items-center justify-between sticky top-0 backdrop-blur-xs z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary-600"></span>
                    <h3 className="text-xs font-bold text-slate-800">{stage.name}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {applicants.length}
                  </span>
                </div>

                {/* Column Body / Cards List */}
                <div className="p-2 space-y-2.5 overflow-y-auto flex-1">
                  {applicants.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-slate-400 font-medium">
                      No candidates in this stage
                    </div>
                  ) : (
                    applicants.map((item) => {
                      const docInfo = getDocVerifiedCount(item);
                      return (
                        <div
                          key={item.id}
                          onClick={() => navigate(`/admission/${item.id}`)}
                          className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-primary-400 transition-all cursor-pointer group space-y-2.5"
                        >
                          {/* Top Row: Name & Application Number */}
                          <div className="flex items-start justify-between gap-1.5">
                            <div>
                              <h4 className="font-bold text-xs text-slate-800 group-hover:text-primary-600 transition-colors leading-tight">
                                {item.first_name} {item.last_name || ''}
                              </h4>
                              <span className="text-[10px] font-mono font-bold text-primary-700 block mt-0.5">
                                {item.application_number}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                              {item.school_class?.name || 'Class ' + (item.school_class_id || '')}
                            </span>
                          </div>

                          {/* Guardian & Contact */}
                          <div className="text-[11px] text-slate-600 space-y-0.5 bg-slate-50/70 p-2 rounded-lg border border-slate-100">
                            <div className="font-semibold text-slate-700 truncate">
                              {item.guardian_name} ({item.guardian_relation || 'Parent'})
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px]">
                              <LuPhone className="w-3 h-3 text-slate-400" />
                              <span>{item.guardian_phone}</span>
                            </div>
                          </div>

                          {/* Progress Badges */}
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                            <span className="px-1.5 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-100 font-medium">
                              {item.lead_source || 'Walk-in'}
                            </span>
                            {item.with_transport && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-medium flex items-center gap-1">
                                <LuBus className="w-2.5 h-2.5" /> Bus
                              </span>
                            )}
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                              Docs: {docInfo.verified}/{docInfo.total}
                            </span>
                          </div>

                          {/* Bottom Action Row */}
                          <div
                            className="pt-1.5 border-t border-slate-100 flex items-center justify-between"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handlePrintSlip(item)}
                              title="Print Application Slip"
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                            >
                              <LuPrinter className="w-3.5 h-3.5" />
                            </button>

                            <Link
                              to={`/admission/${item.id}`}
                              className="px-2.5 py-1 bg-primary-50 hover:bg-primary-600 hover:text-white text-primary-700 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <span>Continue Process</span>
                              <LuChevronRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= TABLE LIST VIEW ================= */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Applicant & Application No</th>
                  <th className="px-5 py-3.5">Applying For</th>
                  <th className="px-5 py-3.5">Parent / Contact</th>
                  <th className="px-5 py-3.5">Completed Process & Stage</th>
                  <th className="px-5 py-3.5">Docs & Assessment</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredApplicants.map((item) => {
                  const docInfo = getDocVerifiedCount(item);
                  const progressInfo = getStageProgressInfo(item.status);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => navigate(`/admission/${item.id}`)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* 1. Student Name & App No */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-800 text-sm group-hover:text-primary-600 transition-colors">
                          {item.first_name} {item.last_name || ''}
                        </div>
                        <div className="text-[11px] text-primary-700 font-mono font-bold">
                          {item.application_number}
                        </div>
                      </td>

                      {/* 2. Class & Year */}
                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-800">
                          {item.school_class?.name || 'Class ' + (item.school_class_id || '')}
                        </span>
                        <div className="text-[11px] text-slate-400">{item.academic_year || '2026-2027'}</div>
                      </td>

                      {/* 3. Parent / Contact */}
                      <td className="px-5 py-4 space-y-0.5">
                        <div className="font-semibold text-slate-800">{item.guardian_name}</div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-mono">
                          <LuPhone className="w-3 h-3 text-slate-400" />
                          <span>{item.guardian_phone}</span>
                        </div>
                      </td>

                      {/* 4. COMPLETED PROCESS & STAGE INDICATOR */}
                      <td className="px-5 py-4 space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 ${progressInfo.badgeClass}`}>
                            {progressInfo.step === 6 && <LuCheck className="w-3 h-3 text-emerald-600 shrink-0" />}
                            <span>{progressInfo.label}</span>
                          </span>
                        </div>

                        {/* Segmented 6-step progress bar */}
                        <div className="flex items-center gap-1 w-36">
                          {[1, 2, 3, 4, 5, 6].map((st) => (
                            <div
                              key={st}
                              title={`Step ${st}`}
                              className={`h-1.5 flex-1 rounded-full transition-all ${
                                st <= progressInfo.step
                                  ? progressInfo.step === 6
                                    ? 'bg-emerald-500'
                                    : 'bg-primary-600'
                                  : 'bg-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          {progressInfo.subtext}
                        </span>
                      </td>

                      {/* 5. Documents & Test result */}
                      <td className="px-5 py-4">
                        <div className="text-slate-700 text-xs font-semibold">
                          Docs: {docInfo.verified}/{docInfo.total} verified
                        </div>
                        {item.test_score ? (
                          <div className="text-[11px] text-primary-600 font-medium">
                            Test: {item.test_score}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400">
                            Assessment pending
                          </div>
                        )}
                      </td>

                      {/* 6. Actions: Direct Page Link (No Popup) */}
                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handlePrintSlip(item)}
                            title="Print Application Slip"
                            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                          >
                            <LuPrinter className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/admission/${item.id}`}
                            className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Continue Process</span>
                            <LuArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
