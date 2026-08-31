<?php
header('Content-Type: application/json');
$envPath = __DIR__ . '/../.env';

if (file_exists($envPath)) {
    echo json_encode([
        'status' => 'exists',
        'message' => '.env already exists on Hostinger'
    ]);
    exit;
}

$content = <<<'ENV'
APP_NAME="School CRM"
APP_ENV=production
APP_KEY=base64:B39gZBC5HcPL6sBP0PA2V1ANd15LgFeG5TF0Ne0cy54=
APP_DEBUG=true
APP_TIMEZONE=Asia/Kolkata
APP_URL=https://powderblue-trout-993647.hostingersite.com
FRONTEND_URL=https://powderblue-trout-993647.hostingersite.com

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=u773098752_school_sms
DB_USERNAME=u773098752_school_sms
DB_PASSWORD=~5kBI$Srj6L

SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=file

CACHE_STORE=file

MEMCACHED_HOST=127.0.0.1

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=log
MAIL_SCHEME=null
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"
ENV;

file_put_contents($envPath, $content);

echo json_encode([
    'status' => 'created',
    'message' => '.env successfully generated on Hostinger!'
]);
