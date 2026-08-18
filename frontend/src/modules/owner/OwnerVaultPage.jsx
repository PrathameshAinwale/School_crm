import React, { useState } from 'react';
import {
  LuFolderLock,
  LuSearch,
  LuDownload,
  LuEye,
  LuFileText,
  LuCircleCheck,
  LuClock,
  LuShieldCheck,
  LuPlus,
  LuX,
  LuUpload,
} from 'react-icons/lu';

const INITIAL_VAULT_DOCUMENTS = [
  { id: 'DOC-AFF-01', title: 'CBSE Permanent Affiliation Letter & Code', category: 'Affiliation & Governance', docNo: 'CBSE/AFF/2024/99120', issuingAuthority: 'Central Board of Secondary Education (CBSE)', issuedDate: '10 Apr 2024', validTill: '31 Mar 2029', status: 'Verified & Active', fileSize: '2.4 MB PDF', confidentialLevel: 'Governing Board / Owner', remarks: 'Affiliated up to Senior Secondary level (Science, Commerce, Humanities).' },
  { id: 'DOC-SAF-02', title: 'Institutional Fire Safety NOC & Audit Clearance', category: 'Safety & Municipal', docNo: 'DFS/HQ/2026/NOC-4412', issuingAuthority: 'Delhi Fire Safety Headquarters', issuedDate: '15 Jan 2026', validTill: '14 Jan 2027', status: 'Verified & Active', fileSize: '1.8 MB PDF', confidentialLevel: 'Public & Regulatory', remarks: 'Hydrants, smoke detectors, and emergency stairwell compliance certified.' },
  { id: 'DOC-SAF-03', title: 'Building Structural Stability & Fitness Certificate', category: 'Safety & Municipal', docNo: 'MCD/ENG/STR-8812', issuingAuthority: 'Municipal Corporation Structural Engineering Wing', issuedDate: '20 Jul 2024', validTill: '19 Jul 2027', status: 'Verified & Active', fileSize: '3.1 MB PDF', confidentialLevel: 'Trustee / Owner', remarks: 'Seismic Zone IV load-bearing certification for all 4 academic blocks.' },
  { id: 'DOC-LND-04', title: 'Campus Land Title Deed & 99-Year Lease Registry', category: 'Land & Trust Deeds', docNo: 'REG/DL/1998/BK-102', issuingAuthority: 'Sub-Registrar Office, Delhi Land Authority', issuedDate: '01 Sep 1998', validTill: '31 Aug 2097', status: 'Permanent Title', fileSize: '6.5 MB PDF', confidentialLevel: 'Owner Strict Confidential', remarks: '6.5 Acre contiguous institutional educational land parcel.' },
  { id: 'DOC-TRS-05', title: 'Educational Society & Trust Registration Certificate', category: 'Land & Trust Deeds', docNo: 'SOC/DEL/1998/4421', issuingAuthority: 'Registrar of Societies, Govt of NCT Delhi', issuedDate: '12 Nov 1998', validTill: 'Perpetual', status: 'Verified & Active', fileSize: '1.9 MB PDF', confidentialLevel: 'Trustee / Owner', remarks: 'Governing body non-profit trust charter.' },
  { id: 'DOC-FIN-06', title: 'Income Tax 12A & 80G Tax Exemption Approval', category: 'Tax & Financial Audits', docNo: 'IT/DEL/12A/80G-881', issuingAuthority: 'Directorate of Income Tax (Exemptions)', issuedDate: '01 Apr 2020', validTill: 'Perpetual (Renewed 2026)', status: 'Verified & Active', fileSize: '1.5 MB PDF', confidentialLevel: 'Owner / Finance Lead', remarks: 'Tax exemption on donor contributions and institutional corpus.' },
  { id: 'DOC-FIN-07', title: 'Annual Statutory Financial Audit Report (FY 2025-26)', category: 'Tax & Financial Audits', docNo: 'AUDIT/2026/ED-99', issuingAuthority: 'K. S. Narayanan & Co. Chartered Accountants', issuedDate: '30 Jun 2026', validTill: 'FY 2025-26 Concluded', status: 'Verified & Active', fileSize: '4.8 MB PDF', confidentialLevel: 'Owner / Finance Lead', remarks: 'Clean audit opinion without adverse remarks.' },
  { id: 'DOC-ENV-08', title: '150 kW Rooftop Solar Net-Metering Grid License', category: 'Utilities & Environment', docNo: 'DERC/SOLAR/2023/11', issuingAuthority: 'Delhi Electricity Regulatory Commission (DERC)', issuedDate: '10 Oct 2023', validTill: '09 Oct 2028', status: 'Verified & Active', fileSize: '2.1 MB PDF', confidentialLevel: 'Operations / Owner', remarks: 'Bi-directional net metering grid injection approval.' },
  { id: 'DOC-SAN-09', title: 'Potable Drinking Water & Campus Sanitation Certificate', category: 'Safety & Municipal', docNo: 'DJB/LAB/2026/WTR-99', issuingAuthority: 'Delhi Jal Board Public Health Laboratory', issuedDate: '02 Feb 2026', validTill: '01 Feb 2027', status: 'Verified & Active', fileSize: '1.2 MB PDF', confidentialLevel: 'Public & Regulatory', remarks: 'Bacteriological and chemical purity tests certified.' },
];

