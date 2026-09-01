<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cuts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('production_plan_id')->nullable()->constrained('production_plans')->nullOnDelete();
            $table->foreignUuid('purchase_order_id')->constrained('purchase_orders')->cascadeOnDelete();
            $table->string('cut_number', 50); // e.g. CUT-001
            $table->foreignUuid('color_id')->nullable()->constrained('colors')->nullOnDelete();
            $table->string('color_name', 100);
            $table->foreignUuid('size_id')->nullable()->constrained('sizes')->nullOnDelete();
            $table->string('size_name', 50);
            
            $table->decimal('marker_length', 8, 2)->default(0.00); // yards/meters
            $table->integer('total_plies')->default(50); // fabric layers
            $table->integer('planned_cut_qty')->default(500);
            $table->integer('actual_cut_qty')->default(500);
            $table->integer('pcs_per_bundle')->default(50);
            $table->integer('total_bundles')->default(10);
            $table->string('status', 30)->default('COMPLETED'); // IN_PROGRESS, COMPLETED, CANCELLED
            $table->text('remarks')->nullable();
            $table->foreignUuid('cutting_master_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['purchase_order_id', 'cut_number']);
        });

        Schema::create('bundles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('cut_id')->constrained('cuts')->cascadeOnDelete();
            $table->foreignUuid('purchase_order_id')->constrained('purchase_orders')->cascadeOnDelete();
            $table->integer('bundle_number'); // 1, 2, 3...
            $table->string('bundle_code', 60)->unique(); // e.g. BND-2609-001
            $table->foreignUuid('color_id')->nullable()->constrained('colors')->nullOnDelete();
            $table->string('color_name', 100);
            $table->foreignUuid('size_id')->nullable()->constrained('sizes')->nullOnDelete();
            $table->string('size_name', 50);
            $table->integer('quantity')->default(50);
            $table->string('qr_code_hash', 100)->unique(); // Non-guessable UUID payload
            $table->integer('start_piece_no')->default(1);
            $table->integer('end_piece_no')->default(50);
            $table->string('status', 30)->default('CUT_COMPLETED'); // CUT_COMPLETED, IN_SEWING, SEWN, QC_PASSED, PACKED
            $table->timestamps();
            $table->softDeletes();

            $table->index(['cut_id', 'bundle_number']);
            $table->index(['purchase_order_id', 'status']);
        });

        Schema::create('single_piece_qrs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('bundle_id')->constrained('bundles')->cascadeOnDelete();
            $table->integer('piece_number'); // 1 to 50
            $table->string('unique_tracking_code', 100)->unique();
            $table->string('status', 30)->default('CREATED'); // CREATED, ASSEMBLED, QC_PASSED, DEFECTIVE, PACKED
            $table->timestamps();

            $table->index(['bundle_id', 'piece_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('single_piece_qrs');
        Schema::dropIfExists('bundles');
        Schema::dropIfExists('cuts');
    }
};
