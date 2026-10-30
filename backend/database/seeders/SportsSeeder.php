<?php

namespace Database\Seeders;

use App\Models\School;
use App\Models\Sport;
use App\Models\SportsCompetition;
use App\Models\SportsParticipant;
use App\Models\SportsFacility;
use App\Models\SportsTrainingSchedule;
use App\Models\SportsEquipment;
use App\Models\SportsEquipmentIssue;
use App\Models\SportsFitnessAssessment;
use App\Models\Student;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SportsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command?->warn("SportsSeeder contains demo fixture accounts with default credentials and cannot be executed in production.");
            return;
        }

        $school = School::where('code', 'DPS-101')->first() ?? School::first();
        if (!$school) {
            return;
        }

        // 1. Create or Update Sports Incharge User
        $sportsUser = User::updateOrCreate(
            ['email' => 'sports@school.com'],
            [
                'school_id' => $school->id,
                'name' => 'Col. Ranveer Rana (Sports Incharge)',
                'phone' => '9876543215',
                'password' => Hash::make('111111'),
                'role' => 'sports_incharge',
                'status' => 'active',
                'must_change_password' => false,
            ]
        );

        // 2. Create Sports Disciplines
        $sportsData = [
            [
                'school_id' => $school->id,
                'code' => 'SPT-FTB',
                'name' => 'Football',
                'category' => 'Outdoor',
                'coach_name' => 'Col. Ranveer Rana',
                'venue' => 'Main Turf Ground',
                'max_players' => 22,
                'description' => '11-a-side competitive association football team and grassroots academy.',
                'status' => 'Active',
            ],
            [
                'school_id' => $school->id,
                'code' => 'SPT-BSK',
                'name' => 'Basketball',
                'category' => 'Outdoor',
                'coach_name' => 'Coach Sunil Gavaskar',
                'venue' => 'Synthetic Basketball Court A',
                'max_players' => 15,
                'description' => 'Full-court basketball program competing in inter-school and CBSE clusters.',
                'status' => 'Active',
            ],
            [
                'school_id' => $school->id,
                'code' => 'SPT-CRK',
                'name' => 'Cricket',
                'category' => 'Outdoor',
                'coach_name' => 'Coach Rajesh Rawat',
                'venue' => 'Cricket Oval & Nets',
                'max_players' => 25,
                'description' => 'T20 and One Day leather ball cricket program with bowling machine nets.',
                'status' => 'Active',
            ],
            [
                'school_id' => $school->id,
                'code' => 'SPT-ATH',
                'name' => 'Athletics & Track',
                'category' => 'Track & Field',
                'coach_name' => 'P.T. Usha Memorial Coach',
                'venue' => '400m Olympic Track',
                'max_players' => 30,
                'description' => '100m, 200m, 400m sprint relays, long jump, shot put & high jump.',
                'status' => 'Active',
            ],
            [
                'school_id' => $school->id,
                'code' => 'SPT-BDM',
                'name' => 'Badminton',
                'category' => 'Indoor',
                'coach_name' => 'Coach Pullela K.',
                'venue' => 'Indoor Badminton Arena (Courts 1-3)',
                'max_players' => 16,
                'description' => 'Singles and doubles indoor badminton coaching with wooden flooring.',
                'status' => 'Active',
            ],
            [
                'school_id' => $school->id,
                'code' => 'SPT-CHS',
                'name' => 'Chess',
                'category' => 'Indoor',
                'coach_name' => 'Grandmaster Mentor Club',
                'venue' => 'Activity Hall 2',
                'max_players' => 20,
                'description' => 'FIDE rated rapid and classical chess training with digital clocks.',
                'status' => 'Active',
            ],
            [
                'school_id' => $school->id,
                'code' => 'SPT-TTN',
                'name' => 'Table Tennis',
                'category' => 'Indoor',
                'coach_name' => 'Coach Sharath K.',
                'venue' => 'Sports Complex Mezzanine',
                'max_players' => 12,
                'description' => 'Stiga tournament tables for junior and senior singles & doubles.',
                'status' => 'Active',
            ],
        ];

        $createdSports = [];
        foreach ($sportsData as $item) {
            $createdSports[$item['code']] = Sport::updateOrCreate(
                ['school_id' => $school->id, 'code' => $item['code']],
                $item
            );
        }

        // 3. Create Sports Competitions
        $footballSport = $createdSports['SPT-FTB'] ?? Sport::first();
        $basketballSport = $createdSports['SPT-BSK'] ?? Sport::first();
        $athleticsSport = $createdSports['SPT-ATH'] ?? Sport::first();
        $cricketSport = $createdSports['SPT-CRK'] ?? Sport::first();
        $chessSport = $createdSports['SPT-CHS'] ?? Sport::first();

        $comp1 = SportsCompetition::updateOrCreate(
            ['school_id' => $school->id, 'title' => 'Inter-School Football Championship 2026'],
            [
                'sport_id' => $footballSport->id,
                'competition_type' => 'Inter-School',
                'tournament_level' => 'Under-17',
                'start_date' => Carbon::now()->addDays(5)->toDateString(),
                'end_date' => Carbon::now()->addDays(7)->toDateString(),
                'event_time' => '09:30:00',
                'venue' => 'Delhi Public Academy - Main Turf',
                'opponent_school' => 'St. Xavier International School',
                'status' => 'Upcoming',
                'result' => 'Pending',
                'score_summary' => null,
                'remarks' => 'Knockout quarter-finals. All participating students must report in full team kit.',
                'created_by_user_id' => $sportsUser->id,
            ]
        );

        $comp2 = SportsCompetition::updateOrCreate(
            ['school_id' => $school->id, 'title' => 'Annual Inter-House Athletics Meet 2026'],
            [
                'sport_id' => $athleticsSport->id,
                'competition_type' => 'Intra-School / House',
                'tournament_level' => 'Open',
                'start_date' => Carbon::now()->toDateString(),
                'end_date' => Carbon::now()->addDays(2)->toDateString(),
                'event_time' => '08:00:00',
                'venue' => 'School Olympic Track',
                'opponent_school' => 'Houses: Red, Blue, Green, Yellow',
                'status' => 'Ongoing',
                'result' => 'Pending',
                'score_summary' => 'Red House leading by 24 points',
                'remarks' => 'Track heats underway today. Finals on day 2.',
                'created_by_user_id' => $sportsUser->id,
            ]
        );

        $comp3 = SportsCompetition::updateOrCreate(
            ['school_id' => $school->id, 'title' => 'District Sub-Junior Basketball Cup'],
            [
                'sport_id' => $basketballSport->id,
                'competition_type' => 'District',
                'tournament_level' => 'Under-14',
                'start_date' => Carbon::now()->subDays(12)->toDateString(),
                'end_date' => Carbon::now()->subDays(10)->toDateString(),
                'event_time' => '11:00:00',
                'venue' => 'District Sports Complex Stadium',
                'opponent_school' => 'Modern Academy & Greenfield School',
                'status' => 'Completed',
                'result' => 'Won',
                'score_summary' => 'DPS 48 - 42 Modern Academy (Gold Medal)',
                'remarks' => 'Delhi Public Academy clinched 1st place in the District Basketball Cup.',
                'created_by_user_id' => $sportsUser->id,
            ]
        );

        $comp4 = SportsCompetition::updateOrCreate(
            ['school_id' => $school->id, 'title' => 'CBSE North Zone Cricket League'],
            [
                'sport_id' => $cricketSport->id,
                'competition_type' => 'Inter-School',
                'tournament_level' => 'Under-19',
                'start_date' => Carbon::now()->addDays(14)->toDateString(),
                'end_date' => Carbon::now()->addDays(18)->toDateString(),
                'event_time' => '08:30:00',
                'venue' => 'National Cricket Ground',
                'opponent_school' => 'Army Public School',
                'status' => 'Upcoming',
                'result' => 'Pending',
                'score_summary' => null,
                'remarks' => '50-over match. Selection trials concluded.',
                'created_by_user_id' => $sportsUser->id,
            ]
        );

        $comp5 = SportsCompetition::updateOrCreate(
            ['school_id' => $school->id, 'title' => 'Inter-School Rapid Chess Open'],
            [
                'sport_id' => $chessSport->id,
                'competition_type' => 'Inter-School',
                'tournament_level' => 'Under-17',
                'start_date' => Carbon::now()->subDays(20)->toDateString(),
                'end_date' => Carbon::now()->subDays(20)->toDateString(),
                'event_time' => '10:00:00',
                'venue' => 'Community Activity Center',
                'opponent_school' => 'Heritage Global School',
                'status' => 'Completed',
                'result' => 'Runner-up',
                'score_summary' => 'Silver Medal - 4.5 / 5 points',
                'remarks' => 'Second place trophy awarded to DPS Chess Team.',
                'created_by_user_id' => $sportsUser->id,
            ]
        );

        // 4. Enroll Students into Competitions / Sports Rosters
        $students = Student::where('school_id', $school->id)->take(12)->get();
        if ($students->isEmpty()) {
            $students = Student::take(12)->get();
        }

        if ($students->isNotEmpty()) {
            $roles = ['Captain', 'Vice-Captain', 'Goalkeeper', 'Player', 'Player', 'Substitute', 'Runner'];
            $statuses = ['Attending', 'Attending', 'Attending', 'Attending', 'Absent', 'Excused'];

            foreach ($students as $idx => $student) {
                // Enroll in Football Championship
                if ($idx < 8) {
                    SportsParticipant::updateOrCreate(
                        [
                            'school_id' => $school->id,
                            'competition_id' => $comp1->id,
                            'student_id' => $student->id,
                        ],
                        [
                            'sport_id' => $footballSport->id,
                            'jersey_number' => str_pad($idx + 1, 2, '0', STR_PAD_LEFT),
                            'role' => $roles[$idx % count($roles)],
                            'attendance_status' => $statuses[$idx % count($statuses)],
                            'achievement' => 'None',
                            'performance_notes' => 'Trained in starting lineup during practice sessions.',
                            'enrolled_date' => Carbon::now()->subDays(5)->toDateString(),
                        ]
                    );
                }

                // Enroll in Athletics Meet
                if ($idx >= 3 && $idx < 10) {
                    SportsParticipant::updateOrCreate(
                        [
                            'school_id' => $school->id,
                            'competition_id' => $comp2->id,
                            'student_id' => $student->id,
                        ],
                        [
                            'sport_id' => $athleticsSport->id,
                            'jersey_number' => 'ATH-' . (100 + $idx),
                            'role' => 'Runner',
                            'attendance_status' => 'Attending',
                            'achievement' => $idx === 4 ? 'Gold Medal' : 'None',
                            'performance_notes' => '100m sprint heats qualified.',
                            'enrolled_date' => Carbon::now()->subDays(3)->toDateString(),
                        ]
                    );
                }

                // Enroll in Completed Basketball (with medals)
                if ($idx < 5) {
                    SportsParticipant::updateOrCreate(
                        [
                            'school_id' => $school->id,
                            'competition_id' => $comp3->id,
                            'student_id' => $student->id,
                        ],
                        [
                            'sport_id' => $basketballSport->id,
                            'jersey_number' => str_pad(12 + $idx, 2, '0', STR_PAD_LEFT),
                            'role' => $idx === 0 ? 'Captain' : 'Player',
                            'attendance_status' => 'Attending',
                            'achievement' => $idx === 0 ? 'Best Player / MVP' : 'Gold Medal',
                            'performance_notes' => 'Scored 18 points in district finals.',
                            'enrolled_date' => Carbon::now()->subDays(15)->toDateString(),
                        ]
                    );
                }
            }
        }

        // 5. Seed Facilities / Grounds
        $facilities = [
            [
                'school_id' => $school->id,
                'name' => 'Main Olympic Football Turf Ground',
                'facility_type' => 'Ground',
                'capacity' => 1200,
                'surface_type' => 'Natural Grass',
                'floodlights' => true,
                'maintenance_status' => 'Available',
                'location' => 'West Sports Arena, Gate 4',
                'rules_notes' => 'Molded studs required. Available for morning/evening school squad practices.',
            ],
            [
                'school_id' => $school->id,
                'name' => 'Synthetic Basketball Court A',
                'facility_type' => 'Court',
                'capacity' => 250,
                'surface_type' => 'Synthetic Acrylic',
                'floodlights' => true,
                'maintenance_status' => 'Available',
                'location' => 'Outdoor Sports Complex, Zone B',
                'rules_notes' => 'Non-marking basketball shoes mandatory. Timed floodlight cutoff at 7:30 PM.',
            ],
            [
                'school_id' => $school->id,
                'name' => 'Indoor Badminton Arena (Courts 1-3)',
                'facility_type' => 'Arena',
                'capacity' => 150,
                'surface_type' => 'Hardwood Maple',
                'floodlights' => true,
                'maintenance_status' => 'Available',
                'location' => 'Indoor Sports Hall, Level 1',
                'rules_notes' => 'Badminton gum sole shoes strictly enforced. Feather shuttle practice only.',
            ],
            [
                'school_id' => $school->id,
                'name' => 'Cricket Practice Nets & Bowling Machine Pitch',
                'facility_type' => 'Ground',
                'capacity' => 60,
                'surface_type' => 'Astroturf Pitch',
                'floodlights' => false,
                'maintenance_status' => 'Available',
                'location' => 'South Boundary Pavilion',
                'rules_notes' => 'Helmet and full protective kit compulsory for leather ball batting.',
            ],
            [
                'school_id' => $school->id,
                'name' => 'Olympic 8-Lane 400m Athletic Track',
                'facility_type' => 'Track',
                'capacity' => 800,
                'surface_type' => 'Synthetic Rubberized',
                'floodlights' => true,
                'maintenance_status' => 'Available',
                'location' => 'Main Stadium Perimeter',
                'rules_notes' => 'Spikes length max 6mm. Lane 1 reserved for sprint time trials.',
            ],
            [
                'school_id' => $school->id,
                'name' => 'Semi-Olympic Swimming Pool (25m)',
                'facility_type' => 'Pool',
                'capacity' => 80,
                'surface_type' => 'Ceramic Tiled',
                'floodlights' => true,
                'maintenance_status' => 'Scheduled Maintenance',
                'location' => 'Aquatic Pavilion Block C',
                'rules_notes' => 'Lifeguard on duty mandatory. Weekly water treatment scheduled on Saturdays.',
            ],
        ];

        $createdFacilities = [];
        foreach ($facilities as $fac) {
            $createdFacilities[$fac['name']] = SportsFacility::updateOrCreate(
                ['school_id' => $school->id, 'name' => $fac['name']],
                $fac
            );
        }

        // 6. Seed Training & Practice Schedules
        $schedules = [
            [
                'school_id' => $school->id,
                'sport_id' => $footballSport->id,
                'facility_id' => $createdFacilities['Main Olympic Football Turf Ground']->id ?? null,
                'squad_name' => 'Under-17 Boys Senior Football Squad',
                'coach_name' => 'Col. Ranveer Rana',
                'day_of_week' => 'Mon/Wed/Fri',
                'start_time' => '06:30:00',
                'end_time' => '07:45:00',
                'session_type' => 'Morning Practice',
                'target_grades' => 'Grades 9 to 11',
                'capacity' => 24,
                'status' => 'Active',
            ],
            [
                'school_id' => $school->id,
                'sport_id' => $basketballSport->id,
                'facility_id' => $createdFacilities['Synthetic Basketball Court A']->id ?? null,
                'squad_name' => 'Girls Junior Basketball Academy',
                'coach_name' => 'Coach Sunil Gavaskar',
                'day_of_week' => 'Tue/Thu/Sat',
                'start_time' => '16:00:00',
                'end_time' => '17:30:00',
                'session_type' => 'Evening Drill',
                'target_grades' => 'Grades 6 to 8',
                'capacity' => 18,
                'status' => 'Active',
            ],
            [
                'school_id' => $school->id,
                'sport_id' => $athleticsSport->id,
                'facility_id' => $createdFacilities['Olympic 8-Lane 400m Athletic Track']->id ?? null,
                'squad_name' => 'Athletics Sprint & Relay Conditioning',
                'coach_name' => 'P.T. Usha Memorial Coach',
                'day_of_week' => 'Daily',
                'start_time' => '06:00:00',
                'end_time' => '07:15:00',
                'session_type' => 'Conditioning',
                'target_grades' => 'Grades 7 to 12',
                'capacity' => 30,
                'status' => 'Active',
            ],
            [
                'school_id' => $school->id,
                'sport_id' => $cricketSport->id,
                'facility_id' => $createdFacilities['Cricket Practice Nets & Bowling Machine Pitch']->id ?? null,
                'squad_name' => 'Under-14 Cricket Development Batch',
                'coach_name' => 'Coach Rajesh Rawat',
                'day_of_week' => 'Mon/Wed/Fri',
                'start_time' => '15:45:00',
                'end_time' => '17:15:00',
                'session_type' => 'Evening Drill',
                'target_grades' => 'Grades 6 to 8',
                'capacity' => 20,
                'status' => 'Active',
            ],
        ];

        foreach ($schedules as $sched) {
            SportsTrainingSchedule::updateOrCreate(
                ['school_id' => $school->id, 'squad_name' => $sched['squad_name']],
                $sched
            );
        }

        // 7. Seed Equipment & Inventory
        $equipmentItems = [
            [
                'school_id' => $school->id,
                'sport_id' => $footballSport->id,
                'item_name' => 'Cosco Platina Match Football (Size 5)',
                'category' => 'Balls & Gear',
                'quantity_total' => 24,
                'quantity_available' => 18,
                'quantity_issued' => 6,
                'condition' => 'Good',
                'storage_location' => 'Sports Storeroom Rack A-1',
                'purchase_date' => Carbon::now()->subMonths(2)->toDateString(),
                'unit_cost' => 1250.00,
                'status' => 'Available',
            ],
            [
                'school_id' => $school->id,
                'sport_id' => $basketballSport->id,
                'item_name' => 'Spalding TF-1000 Indoor/Outdoor Basketball (Size 7)',
                'category' => 'Balls & Gear',
                'quantity_total' => 16,
                'quantity_available' => 12,
                'quantity_issued' => 4,
                'condition' => 'Good',
                'storage_location' => 'Court Locker B',
                'purchase_date' => Carbon::now()->subMonths(3)->toDateString(),
                'unit_cost' => 2100.00,
                'status' => 'Available',
            ],
            [
                'school_id' => $school->id,
                'sport_id' => $cricketSport->id,
                'item_name' => 'SS Master 1000 English Willow Cricket Bat',
                'category' => 'Balls & Gear',
                'quantity_total' => 8,
                'quantity_available' => 6,
                'quantity_issued' => 2,
                'condition' => 'Good',
                'storage_location' => 'Cricket Pavilion Kit Shed',
                'purchase_date' => Carbon::now()->subMonths(4)->toDateString(),
                'unit_cost' => 4800.00,
                'status' => 'Available',
            ],
            [
                'school_id' => $school->id,
                'sport_id' => $cricketSport->id,
                'item_name' => 'SG Club Leather Cricket Balls (Box of 12)',
                'category' => 'Balls & Gear',
                'quantity_total' => 36,
                'quantity_available' => 30,
                'quantity_issued' => 6,
                'condition' => 'Good',
                'storage_location' => 'Cricket Pavilion Kit Shed',
                'purchase_date' => Carbon::now()->subMonth()->toDateString(),
                'unit_cost' => 380.00,
                'status' => 'Available',
            ],
            [
                'school_id' => $school->id,
                'sport_id' => $athleticsSport->id,
                'item_name' => 'Seiko Pro Digital Dual-Memory Stopwatches',
                'category' => 'Field Equipment',
                'quantity_total' => 10,
                'quantity_available' => 8,
                'quantity_issued' => 2,
                'condition' => 'Good',
                'storage_location' => 'Incharge Office Safe Drawer',
                'purchase_date' => Carbon::now()->subMonths(5)->toDateString(),
                'unit_cost' => 1650.00,
                'status' => 'Available',
            ],
            [
                'school_id' => $school->id,
                'sport_id' => null,
                'item_name' => 'Emergency Sports Trauma & First Aid Kit Box',
                'category' => 'Medical',
                'quantity_total' => 5,
                'quantity_available' => 5,
                'quantity_issued' => 0,
                'condition' => 'Good',
                'storage_location' => 'West Pavilion Medical Station',
                'purchase_date' => Carbon::now()->subWeeks(2)->toDateString(),
                'unit_cost' => 3200.00,
                'status' => 'Available',
            ],
            [
                'school_id' => $school->id,
                'sport_id' => $footballSport->id,
                'item_name' => 'Training Agility Cones & Hurdles Pack (Set of 30)',
                'category' => 'Field Equipment',
                'quantity_total' => 4,
                'quantity_available' => 3,
                'quantity_issued' => 1,
                'condition' => 'Fair',
                'storage_location' => 'Ground Equipment Bin',
                'purchase_date' => Carbon::now()->subMonths(6)->toDateString(),
                'unit_cost' => 1800.00,
                'status' => 'Available',
            ],
        ];

        $createdEquip = [];
        foreach ($equipmentItems as $eq) {
            $createdEquip[$eq['item_name']] = SportsEquipment::updateOrCreate(
                ['school_id' => $school->id, 'item_name' => $eq['item_name']],
                $eq
            );
        }

        // 8. Seed Equipment Issue Records
        if ($students->isNotEmpty()) {
            $firstStudent = $students->first();
            $secondStudent = $students->skip(1)->first() ?? $firstStudent;

            if (isset($createdEquip['Cosco Platina Match Football (Size 5)'])) {
                SportsEquipmentIssue::updateOrCreate(
                    [
                        'school_id' => $school->id,
                        'equipment_id' => $createdEquip['Cosco Platina Match Football (Size 5)']->id,
                        'borrower_name' => $firstStudent->name ?? 'Aarav Sharma',
                    ],
                    [
                        'student_id' => $firstStudent->id,
                        'borrower_role' => 'Student',
                        'quantity' => 2,
                        'issue_date' => Carbon::now()->subDays(2)->toDateString(),
                        'expected_return_date' => Carbon::now()->addDays(1)->toDateString(),
                        'return_date' => null,
                        'status' => 'Issued',
                        'notes' => 'Issued for inter-house afternoon practice.',
                    ]
                );
            }

            if (isset($createdEquip['SS Master 1000 English Willow Cricket Bat'])) {
                SportsEquipmentIssue::updateOrCreate(
                    [
                        'school_id' => $school->id,
                        'equipment_id' => $createdEquip['SS Master 1000 English Willow Cricket Bat']->id,
                        'borrower_name' => $secondStudent->name ?? 'Rohan Verma',
                    ],
                    [
                        'student_id' => $secondStudent->id,
                        'borrower_role' => 'Student',
                        'quantity' => 1,
                        'issue_date' => Carbon::now()->subDays(4)->toDateString(),
                        'expected_return_date' => Carbon::now()->subDay()->toDateString(),
                        'return_date' => Carbon::now()->subDay()->toDateString(),
                        'status' => 'Returned',
                        'notes' => 'Returned in good condition after net practice.',
                    ]
                );
            }
        }

        // 9. Seed Student Fitness & Health Assessments
        if ($students->isNotEmpty()) {
            $fitnessSample = [
                ['height' => 165.0, 'weight' => 54.0, 'sprint' => 7.2, 'shuttle' => 11.4, 'pushups' => 28, 'reach' => 18.0, 'rating' => 'Outstanding (A+)'],
                ['height' => 158.0, 'weight' => 48.0, 'sprint' => 7.8, 'shuttle' => 12.1, 'pushups' => 22, 'reach' => 15.5, 'rating' => 'Good (A)'],
                ['height' => 172.0, 'weight' => 63.0, 'sprint' => 6.9, 'shuttle' => 10.8, 'pushups' => 35, 'reach' => 21.0, 'rating' => 'Outstanding (A+)'],
                ['height' => 161.0, 'weight' => 52.0, 'sprint' => 8.1, 'shuttle' => 13.0, 'pushups' => 18, 'reach' => 12.0, 'rating' => 'Average (B)'],
            ];

            foreach ($students->take(4) as $k => $st) {
                $sample = $fitnessSample[$k % count($fitnessSample)];
                $bmi = round($sample['weight'] / (($sample['height'] / 100) * ($sample['height'] / 100)), 1);

                SportsFitnessAssessment::updateOrCreate(
                    [
                        'school_id' => $school->id,
                        'student_id' => $st->id,
                        'academic_term' => 'Term 1 (2026-27)',
                    ],
                    [
                        'assessment_date' => Carbon::now()->subDays(10 + $k * 3)->toDateString(),
                        'assessed_by' => 'Col. Ranveer Rana',
                        'height_cm' => $sample['height'],
                        'weight_kg' => $sample['weight'],
                        'bmi' => $bmi,
                        'sprint_50m_seconds' => $sample['sprint'],
                        'shuttle_run_seconds' => $sample['shuttle'],
                        'pushups_count' => $sample['pushups'],
                        'sit_and_reach_cm' => $sample['reach'],
                        'stamina_rating' => $sample['rating'],
                        'medical_clearance' => true,
                        'remarks' => 'Cleared for all high-intensity competitive sports and track relays.',
                    ]
                );
            }
        }
    }
}
