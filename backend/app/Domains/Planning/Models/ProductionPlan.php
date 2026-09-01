<?php

namespace App\Domains\Planning\Models;

use App\Domains\MasterData\Models\ProductionLine;
use App\Domains\MasterData\Models\Unit;
use App\Domains\OrderManagement\Models\Order;
use App\Domains\OrderManagement\Models\PurchaseOrder;
use App\Domains\AuthAdmin\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductionPlan extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'production_plans';

    protected $fillable = [
        'order_id',
        'purchase_order_id',
        'unit_id',
        'line_id',
        'start_date',
        'end_date',
        'smv',
        'manpower',
        'target_efficiency',
        'hourly_target',
        'planned_quantity',
        'cutting_mode',
        'material_ready',
        'status',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
        'smv' => 'decimal:2',
        'manpower' => 'integer',
        'target_efficiency' => 'decimal:2',
        'hourly_target' => 'integer',
        'planned_quantity' => 'integer',
        'material_ready' => 'boolean',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class, 'purchase_order_id');
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    public function line(): BelongsTo
    {
        return $this->belongsTo(ProductionLine::class, 'line_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
