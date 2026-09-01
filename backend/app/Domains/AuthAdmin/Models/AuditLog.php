<?php

namespace App\Domains\AuthAdmin\Models;

use App\Domains\MasterData\Models\Company;
use App\Domains\MasterData\Models\Unit;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class AuditLog extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $table = 'audit_logs';

    protected $fillable = [
        'user_id',
        'user_emp_id',
        'user_name',
        'user_role',
        'company_id',
        'unit_id',
        'action',
        'event',
        'module',
        'action_summary',
        'auditable_type',
        'auditable_id',
        'ip_address',
        'user_agent',
        'url',
        'http_method',
        'payload',
        'old_values',
        'new_values',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'old_values' => 'array',
            'new_values' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    public function auditable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Scope: Filter by Module
     */
    public function scopeModule(Builder $query, ?string $module): Builder
    {
        if (! empty($module) && $module !== 'ALL') {
            return $query->where('module', $module);
        }
        return $query;
    }

    /**
     * Scope: Filter by Event (CREATE, UPDATE, DELETE, LOGIN, SECURITY)
     */
    public function scopeEvent(Builder $query, ?string $event): Builder
    {
        if (! empty($event) && $event !== 'ALL') {
            return $query->where('event', $event);
        }
        return $query;
    }

    /**
     * Scope: Keyword Search (Action, Summary, User, Emp ID, IP)
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (empty($term)) {
            return $query;
        }

        $term = '%' . trim($term) . '%';
        return $query->where(function (Builder $q) use ($term) {
            $q->where('action', 'ilike', $term)
              ->orWhere('action_summary', 'ilike', $term)
              ->orWhere('user_name', 'ilike', $term)
              ->orWhere('user_emp_id', 'ilike', $term)
              ->orWhere('ip_address', 'ilike', $term);
        });
    }
}
