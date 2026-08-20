import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentParentService } from '../../services/studentParentService';
import {
  LuBookOpen,
  LuCircleCheck,
  LuClock,
  LuDownload,
  LuArrowLeft,
  LuFileText,
  LuCheck,
  LuPlus,
  LuX,
  LuCalendar,
  LuGraduationCap,
  LuSparkles,
  LuCheckCheck,
  LuMessageSquare,
  LuSend,
  LuLoader,
} from 'react-icons/lu';

const initialSyllabusData = {
  math: {
    name: 'Mathematics (Standard)',
    code: 'MATH-041',
    teacher: 'Dr. Ananya Sen (PGT)',
    completion: 78,
    units: [
      { id: 1, title: 'Unit 1: Number Systems — Real Numbers', status: 'Completed', progress: 100, lectures: '12 Lectures', topics: ['Fundamental Theorem of Arithmetic', 'Revisiting Irrational Numbers', 'Decimal Expansions'] },
      { id: 2, title: 'Unit 2: Algebra — Polynomials & Quadratic Equations', status: 'Completed', progress: 100, lectures: '18 Lectures', topics: ['Zeroes of a Polynomial', 'Quadratic Formula & Factorization', 'Nature of Roots'] },
      { id: 3, title: 'Unit 3: Algebra — Arithmetic Progressions', status: 'In Progress', progress: 80, lectures: '8/10 Lectures', topics: ['nth Term of an AP', 'Sum of First n Terms', 'Application Word Problems'] },
      { id: 4, title: 'Unit 4: Geometry — Triangles & Coordinate Geometry', status: 'In Progress', progress: 55, lectures: '6/11 Lectures', topics: ['Similarity Criteria (AAA, SAS, SSS)', 'Areas of Similar Triangles', 'Distance & Section Formula'] },
      { id: 5, title: 'Unit 5: Trigonometry & Its Applications', status: 'Scheduled', progress: 0, lectures: 'Starts Sep 01', topics: ['Trigonometric Ratios & Identities', 'Heights and Distances', 'Angle of Elevation & Depression'] },
      { id: 6, title: 'Unit 6: Statistics & Probability', status: 'Scheduled', progress: 0, lectures: 'Starts Oct 15', topics: ['Mean, Median, Mode of Grouped Data', 'Classical Definition of Probability'] },
    ],
  },
  science: {
    name: 'Science (Physics, Chemistry & Biology)',
    code: 'SCI-086',
    teacher: 'Mr. Vikram Rathore (PGT)',
    completion: 72,
    units: [
      { id: 1, title: 'Unit 1: Chemical Reactions and Equations', status: 'Completed', progress: 100, lectures: '10 Lectures', topics: ['Balancing Chemical Equations', 'Types of Reactions', 'Oxidation & Reduction'] },
      { id: 2, title: 'Unit 2: Acids, Bases and Salts', status: 'Completed', progress: 100, lectures: '12 Lectures', topics: ['pH Scale & Importance', 'Preparation of Bleaching Powder, Baking Soda, Plaster of Paris'] },
      { id: 3, title: 'Unit 3: Light — Reflection and Refraction', status: 'In Progress', progress: 70, lectures: '9/14 Lectures', topics: ['Mirror & Lens Formulas', 'Refraction through Glass Slab', 'Power of a Lens'] },
      { id: 4, title: 'Unit 4: Human Eye and Colourful World', status: 'Scheduled', progress: 0, lectures: 'Starts Sep 05', topics: ['Defects of Vision & Correction', 'Dispersion & Atmospheric Refraction'] },
      { id: 5, title: 'Unit 5: Life Processes — Nutrition & Respiration', status: 'Completed', progress: 100, lectures: '14 Lectures', topics: ['Autotrophic & Heterotrophic Nutrition', 'Human Circulatory & Excretory System'] },
    ],
  },
  english: {
    name: 'English Language & Literature',
    code: 'ENG-184',
    teacher: 'Ms. Sunita Rao (TGT)',
    completion: 85,
    units: [
      { id: 1, title: 'First Flight — Prose & Poetry', status: 'Completed', progress: 100, lectures: '16 Lectures', topics: ['A Letter to God', 'Nelson Mandela: Long Walk to Freedom', 'Dust of Snow & Fire and Ice'] },
      { id: 2, title: 'Footprints without Feet — Supplementary Reader', status: 'In Progress', progress: 85, lectures: '8/10 Lectures', topics: ['A Triumph of Surgery', 'The Thief’s Story', 'The Midnight Visitor'] },
      { id: 3, title: 'Grammar & Formal Letter Writing', status: 'In Progress', progress: 80, lectures: '6/8 Lectures', topics: ['Subject-Verb Concord', 'Tenses & Modals', 'Formal Letters to Editor & Complaint'] },
      { id: 4, title: 'Analytical Paragraph & Reading Comprehension', status: 'Scheduled', progress: 0, lectures: 'Starts Sep 10', topics: ['Data & Chart-based Analytical Paragraphs', 'Discursive Unseen Passages'] },
    ],
  },
  social: {
    name: 'Social Science (History, Civics, Geography, Economics)',
    code: 'SST-087',
    teacher: 'Mr. Manoj Joshi (TGT)',
    completion: 70,
    units: [
      { id: 1, title: 'History: The Rise of Nationalism in Europe', status: 'Completed', progress: 100, lectures: '12 Lectures', topics: ['The French Revolution & Idea of Nation', 'The Age of Revolutions: 1830-1848', 'Making of Germany and Italy'] },
      { id: 2, title: 'History: Nationalism in India', status: 'In Progress', progress: 75, lectures: '6/8 Lectures', topics: ['Non-Cooperation Movement', 'Salt March & Civil Disobedience', 'Sense of Collective Belonging'] },
      { id: 3, title: 'Geography: Resources and Development', status: 'Completed', progress: 100, lectures: '8 Lectures', topics: ['Resource Planning in India', 'Land Use Pattern', 'Soil Classification'] },
      { id: 4, title: 'Civics: Power Sharing and Federalism', status: 'In Progress', progress: 60, lectures: '5/8 Lectures', topics: ['Case Studies of Belgium & Sri Lanka', 'Features of Federalism in India'] },
    ],
  },
  cs: {
    name: 'Computer Applications & AI',
    code: 'CA-165',
    teacher: 'Mrs. Deepa Krishnan (PGT)',
    completion: 90,
    units: [
      { id: 1, title: 'Unit 1: Networking Basics & Internet Protocols', status: 'Completed', progress: 100, lectures: '8 Lectures', topics: ['TCP/IP, HTTP, FTP', 'Cloud Computing & Cyber Safety'] },
      { id: 2, title: 'Unit 2: HTML5, CSS & Web Page Design', status: 'Completed', progress: 100, lectures: '14 Lectures', topics: ['Tables, Forms, Embedded Media', 'Responsive CSS Layouts'] },
      { id: 3, title: 'Unit 3: Python Programming & Logic', status: 'In Progress', progress: 85, lectures: '12/14 Lectures', topics: ['Conditionals & Loops', 'Lists, Dictionaries & Functions'] },
      { id: 4, title: 'Unit 4: Database Management & SQL', status: 'Scheduled', progress: 0, lectures: 'Starts Sep 01', topics: ['CREATE, SELECT, INSERT, UPDATE Queries', 'Table Constraints'] },
    ],
  },
};

