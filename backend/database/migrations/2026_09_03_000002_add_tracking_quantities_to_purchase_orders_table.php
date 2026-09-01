<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->unsignedInteger('cut_quantity')->default(0)->after('order_quantity');
            $table->unsignedInteger('sewn_quantity')->default(0)->after('cut_quantity');
            $table->unsignedInteger('packed_quantity')->default(0)->after('sewn_quantity');
            $table->unsignedInteger('shipped_quantity')->default(0)->after('packed_quantity');
        });
    }

    public function down(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropColumn(['cut_quantity', 'sewn_quantity', 'packed_quantity', 'shipped_quantity']);
        });
    }
};
