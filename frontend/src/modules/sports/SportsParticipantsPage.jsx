import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { sportsService } from '../../services/sportsService';
import {
  LuUsers,
  LuUserPlus,
  LuSearch,
  LuFilter,
  LuCircleCheck,
  LuCircleX,
  LuClock,
  LuCircleAlert,
  LuTrophy,
  LuMedal,
  LuTrash2,
  LuX,
  LuLoader,
  LuSave,
  LuChevronDown,
  LuUser,
} from 'react-icons/lu';

export default function SportsParticipantsPage() {
  const [searchParams] = useSearchParams();

  const [participants, setParticipants] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    attending: 0,
    absent: 0,
    excused: 0,
    injured: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedComp, setSelectedComp] = useState(searchParams.get('competition_id') || 'all');
  const [selectedSport, setSelectedSport] = useState(searchParams.get('sport_id') || 'all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Enroll Modal
  const [enrollModal, setEnrollModal] = useState(false);
  const [enrollForm, setEnrollForm] = useState({
    student_id: '',
    sport_id: '',
    competition_id: '',
    jersey_number: '',
    role: 'Player',
    attendance_status: 'Attending',
    performance_notes: '',
  });

  // Achievement Modal
  const [awardModal, setAwardModal] = useState(null);
  const [awardForm, setAwardForm] = useState({
    achievement: 'Gold Medal',
    performance_notes: '',
  });

  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const loadParticipantsData = async () => {
    setLoading(true);
    try {
      const [partsRes, compsRes, discsRes, stdsRes] = await Promise.all([
        sportsService.getParticipants({
          competition_id: selectedComp,
          sport_id: selectedSport,
          attendance_status: selectedStatus,
          search,
        }),
        sportsService.getCompetitions(),
        sportsService.getDisciplines(),
        sportsService.getAvailableStudents(),
      ]);

      if (partsRes?.success) {
        setParticipants(partsRes.data.participants || []);
        if (partsRes.data.summary) {
          setSummary(partsRes.data.summary);
        }
      }

      if (compsRes?.success) setCompetitions(compsRes.data.competitions || []);
      if (discsRes?.success) {
        setDisciplines(discsRes.data.sports || []);
        if (discsRes.data.sports?.length > 0 && !enrollForm.sport_id) {
          setEnrollForm((prev) => ({ ...prev, sport_id: discsRes.data.sports[0].id }));
        }
      }
      if (stdsRes?.success) {
        setAvailableStudents(stdsRes.data.students || []);
        if (stdsRes.data.students?.length > 0 && !enrollForm.student_id) {
          setEnrollForm((prev) => ({ ...prev, student_id: stdsRes.data.students[0].id }));
        }
      }
    } catch (err) {
      console.error('Error fetching participants data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParticipantsData();
    if (searchParams.get('action') === 'enroll') {
      setEnrollModal(true);
    }
  }, [selectedComp, selectedSport, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadParticipantsData();
  };

  // Quick toggle attendance status
  const handleStatusChange = async (participantId, newStatus) => {
    try {
      const res = await sportsService.updateParticipantAttendance(participantId, {
        attendance_status: newStatus,
      });
      if (res.success) {
        showToast(`Attendance updated to "${newStatus}".`);
        loadParticipantsData();
      }
    } catch (err) {
      alert(err.message || 'Failed to update attendance.');
    }
  };

  // Submit Enroll Form
  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await sportsService.enrollParticipant(enrollForm);
      if (res.success) {
        showToast('Student successfully enrolled into sports event.');
        setEnrollModal(false);
        setEnrollForm({
          student_id: availableStudents[0]?.id || '',
          sport_id: disciplines[0]?.id || '',
          competition_id: '',
          jersey_number: '',
          role: 'Player',
          attendance_status: 'Attending',
          performance_notes: '',
        });
        loadParticipantsData();
      }
    } catch (err) {
      alert(err.message || 'Failed to enroll student.');
    } finally {
      setSaving(false);
    }
  };

  // Submit Award Form
  const handleAwardSubmit = async (e) => {
    e.preventDefault();
    if (!awardModal) return;
    setSaving(true);
    try {
      const res = await sportsService.recordAchievement(awardModal.id, awardForm);
      if (res.success) {
        showToast('Achievement / Medal recorded.');
        setAwardModal(null);
        loadParticipantsData();
      }
    } catch (err) {
      alert(err.message || 'Failed to record achievement.');
    } finally {
      setSaving(false);
    }
  };

  // Delete participant
  const handleDeleteParticipant = async (id, studentName) => {
    if (!window.confirm(`Remove ${studentName} from this sports roster?`)) return;
    try {
      await sportsService.deleteParticipant(id);
      showToast('Student removed from sports roster.');
      loadParticipantsData();
    } catch (err) {
      alert(err.message);
    }
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
          <h1 className="text-base sm:text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <LuUsers className="w-5 h-5 text-primary-600" />
            Student Athlete Attendance & Roster
          </h1>
          <p className="text-slate-500 text-[10px] sm:text-xs mt-0.5">
            Track students attending sports activities, mark presence for matches, and record performance
          </p>
        </div>

        <button
          onClick={() => setEnrollModal(true)}
          className="px-3.5 py-2 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
        >
          <LuUserPlus className="w-3.5 h-3.5" />
          Enroll Student Athlete
        </button>
      </div>

      {/* Attendance KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Total Enrolled</span>
          <div className="text-xl font-extrabold text-slate-900 mt-0.5">{summary.total}</div>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
            <LuCircleCheck className="w-3.5 h-3.5" /> Attending / Present
          </span>
          <div className="text-xl font-extrabold text-emerald-700 mt-0.5">{summary.attending}</div>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
            <LuCircleX className="w-3.5 h-3.5" /> Absent
          </span>
          <div className="text-xl font-extrabold text-rose-700 mt-0.5">{summary.absent}</div>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
            <LuClock className="w-3.5 h-3.5" /> Excused Leave
          </span>
          <div className="text-xl font-extrabold text-amber-700 mt-0.5">{summary.excused}</div>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-purple-200 bg-purple-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-purple-700 flex items-center gap-1">
            <LuCircleAlert className="w-3.5 h-3.5" /> Injured / Bench
          </span>
          <div className="text-xl font-extrabold text-purple-700 mt-0.5">{summary.injured}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[220px] relative">
          <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student athlete name, admission no, roll no..."
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </form>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <select
            value={selectedComp}
            onChange={(e) => setSelectedComp(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Tournaments</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Sports</option>
            {disciplines.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Attendance</option>
            <option value="Attending">Attending</option>
            <option value="Absent">Absent</option>
            <option value="Excused">Excused</option>
            <option value="Injured">Injured</option>
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <LuLoader className="w-6 h-6 animate-spin mx-auto text-primary-600 mb-2" />
            Loading student athlete roster...
          </div>
        ) : participants.length === 0 ? (
          <div className="p-12 text-center">
            <LuUsers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No Student Athletes Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No students are currently enrolled under these filters. Click "Enroll Student Athlete" to add students to this tournament.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Student Athlete</th>
                  <th className="py-3 px-4">Class & Section</th>
                  <th className="py-3 px-4">Sport & Jersey</th>
                  <th className="py-3 px-4">Tournament / Event</th>
                  <th className="py-3 px-4">Team Role</th>
                  <th className="py-3 px-4">Attendance Status</th>
                  <th className="py-3 px-4">Medal / Achievement</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                {participants.map((item) => {
                  const student = item.student;
                  const studentName = student
                    ? `${student.first_name || ''} ${student.last_name || ''}`.trim()
                    : 'Unknown Student';
                  const classSection = student?.schoolClass
                    ? `${student.schoolClass.name}${student.section ? `-${student.section.name}` : ''}`
                    : 'N/A';

                  const isAttending = item.attendance_status === 'Attending';
                  const isAbsent = item.attendance_status === 'Absent';
                  const isExcused = item.attendance_status === 'Excused';
                  const isInjured = item.attendance_status === 'Injured';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Student Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {studentName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{studentName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Adm: {student?.admission_number || '—'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Class */}
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {classSection}
                      </td>

                      {/* Sport & Jersey */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {item.sport?.name}
                          </span>
                          {item.jersey_number && (
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                              #{item.jersey_number}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Competition */}
                      <td className="py-3 px-4 font-medium text-slate-700 max-w-[200px] truncate">
                        {item.competition?.title || 'General Squad Practice'}
                      </td>

                      {/* Team Role */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {item.role || 'Player'}
                        </span>
                      </td>

                      {/* Attendance Toggle */}
                      <td className="py-3 px-4">
                        <select
                          value={item.attendance_status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer focus:outline-none ${
                            isAttending
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : isAbsent
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : isExcused
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-purple-50 text-purple-800 border-purple-300'
                          }`}
                        >
                          <option value="Attending">✓ Attending</option>
                          <option value="Absent">✗ Absent</option>
                          <option value="Excused">⏱ Excused</option>
                          <option value="Injured">✚ Injured</option>
                        </select>
                      </td>

                      {/* Achievement */}
                      <td className="py-3 px-4">
                        {item.achievement && item.achievement !== 'None' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                            <LuMedal className="w-3 h-3 text-amber-600" />
                            {item.achievement}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Regular Participant</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setAwardModal(item);
                              setAwardForm({
                                achievement: item.achievement !== 'None' ? item.achievement : 'Gold Medal',
                                performance_notes: item.performance_notes || '',
                              });
                            }}
                            title="Award Medal / Certificate"
                            className="p-1.5 rounded-lg border border-slate-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300 transition-colors cursor-pointer"
                          >
                            <LuMedal className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteParticipant(item.id, studentName)}
                            title="Remove from roster"
                            className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors cursor-pointer"
                          >
                            <LuTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: ENROLL STUDENT ATHLETE */}
      {enrollModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <LuUserPlus className="w-5 h-5 text-primary-600" />
                <h3 className="text-base font-bold text-slate-800">Enroll Student Athlete</h3>
              </div>
              <button onClick={() => setEnrollModal(false)} className="text-slate-400 hover:text-slate-700">
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Enrolled Student <span className="text-red-500">*</span>
                </label>
                <select
                  value={enrollForm.student_id}
                  onChange={(e) => setEnrollForm({ ...enrollForm, student_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  required
                >
                  {availableStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Roll: {s.roll_number || '—'}, {s.class_section})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sport Discipline <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={enrollForm.sport_id}
                    onChange={(e) => setEnrollForm({ ...enrollForm, sport_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    required
                  >
                    {disciplines.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Tournament (Optional)</label>
                  <select
                    value={enrollForm.competition_id}
                    onChange={(e) => setEnrollForm({ ...enrollForm, competition_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="">General Team Squad</option>
                    {competitions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jersey / Bib No.</label>
                  <input
                    type="text"
                    value={enrollForm.jersey_number}
                    onChange={(e) => setEnrollForm({ ...enrollForm, jersey_number: e.target.value })}
                    placeholder="e.g. 07, 10"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Squad Role</label>
                  <select
                    value={enrollForm.role}
                    onChange={(e) => setEnrollForm({ ...enrollForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Captain">Captain</option>
                    <option value="Vice-Captain">Vice-Captain</option>
                    <option value="Player">Player</option>
                    <option value="Goalkeeper">Goalkeeper</option>
                    <option value="Substitute">Substitute</option>
                    <option value="Runner">Runner</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Attendance Status</label>
                  <select
                    value={enrollForm.attendance_status}
                    onChange={(e) => setEnrollForm({ ...enrollForm, attendance_status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Attending">Attending</option>
                    <option value="Absent">Absent</option>
                    <option value="Excused">Excused</option>
                    <option value="Injured">Injured</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Coach Assessment / Notes</label>
                <textarea
                  rows={2}
                  value={enrollForm.performance_notes}
                  onChange={(e) => setEnrollForm({ ...enrollForm, performance_notes: e.target.value })}
                  placeholder="Trial notes, position suitability..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEnrollModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold flex items-center gap-1.5 shadow-md shadow-primary-500/20 cursor-pointer disabled:opacity-60"
                >
                  {saving ? <LuLoader className="w-3.5 h-3.5 animate-spin" /> : <LuSave className="w-3.5 h-3.5" />}
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: AWARD MEDAL / CERTIFICATE */}
      {awardModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <LuMedal className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-800">Record Medal / Achievement</h3>
              </div>
              <button onClick={() => setAwardModal(null)} className="text-slate-400 hover:text-slate-700">
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Awarding achievement to:{' '}
              <strong className="text-slate-800">
                {awardModal.student
                  ? `${awardModal.student.first_name || ''} ${awardModal.student.last_name || ''}`.trim()
                  : 'Student'}
              </strong>
            </p>

            <form onSubmit={handleAwardSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medal / Recognition</label>
                <select
                  value={awardForm.achievement}
                  onChange={(e) => setAwardForm({ ...awardForm, achievement: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Gold Medal">Gold Medal (1st Place)</option>
                  <option value="Silver Medal">Silver Medal (2nd Place)</option>
                  <option value="Bronze Medal">Bronze Medal (3rd Place)</option>
                  <option value="Best Player / MVP">Best Player / MVP</option>
                  <option value="Man of the Match">Man of the Match</option>
                  <option value="Participant Certificate">Participant Certificate</option>
                  <option value="None">None</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarks / Score Summary</label>
                <textarea
                  rows={2}
                  value={awardForm.performance_notes}
                  onChange={(e) => setAwardForm({ ...awardForm, performance_notes: e.target.value })}
                  placeholder="e.g. Scored winning goal in 89th minute, finished 100m in 11.2s..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAwardModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5"
                >
                  {saving ? <LuLoader className="w-3.5 h-3.5 animate-spin" /> : <LuSave className="w-3.5 h-3.5" />}
                  Award Honor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
