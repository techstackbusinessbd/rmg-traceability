<?php

namespace App\Domains\AuthAdmin\Services;

use App\Domains\AuthAdmin\Models\AuditLog;
use App\Domains\AuthAdmin\Models\Shift;
use App\Domains\AuthAdmin\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ShiftService
{
    const CACHE_KEY = 'global_factory_shifts';

    /**
     * Get All Shifts with optional Unit & Floor filtering
     */
    public function getAllShifts(?string $unit = null, ?string $floor = null): Collection
    {
        $query = Shift::orderBy('unit_name')
            ->orderBy('floor_name')
            ->orderBy('start_time');

        if (! empty($unit) && $unit !== 'ALL') {
            $query->where('unit_name', $unit);
        }

        if (! empty($floor) && $floor !== 'ALL') {
            $query->where('floor_name', $floor);
        }

        return $query->get();
    }

    /**
     * Create New Shift
     */
    public function createShift(array $data, User $actor, ?string $ip = null): Shift
    {
        return DB::transaction(function () use ($data, $actor, $ip) {
            $shift = Shift::create([
                'shift_name' => trim($data['shift_name']),
                'shift_code' => strtoupper(trim($data['shift_code'])),
                'unit_name' => trim($data['unit_name'] ?? 'Unit 01'),
                'floor_name' => trim($data['floor_name'] ?? '1st Floor'),
                'start_time' => $data['start_time'],
                'end_time' => $data['end_time'],
                'grace_period_mins' => $data['grace_period_mins'] ?? 10,
                'break_start_time' => $data['break_start_time'] ?? null,
                'break_end_time' => $data['break_end_time'] ?? null,
                'net_work_hours' => $data['net_work_hours'] ?? 8.00,
                'overtime_start_time' => $data['overtime_start_time'] ?? null,
                'is_active' => $data['is_active'] ?? true,
            ]);

            Cache::forget(self::CACHE_KEY);

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'CREATE_SHIFT',
                'module' => 'AuthAdmin',
                'ip_address' => $ip,
                'payload' => [
                    'shift_id' => $shift->id,
                    'shift_code' => $shift->shift_code,
                    'unit_name' => $shift->unit_name,
                    'floor_name' => $shift->floor_name,
                    'start_time' => $shift->start_time,
                ],
            ]);

            return $shift;
        });
    }

    /**
     * Update Shift
     */
    public function updateShift(Shift $shift, array $data, User $actor, ?string $ip = null): Shift
    {
        return DB::transaction(function () use ($shift, $data, $actor, $ip) {
            $oldData = $shift->toArray();

            $shift->update([
                'shift_name' => trim($data['shift_name'] ?? $shift->shift_name),
                'shift_code' => isset($data['shift_code']) ? strtoupper(trim($data['shift_code'])) : $shift->shift_code,
                'unit_name' => trim($data['unit_name'] ?? $shift->unit_name),
                'floor_name' => trim($data['floor_name'] ?? $shift->floor_name),
                'start_time' => $data['start_time'] ?? $shift->start_time,
                'end_time' => $data['end_time'] ?? $shift->end_time,
                'grace_period_mins' => $data['grace_period_mins'] ?? $shift->grace_period_mins,
                'break_start_time' => $data['break_start_time'] ?? $shift->break_start_time,
                'break_end_time' => $data['break_end_time'] ?? $shift->break_end_time,
                'net_work_hours' => $data['net_work_hours'] ?? $shift->net_work_hours,
                'overtime_start_time' => $data['overtime_start_time'] ?? $shift->overtime_start_time,
                'is_active' => $data['is_active'] ?? $shift->is_active,
            ]);

            Cache::forget(self::CACHE_KEY);

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'UPDATE_SHIFT',
                'module' => 'AuthAdmin',
                'ip_address' => $ip,
                'payload' => [
                    'shift_id' => $shift->id,
                    'old' => $oldData,
                    'new' => $shift->toArray(),
                ],
            ]);

            return $shift;
        });
    }

    /**
     * Delete Shift
     */
    public function deleteShift(Shift $shift, User $actor, ?string $ip = null): bool
    {
        return DB::transaction(function () use ($shift, $actor, $ip) {
            $shiftCode = $shift->shift_code;
            $shiftId = $shift->id;

            $shift->delete();

            Cache::forget(self::CACHE_KEY);

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'DELETE_SHIFT',
                'module' => 'AuthAdmin',
                'ip_address' => $ip,
                'payload' => [
                    'shift_id' => $shiftId,
                    'shift_code' => $shiftCode,
                ],
            ]);

            return true;
        });
    }

    /**
     * Seed Default Realistic RMG Staggered Floor Shifts
     */
    public function seedDefaults(): void
    {
        $defaultShifts = [
            // Unit 01 - Ground Floor (Cutting & Fabric Store)
            [
                'shift_name' => 'Cutting General Shift',
                'shift_code' => 'SH-U1-GF-CUT',
                'unit_name' => 'Unit 01',
                'floor_name' => 'Ground Floor',
                'start_time' => '07:30:00', // Early start for cutting floor
                'end_time' => '16:30:00',
                'grace_period_mins' => 10,
                'break_start_time' => '12:30:00',
                'break_end_time' => '13:30:00',
                'net_work_hours' => 8.00,
                'overtime_start_time' => '17:00:00',
                'is_active' => true,
            ],
            // Unit 01 - 1st Floor (Sewing Lines 1-8: Stagger Group A)
            [
                'shift_name' => 'Sewing Shift (Floor 1)',
                'shift_code' => 'SH-U1-F1-SEW',
                'unit_name' => 'Unit 01',
                'floor_name' => '1st Floor',
                'start_time' => '07:45:00', // 15 mins staggered
                'end_time' => '16:45:00',
                'grace_period_mins' => 10,
                'break_start_time' => '12:45:00',
                'break_end_time' => '13:45:00',
                'net_work_hours' => 8.00,
                'overtime_start_time' => '17:15:00',
                'is_active' => true,
            ],
            // Unit 01 - 2nd Floor (Sewing Lines 9-16: Stagger Group B)
            [
                'shift_name' => 'Sewing Shift (Floor 2)',
                'shift_code' => 'SH-U1-F2-SEW',
                'unit_name' => 'Unit 01',
                'floor_name' => '2nd Floor',
                'start_time' => '08:00:00', // Standard 08:00 AM start
                'end_time' => '17:00:00',
                'grace_period_mins' => 10,
                'break_start_time' => '13:00:00',
                'break_end_time' => '14:00:00',
                'net_work_hours' => 8.00,
                'overtime_start_time' => '17:30:00',
                'is_active' => true,
            ],
            // Unit 01 - 3rd Floor (Sewing Lines 17-24: Stagger Group C)
            [
                'shift_name' => 'Sewing Shift (Floor 3)',
                'shift_code' => 'SH-U1-F3-SEW',
                'unit_name' => 'Unit 01',
                'floor_name' => '3rd Floor',
                'start_time' => '08:15:00', // 15 mins staggered to avoid stairway congestion
                'end_time' => '17:15:00',
                'grace_period_mins' => 10,
                'break_start_time' => '13:15:00',
                'break_end_time' => '14:15:00',
                'net_work_hours' => 8.00,
                'overtime_start_time' => '17:45:00',
                'is_active' => true,
            ],
            // Unit 01 - 4th Floor (Finishing & Packing Floor)
            [
                'shift_name' => 'Finishing & Packing Shift',
                'shift_code' => 'SH-U1-F4-FIN',
                'unit_name' => 'Unit 01',
                'floor_name' => '4th Floor',
                'start_time' => '08:30:00',
                'end_time' => '17:30:00',
                'grace_period_mins' => 10,
                'break_start_time' => '13:30:00',
                'break_end_time' => '14:30:00',
                'net_work_hours' => 8.00,
                'overtime_start_time' => '18:00:00',
                'is_active' => true,
            ],
            // Unit 02 - General Shift
            [
                'shift_name' => 'Unit 02 General Day Shift',
                'shift_code' => 'SH-U2-DAY',
                'unit_name' => 'Unit 02',
                'floor_name' => '1st Floor',
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'grace_period_mins' => 10,
                'break_start_time' => '13:00:00',
                'break_end_time' => '14:00:00',
                'net_work_hours' => 8.00,
                'overtime_start_time' => '17:30:00',
                'is_active' => true,
            ],
        ];

        foreach ($defaultShifts as $shift) {
            Shift::firstOrCreate(
                ['shift_code' => $shift['shift_code']],
                $shift
            );
        }

        Cache::forget(self::CACHE_KEY);
    }
}
