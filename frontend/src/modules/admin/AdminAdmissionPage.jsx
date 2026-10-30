import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import CredentialsModal from '../../components/Common/CredentialsModal';
import PrincipalAdmissionsPage from '../principal/PrincipalAdmissionsPage';
import { useAuth } from '../../context/AuthContext';
import {
  LuUserPlus,
  LuSearch,
  LuEye,
  LuPhone,
  LuMail,
  LuX,
  LuCircleCheck,
  LuCheck,
  LuLoader,
  LuPlus,
  LuGraduationCap,
  LuBus,
  LuReceipt,
  LuFileText,
  LuFileCheck,
  LuCalendar,
  LuCalendarDays,
  LuClock,
  LuPrinter,
  LuTable,
  LuTrash2,
  LuCreditCard,
  LuAward,
  LuArrowRight,
  LuChevronRight,
  LuClipboardCheck,
  LuDownload,
  LuLayers,
  LuSparkles,
  LuTrendingUp,
  LuUserCheck,
} from 'react-icons/lu';

// Standard 6-Stage Pipeline definition
const PIPELINE_STAGES = [
  { id: 'Inquiry', name: 'Inquiry & Lead', color: 'primary', desc: 'Prospect inquiries & walk-ins' },
  { id: 'Document Review', name: 'Document Scrutiny', color: 'amber', desc: 'Verifying certificates & records' },
  { id: 'Assessment/Interview', name: 'Assessment & Interview', color: 'sky', desc: 'Entrance test & interview' },
  { id: 'Offer Extended', name: 'Provisional Offer', color: 'primary', desc: 'Admission offer extended' },
  { id: 'Fee Paid', name: 'Fee Paid', color: 'emerald', desc: 'Admission fee collected' },
  { id: 'Enrolled', name: 'Confirmed Enrolled', color: 'emerald', desc: 'Active student roster & parent login generated' },
];

const STANDARD_DOCS = [
  { key: 'birth_certificate', label: 'Birth Certificate', required: true },
  { key: 'transfer_certificate', label: 'Transfer Certificate (TC)', required: false },
  { key: 'previous_marksheet', label: 'Previous Marksheet / Report Card', required: false },
  { key: 'address_proof', label: 'Residence / Address Proof', required: true },
  { key: 'aadhar_card', label: 'Student & Parent Aadhar / ID', required: true },
  { key: 'medical_record', label: 'Medical / Immunization Record', required: false },
];

