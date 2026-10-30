import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import AddSchoolModal from './AddSchoolModal';
import {
  LuBuilding2,
  LuChevronDown,
  LuCheck,
  LuPlus,
  LuTrash2,
  LuSparkles,
  LuLayers,
} from 'react-icons/lu';

export default function BranchSwitcher() {
  const { t } = useTranslation();
  const {
    user,
    currentRole,
    currentSchool,
    linkedSchoolAccounts,
    switchSchoolAccount,
    removeSchoolAccount,
  } = useAuth();

  const [branches, setBranches] = useState([]);
  const [activeBranch, setActiveBranch] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const dropdownRef = useRef(null);

  const canSwitchSchools = currentRole === 'super_admin' || currentRole === 'admin';

  // Fetch branches from backend for multi-campus support and suggestions
  useEffect(() => {
    let isMounted = true;
    const fetchBranches = async () => {
      try {
        const res = await adminService.getBranches();
        if (isMounted && res && res.success) {
          const list = Array.isArray(res.branches)
            ? res.branches
            : Array.isArray(res.data)
            ? res.data
            : [];
          setBranches(list);

          const savedActiveId = localStorage.getItem('active_school_id') || user?.school_id;
          const found = list.find(
            (b) => String(b.id) === String(savedActiveId) || b.id === currentSchool?.id
          );
          setActiveBranch(found || currentSchool || list[0] || null);
        }
      } catch (err) {
        // quiet fallback
      }
    };

    fetchBranches();
    return () => {
      isMounted = false;
    };
  }, [user, currentSchool]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeSchoolId = user?.school_id || currentSchool?.id || activeBranch?.id;
  const activeSchoolName =
    currentSchool?.name || activeBranch?.name || user?.school?.name || 'School Campus';
  const activeSchoolCode =
    currentSchool?.code || activeBranch?.code || user?.school?.code;

  // Handle switching to a linked account
  const handleSelectLinkedAccount = (account) => {
    if (!account || (account.id === user?.id && account.school_id === activeSchoolId)) {
      setIsOpen(false);
      return;
    }
    setIsSwitching(true);
    switchSchoolAccount(account);
  };

  // Handle direct branch switch (Super Admin or same user)
  const handleSelectBranch = async (branch) => {
    if (!branch || branch.id === activeSchoolId) {
      setIsOpen(false);
      return;
    }

    // Check if we have a linked account for this specific branch
    const matchedAccount = linkedSchoolAccounts.find(
      (acc) => acc.school_id === branch.id || acc.school?.id === branch.id
    );

    if (matchedAccount) {
      handleSelectLinkedAccount(matchedAccount);
      return;
    }

    // Otherwise if super_admin, switch directly via API
    if (currentRole === 'super_admin') {
      try {
        setIsSwitching(true);
        await adminService.switchBranch(branch.id);
        localStorage.setItem('active_school_id', branch.id);
        localStorage.setItem('active_school_name', branch.name);
        window.location.reload();
      } catch (err) {
        setIsSwitching(false);
      }
    } else {
      // Prompt admin to connect credentials for this new school
      setIsOpen(false);
      setShowAddModal(true);
    }
  };

  // If user is not authorized to switch schools (teachers, students, etc.)
  if (!canSwitchSchools) {
    if (!activeSchoolName) return null;
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700">
        <LuBuilding2 className="w-3.5 h-3.5 text-primary-600 shrink-0" />
        <span className="truncate max-w-[140px] font-semibold">{activeSchoolName}</span>
        {activeSchoolCode && (
          <span className="text-[10px] text-gray-400 bg-gray-100 px-1 rounded">
            {activeSchoolCode}
          </span>
        )}
      </div>
    );
  }

  // Count total distinct schools accessible
  const totalConnected = Math.max(1, linkedSchoolAccounts.length);

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Switcher Trigger Button */}
        <button
          type="button"
          disabled={isSwitching}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50/40 text-xs font-semibold text-gray-700 transition-all cursor-pointer shadow-2xs"
          title={t('branches.switch_school', 'Switch School Campus')}
        >
          <div className="w-5 h-5 rounded-md bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
            <LuBuilding2 className="w-3 h-3" />
          </div>
          <div className="flex items-center gap-1.5 max-w-[110px] sm:max-w-[170px] text-left">
            <span className="truncate text-xs font-bold text-gray-800">
              {isSwitching ? t('branches.switching', 'Switching...') : activeSchoolName}
            </span>
            {activeSchoolCode && (
              <span className="hidden sm:inline-block text-[9px] font-bold text-primary-700 bg-primary-50 px-1 py-0.2 rounded border border-primary-200/60 shrink-0">
                {activeSchoolCode}
              </span>
            )}
          </div>
          <LuChevronDown
            className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${
              isOpen ? 'rotate-180 text-primary-600' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-1.5 sm:w-80 bg-white rounded-2xl border border-gray-200 shadow-2xl p-1.5 z-50 animate-fade-in">
            {/* Header */}
            <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <LuLayers className="w-3.5 h-3.5 text-primary-600" />
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  {t('branches.switch_school', 'Switch School')}
                </span>
              </div>
              <span className="text-[10px] bg-primary-50 text-primary-700 font-bold px-2 py-0.5 rounded-full border border-primary-200">
                {totalConnected} {totalConnected === 1 ? 'School' : 'Schools'}
              </span>
            </div>

            {/* List of Connected Schools */}
            <div className="max-h-72 overflow-y-auto py-1 space-y-1">
              {linkedSchoolAccounts.map((account) => {
                const isSelected =
                  account.school_id === activeSchoolId ||
                  (account.email === user?.email && account.id === user?.id);

                return (
                  <div
                    key={`${account.id}-${account.school_id || account.email}`}
                    className={`group relative flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-primary-50/80 border-primary-200 text-primary-900 shadow-xs'
                        : 'border-transparent hover:bg-gray-50 text-gray-700'
                    }`}
                    onClick={() => handleSelectLinkedAccount(account)}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-xs font-bold text-gray-800">
                          {account.school?.name || 'School Campus'}
                        </p>
                        {isSelected && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5 shrink-0">
                            <LuCheck className="w-2.5 h-2.5" />
                            Active
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5 truncate">
                        {account.school?.code && (
                          <span className="font-semibold text-gray-500">
                            {account.school.code}
                          </span>
                        )}
                        {account.school?.city && <span>• {account.school.city}</span>}
                        {account.email && (
                          <span className="truncate max-w-[120px]">
                            • {account.email}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-lg bg-primary-600 text-white flex items-center justify-center">
                          <LuCheck className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectLinkedAccount(account);
                          }}
                          className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-primary-600 hover:text-white text-[10px] font-bold text-gray-600 transition-colors cursor-pointer"
                        >
                          Switch
                        </button>
                      )}

                      {/* Remove / Unlink option for secondary accounts */}
                      {!isSelected && linkedSchoolAccounts.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSchoolAccount(account.id || account.email);
                          }}
                          title={t('branches.unlink_school', 'Disconnect School')}
                          className="p-1 rounded-lg text-gray-300 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          <LuTrash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Add School Button */}
            <div className="pt-2 mt-1 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowAddModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gray-50 hover:bg-primary-50 hover:text-primary-700 text-xs font-bold text-gray-700 border border-gray-200 hover:border-primary-200 transition-all cursor-pointer"
              >
                <LuPlus className="w-4 h-4 text-primary-600" />
                <span>{t('branches.add_another_school', '+ Connect Another School')}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add School Modal */}
      <AddSchoolModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
        }}
      />
    </>
  );
}
