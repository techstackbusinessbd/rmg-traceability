<?php

namespace App\Domains\OrderManagement\Controllers;

use App\Domains\OrderManagement\Models\Order;
use App\Domains\OrderManagement\Models\PurchaseOrder;
use App\Domains\OrderManagement\Services\PurchaseOrderService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PoBreakdownController extends Controller
{
    public function __construct(
        protected PurchaseOrderService $poService
    ) {}

    public function storePo(Request $request, string $orderId): JsonResponse
    {
        $order = Order::findOrFail($orderId);

        $validated = $request->validate([
            'po_number' => 'required|string|max:100',
            'destination_market' => 'nullable|string|max:100',
            'ship_date' => 'required|date',
            'phd_date' => 'nullable|date',
            'order_quantity' => 'required|integer|min:0',
            'unit_price' => 'nullable|numeric|min:0',
            'smv' => 'nullable|numeric|min:0',
            'status' => 'nullable|string|in:DRAFT,CONFIRMED,CUTTING_RELEASED,IN_SEWING,SHIPPED,CANCELLED',
            'notes' => 'nullable|string|max:255',
            'breakdowns' => 'nullable|array',
        ]);

        $po = $this->poService->createPurchaseOrder($order, $validated, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Purchase Order line created successfully.',
            'data' => $po,
        ], 201);
    }

    public function updatePo(Request $request, string $id): JsonResponse
    {
        $po = PurchaseOrder::findOrFail($id);

        $validated = $request->validate([
            'po_number' => 'sometimes|required|string|max:100',
            'destination_market' => 'nullable|string|max:100',
            'ship_date' => 'sometimes|required|date',
            'phd_date' => 'nullable|date',
            'order_quantity' => 'sometimes|required|integer|min:0',
            'unit_price' => 'nullable|numeric|min:0',
            'smv' => 'nullable|numeric|min:0',
            'status' => 'nullable|string|in:DRAFT,CONFIRMED,CUTTING_RELEASED,IN_SEWING,SHIPPED,CANCELLED',
            'notes' => 'nullable|string|max:255',
            'breakdowns' => 'nullable|array',
        ]);

        $updated = $this->poService->updatePurchaseOrder($po, $validated, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Purchase Order updated successfully.',
            'data' => $updated,
        ]);
    }

    public function getMatrix(string $id): JsonResponse
    {
        $po = PurchaseOrder::with(['order.style', 'order.buyer', 'breakdowns'])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => [
                'purchase_order' => $po,
                'breakdowns' => $po->breakdowns,
            ],
        ]);
    }

    public function updateMatrix(Request $request, string $id): JsonResponse
    {
        $po = PurchaseOrder::findOrFail($id);

        $validated = $request->validate([
            'breakdowns' => 'required|array',
            'breakdowns.*.color_name' => 'required|string|max:100',
            'breakdowns.*.size_name' => 'required|string|max:50',
            'breakdowns.*.quantity' => 'required|integer|min:0',
        ]);

        $this->poService->syncPoMatrixBreakdown($po, $validated['breakdowns']);

        return response()->json([
            'status' => 'success',
            'message' => 'Color-Size matrix ratio updated and mathematically reconciled.',
            'data' => $po->load('breakdowns'),
        ]);
    }

    public function destroyPo(Request $request, string $id): JsonResponse
    {
        $po = PurchaseOrder::findOrFail($id);
        $this->poService->deletePurchaseOrder($po, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Purchase Order removed successfully.',
        ]);
    }
}
