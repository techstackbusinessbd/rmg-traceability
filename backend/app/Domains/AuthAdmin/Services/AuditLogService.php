<?php

namespace App\Domains\AuthAdmin\Services;

use App\Domains\AuthAdmin\Models\AuditLog;
use App\Domains\AuthAdmin\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AuditLogService
{
    /**
     * Record an immutable Enterprise Audit Log entry
     */
    public function record(
        string $event,
        string $module,
        string $action,
        ?string $summary = null,
        ?Model $auditable = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?User $actor = null,
        ?Request $request = null,
        ?array $payload = null
    ): AuditLog {
        // Resolve Actor details
        $userId = $actor?->id;
        $userEmpId = $actor?->emp_id;
        $userName = $actor?->name ?? 'System Automated';
        $userRole = $actor?->roles?->first()?->name ?? ($actor ? 'User' : 'System Engine');
        $companyId = $actor?->company_id;
        $unitId = $actor?->unit_id;

        // Resolve Request details
        $ip = $request?->ip() ?? request()?->ip() ?? '127.0.0.1';
        $userAgent = $request?->userAgent() ?? request()?->userAgent();
        $url = $request?->fullUrl() ?? request()?->fullUrl();
        $method = $request?->method() ?? request()?->method();

        // Calculate diff between old & new values if not provided
        $diffOld = $oldValues;
        $diffNew = $newValues;

        return AuditLog::create([
            'user_id' => $userId,
            'user_emp_id' => $userEmpId,
            'user_name' => $userName,
            'user_role' => $userRole,
            'company_id' => $companyId,
            'unit_id' => $unitId,
            'event' => strtoupper($event),
            'module' => $module,
            'action' => strtoupper($action),
            'action_summary' => $summary ?? "{$event} performed on {$module}",
            'auditable_type' => $auditable ? get_class($auditable) : null,
            'auditable_id' => $auditable?->getKey(),
            'ip_address' => $ip,
            'user_agent' => $userAgent,
            'url' => $url,
            'http_method' => $method,
            'payload' => $payload,
            'old_values' => $diffOld,
            'new_values' => $diffNew,
            'created_at' => Carbon::now(),
        ]);
    }

    /**
     * Get Paginated & Filtered Audit Logs
     */
    public function getFilteredLogs(array $filters = [], int $perPage = 25): LengthAwarePaginator
    {
        $query = AuditLog::with(['user', 'company', 'unit'])
            ->orderBy('created_at', 'desc');

        if (! empty($filters['module']) && $filters['module'] !== 'ALL') {
            $query->where('module', $filters['module']);
        }

        if (! empty($filters['event']) && $filters['event'] !== 'ALL') {
            $query->where('event', strtoupper($filters['event']));
        }

        if (! empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (! empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (! empty($filters['from_date'])) {
            $query->where('created_at', '>=', Carbon::parse($filters['from_date'])->startOfDay());
        }

        if (! empty($filters['to_date'])) {
            $query->where('created_at', '<=', Carbon::parse($filters['to_date'])->endOfDay());
        }

        return $query->paginate($perPage);
    }

    /**
     * Get All matching logs for CSV/Excel Export (Capped at 5000)
     */
    public function getExportLogs(array $filters = []): Collection
    {
        $query = AuditLog::orderBy('created_at', 'desc');

        if (! empty($filters['module']) && $filters['module'] !== 'ALL') {
            $query->where('module', $filters['module']);
        }

        if (! empty($filters['event']) && $filters['event'] !== 'ALL') {
            $query->where('event', strtoupper($filters['event']));
        }

        if (! empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (! empty($filters['from_date'])) {
            $query->where('created_at', '>=', Carbon::parse($filters['from_date'])->startOfDay());
        }

        if (! empty($filters['to_date'])) {
            $query->where('created_at', '<=', Carbon::parse($filters['to_date'])->endOfDay());
        }

        return $query->limit(5000)->get();
    }
}
