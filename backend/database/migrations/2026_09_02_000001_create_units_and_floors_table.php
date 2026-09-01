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
        // 1. Manufacturing Units / Plants Table
        Schema::create('units', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 100); // e.g. "Standard Unit 01 (Factory)"
            $table->string('code', 50)->unique(); // e.g. "UNIT-01", "WASH-01"
            $table->string('address', 255)->nullable();
            $table->string('contact_person', 100)->nullable();
            $table->string('contact_phone', 50)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Factory Floors Table (Mapped to Units)
        Schema::create('floors', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('unit_id')->constrained('units')->cascadeOnDelete();
            $table->string('name', 100); // e.g. "Ground Floor", "1st Floor (Sewing A)"
            $table->string('code', 50); // e.g. "FL-01", "FL-GF"
            $table->string('process_type', 50)->default('SEWING'); // CUTTING, SEWING, FINISHING, PACKING, QC, STORE
            $table->unsignedSmallInteger('sequence_order')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['unit_id', 'code']);
            $table->index(['unit_id', 'process_type', 'is_active']);
        });

        // 3. Production Lines Table (Mapped to Floors & Units)
        Schema::create('production_lines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('unit_id')->constrained('units')->cascadeOnDelete();
            $table->foreignUuid('floor_id')->constrained('floors')->cascadeOnDelete();
            $table->string('name', 100); // e.g. "Line 01 (Woven Shirts)"
            $table->string('code', 50); // e.g. "L-01", "L-02"
            $table->string('section', 50)->default('SEWING'); // CUTTING, SEWING, FINISHING, PACKING
            $table->unsignedSmallInteger('total_machines')->default(30);
            $table->unsignedSmallInteger('hourly_target')->default(100); // Standard pieces/hour
            $table->string('supervisor_name', 100)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['floor_id', 'code']);
            $table->index(['unit_id', 'floor_id', 'section', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('production_lines');
        Schema::dropIfExists('floors');
        Schema::dropIfExists('units');
    }
};
