import { apiRequest } from './api';

// Initial fallback mock data for offline/standalone resilience
const INITIAL_BOOKS = [
  {
    id: 1,
    book_code: 'BK-SCI-1001',
    title: 'Concepts of Physics (Vol 1 & 2)',
    author: 'Dr. H. C. Verma',
    isbn: '978-8177091878',
    category: 'Science & Physics',
    publisher: 'Bharati Bhavan',
    edition_year: '2023',
    shelf_location: 'Rack A-1, Row 2',
    total_copies: 12,
    available_copies: 9,
    status: 'Available',
    description: 'Comprehensive fundamentals of physics for high school & competitive exams with problem solving.',
  },
  {
    id: 2,
    book_code: 'BK-MAT-1002',
    title: 'Higher Algebra & Coordinate Geometry',
    author: 'Hall & Knight / S. L. Loney',
    isbn: '978-9351761891',
    category: 'Mathematics',
    publisher: 'Arihant Classics',
    edition_year: '2022',
    shelf_location: 'Rack B-2, Row 1',
    total_copies: 10,
    available_copies: 8,
    status: 'Available',
    description: 'Classic textbook on polynomials, progression, inequalities, and analytical geometry.',
  },
  {
    id: 3,
    book_code: 'BK-CS-1003',
    title: 'Introduction to Algorithms (CLRS)',
    author: 'Cormen, Leiserson, Rivest, Stein',
    isbn: '978-0262033848',
    category: 'Computer Science',
    publisher: 'MIT Press',
    edition_year: '2021',
    shelf_location: 'Rack D-3, Row 3',
    total_copies: 6,
    available_copies: 4,
    status: 'Available',
    description: 'The standard handbook and foundational algorithms textbook for computer science students.',
  },
  {
    id: 4,
    book_code: 'BK-LIT-1004',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0061120084',
    category: 'World Literature',
    publisher: 'HarperCollins',
    edition_year: '2019',
    shelf_location: 'Rack E-1, Row 2',
    total_copies: 8,
    available_copies: 7,
    status: 'Available',
    description: 'Pulitzer prize winning classic masterpiece exploring warmth, justice, and human compassion.',
  },
  {
    id: 5,
    book_code: 'BK-SCI-1005',
    title: 'Organic Chemistry (Wade & Simek)',
    author: 'L. G. Wade Jr.',
    isbn: '978-0134161601',
    category: 'Science & Chemistry',
    publisher: 'Pearson Education',
    edition_year: '2022',
    shelf_location: 'Rack A-3, Row 1',
    total_copies: 8,
    available_copies: 6,
    status: 'Available',
    description: 'Mechanisms, molecular structures, and reaction pathways tailored for senior secondary labs.',
  },
  {
    id: 6,
    book_code: 'BK-HIS-1006',
    title: 'India: An Ancient Civilization',
    author: 'Romila Thapar',
    isbn: '978-0143029144',
    category: 'History & Social Studies',
    publisher: 'Penguin Books',
    edition_year: '2020',
    shelf_location: 'Rack C-2, Row 4',
    total_copies: 7,
    available_copies: 7,
    status: 'Available',
    description: 'Detailed socio-cultural history of ancient Indian dynasties, trade routes, and governance.',
  },
  {
    id: 7,
    book_code: 'BK-FIC-1007',
    title: 'The Discovery of India',
    author: 'Jawaharlal Nehru',
    isbn: '978-0143031031',
    category: 'Historical Biography',
    publisher: 'Oxford University Press',
    edition_year: '2021',
    shelf_location: 'Rack C-1, Row 1',
    total_copies: 5,
    available_copies: 3,
    status: 'Available',
    description: 'Written in prison, charting philosophy, art, and the freedom movement of the Indian subcontinent.',
  },
  {
    id: 8,
    book_code: 'BK-CS-1008',
    title: 'Python Programming for Beginners & AI',
    author: 'Eric Matthes',
    isbn: '978-1593279288',
    category: 'Computer Science',
    publisher: 'No Starch Press',
    edition_year: '2023',
    shelf_location: 'Rack D-1, Row 2',
    total_copies: 15,
    available_copies: 11,
    status: 'Available',
    description: 'Practical project-based introduction to Python syntax, data science, and web applications.',
  },
  {
    id: 9,
    book_code: 'BK-BIO-1009',
    title: 'Campbell Biology (Global Edition)',
    author: 'Jane B. Reece & Lisa A. Urry',
    isbn: '978-1292170435',
    category: 'Science & Biology',
    publisher: 'Pearson',
    edition_year: '2022',
    shelf_location: 'Rack A-4, Row 3',
    total_copies: 6,
    available_copies: 5,
    status: 'Available',
    description: 'The premier introductory biological sciences reference text with full-color visual diagrams.',
  },
  {
    id: 10,
    book_code: 'BK-ENG-1010',
    title: "Oxford Advanced Learner's Dictionary (10th Ed)",
    author: 'A. S. Hornby',
    isbn: '978-0194798488',
    category: 'Reference & Dictionaries',
    publisher: 'Oxford University Press',
    edition_year: '2023',
    shelf_location: 'Reference Desk R-1',
    total_copies: 10,
    available_copies: 10,
    status: 'Available',
    description: 'Essential language companion with over 200,000 words, phrases, and illustrative sentence usage.',
  },
];

