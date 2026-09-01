<?php

namespace Database\Seeders;

use App\Domains\AuthAdmin\Models\Device;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DeviceSeeder extends Seeder
{
    /**
     * Run the database seeds for Floor Hardware Terminals.
     */
    public function run(): void
    {
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

        Device::firstOrCreate(
            ['device_code' => 'TAB-CUT-01'],
            [
                'device_name' => 'Cutting Floor Spreading Station Tablet',
                'pin_code' => Hash::make('123456'),
                'line_name' => 'Cutting Table 01',
                'device_type' => 'Tablet',
                'is_active' => true,
            ]
        );

        Device::firstOrCreate(
            ['device_code' => 'TAB-WASH-01'],
            [
                'device_name' => 'Washing Wet Process Floor Terminal',
                'pin_code' => Hash::make('123456'),
                'line_name' => 'Washing Batch Station',
                'device_type' => 'Tablet',
                'is_active' => true,
            ]
        );
    }
}
