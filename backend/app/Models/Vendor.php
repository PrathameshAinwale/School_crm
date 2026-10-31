<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vendor extends Model
{
    use HasFactory, BelongsToSchool;

    protected $fillable = [
        'school_id',
        'vendor_code',
        'name',
        'contact_person',
        'phone',
        'email',
        'category',
        'address',
        'city',
        'state',
        'pincode',
        'gst_number',
        'bank_name',
        'account_number',
        'ifsc_code',
        'status',
        'notes',
        'created_by_user_id',
    ];

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class, 'vendor_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
}
