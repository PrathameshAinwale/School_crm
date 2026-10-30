<?php

namespace Database\Seeders;

use App\Models\Admission;
use App\Models\School;
use App\Models\SchoolClass;
use Illuminate\Database\Seeder;

class AdmissionSeeder extends Seeder
{
    public function run(): void
    {
        $schools = School::all();
        if ($schools->isEmpty()) {
            return;
        }

        foreach ($schools as $school) {
            $classes = SchoolClass::where('school_id', $school->id)->get();
            if ($classes->isEmpty()) {
                $classes = SchoolClass::all();
            }

            $c1 = $classes->where('name', 'Class 1')->first() ?? $classes->first();
            $c3 = $classes->where('name', 'Class 3')->first() ?? $classes->first();
            $c5 = $classes->where('name', 'Class 5')->first() ?? $classes->first();
            $c6 = $classes->where('name', 'Class 6')->first() ?? $classes->first();
            $c8 = $classes->where('name', 'Class 8')->first() ?? $classes->first();
            $c9 = $classes->where('name', 'Class 9')->first() ?? $classes->first();

            $prefix = 'ADM-' . $school->id . '-2026-';

            $applicants = [
                [
                    'application_number' => $prefix . '101',
                    'first_name' => 'Aarav',
                    'last_name' => 'Sharma',
                    'date_of_birth' => '2020-04-12',
                    'gender' => 'Male',
                    'school_class_id' => $c1 ? $c1->id : null,
                    'academic_year' => '2026-2027',
                    'lead_source' => 'Walk-in',
                    'guardian_name' => 'Vikram Sharma',
                    'guardian_phone' => '9820112233',
                    'guardian_email' => 'vikram.sharma@example.com',
                    'guardian_relation' => 'Father',
                    'previous_school' => 'Little Angels Preschool',
                    'previous_score' => 'Grade A',
                    'address' => 'Flat 402, Green Valley Heights, Sector 12',
                    'with_transport' => true,
                    'status' => 'Inquiry',
                    'documents' => [
                        'birth_certificate' => 'verified',
                        'transfer_certificate' => 'pending',
                        'previous_marksheet' => 'pending',
                        'address_proof' => 'pending',
                        'aadhar_card' => 'pending',
                        'medical_record' => 'pending',
                    ],
                    'test_status' => 'Pending',
                    'interview_result' => 'Pending',
                    'admission_fee_status' => 'Pending',
                    'remarks' => 'Walk-in inquiry by parents. Interested in Class 1 with school bus facility.',
                    'pipeline_notes' => [
                        ['stage' => 'Inquiry', 'action' => 'Walk-in Inquiry Captured', 'time' => now()->subDays(2)->toIso8601String(), 'notes' => 'Parent inquired for Class 1 admission.'],
                    ],
                ],
                [
                    'application_number' => $prefix . '102',
                    'first_name' => 'Ananya',
                    'last_name' => 'Iyer',
                    'date_of_birth' => '2016-08-20',
                    'gender' => 'Female',
                    'school_class_id' => $c5 ? $c5->id : null,
                    'academic_year' => '2026-2027',
                    'lead_source' => 'Website',
                    'guardian_name' => 'Priya Iyer',
                    'guardian_phone' => '9845012345',
                    'guardian_email' => 'priya.iyer@example.com',
                    'guardian_relation' => 'Mother',
                    'previous_school' => 'Vidya Mandir School',
                    'previous_score' => '89%',
                    'address' => '14/B, Lotus Colony, MG Road',
                    'with_transport' => false,
                    'status' => 'Document Review',
                    'documents' => [
                        'birth_certificate' => 'verified',
                        'transfer_certificate' => 'pending',
                        'previous_marksheet' => 'verified',
                        'address_proof' => 'verified',
                        'aadhar_card' => 'verified',
                        'medical_record' => 'pending',
                    ],
                    'test_status' => 'Pending',
                    'interview_result' => 'Pending',
                    'admission_fee_status' => 'Pending',
                    'remarks' => 'Online application submitted. Birth certificate & previous marksheet verified. Awaiting Transfer Certificate from current school.',
                    'pipeline_notes' => [
                        ['stage' => 'Inquiry', 'action' => 'Web Inquiry Received', 'time' => now()->subDays(4)->toIso8601String(), 'notes' => 'Parent applied via School website portal.'],
                        ['stage' => 'Document Review', 'action' => 'Moved to Document Review', 'time' => now()->subDays(1)->toIso8601String(), 'notes' => 'Docs verified by admission counselor. TC pending.'],
                    ],
                ],
                [
                    'application_number' => $prefix . '103',
                    'first_name' => 'Reyansh',
                    'last_name' => 'Patel',
                    'date_of_birth' => '2012-02-14',
                    'gender' => 'Male',
                    'school_class_id' => $c9 ? $c9->id : null,
                    'academic_year' => '2026-2027',
                    'lead_source' => 'Referral',
                    'guardian_name' => 'Hitesh Patel',
                    'guardian_phone' => '9879011224',
                    'guardian_email' => 'hitesh.patel@example.com',
                    'guardian_relation' => 'Father',
                    'previous_school' => 'St. Xavier High School',
                    'previous_score' => '93.5%',
                    'address' => '701, Sapphire Towers, Outer Ring Road',
                    'with_transport' => true,
                    'status' => 'Assessment/Interview',
                    'documents' => [
                        'birth_certificate' => 'verified',
                        'transfer_certificate' => 'verified',
                        'previous_marksheet' => 'verified',
                        'address_proof' => 'verified',
                        'aadhar_card' => 'verified',
                        'medical_record' => 'verified',
                    ],
                    'test_score' => '88/100',
                    'test_date' => now()->subDays(2)->toDateString(),
                    'test_status' => 'Cleared',
                    'interview_date' => now()->addDays(2)->format('Y-m-d 10:30:00'),
                    'interview_interviewer' => 'Principal Dr. Sharma & Vice Principal',
                    'interview_notes' => 'Cleared entrance aptitude test with 88%. Interview scheduled for upcoming Friday.',
                    'interview_result' => 'Pending',
                    'admission_fee_status' => 'Pending',
                    'remarks' => 'High-performing student. Cleared math & science written test.',
                    'pipeline_notes' => [
                        ['stage' => 'Inquiry', 'action' => 'Referral Inquiry Registered', 'time' => now()->subDays(7)->toIso8601String(), 'notes' => 'Referred by alumni parent.'],
                        ['stage' => 'Document Review', 'action' => 'All Documents Verified', 'time' => now()->subDays(5)->toIso8601String(), 'notes' => 'Complete dossier verified.'],
                        ['stage' => 'Assessment/Interview', 'action' => 'Test Cleared & Interview Slotted', 'time' => now()->subDays(2)->toIso8601String(), 'notes' => 'Scored 88/100 in written exam.'],
                    ],
                ],
                [
                    'application_number' => $prefix . '104',
                    'first_name' => 'Myra',
                    'last_name' => 'Kapoor',
                    'date_of_birth' => '2018-11-05',
                    'gender' => 'Female',
                    'school_class_id' => $c3 ? $c3->id : null,
                    'academic_year' => '2026-2027',
                    'lead_source' => 'Walk-in',
                    'guardian_name' => 'Sameer Kapoor',
                    'guardian_phone' => '9811099887',
                    'guardian_email' => 'sameer.kapoor@example.com',
                    'guardian_relation' => 'Father',
                    'previous_school' => 'Cambridge Early Learning',
                    'previous_score' => '94%',
                    'address' => 'Villa 22, Palm Meadows Estates',
                    'with_transport' => true,
                    'status' => 'Offer Extended',
                    'documents' => [
                        'birth_certificate' => 'verified',
                        'transfer_certificate' => 'verified',
                        'previous_marksheet' => 'verified',
                        'address_proof' => 'verified',
                        'aadhar_card' => 'verified',
                        'medical_record' => 'verified',
                    ],
                    'test_score' => '94/100',
                    'test_date' => now()->subDays(4)->toDateString(),
                    'test_status' => 'Cleared',
                    'interview_date' => now()->subDays(2)->format('Y-m-d 11:00:00'),
                    'interview_interviewer' => 'Headmistress Mrs. Roy',
                    'interview_notes' => 'Exceptional communication and reading skills. Highly recommended for admission.',
                    'interview_result' => 'Recommended',
                    'offer_date' => now()->subDays(1)->toDateString(),
                    'offer_valid_until' => now()->addDays(6)->toDateString(),
                    'admission_fee' => 35000.00,
                    'admission_fee_status' => 'Pending',
                    'remarks' => 'Formal offer letter dispatched. Seat held until offer validity date.',
                    'pipeline_notes' => [
                        ['stage' => 'Inquiry', 'action' => 'Inquiry Initiated', 'time' => now()->subDays(10)->toIso8601String(), 'notes' => 'Walk-in inquiry.'],
                        ['stage' => 'Document Review', 'action' => 'Docs Approved', 'time' => now()->subDays(8)->toIso8601String(), 'notes' => 'Verified.'],
                        ['stage' => 'Assessment/Interview', 'action' => 'Interview Recommended', 'time' => now()->subDays(2)->toIso8601String(), 'notes' => 'Passed with honors.'],
                        ['stage' => 'Offer Extended', 'action' => 'Offer Letter Generated', 'time' => now()->subDays(1)->toIso8601String(), 'notes' => 'Provisional admission offer issued.'],
                    ],
                ],
                [
                    'application_number' => $prefix . '105',
                    'first_name' => 'Kabir',
                    'last_name' => 'Verma',
                    'date_of_birth' => '2015-05-18',
                    'gender' => 'Male',
                    'school_class_id' => $c6 ? $c6->id : null,
                    'academic_year' => '2026-2027',
                    'lead_source' => 'Social Media',
                    'guardian_name' => 'Rajesh Verma',
                    'guardian_phone' => '9833445566',
                    'guardian_email' => 'rajesh.verma@example.com',
                    'guardian_relation' => 'Father',
                    'previous_school' => 'Delhi World Public School',
                    'previous_score' => '91%',
                    'address' => 'Block C, Silver Springs, Sector 56',
                    'with_transport' => true,
                    'status' => 'Fee Paid',
                    'documents' => [
                        'birth_certificate' => 'verified',
                        'transfer_certificate' => 'verified',
                        'previous_marksheet' => 'verified',
                        'address_proof' => 'verified',
                        'aadhar_card' => 'verified',
                        'medical_record' => 'verified',
                    ],
                    'test_score' => '90/100',
                    'test_status' => 'Cleared',
                    'interview_result' => 'Recommended',
                    'offer_date' => now()->subDays(3)->toDateString(),
                    'admission_fee' => 40000.00,
                    'admission_fee_status' => 'Paid',
                    'admission_fee_receipt' => 'REC-ADM-2026-889',
                    'admission_fee_date' => now()->subDay()->toDateString(),
                    'admission_fee_mode' => 'UPI',
                    'remarks' => 'Admission fee paid in full. Ready for section allocation and official student ID creation.',
                    'pipeline_notes' => [
                        ['stage' => 'Offer Extended', 'action' => 'Offer Issued', 'time' => now()->subDays(3)->toIso8601String(), 'notes' => 'Offer sent.'],
                        ['stage' => 'Fee Paid', 'action' => 'Registration Fee Paid', 'time' => now()->subDay()->toIso8601String(), 'notes' => 'UPI transaction confirmed. Receipt #REC-ADM-2026-889.'],
                    ],
                ],
                [
                    'application_number' => $prefix . '106',
                    'first_name' => 'Tanvi',
                    'last_name' => 'Nair',
                    'date_of_birth' => '2013-09-10',
                    'gender' => 'Female',
                    'school_class_id' => $c8 ? $c8->id : null,
                    'academic_year' => '2026-2027',
                    'lead_source' => 'Walk-in',
                    'guardian_name' => 'Gopal Nair',
                    'guardian_phone' => '9890123999',
                    'guardian_email' => 'gopal.nair@example.com',
                    'guardian_relation' => 'Father',
                    'previous_school' => 'City Montessori School',
                    'previous_score' => '72%',
                    'address' => 'Plot 89, Cyber City View',
                    'with_transport' => false,
                    'status' => 'Rejected',
                    'documents' => [
                        'birth_certificate' => 'verified',
                        'transfer_certificate' => 'missing',
                        'previous_marksheet' => 'pending',
                        'address_proof' => 'verified',
                        'aadhar_card' => 'pending',
                        'medical_record' => 'pending',
                    ],
                    'test_status' => 'Failed',
                    'interview_result' => 'Not Recommended',
                    'admission_fee_status' => 'Pending',
                    'remarks' => 'Parent notified. Applicant transferred to another branch due to relocation.',
                    'pipeline_notes' => [
                        ['stage' => 'Inquiry', 'action' => 'Application Filed', 'time' => now()->subDays(15)->toIso8601String(), 'notes' => 'Inquiry recorded.'],
                        ['stage' => 'Rejected', 'action' => 'Application Closed', 'time' => now()->subDays(5)->toIso8601String(), 'notes' => 'Family relocated to another city.'],
                    ],
                ],
            ];

            foreach ($applicants as $app) {
                $app['school_id'] = $school->id;
                Admission::updateOrCreate(
                    ['application_number' => $app['application_number']],
                    $app
                );
            }
        }
    }
}
