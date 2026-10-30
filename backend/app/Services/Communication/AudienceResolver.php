<?php

namespace App\Services\Communication;

use App\Models\CommunicationCampaign;
use App\Models\CommunicationLog;
use App\Models\CommunicationOptOut;
use App\Models\DevicePushToken;
use App\Models\School;
use App\Models\SchoolSetting;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Carbon\Carbon;
use InvalidArgumentException;

class AudienceResolver
{
    /**
     * Preview audience calculation without creating logs.
     */
    public function preview(int $schoolId, array $data): array
    {
        $resolved = $this->resolveRecipients($schoolId, $data);

        $channel = $data['channel'] ?? 'sms';
        $eligible = array_filter($resolved, fn($r) => $r['status'] === 'queued');
        $skippedNoContact = array_filter($resolved, fn($r) => $r['status'] === 'skipped' && str_contains($r['skip_reason'], 'no contact'));
        $skippedOptOut = array_filter($resolved, fn($r) => $r['status'] === 'skipped' && str_contains($r['skip_reason'], 'opted out'));
        $skippedDuplicate = array_filter($resolved, fn($r) => $r['status'] === 'skipped' && str_contains($r['skip_reason'], 'duplicate'));

        // Daily cap calculation
        $dailyLimit = (int) SchoolSetting::getDecrypted('communication_daily_limit', $schoolId, env('COMMUNICATION_DAILY_LIMIT', 1000));
        $sentToday = CommunicationLog::where('school_id', $schoolId)
            ->whereDate('created_at', Carbon::today())
            ->whereIn('status', ['sent', 'delivered', 'queued'])
            ->count();
        $quotaRemaining = max(0, $dailyLimit - $sentToday);

        // Estimate message segments (SMS 160 chars per segment for GSM, 70 for Unicode)
        $sampleBody = $data['message_body'] ?? '';
        $charCount = mb_strlen($sampleBody);
        $segmentsPerMsg = ($channel === 'sms') ? max(1, (int) ceil($charCount / 160)) : 1;

        return [
            'total_candidates' => count($resolved),
            'eligible_count' => count($eligible),
            'skipped_no_contact' => count($skippedNoContact),
            'skipped_opted_out' => count($skippedOptOut),
            'skipped_duplicate' => count($skippedDuplicate),
            'estimated_messages' => count($eligible) * $segmentsPerMsg,
            'daily_limit' => $dailyLimit,
            'sent_today' => $sentToday,
            'daily_quota_remaining' => $quotaRemaining,
            'sample_recipients' => array_slice(array_values($resolved), 0, 5),
        ];
    }

