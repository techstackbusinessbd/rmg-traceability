<?php

namespace App\Domains\OrderManagement\Models;

use App\Domains\MasterData\Models\Buyer;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PoImportTemplate extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'po_import_templates';

    protected $fillable = [
        'buyer_id',
        'template_name',
        'parser_type',
        'coordinate_schema',
        'is_default',
    ];

    protected $casts = [
        'coordinate_schema' => 'array',
        'is_default' => 'boolean',
    ];

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(Buyer::class, 'buyer_id');
    }
}
