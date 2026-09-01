<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Orders (Job Orders / Master Contracts)
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('order_number', 100)->unique();
            $table->foreignUuid('buyer_id')->constrained('buyers')->cascadeOnDelete();
            $table->foreignUuid('brand_id')->nullable()->constrained('brands')->nullOnDelete();
            $table->foreignUuid('style_id')->constrained('styles')->cascadeOnDelete();
            $table->foreignUuid('company_id')->nullable()->constrained('companies')->nullOnDelete();
            $table->foreignUuid('unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->string('season', 50)->default('SPRING-2027');
            $table->string('merchant_name', 150)->nullable();
            $table->unsignedInteger('total_quantity')->default(0);
            $table->decimal('total_value', 14, 2)->default(0.00);
            $table->string('currency', 10)->default('USD');
            $table->string('status', 30)->default('DRAFT'); // DRAFT, CONFIRMED, IN_PRODUCTION, COMPLETED, CANCELLED
            $table->string('techpack_path', 255)->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['buyer_id', 'status']);
            $table->index('order_number');
        });

        // 2. Purchase Orders (Child PO Lines)
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('po_number', 100);
            $table->string('destination_market', 100)->default('USA [USA]');
            $table->date('ship_date');
            $table->date('phd_date')->nullable();
            $table->unsignedInteger('order_quantity')->default(0);
            $table->decimal('unit_price', 10, 2)->default(0.00);
            $table->decimal('smv', 8, 2)->default(0.00);
            $table->string('status', 30)->default('DRAFT'); // DRAFT, CONFIRMED, CUTTING_RELEASED, IN_SEWING, SHIPPED, CANCELLED
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['order_id', 'po_number']);
            $table->index('ship_date');
        });

        // 3. PO Color-Size Ratio Matrix Breakdown
        Schema::create('po_breakdowns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('purchase_order_id')->constrained('purchase_orders')->cascadeOnDelete();
            $table->foreignUuid('color_id')->nullable()->constrained('colors')->nullOnDelete();
            $table->string('color_name', 100);
            $table->foreignUuid('size_id')->nullable()->constrained('sizes')->nullOnDelete();
            $table->string('size_name', 50);
            $table->unsignedInteger('quantity')->default(0);
            
            // Real-time lifecycle execution tracking counters
            $table->unsignedInteger('cut_quantity')->default(0);
            $table->unsignedInteger('sewn_quantity')->default(0);
            $table->unsignedInteger('packed_quantity')->default(0);
            $table->unsignedInteger('shipped_quantity')->default(0);
            
            $table->timestamps();

            $table->index(['purchase_order_id', 'color_name', 'size_name']);
        });

        // 4. Buyer PO Import Coordinate Templates
        Schema::create('po_import_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('buyer_id')->constrained('buyers')->cascadeOnDelete();
            $table->string('template_name', 100);
            $table->string('parser_type', 50)->default('MATRIX_GRID'); // MATRIX_GRID, FLAT_ROWS, CUSTOM_COORDINATES
            $table->json('coordinate_schema');
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->index(['buyer_id', 'template_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('po_import_templates');
        Schema::dropIfExists('po_breakdowns');
        Schema::dropIfExists('purchase_orders');
        Schema::dropIfExists('orders');
    }
};