    /**
     * Resolve all recipient items with personalized messages, deduplication, and skip reasons.
     */
    public function resolveRecipients(int $schoolId, array $data): array
    {
        $channel = $data['channel'] ?? 'sms';
        $category = $data['message_category'] ?? 'transactional';
        $audienceType = $data['audience_type'] ?? 'all';
        $filters = $data['audience_filters'] ?? [];
        $rawBody = $data['message_body'] ?? '';
        $isTestMode = !empty($data['is_test_mode']);
        $testRecipients = $data['test_recipients'] ?? [];

        $school = School::find($schoolId);
        $schoolName = $school ? $school->name : 'Our School';

        // Load opt-outs for this school and channel
        $optOutEntries = CommunicationOptOut::where('school_id', $schoolId)
            ->whereIn('channel', [$channel, 'all'])
            ->pluck('phone_or_email')
            ->map(fn($v) => strtolower(trim($v)))
            ->flip()
            ->toArray();

        $candidates = [];

        // 1. Gather raw recipient entities
        if ($audienceType === 'staff') {
            $teachers = Teacher::where('school_id', $schoolId)
                ->where('status', 'Active')
                ->get();

            foreach ($teachers as $t) {
                $candidates[] = [
                    'type' => 'staff',
                    'student_id' => null,
                    'user_id' => $t->user_id,
                    'name' => $t->full_name,
                    'phone' => $t->phone,
                    'email' => $t->email,
                    'variables' => [
                        'staff_name' => $t->full_name,
                        'name' => $t->full_name,
                        'department' => $t->department ?? 'Faculty',
                        'school_name' => $schoolName,
                        'date' => Carbon::now()->format('d M Y'),
                    ],
                ];
            }
        } else {
            // Student-based audiences: all, class, section, individual, hostel
            $query = Student::with(['schoolClass', 'section'])
                ->where('school_id', $schoolId)
                ->where('status', 'Active');

            if ($audienceType === 'class' && !empty($filters['school_class_ids'])) {
                $query->whereIn('school_class_id', $filters['school_class_ids']);
            } elseif ($audienceType === 'section' && !empty($filters['section_ids'])) {
                $query->whereIn('section_id', $filters['section_ids']);
            } elseif ($audienceType === 'individual' && !empty($filters['student_ids'])) {
                $query->whereIn('id', $filters['student_ids']);
            } elseif ($audienceType === 'hostel' && !empty($filters['hostel_block_ids'])) {
                // Placeholder for Batch 5: will filter by student hostel allocations
                $query->whereIn('id', []);
            }

            $students = $query->get();

            foreach ($students as $stu) {
                $candidates[] = [
                    'type' => 'student',
                    'student_id' => $stu->id,
                    'user_id' => $stu->user_id,
                    'name' => $stu->full_name,
                    'guardian_name' => $stu->guardian_name ?: ($stu->father_name ?: 'Parent'),
                    'guardian_phone' => $stu->guardian_phone, // STRICT: guardian_phone only
                    'guardian_email' => $stu->guardian_email,
                    'variables' => [
                        'student_name' => $stu->full_name,
                        'name' => $stu->full_name,
                        'admission_no' => $stu->admission_number ?? '',
                        'roll_no' => $stu->roll_number ?? '',
                        'class' => $stu->schoolClass ? $stu->schoolClass->name : '',
                        'section' => $stu->section ? $stu->section->name : '',
                        'guardian_name' => $stu->guardian_name ?: ($stu->father_name ?: 'Parent'),
                        'fee_due' => '0',
                        'fee_due_currency' => '₹0',
                        'days_overdue' => '0',
                        'due_date' => Carbon::now()->addDays(7)->format('d M Y'),
                        'school_name' => $schoolName,
                        'date' => Carbon::now()->format('d M Y'),
                    ],
                ];
            }
        }

        // 2. Process each candidate: contact extraction, normalization, dedupe, opt-out
        $resolved = [];
        $sentSignatures = []; // for deduping identical (phone, message_body)

        foreach ($candidates as $cand) {
            $name = $cand['name'];
            $studentId = $cand['student_id'] ?? null;
            $userId = $cand['user_id'] ?? null;
            $compiledBody = TemplateCompiler::compile($rawBody, $cand['variables']);

            $phone = null;
            $email = null;
            $deviceToken = null;
            $skipReason = null;
            $status = 'queued';

            if ($channel === 'sms' || $channel === 'whatsapp') {
                $rawPhone = ($cand['type'] === 'student') ? $cand['guardian_phone'] : $cand['phone'];

                if (empty($rawPhone)) {
                    $status = 'skipped';
                    $skipReason = 'skipped - no contact (missing guardian phone)';
                } else {
                    $normalized = PhoneNormalizer::normalize($rawPhone);
                    if (!$normalized) {
                        $status = 'skipped';
                        $skipReason = "skipped - invalid phone number format ({$rawPhone})";
                    } else {
                        $phone = $normalized;

                        // Check test mode
                        if ($isTestMode) {
                            $matchesTest = false;
                            foreach ($testRecipients as $testPhone) {
                                if (PhoneNormalizer::normalize($testPhone) === $phone) {
                                    $matchesTest = true;
                                    break;
                                }
                            }
                            if (!$matchesTest) {
                                $status = 'skipped';
                                $skipReason = 'skipped - test mode (not in test numbers list)';
                            }
                        }

                        // Check opt-out (applies only to promotional messages)
                        if ($status === 'queued' && $category === 'promotional') {
                            if (isset($optOutEntries[strtolower($phone)])) {
                                $status = 'skipped';
                                $skipReason = 'skipped - opted out';
                            }
                        }

                        // Dedupe identical (phone, message_body) within campaign (e.g. siblings)
                        if ($status === 'queued') {
                            $sig = md5($phone . '|' . $compiledBody);
                            if (isset($sentSignatures[$sig])) {
                                $status = 'skipped';
                                $skipReason = 'skipped - duplicate contact (sibling broadcast already queued)';
                            } else {
                                $sentSignatures[$sig] = true;
                            }
                        }
                    }
                }
            } elseif ($channel === 'email') {
                $rawEmail = ($cand['type'] === 'student') ? ($cand['guardian_email'] ?? null) : ($cand['email'] ?? null);

                if (empty($rawEmail) || !filter_var($rawEmail, FILTER_VALIDATE_EMAIL)) {
                    $status = 'skipped';
                    $skipReason = 'skipped - no contact (invalid or missing email)';
                } else {
                    $email = strtolower(trim($rawEmail));

                    if ($isTestMode && !in_array($email, array_map('strtolower', $testRecipients))) {
                        $status = 'skipped';
                        $skipReason = 'skipped - test mode (not in test recipients list)';
                    }

                    if ($status === 'queued' && $category === 'promotional') {
                        if (isset($optOutEntries[$email])) {
                            $status = 'skipped';
                            $skipReason = 'skipped - opted out';
                        }
                    }

                    if ($status === 'queued') {
                        $sig = md5($email . '|' . $compiledBody);
                        if (isset($sentSignatures[$sig])) {
                            $status = 'skipped';
                            $skipReason = 'skipped - duplicate contact (already queued)';
                        } else {
                            $sentSignatures[$sig] = true;
                        }
                    }
                }
            } elseif ($channel === 'push') {
                if (!$userId) {
                    $status = 'skipped';
                    $skipReason = 'skipped - no user account linked for push';
                } else {
                    $tokenRecord = DevicePushToken::where('user_id', $userId)->latest('last_used_at')->first();
                    if (!$tokenRecord) {
                        $status = 'skipped';
                        $skipReason = 'skipped - no device push token registered';
                    } else {
                        $deviceToken = $tokenRecord->token;
                    }
                }
            } elseif ($channel === 'in_app') {
                // In-app notices target user accounts or students directly
                if (!$userId && !$studentId) {
                    $status = 'skipped';
                    $skipReason = 'skipped - no linked user or student id';
                }
            }

            $resolved[] = [
                'recipient_name' => $name,
                'recipient_student_id' => $studentId,
                'recipient_user_id' => $userId,
                'recipient_phone' => $phone,
                'recipient_email' => $email,
                'recipient_device_token' => $deviceToken,
                'message_body' => $compiledBody,
                'variables' => $cand['variables'],
                'status' => $status,
                'skip_reason' => $skipReason,
            ];
        }

        return $resolved;
    }
}

