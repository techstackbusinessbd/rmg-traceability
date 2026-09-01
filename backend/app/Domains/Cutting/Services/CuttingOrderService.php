<?php

namespace App\Domains\Cutting\Services;

use App\Domains\Cutting\Models\Cut;
use App\Domains\AuthAdmin\Models\AuditLog;
use App\Domains\OrderManagement\Models\PurchaseOrder;
use App\Domains\Planning\Models\ProductionPlan;
use App\Domains\AuthAdmin\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CuttingOrderService
{
    public function __construct(
        protected BundleQrGeneratorService $bundleService
    ) {}

    /**
     * Check if a PO is eligible for cutting based on Dependent/Independent Policy
     */
    public function validateCuttingPolicy(PurchaseOrder $targetPo): array
    {
        // 1. Check if there is an active Production Plan with an explicit cutting mode
        $plan = ProductionPlan::where('purchase_order_id', $targetPo->id)
            ->orWhere('order_id', $targetPo->order_id)
            ->latest()
            ->first();

        $cuttingMode = $plan ? $plan->cutting_mode : 'DEPENDENT';

        // 2. If Independent, allow any PO cutting freely
        if ($cuttingMode === 'INDEPENDENT') {
            return [
                'allowed' => true,
                'mode' => 'INDEPENDENT',
                'message' => 'Independent mode active: Cutting is unrestricted by PO ship date.',
            ];
        }

        // 3. If Dependent, enforce strict FIFO by PO Ship Date within the same Job Order
        $earlierPendingPo = PurchaseOrder::where('order_id', $targetPo->order_id)
            ->where('id', '!=', $targetPo->id)
            ->where('ship_date', '<', $targetPo->ship_date)
            ->whereColumn('cut_quantity', '<', 'order_quantity')
            ->orderBy('ship_date', 'asc')
            ->first();

        if ($earlierPendingPo) {
            $pendingQty = $earlierPendingPo->order_quantity - $earlierPendingPo->cut_quantity;
            return [
                'allowed' => false,
                'mode' => 'DEPENDENT',
                'blocking_po' => $earlierPendingPo,
                'message' => "Planning Policy Enforced (Dependent Mode): PO #{$earlierPendingPo->po_number} (Ship Date: {$earlierPendingPo->ship_date}) has {$pendingQty} Pcs pending. You must cut earlier ship date POs first.",
            ];
        }

        return [
            'allowed' => true,
            'mode' => 'DEPENDENT',
            'message' => 'Dependent mode verified: This PO has the earliest active ship date.',
        ];
    }

    /**
     * Create Cut Order, Lay Chart, and trigger Bundle QR generation
     */
    public function createCutOrder(array $data, User $actor, ?string $ip = null): Cut
    {
        return DB::transaction(function () use ($data, $actor, $ip) {
            $po = PurchaseOrder::findOrFail($data['purchase_order_id']);

            // 1. Enforce Cutting Governance Policy Gate
            $policyCheck = $this->validateCuttingPolicy($po);
            if (!$policyCheck['allowed']) {
                throw ValidationException::withMessages([
                    'purchase_order_id' => [$policyCheck['message']],
                ]);
            }

            // 2. Auto-generate sequential Cut Number per PO
            $cutCount = Cut::where('purchase_order_id', $po->id)->count() + 1;
            $cutNumber = sprintf('CUT-%03d', $cutCount);

            $plannedCutQty = (int) ($data['planned_cut_qty'] ?? 500);
            $actualCutQty = (int) ($data['actual_cut_qty'] ?? $plannedCutQty);
            $pcsPerBundle = max(1, (int) ($data['pcs_per_bundle'] ?? 50));

            // 3. Tolerance Validation: Maximum 5% overcut allowable
            $maxAllowableCut = (int) ceil($po->order_quantity * 1.05);
            $totalCutAfterThis = $po->cut_quantity + $actualCutQty;
            if ($totalCutAfterThis > $maxAllowableCut && $po->order_quantity > 0) {
                $maxExtra = $maxAllowableCut - $po->cut_quantity;
                throw ValidationException::withMessages([
                    'actual_cut_qty' => ["Cutting Tolerance Exceeded: PO Order Qty is {$po->order_quantity} pcs (5% tolerance max is {$maxAllowableCut} pcs). Maximum allowed for this cut is {$maxExtra} pcs."],
                ]);
            }

            $totalBundles = (int) ceil($actualCutQty / $pcsPerBundle);

            $cut = Cut::create([
                'production_plan_id' => $data['production_plan_id'] ?? null,
                'purchase_order_id' => $po->id,
                'cut_number' => $cutNumber,
                'color_id' => $data['color_id'] ?? null,
                'color_name' => $data['color_name'] ?? 'OG KHAKI',
                'size_id' => $data['size_id'] ?? null,
                'size_name' => $data['size_name'] ?? '32X30',
                'marker_length' => (float) ($data['marker_length'] ?? 0.00),
                'total_plies' => (int) ($data['total_plies'] ?? 50),
                'planned_cut_qty' => $plannedCutQty,
                'actual_cut_qty' => $actualCutQty,
                'pcs_per_bundle' => $pcsPerBundle,
                'total_bundles' => $totalBundles,
                'status' => 'COMPLETED',
                'remarks' => $data['remarks'] ?? null,
                'cutting_master_id' => $actor->id,
            ]);

            // 4. Mathematical Bundle & Single-Piece QR Generation
            $this->bundleService->generateBundlesForCut($cut, $actualCutQty, $pcsPerBundle);

            // 5. Update PO and Breakdown Cut Quantities
            $po->increment('cut_quantity', $actualCutQty);
            if (!empty($cut->color_name) && !empty($cut->size_name)) {
                $breakdown = $po->breakdowns()
                    ->where('color_name', $cut->color_name)
                    ->where('size_name', $cut->size_name)
                    ->first();
                if ($breakdown) {
                    $breakdown->increment('cut_quantity', $actualCutQty);
                }
            }

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'CREATE_CUT_ORDER',
                'module' => 'Cutting',
                'ip_address' => $ip,
                'payload' => [
                    'cut_id' => $cut->id,
                    'cut_number' => $cut->cut_number,
                    'po_number' => $po->po_number,
                    'actual_cut_qty' => $actualCutQty,
                    'total_bundles' => $totalBundles,
                ],
            ]);

            return $cut->load(['purchaseOrder.order', 'bundles.singlePieceQrs']);
        });
    }

    public function deleteCut(Cut $cut, User $actor, ?string $ip = null): bool
    {
        return DB::transaction(function () use ($cut, $actor, $ip) {
            $po = $cut->purchaseOrder;
            if ($po) {
                $po->decrement('cut_quantity', min($po->cut_quantity, $cut->actual_cut_qty));
                $breakdown = $po->breakdowns()
                    ->where('color_name', $cut->color_name)
                    ->where('size_name', $cut->size_name)
                    ->first();
                if ($breakdown) {
                    $breakdown->decrement('cut_quantity', min($breakdown->cut_quantity, $cut->actual_cut_qty));
                }
            }

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'DELETE_CUT_ORDER',
                'module' => 'Cutting',
                'ip_address' => $ip,
                'payload' => ['cut_id' => $cut->id, 'cut_number' => $cut->cut_number],
            ]);

            return $cut->delete();
        });
    }
}
