<?php

namespace App\Domains\Planning\Services;

use App\Domains\AuthAdmin\Models\AuditLog;
use App\Domains\MasterData\Models\ProductionLine;
use App\Domains\OrderManagement\Models\Order;
use App\Domains\OrderManagement\Models\PurchaseOrder;
use App\Domains\Planning\Models\ProductionPlan;
use App\Domains\AuthAdmin\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProductionPlanningService
{
    /**
     * Mathematical Formula for Hourly Production Target:
     * Hourly Target = ((Manpower * 60) / SMV) * (Target Efficiency % / 100)
     */
    public function calculateHourlyTarget(int $manpower, float $smv, float $targetEfficiency): int
    {
        if ($smv <= 0) return 0;
        $capacityAt100 = ($manpower * 60.0) / $smv;
        $target = $capacityAt100 * ($targetEfficiency / 100.0);
        return max(1, (int) round($target));
    }

    /**
     * Guard against double-booking / overlapping line schedule conflicts
     */
    public function checkLineScheduleConflict(string $lineId, string $startDate, string $endDate, ?string $excludePlanId = null): void
    {
        $query = ProductionPlan::where('line_id', $lineId)
            ->whereIn('status', ['APPROVED', 'RUNNING', 'DRAFT'])
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('start_date', [$startDate, $endDate])
                  ->orWhereBetween('end_date', [$startDate, $endDate])
                  ->orWhere(function ($sub) use ($startDate, $endDate) {
                      $sub->where('start_date', '<=', $startDate)
                          ->where('end_date', '>=', $endDate);
                  });
            });

        if ($excludePlanId) {
            $query->where('id', '!=', $excludePlanId);
        }

        $conflict = $query->with(['purchaseOrder', 'line'])->first();

        if ($conflict) {
            $lineName = $conflict->line?->name ?? 'Production Line';
            $poNum = $conflict->purchaseOrder?->po_number ?? 'Order';
            throw ValidationException::withMessages([
                'line_id' => ["Schedule Conflict: {$lineName} is already allocated for PO #{$poNum} from {$conflict->start_date} to {$conflict->end_date}."],
            ]);
        }
    }

    public function createPlan(array $data, User $actor, ?string $ip = null): ProductionPlan
    {
        return DB::transaction(function () use ($data, $actor, $ip) {
            $order = Order::findOrFail($data['order_id']);
            $po = !empty($data['purchase_order_id']) ? PurchaseOrder::findOrFail($data['purchase_order_id']) : null;
            $line = ProductionLine::findOrFail($data['line_id']);

            $startDate = $data['start_date'];
            $endDate = $data['end_date'];

            // 1. Conflict Check
            $this->checkLineScheduleConflict($line->id, $startDate, $endDate);

            // 2. Capacity Target Math
            $smv = isset($data['smv']) ? (float)$data['smv'] : ($po?->smv ?? 20.00);
            $manpower = isset($data['manpower']) ? (int)$data['manpower'] : 30;
            $targetEff = isset($data['target_efficiency']) ? (float)$data['target_efficiency'] : 60.00;
            $hourlyTarget = $this->calculateHourlyTarget($manpower, $smv, $targetEff);

            $plannedQty = isset($data['planned_quantity']) ? (int)$data['planned_quantity'] : ($po?->order_quantity ?? $order->total_quantity);

            // 3. Cutting Governance Mode (Inherit or Override)
            $cuttingMode = in_array(strtoupper($data['cutting_mode'] ?? ''), ['DEPENDENT', 'INDEPENDENT'])
                ? strtoupper($data['cutting_mode'])
                : 'DEPENDENT';

            $plan = ProductionPlan::create([
                'order_id' => $order->id,
                'purchase_order_id' => $po?->id,
                'unit_id' => $line->unit_id,
                'line_id' => $line->id,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'smv' => $smv,
                'manpower' => $manpower,
                'target_efficiency' => $targetEff,
                'hourly_target' => $hourlyTarget,
                'planned_quantity' => $plannedQty,
                'cutting_mode' => $cuttingMode,
                'material_ready' => $data['material_ready'] ?? true,
                'status' => $data['status'] ?? 'APPROVED',
                'notes' => $data['notes'] ?? null,
                'created_by' => $actor->id,
            ]);

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'CREATE_PRODUCTION_PLAN',
                'module' => 'Planning',
                'ip_address' => $ip,
                'payload' => [
                    'plan_id' => $plan->id,
                    'line_code' => $line->code,
                    'cutting_mode' => $cuttingMode,
                    'hourly_target' => $hourlyTarget,
                ],
            ]);

            return $plan->load(['order.buyer', 'order.style', 'purchaseOrder', 'line', 'unit']);
        });
    }

    public function updatePlan(ProductionPlan $plan, array $data, User $actor, ?string $ip = null): ProductionPlan
    {
        return DB::transaction(function () use ($plan, $data, $actor, $ip) {
            $startDate = $data['start_date'] ?? $plan->start_date;
            $endDate = $data['end_date'] ?? $plan->end_date;
            $lineId = $data['line_id'] ?? $plan->line_id;

            if ($lineId !== $plan->line_id || $startDate !== $plan->start_date || $endDate !== $plan->end_date) {
                $this->checkLineScheduleConflict($lineId, $startDate, $endDate, $plan->id);
            }

            $smv = isset($data['smv']) ? (float)$data['smv'] : (float)$plan->smv;
            $manpower = isset($data['manpower']) ? (int)$data['manpower'] : (int)$plan->manpower;
            $targetEff = isset($data['target_efficiency']) ? (float)$data['target_efficiency'] : (float)$plan->target_efficiency;
            $hourlyTarget = $this->calculateHourlyTarget($manpower, $smv, $targetEff);

            $cuttingMode = isset($data['cutting_mode']) && in_array(strtoupper($data['cutting_mode']), ['DEPENDENT', 'INDEPENDENT'])
                ? strtoupper($data['cutting_mode'])
                : $plan->cutting_mode;

            $plan->update([
                'line_id' => $lineId,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'smv' => $smv,
                'manpower' => $manpower,
                'target_efficiency' => $targetEff,
                'hourly_target' => $hourlyTarget,
                'planned_quantity' => $data['planned_quantity'] ?? $plan->planned_quantity,
                'cutting_mode' => $cuttingMode,
                'material_ready' => $data['material_ready'] ?? $plan->material_ready,
                'status' => $data['status'] ?? $plan->status,
                'notes' => array_key_exists('notes', $data) ? $data['notes'] : $plan->notes,
            ]);

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'UPDATE_PRODUCTION_PLAN',
                'module' => 'Planning',
                'ip_address' => $ip,
                'payload' => [
                    'plan_id' => $plan->id,
                    'status' => $plan->status,
                    'cutting_mode' => $cuttingMode,
                ],
            ]);

            return $plan->load(['order.buyer', 'order.style', 'purchaseOrder', 'line', 'unit']);
        });
    }

    public function deletePlan(ProductionPlan $plan, User $actor, ?string $ip = null): bool
    {
        return DB::transaction(function () use ($plan, $actor, $ip) {
            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'DELETE_PRODUCTION_PLAN',
                'module' => 'Planning',
                'ip_address' => $ip,
                'payload' => ['plan_id' => $plan->id],
            ]);

            return $plan->delete();
        });
    }
}
