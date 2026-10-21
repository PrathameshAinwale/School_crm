import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { LuBuilding2, LuChevronDown, LuCheck } from 'react-icons/lu';

export default function BranchSwitcher() {
  const { t } = useTranslation();
  const { user, currentRole } = useAuth();
  const [branches, setBranches] = useState([]);
  const [activeBranch, setActiveBranch] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const dropdownRef = useRef(null);

  const canSwitchBranches = currentRole === 'super_admin' || currentRole === 'admin';

  useEffect(() => {
    let isMounted = true;
    const fetchBranches = async () => {
      try {
        const res = await adminService.getBranches();
        if (isMounted && res && res.success && Array.isArray(res.data)) {
          setBranches(res.data);
          const savedActiveId = localStorage.getItem('active_school_id');
          const found = res.data.find(
            (b) => String(b.id) === String(savedActiveId) || b.is_active_branch
          );
          setActiveBranch(found || res.data[0] || null);
        }
      } catch (err) {
        // quiet fallback
      }
    };

    fetchBranches();
    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectBranch = async (branch) => {
    if (!branch || branch.id === activeBranch?.id) {
      setIsOpen(false);
      return;
    }
    try {
      setIsSwitching(true);
      await adminService.switchBranch(branch.id);
      localStorage.setItem('active_school_id', branch.id);
      localStorage.setItem('active_school_name', branch.name);
      setActiveBranch(branch);
      setIsOpen(false);
      // Reload page to refresh all active queries and tenant-scoped contexts
      window.location.reload();
    } catch (err) {
      setIsSwitching(false);
    }
  };

  // If user only has access to their single branch or is not allowed to switch branches
  if (!canSwitchBranches || branches.length <= 1) {
    if (!activeBranch && !user?.school_name) return null;
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700">
        <LuBuilding2 className="w-3.5 h-3.5 text-primary-600 shrink-0" />
        <span className="truncate max-w-[140px] font-semibold">
          {activeBranch?.name || user?.school_name || 'Arch Campus'}
        </span>
        {activeBranch?.code && (
          <span className="text-[10px] text-gray-400 bg-gray-100 px-1 rounded">
            {activeBranch.code}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={isSwitching}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
        title={t('branches.select_branch', 'Select School Branch')}
      >
        <LuBuilding2 className="w-3.5 h-3.5 text-primary-600 shrink-0" />
        <span className="truncate max-w-[120px] sm:max-w-[180px]">
          {isSwitching
            ? t('branches.switching', 'Switching...')
            : activeBranch?.name || t('branches.select_branch', 'Select Branch')}
        </span>
        <LuChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl border border-gray-200 shadow-xl py-1 z-50 animate-fade-in">
          <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {t('branches.branch_overview', 'Campus Branches')}
            </span>
            <span className="text-[10px] bg-primary-50 text-primary-700 font-bold px-1.5 py-0.5 rounded">
              {branches.length}
            </span>
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {branches.map((b) => {
              const isSelected = b.id === activeBranch?.id;
              return (
                <button
                  key={b.id}
                  onClick={() => handleSelectBranch(b)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors text-left cursor-pointer ${
                    isSelected
                      ? 'bg-primary-50/80 text-primary-800 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate font-medium">{b.name}</p>
                      {b.is_home_branch && (
                        <span className="text-[9px] bg-gray-100 text-gray-500 font-semibold px-1 py-0.2 rounded shrink-0">
                          Home
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 truncate">
                      {b.code} {b.city ? `• ${b.city}` : ''}
                    </p>
                  </div>
                  {isSelected && (
                    <LuCheck className="w-4 h-4 text-primary-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
