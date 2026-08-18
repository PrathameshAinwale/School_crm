import React, { useState } from 'react';
import {
  LuBoxes,
  LuSearch,
  LuEye,
  LuX,
  LuCircleCheck,
  LuMapPin,
} from 'react-icons/lu';

const SCHOOL_RESOURCES = [
  { id: 'RES-01', name: 'Smart Interactive Classrooms', category: 'Academic Infrastructure', totalUnits: 52, activeUnits: 48, inMaintenance: 4, utilization: 92.3, location: 'Academic Blocks A, B, C', incharge: 'Mrs. Deepa Krishnan (IT Head)', specs: '75-inch 4K Smart Interactive Touch Displays, Dual OS, Digital Whiteboard', status: 'Operational' },
  { id: 'RES-02', name: 'Science Labs (Physics, Chem, Bio)', category: 'Laboratory Facilities', totalUnits: 6, activeUnits: 6, inMaintenance: 0, utilization: 100.0, location: 'Science Block 2nd Floor', incharge: 'Dr. Ananya Sen / Mr. Rajesh Mehra', specs: 'Fully equipped practical apparatus, fume hoods, digital sensors, safety showers', status: 'Operational' },
  { id: 'RES-03', name: 'Robotics & STEM Tinkering Lab', category: 'Innovation & Tech', totalUnits: 2, activeUnits: 2, inMaintenance: 0, utilization: 95.0, location: 'Tech Hub Floor 3', incharge: 'Mr. Vikram Rathore (PGT Physics)', specs: '3D Printers, Arduino/Raspberry Pi Kits, LEGO Mindstorms, AI Vision Kits', status: 'Operational' },
  { id: 'RES-04', name: 'Computer Centers & IT Labs', category: 'Innovation & Tech', totalUnits: 4, activeUnits: 4, inMaintenance: 0, utilization: 98.0, location: 'IT Center Building D', incharge: 'Mrs. Deepa Krishnan', specs: '240 Intel Core i7 Workstations, Gigabit LAN, 1 Gbps Fiber Leased Line', status: 'Operational' },
  { id: 'RES-05', name: 'Central Library & Digital Repository', category: 'Library & Research', totalUnits: 1, activeUnits: 1, inMaintenance: 0, utilization: 96.0, location: 'Central Building 1st Floor', incharge: 'Mrs. Rekha Joshi (Chief Librarian)', specs: '18,400 Physical Books, 12,000+ E-Journals, RFID Kiosks, Kindle Stations', status: 'Operational' },
  { id: 'RES-06', name: 'Sports Complex & Athletic Grounds', category: 'Athletics & Physical Ed', totalUnits: 8, activeUnits: 7, inMaintenance: 1, utilization: 90.0, location: 'Campus South Grounds', incharge: 'Mr. Suresh Kumar (Sports Head)', specs: '400m Synthetic Track, FIFA Turf Football Ground, 2 Basketball Courts, Olympic Pool', status: 'Operational' },
  { id: 'RES-07', name: 'Main Institutional Auditorium', category: 'Auditorium & Events', totalUnits: 1, activeUnits: 1, inMaintenance: 0, utilization: 88.0, location: 'Main Block Ground Floor', incharge: 'Mr. Rajesh Sharma (CAO)', specs: '1,200 Seating Capacity, Dolby Digital Surround Sound, Stage Rigging, LED Backdrop', status: 'Operational' },
  { id: 'RES-08', name: 'Medical Infirmary & Emergency Clinic', category: 'Health & Medical', totalUnits: 1, activeUnits: 1, inMaintenance: 0, utilization: 95.0, location: 'Admin Block Ground Floor', incharge: 'Ms. Neha Kulkarni (Head Nurse)', specs: '6 Hospital Beds, Defibrillator, Oxygen Concentrators, Emergency SOS Link', status: 'Operational' },
  { id: 'RES-09', name: 'Performing Arts & Music Studio', category: 'Creative & Cultural', totalUnits: 3, activeUnits: 3, inMaintenance: 0, utilization: 89.0, location: 'Cultural Center Wing B', incharge: 'Ms. Sunita Rao', specs: 'Acoustic Soundproofing, Pianos, Classical & Western Instruments, Recording Suite', status: 'Operational' },
  { id: 'RES-10', name: 'Solar Energy Grid & Generator Backup', category: 'Campus Utility', totalUnits: 1, activeUnits: 1, inMaintenance: 0, utilization: 100.0, location: 'Rooftop Blocks A-D', incharge: 'Mr. Harish Chandra', specs: '150 kW Rooftop Solar Power Plant, 2x 250 kVA Silent Diesel Gensets', status: 'Operational' },
];