const INITIAL_ISSUES = [
  {
    id: 1,
    book_id: 1,
    book: INITIAL_BOOKS[0],
    borrower_type: 'student',
    borrower_name: 'Aarav Sharma',
    borrower_identifier: 'ADM-2026-042',
    borrower_contact: '+91 98201 12345',
    borrower_class: 'Class 10 - Section A',
    issue_date: '2026-10-11',
    due_date: '2026-10-25',
    status: 'issued',
    fine_amount: 0,
    fine_status: 'unpaid',
    notes: 'Exam preparation issue for Mid-Term boards.',
  },
  {
    id: 2,
    book_id: 2,
    book: INITIAL_BOOKS[1],
    borrower_type: 'student',
    borrower_name: 'Kavya Nair',
    borrower_identifier: 'ADM-2026-018',
    borrower_contact: '+91 98202 23456',
    borrower_class: 'Class 9 - Section B',
    issue_date: '2026-10-01',
    due_date: '2026-10-15',
    status: 'overdue',
    fine_amount: 60.0,
    fine_status: 'unpaid',
    notes: 'Reminder SMS dispatched to parent contact.',
  },
  {
    id: 3,
    book_id: 3,
    book: INITIAL_BOOKS[2],
    borrower_type: 'teacher',
    borrower_name: 'Mrs. Deepa K. (Computer Dept)',
    borrower_identifier: 'EMP-TCH-104',
    borrower_contact: '+91 98203 34567',
    borrower_class: 'Faculty / CS Dept',
    issue_date: '2026-10-16',
    due_date: '2026-11-15',
    status: 'issued',
    fine_amount: 0,
    fine_status: 'unpaid',
    notes: 'Curriculum planning for coding olympiad.',
  },
  {
    id: 4,
    book_id: 7,
    book: INITIAL_BOOKS[6],
    borrower_type: 'student',
    borrower_name: 'Rohan Varma',
    borrower_identifier: 'ADM-2026-089',
    borrower_contact: '+91 98204 45678',
    borrower_class: 'Class 8 - Section A',
    issue_date: '2026-09-26',
    due_date: '2026-10-10',
    status: 'overdue',
    fine_amount: 110.0,
    fine_status: 'unpaid',
    notes: 'Second overdue notice generated.',
  },
  {
    id: 5,
    book_id: 8,
    book: INITIAL_BOOKS[7],
    borrower_type: 'student',
    borrower_name: 'Ananya Deshmukh',
    borrower_identifier: 'ADM-2026-055',
    borrower_contact: '+91 98205 56789',
    borrower_class: 'Class 10 - Section B',
    issue_date: '2026-10-03',
    due_date: '2026-10-17',
    return_date: '2026-10-19',
    status: 'returned',
    fine_amount: 20.0,
    fine_status: 'paid',
    notes: 'Returned in good condition. Late fee paid at counter.',
  },
  {
    id: 6,
    book_id: 5,
    book: INITIAL_BOOKS[4],
    borrower_type: 'student',
    borrower_name: 'Tanmay Sengupta',
    borrower_identifier: 'ADM-2026-031',
    borrower_contact: '+91 98206 67890',
    borrower_class: 'Class 10 - Section A',
    issue_date: '2026-10-18',
    due_date: '2026-11-01',
    status: 'issued',
    fine_amount: 0,
    fine_status: 'unpaid',
    notes: 'Regular issue.',
  },
  {
    id: 7,
    book_id: 1,
    book: INITIAL_BOOKS[0],
    borrower_type: 'student',
    borrower_name: 'Priya Sharma',
    borrower_identifier: 'STU-2024-X-102',
    borrower_contact: '+91 98201 11223',
    borrower_class: 'Class 10 - Saffron (A) (Roll #102)',
    issue_date: '2026-09-12',
    due_date: '2026-09-26',
    return_date: '2026-09-25',
    status: 'returned',
    fine_amount: 0,
    fine_status: 'paid',
    notes: 'Returned on time in excellent condition.',
  },
  {
    id: 8,
    book_id: 1,
    book: INITIAL_BOOKS[0],
    borrower_type: 'student',
    borrower_name: 'Rohan Deshmukh',
    borrower_identifier: 'STU-2024-X-108',
    borrower_contact: '+91 98202 33445',
    borrower_class: 'Class 10 - Emerald (B) (Roll #108)',
    issue_date: '2026-08-08',
    due_date: '2026-08-22',
    return_date: '2026-08-21',
    status: 'returned',
    fine_amount: 0,
    fine_status: 'paid',
    notes: 'Term 1 science Olympiad reference.',
  },
  {
    id: 9,
    book_id: 2,
    book: INITIAL_BOOKS[1],
    borrower_type: 'student',
    borrower_name: 'Ishaan Verma',
    borrower_identifier: 'STU-2025-IX-025',
    borrower_contact: '+91 98204 55667',
    borrower_class: 'Class 9 - Sapphire (B) (Roll #25)',
    issue_date: '2026-09-01',
    due_date: '2026-09-15',
    return_date: '2026-09-14',
    status: 'returned',
    fine_amount: 0,
    fine_status: 'paid',
    notes: 'Midterm algebra test study.',
  },
];

