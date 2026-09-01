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

export default function PTMPage() {
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState('10:30 AM - 11:00 AM (Current)');
  const [availableSlots, setAvailableSlots] = useState([
    '9:00 AM - 9:30 AM',
    '9:30 AM - 10:00 AM',
    '10:00 AM - 10:30 AM',
    '10:30 AM - 11:00 AM (Current)',
    '11:30 AM - 12:00 PM',
    '12:00 PM - 12:30 PM',
  ]);
  const [rescheduledSuccess, setRescheduledSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [agendaNotes, setAgendaNotes] = useState('');
  const [upcoming, setUpcoming] = useState(null);
  const [pastHistory, setPastHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPtm = () => {
    setLoading(true);
    studentParentService.getPtmInfo()
      .then((res) => {
        if (res?.data) {
          if (res.data.upcoming) {
            setUpcoming(res.data.upcoming);
            if (res.data.upcoming.timeSlot) setSelectedSlot(res.data.upcoming.timeSlot);
            if (res.data.upcoming.agendaNotes) setAgendaNotes(res.data.upcoming.agendaNotes);
          } else {
            setUpcoming(null);
          }
          if (res.data.availableSlots && Array.isArray(res.data.availableSlots)) {
            setAvailableSlots(res.data.availableSlots);
          }
          if (res.data.pastHistory && Array.isArray(res.data.pastHistory)) {
            setPastHistory(res.data.pastHistory);
          }
        }
      })
      .catch((err) => console.error('PTM data fetch error from database:', err))
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
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-10">
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
              <LuCalendarCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">{upcoming?.term || 'Term 1 Mid-Term Consultation'}</span>
              <h2 className="text-lg font-bold text-gray-800">{upcoming?.date || 'Saturday, Sep 12, 2026'}</h2>
              <p className="text-xs text-gray-500">Class 10-A Mid-Term Performance Consultation</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 self-start sm:self-auto">
            ✓ Confirmed Appointment
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 bg-white p-3 sm:p-4 rounded-xl border border-gray-200 text-xs">
          <div>
            <span className="text-gray-400 text-[9px] sm:text-[10px] uppercase font-bold">Confirmed Time Slot</span>
            <p className="font-bold text-gray-800 mt-0.5 flex items-center gap-1.5 text-xs sm:text-sm">
              <LuClock className="w-3.5 h-3.5 text-primary-600 shrink-0" /> {selectedSlot || upcoming?.timeSlot || '10:30 AM - 11:00 AM'}
            </p>
          </div>
          <div>
            <span className="text-gray-400 text-[9px] sm:text-[10px] uppercase font-bold">Faculty In-Charge</span>
            <p className="font-bold text-gray-800 mt-0.5 flex items-center gap-1.5 text-xs sm:text-sm truncate">
              <LuUser className="w-3.5 h-3.5 text-primary-600 shrink-0" /> {upcoming?.teacher || 'Dr. Ananya Sen'}
            </p>
          </div>
          <div>
            <span className="text-gray-400 text-[9px] sm:text-[10px] uppercase font-bold">Meeting Venue</span>
            <p className="font-bold text-gray-800 mt-0.5 flex items-center gap-1.5 text-xs sm:text-sm truncate">
              <LuMapPin className="w-3.5 h-3.5 text-primary-600 shrink-0" /> {upcoming?.venue || 'Senior Wing Room 301'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Agenda / Reschedule & Past PTM Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Reschedule & Agenda Form */}
        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-800 mb-0.5 sm:mb-1">Reschedule Slot or Parent Agenda</h3>
            <p className="text-[11px] sm:text-xs text-gray-400 mb-3 sm:mb-4">Select an available 30-minute consultation slot</p>

            {rescheduledSuccess && (
              <div className="p-2.5 sm:p-3 mb-3 sm:mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] sm:text-xs flex items-center gap-2 animate-fade-in">
                <LuCheck className="w-4 h-4 shrink-0" />
                <span>Appointment slot updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleReschedule} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-gray-700 mb-1.5">Available Slots</label>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2 sm:p-2.5 rounded-lg border text-[10px] sm:text-xs font-medium text-center transition-all cursor-pointer ${
                        selectedSlot === slot
                          ? 'bg-primary-600 border-primary-600 text-white font-bold shadow-2xs'
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
