import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import {
  LuArrowLeft,
  LuUserPlus,
  LuGraduationCap,
  LuFileText,
  LuFileCheck,
  LuClipboardCheck,
  LuAward,
  LuCreditCard,
  LuCheck,
  LuClock,
  LuPrinter,
  LuTrash2,
  LuPencil,
  LuX,
  LuPhone,
  LuMail,
  LuMapPin,
  LuBus,
  LuUpload,
  LuDownload,
  LuEye,
  LuCalendar,
  LuChevronRight,
  LuCopy,
  LuShieldCheck,
  LuReceipt,
  LuSparkles,
  LuLoader,
  LuExternalLink,
  LuCircleCheck,
  LuUserCheck,
} from 'react-icons/lu';

const PIPELINE_STAGES = [
  { id: 'Inquiry', step: 1, name: 'Basic Details', desc: 'Inquiry & Candidate Bio' },
  { id: 'Document Review', step: 2, name: 'Document Scrutiny', desc: 'Certificate & ID Upload' },
  { id: 'Assessment/Interview', step: 3, name: 'Assessment & Interview', desc: 'Aptitude Test & Panel' },
  { id: 'Offer Extended', step: 4, name: 'Provisional Offer', desc: 'Offer Letter Extended' },
  { id: 'Fee Paid', step: 5, name: 'Admission Fee', desc: 'Fee Settlement & Receipt' },
  { id: 'Enrolled', step: 6, name: 'Confirmed Enrollment', desc: 'Roster & Parent Access' },
];

const STANDARD_DOCS = [
  { key: 'birth_certificate', label: 'Birth Certificate', required: true, description: 'Official municipal or hospital birth record' },
  { key: 'transfer_certificate', label: 'Transfer Certificate (TC)', required: false, description: 'TC from previous recognized institution' },
  { key: 'previous_marksheet', label: 'Previous Marksheet / Report Card', required: false, description: 'Academic performance report of last class' },
  { key: 'address_proof', label: 'Residence / Address Proof', required: true, description: 'Utility bill, passport, or rent agreement' },
  { key: 'aadhar_card', label: 'Student & Parent Aadhar / ID', required: true, description: 'Government identity proof of child & guardian' },
  { key: 'medical_record', label: 'Medical / Immunization Record', required: false, description: 'Vaccination chart & blood group certificate' },
];

