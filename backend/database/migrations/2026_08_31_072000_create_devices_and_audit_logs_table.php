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
        // 1. Devices Table (Floor Tablets)
        Schema::create('devices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('device_name', 100)->unique();
            $table->string('device_code', 50)->unique(); // e.g. "TAB-SEW-01"
            $table->string('pin_code'); // Bcrypt hashed 6-digit PIN
            $table->uuid('line_id')->nullable()->index(); // Locked to specific Line in Mod 02
            $table->string('line_name')->nullable(); // Cached line name
            $table->string('device_type')->default('Tablet'); // Tablet, PDA Scanner, TV Display
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_active_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // 2. Audit Logs Table (Immutable Audit Trail)
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->nullable()->index();
            $table->string('user_name')->nullable();
            $table->string('action'); // e.g. "LOGIN", "CREATE_USER", "UPDATE_ROLE", "REGISTER_DEVICE"
            $table->string('module')->default('AuthAdmin');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->jsonb('payload')->nullable(); // Old vs New values or Request metadata
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('devices');
    }
};
