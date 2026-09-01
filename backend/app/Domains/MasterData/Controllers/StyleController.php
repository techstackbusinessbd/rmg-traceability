<?php

namespace App\Domains\MasterData\Controllers;

use App\Domains\MasterData\Models\Style;
use App\Domains\MasterData\Models\StyleOperation;
use App\Domains\MasterData\Services\StyleMasterService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StyleController extends Controller
{
    public function __construct(
        protected StyleMasterService $styleService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $buyerId = $request->query('buyer_id');
        $garmentType = $request->query('garment_type');

        return response()->json([
            'status' => 'success',
            'data' => $this->styleService->getAllStyles($buyerId, $garmentType),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'buyer_id' => 'required|uuid|exists:buyers,id',
            'brand_id' => 'nullable|uuid|exists:brands,id',
            'style_number' => 'required|string|max:100',
            'style_name' => 'required|string|max:150',
            'garment_type' => 'required|string|in:SHIRT,PANT,POLO,TEE,JACKET,DENIM,TROUSER,OTHER',
            'season' => 'nullable|string|max:50',
            'fabric_type' => 'nullable|string|max:150',
            'total_smv' => 'nullable|numeric|min:0.1|max:500',
            'techpack_url' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
            'operations' => 'nullable|array',
            'operations.*.sequence_no' => 'nullable|integer',
            'operations.*.operation_name' => 'required_with:operations|string|max:150',
            'operations.*.operation_code' => 'nullable|string|max:50',
            'operations.*.section' => 'nullable|string|in:CUTTING,SEWING,FINISHING',
            'operations.*.smv' => 'required_with:operations|numeric|min:0.01|max:60',
            'operations.*.machine_type' => 'nullable|string|max:100',
        ]);

        $style = $this->styleService->createStyle($validated, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Garment Style & OB Catalog created successfully.',
            'data' => $style,
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $style = Style::findOrFail($id);

        $validated = $request->validate([
            'buyer_id' => 'sometimes|required|uuid|exists:buyers,id',
            'brand_id' => 'nullable|uuid|exists:brands,id',
            'style_number' => 'sometimes|required|string|max:100',
            'style_name' => 'sometimes|required|string|max:150',
            'garment_type' => 'sometimes|required|string|in:SHIRT,PANT,POLO,TEE,JACKET,DENIM,TROUSER,OTHER',
            'season' => 'nullable|string|max:50',
            'fabric_type' => 'nullable|string|max:150',
            'total_smv' => 'nullable|numeric|min:0.1|max:500',
            'techpack_url' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        $updated = $this->styleService->updateStyle($style, $validated, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Garment Style updated successfully.',
            'data' => $updated,
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $style = Style::findOrFail($id);
        $this->styleService->deleteStyle($style, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Garment Style removed successfully.',
        ]);
    }

    public function storeOperation(Request $request, string $styleId): JsonResponse
    {
        $style = Style::findOrFail($styleId);

        $validated = $request->validate([
            'sequence_no' => 'required|integer|min:1|max:200',
            'operation_name' => 'required|string|max:150',
            'operation_code' => 'nullable|string|max:50',
            'section' => 'required|string|in:CUTTING,SEWING,FINISHING',
            'smv' => 'required|numeric|min:0.01|max:60',
            'machine_type' => 'nullable|string|max:100',
        ]);

        $op = StyleOperation::create([
            'style_id' => $style->id,
            'sequence_no' => $validated['sequence_no'],
            'operation_name' => trim($validated['operation_name']),
            'operation_code' => $validated['operation_code'] ?? null,
            'section' => $validated['section'],
            'smv' => (float)$validated['smv'],
            'machine_type' => $validated['machine_type'] ?? 'Single Needle Lockstitch (SNLS)',
            'target_hourly_pcs' => (int)(60 / max(0.1, (float)$validated['smv'])),
        ]);

        // Recalculate total SMV
        $newTotal = $style->operations()->sum('smv');
        $style->update(['total_smv' => round($newTotal, 2)]);

        return response()->json([
            'status' => 'success',
            'message' => 'Operation added to Bulletin.',
            'data' => $op,
        ], 201);
    }
}
