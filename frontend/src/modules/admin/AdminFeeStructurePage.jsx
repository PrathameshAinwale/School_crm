import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  LuReceipt,
  LuPlus,
  LuTrash2,
  LuSave,
  LuRefreshCw,
  LuCircleCheck,
  LuCircleAlert,
  LuCalendar,
  LuBus,
  LuBookOpen,
  LuGraduationCap,
  LuWallet,
  LuSparkles,
  LuArrowRight,
  LuUsers,
  LuCheck,
  LuInfo,
  LuX,
  LuPencil,
  LuSearch,
} from 'react-icons/lu';

export default function AdminFeeStructurePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [structures, setStructures] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [summary, setSummary] = useState({
    totalClasses: 0,
    configuredClasses: 0,
    totalStudents: 0,
    totalProjectedRevenue: 0,
    averageAnnualFee: 0,
    academicYear: '2026-27',
  });

  // Modal State for Editing a Class Fee Structure
  const [activeModalClass, setActiveModalClass] = useState(null);
  const [modalTab, setModalTab] = useState('heads'); // 'heads' | 'installments'
  const [toast, setToast] = useState(null);

  // Form State for Active Modal Class
  const [formData, setFormData] = useState({
    academicYear: '2026-27',
    tuitionFee: 60000,
    transportFee: 18000,
    labLibraryFee: 10000,
    activityFee: 6000,
    otherFee: 4000,
    notes: '',
    installments: [
      { term_name: 'Quarter 1 (Apr - Jun)', amount: 24500, due_date: '2026-04-15', late_fee_per_day: 50 },
      { term_name: 'Quarter 2 (Jul - Sep)', amount: 24500, due_date: '2026-07-15', late_fee_per_day: 50 },
      { term_name: 'Quarter 3 (Oct - Dec)', amount: 24500, due_date: '2026-09-15', late_fee_per_day: 50 },
      { term_name: 'Quarter 4 (Jan - Mar)', amount: 24500, due_date: '2026-12-15', late_fee_per_day: 50 },
    ],
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadFeeStructures = async () => {
    try {
      setLoading(true);
      const res = await adminService.getFeeStructures();
      if (res?.success && res.data) {
        setStructures(res.data.structures || []);
        setSummary(res.data.summary || {});
      }
    } catch (err) {
      console.error('Failed to load fee structures:', err);
      showToast('Failed to load fee structures from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeeStructures();
  }, []);

  const openClassDetailsModal = (clsData) => {
    setActiveModalClass(clsData);
    setModalTab('heads');

    const insts = clsData.installments && clsData.installments.length > 0
      ? clsData.installments.map((i) => ({
          term_name: i.termName || i.term_name,
          amount: i.amount,
          due_date: i.dueDate || i.due_date,
          late_fee_per_day: i.lateFeePerDay || i.late_fee_per_day || 0,
        }))
      : [
          { term_name: 'Quarter 1 (Apr - Jun)', amount: Math.round(clsData.totalAnnualFee / 4) || 20000, due_date: '2026-04-15', late_fee_per_day: 50 },
          { term_name: 'Quarter 2 (Jul - Sep)', amount: Math.round(clsData.totalAnnualFee / 4) || 20000, due_date: '2026-07-15', late_fee_per_day: 50 },
          { term_name: 'Quarter 3 (Oct - Dec)', amount: Math.round(clsData.totalAnnualFee / 4) || 20000, due_date: '2026-09-15', late_fee_per_day: 50 },
          { term_name: 'Quarter 4 (Jan - Mar)', amount: Math.round(clsData.totalAnnualFee / 4) || 20000, due_date: '2026-12-15', late_fee_per_day: 50 },
        ];

    setFormData({
      academicYear: clsData.academicYear || '2026-27',
      tuitionFee: clsData.tuitionFee || 0,
      transportFee: clsData.transportFee || 0,
      labLibraryFee: clsData.labLibraryFee || 0,
      activityFee: clsData.activityFee || 0,
      otherFee: clsData.otherFee || 0,
      notes: clsData.notes || '',
      installments: insts,
    });
  };

  const calculatedTotalAnnual =
    (parseFloat(formData.tuitionFee) || 0) +
    (parseFloat(formData.transportFee) || 0) +
    (parseFloat(formData.labLibraryFee) || 0) +
    (parseFloat(formData.activityFee) || 0) +
    (parseFloat(formData.otherFee) || 0);

  const calculatedInstallmentsSum = formData.installments.reduce(
    (sum, inst) => sum + (parseFloat(inst.amount) || 0),
    0
  );

  const isInstallmentsBalanced =
    Math.abs(calculatedTotalAnnual - calculatedInstallmentsSum) < 1;

  const handleAddInstallment = () => {
    const nextQuarterNum = formData.installments.length + 1;
    setFormData((prev) => ({
      ...prev,
      installments: [
        ...prev.installments,
        {
          term_name: `Installment ${nextQuarterNum}`,
          amount: 0,
          due_date: '2026-12-31',
          late_fee_per_day: 50,
        },
      ],
    }));
  };

  const handleRemoveInstallment = (index) => {
    if (formData.installments.length <= 1) {
      showToast('At least one installment term is required', 'error');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      installments: prev.installments.filter((_, i) => i !== index),
    }));
  };

  const handleInstallmentChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.installments];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, installments: updated };
    });
  };

  const handleAutoSplit = (parts = 4) => {
    const eachAmount = Math.round(calculatedTotalAnnual / parts);
    const quarters = [
      { term_name: 'Quarter 1 (Apr - Jun)', due_date: '2026-04-15' },
      { term_name: 'Quarter 2 (Jul - Sep)', due_date: '2026-07-15' },
      { term_name: 'Quarter 3 (Oct - Dec)', due_date: '2026-09-15' },
      { term_name: 'Quarter 4 (Jan - Mar)', due_date: '2026-12-15' },
    ];
    const semesters = [
      { term_name: 'Term 1 (Autumn Session)', due_date: '2026-05-15' },
      { term_name: 'Term 2 (Spring Session)', due_date: '2026-10-15' },
    ];

    const templates = parts === 2 ? semesters : quarters.slice(0, parts);
    const newInstallments = templates.map((t, idx) => ({
      term_name: t.term_name,
      amount: idx === parts - 1 ? calculatedTotalAnnual - eachAmount * (parts - 1) : eachAmount,
      due_date: t.due_date,
      late_fee_per_day: 50,
    }));

    setFormData((prev) => ({
      ...prev,
      installments: newInstallments,
    }));
    showToast(`Evenly distributed annual fee across ${parts} installment terms.`);
  };

  const handleSaveFeeStructure = async (syncStudents = true) => {
    if (!activeModalClass) return;

    if (!isInstallmentsBalanced) {
      showToast(
        `Installment total (₹${calculatedInstallmentsSum.toLocaleString()}) does not match Total Annual Fee (₹${calculatedTotalAnnual.toLocaleString()}). Please adjust before saving.`,
        'error'
      );
      return;
    }

    try {
      setSaving(true);
      const payload = {
        school_class_id: activeModalClass.classId,
        academic_year: formData.academicYear,
        tuition_fee: parseFloat(formData.tuitionFee) || 0,
        transport_fee: parseFloat(formData.transportFee) || 0,
        lab_library_fee: parseFloat(formData.labLibraryFee) || 0,
        activity_fee: parseFloat(formData.activityFee) || 0,
        other_fee: parseFloat(formData.otherFee) || 0,
        notes: formData.notes,
        installments: formData.installments.map((inst) => ({
          term_name: inst.term_name,
          amount: parseFloat(inst.amount) || 0,
          due_date: inst.due_date,
          late_fee_per_day: parseFloat(inst.late_fee_per_day) || 0,
        })),
        sync_students: syncStudents,
      };

      const res = await adminService.saveFeeStructure(payload);
      if (res?.success) {
        showToast(res.message || 'Fee structure successfully saved and synchronized!');
        loadFeeStructures();
        setActiveModalClass(null);
      } else {
        showToast(res?.message || 'Failed to save fee structure', 'error');
      }
    } catch (err) {
      console.error('Error saving fee structure:', err);
      showToast(err.message || 'An error occurred while saving fee structure', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredStructures = structures.filter((cls) =>
    cls.className?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 pb-12 animate-fade-in">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-semibold animate-scale-up ${
            toast.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {toast.type === 'error' ? (
            <LuCircleAlert className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <LuCircleCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Class Fee Structures & Standard Rates
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
              {summary.academicYear || '2026-27'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Click on any standard card to view complete fee details, transport options, and installment due dates.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8.5 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <button
            onClick={loadFeeStructures}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
          >
            <LuRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Configured Standards</div>
            <div className="text-xl font-bold text-slate-800 mt-1 tracking-tight">
              {summary.configuredClasses} / {summary.totalClasses} Classes
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <LuGraduationCap className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Enrolled Students Covered</div>
            <div className="text-xl font-bold text-slate-800 mt-1 tracking-tight">
              {summary.totalStudents} Students
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
            <LuUsers className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Average Standard Fee</div>
            <div className="text-xl font-bold text-emerald-600 mt-1 tracking-tight">
              ₹{Number(summary.averageAnnualFee || 0).toLocaleString()}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <LuWallet className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Total Projected Fee Revenue</div>
            <div className="text-xl font-bold text-primary-600 mt-1 tracking-tight">
              ₹{Number(summary.totalProjectedRevenue || 0).toLocaleString()}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-primary-500/10 text-primary-600 flex items-center justify-center shrink-0">
            <LuReceipt className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Class Cards Grid (The Main View) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredStructures.map((cls) => {
          const totalFeeNum = Number(cls.totalAnnualFee || 0);
          return (
            <div
              key={cls.classId}
              onClick={() => openClassDetailsModal(cls)}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-primary-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Card Header: Class Name + Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white flex items-center justify-center font-bold text-sm transition-colors shadow-xs">
                      <LuGraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800 group-hover:text-primary-700 transition-colors">
                        {cls.className}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {cls.studentsCount} Enrolled Students
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors">
                    {cls.academicYear}
                  </span>
                </div>

                {/* Total Annual Fee Display */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-primary-50/20 group-hover:border-primary-100 transition-all mb-3.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Full Year Total Fees
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
                    ₹{totalFeeNum.toLocaleString()}
                    <span className="text-xs font-semibold text-slate-500 ml-1">/ Year</span>
                  </div>
                </div>

                {/* Breakdown Mini List */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-600" />
                      Core Tuition:
                    </span>
                    <span className="font-semibold font-mono text-slate-800">
                      ₹{Number(cls.tuitionFee || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Vehicle / Bus:
                    </span>
                    <span className="font-semibold font-mono text-slate-800">
                      ₹{Number(cls.transportFee || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      Lab & Library:
                    </span>
                    <span className="font-semibold font-mono text-slate-800">
                      ₹{Number(cls.labLibraryFee || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Sports & Activity:
                    </span>
                    <span className="font-semibold font-mono text-slate-800">
                      ₹{(Number(cls.activityFee || 0) + Number(cls.otherFee || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Installment Terms & Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <LuCalendar className="w-3.5 h-3.5 text-slate-400" />
                  {cls.installmentsCount || 4} Installments
                </span>

                <span className="text-xs font-bold text-primary-600 group-hover:text-primary-700 flex items-center gap-1">
                  Edit Details <LuArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Class Fee Structure Details & Edit Modal */}
      {activeModalClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full my-4 sm:my-8 overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-bold text-base">
                  <LuGraduationCap className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base">{activeModalClass.className} Fee Structure</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                      {formData.academicYear}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs">
                    Configure full year tuition, school vehicles transport, lab fees, and customized installment due dates.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveModalClass(null)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tab Switcher */}
            <div className="px-5 pt-3 pb-0 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalTab('heads')}
                  className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    modalTab === 'heads'
                      ? 'border-primary-600 text-primary-700 bg-white rounded-t-lg'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  1. Annual Fee Heads (Breakdown)
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('installments')}
                  className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    modalTab === 'installments'
                      ? 'border-primary-600 text-primary-700 bg-white rounded-t-lg'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  2. Dedicated Installment Due Dates ({formData.installments.length})
                </button>
              </div>

              <div className="text-xs font-extrabold text-slate-800 font-mono pb-2">
                Total: ₹{calculatedTotalAnnual.toLocaleString()}
              </div>
            </div>

            {/* Modal Form Content */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[65vh] overflow-y-auto text-xs">
              {/* Tab 1: Annual Fee Heads Breakdown */}
              {modalTab === 'heads' && (
                <div className="space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <LuGraduationCap className="w-3.5 h-3.5 text-primary-600" />
                        Core Annual Tuition Fee (₹)
                      </label>
                      <span className="text-[11px] text-slate-400">Mandatory</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={formData.tuitionFee}
                      onChange={(e) => setFormData({ ...formData, tuitionFee: e.target.value })}
                      placeholder="e.g. 64000"
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <LuBus className="w-3.5 h-3.5 text-amber-600" />
                        School Vehicles & Bus Transit Fee (₹)
                      </label>
                      <span className="text-[11px] text-amber-600 font-medium">Added when 'With Transport' opted</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={formData.transportFee}
                      onChange={(e) => setFormData({ ...formData, transportFee: e.target.value })}
                      placeholder="e.g. 18000"
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                          <LuSparkles className="w-3.5 h-3.5 text-indigo-600" />
                          Science Lab & Digital Library (₹)
                        </label>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={formData.labLibraryFee}
                        onChange={(e) => setFormData({ ...formData, labLibraryFee: e.target.value })}
                        placeholder="e.g. 10000"
                        className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                          <LuReceipt className="w-3.5 h-3.5 text-emerald-600" />
                          Sports & Activities Fee (₹)
                        </label>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={formData.activityFee}
                        onChange={(e) => setFormData({ ...formData, activityFee: e.target.value })}
                        placeholder="e.g. 6000"
                        className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Other / Development Fee (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.otherFee}
                      onChange={(e) => setFormData({ ...formData, otherFee: e.target.value })}
                      placeholder="e.g. 4000"
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Fee Notes / Remarks</label>
                    <textarea
                      rows="2"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="e.g. Approved CBSE composite tuition and transport schedule."
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-medium text-slate-500">Calculated Full Year Total:</div>
                      <div className="text-base font-extrabold text-slate-900 font-mono">
                        ₹{calculatedTotalAnnual.toLocaleString()}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleAutoSplit(4);
                        setModalTab('installments');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Next: Set Installment Due Dates &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Dedicated Installment Due Dates Schedule */}
              {modalTab === 'installments' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">Installment Schedule & Due Dates</h4>
                      <p className="text-[11px] text-slate-400">
                        Defaulters in Accounts department and Parents will track these exact due dates.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAutoSplit(4)}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        4 Quarters
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAutoSplit(2)}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        2 Semesters
                      </button>
                      <button
                        type="button"
                        onClick={handleAddInstallment}
                        className="px-2 py-1 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-700 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <LuPlus className="w-3 h-3" /> Add
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {formData.installments.map((inst, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                      >
                        <div className="sm:col-span-4">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                            Term Name
                          </label>
                          <input
                            type="text"
                            value={inst.term_name}
                            onChange={(e) => handleInstallmentChange(index, 'term_name', e.target.value)}
                            placeholder="e.g. Quarter 1 (Apr - Jun)"
                            className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                            Amount (₹)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={inst.amount}
                            onChange={(e) => handleInstallmentChange(index, 'amount', e.target.value)}
                            className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono"
                          />
                        </div>

                        <div className="sm:col-span-4">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                            Due Date (Deadline)
                          </label>
                          <input
                            type="date"
                            value={inst.due_date}
                            onChange={(e) => handleInstallmentChange(index, 'due_date', e.target.value)}
                            className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                          />
                        </div>

                        <div className="sm:col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveInstallment(index)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <LuTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Verification Balance Bar */}
                  <div
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      isInstallmentsBalanced
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isInstallmentsBalanced ? (
                        <LuCircleCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <LuCircleAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span className="font-bold">
                        {isInstallmentsBalanced
                          ? 'Installments perfectly match Total Annual Fee!'
                          : `Difference of ₹${Math.abs(calculatedTotalAnnual - calculatedInstallmentsSum).toLocaleString()}`}
                      </span>
                    </div>

                    {!isInstallmentsBalanced && (
                      <button
                        type="button"
                        onClick={() => handleAutoSplit(formData.installments.length || 4)}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold shadow-xs hover:bg-rose-700 cursor-pointer"
                      >
                        Auto-Balance
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveModalClass(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-white cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleSaveFeeStructure(true)}
                disabled={saving || !isInstallmentsBalanced}
                className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <LuSave className="w-3.5 h-3.5" />
                {saving ? 'Saving & Syncing...' : 'Save & Sync to Enrolled Students'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
