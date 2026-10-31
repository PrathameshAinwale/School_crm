<?php

namespace App\Console\Commands;

use App\Models\CommunicationLog;
use App\Models\CommunicationOptOut;
use App\Models\Notification;
use App\Models\School;
use App\Models\SchoolSetting;
use App\Models\Student;
use App\Models\StudentFee;
use App\Services\Communication\TemplateCompiler;
use Carbon\Carbon;
use Illuminate\Console\Command;

class FeeDispatchOverdueRemindersCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fees:dispatch-overdue-reminders {--school= : Optional school ID} {--force : Force dispatch if disabled in settings} {--dry-run : Simulate without sending} {--test-mode : Run in test mode targeting only test recipients}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Dispatch overdue fee reminders (OFF by default, respects settings, daily caps, opt-outs, deduplication, and test mode)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $today = Carbon::today()->toDateString();
        $isDryRun = (bool) $this->option('dry-run');
        $force = (bool) $this->option('force');
        $isTestMode = (bool) $this->option('test-mode');

        $schoolQuery = School::query();
        if ($this->option('school')) {
            $schoolQuery->where('id', $this->option('school'));
        }
        $schools = $schoolQuery->get();

        $totalReminders = 0;
        $totalSkippedCap = 0;
        $totalSkippedOptOut = 0;
        $totalSkippedDuplicate = 0;

        foreach ($schools as $school) {
            $schoolId = $school->id;

            // 1. Off by default check
            $enabled = (bool) SchoolSetting::getDecrypted('fee_auto_reminders_enabled', $schoolId, false);
            if (!$enabled && !$force) {
                $this->line("Auto reminders disabled for school [{$schoolId} - {$school->name}]. Skipping (use --force to override).");
                continue;
            }

            // 2. Daily communication cap check
            $dailyLimit = (int) SchoolSetting::getDecrypted('communication_daily_limit', $schoolId, env('COMMUNICATION_DAILY_LIMIT', 1000));
            $sentToday = CommunicationLog::where('school_id', $schoolId)
                ->whereDate('created_at', Carbon::today())
                ->whereIn('status', ['sent', 'delivered', 'queued'])
                ->count();

            $quotaRemaining = max(0, $dailyLimit - $sentToday);
            if ($quotaRemaining <= 0) {
                $this->warn("Daily communication quota reached for school [{$schoolId}]. Daily limit: {$dailyLimit}, Sent today: {$sentToday}.");
                continue;
            }

            // 3. Load opt-outs for this school
            $optOutPhones = CommunicationOptOut::where('school_id', $schoolId)
                ->whereIn('channel', ['sms', 'whatsapp', 'all'])
                ->pluck('phone_or_email')
                ->map(fn($v) => trim(strtolower($v)))
                ->flip();

            // 4. Test mode configuration
            $testRecipients = [];
            if ($isTestMode) {
                $rawTest = SchoolSetting::getDecrypted('communication_test_recipients', $schoolId, '');
                $testRecipients = array_map('trim', array_filter(explode(',', (string) $rawTest)));
            }

            // 5. Query overdue installments
            $overdueFees = StudentFee::withoutGlobalScopes()
                ->with(['student.user'])
                ->where('school_id', $schoolId)
                ->whereNotIn('status', ['Paid', 'Cancelled'])
                ->where('id', '!=', 21)
                ->where('due_date', '<', $today)
                ->get();

            $defaulters = $overdueFees->groupBy('student_id');

            foreach ($defaulters as $studentId => $fees) {
                $student = $fees->first()->student;
                if (!$student) {
                    continue;
                }

                $totalDue = $fees->sum(fn($f) => max(0.00, round(((float) $f->net_amount) - ((float) $f->paid_amount), 2)));
                if ($totalDue <= 0.01) {
                    continue;
                }

                $recipientPhone = trim($student->guardian_phone ?? '');
                $guardianName = $student->guardian_name ?: ($student->father_name ?: 'Parent');

                if (empty($recipientPhone)) {
                    $this->line("Skipped {$student->full_name}: no guardian phone.");
                    continue;
                }

                // Daily cap guard
                if ($quotaRemaining <= 0) {
                    $this->line("Skipped {$student->full_name}: daily quota exhausted.");
                    $totalSkippedCap++;
                    continue;
                }

                // Opt-out guard
                if (isset($optOutPhones[strtolower($recipientPhone)])) {
                    $this->line("Skipped {$student->full_name} ({$recipientPhone}): recipient opted out.");
                    $totalSkippedOptOut++;
                    continue;
                }

                // Deduplication guard: do not send more than once per day for same student/phone
                $alreadySentToday = CommunicationLog::where('school_id', $schoolId)
                    ->where('recipient_student_id', $student->id)
                    ->whereDate('created_at', Carbon::today())
                    ->where('message_category', 'fee')
                    ->exists();

                if ($alreadySentToday) {
                    $this->line("Skipped {$student->full_name}: duplicate reminder already sent today.");
                    $totalSkippedDuplicate++;
                    continue;
                }

                // Test mode filter
                if ($isTestMode && !in_array($recipientPhone, $testRecipients)) {
                    $this->line("Skipped {$student->full_name} ({$recipientPhone}): not in test recipients list.");
                    continue;
                }

                $oldestDueDate = $fees->min('due_date');
                $daysOverdue = Carbon::parse($oldestDueDate)->diffInDays(Carbon::today());

                $messageBody = "Dear {$guardianName}, outstanding fee of ₹" . number_format($totalDue, 2) . " for {$student->full_name} is overdue by {$daysOverdue} days. Kindly settle dues at school counter.";

                if ($isDryRun) {
                    $this->line("[DRY RUN] Would send overdue reminder to {$student->full_name} ({$recipientPhone}) - Dues: ₹" . number_format($totalDue, 2) . " [{$daysOverdue} days overdue]");
                    $totalReminders++;
                    $quotaRemaining--;
                    continue;
                }

                // Record communication log & in-app notification
                CommunicationLog::create([
                    'school_id' => $schoolId,
                    'recipient_student_id' => $student->id,
                    'recipient_user_id' => $student->user_id,
                    'channel' => 'sms',
                    'message_category' => 'fee',
                    'recipient_name' => $guardianName,
                    'recipient_phone' => $recipientPhone,
                    'message_body' => $messageBody,
                    'status' => 'queued',
                ]);

                if ($student->user_id) {
                    Notification::create([
                        'user_id' => $student->user_id,
                        'role' => 'student_parent',
                        'title' => 'Fee Payment Reminder',
                        'message' => $messageBody,
                        'type' => 'alert',
                        'link' => '/fees',
                        'is_read' => false,
                    ]);
                }

                $totalReminders++;
                $quotaRemaining--;
            }
        }

        $this->info("Overdue fee reminders processing complete. Reminders dispatched/simulated: {$totalReminders}. Skipped due to: Cap={$totalSkippedCap}, OptOut={$totalSkippedOptOut}, Duplicate={$totalSkippedDuplicate}.");

        return Command::SUCCESS;
    }
}
