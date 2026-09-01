<?php

namespace App\Domains\OrderManagement\Controllers;

use App\Domains\OrderManagement\Models\Order;
use App\Domains\OrderManagement\Services\OrderMasterService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(
        protected OrderMasterService $orderService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $buyerId = $request->query('buyer_id');
        $status = $request->query('status');

        return response()->json([
            'status' => 'success',
            'data' => $this->orderService->getAllOrders($buyerId, $status),
        ]);
    }

    public function show(string $id): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => $this->orderService->getOrderDetails($id),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_number' => 'required|string|max:100|unique:orders,order_number',
            'buyer_id' => 'required|uuid|exists:buyers,id',
            'brand_id' => 'nullable|uuid|exists:brands,id',
            'style_id' => 'required|uuid|exists:styles,id',
            'company_id' => 'nullable|uuid|exists:companies,id',
            'unit_id' => 'nullable|uuid|exists:units,id',
            'season' => 'nullable|string|max:50',
            'merchant_name' => 'nullable|string|max:150',
            'currency' => 'nullable|string|max:10',
            'remarks' => 'nullable|string|max:500',
            'purchase_orders' => 'nullable|array',
            'purchase_orders.*.po_number' => 'required_with:purchase_orders|string|max:100',
            'purchase_orders.*.destination_market' => 'nullable|string|max:100',
            'purchase_orders.*.ship_date' => 'required_with:purchase_orders|date',
            'purchase_orders.*.order_quantity' => 'required_with:purchase_orders|integer|min:0',
            'purchase_orders.*.unit_price' => 'nullable|numeric|min:0',
            'purchase_orders.*.smv' => 'nullable|numeric|min:0',
            'purchase_orders.*.breakdowns' => 'nullable|array',
        ]);

        $order = $this->orderService->createOrder($validated, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Job Order master contract created successfully.',
            'data' => $order,
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'order_number' => 'sometimes|required|string|max:100|unique:orders,order_number,' . $order->id,
            'buyer_id' => 'sometimes|required|uuid|exists:buyers,id',
            'brand_id' => 'nullable|uuid|exists:brands,id',
            'style_id' => 'sometimes|required|uuid|exists:styles,id',
            'company_id' => 'nullable|uuid|exists:companies,id',
            'unit_id' => 'nullable|uuid|exists:units,id',
            'season' => 'nullable|string|max:50',
            'merchant_name' => 'nullable|string|max:150',
            'currency' => 'nullable|string|max:10',
            'status' => 'nullable|string|in:DRAFT,CONFIRMED,IN_PRODUCTION,COMPLETED,CANCELLED',
            'remarks' => 'nullable|string|max:500',
        ]);

        $updated = $this->orderService->updateOrder($order, $validated, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Job Order contract updated successfully.',
            'data' => $updated,
        ]);
    }

    public function confirm(Request $request, string $id): JsonResponse
    {
        $order = Order::findOrFail($id);
        $confirmed = $this->orderService->confirmOrder($order, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Job Order confirmed and locked for production scheduling.',
            'data' => $confirmed,
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $order = Order::findOrFail($id);
        $this->orderService->deleteOrder($order, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Job Order and associated purchase orders removed successfully.',
        ]);
    }
}
