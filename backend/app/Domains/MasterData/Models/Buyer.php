<?php

namespace App\Domains\MasterData\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Buyer extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'buyers';

    protected $fillable = [
        'name',
        'code',
        'country',
        'currency',
        'contact_person',
        'email',
        'phone',
        'compliance_standard',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function brands(): HasMany
    {
        return $this->hasMany(Brand::class, 'buyer_id');
    }

    public function styles(): HasMany
    {
        return $this->hasMany(Style::class, 'buyer_id');
    }
}
