<?php

namespace App\Domains\AuthAdmin\Services;

use App\Domains\AuthAdmin\Models\SystemSetting;
use App\Domains\AuthAdmin\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SystemSettingService
{
    const CACHE_KEY = 'global_system_settings';
    const CACHE_PUBLIC_KEY = 'public_system_settings';

    public function __construct(
        protected AuditLogService $auditLogService
    ) {}

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
     * Update bulk settings and invalidate Redis cache + Record Enterprise Audit Trail
     */
    public function updateSettings(array $settings, User $actor, ?string $ip = null): Collection
    {
        return DB::transaction(function () use ($settings, $actor, $ip) {
            $existing = SystemSetting::whereIn('key', array_keys($settings))->get()->keyBy('key');
            $oldValues = [];
            $newValues = [];

            foreach ($settings as $key => $value) {
                if (isset($existing[$key])) {
                    $oldVal = $existing[$key]->value;
                    $formattedVal = is_array($value) ? json_encode($value) : (string) $value;

                    if ($oldVal !== $formattedVal) {
                        $oldValues[$key] = $oldVal;
                        $newValues[$key] = $formattedVal;

                        $existing[$key]->update([
                            'value' => $formattedVal,
                        ]);
                    }
                }
            }

            // Invalidate Cache
            Cache::forget(self::CACHE_KEY);
            Cache::forget(self::CACHE_PUBLIC_KEY);

            // Record Enterprise Audit Trail
            if (! empty($newValues)) {
                $this->auditLogService->record(
                    event: 'UPDATE',
                    module: 'SystemSettings',
                    action: 'UPDATE_SYSTEM_SETTINGS',
                    summary: 'Modified ' . count($newValues) . ' global enterprise configuration parameters',
                    auditable: null,
                    oldValues: $oldValues,
                    newValues: $newValues,
                    actor: $actor
                );
            }

            return $this->getAllSettings();
        });
    }

    /**
     * Seed Default Enterprise Big ERP Settings (SAP/Oracle RMG Standards)
     */
    public function seedDefaults(): void
    {
        $defaults = [
            // 1. Enterprise Identity & Localization (enterprise)
            [
                'group' => 'enterprise',
                'key' => 'enterprise_system_title',
                'value' => 'Standard Group Garments Traceability Suite',
                'type' => 'string',
                'options' => null,
                'label' => 'Enterprise System Title',
                'description' => 'Global branding title displayed on login portals and all shopfloor terminals.',
                'is_public' => true,
            ],
            [
                'group' => 'enterprise',
                'key' => 'system_timezone',
                'value' => 'Asia/Dhaka',
                'type' => 'select',
                'options' => ['Asia/Dhaka', 'Asia/Kolkata', 'Asia/Bangkok', 'UTC', 'Europe/London', 'America/New_York'],
                'label' => 'Standard Operational Timezone',
                'description' => 'Base timezone for production shift timestamps, hourly targets, and attendance sync.',
                'is_public' => true,
            ],
            [
                'group' => 'enterprise',
                'key' => 'base_currency',
                'value' => 'USD',
                'type' => 'select',
                'options' => ['USD', 'BDT', 'EUR', 'GBP'],
                'label' => 'Base Functional Currency',
                'description' => 'Primary currency for buyer Purchase Orders, style pricing, and freight calculations.',
                'is_public' => false,
            ],
            [
                'group' => 'enterprise',
                'key' => 'default_garment_uom',
                'value' => 'PCS',
                'type' => 'select',
                'options' => ['PCS', 'DOZ', 'DZN', 'SET'],
                'label' => 'Default Garment UoM (Unit of Measure)',
                'description' => 'Standard inventory measurement unit across Cutting, Sewing, and Packing.',
                'is_public' => true,
            ],
            [
                'group' => 'enterprise',
                'key' => 'fiscal_year_start_month',
                'value' => 'July',
                'type' => 'select',
                'options' => ['January', 'April', 'July', 'October'],
                'label' => 'Fiscal Year Start Cycle',
                'description' => 'Financial and production planning reporting cycle commencement month.',
                'is_public' => false,
            ],

            // 2. Production & Shopfloor Flow (production)
            [
                'group' => 'production',
                'key' => 'standard_shift_hours',
                'value' => '8',
                'type' => 'number',
                'options' => null,
                'label' => 'Standard Line Shift Hours',
                'description' => 'Default daily working duration per line operator shift for SMV target computation.',
                'is_public' => false,
            ],
            [
                'group' => 'production',
                'key' => 'hourly_production_variance_tolerance_pct',
                'value' => '10.0',
                'type' => 'number',
                'options' => null,
                'label' => 'Hourly Target Variance Warning (%)',
                'description' => 'Allowed negative deviation from planned line target before triggering floor supervisor alerts.',
                'is_public' => true,
            ],
            [
                'group' => 'production',
                'key' => 'enforce_strict_stage_sequence',
                'value' => 'true',
                'type' => 'boolean',
                'options' => null,
                'label' => 'Strict Stage Sequence Enforcement',
                'description' => 'Blocks garments from skipping intermediate stages (e.g. Sewing -> Washing -> Finishing).',
                'is_public' => true,
            ],
            [
                'group' => 'production',
                'key' => 'barcode_serial_prefix',
                'value' => 'STG',
                'type' => 'string',
                'options' => null,
                'label' => 'Bundle / Piece Barcode Prefix',
                'description' => 'Leading character string generated on all thermal QR bundle tickets.',
                'is_public' => true,
            ],

            // 3. Quality Assurance & Defect Thresholds (qc)
            [
                'group' => 'qc',
                'key' => 'dhu_alert_threshold',
                'value' => '5.0',
                'type' => 'number',
                'options' => null,
                'label' => 'DHU Critical Alert Threshold (%)',
                'description' => 'Defects Per Hundred Units threshold. Triggers immediate red warning on line inspection tablets.',
                'is_public' => true,
            ],
            [
                'group' => 'qc',
                'key' => 'qc_max_defects_per_piece',
                'value' => '3',
                'type' => 'number',
                'options' => null,
                'label' => 'Max Defects Before Automatic Rejection',
                'description' => 'Defect count on a single garment before auto-classifying as REJECTED instead of REWORK.',
                'is_public' => false,
            ],
            [
                'group' => 'qc',
                'key' => 'rework_requires_supervisor_signoff',
                'value' => 'true',
                'type' => 'boolean',
                'options' => null,
                'label' => 'Rework Requires QA Supervisor Sign-off',
                'description' => 'Enforces QA supervisor tablet verification before repaired pieces re-enter line conveyor.',
                'is_public' => true,
            ],

            // 4. Packing, Carton Scaling & Export Compliance (shipment)
            [
                'group' => 'shipment',
                'key' => 'export_short_shipment_tolerance_pct',
                'value' => '2.0',
                'type' => 'number',
                'options' => null,
                'label' => 'Short Shipment Allowance Limit (%)',
                'description' => 'Allowable variance between buyer PO order quantity and actual loaded container units.',
                'is_public' => false,
            ],
            [
                'group' => 'shipment',
                'key' => 'carton_weight_tolerance_kg',
                'value' => '0.50',
                'type' => 'number',
                'options' => null,
                'label' => 'Carton Scale Weight Tolerance (KG)',
                'description' => 'Maximum allowed weight variance between piece BOM theoretical weight and digital scale reading.',
                'is_public' => true,
            ],
            [
                'group' => 'shipment',
                'key' => 'carton_barcode_verification_mode',
                'value' => 'STRICT',
                'type' => 'select',
                'options' => ['STRICT', 'STANDARD', 'LENIENT'],
                'label' => 'Carton Barcode Verification Policy',
                'description' => 'STRICT mode enforces 100% individual piece scan confirmation before carton closing seal is generated.',
                'is_public' => true,
            ],

            // 5. Device Security & Access Control (security)
            [
                'group' => 'security',
                'key' => 'web_session_timeout_mins',
                'value' => '60',
                'type' => 'number',
                'options' => null,
                'label' => 'Web Admin Inactivity Timeout (Minutes)',
                'description' => 'Automatic web console logout upon inactivity for SOC 2 / ISO 27001 compliance.',
                'is_public' => false,
            ],
            [
                'group' => 'security',
                'key' => 'scanner_idle_timeout_min',
                'value' => '15',
                'type' => 'number',
                'options' => null,
                'label' => 'Floor Tablet Screen Lock (Minutes)',
                'description' => 'Automatic floor terminal PIN lockout when no operator barcodes/QRs are scanned.',
                'is_public' => true,
            ],
            [
                'group' => 'security',
                'key' => 'max_failed_login_attempts',
                'value' => '5',
                'type' => 'number',
                'options' => null,
                'label' => 'Max Failed Login Lockout Count',
                'description' => 'Number of consecutive invalid password attempts before locking user for 15 minutes.',
                'is_public' => false,
            ],
            [
                'group' => 'security',
                'key' => 'enforce_strong_password_policy',
                'value' => 'true',
                'type' => 'boolean',
                'options' => null,
                'label' => 'Enforce Strong Password Complexity',
                'description' => 'Requires minimum 8 characters with combination of uppercase, lowercase, numbers and symbols.',
                'is_public' => false,
            ],
            [
                'group' => 'security',
                'key' => 'allow_offline_sync_hours',
                'value' => '24',
                'type' => 'number',
                'options' => null,
                'label' => 'Offline Tablet Queue Max Buffer (Hours)',
                'description' => 'Maximum duration for offline IndexedDB scan queue storage before requiring network token refresh.',
                'is_public' => true,
            ],

            // 6. System Engine & Redis Performance (system)
            [
                'group' => 'system',
                'key' => 'redis_cache_ttl_seconds',
                'value' => '3600',
                'type' => 'number',
                'options' => null,
                'label' => 'Redis Master Cache TTL (Seconds)',
                'description' => 'Expiration timeframe for global plant tree, style operations, and buyer dictionary cache.',
                'is_public' => false,
            ],
            [
                'group' => 'system',
                'key' => 'system_maintenance_mode',
                'value' => 'false',
                'type' => 'boolean',
                'options' => null,
                'label' => 'System Maintenance Lock',
                'description' => 'Temporarily locks floor tablets from recording scans during scheduled database maintenance.',
                'is_public' => true,
            ],
            [
                'group' => 'system',
                'key' => 'audit_log_retention_days',
                'value' => '730',
                'type' => 'number',
                'options' => null,
                'label' => 'Audit Trail Active Retention (Days)',
                'description' => 'Rolling timeframe to retain detailed user action telemetry in high-speed storage before archival.',
                'is_public' => false,
            ],
        ];

        foreach ($defaults as $def) {
            SystemSetting::updateOrCreate(
                ['key' => $def['key']],
                $def
            );
        }

        Cache::forget(self::CACHE_KEY);
        Cache::forget(self::CACHE_PUBLIC_KEY);
    }
}
