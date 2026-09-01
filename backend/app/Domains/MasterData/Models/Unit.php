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
        'company_id',
        'name',
        'code',
        'factory_type',
        'address',
        'contact_person',
        'contact_phone',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function company(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function floors(): HasMany
    {
        return $this->hasMany(Floor::class, 'unit_id')->orderBy('sequence_order');
    }

    public function productionLines(): HasMany
    {
        return $this->hasMany(ProductionLine::class, 'unit_id');
    }
}
