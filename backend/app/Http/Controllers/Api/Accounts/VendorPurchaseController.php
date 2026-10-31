<?php

namespace App\Http\Controllers\Api\Accounts;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Resource;
use App\Models\SchoolExpense;
use App\Models\Vendor;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class VendorPurchaseController extends Controller
{
    /**
     * List all vendors with procurement statistics.
     */
    public function vendorsList(Request $request)
    {
        $query = Vendor::withCount('purchaseOrders')
            ->with(['purchaseOrders' => function ($q) {
                $q->select('id', 'vendor_id', 'total_amount', 'status', 'payment_status', 'order_date');
            }]);

        if ($request->filled('category') && strtolower($request->category) !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->filled('status') && strtolower($request->status) !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('vendor_code', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        $vendors = $query->orderBy('name', 'asc')->get();

        $mapped = $vendors->map(function ($v) {
            $orders = $v->purchaseOrders;
            $totalSpent = (float) $orders->whereIn('payment_status', ['Paid'])->sum('total_amount');
            $activeOrdersCount = $orders->whereNotIn('status', ['Delivered', 'Cancelled'])->count();
            $latestOrder = $orders->sortByDesc('order_date')->first();

            return [
                'id' => $v->id,
                'vendorCode' => $v->vendor_code,
                'name' => $v->name,
                'contactPerson' => $v->contact_person ?: '—',
                'phone' => $v->phone ?: '—',
                'email' => $v->email ?: '—',
                'category' => $v->category,
                'address' => $v->address ?: '',
                'city' => $v->city ?: '',
                'state' => $v->state ?: '',
                'pincode' => $v->pincode ?: '',
                'gstNumber' => $v->gst_number ?: '—',
                'bankName' => $v->bank_name ?: '—',
                'accountNumber' => $v->account_number ?: '—',
                'ifscCode' => $v->ifsc_code ?: '—',
                'status' => $v->status,
                'notes' => $v->notes ?: '',
                'totalOrders' => $v->purchase_orders_count,
                'totalSpent' => $totalSpent,
                'activeOrdersCount' => $activeOrdersCount,
                'lastOrderDate' => $latestOrder && $latestOrder->order_date ? $latestOrder->order_date->format('M d, Y') : 'No orders yet',
                'createdAt' => $v->created_at ? $v->created_at->format('M d, Y') : '—',
            ];
        });

        // Overall Procurement KPI Metrics
        $allOrders = PurchaseOrder::all();
        $totalProcurementValue = (float) $allOrders->whereNotIn('status', ['Cancelled'])->sum('total_amount');
        $activeOrders = $allOrders->whereNotIn('status', ['Delivered', 'Cancelled'])->count();
        $deliveredOrders = $allOrders->where('status', 'Delivered')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'vendors' => $mapped,
                'summary' => [
                    'totalVendors' => $vendors->count(),
                    'activeVendors' => $vendors->where('status', 'Active')->count(),
                    'totalOrders' => $allOrders->count(),
                    'activeOrders' => $activeOrders,
                    'deliveredOrders' => $deliveredOrders,
                    'totalProcurementValue' => $totalProcurementValue,
                ],
            ],
            'vendors' => $mapped,
        ]);
    }

    /**
     * Store new Vendor.
     */
    public function storeVendor(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'category' => 'required|string|max:100',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'pincode' => 'nullable|string|max:20',
            'gst_number' => 'nullable|string|max:50',
            'bank_name' => 'nullable|string|max:150',
            'account_number' => 'nullable|string|max:100',
            'ifsc_code' => 'nullable|string|max:50',
            'status' => 'nullable|string|in:Active,Inactive',
            'notes' => 'nullable|string',
        ]);

        $maxId = Vendor::withoutGlobalScopes()->max('id') ?? 0;
        $vendorCode = 'VND-' . str_pad($maxId + 1, 4, '0', STR_PAD_LEFT);

        $vendor = Vendor::create([
            'school_id' => Auth::user() ? Auth::user()->school_id : null,
            'vendor_code' => $vendorCode,
            'name' => $validated['name'],
            'contact_person' => $validated['contact_person'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'category' => $validated['category'] ?? 'General Supplies',
            'address' => $validated['address'] ?? null,
            'city' => $validated['city'] ?? null,
            'state' => $validated['state'] ?? null,
            'pincode' => $validated['pincode'] ?? null,
            'gst_number' => $validated['gst_number'] ?? null,
            'bank_name' => $validated['bank_name'] ?? null,
            'account_number' => $validated['account_number'] ?? null,
            'ifsc_code' => $validated['ifsc_code'] ?? null,
            'status' => $validated['status'] ?? 'Active',
            'notes' => $validated['notes'] ?? null,
            'created_by_user_id' => Auth::id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Vendor {$vendor->name} added successfully with code {$vendor->vendor_code}.",
            'data' => $vendor,
        ], 201);
    }

    /**
     * Update existing Vendor.
     */
    public function updateVendor(Request $request, $id)
    {
        $vendor = Vendor::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'category' => 'required|string|max:100',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'pincode' => 'nullable|string|max:20',
            'gst_number' => 'nullable|string|max:50',
            'bank_name' => 'nullable|string|max:150',
            'account_number' => 'nullable|string|max:100',
            'ifsc_code' => 'nullable|string|max:50',
            'status' => 'required|string|in:Active,Inactive',
            'notes' => 'nullable|string',
        ]);

        $vendor->update($validated);

        return response()->json([
            'success' => true,
            'message' => "Vendor details for {$vendor->name} updated successfully.",
            'data' => $vendor,
        ]);
    }

    /**
     * Delete Vendor.
     */
    public function destroyVendor($id)
    {
        $vendor = Vendor::withCount('purchaseOrders')->findOrFail($id);

        if ($vendor->purchase_orders_count > 0) {
            return response()->json([
                'success' => false,
                'message' => "Cannot delete vendor '{$vendor->name}' because they have {$vendor->purchase_orders_count} associated purchase order(s). You can mark the vendor as Inactive instead.",
            ], 422);
        }

        $vendor->delete();

        return response()->json([
            'success' => true,
            'message' => "Vendor deleted successfully.",
        ]);
    }

    /**
     * List all Purchase Orders.
     */
    public function ordersList(Request $request)
    {
        $query = PurchaseOrder::with(['vendor', 'items.resource', 'creator']);

        if ($request->filled('status') && strtolower($request->status) !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_status') && strtolower($request->payment_status) !== 'all') {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('vendor_id') && strtolower($request->vendor_id) !== 'all') {
            $query->where('vendor_id', $request->vendor_id);
        }

        if ($request->filled('category') && strtolower($request->category) !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('po_number', 'like', "%{$search}%")
                  ->orWhereHas('vendor', function ($vq) use ($search) {
                      $vq->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('items', function ($iq) use ($search) {
                      $iq->where('item_name', 'like', "%{$search}%");
                  });
            });
        }

        $orders = $query->orderBy('order_date', 'desc')->orderBy('id', 'desc')->get();

        $mapped = $orders->map(function ($po) {
            return [
                'id' => $po->id,
                'poNumber' => $po->po_number,
                'vendorId' => $po->vendor_id,
                'vendorName' => $po->vendor ? $po->vendor->name : 'Unknown Vendor',
                'vendorPhone' => $po->vendor ? $po->vendor->phone : '',
                'vendorEmail' => $po->vendor ? $po->vendor->email : '',
                'vendorContact' => $po->vendor ? $po->vendor->contact_person : '',
                'orderDate' => $po->order_date ? $po->order_date->format('M d, Y') : '—',
                'rawOrderDate' => $po->order_date ? $po->order_date->toDateString() : '',
                'expectedDeliveryDate' => $po->expected_delivery_date ? $po->expected_delivery_date->format('M d, Y') : '—',
                'rawExpectedDeliveryDate' => $po->expected_delivery_date ? $po->expected_delivery_date->toDateString() : '',
                'deliveryDate' => $po->delivery_date ? $po->delivery_date->format('M d, Y') : null,
                'category' => $po->category,
                'subtotal' => (float) $po->subtotal,
                'taxRate' => (float) $po->tax_rate,
                'taxAmount' => (float) $po->tax_amount,
                'discountAmount' => (float) $po->discount_amount,
                'totalAmount' => (float) $po->total_amount,
                'status' => $po->status,
                'paymentStatus' => $po->payment_status,
                'paymentMode' => $po->payment_mode ?: '—',
                'shippingAddress' => $po->shipping_address ?: '',
                'notes' => $po->notes ?: '',
                'termsAndConditions' => $po->terms_and_conditions ?: '',
                'itemsCount' => $po->items->count(),
                'items' => $po->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'resourceId' => $item->resource_id,
                        'itemName' => $item->item_name,
                        'description' => $item->description ?: '',
                        'quantity' => $item->quantity,
                        'unit' => $item->unit,
                        'unitPrice' => (float) $item->unit_price,
                        'totalPrice' => (float) $item->total_price,
                        'linkedResourceName' => $item->resource ? $item->resource->name : null,
                        'linkedResourceCode' => $item->resource ? $item->resource->resource_code : null,
                    ];
                }),
                'creatorName' => $po->creator ? $po->creator->name : 'Accountant',
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'orders' => $mapped,
                'totalCount' => $orders->count(),
                'totalAmount' => (float) $orders->sum('total_amount'),
            ],
            'orders' => $mapped,
        ]);
    }

    /**
     * Show single Purchase Order with complete details.
     */
    public function showOrder($id)
    {
        $po = PurchaseOrder::with(['vendor', 'items.resource', 'creator', 'school'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $po->id,
                'poNumber' => $po->po_number,
                'vendor' => $po->vendor,
                'orderDate' => $po->order_date ? $po->order_date->format('d M Y') : '—',
                'expectedDeliveryDate' => $po->expected_delivery_date ? $po->expected_delivery_date->format('d M Y') : '—',
                'deliveryDate' => $po->delivery_date ? $po->delivery_date->format('d M Y') : null,
                'category' => $po->category,
                'subtotal' => (float) $po->subtotal,
                'taxRate' => (float) $po->tax_rate,
                'taxAmount' => (float) $po->tax_amount,
                'discountAmount' => (float) $po->discount_amount,
                'totalAmount' => (float) $po->total_amount,
                'status' => $po->status,
                'paymentStatus' => $po->payment_status,
                'paymentMode' => $po->payment_mode,
                'shippingAddress' => $po->shipping_address,
                'notes' => $po->notes,
                'termsAndConditions' => $po->terms_and_conditions,
                'school' => $po->school,
                'creator' => $po->creator ? ['name' => $po->creator->name, 'email' => $po->creator->email] : null,
                'items' => $po->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'resourceId' => $item->resource_id,
                        'itemName' => $item->item_name,
                        'description' => $item->description,
                        'quantity' => $item->quantity,
                        'unit' => $item->unit,
                        'unitPrice' => (float) $item->unit_price,
                        'totalPrice' => (float) $item->total_price,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Store new Purchase Order with line items.
     */
    public function storeOrder(Request $request)
    {
        $validated = $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'order_date' => 'required|date',
            'expected_delivery_date' => 'nullable|date',
            'category' => 'required|string|max:100',
            'status' => 'nullable|string|in:Draft,Ordered,Shipped,Delivered',
            'payment_status' => 'nullable|string|in:Pending,Partial,Paid',
            'payment_mode' => 'nullable|string|max:100',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'discount_amount' => 'nullable|numeric|min:0',
            'shipping_address' => 'nullable|string',
            'notes' => 'nullable|string',
            'terms_and_conditions' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.item_name' => 'required|string|max:255',
            'items.*.description' => 'nullable|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit' => 'nullable|string|max:50',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.resource_id' => 'nullable|exists:resources,id',
            'sync_inventory' => 'nullable|boolean',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $maxId = PurchaseOrder::withoutGlobalScopes()->max('id') ?? 0;
            $year = Carbon::parse($validated['order_date'])->format('Y');
            $poNumber = 'PO-' . $year . '-' . str_pad($maxId + 1, 4, '0', STR_PAD_LEFT);

            // Compute subtotal
            $subtotal = 0;
            foreach ($validated['items'] as $item) {
                $subtotal += ($item['quantity'] * $item['unit_price']);
            }

            $taxRate = (float) ($validated['tax_rate'] ?? 0);
            $taxAmount = round(($subtotal * $taxRate) / 100, 2);
            $discount = (float) ($validated['discount_amount'] ?? 0);
            $totalAmount = max(0, ($subtotal + $taxAmount - $discount));

            $expectedDeliveryDate = !empty($validated['expected_delivery_date'])
                ? Carbon::parse($validated['expected_delivery_date'])->toDateString()
                : null;

            $order = PurchaseOrder::create([
                'school_id' => Auth::user() ? Auth::user()->school_id : null,
                'po_number' => $poNumber,
                'vendor_id' => $validated['vendor_id'],
                'order_date' => Carbon::parse($validated['order_date'])->toDateString(),
                'expected_delivery_date' => $expectedDeliveryDate,
                'category' => $validated['category'],
                'subtotal' => $subtotal,
                'tax_rate' => $taxRate,
                'tax_amount' => $taxAmount,
                'discount_amount' => $discount,
                'total_amount' => $totalAmount,
                'status' => $validated['status'] ?? 'Draft',
                'payment_status' => $validated['payment_status'] ?? 'Pending',
                'payment_mode' => $validated['payment_mode'] ?? null,
                'shipping_address' => $validated['shipping_address'] ?? null,
                'terms_and_conditions' => $validated['terms_and_conditions'] ?? 'Standard school procurement terms apply. Goods inspected upon delivery.',
                'notes' => $validated['notes'] ?? null,
                'created_by_user_id' => Auth::id(),
            ]);

            // Save line items
            foreach ($validated['items'] as $item) {
                $lineTotal = $item['quantity'] * $item['unit_price'];
                $resourceId = (!empty($item['resource_id']) && is_numeric($item['resource_id'])) ? (int)$item['resource_id'] : null;
                if ($resourceId && !Resource::find($resourceId)) {
                    $resourceId = null;
                }

                PurchaseOrderItem::create([
                    'purchase_order_id' => $order->id,
                    'resource_id' => $resourceId,
                    'item_name' => $item['item_name'],
                    'description' => $item['description'] ?? null,
                    'quantity' => $item['quantity'],
                    'unit' => $item['unit'] ?? 'Pieces',
                    'unit_price' => $item['unit_price'],
                    'total_price' => $lineTotal,
                ]);

                // If created as Delivered immediately and inventory sync requested
                if (($order->status === 'Delivered') && !empty($resourceId)) {
                    $resource = Resource::find($resourceId);
                    if ($resource) {
                        $resource->increment('total_quantity', $item['quantity']);
                        $resource->increment('available_quantity', $item['quantity']);
                        $resource->update(['unit_cost' => $item['unit_price']]);
                    }
                }
            }

            // If created as Paid, auto-record expense
            if ($order->payment_status === 'Paid') {
                $vendor = Vendor::find($order->vendor_id);
                $expMaxId = SchoolExpense::withoutGlobalScopes()->max('id') ?? 0;
                $expenseCode = 'EXP-' . date('Y') . '-' . str_pad($expMaxId + 1, 4, '0', STR_PAD_LEFT);

                $expense = SchoolExpense::create([
                    'school_id' => $order->school_id ?: (Auth::user() ? Auth::user()->school_id : null),
                    'expense_code' => $expenseCode,
                    'title' => "Purchase Order #{$order->po_number} - " . ($vendor ? $vendor->name : 'Vendor'),
                    'category' => 'Resources & Equipment',
                    'amount' => $order->total_amount,
                    'expense_date' => $order->order_date,
                    'payment_mode' => $order->payment_mode ?: 'Bank Transfer / NEFT',
                    'vendor_name' => $vendor ? $vendor->name : null,
                    'invoice_number' => $order->po_number,
                    'status' => 'Paid',
                    'notes' => "Auto-logged from Purchase Order {$order->po_number}",
                    'recorded_by_user_id' => Auth::id(),
                ]);

                $order->update(['expense_id' => $expense->id]);
            }

            return response()->json([
                'success' => true,
                'message' => "Purchase Order {$order->po_number} generated successfully.",
                'data' => $order->load(['vendor', 'items']),
            ], 201);
        });
    }

    /**
     * Update order delivery status (Draft, Ordered, Shipped, Delivered, Cancelled).
     * When marked Delivered, syncs quantities to resources inventory.
     */
    public function updateOrderStatus(Request $request, $id)
    {
        $order = PurchaseOrder::with('items')->findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:Draft,Ordered,Shipped,Delivered,Cancelled',
            'delivery_date' => 'nullable|date',
            'sync_inventory' => 'nullable|boolean',
        ]);

        $prevStatus = $order->status;
        $newStatus = $validated['status'];

        $updateData = ['status' => $newStatus];

        if ($newStatus === 'Delivered') {
            $updateData['delivery_date'] = $validated['delivery_date'] ?? now()->toDateString();

            // Sync to inventory if requested or if resources are linked and wasn't already delivered
            if ($prevStatus !== 'Delivered') {
                foreach ($order->items as $item) {
                    if ($item->resource_id) {
                        $res = Resource::find($item->resource_id);
                        if ($res) {
                            $res->increment('total_quantity', $item->quantity);
                            $res->increment('available_quantity', $item->quantity);
                        }
                    } elseif ($request->boolean('sync_inventory')) {
                        // Create or match resource in inventory
                        $res = Resource::firstOrCreate(
                            ['name' => $item->item_name],
                            [
                                'resource_code' => 'RES-' . strtoupper(substr($order->category, 0, 3)) . '-' . rand(100, 999),
                                'category' => $order->category,
                                'total_quantity' => $item->quantity,
                                'available_quantity' => $item->quantity,
                                'condition' => 'Good',
                                'unit_cost' => $item->unit_price,
                                'status' => 'Available',
                                'purchase_date' => $updateData['delivery_date'],
                            ]
                        );
                        $item->update(['resource_id' => $res->id]);
                    }
                }
            }
        }

        $order->update($updateData);

        return response()->json([
            'success' => true,
            'message' => "Order #{$order->po_number} status updated to '{$newStatus}'.",
            'data' => $order,
        ]);
    }

    /**
     * Update payment status (Pending, Partial, Paid) and record in School Expenses.
     */
    public function updatePaymentStatus(Request $request, $id)
    {
        $order = PurchaseOrder::with('vendor')->findOrFail($id);

        $validated = $request->validate([
            'payment_status' => 'required|string|in:Pending,Partial,Paid',
            'payment_mode' => 'nullable|string|max:100',
        ]);

        $order->payment_status = $validated['payment_status'];
        if (!empty($validated['payment_mode'])) {
            $order->payment_mode = $validated['payment_mode'];
        }
        $order->save();

        // If Paid and no expense entry exists yet, auto-record in school_expenses
        if ($order->payment_status === 'Paid' && !$order->expense_id) {
            $expMaxId = SchoolExpense::withoutGlobalScopes()->max('id') ?? 0;
            $expenseCode = 'EXP-' . date('Y') . '-' . str_pad($expMaxId + 1, 4, '0', STR_PAD_LEFT);

            $expense = SchoolExpense::create([
                'school_id' => $order->school_id ?: (Auth::user() ? Auth::user()->school_id : null),
                'expense_code' => $expenseCode,
                'title' => "Purchase Order #{$order->po_number} - " . ($order->vendor ? $order->vendor->name : 'Vendor'),
                'category' => 'Resources & Equipment',
                'amount' => $order->total_amount,
                'expense_date' => now()->toDateString(),
                'payment_mode' => $order->payment_mode ?: 'Bank Transfer / NEFT',
                'vendor_name' => $order->vendor ? $order->vendor->name : null,
                'invoice_number' => $order->po_number,
                'status' => 'Paid',
                'notes' => "Auto-logged from Purchase Order {$order->po_number}",
                'recorded_by_user_id' => Auth::id(),
            ]);

            $order->update(['expense_id' => $expense->id]);
        }

        return response()->json([
            'success' => true,
            'message' => "Payment status for Order #{$order->po_number} marked as '{$order->payment_status}'.",
            'data' => $order,
        ]);
    }

    /**
     * Delete Purchase Order.
     */
    public function destroyOrder($id)
    {
        $order = PurchaseOrder::findOrFail($id);
        $poNumber = $order->po_number;
        $order->delete();

        return response()->json([
            'success' => true,
            'message' => "Purchase Order {$poNumber} deleted successfully.",
        ]);
    }

    /**
     * Quick list of available school resources for item picker.
     */
    public function availableResources()
    {
        $resources = Resource::select('id', 'resource_code', 'name', 'category', 'available_quantity', 'unit_cost')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $resources,
        ]);
    }
}
