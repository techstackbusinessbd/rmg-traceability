<?php

namespace App\Domains\Cutting\Models;

use App\Domains\MasterData\Models\Color;
use App\Domains\MasterData\Models\Size;
use App\Domains\OrderManagement\Models\PurchaseOrder;
use App\Domains\Planning\Models\ProductionPlan;
use App\Domains\AuthAdmin\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cut extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'cuts';

    protected $fillable = [
        'production_plan_id',
        'purchase_order_id',
        'cut_number',
        'color_id',
        'color_name',
        'size_id',
        'size_name',
        'marker_length',
        'total_plies',
        'planned_cut_qty',
        'actual_cut_qty',
        'pcs_per_bundle',
        'total_bundles',
        'status',
        'remarks',
        'cutting_master_id',
    ];

    protected $casts = [
        'marker_length' => 'decimal:2',
        'total_plies' => 'integer',
        'planned_cut_qty' => 'integer',
        'actual_cut_qty' => 'integer',
        'pcs_per_bundle' => 'integer',
        'total_bundles' => 'integer',
    ];

    public function productionPlan(): BelongsTo
    {
        return $this->belongsTo(ProductionPlan::class, 'production_plan_id');
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

    public function cuttingMaster(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cutting_master_id');
    }

    public function bundles(): HasMany
    {
        return $this->hasMany(Bundle::class, 'cut_id')->orderBy('bundle_number');
    }
}
