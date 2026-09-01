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
        Schema::create('shifts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('shift_name', 100); // e.g. "Cutting Day Shift", "Cutting Night Shift", "Sewing Day Shift"
            $table->string('shift_code', 50)->unique(); // e.g. "SH-U1-GF-DAY", "SH-U1-GF-NIGHT"
            $table->string('shift_type', 20)->default('DAY'); // DAY, NIGHT, GENERAL
            $table->string('unit_name', 100)->default('Unit 01'); // e.g. "Unit 01", "Unit 02", "Washing Plant"
            $table->string('floor_name', 100)->default('1st Floor'); // e.g. "Ground Floor", "1st Floor", "2nd Floor", "3rd Floor"
            $table->time('start_time'); // In-Time
            $table->time('end_time'); // Out-Time
            $table->unsignedSmallInteger('grace_period_mins')->default(10); // Late tolerance in minutes
            $table->time('break_start_time')->nullable(); // Meal / Lunch / Dinner Start
            $table->time('break_end_time')->nullable(); // Meal / Lunch / Dinner End
            $table->decimal('net_work_hours', 4, 2)->default(8.00); // Effective Working Hours
            
            // Overtime (OT) Facilities (Specifically for Single-Shift / Day-Only Floors)
            $table->boolean('allows_overtime')->default(false);
            $table->decimal('max_ot_hours', 4, 2)->default(0.00); // Max allowed OT hours e.g. 2.00, 3.00
            $table->time('overtime_start_time')->nullable(); // e.g. 17:30:00
            $table->time('tiffin_break_start')->nullable(); // Evening Tiffin Break Start before OT
            $table->time('tiffin_break_end')->nullable(); // Evening Tiffin Break End

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Indexes for fast floor & unit lookups
            $table->index(['unit_name', 'floor_name', 'shift_type', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shifts');
    }
};
