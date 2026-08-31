<?php

namespace App\Domains\AuthAdmin\Services;

use App\Domains\AuthAdmin\Models\AuditLog;
use App\Domains\AuthAdmin\Models\Device;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class DeviceAuthService
{
    /**
     * Floor Tablet PIN Authentication
     */
    public function authenticateDevice(string $deviceCode, string $pinCode, ?string $ip = null): array
    {
        $device = Device::where('device_code', $deviceCode)->first();

        if (! $device || ! Hash::check($pinCode, $device->pin_code)) {
            throw ValidationException::withMessages([
                'pin_code' => ['Invalid device code or 6-digit security PIN.'],
            ]);
        }

        if (! $device->is_active) {
            throw ValidationException::withMessages([
                'device_code' => ['This tablet device has been revoked or deactivated by administrator.'],
            ]);
        }

        $device->update(['last_active_at' => now()]);

        // Generate Sanctum Device Token with scoped abilities
        $token = $device->createToken("floor-tablet:{$device->device_code}", ['floor-scan'])->plainTextToken;

        return [
            'device' => [
                'id' => $device->id,
                'device_name' => $device->device_name,
                'device_code' => $device->device_code,
                'line_id' => $device->line_id,
                'line_name' => $device->line_name,
                'device_type' => $device->device_type,
            ],
            'token' => $token,
        ];
    }

    /**
     * Admin-Only Device Registration
     */
    public function registerDeviceByAdmin(array $data, ?string $actorId = null): Device
    {
        return DB::transaction(function () use ($data, $actorId) {
            $device = Device::create([
                'device_name' => $data['device_name'],
                'device_code' => strtoupper($data['device_code']),
                'pin_code' => Hash::make($data['pin_code']),
                'line_id' => $data['line_id'] ?? null,
                'line_name' => $data['line_name'] ?? null,
                'device_type' => $data['device_type'] ?? 'Tablet',
                'is_active' => true,
            ]);

            AuditLog::create([
                'user_id' => $actorId,
                'action' => 'REGISTER_DEVICE',
                'module' => 'AuthAdmin',
                'payload' => [
                    'device_id' => $device->id,
                    'device_code' => $device->device_code,
                    'line_name' => $device->line_name,
                ],
            ]);

            return $device;
        });
    }
}
