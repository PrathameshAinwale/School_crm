<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\BookIssue;
use App\Models\School;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class LibrarySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $school = School::first();
        $schoolId = $school ? $school->id : 1;

        // 1. Ensure Librarian user exists
        User::updateOrCreate(
            ['email' => 'library@school.com'],
            [
                'school_id' => $schoolId,
                'name' => 'Meena Iyer (Chief Librarian)',
                'phone' => '9876543215',
                'password' => Hash::make('111111'),
                'role' => 'librarian',
                'must_change_password' => false,
                'status' => 'active',
            ]
        );

        // 2. Sample Books Catalog
        $booksData = [
            [
                'book_code' => 'BK-SCI-1001',
                'title' => 'Concepts of Physics (Vol 1 & 2)',
                'author' => 'Dr. H. C. Verma',
                'isbn' => '978-8177091878',
                'category' => 'Science & Physics',
                'publisher' => 'Bharati Bhavan',
                'edition_year' => '2023',
                'shelf_location' => 'Rack A-1, Row 2',
                'total_copies' => 12,
                'available_copies' => 9,
                'status' => 'Available',
                'description' => 'Comprehensive fundamentals of physics for high school & competitive exams with problem solving.',
            ],
            [
                'book_code' => 'BK-MAT-1002',
                'title' => 'Higher Algebra & Coordinate Geometry',
                'author' => 'Hall & Knight / S. L. Loney',
                'isbn' => '978-9351761891',
                'category' => 'Mathematics',
                'publisher' => 'Arihant Classics',
                'edition_year' => '2022',
                'shelf_location' => 'Rack B-2, Row 1',
                'total_copies' => 10,
                'available_copies' => 8,
                'status' => 'Available',
                'description' => 'Classic textbook on polynomials, progression, inequalities, and analytical geometry.',
            ],
            [
                'book_code' => 'BK-CS-1003',
                'title' => 'Introduction to Algorithms (CLRS)',
                'author' => 'Cormen, Leiserson, Rivest, Stein',
                'isbn' => '978-0262033848',
                'category' => 'Computer Science',
                'publisher' => 'MIT Press',
                'edition_year' => '2021',
                'shelf_location' => 'Rack D-3, Row 3',
                'total_copies' => 6,
                'available_copies' => 4,
                'status' => 'Available',
                'description' => 'The standard handbook and foundational algorithms textbook for computer science students.',
            ],
            [
                'book_code' => 'BK-LIT-1004',
                'title' => 'To Kill a Mockingbird',
                'author' => 'Harper Lee',
                'isbn' => '978-0061120084',
                'category' => 'World Literature',
                'publisher' => 'HarperCollins',
                'edition_year' => '2019',
                'shelf_location' => 'Rack E-1, Row 2',
                'total_copies' => 8,
                'available_copies' => 7,
                'status' => 'Available',
                'description' => 'Pulitzer prize winning classic masterpiece exploring warmth, justice, and human compassion.',
            ],
            [
                'book_code' => 'BK-SCI-1005',
                'title' => 'Organic Chemistry (Wade & Simek)',
                'author' => 'L. G. Wade Jr.',
                'isbn' => '978-0134161601',
                'category' => 'Science & Chemistry',
                'publisher' => 'Pearson Education',
                'edition_year' => '2022',
                'shelf_location' => 'Rack A-3, Row 1',
                'total_copies' => 8,
                'available_copies' => 6,
                'status' => 'Available',
                'description' => 'Mechanisms, molecular structures, and reaction pathways tailored for senior secondary labs.',
            ],
            [
                'book_code' => 'BK-HIS-1006',
                'title' => 'India: An Ancient Civilization',
                'author' => 'Romila Thapar',
                'isbn' => '978-0143029144',
                'category' => 'History & Social Studies',
                'publisher' => 'Penguin Books',
                'edition_year' => '2020',
                'shelf_location' => 'Rack C-2, Row 4',
                'total_copies' => 7,
                'available_copies' => 7,
                'status' => 'Available',
                'description' => 'Detailed socio-cultural history of ancient Indian dynasties, trade routes, and governance.',
            ],
            [
                'book_code' => 'BK-FIC-1007',
                'title' => 'The Discovery of India',
                'author' => 'Jawaharlal Nehru',
                'isbn' => '978-0143031031',
                'category' => 'Historical Biography',
                'publisher' => 'Oxford University Press',
                'edition_year' => '2021',
                'shelf_location' => 'Rack C-1, Row 1',
                'total_copies' => 5,
                'available_copies' => 3,
                'status' => 'Available',
                'description' => 'Written in prison, charting philosophy, art, and the freedom movement of the Indian subcontinent.',
            ],
            [
                'book_code' => 'BK-CS-1008',
                'title' => 'Python Programming for Beginners & AI',
                'author' => 'Eric Matthes',
                'isbn' => '978-1593279288',
                'category' => 'Computer Science',
                'publisher' => 'No Starch Press',
                'edition_year' => '2023',
                'shelf_location' => 'Rack D-1, Row 2',
                'total_copies' => 15,
                'available_copies' => 11,
                'status' => 'Available',
                'description' => 'Practical project-based introduction to Python syntax, data science, and web applications.',
            ],
            [
                'book_code' => 'BK-BIO-1009',
                'title' => 'Campbell Biology (Global Edition)',
                'author' => 'Jane B. Reece & Lisa A. Urry',
                'isbn' => '978-1292170435',
                'category' => 'Science & Biology',
                'publisher' => 'Pearson',
                'edition_year' => '2022',
                'shelf_location' => 'Rack A-4, Row 3',
                'total_copies' => 6,
                'available_copies' => 5,
                'status' => 'Available',
                'description' => 'The premier introductory biological sciences reference text with full-color visual diagrams.',
            ],
            [
                'book_code' => 'BK-ENG-1010',
                'title' => 'Oxford Advanced Learner\'s Dictionary (10th Ed)',
                'author' => 'A. S. Hornby',
                'isbn' => '978-0194798488',
                'category' => 'Reference & Dictionaries',
                'publisher' => 'Oxford University Press',
                'edition_year' => '2023',
                'shelf_location' => 'Reference Desk R-1',
                'total_copies' => 10,
                'available_copies' => 10,
                'status' => 'Available',
                'description' => 'Essential language companion with over 200,000 words, phrases, and illustrative sentence usage.',
            ],
        ];

        $createdBooks = [];
        foreach ($booksData as $b) {
            $createdBooks[] = Book::updateOrCreate(
                ['book_code' => $b['book_code']],
                array_merge($b, ['school_id' => $schoolId])
            );
        }

        // 3. Sample Circulation Desk Records (Issues & Returns)
        $today = Carbon::today();

        $issuesData = [
            [
                'book_id' => $createdBooks[0]->id, // Concepts of Physics
                'borrower_type' => 'student',
                'borrower_name' => 'Aarav Sharma',
                'borrower_identifier' => 'ADM-2026-042',
                'borrower_contact' => '+91 98201 12345',
                'borrower_class' => 'Class 10 - Section A',
                'issue_date' => $today->copy()->subDays(10)->toDateString(),
                'due_date' => $today->copy()->addDays(4)->toDateString(),
                'status' => 'issued',
                'fine_amount' => 0,
                'notes' => 'Exam preparation issue for Mid-Term boards.',
            ],
            [
                'book_id' => $createdBooks[0]->id, // Physics - previous borrower
                'borrower_type' => 'student',
                'borrower_name' => 'Priya Sharma',
                'borrower_identifier' => 'STU-2024-X-102',
                'borrower_contact' => '+91 98201 11223',
                'borrower_class' => 'Class 10 - Saffron (A) (Roll #102)',
                'issue_date' => $today->copy()->subDays(40)->toDateString(),
                'due_date' => $today->copy()->subDays(26)->toDateString(),
                'return_date' => $today->copy()->subDays(27)->toDateString(),
                'status' => 'returned',
                'fine_amount' => 0,
                'fine_status' => 'paid',
                'notes' => 'Returned on time in excellent condition.',
            ],
            [
                'book_id' => $createdBooks[0]->id, // Physics - earlier term borrower
                'borrower_type' => 'student',
                'borrower_name' => 'Rohan Deshmukh',
                'borrower_identifier' => 'STU-2024-X-108',
                'borrower_contact' => '+91 98202 33445',
                'borrower_class' => 'Class 10 - Emerald (B) (Roll #108)',
                'issue_date' => $today->copy()->subDays(75)->toDateString(),
                'due_date' => $today->copy()->subDays(61)->toDateString(),
                'return_date' => $today->copy()->subDays(60)->toDateString(),
                'status' => 'returned',
                'fine_amount' => 0,
                'fine_status' => 'paid',
                'notes' => 'Term 1 science Olympiad reference.',
            ],
            [
                'book_id' => $createdBooks[1]->id, // Higher Algebra
                'borrower_type' => 'student',
                'borrower_name' => 'Kavya Nair',
                'borrower_identifier' => 'ADM-2026-018',
                'borrower_contact' => '+91 98202 23456',
                'borrower_class' => 'Class 9 - Section B',
                'issue_date' => $today->copy()->subDays(20)->toDateString(),
                'due_date' => $today->copy()->subDays(6)->toDateString(),
                'status' => 'overdue',
                'fine_amount' => 60.00, // 6 days overdue * 10
                'fine_status' => 'unpaid',
                'notes' => 'Reminder SMS dispatched to parent contact.',
            ],
            [
                'book_id' => $createdBooks[1]->id, // Higher Algebra - previous borrower
                'borrower_type' => 'student',
                'borrower_name' => 'Ishaan Verma',
                'borrower_identifier' => 'STU-2025-IX-025',
                'borrower_contact' => '+91 98204 55667',
                'borrower_class' => 'Class 9 - Sapphire (B) (Roll #25)',
                'issue_date' => $today->copy()->subDays(45)->toDateString(),
                'due_date' => $today->copy()->subDays(31)->toDateString(),
                'return_date' => $today->copy()->subDays(32)->toDateString(),
                'status' => 'returned',
                'fine_amount' => 0,
                'fine_status' => 'paid',
                'notes' => 'Midterm algebra test study.',
            ],
            [
                'book_id' => $createdBooks[2]->id, // CLRS Algorithms
                'borrower_type' => 'teacher',
                'borrower_name' => 'Mrs. Deepa K. (Computer Dept)',
                'borrower_identifier' => 'EMP-TCH-104',
                'borrower_contact' => '+91 98203 34567',
                'borrower_class' => 'Faculty / CS Dept',
                'issue_date' => $today->copy()->subDays(5)->toDateString(),
                'due_date' => $today->copy()->addDays(25)->toDateString(),
                'status' => 'issued',
                'fine_amount' => 0,
                'notes' => 'Curriculum planning for coding olympiad.',
            ],
            [
                'book_id' => $createdBooks[6]->id, // Discovery of India
                'borrower_type' => 'student',
                'borrower_name' => 'Rohan Varma',
                'borrower_identifier' => 'ADM-2026-089',
                'borrower_contact' => '+91 98204 45678',
                'borrower_class' => 'Class 8 - Section A',
                'issue_date' => $today->copy()->subDays(25)->toDateString(),
                'due_date' => $today->copy()->subDays(11)->toDateString(),
                'status' => 'overdue',
                'fine_amount' => 110.00,
                'fine_status' => 'unpaid',
                'notes' => 'Second overdue notice generated.',
            ],
            [
                'book_id' => $createdBooks[7]->id, // Python Programming
                'borrower_type' => 'student',
                'borrower_name' => 'Ananya Deshmukh',
                'borrower_identifier' => 'ADM-2026-055',
                'borrower_contact' => '+91 98205 56789',
                'borrower_class' => 'Class 10 - Section B',
                'issue_date' => $today->copy()->subDays(18)->toDateString(),
                'due_date' => $today->copy()->subDays(4)->toDateString(),
                'return_date' => $today->copy()->subDays(2)->toDateString(),
                'status' => 'returned',
                'fine_amount' => 20.00,
                'fine_status' => 'paid',
                'notes' => 'Returned in good condition. Late fee paid at counter.',
            ],
            [
                'book_id' => $createdBooks[4]->id, // Organic Chemistry
                'borrower_type' => 'student',
                'borrower_name' => 'Tanmay Sengupta',
                'borrower_identifier' => 'ADM-2026-031',
                'borrower_contact' => '+91 98206 67890',
                'borrower_class' => 'Class 10 - Section A',
                'issue_date' => $today->copy()->subDays(3)->toDateString(),
                'due_date' => $today->copy()->addDays(11)->toDateString(),
                'status' => 'issued',
                'fine_amount' => 0,
                'notes' => 'Regular issue.',
            ],
        ];

        foreach ($issuesData as $issue) {
            BookIssue::updateOrCreate(
                [
                    'book_id' => $issue['book_id'],
                    'borrower_identifier' => $issue['borrower_identifier'],
                    'issue_date' => $issue['issue_date'],
                ],
                array_merge($issue, ['school_id' => $schoolId])
            );
        }
    }
}
