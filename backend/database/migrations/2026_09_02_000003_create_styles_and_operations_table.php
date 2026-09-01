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
        // 1. Garment Styles Master Table
        Schema::create('styles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('buyer_id')->constrained('buyers')->cascadeOnDelete();
            $table->foreignUuid('brand_id')->nullable()->constrained('brands')->nullOnDelete();
            $table->string('style_number', 100); // e.g. "STY-2026-OXFORD-01"
            $table->string('style_name', 150); // e.g. "Men's Long Sleeve Oxford Shirt"
            $table->string('garment_type', 50)->default('SHIRT'); // SHIRT, PANT, POLO, TEE, JACKET, DENIM, TROUSER
            $table->string('season', 50)->default('SS-2026'); // Spring/Summer, Autumn/Winter
            $table->string('fabric_type', 150)->nullable(); // 100% Cotton Poplin, Twill, Denim 12oz
            $table->decimal('total_smv', 6, 2)->default(14.50); // Total Standard Minute Value
            $table->string('techpack_url', 255)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['buyer_id', 'style_number']);
            $table->index(['buyer_id', 'garment_type', 'is_active']);
        });

        // 2. Style Operation Bulletin (OB) Table
        Schema::create('style_operations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('style_id')->constrained('styles')->cascadeOnDelete();
            $table->unsignedSmallInteger('sequence_no')->default(1);
            $table->string('operation_name', 150); // e.g. "Collar Band Attach", "Sleeve Placket Topstitch"
            $table->string('operation_code', 50)->nullable(); // e.g. "OP-COL-01"
            $table->string('section', 50)->default('SEWING'); // CUTTING, SEWING, FINISHING
            $table->decimal('smv', 5, 2)->default(0.75); // Standard Minute Value for this operation
            $table->string('machine_type', 100)->default('Single Needle Lockstitch (SNLS)'); // SNLS, DNLS, Overlock 4T, Flatlock, Feed Off Arm, Button Hole
            $table->unsignedSmallInteger('target_hourly_pcs')->default(80);
            $table->timestamps();

            $table->index(['style_id', 'sequence_no']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('style_operations');
        Schema::dropIfExists('styles');
    }
};
