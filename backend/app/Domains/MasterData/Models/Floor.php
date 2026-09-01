<?php

namespace App\Domains\MasterData\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Floor extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'floors';

    protected $fillable = [
        'unit_id',
        'name',
        'code',
        'process_type',
        'sequence_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sequence_order' => 'integer',
    ];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    public function productionLines(): HasMany
    {
        return $this->hasMany(ProductionLine::class, 'floor_id');
    }
}
