<?php

namespace App\Domains\AuthAdmin\Services;

use App\Domains\AuthAdmin\Models\AuditLog;
use App\Domains\AuthAdmin\Models\SystemSetting;
use App\Domains\AuthAdmin\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SystemSettingService
{
    const CACHE_KEY = 'global_system_settings';
    const CACHE_PUBLIC_KEY = 'public_system_settings';

    /**
     * Get specific setting by key with Redis Cache and fallback default
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $all = Cache::rememberForever(self::CACHE_KEY, function () {
            return SystemSetting::orderBy('group')->orderBy('created_at')->get()->toArray();
        });

        $setting = collect($all)->firstWhere('key', $key);
        if (! $setting) {
            return $default;
        }

        $type = $setting['type'] ?? 'string';
        $val = $setting['value'] ?? null;

        return match ($type) {
            'number' => is_numeric($val) ? (float) $val : $default,
            'boolean' => filter_var($val, FILTER_VALIDATE_BOOLEAN),
            'json' => json_decode($val, true) ?: $default,
            default => $val ?? $default,
        };
    }

    /**
     * Get all settings (Cached Forever via Redis)
     */
    public function getAllSettings(): Collection
    {
        $raw = Cache::rememberForever(self::CACHE_KEY, function () {
            return SystemSetting::orderBy('group')->orderBy('created_at')->get()->toArray();
        });

        return collect($raw);
    }

    /**
     * Get public settings for floor tablets (Cached)
     */
    public function getPublicSettings(): Collection
    {
        $raw = Cache::rememberForever(self::CACHE_PUBLIC_KEY, function () {
            return SystemSetting::where('is_public', true)->get()->toArray();
        });

        return collect($raw);
    }

    /**
     * Update bulk settings and invalidate Redis cache
     */
    public function updateSettings(array $settings, User $actor, ?string $ip = null): Collection
    {
        return DB::transaction(function () use ($settings, $actor, $ip) {
            foreach ($settings as $key => $value) {
                SystemSetting::where('key', $key)->update([
                    'value' => is_array($value) ? json_encode($value) : (string) $value,
                ]);
            }

            // Invalidate Cache
            Cache::forget(self::CACHE_KEY);
            Cache::forget(self::CACHE_PUBLIC_KEY);

            // Audit
            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'UPDATE_SYSTEM_SETTINGS',
                'module' => 'AuthAdmin',
                'ip_address' => $ip,
                'payload' => ['updated_keys' => array_keys($settings)],
            ]);

            return $this->getAllSettings();
        });
    }

    /**
     * Seed Default Enterprise Settings
     */
    public function seedDefaults(): void
    {
        $defaults = [
            // General Factory Config
            [
                'group' => 'factory',
                'key' => 'factory_plant_name',
                'value' => 'Standard Unit 01 (Factory)',
                'type' => 'string',
                'label' => 'Factory Plant Name',
                'description' => 'Official manufacturing unit name displayed across all terminal headers.',
                'is_public' => true,
            ],
            [
                'group' => 'factory',
                'key' => 'factory_shift_hours',
                'value' => '8',
                'type' => 'number',
                'label' => 'Standard Shift Duration (Hours)',
                'description' => 'Default working hours per production line shift for efficiency calculations.',
                'is_public' => false,
            ],

            // Quality Control (QC) Configurations
            [
                'group' => 'qc',
                'key' => 'dhu_alert_threshold',
                'value' => '5.0',
                'type' => 'number',
                'label' => 'DHU Critical Alert Threshold (%)',
                'description' => 'Defects Per Hundred Units threshold. Triggers immediate supervisor and floor audio-visual warnings when crossed.',
                'is_public' => true,
            ],
            [
                'group' => 'qc',
                'key' => 'qc_max_defects_per_piece',
                'value' => '3',
                'type' => 'number',
                'label' => 'Max Allowed Defects Before Reject',
                'description' => 'Number of logged defects on a single piece before automatically classifying it as REJECTED instead of REWORK.',
                'is_public' => false,
            ],

            // Shipment & Packing Configurations
            [
                'group' => 'shipment',
                'key' => 'export_short_shipment_tolerance_pct',
                'value' => '2.0',
                'type' => 'number',
                'label' => 'Short Shipment Tolerance (%)',
                'description' => 'Allowable percentage variance between PO required quantity and packed container quantity.',
                'is_public' => false,
            ],
            [
                'group' => 'shipment',
                'key' => 'carton_weight_tolerance_kg',
                'value' => '0.50',
                'type' => 'number',
                'label' => 'Carton Gross Weight Tolerance (KG)',
                'description' => 'Allowed variance between calculated piece BOM weight and digital floor scale weight.',
                'is_public' => true,
            ],

            // Security & Floor Tablet Settings
            [
                'group' => 'security',
                'key' => 'scanner_idle_timeout_min',
                'value' => '15',
                'type' => 'number',
                'label' => 'Tablet Screen Lock Timeout (Minutes)',
                'description' => 'Automatic floor terminal lock when no barcodes/QRs are scanned within this timeframe.',
                'is_public' => true,
            ],
            [
                'group' => 'security',
                'key' => 'allow_offline_sync_hours',
                'value' => '24',
                'type' => 'number',
                'label' => 'Offline Tablet Queue Expiry (Hours)',
                'description' => 'Maximum allowed duration for offline IndexedDB scan queue caching before requiring network re-authentication.',
                'is_public' => true,
            ],
        ];

        foreach ($defaults as $def) {
            SystemSetting::firstOrCreate(
                ['key' => $def['key']],
                $def
            );
        }

        Cache::forget(self::CACHE_KEY);
        Cache::forget(self::CACHE_PUBLIC_KEY);
    }
}
