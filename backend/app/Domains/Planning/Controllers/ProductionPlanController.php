<?php

namespace App\Domains\Planning\Controllers;

use App\Domains\Planning\Models\ProductionPlan;
use App\Domains\Planning\Services\ProductionPlanningService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductionPlanController extends Controller
{
    public function __construct(
        protected ProductionPlanningService $planningService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = ProductionPlan::with([
            'order.buyer',
            'order.brand',
            'order.style',
            'purchaseOrder',
            'line',
            'unit'
        ]);

        if ($request->filled('line_id')) {
            $query->where('line_id', $request->input('line_id'));
        }

        if ($request->filled('order_id')) {
            $query->where('order_id', $request->input('order_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $plans = $query->orderBy('start_date', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $plans,
        ]);
    }

    public function calculateMath(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'manpower' => 'required|integer|min:1|max:200',
            'smv' => 'required|numeric|min:0.1|max:200',
            'target_efficiency' => 'required|numeric|min:1|max:150',
        ]);

        $hourlyTarget = $this->planningService->calculateHourlyTarget(
            (int)$validated['manpower'],
            (float)$validated['smv'],
            (float)$validated['target_efficiency']
        );

        return response()->json([
            'status' => 'success',
            'data' => [
                'hourly_target' => $hourlyTarget,
                'daily_8hr_target' => $hourlyTarget * 8,
                'daily_10hr_target' => $hourlyTarget * 10,
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|uuid|exists:orders,id',
            'purchase_order_id' => 'nullable|uuid|exists:purchase_orders,id',
            'line_id' => 'required|uuid|exists:production_lines,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'smv' => 'nullable|numeric|min:0.1',
            'manpower' => 'nullable|integer|min:1|max:200',
            'target_efficiency' => 'nullable|numeric|min:1|max:150',
            'planned_quantity' => 'nullable|integer|min:1',
            'cutting_mode' => 'nullable|in:DEPENDENT,INDEPENDENT',
            'material_ready' => 'nullable|boolean',
            'status' => 'nullable|in:DRAFT,APPROVED,RUNNING,COMPLETED',
            'notes' => 'nullable|string|max:1000',
        ]);

        $plan = $this->planningService->createPlan($validated, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Production plan scheduled successfully.',
            'data' => $plan,
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $plan = ProductionPlan::with([
            'order.buyer',
            'order.brand',
            'order.style',
            'purchaseOrder.breakdowns',
            'line',
            'unit'
        ])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $plan,
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $plan = ProductionPlan::findOrFail($id);

        $validated = $request->validate([
            'line_id' => 'nullable|uuid|exists:production_lines,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'smv' => 'nullable|numeric|min:0.1',
            'manpower' => 'nullable|integer|min:1|max:200',
            'target_efficiency' => 'nullable|numeric|min:1|max:150',
            'planned_quantity' => 'nullable|integer|min:1',
            'cutting_mode' => 'nullable|in:DEPENDENT,INDEPENDENT',
            'material_ready' => 'nullable|boolean',
            'status' => 'nullable|in:DRAFT,APPROVED,RUNNING,COMPLETED,CANCELLED',
            'notes' => 'nullable|string|max:1000',
        ]);

        $updated = $this->planningService->updatePlan($plan, $validated, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Production plan updated successfully.',
            'data' => $updated,
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $plan = ProductionPlan::findOrFail($id);
        $this->planningService->deletePlan($plan, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Production plan deleted successfully.',
        ]);
    }
}
