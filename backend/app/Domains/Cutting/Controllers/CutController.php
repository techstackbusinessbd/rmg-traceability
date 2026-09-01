<?php

namespace App\Domains\Cutting\Controllers;

use App\Domains\Cutting\Models\Cut;
use App\Domains\Cutting\Services\CuttingOrderService;
use App\Domains\OrderManagement\Models\PurchaseOrder;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CutController extends Controller
{
    public function __construct(
        protected CuttingOrderService $cuttingService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Cut::with([
            'purchaseOrder.order.buyer',
            'purchaseOrder.order.style',
            'bundles',
            'cuttingMaster',
        ]);

        if ($request->filled('purchase_order_id')) {
            $query->where('purchase_order_id', $request->input('purchase_order_id'));
        }

        if ($request->filled('color_name')) {
            $query->where('color_name', $request->input('color_name'));
        }

        $cuts = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $cuts,
        ]);
    }

    public function checkPoEligibility(string $poId): JsonResponse
    {
        $po = PurchaseOrder::with('order.style')->findOrFail($poId);
        $policyResult = $this->cuttingService->validateCuttingPolicy($po);

        return response()->json([
            'status' => 'success',
            'data' => $policyResult,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'purchase_order_id' => 'required|uuid|exists:purchase_orders,id',
            'production_plan_id' => 'nullable|uuid|exists:production_plans,id',
            'color_id' => 'nullable|uuid|exists:colors,id',
            'color_name' => 'required|string|max:100',
            'size_id' => 'nullable|uuid|exists:sizes,id',
            'size_name' => 'required|string|max:50',
            'marker_length' => 'nullable|numeric|min:0',
            'total_plies' => 'nullable|integer|min:1',
            'planned_cut_qty' => 'required|integer|min:1',
            'actual_cut_qty' => 'required|integer|min:1',
            'pcs_per_bundle' => 'required|integer|min:1|max:200',
            'remarks' => 'nullable|string|max:500',
        ]);

        $cut = $this->cuttingService->createCutOrder($validated, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => "Cut Order #{$cut->cut_number} logged and {$cut->total_bundles} Bundle QR tickets generated.",
            'data' => $cut,
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $cut = Cut::with([
            'purchaseOrder.order.buyer',
            'purchaseOrder.order.style',
            'bundles.singlePieceQrs',
            'cuttingMaster',
        ])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $cut,
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $cut = Cut::findOrFail($id);
        $this->cuttingService->deleteCut($cut, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Cut Order and all associated bundle tickets deleted successfully.',
        ]);
    }
}
