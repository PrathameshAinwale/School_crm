<?php

namespace App\Services\Communication;

use App\Services\Communication\Contracts\EmailProviderInterface;
use App\Services\Communication\Contracts\PushNotificationProviderInterface;
use App\Services\Communication\Contracts\SmsProviderInterface;
use App\Services\Communication\Contracts\WhatsAppProviderInterface;
use App\Services\Communication\Drivers\FcmPushDriver;
use App\Services\Communication\Drivers\GenericHttpSmsDriver;
use App\Services\Communication\Drivers\MetaCloudWhatsAppDriver;
use App\Services\Communication\Drivers\SmtpEmailDriver;
use InvalidArgumentException;

class CommunicationManager
{
    protected ?SmsProviderInterface $smsDriver = null;
    protected ?WhatsAppProviderInterface $whatsAppDriver = null;
    protected ?EmailProviderInterface $emailDriver = null;
    protected ?PushNotificationProviderInterface $pushDriver = null;

    public function sms(): SmsProviderInterface
    {
        return $this->smsDriver ??= app(GenericHttpSmsDriver::class);
    }

    public function whatsApp(): WhatsAppProviderInterface
    {
        return $this->whatsAppDriver ??= app(MetaCloudWhatsAppDriver::class);
    }

    public function email(): EmailProviderInterface
    {
        return $this->emailDriver ??= app(SmtpEmailDriver::class);
    }

    public function push(): PushNotificationProviderInterface
    {
        return $this->pushDriver ??= app(FcmPushDriver::class);
    }

    public function setSmsDriver(SmsProviderInterface $driver): void
    {
        $this->smsDriver = $driver;
    }

    public function setWhatsAppDriver(WhatsAppProviderInterface $driver): void
    {
        $this->whatsAppDriver = $driver;
    }

    public function setEmailDriver(EmailProviderInterface $driver): void
    {
        $this->emailDriver = $driver;
    }

    public function setPushDriver(PushNotificationProviderInterface $driver): void
    {
        $this->pushDriver = $driver;
    }
}

