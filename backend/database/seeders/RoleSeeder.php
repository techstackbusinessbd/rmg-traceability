<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds for Default Roles & Access Policies.
     */
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Super Admin (Platform Owner / Global Executive): Unlimited Access
        $superAdmin = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
        $superAdmin->syncPermissions(Permission::all());

        // 2. Admin (Plant / Factory Operations General Manager)
        $admin = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        $adminPermissions = Permission::whereNotIn('name', [
            'admin.roles.create',
            'admin.roles.edit',
            'admin.roles.delete',
            'admin.users.delete',
        ])->get();
        $admin->syncPermissions($adminPermissions);

        // 3. Plant Manager (Factory Plant Incharge)
        $plantManager = Role::firstOrCreate(['name' => 'Plant Manager', 'guard_name' => 'web']);
        $plantManager->syncPermissions([
            'master.plant.view',
            'master.styles.view',
            'orders.po.view',
            'planning.routing.view',
            'planning.targets.view',
            'cutting.lays.view',
            'sewing.wip.view',
            'qc.dhu.view',
            'analytics.dashboard.view',
            'analytics.reports.export',
        ]);

        // 4. Cutting Master (Cutting Floor & Spreading Head)
        $cuttingMaster = Role::firstOrCreate(['name' => 'Cutting Master', 'guard_name' => 'web']);
        $cuttingMaster->syncPermissions([
            'master.styles.view',
            'orders.po.view',
            'cutting.lays.view',
            'cutting.lays.create',
            'cutting.bundles.print',
            'cutting.bundles.scan',
            'valueadd.dispatch',
        ]);

        // 5. Line Supervisor (Sewing Floor Line In-charge)
        $lineSupervisor = Role::firstOrCreate(['name' => 'Line Supervisor', 'guard_name' => 'web']);
        $lineSupervisor->syncPermissions([
            'master.styles.view',
            'sewing.scan.in',
            'sewing.scan.out',
            'sewing.wip.view',
            'sewing.line.transfer',
            'qc.dhu.view',
        ]);

        // 6. QC Inspector (End of Line & Traffic Light Inspection)
        $qcInspector = Role::firstOrCreate(['name' => 'QC Inspector', 'guard_name' => 'web']);
        $qcInspector->syncPermissions([
            'master.styles.view',
            'qc.inspect',
            'qc.defect.log',
            'qc.dhu.view',
            'qc.rework.pass',
        ]);

        // 7. Wash Master (Industrial Laundry & Dry Processing Head)
        $washMaster = Role::firstOrCreate(['name' => 'Wash Master', 'guard_name' => 'web']);
        $washMaster->syncPermissions([
            'valueadd.receive',
            'valueadd.dispatch',
            'washing.batch.create',
            'washing.batch.manage',
        ]);

        // 8. Print & Embroidery Master (Value Addition Units)
        $valueAddMaster = Role::firstOrCreate(['name' => 'Value Addition Master', 'guard_name' => 'web']);
        $valueAddMaster->syncPermissions([
            'valueadd.receive',
            'valueadd.dispatch',
            'valueadd.gatepass.create',
        ]);

        // 9. Packing & Finishing Operator
        $packingOperator = Role::firstOrCreate(['name' => 'Packing Operator', 'guard_name' => 'web']);
        $packingOperator->syncPermissions([
            'finishing.press.scan',
            'finishing.qc.inspect',
            'packing.carton.create',
            'packing.carton.scan',
            'shipment.dispatch',
        ]);

        // 10. Store Keeper (Fabric & Trims Inventory)
        $storeKeeper = Role::firstOrCreate(['name' => 'Store Keeper', 'guard_name' => 'web']);
        $storeKeeper->syncPermissions([
            'store.mrr.create',
            'store.issue.fabric',
            'store.issue.trims',
            'store.inventory.view',
        ]);
    }
}
