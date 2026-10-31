import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import {
  LuCalendarDays,
  LuPlus,
  LuSearch,
  LuClock,
  LuPhone,
  LuMail,
  LuCheck,
  LuCircleCheck,
  LuX,
  LuLoader,
  LuChevronLeft,
  LuChevronRight,
  LuUserCheck,
  LuFileText,
  LuGraduationCap,
  LuBuilding2,
  LuAward,
  LuCalendar,
  LuPrinter,
} from 'react-icons/lu';

export default function AdmissionInterviewCalendarPage() {
  const { currentRole } = useAuth();
  const isPrincipal = currentRole === 'principal';

  const [pipeline, setPipeline] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedResult, setSelectedResult] = useState('ALL');
  const [viewMode, setViewMode] = useState('agenda'); // 'agenda' | 'month'

  // Current calendar viewing month
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modals
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // New Interview Form
  const [scheduleForm, setScheduleForm] = useState({
    admission_id: '',
    interview_date: '',
    interview_interviewer: 'Principal Dr. Sharma & Admission Panel',
    venue: "Principal's Office (Room 101)",
    test_score: '',
    interview_notes: '',
    advance_stage: true,
  });

  // Edit / Evaluation Form
  const [evaluationForm, setEvaluationForm] = useState({
    interview_result: 'Recommended',
    interview_notes: '',
    test_score: '',
    interview_interviewer: '',
    interview_date: '',
    advance_to_offer: false,
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [admRes, clsRes] = await Promise.all([
        adminService.getAdmissions({ per_page: 250 }),
        adminService.getClasses(),
      ]);

      if (admRes?.success && admRes?.data) {
        const items = Array.isArray(admRes.data.data)
          ? admRes.data.data
          : Array.isArray(admRes.data)
          ? admRes.data
          : [];
        setPipeline(items);
      }

      if (clsRes?.success && clsRes?.data) {
        setClasses(clsRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load admission interviews:', err);
      showToast('Failed to load interview schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter candidates who have an interview date or are in the interview stage
  const scheduledInterviews = useMemo(() => {
    return pipeline
      .filter((app) => app.interview_date || app.status === 'Assessment/Interview')
      .filter((app) => {
        if (selectedClass !== 'ALL' && String(app.school_class_id) !== String(selectedClass)) {
          return false;
        }
        if (selectedResult !== 'ALL') {
          const res = app.interview_result || 'Pending';
          if (res !== selectedResult) return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const name = `${app.first_name} ${app.last_name || ''}`.toLowerCase();
          const appNo = (app.application_number || '').toLowerCase();
          const phone = (app.guardian_phone || '').toLowerCase();
          const panel = (app.interview_interviewer || '').toLowerCase();
          return name.includes(q) || appNo.includes(q) || phone.includes(q) || panel.includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        const dateA = a.interview_date ? new Date(a.interview_date).getTime() : 0;
        const dateB = b.interview_date ? new Date(b.interview_date).getTime() : 0;
        return dateA - dateB;
      });
  }, [pipeline, selectedClass, selectedResult, searchQuery]);

  // Candidates available to schedule (all in pipeline)
  const availableCandidates = useMemo(() => {
    return pipeline.filter((app) => app.status !== 'Enrolled' && app.status !== 'Rejected');
  }, [pipeline]);

  // KPI Calculations
  const totalScheduled = scheduledInterviews.length;
  const recommendedCount = scheduledInterviews.filter(
    (i) => i.interview_result === 'Recommended'
  ).length;
  const pendingCount = scheduledInterviews.filter(
    (i) => !i.interview_result || i.interview_result === 'Pending'
  ).length;
  const upcomingCount = scheduledInterviews.filter((i) => {
    if (!i.interview_date) return true;
    return new Date(i.interview_date) >= new Date(new Date().setHours(0, 0, 0, 0));
  }).length;

  // Open Schedule Modal
  const handleOpenSchedule = (presetApplicantId = '') => {
    // Default tomorrow at 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const dateStr = tomorrow.toISOString().substring(0, 16);

    setScheduleForm({
      admission_id: presetApplicantId || (availableCandidates[0]?.id || ''),
      interview_date: dateStr,
      interview_interviewer: 'Principal Dr. Sharma & Admission Panel',
      venue: "Principal's Office (Room 101)",
      test_score: '',
      interview_notes: '',
      advance_stage: true,
    });
    setShowScheduleModal(true);
  };

  // Submit New Interview Schedule
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleForm.admission_id) {
      showToast('Please select a candidate.');
      return;
    }
    if (!scheduleForm.interview_date) {
      showToast('Please specify the interview date and time.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        interview_date: scheduleForm.interview_date.replace('T', ' ') + ':00',
        interview_interviewer: scheduleForm.interview_interviewer,
        interview_notes: scheduleForm.venue
          ? `[Venue: ${scheduleForm.venue}] ${scheduleForm.interview_notes}`
          : scheduleForm.interview_notes,
        interview_result: 'Pending',
        test_score: scheduleForm.test_score || undefined,
        status: scheduleForm.advance_stage ? 'Assessment/Interview' : undefined,
      };

      await adminService.updateAdmissionStatus(scheduleForm.admission_id, payload);
      showToast('Candidate interview slot scheduled successfully.');
      setShowScheduleModal(false);
      loadData();
    } catch (err) {
      console.error('Failed to schedule interview:', err);
      showToast(err.data?.message || err.message || 'Failed to schedule interview slot.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Evaluation Modal
  const handleOpenEvaluation = (interview) => {
    setSelectedInterview(interview);
    setEvaluationForm({
      interview_result: interview.interview_result || 'Recommended',
      interview_notes: interview.interview_notes || '',
      test_score: interview.test_score || '',
      interview_interviewer: interview.interview_interviewer || '',
      interview_date: interview.interview_date ? interview.interview_date.replace(' ', 'T').substring(0, 16) : '',
      advance_to_offer: false,
    });
  };

  // Submit Evaluation Outcome
  const handleEvaluationSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInterview) return;

    setSubmitting(true);
    try {
      const payload = {
        interview_result: evaluationForm.interview_result,
        interview_notes: evaluationForm.interview_notes,
        test_score: evaluationForm.test_score || undefined,
        interview_interviewer: evaluationForm.interview_interviewer || undefined,
        interview_date: evaluationForm.interview_date ? evaluationForm.interview_date.replace('T', ' ') + ':00' : undefined,
        status: evaluationForm.advance_to_offer && evaluationForm.interview_result === 'Recommended'
          ? 'Offer Extended'
          : undefined,
      };

      await adminService.updateAdmissionStatus(selectedInterview.id, payload);
      showToast('Interview evaluation updated successfully.');
      setSelectedInterview(null);
      loadData();
    } catch (err) {
      console.error('Failed to update interview evaluation:', err);
      showToast(err.data?.message || err.message || 'Failed to update evaluation.');
    } finally {
      setSubmitting(false);
    }
  };

  // Format Date & Time for display
  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Date to be specified';
    const d = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Status Badge Helper
  const getResultBadge = (result) => {
    const res = result || 'Pending';
    switch (res) {
      case 'Recommended':
        return {
          label: 'Recommended',
          cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        };
      case 'Pending':
        return {
          label: 'Pending Evaluation',
          cls: 'bg-amber-50 text-amber-700 border border-amber-200',
        };
      case 'On Hold':
        return {
          label: 'On Hold',
          cls: 'bg-sky-50 text-sky-700 border border-sky-200',
        };
      case 'Not Recommended':
        return {
          label: 'Not Recommended',
          cls: 'bg-rose-50 text-rose-700 border border-rose-200',
        };
      default:
        return {
          label: res,
          cls: 'bg-slate-100 text-slate-700 border border-slate-200',
        };
    }
  };

  // Calendar calculations for Month View
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(year, month, i));
  }

  const getInterviewsForDay = (dayDate) => {
    if (!dayDate) return [];
    const dateStr = dayDate.toISOString().substring(0, 10);
    return scheduledInterviews.filter((i) => {
      if (!i.interview_date) return false;
      return i.interview_date.substring(0, 10) === dateStr;
    });
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
            <LuCalendarDays className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-bold text-gray-900 leading-tight">
                Admissions Interview Calendar
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-primary-50 text-primary-700">
                {totalScheduled} Slots
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
              Candidate entrance assessments, oral interviews & principal evaluation slots
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'agenda'
                  ? 'bg-white text-primary-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LuClock className="w-3.5 h-3.5" />
              <span>Agenda List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-white text-primary-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LuCalendar className="w-3.5 h-3.5" />
              <span>Month View</span>
            </button>
          </div>

          {!isPrincipal && (
            <button
              type="button"
              onClick={() => handleOpenSchedule()}
              className="px-4 py-2 sm:py-2.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <LuPlus className="w-4 h-4" />
              <span>Schedule Interview</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Standard KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Scheduled Slots</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{totalScheduled}</p>
            <p className="text-[11px] text-primary-600 font-medium mt-0.5">Active intake session</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <LuCalendarDays className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Upcoming Slots</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{upcomingCount}</p>
            <p className="text-[11px] text-sky-600 font-medium mt-0.5">Today & forthcoming</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <LuClock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Recommended</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{recommendedCount}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Cleared for admission offer</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <LuAward className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Pending Evaluation</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{pendingCount}</p>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">Awaiting panel remarks</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <LuUserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate name, application #, interviewer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-500"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full sm:w-auto px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-primary-500 font-medium cursor-pointer"
          >
            <option value="ALL">All Grades</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Outcome Filter */}
          <select
            value={selectedResult}
            onChange={(e) => setSelectedResult(e.target.value)}
            className="w-full sm:w-auto px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-primary-500 font-medium cursor-pointer"
          >
            <option value="ALL">All Results</option>
            <option value="Recommended">Recommended</option>
            <option value="Pending">Pending Evaluation</option>
            <option value="On Hold">On Hold</option>
            <option value="Not Recommended">Not Recommended</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-xs">
          <LuLoader className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-semibold">Loading candidate interview calendar...</p>
        </div>
      ) : scheduledInterviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LuCalendarDays className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No Candidate Interviews Scheduled</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
            {searchQuery || selectedClass !== 'ALL' || selectedResult !== 'ALL'
              ? 'No scheduled candidate slots match your selected filters.'
              : 'There are currently no admission interviews scheduled. Click "+ Schedule Interview" to book a candidate evaluation slot.'}
          </p>
          {!isPrincipal && (
            <button
              onClick={() => handleOpenSchedule()}
              className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <LuPlus className="w-4 h-4" /> Schedule First Interview
            </button>
          )}
        </div>
      ) : viewMode === 'month' ? (
        /* ================= MONTHLY CALENDAR GRID ================= */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-4">
          {/* Month Header Controller */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-800">{monthName}</h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                aria-label="Previous Month"
              >
                <LuChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                aria-label="Next Month"
              >
                <LuChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 7 Days Column Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div
                key={d}
                className="text-center text-[11px] font-bold text-slate-400 py-1 uppercase tracking-wider"
              >
                {d}
              </div>
            ))}

            {calendarDays.map((day, idx) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[90px] sm:min-h-[110px] bg-slate-50/40 rounded-xl border border-slate-100 p-1.5 opacity-40"
                  />
                );
              }

              const dayInterviews = getInterviewsForDay(day);
              const isToday =
                new Date().toISOString().substring(0, 10) === day.toISOString().substring(0, 10);

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[90px] sm:min-h-[110px] rounded-xl border p-1.5 flex flex-col justify-between transition-all ${
                    isToday
                      ? 'bg-primary-50/30 border-primary-300 shadow-2xs'
                      : 'bg-white border-slate-200/80 hover:border-primary-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday ? 'bg-primary-600 text-white' : 'text-slate-700'
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    {dayInterviews.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-primary-100 text-primary-800">
                        {dayInterviews.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 my-1 overflow-y-auto max-h-[70px] scrollbar-none">
                    {dayInterviews.map((item) => {
                      const badge = getResultBadge(item.interview_result);
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleOpenEvaluation(item)}
                          className={`p-1 rounded-md text-[10px] font-semibold truncate cursor-pointer transition ${badge.cls}`}
                          title={`${item.first_name} ${item.last_name || ''} (${item.school_class?.name || 'Class ' + item.school_class_id})`}
                        >
                          <div className="font-bold truncate">
                            {item.first_name} {item.last_name || ''}
                          </div>
                          <div className="text-[9px] opacity-80 truncate">
                            {item.school_class?.name || 'Grade ' + item.school_class_id}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {!isPrincipal && (
                    <button
                      type="button"
                      onClick={() => {
                        const dateStr = day.toISOString().substring(0, 10) + 'T10:00';
                        setScheduleForm((prev) => ({ ...prev, interview_date: dateStr }));
                        setShowScheduleModal(true);
                      }}
                      className="text-[10px] text-primary-600 hover:text-primary-700 font-semibold text-center w-full py-0.5 rounded hover:bg-primary-50 transition cursor-pointer"
                    >
                      + Slot
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ================= AGENDA / TIMELINE LIST VIEW ================= */
        <div className="space-y-3">
          {scheduledInterviews.map((item) => {
            const resultBadge = getResultBadge(item.interview_result);
            const isCompleted = item.interview_result && item.interview_result !== 'Pending';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-primary-300 transition-all space-y-3"
              >
                {/* Top Row: Date, Candidate Name, Class, Outcome Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                      <LuClock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
                          {item.first_name} {item.last_name || ''}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary-50 text-primary-700 border border-primary-200">
                          {item.application_number}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                          {item.school_class?.name || 'Class ' + (item.school_class_id || '')}
                        </span>
                      </div>
                      <p className="text-xs text-primary-700 font-semibold mt-0.5 flex items-center gap-1.5">
                        <LuCalendar className="w-3.5 h-3.5" />
                        <span>{formatDateTime(item.interview_date)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${resultBadge.cls}`}>
                      {resultBadge.label}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Panel / Interviewer
                    </span>
                    <span className="font-semibold text-slate-800">
                      {item.interview_interviewer || 'Principal & Interview Committee'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Parent / Guardian Contact
                    </span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <LuPhone className="w-3 h-3 text-slate-400" />
                      {item.guardian_name} ({item.guardian_phone})
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Entrance Test Score
                    </span>
                    <span className="font-semibold text-slate-800">
                      {item.test_score ? `${item.test_score} (${item.test_status || 'Evaluated'})` : 'Exempted / Pending'}
                    </span>
                  </div>
                </div>

                {/* Interview Feedback / Notes */}
                {item.interview_notes && (
                  <div className="text-xs bg-primary-50/40 p-2.5 rounded-xl border border-primary-100 text-slate-700">
                    <strong className="text-primary-800 font-semibold block text-[11px] mb-0.5">
                      Interview Feedback & Special Instructions:
                    </strong>
                    <p className="leading-relaxed">{item.interview_notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <div className="text-[11px] text-slate-400">
                    Admission Status: <strong className="text-slate-700">{item.status}</strong>
                  </div>

                  {!isPrincipal && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEvaluation(item)}
                        className="px-3.5 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <LuUserCheck className="w-3.5 h-3.5" />
                        <span>{isCompleted ? 'Update Evaluation' : 'Evaluate Candidate'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. SCHEDULE NEW CANDIDATE INTERVIEW MODAL */}
      {/* ========================================================= */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full my-4 sm:my-8 overflow-hidden animate-scale-up">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <LuCalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 leading-tight">
                    Schedule Candidate Interview
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Assign an assessment slot and interview panel to an admission applicant
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Candidate Applicant <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={scheduleForm.admission_id}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, admission_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-semibold cursor-pointer"
                >
                  <option value="">-- Choose Candidate --</option>
                  {availableCandidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.first_name} {c.last_name || ''} ({c.application_number}) — {c.school_class?.name || 'Class ' + c.school_class_id} [{c.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Interview Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduleForm.interview_date}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, interview_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Venue / Meeting Room
                  </label>
                  <input
                    type="text"
                    value={scheduleForm.venue}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, venue: e.target.value })}
                    placeholder="e.g. Principal's Office (Room 101)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Interview Panel / Evaluator Name
                </label>
                <input
                  type="text"
                  value={scheduleForm.interview_interviewer}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, interview_interviewer: e.target.value })}
                  placeholder="e.g. Principal Dr. Sharma & Vice Principal"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Written Entrance Test Score (Optional)
                </label>
                <input
                  type="text"
                  value={scheduleForm.test_score}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, test_score: e.target.value })}
                  placeholder="e.g. 88% or 44/50 (Cleared)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instructions / Parent Note
                </label>
                <textarea
                  rows={2}
                  value={scheduleForm.interview_notes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, interview_notes: e.target.value })}
                  placeholder="e.g. Bring original birth certificate, previous school report card, and two passport photos."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-medium resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 text-xs">
                  <input
                    type="checkbox"
                    checked={scheduleForm.advance_stage}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, advance_stage: e.target.checked })}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-0 cursor-pointer"
                  />
                  <span>Automatically set applicant status to &quot;Assessment / Interview&quot; stage</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Scheduling...' : 'Confirm Schedule Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. UPDATE EVALUATION & RESULT MODAL */}
      {/* ========================================================= */}
      {selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full my-4 sm:my-8 overflow-hidden animate-scale-up">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <LuUserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 leading-tight">
                    Candidate Evaluation — {selectedInterview.first_name} {selectedInterview.last_name || ''}
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {selectedInterview.application_number} • {selectedInterview.school_class?.name || 'Class ' + selectedInterview.school_class_id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInterview(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEvaluationSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Interview Evaluation Outcome <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={evaluationForm.interview_result}
                  onChange={(e) => setEvaluationForm({ ...evaluationForm, interview_result: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-bold cursor-pointer"
                >
                  <option value="Recommended">Recommended for Admission</option>
                  <option value="Pending">Pending Evaluation / In Review</option>
                  <option value="On Hold">On Hold (Further Review)</option>
                  <option value="Not Recommended">Not Recommended</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Entrance Written Score
                  </label>
                  <input
                    type="text"
                    value={evaluationForm.test_score}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, test_score: e.target.value })}
                    placeholder="e.g. 92% (Cleared)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Panel Interviewer
                  </label>
                  <input
                    type="text"
                    value={evaluationForm.interview_interviewer}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, interview_interviewer: e.target.value })}
                    placeholder="e.g. Principal & Vice Principal"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Evaluator Remarks & Recommendations
                </label>
                <textarea
                  rows={3}
                  value={evaluationForm.interview_notes}
                  onChange={(e) => setEvaluationForm({ ...evaluationForm, interview_notes: e.target.value })}
                  placeholder="Record interviewer remarks, strengths, behavior, or conditional recommendations..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary-500 font-medium resize-none"
                />
              </div>

              {evaluationForm.interview_result === 'Recommended' && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-800 text-xs">
                    <input
                      type="checkbox"
                      checked={evaluationForm.advance_to_offer}
                      onChange={(e) => setEvaluationForm({ ...evaluationForm, advance_to_offer: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                    />
                    <span>Fast-track: Advance candidate stage to &quot;Provisional Offer Extended&quot;</span>
                  </label>
                  <p className="text-[11px] text-emerald-600 pl-6">
                    Candidate will be ready for offer letter printing and admission fee collection.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedInterview(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

