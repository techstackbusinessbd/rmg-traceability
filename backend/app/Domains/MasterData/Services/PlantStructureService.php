<?php

namespace App\Domains\MasterData\Services;

use App\Domains\AuthAdmin\Models\AuditLog;
use App\Domains\AuthAdmin\Models\User;
use App\Domains\MasterData\Models\Company;
use App\Domains\MasterData\Models\Floor;
use App\Domains\MasterData\Models\ProductionLine;
use App\Domains\MasterData\Models\Unit;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class PlantStructureService
{
    const CACHE_KEY = 'global_plant_structure';

    public function getAllCompanies(): Collection
    {
        return Company::withCount('factories')->orderBy('name')->get();
    }

    public function createCompany(array $data, User $actor, ?string $ip = null): Company
    {
        return DB::transaction(function () use ($data, $actor, $ip) {
            $code = !empty($data['code']) ? strtoupper(trim($data['code'])) : null;
            if (!$code) {
                $count = Company::count() + 1;
                $code = sprintf('GRP-%02d', $count);
            }

            $company = Company::create([
                'name' => trim($data['name']),
                'code' => $code,
                'address' => $data['address'] ?? null,
                'contact_email' => $data['contact_email'] ?? null,
                'contact_phone' => $data['contact_phone'] ?? null,
                'trade_license' => $data['trade_license'] ?? null,
                'tin_bin' => $data['tin_bin'] ?? null,
                'is_active' => $data['is_active'] ?? true,
            ]);

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'CREATE_COMPANY',
                'module' => 'MasterData',
                'ip_address' => $ip,
                'payload' => ['company_id' => $company->id, 'name' => $company->name],
            ]);

            return $company;
        });
    }

    public function getTree(): array
    {
        return Cache::remember(self::CACHE_KEY, 3600, function () {
            return Unit::with(['company', 'floors.productionLines'])->where('is_active', true)->get()->toArray();
        });
    }

    public function getAllUnits(): Collection
    {
        return Unit::with(['company'])->withCount(['floors', 'productionLines'])->orderBy('code')->get();
    }

    public function createUnit(array $data, User $actor, ?string $ip = null): Unit
    {
        return DB::transaction(function () use ($data, $actor, $ip) {
            $factoryType = $data['factory_type'] ?? 'SEWING_FACTORY';
            $prefix = match ($factoryType) {
                'WASHING_FACTORY' => 'FACT-WASH',
                'PRINTING_FACTORY' => 'FACT-PRN',
                'EMBROIDERY_FACTORY' => 'FACT-EMB',
                'CENTRAL_WAREHOUSE' => 'FACT-WH',
                'KNITTING_WEAVING' => 'FACT-TEX',
                default => 'FACT-SEW',
            };

            $code = !empty($data['code']) ? strtoupper(trim($data['code'])) : null;
            if (!$code) {
                $count = Unit::where('factory_type', $factoryType)->count() + 1;
                $code = sprintf('%s-%02d', $prefix, $count);
                while (Unit::where('code', $code)->exists()) {
                    $count++;
                    $code = sprintf('%s-%02d', $prefix, $count);
                }
            }

            $unit = Unit::create([
                'company_id' => $data['company_id'] ?? null,
                'name' => trim($data['name']),
                'code' => $code,
                'factory_type' => $factoryType,
                'address' => $data['address'] ?? null,
                'contact_person' => $data['contact_person'] ?? null,
                'contact_phone' => $data['contact_phone'] ?? null,
                'is_active' => $data['is_active'] ?? true,
            ]);

            Cache::forget(self::CACHE_KEY);

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'CREATE_UNIT',
                'module' => 'MasterData',
                'ip_address' => $ip,
                'payload' => ['unit_id' => $unit->id, 'unit_code' => $unit->code, 'factory_type' => $unit->factory_type],
            ]);

            return $unit;
        });
    }

    public function updateUnit(Unit $unit, array $data, User $actor, ?string $ip = null): Unit
    {
        return DB::transaction(function () use ($unit, $data, $actor, $ip) {
            $unit->update([
                'company_id' => array_key_exists('company_id', $data) ? $data['company_id'] : $unit->company_id,
                'name' => array_key_exists('name', $data) ? trim($data['name']) : $unit->name,
                'code' => array_key_exists('code', $data) ? strtoupper(trim($data['code'])) : $unit->code,
                'factory_type' => $data['factory_type'] ?? $unit->factory_type,
                'address' => array_key_exists('address', $data) ? $data['address'] : $unit->address,
                'contact_person' => array_key_exists('contact_person', $data) ? $data['contact_person'] : $unit->contact_person,
                'contact_phone' => array_key_exists('contact_phone', $data) ? $data['contact_phone'] : $unit->contact_phone,
                'is_active' => array_key_exists('is_active', $data) ? $data['is_active'] : $unit->is_active,
            ]);

            Cache::forget(self::CACHE_KEY);

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'UPDATE_UNIT',
                'module' => 'MasterData',
                'ip_address' => $ip,
                'payload' => ['unit_id' => $unit->id, 'unit_code' => $unit->code],
            ]);

            return $unit;
        });
    }

    public function deleteUnit(Unit $unit, User $actor, ?string $ip = null): bool
    {
        return DB::transaction(function () use ($unit, $actor, $ip) {
            $unitId = $unit->id;
            $unitCode = $unit->code;
            $unit->delete();

            Cache::forget(self::CACHE_KEY);

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'DELETE_UNIT',
                'module' => 'MasterData',
                'ip_address' => $ip,
                'payload' => ['unit_id' => $unitId, 'unit_code' => $unitCode],
            ]);

            return true;
        });
    }

    // Floors
    public function getAllFloors(?string $unitId = null): Collection
    {
        $query = Floor::with('unit')->withCount('productionLines')->orderBy('sequence_order');
        if ($unitId) {
            $query->where('unit_id', $unitId);
        }
        return $query->get();
    }

    public function createFloor(array $data, User $actor, ?string $ip = null): Floor
    {
        return DB::transaction(function () use ($data, $actor, $ip) {
            $code = !empty($data['code']) ? strtoupper(trim($data['code'])) : null;
            if (! $code) {
                $count = Floor::where('unit_id', $data['unit_id'])->count() + 1;
                $code = 'FL-' . str_pad($count, 2, '0', STR_PAD_LEFT);
                while (Floor::where('unit_id', $data['unit_id'])->where('code', $code)->exists()) {
                    $count++;
                    $code = 'FL-' . str_pad($count, 2, '0', STR_PAD_LEFT);
                }
            }

            $floor = Floor::create([
                'unit_id' => $data['unit_id'],
                'name' => trim($data['name']),
                'code' => $code,
                'process_type' => strtoupper(trim($data['process_type'] ?? 'SEWING')),
                'sequence_order' => $data['sequence_order'] ?? 1,
                'is_active' => $data['is_active'] ?? true,
            ]);

            Cache::forget(self::CACHE_KEY);

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'CREATE_FLOOR',
                'module' => 'MasterData',
                'ip_address' => $ip,
                'payload' => ['floor_id' => $floor->id, 'floor_code' => $floor->code],
            ]);

            return $floor;
        });
    }

    public function updateFloor(Floor $floor, array $data, User $actor, ?string $ip = null): Floor
    {
        return DB::transaction(function () use ($floor, $data, $actor, $ip) {
            $floor->update([
                'unit_id' => $data['unit_id'] ?? $floor->unit_id,
                'name' => trim($data['name'] ?? $floor->name),
                'code' => isset($data['code']) ? strtoupper(trim($data['code'])) : $floor->code,
                'process_type' => isset($data['process_type']) ? strtoupper(trim($data['process_type'])) : $floor->process_type,
                'sequence_order' => $data['sequence_order'] ?? $floor->sequence_order,
                'is_active' => $data['is_active'] ?? $floor->is_active,
            ]);

            Cache::forget(self::CACHE_KEY);

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'UPDATE_FLOOR',
                'module' => 'MasterData',
                'ip_address' => $ip,
                'payload' => ['floor_id' => $floor->id, 'floor_code' => $floor->code],
            ]);

            return $floor;
        });
    }

    public function deleteFloor(Floor $floor, User $actor, ?string $ip = null): bool
    {
        return DB::transaction(function () use ($floor, $actor, $ip) {
            $floorId = $floor->id;
            $floorCode = $floor->code;
            $floor->delete();

            Cache::forget(self::CACHE_KEY);

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'DELETE_FLOOR',
                'module' => 'MasterData',
                'ip_address' => $ip,
                'payload' => ['floor_id' => $floorId, 'floor_code' => $floorCode],
            ]);

            return true;
        });
    }

    // Production Lines
    public function getAllLines(?string $unitId = null, ?string $floorId = null): Collection
    {
        $query = ProductionLine::with(['unit', 'floor'])->orderBy('name');
        if ($unitId) $query->where('unit_id', $unitId);
        if ($floorId) $query->where('floor_id', $floorId);
        return $query->get();
    }

    public function createLine(array $data, User $actor, ?string $ip = null): ProductionLine
    {
        return DB::transaction(function () use ($data, $actor, $ip) {
            $code = !empty($data['code']) ? strtoupper(trim($data['code'])) : null;
            if (! $code) {
                $count = ProductionLine::where('floor_id', $data['floor_id'])->count() + 1;
                $code = 'L-' . str_pad($count, 2, '0', STR_PAD_LEFT);
                while (ProductionLine::where('floor_id', $data['floor_id'])->where('code', $code)->exists()) {
                    $count++;
                    $code = 'L-' . str_pad($count, 2, '0', STR_PAD_LEFT);
                }
            }

            $line = ProductionLine::create([
                'unit_id' => $data['unit_id'],
                'floor_id' => $data['floor_id'],
                'name' => trim($data['name']),
                'code' => $code,
                'section' => strtoupper(trim($data['section'] ?? 'SEWING')),
                'total_machines' => $data['total_machines'] ?? 30,
                'estimated_manpower' => $data['estimated_manpower'] ?? 40,
                'hourly_target' => $data['hourly_target'] ?? 100,
                'supervisor_name' => $data['supervisor_name'] ?? null,
                'is_active' => $data['is_active'] ?? true,
            ]);

            Cache::forget(self::CACHE_KEY);

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'CREATE_LINE',
                'module' => 'MasterData',
                'ip_address' => $ip,
                'payload' => ['line_id' => $line->id, 'line_code' => $line->code],
            ]);

            return $line;
        });
    }

    public function updateLine(ProductionLine $line, array $data, User $actor, ?string $ip = null): ProductionLine
    {
        return DB::transaction(function () use ($line, $data, $actor, $ip) {
            $line->update([
                'unit_id' => $data['unit_id'] ?? $line->unit_id,
                'floor_id' => $data['floor_id'] ?? $line->floor_id,
                'name' => trim($data['name'] ?? $line->name),
                'code' => isset($data['code']) ? strtoupper(trim($data['code'])) : $line->code,
                'section' => isset($data['section']) ? strtoupper(trim($data['section'])) : $line->section,
                'total_machines' => $data['total_machines'] ?? $line->total_machines,
                'estimated_manpower' => $data['estimated_manpower'] ?? $line->estimated_manpower,
                'hourly_target' => $data['hourly_target'] ?? $line->hourly_target,
                'supervisor_name' => $data['supervisor_name'] ?? $line->supervisor_name,
                'is_active' => $data['is_active'] ?? $line->is_active,
            ]);

            Cache::forget(self::CACHE_KEY);

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'UPDATE_LINE',
                'module' => 'MasterData',
                'ip_address' => $ip,
                'payload' => ['line_id' => $line->id, 'line_code' => $line->code],
            ]);

            return $line;
        });
    }

    public function deleteLine(ProductionLine $line, User $actor, ?string $ip = null): bool
    {
        return DB::transaction(function () use ($line, $actor, $ip) {
            $lineId = $line->id;
            $lineCode = $line->code;
            $line->delete();

            Cache::forget(self::CACHE_KEY);

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'DELETE_LINE',
                'module' => 'MasterData',
                'ip_address' => $ip,
                'payload' => ['line_id' => $lineId, 'line_code' => $lineCode],
            ]);

            return true;
        });
    }

    /**
     * Seed Default Realistic Factory Plant Hierarchy
     */
    public function seedDefaults(): void
    {
        // 0. Group of Company
        $company = Company::firstOrCreate(['code' => 'GRP-STD'], [
            'name' => 'Standard Group of Companies',
            'address' => 'Standard Corporate Tower, Road 11, Banani C/A, Dhaka 1213',
            'contact_email' => 'corporate@standard-group.com',
            'contact_phone' => '+880 2 9820001',
            'trade_license' => 'TRAD/DNCC/012948',
            'tin_bin' => 'BIN-1294029482',
            'is_active' => true,
        ]);

        // 1. Multiple Specialized Factories under the Group
        $sewingUnit1 = Unit::firstOrCreate(['code' => 'FACT-SEW-01'], [
            'company_id' => $company->id,
            'name' => 'Standard Woven Apparel Factory (Unit 01)',
            'factory_type' => 'SEWING_FACTORY',
            'address' => 'Plot 45-48, Sector 02, CEPZ, Chattogram',
            'contact_person' => 'Md. Rafiqul Islam (Plant Head)',
            'contact_phone' => '+880 1711-000101',
            'is_active' => true,
        ]);

        $sewingUnit2 = Unit::firstOrCreate(['code' => 'FACT-SEW-02'], [
            'company_id' => $company->id,
            'name' => 'Standard Outerwear & Jacket Plant (Unit 02)',
            'factory_type' => 'SEWING_FACTORY',
            'address' => 'Plot 12-16, Sector 04, CEPZ, Chattogram',
            'contact_person' => 'Engr. Tanvir Ahmed (General Manager)',
            'contact_phone' => '+880 1711-000202',
            'is_active' => true,
        ]);

        $washPlant = Unit::firstOrCreate(['code' => 'FACT-WASH-01'], [
            'company_id' => $company->id,
            'name' => 'EcoWash Denim Laundry & Dry Processing',
            'factory_type' => 'WASHING_FACTORY',
            'address' => 'Plot 88, Heavy Industrial Area, CEPZ',
            'contact_person' => 'Kamrul Hasan (Washing GM)',
            'contact_phone' => '+880 1711-000303',
            'is_active' => true,
        ]);

        $printPlant = Unit::firstOrCreate(['code' => 'FACT-PRN-01'], [
            'company_id' => $company->id,
            'name' => 'Standard High-Precision Screen & Rotary Printing',
            'factory_type' => 'PRINTING_FACTORY',
            'address' => 'Plot 102, Industrial Zone, CEPZ',
            'contact_person' => 'Shakil Mahmud (Print Specialist)',
            'contact_phone' => '+880 1711-000404',
            'is_active' => true,
        ]);

        $embPlant = Unit::firstOrCreate(['code' => 'FACT-EMB-01'], [
            'company_id' => $company->id,
            'name' => 'Standard Multi-Head Tajima Embroidery Plant',
            'factory_type' => 'EMBROIDERY_FACTORY',
            'address' => 'Plot 104, Industrial Zone, CEPZ',
            'contact_person' => 'Nasir Uddin (Embroidery Manager)',
            'contact_phone' => '+880 1711-000505',
            'is_active' => true,
        ]);

        // 2. Floors for Sewing Unit 01
        $gf = Floor::firstOrCreate(['unit_id' => $sewingUnit1->id, 'code' => 'FL-GF'], [
            'name' => 'Ground Floor (Cutting & Fabric Store)',
            'process_type' => 'CUTTING',
            'sequence_order' => 1,
            'is_active' => true,
        ]);

        $f1 = Floor::firstOrCreate(['unit_id' => $sewingUnit1->id, 'code' => 'FL-01'], [
            'name' => '1st Floor (Sewing Section A)',
            'process_type' => 'SEWING',
            'sequence_order' => 2,
            'is_active' => true,
        ]);

        $f2 = Floor::firstOrCreate(['unit_id' => $sewingUnit1->id, 'code' => 'FL-02'], [
            'name' => '2nd Floor (Sewing Section B)',
            'process_type' => 'SEWING',
            'sequence_order' => 3,
            'is_active' => true,
        ]);

        $f4 = Floor::firstOrCreate(['unit_id' => $sewingUnit1->id, 'code' => 'FL-04'], [
            'name' => '4th Floor (Finishing & Packing)',
            'process_type' => 'FINISHING',
            'sequence_order' => 4,
            'is_active' => true,
        ]);

        // 3. Washing Plant Floors / Work Centers
        $wWet = Floor::firstOrCreate(['unit_id' => $washPlant->id, 'code' => 'FL-WET'], [
            'name' => 'Heavy Wet Wash Floor (Belly & Dyeing Machines)',
            'process_type' => 'WASHING',
            'sequence_order' => 1,
            'is_active' => true,
        ]);

        $wDry = Floor::firstOrCreate(['unit_id' => $washPlant->id, 'code' => 'FL-DRY'], [
            'name' => 'Dry Processing Floor (Laser, Whiskering, Scraping)',
            'process_type' => 'WASHING',
            'sequence_order' => 2,
            'is_active' => true,
        ]);

        // 4. Printing Plant Floors
        $pPrint = Floor::firstOrCreate(['unit_id' => $printPlant->id, 'code' => 'FL-PRN'], [
            'name' => 'Automatic Rotary & Screen Printing Floor',
            'process_type' => 'PRINTING',
            'sequence_order' => 1,
            'is_active' => true,
        ]);

        // 5. Embroidery Plant Floors
        $eEmb = Floor::firstOrCreate(['unit_id' => $embPlant->id, 'code' => 'FL-EMB'], [
            'name' => '24-Head Computerized Tajima Embroidery Floor',
            'process_type' => 'EMBROIDERY',
            'sequence_order' => 1,
            'is_active' => true,
        ]);

        // 3. Lines for Unit 01 Floors
        ProductionLine::firstOrCreate(['floor_id' => $gf->id, 'code' => 'L-CUT-01'], [
            'unit_id' => $sewingUnit1->id,
            'name' => 'Auto Spreading & CAD Cutting Table 01',
            'section' => 'CUTTING',
            'total_machines' => 4,
            'hourly_target' => 450,
            'supervisor_name' => 'Jahangir Alam',
            'is_active' => true,
        ]);

        ProductionLine::firstOrCreate(['floor_id' => $gf->id, 'code' => 'L-CUT-02'], [
            'unit_id' => $sewingUnit1->id,
            'name' => 'Manual Spreading & Cutting Table 02',
            'section' => 'CUTTING',
            'total_machines' => 6,
            'hourly_target' => 300,
            'supervisor_name' => 'Mahbubur Rahman',
            'is_active' => true,
        ]);

        // Floor 1 Sewing Lines
        for ($i = 1; $i <= 4; $i++) {
            $code = sprintf('L-%02d', $i);
            ProductionLine::firstOrCreate(['floor_id' => $f1->id, 'code' => $code], [
                'unit_id' => $sewingUnit1->id,
                'name' => "Sewing Line $code (Woven Topwear)",
                'section' => 'SEWING',
                'total_machines' => 36,
                'hourly_target' => 120,
                'supervisor_name' => "Supervisor Line $i",
                'is_active' => true,
            ]);
        }

        // Floor 2 Sewing Lines
        for ($i = 5; $i <= 8; $i++) {
            $code = sprintf('L-%02d', $i);
            ProductionLine::firstOrCreate(['floor_id' => $f2->id, 'code' => $code], [
                'unit_id' => $sewingUnit1->id,
                'name' => "Sewing Line $code (Denim Bottoms)",
                'section' => 'SEWING',
                'total_machines' => 42,
                'hourly_target' => 110,
                'supervisor_name' => "Supervisor Line $i",
                'is_active' => true,
            ]);
        }

        // Floor 4 Finishing Lines
        ProductionLine::firstOrCreate(['floor_id' => $f4->id, 'code' => 'L-FIN-01'], [
            'unit_id' => $sewingUnit1->id,
            'name' => 'Steam Tunnel & Pressing Line 01',
            'section' => 'FINISHING',
            'total_machines' => 18,
            'hourly_target' => 250,
            'supervisor_name' => 'Anwar Hossain',
            'is_active' => true,
        ]);

        ProductionLine::firstOrCreate(['floor_id' => $f4->id, 'code' => 'L-PCK-01'], [
            'unit_id' => $sewingUnit1->id,
            'name' => 'Tagging, Folding & Carton Packing Line 01',
            'section' => 'PACKING',
            'total_machines' => 12,
            'hourly_target' => 300,
            'supervisor_name' => 'Sultan Ahmed',
            'is_active' => true,
        ]);

        Cache::forget(self::CACHE_KEY);
    }
}
