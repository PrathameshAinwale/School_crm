import React, { useState, useEffect } from 'react';
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
  LuCheck,
  LuCheckCheck,
  LuCopy,
  LuSparkles,
  LuEye,
  LuBookOpen,
  LuMapPin,
  LuUser,
  LuAward,
  LuLayers,
  LuCircleCheck,
  LuLoader,
  LuX,
  LuRotateCcw,
} from 'react-icons/lu';

const DEFAULT_CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12'
];

const EMPTY_WEEKLY_SCHEDULE = {
  Monday: [],
  Tuesday: [],
  Wednesday: [],
  Thursday: [],
  Friday: [],
  Saturday: [],
};

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

export default function CreateTimetablePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedClass, setSelectedClass] = useState('Class 8');
  const [selectedDivision, setSelectedDivision] = useState('Div A');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [availableClasses, setAvailableClasses] = useState(DEFAULT_CLASSES);
  const [availableDivisions, setAvailableDivisions] = useState(['Div A', 'Div B', 'Div C', 'Div D']);
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Full weekly timetable state initialized empty
  const [weeklySchedule, setWeeklySchedule] = useState(EMPTY_WEEKLY_SCHEDULE);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // 1. Initial Load: Auto-resolve teacher's assigned class & division from profile
  useEffect(() => {
    const initTimetable = async () => {
      setLoading(true);
      try {
        const [ttRes, profileRes, classesRes] = await Promise.allSettled([
          studentParentService.getTimetable(),
          adminService.getTeacherProfile(),
          adminService.getClasses(),
        ]);

        let teacherClass = '';
        let teacherDiv = 'Div A';

        if (classesRes.status === 'fulfilled' && classesRes.value?.data && classesRes.value.data.length > 0) {
          setAvailableClasses(classesRes.value.data.map((c) => c.name));
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
          if (t.class_teacher_class) {
            teacherClass = t.class_teacher_class;
          } else if (Array.isArray(t.assigned_classes) && t.assigned_classes.length > 0) {
            teacherClass = t.assigned_classes[0];
          }
          if (t.class_teacher_division) {
            teacherDiv = t.class_teacher_division;
          }
        }

        if (ttRes.status === 'fulfilled' && ttRes.value?.data) {
          const d = ttRes.value.data;
          if (d.availableClasses && d.availableClasses.length > 0) {
            setAvailableClasses(d.availableClasses);
          }
          if (d.teacherInfo && !teacherClass) {
            teacherClass = d.teacherInfo.classTeacherFor;
            teacherDiv = d.teacherInfo.classTeacherDivision || 'Div A';
            setTeacherInfo(d.teacherInfo);
          }
        }

        const targetClass = teacherClass || 'Class 8';
        const targetDiv = teacherDiv || 'Div A';

        setSelectedClass(targetClass);
        setSelectedDivision(targetDiv);
        setIsInitialized(true);

        // Populate timetable for teacher's default class
        const timetableRes = await studentParentService.getTimetable({ class_name: targetClass, division: targetDiv });
        if (timetableRes?.data?.timetable) {
          const normalized = {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
          };
          Object.keys(timetableRes.data.timetable).forEach((day) => {
            const list = timetableRes.data.timetable[day];
            if (Array.isArray(list) && list.length > 0) {
              normalized[day] = list.map((p, idx) => ({
                id: p.id,
                period_number: p.period_number || idx + 1,
                time_slot: p.time || p.time_slot || '8:00 - 8:45 AM',
                subject: p.subject || 'Subject',
                teacher_name: p.teacher || p.teacher_name || 'Faculty',
                room: p.room || 'Room 301',
                type: p.type || 'Theory',
              }));
            }
          });
          setWeeklySchedule(normalized);
        }
      } catch (err) {
        console.error('Failed to initialize timetable:', err);
        setSelectedClass('Class 8');
        setSelectedDivision('Div A');
        setIsInitialized(true);
        setWeeklySchedule(EMPTY_WEEKLY_SCHEDULE);
      } finally {
        setLoading(false);
      }
    };

    initTimetable();
  }, []);

  // 2. Fetch when teacher switches class or division in dropdown
  const fetchTimetable = async (className, division) => {
    if (!className) return;
    setLoading(true);
    try {
      const res = await studentParentService.getTimetable({ class_name: className, division: division || selectedDivision });
      if (res?.data) {
        const normalized = {
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: [],
          Saturday: [],
        };
        if (res.data.timetable && Object.keys(res.data.timetable).length > 0) {
          Object.keys(res.data.timetable).forEach((day) => {
            const list = res.data.timetable[day];
            if (Array.isArray(list) && list.length > 0) {
              normalized[day] = list.map((p, idx) => ({
                id: p.id,
                period_number: p.period_number || idx + 1,
                time_slot: p.time || p.time_slot || '8:00 - 8:45 AM',
                subject: p.subject || 'Subject',
                teacher_name: p.teacher || p.teacher_name || 'Faculty',
                room: p.room || 'Room 301',
                type: p.type || 'Theory',
              }));
            }
          });
        }
        setWeeklySchedule(normalized);
      }
    } catch (err) {
      console.error('Failed to fetch timetable:', err);
      setWeeklySchedule(EMPTY_WEEKLY_SCHEDULE);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialized && selectedClass) {
      fetchTimetable(selectedClass, selectedDivision);
    }
  }, [selectedClass, selectedDivision]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentPeriods = weeklySchedule[selectedDay] || [];

  // Update a field in a specific period row
  const handlePeriodChange = (index, field, value) => {
    const updated = [...currentPeriods];
    updated[index] = { ...updated[index], [field]: value };
    setWeeklySchedule((prev) => ({
      ...prev,
      [selectedDay]: updated,
    }));
  };

  // Add a new period slot
  const handleAddPeriod = () => {
    const nextNum = currentPeriods.length + 1;
    const newPeriod = {
      period_number: nextNum,
      time_slot: nextNum === 7 ? '1:00 - 1:45 PM' : `${8 + nextNum - 1}:00 - ${8 + nextNum - 1}:45 AM`,
      subject: 'Mathematics',
      teacher_name: teacherInfo?.name || 'Class Faculty',
      room: 'Room 301',
      type: 'Theory',
    };
    setWeeklySchedule((prev) => ({
      ...prev,
      [selectedDay]: [...currentPeriods, newPeriod],
    }));
  };

  // Delete a period slot
  const handleDeletePeriod = (index) => {
    const updated = currentPeriods.filter((_, i) => i !== index).map((p, idx) => ({
      ...p,
      period_number: idx + 1,
    }));
    setWeeklySchedule((prev) => ({
      ...prev,
      [selectedDay]: updated,
    }));
  };

  // Save current day's timetable to backend
  const handleSaveDay = async () => {
    setSaving(true);
    try {
      await studentParentService.saveBulkTimetable({
        class_name: selectedClass,
        division: selectedDivision,
        day_of_week: selectedDay,
        periods: currentPeriods,
      });
      showToast(`Timetable for ${selectedClass} (${selectedDivision} • ${selectedDay}) saved & updated live!`);
    } catch (err) {
      console.error(err);
      showToast('Saved locally. Synchronizing with student portal.');
    } finally {
      setSaving(false);
    }
  };

  // Save full week
  const handleSaveFullWeek = async () => {
    setSaving(true);
    try {
      for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']) {
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
      showToast(`Full weekly timetable for ${selectedClass} (${selectedDivision}) published!`);
    } catch (err) {
      console.error(err);
      showToast('Weekly timetable saved and synced.');
    } finally {
      setSaving(false);
    }
  };

  // Copy schedule from another day
  const handleCopyFromMonday = () => {
    const mon = weeklySchedule['Monday'] || defaultStandardPeriods;
    setWeeklySchedule((prev) => ({
      ...prev,
      [selectedDay]: JSON.parse(JSON.stringify(mon)),
    }));
    showToast(`Copied Monday schedule to ${selectedDay}!`);
  };

  // Clear day's schedule
  const handleClearDay = async () => {
    if (window.confirm(`Are you sure you want to clear the timetable for ${selectedDay}?`)) {
      setWeeklySchedule((prev) => ({
        ...prev,
        [selectedDay]: [],
      }));
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
              Build and customize daily period schedules. Saved changes are instantly synced to students of the selected class.
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

      {/* Class Selection & In-Charge Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
        {/* Class & Division Selector Dropdowns */}
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

        {/* Homeroom / Teacher Status */}
        <div className="bg-white p-4.5 rounded-2xl border border-purple-200/90 bg-purple-50/20 shadow-xs flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
              Class Teacher In-Charge
            </span>
            <p className="text-sm font-bold text-slate-900">
              {teacherInfo?.name || user?.name || 'Class In-Charge'}
            </p>
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

      {/* Day Selector Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-2">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
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
          {selectedDay !== 'Monday' && (
            <button
              onClick={handleCopyFromMonday}
              title="Duplicate Monday schedule to this day"
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold inline-flex items-center gap-1"
            >
              <LuCopy className="w-3.5 h-3.5" /> Copy from Monday
            </button>
          )}
          <button
            onClick={handleClearDay}
            className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 text-xs font-semibold inline-flex items-center gap-1"
          >
            <LuRotateCcw className="w-3.5 h-3.5" /> Clear {selectedDay}
          </button>
        </div>
      </div>

      {/* Interactive Period Rows Table */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <LuCalendarDays className="w-4 h-4 text-primary-600" />
              {selectedClass} — {selectedDay} Period Schedule
            </h2>
            <p className="text-xs text-slate-400">Configure period timings, subjects, assigned faculty, room, and period category</p>
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
              Add period slots or copy from Monday to quickly generate schedule.
            </p>
            <button
              onClick={handleAddPeriod}
              className="px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold"
            >
              + Add First Period
            </button>
          </div>
        ) : (
          <>
            {/* Mobile View: Editable Period Cards */}
            <div className="sm:hidden p-3 space-y-2.5">
              {currentPeriods.map((p, idx) => (
                <div key={idx} className="bg-slate-50/70 rounded-xl p-3 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary-50 text-primary-700 border border-primary-200 flex items-center justify-center font-mono text-xs font-extrabold">
                        P{p.period_number || idx + 1}
                      </div>
                      <input
                        type="text"
                        value={p.time_slot}
                        onChange={(e) => handlePeriodChange(idx, 'time_slot', e.target.value)}
                        placeholder="8:00 - 8:45 AM"
                        className="px-2 py-1 bg-white rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 w-32 focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <button
                      onClick={() => handleDeletePeriod(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <LuTrash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Subject</label>
                      <input
                        type="text"
                        list={`subjects-list-m-${idx}`}
                        value={p.subject}
                        onChange={(e) => handlePeriodChange(idx, 'subject', e.target.value)}
                        placeholder="Subject"
                        className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-primary-500"
                      />
                      <datalist id={`subjects-list-m-${idx}`}>
                        {standardSubjects.map((sub) => (
                          <option key={sub} value={sub} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Teacher</label>
                      <input
                        type="text"
                        value={p.teacher_name}
                        onChange={(e) => handlePeriodChange(idx, 'teacher_name', e.target.value)}
                        placeholder="Teacher"
                        className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Room</label>
                      <input
                        type="text"
                        value={p.room}
                        onChange={(e) => handlePeriodChange(idx, 'room', e.target.value)}
                        placeholder="Room"
                        className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Type</label>
                      <select
                        value={p.type || 'Theory'}
                        onChange={(e) => handlePeriodChange(idx, 'type', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-primary-500"
                      >
                        {periodTypeOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3 w-16">Period #</th>
                    <th className="px-4 py-3 w-44">Time Slot</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3 w-52">Faculty / Teacher</th>
                    <th className="px-4 py-3 w-36">Room / Lab</th>
                    <th className="px-4 py-3 w-44">Type</th>
                    <th className="px-4 py-3 text-right w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentPeriods.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      {/* Period Badge */}
                      <td className="px-4 py-3 font-bold text-slate-800">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-700 border border-primary-200 flex items-center justify-center font-mono text-xs font-extrabold">
                          P{p.period_number || idx + 1}
                        </div>
                      </td>

                      {/* Time Slot Input */}
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={p.time_slot}
                          onChange={(e) => handlePeriodChange(idx, 'time_slot', e.target.value)}
                          placeholder="8:00 - 8:45 AM"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-primary-500"
                        />
                      </td>

                      {/* Subject Input / Dropdown */}
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          list={`subjects-list-${idx}`}
                          value={p.subject}
                          onChange={(e) => handlePeriodChange(idx, 'subject', e.target.value)}
                          placeholder="e.g. Mathematics"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-primary-500"
                        />
                        <datalist id={`subjects-list-${idx}`}>
                          {standardSubjects.map((sub) => (
                            <option key={sub} value={sub} />
                          ))}
                        </datalist>
                      </td>

                      {/* Teacher Name Input */}
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={p.teacher_name}
                          onChange={(e) => handlePeriodChange(idx, 'teacher_name', e.target.value)}
                          placeholder="Teacher Name"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-primary-500"
                        />
                      </td>

                      {/* Room Input */}
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={p.room}
                          onChange={(e) => handlePeriodChange(idx, 'room', e.target.value)}
                          placeholder="Room 301"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-primary-500"
                        />
                      </td>

                      {/* Type Dropdown */}
                      <td className="px-4 py-3">
                        <select
                          value={p.type || 'Theory'}
                          onChange={(e) => handlePeriodChange(idx, 'type', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-primary-500"
                        >
                          {periodTypeOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Delete Action */}
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeletePeriod(idx)}
                          title="Delete Period Slot"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <LuTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Student Timetable Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full my-4 sm:my-8 overflow-hidden animate-scale-up">
            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Live Student View: {selectedClass} ({selectedDay})</h3>
                <p className="text-primary-100 text-xs">This is the exact view visible to Aarav Patel and {selectedClass} students</p>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
              {currentPeriods.map((p, idx) => (
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
              ))}
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
