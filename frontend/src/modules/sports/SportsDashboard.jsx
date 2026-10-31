import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeCard from '../../components/Dashboard/WelcomeCard';
import { sportsService } from '../../services/sportsService';
import {
  LuTrophy,
  LuMedal,
  LuCalendarDays,
  LuUsers,
  LuPlus,
  LuMapPin,
  LuClock,
  LuArrowRight,
  LuCircleCheck,
  LuShieldAlert,
  LuSwords,
  LuSparkles,
  LuChevronRight,
  LuAward,
  LuActivity,
  LuBoxes,
} from 'react-icons/lu';

export default function SportsDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await sportsService.getDashboard();
      if (res?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error loading sports dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const summary = data?.summary || {
    total_sports: 0,
    total_competitions: 0,
    upcoming_competitions: 0,
    total_participants: 0,
    total_medals: 0,
    attending_athletes: 0,
  };

  const upcomingCompetitions = data?.upcoming_competitions || [];
  const recentAchievements = data?.recent_achievements || [];
  const disciplines = data?.disciplines || [];

  return (
    <div className="space-y-4 sm:space-y-5 pb-12 animate-fade-in max-w-7xl mx-auto">
      {/* 1. Global Standard Welcome Card */}
      <WelcomeCard />

      {/* 2. Top Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-base sm:text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <LuTrophy className="w-5 h-5 text-primary-600" />
            Sports & Athletics Operations
          </h1>
          <p className="text-slate-500 text-[10px] sm:text-xs mt-0.5">
            Tournaments, weekly training schedules, athlete attendance rosters, and equipment tracking
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => navigate('/sports/activities?action=new_comp')}
            className="px-3.5 py-2 rounded-lg sm:rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LuPlus className="w-3.5 h-3.5" />
            Schedule Competition
          </button>
          <button
            onClick={() => navigate('/sports/participants?action=enroll')}
            className="px-3.5 py-2 rounded-lg sm:rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LuUsers className="w-3.5 h-3.5 text-primary-600" />
            Enroll Athlete
          </button>
        </div>
      </div>

      {/* 3. KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Active Sports */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-primary-200 transition-all flex items-center justify-between">
          <div>
            <div className="text-[10px] sm:text-xs font-medium text-slate-500">Active Disciplines</div>
            <div className="text-lg sm:text-2xl font-bold text-slate-800 mt-0.5 tracking-tight">
              {loading ? '...' : summary.total_sports}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Sport squads & clubs</div>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <LuActivity className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Scheduled Matches */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-blue-200 transition-all flex items-center justify-between">
          <div>
            <div className="text-[10px] sm:text-xs font-medium text-slate-500">Competitions</div>
            <div className="text-lg sm:text-2xl font-bold text-slate-800 mt-0.5 tracking-tight">
              {loading ? '...' : summary.upcoming_competitions}
            </div>
            <div className="text-[10px] sm:text-[11px] text-blue-600 font-semibold mt-0.5">Upcoming fixtures</div>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <LuCalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Enrolled Athletes */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-indigo-200 transition-all flex items-center justify-between">
          <div>
            <div className="text-[10px] sm:text-xs font-medium text-slate-500">Student Athletes</div>
            <div className="text-lg sm:text-2xl font-bold text-slate-800 mt-0.5 tracking-tight">
              {loading ? '...' : summary.total_participants}
            </div>
            <div className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold mt-0.5">
              {summary.attending_athletes} currently attending
            </div>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <LuUsers className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Medals & Honors */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-amber-200 transition-all flex items-center justify-between">
          <div>
            <div className="text-[10px] sm:text-xs font-medium text-slate-500">Medals & Honors</div>
            <div className="text-lg sm:text-2xl font-bold text-slate-800 mt-0.5 tracking-tight">
              {loading ? '...' : summary.total_medals}
            </div>
            <div className="text-[10px] sm:text-[11px] text-amber-600 font-semibold mt-0.5 flex items-center gap-1">
              <LuSparkles className="w-3 h-3" /> State & District awards
            </div>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <LuTrophy className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* 4. Sports Operations Navigation Hub */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <LuBoxes className="w-4 h-4 text-primary-600" />
              Sports Operations Suite
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Direct access to all sports disciplines, facilities, practice schedules, equipment, and athlete records
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 mt-3.5">
          <button
            onClick={() => navigate('/sports/activities')}
            className="p-3 rounded-xl border border-slate-200/80 hover:border-primary-300 bg-slate-50/50 hover:bg-primary-50/20 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <LuSwords className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-800 mt-2.5 group-hover:text-primary-700">Competitions</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Matches & results</p>
          </button>

          <button
            onClick={() => navigate('/sports/participants')}
            className="p-3 rounded-xl border border-slate-200/80 hover:border-primary-300 bg-slate-50/50 hover:bg-primary-50/20 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <LuUsers className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-800 mt-2.5 group-hover:text-primary-700">Athlete Roster</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Live attendance</p>
          </button>

          <button
            onClick={() => navigate('/sports/schedules')}
            className="p-3 rounded-xl border border-slate-200/80 hover:border-primary-300 bg-slate-50/50 hover:bg-primary-50/20 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <LuClock className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-800 mt-2.5 group-hover:text-primary-700">Practice Drills</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Batch timetables</p>
          </button>

          <button
            onClick={() => navigate('/sports/facilities')}
            className="p-3 rounded-xl border border-slate-200/80 hover:border-primary-300 bg-slate-50/50 hover:bg-primary-50/20 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <LuMapPin className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-800 mt-2.5 group-hover:text-primary-700">Grounds & Turfs</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Courts & status</p>
          </button>

          <button
            onClick={() => navigate('/sports/inventory')}
            className="p-3 rounded-xl border border-slate-200/80 hover:border-primary-300 bg-slate-50/50 hover:bg-primary-50/20 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <LuBoxes className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-800 mt-2.5 group-hover:text-primary-700">Equipment</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Stock & checkouts</p>
          </button>

          <button
            onClick={() => navigate('/sports/fitness')}
            className="p-3 rounded-xl border border-slate-200/80 hover:border-primary-300 bg-slate-50/50 hover:bg-primary-50/20 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <LuActivity className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-800 mt-2.5 group-hover:text-primary-700">Fitness & BMI</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Health clearance</p>
          </button>
        </div>
      </div>

      {/* 5. Main Grid: Upcoming Competitions & Recent Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Scheduled Competitions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                  <LuSwords className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Upcoming Fixtures & Competitions</h2>
                  <p className="text-[11px] text-slate-400">Scheduled tournaments and inter-school matches</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/sports/activities')}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 cursor-pointer"
              >
                View all <LuArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading tournament fixtures...</div>
            ) : upcomingCompetitions.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <LuCalendarDays className="w-10 h-10 stroke-[1.2] mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">No upcoming matches scheduled</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Schedule a match to view it on the fixture board.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {upcomingCompetitions.map((comp) => (
                  <div key={comp.id} className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors px-2 rounded-xl">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-xs truncate max-w-xs">{comp.title}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-50 text-primary-700 border border-primary-200/60">
                          {comp.sport?.name || 'Sport'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                          {comp.tournament_level || 'Open'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 font-medium text-slate-600">
                          <LuCalendarDays className="w-3 h-3 text-slate-400" />
                          {comp.start_date}
                        </span>
                        {comp.venue && (
                          <span className="flex items-center gap-1 truncate max-w-[200px]">
                            <LuMapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            {comp.venue}
                          </span>
                        )}
                        {comp.opponent_school && (
                          <span className="text-primary-600 font-semibold truncate">
                            vs {comp.opponent_school}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => navigate('/sports/participants')}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 shrink-0 flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <LuUsers className="w-3 h-3 text-primary-600" />
                      Roster
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Sports Disciplines Grid */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                  <LuActivity className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Coached Disciplines</h2>
                  <p className="text-[11px] text-slate-400">Active school sports departments & head coaches</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/sports/activities?tab=disciplines')}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 cursor-pointer"
              >
                Manage <LuArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3.5">
              {disciplines.slice(0, 4).map((d) => (
                <div key={d.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 block truncate">{d.name}</span>
                    <span className="text-[11px] text-slate-500 font-medium block truncate mt-0.5">
                      Coach: {d.coach_name || 'Designated Coach'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block truncate">
                      {d.venue || 'Campus Sports Ground'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white text-slate-600 border border-slate-200 shrink-0">
                    {d.category || 'Outdoor'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Trophy Room & Medals */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <LuMedal className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Hall of Fame</h2>
                  <p className="text-[11px] text-slate-400">Recent medalists & championship honors</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/sports/achievements')}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 cursor-pointer"
              >
                Podium <LuChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading honors...</div>
            ) : recentAchievements.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <LuTrophy className="w-10 h-10 stroke-[1.2] mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">No medals recorded yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Award medals to student athletes to showcase them here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {recentAchievements.map((item) => {
                  const studentName = `${item.student?.first_name || ''} ${item.student?.last_name || ''}`.trim();
                  const isGold = item.achievement?.toLowerCase().includes('gold') || item.achievement?.toLowerCase().includes('winner') || item.achievement?.toLowerCase().includes('mvp');
                  const isSilver = item.achievement?.toLowerCase().includes('silver') || item.achievement?.toLowerCase().includes('runner');

                  return (
                    <div key={item.id} className="py-3 flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isGold
                            ? 'bg-amber-100 text-amber-700'
                            : isSilver
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        <LuAward className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-slate-900 truncate">{studentName || 'Student'}</div>
                        <div className="text-[11px] font-semibold text-amber-700 mt-0.5">{item.achievement}</div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {item.sport?.name} • {item.competition?.title || 'Championship'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
