<?php

namespace App\Console\Commands;

use App\Models\School;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class EnsureDemoRolesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'school:ensure-demo-roles';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Ensure Principal and Admission Officer demo accounts exist with active credentials';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $school = School::first();
        $schoolId = $school ? $school->id : 1;

        // 1. Ensure Principal account
        $principal = User::firstOrNew(['email' => 'principal@school.com']);
        $principal->name = 'Dr. Rajeshwari Sharma (Principal)';
        $principal->phone = $principal->phone ?: '9876543219';
        $principal->password = Hash::make('111111');
        $principal->role = 'principal';
        $principal->school_id = $schoolId;
        $principal->status = 'active';
        $principal->must_change_password = false;
        $principal->save();
        $this->info("Principal account ensured: principal@school.com / 111111 (Role: {$principal->role}, School: {$schoolId})");

        // 2. Ensure Admission Officer account
        $admissionOfficer = User::firstOrNew(['email' => 'admissions@school.com']);
        $admissionOfficer->name = 'Meera Joshi (Admissions Officer)';
        $admissionOfficer->phone = $admissionOfficer->phone ?: '9876543220';
        $admissionOfficer->password = Hash::make('111111');
        $admissionOfficer->role = 'admission_officer';
        $admissionOfficer->school_id = $schoolId;
        $admissionOfficer->status = 'active';
        $admissionOfficer->must_change_password = false;
        $admissionOfficer->save();
        $this->info("Admissions Officer account ensured: admissions@school.com / 111111 (Role: {$admissionOfficer->role}, School: {$schoolId})");

        return Command::SUCCESS;
    }
}

