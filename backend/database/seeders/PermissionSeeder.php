<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds for Granular System Permissions.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // Module 01: System Admin & Auth
            'admin.users.view',
            'admin.users.create',
            'admin.users.edit',
            'admin.users.delete',
            'admin.roles.view',
            'admin.roles.create',
            'admin.roles.edit',
            'admin.roles.delete',
            'admin.devices.view',
            'admin.devices.create',
            'admin.devices.edit',
            'admin.devices.delete',
            'admin.shifts.view',
            'admin.shifts.manage',
            'admin.audit.view',
            'admin.settings.view',
            'admin.settings.manage',

            // Module 02: Master Data (Group, Factory Plants, Styles, OB)
            'master.companies.view',
            'master.companies.manage',
            'master.plant.view',
            'master.plant.manage',
            'master.buyers.view',
            'master.buyers.manage',
            'master.styles.view',
            'master.styles.manage',
            'master.attributes.view',
            'master.attributes.manage',

            // Module 03: Order Management (PO & Costing)
            'orders.po.view',
            'orders.po.create',
            'orders.po.edit',
            'orders.po.delete',
            'orders.po.approve',

            // Module 04: Production Planning & IE
            'planning.routing.view',
            'planning.routing.manage',
            'planning.targets.view',
            'planning.targets.manage',

            // Module 05: Cutting & Laying
            'cutting.lays.view',
            'cutting.lays.create',
            'cutting.bundles.print',
            'cutting.bundles.scan',

            // Module 06: Value Addition (Wash / Print / Emb Dispatch & Receive)
            'valueadd.dispatch',
            'valueadd.receive',
            'valueadd.gatepass.create',

            // Module 07: Sewing Line Execution
            'sewing.scan.in',
            'sewing.scan.out',
            'sewing.wip.view',
            'sewing.line.transfer',

            // Module 08: Quality Control (QC & DHU)
            'qc.inspect',
            'qc.defect.log',
            'qc.dhu.view',
            'qc.rework.pass',

            // Module 09: Washing & Finishing
            'washing.batch.create',
            'washing.batch.manage',
            'finishing.press.scan',
            'finishing.qc.inspect',

            // Module 10: Packing & Shipment Logistics
            'packing.carton.create',
            'packing.carton.scan',
            'shipment.dispatch',
            'shipment.manifest.export',

            // Module 11: Raw Material Store & Warehouse
            'store.mrr.create',
            'store.issue.fabric',
            'store.issue.trims',
            'store.inventory.view',

            // Module 12: Executive Analytics & Traceability Reports
            'analytics.dashboard.view',
            'analytics.reports.export',
            'analytics.audit.deep_trace',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }
    }
}
