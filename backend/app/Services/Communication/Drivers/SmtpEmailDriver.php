<?php

namespace App\Services\Communication\Drivers;

use App\Models\School;
use App\Models\SchoolSetting;
use App\Services\Communication\Contracts\EmailProviderInterface;
use App\Services\Communication\DTO\ProviderSendResult;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Throwable;

class SmtpEmailDriver implements EmailProviderInterface
{
    public function send(string $to, string $subject, string $htmlBody, array $attachments = [], int $schoolId = 0): ProviderSendResult
    {
        $school = School::find($schoolId);
        $schoolName = $school ? $school->name : config('app.name', 'School CRM');

        // Dynamic SMTP configuration if set per school
        $smtpHost = SchoolSetting::getDecrypted('smtp_host', $schoolId, env('MAIL_HOST'));
        $smtpUser = SchoolSetting::getDecrypted('smtp_username', $schoolId, env('MAIL_USERNAME'));
        $smtpPass = SchoolSetting::getDecrypted('smtp_password', $schoolId, env('MAIL_PASSWORD'));
        $smtpPort = SchoolSetting::getDecrypted('smtp_port', $schoolId, env('MAIL_PORT', 587));
        $smtpEnc = SchoolSetting::getDecrypted('smtp_encryption', $schoolId, env('MAIL_ENCRYPTION', 'tls'));
        $fromEmail = SchoolSetting::getDecrypted('smtp_from_address', $schoolId, env('MAIL_FROM_ADDRESS', 'noreply@schoolcrm.com'));

        try {
            if ($smtpHost && $smtpUser && $smtpPass) {
                Config::set('mail.mailers.school_smtp', [
                    'transport' => 'smtp',
                    'host' => $smtpHost,
                    'port' => (int) $smtpPort,
                    'encryption' => $smtpEnc,
                    'username' => $smtpUser,
                    'password' => $smtpPass,
                    'timeout' => 8,
                ]);
                $mailer = Mail::mailer('school_smtp');
            } else {
                $mailer = Mail::mailer();
            }

            $messageId = 'email_' . Str::random(24) . '@' . parse_url(config('app.url', 'schoolcrm.com'), PHP_URL_HOST);

            $mailer->html($htmlBody, function ($message) use ($to, $subject, $fromEmail, $schoolName) {
                $message->to($to)
                    ->from($fromEmail, $schoolName)
                    ->subject($subject);
            });

            return ProviderSendResult::success($messageId);
        } catch (Throwable $e) {
            return ProviderSendResult::failure("Email Dispatch Exception: " . $e->getMessage());
        }
    }
}

