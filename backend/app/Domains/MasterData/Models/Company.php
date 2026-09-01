<?php

namespace App\Domains\MasterData\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'companies';

    protected $fillable = [
        'name',
        'code',
        'address',
        'contact_email',
        'contact_phone',
        'trade_license',
        'tin_bin',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function factories(): HasMany
    {
        return $this->hasMany(Unit::class, 'company_id');
    }
}
