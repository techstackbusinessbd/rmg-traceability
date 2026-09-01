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
        Schema::table('users', function (Blueprint $table) {
            $table->foreignUuid('company_id')->nullable()->after('id')->constrained('companies')->nullOnDelete();
            $table->foreignUuid('unit_id')->nullable()->after('company_id')->constrained('units')->nullOnDelete();
            $table->string('designation', 100)->nullable()->after('name');
            $table->index(['company_id', 'unit_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
            $table->dropForeign(['unit_id']);
            $table->dropIndex(['company_id', 'unit_id', 'is_active']);
            $table->dropColumn(['company_id', 'unit_id', 'designation']);
        });
    }
};
