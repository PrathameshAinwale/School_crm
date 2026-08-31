import React, { useState, useEffect } from 'react';
import {
  LuPresentation,
  LuSearch,
  LuPlus,
  LuCalendar,
  LuClock,
  LuMapPin,
  LuUsers,
  LuCircleCheck,
  LuCircleAlert,
  LuEye,
  LuDownload,
  LuX,
  LuUserCheck,
  LuBell,
  LuCheck,
  LuGraduationCap,
  LuCheckCheck,
} from 'react-icons/lu';
import { hrService } from '../../services/hrService';
import { adminService } from '../../services/adminService';
import { addTrainingProgram } from '../../data/trainingsStore';

export default function HRTrainingsPage() {
  const [trainings, setTrainings] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Training Form States
  const [targetType, setTargetType] = useState('group'); // 'group' | 'specific'
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [selectedSpecificTeachers, setSelectedSpecificTeachers] = useState([]);
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const [trainingsRes, teachersRes] = await Promise.all([
        hrService.getTrainings(),
        hrService.getTeachers({ all: true, per_page: 100 }).catch(() =>
          adminService.getTeachers({ all: true, per_page: 100 })
        ),
      ]);

      const rawTeachers =
        teachersRes?.data?.data ||
        teachersRes?.data?.teachers ||
        (Array.isArray(teachersRes?.data) ? teachersRes.data : []) ||
        (Array.isArray(teachersRes?.teachers) ? teachersRes.teachers : []) ||
        (Array.isArray(teachersRes) ? teachersRes : []);

      let tList = [];
      if (Array.isArray(rawTeachers) && rawTeachers.length > 0) {
        tList = rawTeachers;
        setTeachersList(rawTeachers);
      }

      const trainingsList = trainingsRes?.data?.trainings || trainingsRes?.trainings;
      if (trainingsList && Array.isArray(trainingsList)) {
        const defaultAttendees = (Array.isArray(tList) && tList.length > 0 ? tList : []).map((t) => ({
          teacherId: t.teacher_id || t.id,
          teacherName: t.full_name || t.name,
          role: t.designation || t.role || 'Faculty',
          dept: t.department || t.dept || 'Academic',
          status: 'Assigned & Notified',
          markedAt: null,
          feedback: '',
        }));

        const mapped = trainingsList.map((t) => ({
          id: t.training_id || t.id || `TRN-${t.id}`,
          db_id: t.id || t.db_id,
          title: t.title,
          category: t.category,
          trainer: t.trainer_name || t.trainer || 'Faculty Trainer',
          trainerOrg: 'Institutional Training Wing',
          date: t.date ? new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Scheduled',
          time: t.time_slot || t.time || '10:00 AM - 01:00 PM',
          venue: t.venue || 'Main Auditorium',
          mode: 'In-Person',
          targetGroupName: t.target_audience || t.targetGroup || 'All Faculty',
          description: t.description || 'Pedagogical training session.',
          status: t.status || 'Scheduled',
          attendees: Array.isArray(t.enrolled_teachers) && t.enrolled_teachers.length > 0
            ? t.enrolled_teachers
            : defaultAttendees,
        }));
        setTrainings(mapped);
      } else {
        setTrainings([]);
      }
    } catch (err) {
      console.log('Error fetching trainings:', err);
      setTrainings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const refreshTrainings = () => {
    fetchTrainings();
  };

  const filteredTrainings = trainings.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.trainer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPrograms = trainings.length;
  const totalAssignedSlots = trainings.reduce((acc, t) => acc + t.attendees.length, 0);
  const totalAttendedSlots = trainings.reduce(
    (acc, t) => acc + t.attendees.filter((a) => a.status === 'Attended').length,
    0
  );
  const overallAttendanceRate =
    totalAssignedSlots > 0 ? Math.round((totalAttendedSlots / totalAssignedSlots) * 100) : 0;

  const handleCreateTraining = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.target);

    let assignedAttendees = [];
    let targetGroupName = '';

    if (targetType === 'group') {
      if (selectedGroup === 'ALL') {
        targetGroupName = 'All Teaching Faculty';
        assignedAttendees = teachersList.map((t) => ({
          teacherId: t.teacher_id || t.id,
          teacherName: t.full_name || t.name,
          role: t.designation || t.role || 'Faculty',
          dept: t.department || t.dept || 'Academic',
          status: 'Assigned & Notified',
          markedAt: null,
          feedback: '',
        }));
      } else {
        targetGroupName = `${selectedGroup} Department`;
        assignedAttendees = teachersList
          .filter((t) => (t.department || t.dept) === selectedGroup)
          .map((t) => ({
            teacherId: t.teacher_id || t.id,
            teacherName: t.full_name || t.name,
            role: t.designation || t.role || 'Faculty',
            dept: t.department || t.dept || 'Academic',
            status: 'Assigned & Notified',
            markedAt: null,
            feedback: '',
          }));
      }
    } else {
      targetGroupName = `${selectedSpecificTeachers.length} Selected Faculty`;
      assignedAttendees = teachersList
        .filter((t) => selectedSpecificTeachers.includes(t.teacher_id || t.id))
        .map((t) => ({
          teacherId: t.teacher_id || t.id,
          teacherName: t.full_name || t.name,
          role: t.designation || t.role || 'Faculty',
          dept: t.department || t.dept || 'Academic',
          status: 'Assigned & Notified',
          markedAt: null,
          feedback: '',
        }));
    }

    if (assignedAttendees.length === 0 && teachersList.length > 0) {
      assignedAttendees = teachersList.map((t) => ({
        teacherId: t.teacher_id || t.id,
        teacherName: t.full_name || t.name,
        role: t.designation || t.role || 'Faculty',
        dept: t.department || t.dept || 'Academic',
        status: 'Assigned & Notified',
        markedAt: null,
        feedback: '',
      }));
    }

    const title = formData.get('title');
    const category = formData.get('category') || 'Pedagogy';
    const trainer = formData.get('trainer');
    const date = formData.get('date') || new Date().toISOString().split('T')[0];
    const time = formData.get('time') || '10:00 AM - 01:00 PM';
    const venue = formData.get('venue') || 'Main Auditorium';
    const description = formData.get('description');

    const newProg = {
      id: `TRN-2026-${Math.floor(100 + Math.random() * 900)}`,
      title,
      category,
      trainer,
      trainerOrg: formData.get('trainerOrg') || 'Institutional Training Wing',
      date: date || '25 Aug 2026',
      time,
      venue,
      mode: formData.get('mode') || 'In-Person',
      targetType,
      targetGroupName,
      description,
      status: 'Scheduled',
      attendees: assignedAttendees,
    };

    try {
      // Save to backend database and dispatch notifications
      await hrService.createTraining({
        title,
        category,
        trainer_name: trainer,
        date: date.includes('-') ? date : new Date().toISOString().split('T')[0],
        time_slot: time,
        venue,
        target_type: targetType,
        selected_group: selectedGroup,
        teacher_ids: targetType === 'specific' ? selectedSpecificTeachers : [],
        target_audience: targetGroupName,
        description,
      });
      await fetchTrainings();
    } catch (err) {
      console.log('Saved training error:', err);
    }

    try {
      if (typeof addTrainingProgram === 'function') {
        const updated = addTrainingProgram(newProg);
        if (Array.isArray(updated) && updated.length > 0) {
          setTrainings(updated);
        }
      }
    } catch (err) {
      console.log('Local store update error:', err);
    } finally {
      // Always close popup form and reset form state
      setShowPlanModal(false);
      setSelectedSpecificTeachers([]);
      setTeacherSearchQuery('');
      setSubmitting(false);
    }
  };

  const handleHRMarkAttendance = (trainingId, teacherId) => {
    const updated = trainings.map((t) => {
      if (t.id === trainingId) {
        const attendees = t.attendees.map((a) => {
          if (a.teacherId === teacherId) {
            return {
              ...a,
              status: 'Attended',
              markedAt: new Date().toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
              feedback: 'Verified present by HR.',
            };
          }
          return a;
        });
        return { ...t, attendees };
      }
      return t;
    });

    saveStoredTrainings(updated);
    setTrainings(updated);
    if (selectedTraining && selectedTraining.id === trainingId) {
      setSelectedTraining(updated.find((t) => t.id === trainingId));
    }
  };

  const handleExportRoster = (training) => {
    const headers = ['Teacher ID,Teacher Name,Designation,Department,Training Title,Status,Marked At,Feedback'];
    const rows = training.attendees.map(
      (a) =>
        `"${a.teacherId}","${a.teacherName}","${a.role}","${a.dept}","${training.title}","${a.status}","${a.markedAt || 'Pending'}","${a.feedback || 'N/A'}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Training_Attendance_${training.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-12">
      {/* Clean Standard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <LuPresentation className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Faculty Training & Development Hub</h1>
            <p className="text-xs text-gray-400">Plan training programs for specific teachers or groups, dispatch notifications, and track live attendee muster</p>
          </div>
        </div>

        <button
          onClick={() => setShowPlanModal(true)}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-sm self-start sm:self-auto"
        >
          <LuPlus className="w-4 h-4" /> Plan Training Program
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Programs</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">{totalPrograms} Workshops</p>
          <p className="text-xs text-gray-400 mt-0.5">Session 2026-27</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-primary-100 bg-primary-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider">Teachers Notified</span>
          <p className="text-2xl font-bold text-primary-600 mt-1">{totalAssignedSlots} Slots</p>
          <p className="text-xs text-primary-700 font-medium mt-0.5">Assigned & Dispatched</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Attendance Rate</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{overallAttendanceRate}%</p>
          <p className="text-xs text-emerald-700 font-medium mt-0.5">{totalAttendedSlots} Marked Present</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Faculty</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">186 Personnel</p>
          <p className="text-xs text-gray-400 mt-0.5">All Wings Enrolled</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <LuSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search programs by title, trainer, category, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none"
          >
            <option value="ALL">All Program Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Training Programs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
        {filteredTrainings.map((prog) => {
          const attendedCount = prog.attendees.filter((a) => a.status === 'Attended').length;
          const totalAssigned = prog.attendees.length;
          const pct = totalAssigned > 0 ? Math.round((attendedCount / totalAssigned) * 100) : 0;

          return (
            <div
              key={prog.id}
              onClick={() => setSelectedTraining(prog)}
              className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-100">
                    {prog.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      prog.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : prog.status === 'In Progress'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {prog.status}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-sm group-hover:text-primary-600 transition-colors mt-1 leading-snug">
                  {prog.title}
                </h3>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                  {prog.id} • Trainer: <span className="text-gray-700 font-medium">{prog.trainer}</span>
                </p>

                <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                  {prog.description}
                </p>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mt-3 space-y-1.5 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-gray-500">
                      <LuCalendar className="w-3.5 h-3.5 text-primary-600" /> {prog.date} ({prog.time})
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-gray-500">
                      <LuMapPin className="w-3.5 h-3.5 text-gray-400" /> {prog.venue}
                    </span>
                    <span className="font-semibold text-primary-700">{prog.mode}</span>
                  </div>
                  <div className="pt-1.5 border-t border-gray-200 flex items-center justify-between text-[11px]">
                    <span className="text-gray-500 font-medium">Target Audience:</span>
                    <strong className="text-gray-800">{prog.targetGroupName}</strong>
                  </div>
                </div>
              </div>

              {/* Attendance Progress & Action Bar */}
              <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 font-medium">
                    Attendance Progress: <strong className="text-emerald-700">{attendedCount} / {totalAssigned}</strong> Teachers
                  </span>
                  <span className="font-bold text-primary-700">{pct}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pct === 100 ? 'bg-emerald-600' : 'bg-primary-600'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[11px] text-gray-400">Click to inspect attendee muster</span>
                  <span className="font-semibold text-primary-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Manage Muster →
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* TRAINING ATTENDEE MUSTER MODAL */}
      {selectedTraining && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden flex flex-col animate-slide-up border border-gray-200 max-h-[90vh]">
            <div className="bg-white border-b border-gray-200 p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-100">
                  {selectedTraining.category} • {selectedTraining.id}
                </span>
                <h3 className="text-base font-bold text-gray-800 mt-1">{selectedTraining.title}</h3>
                <p className="text-xs text-gray-400">
                  Trainer: {selectedTraining.trainer} ({selectedTraining.trainerOrg}) • {selectedTraining.date}
                </p>
              </div>
              <button
                onClick={() => setSelectedTraining(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs overflow-y-auto">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-gray-700">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Schedule</span>
                  <strong className="text-gray-800">{selectedTraining.date}</strong>
                  <span className="block text-[11px] text-gray-500">{selectedTraining.time}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Venue & Mode</span>
                  <strong className="text-gray-800">{selectedTraining.mode}</strong>
                  <span className="block text-[11px] text-gray-500 truncate">{selectedTraining.venue}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Target Group</span>
                  <strong className="text-gray-800">{selectedTraining.targetGroupName}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Attendance Score</span>
                  <strong className="text-emerald-700 font-bold">
                    {selectedTraining.attendees.filter((a) => a.status === 'Attended').length} / {selectedTraining.attendees.length} Present
                  </strong>
                </div>
              </div>

              {/* Attendee Roster Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[11px]">
                    Assigned Educators Attendance Muster ({selectedTraining.attendees.length})
                  </h4>
                  <button
                    onClick={() => handleExportRoster(selectedTraining)}
                    className="text-xs font-semibold text-primary-600 hover:underline flex items-center gap-1"
                  >
                    <LuDownload className="w-3.5 h-3.5" /> Export Muster CSV
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs min-w-[550px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[10px] uppercase tracking-wider">
                        <th className="py-2.5 px-3 font-semibold">Teacher Name & ID</th>
                        <th className="py-2.5 px-3 font-semibold">Department</th>
                        <th className="py-2.5 px-3 font-semibold text-center">Muster Status</th>
                        <th className="py-2.5 px-3 font-semibold">Attendance Timestamp</th>
                        <th className="py-2.5 px-3 font-semibold text-right">HR Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedTraining.attendees.map((att) => (
                        <tr key={att.teacherId} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-2.5 px-3">
                            <p className="font-bold text-gray-900">{att.teacherName}</p>
                            <span className="text-[10px] text-gray-400 font-mono">{att.teacherId} • {att.role}</span>
                          </td>

                          <td className="py-2.5 px-3">
                            <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                              {att.dept}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap ${
                                att.status === 'Attended'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : att.status === 'Excused / On Leave'
                                  ? 'bg-gray-100 text-gray-600'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {att.status === 'Attended' ? '✓ Attended' : att.status}
                            </span>
                          </td>

                          <td className="py-2.5 px-3">
                            {att.markedAt ? (
                              <div>
                                <span className="font-mono text-gray-700 font-semibold text-[11px]">{att.markedAt}</span>
                                {att.feedback && (
                                  <p className="text-[10px] text-gray-400 italic mt-0.5">"{att.feedback}"</p>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic text-[11px]">Pending Teacher Mark</span>
                            )}
                          </td>

                          <td className="py-2.5 px-3 text-right">
                            {att.status !== 'Attended' ? (
                              <button
                                onClick={() => handleHRMarkAttendance(selectedTraining.id, att.teacherId)}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded font-semibold text-[11px] border border-emerald-200 transition-colors whitespace-nowrap"
                              >
                                Mark Present
                              </button>
                            ) : (
                              <span className="text-emerald-700 font-bold text-[11px] flex items-center justify-end gap-1">
                                <LuCheckCheck className="w-3.5 h-3.5" /> Verified
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end">
              <button
                onClick={() => setSelectedTraining(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-semibold"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PLAN NEW TRAINING PROGRAM MODAL */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-xl overflow-hidden flex flex-col animate-slide-up border border-gray-200 max-h-[90vh]">
            <div className="bg-white border-b border-gray-200 p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-800">Plan Faculty Training Program</h3>
                <p className="text-xs text-gray-400">Assign to a specific teacher or group of educators</p>
              </div>
              <button
                onClick={() => setShowPlanModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTraining} className="p-5 space-y-3.5 text-xs overflow-y-auto">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Training Program Title *</label>
                <input
                  name="title"
                  required
                  placeholder="e.g. CBSE Experiential Science Lab & Rubrics Masterclass"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category</label>
                  <select name="category" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none">
                    <option value="Pedagogy & Curriculum">Pedagogy & Curriculum</option>
                    <option value="Technology & STEM">Technology & STEM</option>
                    <option value="Student Wellness">Student Wellness & Counseling</option>
                    <option value="Compliance & Safety">Compliance & Safety</option>
                    <option value="Leadership & Admin">Leadership & Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Delivery Mode</label>
                  <select name="mode" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none">
                    <option value="In-Person">In-Person (On-Campus)</option>
                    <option value="Virtual / Zoom">Virtual / Webinar</option>
                    <option value="Hybrid">Hybrid (Classroom + Stream)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Trainer / Master Educator *</label>
                  <input
                    name="trainer"
                    required
                    placeholder="e.g. Dr. K. R. Raman"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Trainer Organization</label>
                  <input
                    name="trainerOrg"
                    placeholder="e.g. CBSE Academic Wing / Intel STEM"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Date *</label>
                  <input
                    name="date"
                    required
                    defaultValue="28 Aug 2026"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Timing</label>
                  <input
                    name="time"
                    defaultValue="02:00 PM - 05:00 PM"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Venue / Location</label>
                  <input
                    name="venue"
                    defaultValue="Main Auditorium"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* TARGET AUDIENCE SELECTION (SPECIFIC TEACHERS OR GROUP) */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Target Faculty Assignment *</label>
                  <p className="text-[11px] text-gray-500">Choose whether to assign to a pre-grouped department or select specific individual teachers</p>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-700">
                    <input
                      type="radio"
                      name="assignType"
                      checked={targetType === 'group'}
                      onChange={() => setTargetType('group')}
                      className="text-primary-600"
                    />
                    Assign to Teacher Group
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-700">
                    <input
                      type="radio"
                      name="assignType"
                      checked={targetType === 'specific'}
                      onChange={() => setTargetType('specific')}
                      className="text-primary-600"
                    />
                    Assign Specific Individual Teachers
                  </label>
                </div>

                {targetType === 'group' ? (
                  <div className="space-y-2">
                    <div className="bg-purple-50/70 border border-purple-200 rounded-lg p-2.5 flex items-start gap-2 text-xs">
                      <LuBell className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                      <p className="text-purple-800 text-[11px] leading-relaxed">
                        <span className="font-bold">Broadcast Notification:</span> Selecting a teacher group will automatically dispatch push notifications to <strong>all teachers and staff</strong> upon creating this plan.
                      </p>
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Select Department / Faculty Group</label>
                      <select
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none font-semibold text-gray-800"
                      >
                        <option value="ALL">All Faculty & Staff ({teachersList.length} Teachers)</option>
                        {[...new Set(teachersList.map((t) => t.department || t.dept).filter(Boolean))].map((dept) => (
                          <option key={dept} value={dept}>
                            {dept} Department ({teachersList.filter((t) => (t.department || t.dept) === dept).length} Teachers)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block font-semibold text-gray-700 text-xs">
                        Check Individual Teachers ({selectedSpecificTeachers.length} Selected)
                      </label>
                      {teachersList.length > 0 && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedSpecificTeachers(teachersList.map((t) => t.teacher_id || t.id))}
                            className="text-[10px] font-bold text-primary-600 hover:text-primary-800 cursor-pointer"
                          >
                            Select All
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            type="button"
                            onClick={() => setSelectedSpecificTeachers([])}
                            className="text-[10px] font-bold text-gray-500 hover:text-gray-700 cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Quick filter input */}
                    {teachersList.length > 3 && (
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search teacher by name or department..."
                          value={teacherSearchQuery}
                          onChange={(e) => setTeacherSearchQuery(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs placeholder-gray-400 focus:outline-none"
                        />
                      </div>
                    )}

                    <div className="bg-white border border-gray-200 rounded-lg p-1.5 max-h-44 overflow-y-auto divide-y divide-gray-100">
                      {teachersList.length === 0 ? (
                        <div className="p-4 text-center text-xs text-amber-600 bg-amber-50 rounded-lg">
                          No registered teachers found in database.
                        </div>
                      ) : (
                        teachersList
                          .filter((t) => {
                            if (!teacherSearchQuery.trim()) return true;
                            const q = teacherSearchQuery.toLowerCase();
                            const name = (t.full_name || `${t.first_name || ''} ${t.last_name || ''}` || t.name || '').toLowerCase();
                            const dept = (t.department || t.dept || '').toLowerCase();
                            return name.includes(q) || dept.includes(q);
                          })
                          .map((t) => {
                            const tId = t.teacher_id || t.id;
                            const isChecked = selectedSpecificTeachers.includes(tId);
                            const displayName = t.full_name || [t.first_name, t.last_name].filter(Boolean).join(' ') || t.name || 'Faculty Member';
                            const displayRole = t.designation || t.role || 'Teacher';
                            const displayDept = t.department || t.dept || 'Academic';

                            return (
                              <label
                                key={tId}
                                className={`flex items-center justify-between p-2 hover:bg-purple-50/50 rounded-lg cursor-pointer transition-colors ${
                                  isChecked ? 'bg-purple-50/70 border border-purple-200' : ''
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedSpecificTeachers([...selectedSpecificTeachers, tId]);
                                      } else {
                                        setSelectedSpecificTeachers(
                                          selectedSpecificTeachers.filter((id) => id !== tId)
                                        );
                                      }
                                    }}
                                    className="text-primary-600 rounded w-4 h-4 cursor-pointer"
                                  />
                                  <div>
                                    <span className="font-semibold text-gray-800 text-xs block">{displayName}</span>
                                    <span className="text-[10px] text-gray-400 block">{displayRole}</span>
                                  </div>
                                </div>
                                <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                  {displayDept}
                                </span>
                              </label>
                            );
                          })
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Training Description & Agenda *</label>
                <textarea
                  name="description"
                  required
                  rows={2}
                  placeholder="Key topics, prerequisites, and workshop outcomes..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div className="p-4 bg-gray-50 -mx-5 -mb-5 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-all"
                >
                  <LuBell className={`w-3.5 h-3.5 ${submitting ? 'animate-bounce' : ''}`} />
                  {submitting ? 'Planning & Dispatching...' : 'Plan & Dispatch Notifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
