import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import CredentialsModal from '../../components/Common/CredentialsModal';
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
} from 'react-icons/lu';

export default function AdminAdmissionPage() {
  const [pipeline, setPipeline] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('ALL');

  // Modals & Forms
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [credentialsModalData, setCredentialsModalData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    school_class_id: '',
    academic_year: '2024-2025',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
    previous_school: '',
    previous_score: '',
    remarks: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [admRes, clsRes] = await Promise.all([
        adminService.getAdmissions({
          search: searchQuery,
          status: selectedStage,
        }),
        adminService.getClasses(),
      ]);

      if (admRes.success && admRes.data) {
        setPipeline(admRes.data.data || admRes.data || []);
      }
      if (clsRes.success && clsRes.data) {
        setClasses(clsRes.data);
      }
    } catch (err) {
      console.error('Failed to load admissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await adminService.createAdmission(formData);
      if (res.success) {
        setShowAddModal(false);
        setFormData({
          first_name: '',
          last_name: '',
          school_class_id: '',
          academic_year: '2024-2025',
          guardian_name: '',
          guardian_phone: '',
          guardian_email: '',
          previous_school: '',
          previous_score: '',
          remarks: '',
        });
        loadData();
        showToast('Admission application recorded successfully!');
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await adminService.updateAdmissionStatus(id, status);
      if (res.success) {
        loadData();
        showToast(`Application status updated to ${status}`);
      }
    } catch {
      showToast('Failed to update status.');
    }
  };

  const handleEnroll = async (applicant) => {
    try {
      const res = await adminService.enrollAdmission(applicant.id);
      if (res.success) {
        loadData();
        showToast('Applicant successfully enrolled as active student!');
        if (res.credentials) {
          setCredentialsModalData(res.credentials);
        }
      }
    } catch (err) {
      showToast(err.data?.message || 'Failed to enroll applicant.');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-scale-up border border-slate-700">
          <LuCircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <LuUserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-slate-800 leading-tight">Admission Applications Pipeline</h1>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Review new applicant inquiries, update admission stage, and enroll students
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 w-full sm:w-auto justify-center self-start sm:self-auto shrink-0"
        >
          <LuPlus className="w-4 h-4" /> New Admission Application
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by applicant name, app no, parent phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
          />
        </form>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="w-full sm:w-auto px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Stages</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Enrolled">Enrolled</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Pipeline Table */}
      {loading ? (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-8 sm:p-12 text-center">
          <LuLoader className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading admission pipeline from database...</p>
        </div>
      ) : pipeline.length === 0 ? (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LuUserPlus className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No Admission Applications Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
            There are currently no admission inquiries in the database.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <LuPlus className="w-4 h-4" /> Create First Application
          </button>
        </div>
      ) : (
        <>
          {/* Mobile View: Applicant Cards */}
          <div className="sm:hidden space-y-2.5">
            {pipeline.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{item.first_name} {item.last_name}</div>
                    <div className="text-[10px] text-purple-700 font-mono font-bold">{item.application_number}</div>
                  </div>
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                    disabled={item.status === 'Enrolled'}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border focus:outline-none ${
                      item.status === 'Enrolled'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                        : item.status === 'Approved'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : item.status === 'Under Review'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : item.status === 'Rejected'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Enrolled">Enrolled</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-1.5 px-2 bg-slate-50 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Applying Class</span>
                    <span className="font-semibold text-slate-700 text-xs">
                      {item.school_class?.name || 'Class ' + (item.school_class_id || '')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Parent</span>
                    <span className="font-semibold text-slate-700 text-xs truncate block">{item.guardian_name || '—'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  {item.guardian_phone && (
                    <div className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                      <LuPhone className="w-3 h-3 text-slate-400" />
                      <span>{item.guardian_phone}</span>
                    </div>
                  )}
                  {item.status === 'Approved' && (
                    <button
                      onClick={() => handleEnroll(item)}
                      className="ml-auto px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors inline-flex items-center gap-1"
                    >
                      <LuGraduationCap className="w-3.5 h-3.5" /> Enroll
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">Applicant & App No</th>
                    <th className="px-5 py-3.5">Applying For</th>
                    <th className="px-5 py-3.5">Parent / Contact</th>
                    <th className="px-5 py-3.5">Previous School & Score</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {pipeline.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-800">{item.first_name} {item.last_name}</div>
                        <div className="text-[11px] text-purple-700 font-mono font-bold">{item.application_number}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-800">
                          {item.school_class?.name || 'Class ' + (item.school_class_id || '')}
                        </span>
                        <div className="text-[11px] text-slate-400">{item.academic_year}</div>
                      </td>
                      <td className="px-5 py-4 space-y-0.5">
                        <div className="font-semibold text-slate-800">{item.guardian_name}</div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <LuPhone className="w-3 h-3 text-slate-400" />
                          <span>{item.guardian_phone}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-slate-700">{item.previous_school || 'N/A'}</div>
                        {item.previous_score && (
                          <div className="text-[11px] text-purple-600 font-semibold">Score: {item.previous_score}</div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          disabled={item.status === 'Enrolled'}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border focus:outline-none ${
                            item.status === 'Enrolled'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                              : item.status === 'Approved'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : item.status === 'Under Review'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : item.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Enrolled">Enrolled</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {item.status === 'Approved' && (
                          <button
                            onClick={() => handleEnroll(item)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors inline-flex items-center gap-1"
                          >
                            <LuGraduationCap className="w-3.5 h-3.5" /> Enroll Student
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add New Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full my-4 sm:my-8 overflow-hidden animate-scale-up">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <LuPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">New Admission Application</h3>
                  <p className="text-purple-100 text-xs">Record prospective student inquiry</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Applicant First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="e.g. Vivaan"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="e.g. Reddy"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Class</label>
                  <select
                    value={formData.school_class_id}
                    onChange={(e) => setFormData({ ...formData, school_class_id: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={formData.academic_year}
                    onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Parent / Guardian Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.guardian_name}
                    onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                    placeholder="e.g. Kishore Reddy"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Parent Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.guardian_phone}
                    onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                    placeholder="e.g. 9890123001"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Previous School</label>
                  <input
                    type="text"
                    value={formData.previous_school}
                    onChange={(e) => setFormData({ ...formData, previous_school: e.target.value })}
                    placeholder="e.g. St. Joseph Academy"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Previous Score</label>
                  <input
                    type="text"
                    value={formData.previous_score}
                    onChange={(e) => setFormData({ ...formData, previous_score: e.target.value })}
                    placeholder="e.g. 91%"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuCheck className="w-4 h-4" />}
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Modal for Enrolled Student Parent */}
      <CredentialsModal
        isOpen={!!credentialsModalData}
        onClose={() => setCredentialsModalData(null)}
        credentials={credentialsModalData}
        title="Enrolled Student Parent Login"
      />
    </div>
  );
}
