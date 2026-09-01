<?php

namespace Database\Seeders;

use App\Domains\AuthAdmin\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class SuperAdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds for Initial Root Super Admin.
     */
    public function run(): void
    {
        $superAdminRole = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);

        $superAdmin = User::firstOrCreate(
            ['emp_id' => 'EMP-SUPERADMIN'],
            [
                'username' => 'superadmin',
                'name' => 'System Super Admin',
                'designation' => 'Chief Technology Officer (Platform Owner)',
                'email' => 'admin@rmgtrace.com',
                'password' => Hash::make('Admin@123456'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $superAdmin->syncRoles([$superAdminRole]);
    }
}
