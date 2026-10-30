<?php

namespace Database\Seeders;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Resource;
use App\Models\School;
use App\Models\Vendor;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class VendorSeeder extends Seeder
{
    public function run(): void
    {
        $schools = School::all();

        foreach ($schools as $school) {
            // Check if school already has vendors
            if (Vendor::withoutGlobalScopes()->where('school_id', $school->id)->exists()) {
                continue;
            }

            $vendorsData = [
                [
                    'vendor_code' => 'VND-0001',
                    'name' => 'Apex Scientific & Lab Instruments',
                    'contact_person' => 'Rajesh Sharma',
                    'phone' => '+91 98765 43210',
                    'email' => 'sales@apexscientific.com',
                    'category' => 'Laboratory & Chemicals',
                    'address' => 'Plot 45, Okhla Industrial Area Phase-II',
                    'city' => 'New Delhi',
                    'state' => 'Delhi',
                    'pincode' => '110020',
                    'gst_number' => '07AAAAA0000A1Z5',
                    'bank_name' => 'State Bank of India',
                    'account_number' => '30982341298',
                    'ifsc_code' => 'SBIN0001234',
                    'status' => 'Active',
                    'notes' => 'Primary vendor for Chemistry & Physics lab apparatus, glassware, and reagents.',
                ],
                [
                    'vendor_code' => 'VND-0002',
                    'name' => 'EduTech Solutions & IT Hardware',
                    'contact_person' => 'Pooja Verma',
                    'phone' => '+91 98234 56789',
                    'email' => 'pooja@edutechit.in',
                    'category' => 'IT & Computers',
                    'address' => 'Cyber City Tech Park, Tower B, 4th Floor',
                    'city' => 'Gurugram',
                    'state' => 'Haryana',
                    'pincode' => '122002',
                    'gst_number' => '06BBBBB1111B2Z6',
                    'bank_name' => 'HDFC Bank',
                    'account_number' => '50100293847561',
                    'ifsc_code' => 'HDFC0000456',
                    'status' => 'Active',
                    'notes' => 'Provides computer monitors, network routers, and interactive smartboards.',
                ],
                [
                    'vendor_code' => 'VND-0003',
                    'name' => 'Scholastic & Oxford Book Distributors',
                    'contact_person' => 'Amitabh Sen',
                    'phone' => '+91 97112 33445',
                    'email' => 'orders@scholasticbooks.co.in',
                    'category' => 'Books & Stationery',
                    'address' => '24 Daryaganj Ansari Road',
                    'city' => 'New Delhi',
                    'state' => 'Delhi',
                    'pincode' => '110002',
                    'gst_number' => '07CCCCC2222C3Z7',
                    'bank_name' => 'ICICI Bank',
                    'account_number' => '002105019844',
                    'ifsc_code' => 'ICIC0000021',
                    'status' => 'Active',
                    'notes' => 'Curriculum textbooks, library reference materials, and examination notebooks.',
                ],
                [
                    'vendor_code' => 'VND-0004',
                    'name' => 'ProSports Arena Equipments',
                    'contact_person' => 'Vikas Sandhu',
                    'phone' => '+91 99988 77665',
                    'email' => 'vikas@prosportsarena.com',
                    'category' => 'Sports Equipment',
                    'address' => 'Sports Complex Market, Sector 12',
                    'city' => 'Faridabad',
                    'state' => 'Haryana',
                    'pincode' => '121007',
                    'gst_number' => '06DDDDD3333D4Z8',
                    'bank_name' => 'Axis Bank',
                    'account_number' => '916020045938491',
                    'ifsc_code' => 'UTIB0000123',
                    'status' => 'Active',
                    'notes' => 'Cricket kits, footballs, athletic hurdles, basketball nets, and referee supplies.',
                ],
                [
                    'vendor_code' => 'VND-0005',
                    'name' => 'Royal Woodcrafts & School Furniture',
                    'contact_person' => 'Harpreet Singh',
                    'phone' => '+91 98110 55443',
                    'email' => 'info@royalwoodcrafts.com',
                    'category' => 'Furniture & Fixtures',
                    'address' => 'Kirti Nagar Industrial Area, Block 3',
                    'city' => 'New Delhi',
                    'state' => 'Delhi',
                    'pincode' => '110015',
                    'gst_number' => '07EEEEE4444E5Z9',
                    'bank_name' => 'Punjab National Bank',
                    'account_number' => '1948002100049583',
                    'ifsc_code' => 'PUNB0194800',
                    'status' => 'Active',
                    'notes' => 'Ergonomic dual-benches, faculty desks, library bookshelves, and whiteboard frames.',
                ],
            ];

            $createdVendors = [];
            foreach ($vendorsData as $v) {
                $v['school_id'] = $school->id;
                $vendor = Vendor::create($v);
                $createdVendors[] = $vendor;
            }

            // Create 3 realistic purchase orders for the school
            // PO 1: Lab Apparatus (Delivered & Paid)
            $v1 = $createdVendors[0];
            $po1 = PurchaseOrder::create([
                'school_id' => $school->id,
                'po_number' => 'PO-' . date('Y') . '-0001',
                'vendor_id' => $v1->id,
                'order_date' => Carbon::now()->subDays(18)->toDateString(),
                'expected_delivery_date' => Carbon::now()->subDays(10)->toDateString(),
                'delivery_date' => Carbon::now()->subDays(9)->toDateString(),
                'category' => 'Laboratory & Chemicals',
                'subtotal' => 24500.00,
                'tax_rate' => 18.00,
                'tax_amount' => 4410.00,
                'discount_amount' => 500.00,
                'total_amount' => 28410.00,
                'status' => 'Delivered',
                'payment_status' => 'Paid',
                'payment_mode' => 'Bank Transfer / NEFT',
                'shipping_address' => 'Science Block, ' . $school->name . ', ' . ($school->city ?? 'Campus'),
                'notes' => 'Received with full QC inspection report by HOD Science.',
            ]);

            PurchaseOrderItem::create([
                'purchase_order_id' => $po1->id,
                'item_name' => 'Digital Compound Microscopes (1000x)',
                'description' => 'Binocular head, LED illumination with mechanical stage',
                'quantity' => 5,
                'unit' => 'Pieces',
                'unit_price' => 3800.00,
                'total_price' => 19000.00,
            ]);

            PurchaseOrderItem::create([
                'purchase_order_id' => $po1->id,
                'item_name' => 'Borosilicate Glass Beakers & Flasks Set',
                'description' => 'Assorted 100ml, 250ml, 500ml with calibration marks',
                'quantity' => 10,
                'unit' => 'Sets',
                'unit_price' => 550.00,
                'total_price' => 5500.00,
            ]);

            // PO 2: IT Equipment (Ordered / In Transit)
            $v2 = $createdVendors[1];
            $po2 = PurchaseOrder::create([
                'school_id' => $school->id,
                'po_number' => 'PO-' . date('Y') . '-0002',
                'vendor_id' => $v2->id,
                'order_date' => Carbon::now()->subDays(4)->toDateString(),
                'expected_delivery_date' => Carbon::now()->addDays(3)->toDateString(),
                'delivery_date' => null,
                'category' => 'IT & Computers',
                'subtotal' => 56000.00,
                'tax_rate' => 18.00,
                'tax_amount' => 10080.00,
                'discount_amount' => 1080.00,
                'total_amount' => 65000.00,
                'status' => 'Ordered',
                'payment_status' => 'Pending',
                'payment_mode' => 'Bank Transfer / NEFT',
                'shipping_address' => 'Computer Lab 1, ' . $school->name,
                'notes' => 'Urgent requirement for Computer Science Practical Sessions.',
            ]);

            PurchaseOrderItem::create([
                'purchase_order_id' => $po2->id,
                'item_name' => 'Dell 24" FHD IPS LED Monitors',
                'description' => 'HDMI/VGA ports with anti-glare coating for student terminals',
                'quantity' => 8,
                'unit' => 'Pieces',
                'unit_price' => 7000.00,
                'total_price' => 56000.00,
            ]);

            // PO 3: Sports Goods (Draft)
            $v4 = $createdVendors[3];
            $po3 = PurchaseOrder::create([
                'school_id' => $school->id,
                'po_number' => 'PO-' . date('Y') . '-0003',
                'vendor_id' => $v4->id,
                'order_date' => Carbon::now()->toDateString(),
                'expected_delivery_date' => Carbon::now()->addDays(7)->toDateString(),
                'delivery_date' => null,
                'category' => 'Sports Equipment',
                'subtotal' => 16500.00,
                'tax_rate' => 12.00,
                'tax_amount' => 1980.00,
                'discount_amount' => 480.00,
                'total_amount' => 18000.00,
                'status' => 'Draft',
                'payment_status' => 'Pending',
                'payment_mode' => 'UPI',
                'shipping_address' => 'Sports Department, ' . $school->name,
                'notes' => 'Preparation for Annual Inter-School Sports Tournament.',
            ]);

            PurchaseOrderItem::create([
                'purchase_order_id' => $po3->id,
                'item_name' => 'FIFA Certified Size 5 Match Footballs',
                'description' => 'Hand-stitched synthetic PU match footballs',
                'quantity' => 6,
                'unit' => 'Pieces',
                'unit_price' => 1250.00,
                'total_price' => 7500.00,
            ]);

            PurchaseOrderItem::create([
                'purchase_order_id' => $po3->id,
                'item_name' => 'English Willow Cricket Bats & Leather Balls Set',
                'description' => 'Grade 2 English Willow with 12 red four-piece leather balls',
                'quantity' => 3,
                'unit' => 'Sets',
                'unit_price' => 3000.00,
                'total_price' => 9000.00,
            ]);
        }
    }
}
