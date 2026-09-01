<?php

namespace App\Domains\MasterData\Controllers;

use App\Domains\MasterData\Models\Floor;
use App\Domains\MasterData\Models\ProductionLine;
use App\Domains\MasterData\Models\Unit;
use App\Domains\MasterData\Services\PlantStructureService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PlantStructureController extends Controller
{
    public function __construct(
        protected PlantStructureService $plantService
    ) {}

    public function indexCompanies(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => $this->plantService->getAllCompanies(),
        ]);
    }

    public function storeCompany(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'code' => 'nullable|string|max:50|unique:companies,code',
            'address' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:100',
            'contact_phone' => 'nullable|string|max:50',
            'trade_license' => 'nullable|string|max:100',
            'tin_bin' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
        ]);

        $company = $this->plantService->createCompany($validated, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Group of Company profile created successfully.',
            'data' => $company,
        ], 201);
    }

    public function tree(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => $this->plantService->getTree(),
        ]);
    }

    // Units / Factories
    public function indexUnits(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => $this->plantService->getAllUnits(),
        ]);
    }

    public function storeUnit(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id' => 'nullable|uuid|exists:companies,id',
            'name' => 'required|string|max:100',
            'code' => 'nullable|string|max:50|unique:units,code',
            'factory_type' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'contact_person' => 'nullable|string|max:100',
            'contact_phone' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
        ]);

        $unit = $this->plantService->createUnit($validated, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Factory Plant registered successfully.',
            'data' => $unit,
        ], 201);
    }

    public function updateUnit(Request $request, string $id): JsonResponse
    {
        $unit = Unit::findOrFail($id);

        $validated = $request->validate([
            'company_id' => 'nullable|uuid|exists:companies,id',
            'name' => 'sometimes|required|string|max:100',
            'code' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('units', 'code')->ignore($unit->id)],
            'factory_type' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'contact_person' => 'nullable|string|max:100',
            'contact_phone' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
        ]);

        $updated = $this->plantService->updateUnit($unit, $validated, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Factory Plant updated successfully.',
            'data' => $updated,
        ]);
    }

    public function destroyUnit(Request $request, string $id): JsonResponse
    {
        $unit = Unit::findOrFail($id);
        $this->plantService->deleteUnit($unit, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Manufacturing Unit removed successfully.',
        ]);
    }

    // Floors
    public function indexFloors(Request $request): JsonResponse
    {
        $unitId = $request->query('unit_id');
        return response()->json([
            'status' => 'success',
            'data' => $this->plantService->getAllFloors($unitId),
        ]);
    }

    public function storeFloor(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'unit_id' => 'required|uuid|exists:units,id',
            'name' => 'required|string|max:100',
            'code' => 'nullable|string|max:50',
            'process_type' => 'required|string|in:CUTTING,SEWING,FINISHING,PACKING,QC,STORE,OTHER',
            'sequence_order' => 'nullable|integer|min:1|max:100',
            'is_active' => 'nullable|boolean',
        ]);

        $floor = $this->plantService->createFloor($validated, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Factory Floor configured successfully.',
            'data' => $floor,
        ], 201);
    }

    public function updateFloor(Request $request, string $id): JsonResponse
    {
        $floor = Floor::findOrFail($id);

        $validated = $request->validate([
            'unit_id' => 'sometimes|required|uuid|exists:units,id',
            'name' => 'sometimes|required|string|max:100',
            'code' => 'sometimes|nullable|string|max:50',
            'process_type' => 'sometimes|required|string|in:CUTTING,SEWING,FINISHING,PACKING,QC,STORE,OTHER',
            'sequence_order' => 'nullable|integer|min:1|max:100',
            'is_active' => 'nullable|boolean',
        ]);

        $updated = $this->plantService->updateFloor($floor, $validated, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Factory Floor updated successfully.',
            'data' => $updated,
        ]);
    }

    public function destroyFloor(Request $request, string $id): JsonResponse
    {
        $floor = Floor::findOrFail($id);
        $this->plantService->deleteFloor($floor, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Factory Floor removed successfully.',
        ]);
    }

    // Production Lines
    public function indexLines(Request $request): JsonResponse
    {
        $unitId = $request->query('unit_id');
        $floorId = $request->query('floor_id');

        return response()->json([
            'status' => 'success',
            'data' => $this->plantService->getAllLines($unitId, $floorId),
        ]);
    }

    public function storeLine(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'unit_id' => 'required|uuid|exists:units,id',
            'floor_id' => 'required|uuid|exists:floors,id',
            'name' => 'required|string|max:100',
            'code' => 'nullable|string|max:50',
            'section' => 'required|string|in:CUTTING,SEWING,FINISHING,PACKING',
            'total_machines' => 'nullable|integer|min:1|max:200',
            'estimated_manpower' => 'nullable|integer|min:1|max:500',
            'hourly_target' => 'nullable|integer|min:1|max:2000',
            'supervisor_name' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
        ]);

        $line = $this->plantService->createLine($validated, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Production Line registered successfully.',
            'data' => $line,
        ], 201);
    }

    public function updateLine(Request $request, string $id): JsonResponse
    {
        $line = ProductionLine::findOrFail($id);

        $validated = $request->validate([
            'unit_id' => 'sometimes|required|uuid|exists:units,id',
            'floor_id' => 'sometimes|required|uuid|exists:floors,id',
            'name' => 'sometimes|required|string|max:100',
            'code' => 'sometimes|nullable|string|max:50',
            'section' => 'sometimes|required|string|in:CUTTING,SEWING,FINISHING,PACKING',
            'total_machines' => 'nullable|integer|min:1|max:200',
            'estimated_manpower' => 'nullable|integer|min:1|max:500',
            'hourly_target' => 'nullable|integer|min:1|max:2000',
            'supervisor_name' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
        ]);

        $updated = $this->plantService->updateLine($line, $validated, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Production Line updated successfully.',
            'data' => $updated,
        ]);
    }

    public function destroyLine(Request $request, string $id): JsonResponse
    {
        $line = ProductionLine::findOrFail($id);
        $this->plantService->deleteLine($line, $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Production Line removed successfully.',
        ]);
    }
}
