import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import {
  LuReceipt,
  LuPlus,
  LuTrash2,
  LuSave,
  LuCircleCheck,
  LuCircleAlert,
  LuCalendar,
  LuBus,
  LuBookOpen,
  LuGraduationCap,
  LuWallet,
  LuSparkles,
  LuArrowRight,
  LuArrowLeft,
  LuUsers,
  LuCheck,
  LuInfo,
  LuX,
  LuPencil,
  LuSearch,
  LuChevronDown,
  LuFilter,
} from 'react-icons/lu';

export default function AdminFeeStructurePage() {
  const { currentRole } = useAuth();
  const isPrincipal = currentRole === 'principal';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [structures, setStructures] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [summary, setSummary] = useState({
    totalClasses: 0,
    configuredClasses: 0,
    totalStudents: 0,
    totalProjectedRevenue: 0,
    averageAnnualFee: 0,
    academicYear: '2026-27',
  });

  // Modal State for Editing / Adding a Class Fee Structure
  const [activeModalClass, setActiveModalClass] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [modalTab, setModalTab] = useState('heads'); // 'heads' | 'installments'
  const [toast, setToast] = useState(null);

  // Form State for Active Modal Class
  const [formData, setFormData] = useState({
    academicYear: '2026-27',
    feeHeads: [
      { id: '1', title: 'Lecture Fees', amount: 60000 },
      { id: '2', title: 'School Transport Fee', amount: 18000 },
      { id: '3', title: 'Lab & Digital Library', amount: 10000 },
      { id: '4', title: 'Sports & Activities Fee', amount: 6000 },
      { id: '5', title: 'Campus & Development Fee', amount: 4000 },
    ],
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

  // Helper to extract or generate fee heads
  const getInitialFeeHeads = (clsData) => {
    if (clsData?.feeHeads && Array.isArray(clsData.feeHeads) && clsData.feeHeads.length > 0) {
      return clsData.feeHeads.map((h, i) => ({
        id: h.id || String(Date.now() + i),
        title: h.title || `Fee Head ${i + 1}`,
        amount: Number(h.amount) || 0,
      }));
    }

    if (clsData && clsData.totalAnnualFee > 0) {
      const heads = [];
      if (Number(clsData.tuitionFee) > 0) heads.push({ id: '1', title: 'Lecture Fees', amount: Number(clsData.tuitionFee) });
      if (Number(clsData.transportFee) > 0) heads.push({ id: '2', title: 'School Transport Fee', amount: Number(clsData.transportFee) });
      if (Number(clsData.labLibraryFee) > 0) heads.push({ id: '3', title: 'Lab & Digital Library', amount: Number(clsData.labLibraryFee) });
      if (Number(clsData.activityFee) > 0) heads.push({ id: '4', title: 'Sports & Activities Fee', amount: Number(clsData.activityFee) });
      if (Number(clsData.otherFee) > 0) heads.push({ id: '5', title: 'Campus & Development Fee', amount: Number(clsData.otherFee) });
      if (heads.length > 0) return heads;
    }

    return [
      { id: '1', title: 'Lecture Fees', amount: 60000 },
      { id: '2', title: 'School Transport Fee', amount: 18000 },
      { id: '3', title: 'Lab & Digital Library', amount: 10000 },
      { id: '4', title: 'Sports & Activities Fee', amount: 6000 },
      { id: '5', title: 'Campus & Development Fee', amount: 4000 },
    ];
  };

  // Open modal in Add mode
  const openAddModal = () => {
    setIsAddMode(true);
    const unconfigured = structures.find((s) => !s.isConfigured || s.totalAnnualFee === 0);
    const targetClass = unconfigured || structures[0] || null;

    setActiveModalClass(targetClass);
    setModalTab('heads');

    const heads = getInitialFeeHeads(targetClass);
    const defaultAnnual = heads.reduce((sum, h) => sum + (parseFloat(h.amount) || 0), 0);
    const qAmount = Math.round(defaultAnnual / 4);

    setFormData({
      academicYear: summary.academicYear || '2026-27',
      feeHeads: heads,
      notes: targetClass?.notes || 'Approved standard institutional fee structure.',
      installments: [
        { term_name: 'Quarter 1 (Apr - Jun)', amount: qAmount, due_date: '2026-04-15', late_fee_per_day: 50 },
        { term_name: 'Quarter 2 (Jul - Sep)', amount: qAmount, due_date: '2026-07-15', late_fee_per_day: 50 },
        { term_name: 'Quarter 3 (Oct - Dec)', amount: qAmount, due_date: '2026-09-15', late_fee_per_day: 50 },
        { term_name: 'Quarter 4 (Jan - Mar)', amount: defaultAnnual - qAmount * 3, due_date: '2026-12-15', late_fee_per_day: 50 },
      ],
    });
  };

  // Open modal in Edit mode for a specific class
  const openClassDetailsModal = (clsData) => {
    setIsAddMode(false);
    setActiveModalClass(clsData);
    setModalTab('heads');

    const heads = getInitialFeeHeads(clsData);
    const totalAnnual = clsData.totalAnnualFee || heads.reduce((sum, h) => sum + (parseFloat(h.amount) || 0), 0) || 60000;
    const insts = clsData.installments && clsData.installments.length > 0
      ? clsData.installments.map((i) => ({
          term_name: i.termName || i.term_name,
          amount: i.amount,
          due_date: i.dueDate || i.due_date,
          late_fee_per_day: i.lateFeePerDay || i.late_fee_per_day || 0,
        }))
      : [
          { term_name: 'Quarter 1 (Apr - Jun)', amount: Math.round(totalAnnual / 4), due_date: '2026-04-15', late_fee_per_day: 50 },
          { term_name: 'Quarter 2 (Jul - Sep)', amount: Math.round(totalAnnual / 4), due_date: '2026-07-15', late_fee_per_day: 50 },
          { term_name: 'Quarter 3 (Oct - Dec)', amount: Math.round(totalAnnual / 4), due_date: '2026-09-15', late_fee_per_day: 50 },
          { term_name: 'Quarter 4 (Jan - Mar)', amount: totalAnnual - Math.round(totalAnnual / 4) * 3, due_date: '2026-12-15', late_fee_per_day: 50 },
        ];

    setFormData({
      academicYear: clsData.academicYear || summary.academicYear || '2026-27',
      feeHeads: heads,
      notes: clsData.notes || '',
      installments: insts,
    });
  };

  // Change selected class inside the modal
  const handleClassSelectionChange = (classId) => {
    const classObj = structures.find((s) => String(s.classId) === String(classId));
    if (classObj) {
      setActiveModalClass(classObj);
      const heads = getInitialFeeHeads(classObj);
      const totalAnnual = classObj.totalAnnualFee || heads.reduce((sum, h) => sum + (parseFloat(h.amount) || 0), 0) || 60000;
      const insts = classObj.installments && classObj.installments.length > 0
        ? classObj.installments.map((i) => ({
            term_name: i.termName || i.term_name,
            amount: i.amount,
            due_date: i.dueDate || i.due_date,
            late_fee_per_day: i.lateFeePerDay || i.late_fee_per_day || 0,
          }))
        : [
            { term_name: 'Quarter 1 (Apr - Jun)', amount: Math.round(totalAnnual / 4), due_date: '2026-04-15', late_fee_per_day: 50 },
            { term_name: 'Quarter 2 (Jul - Sep)', amount: Math.round(totalAnnual / 4), due_date: '2026-07-15', late_fee_per_day: 50 },
            { term_name: 'Quarter 3 (Oct - Dec)', amount: Math.round(totalAnnual / 4), due_date: '2026-09-15', late_fee_per_day: 50 },
            { term_name: 'Quarter 4 (Jan - Mar)', amount: totalAnnual - Math.round(totalAnnual / 4) * 3, due_date: '2026-12-15', late_fee_per_day: 50 },
          ];

      setFormData({
        academicYear: classObj.academicYear || summary.academicYear || '2026-27',
        feeHeads: heads,
        notes: classObj.notes || '',
        installments: insts,
      });
    }
  };

  const handleAddFeeHead = (title = '', amount = 0) => {
    setFormData((prev) => ({
      ...prev,
      feeHeads: [
        ...prev.feeHeads,
        {
          id: String(Date.now() + Math.random()),
          title: title || `Fee Head ${prev.feeHeads.length + 1}`,
          amount: amount || 0,
        },
      ],
    }));
  };

  const handleRemoveFeeHead = (index) => {
    if (formData.feeHeads.length <= 1) {
      showToast('At least one fee head is required', 'error');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      feeHeads: prev.feeHeads.filter((_, i) => i !== index),
    }));
  };

  const handleFeeHeadChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.feeHeads];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, feeHeads: updated };
    });
  };

  const calculatedTotalAnnual = (formData.feeHeads || []).reduce(
    (sum, h) => sum + (parseFloat(h.amount) || 0),
    0
  );

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
    const validParts = Math.max(1, parts);
    const eachAmount = Math.round(calculatedTotalAnnual / validParts);
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
    const annual = [
      { term_name: 'Full Annual Fee', due_date: '2026-04-15' },
    ];

    let templates;
    if (validParts === 1) {
      templates = annual;
    } else if (validParts === 2) {
      templates = semesters;
    } else if (validParts === 4) {
      templates = quarters;
    } else {
      templates = Array.from({ length: validParts }, (_, i) => ({
        term_name: formData.installments[i]?.term_name || `Installment ${i + 1}`,
        due_date: formData.installments[i]?.due_date || '2026-12-31',
      }));
    }

    const newInstallments = templates.map((t, idx) => ({
      term_name: t.term_name,
      amount: idx === validParts - 1 ? calculatedTotalAnnual - eachAmount * (validParts - 1) : eachAmount,
      due_date: t.due_date,
      late_fee_per_day: 50,
    }));

    setFormData((prev) => ({
      ...prev,
      installments: newInstallments,
    }));
    showToast(`Evenly distributed fee across ${validParts} installment ${validParts === 1 ? 'payment' : 'terms'}.`);
  };

  const handleSaveFeeStructure = async (syncStudents = true) => {
    if (!activeModalClass) {
      showToast('Please select a class first', 'error');
      return;
    }

    const emptyTitleIndex = (formData.feeHeads || []).findIndex((h) => !h.title || !h.title.trim());
    if (emptyTitleIndex !== -1) {
      showToast(`Please enter a title for Fee Head #${emptyTitleIndex + 1}`, 'error');
      return;
    }

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
        fee_heads: formData.feeHeads.map((h) => ({
          title: h.title.trim(),
          amount: parseFloat(h.amount) || 0,
        })),
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
        showToast(res.message || `Fee structure for ${activeModalClass.className} saved successfully!`);
        await loadFeeStructures();
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

  const handleDeleteFeeStructure = async (targetId, className) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the fee structure for ${className}? This will remove all configured fee heads and installment due dates for this class.`
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      const res = await adminService.deleteFeeStructure(targetId);
      if (res?.success) {
        showToast(res.message || `Fee structure for ${className} deleted successfully.`);
        await loadFeeStructures();
        setActiveModalClass(null);
      } else {
        showToast(res?.message || 'Failed to delete fee structure', 'error');
      }
    } catch (err) {
      console.error('Error deleting fee structure:', err);
      showToast(err.message || 'Failed to delete fee structure', 'error');
    } finally {
      setSaving(false);
    }
  };

  const configuredStructures = structures.filter(
    (cls) => cls.isConfigured && Number(cls.totalAnnualFee || 0) > 0
  );

  const filteredStructures = configuredStructures.filter((cls) => {
    if (selectedClassFilter !== 'all' && String(cls.classId) !== String(selectedClassFilter)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = cls.className?.toLowerCase().includes(q);
      const matchHead = cls.feeHeads?.some((h) => h.title?.toLowerCase().includes(q));
      return matchName || matchHead;
    }
    return true;
  });

  return (
    <div className="space-y-5 pb-12 animate-fade-in font-sans">
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

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <LuReceipt className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-bold text-gray-900 leading-tight">
                Class Fee Structures & Standard Rates
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
                {summary.academicYear || '2026-27'}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
              Configure full year tuition, transport, lab fees, and customized installment due dates by class.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {!isPrincipal && (
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-600/20 transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <LuPlus className="w-4 h-4" />
              <span>Add Fee Structure</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Configured Standards</div>
            <div className="text-xl font-bold text-slate-800 mt-1 tracking-tight">
              {configuredStructures.length} / {structures.length || summary.totalClasses} Classes
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
              {configuredStructures.reduce((sum, c) => sum + (c.studentsCount || 0), 0)} Students
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
              ₹
              {configuredStructures.length > 0
                ? Math.round(
                    configuredStructures.reduce((sum, c) => sum + Number(c.totalAnnualFee || 0), 0) /
                      configuredStructures.length
                  ).toLocaleString()
                : '0'}
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
              ₹
              {configuredStructures
                .reduce((sum, c) => sum + Number(c.totalAnnualFee || 0) * (c.studentsCount || 0), 0)
                .toLocaleString()}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-primary-500/10 text-primary-600 flex items-center justify-center shrink-0">
            <LuReceipt className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar: Search on Left, Class Dropdown Filter, View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 shadow-xs">
        {/* Left Side: Search Bar on the Left + Dropdown filter with all classes */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1 max-w-2xl">
          {/* Search Bar on the Left Side */}
          <div className="relative flex-1 min-w-[200px]">
            <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search class or fee head..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary-500 shadow-2xs font-medium"
            />
          </div>

          {/* Dropdown filter containing all classes */}
          <div className="relative min-w-[190px]">
            <LuFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="w-full pl-8.5 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary-500 shadow-2xs appearance-none cursor-pointer"
            >
              <option value="all">All Classes ({structures.length})</option>
              {structures.map((s) => (
                <option key={s.classId} value={s.classId}>
                  {s.className}
                </option>
              ))}
            </select>
            <LuChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Right Side: Total Configured indicator */}
        <div className="text-xs font-bold text-slate-500 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 shrink-0 self-end sm:self-auto">
          {configuredStructures.length} {configuredStructures.length === 1 ? 'Class' : 'Classes'} Configured
        </div>
      </div>

      {/* Cards View / Empty State */}
      {filteredStructures.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-xs">
          {configuredStructures.length === 0 ? (
            <div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary-50 text-primary-600 border border-primary-100 flex items-center justify-center mx-auto mb-4 shadow-2xs">
                <LuReceipt className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
                No Fee Structures Configured
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
                All previous fee cards have been cleared. Click below to add and customize a new fee structure for any class.
              </p>
              {!isPrincipal && (
                <button
                  type="button"
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-600/20 transition cursor-pointer"
                >
                  <LuPlus className="w-4 h-4" />
                  <span>+ Add Fee Structure for Class</span>
                </button>
              )}
            </div>
          ) : (
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <LuSearch className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">No matching classes found</h3>
              <p className="text-xs text-slate-500 mb-3">
                No configured fee structures match your current search or filter criteria.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedClassFilter('all');
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 rounded-lg cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStructures.map((cls) => {
            const totalFeeNum = Number(cls.totalAnnualFee || 0);

            return (
              <div
                key={cls.classId}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-primary-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Class Name + Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                        <LuGraduationCap className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-slate-800 truncate">
                          {cls.className}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {cls.studentsCount} Enrolled Students
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {cls.academicYear}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 mb-3.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Full Year Total Fees
                    </div>
                    <div className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
                      ₹{totalFeeNum.toLocaleString()}
                      <span className="text-xs font-semibold text-slate-500 ml-1">/ Year</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {cls.feeHeads && cls.feeHeads.length > 0 ? (
                      cls.feeHeads.slice(0, 4).map((head, hIdx) => {
                        const dotColors = [
                          'bg-blue-600',
                          'bg-amber-500',
                          'bg-indigo-500',
                          'bg-emerald-500',
                          'bg-purple-500',
                          'bg-rose-500',
                        ];
                        return (
                          <div key={hIdx} className="flex justify-between items-center text-slate-600 gap-2">
                            <span className="flex items-center gap-1.5 min-w-0 truncate">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[hIdx % dotColors.length]}`} />
                              <span className="truncate">{head.title}:</span>
                            </span>
                            <span className="font-semibold font-mono text-slate-800 shrink-0">
                              ₹{Number(head.amount || 0).toLocaleString()}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex justify-between text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-600" />
                          Standard Fee:
                        </span>
                        <span className="font-semibold font-mono text-slate-800">
                          ₹{totalFeeNum.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {cls.feeHeads && cls.feeHeads.length > 4 && (
                      <div className="text-[10px] font-semibold text-slate-400 text-right pt-0.5">
                        +{cls.feeHeads.length - 4} more custom heads
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Installment Terms & Edit/Delete Button (Exactly 1 of each) */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    <LuCalendar className="w-3.5 h-3.5 text-slate-400" />
                    {cls.installmentsCount || 4} Installments
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openClassDetailsModal(cls)}
                      className="px-3 py-1.5 rounded-lg bg-primary-50 hover:bg-primary-600 text-primary-700 hover:text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-primary-200 hover:border-primary-600 shadow-2xs"
                    >
                      <LuPencil className="w-3.5 h-3.5" />
                      <span>{isPrincipal ? 'View Details' : 'Edit Details'}</span>
                    </button>

                    {!isPrincipal && (
                      <button
                        type="button"
                        onClick={() => handleDeleteFeeStructure(cls.feeStructureId || cls.classId, cls.className)}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                        title={`Delete ${cls.className} Fee Structure`}
                      >
                        <LuTrash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Class Fee Structure Details & Edit / Add Modal */}
      {activeModalClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full my-4 sm:my-8 overflow-hidden animate-scale-up flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-white px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                  <LuGraduationCap className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-base text-slate-900 truncate">
                      {isAddMode ? 'Configure Fee Structure' : `Fee Structure: ${activeModalClass.className}`}
                    </h3>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {formData.academicYear}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5 truncate">
                    {isAddMode
                      ? 'Select class, define annual fee components, and set due dates.'
                      : `Annual fee breakdown and installment due dates for ${activeModalClass.className}.`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalClass(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0 ml-2"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Navigation */}
            <div className="bg-slate-50 px-5 sm:px-6 py-2.5 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setModalTab('heads')}
                  className={`flex items-center gap-1.5 sm:gap-2 text-xs font-bold transition cursor-pointer ${
                    modalTab === 'heads'
                      ? 'text-blue-700'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <span
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-extrabold ${
                      modalTab === 'heads'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    1
                  </span>
                  <span>1. Fee Heads</span>
                </button>

                <div className="w-4 sm:w-8 h-px bg-slate-300" />

                <button
                  type="button"
                  onClick={() => {
                    if (!isInstallmentsBalanced) {
                      handleAutoSplit(formData.installments.length || 4);
                    }
                    setModalTab('installments');
                  }}
                  className={`flex items-center gap-1.5 sm:gap-2 text-xs font-bold transition cursor-pointer ${
                    modalTab === 'installments'
                      ? 'text-blue-700'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <span
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-extrabold ${
                      modalTab === 'installments'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : isInstallmentsBalanced
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isInstallmentsBalanced && modalTab !== 'installments' ? (
                      <LuCheck className="w-3.5 h-3.5" />
                    ) : (
                      '2'
                    )}
                  </span>
                  <span>2. Installment Terms ({formData.installments.length})</span>
                </button>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Annual Fee
                </span>
                <span className="text-sm font-extrabold text-blue-600 font-mono">
                  ₹{calculatedTotalAnnual.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto text-xs flex-1">
              {/* In Add Mode: Class Selection Integrated */}
              {isAddMode && (
                <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200">
                  <label className="block text-xs font-bold text-blue-900 mb-1.5 flex items-center gap-1.5">
                    <LuGraduationCap className="w-4 h-4 text-blue-600" />
                    <span>Select Academic Class to Configure Fees *</span>
                  </label>
                  <div className="relative">
                    <select
                      value={activeModalClass.classId}
                      onChange={(e) => handleClassSelectionChange(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 bg-white border border-blue-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs appearance-none"
                    >
                      {structures.map((s) => (
                        <option key={s.classId} value={s.classId}>
                          {s.className} {s.isConfigured && s.totalAnnualFee > 0 ? `(Configured: ₹${s.totalAnnualFee.toLocaleString()}/yr)` : '(Not Configured Yet)'}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <LuChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 1: ANNUAL FEE HEADS (CUSTOMIZABLE TITLES & AMOUNTS) */}
              {modalTab === 'heads' && (
                <div className="space-y-4">
                  {/* Section Header with + Add Fee Head button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 pb-1 border-b border-slate-100">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        <LuReceipt className="w-3.5 h-3.5 text-blue-600" />
                        <span>Custom Fee Heads & Titles ({(formData.feeHeads || []).length})</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Customize each title (e.g. Lecture Fees, Lab Fee, Transport) and set its annual amount.
                      </p>
                    </div>

                    {!isPrincipal && (
                      <button
                        type="button"
                        onClick={() => handleAddFeeHead('', 0)}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 flex items-center gap-1.5 transition cursor-pointer shadow-2xs self-start sm:self-auto shrink-0"
                      >
                        <LuPlus className="w-3.5 h-3.5" />
                        <span>Add Fee Head</span>
                      </button>
                    )}
                  </div>

                  {/* Quick Preset Title Suggestions */}
                  {!isPrincipal && (
                    <div className="flex items-center gap-1.5 flex-wrap text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">Quick Suggestions:</span>
                      {[
                        'Lecture Fees',
                        'Examination Fee',
                        'Practical Lab & Library',
                        'School Transport Fee',
                        'Sports & Co-Curricular',
                        'Campus & Development',
                        'Uniform & Study Material',
                      ].map((presetTitle) => {
                        const exists = (formData.feeHeads || []).some((h) => h.title.toLowerCase() === presetTitle.toLowerCase());
                        if (exists) return null;
                        return (
                          <button
                            key={presetTitle}
                            type="button"
                            onClick={() => handleAddFeeHead(presetTitle, 5000)}
                            className="px-2 py-0.5 rounded-md bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 border border-slate-200 transition cursor-pointer text-[10px] font-semibold shadow-2xs"
                          >
                            + {presetTitle}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Fee Heads List */}
                  <div className="space-y-2.5">
                    {(formData.feeHeads || []).map((head, index) => (
                      <div
                        key={head.id || index}
                        className="p-3 rounded-xl border border-slate-200/90 bg-white hover:border-blue-300 focus-within:border-blue-500 transition-all shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                      >
                        {/* Title Input */}
                        <div className="flex-1 min-w-0">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Fee Head #{index + 1} Title / Name
                          </label>
                          <input
                            type="text"
                            value={head.title}
                            onChange={(e) => handleFeeHeadChange(index, 'title', e.target.value)}
                            placeholder="e.g. Lecture Fees, Lab Fee, Transport..."
                            className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        {/* Amount Input with ₹ */}
                        <div className="sm:w-44 shrink-0">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Annual Amount (₹)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                              ₹
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={head.amount}
                              onChange={(e) => handleFeeHeadChange(index, 'amount', e.target.value)}
                              placeholder="0"
                              className="w-full h-9 pl-7 pr-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                            />
                          </div>
                        </div>

                        {/* Remove Action */}
                        {!isPrincipal && (
                          <div className="sm:w-8 shrink-0 flex items-center justify-end sm:pt-4">
                            <button
                              type="button"
                              onClick={() => handleRemoveFeeHead(index)}
                              disabled={(formData.feeHeads || []).length <= 1}
                              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                              title="Delete Fee Head"
                            >
                              <LuTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Notes / Remarks */}
                  <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200">
                    <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                      <LuInfo className="w-3.5 h-3.5 text-slate-500" />
                      <span>Fee Structure Notes / Policy Remarks</span>
                      <span className="text-[10px] text-slate-400 font-normal ml-auto">Optional</span>
                    </label>
                    <textarea
                      rows="2"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="e.g. Approved institutional composite fee."
                      className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none font-medium"
                    />
                  </div>

                  {/* Total Fees Card at the Bottom */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/95 via-indigo-50/60 to-slate-50 border-2 border-blue-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                    <div>
                      <div className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">
                        Full Year Total Annual Fee
                      </div>
                      <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                        ₹{calculatedTotalAnnual.toLocaleString()}
                        <span className="text-xs font-semibold text-slate-600 font-sans ml-1.5">/ Year</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Sum of all {(formData.feeHeads || []).length} configured fee {(formData.feeHeads || []).length === 1 ? 'head' : 'heads'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!isInstallmentsBalanced) {
                          handleAutoSplit(formData.installments.length || 4);
                        }
                        setModalTab('installments');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
                    >
                      <span>Continue to Due Dates</span>
                      <LuArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: INSTALLMENT SCHEDULE & DUE DATES */}
              {modalTab === 'installments' && (
                <div className="space-y-4">
                  {/* Presets Bar */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-700">Quick Split:</span>
                      <button
                        type="button"
                        onClick={() => handleAutoSplit(4)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition cursor-pointer shadow-2xs"
                      >
                        4 Quarters
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAutoSplit(2)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition cursor-pointer shadow-2xs"
                      >
                        2 Semesters
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAutoSplit(1)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition cursor-pointer shadow-2xs"
                      >
                        1 Full Payment
                      </button>
                    </div>

                    {!isPrincipal && (
                      <button
                        type="button"
                        onClick={handleAddInstallment}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs self-start sm:self-auto"
                      >
                        <LuPlus className="w-3 h-3 text-blue-600" />
                        <span>Add Term</span>
                      </button>
                    )}
                  </div>

                  {/* Installments List */}
                  <div className="space-y-2.5">
                    {formData.installments.map((inst, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-blue-300 transition-all grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                      >
                        <div className="sm:col-span-5">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Term Name
                          </label>
                          <input
                            type="text"
                            value={inst.term_name}
                            onChange={(e) => handleInstallmentChange(index, 'term_name', e.target.value)}
                            placeholder="e.g. Quarter 1 (Apr - Jun)"
                            className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Amount (₹)
                          </label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                              ₹
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={inst.amount}
                              onChange={(e) => handleInstallmentChange(index, 'amount', e.target.value)}
                              className="w-full h-8 pl-6 pr-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Due Date
                          </label>
                          <input
                            type="date"
                            value={inst.due_date}
                            onChange={(e) => handleInstallmentChange(index, 'due_date', e.target.value)}
                            className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div className="sm:col-span-1 flex justify-end">
                          {!isPrincipal && (
                            <button
                              type="button"
                              onClick={() => handleRemoveInstallment(index)}
                              disabled={formData.installments.length <= 1}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                              title="Delete Installment Term"
                            >
                              <LuTrash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Verification Balance Bar */}
                  <div
                    className={`p-3.5 rounded-xl border flex items-center justify-between text-xs shadow-2xs ${
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
                      <div>
                        <span className="font-bold">
                          {isInstallmentsBalanced
                            ? `All ${formData.installments.length} installments match the annual total of ₹${calculatedTotalAnnual.toLocaleString()}!`
                            : `Installment Total Mismatch (Difference: ₹${Math.abs(calculatedTotalAnnual - calculatedInstallmentsSum).toLocaleString()})`}
                        </span>
                        {!isInstallmentsBalanced && (
                          <div className="text-[11px] text-rose-600 mt-0.5">
                            Installments sum to ₹{calculatedInstallmentsSum.toLocaleString()}, but total annual fee is ₹{calculatedTotalAnnual.toLocaleString()}.
                          </div>
                        )}
                      </div>
                    </div>

                    {!isInstallmentsBalanced && (
                      <button
                        type="button"
                        onClick={() => handleAutoSplit(formData.installments.length || 4)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer shrink-0 transition"
                      >
                        Auto-Balance
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModalClass(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white transition cursor-pointer"
                >
                  {isPrincipal ? 'Close' : 'Cancel'}
                </button>

                {!isPrincipal && !isAddMode && (activeModalClass.isConfigured || activeModalClass.totalAnnualFee > 0) && (
                  <button
                    type="button"
                    onClick={() => handleDeleteFeeStructure(activeModalClass.feeStructureId || activeModalClass.classId, activeModalClass.className)}
                    disabled={saving}
                    className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <LuTrash2 className="w-3.5 h-3.5" />
                    <span>Delete Structure</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {modalTab === 'installments' ? (
                  <button
                    type="button"
                    onClick={() => setModalTab('heads')}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <LuArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Fee Heads</span>
                  </button>
                ) : (
                  isInstallmentsBalanced && (
                    <button
                      type="button"
                      onClick={() => handleSaveFeeStructure(true)}
                      disabled={saving}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                    >
                      Quick Save
                    </button>
                  )
                )}

                {!isPrincipal && (
                  modalTab === 'heads' ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!isInstallmentsBalanced) {
                          handleAutoSplit(formData.installments.length || 4);
                        }
                        setModalTab('installments');
                      }}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <span>Continue to Due Dates</span>
                      <LuArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSaveFeeStructure(true)}
                      disabled={saving || !isInstallmentsBalanced}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <LuSave className="w-3.5 h-3.5" />
                      <span>{saving ? 'Saving...' : 'Save & Sync to Students'}</span>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
