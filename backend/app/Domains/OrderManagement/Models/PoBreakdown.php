<?php

namespace App\Domains\OrderManagement\Models;

use App\Domains\MasterData\Models\Color;
use App\Domains\MasterData\Models\Size;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PoBreakdown extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'po_breakdowns';

    protected $fillable = [
        'purchase_order_id',
        'color_id',
        'color_name',
        'size_id',
        'size_name',
        'quantity',
        'cut_quantity',
        'sewn_quantity',
        'packed_quantity',
        'shipped_quantity',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'cut_quantity' => 'integer',
        'sewn_quantity' => 'integer',
        'packed_quantity' => 'integer',
        'shipped_quantity' => 'integer',
    ];

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class, 'purchase_order_id');
    }

    public function color(): BelongsTo
    {
        return $this->belongsTo(Color::class, 'color_id');
    }

    public function size(): BelongsTo
    {
        return $this->belongsTo(Size::class, 'size_id');
    }
}
