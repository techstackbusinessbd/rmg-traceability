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
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->string('event', 50)->default('ACTION')->after('action'); // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, SECURITY, STATUS_CHANGE
            $table->string('auditable_type', 100)->nullable()->after('event');
            $table->string('auditable_id', 100)->nullable()->after('auditable_type');
            $table->string('user_emp_id', 50)->nullable()->after('user_id');
            $table->string('user_role', 50)->nullable()->after('user_name');
            $table->uuid('company_id')->nullable()->after('user_role');
            $table->uuid('unit_id')->nullable()->after('company_id');
            $table->text('action_summary')->nullable()->after('module');
            $table->jsonb('old_values')->nullable()->after('payload');
            $table->jsonb('new_values')->nullable()->after('old_values');
            $table->string('url', 255)->nullable()->after('user_agent');
            $table->string('http_method', 10)->nullable()->after('url');

            // Indexes for fast enterprise searching
            $table->index(['event', 'module', 'created_at']);
            $table->index(['auditable_type', 'auditable_id']);
            $table->index(['user_emp_id', 'created_at']);
            $table->index(['company_id', 'unit_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropIndex(['event', 'module', 'created_at']);
            $table->dropIndex(['auditable_type', 'auditable_id']);
            $table->dropIndex(['user_emp_id', 'created_at']);
            $table->dropIndex(['company_id', 'unit_id', 'created_at']);

            $table->dropColumn([
                'event',
                'auditable_type',
                'auditable_id',
                'user_emp_id',
                'user_role',
                'company_id',
                'unit_id',
                'action_summary',
                'old_values',
                'new_values',
                'url',
                'http_method',
            ]);
        });
    }
};
