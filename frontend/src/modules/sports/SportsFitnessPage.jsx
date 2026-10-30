import React, { useState, useEffect } from 'react';
import { sportsService } from '../../services/sportsService';
import {
  LuActivity,
  LuPlus,
  LuSearch,
  LuFilter,
  LuCircleCheck,
  LuCircleAlert,
  LuX,
  LuTrash2,
  LuLoader,
  LuSave,
  LuHeart,
  LuShieldCheck,
  LuSparkles,
  LuUser,
} from 'react-icons/lu';

export default function SportsFitnessPage() {
  const [assessments, setAssessments] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [summary, setSummary] = useState({
    total_assessed: 0,
    outstanding: 0,
    medically_cleared: 0,
    average_bmi: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [termFilter, setTermFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [formData, setFormData] = useState({
    student_id: '',
    assessment_date: new Date().toISOString().split('T')[0],
    academic_term: 'Term 1 (2026-27)',
    height_cm: '',
    weight_kg: '',
    sprint_50m_seconds: '',
    shuttle_run_seconds: '',
    pushups_count: '',
    sit_and_reach_cm: '',
    stamina_rating: 'Outstanding (A+)',
    medical_clearance: true,
    remarks: '',
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [fitRes, studRes] = await Promise.all([
        sportsService.getFitnessAssessments({
          term: termFilter,
          rating: ratingFilter,
          search,
        }),
        sportsService.getAvailableStudents(),
      ]);

      if (fitRes?.success) {
        setAssessments(fitRes.data?.assessments || []);
        if (fitRes.data?.summary) setSummary(fitRes.data.summary);
      }
      if (studRes?.success) setAvailableStudents(studRes.data || []);
    } catch (err) {
      console.error('Error loading fitness assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [termFilter, ratingFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenCreate = () => {
    setFormData({
      student_id: availableStudents[0]?.id || '',
      assessment_date: new Date().toISOString().split('T')[0],
      academic_term: 'Term 1 (2026-27)',
      height_cm: '165',
      weight_kg: '52',
      sprint_50m_seconds: '7.4',
      shuttle_run_seconds: '11.2',
      pushups_count: '25',
      sit_and_reach_cm: '18',
      stamina_rating: 'Outstanding (A+)',
      medical_clearance: true,
      remarks: 'Cleared for high-intensity competitive tournaments.',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await sportsService.createFitnessAssessment(formData);
      if (res?.success) {
        showToast('Fitness assessment record saved!');
        setModalOpen(false);
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Error saving fitness assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fitness assessment record?')) return;
    try {
      const res = await sportsService.deleteFitnessAssessment(id);
      if (res?.success) {
        showToast('Assessment record deleted.');
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Error deleting assessment.');
    }
  };

  const calculatedBMI = () => {
    const h = parseFloat(formData.height_cm);
    const w = parseFloat(formData.weight_kg);
    if (!h || !w) return null;
    const hm = h / 100;
    return (w / (hm * hm)).toFixed(1);
  };

  return (
    <div className="space-y-5 sm:space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-slide-up border border-slate-700">
          <LuCircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-base sm:text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-primary-50 rounded-lg sm:rounded-xl text-primary-600">
              <LuActivity className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            Athletic Fitness & Health Assessments
          </h1>
          <p className="text-slate-500 text-[10px] sm:text-xs mt-0.5 sm:mt-1 ml-0.5">
            Physical education assessments, sprint timings, BMI tracking, and competitive sports medical clearance
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <LuPlus className="w-4 h-4" />
          Conduct Fitness Assessment
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Students Evaluated</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">{summary.total_assessed}</div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-1 inline-block">Fitness test completed</span>
        </div>
        <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 hover:border-emerald-200/80 shadow-2xs hover:shadow-xs transition-all">
          <span className="text-[11px] sm:text-xs font-semibold text-emerald-700">Outstanding (A+) Grade</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">{summary.outstanding}</div>
          <span className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
            Elite athletic stamina
          </span>
        </div>
        <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 hover:border-teal-200/80 shadow-2xs hover:shadow-xs transition-all">
          <span className="text-[11px] sm:text-xs font-semibold text-teal-700">Medically Cleared</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">{summary.medically_cleared}</div>
          <span className="text-[10px] sm:text-[11px] text-teal-600 font-semibold mt-1 inline-block">
            Fit for all match tournaments
          </span>
        </div>
        <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 hover:border-primary-200/80 shadow-2xs hover:shadow-xs transition-all">
          <span className="text-[11px] sm:text-xs font-semibold text-primary-700">Cohort Average BMI</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">{summary.average_bmi ? summary.average_bmi : (summary.total_records > 0 ? 'N/A' : '0.0')}</div>
          <span className="text-[10px] sm:text-[11px] text-primary-600 font-semibold mt-1 inline-block">
            {summary.average_bmi ? 'Healthy weight distribution' : 'No records yet'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[220px] relative">
          <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student athlete name or admission number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Term Filter */}
          <select
            value={termFilter}
            onChange={(e) => setTermFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="all">All Academic Terms</option>
            <option value="Term 1 (2026-27)">Term 1 (2026-27)</option>
            <option value="Term 2 (2026-27)">Term 2 (2026-27)</option>
            <option value="Annual Fitness Audit">Annual Fitness Audit</option>
          </select>

          {/* Stamina Rating Filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="all">All Stamina Ratings</option>
            <option value="Outstanding">Outstanding (A+)</option>
            <option value="Good">Good (A)</option>
            <option value="Average">Average (B)</option>
            <option value="Needs Training">Needs Training (C)</option>
          </select>
        </div>
      </div>

      {/* Fitness Records Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs">
          <LuLoader className="w-6 h-6 animate-spin mx-auto text-primary-600 mb-2" />
          <p className="text-xs">Loading fitness assessments...</p>
        </div>
      ) : assessments.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs">
          <LuActivity className="w-12 h-12 stroke-[1.2] mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-600">No fitness assessments recorded yet</p>
          <p className="text-xs text-slate-400 mt-1">Conduct a physical evaluation for a student athlete.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Student Athlete</th>
                  <th className="px-4 py-3">Height / Weight</th>
                  <th className="px-4 py-3">BMI Index</th>
                  <th className="px-4 py-3">50m Sprint</th>
                  <th className="px-4 py-3">Shuttle Run</th>
                  <th className="px-4 py-3">Pushups</th>
                  <th className="px-4 py-3">Stamina Rating</th>
                  <th className="px-4 py-3">Medical Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assessments.map((rec) => {
                  const studentName = `${rec.student?.first_name || ''} ${rec.student?.last_name || ''}`.trim();
                  const classSection = `${rec.student?.school_class?.name || ''} - ${rec.student?.section?.name || ''}`.trim();

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{studentName || 'Student'}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{rec.student?.admission_number || 'N/A'}</span>
                          {classSection && <span>• {classSection}</span>}
                        </div>
                      </td>

                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {rec.height_cm ? `${rec.height_cm} cm` : '—'} /{' '}
                        {rec.weight_kg ? `${rec.weight_kg} kg` : '—'}
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-800">{rec.bmi || '—'}</span>
                        <span className="text-[10px] text-slate-400 block">
                          {rec.bmi < 18.5 ? 'Underweight' : rec.bmi <= 24.9 ? 'Normal' : 'Overweight'}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-semibold text-emerald-700">
                        {rec.sprint_50m_seconds ? `${rec.sprint_50m_seconds} s` : '—'}
                      </td>

                      <td className="px-4 py-3 font-semibold text-blue-700">
                        {rec.shuttle_run_seconds ? `${rec.shuttle_run_seconds} s` : '—'}
                      </td>

                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {rec.pushups_count ? `${rec.pushups_count} reps` : '—'}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            rec.stamina_rating?.includes('Outstanding')
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : rec.stamina_rating?.includes('Good')
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                              : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          }`}
                        >
                          <LuSparkles className="w-3 h-3" />
                          {rec.stamina_rating}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {rec.medical_clearance ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                            <LuShieldCheck className="w-3.5 h-3.5" /> Cleared
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500">
                            <LuCircleAlert className="w-3.5 h-3.5" /> Pending Check
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(rec.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                          title="Delete assessment"
                        >
                          <LuTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fitness Assessment Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <LuActivity className="w-5 h-5 text-primary-600" />
                Conduct Fitness Assessment
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Select Student Athlete *</label>
                <select
                  required
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                >
                  <option value="">Choose Student</option>
                  {availableStudents.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.full_name} ({st.admission_number} • {st.class_section})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Assessment Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.assessment_date}
                    onChange={(e) => setFormData({ ...formData, assessment_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block mb-1">Academic Term *</label>
                  <select
                    value={formData.academic_term}
                    onChange={(e) => setFormData({ ...formData, academic_term: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  >
                    <option value="Term 1 (2026-27)">Term 1 (2026-27)</option>
                    <option value="Term 2 (2026-27)">Term 2 (2026-27)</option>
                    <option value="Annual Fitness Audit">Annual Fitness Audit</option>
                  </select>
                </div>
              </div>

              {/* Physical measurements & auto BMI */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Physical Metrics</span>
                  {calculatedBMI() && (
                    <span className="text-[11px] font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-200">
                      Calculated BMI: {calculatedBMI()}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 text-[11px] text-slate-500">Height (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="165.0"
                      value={formData.height_cm}
                      onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg sm:rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-[11px] text-slate-500">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="52.0"
                      value={formData.weight_kg}
                      onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg sm:rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Drill Timings & Reps */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block mb-1 text-[11px]">50m Sprint (s)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="7.2"
                    value={formData.sprint_50m_seconds}
                    onChange={(e) => setFormData({ ...formData, sprint_50m_seconds: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[11px]">Shuttle Run (s)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="11.4"
                    value={formData.shuttle_run_seconds}
                    onChange={(e) => setFormData({ ...formData, shuttle_run_seconds: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[11px]">Pushups Count</label>
                  <input
                    type="number"
                    placeholder="25"
                    value={formData.pushups_count}
                    onChange={(e) => setFormData({ ...formData, pushups_count: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Flexibility (Sit & Reach cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="18.0"
                    value={formData.sit_and_reach_cm}
                    onChange={(e) => setFormData({ ...formData, sit_and_reach_cm: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block mb-1">Overall Stamina Rating *</label>
                  <select
                    value={formData.stamina_rating}
                    onChange={(e) => setFormData({ ...formData, stamina_rating: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  >
                    <option value="Outstanding (A+)">Outstanding (A+)</option>
                    <option value="Good (A)">Good (A)</option>
                    <option value="Average (B)">Average (B)</option>
                    <option value="Needs Training (C)">Needs Training (C)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="medical_clearance"
                  checked={formData.medical_clearance}
                  onChange={(e) => setFormData({ ...formData, medical_clearance: e.target.checked })}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
                />
                <label htmlFor="medical_clearance" className="text-slate-700 cursor-pointer">
                  Student is Medically Cleared for Competitive Tournaments
                </label>
              </div>

              <div>
                <label className="block mb-1">Doctor / Incharge Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Excellent aerobic capacity, cleared for track sprints"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg sm:rounded-xl text-slate-500 hover:bg-slate-100 transition-all cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold shadow-xs flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuSave className="w-4 h-4" />}
                  Save Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
