<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookIssue;
use App\Models\LibrarySetting;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LibraryController extends Controller
{
    /**
     * Get all books with filtering and search
     */
    public function index(Request $request)
    {
        $query = Book::query();

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = trim($request->search);
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                    ->orWhere('author', 'like', "%{$s}%")
                    ->orWhere('isbn', 'like', "%{$s}%")
                    ->orWhere('book_code', 'like', "%{$s}%");
            });
        }

        $books = $query->orderBy('title')->get();

        $categories = Book::select('category')
            ->distinct()
            ->whereNotNull('category')
            ->pluck('category');

        return response()->json([
            'success' => true,
            'data' => $books,
            'categories' => $categories,
        ]);
    }

    /**
     * Get high-level Library statistics
     */
    public function stats()
    {
        $today = Carbon::today()->toDateString();

        $totalTitles = Book::count();
        $totalCopies = Book::sum('total_copies');
        $availableCopies = Book::sum('available_copies');
        $activeIssuesCount = BookIssue::where('status', 'issued')->count();

        // Mark overdue issues if due_date has passed
        BookIssue::where('status', 'issued')
            ->where('due_date', '<', $today)
            ->update(['status' => 'overdue']);

        $overdueCount = BookIssue::where('status', 'overdue')->count();

        $finesCollected = BookIssue::where('fine_status', 'paid')->sum('fine_amount');
        $finesPending = BookIssue::where('fine_status', 'unpaid')->where('fine_amount', '>', 0)->sum('fine_amount');
        $outOfStockCount = Book::where('available_copies', '<=', 0)->orWhere('status', 'Out of Stock')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_titles' => $totalTitles,
                'total_copies' => (int) $totalCopies,
                'available_copies' => (int) $availableCopies,
                'active_issues' => $activeIssuesCount,
                'overdue_count' => $overdueCount,
                'out_of_stock_count' => $outOfStockCount,
                'fines_collected' => (float) $finesCollected,
                'fines_pending' => (float) $finesPending,
            ],
        ]);
    }

    /**
     * Create a new book in the library catalog
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'isbn' => 'nullable|string|max:50',
            'book_code' => 'nullable|string|max:50',
            'publisher' => 'nullable|string|max:255',
            'edition_year' => 'nullable|string|max:20',
            'shelf_location' => 'nullable|string|max:100',
            'total_copies' => 'required|integer|min:0',
            'available_copies' => 'nullable|integer|min:0',
            'status' => 'nullable|string|max:50',
            'description' => 'nullable|string',
        ]);

        if (empty($validated['book_code'])) {
            $prefix = strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $validated['category']), 0, 3));
            if (!$prefix) $prefix = 'LIB';
            $validated['book_code'] = 'BK-' . $prefix . '-' . rand(1000, 9999);
        }

        if (!isset($validated['available_copies'])) {
            $validated['available_copies'] = $validated['total_copies'];
        }

        if (empty($validated['status'])) {
            $validated['status'] = $validated['available_copies'] > 0 ? 'Available' : 'Out of Stock';
        }

        $book = Book::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Book added to library successfully',
            'data' => $book,
        ], 201);
    }

    /**
     * Update an existing book
     */
    public function update(Request $request, $id)
    {
        $book = Book::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'author' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|string|max:100',
            'isbn' => 'nullable|string|max:50',
            'book_code' => 'nullable|string|max:50',
            'publisher' => 'nullable|string|max:255',
            'edition_year' => 'nullable|string|max:20',
            'shelf_location' => 'nullable|string|max:100',
            'total_copies' => 'sometimes|required|integer|min:0',
            'available_copies' => 'nullable|integer|min:0',
            'status' => 'nullable|string|max:50',
            'description' => 'nullable|string',
        ]);

        $issuedCount = max(0, $book->total_copies - $book->available_copies);

        if (isset($validated['total_copies'])) {
            if ($validated['total_copies'] < $issuedCount) {
                return response()->json([
                    'success' => false,
                    'message' => "Cannot reduce total copies below currently issued copies ({$issuedCount}). Return active loans first.",
                ], 422);
            }
            if (!isset($validated['available_copies'])) {
                $validated['available_copies'] = max(0, $validated['total_copies'] - $issuedCount);
            }
        }

        if (isset($validated['available_copies'])) {
            if ($validated['available_copies'] > $book->total_copies && !isset($validated['total_copies'])) {
                $validated['total_copies'] = $validated['available_copies'];
            }
        }

        if (empty($validated['status'])) {
            $avail = $validated['available_copies'] ?? $book->available_copies;
            $validated['status'] = $avail > 0 ? ($avail <= 2 ? 'Low Stock' : 'Available') : 'Out of Stock';
        }

        $book->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Book details updated successfully',
            'data' => $book,
        ]);
    }

    /**
     * Delete / retire book from catalog
     */
    public function destroy(Request $request, $id)
    {
        $book = Book::findOrFail($id);

        $activeIssues = BookIssue::where('book_id', $book->id)
            ->whereIn('status', ['issued', 'overdue'])
            ->count();

        // If force parameter is provided or if no active issues, proceed with delete
        if ($activeIssues > 0 && !$request->boolean('force')) {
            return response()->json([
                'success' => false,
                'has_active_issues' => true,
                'active_issues_count' => $activeIssues,
                'message' => "Cannot delete '{$book->title}' because {$activeIssues} copy(ies) are currently issued on loan. Confirm force retirement to close active loans and delete.",
            ], 422);
        }

        DB::beginTransaction();
        try {
            if ($activeIssues > 0 && $request->boolean('force')) {
                BookIssue::where('book_id', $book->id)
                    ->whereIn('status', ['issued', 'overdue'])
                    ->update([
                        'status' => 'returned',
                        'return_date' => Carbon::today()->toDateString(),
                        'notes' => DB::raw("CONCAT(COALESCE(notes, ''), ' [Book retired/deleted from library catalog]')"),
                    ]);
            }

            $book->delete();
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "'{$book->title}' has been removed from library catalog.",
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete book: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * List all borrowing / circulation records
     */
    public function issues(Request $request)
    {
        $today = Carbon::today()->toDateString();

        // Update any overdue records dynamically
        BookIssue::where('status', 'issued')
            ->where('due_date', '<', $today)
            ->update(['status' => 'overdue']);

        $query = BookIssue::with('book');

        if ($request->filled('book_id') && $request->book_id !== 'all') {
            $query->where('book_id', $request->book_id);
        }

        if ($request->filled('borrower_type') && $request->borrower_type !== 'all') {
            $query->where('borrower_type', $request->borrower_type);
        }

        if ($request->filled('from_date')) {
            $query->whereDate('issue_date', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('issue_date', '<=', $request->to_date);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = trim($request->search);
            $query->where(function ($q) use ($s) {
                $q->where('borrower_name', 'like', "%{$s}%")
                    ->orWhere('borrower_identifier', 'like', "%{$s}%")
                    ->orWhere('borrower_class', 'like', "%{$s}%")
                    ->orWhereHas('book', function ($bq) use ($s) {
                        $bq->where('title', 'like', "%{$s}%")
                            ->orWhere('book_code', 'like', "%{$s}%");
                    });
            });
        }

        $issues = $query->orderByDesc('created_at')->get();

        // Calculate dynamic overdue fine for preview (₹10 per day overdue)
        $issues->transform(function ($item) use ($today) {
            if ($item->status === 'overdue' && $item->due_date) {
                $dueDate = Carbon::parse($item->due_date);
                $daysOverdue = max(0, Carbon::parse($today)->diffInDays($dueDate));
                if ($item->fine_amount <= 0 && $daysOverdue > 0) {
                    $item->calculated_fine = $daysOverdue * 10;
                }
            }
            return $item;
        });

        return response()->json([
            'success' => true,
            'data' => $issues,
        ]);
    }

    /**
     * Issue a book to student or staff
     */
    public function issueBook(Request $request)
    {
        $validated = $request->validate([
            'book_id' => 'required|exists:books,id',
            'borrower_type' => 'required|in:student,teacher,staff',
            'borrower_name' => 'required|string|max:255',
            'borrower_identifier' => 'nullable|string|max:100',
            'borrower_contact' => 'nullable|string|max:50',
            'borrower_class' => 'nullable|string|max:100',
            'issue_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:issue_date',
            'notes' => 'nullable|string',
        ]);

        $book = Book::findOrFail($validated['book_id']);

        if ($book->available_copies < 1) {
            return response()->json([
                'success' => false,
                'message' => "All copies of '{$book->title}' are currently issued out.",
            ], 422);
        }

        DB::beginTransaction();
        try {
            $issue = BookIssue::create([
                'book_id' => $book->id,
                'borrower_type' => $validated['borrower_type'],
                'borrower_name' => $validated['borrower_name'],
                'borrower_identifier' => $validated['borrower_identifier'] ?? null,
                'borrower_contact' => $validated['borrower_contact'] ?? null,
                'borrower_class' => $validated['borrower_class'] ?? null,
                'issue_date' => $validated['issue_date'],
                'due_date' => $validated['due_date'],
                'status' => 'issued',
                'notes' => $validated['notes'] ?? null,
            ]);

            $book->decrement('available_copies', 1);
            if ($book->available_copies === 0) {
                $book->update(['status' => 'Issued']);
            }

            DB::commit();

            $issue->load('book');

            return response()->json([
                'success' => true,
                'message' => "'{$book->title}' issued successfully to {$validated['borrower_name']}",
                'data' => $issue,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to issue book: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mark an issued book as returned and handle fine
     */
    public function returnBook(Request $request, $id)
    {
        $issue = BookIssue::with('book')->findOrFail($id);

        if ($issue->status === 'returned') {
            return response()->json([
                'success' => false,
                'message' => 'This book has already been marked as returned.',
            ], 422);
        }

        $returnDate = $request->input('return_date', Carbon::today()->toDateString());
        $fineAmount = $request->input('fine_amount');
        $fineStatus = $request->input('fine_status', 'unpaid');

        // Automatically calculate fine based on active Library Fine Rules if not explicitly provided
        if ($fineAmount === null && $issue->due_date) {
            $settings = LibrarySetting::getActiveSettings();
            $dueDate = Carbon::parse($issue->due_date);
            $retDate = Carbon::parse($returnDate);

            if ($retDate->gt($dueDate)) {
                $overdueDays = $retDate->diffInDays($dueDate);
                $graceDays = (int) ($settings->grace_period_days ?? 0);

                if ($overdueDays > $graceDays) {
                    $chargeableDays = $overdueDays - $graceDays;

                    // Apply borrower type rate
                    $rate = (float) $settings->fine_per_day;
                    if ($issue->borrower_type === 'student' && isset($settings->student_fine_per_day)) {
                        $rate = (float) $settings->student_fine_per_day;
                    } elseif ($issue->borrower_type === 'teacher' && isset($settings->teacher_fine_per_day)) {
                        $rate = (float) $settings->teacher_fine_per_day;
                    } elseif ($issue->borrower_type === 'staff' && isset($settings->staff_fine_per_day)) {
                        $rate = (float) $settings->staff_fine_per_day;
                    }

                    $calculatedFine = $chargeableDays * $rate;
                    if ($settings->max_fine_cap > 0) {
                        $calculatedFine = min($calculatedFine, (float) $settings->max_fine_cap);
                    }
                    $fineAmount = round($calculatedFine, 2);
                } else {
                    $fineAmount = 0; // Covered by grace period
                }
            } else {
                $fineAmount = 0;
            }
        }

        DB::beginTransaction();
        try {
            $issue->update([
                'return_date' => $returnDate,
                'status' => 'returned',
                'fine_amount' => $fineAmount ?: 0,
                'fine_status' => ($fineAmount > 0) ? $fineStatus : 'paid',
                'notes' => $request->input('notes', $issue->notes),
            ]);

            // Increment available copies on the book
            if ($issue->book) {
                $issue->book->increment('available_copies', 1);
                if ($issue->book->status === 'Issued' && $issue->book->available_copies > 0) {
                    $issue->book->update(['status' => 'Available']);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Book returned successfully to library.',
                'data' => $issue,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to return book: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Settle or waive fine for an issue
     */
    public function updateFine(Request $request, $id)
    {
        $issue = BookIssue::findOrFail($id);

        $validated = $request->validate([
            'fine_status' => 'required|in:paid,unpaid,waived',
            'fine_amount' => 'nullable|numeric|min:0',
        ]);

        $issue->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Fine status updated successfully',
            'data' => $issue,
        ]);
    }

    /**
     * Get students directory for library issue picker with class, division, roll number, name & student id
     */
    public function students(Request $request)
    {
        $query = \App\Models\Student::with(['schoolClass', 'section']);

        if ($request->filled('search')) {
            $s = trim($request->search);
            $query->where(function ($q) use ($s) {
                $q->where('first_name', 'like', "%{$s}%")
                    ->orWhere('last_name', 'like', "%{$s}%")
                    ->orWhere('admission_number', 'like', "%{$s}%")
                    ->orWhere('roll_number', 'like', "%{$s}%")
                    ->orWhereHas('schoolClass', function ($cq) use ($s) {
                        $cq->where('name', 'like', "%{$s}%");
                    })
                    ->orWhereHas('section', function ($sq) use ($s) {
                        $sq->where('name', 'like', "%{$s}%");
                    });
            });
        }

        if ($request->filled('class_id') && $request->class_id !== 'all') {
            $query->where('school_class_id', $request->class_id);
        }

        $students = $query->where('status', 'Active')
            ->orderBy('first_name')
            ->limit(200)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $students,
        ]);
    }

    /**
     * Get active Library Overdue Fine Rules & Policies
     */
    public function getFineRules()
    {
        $settings = LibrarySetting::getActiveSettings();

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * Update Library Overdue Fine Rules & Policies (Admin only)
     */
    public function updateFineRules(Request $request)
    {
        $validated = $request->validate([
            'fine_per_day' => 'required|numeric|min:0',
            'grace_period_days' => 'required|integer|min:0|max:30',
            'max_fine_cap' => 'required|numeric|min:0',
            'student_fine_per_day' => 'nullable|numeric|min:0',
            'teacher_fine_per_day' => 'nullable|numeric|min:0',
            'staff_fine_per_day' => 'nullable|numeric|min:0',
            'default_loan_days_student' => 'nullable|integer|min:1|max:90',
            'default_loan_days_teacher' => 'nullable|integer|min:1|max:180',
            'default_loan_days_staff' => 'nullable|integer|min:1|max:90',
            'max_books_per_student' => 'nullable|integer|min:1|max:20',
            'max_books_per_teacher' => 'nullable|integer|min:1|max:30',
            'allow_librarian_fine_waiver' => 'nullable|boolean',
            'send_overdue_reminders' => 'nullable|boolean',
        ]);

        $settings = LibrarySetting::getActiveSettings();
        $settings->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Library overdue fine rules and policies saved successfully',
            'data' => $settings,
        ]);
    }
}
