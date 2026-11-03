<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UdiseSchoolProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'academic_year',
        'udise_code',
        'school_category',
        'management_group',
        'type_of_school',
        'lowest_class',
        'highest_class',
        'pre_primary_section',
        'establishment_year',
        'recognition_year_primary',
        'recognition_year_upper_primary',
        'recognition_year_secondary',
        'recognition_year_higher_secondary',
        'affiliation_board_secondary',
        'affiliation_no_secondary',
        'affiliation_board_higher_secondary',
        'affiliation_no_higher_secondary',
        'medium_of_instruction_1',
        'medium_of_instruction_2',
        'medium_of_instruction_3',
        'distance_from_primary_school_km',
        'distance_from_secondary_school_km',
        'is_residential',
        'is_shift_school',
        'is_special_school_cwsn',
        'head_of_school_type',
        'head_of_school_name',
        'head_of_school_mobile',
        'nodal_officer_name',
        'nodal_officer_mobile',
        'nodal_officer_email',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}
