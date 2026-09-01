<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('production_plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignUuid('purchase_order_id')->nullable()->constrained('purchase_orders')->nullOnDelete();
            $table->foreignUuid('unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->foreignUuid('line_id')->constrained('production_lines')->cascadeOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('smv', 8, 2)->default(20.00);
            $table->integer('manpower')->default(30);
            $table->decimal('target_efficiency', 5, 2)->default(60.00); // 60.00%
            $table->integer('hourly_target')->default(72);
            $table->integer('planned_quantity')->default(1000);
            
            // Cutting Governance Mode: DEPENDENT (Strict FIFO by Ship Date) vs INDEPENDENT (Flexible Cutting)
            $table->enum('cutting_mode', ['DEPENDENT', 'INDEPENDENT'])->default('DEPENDENT');
            $table->boolean('material_ready')->default(true);
            $table->string('status', 30)->default('DRAFT'); // DRAFT, APPROVED, RUNNING, COMPLETED, CANCELLED
            $table->text('notes')->nullable();
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['line_id', 'start_date', 'end_date']);
            $table->index(['purchase_order_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('production_plans');
    }
};
