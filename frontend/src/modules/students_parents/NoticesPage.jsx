import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentParentService } from '../../services/studentParentService';
import {
  LuBell,
  LuArrowLeft,
  LuSearch,
  LuDownload,
  LuFileText,
  LuCalendar,
  LuUser,
  LuLoader,
} from 'react-icons/lu';

const categoryBadgeStyles = {
  Academic: 'bg-blue-50 text-blue-700 border-blue-200',
  Examination: 'bg-rose-50 text-rose-700 border-rose-200',
  'Health & Wellness': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Administrative: 'bg-purple-50 text-purple-700 border-purple-200',
};

export default function NoticesPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    studentParentService.getNotices({
      category: selectedCategory === 'All' ? '' : selectedCategory,
      search: searchQuery,
    })
      .then((res) => {
        const noticesData = res?.data?.notices || res?.data || res?.notices;
        if (Array.isArray(noticesData)) {
          setNotices(noticesData);
        } else {
          setNotices([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching notices from database:', err);
        setNotices([]);
      })
      .finally(() => setLoading(false));
  }, [selectedCategory, searchQuery]);

  const filteredNotices = notices.filter((n) => {
    const matchesCategory = selectedCategory === 'All' || n.category === selectedCategory;
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (n.desc && n.desc.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (n.sender && n.sender.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

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
            <h1 className="text-xl font-bold text-gray-800">School Notices & Official Circulars</h1>
            <p className="text-xs text-gray-400">Institutional Announcements, Circulars & Parent Advisories</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700">
          {filteredNotices.length} Active Circulars
        </span>
      </div>

      {/* Category Tabs & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search circulars, board notices, health camp..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'Academic', 'Examination', 'Health & Wellness', 'Administrative'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {filteredNotices.map((n) => (
          <div
            key={n.id}
            className="bg-white p-3 sm:p-5 rounded-xl border border-gray-200 shadow-2xs hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border ${categoryBadgeStyles[n.category] || 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                    {n.category}
                  </span>
                  {n.priority === 'Urgent' && (
                    <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                      ⚡ Urgent
                    </span>
                  )}
                </div>
                <h3 className="text-xs sm:text-base font-bold text-gray-800 leading-snug">{n.title}</h3>
              </div>
              <span className="text-[10px] sm:text-xs text-gray-400 font-medium whitespace-nowrap shrink-0">
                {n.date}
              </span>
            </div>

            <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed my-2 sm:my-3 bg-gray-50 p-2.5 sm:p-3.5 rounded-lg border border-gray-100 line-clamp-2 sm:line-clamp-none">
              {n.desc}
            </p>

            <div className="pt-2 sm:pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 text-xs">
              <span className="text-gray-500 text-[10px] sm:text-[11px] truncate">
                From: <strong className="text-gray-700">{n.sender}</strong>
              </span>

              {n.attachment && (
                <button
                  onClick={() => alert(`Downloading circular ${n.attachment}...`)}
                  className="text-primary-600 hover:text-primary-800 font-semibold inline-flex items-center gap-1 text-[11px] sm:text-xs cursor-pointer self-start sm:self-auto"
                >
                  <LuDownload className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Download Circular</span>
                  <span className="hidden sm:inline">({n.attachment})</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
