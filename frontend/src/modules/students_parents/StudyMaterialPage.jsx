import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentParentService } from '../../services/studentParentService';
import {
  LuFolderDown,
  LuArrowLeft,
  LuSearch,
  LuDownload,
  LuFileText,
  LuEye,
  LuFilter,
  LuBookOpen,
  LuLoader,
} from 'react-icons/lu';

export default function StudyMaterialPage() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMaterials = () => {
    setLoading(true);
    studentParentService.getStudyMaterials({
      subject: selectedSubject === 'All' ? '' : selectedSubject,
      search: searchQuery,
    })
      .then((res) => {
        const matList = res?.data?.materials || res?.data || res?.materials;
        if (Array.isArray(matList)) {
          setMaterials(matList);
        } else {
          setMaterials([]);
        }
      })
      .catch((err) => {
        console.log('Error fetching study materials:', err);
        setMaterials([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMaterials();
  }, [selectedSubject, searchQuery]);

  const handleDownload = (mat) => {
    studentParentService.downloadStudyMaterial(mat.id || mat.dbId).catch(console.error);
    alert(`Downloading ${mat.title} (${mat.size || 'PDF'})...`);
  };

  const filteredMaterials = materials.filter((item) => {
    const matchesSubject = selectedSubject === 'All' || item.subject === selectedSubject;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.desc && item.desc.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (item.uploader && item.uploader.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSubject && matchesSearch;
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
            <h1 className="text-xl font-bold text-gray-800">Study Material & Digital Library</h1>
            <p className="text-xs text-gray-400">Class notes, formula sheets, sample question banks & video resources</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 font-mono">
          {filteredMaterials.length} Files Available
        </span>
      </div>

      {/* Search & Subject Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search study notes, formula sheets, NCERT solutions..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'Mathematics', 'Science', 'English', 'Social Science', 'Computer Science'].map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedSubject === sub
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Materials List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
        {filteredMaterials.map((mat) => (
          <div
            key={mat.id}
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200">
                    {mat.type}
                  </span>
                  <span className="text-xs font-bold text-primary-600">{mat.subject}</span>
                </div>
                <span className="text-xs text-gray-400 font-mono">{mat.size}</span>
              </div>

              <h3 className="text-sm font-bold text-gray-800 leading-snug mb-1.5">{mat.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-3">{mat.desc}</p>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <div className="text-[11px] text-gray-400">
                <p>Uploaded by <strong>{mat.uploader}</strong></p>
                <p>{mat.date} • {mat.downloads} downloads</p>
              </div>

              <button
                onClick={() => handleDownload(mat)}
                className="px-3.5 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium inline-flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <LuDownload className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
