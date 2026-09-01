<?php

namespace App\Domains\MasterData\Controllers;

use App\Domains\MasterData\Models\Color;
use App\Domains\MasterData\Models\DefectCode;
use App\Domains\MasterData\Models\Size;
use App\Domains\MasterData\Services\AttributeMasterService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AttributeController extends Controller
{
    public function __construct(
        protected AttributeMasterService $attributeService
    ) {}

    // Colors
    public function indexColors(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => $this->attributeService->getAllColors(),
        ]);
    }

    public function storeColor(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'nullable|string|max:50|unique:colors,code',
            'hex_code' => 'nullable|string|max:10',
            'pantone_ref' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
        ]);

        $color = $this->attributeService->createColor($validated, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Color shade registered successfully.',
            'data' => $color,
        ], 201);
    }

    public function destroyColor(Request $request, string $id): JsonResponse
    {
        $color = Color::findOrFail($id);
        $this->attributeService->deleteColor($color, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Color removed successfully.',
        ]);
    }

    // Sizes
    public function indexSizes(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => $this->attributeService->getAllSizes(),
        ]);
    }

    public function storeSize(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'code' => 'required|string|max:30|unique:sizes,code',
            'category' => 'required|string|in:ALPHA,NUMERIC,INSEAM,OTHER',
            'sort_order' => 'nullable|integer|min:1|max:500',
            'is_active' => 'nullable|boolean',
        ]);

        $size = $this->attributeService->createSize($validated, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Size scale registered successfully.',
            'data' => $size,
        ], 201);
    }

    public function destroySize(Request $request, string $id): JsonResponse
    {
        $size = Size::findOrFail($id);
        $this->attributeService->deleteSize($size, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Size scale removed successfully.',
        ]);
    }

    // Defects
    public function indexDefects(Request $request): JsonResponse
    {
        $stage = $request->query('stage');
        return response()->json([
            'status' => 'success',
            'data' => $this->attributeService->getAllDefects($stage),
        ]);
    }

    public function storeDefect(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:defect_codes,code',
            'name' => 'required|string|max:150',
            'process_stage' => 'required|string|in:CUTTING,SEWING,FINISHING,PACKING,FABRIC,OTHER',
            'severity' => 'required|string|in:MINOR,MAJOR,CRITICAL',
            'standard_penalty_points' => 'nullable|string|max:10',
            'is_active' => 'nullable|boolean',
        ]);

        $defect = $this->attributeService->createDefect($validated, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Quality defect code registered successfully.',
            'data' => $defect,
        ], 201);
    }

    public function destroyDefect(Request $request, string $id): JsonResponse
    {
        $defect = DefectCode::findOrFail($id);
        $this->attributeService->deleteDefect($defect, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Defect code removed successfully.',
        ]);
    }
}
