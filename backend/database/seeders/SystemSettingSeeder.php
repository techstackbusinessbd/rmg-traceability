<?php

namespace Database\Seeders;

use App\Domains\AuthAdmin\Services\SystemSettingService;
use Illuminate\Database\Seeder;

class SystemSettingSeeder extends Seeder
{
    /**
     * Run the database seeds for Configurable System Settings.
     */
    public function run(): void
    {
        app(SystemSettingService::class)->seedDefaults();
    }
}