const INITIAL_STUDENTS = [
  {
    id: 1,
    admission_number: 'STU-2024-X-101',
    roll_number: '101',
    first_name: 'Aarav',
    last_name: 'Patel',
    full_name: 'Aarav Patel',
    class_name: 'Class 10',
    division_name: 'Saffron (A)',
    guardian_phone: '+91 87672 27125',
    school_class: { id: 1, name: 'Class 10' },
    section: { id: 1, name: 'Saffron (A)' },
  },
  {
    id: 2,
    admission_number: 'STU-2024-X-102',
    roll_number: '102',
    first_name: 'Priya',
    last_name: 'Sharma',
    full_name: 'Priya Sharma',
    class_name: 'Class 10',
    division_name: 'Saffron (A)',
    guardian_phone: '+91 98201 11223',
    school_class: { id: 1, name: 'Class 10' },
    section: { id: 1, name: 'Saffron (A)' },
  },
  {
    id: 3,
    admission_number: 'STU-2024-X-108',
    roll_number: '108',
    first_name: 'Rohan',
    last_name: 'Deshmukh',
    full_name: 'Rohan Deshmukh',
    class_name: 'Class 10',
    division_name: 'Emerald (B)',
    guardian_phone: '+91 98202 33445',
    school_class: { id: 1, name: 'Class 10' },
    section: { id: 2, name: 'Emerald (B)' },
  },
  {
    id: 4,
    admission_number: 'STU-2025-IX-018',
    roll_number: '18',
    first_name: 'Kavya',
    last_name: 'Nair',
    full_name: 'Kavya Nair',
    class_name: 'Class 9',
    division_name: 'Ruby (A)',
    guardian_phone: '+91 98203 44556',
    school_class: { id: 2, name: 'Class 9' },
    section: { id: 3, name: 'Ruby (A)' },
  },
  {
    id: 5,
    admission_number: 'STU-2025-IX-025',
    roll_number: '25',
    first_name: 'Ishaan',
    last_name: 'Verma',
    full_name: 'Ishaan Verma',
    class_name: 'Class 9',
    division_name: 'Sapphire (B)',
    guardian_phone: '+91 98204 55667',
    school_class: { id: 2, name: 'Class 9' },
    section: { id: 4, name: 'Sapphire (B)' },
  },
  {
    id: 6,
    admission_number: 'STU-2025-VIII-012',
    roll_number: '12',
    first_name: 'Ananya',
    last_name: 'Kulkarni',
    full_name: 'Ananya Kulkarni',
    class_name: 'Class 8',
    division_name: 'Division A',
    guardian_phone: '+91 98205 66778',
    school_class: { id: 3, name: 'Class 8' },
    section: { id: 5, name: 'Division A' },
  },
  {
    id: 7,
    admission_number: 'STU-2025-VIII-034',
    roll_number: '34',
    first_name: 'Kabir',
    last_name: 'Mehta',
    full_name: 'Kabir Mehta',
    class_name: 'Class 8',
    division_name: 'Division B',
    guardian_phone: '+91 98206 77889',
    school_class: { id: 3, name: 'Class 8' },
    section: { id: 6, name: 'Division B' },
  },
  {
    id: 8,
    admission_number: 'STU-2023-XI-005',
    roll_number: '05',
    first_name: 'Tanvi',
    last_name: 'Joshi',
    full_name: 'Tanvi Joshi',
    class_name: 'Class 11',
    division_name: 'Science A',
    guardian_phone: '+91 98207 88990',
    school_class: { id: 4, name: 'Class 11' },
    section: { id: 7, name: 'Science A' },
  },
  {
    id: 9,
    admission_number: 'STU-2023-XII-009',
    roll_number: '09',
    first_name: 'Dev',
    last_name: 'Singhania',
    full_name: 'Dev Singhania',
    class_name: 'Class 12',
    division_name: 'Science A',
    guardian_phone: '+91 98208 99001',
    school_class: { id: 5, name: 'Class 12' },
    section: { id: 8, name: 'Science A' },
  },
];

