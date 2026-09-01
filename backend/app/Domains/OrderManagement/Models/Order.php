<?php

namespace App\Domains\OrderManagement\Models;

use App\Domains\MasterData\Models\Brand;
use App\Domains\MasterData\Models\Buyer;
use App\Domains\MasterData\Models\Company;
use App\Domains\MasterData\Models\Style;
use App\Domains\MasterData\Models\Unit;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'orders';

    protected $fillable = [
        'order_number',
        'buyer_id',
        'brand_id',
        'style_id',
        'company_id',
        'unit_id',
        'season',
        'merchant_name',
        'total_quantity',
        'total_value',
        'currency',
        'status',
        'techpack_path',
        'remarks',
    ];

    protected $casts = [
        'total_quantity' => 'integer',
        'total_value' => 'decimal:2',
    ];

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(Buyer::class, 'buyer_id');
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class, 'brand_id');
    }

    public function style(): BelongsTo
    {
        return $this->belongsTo(Style::class, 'style_id');
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class, 'order_id')->orderBy('ship_date');
    }
}
