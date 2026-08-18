import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LuCalendarCheck,
  LuArrowLeft,
  LuClock,
  LuMapPin,
  LuUser,
  LuCheck,
  LuFileText,
  LuCalendar,
} from 'react-icons/lu';

const availableSlots = [
  '9:00 AM - 9:30 AM',
  '9:30 AM - 10:00 AM',
  '10:00 AM - 10:30 AM',
  '10:30 AM - 11:00 AM (Current)',
  '11:30 AM - 12:00 PM',
  '12:00 PM - 12:30 PM',
];

const pastPtmHistory = [
  {
    term: 'Orientation & Term 1 Initial PTM',
    date: 'May 02, 2026',
    teacher: 'Dr. Ananya Sen (Class Teacher)',
    venue: 'Room 301',
    discussion: 'Discussion on Class X curriculum pace, board examination registration, and focus areas for mathematics problem solving.',
    keyDecisions: 'Parent agreed to monitor 2 hours daily study schedule. Aarav enrolled in weekly advanced problem-solving club.',
  },
  {
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
  const [rescheduledSuccess, setRescheduledSuccess] = useState(false);
  const [agendaNotes, setAgendaNotes] = useState('Would like to discuss mid-term preparation and recommended reference books for Class X Math.');

  const handleReschedule = (e) => {
    e.preventDefault();
    setRescheduledSuccess(true);
    setTimeout(() => setRescheduledSuccess(false), 3000);
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
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Upcoming PTM Term 1</span>
              <h2 className="text-lg font-bold text-gray-800">Saturday, September 05, 2026</h2>
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
              <LuUser className="w-3.5 h-3.5 text-primary-600" /> Dr. Ananya Sen (Class Teacher)
            </p>
          </div>
          <div>
            <span className="text-gray-400 text-[10px] uppercase font-bold">Meeting Venue</span>
            <p className="font-bold text-gray-800 mt-0.5 flex items-center gap-1.5">
              <LuMapPin className="w-3.5 h-3.5 text-primary-600" /> Room 301, Senior Block
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
                          ? 'border-primary-600 bg-primary-50 text-primary-900 font-bold'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Parent Questions / Specific Topics to Discuss
                </label>
                <textarea
                  rows={4}
                  value={agendaNotes}
                  onChange={(e) => setAgendaNotes(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-primary-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                Save & Confirm Meeting Details
              </button>
            </form>
          </div>
        </div>

        {/* Past PTM History */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-1">Past PTM Consultation Records</h3>
            <p className="text-xs text-gray-400 mb-4">Official minutes of meeting & teacher guidance notes</p>

            <div className="space-y-3">
              {pastPtmHistory.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-800">{item.term}</h4>
                    <span className="text-[11px] text-primary-600 font-semibold">{item.date}</span>
                  </div>
                  <p className="text-[11px] text-gray-500">Conducted with: <strong>{item.teacher}</strong> ({item.venue})</p>
                  <p className="text-gray-700 leading-relaxed italic">"{item.discussion}"</p>
                  <div className="pt-2 border-t border-gray-200/80 text-[11px] text-emerald-700 font-medium">
                    Key Decisions: {item.keyDecisions}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-gray-100 text-center text-xs text-gray-400">
            For urgent meetings, contact Class Teacher via School Reception.
          </div>
        </div>
      </div>
    </div>
  );
}
