<?php

namespace App\Domains\AuthAdmin\Controllers;

use App\Domains\AuthAdmin\Models\Shift;
use App\Domains\AuthAdmin\Services\ShiftService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ShiftController extends Controller
{
    public function __construct(
        protected ShiftService $shiftService
    ) {}

    /**
     * Get All Factory Floor Shifts with Unit & Floor filters
     */
    public function index(Request $request): JsonResponse
    {
        $unit = $request->query('unit');
        $floor = $request->query('floor');

        $shifts = $this->shiftService->getAllShifts($unit, $floor);

        return response()->json([
            'status' => 'success',
            'data' => $shifts,
        ]);
    }

    /**
     * Create New Shift Schedule
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shift_name' => 'required|string|max:100',
            'shift_code' => 'required|string|max:50|unique:shifts,shift_code',
            'unit_name' => 'required|string|max:100',
            'floor_name' => 'required|string|max:100',
            'start_time' => 'required',
            'end_time' => 'required',
            'grace_period_mins' => 'nullable|integer|min:0|max:120',
            'break_start_time' => 'nullable',
            'break_end_time' => 'nullable',
            'net_work_hours' => 'nullable|numeric|min:1|max:24',
            'overtime_start_time' => 'nullable',
            'is_active' => 'nullable|boolean',
        ]);

        $shift = $this->shiftService->createShift(
            $validated,
            $request->user(),
            $request->ip()
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Shift schedule created successfully.',
            'data' => $shift,
        ], 201);
    }

    /**
     * Update Shift Schedule
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $shift = Shift::findOrFail($id);

        $validated = $request->validate([
            'shift_name' => 'sometimes|required|string|max:100',
            'shift_code' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('shifts', 'shift_code')->ignore($shift->id),
            ],
            'unit_name' => 'sometimes|required|string|max:100',
            'floor_name' => 'sometimes|required|string|max:100',
            'start_time' => 'sometimes|required',
            'end_time' => 'sometimes|required',
            'grace_period_mins' => 'nullable|integer|min:0|max:120',
            'break_start_time' => 'nullable',
            'break_end_time' => 'nullable',
            'net_work_hours' => 'nullable|numeric|min:1|max:24',
            'overtime_start_time' => 'nullable',
            'is_active' => 'nullable|boolean',
        ]);

        $updatedShift = $this->shiftService->updateShift(
            $shift,
            $validated,
            $request->user(),
            $request->ip()
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Shift schedule updated successfully.',
            'data' => $updatedShift,
        ]);
    }

    /**
     * Delete Shift Schedule
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $shift = Shift::findOrFail($id);

        $this->shiftService->deleteShift(
            $shift,
            $request->user(),
            $request->ip()
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Shift schedule removed successfully.',
        ]);
    }
}
