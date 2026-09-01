<?php

namespace App\Domains\MasterData\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Style extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'styles';

    protected $fillable = [
        'buyer_id',
        'brand_id',
        'style_number',
        'style_name',
        'garment_type',
        'season',
        'fabric_type',
        'total_smv',
        'techpack_url',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'total_smv' => 'decimal:2',
    ];

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(Buyer::class, 'buyer_id');
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class, 'brand_id');
    }

    public function operations(): HasMany
    {
        return $this->hasMany(StyleOperation::class, 'style_id')->orderBy('sequence_no');
    }
}
