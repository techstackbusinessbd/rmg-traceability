<?php

namespace Database\Seeders;

use App\Domains\AuthAdmin\Models\User;
use App\Domains\AuthAdmin\Models\Device;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class AuthAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 2. Define Permissions List
        $permissions = [
            // Module 01: System Admin & Auth
            'admin.users.view',
            'admin.users.create',
            'admin.users.edit',
            'admin.users.delete',
            'admin.roles.view',
            'admin.roles.create',
            'admin.roles.edit',
            'admin.devices.view',
            'admin.devices.create',
            'admin.devices.edit',
            'admin.audit.view',

            // Module 02: Master Data
            'master.buyers.view',
            'master.buyers.manage',
            'master.styles.view',
            'master.styles.manage',
            'master.lines.view',
            'master.lines.manage',
            'master.colors.manage',
            'master.sizes.manage',

            // Module 03: Order Management
            'orders.po.view',
            'orders.po.create',
            'orders.po.edit',
            'orders.po.approve',

            // Module 04: Planning & IE
            'planning.loading.view',
            'planning.loading.manage',

            // Module 05: Cutting
            'cutting.lays.view',
            'cutting.lays.create',
            'cutting.bundles.print',

            // Module 06: Value Addition
            'valueadd.dispatch',
            'valueadd.receive',

            // Module 07: Sewing Line
            'sewing.scan.in',
            'sewing.scan.out',
            'sewing.wip.view',

            // Module 08: Quality Control (QC)
            'qc.inspect',
            'qc.defect.log',
            'qc.dhu.view',

            // Module 09: Washing & Finishing
            'washing.batch.manage',
            'finishing.qc.manage',

            // Module 10: Packing & Shipment
            'packing.carton.scan',
            'shipment.dispatch',

            // Module 11: Store
            'store.mrr.create',
            'store.issue.fabric',

            // Module 12: Analytics
            'analytics.dashboard.view',
            'analytics.reports.export',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // 3. Define Roles & Assign Permissions
        // Super Admin (Platform Owner / Root Administrator): All permissions + platform management
        $superAdminRole = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
        $superAdminRole->givePermissionTo(Permission::all());

        // Admin (Factory/Operations Admin): Full factory management power except system-destructive core settings
        $adminRole = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        $adminPermissions = Permission::whereNotIn('name', [
            'admin.roles.create',
            'admin.roles.edit',
            'admin.users.delete',
        ])->get();
        $adminRole->syncPermissions($adminPermissions);

        $cuttingMasterRole = Role::firstOrCreate(['name' => 'Cutting Master', 'guard_name' => 'web']);
        $cuttingMasterRole->givePermissionTo([
            'master.styles.view',
            'orders.po.view',
            'cutting.lays.view',
            'cutting.lays.create',
            'cutting.bundles.print',
        ]);

        $lineSupervisorRole = Role::firstOrCreate(['name' => 'Line Supervisor', 'guard_name' => 'web']);
        $lineSupervisorRole->givePermissionTo([
            'sewing.scan.in',
            'sewing.scan.out',
            'sewing.wip.view',
        ]);

        $qcInspectorRole = Role::firstOrCreate(['name' => 'QC Inspector', 'guard_name' => 'web']);
        $qcInspectorRole->givePermissionTo([
            'qc.inspect',
            'qc.defect.log',
            'qc.dhu.view',
        ]);

        $packingOperatorRole = Role::firstOrCreate(['name' => 'Packing Operator', 'guard_name' => 'web']);
        $packingOperatorRole->givePermissionTo([
            'packing.carton.scan',
            'shipment.dispatch',
        ]);

        $storeKeeperRole = Role::firstOrCreate(['name' => 'Store Keeper', 'guard_name' => 'web']);
        $storeKeeperRole->givePermissionTo([
            'store.mrr.create',
            'store.issue.fabric',
        ]);

        // 4. Create Initial Default Super Admin User
        $superAdmin = User::firstOrCreate(
            ['emp_id' => 'EMP-SUPERADMIN'],
            [
                'name' => 'System Super Admin',
                'email' => 'admin@rmgtrace.com',
                'password' => Hash::make('Admin@123456'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $superAdmin->syncRoles([$superAdminRole]);

        // 5. Create Sample Factory Floor Tablet Device
        Device::firstOrCreate(
            ['device_code' => 'TAB-SEW-L01'],
            [
                'device_name' => 'Sewing Line 01 In-charge Tablet',
                'pin_code' => Hash::make('123456'), // 6-digit PIN
                'line_name' => 'Sewing Line 01',
                'device_type' => 'Tablet',
                'is_active' => true,
            ]
        );

        // 6. Seed Default Configurable System Settings (Redis Cached)
        app(\App\Domains\AuthAdmin\Services\SystemSettingService::class)->seedDefaults();
    }
}
