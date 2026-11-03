<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UdiseSchoolFacility extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'academic_year',
        'building_status',
        'total_classrooms_instructional',
        'classrooms_good_condition',
        'classrooms_minor_repair',
        'classrooms_major_repair',
        'total_other_rooms',
        'land_available_for_expansion',
        'playground_available',
        'boundary_wall_type',
        'drinking_water_available',
        'drinking_water_source',
        'drinking_water_functional',
        'water_quality_tested',
        'rainwater_harvesting',
        'boys_toilets_total',
        'boys_toilets_functional',
        'boys_cwsn_toilets',
        'girls_toilets_total',
        'girls_toilets_functional',
        'girls_cwsn_toilets',
        'incinerator_in_girls_toilet',
        'handwash_with_soap_facility',
        'electricity_available',
        'solar_panel_installed',
        'fire_extinguisher_installed',
        'cctv_available',
        'ramp_for_disabled_with_handrail',
        'medical_checkup_conducted',
        'library_available',
        'total_library_books',
        'science_lab_available',
        'computer_lab_available',
        'atl_lab_available',
        'total_functional_desktops',
        'total_functional_laptops',
        'smart_classrooms_projectors',
        'internet_facility',
        'internet_type',
        'internet_speed_mbps',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}
