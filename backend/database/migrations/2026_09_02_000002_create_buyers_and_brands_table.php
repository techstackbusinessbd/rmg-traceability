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
        // 1. Global Buyers Master Table
        Schema::create('buyers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 150); // e.g. "H&M Global", "Zara / Inditex", "PVH Corp"
            $table->string('code', 50)->unique(); // e.g. "BUY-HM", "BUY-ZARA"
            $table->string('country', 100)->default('Bangladesh'); // e.g. "Sweden", "Spain", "USA"
            $table->string('currency', 10)->default('USD'); // USD, EUR, GBP, BDT
            $table->string('contact_person', 100)->nullable();
            $table->string('email', 150)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('compliance_standard', 100)->nullable(); // Accord, BSCI, WRAP, Sedex
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Buyer Brands / Sub-Divisions Table
        Schema::create('brands', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('buyer_id')->constrained('buyers')->cascadeOnDelete();
            $table->string('name', 150); // e.g. "Divided", "Zara Man", "Tommy Hilfiger"
            $table->string('code', 50); // e.g. "BR-DIV", "BR-ZMAN"
            $table->string('description', 255)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['buyer_id', 'code']);
            $table->index(['buyer_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('brands');
        Schema::dropIfExists('buyers');
    }
};
