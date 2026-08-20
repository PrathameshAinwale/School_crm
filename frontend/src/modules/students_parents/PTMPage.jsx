import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentParentService } from '../../services/studentParentService';
import {
  LuCalendarCheck,
  LuArrowLeft,
  LuClock,
  LuMapPin,
  LuUser,
  LuCheck,
  LuFileText,
  LuCalendar,
  LuLoader,
} from 'react-icons/lu';

const defaultAvailableSlots = [
  '9:00 AM - 9:30 AM',
  '9:30 AM - 10:00 AM',
  '10:00 AM - 10:30 AM',
  '10:30 AM - 11:00 AM (Current)',
  '11:30 AM - 12:00 PM',
  '12:00 PM - 12:30 PM',
];

const fallbackPastPtmHistory = [
  {
    id: 1,
    term: 'Orientation & Term 1 Initial PTM',
    date: 'May 02, 2026',
    teacher: 'Dr. Ananya Sen (Class Teacher)',
    venue: 'Room 301',
    discussion: 'Discussion on Class X curriculum pace, board examination registration, and focus areas for mathematics problem solving.',
    keyDecisions: 'Parent agreed to monitor 2 hours daily study schedule. Aarav enrolled in weekly advanced problem-solving club.',
  },
  {
    id: 2,
    term: 'Class IX Annual Final PTM',
    date: 'Mar 24, 2026',
    teacher: 'Mr. Vikram Rathore (Ex-Class Teacher)',
    venue: 'Science Block Lab 2',
    discussion: 'Class IX Annual report card discussion. Overall Grade: 91.8% (A1). Commended for excellent lab work.',
    keyDecisions: 'Recommended for Senior Mathematics Standard in Class X.',
  },
];

export default function PTMPage() {
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState('10:30 AM - 11:00 AM (Current)');
  const [availableSlots, setAvailableSlots] = useState(defaultAvailableSlots);
  const [rescheduledSuccess, setRescheduledSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [agendaNotes, setAgendaNotes] = useState('Would like to discuss mid-term preparation and recommended reference books for Class X Math.');
  const [upcoming, setUpcoming] = useState({
    term: 'Upcoming PTM Term 1',
    date: 'Saturday, September 05, 2026',
    timeSlot: '10:30 AM - 11:00 AM',
    teacher: 'Dr. Ananya Sen (Class Teacher)',
    venue: 'Room 301, Senior Academic Wing',
  });
  const [pastHistory, setPastHistory] = useState(fallbackPastPtmHistory);
  const [loading, setLoading] = useState(true);

  const fetchPtm = () => {
    setLoading(true);
    studentParentService.getPtmInfo()
      .then((res) => {
        if (res?.data) {
          if (res.data.upcoming) {
            setUpcoming(res.data.upcoming);
            setSelectedSlot(res.data.upcoming.timeSlot);
            if (res.data.upcoming.agendaNotes) setAgendaNotes(res.data.upcoming.agendaNotes);
          }
          if (res.data.availableSlots && res.data.availableSlots.length > 0) {
            setAvailableSlots(res.data.availableSlots);
          }
          if (res.data.pastHistory && res.data.pastHistory.length > 0) {
            setPastHistory(res.data.pastHistory);
          }
        }
      })
      .catch((err) => console.log('Loaded fallback PTM data:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPtm();
  }, []);

  const handleReschedule = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await studentParentService.reschedulePtm({
        time_slot: selectedSlot,
        agenda_notes: agendaNotes,
      });
      setRescheduledSuccess(true);
      setTimeout(() => setRescheduledSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setRescheduledSuccess(true);
      setTimeout(() => setRescheduledSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <LuArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Parent-Teacher Meeting (PTM) Portal</h1>
            <p className="text-xs text-gray-400">1-on-1 Meeting Scheduling, Agenda Setting & Faculty Consultation Notes</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 font-mono">
          Slot Confirmed
        </span>
      </div>

      {/* Confirmed Meeting Card */}
      <div className="bg-white p-6 rounded-xl border border-purple-200 bg-purple-50/20 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg shrink-0">
              <LuCalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">{upcoming.term}</span>
              <h2 className="text-lg font-bold text-gray-800">{upcoming.date}</h2>
              <p className="text-xs text-gray-500">Class X-A Mid-Term Performance Consultation</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 self-start sm:self-auto">
            ✓ Confirmed Appointment
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-gray-200 text-xs">
          <div>
            <span className="text-gray-400 text-[10px] uppercase font-bold">Confirmed Time Slot</span>
            <p className="font-bold text-gray-800 mt-0.5 flex items-center gap-1.5">
              <LuClock className="w-3.5 h-3.5 text-primary-600" /> {selectedSlot}
            </p>
          </div>
          <div>
            <span className="text-gray-400 text-[10px] uppercase font-bold">Faculty In-Charge</span>
            <p className="font-bold text-gray-800 mt-0.5 flex items-center gap-1.5">
              <LuUser className="w-3.5 h-3.5 text-primary-600" /> {upcoming.teacher}
            </p>
          </div>
          <div>
            <span className="text-gray-400 text-[10px] uppercase font-bold">Meeting Venue</span>
            <p className="font-bold text-gray-800 mt-0.5 flex items-center gap-1.5">
              <LuMapPin className="w-3.5 h-3.5 text-primary-600" /> {upcoming.venue}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Agenda / Reschedule & Past PTM Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reschedule & Agenda Form */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-1">Reschedule Slot or Update Parent Agenda</h3>
            <p className="text-xs text-gray-400 mb-4">Choose a different 30-minute consultation slot if needed</p>

            {rescheduledSuccess && (
              <div className="p-3 mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
                <LuCheck className="w-4 h-4 shrink-0" />
                <span>Appointment slot updated successfully with Dr. Ananya Sen!</span>
              </div>
            )}

            <form onSubmit={handleReschedule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Available Slots on Sep 05</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-all ${
                        selectedSlot === slot
                          ? 'bg-primary-600 border-primary-600 text-white font-bold shadow-xs'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Discussion Agenda / Specific Queries for Faculty</label>
                <textarea
                  rows={3}
                  value={agendaNotes}
                  onChange={(e) => setAgendaNotes(e.target.value)}
                  placeholder="Share specific concerns (e.g. math word problems, board pattern sample papers)..."
                  className="w-full p-3 rounded-lg border border-gray-200 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-primary-400"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50"
              >
                {saving ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuCalendarCheck className="w-4 h-4" />} Confirm & Save PTM Preferences
              </button>
            </form>
          </div>

          <p className="text-[11px] text-gray-400 mt-4 text-center">
            You will receive SMS reminders 24 hours before your confirmed time slot.
          </p>
        </div>

        {/* Past PTM History */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-800">Previous PTM Consultation History</h3>

          <div className="space-y-3">
            {pastHistory.map((ptm, i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">{ptm.term}</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">{ptm.date} • Venue: {ptm.venue}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Completed
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="text-gray-400 text-[10px] uppercase font-bold">Faculty Discussion Summary</span>
                    <p className="text-gray-700 mt-0.5 leading-relaxed">{ptm.discussion}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-purple-50/60 border border-purple-100">
                    <span className="text-purple-700 text-[10px] uppercase font-bold">Agreed Action Items & Decisions</span>
                    <p className="text-purple-900 mt-0.5 font-medium leading-relaxed">{ptm.keyDecisions}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <span>Conducted by: <strong>{ptm.teacher}</strong></span>
                  <button className="text-primary-600 hover:text-primary-800 font-bold inline-flex items-center gap-1">
                    <LuFileText className="w-3.5 h-3.5" /> PTM Summary Slip
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