export default function AdminResourcesPage() {
  const [resources] = useState(SCHOOL_RESOURCES);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedResource, setSelectedResource] = useState(null);

  const filtered = resources.filter((res) => {
    const matchesSearch =
      res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.incharge.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || res.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const categories = ['ALL', ...Array.from(new Set(resources.map((r) => r.category)))];
  const totalUnitsCount = resources.reduce((acc, r) => acc + r.totalUnits, 0);
  const activeUnitsCount = resources.reduce((acc, r) => acc + r.activeUnits, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Clean Standard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <LuBoxes className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">School Resources & Facilities</h1>
            <p className="text-xs text-gray-400">Classrooms, scientific laboratories, sports grounds, and campus infrastructure</p>
          </div>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 self-start sm:self-auto">
          <LuCircleCheck className="w-4 h-4" /> 94.2% Overall Campus Utilization
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Facility Units</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">{totalUnitsCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">Across Campus</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Active Operational</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{activeUnitsCount}</p>
          <p className="text-xs text-emerald-700 font-medium mt-0.5">In Current Use</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider">Smart Classrooms</span>
          <p className="text-2xl font-bold text-primary-600 mt-1">52 Units</p>
          <p className="text-xs text-gray-400 mt-0.5">4K Touch Panels</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Science & IT Labs</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">12 Labs</p>
          <p className="text-xs text-gray-400 mt-0.5">100% Operational</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <LuSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search resources, labs, classrooms, in-charge..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Facility Categories' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((res) => (
          <div
            key={res.id}
            onClick={() => setSelectedResource(res)}
            className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                  {res.category}
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {res.status}
                </span>
              </div>

              <h3 className="font-bold text-gray-800 text-sm group-hover:text-primary-600 transition-colors mt-1">
                {res.name}
              </h3>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{res.id}</p>

              {/* Progress */}
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Utilization Rate</span>
                  <span className="font-bold text-primary-700">{res.utilization}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary-600"
                    style={{ width: `${res.utilization}%` }}
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 mt-3 space-y-1 text-xs text-gray-600">
                <p className="flex items-center gap-1.5">
                  <LuMapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{res.location}</span>
                </p>
                <p className="text-[11px] text-gray-500 truncate">In-Charge: {res.incharge}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Units: <strong>{res.activeUnits} / {res.totalUnits}</strong> active</span>
              <span className="text-primary-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Details →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* RESOURCE DETAIL MODAL */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col animate-slide-up border border-gray-200">
            <div className="bg-white border-b border-gray-200 p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-800">{selectedResource.name}</h3>
                <p className="text-xs text-gray-400">{selectedResource.category} • {selectedResource.id}</p>
              </div>
              <button
                onClick={() => setSelectedResource(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs overflow-y-auto max-h-[70vh]">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Units / Capacity:</span>
                  <strong className="text-gray-800">{selectedResource.totalUnits} Units ({selectedResource.activeUnits} Active)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Campus Location:</span>
                  <strong className="text-gray-800">{selectedResource.location}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Assigned In-Charge:</span>
                  <strong className="text-gray-800">{selectedResource.incharge}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Utilization:</span>
                  <strong className="text-primary-700">{selectedResource.utilization}%</strong>
                </div>
              </div>

              <div className="p-3 bg-white border border-gray-200 rounded-lg">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] block mb-1">Equipment & Infrastructure Specs</span>
                <p className="text-gray-700">{selectedResource.specs}</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end">
              <button
                onClick={() => setSelectedResource(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
