import React, { useState, useEffect } from 'react';
import {
  LuPresentation,
  LuCalendar,
  LuClock,
  LuMapPin,
  LuCircleCheck,
  LuCircleAlert,
  LuCheck,
  LuBell,
  LuAward,
  LuUserCheck,
  LuX,
  LuMessageSquare,
  LuSparkles,
} from 'react-icons/lu';
import {
  getStoredTrainings,
  markTeacherAttendance,
  TEACHERS_LIST,
} from '../../data/trainingsStore';

export default function TeacherTrainingsPage() {
  const [trainings, setTrainings] = useState([]);
  const [activeTeacherId, setActiveTeacherId] = useState('TCH-102'); // Default to Mr. Vikram Rathore or toggle
  const [selectedTrainingForAttendance, setSelectedTrainingForAttendance] = useState(null);
  const [attendanceFeedback, setAttendanceFeedback] = useState('');

  useEffect(() => {
    setTrainings(getStoredTrainings());
  }, []);

  const refreshData = () => {
    setTrainings(getStoredTrainings());
  };

  const activeTeacher = TEACHERS_LIST.find((t) => t.id === activeTeacherId) || TEACHERS_LIST[0];

  // Filter trainings where this teacher is assigned as an attendee
  const myTrainings = trainings.filter((t) =>
    t.attendees.some((a) => a.teacherId === activeTeacherId)
  );

  const pendingAttendanceTrainings = myTrainings.filter((t) => {
    const myRecord = t.attendees.find((a) => a.teacherId === activeTeacherId);
    return myRecord && myRecord.status !== 'Attended';
  });

  const completedTrainings = myTrainings.filter((t) => {
    const myRecord = t.attendees.find((a) => a.teacherId === activeTeacherId);
    return myRecord && myRecord.status === 'Attended';
  });

  const handleMarkAttendanceSubmit = (e) => {
    e.preventDefault();
    if (!selectedTrainingForAttendance) return;

    const updated = markTeacherAttendance(
      selectedTrainingForAttendance.id,
      activeTeacherId,
      attendanceFeedback
    );

    setTrainings(updated);
    setSelectedTrainingForAttendance(null);
    setAttendanceFeedback('');
    alert(`Attendance marked successfully for "${selectedTrainingForAttendance.title}"! HR muster has been updated in real-time.`);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Clean Standard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <LuPresentation className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">My Assigned Professional Trainings</h1>
            <p className="text-xs text-gray-400">View HR-planned workshops, receive notifications, and mark your training attendance</p>
          </div>
        </div>

        {/* Teacher Persona Switcher (For live demonstration across educators) */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold text-gray-500">Logged in Educator:</span>
          <select
            value={activeTeacherId}
            onChange={(e) => setActiveTeacherId(e.target.value)}
            className="py-1.5 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 focus:outline-none"
          >
            {TEACHERS_LIST.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.dept})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Real-time Notification Banner for Pending Training Attendance */}
      {pendingAttendanceTrainings.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 mt-0.5">
              <LuBell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h3 className="font-bold text-primary-900 text-sm">
                Action Required: {pendingAttendanceTrainings.length} Training Program(s) Assigned to You
              </h3>
              <p className="text-primary-700 mt-0.5">
                HR has dispatched training notifications for your department. Once you attend, please mark your attendance below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards for the Teacher */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Assigned</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">{myTrainings.length} Programs</p>
          <p className="text-xs text-gray-400 mt-0.5">Session 2026-27</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Attended & Verified</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{completedTrainings.length} Attended</p>
          <p className="text-xs text-emerald-700 font-medium mt-0.5">Verified on HR Muster</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-100 bg-amber-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Pending Attendance</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pendingAttendanceTrainings.length} Pending</p>
          <p className="text-xs text-amber-700 font-medium mt-0.5">Mark after session</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Training Hours</span>
          <p className="text-2xl font-bold text-primary-600 mt-1">{completedTrainings.length * 3.5} Hours</p>
          <p className="text-xs text-gray-400 mt-0.5">CPD Credits Earned</p>
        </div>
      </div>

      {/* My Assigned Training Programs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-800">
              Assigned Training Roster for {activeTeacher.name}
            </h2>
            <p className="text-xs text-gray-400">Review schedule, topics, venue, and confirm your presence</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myTrainings.map((prog) => {
            const myRecord = prog.attendees.find((a) => a.teacherId === activeTeacherId);
            const isAttended = myRecord && myRecord.status === 'Attended';

            return (
              <div
                key={prog.id}
                className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-100">
                      {prog.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
                        isAttended
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isAttended ? '✓ Attended & Verified' : '● Action: Mark Attendance'}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm mt-1 leading-snug">
                    {prog.title}
                  </h3>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                    Trainer: <strong className="text-gray-700">{prog.trainer}</strong> ({prog.trainerOrg})
                  </p>

                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    {prog.description}
                  </p>

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mt-3 space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-gray-600 font-medium">
                        <LuCalendar className="w-3.5 h-3.5 text-primary-600" /> {prog.date}
                      </span>
                      <span className="flex items-center gap-1 text-gray-500 font-mono text-[11px]">
                        <LuClock className="w-3.5 h-3.5 text-gray-400" /> {prog.time}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 text-gray-500 truncate max-w-[200px]">
                        <LuMapPin className="w-3.5 h-3.5 text-gray-400" /> {prog.venue}
                      </span>
                      <span className="font-semibold text-primary-700">{prog.mode}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action / Attendance Info */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  {isAttended ? (
                    <div className="text-[11px] text-emerald-700 font-medium">
                      <span>Marked on: <strong>{myRecord.markedAt}</strong></span>
                      {myRecord.feedback && (
                        <p className="text-gray-500 italic text-[10px]">Note: "{myRecord.feedback}"</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-[11px] text-amber-700 font-medium">
                      <span>Status: Attendance pending</span>
                    </div>
                  )}

                  {!isAttended ? (
                    <button
                      onClick={() => setSelectedTrainingForAttendance(prog)}
                      className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <LuUserCheck className="w-3.5 h-3.5" /> Mark My Attendance
                    </button>
                  ) : (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200 flex items-center gap-1">
                      <LuCircleCheck className="w-3.5 h-3.5" /> Present
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MARK ATTENDANCE MODAL */}
      {selectedTrainingForAttendance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden flex flex-col animate-slide-up border border-gray-200">
            <div className="bg-white border-b border-gray-200 p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-800">Mark Training Attendance</h3>
                <p className="text-xs text-gray-400">Confirm presence for {activeTeacher.name}</p>
              </div>
              <button
                onClick={() => setSelectedTrainingForAttendance(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMarkAttendanceSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-1.5">
                <h4 className="font-bold text-gray-900">{selectedTrainingForAttendance.title}</h4>
                <p className="text-[11px] text-gray-500">
                  Trainer: {selectedTrainingForAttendance.trainer} • {selectedTrainingForAttendance.date}
                </p>
                <p className="text-[11px] text-primary-700 font-semibold">
                  Mode: {selectedTrainingForAttendance.mode} ({selectedTrainingForAttendance.venue})
                </p>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Session Feedback / Key Learnings (Optional)
                </label>
                <textarea
                  value={attendanceFeedback}
                  onChange={(e) => setAttendanceFeedback(e.target.value)}
                  rows={3}
                  placeholder="e.g. Completed interactive session; gained practical insights for classroom assessments."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div className="p-4 bg-gray-50 -mx-5 -mb-5 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTrainingForAttendance(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5"
                >
                  <LuCircleCheck className="w-3.5 h-3.5" /> Confirm & Mark Present
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
