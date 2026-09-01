<?php

namespace App\Domains\Cutting\Models;

use App\Domains\MasterData\Models\Color;
use App\Domains\MasterData\Models\Size;
use App\Domains\OrderManagement\Models\PurchaseOrder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Bundle extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'bundles';

    protected $fillable = [
        'cut_id',
        'purchase_order_id',
        'bundle_number',
        'bundle_code',
        'color_id',
        'color_name',
        'size_id',
        'size_name',
        'quantity',
        'qr_code_hash',
        'start_piece_no',
        'end_piece_no',
        'status',
    ];

    protected $casts = [
        'bundle_number' => 'integer',
        'quantity' => 'integer',
        'start_piece_no' => 'integer',
        'end_piece_no' => 'integer',
    ];

    public function cut(): BelongsTo
    {
        return $this->belongsTo(Cut::class, 'cut_id');
    }

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

    public function singlePieceQrs(): HasMany
    {
        return $this->hasMany(SinglePieceQr::class, 'bundle_id')->orderBy('piece_number');
    }
}
