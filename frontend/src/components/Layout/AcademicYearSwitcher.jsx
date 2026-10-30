import { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { LuCalendarDays, LuCheck, LuChevronDown } from 'react-icons/lu';

export default function AcademicYearSwitcher() {
  const [years, setYears] = useState([]);
  const [activeYear, setActiveYear] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    loadAcademicYears();
  }, []);

  const loadAcademicYears = async () => {
    try {
      const res = await api.get('/academic-years');
      if (res.success && res.data) {
        const list = res.data.academic_years || [];
        setYears(list);

        const storedId = localStorage.getItem('active_academic_year_id');
        let current = null;
        if (storedId) {
          current = list.find((y) => (y.id === parseInt(storedId, 10)));
        }
        if (!current) {
          current = res.data.current_year || list.find((y) => y.is_current) || list[0] || null;
          if (current) {
            localStorage.setItem('active_academic_year_id', current.id);
          }
        }
        setActiveYear(current);
      }
    } catch {
      // Quiet fail if not yet authenticated
    }
  };

  const handleSelectYear = async (yr) => {
    if (!yr || yr.id === activeYear?.id) {
      setIsOpen(false);
      return;
    }

    try {
      localStorage.setItem('active_academic_year_id', yr.id);
      setActiveYear(yr);
      setIsOpen(false);
      await api.post('/academic-years/switch', { academic_year_id: yr.id });
      // Reload or trigger refresh to update academic context across active views
      window.dispatchEvent(new CustomEvent('app:academic-year-switched', { detail: yr }));
      window.location.reload();
    } catch (err) {
      console.error('Failed to switch academic session:', err);
    }
  };

  if (!activeYear && years.length === 0) {
    return null;
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors text-xs font-semibold cursor-pointer"
        title="Active Academic Session"
      >
        <LuCalendarDays className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
        <span className="hidden sm:inline font-mono">{activeYear?.name || '2026-2027'}</span>
        <span className="sm:hidden font-mono text-[11px]">{activeYear?.code || 'AY 26-27'}</span>
        <LuChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl border border-slate-200 shadow-xl p-1 z-50 animate-fade-in text-xs">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
            Select Academic Session
          </div>

          <div className="max-h-56 overflow-y-auto py-1 space-y-0.5">
            {years.map((yr) => {
              const isSelected = (yr.id === activeYear?.id);
              return (
                <button
                  key={yr.id}
                  onClick={() => handleSelectYear(yr)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    isSelected ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <span className="font-mono">{yr.name}</span>
                    <span className="block text-[10px] text-slate-400">{yr.code}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {yr.is_current && (
                      <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                        Current
                      </span>
                    )}
                    {isSelected && <LuCheck className="w-3.5 h-3.5 text-indigo-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

