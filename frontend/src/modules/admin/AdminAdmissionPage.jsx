import React, { useState } from 'react';
import {
  LuUserPlus,
  LuSearch,
  LuEye,
  LuPhone,
  LuMail,
  LuX,
  LuCircleCheck,
} from 'react-icons/lu';

const ADMISSION_PIPELINE = [
  { id: 'ADM-APP-101', applicantName: 'Samaira Malhotra', targetClass: 'Class XI (Science)', source: 'Direct Walk-in', quotaType: 'General / Merit Quota', parentName: 'Mr. Rajesh Malhotra', phone: '+91 98112 50101', email: 'rajesh.m@gmail.com', appliedDate: '12 Aug 2026', testScore: '94/100', prevSchool: 'St. Xavier Convent', stage: 'Interview Scheduled', feeStatus: 'Reg Fee Paid', remarks: 'Aptitude test cleared with distinction.' },
  { id: 'ADM-APP-102', applicantName: 'Vivaan Agarwal', targetClass: 'Class IX', source: 'Management Quota', quotaType: 'Trustee Quota', parentName: 'Mr. Sunil Agarwal', phone: '+91 98112 50102', email: 'sunil.a@business.in', appliedDate: '14 Aug 2026', testScore: '86/100', prevSchool: 'DPS International', stage: 'Approved / Enrolled', feeStatus: 'Full Paid', remarks: 'Chairman recommended.' },
  { id: 'ADM-APP-103', applicantName: 'Anaya Sharma', targetClass: 'Class I', source: 'Online Portal', quotaType: 'General / Merit Quota', parentName: 'Dr. Vivek Sharma', phone: '+91 98112 50103', email: 'vivek.s@gmail.com', appliedDate: '15 Aug 2026', testScore: 'Interview Only', prevSchool: 'Bloom Preschool', stage: 'Documents Verified', feeStatus: 'Reg Fee Paid', remarks: 'Medical fitness verified.' },
  { id: 'ADM-APP-104', applicantName: 'Rohan Deshmukh', targetClass: 'Class VI', source: 'RTE 25% Quota', quotaType: 'RTE Govt Allocation', parentName: 'Mr. Dilip Deshmukh', phone: '+91 98112 50104', email: 'dilip.d@gmail.com', appliedDate: '10 Aug 2026', testScore: 'N/A (RTE Norms)', prevSchool: 'Govt Primary School', stage: 'Approved / Enrolled', feeStatus: 'RTE Exempted', remarks: 'DOE verification order #RTE-DL-2026-991.' },
  { id: 'ADM-APP-105', applicantName: 'Ishani Roy', targetClass: 'Class XI (Commerce)', source: 'Sibling Referral', quotaType: 'Sibling / Alumni Quota', parentName: 'Mrs. Sharmila Roy', phone: '+91 98112 50105', email: 'sharmila.roy@gmail.com', appliedDate: '16 Aug 2026', testScore: '91/100', prevSchool: 'Modern Vidya Mandir', stage: 'Under Review', feeStatus: 'Reg Fee Paid', remarks: 'Elder brother in Class XII-A.' },
  { id: 'ADM-APP-106', applicantName: 'Kabir Singh Gill', targetClass: 'Class XI (Humanities)', source: 'Sports Quota', quotaType: 'State / National Talent', parentName: 'Col. H. S. Gill', phone: '+91 98112 50106', email: 'gill.hs@army.in', appliedDate: '17 Aug 2026', testScore: '82/100', prevSchool: 'Army Public School', stage: 'Interview Scheduled', feeStatus: 'Reg Fee Paid', remarks: 'National level under-16 badminton player.' },
  { id: 'ADM-APP-107', applicantName: 'Meera Chawla', targetClass: 'Nursery (Pre-Primary)', source: 'Staff Child Quota', quotaType: 'Institutional Quota', parentName: 'Mrs. Deepa Krishnan (Staff)', phone: '+91 98112 40105', email: 'deepa.k@eduflow.edu', appliedDate: '18 Aug 2026', testScore: 'Interaction Passed', prevSchool: 'Toddlers Nest', stage: 'Approved / Enrolled', feeStatus: 'Staff Concession', remarks: 'Daughter of CS faculty.' },
];