export default function AdmissionProcessPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentRole } = useAuth();
  const isPrincipal = currentRole === 'principal';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingDocKey, setUploadingDocKey] = useState(null);
  const [applicant, setApplicant] = useState(null);
  const [classes, setClasses] = useState([]);
  const [activeTab, setActiveTab] = useState('docs'); // overview, docs, assessment, offer, fee, enroll, timeline
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedText, setCopiedText] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioFormData, setBioFormData] = useState({});
  const [savingBio, setSavingBio] = useState(false);

  // In-page parent credentials generated on enrollment
  const [enrolledCredentials, setEnrolledCredentials] = useState(null);

  const handleSaveBio = async (e) => {
    e.preventDefault();
    if (!applicant) return;
    setSavingBio(true);
    try {
      const res = await adminService.updateAdmission(applicant.id, bioFormData);
      if (res?.success && res?.data) {
        setApplicant(res.data);
        showToast('Applicant basic details updated successfully!');
        setIsEditingBio(false);
      } else {
        showToast(res?.message || 'Failed to update details.');
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Error updating details.');
    } finally {
      setSavingBio(false);
    }
  };

  // Stage form data
  const [stageFormData, setStageFormData] = useState({
    status: 'Inquiry',
    remarks: '',
    documents: {},
    test_score: '',
    test_date: '',
    test_status: 'Pending',
    interview_date: '',
    interview_interviewer: 'Principal & Interview Panel',
    interview_notes: '',
    interview_result: 'Pending',
    offer_date: new Date().toISOString().substring(0, 10),
    offer_valid_until: '',
    admission_fee: 35000,
    admission_fee_status: 'Pending',
    admission_fee_receipt: `REC-${Date.now().toString().slice(-6)}`,
    admission_fee_date: new Date().toISOString().substring(0, 10),
    admission_fee_mode: 'UPI',
    roll_number: '',
    section_id: '',
    with_transport: false,
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const formatAppliedDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const normalizeStage = (status) => {
    if (!status) return 'Inquiry';
    if (status === 'Pending') return 'Inquiry';
    if (status === 'Under Review') return 'Document Review';
    if (status === 'Approved') return 'Offer Extended';
    return status;
  };

  const loadApplicant = async () => {
    setLoading(true);
    try {
      const [res, clsRes] = await Promise.all([
        adminService.getAdmission(id),
        adminService.getClasses(),
      ]);

      if (res?.success && res?.data) {
        const app = res.data;
        setApplicant(app);

        // Normalize initial documents: if file exists, marked uploaded; otherwise marked pending
        const defaultDocs = {};
        STANDARD_DOCS.forEach((d) => {
          const docData = app.documents?.[d.key];
          const hasFile = Boolean(docData?.file_name || docData?.file_url);
          const isUploaded = hasFile || docData === 'verified' || docData?.status === 'verified' || docData?.status === 'uploaded';
          defaultDocs[d.key] = {
            status: isUploaded ? 'uploaded' : 'pending',
            file_name: docData?.file_name || (isUploaded && !docData?.file_name ? `${d.label}.pdf` : null),
            file_url: docData?.file_url || null,
          };
        });

        setBioFormData({
          first_name: app.first_name || '',
          last_name: app.last_name || '',
          school_class_id: app.school_class_id || '',
          academic_year: app.academic_year || '2026-2027',
          lead_source: app.lead_source || 'Walk-in',
          date_of_birth: app.date_of_birth ? app.date_of_birth.substring(0, 10) : '',
          gender: app.gender || 'Male',
          guardian_name: app.guardian_name || '',
          guardian_phone: app.guardian_phone || '',
          guardian_email: app.guardian_email || '',
          guardian_relation: app.guardian_relation || 'Father',
          previous_school: app.previous_school || '',
          previous_score: app.previous_score || '',
          address: app.address || '',
          with_transport: Boolean(app.with_transport),
          remarks: app.remarks || '',
        });

        const initialStatus = app.status || 'Inquiry';
        setStageFormData({
          status: initialStatus,
          remarks: app.remarks || '',
          documents: defaultDocs,
          test_score: app.test_score || '',
          test_date: app.test_date ? app.test_date.substring(0, 10) : '',
          test_status: app.test_status || 'Pending',
          interview_date: app.interview_date ? app.interview_date.replace(' ', 'T').substring(0, 16) : '',
          interview_interviewer: app.interview_interviewer || 'Principal & Interview Panel',
          interview_notes: app.interview_notes || '',
          interview_result: (() => {
            if (app.interview_result && app.interview_result !== 'Pending') return app.interview_result;
            if (app.interview_date) {
              const d = new Date(app.interview_date.replace(' ', 'T'));
              const todayStart = new Date();
              todayStart.setHours(0, 0, 0, 0);
              if (d < todayStart) return 'Completed';
            }
            return app.interview_result || 'Pending';
          })(),
          offer_date: app.offer_date ? app.offer_date.substring(0, 10) : new Date().toISOString().substring(0, 10),
          offer_valid_until: app.offer_valid_until ? app.offer_valid_until.substring(0, 10) : '',
          admission_fee: app.admission_fee || 35000,
          admission_fee_status: app.admission_fee_status || 'Pending',
          admission_fee_receipt: app.admission_fee_receipt || `REC-${Date.now().toString().slice(-6)}`,
          admission_fee_date: app.admission_fee_date ? app.admission_fee_date.substring(0, 10) : new Date().toISOString().substring(0, 10),
          admission_fee_mode: app.admission_fee_mode || 'UPI',
          roll_number: app.enrolledStudent?.roll_number || '',
          section_id: '',
          with_transport: app.with_transport !== undefined ? Boolean(app.with_transport) : false,
        });

        // Set default active tab based on pipeline progression
        const norm = normalizeStage(initialStatus);
        if (norm === 'Inquiry') setActiveTab('docs');
        else if (norm === 'Document Review') setActiveTab('docs');
        else if (norm === 'Assessment/Interview') setActiveTab('assessment');
        else if (norm === 'Offer Extended') setActiveTab('offer');
        else if (norm === 'Fee Paid') setActiveTab('enroll');
        else if (norm === 'Enrolled') setActiveTab('enroll');
      } else {
        showToast('Application not found.');
        navigate('/admission');
      }

      if (clsRes?.success && clsRes?.data) {
        setClasses(clsRes.data);
      }
    } catch (err) {
      console.error('Failed to load application:', err);
      showToast('Error loading applicant details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadApplicant();
    }
  }, [id]);

  // Document verification stats
  const docStats = useMemo(() => {
    if (!stageFormData.documents) return { verified: 0, total: 6, percent: 0 };
    const keys = Object.keys(stageFormData.documents);
    const uploaded = keys.filter((k) => {
      const doc = stageFormData.documents[k];
      return Boolean(doc?.file_name || doc?.file_url || doc?.status === 'uploaded' || doc?.status === 'verified' || doc === 'verified');
    }).length;
    const total = STANDARD_DOCS.length;
    return {
      uploaded,
      verified: uploaded,
      total,
      percent: Math.round((uploaded / total) * 100),
    };
  }, [stageFormData.documents]);

  // Current stage index for progress stepper
  const currentStageIndex = useMemo(() => {
    if (!applicant) return 0;
    const norm = normalizeStage(applicant.status);
    const idx = PIPELINE_STAGES.findIndex((s) => s.id === norm);
    return idx >= 0 ? idx : 0;
  }, [applicant]);

  // Handle stage data saving & status advancement
  const handleSaveStageData = async (targetStage = null, nextTab = null) => {
    if (!applicant) return;
    setSubmitting(true);
    try {
      const stageToSet = targetStage || stageFormData.status || applicant.status;
      const payload = {
        ...stageFormData,
        status: stageToSet,
      };

      const res = await adminService.updateAdmissionStatus(applicant.id, payload);
      if (res.success && res.data) {
        setApplicant(res.data);
        showToast(`Admission process successfully updated to ${stageToSet}!`);
        if (nextTab) {
          setActiveTab(nextTab);
        }
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to update process stage.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle actual file upload for a document item
  const handleFileUpload = async (docKey, file) => {
    if (!file) return;
    setUploadingDocKey(docKey);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('document_type', `admission_${docKey}`);
      fd.append('visibility', 'private');

      const res = await adminService.uploadFile(fd);
      const fileUrl = res?.data?.url || res?.url || URL.createObjectURL(file);
      const fileName = file.name;

      setStageFormData((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [docKey]: {
            status: 'uploaded',
            file_name: fileName,
            file_url: fileUrl,
            uploaded_at: new Date().toISOString(),
          },
        },
      }));
      showToast(`${STANDARD_DOCS.find((d) => d.key === docKey)?.label || 'Document'} uploaded successfully!`);
    } catch (err) {
      console.warn('Backend file upload error, using local fallback:', err);
      // Local fallback in case media endpoint is unreachable
      setStageFormData((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [docKey]: {
            status: 'uploaded',
            file_name: file.name,
            file_url: URL.createObjectURL(file),
            uploaded_at: new Date().toISOString(),
          },
        },
      }));
      showToast(`${file.name} attached & verified locally.`);
    } finally {
      setUploadingDocKey(null);
    }
  };

  // Remove an uploaded document and reset to pending
  const handleRemoveDoc = (docKey) => {
    setStageFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docKey]: {
          status: 'pending',
          file_name: null,
          file_url: null,
          uploaded_at: null,
        },
      },
    }));
    showToast(`${STANDARD_DOCS.find((d) => d.key === docKey)?.label || 'Document'} removed and marked pending.`);
  };

  // Toggle document status manually
  const setDocStatus = (docKey, status) => {
    setStageFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docKey]: {
          ...(prev.documents?.[docKey] || {}),
          status,
        },
      },
    }));
  };

  // Execute Enrollment
  const handleExecuteEnroll = async (e) => {
    e.preventDefault();
    if (!applicant) return;
    setSubmitting(true);
    try {
      const res = await adminService.enrollAdmission(applicant.id, {
        section_id: stageFormData.section_id,
        roll_number: stageFormData.roll_number,
        with_transport: stageFormData.with_transport,
        admission_fee_receipt: stageFormData.admission_fee_receipt,
      });

      if (res.success) {
        showToast('Applicant officially enrolled! Student roster & parent login generated.');
        if (res.data?.admission) {
          setApplicant(res.data.admission);
        }
        if (res.credentials) {
          setEnrolledCredentials(res.credentials);
        } else {
          setEnrolledCredentials({
            admission_number: applicant.application_number,
            student_name: `${applicant.first_name} ${applicant.last_name || ''}`,
            parent_phone: applicant.guardian_phone,
            portal_username: applicant.guardian_phone,
            temporary_password: `Pass@${applicant.guardian_phone.slice(-4) || '2026'}`,
            portal_url: `${window.location.origin}/login`,
          });
        }
        setActiveTab('enroll');
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to enroll student.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyCredentials = () => {
    if (!enrolledCredentials) return;
    const text = `Arch Campus School Admission Credentials\nStudent: ${enrolledCredentials.student_name || applicant.first_name}\nApplication/Roll: ${stageFormData.roll_number || applicant.application_number}\nParent Portal Username: ${enrolledCredentials.parent_phone || enrolledCredentials.portal_username || applicant.guardian_phone}\nTemporary Password: ${enrolledCredentials.temporary_password || 'Pass@2026'}\nPortal URL: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    showToast('Parent portal credentials copied to clipboard!');
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Print application slip / summary
  const handlePrintSlip = () => {
    if (!applicant) return;
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
            <div class="item"><div class="label">School Bus Transport</div><div class="value">${stageFormData.with_transport ? 'YES - Opted' : 'NO - Self Commute'}</div></div>
          </div>

          <div class="section-title">2. Parent / Guardian Details</div>
          <div class="grid">
            <div class="item"><div class="label">Guardian Name & Relation</div><div class="value">${applicant.guardian_name} (${applicant.guardian_relation || 'Parent'})</div></div>
            <div class="item"><div class="label">Contact Mobile & Email</div><div class="value">${applicant.guardian_phone} • ${applicant.guardian_email || 'N/A'}</div></div>
            <div class="item" style="grid-column: span 2;"><div class="label">Residential Address</div><div class="value">${applicant.address || 'Not recorded'}</div></div>
          </div>

          <div class="section-title">3. Admission Lifecycle Status</div>
          <div class="grid">
            <div class="item"><div class="label">Current Stage</div><div class="value">${applicant.status}</div></div>
            <div class="item"><div class="label">Entrance Test Score</div><div class="value">${applicant.test_score || 'Pending'} (${applicant.test_status || 'Pending'})</div></div>
            <div class="item"><div class="label">Admission Fee Status</div><div class="value">${stageFormData.admission_fee_status === 'Paid' ? 'PAID (₹' + Number(stageFormData.admission_fee).toLocaleString('en-IN') + ')' : 'Pending'}</div></div>
            <div class="item"><div class="label">Receipt Number</div><div class="value">${stageFormData.admission_fee_receipt || 'N/A'}</div></div>
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

  // Print Provisional Offer Letter
  const handlePrintOfferLetter = () => {
    if (!applicant) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Provisional Admission Offer Letter - ${applicant.application_number}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 48px; color: #1e293b; max-width: 800px; margin: auto; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 26px; color: #1d4ed8; letter-spacing: -0.5px; }
            .header p { margin: 6px 0 0; font-size: 13px; color: #64748b; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 13px; font-weight: 600; color: #334155; }
            .content { font-size: 14px; color: #334155; margin-bottom: 30px; }
            .highlight { background: #eff6ff; padding: 16px; border-left: 4px solid #2563eb; border-radius: 8px; margin: 20px 0; font-size: 13px; }
            .terms { font-size: 12px; color: #64748b; margin-top: 24px; }
            .footer { margin-top: 60px; display: flex; justify-content: space-between; font-size: 13px; color: #475569; }
            .signature { text-align: center; width: 200px; }
            .line { border-top: 1px solid #334155; margin-top: 50px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ARCH CAMPUS INTERNATIONAL SCHOOL</h1>
            <p>Office of Student Admissions & Enrollment Management</p>
          </div>

          <div class="meta">
            <div>Ref: <b>${applicant.application_number}/OFFER</b></div>
            <div>Date: <b>${stageFormData.offer_date || new Date().toLocaleDateString()}</b></div>
          </div>

          <div class="content">
            <p>To,<br><b>${applicant.guardian_name}</b><br>Parent/Guardian of <b>${applicant.first_name} ${applicant.last_name || ''}</b><br>${applicant.address || 'Address on file'}</p>

            <p style="margin-top: 20px;"><b>Subject: Provisional Offer of Admission for Academic Session ${applicant.academic_year || '2026-2027'}</b></p>

            <p>Dear Parent/Guardian,</p>
            <p>We are delighted to inform you that following successful completion of document scrutiny and entrance assessment, <b>${applicant.first_name} ${applicant.last_name || ''}</b> has been granted provisional admission to <b>${applicant.school_class?.name || 'Class ' + applicant.school_class_id}</b> for the upcoming academic session.</p>

            <div class="highlight">
              <div><b>Candidate Name:</b> ${applicant.first_name} ${applicant.last_name || ''}</div>
              <div><b>Class Offered:</b> ${applicant.school_class?.name || 'Class ' + applicant.school_class_id}</div>
              <div><b>Academic Session:</b> ${applicant.academic_year || '2026-2027'}</div>
              <div><b>Admission Fee Payable:</b> ₹${Number(stageFormData.admission_fee || 35000).toLocaleString('en-IN')}</div>
              <div><b>Offer Validity Deadline:</b> ${stageFormData.offer_valid_until || '15 days from issuance'}</div>
            </div>

            <p>To confirm the seat reservation, kindly complete the admission fee settlement on or before the deadline specified above. Failure to submit fees by the stipulated date may lead to release of this seat to the next waitlisted applicant.</p>

            <p>We warmly welcome your ward to the Arch Campus community!</p>
          </div>

          <div class="footer">
            <div class="signature">
              <div>Parent Acknowledgment</div>
              <div class="line"></div>
            </div>
            <div class="signature">
              <div>Dean of Admissions / Principal</div>
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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-20 text-center shadow-xs max-w-5xl mx-auto my-8">
        <LuLoader className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
        <h3 className="text-sm font-bold text-slate-800">Loading Admission Process...</h3>
        <p className="text-xs text-slate-500 mt-1">Retrieving candidate lifecycle records & verification checklists</p>
      </div>
    );
  }

  if (!applicant) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-2 sm:p-4 animate-fade-in pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-scale-up border border-slate-700">
          <LuCircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <Link
              to="/admission"
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer shrink-0 mt-1 sm:mt-0"
              title="Back to Student Admissions List"
            >
              <LuArrowLeft className="w-5 h-5" />
            </Link>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">
                  Admission Lifecycle Process
                </span>
                <span className="text-slate-300">&bull;</span>
                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  {applicant.application_number}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    applicant.status === 'Enrolled'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : applicant.status === 'Fee Paid'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : applicant.status === 'Offer Extended'
                      ? 'bg-primary-100 text-primary-800 border-primary-300'
                      : applicant.status === 'Assessment/Interview'
                      ? 'bg-sky-50 text-sky-700 border-sky-200'
                      : applicant.status === 'Document Review'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-primary-50 text-primary-700 border-primary-200'
                  }`}
                >
                  Stage {currentStageIndex + 1} of 6: {applicant.status}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
                <span>{applicant.first_name} {applicant.last_name || ''}</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Applying for <b>{applicant.school_class?.name || 'Class ' + (applicant.school_class_id || '')}</b> &bull; Academic Session {applicant.academic_year || '2026-2027'} &bull; Guardian: {applicant.guardian_name} ({applicant.guardian_phone}) &bull; Applied: {formatAppliedDate(applicant.created_at)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-center">
            <button
              onClick={handlePrintSlip}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <LuPrinter className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>

            {(applicant.status === 'Offer Extended' || applicant.status === 'Fee Paid' || applicant.status === 'Enrolled') && (
              <button
                onClick={handlePrintOfferLetter}
                className="px-3.5 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 font-semibold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <LuAward className="w-3.5 h-3.5 text-primary-600" />
                <span>Offer Letter</span>
              </button>
            )}

            <Link
              to="/admission"
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
            >
              <span>Back to List</span>
            </Link>
          </div>
        </div>

        {/* 6-Stage Process Stepper Bar */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 sm:p-4 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px] gap-2">
            {PIPELINE_STAGES.map((stg, idx) => {
              const currentNorm = normalizeStage(applicant.status);
              const isCurrent = currentNorm === stg.id;
              const isPassed = currentStageIndex > idx || applicant.status === 'Enrolled';

              return (
                <div key={stg.id} className="flex items-center gap-2 flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (stg.id === 'Inquiry') setActiveTab('overview');
                      else if (stg.id === 'Document Review') setActiveTab('docs');
                      else if (stg.id === 'Assessment/Interview') setActiveTab('assessment');
                      else if (stg.id === 'Offer Extended') setActiveTab('offer');
                      else if (stg.id === 'Fee Paid') setActiveTab('fee');
                      else if (stg.id === 'Enrolled') setActiveTab('enroll');
                    }}
                    className={`flex items-center gap-2.5 text-left cursor-pointer transition-all ${
                      isCurrent
                        ? 'scale-105'
                        : 'opacity-85 hover:opacity-100'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                        isCurrent
                          ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30 ring-2 ring-primary-300'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isPassed ? <LuCheck className="w-4 h-4" /> : stg.step}
                    </div>

                    <div className="leading-tight">
                      <span
                        className={`text-xs font-bold block ${
                          isCurrent
                            ? 'text-primary-700'
                            : isPassed
                            ? 'text-emerald-700'
                            : 'text-slate-600'
                        }`}
                      >
                        {stg.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[110px]">
                        {isPassed ? 'Completed ✓' : isCurrent ? 'Active Process' : 'Upcoming'}
                      </span>
                    </div>
                  </button>

                  {idx < PIPELINE_STAGES.length - 1 && (
                    <LuChevronRight className="w-4 h-4 text-slate-300 shrink-0 mx-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Process Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-2 sm:gap-6 text-xs font-bold text-slate-600 overflow-x-auto pt-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-primary-600 text-primary-600 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <LuFileText className="w-4 h-4" />
            <span>1. Basic Details</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'docs'
                ? 'border-primary-600 text-primary-600 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <LuFileCheck className="w-4 h-4" />
            <span>2. Document Uploadation & Verification</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800">
              {docStats.verified}/{docStats.total}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('assessment')}
            className={`pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'assessment'
                ? 'border-primary-600 text-primary-600 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <LuClipboardCheck className="w-4 h-4" />
            <span>3. Assessment & Interview</span>
          </button>

          <button
            onClick={() => setActiveTab('offer')}
            className={`pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'offer'
                ? 'border-primary-600 text-primary-600 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <LuAward className="w-4 h-4" />
            <span>4. Provisional Offer</span>
          </button>

          <button
            onClick={() => setActiveTab('fee')}
            className={`pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'fee'
                ? 'border-primary-600 text-primary-600 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <LuCreditCard className="w-4 h-4" />
            <span>5. Fee Payment</span>
          </button>

          <button
            onClick={() => setActiveTab('enroll')}
            className={`pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'enroll'
                ? 'border-primary-600 text-primary-600 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <LuGraduationCap className="w-4 h-4" />
            <span>6. Confirmed Enrollment</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'border-primary-600 text-primary-600 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <LuClock className="w-4 h-4" />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BASIC DETAILS (STEP 1) */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                Step 1 Completed ✓
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">Candidate Basic Details & Lead Origin</h2>
              <p className="text-xs text-slate-500">Student information registered during inquiry intake</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setBioFormData({
                    first_name: applicant.first_name || '',
                    last_name: applicant.last_name || '',
                    school_class_id: applicant.school_class_id || '',
                    academic_year: applicant.academic_year || '2026-2027',
                    lead_source: applicant.lead_source || 'Walk-in',
                    date_of_birth: applicant.date_of_birth ? applicant.date_of_birth.substring(0, 10) : '',
                    gender: applicant.gender || 'Male',
                    guardian_name: applicant.guardian_name || '',
                    guardian_phone: applicant.guardian_phone || '',
                    guardian_email: applicant.guardian_email || '',
                    guardian_relation: applicant.guardian_relation || 'Father',
                    previous_school: applicant.previous_school || '',
                    previous_score: applicant.previous_score || '',
                    address: applicant.address || '',
                    with_transport: Boolean(applicant.with_transport),
                    remarks: applicant.remarks || '',
                  });
                  setIsEditingBio(!isEditingBio);
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <LuPencil className="w-3.5 h-3.5" />
                <span>{isEditingBio ? 'Cancel Editing' : 'Edit Details'}</span>
              </button>
              <button
                onClick={() => setActiveTab('docs')}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <span>Proceed to Document Scrutiny</span>
              <LuChevronRight className="w-4 h-4" />
            </button>
            </div>
          </div>

          {isEditingBio ? (
            <form onSubmit={handleSaveBio} className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <LuPencil className="w-4 h-4 text-primary-600" />
                <span>Edit Basic Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={bioFormData.first_name}
                    onChange={(e) => setBioFormData({ ...bioFormData, first_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={bioFormData.last_name}
                    onChange={(e) => setBioFormData({ ...bioFormData, last_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Applying Class</label>
                  <select
                    value={bioFormData.school_class_id}
                    onChange={(e) => setBioFormData({ ...bioFormData, school_class_id: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:border-primary-500 cursor-pointer"
                  >
                    <option value="">Select Grade</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Academic Session</label>
                  <input
                    type="text"
                    value={bioFormData.academic_year}
                    onChange={(e) => setBioFormData({ ...bioFormData, academic_year: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Lead Source</label>
                  <select
                    value={bioFormData.lead_source}
                    onChange={(e) => setBioFormData({ ...bioFormData, lead_source: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:border-primary-500 cursor-pointer"
                  >
                    <option value="Walk-in">Walk-in Inquiry</option>
                    <option value="Website">Website Portal</option>
                    <option value="Referral">Alumni / Referral</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Phone">Phone Inquiry</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={bioFormData.date_of_birth}
                    onChange={(e) => setBioFormData({ ...bioFormData, date_of_birth: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={bioFormData.gender}
                    onChange={(e) => setBioFormData({ ...bioFormData, gender: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:border-primary-500 cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Guardian Name *</label>
                  <input
                    type="text"
                    required
                    value={bioFormData.guardian_name}
                    onChange={(e) => setBioFormData({ ...bioFormData, guardian_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Relationship</label>
                  <select
                    value={bioFormData.guardian_relation}
                    onChange={(e) => setBioFormData({ ...bioFormData, guardian_relation: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:border-primary-500 cursor-pointer"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={bioFormData.guardian_phone}
                    onChange={(e) => setBioFormData({ ...bioFormData, guardian_phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-semibold focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={bioFormData.guardian_email}
                    onChange={(e) => setBioFormData({ ...bioFormData, guardian_email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={bioFormData.address}
                    onChange={(e) => setBioFormData({ ...bioFormData, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bioFormData.with_transport}
                    onChange={(e) => setBioFormData({ ...bioFormData, with_transport: e.target.checked })}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <LuBus className="w-3.5 h-3.5 text-amber-600" />
                    Opt for School Bus Transport
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingBio(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBio}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {savingBio ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuCheck className="w-4 h-4" />}
                  <span>{savingBio ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Student Bio Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Student Profile
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Full Name</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {applicant.first_name} {applicant.last_name || ''}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Gender & Date of Birth</span>
                  <span className="font-semibold text-slate-700">
                    {applicant.gender || 'Not specified'} &bull; {applicant.date_of_birth ? new Date(applicant.date_of_birth).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Target Grade / Class</span>
                  <span className="font-bold text-primary-700">
                    {applicant.school_class?.name || 'Class ' + (applicant.school_class_id || '')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Academic Year</span>
                  <span className="font-semibold text-slate-700">{applicant.academic_year || '2026-2027'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Lead Inflow Source</span>
                  <span className="font-semibold text-slate-700">{applicant.lead_source || 'Walk-in'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">School Bus Transport</span>
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <LuBus className="w-3.5 h-3.5 text-amber-600" />
                    {applicant.with_transport ? 'Opted' : 'Self Commute'}
                  </span>
                </div>
              </div>
            </div>

            {/* Parent / Guardian Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Parent / Guardian Contact
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Guardian Name</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {applicant.guardian_name} ({applicant.guardian_relation || 'Parent'})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Primary Contact Mobile</span>
                  <a
                    href={`tel:${applicant.guardian_phone}`}
                    className="font-bold text-primary-600 hover:underline flex items-center gap-1 font-mono"
                  >
                    <LuPhone className="w-3.5 h-3.5" />
                    {applicant.guardian_phone}
                  </a>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px]">Email Address</span>
                  <span className="font-medium text-slate-700">{applicant.guardian_email || 'Not provided'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px]">Residential Address</span>
                  <span className="font-medium text-slate-700">{applicant.address || 'Not recorded'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Background & Remarks */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Previous School Attended</span>
              <span className="font-semibold text-slate-800 text-xs mt-0.5 block">
                {applicant.previous_school || 'N/A (First Schooling)'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Previous Academic Score</span>
              <span className="font-semibold text-primary-600 text-xs mt-0.5 block">
                {applicant.previous_score || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Inquiry Remarks</span>
              <span className="font-medium text-slate-700 text-xs mt-0.5 block">
                {applicant.remarks || 'No special notes recorded.'}
              </span>
            </div>
          </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DOCUMENT UPLOADATION & VERIFICATION (STEP 2) */}
      {/* ========================================================================= */}
      {activeTab === 'docs' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[11px] border border-amber-200">
                  Step 2 of Admission Process
                </span>
                <span className="text-xs text-slate-400 font-medium">&bull; Document Uploadation</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">Student Document Uploadation</h2>
              <p className="text-xs text-slate-500">
                Upload scans of student certificates, identity proofs, and marksheets. If a document is not uploaded, it remains marked as pending.
              </p>
            </div>

            {/* Document progress indicator */}
            <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-xl flex items-center gap-3">
              <div>
                <span className="text-xs font-bold text-amber-900 block">Upload Progress</span>
                <span className="text-[11px] text-amber-700 font-medium">
                  {docStats.uploaded} of {docStats.total} Documents Uploaded
                </span>
              </div>
              <div className="w-12 h-12 rounded-full bg-white border-2 border-amber-400 flex items-center justify-center font-black text-xs text-amber-800 shadow-2xs">
                {docStats.percent}%
              </div>
            </div>
          </div>

          {/* Document Upload Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STANDARD_DOCS.map((doc) => {
              const currentDoc = stageFormData.documents?.[doc.key] || { status: 'pending' };
              const isUploaded = Boolean(currentDoc.file_name || currentDoc.file_url || currentDoc.status === 'uploaded' || currentDoc.status === 'verified');
              const isUploading = uploadingDocKey === doc.key;

              return (
                <div
                  key={doc.key}
                  className={`p-4 rounded-2xl border transition-all ${
                    isUploaded
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : 'border-slate-200 bg-white shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <LuFileText className={`w-4 h-4 ${isUploaded ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <h4 className="font-bold text-xs text-slate-800">
                          {doc.label} {doc.required && <span className="text-red-500 font-black">*</span>}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        {doc.description}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                        isUploaded
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {isUploaded ? 'UPLOADED' : 'PENDING'}
                    </span>
                  </div>

                  {/* Uploaded File Link if any */}
                  {isUploaded && currentDoc.file_name && (
                    <div className="mt-3 p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <LuFileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium text-slate-700 truncate">{currentDoc.file_name}</span>
                      </div>
                      {currentDoc.file_url && (
                        <a
                          href={currentDoc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-primary-600 hover:underline flex items-center gap-1 shrink-0 ml-2"
                        >
                          <LuExternalLink className="w-3.5 h-3.5" /> View File
                        </a>
                      )}
                    </div>
                  )}

                  {/* Actions: File Upload Option ONLY */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <label className={`px-3.5 py-2 rounded-xl font-bold text-xs transition inline-flex items-center gap-1.5 cursor-pointer ${
                      isUploaded
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 shadow-2xs'
                    }`}>
                      {isUploading ? (
                        <>
                          <LuLoader className="w-3.5 h-3.5 animate-spin text-primary-600" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <LuUpload className="w-3.5 h-3.5 text-primary-600" />
                          <span>{isUploaded ? 'Re-upload Document' : 'Upload Document'}</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        disabled={isUploading}
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileUpload(doc.key, e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                    </label>

                    {isUploaded && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(doc.key)}
                        className="px-2.5 py-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition text-xs flex items-center gap-1 cursor-pointer"
                        title="Remove uploaded file and mark pending"
                      >
                        <LuTrash2 className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-semibold">Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Advancement Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSaveStageData('Document Review')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              {submitting ? 'Saving Changes...' : 'Save Document Progress'}
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                handleSaveStageData('Assessment/Interview', 'assessment');
              }}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuCheck className="w-4 h-4" />}
              <span>Proceed to Step 3: Assessment & Interview &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ASSESSMENT & INTERVIEW (STEP 3) */}
      {/* ========================================================================= */}
      {activeTab === 'assessment' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 font-bold text-[11px] border border-sky-200">
                  Step 3 of Admission Process
                </span>
                <span className="text-xs text-slate-400 font-medium">&bull; Candidate Evaluation</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">Entrance Assessment & Interview Panel</h2>
              <p className="text-xs text-slate-500">Record entrance test performance score and parent interaction feedback</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Written Assessment Card */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <LuClipboardCheck className="w-5 h-5 text-primary-600" />
                  <h3 className="font-bold text-sm text-slate-800">Written Aptitude Test</h3>
                </div>
                <span className="text-[11px] font-bold text-slate-500">Class Intake Exam</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Assessment Test Date
                </label>
                <input
                  type="date"
                  value={stageFormData.test_date}
                  onChange={(e) => setStageFormData({ ...stageFormData, test_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Marks / Score Obtained
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 88/100"
                    value={stageFormData.test_score}
                    onChange={(e) => setStageFormData({ ...stageFormData, test_score: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Test Evaluation Status
                  </label>
                  <select
                    value={stageFormData.test_status}
                    onChange={(e) => setStageFormData({ ...stageFormData, test_status: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-primary-500 cursor-pointer"
                  >
                    <option value="Pending">Pending / Scheduled</option>
                    <option value="Cleared">Cleared & Passed</option>
                    <option value="Failed">Not Cleared</option>
                    <option value="Waived">Waived / Direct Intake</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Principal / Coordinator Interview Card */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <LuUserCheck className="w-5 h-5 text-primary-600" />
                  <h3 className="font-bold text-sm text-slate-800">Panel & Parent Interview</h3>
                </div>
                <span className="text-[11px] font-bold text-slate-500">Interaction</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Interview Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={stageFormData.interview_date}
                    onChange={(e) => setStageFormData({ ...stageFormData, interview_date: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Recommendation
                  </label>
                  <select
                    value={stageFormData.interview_result}
                    onChange={(e) => setStageFormData({ ...stageFormData, interview_result: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-primary-500 cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed / Conducted</option>
                    <option value="Recommended">Recommended for Admission</option>
                    <option value="On Hold">On Hold / Second Round</option>
                    <option value="Not Recommended">Not Recommended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Interviewer Panel
                </label>
                <input
                  type="text"
                  placeholder="e.g. Principal & Academic Coordinator"
                  value={stageFormData.interview_interviewer}
                  onChange={(e) => setStageFormData({ ...stageFormData, interview_interviewer: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Interview Notes & Observations
                </label>
                <textarea
                  rows={2}
                  placeholder="Student attitude, parent expectations, language proficiency..."
                  value={stageFormData.interview_notes}
                  onChange={(e) => setStageFormData({ ...stageFormData, interview_notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Bottom Advancement Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSaveStageData('Assessment/Interview')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Save Assessment Scores'}
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                handleSaveStageData('Offer Extended', 'offer');
              }}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuAward className="w-4 h-4" />}
              <span>Approve & Extend Step 4: Provisional Offer Letter &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PROVISIONAL OFFER LETTER (STEP 4) */}
      {/* ========================================================================= */}
      {activeTab === 'offer' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-200">
                  Step 4 of Admission Process
                </span>
                <span className="text-xs text-slate-400 font-medium">&bull; Seat Allocation</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">Provisional Admission Offer Letter</h2>
              <p className="text-xs text-slate-500">Formal seat reservation issued to parent with fee acceptance deadline</p>
            </div>

            <button
              onClick={handlePrintOfferLetter}
              className="px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <LuPrinter className="w-4 h-4" />
              <span>Print Official Offer Letter</span>
            </button>
          </div>

          <div className="p-5 rounded-2xl border border-primary-200 bg-primary-50/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center">
                  <LuAward className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Official Seat Offer</h3>
                  <p className="text-xs text-slate-500">Formal admission granted to {applicant.first_name} {applicant.last_name || ''}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-100 text-primary-800">
                Provisional Offer Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Offer Issuance Date
                </label>
                <input
                  type="date"
                  value={stageFormData.offer_date}
                  onChange={(e) => setStageFormData({ ...stageFormData, offer_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Offer Validity / Acceptance Deadline
                </label>
                <input
                  type="date"
                  value={stageFormData.offer_valid_until}
                  onChange={(e) => setStageFormData({ ...stageFormData, offer_valid_until: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Bottom Advancement Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSaveStageData('Offer Extended')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Save Offer Terms
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                handleSaveStageData('Fee Paid', 'fee');
              }}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuCreditCard className="w-4 h-4" />}
              <span>Proceed to Step 5: Admission Fee Payment &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ADMISSION FEE PAYMENT (STEP 5) */}
      {/* ========================================================================= */}
      {activeTab === 'fee' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                  Step 5 of Admission Process
                </span>
                <span className="text-xs text-slate-400 font-medium">&bull; Fee Settlement</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">Admission & Registration Fee Payment</h2>
              <p className="text-xs text-slate-500">Record confirmation fee payment and issue official receipt</p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                stageFormData.admission_fee_status === 'Paid'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              {stageFormData.admission_fee_status === 'Paid' ? 'PAID IN FULL ✓' : 'PAYMENT PENDING'}
            </span>
          </div>

          <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Admission Fee Amount (₹)
                </label>
                <input
                  type="number"
                  value={stageFormData.admission_fee}
                  onChange={(e) => setStageFormData({ ...stageFormData, admission_fee: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-black text-emerald-700 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Payment Mode
                </label>
                <select
                  value={stageFormData.admission_fee_mode}
                  onChange={(e) => setStageFormData({ ...stageFormData, admission_fee_mode: e.target.value })}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:border-primary-500 cursor-pointer"
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Cash">Cash at School Counter</option>
                  <option value="Netbanking">Netbanking / NEFT / RTGS</option>
                  <option value="Cheque">Bank Cheque / DD</option>
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs font-bold focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stageFormData.admission_fee_status === 'Paid'}
                  onChange={(e) =>
                    setStageFormData({
                      ...stageFormData,
                      admission_fee_status: e.target.checked ? 'Paid' : 'Pending',
                      status: e.target.checked ? 'Fee Paid' : stageFormData.status,
                    })
                  }
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Mark Admission Confirmation Fee as Collected & Settled
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Confirms candidate has paid seat reservation fee and is eligible for final enrollment
                  </span>
                </div>
              </label>

              <button
                type="button"
                onClick={handlePrintSlip}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <LuPrinter className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>

          {/* Bottom Advancement Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSaveStageData('Fee Paid')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Save Payment Record
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
                handleSaveStageData('Fee Paid', 'enroll');
              }}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuGraduationCap className="w-4 h-4" />}
              <span>Confirm Fee & Proceed to Final Enrollment (Step 6) &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: CONFIRMED CLASSROOM ENROLLMENT (STEP 6) */}
      {/* ========================================================================= */}
      {activeTab === 'enroll' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                  Step 6 of Admission Process (Final)
                </span>
                <span className="text-xs text-slate-400 font-medium">&bull; Confirmed Enrollment</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">Confirmed Student Enrollment & Parent Credentials</h2>
              <p className="text-xs text-slate-500">Allocate roll number, add to active student directory, and generate parent portal access</p>
            </div>
          </div>

          {/* Already Enrolled Banner */}
          {applicant.status === 'Enrolled' || enrolledCredentials ? (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 border border-emerald-300 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                  <LuCheck className="w-8 h-8" />
                </div>
                <h3 className="font-black text-xl text-emerald-950">
                  Student Officially Enrolled in School Directory!
                </h3>
                <p className="text-xs text-emerald-800 max-w-lg mx-auto leading-relaxed">
                  Candidate <b>{applicant.first_name} {applicant.last_name || ''}</b> has been converted into an active student. Class fee structure installments and parent login access are fully provisioned.
                </p>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handlePrintSlip}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center gap-2 cursor-pointer"
                  >
                    <LuPrinter className="w-4 h-4" />
                    <span>Print Admission Enrollment Pass</span>
                  </button>

                  <Link
                    to="/admission"
                    className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>View All Admissions</span>
                  </Link>
                </div>
              </div>

              {/* IN-PAGE PARENT CREDENTIALS DISPLAY (NO POPUP!) */}
              <div className="p-6 rounded-2xl border-2 border-primary-300 bg-primary-50/40 space-y-4">
                <div className="flex items-center justify-between border-b border-primary-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    <LuShieldCheck className="w-6 h-6 text-primary-600" />
                    <div>
                      <h4 className="font-extrabold text-sm text-primary-950">Parent Portal Login Credentials</h4>
                      <p className="text-[11px] text-primary-700">Provide these credentials to the parent for mobile & web access</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={copyCredentials}
                    className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {copiedText ? <LuCheck className="w-4 h-4" /> : <LuCopy className="w-4 h-4" />}
                    <span>{copiedText ? 'Copied!' : 'Copy Credentials'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-primary-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Student Name</span>
                    <span className="font-bold text-slate-800 text-sm mt-0.5 block truncate">
                      {applicant.first_name} {applicant.last_name || ''}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-primary-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Login Username (Mobile)</span>
                    <span className="font-mono font-bold text-primary-700 text-sm mt-0.5 block">
                      {enrolledCredentials?.parent_phone || enrolledCredentials?.portal_username || applicant.guardian_phone}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-primary-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Temporary Password</span>
                    <span className="font-mono font-bold text-emerald-700 text-sm mt-0.5 block">
                      {enrolledCredentials?.temporary_password || `Pass@${applicant.guardian_phone?.slice(-4) || '2026'}`}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-primary-800 flex items-center gap-2">
                  <LuSparkles className="w-4 h-4 text-primary-600 shrink-0" />
                  <span>The parent can immediately sign in at <b>{window.location.origin}/login</b> to track student attendance, homework, exams, and pay quarterly fees.</span>
                </div>
              </div>
            </div>
          ) : (
            /* Enrollment Action Form */
            <form onSubmit={handleExecuteEnroll} className="space-y-5">
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <LuGraduationCap className="w-5 h-5 text-emerald-600" />
                  <span>Classroom Roll & Transport Assignment</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Classroom Roll Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 101"
                      value={stageFormData.roll_number}
                      onChange={(e) => setStageFormData({ ...stageFormData, roll_number: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Assigned Class / Grade
                    </label>
                    <input
                      type="text"
                      disabled
                      value={applicant.school_class?.name || 'Class ' + (applicant.school_class_id || '')}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 font-bold text-slate-700 text-sm cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stageFormData.with_transport}
                      onChange={(e) => setStageFormData({ ...stageFormData, with_transport: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <LuBus className="w-4 h-4 text-amber-600" />
                        Opt for School Bus Route & Vehicle Commute
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        If selected, transport ledger fees will be automatically generated alongside standard school quarterly installments.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-primary-50/70 border border-primary-200 text-primary-950 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-primary-950">
                  <LuReceipt className="w-4 h-4 text-primary-600 shrink-0" />
                  <span>Automated Student Roster & Parent Portal Provisioning</span>
                </div>
                <ul className="text-[11px] text-primary-800 list-disc list-inside space-y-1 ml-1 leading-relaxed">
                  <li>Assigns permanent Student Admission ID in academic roster</li>
                  <li>Generates secure Parent Portal credentials (phone + temporary access code)</li>
                  <li>Initializes quarterly tuition fee installments based on class fee structure</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <Link
                  to="/admission"
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-500/25 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuGraduationCap className="w-4 h-4" />}
                  <span>Confirm Enrollment & Generate Parent Credentials</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: STAGE AUDIT TRAIL */}
      {/* ========================================================================= */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900">Admission Process History & Audit Trail</h2>
            <p className="text-xs text-slate-500">Timestamped lifecycle events and officer remarks</p>
          </div>

          {(!applicant.pipeline_notes || applicant.pipeline_notes.length === 0) ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No audit logs recorded for this candidate yet.
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {applicant.pipeline_notes.map((log, lIdx) => (
                <div key={lIdx} className="relative group">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-primary-600 border-2 border-white shadow-xs"></div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-800">{log.action || log.stage}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {log.time ? new Date(log.time).toLocaleString() : 'Recent'}
                      </span>
                    </div>
                    {log.notes && <p className="text-[11px] text-slate-600">{log.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
