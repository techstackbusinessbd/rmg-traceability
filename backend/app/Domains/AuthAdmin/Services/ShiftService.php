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
     * Get All Shifts with optional Unit, Floor & Shift Type filtering
     */
    public function getAllShifts(?string $unit = null, ?string $floor = null, ?string $shiftType = null): Collection
    {
        $query = Shift::orderBy('unit_name')
            ->orderBy('floor_name')
            ->orderBy('shift_type')
            ->orderBy('start_time');

        if (! empty($unit) && $unit !== 'ALL') {
            $query->where('unit_name', $unit);
        }

        if (! empty($floor) && $floor !== 'ALL') {
            $query->where('floor_name', $floor);
        }

        if (! empty($shiftType) && $shiftType !== 'ALL') {
            $query->where('shift_type', $shiftType);
        }

        return $query->get();
    }

    /**
     * Create New Shift
     */
    public function createShift(array $data, User $actor, ?string $ip = null): Shift
    {
        return DB::transaction(function () use ($data, $actor, $ip) {
            $shiftType = strtoupper(trim($data['shift_type'] ?? 'DAY'));
            $shiftCode = !empty($data['shift_code']) ? strtoupper(trim($data['shift_code'])) : null;
            if (! $shiftCode) {
                $count = Shift::where('shift_type', $shiftType)->count() + 1;
                $shiftCode = 'SH-' . $shiftType . '-' . str_pad($count, 2, '0', STR_PAD_LEFT);
                while (Shift::where('shift_code', $shiftCode)->exists()) {
                    $count++;
                    $shiftCode = 'SH-' . $shiftType . '-' . str_pad($count, 2, '0', STR_PAD_LEFT);
                }
            }

            $shift = Shift::create([
                'shift_name' => trim($data['shift_name']),
                'shift_code' => $shiftCode,
                'shift_type' => $shiftType,
                'unit_name' => trim($data['unit_name'] ?? 'Unit 01'),
                'floor_name' => trim($data['floor_name'] ?? '1st Floor'),
                'start_time' => $data['start_time'],
                'end_time' => $data['end_time'],
                'grace_period_mins' => $data['grace_period_mins'] ?? 10,
                'break_start_time' => $data['break_start_time'] ?? null,
                'break_end_time' => $data['break_end_time'] ?? null,
                'net_work_hours' => $data['net_work_hours'] ?? 8.00,
                'allows_overtime' => $data['allows_overtime'] ?? false,
                'max_ot_hours' => $data['max_ot_hours'] ?? 0.00,
                'overtime_start_time' => $data['overtime_start_time'] ?? null,
                'tiffin_break_start' => $data['tiffin_break_start'] ?? null,
                'tiffin_break_end' => $data['tiffin_break_end'] ?? null,
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
                    'shift_type' => $shift->shift_type,
                    'unit_name' => $shift->unit_name,
                    'floor_name' => $shift->floor_name,
                    'allows_overtime' => $shift->allows_overtime,
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
                'shift_type' => isset($data['shift_type']) ? strtoupper(trim($data['shift_type'])) : $shift->shift_type,
                'unit_name' => trim($data['unit_name'] ?? $shift->unit_name),
                'floor_name' => trim($data['floor_name'] ?? $shift->floor_name),
                'start_time' => $data['start_time'] ?? $shift->start_time,
                'end_time' => $data['end_time'] ?? $shift->end_time,
                'grace_period_mins' => $data['grace_period_mins'] ?? $shift->grace_period_mins,
                'break_start_time' => $data['break_start_time'] ?? $shift->break_start_time,
                'break_end_time' => $data['break_end_time'] ?? $shift->break_end_time,
                'net_work_hours' => $data['net_work_hours'] ?? $shift->net_work_hours,
                'allows_overtime' => $data['allows_overtime'] ?? $shift->allows_overtime,
                'max_ot_hours' => $data['max_ot_hours'] ?? $shift->max_ot_hours,
                'overtime_start_time' => $data['overtime_start_time'] ?? $shift->overtime_start_time,
                'tiffin_break_start' => $data['tiffin_break_start'] ?? $shift->tiffin_break_start,
                'tiffin_break_end' => $data['tiffin_break_end'] ?? $shift->tiffin_break_end,
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
     * Seed Default Realistic RMG Shifts (Dual Shifts for Cutting & Day+OT for Sewing Floors)
     */
    public function seedDefaults(): void
    {
        $defaultShifts = [
            // 1. Dual-Shift Floor: Ground Floor (Cutting) -> DAY SHIFT
            [
                'shift_name' => 'Cutting Floor Day Shift',
                'shift_code' => 'SH-U1-GF-DAY',
                'shift_type' => 'DAY',
                'unit_name' => 'Unit 01',
                'floor_name' => 'Ground Floor',
                'start_time' => '07:30:00',
                'end_time' => '19:30:00',
                'grace_period_mins' => 10,
                'break_start_time' => '12:30:00',
                'break_end_time' => '13:30:00',
                'net_work_hours' => 11.00,
                'allows_overtime' => false, // Handover to Night Shift immediately
                'max_ot_hours' => 0.00,
                'overtime_start_time' => null,
                'is_active' => true,
            ],
            // 2. Dual-Shift Floor: Ground Floor (Cutting) -> NIGHT SHIFT
            [
                'shift_name' => 'Cutting Floor Night Shift',
                'shift_code' => 'SH-U1-GF-NIGHT',
                'shift_type' => 'NIGHT',
                'unit_name' => 'Unit 01',
                'floor_name' => 'Ground Floor',
                'start_time' => '19:30:00',
                'end_time' => '07:30:00',
                'grace_period_mins' => 10,
                'break_start_time' => '00:30:00',
                'break_end_time' => '01:30:00',
                'net_work_hours' => 11.00,
                'allows_overtime' => false,
                'max_ot_hours' => 0.00,
                'overtime_start_time' => null,
                'is_active' => true,
            ],

            // 3. Single-Shift Floor with OT: 1st Floor (Sewing Lines 1-8) -> DAY + OT
            [
                'shift_name' => 'Sewing Day Shift (Floor 1)',
                'shift_code' => 'SH-U1-F1-DAY-OT',
                'shift_type' => 'DAY',
                'unit_name' => 'Unit 01',
                'floor_name' => '1st Floor',
                'start_time' => '07:45:00',
                'end_time' => '16:45:00',
                'grace_period_mins' => 10,
                'break_start_time' => '12:45:00',
                'break_end_time' => '13:45:00',
                'net_work_hours' => 8.00,
                'allows_overtime' => true, // Overtime enabled for single shift floor
                'max_ot_hours' => 2.50,
                'tiffin_break_start' => '16:45:00',
                'tiffin_break_end' => '17:15:00',
                'overtime_start_time' => '17:15:00',
                'is_active' => true,
            ],

            // 4. Single-Shift Floor with OT: 2nd Floor (Sewing Lines 9-16) -> DAY + OT
            [
                'shift_name' => 'Sewing Day Shift (Floor 2)',
                'shift_code' => 'SH-U1-F2-DAY-OT',
                'shift_type' => 'DAY',
                'unit_name' => 'Unit 01',
                'floor_name' => '2nd Floor',
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'grace_period_mins' => 10,
                'break_start_time' => '13:00:00',
                'break_end_time' => '14:00:00',
                'net_work_hours' => 8.00,
                'allows_overtime' => true,
                'max_ot_hours' => 3.00,
                'tiffin_break_start' => '17:00:00',
                'tiffin_break_end' => '17:30:00',
                'overtime_start_time' => '17:30:00',
                'is_active' => true,
            ],

            // 5. Single-Shift Floor with OT: 3rd Floor (Sewing Lines 17-24) -> DAY + OT
            [
                'shift_name' => 'Sewing Day Shift (Floor 3)',
                'shift_code' => 'SH-U1-F3-DAY-OT',
                'shift_type' => 'DAY',
                'unit_name' => 'Unit 01',
                'floor_name' => '3rd Floor',
                'start_time' => '08:15:00',
                'end_time' => '17:15:00',
                'grace_period_mins' => 10,
                'break_start_time' => '13:15:00',
                'break_end_time' => '14:15:00',
                'net_work_hours' => 8.00,
                'allows_overtime' => true,
                'max_ot_hours' => 2.00,
                'tiffin_break_start' => '17:15:00',
                'tiffin_break_end' => '17:45:00',
                'overtime_start_time' => '17:45:00',
                'is_active' => true,
            ],

            // 6. Finishing & Packing Floor with OT: 4th Floor -> DAY + OT
            [
                'shift_name' => 'Finishing & Packing Day Shift',
                'shift_code' => 'SH-U1-F4-FIN-OT',
                'shift_type' => 'DAY',
                'unit_name' => 'Unit 01',
                'floor_name' => '4th Floor',
                'start_time' => '08:30:00',
                'end_time' => '17:30:00',
                'grace_period_mins' => 10,
                'break_start_time' => '13:30:00',
                'break_end_time' => '14:30:00',
                'net_work_hours' => 8.00,
                'allows_overtime' => true,
                'max_ot_hours' => 3.50, // Shipment rush OT
                'tiffin_break_start' => '17:30:00',
                'tiffin_break_end' => '18:00:00',
                'overtime_start_time' => '18:00:00',
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
