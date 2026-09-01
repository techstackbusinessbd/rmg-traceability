<?php

namespace App\Domains\MasterData\Controllers;

use App\Domains\MasterData\Models\Buyer;
use App\Domains\MasterData\Services\BuyerMasterService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BuyerController extends Controller
{
    public function __construct(
        protected BuyerMasterService $buyerService
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => $this->buyerService->getAllBuyers(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'code' => 'nullable|string|max:50|unique:buyers,code',
            'country' => 'nullable|string|max:100',
            'currency' => 'nullable|string|max:10',
            'contact_person' => 'nullable|string|max:100',
            'email' => 'nullable|email|max:150',
            'phone' => 'nullable|string|max:50',
            'compliance_standard' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
        ]);

        $buyer = $this->buyerService->createBuyer($validated, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Buyer account registered successfully.',
            'data' => $buyer,
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $buyer = Buyer::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:150',
            'code' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('buyers', 'code')->ignore($buyer->id)],
            'country' => 'nullable|string|max:100',
            'currency' => 'nullable|string|max:10',
            'contact_person' => 'nullable|string|max:100',
            'email' => 'nullable|email|max:150',
            'phone' => 'nullable|string|max:50',
            'compliance_standard' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
        ]);

        $updated = $this->buyerService->updateBuyer($buyer, $validated, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Buyer account updated successfully.',
            'data' => $updated,
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $buyer = Buyer::findOrFail($id);
        $this->buyerService->deleteBuyer($buyer, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Buyer account removed successfully.',
        ]);
    }

    public function storeBrand(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'buyer_id' => 'required|uuid|exists:buyers,id',
            'name' => 'required|string|max:150',
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        $brand = $this->buyerService->createBrand($validated, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Brand label created successfully.',
            'data' => $brand,
        ], 201);
    }
}
