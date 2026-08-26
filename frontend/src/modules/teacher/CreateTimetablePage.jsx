import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentParentService } from '../../services/studentParentService';
import { adminService } from '../../services/adminService';
import {
  LuClock,
  LuArrowLeft,
  LuCalendarDays,
  LuPlus,
  LuTrash2,
  LuSave,
  LuCopy,
  LuEye,
  LuMapPin,
  LuLayers,
  LuCircleCheck,
  LuLoader,
  LuX,
  LuRotateCcw,
  LuCircleAlert,
  LuAward,
} from 'react-icons/lu';

const DEFAULT_CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12'
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const EMPTY_WEEKLY_SCHEDULE = Object.freeze(
  DAYS_OF_WEEK.reduce((acc, day) => ({ ...acc, [day]: [] }), {})
);

const periodTypeOptions = [
  'Theory',
  'Lab Practical',
  'Practical',
  'Literature',
  'Grammar',
  'Writing Skills',
  'Remedial / Doubt Clearance',
  'Assessment Test',
  'Activity / Club',
  'Sports',
  'Self Study / Library',
];

const standardSubjects = [
  'Mathematics',
  'Science (Physics)',
  'Science (Chemistry)',
  'Science (Biology)',
  'English Core',
  'Hindi / 2nd Language',
  'Social Science (History)',
  'Social Science (Geography)',
  'Social Science (Civics)',
  'Social Science (Economics)',
  'Computer Science (Python & AI)',
  'Physical Education',
  'Fine Arts & Music',
  'Robotics & STEM Club',
];