export default function OwnerVaultPage() {
  const [documents, setDocuments] = useState(INITIAL_VAULT_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const filtered = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.docNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.issuingAuthority.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['ALL', ...Array.from(new Set(documents.map((d) => d.category)))];

  const handleDownload = (doc) => {
    alert(`Downloading verified copy of "${doc.title}" (${doc.fileSize})...`);
  };

  const handleAddDocument = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get('title');
    const category = formData.get('category');
    const docNo = formData.get('docNo') || `DOC-REG-${Math.floor(1000 + Math.random() * 9000)}`;
    const issuingAuthority = formData.get('issuingAuthority');
    const issuedDate = formData.get('issuedDate') || '18 Aug 2026';
    const validTill = formData.get('validTill') || 'Perpetual';
    const confidentialLevel = formData.get('confidentialLevel') || 'Governing Board / Owner';
    const remarks = formData.get('remarks') || 'Uploaded and verified by School Owner.';

    const newDoc = {
      id: `DOC-VLT-${Math.floor(10 + Math.random() * 90)}`,
      title,
      category,
      docNo,
      issuingAuthority,
      issuedDate,
      validTill,
      status: 'Verified & Active',
      fileSize: uploadedFileName ? '3.2 MB PDF' : '2.1 MB PDF',
      confidentialLevel,
      remarks,
    };

    setDocuments([newDoc, ...documents]);
    setShowAddModal(false);
    setUploadedFileName('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Clean Standard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <LuFolderLock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Institutional Document Vault</h1>
            <p className="text-xs text-gray-400">Encrypted repository for school affiliation letters, safety NOCs, land deeds, and audit records</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <LuShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Verified Compliance
          </span>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <LuPlus className="w-4 h-4" /> Add Document
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Vault Documents</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">{documents.length} Records</p>
          <p className="text-xs text-gray-400 mt-0.5">Encrypted Backups</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Active & Valid</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{documents.length} / {documents.length}</p>
          <p className="text-xs text-emerald-700 font-medium mt-0.5">Zero Non-Compliance</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider">Affiliation Validity</span>
          <p className="text-2xl font-bold text-primary-600 mt-1">Mar 2029</p>
          <p className="text-xs text-gray-400 mt-0.5">CBSE Senior Secondary</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Upcoming Renewal</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">Jan 2027</p>
          <p className="text-xs text-gray-400 mt-0.5">Fire Safety Annual Audit</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <LuSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search vault by document name, certificate code, or authority..."
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
                {c === 'ALL' ? 'All Document Categories' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vault Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc) => (
          <div
            key={doc.id}
            onClick={() => setSelectedDoc(doc)}
            className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                  {doc.category}
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {doc.status}
                </span>
              </div>

              <h3 className="font-bold text-gray-800 text-sm group-hover:text-primary-600 transition-colors mt-1">
                {doc.title}
              </h3>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{doc.docNo}</p>

              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 mt-3 space-y-1 text-xs text-gray-600">
                <p className="text-[11px] text-gray-500">
                  Authority: <strong className="text-gray-800">{doc.issuingAuthority}</strong>
                </p>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-200">
                  <span>Issued: {doc.issuedDate}</span>
                  <span>Valid: <strong className="text-emerald-700">{doc.validTill}</strong></span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-400 font-mono">{doc.fileSize}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(doc);
                }}
                className="text-primary-600 font-semibold flex items-center gap-1 hover:underline"
              >
                <LuDownload className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col animate-slide-up border border-gray-200">
            <div className="bg-white border-b border-gray-200 p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-800">{selectedDoc.title}</h3>
                <p className="text-xs text-gray-400">{selectedDoc.category} • {selectedDoc.docNo}</p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Certificate / Reg Code:</span>
                  <strong className="text-gray-800 font-mono">{selectedDoc.docNo}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Issuing Body:</span>
                  <strong className="text-gray-800">{selectedDoc.issuingAuthority}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Issued On:</span>
                  <span className="text-gray-800 font-semibold">{selectedDoc.issuedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Validity Expiry:</span>
                  <strong className="text-emerald-700">{selectedDoc.validTill}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Access Tier:</span>
                  <span className="text-gray-700 font-semibold">{selectedDoc.confidentialLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-emerald-700 font-bold">{selectedDoc.status}</span>
                </div>
              </div>

              <div className="p-3 bg-white border border-gray-200 rounded-lg">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                  Document Remarks & Scope
                </span>
                <p className="text-gray-700">{selectedDoc.remarks}</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => handleDownload(selectedDoc)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <LuDownload className="w-3.5 h-3.5" /> Download Verified PDF
              </button>
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / UPLOAD DOCUMENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col animate-slide-up border border-gray-200 max-h-[90vh]">
            <div className="bg-white border-b border-gray-200 p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-800">Add Document to Institutional Vault</h3>
                <p className="text-xs text-gray-400">Upload compliance certificates, NOCs, land deeds, or audit reports</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="p-5 space-y-3.5 text-xs overflow-y-auto">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Document Title *</label>
                <input
                  name="title"
                  required
                  placeholder="e.g. CBSE Senior Secondary Affiliation Renewal Letter"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category *</label>
                  <select
                    name="category"
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none"
                  >
                    <option value="Affiliation & Governance">Affiliation & Governance</option>
                    <option value="Safety & Municipal">Safety & Municipal</option>
                    <option value="Land & Trust Deeds">Land & Trust Deeds</option>
                    <option value="Tax & Financial Audits">Tax & Financial Audits</option>
                    <option value="Utilities & Environment">Utilities & Environment</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Certificate / Doc No *</label>
                  <input
                    name="docNo"
                    required
                    placeholder="e.g. CBSE/AFF/2026/9941"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Issuing Authority / Body *</label>
                <input
                  name="issuingAuthority"
                  required
                  placeholder="e.g. Central Board of Secondary Education (CBSE) / Fire Safety HQ"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Issued Date</label>
                  <input
                    name="issuedDate"
                    type="text"
                    placeholder="e.g. 15 Aug 2026"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Valid Till / Expiry</label>
                  <input
                    name="validTill"
                    type="text"
                    placeholder="e.g. 31 Mar 2030 or Perpetual"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Access Confidentiality Level</label>
                <select
                  name="confidentialLevel"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none"
                >
                  <option value="Governing Board / Owner">Governing Board / Owner</option>
                  <option value="Owner Strict Confidential">Owner Strict Confidential</option>
                  <option value="Public & Regulatory">Public & Regulatory</option>
                  <option value="Owner / Finance Lead">Owner / Finance Lead</option>
                </select>
              </div>

              {/* Upload Document File Input Box */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Document File (PDF / DOCX)</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <LuUpload className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-gray-700">
                    {uploadedFileName ? uploadedFileName : 'Click to select or drag document file'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">PDF, DOCX up to 25 MB</p>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.png,.jpg"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadedFileName(e.target.files[0].name);
                      }
                    }}
                    className="mt-2 text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Document Remarks & Scope</label>
                <textarea
                  name="remarks"
                  rows={2}
                  placeholder="Summary notes regarding the certificate or affiliation..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div className="p-4 bg-gray-50 -mx-5 -mb-5 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5"
                >
                  <LuUpload className="w-3.5 h-3.5" /> Save Document to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
