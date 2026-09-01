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
            $table->string('shift_name', 100); // e.g. "Morning Shift A", "Day Shift", "Night Shift"
            $table->string('shift_code', 50)->unique(); // e.g. "SH-U1-F1-MORN"
            $table->string('unit_name', 100)->default('Unit 01'); // e.g. "Unit 01", "Unit 02", "Washing Plant"
            $table->string('floor_name', 100)->default('1st Floor'); // e.g. "Ground Floor", "1st Floor", "2nd Floor", "3rd Floor", "All Floors"
            $table->time('start_time'); // e.g. 08:00:00 (In-Time)
            $table->time('end_time'); // e.g. 17:00:00 (Out-Time)
            $table->unsignedSmallInteger('grace_period_mins')->default(10); // Late tolerance in minutes
            $table->time('break_start_time')->nullable(); // e.g. 13:00:00 (Lunch Start)
            $table->time('break_end_time')->nullable(); // e.g. 14:00:00 (Lunch End)
            $table->decimal('net_work_hours', 4, 2)->default(8.00); // Effective Working Hours
            $table->time('overtime_start_time')->nullable(); // e.g. 17:30:00
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Indexes for fast floor & unit lookups
            $table->index(['unit_name', 'floor_name', 'is_active']);
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
