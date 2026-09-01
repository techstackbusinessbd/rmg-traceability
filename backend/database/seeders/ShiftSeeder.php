<?php

namespace Database\Seeders;

use App\Domains\AuthAdmin\Services\ShiftService;
use Illuminate\Database\Seeder;

class ShiftSeeder extends Seeder
{
    /**
     * Run the database seeds for Floor & Unit Shifts.
     */
    public function run(): void
    {
        app(ShiftService::class)->seedDefaults();
    }
}
