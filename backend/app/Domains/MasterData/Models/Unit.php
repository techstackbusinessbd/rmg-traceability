<?php

namespace App\Domains\MasterData\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unit extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'units';

    protected $fillable = [
        'name',
        'code',
        'address',
        'contact_person',
        'contact_phone',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function floors(): HasMany
    {
        return $this->hasMany(Floor::class, 'unit_id')->orderBy('sequence_order');
    }

    public function productionLines(): HasMany
    {
        return $this->hasMany(ProductionLine::class, 'unit_id');
    }
}
