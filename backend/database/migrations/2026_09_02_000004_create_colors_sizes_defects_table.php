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
        // 1. Colorways Master Table
        Schema::create('colors', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 100); // e.g. "Navy Blue", "Optic White", "Charcoal Grey"
            $table->string('code', 50)->unique(); // e.g. "COL-NVY", "COL-WHT"
            $table->string('hex_code', 10)->default('#000000'); // e.g. "#1E3A8A"
            $table->string('pantone_ref', 50)->nullable(); // e.g. "19-4024 TCX"
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Sizes Master Table
        Schema::create('sizes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 50); // e.g. "S", "M", "L", "XL", "32", "34"
            $table->string('code', 30)->unique(); // e.g. "SZ-S", "SZ-32"
            $table->string('category', 50)->default('ALPHA'); // ALPHA (S/M/L), NUMERIC (28/30/32), INSEAM
            $table->unsignedSmallInteger('sort_order')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 3. Quality Defect Classification Codebook Table
        Schema::create('defect_codes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code', 50)->unique(); // e.g. "DEF-SEW-01", "DEF-CUT-02"
            $table->string('name', 150); // e.g. "Broken Stitch", "Skip Stitch", "Oil Spot", "Puckering", "Measurement Out of Spec"
            $table->string('process_stage', 50)->default('SEWING'); // CUTTING, SEWING, FINISHING, PACKING, FABRIC
            $table->string('severity', 30)->default('MAJOR'); // MINOR, MAJOR, CRITICAL
            $table->string('standard_penalty_points', 10)->default('3'); // 4-Point System or AQL weighting
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['process_stage', 'severity', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('defect_codes');
        Schema::dropIfExists('sizes');
        Schema::dropIfExists('colors');
    }
};