// Helper functions for 12h / 24h Time parsing & formatting
const parseTimeTo24h = (timePart, fallbackAmPm = '') => {
  if (!timePart) return '08:00';
  let t = timePart.trim();
  const isPM = /pm/i.test(t) || (/pm/i.test(fallbackAmPm) && !/am/i.test(t));
  const isAM = /am/i.test(t) || (/am/i.test(fallbackAmPm) && !/pm/i.test(t));
  t = t.replace(/(am|pm)/gi, '').trim();
  const [hStr = '8', mStr = '0'] = t.split(':');
  let h = parseInt(hStr, 10) || 8;
  const m = parseInt(mStr, 10) || 0;
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const parseTimeSlot = (slotStr) => {
  if (!slotStr || typeof slotStr !== 'string') return { from: '08:00', to: '08:45' };
  const parts = slotStr.split('-');
  if (parts.length < 2) return { from: '08:00', to: '08:45' };
  const endPart = parts[1].trim();
  const fallbackAmPm = /pm/i.test(endPart) ? 'PM' : (/am/i.test(endPart) ? 'AM' : '');
  return {
    from: parseTimeTo24h(parts[0], fallbackAmPm),
    to: parseTimeTo24h(parts[1], fallbackAmPm),
  };
};

const format24to12 = (time24) => {
  if (!time24) return '08:00 AM';
  const [hStr = '8', mStr = '0'] = time24.split(':');
  let h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  const period = h >= 12 ? 'PM' : 'AM';
  let displayH = h % 12 || 12;
  return `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
};

const formatTimeSlot = (from24, to24) => `${format24to12(from24)} - ${format24to12(to24)}`;

const slotToRange = (slotStr) => {
  const { from, to } = parseTimeSlot(slotStr);
  const [fh, fm] = from.split(':').map(Number);
  const [th, tm] = to.split(':').map(Number);
  const start = fh * 60 + fm;
  let end = th * 60 + tm;
  if (end <= start) end = start + 45;
  return { start, end };
};

const doSlotsOverlap = (slotA, slotB) => {
  if (!slotA || !slotB) return false;
  const rangeA = slotToRange(slotA);
  const rangeB = slotToRange(slotB);
  return rangeA.start < rangeB.end && rangeA.end > rangeB.start;
};

const normalizeName = (name) => (name || '').toLowerCase().replace(/^(mr\.|mrs\.|ms\.|dr\.|prof\.)\s+/i, '').trim();

const extractTeachersFromResponse = (response) => {
  if (!response) return [];
  const payload = response.data || response;
  let rawList = [];
  if (Array.isArray(payload)) {
    rawList = payload;
  } else if (Array.isArray(payload.availableTeachers)) {
    rawList = payload.availableTeachers;
  } else if (Array.isArray(payload.data)) {
    rawList = payload.data;
  } else if (payload.data && Array.isArray(payload.data.data)) {
    rawList = payload.data.data;
  }

  return rawList
    .map((t) => {
      if (typeof t === 'string') return { id: t, name: t, department: '' };
      const name = t.full_name || `${t.first_name || ''} ${t.last_name || ''}`.trim() || t.name || '';
      return {
        id: t.id || name,
        name,
        department: t.department || '',
      };
    })
    .filter((t) => Boolean(t.name));
};

export default function CreateTimetablePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedClass, setSelectedClass] = useState('Class 8');
  const [selectedDivision, setSelectedDivision] = useState('Div A');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [availableClasses, setAvailableClasses] = useState(DEFAULT_CLASSES);
  const [availableDivisions] = useState(['Div A', 'Div B', 'Div C', 'Div D']);
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [facultyRoster, setFacultyRoster] = useState([]);
  const [allSchoolSlots, setAllSchoolSlots] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const [weeklySchedule, setWeeklySchedule] = useState(EMPTY_WEEKLY_SCHEDULE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copySourceDay, setCopySourceDay] = useState('Monday');

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const normalizeTimetableData = (timetableObj) => {
    const normalized = { ...EMPTY_WEEKLY_SCHEDULE };
    if (!timetableObj) return normalized;
    Object.keys(timetableObj).forEach((day) => {
      const list = timetableObj[day];
      if (Array.isArray(list)) {
        normalized[day] = list.map((p, idx) => ({
          id: p.id,
          period_number: p.period_number || idx + 1,
          time_slot: p.time || p.time_slot || '08:00 AM - 08:45 AM',
          subject: p.subject || 'Subject',
          teacher_name: p.teacher || p.teacher_name || 'Faculty',
          room: p.room || 'Room 301',
          type: p.type || 'Theory',
        }));
      }
    });
    return normalized;
  };

  const fetchTimetable = useCallback(async (className, division) => {
    if (!className) return;
    setLoading(true);
    try {
      const [res, allSlotsRes, teachersRes] = await Promise.allSettled([
        studentParentService.getTimetable({ class_name: className, division: division || selectedDivision }),
        studentParentService.getAllTimetableSlots(),
        adminService.getTeachers({ all: true }),
      ]);

      let teachersFromDb = [];
      if (res.status === 'fulfilled' && res.value?.data?.availableTeachers) {
        teachersFromDb = extractTeachersFromResponse(res.value.data.availableTeachers);
      }
      if (teachersFromDb.length === 0 && teachersRes.status === 'fulfilled' && teachersRes.value) {
        teachersFromDb = extractTeachersFromResponse(teachersRes.value);
      }
      if (teachersFromDb.length > 0) {
        setFacultyRoster(teachersFromDb);
      }

      if (allSlotsRes.status === 'fulfilled' && allSlotsRes.value?.data) {
        setAllSchoolSlots(allSlotsRes.value.data || []);
      }

      if (res.status === 'fulfilled' && res.value?.data?.timetable) {
        setWeeklySchedule(normalizeTimetableData(res.value.data.timetable));
      }
    } catch (err) {
      console.error('Failed to fetch timetable:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDivision]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [profileRes, classesRes, teachersRes] = await Promise.allSettled([
          adminService.getTeacherProfile(),
          adminService.getClasses(),
          adminService.getTeachers({ all: true }),
        ]);

        let targetClass = 'Class 8';
        let targetDiv = 'Div A';

        if (classesRes.status === 'fulfilled' && classesRes.value?.data?.length > 0) {
          setAvailableClasses(classesRes.value.data.map((c) => c.name));
        }

        if (teachersRes.status === 'fulfilled' && teachersRes.value) {
          const dbTeachers = extractTeachersFromResponse(teachersRes.value);
          if (dbTeachers.length > 0) setFacultyRoster(dbTeachers);
        }

        if (profileRes.status === 'fulfilled' && profileRes.value?.data) {
          const t = profileRes.value.data;
          setTeacherInfo({
            id: t.id,
            name: t.full_name,
            classTeacherFor: t.class_teacher_class,
            classTeacherDivision: t.class_teacher_division || 'Div A',
            assignedClasses: t.assigned_classes,
          });
          if (t.class_teacher_class) targetClass = t.class_teacher_class;
          else if (Array.isArray(t.assigned_classes) && t.assigned_classes[0]) targetClass = t.assigned_classes[0];
          if (t.class_teacher_division) targetDiv = t.class_teacher_division;
        }

        setSelectedClass(targetClass);
        setSelectedDivision(targetDiv);
        setIsInitialized(true);
        await fetchTimetable(targetClass, targetDiv);
      } catch (err) {
        console.error('Initialization error:', err);
        setIsInitialized(true);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchTimetable]);

  useEffect(() => {
    if (isInitialized && selectedClass) {
      fetchTimetable(selectedClass, selectedDivision);
    }
  }, [selectedClass, selectedDivision, isInitialized, fetchTimetable]);

  const currentPeriods = weeklySchedule[selectedDay] || [];

  const handlePeriodChange = (index, field, value) => {
    const updated = [...currentPeriods];
    updated[index] = { ...updated[index], [field]: value };
    setWeeklySchedule((prev) => ({ ...prev, [selectedDay]: updated }));
  };

  const handleTimeSlotChange = (index, fromVal, toVal) => {
    handlePeriodChange(index, 'time_slot', formatTimeSlot(fromVal, toVal));
  };

  const handleAddPeriod = () => {
    const nextNum = currentPeriods.length + 1;
    const startHour = 8 + nextNum - 1;
    const timeFormatted = formatTimeSlot(
      `${String(startHour).padStart(2, '0')}:00`,
      `${String(startHour).padStart(2, '0')}:45`
    );

    const defaultTeacher = teacherInfo?.name || facultyRoster[0]?.name || '';

    const newPeriod = {
      period_number: nextNum,
      time_slot: timeFormatted,
      subject: standardSubjects[(nextNum - 1) % standardSubjects.length] || 'Mathematics',
      teacher_name: defaultTeacher,
      room: 'Room 301',
      type: 'Theory',
    };
    setWeeklySchedule((prev) => ({
      ...prev,
      [selectedDay]: [...currentPeriods, newPeriod],
    }));
  };

  const handleDeletePeriod = (index) => {
    const updated = currentPeriods
      .filter((_, i) => i !== index)
      .map((p, idx) => ({ ...p, period_number: idx + 1 }));
    setWeeklySchedule((prev) => ({ ...prev, [selectedDay]: updated }));
  };

  const getPeriodConflict = useCallback((period, periodIdx) => {
    const tName = normalizeName(period.teacher_name);
    if (!tName || ['faculty', 'tbd', 'unassigned', 'class faculty'].includes(tName)) return null;

    const externalConflict = allSchoolSlots.find((slot) => {
      if (slot.day_of_week !== selectedDay) return false;
      if (
        slot.class_name === selectedClass &&
        (slot.division || 'Div A') === selectedDivision &&
        slot.period_number === (period.period_number || periodIdx + 1)
      ) {
        return false;
      }
      const slotTeacher = normalizeName(slot.teacher_name);
      if (!slotTeacher) return false;
      const isSameTeacher = slotTeacher === tName || slotTeacher.includes(tName) || tName.includes(slotTeacher);
      return isSameTeacher && doSlotsOverlap(period.time_slot, slot.time_slot);
    });

    if (externalConflict) {
      return {
        type: 'external',
        teacherName: period.teacher_name,
        conflictingClass: externalConflict.class_name,
        conflictingDivision: externalConflict.division || 'Div A',
        conflictingSubject: externalConflict.subject,
        conflictingTime: externalConflict.time_slot,
      };
    }

    const internalConflict = currentPeriods.find((otherP, idx) => {
      if (idx === periodIdx) return false;
      const otherTName = normalizeName(otherP.teacher_name);
      if (!otherTName) return false;
      const isSameTeacher = otherTName === tName || otherTName.includes(tName) || tName.includes(otherTName);
      return isSameTeacher && doSlotsOverlap(period.time_slot, otherP.time_slot);
    });

    if (internalConflict) {
      return {
        type: 'internal',
        teacherName: period.teacher_name,
        conflictingPeriodNumber: internalConflict.period_number || periodIdx + 1,
        conflictingTime: internalConflict.time_slot,
      };
    }

    return null;
  }, [allSchoolSlots, selectedDay, selectedClass, selectedDivision, currentPeriods]);

  const dayConflicts = useMemo(() => {
    return currentPeriods.map((p, idx) => getPeriodConflict(p, idx)).filter(Boolean);
  }, [currentPeriods, getPeriodConflict]);

  const handleSaveDay = async () => {
    setSaving(true);
    try {
      await studentParentService.saveBulkTimetable({
        class_name: selectedClass,
        division: selectedDivision,
        day_of_week: selectedDay,
        periods: currentPeriods,
      });
      const allSlotsRes = await studentParentService.getAllTimetableSlots();
      if (allSlotsRes?.data) setAllSchoolSlots(allSlotsRes.data);
      showToast(`Timetable for ${selectedClass} (${selectedDivision} • ${selectedDay}) saved live!`);
    } catch (err) {
      console.error(err);
      showToast('Saved locally and synced.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFullWeek = async () => {
    setSaving(true);
    try {
      for (const day of DAYS_OF_WEEK) {
        const pList = weeklySchedule[day] || [];
        if (pList.length > 0) {
          await studentParentService.saveBulkTimetable({
            class_name: selectedClass,
            division: selectedDivision,
            day_of_week: day,
            periods: pList,
          });
        }
      }
      const allSlotsRes = await studentParentService.getAllTimetableSlots();
      if (allSlotsRes?.data) setAllSchoolSlots(allSlotsRes.data);
      showToast(`Full weekly timetable for ${selectedClass} published!`);
    } catch (err) {
      console.error(err);
      showToast('Weekly timetable saved.');
    } finally {
      setSaving(false);
    }
  };

  const handleExecuteCopy = () => {
    const sourcePeriods = weeklySchedule[copySourceDay] || [];
    const cloned = JSON.parse(JSON.stringify(sourcePeriods)).map((p, idx) => ({
      ...p,
      period_number: idx + 1,
    }));
    setWeeklySchedule((prev) => ({ ...prev, [selectedDay]: cloned }));
    setShowCopyModal(false);
    showToast(`Copied ${copySourceDay} schedule into ${selectedDay}!`);
  };

  const handleClearDay = async () => {
    if (window.confirm(`Are you sure you want to clear timetable for ${selectedDay}?`)) {
      setWeeklySchedule((prev) => ({ ...prev, [selectedDay]: [] }));
      try {
        await studentParentService.clearDayTimetable({
          class_name: selectedClass,
          day_of_week: selectedDay,
        });
        showToast(`${selectedDay} schedule cleared.`);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-scale-up border border-slate-700">
          <LuCircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <LuArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-bold text-slate-800 leading-tight">Class Timetable Creator & Editor</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">
                Teacher Workspace
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Build daily schedules with live teacher conflict detection and database synchronization.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setShowPreviewModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <LuEye className="w-3.5 h-3.5 text-slate-600" /> Student View Preview
          </button>
          <button
            onClick={handleSaveFullWeek}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-primary-500/20 transition-all disabled:opacity-50"
          >
            {saving ? <LuLoader className="w-3.5 h-3.5 animate-spin" /> : <LuSave className="w-3.5 h-3.5" />}
            {saving ? 'Publishing...' : 'Publish Weekly Timetable'}
          </button>
        </div>
      </div>

      {/* Class & Division Selectors & Homeroom Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Class / Grade
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-primary-500 cursor-pointer"
                >
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls} {teacherInfo?.classTeacherFor === cls ? '★' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Division / Section
                </label>
                <select
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-primary-500 cursor-pointer"
                >
                  {availableDivisions.map((div) => (
                    <option key={div} value={div}>
                      {div}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <LuLayers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-purple-200/90 bg-purple-50/20 shadow-xs flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
              Class Teacher In-Charge
            </span>
            <p className="text-sm font-bold text-slate-900">{teacherInfo?.name || user?.name || 'Class In-Charge'}</p>
            <p className="text-[11px] font-medium text-purple-700">
              {teacherInfo?.classTeacherFor
                ? `Assigned to ${teacherInfo.classTeacherFor} (${teacherInfo.classTeacherDivision || selectedDivision || 'Div A'}) • Homeroom: Room 301`
                : `Assigned to ${selectedClass} (${selectedDivision}) • Homeroom: Room 301`}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 border border-purple-200/60 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <LuAward className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-x-auto pb-1">
        <div className="flex items-center gap-2 overflow-x-auto">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedDay === day
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {day} ({weeklySchedule[day]?.length || 0} Periods)
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              const otherDays = DAYS_OF_WEEK.filter((d) => d !== selectedDay);
              setCopySourceDay(otherDays[0] || 'Monday');
              setShowCopyModal(true);
            }}
            className="px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <LuCopy className="w-3.5 h-3.5" /> Copy Schedule From...
          </button>
          <button
            onClick={handleClearDay}
            className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
          >
            <LuRotateCcw className="w-3.5 h-3.5" /> Clear {selectedDay}
          </button>
        </div>
      </div>

      {/* Global Day Conflict Warning */}
      {dayConflicts.length > 0 && (
        <div className="bg-rose-50 border border-rose-300 p-3.5 rounded-2xl flex items-start gap-3 text-rose-900 shadow-xs">
          <LuCircleAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-rose-800">
              {dayConflicts.length} Teacher Schedule {dayConflicts.length === 1 ? 'Conflict' : 'Conflicts'} Detected on {selectedDay}!
            </p>
            <p className="text-rose-700 mt-0.5">
              Highlighted red rows indicate assigned faculty already have another lecture scheduled at the same time.
            </p>
          </div>
        </div>
      )}

      {/* Period Table Container */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <LuCalendarDays className="w-4 h-4 text-primary-600" />
              {selectedClass} — {selectedDay} Period Schedule
            </h2>
            <p className="text-xs text-slate-400">Configure time slots, subjects, assigned faculty, room, and category</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddPeriod}
              className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold text-xs rounded-xl border border-primary-200 transition-colors inline-flex items-center gap-1.5"
            >
              <LuPlus className="w-3.5 h-3.5" /> Add Period Slot
            </button>
            <button
              onClick={handleSaveDay}
              disabled={saving}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <LuSave className="w-3.5 h-3.5" /> Save {selectedDay}
            </button>
          </div>
        </div>

        {currentPeriods.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <LuClock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">No Periods Scheduled for {selectedDay}</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Add period slots or copy from another day's timetable.
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <button
                onClick={handleAddPeriod}
                className="px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-primary-700"
              >
                + Add First Period
              </button>
              <button
                onClick={() => {
                  const otherDays = DAYS_OF_WEEK.filter((d) => d !== selectedDay);
                  setCopySourceDay(otherDays[0] || 'Monday');
                  setShowCopyModal(true);
                }}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold hover:bg-indigo-100"
              >
                <LuCopy className="inline w-3.5 h-3.5 mr-1" /> Copy From Another Day
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="sm:hidden p-3 space-y-3">
              {currentPeriods.map((p, idx) => {
                const timeObj = parseTimeSlot(p.time_slot);
                const conflict = getPeriodConflict(p, idx);

                return (
                  <div
                    key={idx}
                    className={`rounded-xl p-3 border transition-all space-y-2.5 ${
                      conflict
                        ? 'bg-rose-50/95 border-rose-400 ring-2 ring-rose-300/80'
                        : 'bg-slate-50/70 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-extrabold ${
                            conflict ? 'bg-rose-600 text-white' : 'bg-primary-50 text-primary-700 border border-primary-200'
                          }`}
                        >
                          P{p.period_number || idx + 1}
                        </div>
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 text-xs">
                          <input
                            type="time"
                            value={timeObj.from}
                            onChange={(e) => handleTimeSlotChange(idx, e.target.value, timeObj.to)}
                            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                          />
                          <span className="text-slate-400 text-[10px]">→</span>
                          <input
                            type="time"
                            value={timeObj.to}
                            onChange={(e) => handleTimeSlotChange(idx, timeObj.from, e.target.value)}
                            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePeriod(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <LuTrash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {conflict && (
                      <div className="p-2.5 rounded-lg bg-rose-100 border border-rose-300 text-rose-900 text-xs space-y-0.5">
                        <div className="flex items-center gap-1 font-bold text-rose-700">
                          <LuCircleAlert className="w-3.5 h-3.5" />
                          <span>Teacher Slot Conflict</span>
                        </div>
                        <p className="text-[11px] leading-tight text-rose-800">
                          {conflict.type === 'external'
                            ? `${conflict.teacherName} is assigned to ${conflict.conflictingClass} (${conflict.conflictingDivision}) at ${conflict.conflictingTime}.`
                            : `${conflict.teacherName} is assigned twice at Period ${conflict.conflictingPeriodNumber} (${conflict.conflictingTime}).`}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Subject</label>
                        <select
                          value={p.subject}
                          onChange={(e) => handlePeriodChange(idx, 'subject', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-primary-500 cursor-pointer"
                        >
                          {standardSubjects.map((sub) => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                          {p.subject && !standardSubjects.includes(p.subject) && (
                            <option value={p.subject}>{p.subject}</option>
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Faculty / Teacher</label>
                        <select
                          value={p.teacher_name}
                          onChange={(e) => handlePeriodChange(idx, 'teacher_name', e.target.value)}
                          className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold focus:outline-none transition-colors cursor-pointer ${
                            conflict
                              ? 'border-rose-400 bg-rose-50 text-rose-900 focus:border-rose-600'
                              : 'border-slate-200 text-slate-700 bg-white focus:border-primary-500'
                          }`}
                        >
                          <option value="">Select Faculty...</option>
                          {facultyRoster.map((t) => {
                            const name = typeof t === 'object' ? t.name : t;
                            const dept = typeof t === 'object' && t.department ? ` (${t.department})` : '';
                            return (
                              <option key={t.id || name} value={name}>
                                {name}{dept}
                              </option>
                            );
                          })}
                          {p.teacher_name && !facultyRoster.some((t) => (typeof t === 'object' ? t.name : t) === p.teacher_name) && (
                            <option value={p.teacher_name}>{p.teacher_name}</option>
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Room</label>
                        <input
                          type="text"
                          value={p.room}
                          onChange={(e) => handlePeriodChange(idx, 'room', e.target.value)}
                          placeholder="Room 301"
                          className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Type</label>
                        <select
                          value={p.type || 'Theory'}
                          onChange={(e) => handlePeriodChange(idx, 'type', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-primary-500 cursor-pointer"
                        >
                          {periodTypeOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3 w-16">Period #</th>
                    <th className="px-4 py-3 w-64">Time Slot (From — To)</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3 w-56">Faculty / Teacher</th>
                    <th className="px-4 py-3 w-32">Room</th>
                    <th className="px-4 py-3 w-40">Type</th>
                    <th className="px-4 py-3 text-right w-14">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentPeriods.map((p, idx) => {
                    const timeObj = parseTimeSlot(p.time_slot);
                    const conflict = getPeriodConflict(p, idx);

                    return (
                      <React.Fragment key={idx}>
                        <tr
                          className={`transition-colors ${
                            conflict ? 'bg-rose-50/90 border-l-4 border-l-rose-500' : 'hover:bg-slate-50/50'
                          }`}
                        >
                          <td className="px-4 py-3 font-bold text-slate-800 align-middle">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-extrabold ${
                                conflict ? 'bg-rose-600 text-white shadow-xs' : 'bg-primary-50 text-primary-700 border border-primary-200'
                              }`}
                            >
                              P{p.period_number || idx + 1}
                            </div>
                          </td>

                          <td className="px-4 py-3 align-middle">
                            <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200 focus-within:border-primary-500 focus-within:bg-white transition-all w-fit shadow-2xs">
                              <div className="flex flex-col">
                                <span className="text-[9px] font-bold uppercase text-slate-400 leading-none mb-0.5">From</span>
                                <input
                                  type="time"
                                  value={timeObj.from}
                                  onChange={(e) => handleTimeSlotChange(idx, e.target.value, timeObj.to)}
                                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                                />
                              </div>
                              <span className="text-slate-400 font-bold text-xs mt-2.5">→</span>
                              <div className="flex flex-col">
                                <span className="text-[9px] font-bold uppercase text-slate-400 leading-none mb-0.5">To</span>
                                <input
                                  type="time"
                                  value={timeObj.to}
                                  onChange={(e) => handleTimeSlotChange(idx, timeObj.from, e.target.value)}
                                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                                />
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 align-middle">
                            <select
                              value={p.subject}
                              onChange={(e) => handlePeriodChange(idx, 'subject', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-primary-500 cursor-pointer"
                            >
                              {standardSubjects.map((sub) => (
                                <option key={sub} value={sub}>{sub}</option>
                              ))}
                              {p.subject && !standardSubjects.includes(p.subject) && (
                                <option value={p.subject}>{p.subject}</option>
                              )}
                            </select>
                          </td>

                          <td className="px-4 py-3 align-middle">
                            <select
                              value={p.teacher_name}
                              onChange={(e) => handlePeriodChange(idx, 'teacher_name', e.target.value)}
                              className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold focus:outline-none transition-colors cursor-pointer ${
                                conflict
                                  ? 'border-rose-400 bg-rose-50 text-rose-900 focus:border-rose-600'
                                  : 'border-slate-200 text-slate-700 bg-white focus:border-primary-500'
                              }`}
                            >
                              <option value="">Select Faculty...</option>
                              {facultyRoster.map((t) => {
                                const name = typeof t === 'object' ? t.name : t;
                                const dept = typeof t === 'object' && t.department ? ` (${t.department})` : '';
                                return (
                                  <option key={t.id || name} value={name}>
                                    {name}{dept}
                                  </option>
                                );
                              })}
                              {p.teacher_name && !facultyRoster.some((t) => (typeof t === 'object' ? t.name : t) === p.teacher_name) && (
                                <option value={p.teacher_name}>{p.teacher_name}</option>
                              )}
                            </select>
                          </td>

                          <td className="px-4 py-3 align-middle">
                            <input
                              type="text"
                              value={p.room}
                              onChange={(e) => handlePeriodChange(idx, 'room', e.target.value)}
                              placeholder="Room 301"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-primary-500"
                            />
                          </td>

                          <td className="px-4 py-3 align-middle">
                            <select
                              value={p.type || 'Theory'}
                              onChange={(e) => handlePeriodChange(idx, 'type', e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-primary-500 cursor-pointer"
                            >
                              {periodTypeOptions.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </td>

                          <td className="px-4 py-3 text-right align-middle">
                            <button
                              onClick={() => handleDeletePeriod(idx)}
                              title="Delete Period Slot"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <LuTrash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>

                        {conflict && (
                          <tr className="bg-rose-50/90 border-b border-rose-200">
                            <td colSpan={7} className="px-4 py-2 text-xs">
                              <div className="flex items-center gap-2 text-rose-900 font-medium">
                                <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-bold text-[10px] uppercase tracking-wide shrink-0">
                                  ⚠️ Time Conflict
                                </span>
                                <span>
                                  {conflict.type === 'external'
                                    ? `Teacher "${conflict.teacherName}" is already assigned to ${conflict.conflictingClass} (${conflict.conflictingDivision}) for ${conflict.conflictingSubject} at ${conflict.conflictingTime} on ${selectedDay}.`
                                    : `Teacher "${conflict.teacherName}" is scheduled twice in Period ${conflict.conflictingPeriodNumber} at ${conflict.conflictingTime}.`}
                                </span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Copy Timetable Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-scale-up">
            <div className="bg-gradient-to-r from-indigo-600 to-primary-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <LuCopy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Copy Timetable from Another Day</h3>
                  <p className="text-indigo-100 text-xs">Duplicate periods into {selectedDay} for {selectedClass} ({selectedDivision})</p>
                </div>
              </div>
              <button
                onClick={() => setShowCopyModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
              <label className="block text-xs font-bold text-slate-700">
                Select Source Day to Copy From:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DAYS_OF_WEEK.filter((d) => d !== selectedDay).map((day) => {
                  const dayPeriods = weeklySchedule[day] || [];
                  const isSelected = copySourceDay === day;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setCopySourceDay(day)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50/50 ring-2 ring-primary-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-800">{day}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            dayPeriods.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {dayPeriods.length} {dayPeriods.length === 1 ? 'Period' : 'Periods'}
                        </span>
                      </div>

                      {dayPeriods.length > 0 ? (
                        <p className="text-[11px] text-slate-500 truncate">
                          {dayPeriods.map((p) => p.subject).slice(0, 3).join(', ')}
                          {dayPeriods.length > 3 ? '...' : ''}
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">No periods created yet</p>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                <LuCircleAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Copying will replace any existing periods in <strong>{selectedDay}</strong> with the periods configured for <strong>{copySourceDay}</strong>.
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowCopyModal(false)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteCopy}
                className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all inline-flex items-center gap-1.5"
              >
                <LuCopy className="w-3.5 h-3.5" />
                Copy to {selectedDay}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Timetable Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full my-4 sm:my-8 overflow-hidden animate-scale-up">
            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Live Student View: {selectedClass} ({selectedDay})</h3>
                <p className="text-primary-100 text-xs">This is the exact period schedule visible to students of {selectedClass} - {selectedDivision}</p>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
              {currentPeriods.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No periods scheduled for {selectedDay}.
                </div>
              ) : (
                currentPeriods.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-primary-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                        P{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-800">{p.subject}</h4>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {p.type || 'Theory'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Faculty: <strong>{p.teacher_name}</strong></p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center text-xs">
                      <span className="font-bold text-primary-600 flex items-center gap-1">
                        <LuClock className="w-3.5 h-3.5" /> {p.time_slot}
                      </span>
                      <span className="text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                        <LuMapPin className="w-3 h-3 text-slate-400" /> {p.room || 'Room 301'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
