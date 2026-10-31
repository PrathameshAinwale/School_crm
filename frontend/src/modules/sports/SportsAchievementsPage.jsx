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
  LuCalendarDays,
  LuUsers,
  LuChevronRight,
} from 'react-icons/lu';

export default function SportsAchievementsPage() {
  const [participants, setParticipants] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [medalFilter, setMedalFilter] = useState('all');
  const [sportFilter, setSportFilter] = useState('all');

  const loadAchievements = async () => {
    setLoading(true);
    try {
      const [res, discRes] = await Promise.all([
        sportsService.getParticipants({ search }),
        sportsService.getDisciplines(),
      ]);

      if (res?.success) {
        // Filter only those with achievements
        const achieved = (res.data.participants || []).filter(
          (p) => p.achievement && p.achievement !== 'None'
        );
        setParticipants(achieved);
      }
      if (discRes?.success) setDisciplines(discRes.data.sports || []);
    } catch (err) {
      console.error('Error fetching achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  const goldCount = participants.filter((p) => p.achievement.includes('Gold')).length;
  const silverCount = participants.filter((p) => p.achievement.includes('Silver')).length;
  const bronzeCount = participants.filter((p) => p.achievement.includes('Bronze')).length;
  const mvpCount = participants.filter((p) => p.achievement.includes('Best Player') || p.achievement.includes('MVP')).length;

  const filtered = participants.filter((p) => {
    const matchesMedal = medalFilter === 'all' || p.achievement.toLowerCase().includes(medalFilter.toLowerCase());
    const matchesSport = sportFilter === 'all' || String(p.sport_id) === String(sportFilter);
    return matchesMedal && matchesSport;
  });

  return (
    <div className="space-y-5 sm:space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto">
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

        <select
          value={sportFilter}
          onChange={(e) => setSportFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
        >
          <option value="all">All Sports</option>
          {disciplines.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Athletes Honors Showcase */}
      {loading ? (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-12 text-center text-xs text-slate-400 shadow-xs">
          <LuLoader className="w-6 h-6 animate-spin mx-auto text-primary-600 mb-2" />
          Loading Hall of Fame...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <LuAward className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No Honors Logged for this Category</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Medals and trophies awarded in competitions will appear in this Hall of Fame showcase.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const student = item.student;
            const studentName = student
              ? `${student.first_name || ''} ${student.last_name || ''}`.trim()
              : 'Student Athlete';
            const isGold = item.achievement.includes('Gold');
            const isSilver = item.achievement.includes('Silver');
            const isBronze = item.achievement.includes('Bronze');

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                  isGold ? 'bg-amber-400' : isSilver ? 'bg-slate-400' : isBronze ? 'bg-orange-500' : 'bg-purple-600'
                }`} />

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {item.sport?.name}
                    </span>
                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      isGold
                        ? 'bg-amber-50 text-amber-800 border border-amber-300'
                        : isSilver
                        ? 'bg-slate-100 text-slate-800 border border-slate-300'
                        : isBronze
                        ? 'bg-orange-50 text-orange-800 border border-orange-300'
                        : 'bg-purple-50 text-purple-800 border border-purple-300'
                    }`}>
                      <LuMedal className="w-3.5 h-3.5" />
                      {item.achievement}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 mt-3">{studentName}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {student?.schoolClass ? `Class ${student.schoolClass.name}` : ''} • Adm: {student?.admission_number || '—'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs space-y-1">
                  <div className="font-semibold text-slate-800">
                    {item.competition?.title || 'Tournament Event'}
                  </div>
                  {item.performance_notes && (
                    <p className="text-[11px] text-slate-500 italic">
                      "{item.performance_notes}"
                    </p>
                  )}
                  {item.jersey_number && (
                    <div className="text-[10px] font-mono text-slate-400">
                      Jersey #{item.jersey_number} • Role: {item.role || 'Player'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
