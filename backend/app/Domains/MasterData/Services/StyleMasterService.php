<?php

namespace App\Domains\MasterData\Services;

use App\Domains\AuthAdmin\Models\AuditLog;
use App\Domains\AuthAdmin\Models\User;
use App\Domains\MasterData\Models\Buyer;
use App\Domains\MasterData\Models\Style;
use App\Domains\MasterData\Models\StyleOperation;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class StyleMasterService
{
    const CACHE_KEY = 'global_styles_catalog';

    public function getAllStyles(?string $buyerId = null, ?string $garmentType = null): Collection
    {
        $query = Style::with(['buyer', 'brand', 'operations'])->withCount('operations')->orderBy('style_number');

        if ($buyerId && $buyerId !== 'ALL') {
            $query->where('buyer_id', $buyerId);
        }

        if ($garmentType && $garmentType !== 'ALL') {
            $query->where('garment_type', $garmentType);
        }

        return $query->get();
    }

    public function createStyle(array $data, User $actor, ?string $ip = null): Style
    {
        return DB::transaction(function () use ($data, $actor, $ip) {
            $style = Style::create([
                'buyer_id' => $data['buyer_id'],
                'brand_id' => $data['brand_id'] ?? null,
                'style_number' => strtoupper(trim($data['style_number'])),
                'style_name' => trim($data['style_name']),
                'garment_type' => strtoupper(trim($data['garment_type'] ?? 'SHIRT')),
                'season' => $data['season'] ?? 'SS-2026',
                'fabric_type' => $data['fabric_type'] ?? null,
                'total_smv' => isset($data['total_smv']) ? (float) $data['total_smv'] : 0.0,
                'techpack_url' => $data['techpack_url'] ?? null,
                'is_active' => $data['is_active'] ?? true,
            ]);

            // If initial operations provided
            if (!empty($data['operations']) && is_array($data['operations'])) {
                $calcSmv = 0;
                foreach ($data['operations'] as $idx => $op) {
                    $smv = (float) ($op['smv'] ?? 0.5);
                    $calcSmv += $smv;
                    StyleOperation::create([
                        'style_id' => $style->id,
                        'sequence_no' => $op['sequence_no'] ?? ($idx + 1),
                        'operation_name' => trim($op['operation_name']),
                        'operation_code' => $op['operation_code'] ?? null,
                        'section' => strtoupper(trim($op['section'] ?? 'SEWING')),
                        'smv' => $smv,
                        'machine_type' => $op['machine_type'] ?? 'Single Needle Lockstitch (SNLS)',
                        'target_hourly_pcs' => $op['target_hourly_pcs'] ?? (int)(60 / max(0.1, $smv)),
                    ]);
                }
                $style->update(['total_smv' => round($calcSmv, 2)]);
            }

            Cache::forget(self::CACHE_KEY);

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'CREATE_STYLE',
                'module' => 'MasterData',
                'ip_address' => $ip,
                'payload' => ['style_id' => $style->id, 'style_number' => $style->style_number],
            ]);

            return $style->load('operations');
        });
    }

    public function updateStyle(Style $style, array $data, User $actor, ?string $ip = null): Style
    {
        return DB::transaction(function () use ($style, $data, $actor, $ip) {
            $style->update([
                'buyer_id' => $data['buyer_id'] ?? $style->buyer_id,
                'brand_id' => array_key_exists('brand_id', $data) ? $data['brand_id'] : $style->brand_id,
                'style_number' => isset($data['style_number']) ? strtoupper(trim($data['style_number'])) : $style->style_number,
                'style_name' => trim($data['style_name'] ?? $style->style_name),
                'garment_type' => isset($data['garment_type']) ? strtoupper(trim($data['garment_type'])) : $style->garment_type,
                'season' => $data['season'] ?? $style->season,
                'fabric_type' => $data['fabric_type'] ?? $style->fabric_type,
                'total_smv' => $data['total_smv'] ?? $style->total_smv,
                'techpack_url' => $data['techpack_url'] ?? $style->techpack_url,
                'is_active' => $data['is_active'] ?? $style->is_active,
            ]);

            Cache::forget(self::CACHE_KEY);

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'UPDATE_STYLE',
                'module' => 'MasterData',
                'ip_address' => $ip,
                'payload' => ['style_id' => $style->id, 'style_number' => $style->style_number],
            ]);

            return $style->load('operations');
        });
    }

    public function deleteStyle(Style $style, User $actor, ?string $ip = null): bool
    {
        return DB::transaction(function () use ($style, $actor, $ip) {
            $styleId = $style->id;
            $styleNumber = $style->style_number;
            $style->delete();

            Cache::forget(self::CACHE_KEY);

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'DELETE_STYLE',
                'module' => 'MasterData',
                'ip_address' => $ip,
                'payload' => ['style_id' => $styleId, 'style_number' => $styleNumber],
            ]);

            return true;
        });
    }

    public function seedDefaults(): void
    {
        $hm = Buyer::where('code', 'BUY-HM')->first();
        $zara = Buyer::where('code', 'BUY-ZARA')->first();

        if ($hm) {
            $shirt = Style::firstOrCreate(['buyer_id' => $hm->id, 'style_number' => 'STY-HM-OXFORD-01'], [
                'style_name' => "Men's Regular Fit Long Sleeve Oxford Shirt",
                'garment_type' => 'SHIRT',
                'season' => 'SS-2026',
                'fabric_type' => '100% Combed Cotton Oxford 140 GSM',
                'total_smv' => 18.25,
                'is_active' => true,
            ]);

            $shirtOperations = [
                ['seq' => 1, 'name' => 'Collar Band Making & Ironing', 'code' => 'OP-S01', 'sec' => 'SEWING', 'smv' => 0.85, 'm' => 'SNLS'],
                ['seq' => 2, 'name' => 'Collar Topstitch (1/4 gauge)', 'code' => 'OP-S02', 'sec' => 'SEWING', 'smv' => 0.65, 'm' => 'DNLS'],
                ['seq' => 3, 'name' => 'Front Placket Button Box Attach', 'code' => 'OP-S03', 'sec' => 'SEWING', 'smv' => 1.20, 'm' => 'SNLS'],
                ['seq' => 4, 'name' => 'Chest Pocket Hem & Positioning Attach', 'code' => 'OP-S04', 'sec' => 'SEWING', 'smv' => 1.10, 'm' => 'SNLS'],
                ['seq' => 5, 'name' => 'Back Yoke Attach & Topstitch', 'code' => 'OP-S05', 'sec' => 'SEWING', 'smv' => 1.45, 'm' => 'Feed Off Arm'],
                ['seq' => 6, 'name' => 'Shoulder Join (Twin Needle Chainstitch)', 'code' => 'OP-S06', 'sec' => 'SEWING', 'smv' => 0.90, 'm' => 'DNLS Chainstitch'],
                ['seq' => 7, 'name' => 'Collar to Body Join & Clean Finish', 'code' => 'OP-S07', 'sec' => 'SEWING', 'smv' => 2.10, 'm' => 'SNLS'],
                ['seq' => 8, 'name' => 'Sleeve Placket Making & Box Stitch', 'code' => 'OP-S08', 'sec' => 'SEWING', 'smv' => 1.80, 'm' => 'SNLS'],
                ['seq' => 9, 'name' => 'Sleeve Set (Armhole Join)', 'code' => 'OP-S09', 'sec' => 'SEWING', 'smv' => 1.60, 'm' => 'Overlock 4-Thread'],
                ['seq' => 10, 'name' => 'Side Seam & Sleeve Closing (French Seam)', 'code' => 'OP-S10', 'sec' => 'SEWING', 'smv' => 2.40, 'm' => 'Feed Off Arm'],
                ['seq' => 11, 'name' => 'Cuff Join & Topstitch', 'code' => 'OP-S11', 'sec' => 'SEWING', 'smv' => 1.80, 'm' => 'SNLS'],
                ['seq' => 12, 'name' => 'Bottom Hem (Double Turn Folder)', 'code' => 'OP-S12', 'sec' => 'SEWING', 'smv' => 0.90, 'm' => 'SNLS with Folder'],
                ['seq' => 13, 'name' => 'Button Hole (Front & Cuff)', 'code' => 'OP-S13', 'sec' => 'FINISHING', 'smv' => 0.75, 'm' => 'Auto Button Hole'],
                ['seq' => 14, 'name' => 'Button Attach & Thread Trim', 'code' => 'OP-S14', 'sec' => 'FINISHING', 'smv' => 0.75, 'm' => 'Auto Button Sewing'],
            ];

            foreach ($shirtOperations as $op) {
                StyleOperation::firstOrCreate(['style_id' => $shirt->id, 'sequence_no' => $op['seq']], [
                    'operation_name' => $op['name'],
                    'operation_code' => $op['code'],
                    'section' => $op['sec'],
                    'smv' => $op['smv'],
                    'machine_type' => $op['m'],
                    'target_hourly_pcs' => (int)(60 / max(0.1, $op['smv'])),
                ]);
            }
        }

        if ($zara) {
            Style::firstOrCreate(['buyer_id' => $zara->id, 'style_number' => 'STY-ZARA-DNM-5P'], [
                'style_name' => 'Slim Fit 5-Pocket Indigo Denim Pant',
                'garment_type' => 'DENIM',
                'season' => 'AW-2026',
                'fabric_type' => '12.5 oz Ring Spun Denim 98% Cotton 2% Elastane',
                'total_smv' => 22.40,
                'is_active' => true,
            ]);
        }

        Cache::forget(self::CACHE_KEY);
    }
}
