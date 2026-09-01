<?php

namespace App\Domains\MasterData\Services;

use App\Domains\AuthAdmin\Models\AuditLog;
use App\Domains\AuthAdmin\Models\User;
use App\Domains\MasterData\Models\Brand;
use App\Domains\MasterData\Models\Buyer;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class BuyerMasterService
{
    const CACHE_KEY = 'global_buyers_list';

    public function getAllBuyers(): Collection
    {
        return Buyer::with('brands')->withCount(['brands', 'styles'])->orderBy('name')->get();
    }

    public function createBuyer(array $data, User $actor, ?string $ip = null): Buyer
    {
        return DB::transaction(function () use ($data, $actor, $ip) {
            $code = !empty($data['code']) ? strtoupper(trim($data['code'])) : $this->generateUniqueBuyerCode($data['name']);

            $buyer = Buyer::create([
                'name' => trim($data['name']),
                'code' => $code,
                'country' => $data['country'] ?? 'Bangladesh',
                'currency' => strtoupper(trim($data['currency'] ?? 'USD')),
                'contact_person' => $data['contact_person'] ?? null,
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'compliance_standard' => $data['compliance_standard'] ?? 'BSCI / Accord',
                'is_active' => $data['is_active'] ?? true,
            ]);

            Cache::forget(self::CACHE_KEY);

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'CREATE_BUYER',
                'module' => 'MasterData',
                'ip_address' => $ip,
                'payload' => ['buyer_id' => $buyer->id, 'buyer_code' => $buyer->code],
            ]);

            return $buyer;
        });
    }

    private function generateUniqueBuyerCode(string $name): string
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
        $baseCode = 'BUY-' . ($acronym ?: 'GEN');
        $code = $baseCode;
        $counter = 1;
        while (Buyer::where('code', $code)->exists()) {
            $code = $baseCode . '-' . sprintf('%02d', $counter);
            $counter++;
        }
        return $code;
    }

    public function updateBuyer(Buyer $buyer, array $data, User $actor, ?string $ip = null): Buyer
    {
        return DB::transaction(function () use ($buyer, $data, $actor, $ip) {
            $buyer->update([
                'name' => trim($data['name'] ?? $buyer->name),
                'code' => isset($data['code']) ? strtoupper(trim($data['code'])) : $buyer->code,
                'country' => $data['country'] ?? $buyer->country,
                'currency' => isset($data['currency']) ? strtoupper(trim($data['currency'])) : $buyer->currency,
                'contact_person' => $data['contact_person'] ?? $buyer->contact_person,
                'email' => $data['email'] ?? $buyer->email,
                'phone' => $data['phone'] ?? $buyer->phone,
                'compliance_standard' => $data['compliance_standard'] ?? $buyer->compliance_standard,
                'is_active' => $data['is_active'] ?? $buyer->is_active,
            ]);

            Cache::forget(self::CACHE_KEY);

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'UPDATE_BUYER',
                'module' => 'MasterData',
                'ip_address' => $ip,
                'payload' => ['buyer_id' => $buyer->id, 'buyer_code' => $buyer->code],
            ]);

            return $buyer;
        });
    }

    public function deleteBuyer(Buyer $buyer, User $actor, ?string $ip = null): bool
    {
        return DB::transaction(function () use ($buyer, $actor, $ip) {
            $buyerId = $buyer->id;
            $buyerCode = $buyer->code;
            $buyer->delete();

            Cache::forget(self::CACHE_KEY);

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'DELETE_BUYER',
                'module' => 'MasterData',
                'ip_address' => $ip,
                'payload' => ['buyer_id' => $buyerId, 'buyer_code' => $buyerCode],
            ]);

            return true;
        });
    }

    // Brands
    public function createBrand(array $data, User $actor, ?string $ip = null): Brand
    {
        return DB::transaction(function () use ($data, $actor, $ip) {
            $code = !empty($data['code']) ? strtoupper(trim($data['code'])) : $this->generateUniqueBrandCode($data['buyer_id'], $data['name']);

            $brand = Brand::create([
                'buyer_id' => $data['buyer_id'],
                'name' => trim($data['name']),
                'code' => $code,
                'description' => $data['description'] ?? null,
                'is_active' => $data['is_active'] ?? true,
            ]);

            Cache::forget(self::CACHE_KEY);

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'CREATE_BRAND',
                'module' => 'MasterData',
                'ip_address' => $ip,
                'payload' => ['brand_id' => $brand->id, 'brand_code' => $brand->code],
            ]);

            return $brand;
        });
    }

    private function generateUniqueBrandCode(string $buyerId, string $name): string
    {
        $clean = preg_replace('/[^a-zA-Z0-9\s_-]/', '', $name);
        $slug = strtoupper(trim(preg_replace('/\s+/', '-', (string) $clean)));
        $baseCode = 'BR-' . ($slug ?: 'LABEL');
        $code = $baseCode;
        $counter = 1;
        while (Brand::where('buyer_id', $buyerId)->where('code', $code)->exists()) {
            $code = $baseCode . '-' . sprintf('%02d', $counter);
            $counter++;
        }
        return $code;
    }

    public function seedDefaults(): void
    {
        $buyers = [
            [
                'code' => 'BUY-HM',
                'name' => 'H&M Hennes & Mauritz GBC',
                'country' => 'Sweden',
                'currency' => 'EUR',
                'contact_person' => 'Johan Lindqvist (Country Merchandiser)',
                'email' => 'johan.l@hm.com',
                'compliance_standard' => 'H&M Global Code of Conduct / Accord',
                'brands' => [
                    ['code' => 'BR-HMMEN', 'name' => 'H&M Men Regular'],
                    ['code' => 'BR-DIVIDED', 'name' => 'Divided Blue'],
                    ['code' => 'BR-COS', 'name' => 'COS Premium'],
                ],
            ],
            [
                'code' => 'BUY-ZARA',
                'name' => 'Inditex (Zara / Pull&Bear / Bershka)',
                'country' => 'Spain',
                'currency' => 'EUR',
                'contact_person' => 'Carlos Hernandez',
                'email' => 'carlos.h@inditex.com',
                'compliance_standard' => 'Inditex Right to Wear Standard',
                'brands' => [
                    ['code' => 'BR-ZARA-M', 'name' => 'Zara Man'],
                    ['code' => 'BR-PB', 'name' => 'Pull & Bear Denim'],
                ],
            ],
            [
                'code' => 'BUY-PVH',
                'name' => 'PVH Corp (Tommy Hilfiger & Calvin Klein)',
                'country' => 'USA',
                'currency' => 'USD',
                'contact_person' => 'Robert Miller',
                'email' => 'robert.m@pvh.com',
                'compliance_standard' => 'WRAP Gold / Sedex SMETA',
                'brands' => [
                    ['code' => 'BR-TH-TAILOR', 'name' => 'Tommy Hilfiger Tailored'],
                    ['code' => 'BR-CK-JEANS', 'name' => 'Calvin Klein Jeans'],
                ],
            ],
        ];

        foreach ($buyers as $bData) {
            $brands = $bData['brands'];
            unset($bData['brands']);

            $buyer = Buyer::firstOrCreate(['code' => $bData['code']], $bData);

            foreach ($brands as $brData) {
                Brand::firstOrCreate(['buyer_id' => $buyer->id, 'code' => $brData['code']], [
                    'name' => $brData['name'],
                    'description' => "Official brand label for {$buyer->name}",
                    'is_active' => true,
                ]);
            }
        }

        Cache::forget(self::CACHE_KEY);
    }
}
