import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { libraryService } from '../../services/libraryService';
import { useAuth } from '../../context/AuthContext';
import {
  LuBookOpen,
  LuPlus,
  LuSearch,
  LuFilter,
  LuArrowRightLeft,
  LuCircleAlert,
  LuCircleCheck,
  LuClock,
  LuFileText,
  LuTrash2,
  LuPencil,
  LuPrinter,
  LuDownload,
  LuX,
  LuShieldAlert,
  LuUser,
  LuLayers,
  LuQrCode,
  LuBellRing,
  LuCoins,
  LuBookmark,
  LuRotateCcw,
  LuExternalLink,
  LuBuilding2,
  LuCalendar,
  LuPhone,
  LuLoader,
  LuCheck,
  LuChevronDown,
  LuGraduationCap,
  LuIdCard,
  LuUsers,
  LuHistory,
  LuSettings,
  LuShieldCheck,
  LuLayoutDashboard,
  LuArrowRight,
  LuTrendingUp,
} from 'react-icons/lu';

export default function LibraryManagementPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Active Tab: 'dashboard' | 'books' | 'circulation' | 'overdue' | 'elibrary'
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.toLowerCase();
      if (p.includes('/circulation') || p.includes('/issues')) return 'circulation';
      if (p.includes('/overdue')) return 'overdue';
      if (p.includes('/elibrary')) return 'elibrary';
      if (p.includes('/books')) return 'books';
      if (p === '/dashboard' || p === '/library') return 'dashboard';
    }
    return 'dashboard';
  });

  // Keep activeTab in sync with route URL changes
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');

    if (path.includes('/circulation') || path.includes('/issues') || tabParam === 'circulation') {
      setActiveTab('circulation');
    } else if (path.includes('/overdue') || tabParam === 'overdue') {
      setActiveTab('overdue');
    } else if (path.includes('/elibrary') || tabParam === 'elibrary') {
      setActiveTab('elibrary');
    } else if (path.includes('/books') || tabParam === 'books') {
      setActiveTab('books');
    } else if (path === '/dashboard' || path === '/library' || tabParam === 'dashboard') {
      setActiveTab('dashboard');
    }
  }, [location.pathname, location.search]);

  // Loading & notification states
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Core Data
  const [stats, setStats] = useState({
    total_titles: 0,
    total_copies: 0,
    available_copies: 0,
    active_issues: 0,
    overdue_count: 0,
    fines_collected: 0,
    fines_pending: 0,
  });
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [issues, setIssues] = useState([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [circulationStatusFilter, setCirculationStatusFilter] = useState('all');

  // Modals state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [bookFormData, setBookFormData] = useState({
    title: '',
    author: '',
    category: 'Science & Physics',
    isbn: '',
    book_code: '',
    publisher: '',
    edition_year: '2024',
    shelf_location: '',
    total_copies: 5,
    available_copies: 5,
    status: 'Available',
    description: '',
  });

  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedBookForIssue, setSelectedBookForIssue] = useState(null);
  const [issueFormData, setIssueFormData] = useState({
    book_id: '',
    borrower_type: 'student',
    borrower_name: '',
    borrower_identifier: '',
    borrower_class: '',
    borrower_contact: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
  });

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedIssueForReturn, setSelectedIssueForReturn] = useState(null);
  const [returnFormData, setReturnFormData] = useState({
    return_date: new Date().toISOString().split('T')[0],
    fine_amount: 0,
    fine_status: 'paid',
    notes: '',
  });

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // Dedicated Delete Confirmation Modal state
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(null);
  // Shape: { book, hasActiveLoans, activeCount, isDeleting, errorMessage, force }

  // Student Picker State for Issue Book Modal
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const [studentClassFilter, setStudentClassFilter] = useState('all');
  const [isManualStudentEntry, setIsManualStudentEntry] = useState(false);

  // Dedicated Book Borrowers History & Time Period Modal State
  const [isBorrowersModalOpen, setIsBorrowersModalOpen] = useState(false);
  const [selectedBookForBorrowers, setSelectedBookForBorrowers] = useState(null);
  const [borrowersTimeFilter, setBorrowersTimeFilter] = useState('all'); // 'all', 'active', 'month', '30days', '90days', 'custom'
  const [borrowersFromDate, setBorrowersFromDate] = useState('');
  const [borrowersToDate, setBorrowersToDate] = useState('');
  const [borrowersSearchQuery, setBorrowersSearchQuery] = useState('');
  const [borrowersTypeFilter, setBorrowersTypeFilter] = useState('all'); // 'all', 'student', 'teacher', 'staff'

  // Circulation Desk Filter Extensions
  const [circulationBookFilter, setCirculationBookFilter] = useState('all');
  const [circulationDateFrom, setCirculationDateFrom] = useState('');
  const [circulationDateTo, setCirculationDateTo] = useState('');

  // Overdue Fine Rule & Circulation Policy State
  const [fineRules, setFineRules] = useState({
    fine_per_day: 10,
    grace_period_days: 1,
    max_fine_cap: 200,
    student_fine_per_day: 10,
    teacher_fine_per_day: 0,
    staff_fine_per_day: 5,
    default_loan_days_student: 14,
    default_loan_days_teacher: 30,
    default_loan_days_staff: 14,
    max_books_per_student: 3,
    max_books_per_teacher: 5,
    allow_librarian_fine_waiver: true,
    send_overdue_reminders: true,
  });
  const [isFineRulesModalOpen, setIsFineRulesModalOpen] = useState(false);
  const [savingFineRules, setSavingFineRules] = useState(false);
  const [fineRulesFormData, setFineRulesFormData] = useState({
    fine_per_day: 10,
    grace_period_days: 1,
    max_fine_cap: 200,
    student_fine_per_day: 10,
    teacher_fine_per_day: 0,
    staff_fine_per_day: 5,
    default_loan_days_student: 14,
    default_loan_days_teacher: 30,
    default_loan_days_staff: 14,
    max_books_per_student: 3,
    max_books_per_teacher: 5,
    allow_librarian_fine_waiver: true,
    send_overdue_reminders: true,
  });

  // Toast Helper
  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Dedicated loader for students if needed
  const loadStudentsList = async () => {
    setLoadingStudents(true);
    try {
      const res = await libraryService.getStudents();
      if (res && Array.isArray(res)) {
        setStudents(res);
      }
    } catch (err) {
      console.error('Failed to load students roster:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Dynamic Fine Calculator based on Admin Overdue Fine Rules
  const calculateDynamicFine = (issue, returnDateStr = null) => {
    if (!issue || !issue.due_date) return 0;
    const dueDate = new Date(issue.due_date);
    const retDate = returnDateStr ? new Date(returnDateStr) : new Date();

    if (retDate <= dueDate) return 0;

    const diffTime = Math.abs(retDate - dueDate);
    const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const graceDays = Number(fineRules.grace_period_days) || 0;

    if (overdueDays <= graceDays) return 0; // within grace period

    const chargeableDays = overdueDays - graceDays;

    let rate = Number(fineRules.fine_per_day) || 10;
    if (issue.borrower_type === 'student' && fineRules.student_fine_per_day !== undefined) {
      rate = Number(fineRules.student_fine_per_day);
    } else if (issue.borrower_type === 'teacher' && fineRules.teacher_fine_per_day !== undefined) {
      rate = Number(fineRules.teacher_fine_per_day);
    } else if (issue.borrower_type === 'staff' && fineRules.staff_fine_per_day !== undefined) {
      rate = Number(fineRules.staff_fine_per_day);
    }

    let fine = chargeableDays * rate;
    const maxCap = Number(fineRules.max_fine_cap) || 0;
    if (maxCap > 0) {
      fine = Math.min(fine, maxCap);
    }
    return Math.max(0, fine);
  };

  // Save updated Fine Rules & Policy
  const handleSaveFineRules = async (e) => {
    e.preventDefault();
    setSavingFineRules(true);
    try {
      const payload = {
        fine_per_day: Math.max(0, parseFloat(fineRulesFormData.fine_per_day) || 0),
        grace_period_days: Math.max(0, parseInt(fineRulesFormData.grace_period_days, 10) || 0),
        max_fine_cap: Math.max(0, parseFloat(fineRulesFormData.max_fine_cap) || 0),
        student_fine_per_day: Math.max(0, parseFloat(fineRulesFormData.student_fine_per_day) || 0),
        teacher_fine_per_day: Math.max(0, parseFloat(fineRulesFormData.teacher_fine_per_day) || 0),
        staff_fine_per_day: Math.max(0, parseFloat(fineRulesFormData.staff_fine_per_day) || 0),
        default_loan_days_student: Math.max(1, parseInt(fineRulesFormData.default_loan_days_student, 10) || 14),
        default_loan_days_teacher: Math.max(1, parseInt(fineRulesFormData.default_loan_days_teacher, 10) || 30),
        default_loan_days_staff: Math.max(1, parseInt(fineRulesFormData.default_loan_days_staff, 10) || 14),
        max_books_per_student: Math.max(1, parseInt(fineRulesFormData.max_books_per_student, 10) || 3),
        max_books_per_teacher: Math.max(1, parseInt(fineRulesFormData.max_books_per_teacher, 10) || 5),
        allow_librarian_fine_waiver: !!fineRulesFormData.allow_librarian_fine_waiver,
        send_overdue_reminders: !!fineRulesFormData.send_overdue_reminders,
      };

      const updated = await libraryService.updateFineRules(payload);
      if (updated) {
        setFineRules(updated);
        setFineRulesFormData(updated);
      }
      setIsFineRulesModalOpen(false);
      showToast('Overdue fine rules and library policies updated successfully');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to update fine rules', 'error');
    } finally {
      setSavingFineRules(false);
    }
  };

  // Fetch all initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, booksRes, issuesRes, studentsRes, fineRulesRes] = await Promise.all([
        libraryService.getStats(),
        libraryService.getBooks(),
        libraryService.getIssues(),
        libraryService.getStudents(),
        libraryService.getFineRules(),
      ]);

      if (statsRes) setStats(statsRes);
      if (booksRes) {
        setBooks(booksRes.books || []);
        setCategories(booksRes.categories || []);
      }
      if (issuesRes) setIssues(issuesRes);
      if (studentsRes && Array.isArray(studentsRes)) {
        setStudents(studentsRes);
      }
      if (fineRulesRes) {
        setFineRules(fineRulesRes);
        setFineRulesFormData(fineRulesRes);
      }
    } catch {
      showToast('Failed to load real-time library records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Books Catalog
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory;
      const isOutOfStock = (b.total_copies ?? 0) === 0 || (b.available_copies ?? 0) <= 0 || b.status === 'Out of Stock';
      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'available' && (b.available_copies ?? 0) > 2 && b.status !== 'Out of Stock') ||
        (selectedStatus === 'low' && (b.available_copies ?? 0) > 0 && (b.available_copies ?? 0) <= 2) ||
        (selectedStatus === 'out_of_stock' && isOutOfStock) ||
        (selectedStatus === 'issued' && (b.total_copies ?? 0) > 0 && (b.available_copies ?? 0) === 0);

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.isbn && b.isbn.toLowerCase().includes(q)) ||
        (b.book_code && b.book_code.toLowerCase().includes(q)) ||
        (b.shelf_location && b.shelf_location.toLowerCase().includes(q));

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [books, selectedCategory, selectedStatus, searchQuery]);

  // Filtered Issues Records (Circulation Desk)
  const filteredIssues = useMemo(() => {
    return issues.filter((item) => {
      const matchesStatus =
        circulationStatusFilter === 'all' || item.status === circulationStatusFilter;

      const matchesBook =
        circulationBookFilter === 'all' ||
        String(item.book_id) === String(circulationBookFilter) ||
        (item.book && String(item.book.id) === String(circulationBookFilter));

      let matchesDate = true;
      if (circulationDateFrom && item.issue_date) {
        if (new Date(item.issue_date) < new Date(circulationDateFrom)) matchesDate = false;
      }
      if (circulationDateTo && item.issue_date) {
        const to = new Date(circulationDateTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(item.issue_date) > to) matchesDate = false;
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.borrower_name.toLowerCase().includes(q) ||
        (item.borrower_identifier && item.borrower_identifier.toLowerCase().includes(q)) ||
        (item.borrower_class && item.borrower_class.toLowerCase().includes(q)) ||
        (item.book && item.book.title.toLowerCase().includes(q)) ||
        (item.book && item.book.book_code && item.book.book_code.toLowerCase().includes(q));

      return matchesStatus && matchesBook && matchesDate && matchesSearch;
    });
  }, [issues, circulationStatusFilter, circulationBookFilter, circulationDateFrom, circulationDateTo, searchQuery]);

  // Dedicated Filtered Borrowers Roster for a Selected Book & Time Period
  const filteredBookBorrowers = useMemo(() => {
    if (!selectedBookForBorrowers) return [];
    const bookId = selectedBookForBorrowers.id;
    const now = new Date();

    return issues.filter((issue) => {
      const matchesBook = issue.book_id === bookId || (issue.book && issue.book.id === bookId);
      if (!matchesBook) return false;

      if (borrowersTypeFilter !== 'all' && issue.borrower_type !== borrowersTypeFilter) {
        return false;
      }

      const q = borrowersSearchQuery.toLowerCase().trim();
      if (q) {
        const matchesSearch =
          (issue.borrower_name && issue.borrower_name.toLowerCase().includes(q)) ||
          (issue.borrower_identifier && issue.borrower_identifier.toLowerCase().includes(q)) ||
          (issue.borrower_class && issue.borrower_class.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      // Time period filter
      const issueDate = issue.issue_date ? new Date(issue.issue_date) : null;

      if (borrowersTimeFilter === 'active') {
        return issue.status === 'issued' || issue.status === 'overdue';
      } else if (borrowersTimeFilter === 'month') {
        if (!issueDate) return false;
        return issueDate.getFullYear() === now.getFullYear() && issueDate.getMonth() === now.getMonth();
      } else if (borrowersTimeFilter === '30days') {
        if (!issueDate) return false;
        const diffDays = (now - issueDate) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 30;
      } else if (borrowersTimeFilter === '90days') {
        if (!issueDate) return false;
        const diffDays = (now - issueDate) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 90;
      } else if (borrowersTimeFilter === 'custom') {
        if (borrowersFromDate && issueDate) {
          const from = new Date(borrowersFromDate);
          if (issueDate < from) return false;
        }
        if (borrowersToDate && issueDate) {
          const to = new Date(borrowersToDate);
          to.setHours(23, 59, 59, 999);
          if (issueDate > to) return false;
        }
      }

      return true;
    });
  }, [issues, selectedBookForBorrowers, borrowersTimeFilter, borrowersFromDate, borrowersToDate, borrowersSearchQuery, borrowersTypeFilter]);

  // Open Borrowers History Modal for a book
  const openBookBorrowersModal = (book) => {
    setSelectedBookForBorrowers(book);
    setBorrowersTimeFilter('all');
    setBorrowersFromDate('');
    setBorrowersToDate('');
    setBorrowersSearchQuery('');
    setBorrowersTypeFilter('all');
    setIsBorrowersModalOpen(true);
  };

  // Helper borrower counts for books
  const getBookBorrowersCount = (bookId) => {
    return issues.filter((i) => i.book_id === bookId || (i.book && i.book.id === bookId)).length;
  };

  const getBookActiveBorrowersCount = (bookId) => {
    return issues.filter((i) => (i.book_id === bookId || (i.book && i.book.id === bookId)) && (i.status === 'issued' || i.status === 'overdue')).length;
  };

  // Calculate Borrowing Duration label
  const getBorrowingDurationText = (issue) => {
    if (!issue.issue_date) return '';
    const issueDate = new Date(issue.issue_date);
    const now = new Date();

    if (issue.status === 'returned' && issue.return_date) {
      const returnDate = new Date(issue.return_date);
      const diffDays = Math.max(1, Math.round((returnDate - issueDate) / (1000 * 60 * 60 * 24)));
      return `Kept for ${diffDays} day${diffDays === 1 ? '' : 's'}`;
    }

    if (issue.due_date) {
      const dueDate = new Date(issue.due_date);
      if (now > dueDate) {
        const overdueDays = Math.max(1, Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24)));
        return `Overdue by ${overdueDays} day${overdueDays === 1 ? '' : 's'}`;
      } else {
        const daysLeft = Math.max(0, Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24)));
        const daysElapsed = Math.max(1, Math.round((now - issueDate) / (1000 * 60 * 60 * 24)));
        return `Active loan (${daysElapsed}d passed, ${daysLeft}d left)`;
      }
    }

    return 'Active loan';
  };

  // Overdue issues list
  const overdueIssues = useMemo(() => {
    return issues.filter((i) => i.status === 'overdue');
  }, [issues]);

  // Handle Add/Edit Book Save
  const handleSaveBook = async (e) => {
    e.preventDefault();
    try {
      const totalNum = isNaN(parseInt(bookFormData.total_copies, 10)) ? 0 : Math.max(0, parseInt(bookFormData.total_copies, 10));
      const availNum = isNaN(parseInt(bookFormData.available_copies, 10)) ? totalNum : Math.min(totalNum, Math.max(0, parseInt(bookFormData.available_copies, 10)));
      const finalStatus = (totalNum === 0 || availNum === 0)
        ? (bookFormData.status === 'Maintenance' ? 'Maintenance' : 'Out of Stock')
        : (bookFormData.status || (availNum <= 2 ? 'Low Stock' : 'Available'));

      const payload = {
        ...bookFormData,
        total_copies: totalNum,
        available_copies: availNum,
        status: finalStatus,
      };

      if (editingBook) {
        await libraryService.updateBook(editingBook.id, payload);
        showToast(`Book '${bookFormData.title}' updated successfully`);
      } else {
        await libraryService.createBook(payload);
        showToast(`Book '${bookFormData.title}' cataloged successfully`);
      }
      setIsBookModalOpen(false);
      setEditingBook(null);
      loadData();
    } catch (err) {
      showToast(err.message || 'Error saving book details', 'error');
    }
  };

  // Trigger Delete Prompt Modal
  const promptDeleteBook = (book) => {
    const activeCount = (book.total_copies || 0) - (book.available_copies || 0);
    setDeleteConfirmModal({
      book,
      hasActiveLoans: activeCount > 0,
      activeCount: Math.max(0, activeCount),
      force: activeCount > 0,
      isDeleting: false,
      errorMessage: null,
    });
  };

  // Perform Book Deletion
  const confirmDeleteBook = async (force = false) => {
    if (!deleteConfirmModal?.book) return;
    const book = deleteConfirmModal.book;
    setDeleteConfirmModal((prev) => ({ ...prev, isDeleting: true, errorMessage: null }));

    try {
      await libraryService.deleteBook(book.id, force);
      showToast(`Book '${book.title}' removed from library catalog`);
      setDeleteConfirmModal(null);
      // Immediately remove from local list for zero latency UI
      setBooks((prev) => prev.filter((b) => b.id !== book.id));
      loadData();
    } catch (err) {
      if (err.has_active_issues || err.message?.includes('active copy') || err.message?.includes('issued on loan')) {
        setDeleteConfirmModal((prev) => ({
          ...prev,
          hasActiveLoans: true,
          activeCount: err.active_issues_count || prev?.activeCount || 1,
          isDeleting: false,
          errorMessage: err.message,
          force: true,
        }));
      } else {
        showToast(err.message || 'Failed to delete book', 'error');
        setDeleteConfirmModal(null);
      }
    }
  };

  // Filtered students for searchable combobox
  const filteredStudents = useMemo(() => {
    return (students || []).filter((stu) => {
      const className = stu.class_name || stu.school_class?.name || '';
      if (studentClassFilter && studentClassFilter !== 'all') {
        if (!className.toLowerCase().includes(studentClassFilter.toLowerCase())) {
          return false;
        }
      }

      if (!studentSearchQuery) return true;
      const q = studentSearchQuery.toLowerCase().trim();
      const fullName = (stu.full_name || `${stu.first_name || ''} ${stu.last_name || ''}`).toLowerCase();
      const admNo = (stu.admission_number || '').toLowerCase();
      const rollNo = String(stu.roll_number || '').toLowerCase();
      const divName = (stu.division_name || stu.section?.name || '').toLowerCase();

      return (
        fullName.includes(q) ||
        admNo.includes(q) ||
        rollNo.includes(q) ||
        className.toLowerCase().includes(q) ||
        divName.includes(q)
      );
    });
  }, [students, studentSearchQuery, studentClassFilter]);

  const uniqueStudentClasses = useMemo(() => {
    const list = (students || []).map((s) => s.class_name || s.school_class?.name).filter(Boolean);
    return ['all', ...Array.from(new Set(list))];
  }, [students]);

  const handleSelectStudent = (stu) => {
    setSelectedStudent(stu);
    setIsStudentDropdownOpen(false);
    const fullName = stu.full_name || `${stu.first_name || ''} ${stu.last_name || ''}`.trim();
    const admNo = stu.admission_number || '';
    const className = stu.class_name || stu.school_class?.name || 'Class';
    const divName = stu.division_name || stu.section?.name || 'Section';
    const rollNo = stu.roll_number ? ` (Roll #${stu.roll_number})` : '';
    const formattedClass = `${className} - ${divName}${rollNo}`;
    const phone = stu.guardian_phone || stu.emergency_contact || '';

    setIssueFormData((prev) => ({
      ...prev,
      borrower_name: fullName,
      borrower_identifier: admNo,
      borrower_class: formattedClass,
      borrower_contact: phone,
    }));
  };

  const handleClearStudent = () => {
    setSelectedStudent(null);
    setStudentSearchQuery('');
    setIssueFormData((prev) => ({
      ...prev,
      borrower_name: '',
      borrower_identifier: '',
      borrower_class: '',
      borrower_contact: '',
    }));
  };

  // Open Issue Modal for a specific book
  const openIssueModal = (book = null) => {
    setSelectedBookForIssue(book);
    setSelectedStudent(null);
    setStudentSearchQuery('');
    setIsStudentDropdownOpen(false);
    setStudentClassFilter('all');
    setIsManualStudentEntry(false);
    const loanDays = Number(fineRules.default_loan_days_student) || 14;
    setIssueFormData({
      book_id: book ? book.id : (books.find((b) => b.available_copies > 0)?.id || ''),
      borrower_type: 'student',
      borrower_name: '',
      borrower_identifier: '',
      borrower_class: '',
      borrower_contact: '',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + loanDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
    });
    setIsIssueModalOpen(true);
    if (!students || students.length === 0) {
      loadStudentsList();
    }
  };

  // Handle Issue Submit
  const handleIssueBook = async (e) => {
    e.preventDefault();
    try {
      const res = await libraryService.issueBook(issueFormData);
      showToast(`Book issued successfully to ${issueFormData.borrower_name}`);
      setIsIssueModalOpen(false);
      loadData();

      // Offer to view receipt
      if (res) {
        const fullBook = books.find((b) => b.id === Number(issueFormData.book_id));
        setReceiptData({
          ...res,
          book: fullBook || res.book,
        });
        setIsReceiptModalOpen(true);
      }
    } catch (err) {
      showToast(err.message || 'Failed to issue book', 'error');
    }
  };

  // Open Return Modal
  const openReturnModal = (issue) => {
    setSelectedIssueForReturn(issue);

    const todayStr = new Date().toISOString().split('T')[0];
    const autoFine = calculateDynamicFine(issue, todayStr);

    setReturnFormData({
      return_date: todayStr,
      fine_amount: issue.fine_amount > 0 ? issue.fine_amount : autoFine,
      fine_status: autoFine > 0 ? 'paid' : 'waived',
      notes: '',
    });
    setIsReturnModalOpen(true);
  };

  // Handle Return Submit
  const handleReturnBook = async (e) => {
    e.preventDefault();
    try {
      await libraryService.returnBook(selectedIssueForReturn.id, returnFormData);
      showToast(`Book marked as returned! Inventory updated.`);
      setIsReturnModalOpen(false);
      setSelectedIssueForReturn(null);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to record book return', 'error');
    }
  };

  // Quick reminder toast
  const handleSendReminder = (issue) => {
    showToast(`Return reminder alert sent to ${issue.borrower_name} (${issue.borrower_contact || 'Registered Email'})`);
  };

  // Export Catalog to CSV
  const handleExportCSV = () => {
    const headers = ['Book Code', 'Title', 'Author', 'Category', 'ISBN', 'Total Copies', 'Available Copies', 'Shelf Location', 'Status'];
    const rows = books.map((b) => [
      `"${b.book_code || ''}"`,
      `"${b.title.replace(/"/g, '""')}"`,
      `"${b.author.replace(/"/g, '""')}"`,
      `"${b.category || ''}"`,
      `"${b.isbn || ''}"`,
      b.total_copies,
      b.available_copies,
      `"${b.shelf_location || ''}"`,
      `"${b.status || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Arch_Campus_Library_Catalog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Catalog exported to CSV file');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold border transition-all animate-bounce-subtle ${
            toastMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <LuCircleAlert className="w-4 h-4 text-rose-500" />
          ) : (
            <LuCircleCheck className="w-4 h-4 text-emerald-500" />
          )}
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Page Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-primary-500/20 shrink-0">
            <LuBookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-xl font-bold text-slate-800 leading-tight">
                {t('library.title', 'Central Library Management')}
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-primary-50 text-primary-700 font-bold text-[10px] sm:text-[11px] border border-primary-200">
                Resource Center
              </span>
              {loading && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] sm:text-[11px] font-bold border border-blue-200 animate-pulse">
                  <LuLoader className="w-3 h-3 animate-spin text-blue-600" />
                  Loading database records...
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Circulation desk, catalog accession, book loans & overdue fine tracking
            </p>
          </div>
        </div>

        {/* Quick Primary Actions */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <button
            onClick={() => openIssueModal()}
            disabled={loading}
            className={`px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 ${
              loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <LuArrowRightLeft className="w-4 h-4" />
            <span>{t('library.issue_book', 'Issue Book')}</span>
          </button>
          <button
            onClick={() => {
              setEditingBook(null);
              setBookFormData({
                title: '',
                author: '',
                category: 'Science & Physics',
                isbn: '',
                book_code: '',
                publisher: '',
                edition_year: '2024',
                shelf_location: '',
                total_copies: 5,
                available_copies: 5,
                status: 'Available',
                description: '',
              });
              setIsBookModalOpen(true);
            }}
            disabled={loading}
            className={`px-4 py-2.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all flex items-center gap-2 ${
              loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <LuPlus className="w-4 h-4" />
            <span>{t('library.add_book', 'Add New Book')}</span>
          </button>
          <button
            onClick={() => {
              setFineRulesFormData({ ...fineRules });
              setIsFineRulesModalOpen(true);
            }}
            disabled={loading}
            className={`px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all ${
              loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            }`}
            title="Manage Overdue Fine Rules, Daily Rates & Grace Period"
          >
            <LuSettings className="w-4 h-4 text-indigo-600" />
            <span>Fine Rules</span>
          </button>
          <button
            onClick={handleExportCSV}
            disabled={loading}
            className={`px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all ${
              loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            }`}
            title="Export Catalog to CSV"
          >
            <LuDownload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            title="Refresh library catalog"
            className={`p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors ${
              loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <LuRotateCcw className={`w-4 h-4 ${loading ? 'animate-spin text-primary-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Database Loader State */}
      {loading ? (
        <div className="space-y-4 animate-fade-in">
          {/* Animated Loader Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 text-center shadow-xs flex flex-col items-center justify-center">
            <div className="relative mb-5 inline-flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 via-primary-700 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-primary-500/25">
                <LuBookOpen className="w-8 h-8 animate-pulse text-amber-300" />
              </div>
              <div className="absolute -inset-2.5 rounded-3xl border-2 border-primary-500/30 animate-spin border-t-primary-600" />
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Loading Central Library Records...
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
              Retrieving real-time books catalog, circulation desk ledger, active loans, and overdue statistics from database.
            </p>

            <div className="w-64 max-w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mx-auto mt-4 border border-slate-200/70">
              <div className="h-full bg-gradient-to-r from-primary-500 via-indigo-500 to-primary-600 rounded-full animate-pulse w-3/4 mx-auto" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-600">
                <LuLoader className="w-3 h-3 animate-spin text-primary-600" />
                Querying Database
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-600">
                <LuLayers className="w-3 h-3 text-indigo-500" />
                Accession Books Roster
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-600">
                <LuClock className="w-3 h-3 text-amber-500" />
                Circulation Status
              </span>
            </div>
          </div>

          {/* Skeleton Shimmer Placeholders for 4 KPI Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-3.5 bg-slate-200 rounded-md w-24" />
                  <div className="w-9 h-9 rounded-xl bg-slate-100" />
                </div>
                <div className="mt-3 space-y-2">
                  <div className="h-7 bg-slate-200 rounded-md w-16" />
                  <div className="h-3 bg-slate-100 rounded-md w-28" />
                </div>
              </div>
            ))}
          </div>

          {/* Skeleton Content Table Placeholder */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs animate-pulse space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="h-4 bg-slate-200 rounded w-48" />
              <div className="h-8 bg-slate-100 rounded-xl w-32" />
            </div>
            <div className="space-y-2.5 pt-2">
              {[1, 2, 3, 4, 5].map((row) => (
                <div key={row} className="h-10 bg-slate-50 rounded-xl flex items-center px-4 gap-4">
                  <div className="h-3 bg-slate-200 rounded w-1/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/6" />
                  <div className="h-3 bg-slate-200 rounded w-1/6" />
                  <div className="h-3 bg-slate-200 rounded w-1/5" />
                  <div className="h-3 bg-slate-200 rounded w-12 ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cataloged */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Books Catalog</span>
            <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <LuBookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-800">{stats.total_copies || 0}</div>
            <div className="text-[11px] font-medium text-slate-500 mt-1 flex items-center justify-between">
              <span>
                <strong className="text-primary-600">{stats.total_titles || 0}</strong> unique titles
              </span>
              {stats.out_of_stock_count > 0 && (
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                  {stats.out_of_stock_count} No Stock
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Available in Racks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available on Racks</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <LuCircleCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600">{stats.available_copies || 0}</div>
            <div className="text-[11px] font-medium text-slate-500 mt-1">
              Ready for immediate loan issuance
            </div>
          </div>
        </div>

        {/* Active Issued Books */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Loans</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <LuArrowRightLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-blue-600">{stats.active_issues || 0}</div>
            <div className="text-[11px] font-medium text-slate-500 mt-1">
              Currently with students & teachers
            </div>
          </div>
        </div>

        {/* Overdue & Fines */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overdue Alerts</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <LuCircleAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-black text-rose-600">{stats.overdue_count || 0}</div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Pending Fines</span>
              <span className="text-xs font-extrabold text-amber-600 font-mono">₹{stats.fines_pending || 0}</span>
            </div>
          </div>
          <div className="text-[11px] font-medium text-slate-500 mt-1">
            ₹{stats.fines_collected || 0} fines collected to date
          </div>
        </div>
      </div>

      {/* Active Section Header & Search Toolbar (Only for sub-pages that need search/header) */}
      {activeTab !== 'dashboard' && (
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold shrink-0">
              {activeTab === 'books' && <LuBookOpen className="w-4 h-4" />}
              {activeTab === 'circulation' && <LuArrowRightLeft className="w-4 h-4" />}
              {activeTab === 'overdue' && <LuCircleAlert className="w-4 h-4 text-rose-600" />}
              {activeTab === 'elibrary' && <LuLayers className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
                {activeTab === 'books' && 'Books Catalog & Inventory'}
                {activeTab === 'circulation' && 'Circulation Desk & Book Loans'}
                {activeTab === 'overdue' && 'Overdue Loans & Fine Tracker'}
                {activeTab === 'elibrary' && 'Digital E-Library & Online Resources'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {activeTab === 'books' && `${books.length} unique titles registered in catalog`}
                {activeTab === 'circulation' && `${issues.length} total loan records tracked`}
                {activeTab === 'overdue' && `${stats.overdue_count || 0} loans requiring overdue action`}
                {activeTab === 'elibrary' && 'Curated open-access digital repositories and journals'}
              </p>
            </div>
          </div>

          {/* Global Search Box (for searchable views) */}
          {(activeTab === 'books' || activeTab === 'circulation' || activeTab === 'overdue') && (
            <div className="relative w-full sm:w-80">
              <LuSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'books' ? 'Search books, authors, ISBN...' : 'Search borrower, class, book...'}
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 focus:bg-white transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <LuX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 0: LIBRARY DASHBOARD SECTION                               */}
      {/* ============================================================== */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4 animate-fade-in">
          {/* Overdue Action Alert Banner if overdues exist */}
          {stats.overdue_count > 0 && (
            <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <LuCircleAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-rose-900">
                    {stats.overdue_count} Overdue Loan{stats.overdue_count > 1 ? 's' : ''} Require Attention
                  </h4>
                  <p className="text-[11px] text-rose-600">
                    ₹{stats.fines_pending || 0} accumulated in pending overdue fines.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/library/overdue')}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
              >
                View Overdues →
              </button>
            </div>
          )}

          {/* 3. Live Activity & Overdue Action Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Circulation Activity */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <LuArrowRightLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                        Recent Circulation Activity
                      </h4>
                      <p className="text-[11px] text-slate-400">Latest loan issues & returns</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/library/circulation')}
                    className="text-xs font-bold text-primary-600 hover:text-primary-800 cursor-pointer"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {issues.slice(0, 5).map((issue) => (
                    <div
                      key={issue.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">
                          {issue.borrower_name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {issue.book?.title || `Book #${issue.book_id}`}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            issue.status === 'Returned'
                              ? 'bg-emerald-100 text-emerald-800'
                              : issue.status === 'Overdue'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {issue.status}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {issue.issue_date}
                        </p>
                      </div>
                    </div>
                  ))}

                  {issues.length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No circulation activity recorded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Collection Health by Discipline */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <LuBookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                        Collection by Discipline
                      </h4>
                      <p className="text-[11px] text-slate-400">Inventory balance across subjects</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/library/books')}
                    className="text-xs font-bold text-primary-600 hover:text-primary-800 cursor-pointer"
                  >
                    View Catalog →
                  </button>
                </div>

                <div className="space-y-3">
                  {categories.slice(0, 5).map((cat) => {
                    const catBooks = books.filter((b) => b.category === cat);
                    const catCopies = catBooks.reduce((sum, b) => sum + (b.total_copies || 0), 0);
                    const catAvail = catBooks.reduce((sum, b) => sum + (b.available_copies || 0), 0);
                    const pct = catCopies > 0 ? Math.round((catAvail / catCopies) * 100) : 100;

                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700">{cat}</span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            <strong className="text-slate-700 font-bold">{catAvail}</strong>/{catCopies} avail ({catBooks.length} titles)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct > 50 ? 'bg-emerald-500' : pct > 20 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: BOOKS CATALOG & INVENTORY                               */}
      {/* ============================================================== */}
      {activeTab === 'books' && (
        <div className="space-y-4">
          {/* Unified Filter Toolbar Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3 sm:p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Stock Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
                <LuBookmark className="w-3.5 h-3.5 text-slate-400" />
                Stock:
              </span>
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs ${
                  selectedStatus === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                All ({books.length})
              </button>
              <button
                onClick={() => setSelectedStatus('available')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1.5 ${
                  selectedStatus === 'available'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>In Stock ({books.filter((b) => (b.available_copies ?? 0) > 2 && b.status !== 'Out of Stock').length})</span>
              </button>
              <button
                onClick={() => setSelectedStatus('low')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1.5 ${
                  selectedStatus === 'low'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/60'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Low Stock ({books.filter((b) => (b.available_copies ?? 0) > 0 && (b.available_copies ?? 0) <= 2).length})</span>
              </button>
              <button
                onClick={() => setSelectedStatus('out_of_stock')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1.5 ${
                  selectedStatus === 'out_of_stock'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200/60'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span>No Stock ({books.filter((b) => (b.total_copies ?? 0) === 0 || (b.available_copies ?? 0) <= 0 || b.status === 'Out of Stock').length})</span>
              </button>
              <button
                onClick={() => setSelectedStatus('issued')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1.5 ${
                  selectedStatus === 'issued'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/60'
                }`}
              >
                <span>All Issued ({books.filter((b) => (b.total_copies ?? 0) > 0 && (b.available_copies ?? 0) === 0).length})</span>
              </button>
            </div>

            {/* Discipline Dropdown & Reset */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative min-w-[210px] sm:w-60">
                <LuFilter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-8 pr-8 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white cursor-pointer transition-colors"
                >
                  <option value="all">All Disciplines ({categories.length})</option>
                  {categories.map((cat) => {
                    const count = books.filter((b) => b.category === cat).length;
                    return (
                      <option key={cat} value={cat}>
                        {cat} {count > 0 ? `(${count})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {(selectedCategory !== 'all' || selectedStatus !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedStatus('all');
                    setSearchQuery('');
                  }}
                  className="px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                  title="Reset all filters"
                >
                  <LuRotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Books Table View */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Book Title & Details</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Inventory Copies</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredBooks.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400">
                        <LuBookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="font-medium">No matching books found in catalog</p>
                        <p className="text-[11px] mt-1 text-slate-400">Try adjusting your search query or category filter</p>
                      </td>
                    </tr>
                  ) : (
                    filteredBooks.map((book) => {
                      const availRatio = book.total_copies > 0 ? (book.available_copies / book.total_copies) * 100 : 0;
                      return (
                        <tr key={book.id} className="hover:bg-slate-50/60 transition-colors group">
                          {/* Book Title & Author */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-11 rounded-md bg-gradient-to-br from-primary-500 to-primary-700 text-white flex flex-col items-center justify-center font-bold text-xs shadow-xs shrink-0 pt-0.5">
                                <LuBookOpen className="w-4 h-4 opacity-80" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-slate-800 group-hover:text-primary-600 transition-colors">
                                  {book.title}
                                </h4>
                                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">by {book.author}</p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                                    {book.book_code || `BK-${book.id}`}
                                  </span>
                                  {book.isbn && (
                                    <span className="text-[10px] font-mono text-slate-400">
                                      ISBN: {book.isbn}
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openBookBorrowersModal(book);
                                  }}
                                  className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200/70 transition-all cursor-pointer"
                                  title="View students roster who took this book with specific time periods"
                                >
                                  <LuHistory className="w-3 h-3 text-indigo-600" />
                                  <span>{getBookBorrowersCount(book.id)} Borrowers</span>
                                  {getBookActiveBorrowersCount(book.id) > 0 ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-bold">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      {getBookActiveBorrowersCount(book.id)} active
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-500 font-medium">history</span>
                                  )}
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* Category Badge */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary-50 text-primary-700 border border-primary-200/80">
                              {book.category}
                            </span>
                            {book.publisher && (
                              <p className="text-[10px] text-slate-400 mt-1 truncate max-w-[130px]">
                                {book.publisher} ({book.edition_year})
                              </p>
                            )}
                          </td>

                          {/* Shelf Location */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                              <LuBookmark className="w-3.5 h-3.5 text-slate-400" />
                              <span>{book.shelf_location || 'General Stacks'}</span>
                            </div>
                          </td>

                          {/* Copies Available / Meter */}
                          <td className="py-3.5 px-4 whitespace-nowrap min-w-[150px]">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-bold text-slate-800">
                                <span className={(book.available_copies ?? 0) > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                                  {book.available_copies ?? 0}
                                </span>{' '}
                                / {book.total_copies ?? 0}
                              </span>
                              <span className={`text-[10px] font-semibold ${(book.total_copies ?? 0) === 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                                {(book.total_copies ?? 0) === 0 ? 'no inventory' : 'available'}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  (book.total_copies ?? 0) === 0
                                    ? 'bg-rose-400 w-full'
                                    : availRatio > 50
                                    ? 'bg-emerald-500'
                                    : availRatio > 20
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: (book.total_copies ?? 0) === 0 ? '100%' : `${availRatio}%` }}
                              />
                            </div>
                          </td>

                          {/* Status Pill */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {(book.total_copies ?? 0) === 0 || book.status === 'Out of Stock' ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 inline-flex items-center gap-1.5 shadow-xs">
                                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                                No Stock (0)
                              </span>
                            ) : (book.available_copies ?? 0) === 0 ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                All Issued
                              </span>
                            ) : book.status === 'Maintenance' ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                Maintenance
                              </span>
                            ) : (book.available_copies ?? 0) <= 2 ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Low Stock
                              </span>
                            ) : (book.available_copies ?? 0) === 0 ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                In Stock
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                In Stock
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openBookBorrowersModal(book)}
                                className="py-1 px-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                                title="View students roster & time periods who took this book"
                              >
                                <LuUsers className="w-3.5 h-3.5" />
                                <span>Borrowers</span>
                                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-extrabold group-hover:bg-white/20 group-hover:text-white">
                                  {getBookBorrowersCount(book.id)}
                                </span>
                              </button>
                              <button
                                onClick={() => openIssueModal(book)}
                                disabled={(book.available_copies ?? 0) === 0 || (book.total_copies ?? 0) === 0 || book.status === 'Out of Stock'}
                                className="py-1 px-2.5 rounded-lg bg-primary-50 hover:bg-primary-600 text-primary-700 hover:text-white font-bold text-xs transition-colors flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                title={
                                  (book.total_copies ?? 0) === 0 || book.status === 'Out of Stock'
                                    ? 'Book has 0 stock - Add copies to issue'
                                    : (book.available_copies ?? 0) === 0
                                    ? 'All copies currently issued'
                                    : 'Issue this book'
                                }
                              >
                                <LuArrowRightLeft className="w-3.5 h-3.5" />
                                <span>Issue</span>
                              </button>
                              <button
                                onClick={() => {
                                  setEditingBook(book);
                                  setBookFormData({
                                    title: book.title,
                                    author: book.author,
                                    category: book.category,
                                    isbn: book.isbn || '',
                                    book_code: book.book_code || '',
                                    publisher: book.publisher || '',
                                    edition_year: book.edition_year || '',
                                    shelf_location: book.shelf_location || '',
                                    total_copies: book.total_copies ?? 0,
                                    available_copies: book.available_copies ?? 0,
                                    status: book.status || ((book.available_copies ?? 0) <= 0 ? 'Out of Stock' : ((book.available_copies ?? 0) <= 2 ? 'Low Stock' : 'Available')),
                                    description: book.description || '',
                                  });
                                  setIsBookModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Edit Book"
                              >
                                <LuPencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => promptDeleteBook(book)}
                                className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete / Retire Book"
                              >
                                <LuTrash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: CIRCULATION DESK (ISSUES & RETURNS)                     */}
      {/* ============================================================== */}
      {activeTab === 'circulation' && (
        <div className="space-y-4">
          {/* Status, Book & Specific Time Period Filters */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setCirculationStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    circulationStatusFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Loans ({issues.length})
                </button>
                <button
                  onClick={() => setCirculationStatusFilter('issued')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    circulationStatusFilter === 'issued'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Active Issued ({issues.filter((i) => i.status === 'issued').length})
                </button>
                <button
                  onClick={() => setCirculationStatusFilter('overdue')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    circulationStatusFilter === 'overdue'
                      ? 'bg-white text-rose-700 shadow-xs'
                      : 'text-slate-600 hover:text-rose-700'
                  }`}
                >
                  Overdue ({issues.filter((i) => i.status === 'overdue').length})
                </button>
                <button
                  onClick={() => setCirculationStatusFilter('returned')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    circulationStatusFilter === 'returned'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Returned ({issues.filter((i) => i.status === 'returned').length})
                </button>
              </div>

              <button
                onClick={() => openIssueModal()}
                className="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <LuArrowRightLeft className="w-3.5 h-3.5" />
                <span>Issue New Book</span>
              </button>
            </div>

            {/* Particular Book & Specific Time Period Filter */}
            <div className="flex items-center gap-3 flex-wrap pt-2.5 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-1.5">
                <label className="text-slate-600 font-bold whitespace-nowrap flex items-center gap-1">
                  <LuBookOpen className="w-3.5 h-3.5 text-primary-600" />
                  <span>Particular Book:</span>
                </label>
                <select
                  value={circulationBookFilter}
                  onChange={(e) => setCirculationBookFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 max-w-[260px] cursor-pointer"
                >
                  <option value="all">All Books Cataloged</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.book_code || `BK-${b.id}`})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <label className="text-slate-600 font-bold whitespace-nowrap flex items-center gap-1">
                  <LuCalendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>From Date:</span>
                </label>
                <input
                  type="date"
                  value={circulationDateFrom}
                  onChange={(e) => setCirculationDateFrom(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <label className="text-slate-600 font-bold whitespace-nowrap flex items-center gap-1">
                  <LuCalendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>To Date:</span>
                </label>
                <input
                  type="date"
                  value={circulationDateTo}
                  onChange={(e) => setCirculationDateTo(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {(circulationBookFilter !== 'all' || circulationDateFrom || circulationDateTo) && (
                <button
                  onClick={() => {
                    setCirculationBookFilter('all');
                    setCirculationDateFrom('');
                    setCirculationDateTo('');
                  }}
                  className="px-2.5 py-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              )}

              <span className="text-[11px] text-slate-400 ml-auto font-medium">
                Showing {filteredIssues.length} of {issues.length} records
              </span>
            </div>
          </div>

          {/* Issues Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Borrower Info</th>
                    <th className="py-3 px-4">Book Title & Code</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Status & Fine</th>
                    <th className="py-3 px-4 text-right">Circulation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredIssues.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400">
                        <LuArrowRightLeft className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="font-medium">No circulation loan records found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredIssues.map((issue) => {
                      const isOverdue = issue.status === 'overdue';
                      const isReturned = issue.status === 'returned';
                      return (
                        <tr key={issue.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Borrower Name & Class */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs uppercase border border-slate-200">
                                {issue.borrower_name.charAt(0)}
                              </div>
                              <div>
                                <h5 className="font-bold text-slate-800">{issue.borrower_name}</h5>
                                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                                  <span className="capitalize text-indigo-600 font-semibold">{issue.borrower_type}</span>
                                  {issue.borrower_class && <span>• {issue.borrower_class}</span>}
                                </div>
                                {issue.borrower_identifier && (
                                  <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
                                    ID: {issue.borrower_identifier}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Book info */}
                          <td className="py-3.5 px-4">
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 truncate max-w-xs">
                                {issue.book?.title || 'Unknown Title'}
                              </p>
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                {issue.book?.book_code || `BK-${issue.book_id}`}
                              </span>
                            </div>
                          </td>

                          {/* Issue Date */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 font-medium">
                            {issue.issue_date
                              ? new Date(issue.issue_date).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : 'N/A'}
                          </td>

                          {/* Due Date & relative countdown */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <LuClock className={`w-3.5 h-3.5 ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`} />
                              <span className={`font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-700'}`}>
                                {issue.due_date
                                  ? new Date(issue.due_date).toLocaleDateString('en-GB', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                    })
                                  : 'N/A'}
                              </span>
                            </div>
                            {isReturned ? (
                              <span className="text-[10px] text-emerald-600 font-sans font-semibold block mt-0.5">
                                Returned on {issue.return_date ? new Date(issue.return_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                              </span>
                            ) : isOverdue ? (
                              <span className="text-[10px] text-rose-600 font-sans font-bold block mt-0.5 animate-pulse">
                                Overdue Warning
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                                Regular active loan
                              </span>
                            )}
                          </td>

                          {/* Status & Fine */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {isReturned ? (
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Returned
                                </span>
                                {issue.fine_amount > 0 && (
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    Fee: ₹{issue.fine_amount} ({issue.fine_status})
                                  </span>
                                )}
                              </div>
                            ) : isOverdue ? (
                              <div>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  Overdue
                                </span>
                                <div className="text-[11px] font-bold text-rose-600 font-mono mt-0.5">
                                  Fine: ₹{issue.fine_amount || issue.calculated_fine || 0}
                                </div>
                              </div>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                On Loan
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isReturned && (
                                <button
                                  onClick={() => openReturnModal(issue)}
                                  className="py-1 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Process Return"
                                >
                                  <LuRotateCcw className="w-3.5 h-3.5" />
                                  <span>Return Book</span>
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setReceiptData(issue);
                                  setIsReceiptModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Print Library Slip / Receipt"
                              >
                                <LuPrinter className="w-3.5 h-3.5" />
                              </button>

                              {!isReturned && (
                                <button
                                  onClick={() => handleSendReminder(issue)}
                                  className="p-1.5 rounded-lg text-amber-600 hover:text-amber-800 hover:bg-amber-50 transition-colors cursor-pointer"
                                  title="Send Overdue Reminder Alert"
                                >
                                  <LuBellRing className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: OVERDUE TRACKER & FINE COLLECTION                       */}
      {/* ============================================================== */}
      {activeTab === 'overdue' && (
        <div className="space-y-4">
          {/* Overdue Banner Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                <LuCircleAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-amber-900 text-sm">
                    Dynamic Overdue Fine Rule: ₹{fineRules.student_fine_per_day || fineRules.fine_per_day} / Day
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 text-amber-900 border border-amber-300">
                    Grace: {fineRules.grace_period_days} Day{fineRules.grace_period_days === 1 ? '' : 's'}
                  </span>
                  {fineRules.max_fine_cap > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 text-amber-900 border border-amber-300">
                      Cap: ₹{fineRules.max_fine_cap}
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-800 mt-0.5">
                  Fines calculate dynamically based on borrower rates (Students: ₹{fineRules.student_fine_per_day}/d, Teachers: {fineRules.teacher_fine_per_day > 0 ? `₹${fineRules.teacher_fine_per_day}/d` : 'Exempt'}, Staff: ₹{fineRules.staff_fine_per_day}/d) after {fineRules.grace_period_days} day(s) grace period.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFineRulesFormData({ ...fineRules });
                  setIsFineRulesModalOpen(true);
                }}
                className="py-2 px-3 bg-white hover:bg-amber-100/70 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <LuSettings className="w-3.5 h-3.5 text-amber-800" />
                <span>Configure Fine Rules</span>
              </button>
              <button
                onClick={() => showToast('Bulk SMS & WhatsApp reminders dispatched to all overdue borrowers')}
                className="py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <LuBellRing className="w-3.5 h-3.5" />
                <span>Notify All ({overdueIssues.length})</span>
              </button>
            </div>
          </div>

          {/* Overdue Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Borrower Details</th>
                    <th className="py-3 px-4">Overdue Book</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Days Overdue</th>
                    <th className="py-3 px-4">Calculated Fine</th>
                    <th className="py-3 px-4 text-right">Settlement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {overdueIssues.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400">
                        <LuCircleCheck className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                        <p className="font-bold text-slate-700">No overdue books at this time!</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">All loaned books are within their valid borrowing periods.</p>
                      </td>
                    </tr>
                  ) : (
                    overdueIssues.map((issue) => {
                      const today = new Date();
                      const dueDate = new Date(issue.due_date);
                      const diffTime = Math.max(0, today - dueDate);
                      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      const fine = issue.fine_amount > 0 ? issue.fine_amount : calculateDynamicFine(issue);

                      return (
                        <tr key={issue.id} className="hover:bg-rose-50/30 transition-colors">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-bold text-slate-800">{issue.borrower_name}</div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              {issue.borrower_class || issue.borrower_type} • ID: {issue.borrower_identifier || 'N/A'}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              Contact: {issue.borrower_contact || 'N/A'}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {issue.book?.title || 'Unknown Book'}
                            <span className="block text-[10px] font-mono text-slate-400 font-normal">
                              {issue.book?.book_code}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-rose-600">
                            {issue.due_date
                              ? new Date(issue.due_date).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : 'N/A'}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                              {days} Days Late
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap font-mono font-extrabold text-rose-700 text-sm">
                            ₹{fine}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => openReturnModal(issue)}
                              className="py-1 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
                            >
                              Collect & Return
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: DIGITAL E-LIBRARY RESOURCES                             */}
      {/* ============================================================== */}
      {activeTab === 'elibrary' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-primary-50 border border-indigo-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3">
                <LuFileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Digital Textbooks & NCERT Guides</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Direct access to high-resolution e-textbooks across Class 1 to 12 for CBSE and ICSE boards.
              </p>
              <button
                onClick={() => showToast('Redirecting to digital repository')}
                className="mt-4 text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Browse E-Textbooks</span>
                <LuExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center mb-3">
                <LuLayers className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Question Banks & Past Board Papers</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Over 1,200 curated sample mock exam question papers with model answer sheets and marking schemes.
              </p>
              <button
                onClick={() => showToast('Downloading examination past paper archive')}
                className="mt-4 text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Download Question Papers</span>
                <LuExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-3">
                <LuBookOpen className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Research Journals & Science Periodicals</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Monthly subscriptions to National Geographic Kids, Science Reporter, and Olympiad guides.
              </p>
              <button
                onClick={() => showToast('Opening periodicals shelf')}
                className="mt-4 text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Monthly Issues</span>
                <LuExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: ADD / EDIT BOOK IN CATALOG                            */}
      {/* ============================================================== */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-scale-up">
            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <LuBookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingBook ? 'Edit Book Details' : 'Catalog New Book'}
                  </h3>
                  <p className="text-primary-100 text-xs">Add or modify library accession records</p>
                </div>
              </div>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  value={bookFormData.title}
                  onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                  placeholder="e.g. Higher Algebra & Analytical Geometry"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Author / Editor *</label>
                  <input
                    type="text"
                    required
                    value={bookFormData.author}
                    onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                    placeholder="e.g. Dr. H. C. Verma"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category / Discipline *</label>
                  <select
                    value={bookFormData.category}
                    onChange={(e) => setBookFormData({ ...bookFormData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none bg-white font-medium"
                  >
                    <option value="Science & Physics">Science & Physics</option>
                    <option value="Science & Chemistry">Science & Chemistry</option>
                    <option value="Science & Biology">Science & Biology</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="World Literature">World Literature</option>
                    <option value="History & Social Studies">History & Social Studies</option>
                    <option value="Historical Biography">Historical Biography</option>
                    <option value="Reference & Dictionaries">Reference & Dictionaries</option>
                    <option value="Children & Fiction">Children & Fiction</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Book Code / Accession No.</label>
                  <input
                    type="text"
                    value={bookFormData.book_code}
                    onChange={(e) => setBookFormData({ ...bookFormData, book_code: e.target.value })}
                    placeholder="Auto-generated if blank"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ISBN Number</label>
                  <input
                    type="text"
                    value={bookFormData.isbn}
                    onChange={(e) => setBookFormData({ ...bookFormData, isbn: e.target.value })}
                    placeholder="e.g. 978-8177091878"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Shelf Location / Rack *</label>
                <input
                  type="text"
                  value={bookFormData.shelf_location}
                  onChange={(e) => setBookFormData({ ...bookFormData, shelf_location: e.target.value })}
                  placeholder="e.g. Rack B-3, Row 2"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Dedicated Inventory & Stock Controls */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <LuBookmark className="w-3.5 h-3.5 text-indigo-600" />
                    Inventory & Stock Controls
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setBookFormData((prev) => ({
                        ...prev,
                        total_copies: 0,
                        available_copies: 0,
                        status: 'Out of Stock',
                      }));
                    }}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors border flex items-center gap-1.5 cursor-pointer ${
                      (bookFormData.total_copies ?? 0) === 0 || bookFormData.status === 'Out of Stock'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-white hover:bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Set as No Stock (0)</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Total Copies *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      required
                      value={bookFormData.total_copies}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0);
                        const prevAvail = bookFormData.available_copies ?? val;
                        const newAvail = prevAvail > val ? val : (val === 0 ? 0 : prevAvail);
                        const newStatus = val === 0 ? 'Out of Stock' : (newAvail <= 0 ? 'Out of Stock' : (newAvail <= 2 ? 'Low Stock' : 'Available'));
                        setBookFormData({
                          ...bookFormData,
                          total_copies: val,
                          available_copies: newAvail,
                          status: newStatus,
                        });
                      }}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none font-bold bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Available Copies
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={bookFormData.total_copies}
                      value={bookFormData.available_copies ?? bookFormData.total_copies}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0);
                        const bounded = Math.min(val, bookFormData.total_copies ?? val);
                        const newStatus = bounded <= 0 ? 'Out of Stock' : (bounded <= 2 ? 'Low Stock' : 'Available');
                        setBookFormData({
                          ...bookFormData,
                          available_copies: bounded,
                          status: newStatus,
                        });
                      }}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none font-bold bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Stock Status
                    </label>
                    <select
                      value={bookFormData.status || 'Available'}
                      onChange={(e) => {
                        const st = e.target.value;
                        if (st === 'Out of Stock') {
                          setBookFormData({ ...bookFormData, status: st, available_copies: 0 });
                        } else {
                          setBookFormData({ ...bookFormData, status: st });
                        }
                      }}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none bg-white font-semibold"
                    >
                      <option value="Available">Available</option>
                      <option value="Low Stock">Low Stock</option>
                      <option value="Out of Stock">Out of Stock / No Stock</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                {/* Banner when 0 stock */}
                {((bookFormData.total_copies ?? 0) === 0 || (bookFormData.available_copies ?? 0) === 0 || bookFormData.status === 'Out of Stock') && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
                    <LuCircleAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      <strong>No Stock / Out of Stock:</strong> This book has 0 copies available for loan. It will display a "No Stock" badge in the catalog.
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Publisher</label>
                  <input
                    type="text"
                    value={bookFormData.publisher}
                    onChange={(e) => setBookFormData({ ...bookFormData, publisher: e.target.value })}
                    placeholder="e.g. Oxford University Press"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Edition / Year</label>
                  <input
                    type="text"
                    value={bookFormData.edition_year}
                    onChange={(e) => setBookFormData({ ...bookFormData, edition_year: e.target.value })}
                    placeholder="e.g. 2024 (10th Edition)"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Summary / Catalog Notes</label>
                <textarea
                  rows="2"
                  value={bookFormData.description}
                  onChange={(e) => setBookFormData({ ...bookFormData, description: e.target.value })}
                  placeholder="Key topics, synopsis, syllabus recommendation..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-primary-500/20 cursor-pointer"
                >
                  {editingBook ? 'Update Book' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: ISSUE BOOK MODAL                                      */}
      {/* ============================================================== */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-scale-up">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <LuArrowRightLeft className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Issue Book to Member</h3>
                  <p className="text-emerald-100 text-xs">Record new library borrowing transaction</p>
                </div>
              </div>
              <button
                onClick={() => setIsIssueModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueBook} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Book from Inventory *</label>
                <select
                  required
                  value={issueFormData.book_id}
                  onChange={(e) => setIssueFormData({ ...issueFormData, book_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none bg-white font-medium"
                >
                  <option value="">-- Choose Book --</option>
                  {books
                    .filter((b) => b.available_copies > 0 || (selectedBookForIssue && selectedBookForIssue.id === b.id))
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} ({b.book_code}) — {b.available_copies} Available
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Borrower Type *</label>
                  <select
                    value={issueFormData.borrower_type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setIssueFormData({
                        ...issueFormData,
                        borrower_type: newType,
                        borrower_name: '',
                        borrower_identifier: '',
                        borrower_class: '',
                        borrower_contact: '',
                      });
                      setSelectedStudent(null);
                      setStudentSearchQuery('');
                      setIsStudentDropdownOpen(false);
                      setIsManualStudentEntry(newType !== 'student');
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none bg-white font-medium shadow-xs"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher / Faculty</option>
                    <option value="staff">Staff Member</option>
                  </select>
                </div>

                {issueFormData.borrower_type === 'student' && !isManualStudentEntry ? (
                  <div className="flex items-end justify-end pb-1.5">
                    <button
                      type="button"
                      onClick={() => setIsManualStudentEntry(true)}
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <LuPencil className="w-3 h-3" /> Or enter student manually
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {issueFormData.borrower_type === 'teacher' ? 'Teacher / Faculty Name *' : issueFormData.borrower_type === 'staff' ? 'Staff Member Name *' : 'Borrower Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={issueFormData.borrower_name}
                      onChange={(e) => setIssueFormData({ ...issueFormData, borrower_name: e.target.value })}
                      placeholder={issueFormData.borrower_type === 'student' ? 'e.g. Aarav Sharma' : 'e.g. Dr. Rajesh Kumar'}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* STUDENT DETAILS SEARCHABLE DROPDOWN (Class, Division, Roll No, Name, Student ID) */}
              {issueFormData.borrower_type === 'student' && !isManualStudentEntry ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <LuGraduationCap className="w-4 h-4 text-emerald-600" />
                      Find Student from School / College *
                    </label>
                    {loadingStudents && (
                      <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                        <LuLoader className="w-3 h-3 animate-spin" /> Loading roster...
                      </span>
                    )}
                  </div>

                  {selectedStudent ? (
                    /* Selected Student Highlight Card */
                    <div className="p-3.5 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-emerald-100/40 border border-emerald-300/80 rounded-2xl relative shadow-xs">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                            {selectedStudent.first_name?.[0] || 'S'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-slate-900 text-sm">
                                {selectedStudent.full_name || `${selectedStudent.first_name} ${selectedStudent.last_name || ''}`}
                              </h4>
                              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300 flex items-center gap-1">
                                <LuCheck className="w-3 h-3 text-emerald-700" /> Selected
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600 font-mono mt-0.5">
                              <span>Student ID:</span>
                              <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                                {selectedStudent.admission_number || '—'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleClearStudent}
                          className="text-xs font-semibold text-slate-600 hover:text-red-700 px-2.5 py-1 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-2xs flex-shrink-0"
                          title="Change selected student"
                        >
                          <LuRotateCcw className="w-3 h-3 text-slate-400 group-hover:text-red-600" />
                          Change
                        </button>
                      </div>

                      {/* Explicit 4 detail fields: Class Standard, Division, Roll No, Phone */}
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 border-t border-emerald-200/80 text-[11px]">
                        <div className="bg-white/95 p-2 rounded-xl border border-emerald-100 shadow-2xs">
                          <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Class Standard</span>
                          <span className="font-bold text-slate-800 truncate block mt-0.5">
                            {selectedStudent.class_name || selectedStudent.school_class?.name || 'Class 10'}
                          </span>
                        </div>
                        <div className="bg-white/95 p-2 rounded-xl border border-emerald-100 shadow-2xs">
                          <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Division</span>
                          <span className="font-bold text-slate-800 truncate block mt-0.5">
                            {selectedStudent.division_name || selectedStudent.section?.name || 'A'}
                          </span>
                        </div>
                        <div className="bg-white/95 p-2 rounded-xl border border-emerald-100 shadow-2xs">
                          <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Roll Number</span>
                          <span className="font-bold text-emerald-700 truncate block mt-0.5">
                            #{selectedStudent.roll_number || '—'}
                          </span>
                        </div>
                        <div className="bg-white/95 p-2 rounded-xl border border-emerald-100 shadow-2xs">
                          <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Contact Phone</span>
                          <span className="font-semibold text-slate-700 font-mono truncate block mt-0.5">
                            {selectedStudent.guardian_phone || selectedStudent.emergency_contact || '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Search Combobox Input - only shows results after searching */
                    <div className="relative">
                      <div className="relative">
                        <LuSearch className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          value={studentSearchQuery}
                          onChange={(e) => setStudentSearchQuery(e.target.value)}
                          placeholder="Type student name, roll no, student ID, class or division..."
                          className="w-full pl-9 pr-9 py-2.5 text-xs bg-slate-50 hover:bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:bg-white focus:outline-none font-medium shadow-xs transition"
                        />
                        {studentSearchQuery && (
                          <button
                            type="button"
                            onClick={() => {
                              setStudentSearchQuery('');
                              setStudentClassFilter('all');
                            }}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                            title="Clear search"
                          >
                            <LuX className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* When user has NOT searched yet: show clean helper hint */}
                      {!(studentSearchQuery.trim() || studentClassFilter !== 'all') ? (
                        <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-slate-50/80 border border-slate-200/70 rounded-xl text-slate-500 text-xs">
                          <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <LuSearch className="w-3 h-3" />
                          </div>
                          <p className="text-[11px] text-slate-500 leading-tight">
                            <span className="font-semibold text-slate-700">Type anything to search</span> — student details (Class, Division, Roll # &amp; ID) will appear below.
                          </p>
                        </div>
                      ) : (
                        /* When user has searched or selected a standard: show nice results section */
                        <div className="mt-2.5 bg-white border border-emerald-200/90 rounded-2xl shadow-xl shadow-emerald-950/5 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                          {/* Header Bar */}
                          <div className="px-3.5 py-2.5 bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-slate-50/80 border-b border-emerald-100 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                              <span className="text-xs font-bold text-slate-800">
                                Matching Students
                              </span>
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200/80">
                                {filteredStudents.length} {filteredStudents.length === 1 ? 'result' : 'results'}
                              </span>
                              {studentSearchQuery && (
                                <span className="text-[11px] text-slate-500 truncate hidden sm:inline">
                                  for &ldquo;<strong className="text-emerald-800">{studentSearchQuery}</strong>&rdquo;
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setStudentSearchQuery('');
                                setStudentClassFilter('all');
                              }}
                              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 px-2 py-0.5 rounded-lg hover:bg-white/80 transition cursor-pointer"
                            >
                              Reset
                            </button>
                          </div>

                          {/* Quick Class Standard Filter Badges */}
                          {uniqueStudentClasses.length > 2 && (
                            <div className="px-3 py-2 bg-slate-50/60 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider shrink-0">Standard:</span>
                              {uniqueStudentClasses.slice(0, 7).map((cls) => (
                                <button
                                  key={cls}
                                  type="button"
                                  onClick={() => setStudentClassFilter(cls)}
                                  className={`px-2.5 py-1 rounded-lg font-semibold text-[10px] cursor-pointer transition-all whitespace-nowrap ${
                                    studentClassFilter === cls
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/70'
                                  }`}
                                >
                                  {cls === 'all' ? 'All Standards' : cls}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Student Results List */}
                          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 p-1.5 space-y-1">
                            {filteredStudents.length === 0 ? (
                              <div className="p-6 text-center">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                                  <LuSearch className="w-5 h-5" />
                                </div>
                                <p className="text-xs font-bold text-slate-700">No students found matching &ldquo;{studentSearchQuery}&rdquo;</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Try searching with a different name, roll number, or standard.</p>
                              </div>
                            ) : (
                              filteredStudents.map((stu) => {
                                const cName = stu.class_name || stu.school_class?.name || 'Class';
                                const dName = stu.division_name || stu.section?.name || 'Div';
                                const rNo = stu.roll_number || '—';
                                const sId = stu.admission_number || '—';
                                const name = stu.full_name || `${stu.first_name} ${stu.last_name || ''}`;

                                return (
                                  <button
                                    key={stu.id || sId}
                                    type="button"
                                    onClick={() => handleSelectStudent(stu)}
                                    className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50/80 border border-transparent hover:border-emerald-200 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                                        {stu.first_name?.[0] || 'S'}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-950 truncate">
                                            {name}
                                          </span>
                                          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 group-hover:bg-emerald-100/70 text-slate-700 font-semibold rounded border border-slate-200/80">
                                            ID: {sId}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 flex-wrap">
                                          <span className="font-semibold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200/60 text-[10px]">
                                            {cName}
                                          </span>
                                          <span className="text-slate-400">•</span>
                                          <span className="text-slate-600 font-medium">
                                            Div: <strong className="text-slate-700">{dName}</strong>
                                          </span>
                                          <span className="text-slate-400">•</span>
                                          <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                                            Roll #{rNo}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="px-3 py-1 bg-white group-hover:bg-emerald-600 group-hover:text-white border border-emerald-200 group-hover:border-emerald-600 text-emerald-700 font-semibold text-xs rounded-lg transition-all shadow-2xs flex items-center gap-1 shrink-0">
                                      <span>Select</span>
                                      <LuCheck className="w-3.5 h-3.5" />
                                    </div>
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Manual text entry fields for Student (if toggled) OR Teacher/Staff */
                <div className="space-y-4">
                  {issueFormData.borrower_type === 'student' && (
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-xs text-slate-500 font-medium">Manual Entry Mode</span>
                      <button
                        type="button"
                        onClick={() => setIsManualStudentEntry(false)}
                        className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <LuGraduationCap className="w-3.5 h-3.5" /> Back to Searchable Dropdown
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {issueFormData.borrower_type === 'student' ? 'Student ID / Admission Number' : 'Staff Employee ID'}
                      </label>
                      <input
                        type="text"
                        value={issueFormData.borrower_identifier}
                        onChange={(e) => setIssueFormData({ ...issueFormData, borrower_identifier: e.target.value })}
                        placeholder={issueFormData.borrower_type === 'student' ? 'e.g. STU-2024-X-101' : 'e.g. EMP-104'}
                        className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {issueFormData.borrower_type === 'student' ? 'Class & Division (Standard)' : 'Department / Section'}
                      </label>
                      <input
                        type="text"
                        value={issueFormData.borrower_class}
                        onChange={(e) => setIssueFormData({ ...issueFormData, borrower_class: e.target.value })}
                        placeholder={issueFormData.borrower_type === 'student' ? 'e.g. Class 10 - Saffron (A)' : 'e.g. Science Dept'}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone Number</label>
                    <input
                      type="text"
                      value={issueFormData.borrower_contact}
                      onChange={(e) => setIssueFormData({ ...issueFormData, borrower_contact: e.target.value })}
                      placeholder="e.g. +91 98201 12345"
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Issue Date *</label>
                  <input
                    type="date"
                    required
                    value={issueFormData.issue_date}
                    onChange={(e) => setIssueFormData({ ...issueFormData, issue_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Return Date *</label>
                  <input
                    type="date"
                    required
                    value={issueFormData.due_date}
                    onChange={(e) => setIssueFormData({ ...issueFormData, due_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Purpose</label>
                <input
                  type="text"
                  value={issueFormData.notes}
                  onChange={(e) => setIssueFormData({ ...issueFormData, notes: e.target.value })}
                  placeholder="e.g. Reference for Science Olympiad Project"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: RETURN BOOK & FINE MODAL                              */}
      {/* ============================================================== */}
      {isReturnModalOpen && selectedIssueForReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-scale-up">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <LuRotateCcw className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Return Book & Settle</h3>
                  <p className="text-emerald-100 text-xs">Acknowledge return and update inventory</p>
                </div>
              </div>
              <button
                onClick={() => setIsReturnModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReturnBook} className="p-6 space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Book:</span>
                  <span className="font-bold text-slate-800 text-right">{selectedIssueForReturn.book?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Borrower:</span>
                  <span className="font-semibold text-slate-800">{selectedIssueForReturn.borrower_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Scheduled Due Date:</span>
                  <span className="font-bold text-slate-700">
                    {selectedIssueForReturn.due_date
                      ? new Date(selectedIssueForReturn.due_date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Return Date</label>
                <input
                  type="date"
                  required
                  value={returnFormData.return_date}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    const calculated = calculateDynamicFine(selectedIssueForReturn, newDate);
                    setReturnFormData({
                      ...returnFormData,
                      return_date: newDate,
                      fine_amount: calculated,
                      fine_status: calculated > 0 ? 'paid' : 'waived',
                    });
                  }}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Dynamic Fine Rule Notice */}
              <div className="p-3 bg-indigo-50/80 border border-indigo-200/80 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between text-indigo-900 font-bold">
                  <span className="flex items-center gap-1.5">
                    <LuShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>Dynamic Overdue Fine Rule</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFineRulesFormData({ ...fineRules });
                      setIsFineRulesModalOpen(true);
                    }}
                    className="text-[11px] text-indigo-700 hover:text-indigo-900 underline flex items-center gap-1 cursor-pointer"
                  >
                    <LuSettings className="w-3 h-3" />
                    <span>Manage Rules</span>
                  </button>
                </div>
                <div className="text-[11px] text-indigo-800 leading-relaxed">
                  Rate applied: <strong>₹{selectedIssueForReturn.borrower_type === 'student' ? (fineRules.student_fine_per_day ?? fineRules.fine_per_day) : selectedIssueForReturn.borrower_type === 'teacher' ? fineRules.teacher_fine_per_day : fineRules.staff_fine_per_day}/day</strong> • Grace: <strong>{fineRules.grace_period_days} day(s)</strong>{fineRules.max_fine_cap > 0 ? ` • Max Cap: ₹${fineRules.max_fine_cap}` : ''}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Late Fine Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={returnFormData.fine_amount}
                    onChange={(e) => setReturnFormData({ ...returnFormData, fine_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs font-mono font-bold text-rose-700 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fine Payment Status</label>
                  <select
                    value={returnFormData.fine_status}
                    onChange={(e) => setReturnFormData({ ...returnFormData, fine_status: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none bg-white font-medium"
                  >
                    <option value="paid">Paid at Counter</option>
                    <option value="waived">Waived / Excused</option>
                    <option value="unpaid">Unpaid / Bill Later</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Return Remarks / Condition</label>
                <input
                  type="text"
                  value={returnFormData.notes}
                  onChange={(e) => setReturnFormData({ ...returnFormData, notes: e.target.value })}
                  placeholder="e.g. Good condition, pages verified"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Complete Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: PRINTABLE SLIP / ISSUE RECEIPT                        */}
      {/* ============================================================== */}
      {isReceiptModalOpen && receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-scale-up">
            <div className="p-6 space-y-4">
              {/* Slip Header */}
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-2">
                  <LuBookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 uppercase tracking-tight">Arch Campus</h3>
                <p className="text-[11px] font-semibold text-indigo-700">Central Library Circulation Desk</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Book Issue Gate Pass & Borrowing Receipt</p>
              </div>

              {/* Receipt Details */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="font-mono font-bold text-slate-800">LIB-TX-{receiptData.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Borrower:</span>
                  <span className="font-bold text-slate-900">{receiptData.borrower_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Member ID / Class:</span>
                  <span className="font-mono text-slate-700">
                    {receiptData.borrower_identifier || 'N/A'} ({receiptData.borrower_class || receiptData.borrower_type})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Book Title:</span>
                  <span className="font-bold text-slate-800 text-right max-w-[220px]">
                    {receiptData.book?.title || 'Library Book'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Accession / Code:</span>
                  <span className="font-mono text-indigo-700 font-bold">
                    {receiptData.book?.book_code || `BK-${receiptData.book_id}`}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Issue Date:</span>
                  <span className="font-mono text-slate-700">{receiptData.issue_date}</span>
                </div>
                <div className="flex justify-between py-1 bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                  <span className="font-bold text-indigo-900">Due Return Date:</span>
                  <span className="font-mono font-extrabold text-indigo-700">{receiptData.due_date}</span>
                </div>
              </div>

              {/* Barcode & Terms Notice */}
              <div className="text-center pt-2">
                <div className="font-mono text-2xl tracking-widest text-slate-700 select-all mb-1">
                  ||| | |||| | ||| || |||
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Please return the book on or before the due date. A late return fee of ₹10 per day is applicable thereafter.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <LuPrinter className="w-4 h-4" />
                  <span>Print Slip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: DEDICATED DELETE CONFIRMATION MODAL                   */}
      {/* ============================================================== */}
      {deleteConfirmModal && deleteConfirmModal.book && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-rose-600 to-rose-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <LuTrash2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Retire Book from Catalog</h3>
                  <p className="text-rose-100 text-xs">Confirm title removal from library inventory</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteConfirmModal(null)}
                disabled={deleteConfirmModal.isDeleting}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white cursor-pointer disabled:opacity-50"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Book Details Box */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                <div className="flex justify-between items-start">
                  <span className="text-slate-500 font-medium">Title:</span>
                  <span className="font-bold text-slate-900 text-right max-w-[230px]">
                    {deleteConfirmModal.book.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Author:</span>
                  <span className="text-slate-700 font-semibold">{deleteConfirmModal.book.author}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Book Code:</span>
                  <span className="font-mono text-indigo-700 font-bold">
                    {deleteConfirmModal.book.book_code || `BK-${deleteConfirmModal.book.id}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Copies Stock:</span>
                  <span className="font-bold text-slate-800">
                    {deleteConfirmModal.book.available_copies} available / {deleteConfirmModal.book.total_copies} total
                  </span>
                </div>
              </div>

              {/* Active Loans Notice (if book has borrowed copies) */}
              {deleteConfirmModal.hasActiveLoans && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-amber-800">
                    <LuCircleAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Active Borrowers Notice</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    This book currently has <strong>{deleteConfirmModal.activeCount} copy(ies) on loan</strong> to students or teachers.
                  </p>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    Force deleting will archive the book and mark active loans as returned/retired in the circulation register.
                  </p>
                </div>
              )}

              {/* General Confirmation Text */}
              {!deleteConfirmModal.hasActiveLoans && (
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to retire <strong>"{deleteConfirmModal.book.title}"</strong>? This will remove the title from the active library catalog and circulation desk.
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={deleteConfirmModal.isDeleting}
                  onClick={() => setDeleteConfirmModal(null)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteConfirmModal.isDeleting}
                  onClick={() => confirmDeleteBook(deleteConfirmModal.hasActiveLoans || deleteConfirmModal.force)}
                  className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {deleteConfirmModal.isDeleting ? (
                    <>
                      <LuLoader className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : deleteConfirmModal.hasActiveLoans ? (
                    <>
                      <LuTrash2 className="w-4 h-4" />
                      <span>Force Retire & Delete</span>
                    </>
                  ) : (
                    <>
                      <LuTrash2 className="w-4 h-4" />
                      <span>Confirm Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 6: BOOK BORROWERS HISTORY & SPECIFIC TIME PERIOD MODAL   */}
      {/* ============================================================== */}
      {isBorrowersModalOpen && selectedBookForBorrowers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-primary-600 via-indigo-600 to-indigo-700 text-white flex items-start justify-between gap-4 shrink-0 shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner mt-0.5">
                  <LuUsers className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-white/20 text-white font-bold text-[10px] uppercase tracking-wider">
                      Borrowers Roster
                    </span>
                    <span className="text-indigo-200 text-xs font-medium">|</span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-900/40 text-indigo-100 font-mono text-[10px] font-bold border border-white/10">
                      {selectedBookForBorrowers.book_code || `BK-${selectedBookForBorrowers.id}`}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/25 text-white">
                      {selectedBookForBorrowers.category}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base sm:text-lg text-white mt-1 leading-snug line-clamp-1">
                    {selectedBookForBorrowers.title}
                  </h3>
                  <p className="text-indigo-100 text-xs mt-0.5">
                    by <span className="font-semibold text-white">{selectedBookForBorrowers.author}</span> •{' '}
                    <span className="text-emerald-300 font-bold">
                      {selectedBookForBorrowers.available_copies ?? 0} available
                    </span>{' '}
                    of {selectedBookForBorrowers.total_copies ?? 0} copies in stock
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBorrowersModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
                title="Close"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Controls & Specific Time Period Toolbar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
              {/* Row 1: Time Period Quick Presets */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mr-1">
                    <LuClock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Time Period:</span>
                  </span>
                  {[
                    { id: 'all', label: 'All Time' },
                    { id: 'active', label: 'Currently Active' },
                    { id: 'month', label: 'This Month' },
                    { id: '30days', label: 'Past 30 Days' },
                    { id: '90days', label: 'Past 90 Days' },
                    { id: 'custom', label: 'Custom Range' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setBorrowersTimeFilter(preset.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        borrowersTimeFilter === preset.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Borrower Type Filter */}
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Borrower:</label>
                  <select
                    value={borrowersTypeFilter}
                    onChange={(e) => setBorrowersTypeFilter(e.target.value)}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="all">All Borrowers</option>
                    <option value="student">Students Only</option>
                    <option value="teacher">Teachers / Faculty</option>
                    <option value="staff">Staff Only</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Search input & Custom Date Pickers */}
              <div className="flex items-center gap-2.5 flex-wrap pt-2 border-t border-slate-200/70">
                {/* Search */}
                <div className="relative flex-1 min-w-[220px]">
                  <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={borrowersSearchQuery}
                    onChange={(e) => setBorrowersSearchQuery(e.target.value)}
                    placeholder="Search by student name, roll number, class standard, or ID..."
                    className="w-full pl-8.5 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {borrowersSearchQuery && (
                    <button
                      onClick={() => setBorrowersSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Custom Date Pickers */}
                {(borrowersTimeFilter === 'custom' || borrowersFromDate || borrowersToDate) && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 text-xs">
                      <span className="text-slate-500 font-medium">From:</span>
                      <input
                        type="date"
                        value={borrowersFromDate}
                        onChange={(e) => {
                          setBorrowersFromDate(e.target.value);
                          if (borrowersTimeFilter !== 'custom') setBorrowersTimeFilter('custom');
                        }}
                        className="bg-transparent text-slate-800 font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 text-xs">
                      <span className="text-slate-500 font-medium">To:</span>
                      <input
                        type="date"
                        value={borrowersToDate}
                        onChange={(e) => {
                          setBorrowersToDate(e.target.value);
                          if (borrowersTimeFilter !== 'custom') setBorrowersTimeFilter('custom');
                        }}
                        className="bg-transparent text-slate-800 font-semibold focus:outline-none"
                      />
                    </div>
                    {(borrowersFromDate || borrowersToDate) && (
                      <button
                        onClick={() => {
                          setBorrowersFromDate('');
                          setBorrowersToDate('');
                        }}
                        className="px-2 py-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Reset Range
                      </button>
                    )}
                  </div>
                )}

                {/* Quick Summary Counter */}
                <div className="ml-auto text-xs text-slate-500 font-medium whitespace-nowrap">
                  Showing <strong className="text-slate-800">{filteredBookBorrowers.length}</strong> borrower record(s)
                </div>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1">
              {filteredBookBorrowers.length === 0 ? (
                <div className="py-14 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-500 flex items-center justify-center mx-auto mb-3 shadow-xs">
                    <LuHistory className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">No Borrowers Found For This Time Period</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                    No students or members have taken "{selectedBookForBorrowers.title}" during the selected time period or filter criteria.
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setBorrowersTimeFilter('all');
                        setBorrowersFromDate('');
                        setBorrowersToDate('');
                        setBorrowersSearchQuery('');
                        setBorrowersTypeFilter('all');
                      }}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Show All-Time Borrowers History
                    </button>
                    {(selectedBookForBorrowers.available_copies ?? 0) > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsBorrowersModalOpen(false);
                          openIssueModal(selectedBookForBorrowers);
                        }}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <LuArrowRightLeft className="w-3.5 h-3.5" />
                        <span>Issue to Student Now</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-3.5">Student / Borrower Name</th>
                        <th className="py-3 px-3.5">Class Standard & Details</th>
                        <th className="py-3 px-3.5">Specific Time Period (From - To)</th>
                        <th className="py-3 px-3.5">Loan Duration</th>
                        <th className="py-3 px-3.5">Status</th>
                        <th className="py-3 px-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredBookBorrowers.map((issue) => {
                        const isStudent = issue.borrower_type === 'student';
                        const isTeacher = issue.borrower_type === 'teacher';
                        const initials = (issue.borrower_name || 'ST')
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase();

                        return (
                          <tr key={issue.id} className="hover:bg-slate-50/80 transition-colors">
                            {/* Student / Borrower Name */}
                            <td className="py-3 px-3.5">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                    isStudent
                                      ? 'bg-blue-100 text-blue-700'
                                      : isTeacher
                                      ? 'bg-purple-100 text-purple-700'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {initials}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <h5 className="font-bold text-slate-800 leading-tight">
                                      {issue.borrower_name}
                                    </h5>
                                    <span
                                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                                        isStudent
                                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                          : isTeacher
                                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                          : 'bg-slate-100 text-slate-600'
                                      }`}
                                    >
                                      {issue.borrower_type}
                                    </span>
                                  </div>
                                  {issue.borrower_contact && (
                                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                      <LuPhone className="w-2.5 h-2.5" />
                                      <span>{issue.borrower_contact}</span>
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Class Standard, Division, Roll #, Student ID */}
                            <td className="py-3 px-3.5 whitespace-nowrap">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1 text-slate-800 font-bold">
                                  <LuGraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                  <span>{issue.borrower_class || (isStudent ? 'Standard Enrolled' : 'Faculty')}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                                  <span className="font-mono bg-slate-100 px-1 py-0.2 rounded border border-slate-200 text-slate-700">
                                    ID: {issue.borrower_identifier || 'N/A'}
                                  </span>
                                  {issue.notes && (
                                    <span className="text-slate-400 truncate max-w-[120px]" title={issue.notes}>
                                      • {issue.notes}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Specific Time Period: From Date to To Date */}
                            <td className="py-3 px-3.5 whitespace-nowrap">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                                  <span className="text-[10px] uppercase font-bold text-slate-400 w-10">Taken:</span>
                                  <LuCalendar className="w-3 h-3 text-indigo-500 shrink-0" />
                                  <span>
                                    {issue.issue_date
                                      ? new Date(issue.issue_date).toLocaleDateString('en-GB', {
                                          day: '2-digit',
                                          month: 'short',
                                          year: 'numeric',
                                        })
                                      : 'N/A'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-600">
                                  <span className="text-[10px] uppercase font-bold text-slate-400 w-10">
                                    {issue.status === 'returned' ? 'Returned:' : 'Due Date:'}
                                  </span>
                                  <LuClock className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className={issue.status === 'returned' ? 'text-emerald-700 font-semibold' : 'text-slate-700 font-semibold'}>
                                    {issue.status === 'returned' && issue.return_date
                                      ? new Date(issue.return_date).toLocaleDateString('en-GB', {
                                          day: '2-digit',
                                          month: 'short',
                                          year: 'numeric',
                                        })
                                      : issue.due_date
                                      ? new Date(issue.due_date).toLocaleDateString('en-GB', {
                                          day: '2-digit',
                                          month: 'short',
                                          year: 'numeric',
                                        })
                                      : 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Duration Label */}
                            <td className="py-3 px-3.5 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 inline-block">
                                {getBorrowingDurationText(issue)}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3 px-3.5 whitespace-nowrap">
                              {issue.status === 'returned' ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                                  <LuCircleCheck className="w-3 h-3 text-emerald-600" />
                                  <span>Returned</span>
                                </span>
                              ) : issue.status === 'overdue' ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                                  <LuCircleAlert className="w-3 h-3 text-rose-600" />
                                  <span>Overdue {issue.fine_amount > 0 ? `(₹${issue.fine_amount})` : ''}</span>
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 inline-flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                                  <span>On Loan (Active)</span>
                                </span>
                              )}
                            </td>

                            {/* Action Buttons */}
                            <td className="py-3 px-3.5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {issue.status !== 'returned' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsBorrowersModalOpen(false);
                                      openReturnModal(issue);
                                    }}
                                    className="py-1 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold text-[11px] transition-colors cursor-pointer"
                                    title="Process Book Return"
                                  >
                                    Return
                                  </button>
                                )}
                                {issue.status === 'overdue' && (
                                  <button
                                    type="button"
                                    onClick={() => handleSendReminder(issue)}
                                    className="p-1 rounded-lg text-amber-600 hover:bg-amber-50 cursor-pointer"
                                    title="Send Return Reminder Alert"
                                  >
                                    <LuBellRing className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReceiptData({
                                      ...issue,
                                      book: selectedBookForBorrowers,
                                    });
                                    setIsReceiptModalOpen(true);
                                  }}
                                  className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 cursor-pointer"
                                  title="View Issue Slip / Gate Pass"
                                >
                                  <LuFileText className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0 flex-wrap">
              <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                <span>
                  Catalog Total: <strong className="text-slate-800">{getBookBorrowersCount(selectedBookForBorrowers.id)}</strong> total loan(s) recorded all-time
                </span>
                {getBookActiveBorrowersCount(selectedBookForBorrowers.id) > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {getBookActiveBorrowersCount(selectedBookForBorrowers.id)} currently active
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {(selectedBookForBorrowers.available_copies ?? 0) > 0 && selectedBookForBorrowers.status !== 'Out of Stock' && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsBorrowersModalOpen(false);
                      openIssueModal(selectedBookForBorrowers);
                    }}
                    className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <LuArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Issue to Another Student</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsBorrowersModalOpen(false)}
                  className="py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 7: OVERDUE FINE RULES & LIBRARY POLICIES SETTINGS MODAL  */}
      {/* ============================================================== */}
      {isFineRulesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-primary-600 via-indigo-600 to-indigo-700 text-white flex items-center justify-between gap-4 shrink-0 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner">
                  <LuSettings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-white/20 text-white font-bold text-[10px] uppercase tracking-wider">
                      Admin Settings
                    </span>
                    <span className="text-indigo-200 text-xs">•</span>
                    <span className="text-indigo-100 text-xs font-semibold">Circulation Control</span>
                  </div>
                  <h3 className="font-extrabold text-base sm:text-lg text-white mt-0.5">
                    Overdue Fine Rules & Library Policy
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsFineRulesModalOpen(false)}
                disabled={savingFineRules}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer disabled:opacity-50"
                title="Close"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveFineRules} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                {/* Section 1: Core Daily Overdue Rule & Grace Days */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200">
                    <LuCoins className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-bold text-slate-800 text-sm">General Overdue Fine Policy</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Default Fine Rate (₹ / Day) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          required
                          value={fineRulesFormData.fine_per_day}
                          onChange={(e) => setFineRulesFormData({ ...fineRulesFormData, fine_per_day: e.target.value })}
                          className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Standard rate applied per overdue day</span>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Grace Period (Days) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        required
                        value={fineRulesFormData.grace_period_days}
                        onChange={(e) => setFineRulesFormData({ ...fineRulesFormData, grace_period_days: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">0 = fine applies immediately on 1st day late</span>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Maximum Fine Cap (₹) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="10"
                          required
                          value={fineRulesFormData.max_fine_cap}
                          onChange={(e) => setFineRulesFormData({ ...fineRulesFormData, max_fine_cap: e.target.value })}
                          className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">0 = no cap (unlimited penalty)</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Borrower Category-Specific Daily Rates */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200">
                    <LuUsers className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-bold text-slate-800 text-sm">Fine Rate by Borrower Category</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-900 text-xs">Students Rate</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          Active
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-blue-500">₹</span>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          required
                          value={fineRulesFormData.student_fine_per_day}
                          onChange={(e) => setFineRulesFormData({ ...fineRulesFormData, student_fine_per_day: e.target.value })}
                          className="w-full pl-7 pr-3 py-1.5 bg-white border border-blue-200 rounded-lg font-bold font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <p className="text-[10px] text-blue-700">Charged per overdue day for all enrolled students</p>
                    </div>

                    <div className="p-3 bg-purple-50/60 border border-purple-200/80 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-900 text-xs">Faculty / Teachers</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                          {Number(fineRulesFormData.teacher_fine_per_day) === 0 ? 'Exempt' : 'Fee'}
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-purple-500">₹</span>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          required
                          value={fineRulesFormData.teacher_fine_per_day}
                          onChange={(e) => setFineRulesFormData({ ...fineRulesFormData, teacher_fine_per_day: e.target.value })}
                          className="w-full pl-7 pr-3 py-1.5 bg-white border border-purple-200 rounded-lg font-bold font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <p className="text-[10px] text-purple-700">Set ₹0 to excuse teachers from overdue fines</p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs">Staff Members</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                          Staff
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          required
                          value={fineRulesFormData.staff_fine_per_day}
                          onChange={(e) => setFineRulesFormData({ ...fineRulesFormData, staff_fine_per_day: e.target.value })}
                          className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">Charged per day for non-teaching staff</p>
                    </div>
                  </div>
                </div>

                {/* Section 3: Default Loan Durations & Book Holding Limits */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200">
                    <LuClock className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-bold text-slate-800 text-sm">Loan Durations & Holding Quotas</h4>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Student Loan (Days)</label>
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={fineRulesFormData.default_loan_days_student}
                        onChange={(e) => setFineRulesFormData({ ...fineRulesFormData, default_loan_days_student: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Default: 14 days</span>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Teacher Loan (Days)</label>
                      <input
                        type="number"
                        min="1"
                        max="180"
                        value={fineRulesFormData.default_loan_days_teacher}
                        onChange={(e) => setFineRulesFormData({ ...fineRulesFormData, default_loan_days_teacher: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Default: 30 days</span>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Max Books (Student)</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={fineRulesFormData.max_books_per_student}
                        onChange={(e) => setFineRulesFormData({ ...fineRulesFormData, max_books_per_student: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Max active loans</span>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Max Books (Teacher)</label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={fineRulesFormData.max_books_per_teacher}
                        onChange={(e) => setFineRulesFormData({ ...fineRulesFormData, max_books_per_teacher: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Max active loans</span>
                    </div>
                  </div>
                </div>

                {/* Section 4: Policy Options / Checkboxes */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!fineRulesFormData.allow_librarian_fine_waiver}
                      onChange={(e) => setFineRulesFormData({ ...fineRulesFormData, allow_librarian_fine_waiver: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-xs text-slate-800 font-semibold">
                      Allow Librarian / Counter Staff to adjust or waive fines at book return
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!fineRulesFormData.send_overdue_reminders}
                      onChange={(e) => setFineRulesFormData({ ...fineRulesFormData, send_overdue_reminders: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-xs text-slate-800 font-semibold">
                      Send automated WhatsApp / SMS reminders when a book reaches overdue status
                    </span>
                  </label>
                </div>

                {/* Section 5: Real-Time Rule Simulation Box */}
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-indigo-900 font-bold">
                    <span className="flex items-center gap-1.5">
                      <LuShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span>Live Rule Simulation (Example Scenario)</span>
                    </span>
                    <span className="text-[10px] font-mono bg-indigo-200/60 px-2 py-0.5 rounded text-indigo-900">
                      7 Days Overdue Book
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-800 leading-relaxed">
                    If a student returns a book <strong>7 days overdue</strong>:
                    {' '}Grace period excuses <strong>{fineRulesFormData.grace_period_days} day(s)</strong>.
                    {' '}Chargeable days: <strong>{Math.max(0, 7 - (Number(fineRulesFormData.grace_period_days) || 0))} day(s)</strong>.
                    {' '}At ₹{Number(fineRulesFormData.student_fine_per_day) || 0}/day:
                    {' '}Total Late Fine = <strong className="text-rose-600 font-mono text-xs">
                      ₹{Math.min(
                        Number(fineRulesFormData.max_fine_cap) > 0 ? Number(fineRulesFormData.max_fine_cap) : Infinity,
                        Math.max(0, 7 - (Number(fineRulesFormData.grace_period_days) || 0)) * (Number(fineRulesFormData.student_fine_per_day) || 0)
                      )}
                    </strong>
                    {Number(fineRulesFormData.max_fine_cap) > 0 && ` (Capped at ₹${fineRulesFormData.max_fine_cap})`}.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setFineRulesFormData({
                      fine_per_day: 10,
                      grace_period_days: 1,
                      max_fine_cap: 200,
                      student_fine_per_day: 10,
                      teacher_fine_per_day: 0,
                      staff_fine_per_day: 5,
                      default_loan_days_student: 14,
                      default_loan_days_teacher: 30,
                      default_loan_days_staff: 14,
                      max_books_per_student: 3,
                      max_books_per_teacher: 5,
                      allow_librarian_fine_waiver: true,
                      send_overdue_reminders: true,
                    });
                    showToast('Rules reset to recommended school standards');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 underline font-semibold cursor-pointer"
                >
                  Reset to Recommended Defaults
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFineRulesModalOpen(false)}
                    disabled={savingFineRules}
                    className="py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingFineRules}
                    className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {savingFineRules ? (
                      <>
                        <LuLoader className="w-4 h-4 animate-spin" />
                        <span>Saving Rules...</span>
                      </>
                    ) : (
                      <>
                        <LuCheck className="w-4 h-4" />
                        <span>Save Fine Rules</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
