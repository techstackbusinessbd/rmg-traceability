<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database for Clean System Boot.
     * Contains only core permissions, default roles, root Super Admin, and system settings.
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
