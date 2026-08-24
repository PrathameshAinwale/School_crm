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

const fallbackStudyMaterialData = [
  { id: 'SM-01', title: 'Class X Mathematics: All Board Formulas & Solved Exemplar Problems 2026', subject: 'Mathematics', type: 'PDF', size: '4.2 MB', uploader: 'Dr. Ananya Sen (PGT)', date: 'Aug 12, 2026', downloads: 142, desc: 'Complete formula sheet covering Quadratic Equations, AP, Triangles, and Coordinate Geometry with 50+ solved CBSE previous year questions.' },
  { id: 'SM-02', title: 'Science NCERT Exemplar Solutions & Comprehensive Physics Lab Manual', subject: 'Science', type: 'PDF', size: '6.8 MB', uploader: 'Mr. Vikram Rathore (PGT)', date: 'Aug 10, 2026', downloads: 188, desc: 'Step-by-step practical record write-ups for Ray Optics and Chemical Reactions with ray diagrams and expected viva questions.' },
  { id: 'SM-03', title: 'English Literature Question Bank & Reference Guide (First Flight)', subject: 'English', type: 'PDF', size: '3.1 MB', uploader: 'Ms. Sunita Rao (TGT)', date: 'Aug 08, 2026', downloads: 95, desc: 'Character sketches, theme summaries, extract-based multiple choice questions, and standard letter formats.' },
  { id: 'SM-04', title: 'Social Science: Nationalism in India Complete Mindmaps & Map Practice', subject: 'Social Science', type: 'PDF', size: '5.5 MB', uploader: 'Mr. Manoj Joshi (TGT)', date: 'Aug 05, 2026', downloads: 110, desc: 'Visual flowcharts of the Freedom Movement, historical dates timeline, and high-resolution state maps for board practice.' },
  { id: 'SM-05', title: 'Computer Science: Python 3 Cheatsheet & SQL Database Practice Queries', subject: 'Computer Science', type: 'ZIP', size: '8.4 MB', uploader: 'Mrs. Deepa K. (PGT)', date: 'Aug 02, 2026', downloads: 160, desc: 'Code examples for Python functions, list comprehensions, and ready-to-run SQL schema creation scripts for board project.' },
  { id: 'SM-06', title: 'Mathematics: Chapterwise Mock Test Papers with Marking Scheme', subject: 'Mathematics', type: 'PDF', size: '3.8 MB', uploader: 'Dr. Ananya Sen (PGT)', date: 'Jul 28, 2026', downloads: 204, desc: 'Five 80-mark sample papers following the latest 2026-27 CBSE pattern with detailed solution keys and marking distribution.' },
];

export default function StudyMaterialPage() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState(fallbackStudyMaterialData);
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
        if (res?.data && res.data.length > 0) {
          setMaterials(res.data);
        }
      })
      .catch((err) => console.log('Loaded mock study materials:', err))
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
