<?php

namespace App\Domains\MasterData\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductionLine extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'production_lines';

    protected $fillable = [
        'unit_id',
        'floor_id',
        'name',
        'code',
        'section',
        'total_machines',
        'hourly_target',
        'supervisor_name',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'total_machines' => 'integer',
        'hourly_target' => 'integer',
    ];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    public function floor(): BelongsTo
    {
        return $this->belongsTo(Floor::class, 'floor_id');
    }
}
