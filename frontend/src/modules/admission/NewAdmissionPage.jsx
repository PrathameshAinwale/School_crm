import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import {
  LuUserPlus,
  LuArrowLeft,
  LuGraduationCap,
  LuUser,
  LuPhone,
  LuMail,
  LuMapPin,
  LuBus,
  LuFileText,
  LuCalendar,
  LuCheck,
  LuLoader,
  LuSparkles,
  LuCircleCheck,
} from 'react-icons/lu';

export default function NewAdmissionPage() {
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [formData, setFormData] = useState({
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

  useEffect(() => {
    let active = true;
    adminService
      .getClasses()
      .then((res) => {
        if (active && res?.success && res?.data) {
          setClasses(res.data);
          if (res.data.length > 0 && !formData.school_class_id) {
            setFormData((prev) => ({ ...prev, school_class_id: res.data[0].id }));
          }
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.first_name.trim()) {
      setErrorMsg('Please enter student first name.');
      return;
    }
    if (!formData.guardian_name.trim()) {
      setErrorMsg('Please enter parent/guardian name.');
      return;
    }
    if (!formData.guardian_phone.trim()) {
      setErrorMsg('Please enter parent/guardian contact number.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminService.createAdmission(formData);
      if (res?.success && res?.data) {
        // Redirect to admission process page for the created applicant so officer can proceed to document uploadation
        navigate(`/admission/${res.data.id}`, {
          state: { message: `Student ${res.data.first_name} registered! Proceed with document uploadation.` },
        });
      } else {
        navigate('/admission', {
          state: { message: 'New admission application registered successfully.' },
        });
      }
    } catch (err) {
      setErrorMsg(err.data?.message || err.message || 'Failed to register student admission application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-2 sm:p-4 animate-fade-in">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admission"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="Back to Admissions List"
          >
            <LuArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 font-bold text-[11px] border border-primary-200 uppercase tracking-wider">
                Step 1 of Admission Process
              </span>
              <span className="text-xs text-slate-400 font-medium">&bull; Registration</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 flex items-center gap-2">
              <LuUserPlus className="w-6 h-6 text-primary-600" />
              <span>New Student Admission Application</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter student & parent basic details to initiate the admission lifecycle. Further processes (documents, assessment, fees) follow immediately.
            </p>
          </div>
        </div>

        <Link
          to="/admission"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1 self-start sm:self-center"
        >
          <span>View All Admissions</span>
        </Link>
      </div>

      {/* Progress Milestone Notification Banner */}
      <div className="bg-gradient-to-r from-primary-50 via-blue-50 to-indigo-50 border border-primary-200/80 rounded-2xl p-4 flex items-start gap-3.5 shadow-xs">
        <div className="w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <LuSparkles className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900">Admission Process Workflow</h4>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px]">
            <span className="px-2 py-0.5 rounded-md bg-primary-600 text-white font-bold flex items-center gap-1">
              <span>1. Basic Details</span>
              <span className="text-[10px] bg-white/20 px-1 rounded">Current</span>
            </span>
            <span className="text-slate-400">&rarr;</span>
            <span className="px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200 font-medium">
              2. Document Uploadation
            </span>
            <span className="text-slate-400">&rarr;</span>
            <span className="px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200 font-medium">
              3. Assessment & Interview
            </span>
            <span className="text-slate-400">&rarr;</span>
            <span className="px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200 font-medium">
              4. Offer Letter
            </span>
            <span className="text-slate-400">&rarr;</span>
            <span className="px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200 font-medium">
              5. Admission Fee
            </span>
            <span className="text-slate-400">&rarr;</span>
            <span className="px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200 font-medium">
              6. Enrollment
            </span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 space-y-6">
          {/* SECTION 1: APPLICANT DETAILS */}
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
              <LuGraduationCap className="w-4 h-4 text-primary-600" />
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                1. Student Basic Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav"
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Last Name / Surname</label>
                <input
                  type="text"
                  placeholder="e.g. Sharma"
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Applying for Class / Grade</label>
                <select
                  value={formData.school_class_id}
                  onChange={(e) => handleChange('school_class_id', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition"
                >
                  <option value="">Select Grade / Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || `Class ${c.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleChange('date_of_birth', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={formData.academic_year}
                  onChange={(e) => handleChange('academic_year', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lead Source</label>
                <select
                  value={formData.lead_source}
                  onChange={(e) => handleChange('lead_source', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition"
                >
                  <option value="Walk-in">Walk-in Inquiry</option>
                  <option value="Online">Website / Online Form</option>
                  <option value="Referral">Parent / Staff Referral</option>
                  <option value="Social Media">Social Media Campaign</option>
                  <option value="Expo">School Expo / Event</option>
                  <option value="Direct Call">Direct Phone Call</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: PARENT / GUARDIAN DETAILS */}
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
              <LuUser className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                2. Parent / Guardian Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Parent / Guardian Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Sharma"
                  value={formData.guardian_name}
                  onChange={(e) => handleChange('guardian_name', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Contact Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={formData.guardian_phone}
                  onChange={(e) => handleChange('guardian_phone', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. ramesh.sharma@example.com"
                  value={formData.guardian_email}
                  onChange={(e) => handleChange('guardian_email', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Relationship to Student</label>
                <select
                  value={formData.guardian_relation}
                  onChange={(e) => handleChange('guardian_relation', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Legal Guardian">Legal Guardian</option>
                  <option value="Grandparent">Grandparent</option>
                  <option value="Sibling">Elder Sibling</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: PREVIOUS ACADEMICS & LOGISTICS */}
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
              <LuFileText className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                3. Previous Academic Records & Logistics
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Previous School Name</label>
                <input
                  type="text"
                  placeholder="e.g. St. Xavier Convent School"
                  value={formData.previous_school}
                  onChange={(e) => handleChange('previous_school', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Previous Grade / Score Percentage</label>
                <input
                  type="text"
                  placeholder="e.g. 88.5% / A Grade"
                  value={formData.previous_score}
                  onChange={(e) => handleChange('previous_score', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.with_transport}
                    onChange={(e) => handleChange('with_transport', e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">School Bus / Transport</span>
                    <span className="text-[10px] text-slate-500">Requires daily bus pickup & drop</span>
                  </div>
                </label>
              </div>

              <div className="sm:col-span-2 md:col-span-3">
                <label className="block font-bold text-slate-700 mb-1">Residential Address</label>
                <textarea
                  rows="2"
                  placeholder="Street, Landmark, City, State, PIN code"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-3">
                <label className="block font-bold text-slate-700 mb-1">Initial Inquiry Remarks / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Parents inquired for admission in upcoming session, sibling already studying in Grade 8"
                  value={formData.remarks}
                  onChange={(e) => handleChange('remarks', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="bg-slate-50/80 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            to="/admission"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold text-center transition cursor-pointer"
          >
            Cancel & Return to List
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-500/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <LuLoader className="w-4 h-4 animate-spin" />
                <span>Registering Student...</span>
              </>
            ) : (
              <>
                <LuCircleCheck className="w-4 h-4" />
                <span>Submit Basic Details & Proceed to Process</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