export default function AdminAdmissionPage() {
  const [pipeline, setPipeline] = useState(ADMISSION_PIPELINE);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const filtered = pipeline.filter((item) => {
    const matchesSearch =
      item.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.targetClass.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.parentName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSource = selectedSource === 'ALL' || item.source === selectedSource;
    const matchesStage = selectedStage === 'ALL' || item.stage === selectedStage;

    return matchesSearch && matchesSource && matchesStage;
  });

  const totalApps = 480;
  const directApps = 168;
  const onlineApps = 134;
  const mgmtApps = 72;
  const rteAndRefApps = 106;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Clean Standard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <LuUserPlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Admission Applications & Source Quota</h1>
            <p className="text-xs text-gray-400">Intake pipeline categorized by Direct, Management, Online & RTE quotas</p>
          </div>
        </div>

        <button
          onClick={() => alert('New Admission Desk')}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
        >
          + Register Walk-in Applicant
        </button>
      </div>

      {/* Quota Breakdown KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Active Apps</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">{totalApps}</p>
          <p className="text-xs text-gray-400 mt-0.5">Session 2026-27</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider">Direct / Walk-in</span>
          <p className="text-2xl font-bold text-primary-600 mt-1">{directApps}</p>
          <p className="text-xs text-gray-400 mt-0.5">35% of Intake</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Online Portal</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">{onlineApps}</p>
          <p className="text-xs text-gray-400 mt-0.5">28% Digital</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Management & RTE</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{mgmtApps + rteAndRefApps}</p>
          <p className="text-xs text-emerald-700 font-medium mt-0.5">Governing & Govt</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <LuSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by applicant name, ID, class, parent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none"
          >
            <option value="ALL">All Source Quotas</option>
            <option value="Direct Walk-in">Direct Walk-in</option>
            <option value="Management Quota">Management Quota</option>
            <option value="Online Portal">Online Portal</option>
            <option value="RTE 25% Quota">RTE 25% Quota</option>
            <option value="Sibling Referral">Sibling Referral</option>
            <option value="Sports Quota">Sports Quota</option>
            <option value="Staff Child Quota">Staff Child Quota</option>
          </select>

          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none"
          >
            <option value="ALL">All Stages</option>
            <option value="Under Review">Under Review</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Documents Verified">Documents Verified</option>
            <option value="Approved / Enrolled">Approved / Enrolled</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 font-semibold">Applicant & ID</th>
                <th className="py-3.5 px-4 font-semibold">Target Grade</th>
                <th className="py-3.5 px-4 font-semibold">Source & Quota Origin</th>
                <th className="py-3.5 px-4 font-semibold">Parent Contact</th>
                <th className="py-3.5 px-4 font-semibold">Test Score</th>
                <th className="py-3.5 px-4 font-semibold text-center">Pipeline Stage</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-gray-900">{item.applicantName}</p>
                    <p className="text-[11px] text-gray-400 font-mono">{item.id}</p>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-gray-800">{item.targetClass}</td>

                  <td className="py-3.5 px-4">
                    <span className="inline-block font-semibold px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                      {item.source}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-0.5">{item.quotaType}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="text-gray-800">{item.parentName}</p>
                    <p className="text-[11px] text-gray-500">{item.phone}</p>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-primary-700">{item.testScore}</td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        item.stage === 'Approved / Enrolled'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.stage === 'Interview Scheduled'
                          ? 'bg-primary-50 text-primary-700 border border-primary-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {item.stage}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedApplicant(item)}
                      className="px-2.5 py-1 rounded bg-gray-100 hover:bg-primary-50 hover:text-primary-700 text-gray-700 font-semibold text-xs transition-colors"
                    >
                      Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPLICANT MODAL */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col animate-slide-up border border-gray-200">
            <div className="bg-white border-b border-gray-200 p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-800">{selectedApplicant.applicantName}</h3>
                <p className="text-xs text-gray-400">ID: {selectedApplicant.id} • {selectedApplicant.targetClass}</p>
              </div>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-400">Source Quota:</span>
                  <strong className="text-gray-800">{selectedApplicant.source} ({selectedApplicant.quotaType})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Previous School:</span>
                  <strong className="text-gray-800">{selectedApplicant.prevSchool}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Parent / Guardian:</span>
                  <strong className="text-gray-800">{selectedApplicant.parentName} ({selectedApplicant.phone})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Assessment Score:</span>
                  <strong className="text-primary-700">{selectedApplicant.testScore}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Application Remarks:</span>
                  <span className="text-gray-700">{selectedApplicant.remarks}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end">
              <button
                onClick={() => setSelectedApplicant(null)}
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
