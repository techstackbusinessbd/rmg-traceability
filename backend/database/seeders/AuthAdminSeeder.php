<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class AuthAdminSeeder extends Seeder
{
    /**
     * Run the authentication & system administration boot seeds.
     */
    public function run(): void
    {
        $this->call([
            PermissionSeeder::class,
            RoleSeeder::class,
            SuperAdminUserSeeder::class,
            SystemSettingSeeder::class,
        ]);
    }
}
