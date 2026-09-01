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
        // 1. Group of Companies Table
        Schema::create('companies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 150); // e.g. "Standard Group of Companies"
            $table->string('code', 50)->unique(); // e.g. "GRP-STD"
            $table->string('address', 255)->nullable();
            $table->string('contact_email', 100)->nullable();
            $table->string('contact_phone', 50)->nullable();
            $table->string('trade_license', 100)->nullable();
            $table->string('tin_bin', 100)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Add company_id and factory_type to units table
        Schema::table('units', function (Blueprint $table) {
            $table->foreignUuid('company_id')->nullable()->after('id')->constrained('companies')->nullOnDelete();
            $table->string('factory_type', 50)->default('SEWING_FACTORY')->after('code'); // SEWING_FACTORY, WASHING_FACTORY, PRINTING_FACTORY, EMBROIDERY_FACTORY, CENTRAL_WAREHOUSE, KNITTING_WEAVING
            $table->index(['company_id', 'factory_type', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('units', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
            $table->dropIndex(['company_id', 'factory_type', 'is_active']);
            $table->dropColumn(['company_id', 'factory_type']);
        });

        Schema::dropIfExists('companies');
    }
};
