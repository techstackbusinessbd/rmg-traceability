<?php

namespace App\Domains\OrderManagement\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseOrder extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'purchase_orders';

    protected $fillable = [
        'order_id',
        'po_number',
        'destination_market',
        'ship_date',
        'phd_date',
        'order_quantity',
        'cut_quantity',
        'sewn_quantity',
        'packed_quantity',
        'shipped_quantity',
        'unit_price',
        'smv',
        'status',
        'notes',
    ];

    protected $casts = [
        'order_quantity' => 'integer',
        'cut_quantity' => 'integer',
        'sewn_quantity' => 'integer',
        'packed_quantity' => 'integer',
        'shipped_quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'smv' => 'decimal:2',
        'ship_date' => 'date',
        'phd_date' => 'date',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function breakdowns(): HasMany
    {
        return $this->hasMany(PoBreakdown::class, 'purchase_order_id')->orderBy('color_name')->orderBy('size_name');
    }
}