export default function AdminAdmissionPage() {
  const { currentRole } = useAuth();
  const isPrincipal = currentRole === 'principal';

  if (isPrincipal) {
    return <PrincipalAdmissionsPage />;
  }

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

  // Modals & Details
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [detailActiveTab, setDetailActiveTab] = useState('overview'); // overview, docs, assessment, fee, enroll, timeline
  const [credentialsModalData, setCredentialsModalData] = useState(null);

  // Submitting state
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // New Application Form Data
  const [newAppForm, setNewAppForm] = useState({
    first_name: '',
    last_name: '',
    school_class_id: '',
    academic_year: '2026-2027',
    lead_source: 'Walk-in',
    date_of_birth: '',
    gender: 'Male',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
    guardian_relation: 'Father',
    previous_school: '',
    previous_score: '',
    address: '',
    with_transport: false,
    remarks: '',
  });

  // Modal Editing / Stage Transition Data
  const [stageFormData, setStageFormData] = useState({});

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [admRes, clsRes] = await Promise.all([
        adminService.getAdmissions({
          search: searchQuery,
          status: selectedStageTab !== 'ALL' ? selectedStageTab : undefined,
          school_class_id: selectedClass !== 'ALL' ? selectedClass : undefined,
          lead_source: selectedLeadSource !== 'ALL' ? selectedLeadSource : undefined,
          per_page: 200,
        }),
        adminService.getClasses(),
      ]);

      if (admRes.success && admRes.data) {
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
      if (clsRes.success && clsRes.data) {
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

  // Open detailed applicant inspection modal
  const openApplicantDetails = (applicant, defaultTab = 'overview') => {
    setSelectedApplicant(applicant);
    setDetailActiveTab(defaultTab);

    // Initialize stage edit form state
    setStageFormData({
      status: applicant.status,
      remarks: '',
      documents: applicant.documents || {
        birth_certificate: 'pending',
        transfer_certificate: 'pending',
        previous_marksheet: 'pending',
        address_proof: 'pending',
        aadhar_card: 'pending',
        medical_record: 'pending',
      },
      test_score: applicant.test_score || '',
      test_date: applicant.test_date ? applicant.test_date.substring(0, 10) : '',
      test_status: applicant.test_status || 'Pending',
      interview_date: applicant.interview_date ? applicant.interview_date.replace(' ', 'T').substring(0, 16) : '',
      interview_interviewer: applicant.interview_interviewer || 'Principal & Interview Panel',
      interview_notes: applicant.interview_notes || '',
      interview_result: applicant.interview_result || 'Pending',
      offer_date: applicant.offer_date ? applicant.offer_date.substring(0, 10) : new Date().toISOString().substring(0, 10),
      offer_valid_until: applicant.offer_valid_until ? applicant.offer_valid_until.substring(0, 10) : '',
      admission_fee: applicant.admission_fee || 35000,
      admission_fee_status: applicant.admission_fee_status || 'Pending',
      admission_fee_receipt: applicant.admission_fee_receipt || `REC-${Date.now().toString().slice(-6)}`,
      admission_fee_date: applicant.admission_fee_date ? applicant.admission_fee_date.substring(0, 10) : new Date().toISOString().substring(0, 10),
      admission_fee_mode: applicant.admission_fee_mode || 'UPI',
      // Enrollment specific
      roll_number: '',
      section_id: '',
      with_transport: applicant.with_transport !== undefined ? Boolean(applicant.with_transport) : true,
    });
  };

  // Create new admission application
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await adminService.createAdmission(newAppForm);
      if (res.success) {
        setShowAddModal(false);
        setNewAppForm({
          first_name: '',
          last_name: '',
          school_class_id: '',
          academic_year: '2026-2027',
          lead_source: 'Walk-in',
          date_of_birth: '',
          gender: 'Male',
          guardian_name: '',
          guardian_phone: '',
          guardian_email: '',
          guardian_relation: 'Father',
          previous_school: '',
          previous_score: '',
          address: '',
          with_transport: false,
          remarks: '',
        });
        await loadData();
        showToast('New admission application registered successfully!');
        if (res.data) {
          openApplicantDetails(res.data, 'overview');
        }
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick move to next stage from Kanban card
  const handleQuickAdvance = async (applicant, targetStage) => {
    try {
      const payload = {
        status: targetStage,
        remarks: `Stage updated to ${targetStage} via quick action`,
      };
      const res = await adminService.updateAdmissionStatus(applicant.id, payload);
      if (res.success) {
        showToast(`Moved ${applicant.first_name} to ${targetStage}!`);
        await loadData();
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to update stage.');
    }
  };

  // Update applicant stage details in the detailed modal
  const handleSaveStageData = async (targetStage = null) => {
    if (!selectedApplicant) return;
    setSubmitting(true);
    try {
      const stageToSet = targetStage || stageFormData.status || selectedApplicant.status;
      const payload = {
        ...stageFormData,
        status: stageToSet,
      };

      const res = await adminService.updateAdmissionStatus(selectedApplicant.id, payload);
      if (res.success) {
        setSelectedApplicant(res.data);
        showToast(`Application successfully updated to ${stageToSet}!`);
        await loadData();
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to save stage changes.');
    } finally {
      setSubmitting(false);
    }
  };

  // Execute Enrollment of approved/fee-paid applicant
  const handleExecuteEnroll = async (e) => {
    e.preventDefault();
    if (!selectedApplicant) return;
    setSubmitting(true);
    try {
      const res = await adminService.enrollAdmission(selectedApplicant.id, {
        section_id: stageFormData.section_id,
        roll_number: stageFormData.roll_number,
        with_transport: stageFormData.with_transport,
        admission_fee_receipt: stageFormData.admission_fee_receipt,
      });

      if (res.success) {
        showToast('Applicant officially enrolled as active student! Parent portal account generated.');
        if (res.data?.admission) {
          setSelectedApplicant(res.data.admission);
        }
        await loadData();
        if (res.credentials) {
          setCredentialsModalData(res.credentials);
        }
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to enroll student.');
    } finally {
      setSubmitting(false);
    }
  };

  // Print application slip / admission letter
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
            .header { text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 16px; margin-bottom: 24px; }
            .header h1 { margin: 0; font-size: 24px; color: #4338ca; }
            .header p { margin: 4px 0 0; font-size: 13px; color: #64748b; }
            .badge { display: inline-block; padding: 4px 12px; background: #e0e7ff; color: #3730a3; font-weight: bold; border-radius: 9999px; font-size: 12px; }
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

  // Helper to calculate document verification percentage
  const getDocVerifiedCount = (applicant) => {
    if (!applicant.documents) return { verified: 0, total: 6, percent: 0 };
    const keys = Object.keys(applicant.documents);
    const verified = keys.filter((k) => applicant.documents[k] === 'verified').length;
    const total = keys.length || 6;
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

      {/* Standard Header Banner */}
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
              Prospect inquiries, document scrutiny, entrance assessments & enrollment
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

          {!isPrincipal && (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 sm:py-2.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <LuPlus className="w-4 h-4" />
              <span>New Inquiry</span>
            </button>
          )}
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

      {/* Standard Search & Filter Toolbar */}
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
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <LuPlus className="w-4 h-4" /> Create Application
            </button>
          </div>
        </div>
      ) : viewMode === 'kanban' ? (
        /* ================= KANBAN PIPELINE VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage, sIdx) => {
            const applicants = stageGroups[stage.id] || [];
            const nextStage = PIPELINE_STAGES[sIdx + 1]?.id || null;

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
                          onClick={() => openApplicantDetails(item)}
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
                            {/* Source pill */}
                            <span className="px-1.5 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-100 font-medium">
                              {item.lead_source || 'Walk-in'}
                            </span>

                            {/* Transport pill */}
                            {item.with_transport && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-medium flex items-center gap-1">
                                <LuBus className="w-2.5 h-2.5" /> Bus
                              </span>
                            )}

                            {/* Docs progress */}
                            <span
                              className={`px-1.5 py-0.5 rounded font-medium ${
                                docInfo.percent === 100
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              Docs: {docInfo.verified}/{docInfo.total}
                            </span>
                          </div>

                          {/* Assessment / Test status if present */}
                          {item.test_score && (
                            <div className="text-[10px] text-primary-700 font-semibold bg-primary-50/70 px-2 py-1 rounded-md border border-primary-100 flex items-center justify-between">
                              <span>Test: {item.test_score}</span>
                              <span className="text-[9px] uppercase tracking-wider">{item.test_status}</span>
                            </div>
                          )}

                          {/* Bottom Action Row */}
                          <div
                            className="pt-1.5 border-t border-slate-100 flex items-center justify-between"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handlePrintSlip(item)}
                              title="Print Application Summary"
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                            >
                              <LuPrinter className="w-3.5 h-3.5" />
                            </button>

                            {/* Quick Next Stage Action Button */}
                            {!isPrincipal && (
                              stage.id === 'Fee Paid' ? (
                                <button
                                  onClick={() => openApplicantDetails(item, 'enroll')}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <LuGraduationCap className="w-3 h-3" /> Enroll
                                </button>
                              ) : nextStage ? (
                                <button
                                  onClick={() => handleQuickAdvance(item, nextStage)}
                                  className="px-2 py-1 bg-slate-100 hover:bg-primary-600 hover:text-white text-slate-700 rounded-lg text-[10px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Advance</span>
                                  <LuChevronRight className="w-3 h-3" />
                                </button>
                              ) : null
                            )}
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
                  <th className="px-5 py-3.5">Lead Inflow</th>
                  <th className="px-5 py-3.5">Pipeline Stage</th>
                  <th className="px-5 py-3.5">Docs & Assessment</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredApplicants.map((item) => {
                  const docInfo = getDocVerifiedCount(item);
                  return (
                    <tr
                      key={item.id}
                      onClick={() => openApplicantDetails(item)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-800 text-sm group-hover:text-primary-600 transition-colors">
                          {item.first_name} {item.last_name || ''}
                        </div>
                        <div className="text-[11px] text-primary-700 font-mono font-bold">
                          {item.application_number}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-800">
                          {item.school_class?.name || 'Class ' + (item.school_class_id || '')}
                        </span>
                        <div className="text-[11px] text-slate-400">{item.academic_year}</div>
                      </td>

                      <td className="px-5 py-4 space-y-0.5">
                        <div className="font-semibold text-slate-800">{item.guardian_name}</div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-mono">
                          <LuPhone className="w-3 h-3 text-slate-400" />
                          <span>{item.guardian_phone}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {item.lead_source || 'Walk-in'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-block ${
                            item.status === 'Enrolled'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : item.status === 'Fee Paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : item.status === 'Offer Extended' || item.status === 'Approved'
                              ? 'bg-primary-100 text-primary-800 border-primary-300'
                              : item.status === 'Assessment/Interview'
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : item.status === 'Document Review' || item.status === 'Under Review'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : item.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-primary-50 text-primary-700 border-primary-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-slate-700 text-xs font-semibold">
                          Docs: {docInfo.verified}/{docInfo.total} verified
                        </div>
                        {item.test_score && (
                          <div className="text-[11px] text-primary-600 font-medium">
                            Test: {item.test_score}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handlePrintSlip(item)}
                            title="Print Application Slip"
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <LuPrinter className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openApplicantDetails(item, 'overview')}
                            className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <LuEye className="w-3.5 h-3.5" /> View Process
                          </button>
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

      {/* ========================================================= */}
      {/* DETAILED 6-STAGE APPLICANT PROCESS MODAL / DRAWER */}
      {/* ========================================================= */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full my-4 sm:my-8 overflow-hidden animate-scale-up flex flex-col max-h-[92vh]">
            {/* Header Banner */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center shrink-0">
                  <LuGraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                      {selectedApplicant.first_name} {selectedApplicant.last_name || ''}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary-50 text-primary-700 border border-primary-200">
                      {selectedApplicant.application_number}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Target: {selectedApplicant.school_class?.name || 'Class ' + (selectedApplicant.school_class_id || '')} • Academic Session {selectedApplicant.academic_year || '2026-2027'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrintSlip(selectedApplicant)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LuPrinter className="w-3.5 h-3.5" /> Print Slip
                </button>
                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <LuX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* End-to-End Pipeline Progress Stepper */}
            <div className="bg-slate-50 border-b border-slate-200 p-3 sm:p-4 overflow-x-auto shrink-0">
              <div className="flex items-center justify-between min-w-[620px] gap-2">
                {PIPELINE_STAGES.map((stg, idx) => {
                  const currentNorm = normalizeStage(selectedApplicant.status);
                  const isCurrent = currentNorm === stg.id;
                  const currentIdx = PIPELINE_STAGES.findIndex((s) => s.id === currentNorm);
                  const isPassed = currentIdx > idx || selectedApplicant.status === 'Enrolled';

                  return (
                    <div key={stg.id} className="flex items-center gap-2 flex-1">
                      <button
                        onClick={() => {
                          if (stg.id === 'Document Review') setDetailActiveTab('docs');
                          else if (stg.id === 'Assessment/Interview') setDetailActiveTab('assessment');
                          else if (stg.id === 'Offer Extended') setDetailActiveTab('fee');
                          else if (stg.id === 'Fee Paid') setDetailActiveTab('fee');
                          else if (stg.id === 'Enrolled') setDetailActiveTab('enroll');
                          else setDetailActiveTab('overview');
                        }}
                        className={`flex items-center gap-2 text-left cursor-pointer transition-all ${
                          isCurrent
                            ? 'scale-105'
                            : 'opacity-85 hover:opacity-100'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            isCurrent
                              ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25'
                              : isPassed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {isPassed ? <LuCheck className="w-4 h-4" /> : idx + 1}
                        </div>
                        <div className="leading-tight">
                          <span
                            className={`text-[11px] font-bold block ${
                              isCurrent ? 'text-primary-700' : isPassed ? 'text-emerald-700' : 'text-slate-600'
                            }`}
                          >
                            {stg.name}
                          </span>
                          <span className="text-[9px] text-slate-400 block truncate max-w-[100px]">
                            {stg.desc}
                          </span>
                        </div>
                      </button>

                      {idx < PIPELINE_STAGES.length - 1 && (
                        <LuChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0 mx-1" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Tabs for Modal View */}
            <div className="flex border-b border-slate-200 px-4 sm:px-6 bg-white gap-2 sm:gap-6 text-xs font-bold text-slate-600 overflow-x-auto shrink-0">
              <button
                onClick={() => setDetailActiveTab('overview')}
                className={`py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  detailActiveTab === 'overview'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                <LuFileText className="w-3.5 h-3.5" /> Candidate Bio & Inquiry
              </button>
              <button
                onClick={() => setDetailActiveTab('docs')}
                className={`py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  detailActiveTab === 'docs'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                <LuFileCheck className="w-3.5 h-3.5" /> Document Checklist
              </button>
              <button
                onClick={() => setDetailActiveTab('assessment')}
                className={`py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  detailActiveTab === 'assessment'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                <LuClipboardCheck className="w-3.5 h-3.5" /> Test & Interview
              </button>
              <button
                onClick={() => setDetailActiveTab('fee')}
                className={`py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  detailActiveTab === 'fee'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                <LuCreditCard className="w-3.5 h-3.5" /> Offer & Fee Payment
              </button>
              <button
                onClick={() => setDetailActiveTab('enroll')}
                className={`py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  detailActiveTab === 'enroll'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                <LuGraduationCap className="w-3.5 h-3.5" /> Final Enrollment
              </button>
              <button
                onClick={() => setDetailActiveTab('timeline')}
                className={`py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  detailActiveTab === 'timeline'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                <LuClock className="w-3.5 h-3.5" /> Stage Audit Trail
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-700">
              {/* TAB 1: OVERVIEW & CANDIDATE BIO */}
              {detailActiveTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Candidate Bio
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Full Name</span>
                          <span className="font-bold text-slate-800">
                            {selectedApplicant.first_name} {selectedApplicant.last_name}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Gender & DOB</span>
                          <span className="font-semibold text-slate-700">
                            {selectedApplicant.gender || '—'} • {selectedApplicant.date_of_birth ? new Date(selectedApplicant.date_of_birth).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Applying Class</span>
                          <span className="font-bold text-primary-700">
                            {selectedApplicant.school_class?.name || 'Class ' + selectedApplicant.school_class_id}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Academic Session</span>
                          <span className="font-semibold text-slate-700">{selectedApplicant.academic_year}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Guardian & Contact
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Guardian Name</span>
                          <span className="font-bold text-slate-800">
                            {selectedApplicant.guardian_name} ({selectedApplicant.guardian_relation || 'Parent'})
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Primary Phone</span>
                          <a
                            href={`tel:${selectedApplicant.guardian_phone}`}
                            className="font-bold text-primary-600 hover:underline flex items-center gap-1 font-mono"
                          >
                            <LuPhone className="w-3 h-3" /> {selectedApplicant.guardian_phone}
                          </a>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-400 block text-[11px]">Email Address</span>
                          <span className="font-medium text-slate-700">{selectedApplicant.guardian_email || 'Not provided'}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-400 block text-[11px]">Residential Address</span>
                          <span className="font-medium text-slate-700">{selectedApplicant.address || 'Not recorded'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Previous School</span>
                      <span className="font-semibold text-slate-800 text-xs">
                        {selectedApplicant.previous_school || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Previous Academic Score</span>
                      <span className="font-semibold text-primary-600 text-xs">
                        {selectedApplicant.previous_score || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">School Bus Transport</span>
                      <span className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                        <LuBus className="w-3.5 h-3.5 text-amber-600" />
                        {selectedApplicant.with_transport ? 'Opted (Transport fee applicable)' : 'Self Commute'}
                      </span>
                    </div>
                  </div>

                  {/* Stage Advancement Action Box */}
                  {!isPrincipal && (
                    <div className="p-4 rounded-xl bg-primary-50/70 border border-primary-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-primary-950 text-xs">Current Admission Stage</h4>
                        <p className="text-[11px] text-primary-800 mt-0.5">
                          Candidate is currently in <b>{selectedApplicant.status}</b> stage. Advance to Document Review or update status.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setDetailActiveTab('docs');
                            handleSaveStageData('Document Review');
                          }}
                          className="px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-xs shadow-md shadow-primary-500/20 flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Move to Document Verification</span>
                          <LuArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: DOCUMENT CHECKLIST VERIFICATION */}
              {detailActiveTab === 'docs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-amber-50/60 border border-amber-200 p-3.5 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <LuFileCheck className="w-5 h-5 text-amber-600 shrink-0" />
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs">Document Verification Checklist</h4>
                        <p className="text-[11px] text-slate-500">
                          Verify applicant credentials and original records before scheduling entrance exam.
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      {getDocVerifiedCount(selectedApplicant).percent}% Complete
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {STANDARD_DOCS.map((doc) => {
                      const currentVal = stageFormData.documents?.[doc.key] || 'pending';
                      return (
                        <div
                          key={doc.key}
                          className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-2 shadow-2xs"
                        >
                          <div>
                            <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                              {doc.label}
                              {doc.required && <span className="text-red-500 text-xs">*</span>}
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Status:{' '}
                              <b
                                className={
                                  currentVal === 'verified'
                                    ? 'text-emerald-600'
                                    : currentVal === 'missing'
                                    ? 'text-rose-600'
                                    : 'text-amber-600'
                                }
                              >
                                {currentVal.toUpperCase()}
                              </b>
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const newDocs = { ...stageFormData.documents, [doc.key]: 'verified' };
                                setStageFormData({ ...stageFormData, documents: newDocs });
                              }}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                currentVal === 'verified'
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Verified
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const newDocs = { ...stageFormData.documents, [doc.key]: 'pending' };
                                setStageFormData({ ...stageFormData, documents: newDocs });
                              }}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                currentVal === 'pending'
                                  ? 'bg-amber-500 text-white shadow-2xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Pending
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const newDocs = { ...stageFormData.documents, [doc.key]: 'missing' };
                                setStageFormData({ ...stageFormData, documents: newDocs });
                              }}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                currentVal === 'missing'
                                  ? 'bg-rose-500 text-white shadow-2xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Waived
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {!isPrincipal && (
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleSaveStageData()}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Save Document Status
                      </button>

                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => {
                          setDetailActiveTab('assessment');
                          handleSaveStageData('Assessment/Interview');
                        }}
                        className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuCheck className="w-4 h-4" />}
                        <span>Verify & Schedule Assessment</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ASSESSMENT & INTERVIEW */}
              {detailActiveTab === 'assessment' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Entrance Test Card */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                          <LuClipboardCheck className="w-4 h-4 text-primary-600" />
                          Written Aptitude Assessment
                        </h4>
                        <span className="text-[10px] font-bold text-slate-500">Class Intake Exam</span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Assessment Test Date
                        </label>
                        <input
                          type="date"
                          value={stageFormData.test_date}
                          onChange={(e) => setStageFormData({ ...stageFormData, test_date: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-primary-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Marks Obtained / Cutoff
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 88/100"
                            value={stageFormData.test_score}
                            onChange={(e) => setStageFormData({ ...stageFormData, test_score: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Test Result Status
                          </label>
                          <select
                            value={stageFormData.test_status}
                            onChange={(e) => setStageFormData({ ...stageFormData, test_status: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-primary-500 cursor-pointer"
                          >
                            <option value="Pending">Pending / Scheduled</option>
                            <option value="Cleared">Cleared</option>
                            <option value="Failed">Not Cleared</option>
                            <option value="Waived">Waived / Direct Intake</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Principal / Panel Interview Card */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                          <LuUserCheck className="w-4 h-4 text-primary-600" />
                          Candidate & Parent Interaction
                        </h4>
                        <span className="text-[10px] font-bold text-slate-500">Interview Stage</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Interview Date & Time
                          </label>
                          <input
                            type="datetime-local"
                            value={stageFormData.interview_date}
                            onChange={(e) => setStageFormData({ ...stageFormData, interview_date: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Interview Recommendation
                          </label>
                          <select
                            value={stageFormData.interview_result}
                            onChange={(e) => setStageFormData({ ...stageFormData, interview_result: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-primary-500 cursor-pointer"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Recommended">Recommended</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Not Recommended">Not Recommended</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Interviewer Panel / Remarks
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Principal Dr. Sharma & Vice Principal"
                          value={stageFormData.interview_interviewer}
                          onChange={(e) => setStageFormData({ ...stageFormData, interview_interviewer: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-primary-500"
                        />
                      </div>

                      <div>
                        <textarea
                          rows={2}
                          placeholder="Interview feedback, strengths, and observations..."
                          value={stageFormData.interview_notes}
                          onChange={(e) => setStageFormData({ ...stageFormData, interview_notes: e.target.value })}
                          className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:border-primary-500"
                        />
                      </div>
                    </div>
                  </div>

                  {!isPrincipal && (
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleSaveStageData()}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Save Assessment Records
                      </button>

                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => {
                          setDetailActiveTab('fee');
                          handleSaveStageData('Offer Extended');
                        }}
                        className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuAward className="w-4 h-4" />}
                        <span>Approve & Extend Admission Offer</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: OFFER & FEE PAYMENT */}
              {detailActiveTab === 'fee' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-primary-200 bg-primary-50/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <LuAward className="w-5 h-5 text-primary-600" />
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">Admission Offer Letter</h4>
                          <p className="text-[11px] text-slate-500">Formal seat reservation issued to parent.</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-100 text-primary-800">
                        Provisional Offer
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Offer Issued Date
                        </label>
                        <input
                          type="date"
                          value={stageFormData.offer_date}
                          onChange={(e) => setStageFormData({ ...stageFormData, offer_date: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Offer Valid Until (Deadline)
                        </label>
                        <input
                          type="date"
                          value={stageFormData.offer_valid_until}
                          onChange={(e) => setStageFormData({ ...stageFormData, offer_valid_until: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:border-primary-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Admission / Seat Confirmation Fee Card */}
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <LuCreditCard className="w-5 h-5 text-emerald-600" />
                        <div>
                          <h4 className="font-bold text-emerald-950 text-xs">Admission Fee Confirmation</h4>
                          <p className="text-[11px] text-emerald-700">Record registration / admission fee settlement.</p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          stageFormData.admission_fee_status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {stageFormData.admission_fee_status === 'Paid' ? 'PAID IN FULL' : 'FEE PENDING'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Admission Fee Amount (₹)
                        </label>
                        <input
                          type="number"
                          value={stageFormData.admission_fee}
                          onChange={(e) => setStageFormData({ ...stageFormData, admission_fee: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-emerald-700 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Payment Mode
                        </label>
                        <select
                          value={stageFormData.admission_fee_mode}
                          onChange={(e) => setStageFormData({ ...stageFormData, admission_fee_mode: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:border-primary-500 cursor-pointer"
                        >
                          <option value="UPI">UPI / QR Code</option>
                          <option value="Cash">Cash at Counter</option>
                          <option value="Netbanking">Netbanking / NEFT</option>
                          <option value="Cheque">Bank Cheque</option>
                          <option value="Card">Debit / Credit Card</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Receipt / Transaction Ref #
                        </label>
                        <input
                          type="text"
                          value={stageFormData.admission_fee_receipt}
                          onChange={(e) => setStageFormData({ ...stageFormData, admission_fee_receipt: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-mono text-xs font-semibold focus:outline-none focus:border-primary-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs">
                        <input
                          type="checkbox"
                          checked={stageFormData.admission_fee_status === 'Paid'}
                          onChange={(e) =>
                            setStageFormData({
                              ...stageFormData,
                              admission_fee_status: e.target.checked ? 'Paid' : 'Pending',
                            })
                          }
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                        />
                        <span>Mark Admission Fee as Settled & Paid</span>
                      </label>
                    </div>
                  </div>

                  {!isPrincipal && (
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleSaveStageData()}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Save Payment Records
                      </button>

                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => {
                          const updatedData = {
                            ...stageFormData,
                            admission_fee_status: 'Paid',
                            status: 'Fee Paid',
                          };
                          setStageFormData(updatedData);
                          setDetailActiveTab('enroll');
                          handleSaveStageData('Fee Paid');
                        }}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuCheck className="w-4 h-4" />}
                        <span>Confirm Fee & Proceed to Final Enrollment</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: FINAL CLASSROOM ENROLLMENT */}
              {detailActiveTab === 'enroll' && (
                <div className="space-y-4">
                  {selectedApplicant.status === 'Enrolled' ? (
                    <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                      <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                        <LuCheck className="w-6 h-6" />
                      </div>
                      <h4 className="font-extrabold text-base text-emerald-900">Applicant Officially Enrolled!</h4>
                      <p className="text-xs text-emerald-700 max-w-md mx-auto">
                        This candidate has been officially added to the active student roster. Class fee structure installments and parent login access are already initialized.
                      </p>
                      <button
                        onClick={() => handlePrintSlip(selectedApplicant)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
                      >
                        <LuPrinter className="w-4 h-4" /> Print Enrollment Admission Pass
                      </button>
                    </div>
                  ) : isPrincipal ? (
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                      <LuGraduationCap className="w-8 h-8 text-primary-600 mx-auto" />
                      <h4 className="font-bold text-slate-800 text-xs">Enrollment Operations</h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Classroom roll allocation and official student conversion are executed by the Admissions Officer or School Administrator.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleExecuteEnroll} className="space-y-4">
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                        <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                          <LuGraduationCap className="w-4 h-4 text-emerald-600" />
                          Classroom Section & Roll Allocation
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Classroom Roll Number
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 101"
                              value={stageFormData.roll_number}
                              onChange={(e) => setStageFormData({ ...stageFormData, roll_number: e.target.value })}
                              className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Target Class / Grade
                            </label>
                            <input
                              type="text"
                              disabled
                              value={selectedApplicant.school_class?.name || 'Class ' + selectedApplicant.school_class_id}
                              className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-700 cursor-not-allowed"
                            />
                          </div>
                        </div>

                        {/* Transport Option Toggle */}
                        <div className="p-3 rounded-xl border border-slate-200 bg-white">
                          <label className="flex items-start gap-2.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={stageFormData.with_transport}
                              onChange={(e) => setStageFormData({ ...stageFormData, with_transport: e.target.checked })}
                              className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                            />
                            <div>
                              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <LuBus className="w-3.5 h-3.5 text-amber-600" />
                                Opt for School Bus / Vehicle Route Transport
                              </span>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                If selected, transport fees will be distributed across student quarterly installments.
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-primary-50/70 border border-primary-200 text-primary-950 space-y-1.5">
                        <div className="flex items-center gap-2 font-bold text-xs text-primary-950">
                          <LuReceipt className="w-4 h-4 text-primary-600 shrink-0" />
                          <span>Automated Account & Fee Structure Provisioning</span>
                        </div>
                        <p className="text-[11px] text-primary-800 leading-relaxed">
                          Enrolling will automatically:
                        </p>
                        <ul className="text-[11px] text-primary-800 list-disc list-inside space-y-0.5 ml-1">
                          <li>Assign unique permanent Admission ID (e.g. STU-2026-XXX)</li>
                          <li>Create student roster record in active academic directory</li>
                          <li>Generate secure Parent Portal credentials (phone + temporary password)</li>
                          <li>Initialize standard fee schedule and quarterly ledger installments</li>
                        </ul>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setSelectedApplicant(null)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuGraduationCap className="w-4 h-4" />}
                          <span>Confirm Enrollment & Generate Parent Credentials</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 6: TIMELINE & AUDIT LOG */}
              {detailActiveTab === 'timeline' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 text-xs">Admission Process History & Audit Trail</h4>
                  {(!selectedApplicant.pipeline_notes || selectedApplicant.pipeline_notes.length === 0) ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No prior timeline logs recorded for this candidate.
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      {selectedApplicant.pipeline_notes.map((log, lIdx) => (
                        <div key={lIdx} className="relative group">
                          <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-primary-600 border-2 border-white shadow-xs"></div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-xs text-slate-800">{log.action || log.stage}</span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {log.time ? new Date(log.time).toLocaleString() : 'Recent'}
                              </span>
                            </div>
                            {log.notes && <p className="text-[11px] text-slate-600 mt-1">{log.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* NEW ADMISSION INQUIRY REGISTRATION MODAL */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full my-4 sm:my-8 overflow-hidden animate-scale-up">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <LuPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 leading-tight">New Admission Application Inquiry</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Capture prospective student lead into the intake pipeline</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-4 sm:p-6 space-y-4 max-h-[78vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newAppForm.first_name}
                    onChange={(e) => setNewAppForm({ ...newAppForm, first_name: e.target.value })}
                    placeholder="e.g. Aarav"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newAppForm.last_name}
                    onChange={(e) => setNewAppForm({ ...newAppForm, last_name: e.target.value })}
                    placeholder="e.g. Sharma"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Applying Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={newAppForm.school_class_id}
                    onChange={(e) => setNewAppForm({ ...newAppForm, school_class_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-semibold cursor-pointer"
                  >
                    <option value="">Select Grade</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Session</label>
                  <input
                    type="text"
                    value={newAppForm.academic_year}
                    onChange={(e) => setNewAppForm({ ...newAppForm, academic_year: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Source</label>
                  <select
                    value={newAppForm.lead_source}
                    onChange={(e) => setNewAppForm({ ...newAppForm, lead_source: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-semibold cursor-pointer"
                  >
                    <option value="Walk-in">Walk-in Inquiry</option>
                    <option value="Website">Website Portal</option>
                    <option value="Referral">Alumni / Word of Mouth</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Phone">Telephone Inquiry</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={newAppForm.date_of_birth}
                    onChange={(e) => setNewAppForm({ ...newAppForm, date_of_birth: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={newAppForm.gender}
                    onChange={(e) => setNewAppForm({ ...newAppForm, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-semibold cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Parent / Guardian Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newAppForm.guardian_name}
                    onChange={(e) => setNewAppForm({ ...newAppForm, guardian_name: e.target.value })}
                    placeholder="e.g. Vikram Sharma"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newAppForm.guardian_phone}
                    onChange={(e) => setNewAppForm({ ...newAppForm, guardian_phone: e.target.value })}
                    placeholder="e.g. 9820112233"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-mono font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Previous School Name</label>
                  <input
                    type="text"
                    value={newAppForm.previous_school}
                    onChange={(e) => setNewAppForm({ ...newAppForm, previous_school: e.target.value })}
                    placeholder="e.g. St. Joseph Convent"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Previous Score / Grade</label>
                  <input
                    type="text"
                    value={newAppForm.previous_score}
                    onChange={(e) => setNewAppForm({ ...newAppForm, previous_score: e.target.value })}
                    placeholder="e.g. 91% or Grade A"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
                  />
                </div>
              </div>

              {/* Transport preference checkbox */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAppForm.with_transport}
                    onChange={(e) => setNewAppForm({ ...newAppForm, with_transport: e.target.checked })}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <LuBus className="w-3.5 h-3.5 text-amber-600" />
                      Opt for School Bus Route Commute
                    </span>
                    <p className="text-[11px] text-slate-500">
                      If selected, annual vehicle transport fee will be added to candidate installments.
                    </p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Counselor Remarks & Notes</label>
                <textarea
                  rows={2}
                  value={newAppForm.remarks}
                  onChange={(e) => setNewAppForm({ ...newAppForm, remarks: e.target.value })}
                  placeholder="Inquiry notes, parent interaction observations..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuCheck className="w-4 h-4" />}
                  <span>Register Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Modal for Newly Enrolled Student Parent */}
      <CredentialsModal
        isOpen={!!credentialsModalData}
        onClose={() => setCredentialsModalData(null)}
        credentials={credentialsModalData}
        title="Enrolled Student Parent Login Access"
      />
    </div>
  );
}
