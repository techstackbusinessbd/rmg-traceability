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
        // First ensure existing users (like super admin) have a default emp_id if null
        \Illuminate\Support\Facades\DB::table('users')->whereNull('emp_id')->update([
            'emp_id' => 'EMP-SUPERADMIN'
        ]);

        Schema::table('users', function (Blueprint $table) {
            $table->string('emp_id', 50)->nullable(false)->change();
            $table->string('email')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('emp_id', 50)->nullable()->change();
            $table->string('email')->nullable(false)->change();
        });
    }
};
