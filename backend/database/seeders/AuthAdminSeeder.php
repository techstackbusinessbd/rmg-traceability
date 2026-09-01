<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class AuthAdminSeeder extends Seeder
{
    /**
     * Run the authentication & administration seeds.
     */
    public function run(): void
    {
        $this->call([
            PermissionSeeder::class,
            RoleSeeder::class,
            SuperAdminUserSeeder::class,
            DeviceSeeder::class,
            SystemSettingSeeder::class,
            ShiftSeeder::class,
        ]);
    }
}
