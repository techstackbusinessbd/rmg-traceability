<?php

namespace App\Domains\MasterData\Services;

use App\Domains\AuthAdmin\Models\AuditLog;
use App\Domains\AuthAdmin\Models\User;
use App\Domains\MasterData\Models\Color;
use App\Domains\MasterData\Models\DefectCode;
use App\Domains\MasterData\Models\Size;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AttributeMasterService
{
    const CACHE_KEY = 'global_attributes_matrix';

    // Colors
    public function getAllColors(): Collection
    {
        return Color::orderBy('name')->get();
    }

    public function createColor(array $data, User $actor, ?string $ip = null): Color
    {
        return DB::transaction(function () use ($data, $actor, $ip) {
            $code = !empty($data['code']) ? strtoupper(trim($data['code'])) : $this->generateUniqueColorCode($data['name']);

            $color = Color::create([
                'name' => trim($data['name']),
                'code' => $code,
                'hex_code' => $data['hex_code'] ?? '#000000',
                'pantone_ref' => $data['pantone_ref'] ?? null,
                'is_active' => $data['is_active'] ?? true,
            ]);

            Cache::forget(self::CACHE_KEY);
            return $color;
        });
    }

    private function generateUniqueColorCode(string $name): string
    {
        $clean = preg_replace('/[^a-zA-Z0-9\s]/', '', $name);
        $words = array_filter(explode(' ', trim((string) $clean)));
        if (count($words) === 1) {
            $acronym = strtoupper(substr(reset($words), 0, 4));
        } else {
            $acronym = '';
            foreach ($words as $w) {
                $acronym .= strtoupper(substr($w, 0, 1));
            }
            $acronym = substr($acronym, 0, 5);
        }
        $baseCode = 'COL-' . ($acronym ?: 'SHD');
        $code = $baseCode;
        $counter = 1;
        while (Color::where('code', $code)->exists()) {
            $code = $baseCode . '-' . sprintf('%02d', $counter);
            $counter++;
        }
        return $code;
    }

    public function updateColor(Color $color, array $data, User $actor, ?string $ip = null): Color
    {
        return DB::transaction(function () use ($color, $data, $actor, $ip) {
            $color->update([
                'name' => trim($data['name'] ?? $color->name),
                'code' => isset($data['code']) ? strtoupper(trim($data['code'])) : $color->code,
                'hex_code' => $data['hex_code'] ?? $color->hex_code,
                'pantone_ref' => $data['pantone_ref'] ?? $color->pantone_ref,
                'is_active' => $data['is_active'] ?? $color->is_active,
            ]);

            Cache::forget(self::CACHE_KEY);
            return $color;
        });
    }

    public function deleteColor(Color $color, User $actor, ?string $ip = null): bool
    {
        return DB::transaction(function () use ($color, $actor, $ip) {
            $color->delete();
            Cache::forget(self::CACHE_KEY);
            return true;
        });
    }

    // Sizes
    public function getAllSizes(): Collection
    {
        return Size::orderBy('sort_order')->orderBy('name')->get();
    }

    public function createSize(array $data, User $actor, ?string $ip = null): Size
    {
        return DB::transaction(function () use ($data, $actor, $ip) {
            $size = Size::create([
                'name' => strtoupper(trim($data['name'])),
                'code' => strtoupper(trim($data['code'])),
                'category' => strtoupper(trim($data['category'] ?? 'ALPHA')),
                'sort_order' => $data['sort_order'] ?? 1,
                'is_active' => $data['is_active'] ?? true,
            ]);

            Cache::forget(self::CACHE_KEY);
            return $size;
        });
    }

    public function updateSize(Size $size, array $data, User $actor, ?string $ip = null): Size
    {
        return DB::transaction(function () use ($size, $data, $actor, $ip) {
            $size->update([
                'name' => isset($data['name']) ? strtoupper(trim($data['name'])) : $size->name,
                'code' => isset($data['code']) ? strtoupper(trim($data['code'])) : $size->code,
                'category' => isset($data['category']) ? strtoupper(trim($data['category'])) : $size->category,
                'sort_order' => $data['sort_order'] ?? $size->sort_order,
                'is_active' => $data['is_active'] ?? $size->is_active,
            ]);

            Cache::forget(self::CACHE_KEY);
            return $size;
        });
    }

    public function deleteSize(Size $size, User $actor, ?string $ip = null): bool
    {
        return DB::transaction(function () use ($size, $actor, $ip) {
            $size->delete();
            Cache::forget(self::CACHE_KEY);
            return true;
        });
    }

    // Defects
    public function getAllDefects(?string $stage = null): Collection
    {
        $query = DefectCode::orderBy('process_stage')->orderBy('severity')->orderBy('code');
        if ($stage && $stage !== 'ALL') {
            $query->where('process_stage', $stage);
        }
        return $query->get();
    }

    public function createDefect(array $data, User $actor, ?string $ip = null): DefectCode
    {
        return DB::transaction(function () use ($data, $actor, $ip) {
            $defect = DefectCode::create([
                'code' => strtoupper(trim($data['code'])),
                'name' => trim($data['name']),
                'process_stage' => strtoupper(trim($data['process_stage'] ?? 'SEWING')),
                'severity' => strtoupper(trim($data['severity'] ?? 'MAJOR')),
                'standard_penalty_points' => $data['standard_penalty_points'] ?? '3',
                'is_active' => $data['is_active'] ?? true,
            ]);

            Cache::forget(self::CACHE_KEY);
            return $defect;
        });
    }

    public function updateDefect(DefectCode $defect, array $data, User $actor, ?string $ip = null): DefectCode
    {
        return DB::transaction(function () use ($defect, $data, $actor, $ip) {
            $defect->update([
                'code' => isset($data['code']) ? strtoupper(trim($data['code'])) : $defect->code,
                'name' => trim($data['name'] ?? $defect->name),
                'process_stage' => isset($data['process_stage']) ? strtoupper(trim($data['process_stage'])) : $defect->process_stage,
                'severity' => isset($data['severity']) ? strtoupper(trim($data['severity'])) : $defect->severity,
                'standard_penalty_points' => $data['standard_penalty_points'] ?? $defect->standard_penalty_points,
                'is_active' => $data['is_active'] ?? $defect->is_active,
            ]);

            Cache::forget(self::CACHE_KEY);
            return $defect;
        });
    }

    public function deleteDefect(DefectCode $defect, User $actor, ?string $ip = null): bool
    {
        return DB::transaction(function () use ($defect, $actor, $ip) {
            $defect->delete();
            Cache::forget(self::CACHE_KEY);
            return true;
        });
    }

    public function seedDefaults(): void
    {
        // Colors
        $colors = [
            ['code' => 'COL-WHT', 'name' => 'Optic White', 'hex_code' => '#FFFFFF', 'pantone_ref' => '11-0601 TCX'],
            ['code' => 'COL-BLK', 'name' => 'Jet Black', 'hex_code' => '#0F172A', 'pantone_ref' => '19-4008 TCX'],
            ['code' => 'COL-NVY', 'name' => 'Navy Blazer', 'hex_code' => '#1E3A8A', 'pantone_ref' => '19-3923 TCX'],
            ['code' => 'COL-SKY', 'name' => 'Sky Blue Chambray', 'hex_code' => '#38BDF8', 'pantone_ref' => '14-4115 TCX'],
            ['code' => 'COL-CHR', 'name' => 'Charcoal Heather', 'hex_code' => '#475569', 'pantone_ref' => '18-5203 TCX'],
            ['code' => 'COL-IND', 'name' => 'Indigo Denim Blue', 'hex_code' => '#1D4ED8', 'pantone_ref' => '19-4027 TCX'],
            ['code' => 'COL-OLV', 'name' => 'Military Olive Green', 'hex_code' => '#3F6212', 'pantone_ref' => '18-0527 TCX'],
            ['code' => 'COL-RED', 'name' => 'Crimson Red', 'hex_code' => '#DC2626', 'pantone_ref' => '18-1662 TCX'],
        ];
        foreach ($colors as $c) {
            Color::firstOrCreate(['code' => $c['code']], $c);
        }

        // Sizes (Alpha & Numeric)
        $sizes = [
            ['code' => 'SZ-XS', 'name' => 'XS', 'category' => 'ALPHA', 'sort_order' => 1],
            ['code' => 'SZ-S', 'name' => 'S', 'category' => 'ALPHA', 'sort_order' => 2],
            ['code' => 'SZ-M', 'name' => 'M', 'category' => 'ALPHA', 'sort_order' => 3],
            ['code' => 'SZ-L', 'name' => 'L', 'category' => 'ALPHA', 'sort_order' => 4],
            ['code' => 'SZ-XL', 'name' => 'XL', 'category' => 'ALPHA', 'sort_order' => 5],
            ['code' => 'SZ-XXL', 'name' => 'XXL', 'category' => 'ALPHA', 'sort_order' => 6],
            ['code' => 'SZ-3XL', 'name' => '3XL', 'category' => 'ALPHA', 'sort_order' => 7],
            ['code' => 'SZ-28', 'name' => '28', 'category' => 'NUMERIC', 'sort_order' => 10],
            ['code' => 'SZ-30', 'name' => '30', 'category' => 'NUMERIC', 'sort_order' => 11],
            ['code' => 'SZ-32', 'name' => '32', 'category' => 'NUMERIC', 'sort_order' => 12],
            ['code' => 'SZ-34', 'name' => '34', 'category' => 'NUMERIC', 'sort_order' => 13],
            ['code' => 'SZ-36', 'name' => '36', 'category' => 'NUMERIC', 'sort_order' => 14],
            ['code' => 'SZ-38', 'name' => '38', 'category' => 'NUMERIC', 'sort_order' => 15],
        ];
        foreach ($sizes as $s) {
            Size::firstOrCreate(['code' => $s['code']], $s);
        }

        // Defects
        $defects = [
            ['code' => 'DEF-SEW-01', 'name' => 'Broken Stitch / Thread Snap', 'process_stage' => 'SEWING', 'severity' => 'MAJOR', 'standard_penalty_points' => '3'],
            ['code' => 'DEF-SEW-02', 'name' => 'Skip Stitch (Missing Loop)', 'process_stage' => 'SEWING', 'severity' => 'MAJOR', 'standard_penalty_points' => '3'],
            ['code' => 'DEF-SEW-03', 'name' => 'Seam Puckering / High Tension', 'process_stage' => 'SEWING', 'severity' => 'MINOR', 'standard_penalty_points' => '1'],
            ['code' => 'DEF-SEW-04', 'name' => 'Open Seam / Uncaught Seam', 'process_stage' => 'SEWING', 'severity' => 'CRITICAL', 'standard_penalty_points' => '5'],
            ['code' => 'DEF-SEW-05', 'name' => 'Uneven Stitch Density / SPI Out of Tolerance', 'process_stage' => 'SEWING', 'severity' => 'MINOR', 'standard_penalty_points' => '1'],
            ['code' => 'DEF-SEW-06', 'name' => 'Needle Cut / Fabric Hole', 'process_stage' => 'SEWING', 'severity' => 'CRITICAL', 'standard_penalty_points' => '5'],
            ['code' => 'DEF-CUT-01', 'name' => 'Pattern Miscut / Notch Missing', 'process_stage' => 'CUTTING', 'severity' => 'MAJOR', 'standard_penalty_points' => '3'],
            ['code' => 'DEF-CUT-02', 'name' => 'Shade Variation in Cut Panel', 'process_stage' => 'CUTTING', 'severity' => 'CRITICAL', 'standard_penalty_points' => '5'],
            ['code' => 'DEF-FIN-01', 'name' => 'Oil Spot / Machine Lubricant Stain', 'process_stage' => 'FINISHING', 'severity' => 'MAJOR', 'standard_penalty_points' => '3'],
            ['code' => 'DEF-FIN-02', 'name' => 'Pressing Mark / Shiny Surface', 'process_stage' => 'FINISHING', 'severity' => 'MINOR', 'standard_penalty_points' => '1'],
            ['code' => 'DEF-FIN-03', 'name' => 'Uncut Loose Thread (> 5mm)', 'process_stage' => 'FINISHING', 'severity' => 'MINOR', 'standard_penalty_points' => '1'],
            ['code' => 'DEF-FIN-04', 'name' => 'Incorrect Price Ticket / Size Label Mismatch', 'process_stage' => 'PACKING', 'severity' => 'CRITICAL', 'standard_penalty_points' => '5'],
        ];
        foreach ($defects as $d) {
            DefectCode::firstOrCreate(['code' => $d['code']], $d);
        }

        Cache::forget(self::CACHE_KEY);
    }
}
