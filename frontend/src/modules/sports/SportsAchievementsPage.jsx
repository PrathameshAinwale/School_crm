import React, { useState, useEffect } from 'react';
import { sportsService } from '../../services/sportsService';
import {
  LuTrophy,
  LuMedal,
  LuSparkles,
  LuAward,
  LuSearch,
  LuFilter,
  LuLoader,
  LuPlus,
  LuX,
  LuCheck,
  LuPencil,
  LuTrash2,
  LuSave,
  LuUser,
} from 'react-icons/lu';

export default function SportsAchievementsPage() {
  const [participants, setParticipants] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [medalFilter, setMedalFilter] = useState('all');
  const [sportFilter, setSportFilter] = useState('all');

  // Modals & form state
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [modalClassId, setModalClassId] = useState('');
  const [modalSectionId, setModalSectionId] = useState('');

  const [honorForm, setHonorForm] = useState({
    student_id: '',
    sport_id: '',
    competition_id: '',
    achievement: 'Gold Medal',
    custom_achievement: '',
    performance_notes: '',
    jersey_number: '',
    role: 'Player',
  });

  const [editForm, setEditForm] = useState({
    achievement: '',
    performance_notes: '',
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const loadAchievements = async () => {
    setLoading(true);
    try {
      const [res, discRes, compRes, stdsRes] = await Promise.all([
        sportsService.getParticipants(),
        sportsService.getDisciplines(),
        sportsService.getCompetitions(),
        sportsService.getAvailableStudents(),
      ]);

      if (res?.success) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.participants || []);
        const achieved = list.filter(
          (p) => p.achievement && p.achievement !== 'None'
        );
        setParticipants(achieved);
      }

      if (discRes?.success) {
        setDisciplines(Array.isArray(discRes.data) ? discRes.data : (discRes.data?.sports || []));
      }

      if (compRes?.success) {
        setCompetitions(Array.isArray(compRes.data) ? compRes.data : (compRes.data?.competitions || []));
      }

      if (stdsRes?.success) {
        const studentList = Array.isArray(stdsRes.data) ? stdsRes.data : (stdsRes.data?.students || []);
        const classList = stdsRes.data?.classes || [];
        setAvailableStudents(studentList);
        setClasses(classList);
      }
    } catch (err) {
      console.error('Error fetching achievements data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  // Cascade selections
  const selectedClassObj = classes.find((c) => String(c.id) === String(modalClassId));
  const availableDivisions = selectedClassObj?.sections || [];

  const filteredStudents = availableStudents.filter((s) => {
    if (modalClassId && String(s.class_id) !== String(modalClassId)) return false;
    if (modalSectionId && String(s.section_id) !== String(modalSectionId)) return false;
    return true;
  });

  const selectedStudentObj = availableStudents.find((s) => String(s.id) === String(honorForm.student_id));

  const handleModalClassChange = (classId) => {
    setModalClassId(classId);
    setModalSectionId('');
    const matching = availableStudents.filter((s) => !classId || String(s.class_id) === String(classId));
    setHonorForm((prev) => ({
      ...prev,
      student_id: matching[0]?.id || '',
    }));
  };

  const handleModalSectionChange = (sectionId) => {
    setModalSectionId(sectionId);
    const matching = availableStudents.filter(
      (s) =>
        (!modalClassId || String(s.class_id) === String(modalClassId)) &&
        (!sectionId || String(s.section_id) === String(sectionId))
    );
    setHonorForm((prev) => ({
      ...prev,
      student_id: matching[0]?.id || '',
    }));
  };

  const handleOpenAddModal = () => {
    const firstClass = classes.find((c) => availableStudents.some((s) => String(s.class_id) === String(c.id))) || classes[0];
    const initialClassId = firstClass ? String(firstClass.id) : '';
    setModalClassId(initialClassId);
    setModalSectionId('');

    const matchingStudents = availableStudents.filter((s) => !initialClassId || String(s.class_id) === initialClassId);
    setHonorForm({
      student_id: matchingStudents[0]?.id || '',
      sport_id: disciplines[0]?.id || '',
      competition_id: '',
      achievement: 'Gold Medal',
      custom_achievement: '',
      performance_notes: '',
      jersey_number: '',
      role: 'Player',
    });
    setAddModal(true);
  };

  const handleSaveAchievement = async (e) => {
    e.preventDefault();
    if (!honorForm.student_id) {
      showToast('Please select a student athlete.');
      return;
    }
    if (!honorForm.sport_id) {
      showToast('Please select a sport discipline.');
      return;
    }

    const finalAchievement = honorForm.achievement === 'Custom'
      ? honorForm.custom_achievement?.trim()
      : honorForm.achievement;

    if (!finalAchievement) {
      showToast('Please enter an achievement / honor title.');
      return;
    }

    if (!honorForm.performance_notes?.trim()) {
      showToast('Please describe what achievement the student accomplished.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        student_id: honorForm.student_id,
        sport_id: honorForm.sport_id,
        competition_id: honorForm.competition_id || null,
        achievement: finalAchievement,
        performance_notes: honorForm.performance_notes.trim(),
        jersey_number: honorForm.jersey_number || null,
        role: honorForm.role || 'Player',
      };

      const res = await sportsService.storeAchievement(payload);
      if (res?.success) {
        showToast('Hall of Fame achievement recorded successfully!');
        setAddModal(false);
        loadAchievements();
      } else {
        showToast(res?.message || 'Failed to record achievement.');
      }
    } catch (err) {
      console.error('Error recording achievement:', err);
      showToast(err.message || 'Error recording achievement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditModal = (item) => {
    setEditModal(item);
    setEditForm({
      achievement: item.achievement || 'Gold Medal',
      performance_notes: item.performance_notes || '',
    });
  };

  const handleUpdateAchievement = async (e) => {
    e.preventDefault();
    if (!editModal) return;

    if (!editForm.achievement?.trim()) {
      showToast('Honor / Achievement title is required.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await sportsService.recordAchievement(editModal.id, {
        achievement: editForm.achievement.trim(),
        performance_notes: editForm.performance_notes?.trim() || null,
      });

      if (res?.success) {
        showToast('Honor details updated successfully.');
        setEditModal(null);
        loadAchievements();
      } else {
        showToast(res?.message || 'Failed to update honor.');
      }
    } catch (err) {
      showToast(err.message || 'Error updating honor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAchievement = async (item) => {
    const studentName = item.student
      ? `${item.student.first_name || ''} ${item.student.last_name || ''}`.trim()
      : 'Athlete';

    if (!window.confirm(`Are you sure you want to remove the "${item.achievement}" honor for ${studentName}?`)) {
      return;
    }

    try {
      const res = await sportsService.recordAchievement(item.id, {
        achievement: 'None',
        performance_notes: null,
      });

      if (res?.success) {
        showToast('Honor removed from Hall of Fame.');
        loadAchievements();
      } else {
        showToast(res?.message || 'Failed to remove honor.');
      }
    } catch (err) {
      showToast(err.message || 'Error removing honor');
    }
  };

  // KPI calculations
  const goldCount = participants.filter((p) => p.achievement?.toLowerCase().includes('gold')).length;
  const silverCount = participants.filter((p) => p.achievement?.toLowerCase().includes('silver')).length;
  const bronzeCount = participants.filter((p) => p.achievement?.toLowerCase().includes('bronze')).length;
  const mvpCount = participants.filter(
    (p) =>
      p.achievement?.toLowerCase().includes('best player') ||
      p.achievement?.toLowerCase().includes('mvp') ||
      p.achievement?.toLowerCase().includes('trophy')
  ).length;

  // Filter list
  const filtered = participants.filter((p) => {
    const matchesMedal =
      medalFilter === 'all' || p.achievement?.toLowerCase().includes(medalFilter.toLowerCase());
    const matchesSport = sportFilter === 'all' || String(p.sport_id) === String(sportFilter);

    const student = p.student;
    const studentName = student
      ? `${student.first_name || ''} ${student.last_name || ''}`.toLowerCase()
      : '';
    const admNo = (student?.admission_number || '').toLowerCase();
    const notes = (p.performance_notes || '').toLowerCase();
    const ach = (p.achievement || '').toLowerCase();
    const query = search.toLowerCase().trim();

    const matchesSearch =
      !query ||
      studentName.includes(query) ||
      admNo.includes(query) ||
      notes.includes(query) ||
      ach.includes(query);

    return matchesMedal && matchesSport && matchesSearch;
  });

  return (
    <div className="space-y-5 sm:space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-slide-up">
          <LuCheck className="w-4 h-4 text-emerald-400" />
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-base sm:text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-primary-50 rounded-lg sm:rounded-xl text-primary-600">
              <LuTrophy className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            Hall of Fame & Sports Honors
          </h1>
          <p className="text-slate-500 text-[10px] sm:text-xs mt-0.5 sm:mt-1 ml-0.5">
            Celebrate medals, championships, and athletic excellence achieved by institutional student athletes
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0"
        >
          <LuPlus className="w-4 h-4" />
          Add Hall of Fame Honor
        </button>
      </div>

      {/* Podium Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 hover:border-amber-300 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-amber-700">Gold Medals</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <LuMedal className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-800 mt-2">{goldCount}</div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">1st Place Championships</p>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-600">Silver Medals</span>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <LuMedal className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-800 mt-2">{silverCount}</div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">Runner-up Finalists</p>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 hover:border-orange-300 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-orange-700">Bronze Medals</span>
            <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
              <LuMedal className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-800 mt-2">{bronzeCount}</div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">3rd Place Podiums</p>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 hover:border-purple-300 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-purple-700">MVP / Trophies</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <LuSparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-800 mt-2">{mvpCount}</div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">Best Player Recognitions</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setMedalFilter('all')}
            className={`px-3 py-1.5 rounded-lg sm:rounded-xl font-semibold transition-all cursor-pointer ${
              medalFilter === 'all'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Honors ({participants.length})
          </button>
          <button
            onClick={() => setMedalFilter('gold')}
            className={`px-3 py-1.5 rounded-lg sm:rounded-xl font-semibold transition-all cursor-pointer ${
              medalFilter === 'gold'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            Gold Medals
          </button>
          <button
            onClick={() => setMedalFilter('silver')}
            className={`px-3 py-1.5 rounded-lg sm:rounded-xl font-semibold transition-all cursor-pointer ${
              medalFilter === 'silver'
                ? 'bg-slate-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Silver Medals
          </button>
          <button
            onClick={() => setMedalFilter('bronze')}
            className={`px-3 py-1.5 rounded-lg sm:rounded-xl font-semibold transition-all cursor-pointer ${
              medalFilter === 'bronze'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-orange-50 text-orange-800 hover:bg-orange-100 border border-orange-200'
            }`}
          >
            Bronze Medals
          </button>
          <button
            onClick={() => setMedalFilter('mvp')}
            className={`px-3 py-1.5 rounded-lg sm:rounded-xl font-semibold transition-all cursor-pointer ${
              medalFilter === 'mvp'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            MVP & Best Player
          </button>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <LuSearch className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search athlete or feat..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer"
          >
            <option value="all">All Sports</option>
            {disciplines.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Athletes Honors Showcase */}
      {loading ? (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-12 text-center text-xs text-slate-400 shadow-xs">
          <LuLoader className="w-6 h-6 animate-spin mx-auto text-primary-600 mb-2" />
          Loading Hall of Fame...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <LuAward className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No Honors Logged for this Category</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Medals and trophies awarded in competitions will appear in this Hall of Fame showcase.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <LuPlus className="w-4 h-4" />
            Record Hall of Fame Honor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const student = item.student;
            const studentName = student
              ? `${student.first_name || ''} ${student.last_name || ''}`.trim()
              : 'Student Athlete';
            const achLower = (item.achievement || '').toLowerCase();
            const isGold = achLower.includes('gold');
            const isSilver = achLower.includes('silver');
            const isBronze = achLower.includes('bronze');
            const isMvp = achLower.includes('best player') || achLower.includes('mvp') || achLower.includes('trophy');

            const classSection = student?.schoolClass
              ? `${student.schoolClass.name}${student.section ? `-${student.section.name}` : ''}`
              : 'N/A';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isGold
                      ? 'bg-amber-400'
                      : isSilver
                      ? 'bg-slate-400'
                      : isBronze
                      ? 'bg-orange-500'
                      : isMvp
                      ? 'bg-purple-600'
                      : 'bg-emerald-500'
                  }`}
                />

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {item.sport?.name || 'General Athletics'}
                    </span>
                    <span
                      className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                        isGold
                          ? 'bg-amber-50 text-amber-800 border border-amber-300'
                          : isSilver
                          ? 'bg-slate-100 text-slate-800 border border-slate-300'
                          : isBronze
                          ? 'bg-orange-50 text-orange-800 border border-orange-300'
                          : isMvp
                          ? 'bg-purple-50 text-purple-800 border border-purple-300'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      <LuMedal className="w-3.5 h-3.5" />
                      {item.achievement}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                      {studentName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Class {classSection} • Adm: {student?.admission_number || '—'}
                    </p>
                  </div>

                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                    <div className="text-[11px] font-semibold text-slate-700">
                      {item.competition?.title || 'Campus Sports Achievement'}
                    </div>
                    {item.performance_notes ? (
                      <p className="text-xs text-slate-600 italic mt-1 leading-relaxed">
                        "{item.performance_notes}"
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic mt-1">
                        No additional performance notes logged.
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-[11px] font-mono text-slate-500">
                    {item.jersey_number ? `Jersey #${item.jersey_number}` : 'No Bib'}{' '}
                    • {item.role || 'Player'}
                  </div>

                  <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      title="Edit Honor & Accomplishment"
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-primary-600 hover:bg-primary-50 hover:border-primary-200 transition-colors cursor-pointer"
                    >
                      <LuPencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAchievement(item)}
                      title="Remove from Hall of Fame"
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
                    >
                      <LuTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: ADD HALL OF FAME HONOR */}
      {addModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <LuTrophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Record Hall of Fame Honor</h3>
                  <p className="text-[11px] text-slate-400">Award medal, trophy, or honor to a student athlete</p>
                </div>
              </div>
              <button
                onClick={() => setAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAchievement} className="space-y-4 text-xs">
              {/* 1. Class & Division selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Select Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={modalClassId}
                    onChange={(e) => handleModalClassChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-primary-500 transition-colors cursor-pointer"
                    required
                  >
                    <option value="">-- Choose Class --</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Select Div (Section)
                  </label>
                  <select
                    value={modalSectionId}
                    onChange={(e) => handleModalSectionChange(e.target.value)}
                    disabled={!modalClassId || availableDivisions.length === 0}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-primary-500 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="">{availableDivisions.length === 0 ? 'All / No Div' : 'All Divisions'}</option>
                    {availableDivisions.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        Div {sec.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. Student Name Dropdown */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Student Name <span className="text-red-500">*</span>
                </label>
                <select
                  value={honorForm.student_id}
                  onChange={(e) => setHonorForm({ ...honorForm, student_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-primary-500 transition-colors cursor-pointer"
                  required
                >
                  <option value="">
                    {filteredStudents.length === 0
                      ? modalClassId
                        ? 'No students found in this class/div'
                        : '-- Select Class first --'
                      : '-- Select Student Name --'}
                  </option>
                  {filteredStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Roll: {s.roll_number || '—'}{s.admission_number ? `, Adm: ${s.admission_number}` : ''})
                    </option>
                  ))}
                </select>

                {selectedStudentObj && (
                  <div className="mt-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <LuUser className="w-3.5 h-3.5 text-emerald-600" />
                      <strong className="font-bold">{selectedStudentObj.name}</strong> • Roll #{selectedStudentObj.roll_number || '—'}
                    </span>
                    <span className="font-semibold text-emerald-700">{selectedStudentObj.class_section}</span>
                  </div>
                )}
              </div>

              {/* 3. Sport Discipline & Target Tournament */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sport Discipline <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={honorForm.sport_id}
                    onChange={(e) => setHonorForm({ ...honorForm, sport_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-primary-500 transition-colors cursor-pointer"
                    required
                  >
                    <option value="">-- Choose Sport --</option>
                    {disciplines.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tournament / Event (Optional)
                  </label>
                  <select
                    value={honorForm.competition_id}
                    onChange={(e) => setHonorForm({ ...honorForm, competition_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-primary-500 transition-colors cursor-pointer"
                  >
                    <option value="">General Campus Honors / No Tournament</option>
                    {competitions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. Honor Type */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Honor / Medal Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={honorForm.achievement}
                  onChange={(e) => setHonorForm({ ...honorForm, achievement: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-primary-500 transition-colors cursor-pointer"
                  required
                >
                  <option value="Gold Medal">🥇 Gold Medal (1st Place Champion)</option>
                  <option value="Silver Medal">🥈 Silver Medal (2nd Place Finalist)</option>
                  <option value="Bronze Medal">🥉 Bronze Medal (3rd Place Podium)</option>
                  <option value="MVP / Best Player">⭐ MVP / Best Player of the Tournament</option>
                  <option value="Highest Goalscorer Trophy">🏆 Highest Goalscorer Trophy</option>
                  <option value="State Championship Trophy">🏆 State Championship Trophy</option>
                  <option value="Inter-School Athletic Champion">🎖️ Inter-School Athletic Champion</option>
                  <option value="Certificate of Athletic Merit">📜 Certificate of Athletic Merit</option>
                  <option value="Custom">✨ Other / Custom Honor Title...</option>
                </select>

                {honorForm.achievement === 'Custom' && (
                  <input
                    type="text"
                    value={honorForm.custom_achievement}
                    onChange={(e) => setHonorForm({ ...honorForm, custom_achievement: e.target.value })}
                    placeholder="Enter custom award or honor title (e.g. Best Goalkeeper)"
                    className="mt-2 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-primary-500"
                    required
                  />
                )}
              </div>

              {/* 5. What achievement has the student accomplished */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  What achievement did the student accomplish? <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={honorForm.performance_notes}
                  onChange={(e) => setHonorForm({ ...honorForm, performance_notes: e.target.value })}
                  rows={3}
                  placeholder="Describe the accomplishment (e.g., Scored the winning goal in the 89th minute of the State Cup final, leading the school squad to victory; selected for state junior camp)."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-primary-500 resize-none"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  This feat will be displayed on the student's Hall of Fame card and permanent sports record.
                </p>
              </div>

              {/* 6. Jersey / Bib No. & Role */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jersey / Bib No. (Optional)
                  </label>
                  <input
                    type="text"
                    value={honorForm.jersey_number}
                    onChange={(e) => setHonorForm({ ...honorForm, jersey_number: e.target.value })}
                    placeholder="e.g. 10, 07"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Squad Role
                  </label>
                  <select
                    value={honorForm.role}
                    onChange={(e) => setHonorForm({ ...honorForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-primary-500 transition-colors cursor-pointer"
                  >
                    <option value="Player">Player</option>
                    <option value="Team Captain">Team Captain</option>
                    <option value="Vice Captain">Vice Captain</option>
                    <option value="Goalkeeper">Goalkeeper</option>
                    <option value="Striker">Striker</option>
                    <option value="Individual Athlete">Individual Athlete</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {submitting ? (
                    <LuLoader className="w-4 h-4 animate-spin" />
                  ) : (
                    <LuSave className="w-4 h-4" />
                  )}
                  Save Hall of Fame Honor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT HONOR & ACCOMPLISHMENT */}
      {editModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary-50 text-primary-600 rounded-xl">
                  <LuPencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Edit Hall of Fame Honor</h3>
                  <p className="text-[11px] text-slate-400">
                    {editModal.student
                      ? `${editModal.student.first_name || ''} ${editModal.student.last_name || ''}`.trim()
                      : 'Student Athlete'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAchievement} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Honor / Medal Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.achievement}
                  onChange={(e) => setEditForm({ ...editForm, achievement: e.target.value })}
                  placeholder="e.g. Gold Medal, MVP / Best Player"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  What accomplishment did the student achieve? <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={editForm.performance_notes}
                  onChange={(e) => setEditForm({ ...editForm, performance_notes: e.target.value })}
                  rows={4}
                  placeholder="Describe the student athlete's accomplishments..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-primary-500 resize-none"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModal(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {submitting ? (
                    <LuLoader className="w-4 h-4 animate-spin" />
                  ) : (
                    <LuSave className="w-4 h-4" />
                  )}
                  Update Honor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