const initialProgressLogs = [
  {
    id: 1,
    subjectKey: 'math',
    subjectName: 'Mathematics',
    className: 'Grade 10-A',
    unitTitle: 'Unit 3: Arithmetic Progressions',
    date: '17 Aug 2026',
    progress: 80,
    message: 'Completed derivation of Sum of first n terms formula. Solved 6 word problems in class. All students submitted notebook exercises.',
    teacherName: 'Dr. Ananya Sen',
  },
  {
    id: 2,
    subjectKey: 'science',
    subjectName: 'Science',
    className: 'Grade 10-A',
    unitTitle: 'Unit 3: Light — Reflection and Refraction',
    date: '16 Aug 2026',
    progress: 70,
    message: 'Demonstrated refraction through glass prism in lab. Explained Snell’s law with ray diagrams.',
    teacherName: 'Mr. Vikram Rathore',
  },
];

export default function SyllabusPage() {
  const navigate = useNavigate();
  const { currentRole } = useAuth();
  const [syllabusData, setSyllabusData] = useState(initialSyllabusData);
  const [progressLogs, setProgressLogs] = useState(initialProgressLogs);
  const [activeSubject, setActiveSubject] = useState('math');
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State for updating progress
  const [formSubject, setFormSubject] = useState('math');
  const [formClass, setFormClass] = useState('10-A');
  const [formUnitId, setFormUnitId] = useState(3);
  const [formProgress, setFormProgress] = useState(85);
  const [formMessage, setFormMessage] = useState('');
  const [formHomework, setFormHomework] = useState('');

  const fetchSyllabus = () => {
    setLoading(true);
    studentParentService.getSyllabus()
      .then((res) => {
        if (res?.data) {
          if (res.data.syllabus && Object.keys(res.data.syllabus).length > 0) {
            setSyllabusData(res.data.syllabus);
          }
          if (res.data.progressLogs && res.data.progressLogs.length > 0) {
            setProgressLogs(res.data.progressLogs);
          }
        }
      })
      .catch((err) => console.log('Loaded fallback syllabus data:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSyllabus();
  }, []);

  const subject = syllabusData[activeSubject] || initialSyllabusData.math;

  const handleUpdateProgressSubmit = async (e) => {
    e.preventDefault();
    if (!formMessage.trim()) return;

    const selectedSubjectData = syllabusData[formSubject] || initialSyllabusData[formSubject];
    const unitObj = selectedSubjectData.units.find((u) => u.id === Number(formUnitId)) || selectedSubjectData.units[0];

    try {
      await studentParentService.updateSyllabusProgress({
        syllabus_id: selectedSubjectData.id,
        subject_name: selectedSubjectData.name,
        unit_title: unitObj.title,
        progress_percentage: Number(formProgress),
        message: formMessage,
      });
      fetchSyllabus();
    } catch (err) {
      console.error(err);
    }

    setShowProgressModal(false);
    setFormMessage('');
    setFormHomework('');
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3500);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 flex items-center gap-3 px-5 py-3.5 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-600/20 animate-fade-in-up">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <LuCheckCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold">Syllabus Progress Updated</p>
            <p className="text-xs text-emerald-100">Live progress synced for students and parents</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <LuArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">Curriculum & Syllabus Progress</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">
                Academic Year 2026-27
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Class X-A • CBSE Board Curriculum Tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Add / Update Progress Button (For Teachers) */}
          <button
            onClick={() => setShowProgressModal(true)}
            className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold inline-flex items-center gap-2 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <LuPlus className="w-4 h-4" /> Update Teaching Progress
          </button>

          <button className="px-3.5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold inline-flex items-center gap-2 transition-colors">
            <LuDownload className="w-3.5 h-3.5 text-gray-500" /> Syllabus PDF
          </button>
        </div>
      </div>

      {/* Subject Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {Object.entries(syllabusData).map(([key, data]) => (
          <button
            key={key}
            onClick={() => setActiveSubject(key)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeSubject === key
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <LuBookOpen className="w-3.5 h-3.5" />
            <span>{data.name.split(' ')[0]}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeSubject === key ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {data.completion}%
            </span>
          </button>
        ))}
      </div>

      {/* Subject Overview Card */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-gray-900">{subject.name}</h2>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60">
                {subject.code}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Instructor: <strong className="text-gray-800">{subject.teacher}</strong>
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-primary-600 font-mono">{subject.completion}%</span>
            <p className="text-xs font-semibold text-gray-400">Total Course Completed</p>
          </div>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2.5 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary-600 transition-all duration-500"
            style={{ width: `${subject.completion}%` }}
          />
        </div>
        <p className="text-[11px] text-gray-500 font-medium">
          Target Date for 100% Completion: <strong className="text-gray-800">November 30, 2026</strong> (Pre-Boards commence Dec 10)
        </p>
      </div>

      {/* Grid: Breakdown on left, Daily Teaching Progress Feed on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Detailed Chapter-wise Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <LuBookOpen className="w-4 h-4 text-primary-600" />
              Chapter-wise Breakdown
            </h3>
            <span className="text-xs text-gray-400 font-medium">
              {subject.units.length} Chapters Total
            </span>
          </div>

          {subject.units.map((unit) => (
            <div
              key={unit.id}
              className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs hover:border-gray-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{unit.title}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{unit.lectures}</p>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg self-start sm:self-auto ${
                    unit.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : unit.status === 'In Progress'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {unit.status} ({unit.progress}%)
                </span>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    unit.progress === 100 ? 'bg-emerald-500' : 'bg-primary-600'
                  }`}
                  style={{ width: `${unit.progress}%` }}
                />
              </div>

              <div>
                <p className="text-xs font-bold text-gray-600 mb-2">Key Topics Covered:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {unit.topics.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs flex items-center gap-2"
                    >
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-[10px]">
                        <LuCheck className="w-3 h-3" />
                      </span>
                      <span className="text-gray-700 truncate">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column (1/3): Daily Lesson & Progress Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <LuMessageSquare className="w-4 h-4 text-primary-600" />
              Recent Lesson Updates
            </h3>
            <span className="text-[11px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
              Live Log
            </span>
          </div>

          <div className="space-y-3.5">
            {progressLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-primary-50 text-primary-700 text-[11px] font-bold">
                    {log.subjectName} • {log.className}
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold">{log.date}</span>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-gray-900">{log.unitTitle}</h5>
                  <p className="text-xs text-gray-600 mt-1.5 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                    "{log.message}"
                  </p>
                </div>

                {log.homework && (
                  <div className="text-[11px] text-amber-800 bg-amber-50/70 p-2 rounded-lg border border-amber-100 font-medium">
                    📌 <strong>Homework:</strong> {log.homework}
                  </div>
                )}

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">By {log.teacherName}</span>
                  <span className="font-bold text-primary-700">Progress: {log.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Update Teaching Progress */}
      {showProgressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs"
            onClick={() => setShowProgressModal(false)}
          />

          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden animate-fade-in-up">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <LuSparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Update Syllabus Progress</h2>
                  <p className="text-xs text-gray-500">Log today's taught lesson and chapter status</p>
                </div>
              </div>
              <button
                onClick={() => setShowProgressModal(false)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdateProgressSubmit} className="p-6 space-y-4">
              {/* Select Subject & Class */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Subject</label>
                  <select
                    value={formSubject}
                    onChange={(e) => {
                      setFormSubject(e.target.value);
                      const sub = syllabusData[e.target.value];
                      if (sub?.units?.[0]) setFormUnitId(sub.units[0].id);
                    }}
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer"
                  >
                    {Object.entries(syllabusData).map(([key, item]) => (
                      <option key={key} value={key}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Class & Section</label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer"
                  >
                    <option value="10-A">Grade 10 - Section A</option>
                    <option value="10-B">Grade 10 - Section B</option>
                    <option value="9-A">Grade 9 - Section A</option>
                    <option value="9-B">Grade 9 - Section B</option>
                  </select>
                </div>
              </div>

              {/* Select Chapter / Unit */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Chapter / Unit</label>
                <select
                  value={formUnitId}
                  onChange={(e) => setFormUnitId(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer"
                >
                  {syllabusData[formSubject]?.units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.title} (Current: {u.progress}%)
                    </option>
                  ))}
                </select>
              </div>

              {/* Progress Slider / Number */}
              <div className="space-y-1.5 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700">Updated Chapter Progress</label>
                  <span className="text-sm font-black text-primary-600 font-mono">{formProgress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={formProgress}
                  onChange={(e) => setFormProgress(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                  <span>0% (Not Started)</span>
                  <span>50%</span>
                  <span>100% (Completed)</span>
                </div>
              </div>

              {/* Message of what was taught */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">
                  Topics Taught & Teaching Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="E.g., Covered quadratic formula derivation and solved practice problems from textbook pg 45-48..."
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl text-xs text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none"
                />
              </div>

              {/* Homework Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Homework / Assignment (Optional)</label>
                <input
                  type="text"
                  placeholder="E.g., Complete Exercise 3.2 Q1 to Q8 in classwork notebook"
                  value={formHomework}
                  onChange={(e) => setFormHomework(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-xl text-xs text-gray-800 bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowProgressModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-md flex items-center gap-1.5"
                >
                  <LuSend className="w-3.5 h-3.5" />
                  Save & Publish Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
