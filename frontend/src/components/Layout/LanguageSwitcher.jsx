import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LuGlobe, LuCheck, LuChevronDown } from 'react-icons/lu';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = LANGUAGES.find((l) => l.code === (i18n.language || 'en').substring(0, 2)) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('app_language', langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors"
        title="Change Language"
        aria-label="Change Language"
      >
        <LuGlobe className="w-3.5 h-3.5 text-primary-600" />
        <span className="hidden sm:inline">{currentLang.native}</span>
        <span className="sm:hidden uppercase">{currentLang.code}</span>
        <LuChevronDown className="w-3 h-3 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-xl border border-gray-200 shadow-xl py-1 z-50 animate-fade-in">
          <div className="px-3 py-1.5 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Language / भाषा
          </div>
          {LANGUAGES.map((lang) => {
            const isSelected = currentLang.code === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelectLanguage(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{lang.native}</span>
                  <span className="text-[10px] text-gray-400">({lang.label})</span>
                </div>
                {isSelected && <LuCheck className="w-3.5 h-3.5 text-primary-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