export const libraryService = {
  /**
   * Fetch library stats
   */
  async getStats() {
    try {
      const res = await apiRequest.get('/library/stats');
      if (res && res.data) return res.data;
    } catch {
      // Fallback calculation
    }

    const totalTitles = INITIAL_BOOKS.length;
    const totalCopies = INITIAL_BOOKS.reduce((acc, b) => acc + (b.total_copies || 1), 0);
    const availableCopies = INITIAL_BOOKS.reduce((acc, b) => acc + (b.available_copies || 0), 0);
    const activeIssues = INITIAL_ISSUES.filter((i) => i.status === 'issued').length;
    const overdueCount = INITIAL_ISSUES.filter((i) => i.status === 'overdue').length;
    const finesCollected = INITIAL_ISSUES.filter((i) => i.fine_status === 'paid').reduce((acc, i) => acc + (i.fine_amount || 0), 0);
    const finesPending = INITIAL_ISSUES.filter((i) => i.fine_status === 'unpaid').reduce((acc, i) => acc + (i.fine_amount || 0), 0);

    const outOfStockCount = INITIAL_BOOKS.filter(
      (b) => (b.available_copies || 0) <= 0 || b.status === 'Out of Stock'
    ).length;

    return {
      total_titles: totalTitles,
      total_copies: totalCopies,
      available_copies: availableCopies,
      active_issues: activeIssues,
      overdue_count: overdueCount,
      out_of_stock_count: outOfStockCount,
      fines_collected: finesCollected,
      fines_pending: finesPending,
    };
  },

  /**
   * Get all books in catalog
   */
  async getBooks(params = {}) {
    try {
      const res = await apiRequest.get('/library/books', { params });
      if (res && res.data) {
        return {
          books: res.data,
          categories: res.categories || [...new Set(res.data.map((b) => b.category))],
        };
      }
    } catch {
      // Fallback
    }

    let filtered = [...INITIAL_BOOKS];
    if (params.category && params.category !== 'all') {
      filtered = filtered.filter((b) => b.category === params.category);
    }
    if (params.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(s) ||
          b.author.toLowerCase().includes(s) ||
          (b.isbn && b.isbn.toLowerCase().includes(s)) ||
          (b.book_code && b.book_code.toLowerCase().includes(s))
      );
    }

    return {
      books: filtered,
      categories: [...new Set(INITIAL_BOOKS.map((b) => b.category))],
    };
  },

  /**
   * Add new book
   */
  async createBook(bookData) {
    try {
      const res = await apiRequest.post('/library/books', bookData);
      if (res && res.data) return res.data;
    } catch {
      // Fallback local create
    }
    const rawTotal = parseInt(bookData.total_copies, 10);
    const totalCopies = isNaN(rawTotal) ? 0 : Math.max(0, rawTotal);
    const rawAvail = bookData.available_copies !== undefined && bookData.available_copies !== ''
      ? parseInt(bookData.available_copies, 10)
      : totalCopies;
    const availCopies = isNaN(rawAvail) ? 0 : Math.max(0, rawAvail);
    const defaultStatus = availCopies <= 0 ? 'Out of Stock' : (availCopies <= 2 ? 'Low Stock' : 'Available');

    const newBook = {
      id: Date.now(),
      ...bookData,
      total_copies: totalCopies,
      available_copies: availCopies,
      book_code: bookData.book_code || `BK-LIB-${Math.floor(1000 + Math.random() * 9000)}`,
      status: bookData.status || defaultStatus,
    };
    INITIAL_BOOKS.unshift(newBook);
    return newBook;
  },

  /**
   * Update existing book
   */
  async updateBook(id, bookData) {
    try {
      const res = await apiRequest.put(`/library/books/${id}`, bookData);
      if (res && res.data) return res.data;
    } catch {
      // Fallback
    }
    const idx = INITIAL_BOOKS.findIndex((b) => b.id === Number(id));
    if (idx !== -1) {
      const prev = INITIAL_BOOKS[idx];
      const rawTotal = bookData.total_copies !== undefined ? parseInt(bookData.total_copies, 10) : prev.total_copies;
      const totalCopies = isNaN(rawTotal) ? 0 : Math.max(0, rawTotal);
      const rawAvail = bookData.available_copies !== undefined 
        ? parseInt(bookData.available_copies, 10) 
        : (totalCopies === 0 ? 0 : prev.available_copies);
      const availCopies = isNaN(rawAvail) ? 0 : Math.max(0, rawAvail);
      const defaultStatus = availCopies <= 0 ? 'Out of Stock' : (availCopies <= 2 ? 'Low Stock' : 'Available');

      INITIAL_BOOKS[idx] = { 
        ...prev, 
        ...bookData,
        total_copies: totalCopies,
        available_copies: availCopies,
        status: bookData.status || defaultStatus,
      };
      return INITIAL_BOOKS[idx];
    }
    return null;
  },

  /**
   * Delete book
   */
  async deleteBook(id, force = false) {
    try {
      const url = `/library/books/${id}${force ? '?force=1' : ''}`;
      const res = await apiRequest.delete(url);
      const idx = INITIAL_BOOKS.findIndex((b) => b.id === Number(id));
      if (idx !== -1) INITIAL_BOOKS.splice(idx, 1);
      return res;
    } catch (err) {
      // Propagate error with message and details so UI can display proper error/confirmation
      const errorMsg = err.data?.message || err.message || 'Failed to delete book';
      const customErr = new Error(errorMsg);
      customErr.has_active_issues = err.data?.has_active_issues || false;
      customErr.active_issues_count = err.data?.active_issues_count || 0;
      throw customErr;
    }
  },

  /**
   * Get circulation issues list
   */
  async getIssues(params = {}) {
    try {
      const res = await apiRequest.get('/library/issues', { params });
      if (res && res.data) return res.data;
    } catch {
      // Fallback
    }

    let filtered = [...INITIAL_ISSUES];
    if (params.book_id && params.book_id !== 'all') {
      filtered = filtered.filter((i) => String(i.book_id) === String(params.book_id));
    }
    if (params.borrower_type && params.borrower_type !== 'all') {
      filtered = filtered.filter((i) => i.borrower_type === params.borrower_type);
    }
    if (params.from_date) {
      filtered = filtered.filter((i) => i.issue_date >= params.from_date);
    }
    if (params.to_date) {
      filtered = filtered.filter((i) => i.issue_date <= params.to_date);
    }
    if (params.status && params.status !== 'all') {
      filtered = filtered.filter((i) => i.status === params.status);
    }
    if (params.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.borrower_name.toLowerCase().includes(s) ||
          (i.borrower_identifier && i.borrower_identifier.toLowerCase().includes(s)) ||
          (i.borrower_class && i.borrower_class.toLowerCase().includes(s)) ||
          (i.book && i.book.title.toLowerCase().includes(s))
      );
    }
    return filtered;
  },

  /**
   * Issue a book
   */
  async issueBook(issueData) {
    try {
      const res = await apiRequest.post('/library/issues/issue', issueData);
      if (res && res.data) return res.data;
    } catch {
      // Fallback
    }

    const matchedBook = INITIAL_BOOKS.find((b) => b.id === Number(issueData.book_id));
    if (matchedBook && matchedBook.available_copies > 0) {
      matchedBook.available_copies -= 1;
      if (matchedBook.available_copies === 0) matchedBook.status = 'Issued';
    }

    const newIssue = {
      id: Date.now(),
      book_id: Number(issueData.book_id),
      book: matchedBook,
      ...issueData,
      status: 'issued',
      fine_amount: 0,
      fine_status: 'unpaid',
    };
    INITIAL_ISSUES.unshift(newIssue);
    return newIssue;
  },

  /**
   * Mark book as returned
   */
  async returnBook(id, returnData = {}) {
    try {
      const res = await apiRequest.post(`/library/issues/${id}/return`, returnData);
      if (res && res.data) return res.data;
    } catch {
      // Fallback
    }

    const issue = INITIAL_ISSUES.find((i) => i.id === Number(id));
    if (issue) {
      issue.status = 'returned';
      issue.return_date = returnData.return_date || new Date().toISOString().split('T')[0];
      if (returnData.fine_amount !== undefined) issue.fine_amount = returnData.fine_amount;
      if (returnData.fine_status) issue.fine_status = returnData.fine_status;
      if (issue.book) {
        issue.book.available_copies = (issue.book.available_copies || 0) + 1;
        issue.book.status = 'Available';
      }
      return issue;
    }
    return null;
  },

  /**
   * Update fine status (paid / waived)
   */
  async updateFine(id, fineData) {
    try {
      const res = await apiRequest(`/library/issues/${id}/fine`, {
        method: 'PATCH',
        body: fineData,
      });
      if (res && res.data) return res.data;
    } catch {
      // Fallback
    }
    const issue = INITIAL_ISSUES.find((i) => i.id === Number(id));
    if (issue) {
      if (fineData.fine_status) issue.fine_status = fineData.fine_status;
      if (fineData.fine_amount !== undefined) issue.fine_amount = fineData.fine_amount;
      return issue;
    }
    return null;
  },

  /**
   * Fetch students roster for member picker
   */
  async getStudents(params = {}) {
    try {
      const res = await apiRequest.get('/library/students', { params });
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch {
      // Fallback to admin route or mock
    }

    try {
      const adminRes = await apiRequest.get('/admin/students', { params: { per_page: 200, ...params } });
      if (adminRes && adminRes.data) {
        const list = Array.isArray(adminRes.data) ? adminRes.data : (adminRes.data.data || []);
        if (list.length > 0) return list;
      }
    } catch {
      // Fallback to INITIAL_STUDENTS
    }

    let filtered = [...INITIAL_STUDENTS];
    if (params.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(
        (st) =>
          (st.full_name && st.full_name.toLowerCase().includes(s)) ||
          (st.first_name && st.first_name.toLowerCase().includes(s)) ||
          (st.last_name && st.last_name.toLowerCase().includes(s)) ||
          (st.admission_number && st.admission_number.toLowerCase().includes(s)) ||
          (st.roll_number && String(st.roll_number).toLowerCase().includes(s)) ||
          (st.class_name && st.class_name.toLowerCase().includes(s)) ||
          (st.division_name && st.division_name.toLowerCase().includes(s))
      );
    }
    return filtered;
  },

  /**
   * Get Library Overdue Fine Rules & Policy Settings
   */
  async getFineRules() {
    try {
      const res = await apiRequest.get('/library/settings/fine-rules');
      if (res && res.data) return res.data;
    } catch {
      // Fallback
    }

    const saved = localStorage.getItem('arch_library_fine_rules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }

    return {
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
    };
  },

  /**
   * Update Library Overdue Fine Rules & Policy Settings
   */
  async updateFineRules(rulesData) {
    try {
      const res = await apiRequest('/library/settings/fine-rules', {
        method: 'POST',
        body: rulesData,
      });
      if (res && res.data) {
        localStorage.setItem('arch_library_fine_rules', JSON.stringify(res.data));
        return res.data;
      }
    } catch {
      // Fallback
    }

    localStorage.setItem('arch_library_fine_rules', JSON.stringify(rulesData));
    return rulesData;
  },
};

