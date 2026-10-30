<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Vendors Table
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->constrained('schools')->onDelete('cascade');
            $table->string('vendor_code')->index();
            $table->string('name');
            $table->string('contact_person')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('category')->default('General Supplies'); 
            // e.g. Laboratory & Chemicals, IT & Computers, Books & Stationery, Sports Equipment, Furniture & Fixtures, Uniforms, Maintenance & Repairs, Electrical & AV, General Supplies
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('pincode')->nullable();
            $table->string('gst_number')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('ifsc_code')->nullable();
            $table->string('status')->default('Active'); // Active, Inactive
            $table->text('notes')->nullable();
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });

        // 2. Purchase Orders Table
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->constrained('schools')->onDelete('cascade');
            $table->string('po_number')->index();
            $table->foreignId('vendor_id')->constrained('vendors')->onDelete('cascade');
            $table->date('order_date');
            $table->date('expected_delivery_date')->nullable();
            $table->date('delivery_date')->nullable();
            $table->string('category')->default('General Supplies');
            $table->decimal('subtotal', 12, 2)->default(0.00);
            $table->decimal('tax_rate', 5, 2)->default(0.00); // e.g. 18.00%
            $table->decimal('tax_amount', 12, 2)->default(0.00);
            $table->decimal('discount_amount', 12, 2)->default(0.00);
            $table->decimal('total_amount', 12, 2)->default(0.00);
            $table->string('status')->default('Draft'); // Draft, Ordered, Shipped, Delivered, Cancelled
            $table->string('payment_status')->default('Pending'); // Pending, Partial, Paid
            $table->string('payment_mode')->nullable(); // Bank Transfer / NEFT, UPI, Cheque, Cash
            $table->text('shipping_address')->nullable();
            $table->text('terms_and_conditions')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('expense_id')->nullable()->constrained('school_expenses')->onDelete('set null');
            $table->timestamps();
        });

        // 3. Purchase Order Items Table
        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained('purchase_orders')->onDelete('cascade');
            $table->foreignId('resource_id')->nullable()->constrained('resources')->onDelete('set null');
            $table->string('item_name');
            $table->text('description')->nullable();
            $table->unsignedInteger('quantity')->default(1);
            $table->string('unit')->default('Pieces'); // Pieces, Boxes, Sets, Kg, Liters, Units
            $table->decimal('unit_price', 12, 2)->default(0.00);
            $table->decimal('total_price', 12, 2)->default(0.00);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists('purchase_orders');
        Schema::dropIfExists('vendors');
    }
};
